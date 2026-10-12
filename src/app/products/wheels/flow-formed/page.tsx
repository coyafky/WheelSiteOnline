import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  FlowFormedCatalogue,
  FlowFormedHero,
  FlowFormedInquiry,
  FlowFormedManufacturingRoute,
  FlowFormedProcessDefinition,
  hasUserFilters,
} from "@/components/wheels/flow-formed-page";
import {
  flowFormedWheelsPage,
  isFlowFormedPublishingOpen,
} from "@/content/flow-formed-wheels";
import {
  FLOW_FORMED_PROCESSES,
  getWheelCataloguePage,
  isPageOutOfRange,
  parseCatalogueSearchParams,
  type WheelCatalogueInput,
  type WheelCataloguePageView,
} from "@/lib/wheels";
import { getFlowFormedWheelsPage } from "@/lib/wordpress/flow-formed";
import { getLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/types";

/**
 * `/products/wheels/flow-formed` — WFF01–WFF05 (PAGE-SPECS/flow-formed-wheels.md).
 *
 * This route is the destination `/products/wheels` already links to from its
 * W01 route fork, so it has to be a real page rather than a 404. It is a
 * Server Component for the same reason the catalogue is (§12): the approved
 * model set is never serialised to the browser, the filter is a GET form and the
 * pager is plain links, so filtering, sorting and paging all work without JS.
 *
 * ── THE PROCESS BOUNDARY IS NOT A QUERY PARAMETER ───────────────────────────
 * `parseCatalogueSearchParams` reads `process` because the main catalogue needs
 * it. Here that value is **discarded** (`lockedQuery` overwrites it with
 * `FLOW_FORMED_PROCESSES`) before anything else sees it, and every URL this page
 * generates drops `process` entirely. So `?process=low-pressure-cast`,
 * `?process=not-specified` and `?process=` are all ignored and produce exactly
 * the same page as no parameter at all — §4 WFF04 / §9: the visitor cannot widen
 * this page from the URL, and the same results never get a second indexable
 * address on the catalogue route.
 *
 * ── ONE PUBLIC COLLECTION, NO PARALLEL DATA PATH ────────────────────────────
 * Models come from `getWheelCataloguePage` only. `@/content/wheel-skus` and the
 * original `WheelSketch` prototype renderer are not imported here: the eligible
 * set (image + publication + image rights + supply + verified specification + at
 * least one approved variant) is the catalogue's own, so a model that appears on
 * this page always has a working detail route.
 *
 * ── THE PUBLISHING GATE IS IN METADATA, NOT IN THE CSS ─────────────────────
 * `publicationGate` is false/pending today (process wording unreviewed, WP 116
 * rights pending), so this route declares `robots: { index: false, follow: true }`
 * and publishes **no canonical URL**. §7 requires that while either is
 * unconfirmed, and it is why the route is absent from `sitemap.ts`. The page
 * itself still renders in full — content, model grid and all. Clearing both
 * flags in `@/content/flow-formed-wheels` is the only edit needed to make it
 * indexable; nothing here has to be un-commented or removed.
 */

type FlowFormedPageProps = {
  /** Next 16: `searchParams` is a Promise, and it must be awaited. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * URL query → the catalogue query this route actually runs.
 *
 * The spread keeps the visitor's own axes (search, diameter, width, PCD, sort,
 * page) and then **overwrites** anything the URL said about `process`. There is
 * no branch that lets a URL value through: an unknown value, an empty value and
 * one of the two permitted values all end up as the same locked pair.
 */
function lockedQuery(parsed: WheelCatalogueInput): WheelCatalogueInput {
  return { ...parsed, processes: FLOW_FORMED_PROCESSES };
}

/* ---------------------------------------------------------------------------
 * SEO (§7)
 * ------------------------------------------------------------------------- */

export async function generateMetadata({
  searchParams,
}: FlowFormedPageProps): Promise<Metadata> {
  const parsed = parseCatalogueSearchParams(await searchParams);
  const view = await getWheelCataloguePage(lockedQuery(parsed));

  const { seo, publicationGate } = flowFormedWheelsPage;
  const gateOpen = isFlowFormedPublishingOpen(publicationGate);

  const requestedPage = parsed.page ?? 1;
  // A filtered result set, an empty result set and an unreviewed page are all
  // `noindex, follow`; only the untouched, approved, populated page may be
  // indexed (§7, and the catalogue's own rules for paged / filtered URLs).
  const noindex = !gateOpen || hasUserFilters(view.normalizedQuery) || view.total === 0;

  // `absolute`: the root layout's `%s | Fenghuai` template would otherwise
  // append the brand a second time. Title and description are §7 verbatim.
  const head: Metadata = {
    title: { absolute: seo.title },
    description: seo.description,
    robots: { index: !noindex, follow: true },
  };

  // Fail-closed: while a gate flag is unresolved the route publishes no canonical
  // at all, so nothing points at an unreviewed page (DEC-050 pattern).
  if (!gateOpen) return head;

  return {
    ...head,
    alternates: {
      canonical:
        noindex || requestedPage === 1 ? seo.canonical : `${seo.canonical}?page=${requestedPage}`,
    },
  };
}

/* ---------------------------------------------------------------------------
 * Structured data (§7)
 * ------------------------------------------------------------------------- */

/**
 * `CollectionPage` + the current page's approved items.
 *
 * No `Offer`, no price and no availability: there is nothing purchasable on a
 * process page, and an `Offer` node would publish one that does not exist. The
 * per-model `Product` node belongs to the detail route, which owns the real
 * specification record.
 */
function collectionSchema(
  view: WheelCataloguePageView,
  headline: string,
  description: string,
  canonical: string,
) {
  const positionBase = (view.page - 1) * view.pageSize;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: headline,
    description,
    url: canonical,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: view.cards.length,
      itemListElement: view.cards.map((card, index) => ({
        "@type": "ListItem",
        position: positionBase + index + 1,
        url: `/products/wheels/${card.slug}`,
        name: card.model,
      })),
    },
  };
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default async function FlowFormedWheelsRoute({ searchParams }: FlowFormedPageProps) {
  const locale = await getLocale();
  const parsed = parseCatalogueSearchParams(await searchParams);
  const view = await getWheelCataloguePage(lockedQuery(parsed));

  // An out-of-range page is a real 404 rather than a silent slide to the last
  // page (§9, catalogue §5.2). A *valid* filter with no matches is not: it
  // returns 200 with the §3 WFF04 empty state.
  if (isPageOutOfRange(view, parsed.page ?? 1)) notFound();

  const content = await getFlowFormedWheelsPage();

  // WFF01 shows one approved model — the first by stable model code, read from
  // the unfiltered locked set so the hero never changes while a visitor filters,
  // and never picked at random (§3 WFF01). Null means "no approved model", which
  // renders the process placeholder instead of a borrowed catalogue photo.
  const heroView = await getWheelCataloguePage({
    processes: FLOW_FORMED_PROCESSES,
    sort: "model-asc",
    page: 1,
  });
  const featured = heroView.cards[0] ?? null;

  return (
    <>
      {/* WFF01 — what this page is, the boundary it works inside, one model */}
      <FlowFormedHero
        content={content}
        featured={featured}
        breadcrumbItems={content.hero.breadcrumb.map((crumb, index) => ({
          label: crumb.label,
          href:
            index === content.hero.breadcrumb.length - 1
              ? undefined
              : localizedPath(crumb.href, locale),
        }))}
      />

      {/* WFF02 — rim-section forming vs. a forged wheel, with the forging fork */}
      <FlowFormedProcessDefinition section={content.processDefinition} />

      {/* WFF03 — the four-step route, WP 116 as a supplier-provided scene */}
      <FlowFormedManufacturingRoute section={content.manufacturingRoute} />

      {/* WFF04 — the locked catalogue: filters, 24 approved models per page */}
      <FlowFormedCatalogue
        section={content.catalogue}
        inquiryCta={content.inquiry.primaryCta}
        view={view}
      />

      {/* WFF05 — what still has to be confirmed before an order */}
      <FlowFormedInquiry section={content.inquiry} view={view} />

      {/* Only our own resolved catalogue data is serialised — no visitor input
          reaches this node, and an empty result set emits nothing. */}
      {view.total > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              collectionSchema(
                view,
                content.catalogue.heading,
                content.seo.description,
                content.seo.canonical,
              ),
            ),
          }}
        />
      ) : null}
    </>
  );
}
