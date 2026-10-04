# Run Contract And Resume Model

## Required Scope

Before Phase 1, record the project/run identity, research decision, included/excluded product lines, target country/location, language, engine, device, evidence locations, connectors, cost ceiling, SERP freshness policy, configuration status, output directory, and data restrictions.

If the user cannot supply a field, record an explicit assumption or missing state. Do not let an assumed locale become invisible.

## Project Profile Versus Run Manifest

A reusable project profile can store approved terminology, product lines, market candidates, competitor hypotheses, and connector capabilities. It must never contain credentials.

Every run copies the values it uses into its manifest and records profile version/hash, inherited value origin, confirmation state, and run-specific overrides. The manifest remains self-describing after the profile changes.

## Phase States

Use `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, or `COMPLETE`. For every phase store input/configuration hashes, outputs, timestamps, limitations, unresolved decisions, and invalidated downstream phases.

Do not mark a phase complete merely because data is unavailable. Completion means the absence is classified, its effect on confidence is explained, and the gate is satisfied or explicitly waived by a human.

## Resume Rules

1. Validate the run before resuming.
2. Re-read `RUN.md`, the manifest, open hypotheses, and the last completed phase.
3. Recompute upstream hashes.
4. If an upstream input or decision changed, mark dependent phases `NOT_STARTED` or `BLOCKED` before regeneration.
5. Never merge localized SERPs from different countries, languages, devices, or materially different dates without a comparison design.
6. Preserve superseded outputs or record their prior hash; do not silently rewrite history.

## Stop Conditions

Stop and request a decision when product/process identity conflicts cannot be resolved, a paid call exceeds policy, locale ambiguity changes results, collection is unauthorized, decisive evidence is stale/contradictory/sparse, opportunity weights are unapproved, or the requested action crosses into implementation.
