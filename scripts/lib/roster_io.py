"""Load Michelin roster rows from XLSX, CSV, or restaurants.json."""

from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path
from typing import Any

from lib.slug import city_slug, cuisine_slug, restaurant_slug, state_slug
from lib.xlsx_read import read_sheet_rows

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


def cell(row: list[Any], index: int) -> str:
    if index >= len(row) or row[index] is None:
        return ""
    return str(row[index]).strip()


def file_checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def row_to_restaurant(row: dict[str, str]) -> dict[str, Any]:
    name = row["Restaurant"].strip()
    state = row["State"].strip()
    state_code = row["State Code"].strip().upper()
    city = row["City"].strip()
    stars = int(float(row["Stars"].strip()))
    cuisine = row["Cuisine"].strip()
    price = row["Price"].strip()
    address = row["Address"].strip()
    michelin_url = row["Michelin Guide URL"].strip()
    website_raw = row.get("Restaurant Website", "").strip()
    website = website_raw or None

    if stars not in (1, 2, 3):
        raise ValueError(f'stars out of range for "{name}": {stars}')

    return {
        "slug": restaurant_slug(name, city, state_code),
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


def _header_map(headers: list[str]) -> dict[str, int]:
    mapping: dict[str, int] = {}
    for index, header in enumerate(headers):
        cleaned = header.strip()
        if cleaned:
            mapping[cleaned] = index
    missing = [name for name in EXPECTED_HEADERS if name not in mapping]
    if missing:
        raise ValueError(f"missing headers: {missing}")
    return mapping


def _rows_from_xlsx(path: Path) -> list[dict[str, str]]:
    rows = read_sheet_rows(path, "All Restaurants")
    header_index = None
    for i, row in enumerate(rows[:8]):
        if cell(row, 0) == "State" and cell(row, 3) == "Restaurant":
            header_index = i
            break
    if header_index is None:
        raise ValueError("could not locate header row in workbook")

    headers = [cell(rows[header_index], i) for i in range(20)]
    header_map = _header_map(headers)
    parsed: list[dict[str, str]] = []
    for row in rows[header_index + 1 :]:
        name = cell(row, header_map["Restaurant"])
        if not name:
            continue
        parsed.append(
            {key: cell(row, header_map[key]) for key in EXPECTED_HEADERS}
        )
    return parsed


def _rows_from_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError("CSV has no headers")
        header_map = _header_map([name or "" for name in reader.fieldnames])
        # DictReader already maps by name; validate presence only.
        _ = header_map
        rows: list[dict[str, str]] = []
        for row in reader:
            name = (row.get("Restaurant") or "").strip()
            if not name:
                continue
            rows.append(
                {key: (row.get(key) or "").strip() for key in EXPECTED_HEADERS}
            )
        return rows


def load_canonical_restaurants(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    restaurants = payload.get("restaurants")
    if not isinstance(restaurants, list):
        raise ValueError(f"invalid restaurants payload in {path}")
    return restaurants


def load_incoming_roster(path: Path) -> tuple[list[dict[str, Any]], str]:
    """Return (restaurants, sha256 checksum)."""
    checksum = file_checksum(path)
    suffix = path.suffix.lower()
    if suffix in {".xlsx", ".xlsm"}:
        raw_rows = _rows_from_xlsx(path)
    elif suffix == ".csv":
        raw_rows = _rows_from_csv(path)
    elif suffix == ".json":
        restaurants = load_canonical_restaurants(path)
        return restaurants, checksum
    else:
        raise ValueError(f"unsupported roster file type: {suffix}")

    restaurants = [row_to_restaurant(row) for row in raw_rows]
    return restaurants, checksum
