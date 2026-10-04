---
name: seo-market-research
description: Evidence-first pre-build SEO market research for B2B websites. Use to investigate markets, buyer search jobs, query demand, localized SERPs, page-ownership clusters, opportunities, page maps, and search-informed IA before writing pages or fixing a sitemap.
---

# SEO Market Research

## Purpose

Produce an auditable research package that answers:

> Who is searching, why, what evidence exists, how the SERP satisfies the need, and what page or information-architecture decision is justified?

Use this skill before sitemap design, SEO page creation, content briefs, or a major site-architecture change. It is not a content-writing or page-building skill.

The workflow integrates inspected patterns from 14 public skill repositories without copying their code. See [method-provenance.md](references/method-provenance.md) for the source-to-mechanism map and license status.

## Non-Negotiable Rules

1. Evidence before inference. Label consequential statements `FACT`, `INFERENCE`, or `RECOMMENDATION`.
2. Never invent search volume, KD, CPC, traffic, trend, rank, competitor metrics, SERP results, buyer evidence, specifications, certifications, customers, capacity, or performance claims.
3. Use `UNKNOWN`, `NOT_AVAILABLE`, or `REQUIRES_API` for missing external values. Zero means measured zero.
4. A generated query is a hypothesis until observed in a named source.
5. Lexical or provider intent is a prior. A dated, localized SERP is required for a final intent or page-type decision.
6. Semantic similarity may propose comparison pairs; it never finalizes page ownership. Use SERP overlap plus intent, page type, product identity, and coherence checks.
7. A cluster does not automatically become a page. Page mapping occurs only after business fit and buyer-job review.
8. Search clusters inform IA; they do not override buyer mental models, product identity, navigation constraints, or human approval.
9. Keep Automotive Wheels, EV Aluminum Components, Self-Sealing Tires, and Custom Aluminum Manufacturing parallel. Unequal evidence depth does not create a parent product line.
10. A different wheel manufacturing process is a separate product linked through a shared design series.
11. Do not publish prices. End conversion recommendations at product-specific or general inquiry.
12. Stop at research handoff. Do not create site pages, sitemap entries, or production copy unless the user explicitly starts a separate downstream task.

## Start Or Resume A Run

Before researching, read:

- [run-contract.md](references/run-contract.md) for scope, project profile, phase state, cost limits, and resume behavior;
- [evidence-policy.md](references/evidence-policy.md) for source authority, provenance, uncertainty, and missing states;
- the repository's `CONTEXT.md`, `SOUL.md`, `HANDOFF.md`, applicable ADRs, and current business evidence.

Initialize a run:

```bash
python3 .agent-skills/seo-market-research/scripts/init_run.py \
  --output <run-directory> \
  --project-id <id> \
  --scope <scope-label> \
  --country <ISO-3166-1-alpha-2> \
  --language <BCP-47> \
  --product-line "Automotive Wheels" \
  --product-line "EV Aluminum Components" \
  --product-line "Self-Sealing Tires" \
  --product-line "Custom Aluminum Manufacturing"
```

If a run exists, validate and read `RUN.md`, `run-manifest.json`, the hypothesis register, and the latest phase outputs before continuing:

```bash
python3 .agent-skills/seo-market-research/scripts/validate_run.py <run-directory>
```

Never overwrite a prior run to change market, language, device, engine, or clustering configuration. Create a new run or record a versioned amendment that invalidates downstream phases.

## Pipeline

Work phase by phase. Update `run-manifest.json` after each phase with status, input hashes, output paths, completion time, limitations, and invalidated downstream phases.

| Phase | Decision | Required output | Gate |
|---|---|---|---|
| 0 Contract | What exactly are we researching? | manifest, hypotheses, business context | scope, locale, product lines, budget defined |
| 1 Market/offering | What can the business truthfully offer? | market map, entity records, evidence gaps | unsupported offerings remain hypotheses |
| 2 Buyers/jobs | Who may search and what buying work are they doing? | buyer evidence and contradiction log | roles/jobs cite evidence or remain hypotheses |
| 3 Competitors | Which entities compete in which role? | typed competitor map | business and SERP competitors stay distinct |
| 4 Query universe | What might buyers search? | normalized query records | every query retains discovery provenance |
| 5 Keyword intelligence | What measured demand/value signals exist? | provider records | no inferred metrics; source status explicit |
| 6 SERP/intent | What goal and page type does the live result mix reward? | snapshots, intent decisions, review queue | locale/time/result evidence present |
| 7 Page ownership | Which queries may share a URL? | overlap edges, cluster candidates, quality report | no decisive intent/page/process conflict |
| 8 Opportunity | Which clusters matter to this business? | opportunity vectors | no composite without approved weights |
| 9 Buyer-job map | Where do clusters help the nonlinear buying process? | buyer-job map and gaps | next helpful action/proof is explicit |
| 10 Page map | Existing page, candidate, section, asset, defer, or reject? | page map and brief inputs | evidence, business fit, buyer job, conversion path |
| 11 IA | How should approved candidates relate? | IA proposal and validation plan | four-line equality and human review preserved |
| 12 QA/handoff | Is the package auditable and safe to use? | report, HTML view, QA results, `RUN.md` | schema, evidence, freshness, orphan, claim checks pass |

Read only the references needed for the current phase:

- Phases 1-3: [market-buyers-competitors.md](references/market-buyers-competitors.md)
- Phases 4-5: [query-and-data.md](references/query-and-data.md)
- Phase 6: [serp-intent.md](references/serp-intent.md)
- Phase 7: [clustering.md](references/clustering.md)
- Phases 8-9: [opportunity-and-journey.md](references/opportunity-and-journey.md)
- Phases 10-11: [page-map-and-ia.md](references/page-map-and-ia.md)
- Phase 12 or any structured artifact: [output-contract.md](references/output-contract.md)

## Tool And Data Policy

Prefer, in order appropriate to the decision:

1. verified first-party business evidence;
2. first-party search/performance data such as GSC, when the site exists;
3. official or authorized SEO/SERP APIs;
4. localized public search observations and suggestions;
5. competitor, standards, industry, and community web evidence;
6. LLM expansion clearly labeled `INFERENCE`.

Start with the cheapest evidence sufficient for the decision. Add paid, historical, or secondary-provider calls only when they could change a named decision. Record connector state as `OK`, `PARTIAL`, `SPARSE`, `BLOCKED`, `TOOL_ERROR`, or `NOT_RUN`.

Do not ask for or store credentials in the run directory. Use environment variables or an authorized connector. Preserve raw responses under `sources/raw/` with access restrictions appropriate to their license and data class.

## Deterministic Operations

Use the bundled scripts rather than reimplementing their mechanics:

```bash
# Normalize and provenance-merge query records.
python3 scripts/normalize_queries.py --input queries.jsonl --output query-universe.jsonl

# Compute reviewable SERP-overlap edges; suggestions are not final clusters.
python3 scripts/serp_overlap.py --input serp-snapshots.jsonl --output overlap-edges.jsonl

# Render a reviewed Markdown report as safe standalone HTML.
python3 scripts/render_html.py --input RESEARCH-REPORT.md --output RESEARCH-REPORT.html

# Validate the entire run and the no-CSV-output rule.
python3 scripts/validate_run.py <run-directory>
```

Run scripts from the skill directory or use absolute paths. Read [clustering.md](references/clustering.md) before changing overlap thresholds or interpreting edges.

## Output Contract

- Markdown is the canonical human review and approval layer.
- HTML is a generated, disposable view of reviewed Markdown and structured records. Do not edit it independently.
- JSON/JSONL is the canonical machine layer for validation, joins, calculation, provenance, and resume behavior.
- CSV may be accepted only as a raw provider input under `sources/raw/`; normalize it immediately. Never emit CSV as a working or final output.

Use stable IDs and `source_ids` throughout. Reports must expose limitations, conflicting evidence, missing states, confidence reasons, and what evidence would change a recommendation.

## Completion

A run is complete only when:

- `validate_run.py` passes;
- every consequential derived record has evidence, claim type, and confidence;
- stale or incomplete SERPs are identified;
- cluster boundary reviews are resolved or explicitly left `UNRESOLVED`;
- no proposed page lacks business fit, a buyer job, a conversion path, and an ownership rationale;
- the Markdown report and generated HTML agree;
- unresolved questions and the next human decision are listed;
- no site implementation or content production was started implicitly.
