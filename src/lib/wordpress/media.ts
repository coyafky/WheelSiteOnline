import "server-only";

import type { MediaAsset } from "@/content/types";

import { wpMedia, wpMediaCollection } from "./client";
import type { WpMedia } from "./types";

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function mergeWordpressMedia(media: MediaAsset, wordpressMedia: WpMedia | undefined) {
  if (!wordpressMedia?.source_url) return media;

  return {
    ...media,
    src: wordpressMedia.source_url,
    alt: wordpressMedia.alt_text.trim() || media.alt,
    caption: stripHtml(wordpressMedia.caption.rendered) || media.caption,
  };
}

export async function resolveWordpressMedia(
  media: MediaAsset,
): Promise<MediaAsset> {
  if (!media.wordpressId || media.approvalStatus !== "approved") return media;

  const wordpressMedia = await wpMedia(media.wordpressId);
  return mergeWordpressMedia(media, wordpressMedia ?? undefined);
}

export async function resolveWordpressMediaCollection(
  mediaAssets: MediaAsset[],
): Promise<MediaAsset[]> {
  const ids = mediaAssets.flatMap((media) =>
    media.wordpressId && media.approvalStatus === "approved"
      ? [media.wordpressId]
      : [],
  );
  const wordpressMedia = await wpMediaCollection(ids);
  const byId = new Map(wordpressMedia.map((item) => [item.id, item]));

  return mediaAssets.map((media) =>
    media.wordpressId
      ? mergeWordpressMedia(media, byId.get(media.wordpressId))
      : media,
  );
}
