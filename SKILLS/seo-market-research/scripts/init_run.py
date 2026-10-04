#!/usr/bin/env python3
"""Initialize a self-describing SEO market research run."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from _common import stable_id, utc_now

PHASES = [
    "contract",
    "market_offering",
    "buyers_jobs",
    "competitors",
    "query_universe",
    "keyword_intelligence",
    "serp_intent",
    "page_ownership",
    "opportunity",
    "buyer_job_map",
    "page_map",
    "information_architecture",
    "qa_handoff",
]


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Initialize an SEO market research run")
    result.add_argument("--output", required=True, type=Path)
    result.add_argument("--project-id", required=True)
    result.add_argument("--scope", required=True)
    result.add_argument("--country", required=True)
    result.add_argument("--language", required=True)
    result.add_argument("--engine", default="google")
    result.add_argument("--device", choices=["desktop", "mobile", "tablet"], default="desktop")
    result.add_argument("--product-line", action="append", required=True, dest="product_lines")
    result.add_argument("--serp-freshness-days", type=int, default=30)
    return result


def render_template(name: str, replacements: dict[str, str]) -> str:
    template = Path(__file__).resolve().parent.parent / "assets" / "templates" / name
    text = template.read_text(encoding="utf-8")
    for key, value in replacements.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def main() -> int:
    args = parser().parse_args()
    country = args.country.upper()
    if not re.fullmatch(r"[A-Z]{2}", country):
        raise SystemExit("--country must be a two-letter ISO-style country code")
    if args.serp_freshness_days < 1:
        raise SystemExit("--serp-freshness-days must be positive")

    output = args.output.resolve()
    if output.exists() and any(output.iterdir()):
        raise SystemExit(f"refusing to initialize non-empty directory: {output}")

    for directory in [
        "sources/raw",
        "evidence",
        "analysis",
        "deliverables/page-brief-inputs",
    ]:
        (output / directory).mkdir(parents=True, exist_ok=True)

    created_at = utc_now()
    run_id = stable_id("run", args.project_id, args.scope, country, args.language, created_at)
    manifest = {
        "run_id": run_id,
        "schema_version": "0.1",
        "pipeline_version": "0.1",
        "project_id": args.project_id,
        "scope": {"label": args.scope, "product_lines": args.product_lines},
        "search_context": {
            "engine": args.engine,
            "country": country,
            "location": "UNKNOWN",
            "language": args.language,
            "device": args.device,
        },
        "profile": {"version": "NOT_AVAILABLE", "hash": "NOT_AVAILABLE", "overrides": []},
        "providers": [],
        "cost_policy": {"currency": "USD", "budget": "UNKNOWN", "approval_threshold": "UNKNOWN", "actual_cost": 0},
        "serp_freshness_days": args.serp_freshness_days,
        "clustering_config": {
            "result_depth": 10,
            "same_page_min_shared": 3,
            "same_page_min_rank_weighted": 0.35,
            "status": "UNAPPROVED_DEFAULTS",
        },
        "scoring_config": {"weights": "NOT_AVAILABLE", "status": "NOT_CONFIGURED"},
        "phase_status": {
            phase: {
                "status": "IN_PROGRESS" if index == 0 else "NOT_STARTED",
                "input_hashes": {},
                "outputs": [],
                "completed_at": None,
                "limitations": [],
            }
            for index, phase in enumerate(PHASES)
        },
        "created_at": created_at,
    }
    (output / "run-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    product_lines = "\n".join(f"- {line}" for line in args.product_lines)
    replacements = {
        "RUN_ID": run_id,
        "PROJECT_ID": args.project_id,
        "SCOPE": args.scope,
        "ENGINE": args.engine,
        "COUNTRY": country,
        "LANGUAGE": args.language,
        "DEVICE": args.device,
        "CREATED_AT": created_at,
        "PRODUCT_LINES": product_lines,
    }
    (output / "RUN.md").write_text(render_template("RUN.md", replacements), encoding="utf-8")

    template_targets = {
        "business-context.md": "evidence/business-context.md",
        "hypothesis-register.md": "evidence/hypothesis-register.md",
        "market-map.md": "evidence/market-map.md",
        "buyer-evidence.md": "evidence/buyer-evidence.md",
        "competitor-map.md": "evidence/competitor-map.md",
        "RESEARCH-REPORT.md": "deliverables/RESEARCH-REPORT.md",
    }
    for template_name, target_name in template_targets.items():
        (output / target_name).write_text(render_template(template_name, replacements), encoding="utf-8")

    for relative in [
        "sources/ledger.jsonl",
        "evidence/query-universe.jsonl",
        "evidence/keyword-intelligence.jsonl",
        "evidence/serp-snapshots.jsonl",
        "evidence/overlap-edges.jsonl",
        "analysis/intent-decisions.jsonl",
        "analysis/opportunities.jsonl",
        "analysis/buyer-job-map.jsonl",
    ]:
        (output / relative).write_text("", encoding="utf-8")

    for relative, key in [
        ("analysis/clusters.json", "clusters"),
        ("analysis/cluster-quality.json", "cluster_quality"),
        ("deliverables/page-map.json", "pages"),
    ]:
        (output / relative).write_text(json.dumps({"schema_version": "0.1", key: []}, indent=2) + "\n", encoding="utf-8")

    (output / "deliverables/page-map.md").write_text("# Page Map\n\nNo page decisions yet.\n", encoding="utf-8")
    (output / "deliverables/ia-proposal.md").write_text("# Information Architecture Proposal\n\nNo IA decision yet.\n", encoding="utf-8")
    print(f"initialized {run_id} at {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
