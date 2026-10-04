import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  evAudience,
  evCapabilities,
  evCta,
  evDefinition,
  evFaqIntro,
  evFaqNotice,
  evFaqs,
  evHero,
  evPartGroupBoundary,
  evPartGroupGenericNote,
  evPartGroups,
  evQuality,
  evRoutes,
} from "@/content/ev-components";
import { PageHero } from "@/components/sections/page-hero";
import { PartGroupCards } from "@/components/part-group-cards";
import { SelfIdentifyBlock } from "@/components/self-identify-block";
import { CapabilityGrid } from "@/components/capability-grid";
import { QualityEvidence } from "@/components/quality-evidence";
import { FaqAccordion } from "@/components/faq-accordion";
import { RouteBlock } from "@/components/route-block";
import { DataNotice } from "@/components/data-notice";

export const metadata: Metadata = {
  title: "EV Powertrain Housings — Cast Aluminium, Built to Drawing",
  description:
    "Aluminium housings for EV motor, inverter and battery systems: low- and high-pressure die casting, friction stir welding and dimensional and leak testing. Developed to a customer drawing.",
};

/**
 * EV powertrain housings (`/products/ev-components`).
 *
 * Eight sections, written for a purchasing engineer rather than a dealer:
 *   ① hero           — what the line is
 *   ② definition     — what a housing has to solve (heat, sealing, precision)
 *   ③ part types ★   — the differentiable section (the only one with imagery
 *                      substitutes: three groups of part types)
 *   ④ self-identify  — who this is not for, stated first
 *   ⑤ capability     — forming, joining, machining, engineering
 *   ⑥ quality        — the evidence table, with one row deliberately open
 *   ⑦ FAQ            — two entries, plus a notice naming what is open
 *   ⑧ routing + CTA  — engineering assessment, not a quote
 *
 * The section count is eight rather than nine because the spec's model /
 * specification block has no data behind it on this line, and DESIGN.md's
 * publishing rule is that an empty reserved block is not rendered at all.
 *
 * The closing block is deliberately NOT the site's standard dealer enquiry
 * band. That band asks for a quote, and a quote is the wrong ask for a
 * project-based housing enquiry — the customer does not yet know whether we
 * can take the job. This page closes on an engineering assessment instead.
 */
export default function EvComponentsPage() {
  return (
    <>
      {/* ① Hero ------------------------------------------------------------ */}
      <PageHero
        id="top"
        titleId="ev-components-title"
        eyebrow={evHero.eyebrow}
        heading={evHero.heading}
        lede={evHero.subheading}
        supporting={evHero.partsLine}
        backgroundImage={{ src: "/images/ev-components/hero.webp", alt: "EV component housing in production" }}
      >
        <Link href="/contact" className="btn-pill-solid">
          {evHero.ctaLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="#capable-parts" className="btn-pill-outline !text-white">
          See part types
        </Link>
      </PageHero>

      {/* ② Definition ------------------------------------------------------ */}
      <section
        aria-labelledby="definition-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{evDefinition.eyebrow}</p>
            <h2
              id="definition-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {evDefinition.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {evDefinition.body}
            </p>
          </div>

          <ul data-reveal-group className="mt-12 grid gap-6 lg:grid-cols-3">
            {evDefinition.points.map((point, index) => (
              <li
                key={point}
                className="flex flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-ink/80">
                  {point}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ③ Part types ★ — the differentiable section ------------------------ */}
      <section
        id="capable-parts"
        aria-labelledby="capable-parts-title"
        data-reveal
        className="scroll-mt-[120px] border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div className="max-w-[760px] px-4">
            <p className="eyebrow">Range</p>
            <h2
              id="capable-parts-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Fifteen part types across three systems
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Grouped by where the part sits in the vehicle, with the difficulty
              that decides whether it can be cast at all. Every one of them is
              developed against a customer input rather than held in stock.
            </p>
          </div>

          <PartGroupCards
            groups={evPartGroups}
            boundaryNote={evPartGroupBoundary}
            genericNote={evPartGroupGenericNote}
            className="mt-12 px-4"
          />
        </div>
      </section>

      {/* ④ Who this is for ------------------------------------------------- */}
      <section
        aria-labelledby="audience-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Capability</p>
            <h2
              id="audience-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Whether this page is for you
            </h2>
          </div>

          <SelfIdentifyBlock
            negative={evAudience.negative}
            positiveHeading={evAudience.positiveHeading}
            positives={evAudience.positives}
            className="mt-12"
          />
        </div>
      </section>

      {/* ⑤ Capability ------------------------------------------------------ */}
      <section
        aria-labelledby="ev-capability-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div className="max-w-[720px] px-4">
            <p className="eyebrow">Capability</p>
            <h2
              id="ev-capability-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              What a housing project needs, and what we hold
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Five capabilities, in the order a housing passes through them.
              Process routes are selected per part; none of them is a fixed
              line.
            </p>
          </div>

          <CapabilityGrid
            capabilities={evCapabilities}
            highlightLast
            className="mt-12 px-4 lg:grid-cols-3"
          />
        </div>
      </section>

      {/* ⑥ Quality and inspection ------------------------------------------ */}
      <section
        aria-labelledby="ev-quality-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <QualityEvidence
            rows={evQuality.rows}
            disclosure={evQuality.disclosure}
            eyebrow="Reference"
            heading="How a housing is checked before it ships"
            lede="Two rows are evidenced today. The third is the question every vehicle customer asks, and it is shown as it stands rather than answered in general terms."
          />
        </div>
      </section>

      {/* ⑦ FAQ -------------------------------------------------------------- */}
      <section
        aria-labelledby="ev-faq-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <FaqAccordion
            entries={evFaqs}
            eyebrow={evFaqIntro.heading ? "Reference" : "Reference"}
            heading={evFaqIntro.heading}
            lede={evFaqIntro.lede}
            defaultOpenIndex={0}
          />

          <DataNotice
            tone="pending"
            label="Still to confirm"
            className="mt-10 max-w-[820px]"
          >
            {evFaqNotice}
          </DataNotice>
        </div>
      </section>

      {/* ⑧ Routing + engineering assessment CTA ----------------------------- */}
      <section
        aria-labelledby="ev-routes-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <RouteBlock
            routes={evRoutes}
            heading="Where to go next"
            columns={3}
          />
        </div>
      </section>

      {/* ⑧b Engineering assessment — this page's own closing block ---------- */}
      <section
        id="engineering-eval"
        aria-labelledby="ev-cta-title"
        data-reveal
        className="scroll-mt-[120px] bg-forge-soft"
      >
        <div className="container-fh grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">Engineering assessment</p>
            <h2
              id="ev-cta-title"
              className="mt-4 max-w-[640px] font-display text-[clamp(1.9rem,4.2vw,3rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {evCta.title}
            </h2>
            <p className="mt-5 max-w-[560px] text-[1.02rem] leading-relaxed text-steel">
              {evCta.body}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link href={evCta.primary.href} className="btn-pill-solid">
              {evCta.primary.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={evCta.secondary.href}
              className="btn-pill-outline text-ink"
            >
              {evCta.secondary.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
