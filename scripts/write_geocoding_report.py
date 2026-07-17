#!/usr/bin/env python3
"""Write docs/geocoding-report.md covering all 271 restaurant slugs."""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
GEOCODES_PATH = ROOT / "data" / "geocodes.json"
OVERRIDES_PATH = ROOT / "data" / "geocode-overrides.json"
REPORT_PATH = ROOT / "docs" / "geocoding-report.md"


def main() -> int:
    restaurants = json.loads(RESTAURANTS_PATH.read_text(encoding="utf-8"))["restaurants"]
    geocodes = json.loads(GEOCODES_PATH.read_text(encoding="utf-8"))
    overrides = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8"))
    records = geocodes["records"]

    by_conf = Counter(rec.get("confidence") for rec in records.values())
    review = Counter(rec.get("manualReviewStatus") for rec in records.values())

    shared_groups = sorted(
        {
            tuple(sorted(rec.get("sharedAddressGroup") or []))
            for rec in records.values()
            if len(rec.get("sharedAddressGroup") or []) > 1
        }
    )

    coord_groups: dict[str, list[str]] = defaultdict(list)
    for slug, rec in records.items():
        if rec.get("latitude") is None or not rec.get("approved"):
            continue
        key = f"{float(rec['latitude']):.6f},{float(rec['longitude']):.6f}"
        coord_groups[key].append(slug)
    shared_coords = {k: v for k, v in coord_groups.items() if len(v) > 1}

    lines: list[str] = []
    lines.append("# Geocoding reconciliation report")
    lines.append("")
    lines.append(f"Generated: {datetime.now(timezone.utc).isoformat()}")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"| Metric | Count |")
    lines.append(f"| --- | ---: |")
    lines.append(f"| Total restaurants | {len(restaurants)} |")
    lines.append(f"| High-confidence matches | {by_conf.get('high', 0)} |")
    lines.append(f"| Medium-confidence matches | {by_conf.get('medium', 0)} |")
    lines.append(f"| Low-confidence matches | {by_conf.get('low', 0)} |")
    lines.append(f"| No matches | {by_conf.get('none', 0)} |")
    lines.append(f"| Approved for markers | {sum(1 for r in records.values() if r.get('approved'))} |")
    lines.append(f"| Shared-coordinate restaurants (groups) | {len(shared_coords)} groups / {sum(len(v) for v in shared_coords.values())} restaurants |")
    lines.append(f"| Manually approved matches | {review.get('manually_approved', 0)} |")
    lines.append(f"| Manually corrected matches | {review.get('manually_corrected', 0) + len(overrides.get('overrides') or [])} |")
    lines.append(f"| Overrides file entries | {len(overrides.get('overrides') or [])} |")
    lines.append("")
    lines.append("## Policy notes")
    lines.append("")
    lines.append("- One-time Nominatim batch: single thread, ≤1 request/second, application User-Agent.")
    lines.append("- Every successful and failed query is cached in `data/geocode-query-cache.json`.")
    lines.append("- Low-confidence matches are never auto-accepted for markers.")
    lines.append("- Medium-confidence matches require review before approval.")
    lines.append("- City-centroid fallbacks were cleared and treated as unmatched.")
    lines.append("- Nominatim is not exposed as a live client-side search service.")
    lines.append("- This batch is not the recurring production geocoding workflow.")
    lines.append("")
    lines.append("## Shared-address pairs (canonical)")
    lines.append("")
    for group in shared_groups:
        lines.append(f"- `{', '.join(group)}`")
    lines.append("")
    lines.append("Restaurants at the same building intentionally share coordinates; markers receive a small visual offset at render time.")
    lines.append("")
    lines.append("## Medium-confidence (needs review — not marker-approved)")
    lines.append("")
    medium = sorted(
        (slug, rec)
        for slug, rec in records.items()
        if rec.get("confidence") == "medium" and not rec.get("approved")
    )
    if not medium:
        lines.append("_None._")
    else:
        for slug, rec in medium:
            lines.append(
                f"- `{slug}` — {rec.get('matchType')} — {rec.get('displayName', '')[:120]}"
            )
    lines.append("")
    lines.append("## Unmatched / no approved coordinates")
    lines.append("")
    unmatched = sorted(
        (slug, rec)
        for slug, rec in records.items()
        if not rec.get("approved")
    )
    lines.append(f"Count: {len(unmatched)}")
    lines.append("")
    for slug, rec in unmatched:
        lines.append(
            f"- `{slug}` — confidence={rec.get('confidence')} — status={rec.get('manualReviewStatus')} — {rec.get('matchType')}"
        )
    lines.append("")
    lines.append("## Full slug inventory")
    lines.append("")
    lines.append("Every restaurant slug appears below with its geocoding status.")
    lines.append("")
    lines.append("| Slug | Confidence | Approved | Review status | Match type | Lat | Lng |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- |")
    for restaurant in sorted(restaurants, key=lambda item: item["slug"]):
        slug = restaurant["slug"]
        rec = records[slug]
        lat = rec.get("latitude")
        lng = rec.get("longitude")
        lines.append(
            "| `{slug}` | {conf} | {approved} | {review} | {match} | {lat} | {lng} |".format(
                slug=slug,
                conf=rec.get("confidence"),
                approved="yes" if rec.get("approved") else "no",
                review=rec.get("manualReviewStatus"),
                match=rec.get("matchType"),
                lat="" if lat is None else f"{lat:.6f}",
                lng="" if lng is None else f"{lng:.6f}",
            )
        )
    lines.append("")

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {REPORT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
