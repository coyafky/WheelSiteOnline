import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus, TriangleAlert } from "lucide-react";
import {
  aboutAre,
  aboutAreNot,
  aboutChain,
  aboutChainStages,
  aboutDealerModel,
  aboutHero,
  aboutHeroActions,
  aboutPositioning,
  aboutQuality,
  aboutStats,
} from "@/content/about";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "About Us — Aluminum Component Manufacturer",
  description:
    "Fenghuai manufactures aluminium components across four product lines — forged wheels, EV powertrain housings, custom aluminium parts and self-healing safety tires — for dealers, Tier 1 suppliers and OEM programmes.",
};

/**
 * Company page.
 *
 * Follows the reference site's "dealer landing" long-form archetype:
 * hero → capability strip → factory/supply-chain split → quality →
 * positioning (what we are / are not) → how we work with dealers → CTA.
 *
 * Every commercial figure on this page is flagged PLACEHOLDER in
 * `@/content/about` and marked visibly in the UI.
 */
export default function AboutPage() {
  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="about-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_24%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <p className="eyebrow !text-forge">{aboutHero.eyebrow}</p>
          <h1
            id="about-title"
            className="mt-5 max-w-[1000px] font-display text-[clamp(2.6rem,7.6vw,5.4rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
          >
            {aboutHero.heading}
          </h1>
          <p className="mt-7 max-w-[700px] text-[1.05rem] leading-relaxed text-white/75">
            {aboutHero.lede}
          </p>
          <p className="mt-4 max-w-[660px] text-sm leading-relaxed text-white/55">
            {aboutHero.supporting}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={aboutHeroActions.primary.href} className="btn-pill-solid">
              {aboutHeroActions.primary.label}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={aboutHeroActions.secondary.href}
              className="btn-pill-outline !text-white"
            >
              {aboutHeroActions.secondary.label}
            </Link>
          </div>
        </div>
      </section>

      {/* B. Capability / number strip -------------------------------------- */}
      <section
        aria-labelledby="stats-title"
        className="border-b border-border bg-white"
      >
        <h2 id="stats-title" className="sr-only">
          Capability at a glance
        </h2>

        <div
          data-reveal-group
          className="container-fh-wide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {aboutStats.map((stat) => (
            <article
              key={stat.index}
              className="group relative min-h-[212px] border-b border-border px-7 py-9 transition-colors hover:bg-soft sm:px-8 lg:px-9"
            >
              <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                {stat.index}
              </span>
              <p className="mt-4 font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-[1.24rem] font-800 uppercase leading-tight tracking-[0.01em] text-ink">
                {stat.value}
              </p>
              <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-steel">
                {stat.body}
              </p>

              {stat.isPlaceholder ? (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-forge/35 bg-forge-soft px-2.5 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                  <TriangleAlert className="size-3" aria-hidden="true" />
                  Placeholder — confirm figures
                </span>
              ) : null}

              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-forge transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </section>

      {/* C. Factory / supply chain ----------------------------------------- */}
      <section
        aria-labelledby="chain-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{aboutChain.eyebrow}</p>
            <h2
              id="chain-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {aboutChain.heading}
            </h2>
            <p className="mt-5 max-w-[540px] text-[1.02rem] leading-relaxed text-steel">
              {aboutChain.body}
            </p>

            <ul data-reveal-group className="mt-8 grid gap-4">
              {aboutChain.points.map((point) => (
                <li key={point} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[0.96rem] leading-relaxed text-ink/80">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-7">
            <figure className="overflow-hidden rounded-xl border border-border bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element -- curated WebP asset */}
              <img
                src="/images/about/factory-floor-wide.webp"
                alt="Fenghuai factory floor with integrated production equipment"
                width={1070}
                height={769}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="px-5 py-4 text-xs leading-relaxed text-white/60">
                Factory floor — raw material, forming and production kept close to the line.
              </figcaption>
            </figure>

            <ol
              data-reveal-group
              className="grid content-start gap-px overflow-hidden rounded-xl border border-border bg-border"
            >
            {aboutChainStages.map((stage) => (
              <li
                key={stage.step}
                className="bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                    {stage.step}
                  </span>
                  <h3 className="font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                    {stage.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-steel">
                  {stage.body}
                </p>
              </li>
            ))}
            </ol>
          </div>
        </div>
      </section>

      {/* D. Quality --------------------------------------------------------- */}
      <section
        aria-labelledby="quality-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{aboutQuality.eyebrow}</p>
            <h2
              id="quality-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {aboutQuality.heading}
            </h2>
            <p className="mt-5 max-w-[420px] text-[1.02rem] leading-relaxed text-steel">
              {aboutQuality.body}
            </p>
            <figure className="mt-8 overflow-hidden rounded-xl border border-border bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element -- curated WebP asset */}
              <img
                src="/images/about/inspection-camera.webp"
                alt="Inspection camera station used for wheel component checks"
                width={653}
                height={449}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="px-5 py-4 text-xs leading-relaxed text-white/60">
                Inspection evidence stays attached to the order.
              </figcaption>
            </figure>
          </div>

          <ul
            data-reveal-group
            className="grid content-start gap-5 self-start rounded-xl border border-border bg-soft p-8"
          >
            {aboutQuality.points.map((point) => (
              <li key={point} className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-[0.96rem] leading-relaxed text-ink/80">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* E. Positioning ----------------------------------------------------- */}
      <section
        aria-labelledby="positioning-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          {/* ── B-1 (PAGE-SPECS/about.md §0.5.3): break the D/E rhythm ────────
              Viewport 04 (quality) and 05 (positioning) shared the same shape —
              left-aligned heading + body, then a list below. Scrolling from one
              into the other read as "still the same section", even though they
              answer two different questions. Both were kept (each passes the
              delete test); the fix is presentation, not content. The
              negative/positive pair becomes this viewport's single focal
              object, centred and full width, with the body demoted to a lede. */}
          <div className="mx-auto max-w-[820px] text-center">
            <p className="eyebrow">{aboutPositioning.eyebrow}</p>
            <h2
              id="positioning-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {aboutPositioning.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[1.02rem] leading-relaxed text-steel">
              {aboutPositioning.body}
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <PositioningList
              tone="negative"
              eyebrow="What we are not"
              points={aboutAreNot}
            />
            <PositioningList
              tone="positive"
              eyebrow="What we are"
              points={aboutAre}
            />
          </div>
        </div>
      </section>

      {/* F. Working with dealers --------------------------------------------
          ── B-2 (PAGE-SPECS/about.md §0.5.3): the 4-step grid is gone ──────
          `/dealers` answers this same question with six steps
          (`From first enquiry to repeat order`). Two grids of the same flow at
          different lengths is not a summary — it is a second, weaker copy, and
          a reader who sees both trusts neither. The delete test settles it:
          remove this section and the reader still gets every step, on the page
          that owns the topic. What stays is a signpost, which is what `/about`
          should be doing here — 「你们是谁」 is the page's question, and how to
          work with us is `/dealers`'. */}
      <section
        aria-labelledby="dealer-model-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{aboutDealerModel.eyebrow}</p>
            <h2
              id="dealer-model-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {aboutDealerModel.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {aboutDealerModel.body}
            </p>

            <Link
              href="/dealers"
              className="mt-8 inline-flex items-center gap-2 font-display text-[0.78rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
            >
              How the dealer programme works — step by step
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* G. Pathways — REMOVED (B-3, PAGE-SPECS/about.md §0.5.3) -------------
          `Where to go next` sat directly above `<DealerCta>`, and both answered
          the same question: what do I do now? Three weak parallel exits next to
          one strong call to action do not add options, they dilute the one the
          page actually wants. The routes it listed (dealers / custom
          development / wheel range) are all one nav click away and each is
          linked from the page body above.
          Same finding as `/dealers` B-4 and `/dealers/private-label` B-2. */}

      <DealerCta />
    </>
  );
}

/**
 * A "what we are / what we are not" column.
 *
 * The negative column is deliberately quieter — the affirmative list carries
 * the accent so the section reads as a claim, not a disclaimer.
 */
function PositioningList({
  tone,
  eyebrow,
  points,
}: {
  tone: "positive" | "negative";
  eyebrow: string;
  points: { title: string; body: string }[];
}) {
  const positive = tone === "positive";

  return (
    <div
      className={
        positive
          ? "rounded-xl border border-forge/30 bg-white p-8"
          : "rounded-xl border border-border bg-white/60 p-8"
      }
    >
      <p className="eyebrow !text-steel">{eyebrow}</p>

      <ul data-reveal-group className="mt-7 grid gap-7">
        {points.map((point) => (
          <li key={point.title} className="flex items-start gap-4">
            <span
              className={
                positive
                  ? "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge text-white"
                  : "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-steel"
              }
            >
              {positive ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : (
                <Minus className="size-3.5" strokeWidth={3} />
              )}
            </span>
            <div>
              <h3 className="font-display text-[1.08rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">
                {point.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
