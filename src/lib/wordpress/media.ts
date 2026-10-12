import "server-only";

import type { MediaAsset } from "@/content/types";

import { wpMedia, wpMediaCollection } from "./client";
import type { WpMedia } from "./types";

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

/**
 * Merge the WordPress media library record into a content media asset.
 *
 * ⚠️ 优先级：**内容载荷里的文本优先**，媒体库只作兜底。
 *
 * 媒体库（`wp/v2/media`）的 `alt_text` / `caption` 是**英文单语**资源，没有按
 * locale 分版；而 `content` / `content_by_locale[locale]` 里的 `alt` / `caption`
 * 是**按语言**翻译好的。若让媒体库优先，任何非英文页面都会被强制回英文
 * —— 正文已翻译、图注仍是英文（实测 `/zh/products/safety-tires` 17 条图注全英文）。
 *
 * 英文侧不受影响：`content_by_locale.en` 的图注本就与媒体库逐字一致，
 * 首选载荷与首选媒体库结果相同。
 *
 * 仍从媒体库取 `src`：那是资源的唯一定位来源，与语言无关。
 */
function mergeWordpressMedia(media: MediaAsset, wordpressMedia: WpMedia | undefined) {
  if (!wordpressMedia?.source_url) return media;

  return {
    ...media,
    src: wordpressMedia.source_url,
    alt: media.alt.trim() || wordpressMedia.alt_text.trim(),
    caption: media.caption.trim() || stripHtml(wordpressMedia.caption.rendered),
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
