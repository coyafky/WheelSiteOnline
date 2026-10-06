import "server-only";

import { wheelManufacturingCapabilities } from "@/content/wheel-capabilities";
import type {
  CapabilityViewport,
  MediaAsset,
  WheelManufacturingCapabilities,
} from "@/content/types";

import { resolveWordpressMediaCollection } from "./media";

function viewportMedia(viewport: CapabilityViewport): MediaAsset[] {
  return viewport.items.flatMap((item) => (item.media ? [item.media] : []));
}

export async function getWheelManufacturingCapabilities(): Promise<WheelManufacturingCapabilities> {
  const viewports = [
    wheelManufacturingCapabilities.engineering,
    wheelManufacturingCapabilities.formingRoutes,
    wheelManufacturingCapabilities.processInspection,
    wheelManufacturingCapabilities.validationTests,
    wheelManufacturingCapabilities.documentedEvidence,
  ];
  const assets = viewports.flatMap(viewportMedia);
  const resolvedAssets = await resolveWordpressMediaCollection(assets);
  const byId = new Map(
    resolvedAssets.flatMap((media) =>
      media.wordpressId ? [[media.wordpressId, media] as const] : [],
    ),
  );

  const resolveViewport = <T extends CapabilityViewport>(viewport: T): T => ({
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
    ...wheelManufacturingCapabilities,
    engineering: resolveViewport(wheelManufacturingCapabilities.engineering),
    formingRoutes: resolveViewport(wheelManufacturingCapabilities.formingRoutes),
    processInspection: resolveViewport(
      wheelManufacturingCapabilities.processInspection,
    ),
    validationTests: resolveViewport(
      wheelManufacturingCapabilities.validationTests,
    ),
    documentedEvidence: resolveViewport(
      wheelManufacturingCapabilities.documentedEvidence,
    ),
  };
}
