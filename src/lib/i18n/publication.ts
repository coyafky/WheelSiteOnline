import "server-only";

import { cache } from "react";
import { getBoltPattern } from "@/content/bolt-patterns";
import { getPlatform } from "@/content/fitment";
import { flowFormedWheelsPage, isFlowFormedPublishingOpen } from "@/content/flow-formed-wheels";
import { getWheelCataloguePage, listPublishedWheelSlugs } from "@/lib/wheels";
import { isCustomAluminumPageIndexable } from "@/lib/wordpress/custom-aluminum";
import { getHomepagePublicLocales } from "@/lib/wordpress/homepage";
import { getHomepagePageView } from "@/lib/wordpress/homepage";
import { getInsightGuideDocuments } from "@/lib/wordpress/insights";
import { stripLocalePrefix, type Locale } from "./types";

export type RoutePublicationDecision = {
  path: string;
  locale: Locale;
  status: "public" | "preview-only" | "closed" | "unavailable";
  reason: string;
  revision: string | null;
  approvalSource: "homepage-page" | "approved-local-home-snapshot" | "existing-english-contract" | null;
  publicLocales: readonly Locale[];
};

export const getEnglishInsightSlugs = cache(async () =>
  new Set((await getInsightGuideDocuments({ locale: "en" })).map(({ guide }) => guide.slug)));

/**
 * The public variants of one route. Locale registration is not publication.
 *
 * The homepage already has an independently approved PageView per language.
 * Other page families still have English body fallbacks, so their translated
 * URLs remain closed until the corresponding content adapter can prove that
 * the body, SEO and media belong to an approved locale revision.
 */
export const getPublicLocalesForPath = cache(async (pathname: string): Promise<readonly Locale[]> => {
  const path = stripLocalePrefix(pathname);
  if (path === "/") return getHomepagePublicLocales();

  if (path === "/products/custom-aluminum") {
    return (await isCustomAluminumPageIndexable()) ? ["en"] : [];
  }

  if (path === "/products/wheels/flow-formed") {
    const publicationOpen = isFlowFormedPublishingOpen(flowFormedWheelsPage.publicationGate)
      && (await getWheelCataloguePage({ processes: ["flow-formed", "low-pressure-flow-formed"] })).total > 0;
    return publicationOpen ? ["en"] : [];
  }

  if (path.startsWith("/products/wheels/") && path !== "/products/wheels/forged") {
    const slug = path.slice("/products/wheels/".length);
    return (await listPublishedWheelSlugs()).includes(slug) ? ["en"] : [];
  }

  if (path.startsWith("/fitment/")) {
    return getPlatform(path.slice("/fitment/".length)) ? ["en"] : [];
  }

  if (path.startsWith("/insights/bolt-patterns/")) {
    return getBoltPattern(path.slice("/insights/bolt-patterns/".length)) ? ["en"] : [];
  }

  if (path.startsWith("/insights/") && path !== "/insights/bolt-patterns") {
    return (await getEnglishInsightSlugs()).has(path.slice("/insights/".length)) ? ["en"] : [];
  }

  // The remaining page families still use their existing English publication
  // contracts. Their translated bodies are not independently approved yet.
  return ["en"];
});

/** A route's single public decision, including why a locale is closed. */
export const getRoutePublicationDecision = cache(async (
  pathname: string,
  locale: Locale,
  preview = false,
): Promise<RoutePublicationDecision> => {
  const path = stripLocalePrefix(pathname);
  const publicLocales = await getPublicLocalesForPath(path);
  if (path === "/") {
    const result = await getHomepagePageView({ locale, preview });
    if (preview && result.status === "ready") {
      return { path, locale, status: "preview-only", reason: "authorized-preview", revision: result.page.revision,
        approvalSource: null, publicLocales };
    }
    if (!preview && result.status === "ready" && publicLocales.includes(locale)) {
      return { path, locale, status: "public", reason: "approved-homepage-page", revision: result.page.revision,
        approvalSource: result.page.revision === "local-home-v1" ? "approved-local-home-snapshot" : "homepage-page", publicLocales };
    }
    return { path, locale, status: result.status === "temporarily-unavailable" ? "unavailable" : "closed",
      reason: result.status, revision: null, approvalSource: null, publicLocales };
  }
  if (preview) {
    return { path, locale, status: "preview-only", reason: "authorized-preview-route", revision: null,
      approvalSource: null, publicLocales };
  }
  if (publicLocales.includes(locale)) {
    return { path, locale, status: "public", reason: "existing-english-publication-contract", revision: null,
      approvalSource: "existing-english-contract", publicLocales };
  }
  return { path, locale, status: "closed", reason: "locale-content-not-approved", revision: null,
    approvalSource: null, publicLocales };
});
