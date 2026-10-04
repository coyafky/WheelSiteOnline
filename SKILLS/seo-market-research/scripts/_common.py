#!/usr/bin/env python3
"""Shared deterministic helpers for the SEO market research skill."""

from __future__ import annotations

import hashlib
import json
import math
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

MISSING_STATES = {"UNKNOWN", "NOT_AVAILABLE", "REQUIRES_API"}
CLAIM_TYPES = {"FACT", "INFERENCE", "RECOMMENDATION"}
RETRIEVAL_STATES = {"OK", "PARTIAL", "SPARSE", "BLOCKED", "TOOL_ERROR", "NOT_RUN"}
TRACKING_PARAMS = {"gclid", "fbclid", "msclkid", "dclid"}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def stable_id(prefix: str, *parts: str, length: int = 12) -> str:
    payload = "\x1f".join(parts).encode("utf-8")
    return f"{prefix}_{hashlib.sha256(payload).hexdigest()[:length]}"


def normalize_query(value: str) -> str:
    text = unicodedata.normalize("NFKC", value).casefold()
    text = re.sub(r"[\u2010-\u2015\u2212]", "-", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text.strip(" \t\r\n,.;:!?\u2026")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    if not path.exists():
        raise FileNotFoundError(path)
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{line_number}: invalid JSON: {exc.msg}") from exc
        if not isinstance(value, dict):
            raise ValueError(f"{path}:{line_number}: each JSONL line must be an object")
        records.append(value)
    return records


def write_jsonl(path: Path, records: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = "".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records)
    path.write_text(content, encoding="utf-8")


def unique_strings(values: Iterable[Any]) -> list[str]:
    return sorted({str(value) for value in values if value not in (None, "")})


def canonical_url(value: str) -> str:
    """Canonicalize a URL for analysis without changing a public URL."""
    split = urlsplit(value.strip())
    scheme = split.scheme.lower() or "https"
    hostname = (split.hostname or "").lower()
    port = split.port
    if port and not ((scheme == "http" and port == 80) or (scheme == "https" and port == 443)):
        hostname = f"{hostname}:{port}"
    path = re.sub(r"/{2,}", "/", split.path or "/")
    if path != "/":
        path = path.rstrip("/")
    query = []
    for key, item in parse_qsl(split.query, keep_blank_values=True):
        lowered = key.casefold()
        if lowered.startswith("utm_") or lowered in TRACKING_PARAMS:
            continue
        query.append((key, item))
    return urlunsplit((scheme, hostname, path, urlencode(sorted(query)), ""))


def rank_weight(rank: int) -> float:
    return 1.0 / math.log2(rank + 1)
