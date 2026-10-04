import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { wheelSkus } from "@/content/wheel-skus";
import { platformFitments } from "@/content/fitment";
import { guides } from "@/content/resources";
import { boltPatterns } from "@/content/bolt-patterns";
import { legalDocuments } from "@/content/legal";

/**
 * Sitemap.
 *
 * Generated from the content modules rather than hand-maintained, so a new
 * guide, SKU, pattern or legal document is listed the moment its module entry
 * exists — it cannot drift out of sync with the routes.
 *
 * `site.url` is a PLACEHOLDER production domain; confirm before launch.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  /** Static, hand-listed routes. */
  const staticPaths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/products", priority: 0.9 },
    { path: "/products/wheels", priority: 0.8 },
    { path: "/gallery", priority: 0.8 },
    { path: "/gallery/wheels", priority: 0.8 },
    { path: "/gallery/finishes", priority: 0.7 },
    { path: "/capabilities", priority: 0.7 },
    { path: "/custom-development", priority: 0.7 },
    { path: "/fitment", priority: 0.8 },
    { path: "/dealers", priority: 0.8 },
    { path: "/dealers/private-label", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/insights", priority: 0.8 },
    { path: "/insights/bolt-patterns", priority: 0.8 },
    { path: "/tools", priority: 0.7 },
    { path: "/tools/offset-calculator", priority: 0.8 },
    { path: "/contact", priority: 0.9 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: entry.priority,
  }));

  const skuEntries: MetadataRoute.Sitemap = wheelSkus.map((sku) => ({
    url: `${base}/products/wheels/${sku.sku.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const fitmentEntries: MetadataRoute.Sitemap = platformFitments.map((item) => ({
    url: `${base}/fitment/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const guideEntries: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${base}/insights/${guide.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const boltPatternEntries: MetadataRoute.Sitemap = boltPatterns.map((entry) => ({
    url: `${base}/insights/bolt-patterns/${entry.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const legalEntries: MetadataRoute.Sitemap = legalDocuments.map((doc) => ({
    url: `${base}/support/${doc.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    ...staticEntries,
    ...skuEntries,
    ...fitmentEntries,
    ...guideEntries,
    ...boltPatternEntries,
    ...legalEntries,
  ];
}
