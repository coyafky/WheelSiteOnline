import "server-only";

import { forgedWheelCustomizationPage } from "@/content/forged-wheel";
import type { ForgedWheelCustomizationPage, ForgedWheelViewport, MediaAsset } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

/**
 * Server-side adapter for `/products/wheels/forged` — content + media.
 *
 * The page body (WF01–WF06) travels through a native WordPress page so it can
 * carry a translation later. The five media assets keep travelling through
 * `resolveWordpressMediaCollection`, which is the pre-existing behaviour: WP 42,
 * 29, 58, 70, 30 and 76 each merge their hosted `source_url` in when the media
 * library answers, with the local WebP as the offline fallback (DEC-028).
 *
 * ── WHAT STAYS LOCAL ────────────────────────────────────────────────────────
 * `slug` and the top-level `publicationStatus` never move to WordPress. Both sit
 * next to the viewport-level `publicationStatus` the section components read,
 * and the slug is route identity — neither is body copy an editor should be able
 * to rewrite through a body-blob edit. The dump script strips them for the same
 * reason.
 */

/** WordPress page key, shared with the seeder so the two cannot drift. */
export const FORGED_WHEEL_PAGE_KEY = "forged-wheel";

function viewportMedia(viewport: ForgedWheelViewport): MediaAsset[] {
  return viewport.items.flatMap((item) => (item.media ? [item.media] : []));
}

/**
 * Shape guard for the WordPress body.
 *
 * Checks the five viewports the page renders — hero, materialReview,
 * forgingRoute, completion, inquiryInputs — so a half-seeded record falls back
 * to the local English master instead of rendering `undefined`. Deliberately
 * does not require `slug`/`publicationStatus`: those stay local by design, and
 * requiring them would make a correct record fail the guard.
 */
function isForgedWheelCustomizationPage(value: unknown): value is ForgedWheelCustomizationPage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["hero", "materialReview", "forgingRoute", "completion", "inquiryInputs"]
    .every((key) => candidate[key] !== undefined);
}

export async function getForgedWheelCustomizationPage(): Promise<ForgedWheelCustomizationPage> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<ForgedWheelCustomizationPage>(
    FORGED_WHEEL_PAGE_KEY,
    { locale },
  );
  // The WordPress body carries only the five viewports. `slug` and
  // `publicationStatus` are re-attached from the local master so the resolved
  // object still satisfies `ForgedWheelCustomizationPage` and the section
  // renderer's publication check keeps its local owner.
  const { content: source } = resolveLocalized<ForgedWheelCustomizationPage>({
    requested:
      native && isForgedWheelCustomizationPage(native.content)
        ? { ...native.content, slug: forgedWheelCustomizationPage.slug, publicationStatus: forgedWheelCustomizationPage.publicationStatus }
        : null,
    default: forgedWheelCustomizationPage,
    locale,
    scope: "forged-wheel",
  });

  // 必须从 `source` 读，不能从 `forgedWheelCustomizationPage`（本地英文常量）
  // 读 —— 否则即使 WordPress 返回了已批准的译文，这五个视口仍会渲染英文正本
  // （同 `safety-tires.ts` 的历史 bug）。
  const viewports = [source.hero, source.materialReview, source.forgingRoute, source.completion];
  const resolved = await resolveWordpressMediaCollection(viewports.flatMap(viewportMedia));
  const byId = new Map(resolved.flatMap((asset) => (asset.wordpressId ? [[asset.wordpressId, asset] as const] : [])));
  const resolveViewport = <T extends ForgedWheelViewport>(viewport: T): T => ({
    ...viewport,
    items: viewport.items.map((item) => ({
      ...item,
      media: item.media?.wordpressId ? byId.get(item.media.wordpressId) ?? item.media : item.media,
    })),
  });

  return {
    ...source,
    hero: resolveViewport(source.hero),
    materialReview: resolveViewport(source.materialReview),
    forgingRoute: resolveViewport(source.forgingRoute),
    completion: resolveViewport(source.completion),
  };
}
