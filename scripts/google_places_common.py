#!/usr/bin/env python3
"""Shared Google Place ID matching helpers.

Never persist Google provider payloads, photos, ratings, reviews, or addresses.
Only Place IDs and our internal match metadata may be written.
"""

from __future__ import annotations

import json
import math
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
GEOCODES_PATH = ROOT / "data" / "geocodes.json"
MATCHES_PATH = ROOT / "data" / "google-place-ids.json"
OVERRIDES_PATH = ROOT / "data" / "google-place-id-overrides.json"
TMP_DIR = ROOT / "data" / ".google-places-tmp"

VALID_STATUS = {
    "matched",
    "manually_approved",
    "needs_review",
    "rejected",
    "no_match",
}
VALID_CONFIDENCE = {"high", "medium", "low"}
PLACE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{10,}$")
RESTAURANT_TYPES = {
    "restaurant",
    "fine_dining_restaurant",
    "sushi_restaurant",
    "japanese_restaurant",
    "french_restaurant",
    "italian_restaurant",
    "seafood_restaurant",
    "steak_house",
    "meal_takeaway",
    "food",
}

FORBIDDEN_MATCH_KEYS = {
    "photos",
    "photo",
    "photoNames",
    "photo_names",
    "rating",
    "userRatingCount",
    "reviews",
    "reviewSummary",
    "editorialSummary",
    "generativeSummary",
    "formattedAddress",
    "addressComponents",
    "location",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "websiteUri",
    "regularOpeningHours",
    "currentOpeningHours",
    "raw",
    "candidates",
    "displayName",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def today() -> str:
    return date.today().isoformat()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    text = value.casefold()
    text = text.replace("&", " and ")
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_street(address: str | None) -> str:
    text = normalize_text(address)
    text = re.sub(
        r"\b(street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|way|court|ct)\b",
        "",
        text,
    )
    text = re.sub(r"\s+", " ", text).strip()
    return text


def domain_from_url(url: str | None) -> str | None:
    if not url:
        return None
    try:
        host = (urllib.parse.urlsplit(url).hostname or "").lower()
    except ValueError:
        return None
    if host.startswith("www."):
        host = host[4:]
    return host or None


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6_371_000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    )
    return 2 * radius * math.asin(math.sqrt(a))


def name_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def shared_address_groups(restaurants: list[dict]) -> dict[str, list[str]]:
    by_addr: dict[str, list[str]] = {}
    for row in restaurants:
        key = normalize_text(row.get("address"))
        by_addr.setdefault(key, []).append(row["slug"])
    return {k: v for k, v in by_addr.items() if len(v) > 1}


def empty_match(slug: str, **kwargs: Any) -> dict[str, Any]:
    row = {
        "restaurantSlug": slug,
        "placeId": None,
        "status": "needs_review",
        "confidence": "low",
        "method": "pending",
        "reviewedAt": today(),
        "notes": "",
    }
    row.update(kwargs)
    if row["status"] in {"rejected", "no_match", "needs_review"} and not row.get(
        "placeId"
    ):
        row["placeId"] = None
    if row["status"] in {"rejected", "no_match"}:
        row["placeId"] = None
    return row


def sanitize_match_record(row: dict[str, Any]) -> dict[str, Any]:
    clean = {
        "restaurantSlug": row["restaurantSlug"],
        "placeId": row.get("placeId"),
        "status": row["status"],
        "confidence": row.get("confidence") or "low",
        "method": row.get("method") or "pending",
        "reviewedAt": row.get("reviewedAt") or today(),
        "notes": row.get("notes") or "",
    }
    for key in list(row.keys()):
        if key in FORBIDDEN_MATCH_KEYS:
            raise ValueError(f"Forbidden provider field in match record: {key}")
    if clean["status"] not in VALID_STATUS:
        raise ValueError(f"Invalid status: {clean['status']}")
    if clean["confidence"] not in VALID_CONFIDENCE:
        raise ValueError(f"Invalid confidence: {clean['confidence']}")
    if clean["status"] in {"rejected", "no_match"}:
        clean["placeId"] = None
    elif clean["placeId"] is not None:
        if not isinstance(clean["placeId"], str) or not PLACE_ID_RE.match(
            clean["placeId"]
        ):
            raise ValueError(f"Invalid placeId for {clean['restaurantSlug']}")
    return clean


def load_matches() -> dict[str, Any]:
    if not MATCHES_PATH.exists():
        return {"version": 1, "updatedAt": now_iso(), "matches": []}
    return load_json(MATCHES_PATH)


def load_overrides() -> dict[str, Any]:
    if not OVERRIDES_PATH.exists():
        return {"version": 1, "updatedAt": now_iso(), "overrides": []}
    return load_json(OVERRIDES_PATH)


def matches_by_slug(payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for row in payload.get("matches") or []:
        out[row["restaurantSlug"]] = row
    return out


def score_candidate(
    restaurant: dict[str, Any],
    geocode: dict[str, Any] | None,
    candidate: dict[str, Any],
    sibling_slugs: list[str],
) -> dict[str, Any]:
    """Score an in-memory provider candidate. Result is never persisted."""
    display = ""
    name_obj = candidate.get("displayName")
    if isinstance(name_obj, dict):
        display = str(name_obj.get("text") or "")
    elif isinstance(name_obj, str):
        display = name_obj

    formatted = str(candidate.get("formattedAddress") or "")
    types = set(candidate.get("types") or [])
    status = str(candidate.get("businessStatus") or "")
    website = candidate.get("websiteUri")
    loc = candidate.get("location") or {}
    cand_lat = loc.get("latitude")
    cand_lng = loc.get("longitude")

    name_score = name_similarity(restaurant["name"], display)
    street_ours = normalize_street(restaurant.get("address"))
    street_theirs = normalize_street(formatted)
    street_ok = bool(street_ours) and (
        street_ours in street_theirs or street_theirs in street_ours
    )
    city_ok = normalize_text(restaurant.get("city")) in normalize_text(formatted)
    state_ok = normalize_text(restaurant.get("stateCode") or restaurant.get("state")) in normalize_text(
        formatted
    )

    distance_m: float | None = None
    if (
        geocode
        and isinstance(geocode.get("latitude"), (int, float))
        and isinstance(geocode.get("longitude"), (int, float))
        and isinstance(cand_lat, (int, float))
        and isinstance(cand_lng, (int, float))
    ):
        distance_m = haversine_m(
            float(geocode["latitude"]),
            float(geocode["longitude"]),
            float(cand_lat),
            float(cand_lng),
        )

    our_domain = domain_from_url(restaurant.get("website"))
    their_domain = domain_from_url(website if isinstance(website, str) else None)
    domain_ok = bool(our_domain and their_domain and our_domain == their_domain)
    type_ok = bool(types & RESTAURANT_TYPES) or "food" in types
    open_ok = status in {"", "OPERATIONAL"}

    # Never approve on name alone.
    auto = False
    confidence = "low"
    reasons: list[str] = []

    if name_score >= 0.92:
        reasons.append("strong_name")
    elif name_score >= 0.8:
        reasons.append("good_name")
    else:
        reasons.append("weak_name")

    if street_ok:
        reasons.append("street")
    if city_ok and state_ok:
        reasons.append("city_state")
    if distance_m is not None:
        if distance_m <= 75:
            reasons.append("coords_close")
        elif distance_m <= 250:
            reasons.append("coords_near")
        else:
            reasons.append("coords_far")
    if domain_ok:
        reasons.append("website_domain")
    if type_ok:
        reasons.append("restaurant_type")
    if not open_ok:
        reasons.append("not_operational")
    if len(sibling_slugs) > 1:
        reasons.append("shared_address_sibling")

    strong_location = street_ok and city_ok and state_ok
    strong_coords = distance_m is not None and distance_m <= 75
    if (
        name_score >= 0.9
        and open_ok
        and type_ok
        and (strong_location or strong_coords or domain_ok)
        and "shared_address_sibling" not in reasons
    ):
        if (strong_location and (strong_coords or domain_ok)) or (
            strong_coords and domain_ok
        ):
            auto = True
            confidence = "high"
        else:
            confidence = "medium"
    elif name_score >= 0.85 and (strong_location or strong_coords):
        confidence = "medium"
    else:
        confidence = "low"

    if "shared_address_sibling" in reasons:
        auto = False
        if confidence == "high":
            confidence = "medium"

    if name_score < 0.75:
        auto = False
        confidence = "low"

    return {
        "placeId": candidate.get("id") or candidate.get("placeId"),
        "scoreName": round(name_score, 4),
        "distanceM": None if distance_m is None else round(distance_m, 1),
        "confidence": confidence,
        "autoApprove": auto,
        "reasons": reasons,
        # Ephemeral display fields — callers must not write these to disk.
        "_displayName": display,
        "_formattedAddress": formatted,
        "_websiteUri": website,
        "_businessStatus": status,
        "_types": sorted(types),
    }


def search_text_places(api_key: str, query: str, lat: float | None, lng: float | None) -> list[dict[str, Any]]:
    """Places API (New) Text Search. Returns in-memory candidates only."""
    body: dict[str, Any] = {
        "textQuery": query,
        "maxResultCount": 5,
        "languageCode": "en",
        "regionCode": "US",
    }
    if lat is not None and lng is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 500.0,
            }
        }

    request = urllib.request.Request(
        "https://places.googleapis.com/v1/places:searchText",
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": (
                "places.id,places.displayName,places.formattedAddress,"
                "places.location,places.types,places.businessStatus,"
                "places.websiteUri"
            ),
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:300]
        raise RuntimeError(f"Places searchText failed ({exc.code}): {detail}") from exc

    return list(payload.get("places") or [])


def ensure_tmp_ignored() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    gitignore = ROOT / ".gitignore"
    marker = "data/.google-places-tmp/"
    text = gitignore.read_text(encoding="utf-8") if gitignore.exists() else ""
    if marker not in text:
        gitignore.write_text(text.rstrip() + f"\n\n# Google Places matching scratch\n{marker}\n", encoding="utf-8")
