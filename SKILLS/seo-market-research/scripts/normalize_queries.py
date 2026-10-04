#!/usr/bin/env python3
"""Normalize and provenance-merge query JSONL records."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from _common import normalize_query, read_jsonl, stable_id, unique_strings, write_jsonl

LIST_FIELDS = ["source_ids", "discovery_methods", "product_line_ids", "buyer_ids", "buying_job_ids"]


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Normalize and deduplicate query records")
    result.add_argument("--input", required=True, type=Path)
    result.add_argument("--output", required=True, type=Path)
    result.add_argument("--default-language", default="UNKNOWN")
    result.add_argument("--default-country", default="UNKNOWN")
    return result


def merged_record(record: dict[str, Any], language: str, country: str) -> dict[str, Any]:
    query = str(record.get("query", "")).strip()
    if not query:
        raise ValueError("query must be a non-empty string")
    normalized = normalize_query(query)
    if not normalized:
        raise ValueError(f"query normalizes to empty: {query!r}")
    actual_language = str(record.get("language") or language)
    actual_country = str(record.get("country") or country).upper()
    return {
        "query_id": record.get("query_id") or stable_id("qry", normalized, actual_language, actual_country),
        "query": query,
        "original_queries": [query],
        "normalized_query": normalized,
        "language": actual_language,
        "country": actual_country,
        "product_line_ids": unique_strings(record.get("product_line_ids", [])),
        "buyer_ids": unique_strings(record.get("buyer_ids", [])),
        "buying_job_ids": unique_strings(record.get("buying_job_ids", [])),
        "discovery_methods": unique_strings(record.get("discovery_methods", [])),
        "source_ids": unique_strings(record.get("source_ids", [])),
        "hypothesis_status": str(record.get("hypothesis_status") or "GENERATED"),
        "notes": unique_strings(record.get("notes", [])),
    }


def main() -> int:
    args = parser().parse_args()
    merged: dict[tuple[str, str, str], dict[str, Any]] = {}
    statuses: dict[tuple[str, str, str], set[str]] = {}
    for source in read_jsonl(args.input):
        record = merged_record(source, args.default_language, args.default_country)
        key = (record["normalized_query"], record["language"], record["country"])
        statuses.setdefault(key, set()).add(record["hypothesis_status"])
        if key not in merged:
            merged[key] = record
            continue
        target = merged[key]
        target["original_queries"] = unique_strings(target["original_queries"] + record["original_queries"])
        for field in LIST_FIELDS + ["notes"]:
            target[field] = unique_strings(target[field] + record[field])

    output: list[dict[str, Any]] = []
    for key in sorted(merged):
        record = merged[key]
        observed_statuses = sorted(statuses[key])
        record["hypothesis_status"] = observed_statuses[0] if len(observed_statuses) == 1 else "UNRESOLVED"
        record["observed_statuses"] = observed_statuses
        output.append(record)
    write_jsonl(args.output, output)
    print(f"normalized {len(read_jsonl(args.input))} records into {len(output)} unique queries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
