import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Lock, ShieldQuestion } from "lucide-react";
import {
  privateLabelAudience,
  privateLabelAudiencePoints,
  privateLabelBranding,
  privateLabelConfidentiality,
  privateLabelExclusivity,
  privateLabelFlow,
  privateLabelHero,
  privateLabelOffer,
  privateLabelPathways,
} from "@/content/private-label";
import { DealerCta } from "@/components/sections/dealer-cta";
import { PageHero } from "@/components/sections/page-hero";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { getLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/types";

export const metadata: Metadata = {
  title: "Private Label Forged Wheels — Manufacture Under Your Own Brand",
  description:
    "Fenghuai manufactures private label forged wheels under your brand — custom centre caps, engraving, packaging and documentation, with confidentiality and design exclusivity available on request.",
  robots: { index: true, follow: true },
};

/**
 * Private label programme.
 *
 * Deeper register than `/dealers` — the audience here is already sold on the
 * model and is reading for terms. Structure: hero → the offer → what carries
 * your brand → confidentiality/exclusivity → production flow → who it is for
 * → pathways → CTA.
 *
 * Commercial terms (exclusivity scope, tooling ownership, MOQ for custom cap
 * tooling) are PLACEHOLDER in `@/content/private-label` and are written as
 * questions to be answered, not as promises.
 */
export default async function PrivateLabelPage() {
  const locale = await getLocale();
  return (
    <>
      {/* A. Hero -----------------------------------------------------------
          Shared identity band, ink tone. The breadcrumb slot keeps the rail
          above the eyebrow; `PageHero` adds the same mt-6 eyebrow spacing the
          local copy used. */}
      <PageHero
        id="top"
        titleId="private-label-title"
        tone="dark"
        breadcrumb={
          <SiteBreadcrumbs
            label="Breadcrumb"
            tone="dark"
            items={[
              { label: "Dealer Programs", href: localizedPath("/dealers", locale) },
              { label: "Private Label" },
            ]}
          />
        }
        eyebrow={privateLabelHero.eyebrow}
        heading={privateLabelHero.heading}
        lede={privateLabelHero.lede}
        supporting={privateLabelHero.supporting}
      >
        <Link href="/contact" className="btn-pill-solid">
          Discuss a private label line
          <ArrowRight className="size-4" />
        </Link>
        <Link href="/dealers" className="btn-pill-outline !text-white">
          Back to dealer programs
        </Link>
      </PageHero>

      {/* B. The offer -------------------------------------------------------- */}
      <section
        aria-labelledby="offer-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{privateLabelOffer.eyebrow}</p>
            <h2
              id="offer-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {privateLabelOffer.heading}
            </h2>
            <p className="mt-5 max-w-[560px] text-[1.02rem] leading-relaxed text-steel">
              {privateLabelOffer.body}
            </p>
          </div>

          <ul
            data-reveal-group
            className="grid content-start gap-5 self-start rounded-xl border border-border bg-soft p-8"
          >
            {privateLabelOffer.points.map((point) => (
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

      {/* C. What carries your brand ------------------------------------------ */}
      <section
        aria-labelledby="branding-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[700px]">
            <p className="eyebrow">Brand surfaces</p>
            <h2
              id="branding-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Every surface the customer sees
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Four places where a brand either holds up or gives itself away. All
              four can be yours, and all four can be left neutral if you would
              rather keep the wheel unbranded.
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
          >
            {privateLabelBranding.map((item) => (
              <article
                key={item.step}
                className="flex flex-col bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                  {item.step}
                </span>
                <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* D. Confidentiality / exclusivity ------------------------------------ */}
      <section
        aria-labelledby="confidentiality-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/12 text-forge">
                <Lock className="size-5" aria-hidden="true" />
              </span>
              <p className="eyebrow mt-6">{privateLabelConfidentiality.eyebrow}</p>
              <h2
                id="confidentiality-title"
                className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
              >
                {privateLabelConfidentiality.heading}
              </h2>
              <p className="mt-5 max-w-[520px] text-[1.02rem] leading-relaxed text-steel">
                {privateLabelConfidentiality.body}
              </p>

              <ul data-reveal-group className="mt-8 grid gap-4">
                {privateLabelConfidentiality.points.map((point) => (
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

            {/* Exclusivity terms — written as open questions, not promises. */}
            <div className="rounded-xl border border-forge/35 bg-forge-soft p-8 lg:p-10">
              <span className="inline-flex items-center gap-2 font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge-deep">
                <ShieldQuestion className="size-4" aria-hidden="true" />
                Terms to be agreed in writing
              </span>

              <ul data-reveal-group className="mt-7 grid gap-7">
                {privateLabelExclusivity.map((point) => (
                  <li key={point.title}>
                    <h3 className="font-display text-[1.08rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-steel">
                      {point.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* E. Production flow -------------------------------------------------- */}
      <section
        aria-labelledby="flow-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[700px]">
            <p className="eyebrow">Production flow</p>
            <h2
              id="flow-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              From brief to repeat order
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Five stages. The sample approval at stage three is the point where
              the line becomes yours — after that, production is held to it.
            </p>
          </div>

          <ol
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5"
          >
            {privateLabelFlow.map((step) => (
              <li
                key={step.step}
                className="flex flex-col bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                  {step.step}
                </span>
                <h3 className="mt-4 font-display text-[1.1rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* F. Who it is for ---------------------------------------------------- */}
      <section
        aria-labelledby="audience-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[700px]">
            <p className="eyebrow">{privateLabelAudience.eyebrow}</p>
            <h2
              id="audience-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {privateLabelAudience.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {privateLabelAudience.body}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {privateLabelAudiencePoints.map((point) => (
              <article
                key={point.title}
                className="rounded-xl border border-border bg-soft p-7"
              >
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-forge/12 text-forge">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <h3 className="mt-4 font-display text-[1.2rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">
                  {point.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* G. Pathways ---------------------------------------------------------- */}
      <section
        aria-labelledby="pl-pathways-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="pl-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {privateLabelPathways.map((pathway) => (
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

      <DealerCta
        title="Put your own name on the wheel"
        body="Send us the programme you need to cover and the volume you are planning. We will come back with a specification, the tooling scope and a delivery position."
      />
    </>
  );
}
