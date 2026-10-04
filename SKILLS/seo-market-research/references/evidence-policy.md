# Evidence Policy

## Claim Types

- `FACT`: directly supported by a cited artifact or observation.
- `INFERENCE`: interpretation derived from named facts; state reasoning and alternatives.
- `RECOMMENDATION`: proposed action or design choice; state evidence and tradeoff.

Never label an LLM-generated buyer, query, intent, metric, competitor role, or page type as fact unless a separate source supports it.

## Source Classes

| Class | Appropriate use | Common limitation |
|---|---|---|
| `FIRST_PARTY_BUSINESS` | offerings, terminology, proof availability | internal language can differ from buyer language |
| `FIRST_PARTY_SEARCH` | queries, pages, CTR, conversions | sparse for new sites; GSC is not exhaustive |
| `SEO_PROVIDER` | demand, difficulty, rankings, related terms | proprietary estimates and uneven niche coverage |
| `LIVE_SERP` | intent, page type, competitors, features, overlap | localized and time-sensitive |
| `SEARCH_SUGGESTION` | vocabulary, questions, modifiers | not evidence of volume or business value |
| `COMPETITOR_WEB` | terminology, offers, page/proof patterns | visible content omits authority and sales outcomes |
| `COMMUNITY` | pain language, objections, applications | selection bias and uncertain search demand |
| `STANDARD_REFERENCE` | technical vocabulary and validation needs | may be paywalled and may not imply demand |
| `AI_SURFACE` | cited sources and answer framing | volatile and difficult to reproduce |
| `LLM_INFERENCE` | expansion and synthesis | not external evidence |

## Provenance Minimum

Every source needs stable ID, class, title, URI/path, provider, retrieval method, market/language when relevant, access time, raw artifact/hash when retained, retrieval status, and limitations.

Every derived record needs stable ID, `source_ids`, claim type, confidence level/reason, and decision-changing gaps.

## Missing And Retrieval States

- `UNKNOWN`: expected but not observed.
- `NOT_AVAILABLE`: the source cannot supply it in this run.
- `REQUIRES_API`: deliberately not fetched because connector or authorized budget is absent.
- `OK`: core requested evidence obtained.
- `PARTIAL`: usable but incomplete.
- `SPARSE`: source worked but evidence is too thin for strong confidence.
- `BLOCKED`: access, login, rate limit, or provider controls prevented retrieval.
- `TOOL_ERROR`: local execution or parsing failed.
- `NOT_RUN`: deliberately skipped because cheaper evidence was sufficient or unnecessary.

Do not average conflicting providers blindly. Preserve each value, definition, market, and retrieval date; explain the conflict.

## Freshness

Live SERP and AI-surface evidence expires operationally. Define a freshness window. Stale evidence remains historical fact but cannot silently support a current page decision.
