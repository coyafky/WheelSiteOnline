import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileCheck2, Ship } from "lucide-react";
import {
  dealerHero,
  dealerModel,
  dealerOnboarding,
  dealerPathways,
  dealerPrograms,
  dealerShipping,
  dealerTraceability,
} from "@/content/dealer-programs";
import { DealerCta } from "@/components/sections/dealer-cta";
import { PageHero } from "@/components/sections/page-hero";
import { getPublicLocalesForPath, localizedRouteMetadata } from "@/lib/i18n/publication";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const extraPublicLocales = await getPublicLocalesForPath("/dealers");
  return {
    title: "Dealer Supply Programme — Supply Without Stock",
    description:
      "Fenghuai supplies dealers and distributors without a mandatory stock commitment — programme options, onboarding steps, freight and traceability across our four product lines.",
    alternates: await localizedRouteMetadata("/dealers", locale, { extraPublicLocales }),
    robots: { index: extraPublicLocales.includes(locale), follow: true },
  };
}

/**
 * Dealer supply programme hub.
 *
 * Follows the reference site's `dealer-*` long-form archetype:
 * hero → the dealer model → programme cards → onboarding → shipping →
 * proof/traceability → FAQ → closing CTA.
 */
export default function DealersPage() {
  return (
    <>
      {/* A. Hero -----------------------------------------------------------
          Shared identity band, ink tone. */}
      <PageHero
        id="top"
        titleId="dealers-title"
        tone="dark"
        eyebrow={dealerHero.eyebrow}
        heading={dealerHero.heading}
        lede={dealerHero.lede}
        supporting={dealerHero.supporting}
      >
        <Link href="/contact" className="btn-pill-solid">
          Start a dealer enquiry
          <ArrowRight className="size-4" />
        </Link>
        <Link href="/dealers/private-label" className="btn-pill-outline !text-white">
          Private label programme
        </Link>
      </PageHero>

      {/* B. The dealer model ----------------------------------------------- */}
      <section
        aria-labelledby="model-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{dealerModel.eyebrow}</p>
            <h2
              id="model-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {dealerModel.heading}
            </h2>
            <p className="mt-5 max-w-[560px] text-[1.02rem] leading-relaxed text-steel">
              {dealerModel.body}
            </p>
          </div>

          <ul
            data-reveal-group
            className="grid content-start gap-5 self-start rounded-xl border border-border bg-soft p-8"
          >
            {dealerModel.points.map((point) => (
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

      {/* C. Programme cards ------------------------------------------------- */}
      <section
        aria-labelledby="programmes-title"
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh-wide">
          <div data-reveal className="max-w-[700px] px-4">
            <p className="eyebrow">Three programmes</p>
            <h2
              id="programmes-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Pick how you want to go to market
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              The programmes are not tiers — they answer different questions. Supply
              is about not holding stock, private label is about who owns the brand,
              and programme support is about what you need to launch.
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
          >
            {dealerPrograms.map((program) => (
              <article
                key={program.slug}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <div className="border-b border-border bg-ink px-7 py-8">
                  <h3 className="font-display text-[1.36rem] font-700 uppercase leading-tight tracking-[0.01em] text-white">
                    {program.name}
                  </h3>
                  <p className="mt-2.5 font-display text-[0.96rem] font-600 uppercase leading-snug tracking-[0.02em] text-forge">
                    {program.tagline}
                  </p>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <p className="text-sm leading-relaxed text-steel">
                    {program.body}
                  </p>

                  <ul className="mt-6 grid flex-1 gap-3.5">
                    {program.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span
                          className="mt-[7px] size-1.5 shrink-0 rounded-full bg-forge"
                          aria-hidden="true"
                        />
                        <span className="text-sm leading-relaxed text-ink/80">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={program.href}
                    className="mt-7 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
                  >
                    {program.slug === "private-label"
                      ? "Explore private label"
                      : "Discuss this programme"}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* D. Onboarding ------------------------------------------------------ */}
      <section
        aria-labelledby="onboarding-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[700px]">
            <p className="eyebrow">Onboarding</p>
            <h2
              id="onboarding-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              From first enquiry to repeat order
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Six steps. The first three decide whether the relationship is worth
              scaling; the last three prove it in production.
            </p>
          </div>

          <ol
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
          >
            {dealerOnboarding.map((step) => (
              <li
                key={step.step}
                className="flex flex-col bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                  {step.step}
                </span>
                <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
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

      {/* E. Shipping / logistics -------------------------------------------- */}
      <section
        aria-labelledby="shipping-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-28"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/12 text-forge">
              <Ship className="size-5" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-6">{dealerShipping.eyebrow}</p>
            <h2
              id="shipping-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {dealerShipping.heading}
            </h2>
            <p className="mt-5 max-w-[520px] text-[1.02rem] leading-relaxed text-steel">
              {dealerShipping.body}
            </p>

            <ul data-reveal-group className="mt-8 grid gap-4">
              {dealerShipping.points.map((point) => (
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

          {/* F. Proof / traceability --------------------------------------- */}
          <div className="rounded-xl border border-border bg-white p-8 lg:p-10">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/12 text-forge">
              <FileCheck2 className="size-5" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-6">{dealerTraceability.eyebrow}</p>
            <h2 className="mt-4 font-display text-[clamp(1.6rem,3.6vw,2.3rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink">
              {dealerTraceability.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {dealerTraceability.body}
            </p>

            <ul
              data-reveal-group
              className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border"
            >
              {dealerTraceability.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3.5 bg-soft px-6 py-5"
                >
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[0.94rem] leading-relaxed text-ink/80">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* G. FAQ — withdrawn until MOQ, lead time, warranty length and shipping
          incoterms are confirmed. These are commercial commitments; the previous
          copy was placeholder text and must not ship as fact. */}

      {/* H. Pathways --------------------------------------------------------- */}
      <section
        aria-labelledby="dealer-pathways-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="dealer-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {dealerPathways.map((pathway) => (
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
