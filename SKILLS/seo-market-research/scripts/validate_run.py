#!/usr/bin/env python3
"""Validate an SEO market research run and its output contract."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

from _common import CLAIM_TYPES, MISSING_STATES, RETRIEVAL_STATES, read_jsonl

REQUIRED_FILES = [
    "RUN.md",
    "run-manifest.json",
    "sources/ledger.jsonl",
    "evidence/business-context.md",
    "evidence/hypothesis-register.md",
    "evidence/market-map.md",
    "evidence/buyer-evidence.md",
    "evidence/competitor-map.md",
    "evidence/query-universe.jsonl",
    "evidence/keyword-intelligence.jsonl",
    "evidence/serp-snapshots.jsonl",
    "evidence/overlap-edges.jsonl",
    "analysis/intent-decisions.jsonl",
    "analysis/clusters.json",
    "analysis/cluster-quality.json",
    "analysis/opportunities.jsonl",
    "analysis/buyer-job-map.jsonl",
    "deliverables/RESEARCH-REPORT.md",
    "deliverables/page-map.json",
    "deliverables/page-map.md",
    "deliverables/ia-proposal.md",
]
PHASE_STATES = {"NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETE"}
ID_PATTERN = re.compile(r"^(src|qry|serp|clu|page|buyer|job|edge|comp|ent|hyp|run)_[A-Za-z0-9_-]+$")


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)


def load_json(path: Path, report: Report) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        report.error(f"invalid JSON {path}: {exc}")
        return None


def record_id(record: dict[str, Any]) -> str | None:
    for key, value in record.items():
        if key == "id" or key.endswith("_id"):
            if isinstance(value, str):
                return value
    return None


def inspect_record(record: dict[str, Any], label: str, source_ids: set[str], report: Report) -> None:
    identifier = record_id(record)
    if identifier and not ID_PATTERN.match(identifier):
        report.error(f"{label}: invalid stable ID {identifier!r}")
    claim_type = record.get("claim_type")
    if claim_type is not None and claim_type not in CLAIM_TYPES:
        report.error(f"{label}: invalid claim_type {claim_type!r}")
    retrieval = record.get("retrieval_status")
    if retrieval is not None and retrieval not in RETRIEVAL_STATES:
        report.error(f"{label}: invalid retrieval_status {retrieval!r}")
    for key, value in record.items():
        if isinstance(value, str) and value.endswith("_API") and value not in MISSING_STATES:
            report.warn(f"{label}: unfamiliar missing-state-like value {key}={value!r}")
    references = record.get("source_ids", [])
    if references is not None and not isinstance(references, list):
        report.error(f"{label}: source_ids must be an array")
    elif isinstance(references, list):
        for reference in references:
            if reference not in source_ids:
                report.error(f"{label}: unknown source_id {reference!r}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate an SEO market research run")
    parser.add_argument("run_directory", type=Path)
    args = parser.parse_args()
    root = args.run_directory.resolve()
    report = Report()

    for relative in REQUIRED_FILES:
        if not (root / relative).is_file():
            report.error(f"missing required file: {relative}")
    if report.errors:
        for message in report.errors:
            print(f"ERROR {message}")
        return 1

    manifest = load_json(root / "run-manifest.json", report)
    if isinstance(manifest, dict):
        for field in ["run_id", "schema_version", "pipeline_version", "project_id", "scope", "search_context", "phase_status", "created_at"]:
            if field not in manifest:
                report.error(f"manifest missing {field}")
        context = manifest.get("search_context", {})
        for field in ["engine", "country", "language", "device"]:
            if not context.get(field):
                report.error(f"manifest search_context missing {field}")
        for phase, state in manifest.get("phase_status", {}).items():
            if state.get("status") not in PHASE_STATES:
                report.error(f"phase {phase}: invalid status {state.get('status')!r}")

    ledger_path = root / "sources/ledger.jsonl"
    try:
        ledger = read_jsonl(ledger_path)
    except (OSError, ValueError) as exc:
        report.error(str(exc))
        ledger = []
    source_ids: set[str] = set()
    for index, record in enumerate(ledger, 1):
        source_id = record.get("source_id")
        if not isinstance(source_id, str) or not source_id.startswith("src_"):
            report.error(f"sources/ledger.jsonl:{index}: missing valid source_id")
        elif source_id in source_ids:
            report.error(f"sources/ledger.jsonl:{index}: duplicate source_id {source_id}")
        else:
            source_ids.add(source_id)
        inspect_record(record, f"sources/ledger.jsonl:{index}", source_ids | {str(source_id)}, report)

    for path in sorted(root.rglob("*.jsonl")):
        if path == ledger_path:
            continue
        try:
            records = read_jsonl(path)
        except (OSError, ValueError) as exc:
            report.error(str(exc))
            continue
        for index, record in enumerate(records, 1):
            inspect_record(record, f"{path.relative_to(root)}:{index}", source_ids, report)

    for path in sorted(root.rglob("*.json")):
        load_json(path, report)

    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() == ".csv":
            try:
                path.relative_to(root / "sources" / "raw")
            except ValueError:
                report.error(f"CSV output is forbidden outside sources/raw: {path.relative_to(root)}")

    phase12 = manifest.get("phase_status", {}).get("qa_handoff", {}).get("status") if isinstance(manifest, dict) else None
    generated = [
        root / "deliverables/RESEARCH-REPORT.html",
        root / "deliverables/page-map.html",
        root / "deliverables/ia-proposal.html",
    ]
    for path in generated:
        if not path.exists():
            if phase12 == "COMPLETE":
                report.error(f"completed QA phase requires generated view: {path.relative_to(root)}")
            else:
                report.warn(f"generated view not present yet: {path.relative_to(root)}")
        elif "Generated view:" not in path.read_text(encoding="utf-8"):
            report.error(f"HTML lacks generated-file notice: {path.relative_to(root)}")

    for message in report.warnings:
        print(f"WARN  {message}")
    for message in report.errors:
        print(f"ERROR {message}")
    print(f"summary: {len(report.errors)} error(s), {len(report.warnings)} warning(s)")
    return 1 if report.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
