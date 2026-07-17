#!/usr/bin/env python3
"""Batch geocode restaurant addresses. Never call this from page load."""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
GEOCODES_PATH = ROOT / "data" / "geocodes.json"
USER_AGENT = "MichelinDiningPassport/0.1 (batch geocoder; local development)"

# City centroids used only as uncertain fallbacks when Nominatim fails.
CITY_CENTROIDS = {
    "aspen": (39.1911, -106.8175),
    "atherton": (37.4613, -122.1977),
    "atlanta": (33.7490, -84.3880),
    "austin": (30.2672, -97.7431),
    "beverly-hills": (34.0736, -118.4004),
    "boston": (42.3601, -71.0589),
    "boulder": (40.0150, -105.2705),
    "brooklyn": (40.6782, -73.9442),
    "chicago": (41.8781, -87.6298),
    "costa-mesa": (33.6411, -117.9187),
    "dallas": (32.7767, -96.7970),
    "denver": (39.7392, -104.9903),
    "healdsburg": (38.6102, -122.8692),
    "houston": (29.7604, -95.3698),
    "las-vegas": (36.1699, -115.1398),
    "los-angeles": (34.0522, -118.2437),
    "miami": (25.7617, -80.1918),
    "napa": (38.2975, -122.2869),
    "new-york": (40.7128, -74.0060),
    "oxford": (34.3665, -89.5192),
    "philadelphia": (39.9526, -75.1652),
    "san-diego": (32.7157, -117.1611),
    "san-francisco": (37.7749, -122.4194),
    "seattle": (47.6062, -122.3321),
    "washington": (38.9072, -77.0369),
    "yountville": (38.4016, -122.3608),
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def nominatim_geocode(address: str) -> dict | None:
    query = urllib.parse.urlencode(
        {
            "q": address,
            "format": "json",
            "limit": 1,
            "addressdetails": 1,
            "countrycodes": "us",
        }
    )
    request = urllib.request.Request(
        f"https://nominatim.openstreetmap.org/search?{query}",
        headers={"User-Agent": USER_AGENT},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            results = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None

    if not results:
        return None

    hit = results[0]
    importance = float(hit.get("importance") or 0)
    lat = float(hit["lat"])
    lng = float(hit["lon"])
    osm_type = str(hit.get("type") or "")
    confidence = (
        "high" if importance >= 0.5 else "medium" if importance >= 0.2 else "low"
    )
    # Approve medium+ Nominatim hits; keep low-confidence for manual review.
    approved = confidence in {"high", "medium"}
    return {
        "latitude": lat,
        "longitude": lng,
        "confidence": confidence,
        "approved": approved,
        "uncertain": not approved,
        "provider": "nominatim",
        "providerPlaceId": str(hit.get("place_id") or ""),
        "displayName": hit.get("display_name") or address,
        "geocodedAt": datetime.now(timezone.utc).isoformat(),
        "rawType": osm_type,
    }


def city_fallback(city_slug: str, address: str) -> dict | None:
    coords = CITY_CENTROIDS.get(city_slug)
    if not coords:
        return None
    lat, lng = coords
    return {
        "latitude": lat,
        "longitude": lng,
        "confidence": "low",
        "approved": False,
        "uncertain": True,
        "provider": "city-centroid-fallback",
        "providerPlaceId": city_slug,
        "displayName": address,
        "geocodedAt": datetime.now(timezone.utc).isoformat(),
        "rawType": "city-centroid",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Max unique addresses to request")
    parser.add_argument("--sleep", type=float, default=1.1, help="Seconds between Nominatim calls")
    parser.add_argument("--offline-fallback", action="store_true")
    args = parser.parse_args()

    restaurants = load_json(RESTAURANTS_PATH)["restaurants"]
    existing = load_json(GEOCODES_PATH) if GEOCODES_PATH.exists() else {"version": 1, "records": {}}
    records = existing.get("records") or {}

    by_address: dict[str, list[dict]] = {}
    for restaurant in restaurants:
        by_address.setdefault(restaurant["address"], []).append(restaurant)

    requested = 0
    for address, group in by_address.items():
        # Reuse first sibling slug record if any sibling already geocoded.
        sibling_hit = None
        for restaurant in group:
            if restaurant["slug"] in records:
                sibling_hit = records[restaurant["slug"]]
                break

        if sibling_hit:
            for restaurant in group:
                records[restaurant["slug"]] = {
                    **sibling_hit,
                    "restaurantSlug": restaurant["slug"],
                    "address": address,
                    "sharedAddressGroup": [item["slug"] for item in group],
                }
            continue

        if any(restaurant["slug"] in records for restaurant in group):
            continue

        if args.limit and requested >= args.limit:
            break

        result = None
        if not args.offline_fallback:
            result = nominatim_geocode(address)
            requested += 1
            time.sleep(args.sleep)

        if result is None:
            result = city_fallback(group[0]["citySlug"], address)

        if result is None:
            for restaurant in group:
                records[restaurant["slug"]] = {
                    "restaurantSlug": restaurant["slug"],
                    "address": address,
                    "latitude": None,
                    "longitude": None,
                    "confidence": "none",
                    "approved": False,
                    "uncertain": True,
                    "provider": "none",
                    "providerPlaceId": "",
                    "displayName": address,
                    "geocodedAt": datetime.now(timezone.utc).isoformat(),
                    "rawType": "missing",
                    "sharedAddressGroup": [item["slug"] for item in group],
                    "needsManualCorrection": True,
                }
            continue

        for restaurant in group:
            records[restaurant["slug"]] = {
                **result,
                "restaurantSlug": restaurant["slug"],
                "address": address,
                "sharedAddressGroup": [item["slug"] for item in group],
                "needsManualCorrection": bool(result.get("uncertain")),
            }

        save_json(
            GEOCODES_PATH,
            {
                "version": 1,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
                "records": records,
            },
        )

    save_json(
        GEOCODES_PATH,
        {
            "version": 1,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "records": records,
        },
    )

    approved = sum(1 for item in records.values() if item.get("approved"))
    uncertain = sum(1 for item in records.values() if item.get("uncertain"))
    print(f"Geocoded records: {len(records)}")
    print(f"Approved: {approved}")
    print(f"Uncertain / needs review: {uncertain}")
    print(f"Wrote {GEOCODES_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
