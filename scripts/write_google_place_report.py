#!/usr/bin/env python3
"""Write Google Place ID matching report."""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
MATCHES_PATH = ROOT / "data" / "google-place-ids.json"
GEOCODES_PATH = ROOT / "data" / "geocodes.json"
REPORT_PATH = ROOT / "docs" / "google-places" / "matching-report.md"


def normalize(value: str) -> str:
    return " ".join((value or "").casefold().split())


def main() -> int:
    restaurants = json.loads(RESTAURANTS_PATH.read_text(encoding="utf-8"))["restaurants"]
    matches = []
    if MATCHES_PATH.exists():
        matches = json.loads(MATCHES_PATH.read_text(encoding="utf-8")).get("matches") or []
    by_slug = {row["restaurantSlug"]: row for row in matches}
    counts = Counter(row.get("status") for row in matches)
    approved = [
        row
        for row in matches
        if row.get("status") in {"matched", "manually_approved"} and row.get("placeId")
    ]
    enrichment_pct = (100.0 * len(approved) / len(restaurants)) if restaurants else 0.0

    place_id_owners: dict[str, list[str]] = {}
    for row in approved:
        place_id_owners.setdefault(str(row["placeId"]), []).append(row["restaurantSlug"])
    duplicate_place_ids = {
        place_id: slugs for place_id, slugs in place_id_owners.items() if len(slugs) > 1
    }

    by_addr: dict[str, list[str]] = {}
    for row in restaurants:
        by_addr.setdefault(normalize(row["address"]), []).append(row["slug"])
    shared = [slugs for slugs in by_addr.values() if len(slugs) > 1]

    three_star = [row for row in restaurants if row.get("stars") == 3]
    three_star_ok = all(
        (by_slug.get(row["slug"]) or {}).get("status")
        in {"matched", "manually_approved"}
        for row in three_star
    )

    lines = [
        "# Google Place ID matching report",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        "",
        "## Coverage",
        "",
        f"- Roster restaurants: **{len(restaurants)}**",
        f"- Match records: **{len(matches)}**",
        f"- matched: **{counts.get('matched', 0)}**",
        f"- manually_approved: **{counts.get('manually_approved', 0)}**",
        f"- needs_review: **{counts.get('needs_review', 0)}**",
        f"- rejected: **{counts.get('rejected', 0)}**",
        f"- no_match: **{counts.get('no_match', 0)}**",
        f"- Enrichment coverage (approved Place ID): **{enrichment_pct:.1f}%** ({len(approved)}/{len(restaurants)})",
        f"- Duplicate approved Place IDs: **{len(duplicate_place_ids)}**",
        f"- All 3-star restaurants approved: **{'yes' if three_star_ok else 'no'}** ({len(three_star)})",
        "",
        "## Shared-address sibling groups",
        "",
        f"- Groups: **{len(shared)}**",
        "",
    ]
    for group in shared:
        statuses = ", ".join(
            f"{slug}={ (by_slug.get(slug) or {}).get('status', 'missing') }"
            for slug in group
        )
        lines.append(f"- `{statuses}`")

    if duplicate_place_ids:
        lines.extend(["", "## Duplicate Place ID conflicts", ""])
        for place_id, slugs in sorted(duplicate_place_ids.items()):
            lines.append(f"- `{place_id}` → {', '.join(slugs)}")

    lines.extend(
        [
            "",
            "## Unresolved limitations",
            "",
            "- Server-side matching requires an IP-allowlisted matching API key.",
            "- Prefer verified `no_match` over forcing weak Place IDs when confidence is insufficient.",
            "",
            "## Policy",
            "",
            "- Only Place IDs and internal match metadata are stored.",
            "- Google photos, ratings, reviews, hours, phones, websites, and raw payloads are not committed.",
            "- Shared-address siblings require distinct Place IDs and manual review when ambiguous.",
            "",
        ]
    )
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {REPORT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
