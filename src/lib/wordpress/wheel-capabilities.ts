import "server-only";

import { wheelManufacturingCapabilities } from "@/content/wheel-capabilities";
import type {
  CapabilityViewport,
  MediaAsset,
  WheelManufacturingCapabilities,
} from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

function isWheelCapabilities(value: unknown): value is WheelManufacturingCapabilities {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["hero", "engineering", "formingRoutes", "processInspection", "validationTests", "documentedEvidence"]
    .every((key) => candidate[key] && typeof candidate[key] === "object");
}

function viewportMedia(viewport: CapabilityViewport): MediaAsset[] {
  return viewport.items.flatMap((item) => (item.media ? [item.media] : []));
}

export async function getWheelManufacturingCapabilities(): Promise<WheelManufacturingCapabilities> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<WheelManufacturingCapabilities>("capabilities", { locale });
  const { content: source } = resolveLocalized<WheelManufacturingCapabilities>({
    requested: native && isWheelCapabilities(native.content) ? native.content : null,
    default: wheelManufacturingCapabilities,
    locale,
    scope: "capabilities",
  });
  const viewports = [
    source.engineering,
    source.formingRoutes,
    source.processInspection,
    source.validationTests,
    source.documentedEvidence,
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
    ...source,
    engineering: resolveViewport(source.engineering),
    formingRoutes: resolveViewport(source.formingRoutes),
    processInspection: resolveViewport(source.processInspection),
    validationTests: resolveViewport(source.validationTests),
    documentedEvidence: resolveViewport(source.documentedEvidence),
  };
}
