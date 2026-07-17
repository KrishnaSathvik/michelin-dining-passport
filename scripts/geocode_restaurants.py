#!/usr/bin/env python3
"""One-time batch geocoder for restaurant addresses.

Public Nominatim policy compliance (do not violate):
- Single thread, single machine
- ≤ 1 request/second
- Valid application-specific User-Agent
- Cache every successful and failed query
- Resume without re-querying cached addresses
- Never call this from page load / client-side search

This is not the recurring production update workflow.
"""

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
CACHE_PATH = ROOT / "data" / "geocode-query-cache.json"
USER_AGENT = "MichelinDiningPassport/0.1 (batch geocoder; local development; contact: local-dev)"
MIN_SLEEP_SECONDS = 1.05


def load_json(path: Path):
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_cache() -> dict:
    payload = load_json(CACHE_PATH)
    if not payload or not isinstance(payload, dict):
        return {"version": 1, "queries": {}}
    payload.setdefault("version", 1)
    payload.setdefault("queries", {})
    return payload


def nominatim_geocode(address: str, cache: dict) -> tuple[dict, bool]:
    """Return (cacheable query result, network_requested)."""
    cached = cache["queries"].get(address)
    if cached is not None:
        return cached, False

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
        headers={"User-Agent": USER_AGENT, "Accept-Language": "en"},
    )

    result: dict
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            results = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        result = {
            "status": "error",
            "error": str(exc),
            "hit": None,
            "queriedAt": now_iso(),
        }
    else:
        if not results:
            result = {
                "status": "empty",
                "error": None,
                "hit": None,
                "queriedAt": now_iso(),
            }
        else:
            hit = results[0]
            result = {
                "status": "ok",
                "error": None,
                "hit": hit,
                "queriedAt": now_iso(),
            }

    cache["queries"][address] = result
    save_json(CACHE_PATH, cache)
    return result, True


def hit_to_record(address: str, hit: dict) -> dict:
    importance = float(hit.get("importance") or 0)
    lat = float(hit["lat"])
    lng = float(hit["lon"])
    osm_type = str(hit.get("type") or "")
    # Importance is retained for audit only; approval uses reclassify_geocodes.py.
    confidence = (
        "high" if importance >= 0.5 else "medium" if importance >= 0.2 else "low"
    )
    return {
        "latitude": lat,
        "longitude": lng,
        "confidence": confidence,
        "matchType": "nominatim_raw",
        "displayName": hit.get("display_name") or address,
        "provider": "nominatim",
        "providerPlaceId": str(hit.get("place_id") or ""),
        "geocodedAt": now_iso(),
        "manualReviewStatus": "pending_reclassify",
        "approved": False,
        "uncertain": True,
        "needsManualCorrection": True,
        "notes": "Raw Nominatim result; run scripts/reclassify_geocodes.py before use.",
        "rawType": osm_type,
        "importance": importance,
    }


def empty_record(address: str, status: str, error: str | None = None) -> dict:
    return {
        "latitude": None,
        "longitude": None,
        "confidence": "none",
        "matchType": "no_match" if status == "empty" else "provider_error",
        "displayName": address,
        "provider": "nominatim" if status == "empty" else "nominatim-error",
        "providerPlaceId": "",
        "geocodedAt": now_iso(),
        "manualReviewStatus": "unmatched",
        "approved": False,
        "uncertain": True,
        "needsManualCorrection": True,
        "notes": error or "No Nominatim result for full address query.",
        "rawType": "missing",
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="One-time Nominatim batch geocoder (policy-compliant)."
    )
    parser.add_argument("--limit", type=int, default=0, help="Max unique addresses to request")
    parser.add_argument(
        "--sleep",
        type=float,
        default=MIN_SLEEP_SECONDS,
        help="Seconds between Nominatim calls (minimum 1.0)",
    )
    args = parser.parse_args()
    sleep_s = max(1.0, float(args.sleep))

    restaurants = load_json(RESTAURANTS_PATH)["restaurants"]
    existing = load_json(GEOCODES_PATH) or {"version": 1, "records": {}}
    records = existing.get("records") or {}
    cache = load_cache()

    by_address: dict[str, list[dict]] = {}
    for restaurant in restaurants:
        by_address.setdefault(restaurant["address"], []).append(restaurant)

    requested = 0
    for address, group in by_address.items():
        # Resume: skip addresses already represented for every sibling slug.
        if all(restaurant["slug"] in records for restaurant in group):
            # Propagate shared-address metadata if missing.
            for restaurant in group:
                records[restaurant["slug"]] = {
                    **records[restaurant["slug"]],
                    "restaurantSlug": restaurant["slug"],
                    "address": address,
                    "sharedAddressGroup": [item["slug"] for item in group],
                }
            continue

        # Reuse a sibling record when one address sibling already exists.
        sibling_hit = None
        for restaurant in group:
            if restaurant["slug"] in records:
                sibling_hit = records[restaurant["slug"]]
                break
        if sibling_hit is not None:
            for restaurant in group:
                records[restaurant["slug"]] = {
                    **sibling_hit,
                    "restaurantSlug": restaurant["slug"],
                    "address": address,
                    "sharedAddressGroup": [item["slug"] for item in group],
                }
            continue

        if args.limit and requested >= args.limit:
            break

        # Always query by full address — never restaurant name alone.
        query_result, network_requested = nominatim_geocode(address, cache)
        if network_requested:
            requested += 1
            time.sleep(sleep_s)

        if query_result.get("status") == "ok" and query_result.get("hit"):
            result = hit_to_record(address, query_result["hit"])
        else:
            result = empty_record(
                address,
                status=str(query_result.get("status") or "error"),
                error=query_result.get("error"),
            )

        for restaurant in group:
            records[restaurant["slug"]] = {
                **result,
                "restaurantSlug": restaurant["slug"],
                "address": address,
                "sharedAddressGroup": [item["slug"] for item in group],
            }

        save_json(
            GEOCODES_PATH,
            {
                "version": 1,
                "updatedAt": now_iso(),
                "providerPolicy": {
                    "provider": "nominatim",
                    "usage": "one-time-batch",
                    "maxThreads": 1,
                    "minRequestIntervalSeconds": 1,
                    "userAgent": USER_AGENT,
                    "cache": "data/geocode-query-cache.json + data/geocodes.json",
                    "liveClientSearch": False,
                },
                "records": records,
            },
        )

    save_json(
        GEOCODES_PATH,
        {
            "version": 1,
            "updatedAt": now_iso(),
            "providerPolicy": {
                "provider": "nominatim",
                "usage": "one-time-batch",
                "maxThreads": 1,
                "minRequestIntervalSeconds": 1,
                "userAgent": USER_AGENT,
                "cache": "data/geocode-query-cache.json + data/geocodes.json",
                "liveClientSearch": False,
            },
            "records": records,
        },
    )

    print(f"Geocoded records: {len(records)}")
    print(f"Unique address queries cached: {len(cache['queries'])}")
    print(f"Network requests this run: {requested}")
    print(f"Wrote {GEOCODES_PATH}")
    print("Next: python3 scripts/reclassify_geocodes.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
