#!/usr/bin/env python3
"""Apply a reviewed restaurant roster diff safely.

Default behavior is dry-run. Requires --confirm to write.

Examples:
  npm run data:apply-update -- --file ./data/new-guide.xlsx
  npm run data:apply-update -- --file ./data/new-guide.xlsx --diff ./data/reports/restaurant-diff.json --confirm
  npm run data:apply-update -- --file ./data/new-guide.xlsx --diff ... --confirm --production --i-understand-production
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from lib.identity import IdentityIndex, load_identity_overrides
from lib.roster_io import file_checksum, load_canonical_restaurants, load_incoming_roster
from lib.slug import city_slug, cuisine_slug, state_slug

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANONICAL = ROOT / "data" / "restaurants.json"
DEFAULT_DIFF = ROOT / "data" / "reports" / "restaurant-diff.json"
DEFAULT_OVERRIDES = ROOT / "data" / "restaurant-identity-overrides.json"
FIELD_OVERRIDES = ROOT / "data" / "restaurant-field-overrides.json"
BACKUP_DIR = ROOT / "data" / "backups"
AWARDS_ARTIFACT = ROOT / "data" / "restaurant-awards.json"


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_field_overrides(path: Path) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    result: dict[str, dict[str, Any]] = {}
    for item in payload.get("overrides") or []:
        slug = item.get("restaurantSlug")
        if not slug:
            continue
        result[slug] = item
    return result


def apply_field_overrides(
    restaurant: dict[str, Any], override: dict[str, Any] | None
) -> dict[str, Any]:
    if not override:
        return restaurant
    updated = dict(restaurant)
    fields = override.get("fields") or {}
    for key, value in fields.items():
        updated[key] = value
    # Keep derived slugs consistent when identity fields change.
    if "city" in fields or "name" in fields or "stateCode" in fields:
        city = updated["city"]
        state_code = updated["stateCode"]
        updated["citySlug"] = city_slug(city)
        updated["stateSlug"] = state_slug(updated["state"], state_code)
        if "cuisine" in fields:
            updated["cuisineSlug"] = cuisine_slug(updated["cuisine"])
    elif "cuisine" in fields:
        updated["cuisineSlug"] = cuisine_slug(updated["cuisine"])
    return updated


def build_updated_roster(
    *,
    current: list[dict[str, Any]],
    incoming: list[dict[str, Any]],
    diff: dict[str, Any],
    identity_index: IdentityIndex,
    field_overrides: dict[str, dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    current_by_slug = {r["slug"]: r for r in current}
    preserved_removed: list[dict[str, Any]] = []
    awards_events: list[dict[str, Any]] = []

    # Start from matched/updated + new; keep removed rows until developer marks them.
    next_by_slug: dict[str, dict[str, Any]] = {}

    if not diff.get("records"):
        # Empty reviewed diff means no-op: preserve the current roster.
        star_counts = Counter(r["stars"] for r in current)
        reconciliation = {
            "previousCount": len(current),
            "nextCount": len(current),
            "preservedRemovedPendingReview": 0,
            "awardsEvents": 0,
            "starCounts": {
                "oneStar": star_counts[1],
                "twoStar": star_counts[2],
                "threeStar": star_counts[3],
            },
            "noop": True,
        }
        return list(current), [], reconciliation

    for record in diff["records"]:
        status = record["status"]
        if status == "removed_from_current_import":
            slug = record["canonicalSlug"]
            # Preserve existing row (and its ID/slug) pending review.
            preserved = dict(current_by_slug[slug])
            preserved_removed.append(preserved)
            next_by_slug[slug] = preserved
            continue

        if status == "new":
            restaurant = dict(record["incoming"])
            restaurant = apply_field_overrides(
                restaurant, field_overrides.get(restaurant["slug"])
            )
            next_by_slug[restaurant["slug"]] = restaurant
            awards_events.append(
                {
                    "restaurantSlug": restaurant["slug"],
                    "guideYear": date.today().year,
                    "stars": restaurant["stars"],
                    "sourceUrl": restaurant.get("michelinGuideUrl"),
                    "isCurrent": True,
                    "event": "new",
                }
            )
            continue

        # updated or unchanged — preserve canonical slug / identity
        canonical_slug = record["canonicalSlug"]
        incoming_row = dict(record["incoming"])
        # Force stable slug from current record so user data stays attached.
        incoming_row["slug"] = canonical_slug
        # Preserve derived taxonomy fields from incoming but keep slug.
        incoming_row["citySlug"] = city_slug(incoming_row["city"])
        incoming_row["stateSlug"] = state_slug(
            incoming_row["state"], incoming_row["stateCode"]
        )
        incoming_row["cuisineSlug"] = cuisine_slug(incoming_row["cuisine"])
        incoming_row = apply_field_overrides(
            incoming_row, field_overrides.get(canonical_slug)
        )
        next_by_slug[canonical_slug] = incoming_row

        for change in record.get("changes") or []:
            if change["type"] in {"star_upgrade", "star_downgrade"}:
                awards_events.append(
                    {
                        "restaurantSlug": canonical_slug,
                        "guideYear": date.today().year,
                        "stars": change["to"],
                        "previousStars": change["from"],
                        "sourceUrl": incoming_row.get("michelinGuideUrl"),
                        "isCurrent": True,
                        "event": change["type"],
                    }
                )

    # Sanity: every matched incoming should appear.
    for restaurant in incoming:
        match = identity_index.match(restaurant)
        if match["matchedSlug"] and match["matchedSlug"] not in next_by_slug:
            raise RuntimeError(
                f"matched restaurant missing from next roster: {match['matchedSlug']}"
            )

    next_restaurants = sorted(next_by_slug.values(), key=lambda r: r["slug"])
    star_counts = Counter(r["stars"] for r in next_restaurants)
    reconciliation = {
        "previousCount": len(current),
        "nextCount": len(next_restaurants),
        "preservedRemovedPendingReview": len(preserved_removed),
        "awardsEvents": len(awards_events),
        "starCounts": {
            "oneStar": star_counts[1],
            "twoStar": star_counts[2],
            "threeStar": star_counts[3],
        },
    }
    return next_restaurants, awards_events, reconciliation


def write_restaurants_json(path: Path, restaurants: list[dict[str, Any]], source_file: str) -> None:
    star_counts = Counter(r["stars"] for r in restaurants)
    payload = {
        "source": {
            "workbook": source_file,
            "sheet": "All Restaurants",
            "importedAt": date.today().isoformat(),
            "coverageNote": (
                "Current snapshot. Michelin stars only "
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
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def merge_awards_artifact(events: list[dict[str, Any]]) -> dict[str, Any]:
    existing: dict[str, Any] = {"version": 1, "awards": []}
    if AWARDS_ARTIFACT.exists():
        existing = json.loads(AWARDS_ARTIFACT.read_text(encoding="utf-8"))
    awards = list(existing.get("awards") or [])
    for event in events:
        # Mark prior current awards for this slug as not current when stars change/new.
        for award in awards:
            if (
                award.get("restaurantSlug") == event["restaurantSlug"]
                and award.get("isCurrent")
            ):
                award["isCurrent"] = False
                award["updatedAt"] = _now()
        awards.append(
            {
                "restaurantSlug": event["restaurantSlug"],
                "guideYear": event["guideYear"],
                "stars": event["stars"],
                "sourceUrl": event.get("sourceUrl"),
                "isCurrent": True,
                "createdAt": _now(),
                "updatedAt": _now(),
                "event": event.get("event"),
                "previousStars": event.get("previousStars"),
            }
        )
    return {"version": 1, "updatedAt": _now(), "awards": awards}


def run_validations() -> None:
    commands = [
        ["python3", "scripts/validate_restaurants.py"],
        ["python3", "scripts/validate_geocodes.py"],
        ["python3", "scripts/validate_reservations.py"],
        ["node", "scripts/generate_supabase_seed.mjs", "--validate-only"],
    ]
    for command in commands:
        print(f"$ {' '.join(command)}")
        subprocess.run(command, cwd=ROOT, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", required=True, help="Incoming roster file")
    parser.add_argument("--diff", default=str(DEFAULT_DIFF), help="Reviewed diff JSON")
    parser.add_argument("--canonical", default=str(DEFAULT_CANONICAL))
    parser.add_argument("--identity-overrides", default=str(DEFAULT_OVERRIDES))
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Actually write files (default is dry-run)",
    )
    parser.add_argument(
        "--production",
        action="store_true",
        help="Required to target production Supabase updates",
    )
    parser.add_argument(
        "--i-understand-production",
        action="store_true",
        help="Second confirmation for production applies",
    )
    parser.add_argument(
        "--skip-validations",
        action="store_true",
        help="Skip post-apply validations (not recommended)",
    )
    parser.add_argument(
        "--update-supabase-seed",
        action="store_true",
        help="Regenerate supabase/seed.sql after applying",
    )
    args = parser.parse_args()

    if args.production and not args.i_understand_production:
        print(
            "ERROR: production applies require --production and --i-understand-production",
            file=sys.stderr,
        )
        return 1
    if args.production:
        print(
            "ERROR: direct production database apply is disabled in Phase 7 CLI. "
            "Apply locally, regenerate seed, review, then deploy via documented migration workflow.",
            file=sys.stderr,
        )
        return 1

    incoming_path = Path(args.file).resolve()
    diff_path = Path(args.diff).resolve()
    if not incoming_path.exists():
        print(f"ERROR: file not found: {incoming_path}", file=sys.stderr)
        return 1
    if not diff_path.exists():
        print(f"ERROR: diff report not found: {diff_path}", file=sys.stderr)
        return 1

    try:
        incoming, checksum = load_incoming_roster(incoming_path)
        current = load_canonical_restaurants(Path(args.canonical))
        diff = json.loads(diff_path.read_text(encoding="utf-8"))
        overrides = load_identity_overrides(Path(args.identity_overrides))
        field_overrides = load_field_overrides(FIELD_OVERRIDES)
        identity_index = IdentityIndex(current, overrides)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if diff.get("sourceChecksum") != checksum:
        print(
            "ERROR: input checksum does not match reviewed diff. "
            f"diff={diff.get('sourceChecksum')} file={checksum}",
            file=sys.stderr,
        )
        return 1
    if not diff.get("reviewed"):
        print(
            "ERROR: diff is not marked reviewed. Set reviewed=true after human review.",
            file=sys.stderr,
        )
        return 1

    next_restaurants, awards_events, reconciliation = build_updated_roster(
        current=current,
        incoming=incoming,
        diff=diff,
        identity_index=identity_index,
        field_overrides=field_overrides,
    )

    report = {
        "generatedAt": _now(),
        "dryRun": not args.confirm,
        "sourceFile": str(incoming_path),
        "sourceChecksum": checksum,
        "diffPath": str(diff_path),
        "reconciliation": reconciliation,
        "awardsEvents": awards_events,
        "notes": [
            "User saves/visits/collections remain attached via preserved restaurant slugs/IDs.",
            "removed_from_current_import rows are preserved pending developer review.",
            "Approved geocode coordinates and verified reservation URLs are not modified by this command.",
        ],
    }

    report_path = ROOT / "data" / "reports" / "restaurant-apply-reconciliation.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)

    print(json.dumps(report["reconciliation"], indent=2))
    if not args.confirm:
        report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print("Dry run only. Re-run with --confirm to write local artifacts.")
        print(f"Wrote reconciliation preview to {report_path.relative_to(ROOT)}")
        return 0

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_path = BACKUP_DIR / f"restaurants-{stamp}.json"
    shutil.copy2(Path(args.canonical), backup_path)
    print(f"Backup written to {backup_path.relative_to(ROOT)}")

    source_label = (
        str(incoming_path.relative_to(ROOT))
        if incoming_path.is_relative_to(ROOT)
        else str(incoming_path)
    )
    write_restaurants_json(Path(args.canonical), next_restaurants, source_label)
    awards_payload = merge_awards_artifact(awards_events)
    AWARDS_ARTIFACT.write_text(
        json.dumps(awards_payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    report["backup"] = str(backup_path.relative_to(ROOT))
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {args.canonical}")
    print(f"Updated {AWARDS_ARTIFACT.relative_to(ROOT)}")

    if args.update_supabase_seed:
        subprocess.run(
            ["node", "scripts/generate_supabase_seed.mjs"],
            cwd=ROOT,
            check=True,
        )

    if not args.skip_validations:
        try:
            run_validations()
        except subprocess.CalledProcessError as exc:
            print(
                "ERROR: validations failed after apply. Restore from backup if needed:\n"
                f"  cp {backup_path} {args.canonical}",
                file=sys.stderr,
            )
            return exc.returncode

    print("Apply complete. Review reconciliation report and commit intentionally.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
