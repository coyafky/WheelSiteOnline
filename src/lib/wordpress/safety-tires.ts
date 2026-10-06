import "server-only";

import { selfSealingTirePage } from "@/content/safety-tires";
import type {
  MediaAsset,
  SelfSealingTirePage,
  TireViewport,
} from "@/content/types";

import { resolveWordpressMediaCollection } from "./media";

function viewportMedia(viewport: TireViewport): MediaAsset[] {
  return viewport.items.flatMap((item) => (item.media ? [item.media] : []));
}

export async function getSelfSealingTirePage(): Promise<SelfSealingTirePage> {
  const viewports = [
    selfSealingTirePage.painPoint,
    selfSealingTirePage.definition,
    selfSealingTirePage.mechanism,
    selfSealingTirePage.punctureValidation,
    selfSealingTirePage.evidenceSystem,
  ];
  const resolvedAssets = await resolveWordpressMediaCollection(
    viewports.flatMap(viewportMedia),
  );
  const byId = new Map(
    resolvedAssets.flatMap((media) =>
      media.wordpressId ? [[media.wordpressId, media] as const] : [],
    ),
  );

  const resolveViewport = <T extends TireViewport>(viewport: T): T => ({
    ...viewport,
    items: viewport.items.map((item) => ({
      ...item,
      media:
        item.media?.wordpressId && byId.has(item.media.wordpressId)
          ? byId.get(item.media.wordpressId)
          : item.media,
    })),
  });

  return {
    ...selfSealingTirePage,
    painPoint: resolveViewport(selfSealingTirePage.painPoint),
    definition: resolveViewport(selfSealingTirePage.definition),
    mechanism: resolveViewport(selfSealingTirePage.mechanism),
    punctureValidation: resolveViewport(selfSealingTirePage.punctureValidation),
    evidenceSystem: resolveViewport(selfSealingTirePage.evidenceSystem),
  };
}
