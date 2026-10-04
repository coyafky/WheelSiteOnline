# Localized SERP And Intent

## Snapshot Context

Store query ID, engine, country, location if available, language, device, provider/retrieval method, observed time, completeness, and limitations. Keep organic results separate from feature modules.

For every organic result store rank, original/canonical analysis URL, domain, title, result type, inferred page type, competitor role, claim type, and source IDs.

## Four Intent Views

1. `lexical_intent_prior`: what query text suggests.
2. `provider_intent`: external model labels/probabilities.
3. `serp_goal_intent`: what the result mix helps users accomplish.
4. `b2b_job_ids`: buying work the query may support.

Do not collapse these. The first two are priors; the localized result mix is decisive for page format, subject to confidence and review.

## Page Types

Use observed purpose, not URL shape alone: manufacturer/supplier home, product category, product detail, capability/process, application/industry, comparison, technical reference, FAQ/Q&A, marketplace/directory, forum/community, standard/government/PDF, video/image, mixed/other/unknown.

Record the distribution, not only a winner. A mixed SERP may indicate several goals or unstable page expectations.

## Feature Discipline

For PAA, AI Overview, featured snippets, image/video modules, local packs, shopping, and paid layers, store `OBSERVED`, `INFERRED`, `NOT_OBSERVED`, or `NOT_AVAILABLE`. Absence from a partial API payload is not `NOT_OBSERVED`.

## Review Conditions

Queue review when results are incomplete, page types are tied, intent/page type conflicts, product lines or processes conflict, the snapshot is stale, or navigation/marketplace/forum/standards dominance changes the site's appropriate role.
