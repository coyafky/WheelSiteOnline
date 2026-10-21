import "server-only";

import { evHousingPage } from "@/content/ev-components";
import type { EvHousingPageContent, MediaAsset } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

/**
 * Server-side media adapter for `/products/ev-components`.
 *
 * Before this file existed the route had no WordPress seam at all: the hero
 * pointed straight at `/images/ev-components/hero.webp`, so the page could not
 * be re-pointed at the CMS without editing a component. WP 38 / 24 / 49 / 20 are
 * now resolved through the shared collection resolver in a single REST request,
 * and each asset keeps its same-photograph local WebP as the offline fallback.
 *
 * WP 44 is deliberately NOT bound anywhere: the source audit established it is
 * low-pressure casting equipment with wheel molds, mislabelled "逆向工程", so it
 * cannot illustrate anything on this route.
 *
 * ── WHY THE ALT AND CAPTION ARE RE-APPLIED AFTER RESOLUTION ─────────────────
 * `resolveWordpressMediaCollection` prefers the WordPress alt/caption when the
 * record carries one. On this page that is unsafe, and the failure is not
 * hypothetical: the WordPress titles for these four records are `三电_焊接密封`
 * (welding and sealing), `三电_水冷电机壳`, `三电_电机壳体` and `三电_电控箱壳体`.
 * An editor who fills the empty alt field from the title would publish exactly
 * the claim Page SPEC §9 forbids — WP 38 as welding/sealing evidence, and the
 * category of WP 20/24/49 asserted from a filename rather than from a project
 * record.
 *
 * The alt and caption on these four assets are therefore not editorial copy;
 * they are the evidence boundary the spec fixes. The adapter takes the hosted
 * URL from WordPress and keeps the boundary wording owned by the content
 * module, so an unvetted CMS caption cannot silently publish a stronger claim.
 * Correcting the WordPress records is still the operator's task (see
 * STATUS.md); once they match, this override becomes a no-op rather than a
 * behaviour change.
 */
function heroAndCategories(content: EvHousingPageContent): MediaAsset[] {
  return [content.hero.media, ...content.categories.items.map((item) => item.media)];
}

function restoreBoundaryCopy(resolved: MediaAsset, original: MediaAsset): MediaAsset {
  if (resolved.wordpressId !== original.wordpressId) return resolved;
  return { ...resolved, alt: original.alt, caption: original.caption };
}

function isEvHousingPage(value: unknown): value is EvHousingPageContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["slug", "hero", "categories", "engineeringConcerns", "processRoutes", "evidenceMatrix", "inquiry"]
    .every((key) => candidate[key] !== undefined);
}

export async function getEvHousingPage(): Promise<EvHousingPageContent> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<EvHousingPageContent>("ev-components", { locale });
  const { content: source } = resolveLocalized<EvHousingPageContent>({
    requested: native && isEvHousingPage(native.content) ? native.content : null,
    default: evHousingPage,
    locale,
    scope: "ev-components",
  });
  const originals = heroAndCategories(source);
  const resolved = await resolveWordpressMediaCollection(originals);
  const byId = new Map(
    resolved.flatMap((asset) => (asset.wordpressId ? [[asset.wordpressId, asset] as const] : [])),
  );

  const resolveMedia = (media: MediaAsset): MediaAsset => {
    if (!media.wordpressId) return media;
    const hosted = byId.get(media.wordpressId);
    return hosted ? restoreBoundaryCopy(hosted, media) : media;
  };

  return {
    ...source,
    hero: { ...source.hero, media: resolveMedia(source.hero.media) },
    categories: {
      ...source.categories,
      items: source.categories.items.map((item) => ({
        ...item,
        media: resolveMedia(item.media),
      })),
    },
  };
}
