import "server-only";

import { guides as localGuides } from "@/content/resources";
import { insightGuideMedia } from "@/content/insights-visuals";
import { getWpConfig, wpRead } from "./client";
import {
  INSIGHTS_CACHE_TAG,
  localGuideDocument,
  normalizeWordpressGuide,
  type InsightGuideDocument,
  type WordpressGuideCollection,
  type WordpressGuideRecord,
} from "./insights-contract";

export async function getInsightGuideDocuments(
  options: { preview?: boolean } = {},
): Promise<InsightGuideDocument[]> {
  const preview = options.preview === true;
  if (getWpConfig().mode !== "live") {
    return localGuides.map((guide) => localGuideDocument(guide, insightGuideMedia[guide.slug]));
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
    return localGuides.map((guide) => localGuideDocument(guide, insightGuideMedia[guide.slug]));
  }

  const records: WordpressGuideRecord[] = response.items;

  return records
    .map((record) => normalizeWordpressGuide(record, { preview }))
    .filter((record): record is InsightGuideDocument => record !== null);
}

export async function getInsightGuideDocument(
  slug: string,
  options: { preview?: boolean } = {},
): Promise<InsightGuideDocument | null> {
  const documents = await getInsightGuideDocuments(options);
  return documents.find((document) => document.guide.slug === slug) ?? null;
}
