# Query Discovery And Keyword Data

## Query Source Ladder

Build the universe from verified offerings/applications/processes, evidenced buyer jobs, typed competitors, competitor pages/rankings, suggestions/PAA, industry/community/standards sources, optional GSC, and LLM expansion labeled `GENERATED` plus `INFERENCE`.

Preserve query text, normalized text, language, country, product lines, buyer/job hypotheses, discovery methods, source IDs, and status. Do not discard a low-volume industrial query solely because a provider reports zero or lacks coverage.

Use `scripts/normalize_queries.py` for deterministic normalization and provenance merging.

## Data Enrichment

Store each provider observation separately with provider, endpoint/export, field definition, locale, retrieval time, and raw source ID. Never silently average providers.

Volume, KD, CPC, competition, trend, rank, and traffic require a named external source. Provider intent is not final SERP intent.

## Cost-Aware Escalation

Use broad low-cost discovery, bulk enrichment, lexical/semantic candidate grouping, then live SERPs for ambiguous/high-value/clustering-critical terms. Use historical SERP, backlink, or AI-surface calls only when they can change a decision.

Before an optional call, write the unresolved question. Afterward, record whether the source changed the decision or confidence. Cache raw responses where provider terms allow it.

## CSV Input Boundary

An adapter may read an authorized provider CSV under `sources/raw/`. Normalize it immediately to JSON/JSONL while preserving the original and mapping metadata. CSV is never a working or final output.
