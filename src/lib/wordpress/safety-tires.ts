import "server-only";

import { selfSealingTirePage } from "@/content/safety-tires";
import type {
  MediaAsset,
  SelfSealingTirePage,
  TireViewport,
} from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

function viewportMedia(viewport: TireViewport): MediaAsset[] {
  return viewport.items.flatMap((item) => (item.media ? [item.media] : []));
}

function isSelfSealingTirePage(value: unknown): value is SelfSealingTirePage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["slug", "hero", "painPoint", "definition", "mechanism", "punctureValidation", "evidenceSystem", "applicationAndInquiry"]
    .every((key) => candidate[key] !== undefined);
}

export async function getSelfSealingTirePage(): Promise<SelfSealingTirePage> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<SelfSealingTirePage>("safety-tires", { locale });
  const { content: source } = resolveLocalized<SelfSealingTirePage>({
    requested: native && isSelfSealingTirePage(native.content) ? native.content : null,
    default: selfSealingTirePage,
    locale,
    scope: "safety-tires",
  });
  const viewports = [
    source.painPoint,
    source.definition,
    source.mechanism,
    source.punctureValidation,
    source.evidenceSystem,
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

  // 必须从 `source` 读，不能从 `selfSealingTirePage`（本地英文常量）读。
  // 否则即使 WordPress 返回了已批准的译文，这五个视口仍会渲染英文正本。
  return {
    ...source,
    painPoint: resolveViewport(source.painPoint),
    definition: resolveViewport(source.definition),
    mechanism: resolveViewport(source.mechanism),
    punctureValidation: resolveViewport(source.punctureValidation),
    evidenceSystem: resolveViewport(source.evidenceSystem),
  };
}
