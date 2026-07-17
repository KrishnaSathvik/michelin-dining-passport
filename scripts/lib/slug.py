"""Deterministic slug helpers shared by import and validation."""

from __future__ import annotations

import re
import unicodedata


def ascii_fold(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def slugify(value: str) -> str:
    folded = ascii_fold(value).lower().strip()
    folded = folded.replace("&", " and ")
    folded = re.sub(r"[^a-z0-9]+", "-", folded)
    return folded.strip("-")


def state_slug(state: str, state_code: str) -> str:
    if state_code.upper() == "DC" or "washington" in state.lower() and "d.c" in state.lower():
        return "washington-dc"
    return slugify(state)


def city_slug(city: str) -> str:
    return slugify(city)


def cuisine_slug(cuisine: str) -> str:
    return slugify(cuisine)


def restaurant_slug(name: str, city: str, state_code: str) -> str:
    base = slugify(name)
    with_city = f"{base}-{slugify(city)}"
    with_state = f"{with_city}-{state_code.lower()}"
    return with_state
