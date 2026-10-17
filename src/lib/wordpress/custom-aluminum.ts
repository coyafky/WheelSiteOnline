import "server-only";

import { customAluminumPage, isCustomAluminumIndexable } from "@/content/custom-aluminum";
import type { CustomAluminumMethodItem, CustomAluminumPage, MediaAsset } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

/**
 * Server-side media adapter for `/products/custom-aluminum`.
 *
 * CA04 binds three WordPress media records — WP 67, WP 31 and WP 48 — through
 * the shared collection resolver, so all three URLs arrive in a single REST
 * request and each keeps its local WebP as an offline fallback. WP 44 is NOT
 * bound anywhere: the source audit established it is a low-pressure casting
 * machine, not a reverse-engineering operation, so it cannot illustrate CA03.
 *
 * ── WHY THE ALT AND CAPTION ARE RE-APPLIED AFTER RESOLUTION ─────────────────
 * `resolveWordpressMediaCollection` prefers the WordPress alt/caption when the
 * record carries one. On this page that is unsafe: the current library copy for
 * WP 48 still reads "Reverse engineering view used to capture approved
 * geometry" / "Geometry capture and reconstruction for an authorized
 * reference", which asserts exactly the claim the Page SPEC forbids — WP 48 is
 * a casting-simulation setup, and the page must say so. WP 67's stored caption
 * likewise does not carry the required wheel-geometry boundary.
 *
 * These three captions are therefore not editorial copy; they are the evidence
 * boundary the spec fixes verbatim (§4/§5). The adapter takes the hosted URL
 * from WordPress and keeps the boundary wording owned by the content module, so
 * an unvetted CMS caption cannot silently publish a stronger claim. Correcting
 * the WordPress records is still the operator's task (see STATUS.md); once they
 * match, this override becomes a no-op rather than a behaviour change.
 */
function methodMedia(item: CustomAluminumMethodItem): MediaAsset[] {
  return [item.media, item.supportingMedia].flatMap((media) => (media ? [media] : []));
}

function restoreBoundaryCopy(resolved: MediaAsset, original: MediaAsset): MediaAsset {
  if (resolved.wordpressId !== original.wordpressId) return resolved;
  return { ...resolved, alt: original.alt, caption: original.caption };
}

function isCustomAluminumPage(value: unknown): value is CustomAluminumPage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["slug", "hero", "applications", "inputs", "methods", "stages", "boundary", "inquiry", "closing"]
    .every((key) => candidate[key] !== undefined);
}

async function getCustomAluminumSource(): Promise<CustomAluminumPage> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<CustomAluminumPage>("custom-aluminum", { locale });
  const { content: source } = resolveLocalized<CustomAluminumPage>({
    requested: native && isCustomAluminumPage(native.content) ? native.content : null,
    default: customAluminumPage,
    locale,
    scope: "custom-aluminum",
  });
  return source;
}

/** Indexability shares the same resolved content and fail-closed gate as the page. */
export async function isCustomAluminumPageIndexable(): Promise<boolean> {
  return isCustomAluminumIndexable(await getCustomAluminumSource());
}

export async function getCustomAluminumPage(): Promise<CustomAluminumPage> {
  const source = await getCustomAluminumSource();
  const originals = source.methods.items.flatMap(methodMedia);
  const resolved = await resolveWordpressMediaCollection(originals);
  const byId = new Map(
    resolved.flatMap((asset) => (asset.wordpressId ? [[asset.wordpressId, asset] as const] : [])),
  );

  const resolveMedia = (media: MediaAsset | undefined): MediaAsset | undefined => {
    if (!media?.wordpressId) return media;
    const hosted = byId.get(media.wordpressId);
    return hosted ? restoreBoundaryCopy(hosted, media) : media;
  };

  return {
    ...source,
    methods: {
      ...source.methods,
      items: source.methods.items.map((item) => ({
        ...item,
        media: resolveMedia(item.media),
        supportingMedia: resolveMedia(item.supportingMedia),
      })),
    },
  };
}
