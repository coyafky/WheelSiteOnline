import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, FileText, Info, Upload } from "lucide-react";
import type {
  CustomAluminumInputRoute,
  CustomAluminumMethodItem,
  CustomAluminumPage,
  CustomAluminumSection,
  MediaAsset,
} from "@/content/types";

/**
 * `/products/custom-aluminum` — CA01–CA07 from `PAGE-SPECS/custom-aluminum.md`.
 *
 * ── THE ONE STRUCTURAL RULE ─────────────────────────────────────────────────
 * There is no product photograph anywhere on this page, and that is deliberate
 * rather than an asset gap. The source material has no image that can be
 * confirmed as a non-wheel, non-EV-housing custom aluminum component, so the
 * hero is built from typography, wireframe file graphics and design tokens.
 * The three engineering screenshots on CA04 are all wheel geometry and are
 * labelled as method examples, never as this line's work.
 *
 * ── THE PUBLISHING GATE IS STRUCTURAL, NOT COSMETIC ─────────────────────────
 * `boundary.declinedConfirmed` is false. Two consequences, both enforced here
 * rather than in a comment:
 *   1. CA06 renders THREE status columns. There is no blank "what we decline"
 *      column to fill, and the component never hides one with CSS — an empty
 *      column would read as a claim to take on anything.
 *   2. The route metadata in `page.tsx` stays `noindex, follow`.
 * Nothing in this file tunes either behaviour by looking at a viewport.
 */

/* ---------------------------------------------------------------------------
   Shared pieces
--------------------------------------------------------------------------- */

function Heading({ section, dark = false }: { section: CustomAluminumSection; dark?: boolean }) {
  return (
    <div data-reveal className="max-w-[760px]">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.64rem] font-bold tracking-[0.18em] text-forge">
          {section.id}
        </span>
        <span className={`h-px w-10 ${dark ? "bg-white/18" : "bg-ink/16"}`} aria-hidden="true" />
        <p className="eyebrow">{section.eyebrow}</p>
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

function Boundary({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <p
      data-reveal
      className={`max-w-[820px] border-l-2 border-forge pl-5 text-sm leading-6 ${
        dark ? "text-white/60" : "text-ink/68"
      }`}
    >
      {text}
    </p>
  );
}

/** Renders approved media, falling back to the brand grid instead of a 404. */
function MediaVisual({ media, sizes, contain = false }: { media: MediaAsset; sizes: string; contain?: boolean }) {
  if (!media.hasRender || media.approvalStatus !== "approved") {
    return <div className="fh-industrial-grid absolute inset-0" role="img" aria-label={media.alt} />;
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      className={contain ? "object-contain" : "object-cover"}
      sizes={sizes}
    />
  );
}

/* ---------------------------------------------------------------------------
   CA01 — the photo-free hero, plus the EV housing fork
--------------------------------------------------------------------------- */

/**
 * Three abstract input diagrams.
 *
 * These are wireframes, not illustrations of a product: a dimensioned 2D view,
 * an isometric 3D shell and a caliper over a sample. They exist to make the
 * hero's argument visual ("these are the three things you can send") without
 * borrowing a photograph of a part that is not this line's.
 */
function InputGlyph({ kind }: { kind: CustomAluminumInputRoute["id"] }) {
  const stroke = { stroke: "currentColor", strokeWidth: 1.4, fill: "none" } as const;

  if (kind === "2d-drawing") {
    return (
      <svg viewBox="0 0 120 96" className="size-full text-forge" aria-hidden="true">
        <rect x="26" y="20" width="68" height="56" rx="2" {...stroke} />
        <rect x="38" y="32" width="44" height="32" rx="1" strokeDasharray="4 3" {...stroke} />
        <circle cx="60" cy="48" r="7" {...stroke} />
        <path d="M26 14v12M26 14h8M94 14h-8M94 14v12" {...stroke} />
        <path d="M20 48h-8M108 48h-8" {...stroke} />
        <path d="M60 20V10M60 76v10" {...stroke} />
      </svg>
    );
  }

  if (kind === "3d-data") {
    return (
      <svg viewBox="0 0 120 96" className="size-full text-forge" aria-hidden="true">
        <path d="M34 30l26-14 26 14v36L60 80 34 66z" {...stroke} />
        <path d="M34 30l26 14 26-14M60 44v36" {...stroke} />
        <path d="M46 22v12M74 22v12" strokeDasharray="3 3" {...stroke} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 96" className="size-full text-forge" aria-hidden="true">
      <path d="M30 70V34a18 18 0 0136 0v36" {...stroke} />
      <path d="M24 70h48" {...stroke} />
      <path d="M78 26h12v44H78z" {...stroke} />
      <path d="M90 34h6v28h-6" {...stroke} />
      <path d="M24 26h12M24 26v48" strokeDasharray="3 3" {...stroke} />
    </svg>
  );
}

function HeroInputCard({ route }: { route: CustomAluminumInputRoute }) {
  return (
    <article className="flex min-w-0 flex-col border border-white/14 bg-white/[0.035] p-5 backdrop-blur-[2px]">
      <div className="relative h-16 w-full">
        <div className="absolute inset-y-0 left-0 w-24">
          <InputGlyph kind={route.id} />
        </div>
      </div>
      <h3 className="mt-4 font-display text-[0.94rem] font-700 uppercase leading-tight tracking-[0.02em] text-white">
        {route.title}
      </h3>
      <p className="mt-2 text-[0.82rem] leading-6 text-white/56">{route.summary}</p>
    </article>
  );
}

export function CustomAluminumHero({ content }: { content: CustomAluminumPage }) {
  const { hero, evRoute, inputs } = content;

  return (
    <section
      id="top"
      aria-labelledby="ca01-title"
      className="relative isolate overflow-hidden bg-ink text-white"
    >
      {/* No photograph. The backdrop is the token grid plus a forge glow. */}
      <div className="fh-industrial-grid absolute inset-0 -z-20 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_22%_0%,rgba(194,101,10,0.24)_0%,rgba(5,7,10,0)_60%)]"
        aria-hidden="true"
      />

      <div className="container-fh grid gap-10 pb-16 pt-[128px] lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:items-start lg:gap-16 lg:pb-24 lg:pt-[164px]">
        <div className="min-w-0" data-reveal>
          <p className="eyebrow">{hero.eyebrow}</p>
          {/* The colour is stated on the <h1> itself, not inherited from the
              section. The generated theme sets heading ink by landmark
              (`site-theme.css:11-14`), so an inherited `text-white` never
              reached this heading: it measured #292621 on #292621 — 1.00:1. */}
          <h1
            id="ca01-title"
            className="mt-5 max-w-[680px] font-display text-[clamp(2.1rem,6.4vw,4.6rem)] font-800 uppercase leading-[0.9] tracking-[-0.035em] text-white [overflow-wrap:anywhere]"
          >
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-[620px] text-[0.98rem] leading-7 text-white/72 sm:text-[1.05rem] sm:leading-8">
            {hero.lead}
          </p>
          <p className="mt-4 max-w-[600px] border-l-2 border-forge pl-5 text-sm leading-6 text-white/56">
            {hero.boundaryNote}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={hero.primaryCta.href} className="btn-pill-solid min-w-0 text-center">
              {hero.primaryCta.label}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={hero.secondaryCta.href} className="btn-pill-outline min-w-0 text-center !text-white">
              {hero.secondaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/*
          The right column states the page's premise: three kinds of input, no
          part photograph. On mobile it follows the copy, inside the first
          screen, so the H1 and a CTA are never pushed below the fold.
        */}
        <div aria-labelledby="ca01-inputs-title" className="min-w-0 lg:pt-2">
          <h2
            id="ca01-inputs-title"
            className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-white/48"
          >
            Accepted as an engineering input
          </h2>
          <div data-reveal-group className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {inputs.routes.map((route) => (
              <HeroInputCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      </div>

      {/* The fork: three named housings belong on the EV route. */}
      <div className="border-t border-white/10 bg-white/[0.02]">
        <div className="container-fh grid gap-6 py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14">
          <div className="max-w-[720px]">
            <p className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge">
              {evRoute.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-white sm:text-[1.4rem]">
              {evRoute.heading}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">{evRoute.lead}</p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <ul className="flex flex-wrap gap-2">
              {evRoute.categories.map((category) => (
                <li
                  key={category}
                  className="rounded-full border border-white/16 px-3 py-1.5 font-display text-[0.62rem] font-700 uppercase tracking-[0.12em] text-white/74"
                >
                  {category}
                </li>
              ))}
            </ul>
            <p className="border-l-2 border-forge pl-4 text-[0.82rem] leading-6 text-white/56">
              {evRoute.prompt}
            </p>
            <Link
              href={evRoute.href}
              className="inline-flex min-h-[44px] items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-white"
            >
              {evRoute.linkLabel}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CA02 — application scope, not a stocked range
--------------------------------------------------------------------------- */

export function ApplicationScope({ section }: { section: CustomAluminumPage["applications"] }) {
  return (
    <section
      id={section.id.toLowerCase()}
      aria-labelledby={`${section.id.toLowerCase()}-title`}
      className="scroll-mt-[120px] border-b border-border bg-white py-20 lg:py-28"
    >
      <div className="container-fh-wide">
        <div className="px-4">
          <Heading section={section} />
        </div>

        {/*
          Four equal cards. No thumbnails: there is no approved photograph for
          any of these groups, and a stock image would read as a product.
        */}
        <div
          data-reveal-group
          className="mt-12 grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {section.groups.map((group) => (
            <article
              key={group.slug}
              className="flex min-w-0 flex-col rounded-xl border border-border bg-soft p-6 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
            >
              {/* Fixed label on every card — this is what keeps the group
                  inside "assessment scope" instead of "products". */}
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-forge/35 bg-white px-2.5 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                {section.scopeLabel}
              </span>

              <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                {group.name}
              </h3>

              <p className="mt-4 rounded-lg border border-border bg-white px-4 py-3 text-[0.84rem] leading-relaxed text-ink/74">
                {group.framing}
              </p>

              <ul className="mt-5 grid flex-1 content-start gap-2">
                {group.examples.map((example) => (
                  <li
                    key={example}
                    className="flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-ink/80"
                  >
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-forge" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={group.href}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-display text-[0.7rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
              >
                Start with this group
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 px-4">
          <Boundary text={section.boundaryNote} />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CA03 — the three inputs
--------------------------------------------------------------------------- */

export function ProjectInputs({ section }: { section: CustomAluminumPage["inputs"] }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-[120px] border-b border-border bg-soft py-20 lg:py-28"
    >
      <div className="container-fh">
        <Heading section={section} />

        <div data-reveal-group className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.routes.map((route) => {
            const sample = route.id === "physical-sample";
            return (
              <article
                key={route.id}
                id={route.id}
                className={`flex min-w-0 scroll-mt-[120px] flex-col rounded-xl border p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-x-0 hover:-translate-y-0.5 ${
                  sample
                    ? "border-forge/35 bg-white hover:border-forge"
                    : "border-border bg-white hover:border-forge"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-[1.2rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                    {route.title}
                  </h3>
                </div>

                <p className="mt-4 font-display text-[0.68rem] font-700 uppercase tracking-[0.12em] text-steel">
                  {route.summary}
                </p>

                <p className="mt-4 flex-1 text-[0.94rem] leading-relaxed text-ink/80">
                  {route.requirements[0]}
                </p>

                {/*
                  Only the sample route carries the rights note. Reverse
                  engineering lives inside this route, so the ownership and
                  reproduction-rights confirmation belongs on this card.
                */}
                {route.rightsNote ? (
                  <p className="mt-5 flex items-start gap-2.5 rounded-lg border border-forge/30 bg-forge-soft px-4 py-3 text-[0.84rem] leading-relaxed text-ink/80">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-forge-deep" strokeWidth={3} aria-hidden="true" />
                    <span>{route.rightsNote}</span>
                  </p>
                ) : null}

                <Link
                  href={route.href}
                  className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-display text-[0.7rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
                >
                  Start with this input
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-5">
          <p data-reveal className="max-w-[820px] text-sm leading-relaxed text-steel">
            {section.note}
          </p>
          <p
            data-reveal
            className="flex max-w-[820px] items-start gap-2.5 rounded-xl border border-border bg-white px-5 py-4 text-sm leading-relaxed text-ink/74"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden="true" />
            <span>{section.rightsDeclaration}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CA04 — engineering methods, with the wheel-geometry boundary attached
--------------------------------------------------------------------------- */

/**
 * One method card.
 *
 * ── WHY DFM GETS A WIREFRAME AND THE OTHER TWO GET SCREENSHOTS ──────────────
 * Two of the three methods have a screenshot in the supplied material, and both
 * are wheel geometry. DFM review has none, and no approved custom aluminum
 * photograph exists to fill the slot. So the DFM card carries a wireframe
 * drawing glyph — the same abstract vocabulary the CA01 hero uses — rather than
 * an empty panel (which reads as a broken image) or a photograph of a part that
 * is not this line's (which is the mistake the Page SPEC exists to prevent).
 *
 * The image slot is the same height on all three cards, so the headings and
 * body copy line up instead of one 755px column sitting beside two short ones.
 */
function MethodCard({ item }: { item: CustomAluminumMethodItem }) {
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-white p-6 transition-[border-color] duration-200 ease-out hover:border-forge">
      <div className="relative mb-6 flex aspect-video shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-panel">
        {item.media ? (
          <MediaVisual media={item.media} sizes="(min-width: 1024px) 33vw, 100vw" contain />
        ) : (
          <div className="h-[70%] w-[70%]" role="img" aria-label="Dimensioned 2D drawing under review for a manufacturability assessment">
            <InputGlyph kind="2d-drawing" />
          </div>
        )}
      </div>

      <h3 className="font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
        {item.title}
      </h3>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-steel">{item.body}</p>

      {/*
        The caption carries the wheel-geometry boundary for WP 67 and WP 31, so
        it is not optional decoration — it is the statement that these are
        method examples rather than reports for a custom aluminum part.
      */}
      {item.media ? (
        <p className="mt-4 border-l-2 border-forge/40 pl-3 text-[0.78rem] leading-6 text-steel">
          {item.media.caption}
        </p>
      ) : null}

      {/*
        WP 48 is a 318×204 screenshot. It stays in a small card and is capped
        at its original effective width, so it is never upscaled into a hero.
        `lg:mt-auto` pins the figure to the bottom so the three cards end level.
      */}
      {item.supportingMedia ? (
        <figure className="mt-5 border-t border-border pt-5 lg:mt-auto">
          <div
            className="relative aspect-[318/204] overflow-hidden rounded border border-border bg-panel"
            style={{ maxWidth: item.supportingMediaMaxWidth ?? 318 }}
          >
            <MediaVisual media={item.supportingMedia} sizes="318px" contain />
          </div>
          <figcaption className="mt-2.5 text-[0.76rem] leading-6 text-steel">
            {item.supportingMedia.caption}
          </figcaption>
        </figure>
      ) : null}
    </article>
  );
}

export function EngineeringMethods({ section }: { section: CustomAluminumPage["methods"] }) {
  return (
    <section
      id={section.id.toLowerCase()}
      aria-labelledby={`${section.id.toLowerCase()}-title`}
      className="scroll-mt-[120px] border-b border-border bg-white py-20 lg:py-28"
    >
      <div className="container-fh">
        <Heading section={section} />

        <div data-reveal-group className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {section.items.map((item) => (
            <MethodCard key={item.id} item={item} />
          ))}
        </div>

        {/* Mandatory wording, verbatim from the spec. */}
        <p
          data-reveal
          className="mt-10 flex max-w-[900px] items-start gap-3 rounded-xl border border-forge/30 bg-forge-soft px-5 py-4 text-sm leading-relaxed text-ink/80"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-forge-deep" aria-hidden="true" />
          <span>{section.evidenceNote}</span>
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CA05 — five stages, each with an exit
--------------------------------------------------------------------------- */

export function DevelopmentStages({ section }: { section: CustomAluminumPage["stages"] }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-[120px] border-b border-border bg-soft py-20 lg:py-28"
    >
      <div className="container-fh">
        <Heading section={section} />

        {/*
          Ordered list, not a diagram: the sequence is semantic content, it
          must stay readable with JavaScript off, and the project has no chart
          dependency by design.
        */}
        <ol
          data-reveal-group
          className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5"
        >
          {section.steps.map((step) => (
            <li key={step.step} className="flex min-w-0 flex-col bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                  {step.step}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-4 font-display text-[1.06rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 flex-1 text-[0.86rem] leading-relaxed text-steel">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <Boundary text={section.boundaryNote} />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CA06 — the three-column status matrix
--------------------------------------------------------------------------- */

/**
 * Three columns: listed / assessed / not yet confirmed.
 *
 * There is no fourth "what we decline" column while `declinedConfirmed` is
 * false. An empty column would be read as a promise to make anything, which is
 * the failure mode this section was written to prevent — so the gap is
 * disclosed in words instead. The gate is driven by the content flag, not by
 * CSS, and the route stays `noindex, follow` (see `page.tsx`).
 */
export function CapabilityBoundary({ section }: { section: CustomAluminumPage["boundary"] }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-[120px] border-b border-border bg-white py-20 lg:py-28"
    >
      <div className="container-fh">
        <Heading section={section} />

        <div data-reveal-group className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {section.columns.map((column) => (
            <section
              key={column.id}
              aria-label={column.label}
              className={`flex min-w-0 flex-col rounded-xl border p-6 lg:p-7 ${
                column.id === "unconfirmed"
                  ? "border-dashed border-forge/40 bg-forge-soft"
                  : "border-border bg-soft"
              }`}
            >
              <h3 className="font-display text-[1.08rem] font-800 uppercase leading-tight tracking-[0.01em] text-ink">
                {column.label}
              </h3>

              <ul className="mt-5 grid flex-1 content-start gap-2.5">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-2.5 text-[0.9rem] leading-relaxed ${
                      column.id === "unconfirmed" ? "text-steel" : "text-ink/80"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-2 size-1.5 shrink-0 rounded-full ${
                        column.id === "unconfirmed" ? "bg-steel/50" : "bg-forge"
                      }`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {column.note ? (
                <p className="mt-5 border-t border-border pt-4 text-[0.8rem] leading-6 text-steel">
                  {column.note}
                </p>
              ) : null}
            </section>
          ))}
        </div>

        {/*
          The declined list is only published once it has been confirmed. No
          hidden markup, no `sr-only` column — when the flag is false the
          section says so out loud, and when it is true the declined rows get a
          real column here.
        */}
        {section.declinedConfirmed && section.declined.length > 0 ? (
          <section aria-label="Not taken on" className="mt-8 rounded-xl border border-border bg-soft p-6">
            <h3 className="font-display text-[1.08rem] font-800 uppercase leading-tight tracking-[0.01em] text-ink">
              Not taken on
            </h3>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {section.declined.map((item) => (
                <li key={item} className="text-[0.9rem] leading-relaxed text-ink/80">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p
            data-reveal
            className="mt-8 flex max-w-[900px] items-start gap-3 rounded-xl border border-forge/30 bg-forge-soft px-5 py-4 text-sm leading-relaxed text-ink/80"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-forge-deep" aria-hidden="true" />
            <span>{section.publicationNote}</span>
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CA07 — the enquiry entry
--------------------------------------------------------------------------- */

export function AssessmentInquiry({ section }: { section: CustomAluminumPage["inquiry"] }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-[120px] border-b border-border bg-ink py-20 text-white lg:py-28"
    >
      <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.7fr)] lg:gap-20">
        <div className="min-w-0">
          <Heading section={section} dark />

          <div className="mt-10" data-reveal>
            <p className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge">
              {section.checklistLabel}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {section.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.9rem] leading-6 text-white/70">
                  <Check className="mt-1 size-3.5 shrink-0 text-forge" strokeWidth={3} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-reveal className="min-w-0 lg:pt-24">
          {/*
            No upload control. The spec forbids a direct file-upload path until
            a controlled exchange exists, so the panel states what happens
            instead of offering a button that cannot work safely.
          */}
          <p className="flex items-start gap-2.5 rounded-xl border border-white/14 bg-white/[0.035] px-5 py-4 text-[0.86rem] leading-6 text-white/64">
            <Upload className="mt-0.5 size-4 shrink-0 text-forge" aria-hidden="true" />
            <span>{section.uploadNote}</span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link href={section.primaryCta.href} className="btn-pill-solid min-w-0 text-center">
              {section.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={section.secondaryCta.href} className="btn-pill-outline min-w-0 text-center !text-white">
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

/* ---------------------------------------------------------------------------
   Closing
--------------------------------------------------------------------------- */

/**
 * A page-owned closing band rather than the shared `<DealerCta>`.
 *
 * `DealerCta` hard-codes its action to `/contact`, which would drop the
 * `product_line=custom-aluminum` context this page is required to carry. The
 * band therefore renders the content module's own CTAs at the full 48px
 * `btn-pill` height.
 */
export function CustomAluminumClosing({ closing }: { closing: CustomAluminumPage["closing"] }) {
  return (
    <section aria-labelledby="custom-aluminum-closing-title" className="bg-forge-soft">
      <div className="container-fh grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20">
        <div className="min-w-0" data-reveal>
          <p className="eyebrow">{closing.eyebrow}</p>
          <h2
            id="custom-aluminum-closing-title"
            className="mt-4 max-w-[640px] font-display text-[clamp(1.9rem,4.2vw,3rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
          >
            {closing.heading}
          </h2>
          <p className="mt-5 max-w-[600px] text-[1.02rem] leading-relaxed text-steel">
            {closing.body}
          </p>
        </div>

        <div data-reveal className="flex min-w-0 flex-col items-start gap-3">
          <Link href={closing.primaryCta.href} className="btn-pill-solid max-w-full min-w-0 whitespace-normal px-4 text-center">
            {closing.primaryCta.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href={closing.secondaryCta.href} className="btn-pill-outline max-w-full min-w-0 whitespace-normal px-4 text-center text-ink">
            {closing.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
