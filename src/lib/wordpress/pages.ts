import "server-only";

import { getLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getWpConfig, wpRead } from "./client";
import {
  SITE_PAGES_CACHE_TAG,
  normalizeWordpressPage,
  type SitePageDocument,
  type WordpressPageCollection,
} from "./pages-contract";

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
