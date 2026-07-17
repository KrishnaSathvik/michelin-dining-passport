"""Compare canonical restaurant dataset against an incoming roster."""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from typing import Any

from lib.identity import IdentityIndex

FIELD_CHANGE_KEYS = {
    "name": "name_change",
    "address": "address_change",
    "city": "city_or_state_change",
    "state": "city_or_state_change",
    "stateCode": "city_or_state_change",
    "cuisine": "cuisine_change",
    "price": "price_change",
    "website": "website_change",
    "michelinGuideUrl": "michelin_url_change",
}


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _field_changes(current: dict[str, Any], incoming: dict[str, Any]) -> list[dict[str, Any]]:
    changes: list[dict[str, Any]] = []
    seen_labels: set[str] = set()

    current_stars = current.get("stars")
    incoming_stars = incoming.get("stars")
    if current_stars != incoming_stars:
        label = "star_upgrade" if incoming_stars > current_stars else "star_downgrade"
        changes.append(
            {
                "type": label,
                "field": "stars",
                "from": current_stars,
                "to": incoming_stars,
            }
        )
        seen_labels.add(label)

    for field, label in FIELD_CHANGE_KEYS.items():
        if current.get(field) != incoming.get(field):
            if label in seen_labels and label == "city_or_state_change":
                # Collapse city/state/stateCode into one change entry with details.
                existing = next(c for c in changes if c["type"] == label)
                existing.setdefault("fields", {})[field] = {
                    "from": current.get(field),
                    "to": incoming.get(field),
                }
                continue
            entry: dict[str, Any] = {
                "type": label,
                "field": field,
                "from": current.get(field),
                "to": incoming.get(field),
            }
            if label == "city_or_state_change":
                entry["fields"] = {
                    field: {"from": current.get(field), "to": incoming.get(field)}
                }
            changes.append(entry)
            seen_labels.add(label)

    return changes


def build_diff(
    *,
    current: list[dict[str, Any]],
    incoming: list[dict[str, Any]],
    identity_index: IdentityIndex,
    source_file: str,
    source_checksum: str,
) -> dict[str, Any]:
    matched_current: set[str] = set()
    records: list[dict[str, Any]] = []
    possible_duplicates: list[dict[str, Any]] = []

    for restaurant in incoming:
        match = identity_index.match(restaurant)
        if match["ambiguous"] or (
            match["matchedSlug"] is None and match["candidates"]
        ):
            possible_duplicates.append(
                {
                    "incomingSlug": restaurant["slug"],
                    "incomingName": restaurant["name"],
                    "candidates": match["candidates"],
                    "method": match["method"],
                }
            )

        matched_slug = match["matchedSlug"]
        if matched_slug is None:
            records.append(
                {
                    "status": "new",
                    "incomingSlug": restaurant["slug"],
                    "incoming": restaurant,
                    "matchMethod": match["method"],
                    "changes": [],
                }
            )
            continue

        if matched_slug in matched_current:
            possible_duplicates.append(
                {
                    "incomingSlug": restaurant["slug"],
                    "incomingName": restaurant["name"],
                    "candidates": [matched_slug],
                    "method": "multiple_incoming_to_one_current",
                }
            )

        matched_current.add(matched_slug)
        current_row = identity_index.by_slug[matched_slug]
        changes = _field_changes(current_row, restaurant)
        status = "unchanged" if not changes else "updated"
        records.append(
            {
                "status": status,
                "canonicalSlug": matched_slug,
                "incomingSlug": restaurant["slug"],
                "matchMethod": match["method"],
                "current": {
                    "name": current_row["name"],
                    "stars": current_row["stars"],
                    "slug": current_row["slug"],
                },
                "incoming": restaurant,
                "changes": changes,
            }
        )

    for restaurant in current:
        if restaurant["slug"] in matched_current:
            continue
        records.append(
            {
                "status": "removed_from_current_import",
                "canonicalSlug": restaurant["slug"],
                "current": restaurant,
                "reviewRequired": True,
                "note": (
                    "Absent from the new import. Do not treat as permanently closed "
                    "without developer review."
                ),
                "changes": [],
            }
        )

    summary = Counter(item["status"] for item in records)
    change_types = Counter(
        change["type"] for item in records for change in item.get("changes") or []
    )

    return {
        "version": 1,
        "generatedAt": _now(),
        "sourceFile": source_file,
        "sourceChecksum": source_checksum,
        "reviewed": False,
        "reviewNotes": "",
        "summary": {
            "currentCount": len(current),
            "incomingCount": len(incoming),
            "new": summary.get("new", 0),
            "removed_from_current_import": summary.get(
                "removed_from_current_import", 0
            ),
            "updated": summary.get("updated", 0),
            "unchanged": summary.get("unchanged", 0),
            "possibleDuplicates": len(possible_duplicates),
            "changeTypes": dict(change_types),
        },
        "possibleDuplicates": possible_duplicates,
        "records": records,
    }
