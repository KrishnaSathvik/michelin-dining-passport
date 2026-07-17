#!/usr/bin/env python3
"""Manual review helper for reservation candidates.

Writes decisions to data/reservation-overrides.json — do not hand-edit
generated candidates as the primary workflow.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
CANDIDATES_PATH = ROOT / "data" / "reservation-candidates.json"
OVERRIDES_PATH = ROOT / "data" / "reservation-overrides.json"
RESERVATIONS_PATH = ROOT / "data" / "reservations.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def upsert_override(overrides: dict, item: dict) -> None:
    items = overrides.setdefault("overrides", [])
    items = [row for row in items if row.get("restaurantSlug") != item["restaurantSlug"]]
    items.append(item)
    overrides["overrides"] = sorted(items, key=lambda row: row["restaurantSlug"])
    overrides["updatedAt"] = now_iso()


def print_report(limit: int, needs_review_only: bool) -> None:
    restaurants = {r["slug"]: r for r in load(RESTAURANTS_PATH)["restaurants"]}
    candidates = load(CANDIDATES_PATH).get("candidates") or {}
    reservations = load(RESERVATIONS_PATH).get("records") or {}
    rows = []
    for slug, entry in candidates.items():
        record = reservations.get(slug) or {}
        if needs_review_only and record.get("status") not in {
            "needs_review",
            "unknown",
        }:
            if not entry.get("candidates"):
                continue
            if record.get("status") == "verified":
                continue
        restaurant = restaurants.get(slug) or {}
        for idx, candidate in enumerate(entry.get("candidates") or []):
            rows.append((slug, restaurant, entry, candidate, idx, record))
        if not entry.get("candidates"):
            rows.append((slug, restaurant, entry, None, -1, record))

    rows = rows[:limit] if limit else rows
    print(f"# Reservation review report ({len(rows)} rows)\n")
    for slug, restaurant, entry, candidate, idx, record in rows:
        print(f"## {restaurant.get('name', slug)} ({slug})")
        print(f"- City/state: {restaurant.get('city')}, {restaurant.get('state')}")
        print(f"- Official website: {entry.get('website')}")
        print(f"- Current status: {record.get('status')} / provider={record.get('provider')}")
        print(f"- Fetch: {entry.get('fetchStatus')} http={entry.get('httpStatus')}")
        if candidate:
            print(f"- Candidate[{idx}]: {candidate.get('finalUrl') or candidate.get('url')}")
            print(f"  provider={candidate.get('provider')} confidence={candidate.get('confidence')} score={candidate.get('score')}")
            print(f"  anchor={candidate.get('anchorText')!r}")
            print(f"  redirect/final={candidate.get('finalUrl')}")
            print(f"  http={candidate.get('httpStatus')} reasons={', '.join(candidate.get('reasons') or [])}")
        else:
            print("- No candidates discovered")
        print()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", action="store_true", help="Print review report")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--needs-review", action="store_true")
    parser.add_argument("--approve", metavar="SLUG")
    parser.add_argument("--url", help="URL for approve/manual")
    parser.add_argument("--provider", default="other")
    parser.add_argument("--reject", metavar="SLUG")
    parser.add_argument("--manual", metavar="SLUG", help="Add manual booking URL")
    parser.add_argument("--no-online", metavar="SLUG")
    parser.add_argument("--phone-only", metavar="SLUG")
    parser.add_argument("--temp-unavailable", metavar="SLUG")
    parser.add_argument("--unknown", metavar="SLUG")
    parser.add_argument("--reason", default="manual review")
    parser.add_argument("--candidate-index", type=int, default=0)
    args = parser.parse_args()

    if args.report or not any(
        [
            args.approve,
            args.reject,
            args.manual,
            args.no_online,
            args.phone_only,
            args.temp_unavailable,
            args.unknown,
        ]
    ):
        print_report(args.limit, args.needs_review)
        if args.report and not any(
            [
                args.approve,
                args.reject,
                args.manual,
                args.no_online,
                args.phone_only,
                args.temp_unavailable,
                args.unknown,
            ]
        ):
            return 0

    overrides = load(OVERRIDES_PATH)
    candidates = load(CANDIDATES_PATH).get("candidates") or {}

    def decide(slug: str, **fields):
        item = {
            "restaurantSlug": slug,
            "reason": args.reason,
            "decidedAt": now_iso(),
            **fields,
        }
        upsert_override(overrides, item)
        save(OVERRIDES_PATH, overrides)
        print(f"Wrote override for {slug}: {fields.get('status')}")

    if args.approve:
        entry = candidates.get(args.approve) or {}
        cand_list = entry.get("candidates") or []
        url = args.url
        provider = args.provider
        if not url:
            if not cand_list:
                print("No candidate URL; pass --url")
                return 1
            candidate = cand_list[args.candidate_index]
            url = candidate.get("finalUrl") or candidate.get("url")
            provider = candidate.get("provider") or provider
        decide(
            args.approve,
            reservationUrl=url,
            provider=provider,
            status="verified",
            sourceType="manual_verification",
            confidence="high",
            verifiedAt=now_iso(),
            sourceUrl=entry.get("website"),
            notes=args.reason,
        )
        return 0

    if args.manual:
        if not args.url:
            print("--manual requires --url")
            return 1
        decide(
            args.manual,
            reservationUrl=args.url,
            provider=args.provider,
            status="verified",
            sourceType="manual_verification",
            confidence="high",
            verifiedAt=now_iso(),
            notes=args.reason,
        )
        return 0

    if args.reject:
        decide(
            args.reject,
            reservationUrl=None,
            provider="none",
            status="unknown",
            confidence="low",
            verifiedAt=None,
            notes=f"Rejected: {args.reason}",
        )
        return 0

    if args.no_online:
        decide(
            args.no_online,
            reservationUrl=None,
            provider="none",
            status="no_online_booking",
            confidence="high",
            verifiedAt=now_iso(),
            sourceType="manual_verification",
            notes=args.reason,
        )
        return 0

    if args.phone_only:
        decide(
            args.phone_only,
            reservationUrl=None,
            provider="none",
            status="phone_only",
            confidence="high",
            verifiedAt=now_iso(),
            sourceType="manual_verification",
            notes=args.reason,
        )
        return 0

    if args.temp_unavailable:
        decide(
            args.temp_unavailable,
            status="temporarily_unavailable",
            confidence="medium",
            verifiedAt=None,
            notes=args.reason,
        )
        return 0

    if args.unknown:
        decide(
            args.unknown,
            reservationUrl=None,
            provider="none",
            status="unknown",
            confidence="low",
            verifiedAt=None,
            notes=args.reason,
        )
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
