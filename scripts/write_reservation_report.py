#!/usr/bin/env python3
"""Generate docs/reservation-enrichment-report.md coverage summary."""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
RESERVATIONS_PATH = ROOT / "data" / "reservations.json"
OVERRIDES_PATH = ROOT / "data" / "reservation-overrides.json"
CANDIDATES_PATH = ROOT / "data" / "reservation-candidates.json"
OUT_PATH = ROOT / "docs" / "reservation-enrichment-report.md"


def main() -> int:
    restaurants = json.loads(RESTAURANTS_PATH.read_text(encoding="utf-8"))["restaurants"]
    records = json.loads(RESERVATIONS_PATH.read_text(encoding="utf-8")).get("records") or {}
    overrides = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8")).get("overrides") or []
    candidates = json.loads(CANDIDATES_PATH.read_text(encoding="utf-8")).get("candidates") or {}

    # Apply overrides for reporting (mirrors runtime)
    override_by = {item["restaurantSlug"]: item for item in overrides}
    effective = {}
    for slug, rec in records.items():
        merged = dict(rec)
        if slug in override_by:
            for key, value in override_by[slug].items():
                if key in {"restaurantSlug", "reason", "decidedAt"}:
                    continue
                merged[key] = value
        effective[slug] = merged

    status = Counter(str(r.get("status")) for r in effective.values())
    verified = [r for r in effective.values() if r.get("status") == "verified"]
    providers = Counter(str(r.get("provider")) for r in verified)
    with_website = sum(1 for r in restaurants if r.get("website"))
    cand_count = sum(len(v.get("candidates") or []) for v in candidates.values())
    auto_notes = sum(
        1
        for r in verified
        if isinstance(r.get("notes"), str) and "Auto-approved" in r["notes"]
    )

    website_fallback = sum(
        1
        for r in restaurants
        if r.get("website")
        and effective.get(r["slug"], {}).get("status")
        not in {"verified", "no_online_booking", "phone_only"}
    )
    michelin_fallback = sum(1 for r in restaurants if not r.get("website"))

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "# Reservation enrichment report",
        "",
        f"Generated: {now}",
        "",
        "## Coverage",
        "",
        f"- Total restaurants: **{len(restaurants)}**",
        f"- With official website: **{with_website}**",
        f"- Verified direct reservation links: **{len(verified)}**",
        f"- Official-website fallbacks (unverified booking): **{website_fallback}**",
        f"- Michelin listing fallbacks (no website): **{michelin_fallback}**",
        f"- Phone-only: **{status.get('phone_only', 0)}**",
        f"- No online booking: **{status.get('no_online_booking', 0)}**",
        f"- Needs review: **{status.get('needs_review', 0)}**",
        f"- Unknown: **{status.get('unknown', 0)}**",
        f"- Temporarily unavailable: **{status.get('temporarily_unavailable', 0)}**",
        "",
        "## Provider breakdown (verified only)",
        "",
    ]
    if providers:
        for key, value in providers.most_common():
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- None verified yet.")

    lines.extend(
        [
            "",
            "## Discovery",
            "",
            f"- Restaurants with discovery entries: **{len(candidates)}**",
            f"- Candidate links found: **{cand_count}**",
            f"- Auto-approved from discovery: **{auto_notes}**",
            f"- Manual overrides: **{len(overrides)}**",
            "",
            "## Process notes",
            "",
            "- Candidates live in `data/reservation-candidates.json`.",
            "- Approved runtime records live in `data/reservations.json`.",
            "- Manual decisions are written to `data/reservation-overrides.json`.",
            "- Low/medium confidence candidates are never auto-published as verified.",
            "- Availability, party size, and time slots are not scraped.",
            "",
            "## Commands",
            "",
            "```bash",
            "npm run data:reservations:discover",
            "npm run data:reservations:validate",
            "npm run data:reservations:report",
            "python3 scripts/review_reservations.py --report --needs-review",
            "```",
            "",
        ]
    )
    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
