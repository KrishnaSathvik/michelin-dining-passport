#!/usr/bin/env python3
"""Geocode maintenance helpers for approved coordinates.

Commands:
  list-missing
  validate-bounds
  detect-shared
  apply-override
  regenerate-map-hint
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS = ROOT / "data" / "restaurants.json"
GEOCODES = ROOT / "data" / "geocodes.json"
OVERRIDES = ROOT / "data" / "geocode-overrides.json"
FIELD_OVERRIDES = ROOT / "data" / "restaurant-field-overrides.json"

# Loose continental US + Hawaii/Alaska bounding box used for sanity checks.
BOUNDS = {
    "minLat": 18.0,
    "maxLat": 72.0,
    "minLng": -180.0,
    "maxLng": -65.0,
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def approved_coords() -> dict[str, dict[str, Any]]:
    restaurants = load_json(RESTAURANTS)["restaurants"]
    geocodes = load_json(GEOCODES).get("records") or {}
    overrides = {
        item["restaurantSlug"]: item
        for item in (load_json(OVERRIDES).get("overrides") or [])
    }
    result: dict[str, dict[str, Any]] = {}
    for restaurant in restaurants:
        slug = restaurant["slug"]
        if slug in overrides:
            item = overrides[slug]
            result[slug] = {
                "latitude": item["latitude"],
                "longitude": item["longitude"],
                "source": "override",
                "city": restaurant["city"],
                "state": restaurant["state"],
                "stateCode": restaurant["stateCode"],
            }
            continue
        record = geocodes.get(slug) or {}
        if record.get("approved") and isinstance(record.get("latitude"), (int, float)):
            result[slug] = {
                "latitude": record["latitude"],
                "longitude": record["longitude"],
                "source": "geocodes",
                "city": restaurant["city"],
                "state": restaurant["state"],
                "stateCode": restaurant["stateCode"],
            }
    return result


def cmd_list_missing(_: argparse.Namespace) -> int:
    restaurants = load_json(RESTAURANTS)["restaurants"]
    coords = approved_coords()
    missing = [r["slug"] for r in restaurants if r["slug"] not in coords]
    print(f"Missing approved coordinates: {len(missing)}")
    for slug in missing:
        print(slug)
    return 0


def cmd_validate_bounds(_: argparse.Namespace) -> int:
    coords = approved_coords()
    outliers = []
    for slug, item in coords.items():
        lat = item["latitude"]
        lng = item["longitude"]
        if not (
            BOUNDS["minLat"] <= lat <= BOUNDS["maxLat"]
            and BOUNDS["minLng"] <= lng <= BOUNDS["maxLng"]
        ):
            outliers.append((slug, lat, lng, item["city"], item["stateCode"]))
    print(f"Out-of-bounds coordinates: {len(outliers)}")
    for slug, lat, lng, city, state in outliers:
        print(f"{slug}\t{lat},{lng}\t{city}, {state}")
    return 0 if not outliers else 1


def cmd_detect_shared(_: argparse.Namespace) -> int:
    coords = approved_coords()
    by_point: dict[tuple[float, float], list[str]] = defaultdict(list)
    for slug, item in coords.items():
        key = (round(item["latitude"], 6), round(item["longitude"], 6))
        by_point[key].append(slug)
    shared = {k: v for k, v in by_point.items() if len(v) > 1}
    print(f"Shared coordinate groups: {len(shared)}")
    for (lat, lng), slugs in sorted(shared.items()):
        print(f"{lat},{lng}\t{', '.join(sorted(slugs))}")
    return 0


def cmd_apply_override(args: argparse.Namespace) -> int:
    if not args.slug or args.lat is None or args.lng is None or not args.reason:
        print("ERROR: --slug --lat --lng --reason are required", file=sys.stderr)
        return 1
    payload = load_json(OVERRIDES) if OVERRIDES.exists() else {"version": 1, "overrides": []}
    overrides = [
        item
        for item in (payload.get("overrides") or [])
        if item.get("restaurantSlug") != args.slug
    ]
    overrides.append(
        {
            "restaurantSlug": args.slug,
            "latitude": args.lat,
            "longitude": args.lng,
            "reason": args.reason,
            "verificationSource": args.source or "manual",
            "verifiedDate": args.verified_date or now_iso()[:10],
        }
    )
    payload["overrides"] = overrides
    payload["updatedAt"] = now_iso()
    if not args.confirm:
        print(json.dumps(overrides[-1], indent=2))
        print("Dry run. Re-run with --confirm to write geocode-overrides.json.")
        return 0
    OVERRIDES.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote override for {args.slug}")
    print("Manually approved coordinates are never auto-replaced by geocode batch jobs.")
    return 0


def cmd_regenerate_map_hint(_: argparse.Namespace) -> int:
    coords = approved_coords()
    print(
        "Map data is derived at runtime from restaurants.json + geocodes.json + overrides."
    )
    print(f"Approved coordinates available: {len(coords)}")
    print("No separate map artifact regeneration is required in Phase 7.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "command",
        choices=[
            "list-missing",
            "validate-bounds",
            "detect-shared",
            "apply-override",
            "regenerate-map-hint",
        ],
    )
    parser.add_argument("--slug")
    parser.add_argument("--lat", type=float)
    parser.add_argument("--lng", type=float)
    parser.add_argument("--reason")
    parser.add_argument("--source")
    parser.add_argument("--verified-date")
    parser.add_argument("--confirm", action="store_true")
    args = parser.parse_args()

    commands = {
        "list-missing": cmd_list_missing,
        "validate-bounds": cmd_validate_bounds,
        "detect-shared": cmd_detect_shared,
        "apply-override": cmd_apply_override,
        "regenerate-map-hint": cmd_regenerate_map_hint,
    }
    return commands[args.command](args)


if __name__ == "__main__":
    raise SystemExit(main())
