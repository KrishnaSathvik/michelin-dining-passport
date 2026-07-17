#!/usr/bin/env python3
"""Compare a new Michelin roster against the canonical dataset.

Example:
  npm run data:diff -- --file ./data/new-guide.xlsx
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from lib.diff_report import build_diff
from lib.identity import IdentityIndex, load_identity_overrides
from lib.roster_io import load_canonical_restaurants, load_incoming_roster

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANONICAL = ROOT / "data" / "restaurants.json"
DEFAULT_OVERRIDES = ROOT / "data" / "restaurant-identity-overrides.json"
DEFAULT_OUT = ROOT / "data" / "reports" / "restaurant-diff.json"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", required=True, help="Incoming XLSX, CSV, or JSON roster")
    parser.add_argument(
        "--canonical",
        default=str(DEFAULT_CANONICAL),
        help="Current restaurants.json",
    )
    parser.add_argument(
        "--identity-overrides",
        default=str(DEFAULT_OVERRIDES),
        help="Manual identity mapping file",
    )
    parser.add_argument(
        "--out",
        default=str(DEFAULT_OUT),
        help="Where to write the JSON diff report",
    )
    args = parser.parse_args()

    incoming_path = Path(args.file).resolve()
    if not incoming_path.exists():
        print(f"ERROR: file not found: {incoming_path}", file=sys.stderr)
        return 1

    try:
        incoming, checksum = load_incoming_roster(incoming_path)
        current = load_canonical_restaurants(Path(args.canonical))
        overrides = load_identity_overrides(Path(args.identity_overrides))
        index = IdentityIndex(current, overrides)
        report = build_diff(
            current=current,
            incoming=incoming,
            identity_index=index,
            source_file=str(incoming_path.relative_to(ROOT))
            if incoming_path.is_relative_to(ROOT)
            else str(incoming_path),
            source_checksum=checksum,
        )
    except Exception as exc:  # noqa: BLE001 - CLI boundary
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    summary = report["summary"]
    try:
        out_display = out_path.relative_to(ROOT)
    except ValueError:
        out_display = out_path
    print(f"Wrote diff report to {out_display}")
    print(
        "Summary: "
        f"{summary['incomingCount']} incoming, "
        f"{summary['new']} new, "
        f"{summary['removed_from_current_import']} removed_from_current_import, "
        f"{summary['updated']} updated, "
        f"{summary['unchanged']} unchanged, "
        f"{summary['possibleDuplicates']} possible duplicates"
    )
    print("Mark the report reviewed (set reviewed=true) before data:apply-update.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
