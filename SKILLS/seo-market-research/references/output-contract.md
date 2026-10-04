# Output Contract

## Layers

- Markdown is canonical for human review, narratives, decisions, and approvals.
- HTML is regenerated from reviewed Markdown/records and is never independently authoritative.
- JSON/JSONL is canonical for typed records, joins, calculations, provenance, validation, and resume.
- CSV is permitted only as raw provider input under `sources/raw/`.

## Run Layout

```text
<run>/
|-- RUN.md
|-- run-manifest.json
|-- sources/
|   |-- ledger.jsonl
|   `-- raw/
|-- evidence/
|   |-- business-context.md
|   |-- hypothesis-register.md
|   |-- market-map.md
|   |-- buyer-evidence.md
|   |-- competitor-map.md
|   |-- query-universe.jsonl
|   |-- keyword-intelligence.jsonl
|   |-- serp-snapshots.jsonl
|   `-- overlap-edges.jsonl
|-- analysis/
|   |-- intent-decisions.jsonl
|   |-- clusters.json
|   |-- cluster-quality.json
|   |-- opportunities.jsonl
|   `-- buyer-job-map.jsonl
`-- deliverables/
    |-- RESEARCH-REPORT.md
    |-- RESEARCH-REPORT.html
    |-- page-map.json
    |-- page-map.md
    |-- page-map.html
    |-- ia-proposal.md
    |-- ia-proposal.html
    `-- page-brief-inputs/
```

## Machine Invariants

- IDs use prefixes such as `src_`, `qry_`, `serp_`, `clu_`, and `page_`.
- Timestamps are ISO 8601 UTC; country/language use standard codes where possible.
- Derived records include `source_ids`, `claim_type`, and confidence with a reason.
- Arrays remain arrays, not delimiter-packed strings.
- Source references resolve to `sources/ledger.jsonl` unless explicitly externalized.

## Render Invariants

Markdown and HTML show run ID, versions, locale, generation time, freshness, stable IDs, source IDs, missing states, confidence, limitations, and unresolved decisions.

Long evidence and contradictions use sections/lists instead of truncated cells. HTML escapes external text, allows only safe links, includes a generated-file notice, and preserves a plain reading order.

Use `scripts/validate_run.py` before handoff and `scripts/render_html.py` after Markdown review.
