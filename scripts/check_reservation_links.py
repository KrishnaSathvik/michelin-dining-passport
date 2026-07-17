#!/usr/bin/env python3
"""Manually check freshness of verified reservation URLs.

Does not auto-delete links after a single temporary failure.
Marks repeated failures for review in the report output.
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESERVATIONS_PATH = ROOT / "data" / "reservations.json"
OVERRIDES_PATH = ROOT / "data" / "reservation-overrides.json"
FAILURE_LOG = ROOT / "data" / "reservation-link-check-log.json"
USER_AGENT = (
    "MichelinDiningPassport/0.1 "
    "(reservation link checker; local development; contact: local-dev)"
)
TIMEOUT = 20
DELAY = 1.0


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def classify(http_status: int | None, error: str | None, final_url: str | None, original: str) -> str:
    if http_status in {401, 403}:
        return "authentication_required"
    if http_status == 404:
        return "permanent_not_found"
    if http_status in {429, 503}:
        return "blocked_or_rate_limited"
    if http_status and 300 <= http_status < 400:
        return "redirect"
    if http_status and 200 <= http_status < 300:
        if final_url and final_url.rstrip("/") != original.rstrip("/"):
            return "redirect"
        return "valid_page"
    if error and "timed out" in error.lower():
        return "temporary_failure"
    if http_status and 500 <= http_status < 600:
        return "temporary_failure"
    if error:
        return "temporary_failure"
    return "needs_manual_review"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    records = json.loads(RESERVATIONS_PATH.read_text(encoding="utf-8")).get("records") or {}
    overrides = {
        item["restaurantSlug"]: item
        for item in json.loads(OVERRIDES_PATH.read_text(encoding="utf-8")).get("overrides") or []
    }
    log = {"version": 1, "checks": {}}
    if FAILURE_LOG.exists():
        log = json.loads(FAILURE_LOG.read_text(encoding="utf-8"))

    targets = []
    for slug, rec in records.items():
        merged = dict(rec)
        if slug in overrides:
            for key, value in overrides[slug].items():
                if key not in {"restaurantSlug", "reason", "decidedAt"}:
                    merged[key] = value
        if merged.get("status") == "verified" and merged.get("reservationUrl"):
            targets.append((slug, merged["reservationUrl"]))

    if args.limit:
        targets = targets[: args.limit]

    print(f"Checking {len(targets)} verified reservation URLs")
    summary = defaultdict(int)

    for slug, url in targets:
        req = urllib.request.Request(
            url,
            method="GET",
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
        )
        http_status = None
        error = None
        final_url = None
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
                http_status = getattr(response, "status", 200)
                final_url = response.geturl()
        except urllib.error.HTTPError as exc:
            http_status = exc.code
            error = str(exc.reason)
        except Exception as exc:  # noqa: BLE001
            error = str(exc)

        kind = classify(http_status, error, final_url, url)
        summary[kind] += 1
        prev = log.setdefault("checks", {}).get(slug) or {"failures": 0}
        failures = int(prev.get("failures") or 0)
        if kind in {
            "temporary_failure",
            "blocked_or_rate_limited",
            "authentication_required",
            "permanent_not_found",
        }:
            failures += 1
        elif kind == "valid_page":
            failures = 0

        needs_review = failures >= 3 or kind == "permanent_not_found"
        log["checks"][slug] = {
            "url": url,
            "checkedAt": now_iso(),
            "httpStatus": http_status,
            "finalUrl": final_url,
            "result": kind,
            "error": error,
            "failures": failures,
            "needsManualReview": needs_review,
        }
        print(f"  {slug}: {kind} ({http_status})")
        time.sleep(DELAY)

    log["updatedAt"] = now_iso()
    FAILURE_LOG.write_text(json.dumps(log, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Summary:")
    for key, value in sorted(summary.items()):
        print(f"  {key}: {value}")
    review = sum(1 for item in log["checks"].values() if item.get("needsManualReview"))
    print(f"  needs_manual_review_flag: {review}")
    print("Note: temporary failures are retained; repeated failures flag review only.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
