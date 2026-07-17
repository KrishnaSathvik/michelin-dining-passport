#!/usr/bin/env python3
"""Convert the Michelin workbook into committed restaurants.json."""

from __future__ import annotations

import json
import sys
from collections import Counter
from datetime import date
from pathlib import Path

from lib.slug import city_slug, cuisine_slug, restaurant_slug, state_slug
from lib.xlsx_read import read_sheet_rows

ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "data" / "usa_michelin_starred_restaurants_by_state_2026.xlsx"
OUTPUT = ROOT / "data" / "restaurants.json"

EXPECTED_TOTAL = 271
EXPECTED_STARS = {1: 216, 2: 39, 3: 16}
EXPECTED_HEADERS = [
    "State",
    "State Code",
    "City",
    "Restaurant",
    "Stars",
    "Cuisine",
    "Price",
    "Address",
    "Michelin Guide URL",
    "Restaurant Website",
]


def cell(row: list[str | None], index: int) -> str:
    if index >= len(row) or row[index] is None:
        return ""
    return str(row[index]).strip()


def main() -> int:
    if not WORKBOOK.exists():
        print(f"ERROR: workbook not found at {WORKBOOK}", file=sys.stderr)
        return 1

    rows = read_sheet_rows(WORKBOOK, "All Restaurants")
    if len(rows) < 3:
        print("ERROR: unexpected sheet layout", file=sys.stderr)
        return 1

    # Row 1 is a merged title; a blank row may be omitted by the spreadsheet.
    # Find the header row by looking for the expected first column label.
    header_index = None
    for i, row in enumerate(rows[:5]):
        if cell(row, 0) == "State" and cell(row, 3) == "Restaurant":
            header_index = i
            break
    if header_index is None:
        print("ERROR: could not locate header row", file=sys.stderr)
        return 1

    headers = [cell(rows[header_index], i) for i in range(len(EXPECTED_HEADERS))]
    if headers != EXPECTED_HEADERS:
        print(f"ERROR: unexpected headers: {headers}", file=sys.stderr)
        return 1

    restaurants: list[dict] = []
    seen_slugs: set[str] = set()
    star_counts: Counter[int] = Counter()

    for row in rows[header_index + 1 :]:
        name = cell(row, 3)
        if not name:
            continue

        state = cell(row, 0)
        state_code = cell(row, 1).upper()
        city = cell(row, 2)
        stars_raw = cell(row, 4)
        cuisine = cell(row, 5)
        price = cell(row, 6)
        address = cell(row, 7)
        michelin_url = cell(row, 8)
        website = cell(row, 9) or None

        try:
            stars = int(float(stars_raw))
        except ValueError:
            print(f'ERROR: invalid stars for "{name}": {stars_raw!r}', file=sys.stderr)
            return 1

        if stars not in (1, 2, 3):
            print(f'ERROR: stars out of range for "{name}": {stars}', file=sys.stderr)
            return 1

        slug = restaurant_slug(name, city, state_code)
        if slug in seen_slugs:
            print(f'ERROR: duplicate slug "{slug}"', file=sys.stderr)
            return 1
        seen_slugs.add(slug)

        star_counts[stars] += 1
        restaurants.append(
            {
                "slug": slug,
                "name": name,
                "stars": stars,
                "cuisine": cuisine,
                "cuisineSlug": cuisine_slug(cuisine),
                "price": price,
                "city": city,
                "citySlug": city_slug(city),
                "state": state,
                "stateCode": state_code,
                "stateSlug": state_slug(state, state_code),
                "address": address,
                "michelinGuideUrl": michelin_url,
                "website": website,
            }
        )

    if len(restaurants) != EXPECTED_TOTAL:
        print(
            f"ERROR: expected {EXPECTED_TOTAL} restaurants, got {len(restaurants)}",
            file=sys.stderr,
        )
        return 1

    for star, expected in EXPECTED_STARS.items():
        actual = star_counts[star]
        if actual != expected:
            print(
                f"ERROR: expected {expected} {star}-star restaurants, got {actual}",
                file=sys.stderr,
            )
            return 1

    payload = {
        "source": {
            "workbook": "data/usa_michelin_starred_restaurants_by_state_2026.xlsx",
            "sheet": "All Restaurants",
            "importedAt": date.today().isoformat(),
            "coverageNote": (
                "Current snapshot through July 2026. Michelin stars only "
                "(Bib Gourmand and Selected restaurants excluded)."
            ),
        },
        "totals": {
            "restaurants": len(restaurants),
            "oneStar": star_counts[1],
            "twoStar": star_counts[2],
            "threeStar": star_counts[3],
        },
        "restaurants": restaurants,
    }

    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(restaurants)} restaurants to {OUTPUT.relative_to(ROOT)}")
    print(
        f"Stars: {star_counts[1]} one-star, {star_counts[2]} two-star, "
        f"{star_counts[3]} three-star"
    )
    print(f"Unique slugs: {len(seen_slugs)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
