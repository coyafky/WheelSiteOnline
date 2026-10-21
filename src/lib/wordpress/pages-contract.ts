import type { MediaAsset } from "@/content/types";
import { LOCALES, localizedPath, type Locale } from "../i18n/types.ts";

// Declared once in the cache-tag register; see ./cache-tags.ts.
export { SITE_PAGES_CACHE_TAG } from "./cache-tags.ts";

export type WordpressPageFields = {
  page_key?: string;
  locale?: Locale;
  /** Durable cross-language identity; stable when a localized slug changes. */
  translation_group?: string;
  revision?: string;
  schema_version?: number;
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

/** 独立语言 Page 的公开读取结果；缺失和撤回必须保持可区分。 */
export type WordpressLocalePageResponse = {
  authoritative: boolean;
  status: "ready" | "missing-locale" | "unpublished" | "withdrawn";
  item?: WordpressPageRecord;
};

export type PageResult<T> =
  | { status: "ready"; page: SitePageDocument<T> }
  | { status: "missing-locale" | "unpublished" | "withdrawn" | "temporarily-unavailable" };

export type SitePageDocument<T> = {
  key: string;
  locale?: Locale;
  revision?: string;
  content: T;
  seoTitle?: string;
  seoDescription?: string;
  media?: MediaAsset;
  source: "wordpress" | "local";
  preview: boolean;
  publicationStatus: "draft" | "approved" | "withdrawn";
};

/** 独立语言记录不得从英文或另一种语言补正文、SEO。 */
export function normalizeWordpressLocalePage<T>(
  record: WordpressPageRecord,
  key: string,
  locale: Locale,
  preview = false,
): PageResult<T> {
  const fields = record.page;
  if (fields?.page_key !== key || fields.locale !== locale) return { status: "missing-locale" };
  if (fields.publication_status === "withdrawn") return { status: "withdrawn" };
  if (!preview && (record.status !== "publish" || fields.publication_status !== "approved")) {
    return { status: "unpublished" };
  }
  if (!fields.content || typeof fields.content !== "object" || Array.isArray(fields.content)) {
    return { status: "unpublished" };
  }
  const seoTitle = text(fields.seo_title);
  const seoDescription = text(fields.seo_description);
  if (!preview && (!seoTitle || !seoDescription)) return { status: "unpublished" };
  return {
    status: "ready",
    page: {
      key,
      locale,
      revision: text(fields.revision) || `page-${record.id}`,
      content: fields.content as T,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      media: normalizeImage(fields.image),
      source: "wordpress",
      preview,
      publicationStatus: fields.publication_status ?? "draft",
    },
  };
}

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
  if (key === "privacy") {
    pathsByKey.privacy.push("/request-a-quote", "/contact");
  }
  const basePaths = key && pathsByKey[key] ? pathsByKey[key] : ["/"];
  return [...new Set([
    ...basePaths.flatMap((path) => LOCALES.map((locale) => localizedPath(path, locale))),
    "/sitemap.xml",
  ])];
}

export function validSitePageKey(value: string | null): string | null {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return null;
  return value;
}
