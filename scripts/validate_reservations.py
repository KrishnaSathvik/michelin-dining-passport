#!/usr/bin/env python3
"""Validate reservation records, overrides, and publish rules."""

from __future__ import annotations

import json
import re
import sys
import urllib.parse
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESTAURANTS_PATH = ROOT / "data" / "restaurants.json"
RESERVATIONS_PATH = ROOT / "data" / "reservations.json"
OVERRIDES_PATH = ROOT / "data" / "reservation-overrides.json"
CANDIDATES_PATH = ROOT / "data" / "reservation-candidates.json"

VALID_STATUS = {
    "verified",
    "needs_review",
    "no_online_booking",
    "phone_only",
    "temporarily_unavailable",
    "unknown",
}
VALID_PROVIDER = {
    "resy",
    "tock",
    "opentable",
    "sevenrooms",
    "restaurant_direct",
    "michelin",
    "other",
    "none",
}
PROVIDER_HOSTS = {
    "resy": "resy.com",
    "tock": "exploretock.com",
    "opentable": "opentable.com",
    "sevenrooms": "sevenrooms.com",
    "michelin": "guide.michelin.com",
}
LOCAL_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0"}
TRACKING = re.compile(r"(utm_|gclid|fbclid|token=|session=|auth=)", re.I)


def classify_provider(url: str) -> str | None:
    try:
        host = (urllib.parse.urlsplit(url).hostname or "").lower()
    except ValueError:
        return None
    for provider, needle in PROVIDER_HOSTS.items():
        if host == needle or host.endswith("." + needle) or needle in host:
            if provider == "tock" and "exploretock.com" not in host and "tock" not in host:
                continue
            return provider
    return None


def main() -> int:
    restaurants = json.loads(RESTAURANTS_PATH.read_text(encoding="utf-8"))["restaurants"]
    reservations = json.loads(RESERVATIONS_PATH.read_text(encoding="utf-8"))
    overrides = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8"))
    candidates = json.loads(CANDIDATES_PATH.read_text(encoding="utf-8"))
    records = reservations.get("records") or {}
    slugs = {item["slug"] for item in restaurants}
    errors: list[str] = []

    if len(restaurants) != 271:
        errors.append(f"Expected 271 restaurants, found {len(restaurants)}")

    missing = [slug for slug in slugs if slug not in records]
    if missing:
        errors.append(f"Missing reservation records for {len(missing)} restaurants")

    extra = set(records) - slugs
    if extra:
        errors.append(f"Unexpected reservation slugs: {sorted(extra)[:5]}")

    seen_urls: dict[str, str] = {}
    status_counts: Counter[str] = Counter()
    provider_counts: Counter[str] = Counter()

    for slug, rec in records.items():
        status_counts[str(rec.get("status"))] += 1
        provider_counts[str(rec.get("provider"))] += 1

        if rec.get("restaurantSlug") != slug:
            errors.append(f"{slug}: restaurantSlug mismatch")
        if rec.get("status") not in VALID_STATUS:
            errors.append(f"{slug}: invalid status")
        if rec.get("provider") not in VALID_PROVIDER:
            errors.append(f"{slug}: invalid provider")

        url = rec.get("reservationUrl")
        if url is None:
            if rec.get("status") == "verified":
                errors.append(f"{slug}: verified without URL")
            continue

        if not isinstance(url, str):
            errors.append(f"{slug}: reservationUrl must be string or null")
            continue

        try:
            parsed = urllib.parse.urlsplit(url)
        except ValueError:
            errors.append(f"{slug}: invalid URL syntax")
            continue

        if parsed.scheme not in {"https", "http"}:
            errors.append(f"{slug}: URL must be http(s)")
        elif parsed.scheme != "https":
            errors.append(f"{slug}: non-HTTPS URL requires documented exception")

        host = (parsed.hostname or "").lower()
        if host in LOCAL_HOSTS or host.endswith(".local") or host.endswith(".test"):
            errors.append(f"{slug}: local/test URL not allowed")

        if TRACKING.search(url):
            errors.append(f"{slug}: tracking or credential-like params must not persist")

        if slug in seen_urls and seen_urls[slug] != url:
            pass
        # Duplicate verified URLs across restaurants are allowed (group booking pages)
        # but duplicate records for same slug are not.
        seen_urls[slug] = url

        if rec.get("status") == "verified":
            if not rec.get("verifiedAt"):
                errors.append(f"{slug}: verified records require verifiedAt")
            if rec.get("confidence") == "low":
                errors.append(f"{slug}: low-confidence must not be verified")
            expected = classify_provider(url)
            provider = rec.get("provider")
            if expected and provider in PROVIDER_HOSTS and provider != expected:
                # tock host check is fuzzy; allow restaurant_direct/other freely
                if not (provider == "tock" and "tock" in host):
                    errors.append(
                        f"{slug}: provider {provider} does not match host {host}"
                    )

    if not isinstance(overrides.get("overrides"), list):
        errors.append("reservation-overrides.json must contain overrides array")
    else:
        override_slugs = [item.get("restaurantSlug") for item in overrides["overrides"]]
        if len(override_slugs) != len(set(override_slugs)):
            errors.append("Duplicate override restaurantSlug values")
        for item in overrides["overrides"]:
            if item.get("restaurantSlug") not in slugs:
                errors.append(f"Override for unknown slug {item.get('restaurantSlug')}")

    if not isinstance(candidates.get("candidates"), dict):
        errors.append("reservation-candidates.json must contain candidates object")

    print("Reservation validation")
    print(f"  restaurants: {len(restaurants)}")
    print(f"  reservation records: {len(records)}")
    for key in sorted(status_counts):
        print(f"  status.{key}: {status_counts[key]}")
    verified_providers = Counter(
        str(rec.get("provider"))
        for rec in records.values()
        if rec.get("status") == "verified"
    )
    print(f"  verified: {status_counts.get('verified', 0)}")
    for key, value in verified_providers.most_common():
        print(f"  verified.{key}: {value}")
    print(f"  overrides: {len(overrides.get('overrides') or [])}")
    print(f"  candidate restaurants: {len(candidates.get('candidates') or {})}")

    if errors:
        print("FAILED:")
        for error in errors[:50]:
            print(f"  - {error}")
        if len(errors) > 50:
            print(f"  ... and {len(errors) - 50} more")
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
