import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { ArrowDownRight, ArrowRight, Check } from "lucide-react";

import {
  FLOW_FORMED_PROCESSES,
  processLabelEn,
  type WheelCatalogueCard,
  type WheelCatalogueInput,
  type WheelCataloguePageView,
} from "@/lib/wheels";
import type {
  CtaLink,
  FlowFormedProcessBoundaryCard,
  FlowFormedWheelsPage,
  MediaAsset,
} from "@/content/types";
import { SiteBreadcrumbs, type SiteBreadcrumbItem } from "@/components/site-breadcrumbs";

import { WheelCatalogueCardView } from "./wheel-catalogue-card";
import { WheelCataloguePagination } from "./wheel-catalogue-pagination";
import {
  WheelCatalogueAppliedChips,
  WheelCatalogueFilters,
  WheelCatalogueSort,
} from "./wheel-catalogue-filters";

/**
 * `/products/wheels/flow-formed` — WFF01–WFF05 viewports.
 * Copy comes from `@/content/flow-formed-wheels` (Page SPEC §3 verbatim);
 * models and facets come from `@/lib/wheels`.
 *
 * ── THE PROCESS LOCK LIVES IN THE ROUTE, NOT IN THE URL ─────────────────────
 * Every result URL this file builds passes `lockedProcesses` + `path`, so the
 * filter form, the applied chips, the sort form and the pager all return to
 * `/products/wheels/flow-formed` with the process boundary intact and **no
 * `process=` parameter at all**. That is the whole point of §4 WFF04: a visitor
 * cannot widen this page to the full catalogue by editing the URL, and the same
 * result set never gets a second indexable address on the catalogue route.
 *
 * ── EVERYTHING VISIBLE IS SHARED WITH THE CATALOGUE ────────────────────────
 * §4 WFF04: "产品卡复用轮毂产品目录的单图、规格摘要和发布规则". This page therefore renders
 * the same `<WheelCatalogueCardView>`, `<WheelCatalogueFilters>`,
 * `<WheelCatalogueSort>` and `<WheelCataloguePagination>` — never a second card,
 * image picker or pager.
 *
 * The filters and the pager each take `basePath` + `lockedProcesses` for exactly
 * this route. Without them a filter change or a "page 2" link would silently
 * move the visitor to `/products/wheels`: a bigger result set, and a URL that can
 * widen the process boundary. Both props were added to the shared components on
 * 2026-10-06; this page briefly carried its own pager before that, which is the
 * kind of copy that drifts.
 *
 * ── NO PRODUCT PHOTOGRAPH IS BORROWED ──────────────────────────────────────
 * The one model image on this page (WFF01) is an approved model's own primary
 * image, chosen deterministically as the first approved model — never a random
 * catalogue candidate, and never a styled "looks like flow forming" picture
 * (§4 last paragraph: catalogue photography carries no process evidence here).
 */

const BASE_PATH = "/products/wheels/flow-formed";
const CATALOGUE_PATH = "/products/wheels";
const MODELS_ANCHOR = "flow-formed-models";
/** Header clearance for the two in-page anchors (§6). */
const ANCHOR_OFFSET = "scroll-mt-[96px]";

/* ---------------------------------------------------------------------------
 * Query helpers
 * ------------------------------------------------------------------------- */

/**
 * Did the **visitor** narrow anything?
 *
 * `view.normalizedQuery.processes` is always populated on this route because the
 * route itself locks the process axis, so `WheelCataloguePageView.isFiltered`
 * would read `true` on an untouched page. This predicate reads the axes a
 * visitor can actually set, which is what decides the result wording and the
 * canonical / robots strategy (§7).
 */
export function hasUserFilters(query: WheelCatalogueInput): boolean {
  return Boolean(query.q || query.diameters?.length || query.widths?.length || query.pcds?.length);
}

/** §4 WFF04: the result count. Only approved models are ever counted. */
function resultSummary(view: WheelCataloguePageView): string {
  const search = view.normalizedQuery.q;
  if (search) return `${view.total} models found for “${search}”`;
  if (hasUserFilters(view.normalizedQuery)) {
    return `${view.total} models match the selected production specifications`;
  }
  return `${view.total} approved wheel models`;
}

/** The recorded process scope, from the single label mapping point. */
const SCOPE_LABEL = FLOW_FORMED_PROCESSES.map((key) => processLabelEn(key) ?? key).join(" · ");

/**
 * Carry the live filter snapshot onto the enquiry URL (§3 WFF05: the context
 * must include the current filters and the page source).
 *
 * Only the three axes a visitor can set travel: the locked process is the
 * route's identity, not a visitor choice, and it is already carried as
 * `wheel_route=flow-formed`.
 */
function withFilterSnapshot(baseHref: string, query: WheelCatalogueInput): string {
  const [path, search] = baseHref.split("?");
  const sp = new URLSearchParams(search ?? "");
  if (query.q) sp.set("q", query.q);
  if (query.diameters?.length) sp.set("diameter", query.diameters.join(","));
  if (query.widths?.length) sp.set("width", query.widths.join(","));
  if (query.pcds?.length) sp.set("pcd", query.pcds.join(","));
  return `${path}?${sp.toString()}`;
}

/* ---------------------------------------------------------------------------
 * Shared pieces
 * ------------------------------------------------------------------------- */

function SectionHeading({
  id,
  eyebrow,
  heading,
  lead,
  dark = false,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  lead?: string;
  dark?: boolean;
}) {
  return (
    <div data-reveal className="max-w-[820px]">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.64rem] font-bold tracking-[0.18em] text-forge">
          {id.toUpperCase()}
        </span>
        <span className={`h-px w-10 ${dark ? "bg-white/18" : "bg-ink/16"}`} aria-hidden="true" />
        <p className={`eyebrow ${dark ? "!text-forge-bright" : ""}`}>{eyebrow}</p>
      </div>
      <h2
        id={`${id.toLowerCase()}-title`}
        className={`mt-5 font-display text-[clamp(1.7rem,4.2vw,2.9rem)] font-800 uppercase leading-[0.98] tracking-[-0.02em] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {heading}
      </h2>
      {lead ? (
        <p
          className={`mt-5 text-[1.02rem] leading-relaxed ${dark ? "text-white/64" : "text-steel"}`}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/** Renders approved media, falling back to the brand grid instead of a 404. */
function EquipmentVisual({ media }: { media: MediaAsset }) {
  if (!media.hasRender || media.approvalStatus !== "approved") {
    return (
      <div className="fh-industrial-grid absolute inset-0" role="img" aria-label={media.alt} />
    );
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      className="object-cover"
      sizes="(min-width: 1024px) 40vw, 100vw"
    />
  );
}

/* ---------------------------------------------------------------------------
 * WFF01 — hero, plus one approved model
 * ------------------------------------------------------------------------- */

function FeaturedModel({ card }: { card: WheelCatalogueCard }) {
  const extraDiameters = card.diametersTotal - card.diameters.length;

  return (
    <figure data-reveal className="border border-white/16 bg-hero">
      {/* 1:1 + object-contain: a wheel is round, and `cover` would crop the rim. */}
      <div className="relative aspect-square w-full">
        <Image
          src={card.primaryImage}
          alt={`Fenghuai wheel model ${card.model}, front view`}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain"
          priority
        />
      </div>
      <figcaption className="border-t border-white/12 p-5">
        <p className="font-mono text-[0.95rem] font-600 uppercase tracking-[0.08em] text-white">
          {card.model}
        </p>
        {/* §3 WFF01: the recorded process tag, rendered from the label mapping
            (`processLabel`), never re-spelled here. */}
        {card.processLabel ? (
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-forge">
            {card.processLabel}
          </p>
        ) : null}

        {/* Recorded size range and configuration count. No price, no stock, no
            weight figure, no vehicle hint and no third-party style name (§3). */}
        <dl className="mt-4 grid gap-2 text-[0.78rem]">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-white/50">Recorded diameters</dt>
            <dd className="text-right text-white/85">
              {card.diameters.length
                ? card.diameters.map((d) => `${d}"`).join(" · ")
                : "—"}
              {extraDiameters > 0 ? (
                <span className="text-white/45"> +{extraDiameters}</span>
              ) : null}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-white/50">Recorded configurations</dt>
            <dd className="text-right text-white/85">{card.approvedVariantCount}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-white/50">Recorded process</dt>
            <dd className="text-right text-white/85">{card.processLabel ?? "—"}</dd>
          </div>
        </dl>

        <Link
          href={`${CATALOGUE_PATH}/${card.slug}`}
          className="group mt-5 inline-flex min-h-11 items-center gap-1.5 font-display text-[0.72rem] font-700 uppercase tracking-[0.13em] text-forge transition-colors hover:text-white"
        >
          View specifications
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </figcaption>
    </figure>
  );
}

/**
 * No-product layout for WFF01 (§1: "没有批准图时使用无产品占位布局").
 *
 * Deliberately **not** an image frame: §3 WFF01 forbids standing in a random
 * catalogue candidate, and §6 forbids leaving a blank picture box on mobile, so
 * this panel is a process graphic and is desktop-only.
 */
function NoApprovedModel() {
  return (
    <div
      data-reveal
      className="hidden border border-white/16 bg-white/[0.035] p-6 lg:block"
    >
      <div className="relative h-40 w-full overflow-hidden border border-white/12">
        <div className="fh-industrial-grid absolute inset-0 opacity-80" aria-hidden="true" />
      </div>
      <p className="mt-5 text-sm leading-6 text-white/60">
        No approved flow-formed model is published on this route yet. The route
        explanation above is unchanged by that.
      </p>
    </div>
  );
}

export function FlowFormedHero({
  content,
  featured,
  breadcrumbItems,
}: {
  content: FlowFormedWheelsPage;
  /** First approved flow-formed model, or `null` when none is published. */
  featured: WheelCatalogueCard | null;
  breadcrumbItems?: SiteBreadcrumbItem[];
}) {
  const { hero } = content;

  return (
    <section
      id="top"
      aria-labelledby="wff01-title"
      className="relative isolate overflow-hidden bg-ink text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_24%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
        aria-hidden="true"
      />

      {/* Desktop ~55/45 (text / one product image, §6). On mobile the DOM order
          is copy → actions → image, and the image is simply absent when no
          model is approved.

          Every grid on this page declares `grid-cols-1` at the base size so its
          track is `minmax(0, 1fr)`: an implicit `auto` track sizes to the widest
          item's min-content width, which is what pushes a long, `nowrap` CTA
          pill past the viewport on a narrow phone. */}
      <div className="container-fh grid grid-cols-1 gap-10 pb-16 pt-[124px] lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:items-start lg:gap-16 lg:pb-20 lg:pt-[156px]">
        <div data-reveal>
          <SiteBreadcrumbs
            label="Breadcrumb"
            tone="dark"
            items={breadcrumbItems ?? hero.breadcrumb.map((crumb) => ({ label: crumb.label, href: crumb.href }))}
          />

          <p className="eyebrow mt-6">{hero.eyebrow}</p>
          {/* The colour is stated on the <h1> itself, not inherited from the
              section: the generated theme sets heading ink by landmark
              (`site-theme.css:11-14`), so an inherited `text-white` never
              reached this heading (measured #292621 on #292621 — 1.00:1). */}
          <h1
            id="wff01-title"
            className="mt-4 max-w-[680px] font-display text-[clamp(1.95rem,5.4vw,3.6rem)] font-800 uppercase leading-[0.92] tracking-[-0.035em] text-white"
          >
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-[600px] text-[0.98rem] leading-7 text-white/72">
            {hero.lead}
          </p>
          <p className="mt-4 max-w-[600px] border-l-2 border-forge pl-5 text-sm leading-6 text-white/56">
            {hero.boundary}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={hero.primaryCta.href} className="btn-pill-solid">
              {hero.primaryCta.label}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={hero.secondaryCta.href} className="btn-pill-outline !text-white">
              {hero.secondaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {featured ? <FeaturedModel card={featured} /> : <NoApprovedModel />}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * WFF02 — process boundary
 * ------------------------------------------------------------------------- */

function BoundaryCardBody({ card }: { card: FlowFormedProcessBoundaryCard }) {
  return (
    <>
      <h3 className="font-display text-[1.05rem] font-700 uppercase leading-tight tracking-[0.02em] text-ink">
        {card.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-steel">{card.body}</p>
    </>
  );
}

export function FlowFormedProcessDefinition({
  section,
}: {
  section: FlowFormedWheelsPage["processDefinition"];
}) {
  return (
    <section
      id="wff02"
      aria-labelledby="wff02-title"
      className={`${ANCHOR_OFFSET} border-b border-border bg-soft py-16 sm:py-20 lg:py-24`}
    >
      <div className="container-fh">
        <SectionHeading
          id={section.id}
          eyebrow={section.eyebrow}
          heading={section.heading}
          lead={section.body}
        />

        {/* Three columns on desktop, one on mobile (§6). No pseudo cross-section
            graphic: the comparison is textual on purpose (§1 WFF02). */}
        <ul className="mt-10 grid gap-5 lg:grid-cols-3" data-reveal-group>
          {section.cards.map((card) =>
            card.href ? (
              // The fork to the forging route. It leaves this page rather than
              // becoming a fourth product card (§3 WFF02).
              <li key={card.id} className="border border-forge/45 bg-forge-soft">
                <Link
                  href={card.href}
                  className="group flex h-full flex-col p-6 transition-colors hover:border-forge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge"
                >
                  <BoundaryCardBody card={card} />
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-display text-[0.72rem] font-700 uppercase tracking-[0.13em] text-forge transition-colors group-hover:text-forge-deep">
                    Discuss a forged wheel program
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ) : (
              <li key={card.id} className="flex flex-col border border-border bg-card p-6">
                <BoundaryCardBody card={card} />
              </li>
            ),
          )}
        </ul>

        <p className="mt-8 max-w-[860px] border-l-2 border-forge pl-5 text-sm leading-6 text-ink/68">
          {section.evidenceNote}
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * WFF03 — manufacturing route
 * ------------------------------------------------------------------------- */

export function FlowFormedManufacturingRoute({
  section,
}: {
  section: FlowFormedWheelsPage["manufacturingRoute"];
}) {
  return (
    <section
      id="wff03"
      aria-labelledby="wff03-title"
      className={`${ANCHOR_OFFSET} bg-ink py-16 text-white sm:py-20 lg:py-24`}
    >
      <div className="container-fh">
        <SectionHeading id={section.id} eyebrow={section.eyebrow} heading={section.heading} dark />

        {/*
          One grid, no duplicated figure.

          Mobile (single column): the equipment image sits between step 02 and
          step 03, exactly as §4 WFF03 requires.

          Desktop: the four steps occupy column 1 and the image is placed at
          column 2 / row 1, spanning the four rows the steps define (§6: "左侧
          四步路线，右侧 WP 116"). The span is four because §3 WFF03 defines a
          four-step route; a fifth step would need this span extended.
        */}
        <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
          {section.steps.map((step, index) => (
            <Fragment key={step.step}>
              <article className="border-t border-white/12 pt-6 lg:col-start-1">
                <p className="font-mono text-[0.68rem] font-700 tracking-[0.18em] text-forge">
                  {step.step}
                </p>
                <h3 className="mt-3 font-display text-[1.05rem] font-700 uppercase leading-tight tracking-[0.02em] text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[640px] text-sm leading-6 text-white/60">{step.body}</p>
              </article>
              {index === 1 ? (
                // `grid-row: 1 / span 4` in one declaration: the four steps of
                // §3 WFF03 occupy column 1, the equipment image column 2.
                <figure className="lg:col-start-2 lg:[grid-row:1_/_span_4]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-white/14 bg-hero">
                    <EquipmentVisual media={section.equipment} />
                  </div>
                  <figcaption className="mt-3 text-[0.78rem] leading-6 text-white/55">
                    {section.equipment.caption}
                  </figcaption>
                </figure>
              ) : null}
            </Fragment>
          ))}
        </div>

        <p className="mt-10 max-w-[860px] border-l-2 border-forge pl-5 text-sm leading-6 text-white/64">
          {section.evidenceBoundary}
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * WFF04 — the locked catalogue
 * ------------------------------------------------------------------------- */

/**
 * WFF04 — valid but empty. 200 + the §3 WFF04 wording, in place.
 *
 * No "you might like" models, no placeholder cards for the 40 image-less
 * process candidates (§3 WFF04, §9): an honest "no approved model matches" is
 * the answer, and the current filter snapshot travels with the enquiry.
 */
function EmptyResult({
  section,
  inquiryCta,
  view,
}: {
  section: FlowFormedWheelsPage["catalogue"];
  inquiryCta: CtaLink;
  view: WheelCataloguePageView;
}) {
  const query = view.normalizedQuery;

  return (
    <section
      aria-labelledby="wff04-empty-title"
      className="rounded-lg border border-border bg-card p-6 lg:p-8"
    >
      <h3
        id="wff04-empty-title"
        className="font-display text-[clamp(1.3rem,2.8vw,1.7rem)] font-800 uppercase leading-tight tracking-[-0.01em] text-ink"
      >
        {section.emptyResultHeading}
      </h3>
      <p className="mt-4 max-w-[680px] text-[0.95rem] leading-relaxed text-steel">
        {section.emptyResultBody}
      </p>

      <WheelCatalogueAppliedChips
        facets={view.facets}
        query={query}
        lockedProcesses={FLOW_FORMED_PROCESSES}
        basePath={BASE_PATH}
        className="mt-5"
      />

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link href={BASE_PATH} className="btn-pill-solid !text-white">
          Clear the size and PCD filters
        </Link>
        <Link href={withFilterSnapshot(inquiryCta.href, query)} className="btn-pill-outline !text-ink">
          Send the required specification
        </Link>
      </div>
    </section>
  );
}

export function FlowFormedCatalogue({
  section,
  inquiryCta,
  view,
}: {
  section: FlowFormedWheelsPage["catalogue"];
  inquiryCta: CtaLink;
  /** The locked-catalogue page view. `view.total === 0` is a valid empty state. */
  view: WheelCataloguePageView;
}) {
  const query = view.normalizedQuery;
  const summary = resultSummary(view);

  return (
    <section
      id={MODELS_ANCHOR}
      aria-labelledby="wff04-title"
      className={`${ANCHOR_OFFSET} border-b border-border bg-soft py-12 lg:py-16`}
    >
      <div className="container-fh-wide">
        <SectionHeading id={section.id} eyebrow={section.eyebrow} heading={section.heading} />

        {/* Mobile: the result count sits above the Filters drawer, not after it. */}
        <p className="mt-6 font-display text-[0.78rem] font-700 uppercase tracking-[0.1em] text-ink lg:hidden">
          {summary}
        </p>

        <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start lg:gap-x-10">
          <div className="mt-4 lg:sticky lg:top-24 lg:mt-0 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <WheelCatalogueFilters
              facets={view.facets}
              query={query}
              total={view.total}
              // Deliberately the *visitor's* filters, not `view.isFiltered`:
              // the route's own process lock is not a filter the visitor set.
              isFiltered={hasUserFilters(query)}
              lockedProcesses={FLOW_FORMED_PROCESSES}
              basePath={BASE_PATH}
            />
          </div>

          <div className="mt-6 lg:mt-0">
            {view.total === 0 ? (
              <EmptyResult section={section} inquiryCta={inquiryCta} view={view} />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="mr-auto hidden font-display text-[0.78rem] font-700 uppercase tracking-[0.1em] text-ink lg:block">
                    {summary}
                  </p>
                  <WheelCatalogueSort
                    query={query}
                    lockedProcesses={FLOW_FORMED_PROCESSES}
                    basePath={BASE_PATH}
                  />
                </div>

                <WheelCatalogueAppliedChips
                  facets={view.facets}
                  query={query}
                  lockedProcesses={FLOW_FORMED_PROCESSES}
                  basePath={BASE_PATH}
                  className="mt-4"
                />

                <p className="mt-4 text-[0.75rem] leading-relaxed text-muted-foreground">
                  Specifications shown in the catalogue are production records, not a
                  vehicle-fitment guarantee.
                </p>

                {/* Same grid, same card and same 24-per-page rule as the catalogue (§4). */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-5">
                  {view.cards.map((card, index) => (
                    <WheelCatalogueCardView key={card.slug} card={card} priority={index < 4} />
                  ))}
                </div>

                {/*
                 * The shared pager, given this route's own base path and locked
                 * processes. A second implementation here would drift from the
                 * catalogue's — this page carried one until the shared
                 * component took both props (2026-10-06).
                 */}
                <WheelCataloguePagination
                  query={query}
                  page={view.page}
                  totalPages={view.totalPages}
                  lockedProcesses={FLOW_FORMED_PROCESSES}
                  basePath={BASE_PATH}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * WFF05 — fitment and supply review
 * ------------------------------------------------------------------------- */

export function FlowFormedInquiry({
  section,
  view,
}: {
  section: FlowFormedWheelsPage["inquiry"];
  view: WheelCataloguePageView;
}) {
  const hasFilters = hasUserFilters(view.normalizedQuery);

  return (
    <section
      id={section.anchor}
      aria-labelledby="wff05-title"
      className={`${ANCHOR_OFFSET} bg-ink py-16 text-white sm:py-20 lg:py-24`}
    >
      <div className="container-fh grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.65fr)] lg:gap-16">
        <div>
          <SectionHeading id={section.id} eyebrow={section.eyebrow} heading={section.heading} dark />
          <ul className="mt-8 grid gap-3" data-reveal-group>
            {section.checklist.map((item) => (
              <li
                key={item}
                className="flex min-h-11 items-start gap-3 border-t border-white/12 pt-3 text-sm leading-6 text-white/72"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-forge" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/*
          The enquiry entry. There is no variant selector on this page, so
          nothing here invents a `productionCode` (§3 WFF05). What does travel
          is the recorded scope, the page source and — when the visitor filtered
          — the exact filter snapshot, shown with the same removable chips the
          result list uses.
        */}
        <div className="lg:pt-20">
          <div className="border border-white/14 bg-white/[0.035] p-6">
            <p className="font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-white/50">
              Recorded process scope
            </p>
            <p className="mt-2 text-[0.82rem] leading-6 text-white/72">{SCOPE_LABEL}</p>

            {hasFilters ? (
              <>
                <p className="mt-5 border-t border-white/12 pt-5 font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-white/50">
                  Filter snapshot carried into the enquiry
                </p>
                <WheelCatalogueAppliedChips
                  facets={view.facets}
                  query={view.normalizedQuery}
                  lockedProcesses={FLOW_FORMED_PROCESSES}
                  basePath={BASE_PATH}
                  className="mt-3"
                />
              </>
            ) : null}

            {/* This is the page's longest CTA label and the only pill whose text
                can exceed a 320px-wide viewport, so it is allowed to wrap
                instead of forcing horizontal scroll. The wording is §3 verbatim;
                only the box changes. */}
            <Link
              href={withFilterSnapshot(section.primaryCta.href, view.normalizedQuery)}
              className="btn-pill-solid mt-6 !whitespace-normal text-center"
            >
              {section.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
