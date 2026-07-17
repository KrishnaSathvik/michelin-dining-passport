#!/usr/bin/env python3
"""Reclassify cached Nominatim results without issuing new network requests.

Confidence uses address/match-type signals rather than Nominatim importance,
which underrates precise U.S. house matches and overrates city centroids.
City-centroid fallbacks are treated as unmatched (coordinates cleared).
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GEOCODES_PATH = ROOT / "data" / "geocodes.json"
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"

CITY_LEVEL_TYPES = {
    "administrative",
    "city",
    "town",
    "suburb",
    "neighbourhood",
    "county",
    "state",
    "postcode",
    "village",
    "hamlet",
    "municipality",
    "city-centroid",
}

PRECISE_TYPES = {
    "house",
    "building",
    "apartments",
    "residential",
    "yes",
    "hotel",
    "restaurant",
    "cafe",
    "bar",
    "pub",
    "retail",
    "commercial",
    "office",
    "attraction",
    "museum",
    "hostel",
    "motel",
    "guest_house",
    "terrace",
    "detached",
    "semidetached_house",
    "resort",
}

# Medium Nominatim hits that were manually reviewed and approved for markers.
MANUALLY_APPROVED = {
    "atlas-atlanta-ga": "Hotel POI match with correct street number (St. Regis Atlanta).",
    "auro-calistoga-ca": "Resort POI match with correct street number (Four Seasons Napa Valley).",
    "jean-georges-new-york-ny": "Hotel POI match at 1 Central Park West.",
    "kin-khao-san-francisco-ca": "Hotel POI match at Parc 55 / Cyril Magnin St.",
    "sushi-nakazawa-washington-dc-washington-dc": "Hotel POI match at Waldorf Astoria / Pennsylvania Ave.",
}

# Cached Nominatim hits that point at the wrong city/street — clear coords.
FORCE_UNMATCHED = {
    "boia-de-miami-fl",
    "hiden-miami-fl",
    "kochi-new-york-ny",
    "l-atelier-de-joel-robuchon-miami-miami-fl",
    "mari-new-york-ny",
    "cyrus-geyserville-ca",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def match_notes_rejected(rec: dict) -> bool:
    notes = (rec.get("notes") or "").lower()
    return "wrong place" in notes or rec.get("matchType") == "rejected_wrong_place"


def match_type_hint(rec: dict) -> str:
    return str(rec.get("matchType") or "")


def house_numbers(address: str) -> list[str]:
    # Capture leading or comma-delimited street numbers, including forms like
    # "355 11th St" and "88 W. Paces Ferry".
    return re.findall(
        r"(?:^|,\s*)(\d+[A-Za-z]?)\s+(?=[A-Za-z0-9])",
        address or "",
    )


def street_tokens(address: str) -> list[str]:
    head = (address or "").split(",")[0]
    head = re.sub(r"^\s*\d+[A-Za-z]?\s*", "", head)
    stop = {
        "st",
        "street",
        "ave",
        "avenue",
        "blvd",
        "boulevard",
        "rd",
        "road",
        "dr",
        "drive",
        "ln",
        "lane",
        "way",
        "ct",
        "court",
        "pl",
        "place",
        "n",
        "s",
        "e",
        "w",
        "ne",
        "nw",
        "se",
        "sw",
        "north",
        "south",
        "east",
        "west",
        "the",
        "a",
        "an",
        "hotel",
        "tower",
        "resort",
        "and",
        "residences",
    }
    return [
        token.lower()
        for token in re.findall(r"[A-Za-z]+", head)
        if token.lower() not in stop and len(token) > 1
    ]


def classify(rec: dict) -> tuple[str, bool, str, str]:
    """Return confidence, approved, matchType, manualReviewStatus."""
    slug = rec.get("restaurantSlug") or ""
    provider = rec.get("provider") or ""
    raw = rec.get("rawType") or ""
    display = rec.get("displayName") or ""
    address = rec.get("address") or ""

    if slug in FORCE_UNMATCHED or match_notes_rejected(rec):
        return "none", False, "rejected_wrong_place", "rejected"

    if provider == "city-centroid-fallback" or raw in CITY_LEVEL_TYPES:
        return "low", False, "city_level", "unmatched"

    if match_type_hint(rec) == "city_level":
        return "low", False, "city_level", "unmatched"

    if provider in {"none", "nominatim-error"} or rec.get("latitude") is None:
        return "none", False, "no_match", "unmatched"

    numbers = house_numbers(address)
    has_house = any(num in display for num in numbers)
    tokens = street_tokens(address)
    display_l = display.lower()
    street_hits = sum(1 for token in tokens if token in display_l)
    street_ok = street_hits >= max(1, min(2, len(tokens))) if tokens else False

    if has_house and (raw in PRECISE_TYPES or street_ok):
        return "high", True, "address_match", "auto_approved"
    if has_house:
        return "high", True, "house_number_match", "auto_approved"
    if raw in {"restaurant", "hotel", "cafe", "bar", "pub", "resort"} and street_ok:
        conf = "medium"
        if slug in MANUALLY_APPROVED:
            return conf, True, "poi_street_match", "manually_approved"
        return conf, False, "poi_street_match", "needs_review"
    if raw in PRECISE_TYPES and street_ok:
        return "medium", False, "feature_street_match", "needs_review"
    if street_ok:
        if slug in MANUALLY_APPROVED:
            return "medium", True, "street_match", "manually_approved"
        return "medium", False, "street_match", "needs_review"
    return "low", False, "weak_match", "needs_review"


def reclassify(records: dict[str, dict]) -> dict[str, dict]:
    updated: dict[str, dict] = {}
    for slug, rec in records.items():
        confidence, approved, match_type, review_status = classify(rec)
        next_rec = {
            "restaurantSlug": slug,
            "address": rec.get("address") or "",
            "latitude": rec.get("latitude"),
            "longitude": rec.get("longitude"),
            "confidence": confidence,
            "matchType": match_type,
            "displayName": rec.get("displayName") or rec.get("address") or "",
            "provider": rec.get("provider") or "none",
            "providerPlaceId": rec.get("providerPlaceId") or "",
            "geocodedAt": rec.get("geocodedAt") or datetime.now(timezone.utc).isoformat(),
            "manualReviewStatus": review_status,
            "approved": approved,
            "uncertain": not approved,
            "needsManualCorrection": not approved,
            "notes": "",
            "rawType": rec.get("rawType") or "",
            "sharedAddressGroup": rec.get("sharedAddressGroup") or [slug],
        }

        if (
            next_rec["provider"] == "city-centroid-fallback"
            or match_type in {"city_level", "rejected_wrong_place", "no_match"}
            or confidence == "none"
        ):
            next_rec["latitude"] = None
            next_rec["longitude"] = None
            next_rec["approved"] = False
            next_rec["uncertain"] = True
            next_rec["needsManualCorrection"] = True
            if confidence != "none":
                next_rec["confidence"] = "none" if match_type != "city_level" else "low"
            if match_type == "city_level":
                next_rec["manualReviewStatus"] = "unmatched"
                next_rec["notes"] = (
                    "City-centroid fallback cleared; not valid marker coordinates."
                )
            elif match_type == "rejected_wrong_place":
                next_rec["confidence"] = "none"
                next_rec["manualReviewStatus"] = "rejected"
                next_rec["notes"] = (
                    "Cached Nominatim hit pointed at the wrong place; coordinates cleared."
                )

        if slug in MANUALLY_APPROVED and next_rec["latitude"] is not None:
            next_rec["approved"] = True
            next_rec["uncertain"] = False
            next_rec["needsManualCorrection"] = False
            next_rec["manualReviewStatus"] = "manually_approved"
            next_rec["notes"] = MANUALLY_APPROVED[slug]
            if next_rec["confidence"] == "low":
                next_rec["confidence"] = "medium"

        updated[slug] = next_rec
    return updated


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    restaurants = load_json(RESTAURANTS_PATH)["restaurants"]
    payload = load_json(GEOCODES_PATH)
    records = payload.get("records") or {}

    missing = [item["slug"] for item in restaurants if item["slug"] not in records]
    if missing:
        raise SystemExit(f"Missing geocode records for {len(missing)} restaurants")

    updated = reclassify(records)
    summary = {
        "total": len(updated),
        "high": sum(1 for r in updated.values() if r["confidence"] == "high"),
        "medium": sum(1 for r in updated.values() if r["confidence"] == "medium"),
        "low": sum(1 for r in updated.values() if r["confidence"] == "low"),
        "none": sum(1 for r in updated.values() if r["confidence"] == "none"),
        "approved": sum(1 for r in updated.values() if r["approved"]),
        "manually_approved": sum(
            1 for r in updated.values() if r["manualReviewStatus"] == "manually_approved"
        ),
        "with_coords": sum(
            1
            for r in updated.values()
            if r["latitude"] is not None and r["longitude"] is not None
        ),
    }
    print(json.dumps(summary, indent=2))

    if args.dry_run:
        return 0

    save_json(
        GEOCODES_PATH,
        {
            "version": 1,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "providerPolicy": {
                "provider": "nominatim",
                "usage": "one-time-batch",
                "maxThreads": 1,
                "minRequestIntervalSeconds": 1,
                "userAgent": "MichelinDiningPassport/0.1 (batch geocoder; local development)",
                "cache": "every successful and failed query persisted in data/geocodes.json",
                "liveClientSearch": False,
            },
            "records": updated,
        },
    )
    print(f"Wrote {GEOCODES_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
