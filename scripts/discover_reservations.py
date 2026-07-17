#!/usr/bin/env python3
"""Discover candidate reservation links from official restaurant websites.

Local / server-side enrichment only. Never run from browser page loads.
Respectful crawling: descriptive UA, timeouts, delays, cache, resume.
Does not scrape availability, party sizes, or time slots.
Does not bypass bot protection or authenticate into booking systems.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.robotparser
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
CANDIDATES_PATH = ROOT / "data" / "reservation-candidates.json"
RESERVATIONS_PATH = ROOT / "data" / "reservations.json"
CACHE_PATH = ROOT / "data" / "reservation-page-cache.json"
USER_AGENT = (
    "MichelinDiningPassport/0.1 "
    "(reservation-link discovery; local development; contact: local-dev)"
)
REQUEST_TIMEOUT = 20
MIN_DELAY_SECONDS = 1.25
MAX_WORKERS = 2
MAX_HTML_BYTES = 1_500_000

BOOKING_TERMS = re.compile(
    r"(reserve|reservation|reservations|book|booking|table|"
    r"availability|tickets|ticket|experience|experiences|dining)",
    re.I,
)
DIRECT_PATH_HINTS = (
    "/reservations",
    "/reservation",
    "/reserve",
    "/book",
    "/booking",
    "/tickets",
    "/experiences",
    "/experience",
)

PROVIDER_HOSTS = {
    "resy": ("resy.com",),
    "tock": ("exploretock.com", "tock.com"),
    "opentable": ("opentable.com",),
    "sevenrooms": ("sevenrooms.com",),
    "michelin": ("guide.michelin.com",),
}

TRACKING_PARAMS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
    "mc_cid",
    "mc_eid",
    "correlationid",
    "correlation_id",
    "otsource",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path) -> Any:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: Any) -> None:
    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def strip_tracking(url: str) -> str:
    try:
        parsed = urllib.parse.urlsplit(url)
    except ValueError:
        return url
    query = [
        (k, v)
        for k, v in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        if k.lower() not in TRACKING_PARAMS
        and "token" not in k.lower()
        and "session" not in k.lower()
        and "auth" not in k.lower()
    ]
    return urllib.parse.urlunsplit(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            urllib.parse.urlencode(query),
            "",
        )
    )


def classify_provider(url: str) -> str:
    try:
        host = urllib.parse.urlsplit(url).hostname or ""
        path = (urllib.parse.urlsplit(url).path or "").lower()
    except ValueError:
        return "none"
    host = host.lower()
    for provider, hosts in PROVIDER_HOSTS.items():
        if any(host == h or host.endswith("." + h) for h in hosts):
            return provider
    if any(hint in path for hint in DIRECT_PATH_HINTS):
        return "restaurant_direct"
    return "other"


def is_provider_homepage(url: str) -> bool:
    try:
        parts = urllib.parse.urlsplit(url)
        host = (parts.hostname or "").lower()
        path = (parts.path or "/").rstrip("/") or "/"
    except ValueError:
        return True
    if "resy.com" in host and path in {"/", "/cities"}:
        return True
    if ("exploretock.com" in host or "opentable.com" in host) and path == "/":
        return True
    if "sevenrooms.com" in host and path == "/":
        return True
    return False


class AnchorParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.anchors: list[dict[str, str]] = []
        self._href: str | None = None
        self._parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        href = None
        for key, value in attrs:
            if key.lower() == "href" and value:
                href = value.strip()
                break
        self._href = href
        self._parts = []

    def handle_data(self, data: str) -> None:
        if self._href is not None:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() != "a" or self._href is None:
            return
        text = html.unescape(" ".join(self._parts)).strip()
        text = re.sub(r"\s+", " ", text)
        self.anchors.append({"href": self._href, "text": text})
        self._href = None
        self._parts = []


def extract_anchors(page_html: str) -> list[dict[str, str]]:
    parser = AnchorParser()
    try:
        parser.feed(page_html)
    except Exception:
        return []
    return parser.anchors


def robots_allows(url: str, cache: dict) -> bool:
    try:
        parts = urllib.parse.urlsplit(url)
        robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
    except ValueError:
        return False

    robots_cache = cache.setdefault("robots", {})
    if robots_url in robots_cache:
        body = robots_cache[robots_url].get("body")
        if body is None:
            return True
    else:
        try:
            req = urllib.request.Request(
                robots_url,
                headers={"User-Agent": USER_AGENT},
            )
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
                body = response.read(200_000).decode("utf-8", errors="replace")
            robots_cache[robots_url] = {"body": body, "fetchedAt": now_iso()}
        except Exception:
            robots_cache[robots_url] = {"body": None, "fetchedAt": now_iso()}
            return True

    body = robots_cache[robots_url].get("body")
    if not body:
        return True
    rp = urllib.robotparser.RobotFileParser()
    rp.parse(body.splitlines())
    return rp.can_fetch(USER_AGENT, url)


def fetch_page(url: str, cache: dict, force: bool = False) -> dict:
    pages = cache.setdefault("pages", {})
    if not force and url in pages and pages[url].get("status") != "error":
        return pages[url]

    if not robots_allows(url, cache):
        result = {
            "status": "blocked_robots",
            "finalUrl": url,
            "httpStatus": None,
            "error": "robots.txt disallows",
            "html": None,
            "fetchedAt": now_iso(),
        }
        pages[url] = result
        return result

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
            raw = response.read(MAX_HTML_BYTES)
            charset = response.headers.get_content_charset() or "utf-8"
            page_html = raw.decode(charset, errors="replace")
            result = {
                "status": "ok",
                "finalUrl": response.geturl(),
                "httpStatus": getattr(response, "status", 200),
                "error": None,
                "html": page_html,
                "fetchedAt": now_iso(),
            }
    except urllib.error.HTTPError as exc:
        result = {
            "status": "http_error",
            "finalUrl": url,
            "httpStatus": exc.code,
            "error": str(exc.reason),
            "html": None,
            "fetchedAt": now_iso(),
        }
    except Exception as exc:  # noqa: BLE001 - capture network failures for resume
        result = {
            "status": "error",
            "finalUrl": url,
            "httpStatus": None,
            "error": str(exc),
            "html": None,
            "fetchedAt": now_iso(),
        }

    # Cache without huge HTML for non-ok to keep file smaller on retries of errors
    cacheable = dict(result)
    if cacheable.get("status") != "ok":
        cacheable["html"] = None
    else:
        # Keep HTML in cache for resume scoring; truncate later if needed
        pass
    pages[url] = cacheable
    return result


def score_candidate(
    *,
    restaurant: dict,
    website: str,
    anchor_text: str,
    candidate_url: str,
    final_url: str,
    http_status: int | None,
) -> tuple[str, int, list[str]]:
    reasons: list[str] = []
    score = 0
    provider = classify_provider(final_url or candidate_url)
    text = anchor_text.lower()
    name = restaurant["name"].lower()
    city = restaurant["city"].lower()
    slug_token = restaurant["slug"].split("-")[0]

    if BOOKING_TERMS.search(anchor_text):
        score += 25
        reasons.append("reservation-related anchor text")
    if re.search(r"\b(reserve|reservations?|book a table|book now)\b", text):
        score += 15
        reasons.append("exact booking CTA language")
    if provider in {"resy", "tock", "opentable", "sevenrooms"}:
        score += 30
        reasons.append(f"known booking provider ({provider})")
    if provider == "restaurant_direct":
        score += 20
        reasons.append("direct booking path on site")
    if website:
        try:
            origin = urllib.parse.urlsplit(website).hostname or ""
            dest = urllib.parse.urlsplit(final_url or candidate_url).hostname or ""
            if origin and dest and (
                dest == origin
                or dest.endswith("." + origin)
                or origin.endswith("." + dest)
            ):
                score += 15
                reasons.append("same official website host")
        except ValueError:
            pass
    if name and name in (final_url or candidate_url).lower():
        score += 10
        reasons.append("restaurant name in URL")
    elif slug_token and slug_token in (final_url or candidate_url).lower():
        score += 6
        reasons.append("slug token in URL")
    if city and city.replace(" ", "") in (final_url or candidate_url).lower().replace(
        " ", ""
    ):
        score += 5
        reasons.append("city appears in URL")
    if (final_url or candidate_url).startswith("https://"):
        score += 5
        reasons.append("https")
    if http_status and 200 <= http_status < 400:
        score += 10
        reasons.append("successful response")

    if is_provider_homepage(final_url or candidate_url):
        score -= 40
        reasons.append("provider homepage penalty")
    if re.search(r"\b(hotel|resort|spa)\b", (final_url or "").lower() + " " + text):
        score -= 15
        reasons.append("hotel/resort ambiguity")
    if re.search(r"\b(event|wedding|private party)\b", text):
        score -= 10
        reasons.append("event/private party page")
    if name and name not in text and name not in (final_url or "").lower():
        if provider in {"resy", "tock", "opentable", "sevenrooms"}:
            score -= 5
            reasons.append("restaurant name not clearly present")

    if score >= 70:
        confidence = "high"
    elif score >= 45:
        confidence = "medium"
    else:
        confidence = "low"
    return confidence, score, reasons


def should_auto_approve(candidate: dict) -> bool:
    return (
        candidate.get("confidence") == "high"
        and candidate.get("fromOfficialWebsite") is True
        and candidate.get("clearBookingAnchor") is True
        and candidate.get("directRestaurantPage") is True
        and candidate.get("identityClear") is True
        and candidate.get("httpStatus") is not None
        and 200 <= int(candidate["httpStatus"]) < 400
        and not candidate.get("providerHomepage")
    )


def discover_for_restaurant(
    restaurant: dict,
    cache: dict,
    force: bool,
) -> dict:
    website = restaurant.get("website")
    slug = restaurant["slug"]
    entry: dict[str, Any] = {
        "restaurantSlug": slug,
        "name": restaurant["name"],
        "city": restaurant["city"],
        "state": restaurant["state"],
        "website": website,
        "discoveredAt": now_iso(),
        "fetchStatus": "no_website",
        "candidates": [],
        "autoApprovedSlug": None,
    }
    if not website:
        return entry

    page = fetch_page(website, cache, force=force)
    entry["fetchStatus"] = page["status"]
    entry["httpStatus"] = page.get("httpStatus")
    entry["finalWebsiteUrl"] = page.get("finalUrl")
    entry["fetchError"] = page.get("error")

    if page.get("status") != "ok" or not page.get("html"):
        return entry

    base = page.get("finalUrl") or website
    seen: set[str] = set()
    for anchor in extract_anchors(page["html"]):
        href = anchor["href"]
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        absolute = urllib.parse.urljoin(base, href)
        absolute = strip_tracking(absolute)
        if absolute in seen:
            continue
        seen.add(absolute)
        text = anchor["text"] or ""
        if not BOOKING_TERMS.search(text) and not BOOKING_TERMS.search(absolute):
            continue

        # Lightweight HEAD/GET not required for every candidate; use page fetch
        # only for off-site destinations when scoring identity.
        final_url = absolute
        http_status = 200
        if urllib.parse.urlsplit(absolute).netloc != urllib.parse.urlsplit(base).netloc:
            dest = fetch_page(absolute, cache, force=force)
            time.sleep(MIN_DELAY_SECONDS)
            final_url = dest.get("finalUrl") or absolute
            http_status = dest.get("httpStatus")
            if dest.get("status") not in {"ok", "http_error"}:
                http_status = dest.get("httpStatus")

        confidence, score, reasons = score_candidate(
            restaurant=restaurant,
            website=website,
            anchor_text=text,
            candidate_url=absolute,
            final_url=final_url,
            http_status=http_status,
        )
        provider = classify_provider(final_url)
        clear_anchor = bool(
            re.search(r"\b(reserve|reservations?|book|booking|book a table)\b", text, re.I)
        )
        direct_page = provider in {
            "resy",
            "tock",
            "opentable",
            "sevenrooms",
            "restaurant_direct",
        } and not is_provider_homepage(final_url)
        identity = bool(
            restaurant["name"].lower() in final_url.lower()
            or restaurant["slug"].split("-")[0] in final_url.lower()
            or restaurant["name"].lower() in text.lower()
            or provider == "restaurant_direct"
        )

        candidate = {
            "url": absolute,
            "finalUrl": strip_tracking(final_url),
            "anchorText": text,
            "provider": provider,
            "confidence": confidence,
            "score": score,
            "reasons": reasons,
            "httpStatus": http_status,
            "fromOfficialWebsite": True,
            "clearBookingAnchor": clear_anchor,
            "directRestaurantPage": direct_page,
            "identityClear": identity,
            "providerHomepage": is_provider_homepage(final_url),
        }
        entry["candidates"].append(candidate)

    entry["candidates"].sort(key=lambda item: item["score"], reverse=True)
    return entry


def apply_auto_approvals(
    discoveries: dict[str, dict],
    reservations: dict,
    override_slugs: set[str] | None = None,
) -> int:
    approved = 0
    records = reservations.setdefault("records", {})
    protected = override_slugs or set()
    for slug, entry in discoveries.items():
        if slug in protected:
            continue
        current = records.get(slug) or {}
        if current.get("status") in {
            "verified",
            "no_online_booking",
            "phone_only",
            "temporarily_unavailable",
        }:
            # Preserve prior human/auto decisions; do not thrash on re-runs.
            if current.get("status") == "verified" and current.get("reservationUrl"):
                continue
        for candidate in entry.get("candidates") or []:
            if not should_auto_approve(candidate):
                continue
            # Extra guard: skip event/hotel booking paths that look like venue hire.
            url = (candidate.get("finalUrl") or candidate.get("url") or "").lower()
            if "bookyourevents" in url or "/events" in url and "reserv" not in url:
                continue
            records[slug] = {
                "restaurantSlug": slug,
                "reservationUrl": candidate["finalUrl"] or candidate["url"],
                "provider": candidate["provider"],
                "status": "verified",
                "sourceUrl": entry.get("website"),
                "sourceType": "official_restaurant_website",
                "confidence": "high",
                "verifiedAt": now_iso(),
                "notes": f"Auto-approved from discovery score {candidate['score']}",
            }
            entry["autoApprovedSlug"] = slug
            approved += 1
            break
        else:
            # Mark needs_review when medium/high candidates exist but not auto-approved
            best = (entry.get("candidates") or [None])[0]
            current = records.get(slug) or {}
            if best and best["confidence"] in {"high", "medium"}:
                if current.get("status") not in {
                    "verified",
                    "no_online_booking",
                    "phone_only",
                    "temporarily_unavailable",
                    "needs_review",
                }:
                    records[slug] = {
                        "restaurantSlug": slug,
                        "reservationUrl": None,
                        "provider": "none",
                        "status": "needs_review",
                        "sourceUrl": entry.get("website"),
                        "sourceType": "official_restaurant_website",
                        "confidence": best["confidence"],
                        "verifiedAt": None,
                        "notes": "Candidates found; awaiting manual review",
                    }
    reservations["updatedAt"] = now_iso()
    return approved


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=0, help="Limit restaurants processed")
    parser.add_argument("--slug", action="append", default=[], help="Only these slugs")
    parser.add_argument("--force", action="store_true", help="Refetch cached pages")
    parser.add_argument("--concurrency", type=int, default=MAX_WORKERS)
    args = parser.parse_args()

    restaurants = load_json(RESTAURANTS_PATH)["restaurants"]
    if args.slug:
        wanted = set(args.slug)
        restaurants = [item for item in restaurants if item["slug"] in wanted]
    if args.limit and args.limit > 0:
        restaurants = restaurants[: args.limit]

    cache = load_json(CACHE_PATH) or {"version": 1, "pages": {}, "robots": {}}
    candidates_file = load_json(CANDIDATES_PATH) or {
        "version": 1,
        "updatedAt": now_iso(),
        "candidates": {},
    }
    reservations = load_json(RESERVATIONS_PATH) or {
        "version": 1,
        "updatedAt": now_iso(),
        "records": {},
    }

    discoveries = dict(candidates_file.get("candidates") or {})
    pending = []
    for restaurant in restaurants:
        slug = restaurant["slug"]
        existing = discoveries.get(slug)
        if (
            not args.force
            and existing
            and existing.get("fetchStatus") in {"ok", "no_website", "blocked_robots"}
        ):
            continue
        pending.append(restaurant)

    print(f"Discovering reservations for {len(pending)} restaurants "
          f"(resume skipped {len(restaurants) - len(pending)})")

    # Sequential with optional tiny pool; default keeps polite pacing.
    concurrency = max(1, min(args.concurrency, MAX_WORKERS))
    completed = 0

    def work(restaurant: dict) -> dict:
        result = discover_for_restaurant(restaurant, cache, force=args.force)
        time.sleep(MIN_DELAY_SECONDS)
        return result

    if concurrency == 1:
        for restaurant in pending:
            entry = work(restaurant)
            discoveries[entry["restaurantSlug"]] = entry
            completed += 1
            if completed % 10 == 0:
                save_json(CACHE_PATH, {**cache, "updatedAt": now_iso()})
                candidates_file["candidates"] = discoveries
                candidates_file["updatedAt"] = now_iso()
                save_json(CANDIDATES_PATH, candidates_file)
                print(f"  progress {completed}/{len(pending)}")
    else:
        with ThreadPoolExecutor(max_workers=concurrency) as pool:
            futures = {pool.submit(work, item): item for item in pending}
            for future in as_completed(futures):
                entry = future.result()
                discoveries[entry["restaurantSlug"]] = entry
                completed += 1
                if completed % 10 == 0:
                    save_json(CACHE_PATH, {**cache, "updatedAt": now_iso()})
                    candidates_file["candidates"] = discoveries
                    candidates_file["updatedAt"] = now_iso()
                    save_json(CANDIDATES_PATH, candidates_file)
                    print(f"  progress {completed}/{len(pending)}")

    # Drop HTML from cache after scoring to keep repo-friendly file sizes when committing cache optionally
    for page in cache.get("pages", {}).values():
        if page.get("html") and len(page["html"]) > 50_000:
            page["html"] = page["html"][:50_000]

    save_json(CACHE_PATH, {**cache, "updatedAt": now_iso()})
    candidates_file["candidates"] = discoveries
    candidates_file["updatedAt"] = now_iso()
    save_json(CANDIDATES_PATH, candidates_file)

    overrides_payload = load_json(ROOT / "data" / "reservation-overrides.json") or {}
    override_slugs = {
        item.get("restaurantSlug")
        for item in (overrides_payload.get("overrides") or [])
        if item.get("restaurantSlug")
    }
    approved = apply_auto_approvals(discoveries, reservations, override_slugs)
    save_json(RESERVATIONS_PATH, reservations)

    total_candidates = sum(len(v.get("candidates") or []) for v in discoveries.values())
    print(
        f"Done. discoveries={len(discoveries)} candidates={total_candidates} "
        f"auto_approved={approved}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
