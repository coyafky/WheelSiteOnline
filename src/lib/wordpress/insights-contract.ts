import type { GuideDetail, GuideEntry, GuideSection, MediaAsset } from "../../content/types";

export const INSIGHTS_CACHE_TAG = "insights-guides";

export type WordpressGuideFields = {
  publication_status?: "draft" | "approved" | "withdrawn";
  summary?: string;
  category?: string;
  reading_time?: string;
  reading_minutes?: number;
  answer?: string;
  needs_verification?: boolean;
  detail?: unknown;
  sections?: unknown;
  seo_title?: string;
  seo_description?: string;
  image?: {
    id?: number;
    src?: string;
    alt?: string;
    caption?: string;
  } | null;
};

export type WordpressGuideRecord = {
  id: number;
  slug: string;
  status?: "publish" | "draft" | "pending" | "private" | "future" | "trash";
  title: { rendered: string };
  excerpt: { rendered: string };
  guide?: WordpressGuideFields;
  /** 兼容迁移期旧 ACF 响应；项目自有 WordPress 契约统一输出 guide。 */
  acf?: WordpressGuideFields;
};

export type WordpressGuideCollection = {
  authoritative: boolean;
  items: WordpressGuideRecord[];
};

export type InsightGuideDocument = {
  guide: GuideEntry;
  seoTitle: string;
  seoDescription: string;
  source: "wordpress" | "local";
  preview: boolean;
  publicationStatus: "draft" | "approved" | "withdrawn";
  media?: MediaAsset;
};

function text(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length > 0
    && value.every((item) => typeof item === "string" && item.trim() !== "");
}

function normalizeDetail(value: unknown): GuideDetail[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows: GuideDetail[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    if (typeof row.heading !== "string" || !row.heading.trim() || !isStringArray(row.paragraphs)) return null;
    rows.push({
      heading: row.heading.trim(),
      paragraphs: row.paragraphs.map((entry) => entry.trim()),
    });
  }
  return rows;
}

function normalizeSections(value: unknown): GuideSection[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows: GuideSection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    if (typeof row.heading !== "string" || !row.heading.trim() || !isStringArray(row.body)) return null;
    rows.push({
      heading: row.heading.trim(),
      body: row.body.map((entry) => entry.trim()),
    });
  }
  return rows;
}

function normalizeImage(value: WordpressGuideFields["image"]): MediaAsset | undefined {
  if (!value || !Number.isInteger(value.id) || (value.id ?? 0) <= 0) return undefined;
  const src = text(value.src);
  const alt = text(value.alt);
  if (!/^(?:https?:\/\/|\/)/.test(src) || !alt) return undefined;
  return {
    wordpressId: value.id,
    src,
    alt,
    caption: text(value.caption),
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: `WordPress media ${value.id}`,
  };
}

export function normalizeWordpressGuide(
  record: WordpressGuideRecord,
  options: { preview?: boolean } = {},
): InsightGuideDocument | null {
  const preview = options.preview === true;
  const fields = record.guide ?? record.acf;
  const publicationStatus = fields?.publication_status ?? "draft";
  if (!preview && (record.status !== "publish" || publicationStatus !== "approved")) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) return null;

  const title = text(record.title?.rendered);
  const summary = text(fields?.summary) || text(record.excerpt?.rendered);
  const category = text(fields?.category);
  const answer = text(fields?.answer);
  const detail = normalizeDetail(fields?.detail);
  const sections = normalizeSections(fields?.sections);
  const readingTime = text(fields?.reading_time)
    || (Number.isFinite(fields?.reading_minutes) ? `${fields?.reading_minutes} min read` : "");
  if (!title || !summary || !category || !answer || !readingTime || !detail || !sections) return null;

  const guide: GuideEntry = {
    slug: record.slug,
    title,
    summary,
    category,
    readingTime,
    detail,
    sections,
    answer,
    needsVerification: fields?.needs_verification === true,
  };
  return {
    guide,
    seoTitle: text(fields?.seo_title) || `${title} — ${category} Guide`,
    seoDescription: text(fields?.seo_description) || summary,
    source: "wordpress",
    preview,
    publicationStatus,
    media: normalizeImage(fields?.image),
  };
}

export function localGuideDocument(guide: GuideEntry, media?: MediaAsset): InsightGuideDocument {
  return {
    guide,
    seoTitle: `${guide.title} — ${guide.category} Guide`,
    seoDescription: guide.summary,
    source: "local",
    preview: false,
    publicationStatus: "approved",
    media,
  };
}

export function insightRevalidationPaths(slug?: string): string[] {
  const paths = ["/insights"];
  if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) paths.push(`/insights/${slug}`);
  return paths;
}

export function validInsightPreviewSlug(value: string | null): string | null {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return null;
  return value;
}
