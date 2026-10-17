import "server-only";

import { getLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getWpConfig, wpRead } from "./client";
import {
  SITE_PAGES_CACHE_TAG,
  normalizeWordpressLocalePage,
  normalizeWordpressPage,
  type PageResult,
  type SitePageDocument,
  type WordpressPageCollection,
  type WordpressLocalePageResponse,
} from "./pages-contract";

/**
 * 首页试点读取器。独立语言记录优先；只有尚未迁移的语言可读旧聚合字段。
 * 新记录的撤回或草稿是明确状态，绝不落回旧内容。
 */
export async function getWordpressPageResult<T>(
  key: string,
  options: { preview?: boolean; locale?: Locale } = {},
): Promise<PageResult<T>> {
  if (getWpConfig().mode !== "live") return { status: "temporarily-unavailable" };
  const locale = options.locale ?? await getLocale();
  const params = new URLSearchParams({ key, locale });
  if (options.preview) params.set("preview", "true");
  const independent = await wpRead<WordpressLocalePageResponse>(
    `/fh/v2/pages?${params.toString()}`,
    { restRoot: true, tags: [SITE_PAGES_CACHE_TAG], noStore: options.preview === true },
  );
  if (independent?.authoritative === true) {
    if (independent.status === "withdrawn" || independent.status === "unpublished") {
      return { status: independent.status };
    }
    if (independent.status === "ready") {
      return independent.item
        ? normalizeWordpressLocalePage<T>(independent.item, key, locale, options.preview === true)
        : { status: "temporarily-unavailable" };
    }
  }

  const legacyParams = new URLSearchParams({ key });
  if (options.preview) legacyParams.set("preview", "true");
  const legacy = await wpRead<WordpressPageCollection>(
    `/fh/v1/pages?${legacyParams.toString()}`,
    { restRoot: true, tags: [SITE_PAGES_CACHE_TAG], noStore: options.preview === true },
  );
  if (!legacy || legacy.authoritative !== true || !Array.isArray(legacy.items)) {
    return independent?.authoritative === true
      ? { status: "missing-locale" }
      : { status: "temporarily-unavailable" };
  }
  const record = legacy.items.find((item) => item.page?.page_key === key);
  if (!record) return { status: "missing-locale" };
  if (record.page?.publication_status === "withdrawn"
    || (locale !== "en" && record.page?.locale_status?.[locale] === "withdrawn")) {
    return { status: "withdrawn" };
  }
  if (locale !== "en") {
    const localizedSeo = record.page?.seo_by_locale?.[locale];
    if (!localizedSeo?.title?.trim() || !localizedSeo.description?.trim()) {
      return { status: "unpublished" };
    }
  }
  const page = normalizeWordpressPage<T>(record, key, { ...options, locale });
  return page
    ? { status: "ready", page: { ...page, locale, revision: `legacy-${record.id}` } }
    : { status: "unpublished" };
}

/**
 * 读取 WordPress 原生 Page 的稳定契约。
 *
 * 页面组件只接收已经归一化的业务类型；REST 字段、发布门槛和回退策略都
 * 收口在这里。WordPress 明确返回空集合时不会伪造本地内容，单页不完整时则
 * 放弃该页的 CMS 版本，保留最后一次有效的本地内容。
 */
export async function getWordpressPageDocument<T>(
  key: string,
  options: { preview?: boolean; locale?: Locale } = {},
): Promise<SitePageDocument<T> | null> {
  if (getWpConfig().mode !== "live") return null;
  const params = new URLSearchParams({ key });
  if (options.preview) params.set("preview", "true");
  const response = await wpRead<WordpressPageCollection>(
    `/fh/v1/pages?${params.toString()}`,
    {
      restRoot: true,
      tags: [SITE_PAGES_CACHE_TAG],
      noStore: options.preview === true,
    },
  );
  if (!response || response.authoritative !== true || !Array.isArray(response.items)) return null;
  const record = response.items[0];
  const locale = options.locale ?? await getLocale();
  return record ? normalizeWordpressPage<T>(record, key, { ...options, locale }) : null;
}
