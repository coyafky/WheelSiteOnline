import "server-only";

import { flowFormedWheelsPage } from "@/content/flow-formed-wheels";
import type { FlowFormedWheelsPage, MediaAsset } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

/**
 * Server-side adapter for `/products/wheels/flow-formed` — content + media.
 *
 * One asset travels through the media seam: WP 116, the flow-forming equipment
 * scene bound to WFF03. Everything else on the route is either typography or a
 * real catalogue image served by `@/lib/wheels` — there is no second image
 * pipeline here (§4: the model grid reuses the catalogue card, including its
 * image).
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
 *
 * ── WHAT STAYS OUT OF WORDPRESS ─────────────────────────────────────────────
 * `seo` (`{ title, description, canonical }`) and `publicationGate`
 * (`{ copyReviewed, equipmentImageRights }`) never move into the WP body.
 * `seo` drives `generateMetadata`'s canonical + noindex decision, and
 * `publicationGate` is read by `src/app/sitemap.ts` and
 * `isFlowFormedPublishingOpen()` — a fail-closed publishing switch, not body
 * copy. Both stay owned by `@/content/flow-formed-wheels`; the WordPress body
 * carries the `slug` plus the four body sections only.
 */

/** WordPress page key, shared with the seeder so the two cannot drift. */
export const FLOW_FORMED_PAGE_KEY = "flow-formed";

function restoreBoundaryCopy(resolved: MediaAsset, original: MediaAsset): MediaAsset {
  if (resolved.wordpressId !== original.wordpressId) return resolved;
  return { ...resolved, alt: original.alt, caption: original.caption };
}

/**
 * Shape guard for the WordPress body (WFF01–WFF05).
 *
 * Checks the body sections the page renders plus `slug`. Deliberately does not
 * require `seo`/`publicationGate`: those stay local by design, so a correct
 * record must not be rejected for lacking them.
 */
function isFlowFormedWheelsPage(value: unknown): value is FlowFormedWheelsPage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["slug", "hero", "processDefinition", "manufacturingRoute", "catalogue", "inquiry"]
    .every((key) => candidate[key] !== undefined);
}

export async function getFlowFormedWheelsPage(): Promise<FlowFormedWheelsPage> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<FlowFormedWheelsPage>(
    FLOW_FORMED_PAGE_KEY,
    { locale },
  );
  // The WordPress body carries the body copy, not the publishing contract.
  // `seo` and `publicationGate` are re-attached from the local master so the
  // resolved object still satisfies `FlowFormedWheelsPage` and the route's
  // gate + metadata logic keep their local owner.
  const { content: source } = resolveLocalized<FlowFormedWheelsPage>({
    requested:
      native && isFlowFormedWheelsPage(native.content)
        ? {
            ...native.content,
            seo: flowFormedWheelsPage.seo,
            publicationGate: flowFormedWheelsPage.publicationGate,
          }
        : null,
    default: flowFormedWheelsPage,
    locale,
    scope: "flow-formed",
  });

  // Read the equipment binding from the resolved `source`, not the local
  // constant — otherwise the WP provenance never reaches the image, and a
  // future approved translation of the caption would be ignored.
  const original = source.manufacturingRoute.equipment;
  const [resolved] = await resolveWordpressMediaCollection([original]);
  const equipment = resolved ? restoreBoundaryCopy(resolved, original) : original;

  // 必须从 `source` 读，不能从 `flowFormedWheelsPage`（本地英文常量）读 ——
  // 否则即使 WordPress 返回了已批准的译文，正文仍会渲染英文正本
  // （同 `safety-tires.ts` 的历史 bug）。
  return {
    ...source,
    manufacturingRoute: { ...source.manufacturingRoute, equipment },
  };
}
