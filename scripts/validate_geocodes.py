#!/usr/bin/env python3
"""Validate geocode coverage and reconciliation invariants for Phase 5."""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
GEOCODES_PATH = ROOT / "data" / "geocodes.json"
OVERRIDES_PATH = ROOT / "data" / "geocode-overrides.json"

EXPECTED_SHARED_PAIRS = 7


def main() -> int:
    restaurants = json.loads(RESTAURANTS_PATH.read_text(encoding="utf-8"))["restaurants"]
    geocodes = json.loads(GEOCODES_PATH.read_text(encoding="utf-8"))
    overrides = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8"))
    records = geocodes.get("records") or {}

    errors: list[str] = []

    if len(restaurants) != 271:
        errors.append(f"Expected 271 restaurants, found {len(restaurants)}")

    missing = [item["slug"] for item in restaurants if item["slug"] not in records]
    if missing:
        errors.append(f"Missing geocode status for {len(missing)} restaurants")

    extra = set(records) - {item["slug"] for item in restaurants}
    if extra:
        errors.append(f"Unexpected geocode slugs: {sorted(extra)[:5]}")

    confidence = Counter(str(rec.get("confidence")) for rec in records.values())
    for key in ("high", "medium", "low", "none"):
        confidence.setdefault(key, 0)

    low_approved = [
        slug
        for slug, rec in records.items()
        if rec.get("confidence") == "low" and rec.get("approved")
    ]
    if low_approved:
        errors.append(f"Low-confidence matches must not be approved: {low_approved[:5]}")

    medium_auto = [
        slug
        for slug, rec in records.items()
        if rec.get("confidence") == "medium"
        and rec.get("approved")
        and rec.get("manualReviewStatus") not in {"manually_approved", "manually_corrected"}
    ]
    if medium_auto:
        errors.append(
            f"Medium-confidence matches must not be auto-approved: {medium_auto[:5]}"
        )

    invalid_markers = []
    for slug, rec in records.items():
        if not rec.get("approved"):
            continue
        lat, lng = rec.get("latitude"), rec.get("longitude")
        if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
            invalid_markers.append(slug)
        elif not (-90 <= lat <= 90 and -180 <= lng <= 180):
            invalid_markers.append(slug)
    if invalid_markers:
        errors.append(f"Approved records with invalid coordinates: {invalid_markers[:5]}")

    shared_groups = {
        tuple(sorted(rec.get("sharedAddressGroup") or []))
        for rec in records.values()
        if len(rec.get("sharedAddressGroup") or []) > 1
    }
    if len(shared_groups) != EXPECTED_SHARED_PAIRS:
        errors.append(
            f"Expected {EXPECTED_SHARED_PAIRS} shared-address groups, found {len(shared_groups)}"
        )

    if not isinstance(overrides.get("overrides"), list):
        errors.append("geocode-overrides.json must contain an overrides array")

    print("Geocode validation")
    print(f"  restaurants: {len(restaurants)}")
    print(f"  geocode records: {len(records)}")
    print(f"  high: {confidence['high']}")
    print(f"  medium: {confidence['medium']}")
    print(f"  low: {confidence['low']}")
    print(f"  none: {confidence['none']}")
    print(f"  approved markers: {sum(1 for r in records.values() if r.get('approved'))}")
    print(f"  shared-address groups: {len(shared_groups)}")
    print(f"  overrides: {len(overrides.get('overrides') or [])}")

    if errors:
        print("FAILED:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
