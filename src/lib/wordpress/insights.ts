import "server-only";

import { guides as localGuides } from "@/content/resources";
import { insightGuideMedia } from "@/content/insights-visuals";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";
import type { Locale } from "@/lib/i18n/types";
import { getWpConfig, wpRead } from "./client";
import {
  INSIGHTS_CACHE_TAG,
  localGuideDocument,
  normalizeWordpressGuide,
  type InsightGuideDocument,
  type WordpressGuideCollection,
  type WordpressGuideRecord,
} from "./insights-contract";

/** 本地文章快照 —— WordPress 不可用时保留最近一次核验的英文内容。 */
function localInsightDocuments(): InsightGuideDocument[] {
  return localGuides.map((guide) => localGuideDocument(guide, insightGuideMedia[guide.slug]));
}

export async function getInsightGuideDocuments(
  options: { preview?: boolean; locale?: Locale } = {},
): Promise<InsightGuideDocument[]> {
  const preview = options.preview === true;
  const locale = options.locale ?? await getLocale();
  const localFallback = localInsightDocuments();

  if (getWpConfig().mode !== "live") {
    return resolveLocalized<InsightGuideDocument[]>({
      requested: null,
      default: localFallback,
      locale,
      scope: "insights:index",
    }).content;
  }

  const query = new URLSearchParams();
  if (preview) query.set("preview", "true");
  const response = await wpRead<WordpressGuideCollection>(
    `/fh/v1/guides${query.size ? `?${query.toString()}` : ""}`,
    {
      restRoot: true,
      tags: [INSIGHTS_CACHE_TAG],
      noStore: preview,
    },
  );
  if (response === null || response.authoritative !== true) {
    return resolveLocalized<InsightGuideDocument[]>({
      requested: null,
      default: localFallback,
      locale,
      scope: "insights:index",
    }).content;
  }

  const records: WordpressGuideRecord[] = response.items;

  const localized = records
    .map((record) => normalizeWordpressGuide(record, { preview, locale }))
    .filter((record): record is InsightGuideDocument => record !== null);

  // WordPress answered, but served no guide for the requested locale — the
  // whole set fell back to the English library, which is the signal we log.
  return resolveLocalized<InsightGuideDocument[]>({
    requested: localized.length > 0 ? localized : null,
    default: localFallback,
    locale,
    scope: "insights:index",
  }).content;
}

export async function getInsightGuideDocument(
  slug: string,
  options: { preview?: boolean; locale?: Locale } = {},
): Promise<InsightGuideDocument | null> {
  const documents = await getInsightGuideDocuments(options);
  return documents.find((document) => document.guide.slug === slug) ?? null;
}
