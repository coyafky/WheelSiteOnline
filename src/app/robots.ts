import type { MetadataRoute } from "next";
import { configuredSiteUrl } from "@/lib/site-url";

/**
 * Robots policy.
 *
 * Allows the whole public site and points crawlers at the generated sitemap.
 * API endpoints are not crawlable content. HTML pages that must stay out of
 * search use their own `noindex` metadata so crawlers can read that directive.
 *
 * An unset site URL fails closed; configure the production origin at build time.
 */
export default function robots(): MetadataRoute.Robots {
  if (!configuredSiteUrl) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  const base = configuredSiteUrl.origin;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
