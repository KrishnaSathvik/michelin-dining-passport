#!/usr/bin/env python3
"""Interactive Google Place ID review (terminal).

Displays candidate hints from gitignored temp tips when present, but persists
only Place ID + internal match metadata.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from google_places_common import (
    MATCHES_PATH,
    OVERRIDES_PATH,
    RESTAURANTS_PATH,
    TMP_DIR,
    empty_match,
    load_json,
    load_matches,
    load_overrides,
    matches_by_slug,
    now_iso,
    sanitize_match_record,
    save_json,
    today,
)

ROOT = Path(__file__).resolve().parents[1]


def upsert_override(overrides: dict, item: dict) -> None:
    items = [
        row
        for row in (overrides.get("overrides") or [])
        if row.get("restaurantSlug") != item["restaurantSlug"]
    ]
    items.append(sanitize_match_record(item))
    overrides["overrides"] = sorted(items, key=lambda row: row["restaurantSlug"])
    overrides["updatedAt"] = now_iso()


def upsert_match(matches_payload: dict, item: dict) -> None:
    by_slug = matches_by_slug(matches_payload)
    by_slug[item["restaurantSlug"]] = sanitize_match_record(item)
    matches_payload["matches"] = sorted(
        by_slug.values(), key=lambda row: row["restaurantSlug"]
    )
    matches_payload["updatedAt"] = now_iso()


def clear_tip(slug: str) -> None:
    tip = TMP_DIR / f"{slug}.txt"
    if tip.exists():
        tip.unlink()


def unresolved(matches: dict[str, dict]) -> list[str]:
    return [
        slug
        for slug, row in sorted(matches.items())
        if row.get("status") == "needs_review"
    ]


def show_record(slug: str, restaurant: dict, row: dict) -> None:
    print()
    print("=" * 72)
    print(f"Restaurant: {restaurant.get('name', slug)}")
    print(f"Slug: {slug}")
    print(f"Our address: {restaurant.get('address')}")
    print(f"City/state: {restaurant.get('city')}, {restaurant.get('stateCode')}")
    print(f"Website: {restaurant.get('website')}")
    print(f"Current status: {row.get('status')} / confidence={row.get('confidence')}")
    print(f"Method: {row.get('method')} notes={row.get('notes')}")
    tip = TMP_DIR / f"{slug}.txt"
    if tip.exists():
        print("-" * 40)
        print(tip.read_text(encoding="utf-8").rstrip())
        print("-" * 40)
    print(
        "[A] Approve Place ID  [R] Reject  [S] Skip/needs review  "
        "[M] Enter Place ID manually  [N] No match  [Q] Quit"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", default="")
    args = parser.parse_args()

    if not sys.stdin.isatty():
        print("Interactive review requires a TTY.", file=sys.stderr)
        return 1

    restaurants = {
        row["slug"]: row for row in load_json(RESTAURANTS_PATH)["restaurants"]
    }
    matches_payload = load_matches()
    overrides = load_overrides()
    by_slug = matches_by_slug(matches_payload)

    queue = [args.slug] if args.slug else unresolved(by_slug)
    if not queue:
        print("No needs_review records.")
        return 0

    index = 0
    while 0 <= index < len(queue):
        slug = queue[index]
        restaurant = restaurants.get(slug) or {"name": slug}
        row = by_slug.get(slug) or empty_match(slug)
        show_record(slug, restaurant, row)
        choice = input(f"[{index + 1}/{len(queue)}] Choice: ").strip().lower()

        if choice == "q":
            break
        if choice in {"", "s"}:
            upsert_match(
                matches_payload,
                empty_match(
                    slug,
                    status="needs_review",
                    confidence=row.get("confidence") or "low",
                    method=row.get("method") or "manual_skip",
                    notes=row.get("notes") or "Skipped in review.",
                ),
            )
            index += 1
            continue
        if choice == "r":
            decision = empty_match(
                slug,
                status="rejected",
                confidence="low",
                method="manual_reject",
                notes="Rejected in interactive review.",
                reviewedAt=today(),
            )
            upsert_match(matches_payload, decision)
            upsert_override(overrides, decision)
            clear_tip(slug)
            index += 1
            continue
        if choice == "n":
            decision = empty_match(
                slug,
                status="no_match",
                confidence="low",
                method="manual_no_match",
                notes="No confident Google match.",
                reviewedAt=today(),
            )
            upsert_match(matches_payload, decision)
            upsert_override(overrides, decision)
            clear_tip(slug)
            index += 1
            continue
        if choice == "a":
            place_id = input("Place ID to approve: ").strip()
            if not place_id:
                print("Empty Place ID — not saved.")
                continue
            decision = {
                "restaurantSlug": slug,
                "placeId": place_id,
                "status": "manually_approved",
                "confidence": "high",
                "method": "manual_approve",
                "reviewedAt": today(),
                "notes": "Approved in interactive review.",
            }
            try:
                decision = sanitize_match_record(decision)
            except ValueError as exc:
                print(f"Invalid: {exc}")
                continue
            upsert_match(matches_payload, decision)
            upsert_override(overrides, decision)
            clear_tip(slug)
            index += 1
            continue
        if choice == "m":
            place_id = input("Enter Place ID: ").strip()
            if not place_id:
                print("Empty Place ID — not saved.")
                continue
            decision = {
                "restaurantSlug": slug,
                "placeId": place_id,
                "status": "manually_approved",
                "confidence": "medium",
                "method": "manual_place_id",
                "reviewedAt": today(),
                "notes": "Manual Place ID entry.",
            }
            try:
                decision = sanitize_match_record(decision)
            except ValueError as exc:
                print(f"Invalid: {exc}")
                continue
            upsert_match(matches_payload, decision)
            upsert_override(overrides, decision)
            clear_tip(slug)
            index += 1
            continue
        if choice == "p":
            index = max(0, index - 1)
            continue
        print("Unknown choice.")

    save_json(MATCHES_PATH, matches_payload)
    save_json(OVERRIDES_PATH, overrides)
    print(f"Saved {MATCHES_PATH} and {OVERRIDES_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
