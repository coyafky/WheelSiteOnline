import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, Info } from "lucide-react";
import { AutomotiveBackdrop } from "@/components/automotive-backdrop";
import { automotiveScenes } from "@/content/automotive-scenes";
import type { EvHousingCategory, EvHousingPageContent, MediaAsset } from "@/content/types";

/**
 * `/products/ev-components` — EV01–EV06 from `PAGE-SPECS/ev-components.md`.
 *
 * ── THE TWO RULES THIS FILE ENFORCES STRUCTURALLY ───────────────────────────
 * 1. Nothing here names a part the line does not publish. The old page listed
 *    fifteen types across motor, controller and battery systems; the component
 *    now renders `content.categories.items` and nothing else, so a battery tray
 *    or a PDU cannot reappear without a content edit that a reviewer sees.
 * 2. Every photograph carries its own boundary. The caption on each asset is
 *    part of the card, not optional decoration — it is where WP 38 says it is
 *    batch staging rather than welding evidence, and where WP 24 says the water
 *    passage is not visible. Removing a caption would publish a stronger claim,
 *    so captions are rendered unconditionally alongside approved media.
 *
 * ── VIEWPORT BEHAVIOUR IS CSS, NOT STATE ────────────────────────────────────
 * The mobile and desktop layouts are the same markup under different Tailwind
 * breakpoints. In particular EV05 renders a real `<table>` from `md` upward and
 * per-item evidence cards below it — both come from the same rows array, and
 * neither is a horizontally scrolling table. No viewport is detected in JS.
 *
 * ── THE ACTION IS AN ASSESSMENT ────────────────────────────────────────────
 * Two anchors are the page's own scroll targets (`#housing-categories`,
 * `#engineering-assessment`); every enquiry link carries `product_line`,
 * `category` and `evidence` from the URL built in `src/content/ev-components.ts`.
 * There is no upload control anywhere (see EV06).
 */

/* ---------------------------------------------------------------------------
   Shared pieces
--------------------------------------------------------------------------- */

/** `.eyebrow` + the viewport id, so a reviewer can find a section in the DOM. */
function SectionHeading({
  section,
  dark = false,
}: {
  section: { id: string; eyebrow: string; heading: string; lead?: string };
  dark?: boolean;
}) {
  return (
    <div data-reveal className="max-w-[760px]">
      <div className="flex items-center gap-4">
        <span className={`font-mono text-[0.64rem] font-bold tracking-[0.18em] ${dark ? "text-forge-bright" : "text-forge"}`}>
          {section.id}
        </span>
        <span className={`h-px w-10 ${dark ? "bg-white/18" : "bg-ink/16"}`} aria-hidden="true" />
        <p className={`eyebrow ${dark ? "!text-forge-bright" : ""}`}>{section.eyebrow}</p>
      </div>
      <h2
        id={`${section.id.toLowerCase()}-title`}
        className={`mt-5 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {section.heading}
      </h2>
      {section.lead ? (
        <p className={`mt-5 text-[1.02rem] leading-relaxed ${dark ? "text-white/64" : "text-steel"}`}>
          {section.lead}
        </p>
      ) : null}
    </div>
  );
}

/** The standing evidence boundary, rendered left-ruled like the sibling pages. */
function Boundary({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <p
      data-reveal
      className={`max-w-[880px] border-l-2 border-forge pl-5 text-sm leading-6 ${
        dark ? "text-white/60" : "text-ink/68"
      }`}
    >
      {text}
    </p>
  );
}

/**
 * Renders approved media, falling back to the brand grid.
 *
 * The fallback is the same one the sibling routes use: when `hasRender` is
 * false or the asset is not approved, an industrial-grid panel is drawn instead
 * of requesting a file that may not exist.
 */
function MediaVisual({
  media,
  sizes,
  fit = "cover",
}: {
  media: MediaAsset;
  sizes: string;
  fit?: "cover" | "contain";
}) {
  if (!media.hasRender || media.approvalStatus !== "approved") {
    return <div className="fh-industrial-grid absolute inset-0" role="img" aria-label={media.alt} />;
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      className={fit === "contain" ? "object-contain" : "object-cover"}
      sizes={sizes}
    />
  );
}

/* ---------------------------------------------------------------------------
   EV01 — the category hero
--------------------------------------------------------------------------- */

/**
 * The hero states the scope and immediately narrows it.
 *
 * ── WHY THE IMAGE IS NOT THE BACKDROP ───────────────────────────────────────
 * WP 38 is a dense batch of machined housings. Setting body copy over it, as
 * the previous version did, made the H1 fight the parts behind it and forced a
 * `mix-blend-screen` wash that turned the photograph into texture. The band is
 * therefore ink-first: copy on the token surface at a ~60/40 split, and the
 * photograph in its own frame at 16:9 on desktop and 4:3 on mobile, where it
 * follows the copy so text is never compressed over a complex image.
 *
 * The one gradient that remains is inside the frame, under the caption, and it
 * exists only to keep that caption legible.
 */
export function EvHousingHero({ content }: { content: EvHousingPageContent }) {
  const { hero } = content;

  return (
    <section
      id="top"
      aria-labelledby="ev01-title"
      className="relative isolate overflow-hidden bg-ink text-white"
    >
      <div className="fh-industrial-grid absolute inset-0 -z-20 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_22%_0%,rgba(194,101,10,0.24)_0%,rgba(5,7,10,0)_60%)]"
        aria-hidden="true"
      />

      <div className="container-fh grid gap-10 pb-16 pt-[128px] lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] lg:items-center lg:gap-14 lg:pb-24 lg:pt-[164px]">
        {/* Copy first in source order: on mobile the image follows the text. */}
        <div data-reveal>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1
            id="ev01-title"
            className="mt-5 max-w-[680px] font-display text-[clamp(2.1rem,6vw,4.4rem)] font-800 uppercase leading-[0.9] tracking-[-0.03em]"
          >
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-[620px] text-[0.98rem] leading-7 text-white/72 sm:text-[1.05rem] sm:leading-8">
            {hero.lead}
          </p>

          <p className="mt-5 max-w-[600px] font-display text-[0.78rem] font-700 uppercase tracking-[0.12em] text-white/70">
            {hero.scopeLine}
          </p>

          <p className="mt-5 max-w-[600px] border-l-2 border-forge pl-5 text-sm leading-6 text-white/56">
            {hero.boundary}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
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

        {/*
          4:3 on mobile (a phone-sized frame around a portrait photograph),
          16:9 from `lg`. The 16:9 desktop frame is why the batch scene reads as
          a factory area rather than a single part portrait.
        */}
        <figure
          data-reveal
          className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/14 bg-panel lg:aspect-video"
        >
          <MediaVisual media={hero.media} sizes="(min-width: 1024px) 40vw, 100vw" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-ink/95 via-ink/45 to-transparent"
          />
          <figcaption className="absolute inset-x-0 bottom-0 p-4 text-[0.78rem] leading-5 text-white/72 sm:p-5 sm:text-[0.8rem] sm:leading-6">
            {hero.media.caption}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   EV02 — the three published categories
--------------------------------------------------------------------------- */

function CategoryCard({
  category,
  actionLabel,
}: {
  category: EvHousingCategory;
  actionLabel: string;
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-white p-6 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge">
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-lg border border-border bg-panel">
        <MediaVisual
          media={category.media}
          fit={category.mediaFit}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      {/*
        The fixed label is what keeps the card a project category rather than a
        product. It is rendered from content, not hard-coded, so it cannot be
        dropped for one card and kept for another.
      */}
      <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-forge/35 bg-forge-soft px-2.5 py-1 font-display text-[0.6rem] font-bold uppercase tracking-[0.14em] text-forge-deep">
        {category.scopeLabel}
      </span>

      <h3 className="mt-3 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
        {category.publicName}
      </h3>

      {/*
        The category names come from supplier material, and the card says so on
        the card. Page SPEC §2.2 allows the name to be displayed on that
        condition — not as this site's verified product.
      */}
      {category.claimStatus === "supplier-stated" ? (
        <p className="mt-2 font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-steel">
          Stated in supplier material
        </p>
      ) : null}

      <p className="mt-3 text-[0.94rem] leading-relaxed text-ink/80">{category.body}</p>

      {/*
        Always rendered. The caption carries the boundary that the photograph
        cannot carry itself, and it sits next to the body rather than below the
        whole card so the claim and its limit are read together.
      */}
      <p className="mt-4 border-l-2 border-forge/40 pl-3 text-[0.8rem] leading-6 text-steel">
        {category.media.caption}
      </p>

      <Link
        href={category.href}
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-display text-[0.7rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
      >
        {actionLabel}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function EvHousingCategories({
  section,
}: {
  section: EvHousingPageContent["categories"];
}) {
  return (
    <section
      id="housing-categories"
      aria-labelledby="ev02-title"
      className="scroll-mt-[120px] border-b border-border bg-soft py-20 lg:py-28"
    >
      <div className="container-fh">
        <SectionHeading section={section} />

        {/* Three equal columns; equal height comes from the shared grid row. */}
        <div
          data-reveal-group
          className="mt-12 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {section.items.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              actionLabel={section.actionLabel}
            />
          ))}
        </div>

        <div className="mt-10">
          <Boundary text={section.sourceNote} />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   EV03 — the three engineering concerns
--------------------------------------------------------------------------- */

export function EvEngineeringConcerns({
  section,
}: {
  section: EvHousingPageContent["engineeringConcerns"];
}) {
  return (
    <section
      id="engineering-concerns"
      aria-labelledby="ev03-title"
      className="scroll-mt-[120px] border-b border-border bg-white py-20 lg:py-28"
    >
      <div className="container-fh">
        <SectionHeading section={section} />

        <ul data-reveal-group className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {section.items.map((item, index) => (
            <li
              key={item.id}
              className="flex min-w-0 flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
            >
              <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.94rem] leading-relaxed text-ink/80">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   EV04 — the stated route
--------------------------------------------------------------------------- */

export function EvProcessRoute({
  section,
}: {
  section: EvHousingPageContent["processRoutes"];
}) {
  return (
    <section
      id="process-route"
      aria-labelledby="ev04-title"
      className="scroll-mt-[120px] border-b border-border bg-soft py-20 lg:py-28"
    >
      <div className="container-fh">
        <SectionHeading section={section} />

        {/*
          An ordered list, five columns on desktop and a single column on
          mobile. The `01…05` markers are an explanation order, not a fixed
          production line, which is why the disclosure below is structural
          rather than optional copy.
        */}
        <ol
          data-reveal-group
          className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5"
        >
          {section.steps.map((item) => (
            <li key={item.step} className="flex min-w-0 flex-col bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                  {item.step}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-4 font-display text-[1.06rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-[0.88rem] leading-relaxed text-steel">{item.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <Boundary text={section.disclosure} />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   EV05 — the evidence matrix
--------------------------------------------------------------------------- */

/**
 * The evidence gates, in two shapes from one data set.
 *
 * ── WHY THERE IS NO SCROLLING TABLE ─────────────────────────────────────────
 * Four columns of evidence text cannot fit a 390px viewport at a readable
 * size, and a horizontally scrolling table is the standard way a B2B page
 * becomes unreadable on a phone. Below `md` the same rows render as one card
 * per evidence item, each with its three gates labelled. From `md` upward the
 * real `<table>` is used, with body text at 0.9rem (14.4px) so the spec's
 * 14px floor holds.
 */
export function EvEvidenceMatrix({
  section,
}: {
  section: EvHousingPageContent["evidenceMatrix"];
}) {
  const { columns, rows } = section;

  return (
    <section
      id="evidence"
      aria-labelledby="ev05-title"
      className="scroll-mt-[120px] border-b border-border bg-white py-20 lg:py-28"
    >
      <div className="container-fh">
        <SectionHeading section={section} />

        {/* md and up — a real table, no scroll container. */}
        <div data-reveal className="mt-12 hidden md:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{section.heading}</caption>
            <thead>
              <tr className="border-b border-ink/20">
                <th
                  scope="col"
                  className="py-3 pr-4 font-display text-[0.9rem] font-800 uppercase tracking-[0.06em] text-ink"
                >
                  {columns.item}
                </th>
                <th
                  scope="col"
                  className="py-3 pr-4 font-display text-[0.9rem] font-800 uppercase tracking-[0.06em] text-ink"
                >
                  {columns.beforeQuotation}
                </th>
                <th
                  scope="col"
                  className="py-3 pr-4 font-display text-[0.9rem] font-800 uppercase tracking-[0.06em] text-ink"
                >
                  {columns.beforeSampleApproval}
                </th>
                <th
                  scope="col"
                  className="py-3 font-display text-[0.9rem] font-800 uppercase tracking-[0.06em] text-ink"
                >
                  {columns.beforeSerialSupply}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.item} className="border-b border-border align-top">
                  <th
                    scope="row"
                    className="py-4 pr-4 text-[0.9rem] font-normal leading-6 text-ink"
                  >
                    {row.item}
                  </th>
                  <td className="py-4 pr-4 text-[0.9rem] leading-6 text-ink/74">
                    {row.beforeQuotation}
                  </td>
                  <td className="py-4 pr-4 text-[0.9rem] leading-6 text-ink/74">
                    {row.beforeSampleApproval}
                  </td>
                  <td className="py-4 text-[0.9rem] leading-6 text-ink/74">
                    {row.beforeSerialSupply}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Below md — one evidence card per item. */}
        <ul data-reveal-group className="mt-10 grid grid-cols-1 gap-4 md:hidden">
          {rows.map((row) => (
            <li key={row.item} className="rounded-xl border border-border bg-soft p-5">
              <h3 className="font-display text-[1rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                {row.item}
              </h3>
              <dl className="mt-4 grid gap-3">
                {(
                  [
                    [columns.beforeQuotation, row.beforeQuotation],
                    [columns.beforeSampleApproval, row.beforeSampleApproval],
                    [columns.beforeSerialSupply, row.beforeSerialSupply],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="grid gap-0.5">
                    <dt className="font-display text-[0.62rem] font-bold uppercase tracking-[0.14em] text-steel">
                      {label}
                    </dt>
                    <dd className="text-[0.9rem] leading-6 text-ink/80">{value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <Boundary text={section.note} />
          <Link
            href={section.action.href}
            className="btn-pill-outline w-fit text-ink"
          >
            {section.action.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   EV06 — the engineering-assessment entry
--------------------------------------------------------------------------- */

export function EvAssessmentInquiry({
  section,
}: {
  section: EvHousingPageContent["inquiry"];
}) {
  return (
    <section
      id={section.anchor}
      data-floating-quote-hide
      aria-labelledby="ev06-title"
      className="relative isolate scroll-mt-[120px] overflow-hidden bg-ink py-20 text-white lg:py-28"
    >
      <AutomotiveBackdrop scene={automotiveScenes.evAssessment} className="opacity-55" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/92 to-ink/60"
        aria-hidden="true"
      />
      <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.7fr)] lg:gap-20">
        <div>
          <SectionHeading section={section} dark />

          <div className="mt-10" data-reveal>
            <p className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge-bright">
              {section.checklistLabel}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {section.checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[0.9rem] leading-6 text-white/70"
                >
                  <Check className="mt-1 size-3.5 shrink-0 text-forge" strokeWidth={3} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-reveal className="lg:pt-24">
          {/*
            No upload control. The spec forbids a direct file-upload path until
            controlled exchange, access control, virus scanning, retention and
            an NDA flow exist, so the panel states what happens instead of
            offering a button that cannot work safely.
          */}
          <p className="flex items-start gap-2.5 rounded-xl border border-white/14 bg-white/[0.035] px-5 py-4 text-[0.86rem] leading-6 text-white/64">
            <Info className="mt-0.5 size-4 shrink-0 text-forge" aria-hidden="true" />
            <span>{section.uploadNote}</span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link href={section.primaryCta.href} className="btn-pill-solid w-fit">
              {section.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={section.secondaryCta.href} className="btn-pill-outline w-fit !text-white">
              {section.secondaryCta.label}
            </Link>
          </div>

          <p className="mt-6 border-l-2 border-forge pl-4 text-[0.82rem] leading-6 text-white/56">
            {section.contextNotice}
          </p>
        </div>
      </div>
    </section>
  );
}
