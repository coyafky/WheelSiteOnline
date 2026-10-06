import "server-only";

import { homepageContent } from "@/content/homepage";
import type { HomepageContent } from "@/content/types";

import { resolveWordpressMediaCollection } from "./media";

/**
 * Resolve homepage media through Headless WordPress on the server.
 * Checked-in content remains the offline/build fallback.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  const [heroMedia, ...evidenceMedia] = await resolveWordpressMediaCollection([
    homepageContent.hero.media,
    ...homepageContent.delivery.evidence.map((item) => item.media),
  ]);

  return {
    ...homepageContent,
    hero: {
      ...homepageContent.hero,
      media: heroMedia,
    },
    delivery: {
      ...homepageContent.delivery,
      evidence: homepageContent.delivery.evidence.map((item, index) => ({
        ...item,
        media: evidenceMedia[index] ?? item.media,
      })),
    },
  };
}
