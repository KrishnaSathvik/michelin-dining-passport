"""Normalization helpers for restaurant identity matching."""

from __future__ import annotations

import re
import unicodedata


def ascii_fold(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    folded = ascii_fold(str(value)).lower().strip()
    folded = folded.replace("&", " and ")
    folded = re.sub(r"[^\w\s]", " ", folded)
    folded = re.sub(r"\s+", " ", folded).strip()
    return folded


def normalize_url(value: str | None) -> str:
    if not value:
        return ""
    url = str(value).strip().lower()
    url = url.rstrip("/")
    url = re.sub(r"^https?://(www\.)?", "https://", url)
    return url


def normalize_address(value: str | None) -> str:
    text = normalize_text(value)
    text = re.sub(r"\b(united states|usa|us)\b", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
