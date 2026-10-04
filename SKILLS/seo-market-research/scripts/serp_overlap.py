#!/usr/bin/env python3
"""Compute reviewable page-ownership signals from SERP snapshot JSONL."""

from __future__ import annotations

import argparse
import itertools
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

from _common import canonical_url, rank_weight, read_jsonl, stable_id, unique_strings, write_jsonl


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Calculate pairwise SERP URL overlap")
    result.add_argument("--input", required=True, type=Path)
    result.add_argument("--output", required=True, type=Path)
    result.add_argument("--result-depth", type=int, default=10)
    result.add_argument("--same-page-min-shared", type=int, default=3)
    result.add_argument("--same-page-min-weighted", type=float, default=0.35)
    result.add_argument("--review-min-shared", type=int, default=1)
    return result


def snapshot_urls(snapshot: dict[str, Any], depth: int) -> dict[str, int]:
    urls: dict[str, int] = {}
    for result in snapshot.get("results", []):
        if result.get("result_type", "ORGANIC") != "ORGANIC":
            continue
        rank = int(result.get("rank", 9999))
        if rank > depth:
            continue
        raw_url = result.get("normalized_url") or result.get("url")
        if not raw_url:
            continue
        url = canonical_url(str(raw_url))
        urls[url] = min(rank, urls.get(url, rank))
    return urls


def weighted_jaccard(left: dict[str, int], right: dict[str, int]) -> float:
    union = set(left) | set(right)
    if not union:
        return 0.0
    numerator = sum(min(rank_weight(left.get(url, 10_000)), rank_weight(right.get(url, 10_000))) for url in union)
    denominator = sum(max(rank_weight(left.get(url, 10_000)), rank_weight(right.get(url, 10_000))) for url in union)
    return numerator / denominator if denominator else 0.0


def compatibility(left: dict[str, Any], right: dict[str, Any], field: str) -> tuple[bool | None, str | None]:
    first = left.get(field)
    second = right.get(field)
    if first in (None, "", "UNKNOWN", "UNRESOLVED", "MIXED") or second in (None, "", "UNKNOWN", "UNRESOLVED", "MIXED"):
        return None, None
    if isinstance(first, list) or isinstance(second, list):
        first_set = set(first if isinstance(first, list) else [first])
        second_set = set(second if isinstance(second, list) else [second])
        matches = bool(first_set & second_set)
    else:
        matches = first == second
    return matches, None if matches else f"{field}: {first!r} != {second!r}"


def make_edge(left: dict[str, Any], right: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    left_urls = snapshot_urls(left, args.result_depth)
    right_urls = snapshot_urls(right, args.result_depth)
    shared_urls = sorted(set(left_urls) & set(right_urls))
    union_urls = set(left_urls) | set(right_urls)
    jaccard = len(shared_urls) / len(union_urls) if union_urls else 0.0
    weighted = weighted_jaccard(left_urls, right_urls)
    left_domains = {urlsplit(url).hostname for url in left_urls}
    right_domains = {urlsplit(url).hostname for url in right_urls}

    checks: dict[str, bool | None] = {}
    conflicts: list[str] = []
    for field in ["serp_goal_intent", "dominant_page_type", "product_line_ids", "manufacturing_process_ids"]:
        matches, reason = compatibility(left, right, field)
        checks[field] = matches
        if reason:
            conflicts.append(reason)

    comparable = all(
        left.get(field) == right.get(field)
        for field in ["engine", "country", "language", "device"]
        if left.get(field) is not None and right.get(field) is not None
    )
    if not comparable:
        conflicts.append("snapshot search contexts differ")

    if conflicts:
        edge_type = "SEPARATE_CANDIDATE"
    elif len(shared_urls) >= args.same_page_min_shared and weighted >= args.same_page_min_weighted:
        edge_type = "SAME_PAGE_CANDIDATE"
    elif len(shared_urls) >= args.review_min_shared:
        edge_type = "REVIEW"
    else:
        edge_type = "SEPARATE_CANDIDATE"

    completeness = [left.get("completeness", "UNKNOWN"), right.get("completeness", "UNKNOWN")]
    confidence = "HIGH" if completeness == ["COMPLETE", "COMPLETE"] and comparable else "MEDIUM"
    if "PARTIAL" in completeness or "UNKNOWN" in completeness:
        confidence = "LOW"

    query_a = str(left["query_id"])
    query_b = str(right["query_id"])
    return {
        "overlap_edge_id": stable_id("edge", *sorted([query_a, query_b])),
        "query_a": query_a,
        "query_b": query_b,
        "serp_snapshot_ids": [left.get("serp_snapshot_id"), right.get("serp_snapshot_id")],
        "shared_url_count": len(shared_urls),
        "url_jaccard": round(jaccard, 6),
        "rank_weighted_overlap": round(weighted, 6),
        "shared_domain_count": len(left_domains & right_domains),
        "shared_urls": shared_urls,
        "compatibility": checks,
        "conflicts": conflicts,
        "edge_type": edge_type,
        "configuration": {
            "result_depth": args.result_depth,
            "same_page_min_shared": args.same_page_min_shared,
            "same_page_min_weighted": args.same_page_min_weighted,
            "review_min_shared": args.review_min_shared,
            "status": "REQUIRES_HUMAN_REVIEW",
        },
        "source_ids": unique_strings(left.get("source_ids", []) + right.get("source_ids", [])),
        "claim_type": "INFERENCE",
        "confidence": {"level": confidence, "reason": "Based on snapshot completeness and search-context comparability."},
    }


def main() -> int:
    args = parser().parse_args()
    if args.result_depth < 1 or args.same_page_min_shared < 1 or not 0 <= args.same_page_min_weighted <= 1:
        raise SystemExit("invalid overlap configuration")
    snapshots = read_jsonl(args.input)
    for snapshot in snapshots:
        if not snapshot.get("query_id"):
            raise SystemExit("every snapshot requires query_id")
    edges = [make_edge(left, right, args) for left, right in itertools.combinations(snapshots, 2)]
    write_jsonl(args.output, edges)
    print(f"computed {len(edges)} pairwise edges from {len(snapshots)} snapshots")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
