import "server-only";

import { aboutContent } from "@/content/about";
import type { AboutContent } from "@/content/types";

import { resolveWordpressMediaCollection } from "./media";

export async function getAboutContent(): Promise<AboutContent> {
  const mediaAssets = [
    aboutContent.wheelFactory.heroMedia,
    ...aboutContent.wheelFactory.workshops.map((item) => item.media),
    aboutContent.tireFactory.heroMedia,
    ...aboutContent.tireFactory.productionGroups.flatMap((group) => group.media),
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
    ...aboutContent,
    wheelFactory: {
      ...aboutContent.wheelFactory,
      heroMedia: resolved(aboutContent.wheelFactory.heroMedia),
      workshops: aboutContent.wheelFactory.workshops.map((item) => ({
        ...item,
        media: resolved(item.media),
      })),
    },
    tireFactory: {
      ...aboutContent.tireFactory,
      heroMedia: resolved(aboutContent.tireFactory.heroMedia),
      productionGroups: aboutContent.tireFactory.productionGroups.map(
        (group) => ({
          ...group,
          media: group.media.map(resolved),
        }),
      ),
    },
  };
}
