#!/usr/bin/env python3
"""Validate Google Place ID match files."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
MATCHES_PATH = ROOT / "data" / "google-place-ids.json"
OVERRIDES_PATH = ROOT / "data" / "google-place-id-overrides.json"

VALID_STATUS = {
    "matched",
    "manually_approved",
    "needs_review",
    "rejected",
    "no_match",
}
VALID_CONFIDENCE = {"high", "medium", "low"}
PLACE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{10,}$")
FORBIDDEN = {
    "photos",
    "photo",
    "photoNames",
    "rating",
    "reviews",
    "reviewSummary",
    "formattedAddress",
    "location",
    "nationalPhoneNumber",
    "websiteUri",
    "regularOpeningHours",
    "raw",
    "candidates",
    "displayName",
}


def main() -> int:
    restaurants = json.loads(RESTAURANTS_PATH.read_text(encoding="utf-8"))["restaurants"]
    slugs = {row["slug"] for row in restaurants}
    errors: list[str] = []

    if not MATCHES_PATH.exists():
        print("PASS (no google-place-ids.json yet — discovery remains functional)")
        return 0

    payload = json.loads(MATCHES_PATH.read_text(encoding="utf-8"))
    matches = payload.get("matches") or []
    by_slug: dict[str, dict] = {}
    place_owners: dict[str, list[str]] = {}

    if len(restaurants) != 271:
        errors.append(f"Expected 271 restaurants, found {len(restaurants)}")

    for row in matches:
        slug = row.get("restaurantSlug")
        if slug in by_slug:
            errors.append(f"Duplicate slug: {slug}")
        by_slug[slug] = row

        for key in row:
            if key in FORBIDDEN:
                errors.append(f"{slug}: forbidden field {key}")

        status = row.get("status")
        if status not in VALID_STATUS:
            errors.append(f"{slug}: invalid status {status}")
        if row.get("confidence") not in VALID_CONFIDENCE:
            errors.append(f"{slug}: invalid confidence")

        place_id = row.get("placeId")
        if status in {"rejected", "no_match"}:
            if place_id not in (None, ""):
                errors.append(f"{slug}: {status} must not expose a Place ID")
        elif status in {"matched", "manually_approved"}:
            if not isinstance(place_id, str) or not PLACE_ID_RE.match(place_id):
                errors.append(f"{slug}: approved status requires a valid Place ID")
            else:
                place_owners.setdefault(place_id, []).append(slug)
        elif place_id not in (None, ""):
            if not isinstance(place_id, str) or not PLACE_ID_RE.match(place_id):
                errors.append(f"{slug}: invalid Place ID format")
            else:
                place_owners.setdefault(place_id, []).append(slug)

        if slug not in slugs:
            errors.append(f"Unknown restaurant slug: {slug}")

    missing = sorted(slugs - set(by_slug))
    if missing:
        errors.append(f"Missing status for {len(missing)} restaurants (e.g. {missing[:3]})")

    for place_id, owners in place_owners.items():
        if len(owners) > 1:
            errors.append(
                f"Duplicate Place ID {place_id[-8:]}… used by {owners} "
                "(document explicit permission if intentional)"
            )

    if OVERRIDES_PATH.exists():
        overrides = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8")).get(
            "overrides"
        ) or []
        for row in overrides:
            slug = row.get("restaurantSlug")
            if slug not in slugs:
                errors.append(f"Override for unknown slug: {slug}")
            for key in row:
                if key in FORBIDDEN:
                    errors.append(f"override {slug}: forbidden field {key}")

    # Dump must not look like a provider payload dump
    raw = MATCHES_PATH.read_text(encoding="utf-8")
    for needle in ('"photos"', '"reviews"', '"formattedAddress"', '"websiteUri"'):
        if needle in raw:
            errors.append(f"Provider-looking field present in committed JSON: {needle}")

    counts = Counter(row.get("status") for row in matches)
    if errors:
        print("FAIL google place id validation")
        for err in errors:
            print(f" - {err}")
        return 1

    print("PASS google place id validation")
    print(f" restaurants={len(restaurants)} matches={len(matches)} statuses={dict(counts)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
