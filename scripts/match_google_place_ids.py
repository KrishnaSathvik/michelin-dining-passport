#!/usr/bin/env python3
"""Match canonical restaurants to Google Place IDs (Places API New).

Usage:
  GOOGLE_PLACES_MATCHING_API_KEY=... npm run data:google-places:match
  npm run data:google-places:match -- --seed-statuses

Never writes provider payloads, photos, ratings, reviews, or Google addresses.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

from google_places_common import (
    MATCHES_PATH,
    empty_match,
    ensure_tmp_ignored,
    load_json,
    load_matches,
    matches_by_slug,
    now_iso,
    save_json,
    score_candidate,
    search_text_places,
    shared_address_groups,
    sanitize_match_record,
    RESTAURANTS_PATH,
    GEOCODES_PATH,
    today,
)

ROOT = Path(__file__).resolve().parents[1]


def load_dotenv_local() -> None:
    path = ROOT / ".env.local"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if key and key not in os.environ:
            os.environ[key] = value.strip().strip('"').strip("'")


def seed_statuses(force: bool = False) -> int:
    restaurants = load_json(RESTAURANTS_PATH)["restaurants"]
    existing = matches_by_slug(load_matches())
    matches = []
    for row in restaurants:
        slug = row["slug"]
        if slug in existing and not force:
            matches.append(sanitize_match_record(existing[slug]))
        else:
            matches.append(
                sanitize_match_record(
                    empty_match(
                        slug,
                        status="needs_review",
                        confidence="low",
                        method="seeded",
                        notes="Awaiting Places API matching or manual review.",
                    )
                )
            )
    payload = {
        "version": 1,
        "updatedAt": now_iso(),
        "matches": sorted(matches, key=lambda item: item["restaurantSlug"]),
    }
    save_json(MATCHES_PATH, payload)
    print(f"Seeded {len(matches)} match statuses → {MATCHES_PATH}")
    return 0


def run_match(limit: int | None, only_slug: str | None, delay: float) -> int:
    load_dotenv_local()
    api_key = os.environ.get("GOOGLE_PLACES_MATCHING_API_KEY", "").strip()
    if not api_key:
        print(
            "GOOGLE_PLACES_MATCHING_API_KEY is not set. "
            "Use --seed-statuses to create needs_review rows without calling Google.",
            file=sys.stderr,
        )
        return 1

    ensure_tmp_ignored()
    restaurants = load_json(RESTAURANTS_PATH)["restaurants"]
    geocodes = (load_json(GEOCODES_PATH).get("records") or {}) if GEOCODES_PATH.exists() else {}
    siblings_map = shared_address_groups(restaurants)
    addr_to_siblings = {
        slug: group
        for group in siblings_map.values()
        for slug in group
    }

    existing = matches_by_slug(load_matches())
    results = dict(existing)
    processed = 0

    for restaurant in restaurants:
        slug = restaurant["slug"]
        if only_slug and slug != only_slug:
            continue
        current = existing.get(slug)
        if current and current.get("status") in {
            "matched",
            "manually_approved",
            "rejected",
            "no_match",
        }:
            continue

        geocode = geocodes.get(slug) or {}
        lat = geocode.get("latitude") if geocode.get("approved") else None
        lng = geocode.get("longitude") if geocode.get("approved") else None
        query = (
            f"{restaurant['name']} {restaurant['address']} "
            f"{restaurant['city']} {restaurant['stateCode']}"
        )

        try:
            candidates = search_text_places(
                api_key,
                query,
                float(lat) if isinstance(lat, (int, float)) else None,
                float(lng) if isinstance(lng, (int, float)) else None,
            )
        except Exception as exc:  # noqa: BLE001 — surface and continue
            print(f"[error] {slug}: {exc}", file=sys.stderr)
            results[slug] = sanitize_match_record(
                empty_match(
                    slug,
                    status="needs_review",
                    confidence="low",
                    method="search_error",
                    notes="Search request failed; retry later.",
                )
            )
            processed += 1
            if limit and processed >= limit:
                break
            time.sleep(delay)
            continue

        sibling_slugs = addr_to_siblings.get(slug, [slug])
        scored = [
            score_candidate(restaurant, geocode if geocode else None, candidate, sibling_slugs)
            for candidate in candidates
            if candidate.get("id")
        ]
        scored.sort(
            key=lambda item: (
                item["autoApprove"],
                item["confidence"] == "high",
                item["scoreName"],
                -(item["distanceM"] or 10_000),
            ),
            reverse=True,
        )

        if not scored:
            results[slug] = sanitize_match_record(
                empty_match(
                    slug,
                    status="no_match",
                    confidence="low",
                    method="search_empty",
                    notes="No Places Text Search candidates.",
                    reviewedAt=today(),
                )
            )
        else:
            best = scored[0]
            # Second candidate close in name+location → force review
            ambiguous = False
            if len(scored) > 1:
                second = scored[1]
                if second["scoreName"] >= 0.85 and best["scoreName"] - second["scoreName"] < 0.08:
                    ambiguous = True
            if len(sibling_slugs) > 1:
                ambiguous = True

            if best["autoApprove"] and not ambiguous and best["placeId"]:
                results[slug] = sanitize_match_record(
                    {
                        "restaurantSlug": slug,
                        "placeId": best["placeId"],
                        "status": "matched",
                        "confidence": "high",
                        "method": "name_address_coordinates",
                        "reviewedAt": today(),
                        "notes": ",".join(best["reasons"]),
                    }
                )
            else:
                results[slug] = sanitize_match_record(
                    empty_match(
                        slug,
                        status="needs_review",
                        confidence=best["confidence"],
                        method="search_candidates",
                        notes=(
                            f"Top candidate …{(best['placeId'] or '')[-8:]} "
                            f"conf={best['confidence']} reasons={','.join(best['reasons'])}"
                        ),
                    )
                )
                # Ephemeral review aid — gitignored temp, deleted by review flow
                tip_path = ROOT / "data" / ".google-places-tmp" / f"{slug}.txt"
                tip_path.write_text(
                    "\n".join(
                        [
                            f"Restaurant: {restaurant['name']}",
                            f"Our address: {restaurant['address']}",
                            f"Candidate placeId suffix: …{(best['placeId'] or '')[-8:]}",
                            f"Candidate name: {best.get('_displayName')}",
                            f"Candidate address: {best.get('_formattedAddress')}",
                            f"Confidence: {best['confidence']}",
                            f"Reasons: {', '.join(best['reasons'])}",
                            "Do not commit this file.",
                        ]
                    )
                    + "\n",
                    encoding="utf-8",
                )

        processed += 1
        print(f"[{processed}] {slug} → {results[slug]['status']}")
        if limit and processed >= limit:
            break
        time.sleep(delay)

    payload = {
        "version": 1,
        "updatedAt": now_iso(),
        "matches": sorted(
            (sanitize_match_record(row) for row in results.values()),
            key=lambda item: item["restaurantSlug"],
        ),
    }
    # Ensure every roster slug is present
    by_slug = matches_by_slug(payload)
    for restaurant in restaurants:
        slug = restaurant["slug"]
        if slug not in by_slug:
            by_slug[slug] = sanitize_match_record(empty_match(slug))
    payload["matches"] = sorted(by_slug.values(), key=lambda item: item["restaurantSlug"])
    save_json(MATCHES_PATH, payload)
    print(f"Wrote {len(payload['matches'])} matches → {MATCHES_PATH}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--seed-statuses",
        action="store_true",
        help="Create needs_review rows for all restaurants without calling Google",
    )
    parser.add_argument("--force", action="store_true", help="Overwrite existing rows when seeding")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--slug", default="")
    parser.add_argument("--delay", type=float, default=0.35)
    args = parser.parse_args()

    if args.seed_statuses:
        return seed_statuses(force=args.force)
    return run_match(
        limit=args.limit or None,
        only_slug=args.slug or None,
        delay=args.delay,
    )


if __name__ == "__main__":
    raise SystemExit(main())
