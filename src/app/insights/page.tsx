import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  guides,
  resourcesCards,
  resourcesExtraIndex,
  resourcesHero,
  resourcesIntro,
  resourcesPathways,
} from "@/content/resources";
import { GuidesAccordion } from "@/components/guides-accordion";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "Forged Wheel Insights — Fitment, Construction & Import Guides",
  description:
    "Reference guides for dealers and wheel shops: measuring fitment, offset and backspacing, choosing a construction, finish options and importing wheels.",
};

/**
 * Insights hub.
 *
 * Follows the reference site's `resources-*` index archetype: hero → category
 * strip and card list → pathways → CTA. The cards expand in place rather than
 * linking to article routes, because no `/insights/[slug]` page exists yet.
 */
export default function InsightsPage() {
  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="resources-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_30%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <p className="eyebrow !text-forge">{resourcesHero.eyebrow}</p>
          <h1
            id="resources-title"
            className="mt-5 max-w-[1000px] font-display text-[clamp(2.4rem,6.8vw,4.9rem)] font-800 uppercase leading-[0.92] tracking-[-0.02em] text-white"
          >
            {resourcesHero.heading}
          </h1>
          <p className="mt-7 max-w-[700px] text-[1.05rem] leading-relaxed text-white/75">
            {resourcesHero.lede}
          </p>
          <p className="mt-4 max-w-[660px] text-sm leading-relaxed text-white/55">
            {resourcesHero.supporting}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="#guides-title" className="btn-pill-solid">
              Browse the guides
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/contact" className="btn-pill-outline !text-white">
              Ask a technical question
            </Link>
          </div>
        </div>
      </section>

      {/* B. Guide cards ------------------------------------------------------ */}
      <section
        aria-labelledby="guides-title"
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div data-reveal className="max-w-[720px] px-4">
            <p className="eyebrow">{resourcesIntro.eyebrow}</p>
            <h2
              id="guides-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {resourcesIntro.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {resourcesIntro.body}
            </p>
          </div>

          <div data-reveal className="mt-12 px-4">
            <GuidesAccordion guides={guides} copy={resourcesCards} />
          </div>
        </div>
      </section>

      {/* B2. Reference sets (bolt patterns + tools) ------------------------ */}
      <section
        aria-labelledby="reference-sets-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[680px]">
            <p className="eyebrow">{resourcesExtraIndex.eyebrow}</p>
            <h2
              id="reference-sets-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {resourcesExtraIndex.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {resourcesExtraIndex.body}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {resourcesExtraIndex.cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{card.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {card.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {card.linkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* C. Pathways --------------------------------------------------------- */}
      <section
        aria-labelledby="resource-pathways-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="resource-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {resourcesPathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{pathway.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {pathway.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {pathway.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {pathway.linkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DealerCta />
    </>
  );
}
