import type { MetadataRoute } from "next";
import { boltPatterns } from "@/content/bolt-patterns";
import { flowFormedWheelsPage, isFlowFormedPublishingOpen } from "@/content/flow-formed-wheels";
import { configuredSiteUrl } from "@/lib/site-url";
import { localizedPath } from "@/lib/i18n/types";
import { getEnglishInsightSlugs, getPublicLocalesForPath } from "@/lib/i18n/publication";
import { isCustomAluminumPageIndexable } from "@/lib/wordpress/custom-aluminum";
import { getWheelCataloguePage, listPublishedWheelSlugs } from "@/lib/wheels";

/**
 * Public content routes, generated from the same route data used by their
 * pages. The sitemap fails closed until the intended public origin is set at
 * build time, so no fallback host can leak into search indexes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!configuredSiteUrl) return [];
  const base = configuredSiteUrl.origin;
  const customAluminumIndexable = await isCustomAluminumPageIndexable();
  const flowFormedIndexable = isFlowFormedPublishingOpen(flowFormedWheelsPage.publicationGate)
    && (await getWheelCataloguePage({ processes: ["flow-formed", "low-pressure-flow-formed"] })).total > 0;
  const insightSlugs = await getEnglishInsightSlugs();

  const paths = [
    "/products",
    "/products/wheels",
    "/products/wheels/forged",
    "/products/ev-components",
    "/products/safety-tires",
    "/capabilities",
    "/custom-development",
    "/about",
    "/dealers",
    "/dealers/private-label",
    "/contact",
    "/request-a-quote",
    "/insights",
    "/insights/bolt-patterns",
    ...boltPatterns.map((item) => `/insights/bolt-patterns/${item.slug}`),
    ...[...insightSlugs].map((slug) => `/insights/${slug}`),
    "/tools",
    "/tools/offset-calculator",
    "/support/privacy",
    "/support/returns",
    "/support/shipping",
    "/support/terms",
    "/support/warranty",
  ];

  if (customAluminumIndexable) paths.push("/products/custom-aluminum");
  if (flowFormedIndexable) paths.push("/products/wheels/flow-formed");
  paths.push("/");

  const wheelSlugs = await listPublishedWheelSlugs();
  paths.push(...wheelSlugs.map((slug) => `/products/wheels/${slug}`));

  const uniquePaths = [...new Set(paths)];
  const entries = await Promise.all(uniquePaths.map(async (path) => {
    const readyLocales = await getPublicLocalesForPath(path);
    return readyLocales.map((locale) => ({
      url: `${base}${localizedPath(path, locale)}`,
      changeFrequency: "monthly" as const,
      priority: priorityFor(path),
    }));
  }));

  return entries.flat();
}

function priorityFor(path: string): number {
  if (path === "/") return 1;
  if (["/products", "/contact", "/request-a-quote"].includes(path)) return 0.9;
  if (["/products/wheels", "/insights", "/tools/offset-calculator"].includes(path)) return 0.8;
  if (path.startsWith("/products/") || path.startsWith("/insights/")) return 0.7;
  return 0.6;
}
