import type { MediaAsset } from "@/content/types";
import type { Locale } from "@/lib/i18n/types";

export const SITE_PAGES_CACHE_TAG = "site-pages";

export type WordpressPageFields = {
  page_key?: string;
  publication_status?: "draft" | "approved" | "withdrawn";
  content?: unknown;
  content_by_locale?: Record<string, unknown>;
  seo_title?: string;
  seo_description?: string;
  seo_by_locale?: Record<string, { title?: string; description?: string }>;
  locale_status?: Record<string, "draft" | "approved" | "withdrawn">;
  image?: {
    id?: number;
    src?: string;
    alt?: string;
    caption?: string;
  } | null;
};

export type WordpressPageRecord = {
  id: number;
  slug: string;
  status?: "publish" | "draft" | "pending" | "private" | "future" | "trash";
  title: { rendered: string };
  content: { rendered: string };
  page?: WordpressPageFields;
};

export type WordpressPageCollection = {
  authoritative: boolean;
  items: WordpressPageRecord[];
};

export type SitePageDocument<T> = {
  key: string;
  content: T;
  seoTitle?: string;
  seoDescription?: string;
  media?: MediaAsset;
  source: "wordpress" | "local";
  preview: boolean;
  publicationStatus: "draft" | "approved" | "withdrawn";
};

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, " ").trim() : "";
}

function normalizeImage(value: WordpressPageFields["image"]): MediaAsset | undefined {
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

export function normalizeWordpressPage<T>(
  record: WordpressPageRecord,
  key: string,
  options: { preview?: boolean; locale?: Locale } = {},
): SitePageDocument<T> | null {
  const preview = options.preview === true;
  const fields = record.page;
  const publicationStatus = fields?.publication_status ?? "draft";
  if (!preview && (record.status !== "publish" || publicationStatus !== "approved")) return null;
  const locale = options.locale ?? "en";
  const localizedContent = locale === "en"
    ? fields?.content
    : fields?.content_by_locale?.[locale];
  if (locale !== "en" && !preview && fields?.locale_status?.[locale] !== "approved") return null;
  if (fields?.page_key !== key || !localizedContent || typeof localizedContent !== "object") return null;
  const localizedSeo = locale === "en" ? undefined : fields?.seo_by_locale?.[locale];
  return {
    key,
    content: localizedContent as T,
    seoTitle: text(localizedSeo?.title) || text(fields.seo_title) || undefined,
    seoDescription: text(localizedSeo?.description) || text(fields.seo_description) || undefined,
    media: normalizeImage(fields.image),
    source: "wordpress",
    preview,
    publicationStatus,
  };
}

export function sitePageRevalidationPaths(key?: string): string[] {
  const pathsByKey: Record<string, string[]> = {
    home: ["/"],
    about: ["/about"],
    capabilities: ["/capabilities"],
    "ev-components": ["/products/ev-components"],
    "custom-aluminum": ["/products/custom-aluminum"],
    "safety-tires": ["/products/safety-tires"],
    "product-lines": ["/products"],
    "request-a-quote": ["/request-a-quote"],
    contact: ["/contact"],
    privacy: ["/support/privacy"],
    "thank-you": ["/thank-you"],
  };
  return [...new Set([...(key && pathsByKey[key] ? pathsByKey[key] : []), "/sitemap.xml"])]
    .concat(key && pathsByKey[key] ? [] : ["/"]);
}

export function validSitePageKey(value: string | null): string | null {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return null;
  return value;
}
