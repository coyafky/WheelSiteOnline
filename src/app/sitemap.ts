import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { listPublishedWheelSlugs } from "@/lib/wheels";
import {
  flowFormedWheelsPage,
  isFlowFormedPublishingOpen,
} from "@/content/flow-formed-wheels";
import { finishesPage, isFinishesPublishingOpen } from "@/content/finish-guide";
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
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  /** Static, hand-listed routes. */
  const staticPaths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/products", priority: 0.9 },
    { path: "/products/wheels", priority: 0.8 },
    // `/gallery` and `/gallery/wheels` were removed 2026-10-06 (DEC-059): both
    // retired to permanent redirects, so they must never appear here. A
    // redirecting URL in a sitemap is a contradiction the crawler resolves
    // against the site.
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
    // 2026-10-06: these routes were implemented but missing from the sitemap.
    // Only indexable pages belong here — `/products/custom-aluminum` is
    // deliberately absent because DEC-050 keeps it `index: false` until the
    // business boundary is confirmed.
    { path: "/products/ev-components", priority: 0.7 },
    { path: "/products/safety-tires", priority: 0.8 },
    { path: "/products/wheels/forged", priority: 0.7 },
    { path: "/request-a-quote", priority: 0.9 },
  ];

  /**
   * `/products/wheels/flow-formed` is gated, so it is listed here rather than
   * in the static list above.
   *
   * PAGE-SPECS/flow-formed-wheels.md §7 keeps this route `noindex, follow` and
   * **out of the sitemap** while the process copy is unreviewed or the WP 116
   * image rights are unapproved. Reading the gate (instead of hard-coding the
   * URL) means the sitemap and the page's own `robots` can no longer disagree:
   * a URL that says "do not index me" must never appear in a file whose whole
   * purpose is to be indexed. Re-closing the gate removes it again.
   */
  if (isFlowFormedPublishingOpen(flowFormedWheelsPage.publicationGate)) {
    staticPaths.push({ path: "/products/wheels/flow-formed", priority: 0.7 });
  }

  /**
   * `/gallery/finishes` is gated too, so it is read from its gate rather than
   * hard-coded above.
   *
   * The page is honest but unconfirmed: its eight finish names are still
   * placeholders and no real swatch photograph exists, so it declares
   * `robots: { index: false, follow: true }` and publishes no canonical
   * (DEC-059). Reading the same gate here is what keeps the two from
   * disagreeing — a URL that says "do not index me" must never appear in a file
   * whose whole purpose is to be indexed. Clearing the flag re-adds it.
   */
  if (isFinishesPublishingOpen(finishesPage.publicationGate)) {
    staticPaths.push({ path: "/gallery/finishes", priority: 0.7 });
  }

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: entry.priority,
  }));

  /**
   * Wheel model pages — from the **same public collection** the catalogue page,
   * each model page's `generateStaticParams` and the enquiry revalidation read
   * (`src/lib/wheels`). PAGE-SPECS/wheel-catalog.md §11 and §13.6 require one
   * source: a sitemap that disagrees with the routes ships 404s to crawlers and
   * hides live models at the same time.
   *
   * This replaced 16 fictional `wheelSkus` URLs that never had a route behind
   * them. Models whose publication, image rights, supply, specification or
   * approved-variant conditions are not all satisfied are absent by
   * construction — the module is fail-closed, so there is nothing to filter
   * here.
   */
  const publishedSlugs = await listPublishedWheelSlugs();
  const wheelModelEntries: MetadataRoute.Sitemap = publishedSlugs.map((slug) => ({
    url: `${base}/products/wheels/${slug}`,
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
    ...wheelModelEntries,
    ...fitmentEntries,
    ...guideEntries,
    ...boltPatternEntries,
    ...legalEntries,
  ];
}
