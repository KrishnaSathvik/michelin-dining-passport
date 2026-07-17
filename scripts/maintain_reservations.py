#!/usr/bin/env python3
"""Reservation maintenance orchestration.

Statuses:
  valid | redirected | temporarily_unavailable | not_found | blocked | needs_manual_review

Does not remove a verified link after one temporary network failure.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECK_LOG = ROOT / "data" / "reservation-link-check-log.json"
REVIEW_REPORT = ROOT / "data" / "reports" / "reservation-maintenance.json"
OVERRIDES = ROOT / "data" / "reservation-overrides.json"

STATUS_MAP = {
    "valid_page": "valid",
    "redirect": "redirected",
    "temporary_failure": "temporarily_unavailable",
    "permanent_not_found": "not_found",
    "blocked_or_rate_limited": "blocked",
    "authentication_required": "blocked",
    "needs_manual_review": "needs_manual_review",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def cmd_recheck(args: argparse.Namespace) -> int:
    command = ["python3", "scripts/check_reservation_links.py"]
    if args.limit:
        command.extend(["--limit", str(args.limit)])
    return subprocess.call(command, cwd=ROOT)


def cmd_review_failed(_: argparse.Namespace) -> int:
    if not CHECK_LOG.exists():
        print("No reservation-link-check-log.json yet. Run recheck first.")
        return 0
    log = json.loads(CHECK_LOG.read_text(encoding="utf-8"))
    checks = log.get("checks") or {}
    failed = []
    for slug, entry in checks.items():
        raw = entry.get("classification") or entry.get("lastStatus") or "needs_manual_review"
        status = STATUS_MAP.get(raw, "needs_manual_review")
        consecutive = entry.get("consecutiveFailures") or entry.get("failureCount") or 0
        if status == "valid":
            continue
        if status == "temporarily_unavailable" and consecutive < 2:
            # Preserve verified links after a single temporary failure.
            continue
        failed.append(
            {
                "restaurantSlug": slug,
                "status": status,
                "rawClassification": raw,
                "consecutiveFailures": consecutive,
                "url": entry.get("url") or entry.get("reservationUrl"),
                "checkedAt": entry.get("checkedAt") or entry.get("lastCheckedAt"),
            }
        )
    REVIEW_REPORT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedAt": now_iso(),
        "failedCount": len(failed),
        "items": sorted(failed, key=lambda item: item["restaurantSlug"]),
        "policy": "Verified links are not removed after one temporary failure.",
    }
    REVIEW_REPORT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {REVIEW_REPORT.relative_to(ROOT)} ({len(failed)} items)")
    for item in failed:
        print(f"{item['restaurantSlug']}\t{item['status']}\tfailures={item['consecutiveFailures']}")
    return 0


def cmd_rediscover(args: argparse.Namespace) -> int:
    command = ["python3", "scripts/discover_reservations.py"]
    if args.slug:
        # discover script may not support --slug; pass through if present later.
        command.extend(["--slug", args.slug])
    result = subprocess.call(command, cwd=ROOT)
    if result != 0 and args.slug:
        print(
            "NOTE: discover_reservations.py may not accept --slug; "
            "run full discovery or patch candidates manually.",
            file=sys.stderr,
        )
    return result


def cmd_apply_override(args: argparse.Namespace) -> int:
    if not args.slug or not args.reason:
        print("ERROR: --slug and --reason are required", file=sys.stderr)
        return 1
    payload = json.loads(OVERRIDES.read_text(encoding="utf-8")) if OVERRIDES.exists() else {
        "overrides": []
    }
    # Support both array and object shapes historically used in the repo.
    overrides = payload.get("overrides")
    if isinstance(overrides, dict):
        items = [
            {"restaurantSlug": slug, **patch}
            for slug, patch in overrides.items()
        ]
    else:
        items = list(overrides or [])

    items = [item for item in items if item.get("restaurantSlug") != args.slug]
    entry = {
        "restaurantSlug": args.slug,
        "reason": args.reason,
        "decidedAt": now_iso(),
    }
    if args.url is not None:
        entry["reservationUrl"] = args.url or None
    if args.status:
        entry["status"] = args.status
    if args.provider:
        entry["provider"] = args.provider
    items.append(entry)

    out = {"version": 1, "updatedAt": now_iso(), "overrides": items}
    if not args.confirm:
        print(json.dumps(entry, indent=2))
        print("Dry run. Re-run with --confirm to write reservation-overrides.json.")
        return 0
    OVERRIDES.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote reservation override for {args.slug}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "command",
        choices=["recheck", "review-failed", "rediscover", "apply-override"],
    )
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--slug")
    parser.add_argument("--url")
    parser.add_argument("--status")
    parser.add_argument("--provider")
    parser.add_argument("--reason")
    parser.add_argument("--confirm", action="store_true")
    args = parser.parse_args()

    commands = {
        "recheck": cmd_recheck,
        "review-failed": cmd_review_failed,
        "rediscover": cmd_rediscover,
        "apply-override": cmd_apply_override,
    }
    return commands[args.command](args)


if __name__ == "__main__":
    raise SystemExit(main())
