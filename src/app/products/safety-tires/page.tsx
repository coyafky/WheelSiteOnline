import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import {
  tireAttribution,
  tireAttributionDisclosure,
  tireCapabilities,
  tireCapabilityHead,
  tireCta,
  tireDefinition,
  tireFaqHead,
  tireFaqs,
  tireHero,
  tireHighlightNote,
  tireMechanism,
  tireMechanismHead,
  tireMechanismNotice,
  tirePain,
  tireReportNote,
  tireRoutes,
  tireSpecs,
  tireSpecsHead,
  tireStandardNote,
} from "@/content/safety-tires";
import { PageHero } from "@/components/sections/page-hero";
import { MechanismSteps } from "@/components/mechanism-steps";
import { CapabilityGrid } from "@/components/capability-grid";
import { ParamTable } from "@/components/param-table";
import { FaqAccordion } from "@/components/faq-accordion";
import { RouteBlock } from "@/components/route-block";
import { DataNotice } from "@/components/data-notice";

export const metadata: Metadata = {
  title: "Self-Sealing Safety Tires — Polymer Sealing Layer",
  description:
    "Self-sealing tyres with a polymer sealing layer bonded to the inner liner: how the mechanism works, the measured performance figures and how the category is validated.",
};

/**
 * Self-sealing safety tyres (`/products/safety-tires`).
 *
 * Every section below carries an attribution, and the attributions differ —
 * that is the governing constraint on this page, not the layout:
 *
 *   ✅ ours     ② definition · ③ pain point · ④ mechanism · ⑥ figures · ⑧ routing
 *   ⚠️ ours, but attributed by partner — ⑤ capability (the product itself is
 *      the partner's, so the section is written about verification and
 *      delivery rather than about a factory)
 *   ✅ answerable / ❌ open — ⑦ FAQ (four answerable, one open)
 *   ❌ withheld — ⑨ the closing CTA, because the two possible closing actions
 *      belong to different business relationships and neither is settled
 *
 * The ⑨ section is omitted entirely rather than rendered as a placeholder.
 * The site rule is that each page carries an enquiry entry, and the honest
 * reading here is that the enquiry entry depends on a fact we do not yet have:
 * a button pointing at the wrong conversation is worse than no button, and the
 * routing section above still sends readers to the contact page for anything
 * this page has left open. Remove this note and render `tireCta` once the
 * attribution resolves.
 *
 * Copy discipline, restated from the content module: no absolute claims about
 * punctures, no third-party accident statistics, no certification claimed for
 * the range, and no partner warranty, channel or market figures.
 */
export default function SafetyTiresPage() {
  const cta = tireCta;

  return (
    <>
      {/* ① Hero ------------------------------------------------------------ */}
      <PageHero
        id="top"
        titleId="safety-tires-title"
        eyebrow={tireHero.eyebrow}
        heading={tireHero.heading}
        lede={tireHero.subheading}
        supporting={tireHero.lede}
        backgroundImage={{ src: "/images/safety-tires/hero-road.webp", alt: "Self-sealing safety tire on an open road" }}
      >
        <Link href="#mechanism" className="btn-pill-solid">
          How the mechanism works
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/contact" className="btn-pill-outline !text-white">
          Ask about the category
        </Link>
      </PageHero>

      {/* ② Definition — ✅ ours --------------------------------------------- */}
      <section
        aria-labelledby="tire-definition-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{tireDefinition.eyebrow}</p>
            <h2
              id="tire-definition-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {tireDefinition.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {tireDefinition.body}
            </p>
          </div>

          <ul data-reveal-group className="mt-12 grid gap-6 lg:grid-cols-3">
            {tireDefinition.points.map((point, index) => (
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

      {/* ③ Pain point, with the fit list folded in — ✅ ours ----------------- */}
      <section
        id="pain-point"
        aria-labelledby="tire-pain-title"
        data-reveal
        className="scroll-mt-[120px] border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[760px]">
            <p className="eyebrow">{tirePain.eyebrow}</p>
            <h2
              id="tire-pain-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {tirePain.heading}
            </h2>
            <p className="mt-2 font-display text-[0.76rem] font-700 uppercase tracking-[0.16em] text-steel">
              {tirePain.headingEn}
            </p>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {tirePain.body}
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-white p-8 lg:p-10">
            <p className="eyebrow">{tirePain.audienceHeading}</p>
            <ul
              data-reveal-group
              className="mt-8 grid gap-7 sm:grid-cols-2 lg:gap-9"
            >
              {tirePain.audience.map((point) => (
                <li key={point.title} className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-forge"
                    />
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
        </div>
      </section>

      {/* ④ Mechanism ★★ — ✅ ours, the strongest section on the page --------- */}
      <section
        aria-labelledby="tire-mechanism-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <h2 id="tire-mechanism-title" className="sr-only">
            {tireMechanismHead.heading}
          </h2>

          <MechanismSteps
            steps={tireMechanism}
            eyebrow={tireMechanismHead.eyebrow}
            heading={tireMechanismHead.heading}
            lede={tireMechanismHead.lede}
            mediaNotice={tireMechanismNotice}
            anchorId="mechanism"
          />
        </div>
      </section>

      {/* ⑤ Capability — ⚠️ verification and delivery, not the factory ------- */}
      <section
        aria-labelledby="tire-capability-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div className="max-w-[720px] px-4">
            <p className="eyebrow">{tireCapabilityHead.eyebrow}</p>
            <h2
              id="tire-capability-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {tireCapabilityHead.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {tireCapabilityHead.lede}
            </p>
          </div>

          <CapabilityGrid
            capabilities={tireCapabilities}
            columns={4}
            className="mt-12 px-4"
          />
        </div>
      </section>

      {/* ⑥ Performance figures — ✅ ours ------------------------------------ */}
      <section
        aria-labelledby="tire-specs-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{tireSpecsHead.eyebrow}</p>
            <h2
              id="tire-specs-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {tireSpecsHead.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {tireSpecsHead.lede}
            </p>
          </div>

          <ParamTable
            rows={tireSpecs}
            standardNote={tireStandardNote}
            highlightNote={tireHighlightNote}
            reportNote={tireReportNote}
            anchorId="specs"
            className="mt-12"
          />
        </div>
      </section>

      {/* ⑦ FAQ — four answerable entries + one open, never hidden ------------ */}
      <section
        aria-labelledby="tire-faq-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <h2 id="tire-faq-title" className="sr-only">
            {tireFaqHead.heading}
          </h2>

          <FaqAccordion
            entries={tireFaqs}
            eyebrow={tireFaqHead.eyebrow}
            heading={tireFaqHead.heading}
            lede={tireFaqHead.lede}
            defaultOpenIndex={0}
          />

          {/*
            The one question we cannot answer yet is not deleted. Hiding it
            would read as avoidance on the first thing a buyer asks, so it sits
            in the list with an explicit statement instead.
          */}
          <div className="mt-10 max-w-[820px] rounded-xl border border-forge/30 bg-white p-6">
            <p className="flex items-center gap-2 font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge-deep">
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              Open —{" "}
              {tireAttribution.resolved
                ? "answered below"
                : tireAttribution.note}
            </p>
            <p className="mt-3 text-[0.96rem] leading-relaxed text-ink/80">
              {tireAttributionDisclosure}
            </p>
          </div>
        </div>
      </section>

      {/* ⑧ Routing — ✅ ours --------------------------------------------------- */}
      <section
        aria-labelledby="tire-routes-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <RouteBlock
            routes={tireRoutes}
            heading="Where to go next"
            columns={3}
          />
        </div>
      </section>

      {/*
        ⑨ Closing block — ⚠️ withheld while the attribution is open.
        Rendered only when a closing action exists. See the page header note.
      */}
      {cta ? (
        <section
          id="tire-cta"
          aria-labelledby="tire-cta-title"
          data-reveal
          className="scroll-mt-[120px] bg-forge-soft"
        >
          <div className="container-fh grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20">
            <div>
              <p className="eyebrow">Enquiries</p>
              <h2
                id="tire-cta-title"
                className="mt-4 max-w-[640px] font-display text-[clamp(1.9rem,4.2vw,3rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
              >
                {cta.title}
              </h2>
              <p className="mt-5 max-w-[560px] text-[1.02rem] leading-relaxed text-steel">
                {cta.body}
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link href={cta.primary.href} className="btn-pill-solid">
                {cta.primary.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={cta.secondary.href}
                className="btn-pill-outline text-ink"
              >
                {cta.secondary.label}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="tire-cta-pending-title"
          data-reveal
          className="bg-soft py-16 lg:py-20"
        >
          <div className="container-fh">
            <h2 id="tire-cta-pending-title" className="sr-only">
              Enquiries
            </h2>
            <DataNotice
              tone="pending"
              label="Enquiries"
              className="max-w-[820px]"
            >
              This page intentionally does not carry a closing enquiry block
              yet. There are two possible conversations here — distribution and
              supply partnership — and which one applies depends on the brand
              relationship that is still being confirmed. The routing section
              above reaches us in the meantime, and we would rather answer a
              direct question than show a button that points at the wrong desk.
            </DataNotice>
          </div>
        </section>
      )}
    </>
  );
}
