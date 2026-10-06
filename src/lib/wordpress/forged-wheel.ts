import "server-only";

import { forgedWheelCustomizationPage } from "@/content/forged-wheel";
import type { ForgedWheelCustomizationPage, ForgedWheelViewport, MediaAsset } from "@/content/types";

import { resolveWordpressMediaCollection } from "./media";

function viewportMedia(viewport: ForgedWheelViewport): MediaAsset[] {
  return viewport.items.flatMap((item) => (item.media ? [item.media] : []));
}

export async function getForgedWheelCustomizationPage(): Promise<ForgedWheelCustomizationPage> {
  const viewports = [forgedWheelCustomizationPage.hero, forgedWheelCustomizationPage.materialReview, forgedWheelCustomizationPage.forgingRoute, forgedWheelCustomizationPage.completion];
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
    ...forgedWheelCustomizationPage,
    hero: resolveViewport(forgedWheelCustomizationPage.hero),
    materialReview: resolveViewport(forgedWheelCustomizationPage.materialReview),
    forgingRoute: resolveViewport(forgedWheelCustomizationPage.forgingRoute),
    completion: resolveViewport(forgedWheelCustomizationPage.completion),
  };
}
