import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, TriangleAlert } from "lucide-react";
import {
  cooperationModels,
  cooperationModelsCopy,
  customDevCta,
  customDevHero,
  customDevHeroActions,
  developmentFlow,
  developmentFlowCopy,
  developmentFlowCrossLink,
  mooTerms,
} from "@/content/custom-development";
import { FlowStepRow } from "@/components/flow-step-row";
import { CrossLink } from "@/components/cross-link";
import { PageHero } from "@/components/sections/page-hero";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "Custom Development — OEM, ODM & Private Label",
  description:
    "OEM, ODM and private-label development across our four product lines: what each cooperation model means, who provides what, the commercial milestones of a project and how thresholds are quoted.",
};

/**
 * Custom development page (`/custom-development`).
 *
 * Five sections, per the page spec:
 *   ① hero            — what custom development is and who it is for
 *   ② cooperation     — OEM / ODM / private label, defined (owns #cooperation-models)
 *   ③ process         — five COMMERCIAL milestones + cross-link to the
 *                       engineering flow on /products/custom-aluminum
 *   ④ thresholds      — MOQ / lead time / tooling (all placeholder)
 *   ⑤ CTA             — enquiry entry
 *
 * SCOPE, and why this page is short:
 * The commercial story and the engineering story are deliberately split across
 * this page and `/products/custom-aluminum`. This page owns cooperation
 * models, who carries the tooling cost, minimum quantities and lead time. The
 * aluminium page owns DFM, tooling development, first-article inspection and
 * tolerance. Section ③ therefore stays at commercial-node level and hands the
 * engineering detail off with a cross-link. Do not grow it into a second
 * engineering narrative — that duplication is exactly what the split avoids.
 *
 * Every commercial threshold is a visible placeholder: the thresholds table
 * never renders, because `mooTerms.confirmed` is false and no rows exist.
 */
export default function CustomDevelopmentPage() {
  return (
    <>
      {/* ① Hero ------------------------------------------------------------ */}
      <PageHero
        id="top"
        titleId="custom-development-title"
        eyebrow={customDevHero.eyebrow}
        heading={customDevHero.heading}
        lede={customDevHero.lede}
        supporting={customDevHero.supporting}
      >
        <Link href={customDevHeroActions.primary.href} className="btn-pill-solid">
          {customDevHeroActions.primary.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href={customDevHeroActions.secondary.href}
          className="btn-pill-outline text-ink"
        >
          {customDevHeroActions.secondary.label}
        </Link>
      </PageHero>

      {/* Audience line — kept out of the hero so the hero stays a clean claim. */}
      <div className="border-b border-border bg-soft">
        <div className="container-fh py-5">
          <p className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel">
            {customDevHero.audience}
          </p>
        </div>
      </div>

      {/* ② Cooperation models (owns #cooperation-models) -------------------- */}
      <section
        id="cooperation-models"
        aria-labelledby="cooperation-title"
        data-reveal
        className="scroll-mt-[120px] border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[760px]">
            <p className="eyebrow">{cooperationModelsCopy.eyebrow}</p>
            <h2
              id="cooperation-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {cooperationModelsCopy.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {cooperationModelsCopy.lede}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cooperationModels.map((model) => (
              <article
                key={model.slug}
                className="flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <h3 className="font-display text-[1.6rem] font-800 uppercase leading-none tracking-[0.02em] text-ink">
                  {model.name}
                </h3>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-ink/80">
                  {model.tagline}
                </p>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-steel">
                  {model.body}
                </p>

                <p className="mt-6 font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge">
                  You provide
                </p>
                <ul data-reveal-group className="mt-4 grid flex-1 content-start gap-3">
                  {model.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span className="text-[0.86rem] leading-relaxed text-steel">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className="mt-8 flex max-w-[820px] items-start gap-2.5 rounded-xl border border-forge/30 bg-forge-soft px-5 py-4 text-sm leading-relaxed text-ink/80">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-forge-deep"
              aria-hidden="true"
            />
            <span>{cooperationModelsCopy.confirmationNote}</span>
          </p>
        </div>
      </section>

      {/* ③ Development flow (commercial view) + cross-link ------------------ */}
      <section
        aria-labelledby="development-flow-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[740px]">
            <p className="eyebrow">{developmentFlowCopy.eyebrow}</p>
            <h2
              id="development-flow-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {developmentFlowCopy.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {developmentFlowCopy.lede}
            </p>
          </div>

          <FlowStepRow
            steps={developmentFlow}
            density="roomy"
            columns={5}
            className="mt-12"
          />

          <CrossLink
            eyebrow={developmentFlowCrossLink.eyebrow}
            title={developmentFlowCrossLink.title}
            body={developmentFlowCrossLink.body}
            href={developmentFlowCrossLink.href}
            linkLabel={developmentFlowCrossLink.linkLabel}
            className="mt-8 max-w-[820px] bg-soft"
          />
        </div>
      </section>

      {/* ④ Thresholds: MOQ, tooling, lead time ----------------------------- */}
      <section
        aria-labelledby="thresholds-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[700px]">
            <p className="eyebrow">{mooTerms.eyebrow}</p>
            <h2
              id="thresholds-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {mooTerms.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {mooTerms.lede}
            </p>
          </div>

          {/*
            While the terms are unconfirmed we render the fallback sentence and
            no table at all — an empty table implies we have the terms and chose
            not to show them. The rows are never authored, so an invented MOQ
            cannot survive into the DOM by accident.
          */}
          {mooTerms.confirmed && mooTerms.rows.length > 0 ? (
            <div className="mt-12 overflow-hidden rounded-xl border border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-soft">
                    {mooTerms.columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className="px-6 py-4 font-display text-[0.7rem] font-700 uppercase tracking-[0.14em] text-steel"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mooTerms.rows.map((row) => (
                    <tr key={row.model} className="border-t border-border">
                      <th
                        scope="row"
                        className="px-6 py-4 font-display text-[1rem] font-700 uppercase tracking-[0.01em] text-ink"
                      >
                        {row.model}
                      </th>
                      <td className="px-6 py-4 text-sm text-steel">{row.moq}</td>
                      <td className="px-6 py-4 text-sm text-steel">
                        {row.toolingDays}
                      </td>
                      <td className="px-6 py-4 text-sm text-steel">
                        {row.productionDays}
                      </td>
                      <td className="px-6 py-4 text-sm text-steel">
                        {row.toolingCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-8 flex max-w-[820px] items-start gap-2.5 rounded-xl border border-forge/30 bg-forge-soft px-5 py-4 text-sm leading-relaxed text-ink/80">
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0 text-forge-deep"
                aria-hidden="true"
              />
              <span>{mooTerms.fallback}</span>
            </p>
          )}
        </div>
      </section>

      {/* ⑤ Enquiry --------------------------------------------------------- */}
      <DealerCta title={customDevCta.title} body={customDevCta.body} />
    </>
  );
}
