import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Robots policy.
 *
 * Allows the whole public site and points crawlers at the generated sitemap.
 * There is no admin, staging or search surface to disallow today — if one is
 * added later, list it here rather than leaving it crawlable by default.
 *
 * `site.url` is a PLACEHOLDER production domain; confirm before launch.
 */
export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
