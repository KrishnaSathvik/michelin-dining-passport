"""Stable restaurant identity matching for roster updates."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from lib.normalize import normalize_address, normalize_text, normalize_url


def load_identity_overrides(path: Path) -> dict[str, str]:
    """
    Map incoming keys -> existing canonical slug.

    Supported keys in each override:
    - incomingMichelinGuideUrl
    - incomingSlug
    - incomingNameCityState
    - incomingNameAddress
    """
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    mapping: dict[str, str] = {}
    for item in payload.get("overrides") or []:
        target = item.get("canonicalSlug")
        if not target:
            continue
        for key_name in (
            "incomingMichelinGuideUrl",
            "incomingSlug",
            "incomingNameCityState",
            "incomingNameAddress",
        ):
            value = item.get(key_name)
            if value:
                mapping[f"{key_name}:{value}"] = target
    return mapping


def name_city_state_key(restaurant: dict[str, Any]) -> str:
    return "|".join(
        [
            normalize_text(restaurant.get("name")),
            normalize_text(restaurant.get("city")),
            normalize_text(restaurant.get("stateCode") or restaurant.get("state")),
        ]
    )


def name_address_key(restaurant: dict[str, Any]) -> str:
    return "|".join(
        [
            normalize_text(restaurant.get("name")),
            normalize_address(restaurant.get("address")),
        ]
    )


class IdentityIndex:
    def __init__(self, restaurants: list[dict[str, Any]], overrides: dict[str, str]):
        self.by_slug = {r["slug"]: r for r in restaurants}
        self.by_url: dict[str, list[str]] = {}
        self.by_name_city_state: dict[str, list[str]] = {}
        self.by_name_address: dict[str, list[str]] = {}
        self.overrides = overrides

        for restaurant in restaurants:
            url = normalize_url(restaurant.get("michelinGuideUrl"))
            if url:
                self.by_url.setdefault(url, []).append(restaurant["slug"])
            ncs = name_city_state_key(restaurant)
            self.by_name_city_state.setdefault(ncs, []).append(restaurant["slug"])
            na = name_address_key(restaurant)
            self.by_name_address.setdefault(na, []).append(restaurant["slug"])

    def match(self, incoming: dict[str, Any]) -> dict[str, Any]:
        """
        Match order:
        1. Michelin Guide URL
        2. Stable existing slug
        3. Normalized name + city + state
        4. Normalized name + address
        5. Manual mapping file
        """
        candidates: list[tuple[str, str]] = []
        ambiguous = False

        url = normalize_url(incoming.get("michelinGuideUrl"))
        override_url = self.overrides.get(f"incomingMichelinGuideUrl:{url}")
        if override_url and override_url in self.by_slug:
            return {
                "matchedSlug": override_url,
                "method": "manual_override_url",
                "ambiguous": False,
                "candidates": [override_url],
            }

        if url and url in self.by_url:
            slugs = self.by_url[url]
            if len(slugs) == 1:
                return {
                    "matchedSlug": slugs[0],
                    "method": "michelin_guide_url",
                    "ambiguous": False,
                    "candidates": slugs,
                }
            candidates.extend(("michelin_guide_url", s) for s in slugs)
            ambiguous = True

        slug = incoming.get("slug") or ""
        override_slug = self.overrides.get(f"incomingSlug:{slug}")
        if override_slug and override_slug in self.by_slug:
            return {
                "matchedSlug": override_slug,
                "method": "manual_override_slug",
                "ambiguous": False,
                "candidates": [override_slug],
            }
        if slug in self.by_slug:
            return {
                "matchedSlug": slug,
                "method": "stable_slug",
                "ambiguous": False,
                "candidates": [slug],
            }

        ncs = name_city_state_key(incoming)
        override_ncs = self.overrides.get(f"incomingNameCityState:{ncs}")
        if override_ncs and override_ncs in self.by_slug:
            return {
                "matchedSlug": override_ncs,
                "method": "manual_override_name_city_state",
                "ambiguous": False,
                "candidates": [override_ncs],
            }
        if ncs in self.by_name_city_state:
            slugs = self.by_name_city_state[ncs]
            if len(slugs) == 1 and not ambiguous:
                return {
                    "matchedSlug": slugs[0],
                    "method": "name_city_state",
                    "ambiguous": False,
                    "candidates": slugs,
                }
            candidates.extend(("name_city_state", s) for s in slugs)
            if len(slugs) > 1:
                ambiguous = True

        na = name_address_key(incoming)
        override_na = self.overrides.get(f"incomingNameAddress:{na}")
        if override_na and override_na in self.by_slug:
            return {
                "matchedSlug": override_na,
                "method": "manual_override_name_address",
                "ambiguous": False,
                "candidates": [override_na],
            }
        if na in self.by_name_address:
            slugs = self.by_name_address[na]
            if len(slugs) == 1 and not ambiguous:
                return {
                    "matchedSlug": slugs[0],
                    "method": "name_address",
                    "ambiguous": False,
                    "candidates": slugs,
                }
            candidates.extend(("name_address", s) for s in slugs)
            if len(slugs) > 1:
                ambiguous = True

        unique_slugs = sorted({slug for _, slug in candidates})
        if len(unique_slugs) == 1 and not ambiguous:
            method = candidates[0][0]
            return {
                "matchedSlug": unique_slugs[0],
                "method": method,
                "ambiguous": False,
                "candidates": unique_slugs,
            }

        return {
            "matchedSlug": None,
            "method": "unmatched" if not unique_slugs else "ambiguous",
            "ambiguous": bool(unique_slugs),
            "candidates": unique_slugs,
        }
