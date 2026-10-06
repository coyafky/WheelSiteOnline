import "server-only";

import { flowFormedWheelsPage } from "@/content/flow-formed-wheels";
import type { FlowFormedWheelsPage, MediaAsset } from "@/content/types";

import { resolveWordpressMediaCollection } from "./media";

/**
 * Server-side media adapter for `/products/wheels/flow-formed`.
 *
 * One asset travels through this seam: WP 116, the flow-forming equipment scene
 * bound to WFF03. Everything else on the route is either typography or a real
 * catalogue image served by `@/lib/wheels` — there is no second image pipeline
 * here (§4: the model grid reuses the catalogue card, including its image).
 *
 * ── WHY THE LOCAL WEBP STAYS THE FALLBACK ───────────────────────────────────
 * `resolveWordpressMediaCollection` merges the hosted `source_url` in only when
 * the media library answers. In mock mode (and during any CMS outage) nothing is
 * merged, so the same photograph's local WebP keeps the page renderable offline —
 * the same arrangement as the capabilities, forged-wheel and EV routes
 * (DEC-028: local assets are the baseline, the CMS is the override).
 *
 * ── WHY THE ALT AND CAPTION ARE RE-APPLIED AFTER RESOLUTION ────────────────
 * The resolver prefers the WordPress alt/caption when the record carries one.
 * On this page that is unsafe: WP 116's own title is `工艺_旋压成型设备`, and an
 * editor filling the empty alt field from the title would publish a Chinese
 * equipment label on an English page. More seriously, the alt and caption here
 * are not editorial copy — they are the evidence boundary the Page SPEC fixes
 * ("a supplier-provided scene", explicitly *not* "峰徊自有设备/产能证明/具体型号
 * 加工实拍"). So the hosted URL is taken from WordPress and the boundary wording
 * stays owned by the content module. The source audit already lists the correct
 * alt/caption as the operator's next WP edit; once the record matches, this
 * override becomes a no-op rather than a behaviour change.
 */
function restoreBoundaryCopy(resolved: MediaAsset, original: MediaAsset): MediaAsset {
  if (resolved.wordpressId !== original.wordpressId) return resolved;
  return { ...resolved, alt: original.alt, caption: original.caption };
}

export async function getFlowFormedWheelsPage(): Promise<FlowFormedWheelsPage> {
  const original = flowFormedWheelsPage.manufacturingRoute.equipment;
  const [resolved] = await resolveWordpressMediaCollection([original]);
  const equipment = resolved ? restoreBoundaryCopy(resolved, original) : original;

  return {
    ...flowFormedWheelsPage,
    manufacturingRoute: { ...flowFormedWheelsPage.manufacturingRoute, equipment },
  };
}
