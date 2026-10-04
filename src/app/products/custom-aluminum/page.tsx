import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  boundaryClosingLine,
  boundaryExcludedNote,
  boundaryTerms,
  caCapabilities,
  caCta,
  caDefinition,
  caDevelopmentCopy,
  caDevelopmentFlow,
  caDevelopmentNda,
  caFaqNotice,
  caFaqs,
  caFlowCrossLink,
  caHero,
  caHeroActions,
  caInputNote,
  caInputs,
  caRoutes,
  caSplit,
  caTypicalParts,
  caTypicalPartsBoundary,
} from "@/content/custom-aluminum";
import { PageHero } from "@/components/sections/page-hero";
import { CrossLink } from "@/components/cross-link";
import { InputTypeCards } from "@/components/input-type-cards";
import { BoundaryTable } from "@/components/boundary-table";
import { CapabilityGrid } from "@/components/capability-grid";
import { PartGroupCards } from "@/components/part-group-cards";
import { ProcessDiagram } from "@/components/process-diagram";
import { FaqAccordion } from "@/components/faq-accordion";
import { RouteBlock } from "@/components/route-block";
import { DataNotice } from "@/components/data-notice";
import { DealerCta } from "@/components/sections/dealer-cta";

/**
 * 🔴 PUBLISHING GATE
 * ------------------
 * The boundary section ships in an INCOMPLETE state: the "not made" column
 * has no confirmed rows, so `boundaryTerms.excludedConfirmed` is false and the
 * column renders as a reserved slot with a disclosure sentence attached.
 *
 * While that is true this page must NOT be indexed. The section's whole job is
 * to draw a limit, and publishing it with the limit blank tells a reader we
 * make anything — the exact impression the page was written to avoid. Flip
 * `excludedConfirmed` on, populate the rows, and remove the robots block below
 * once the categories are confirmed.
 */
export const metadata: Metadata = {
  title: "Custom Aluminum Components — Built to Your Drawing",
  description:
    "Custom aluminium and magnesium components developed from a drawing, 3D data or a physical sample: casting, forging, precision machining, heat treatment and finishing.",
  // ⚠️ Remove once `boundaryTerms.excludedConfirmed` is true. See note above.
  robots: { index: false, follow: true },
};

/**
 * Custom aluminium components (`/products/custom-aluminum`).
 *
 * Eight sections, structured as input → boundary → capability → flow:
 *   ① hero           — what the line does
 *   ② definition     — custom work vs. catalogue, plus the fork from the EV page
 *   ③ inputs ★       — the four ways a job can start
 *   ④ boundary ★★    — what we make / do not make / assess (OPEN — see gate)
 *   ⑤ capability     — materials, routes, machining, heat, surface, engineering
 *   ⑥ typical parts  — two groups, as examples rather than a catalogue
 *   ⑦ flow ★         — eight engineering stages, with the NDA note attached
 *   ⑧ FAQ            — three answerable entries + a notice for the open ones
 *   ⑨ routing + CTA  — the standard enquiry band fits here
 *
 * WHY THE STANDARD CTA WORKS ON THIS PAGE AND NOT ON THE EV PAGE: this reader
 * has a part to make and is asking us to make it. Sending the drawing IS the
 * enquiry. On the powertrain page the reader has not yet established that we
 * can take the job, so a quote is premature there. The two pages are a matched
 * pair and the difference is deliberate.
 *
 * The `#development-flow` anchor is a cross-page contract: the custom
 * development page links to it by name. Do not rename it.
 */
export default function CustomAluminumPage() {
  return (
    <>
      {/* ① Hero ------------------------------------------------------------ */}
      <PageHero
        id="top"
        titleId="custom-aluminum-title"
        eyebrow={caHero.eyebrow}
        heading={caHero.heading}
        lede={caHero.subheading}
        supporting={caHero.lede}
        backgroundImage={{ src: "/images/custom-aluminum/hero.webp", alt: "Custom aluminum component ready for machining" }}
      >
        <Link href={caHeroActions.primary.href} className="btn-pill-solid">
          {caHeroActions.primary.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href={caHeroActions.secondary.href}
          className="btn-pill-outline !text-white"
        >
          {caHeroActions.secondary.label}
        </Link>
      </PageHero>

      {/* ② Definition + the fork from the EV page ---------------------------- */}
      <section
        aria-labelledby="ca-definition-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{caDefinition.eyebrow}</p>
            <h2
              id="ca-definition-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {caDefinition.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {caDefinition.body}
            </p>
          </div>

          <ul data-reveal-group className="mt-12 grid gap-6 lg:grid-cols-3">
            {caDefinition.points.map((point, index) => (
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

          {/*
            The fork between this page and the powertrain page. Rendered as a
            bordered aside rather than body copy: both routes start from the
            same instruction, and the wrong turn costs the reader a whole
            evaluation.
          */}
          <CrossLink
            eyebrow={caSplit.eyebrow}
            title={caSplit.title}
            body={caSplit.body}
            href={caSplit.href}
            linkLabel={caSplit.linkLabel}
            className="mt-12 max-w-[820px] border-forge/30 bg-forge-soft"
          />
        </div>
      </section>

      {/* ③ The four inputs ★ ------------------------------------------------ */}
      <section
        id="inputs"
        aria-labelledby="ca-inputs-title"
        data-reveal
        className="scroll-mt-[120px] border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">Process</p>
            <h2
              id="ca-inputs-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Four ways a project starts
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              A drawing, 3D data or a sample all enter the same development
              flow. Each one asks something slightly different of you, so each
              card lists what we need before the work can be assessed.
            </p>
          </div>

          <InputTypeCards
            inputs={caInputs}
            note={caInputNote}
            className="mt-12"
          />
        </div>
      </section>

      {/* ④ Boundary ★★ — the section that carries the publishing gate ------- */}
      <section
        id="boundary"
        aria-labelledby="ca-boundary-title"
        data-reveal
        className="scroll-mt-[120px] border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[760px]">
            <p className="eyebrow">Capability</p>
            <h2
              id="ca-boundary-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Where the boundary is
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Most capability pages list what a supplier can do. This one also
              states what it cannot, because the expensive failure in custom
              work is not a refusal — it is finding out at the end of an
              evaluation that the part could not have been made.
            </p>
          </div>

          <BoundaryTable
            rows={boundaryTerms.rows}
            excludedConfirmed={boundaryTerms.excludedConfirmed}
            excludedNote={boundaryExcludedNote}
            closingLine={boundaryClosingLine}
            className="mt-12"
          />

          {!boundaryTerms.excludedConfirmed ? (
            <DataNotice
              tone="pending"
              label="Section incomplete"
              className="mt-8 max-w-[820px]"
            >
              The categories we decline are still being confirmed, and the
              middle column above is shown empty rather than filled in. It will
              be published with the rest of the section, because a stated limit
              is more useful to both sides than a claim to make anything.
            </DataNotice>
          ) : null}
        </div>
      </section>

      {/* ⑤ Capability -------------------------------------------------------- */}
      <section
        aria-labelledby="ca-capability-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div className="max-w-[720px] px-4">
            <p className="eyebrow">Capability</p>
            <h2
              id="ca-capability-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Six capabilities, combined per project
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              These are routes the plant holds, not a menu to pick from. Which
              ones a part passes through is decided during the DFM assessment.
            </p>
          </div>

          <CapabilityGrid
            capabilities={caCapabilities}
            className="mt-12 px-4 lg:grid-cols-3"
          />
        </div>
      </section>

      {/* ⑥ Typical parts ----------------------------------------------------- */}
      <section
        aria-labelledby="ca-parts-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div className="max-w-[720px] px-4">
            <p className="eyebrow">Reference</p>
            <h2
              id="ca-parts-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Where this capability lands
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Two application areas, shown as examples rather than as a range —
              the part you actually need is assessed from your drawing.
            </p>
          </div>

          <PartGroupCards
            groups={caTypicalParts}
            boundaryNote={caTypicalPartsBoundary}
            className="mt-12 px-4"
          />
        </div>
      </section>

      {/* ⑦ Development flow ★ — the page's main section ---------------------- */}
      <section
        aria-labelledby="ca-flow-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[740px]">
            <p className="eyebrow">{caDevelopmentCopy.eyebrow}</p>
            <h2
              id="ca-flow-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {caDevelopmentCopy.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {caDevelopmentCopy.lede}
            </p>
          </div>

          <ProcessDiagram
            stages={caDevelopmentFlow}
            ndaNote={caDevelopmentNda}
            anchorId="development-flow"
            crossLink={
              <CrossLink
                eyebrow={caFlowCrossLink.eyebrow}
                title={caFlowCrossLink.title}
                body={caFlowCrossLink.body}
                href={caFlowCrossLink.href}
                linkLabel={caFlowCrossLink.linkLabel}
                className="max-w-[820px] bg-soft"
              />
            }
            className="mt-12"
          />
        </div>
      </section>

      {/* ⑧ FAQ ---------------------------------------------------------------- */}
      <section
        aria-labelledby="ca-faq-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <FaqAccordion
            entries={caFaqs}
            heading="Questions before the first drawing"
            lede="Three entries we can answer today. The rest — grades, size envelope, tolerances — are open, and are named below rather than answered vaguely."
            defaultOpenIndex={0}
            headingId="ca-faq-title"
          />

          <DataNotice
            tone="pending"
            label="Still to confirm"
            className="mt-10 max-w-[820px]"
          >
            {caFaqNotice}
          </DataNotice>
        </div>
      </section>

      {/* ⑨ Routing ----------------------------------------------------------- */}
      <section
        aria-labelledby="ca-routes-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <RouteBlock routes={caRoutes} heading="Where to go next" columns={3} />
        </div>
      </section>

      {/* ⑨b Closing --------------------------------------------------------- */}
      <DealerCta title={caCta.title} body={caCta.body} />
    </>
  );
}
