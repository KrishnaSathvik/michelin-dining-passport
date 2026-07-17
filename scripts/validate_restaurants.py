#!/usr/bin/env python3
"""Validate committed restaurants.json against Phase 0 audit expectations."""

from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

from lib.slug import city_slug, cuisine_slug, restaurant_slug, state_slug

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "restaurants.json"

EXPECTED_TOTAL = 271
EXPECTED_STARS = {1: 216, 2: 39, 3: 16}
SHARED_ADDRESS_PAIR_COUNT = 7


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)


def main() -> int:
    if not DATA.exists():
        fail(f"missing {DATA.relative_to(ROOT)} — run npm run data:import first")
        return 1

    payload = json.loads(DATA.read_text(encoding="utf-8"))
    restaurants = payload.get("restaurants")
    if not isinstance(restaurants, list):
        fail("restaurants array missing")
        return 1

    errors = 0
    if len(restaurants) != EXPECTED_TOTAL:
        fail(f"expected {EXPECTED_TOTAL} restaurants, got {len(restaurants)}")
        errors += 1

    star_counts: Counter[int] = Counter()
    slugs: list[str] = []
    addresses: dict[str, list[str]] = defaultdict(list)

    for row in restaurants:
        name = row["name"]
        stars = row["stars"]
        star_counts[stars] += 1
        slugs.append(row["slug"])

        expected_slug = restaurant_slug(name, row["city"], row["stateCode"])
        if row["slug"] != expected_slug:
            fail(f'slug mismatch for "{name}": {row["slug"]} != {expected_slug}')
            errors += 1

        if row["stateSlug"] != state_slug(row["state"], row["stateCode"]):
            fail(f'stateSlug mismatch for "{name}"')
            errors += 1
        if row["citySlug"] != city_slug(row["city"]):
            fail(f'citySlug mismatch for "{name}"')
            errors += 1
        if row["cuisineSlug"] != cuisine_slug(row["cuisine"]):
            fail(f'cuisineSlug mismatch for "{name}"')
            errors += 1

        if not row.get("michelinGuideUrl"):
            fail(f'missing Michelin Guide URL for "{name}"')
            errors += 1

        addresses[row["address"]].append(name)

    for star, expected in EXPECTED_STARS.items():
        if star_counts[star] != expected:
            fail(f"expected {expected} {star}-star, got {star_counts[star]}")
            errors += 1

    if len(slugs) != len(set(slugs)):
        fail("restaurant slugs are not unique")
        errors += 1

    shared_pairs = sum(1 for names in addresses.values() if len(names) == 2)
    shared_groups = {addr: names for addr, names in addresses.items() if len(names) > 1}
    if shared_pairs != SHARED_ADDRESS_PAIR_COUNT:
        fail(
            f"expected {SHARED_ADDRESS_PAIR_COUNT} shared-address pairs, "
            f"got {shared_pairs} (groups={len(shared_groups)})"
        )
        errors += 1

    for addr, names in shared_groups.items():
        if len(names) != 2:
            fail(f"unexpected shared-address group size {len(names)} at {addr}: {names}")
            errors += 1

    totals = payload.get("totals", {})
    if totals.get("restaurants") != EXPECTED_TOTAL:
        fail("payload totals.restaurants mismatch")
        errors += 1

    if errors:
        print(f"Validation failed with {errors} error(s).", file=sys.stderr)
        return 1

    print("Validation passed.")
    print(f"  Restaurants: {len(restaurants)}")
    print(
        f"  Stars: {star_counts[1]} one-star, {star_counts[2]} two-star, "
        f"{star_counts[3]} three-star"
    )
    print(f"  Unique slugs: {len(set(slugs))}")
    print(f"  Shared-address pairs retained: {shared_pairs}")
    missing_websites = sum(1 for row in restaurants if not row.get("website"))
    print(f"  Missing websites: {missing_websites}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
