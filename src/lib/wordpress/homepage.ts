import "server-only";

import { homepageContent } from "@/content/homepage";
import { productLines } from "@/content/product-lines";
import type { HomepageContent } from "@/content/types";
import {
  buildHomepageModules,
  hasHomepageSeo,
  isValidHomepageContent,
  normalizeHomepageCmsDocument,
  validateHomepageModules,
  type HomepagePageResult,
  type HomepageProductLineCard,
} from "@/content/page-view";
import { getLocale } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { resolveWordpressMediaCollection } from "./media";
import { getWordpressPageDocument, getWordpressPageResult } from "./pages";

const localProductLineCards: HomepageProductLineCard[] = productLines.map((line) => ({ ...line }));

function withProductLineItems(content: HomepageContent, items?: HomepageProductLineCard[], allowFallback = true): HomepageContent & { productLines: HomepageContent["productLines"] & { items: HomepageProductLineCard[] } } {
  return {
    ...content,
    productLines: {
      ...content.productLines,
      items: items?.length === 4 ? items : allowFallback ? localProductLineCards : [],
    },
  };
}

function isHomepageContent(value: unknown): value is HomepageContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const delivery = candidate.delivery;
  return ["hero", "productLines", "capabilities", "delivery", "closing"]
    .every((key) => candidate[key] && typeof candidate[key] === "object")
    && !!delivery
    && typeof delivery === "object"
    && Array.isArray((delivery as Record<string, unknown>).evidence);
}

/**
 * Resolve homepage media through Headless WordPress on the server.
 * Checked-in content remains the offline/build fallback.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  const locale = await getLocale();
  const native = await getWordpressPageDocument<HomepageContent>("home", { locale });
  const { content: source } = resolveLocalized<HomepageContent>({
    requested: native && isHomepageContent(native.content) ? native.content : null,
    default: homepageContent,
    locale,
    scope: "home",
  });
  const [heroMedia, ...evidenceMedia] = await resolveWordpressMediaCollection([
    source.hero.media,
    ...source.delivery.evidence.map((item) => item.media),
  ]);

  return {
    ...source,
    hero: {
      ...source.hero,
      media: heroMedia,
    },
    delivery: {
      ...source.delivery,
      evidence: source.delivery.evidence.map((item, index) => ({
        ...item,
        media: evidenceMedia[index] ?? item.media,
      })),
    },
  };
}

/**
 * Resolve the homepage into the discriminated module view consumed by the
 * route. Non-English requests never silently reuse the English snapshot.
 */
export async function getHomepagePageView(args: {
  locale: import("@/lib/i18n/types").Locale;
  preview?: boolean;
}): Promise<HomepagePageResult> {
  const { locale, preview = false } = args;
  const native = await getWordpressPageResult<unknown>("home", { locale, preview });

  if (native.status !== "ready") {
    if (locale === "en" && !preview && native.status === "temporarily-unavailable") {
      const local = withProductLineItems(homepageContent);
      const modules = buildHomepageModules(local);
      return {
        status: "ready",
        page: {
          pageKey: "home",
          locale,
          revision: "local-home-v1",
          seo: {
            title: "Fenghuai | Wheels, EV Housings, Custom Aluminum & Self-Sealing Tires",
            description: "Explore Fenghuai's four automotive product lines: wheels, EV aluminum housings, custom aluminum components and self-sealing tires. Review project scope and how to start an inquiry.",
            canonicalPath: "/",
          },
          modules,
        },
      };
    }
    return native;
  }

  const cms = normalizeHomepageCmsDocument(native.page.content, locale);
  const rawContent = native.page.content;
  const isVersionedCmsContent = !!rawContent && typeof rawContent === "object" && !Array.isArray(rawContent)
    && (rawContent as Record<string, unknown>).schemaVersion !== undefined
    && (rawContent as Record<string, unknown>).pageKey !== undefined
    && (rawContent as Record<string, unknown>).modules !== undefined;
  if (isVersionedCmsContent && !cms) return { status: "temporarily-unavailable" };
  const nativeContent = native.page.content as HomepageContent & {
    productLines: HomepageContent["productLines"] & { items?: HomepageProductLineCard[] };
  };
  const content = cms?.content ?? withProductLineItems(nativeContent, nativeContent.productLines?.items, locale === "en");
  const seo = {
    title: cms?.seoTitle || native.page.seoTitle,
    description: cms?.seoDescription || native.page.seoDescription,
  };
  if (!isValidHomepageContent(content) || !hasHomepageSeo(seo)) {
    return { status: "temporarily-unavailable" };
  }
  const modules = buildHomepageModules(content, cms?.moduleOrder);
  if (!validateHomepageModules(modules)) {
    return { status: "temporarily-unavailable" };
  }
  // 首页独立 Page 已保存审过的展示路径及逐语言 alt/caption。新附件绑定在
  // WordPress 保存时校验；此处不以媒体库原图覆盖已批准的本地 WebP。
  return {
    status: "ready",
    page: {
      pageKey: "home",
      locale,
      revision: native.page.revision ?? `home-${locale}`,
      seo: {
        title: seo.title,
        description: seo.description,
        canonicalPath: "/",
      },
      modules: modules.sort((a, b) => a.order - b.order),
    },
  };
}

/** Languages whose homepage has a complete, approved PageView. */
export async function getHomepagePublicLocales(): Promise<Locale[]> {
  const results = await Promise.all(LOCALES.map(async (locale) => ({
    locale,
    result: await getHomepagePageView({ locale }),
  })));
  return results.filter(({ result }) => result.status === "ready").map(({ locale }) => locale);
}
