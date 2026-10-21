/**
 * Dump the `/products/wheels/{flow-formed,forged}` page bodies as JSON so
 * `scripts/i18n/seed-wheel-process-content.php` can seed the WordPress master
 * without anyone hand-transcribing ~290 lines of real copy.
 *
 * Deliberately derived from the live local constants — the same modules the
 * page adapters fall back to — so the English master in WordPress is an exact
 * copy of the English the site renders today.
 *
 * Usage:
 *   node --experimental-strip-types scripts/i18n/dump-wheel-process-content.mts > /tmp/wheel-process-content.json
 *
 * Output shape: { "<page_key>": <page body JSON>, ... }
 *
 * ⚠️ Each page body is written under its WP `page_key`, which is the single
 * value the routes and the seeder both read (`*PageKey()` in the adapters).
 *
 * ⚠️ The two control fields that must NOT move onto the page are stripped here,
 * not zeroed, so a future re-dump cannot quietly re-introduce them:
 *   - `flow-formed`  · `publicationGate` — read by `src/app/sitemap.ts` and
 *                      `isFlowFormedPublishingOpen()`; a fail-closed publishing
 *                      switch, not body copy.
 *   - `flow-formed`  · `seo` — read by `generateMetadata` for the
 *                      canonical/noindex decision.
 *   - `forged-wheel` · `slug` / `publicationStatus` — route identity and the
 *                      section-level publication flag the components read.
 */

import { flowFormedWheelsPage } from "../../src/content/flow-formed-wheels.ts";
import { forgedWheelCustomizationPage } from "../../src/content/forged-wheel.ts";

function omit<T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Omit<T, K> {
  const copy = { ...source };
  for (const key of keys) delete copy[key];
  return copy;
}

/**
 * `seo` is deliberately absent from the JSON: it is the page's metadata
 * contract, it lives in `pages-contract`'s own `seo_title`/`seo_description`
 * meta when WordPress should own it, and `generateMetadata` reads the local
 * constant directly. Shipping it inside the body would create a second,
 * divergent copy of the canonical URL.
 */
const flowFormedBody = omit(flowFormedWheelsPage, ["seo", "publicationGate"]);

/**
 * `publicationStatus` is the per-viewport flag `ForgedWheelMaterialReview` and
 * friends read to decide whether a section renders at all. It is not body copy
 * an editor should be able to flip through a body-blob edit, so it stays local.
 * `slug` is route identity.
 */
const forgedBody = omit(forgedWheelCustomizationPage, ["slug", "publicationStatus"]);

const payload = {
  "flow-formed": flowFormedBody,
  "forged-wheel": forgedBody,
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
