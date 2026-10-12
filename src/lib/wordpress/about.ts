import "server-only";

import { aboutContent } from "@/content/about";
import type { AboutContent } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument } from "./pages";

function isAboutContent(value: unknown): value is AboutContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["hero", "role", "wheelFactory", "tireFactory", "closing"]
    .every((key) => candidate[key] && typeof candidate[key] === "object");
}

export async function getAboutContent(): Promise<AboutContent> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<AboutContent>("about", { locale });
  const { content: source } = resolveLocalized<AboutContent>({
    requested: native && isAboutContent(native.content) ? native.content : null,
    default: aboutContent,
    locale,
    scope: "about",
  });
  const mediaAssets = [
    source.wheelFactory.heroMedia,
    ...source.wheelFactory.workshops.map((item) => item.media),
    source.tireFactory.heroMedia,
    ...source.tireFactory.productionGroups.flatMap((group) => group.media),
  ];
  const resolvedMedia = await resolveWordpressMediaCollection(mediaAssets);
  const byId = new Map(
    resolvedMedia.flatMap((media) =>
      media.wordpressId ? [[media.wordpressId, media] as const] : [],
    ),
  );
  const resolved = (media: (typeof mediaAssets)[number]) =>
    (media.wordpressId ? byId.get(media.wordpressId) : undefined) ?? media;

  return {
    ...source,
    wheelFactory: {
      ...source.wheelFactory,
      heroMedia: resolved(source.wheelFactory.heroMedia),
      workshops: source.wheelFactory.workshops.map((item) => ({
        ...item,
        media: resolved(item.media),
      })),
    },
    tireFactory: {
      ...source.tireFactory,
      heroMedia: resolved(source.tireFactory.heroMedia),
      productionGroups: source.tireFactory.productionGroups.map(
        (group) => ({
          ...group,
          media: group.media.map(resolved),
        }),
      ),
    },
  };
}
