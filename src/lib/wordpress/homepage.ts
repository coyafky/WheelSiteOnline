import "server-only";

import { homepageContent } from "@/content/homepage";
import type { HomepageContent } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

function isHomepageContent(value: unknown): value is HomepageContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const delivery = candidate.delivery;
  return ["hero", "productLines", "capabilities", "delivery", "closing"]
    .every((key) => candidate[key] && typeof candidate[key] === "object")
    && !!delivery
    && typeof delivery === "object"
    && Array.isArray((delivery as Record<string, unknown>).evidence);
}

/**
 * Resolve homepage media through Headless WordPress on the server.
 * Checked-in content remains the offline/build fallback.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<HomepageContent>("home", { locale });
  const { content: source } = resolveLocalized<HomepageContent>({
    requested: native && isHomepageContent(native.content) ? native.content : null,
    default: homepageContent,
    locale,
    scope: "home",
  });
  const [heroMedia, ...evidenceMedia] = await resolveWordpressMediaCollection([
    source.hero.media,
    ...source.delivery.evidence.map((item) => item.media),
  ]);

  return {
    ...source,
    hero: {
      ...source.hero,
      media: heroMedia,
    },
    delivery: {
      ...source.delivery,
      evidence: source.delivery.evidence.map((item, index) => ({
        ...item,
        media: evidenceMedia[index] ?? item.media,
      })),
    },
  };
}
