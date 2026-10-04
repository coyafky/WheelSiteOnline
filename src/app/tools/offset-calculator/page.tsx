import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, TriangleAlert } from "lucide-react";
import {
  offsetCalculatorCopy,
  offsetCalculatorFaqs,
  toolsPathways,
} from "@/content/tools";
import { OffsetCalculator } from "@/components/offset-calculator";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "Wheel Offset Calculator — Compare Inner & Outer Clearance",
  description:
    "Compare an original wheel against a replacement and see the change in inner clearance, outer poke and diameter. Formula shown. A planning aid, not a fitment approval.",
};

/**
 * Offset calculator (`/tools/offset-calculator`).
 *
 * Mirrors the reference's tool archetype: dark hero → what-is explainer →
 * the tool → the formula → how to read the result → illustrative examples →
 * offset types → FAQ → CTA. The honesty notice sits above the tool, not below
 * it, so no one reads a number before reading the caveat.
 */
export default function OffsetCalculatorPage() {
  const copy = offsetCalculatorCopy;

  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="tool-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_76%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <nav aria-label="Breadcrumb" className="eyebrow !text-white/45">
            <Link href="/tools" className="transition-colors hover:!text-forge">
              Tools
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span className="!text-forge">Offset calculator</span>
          </nav>

          <p className="eyebrow mt-6 !text-forge">{copy.eyebrow}</p>
          <h1
            id="tool-title"
            className="mt-5 max-w-[900px] font-display text-[clamp(2.4rem,7vw,5rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
          >
            {copy.heading}
          </h1>
          <p className="mt-7 max-w-[700px] text-[1.05rem] leading-relaxed text-white/75">
            {copy.lede}
          </p>
          <p className="mt-4 max-w-[640px] text-sm leading-relaxed text-white/55">
            {copy.supporting}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="#calculator" className="btn-pill-solid">
              Use the calculator
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/contact" className="btn-pill-outline !text-white">
              Send your vehicle details
            </Link>
          </div>
        </div>
      </section>

      {/* B. What offset is -------------------------------------------------- */}
      <section
        aria-labelledby="what-is-offset-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{copy.whatEyebrow}</p>
            <h2
              id="what-is-offset-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {copy.whatHeading}
            </h2>
          </div>

          <div data-reveal-group className="grid gap-4">
            {copy.whatBody.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-[720px] text-[1rem] leading-relaxed text-steel"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* C. The tool -------------------------------------------------------- */}
      <section
        id="calculator"
        aria-labelledby="calculator-title"
        data-reveal
        className="scroll-mt-[100px] border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">The tool</p>
            <h2
              id="calculator-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Compare two wheels
            </h2>
          </div>

          {/* Honesty notice — above the tool on purpose. */}
          <div
            className="mt-10 grid gap-7 rounded-xl border border-forge/35 bg-forge-soft p-7 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-9 lg:p-9"
            role="note"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/15 text-forge-deep">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow !text-forge-deep">{copy.noticeLabel}</p>
              <h3 className="mt-3 font-display text-[clamp(1.3rem,3vw,1.8rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink">
                {copy.noticeHeading}
              </h3>
              <p className="mt-4 max-w-[860px] text-[0.98rem] leading-relaxed text-steel">
                {copy.noticeBody}
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-border bg-white p-7 lg:p-9">
            <OffsetCalculator />
          </div>
        </div>
      </section>

      {/* D. The formula ----------------------------------------------------- */}
      <section
        aria-labelledby="formula-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{copy.formulaEyebrow}</p>
            <h2
              id="formula-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {copy.formulaHeading}
            </h2>
            <p className="mt-5 text-[1rem] leading-relaxed text-steel">
              {copy.formulaBody}
            </p>
          </div>

          <div>
            <pre className="overflow-x-auto rounded-xl border border-border bg-ink p-6 font-mono text-[0.8rem] leading-relaxed text-white/85">
              <code>
                {copy.formulaLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </code>
            </pre>
            <p className="mt-5 max-w-[720px] text-[0.96rem] leading-relaxed text-steel">
              {copy.formulaNote}
            </p>
          </div>
        </div>
      </section>

      {/* E. How to read the result ----------------------------------------- */}
      <section
        aria-labelledby="read-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{copy.readEyebrow}</p>
            <h2
              id="read-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {copy.readHeading}
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2"
          >
            {copy.readPoints.map((point) => (
              <article
                key={point.title}
                className="bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <h3 className="font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
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

      {/* F. Examples -------------------------------------------------------- */}
      <section
        aria-labelledby="examples-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[760px]">
            <p className="eyebrow">{copy.examplesEyebrow}</p>
            <h2
              id="examples-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {copy.examplesHeading}
            </h2>
          </div>

          <p className="mt-6 flex max-w-[820px] items-start gap-3 rounded-xl border border-forge/35 bg-forge-soft p-5 text-[0.92rem] leading-relaxed text-steel">
            <Info
              className="mt-0.5 size-4 shrink-0 text-forge-deep"
              aria-hidden="true"
            />
            {copy.examplesNote}
          </p>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {copy.examples.map((example) => (
              <article
                key={example.title}
                className="rounded-xl border border-border bg-soft p-7"
              >
                <h3 className="font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {example.title}
                </h3>
                <p className="mt-4 font-mono text-[0.82rem] text-forge-deep">
                  {example.setup}
                </p>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-steel">
                  {example.result}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* G. Offset types ---------------------------------------------------- */}
      <section
        aria-labelledby="types-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{copy.typesEyebrow}</p>
            <h2
              id="types-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {copy.typesHeading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {copy.typesBody}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3"
          >
            {copy.types.map((type) => (
              <article key={type.name} className="bg-white p-7">
                <p className="font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {type.range}
                </p>
                <h3 className="mt-3 font-display text-[1.2rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {type.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">
                  {type.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* H. FAQ -------------------------------------------------------------- */}
      <section
        aria-labelledby="tool-faq-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{copy.faqEyebrow}</p>
            <h2
              id="tool-faq-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {copy.faqHeading}
            </h2>
          </div>

          <dl data-reveal-group className="grid content-start gap-6">
            {offsetCalculatorFaqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-border bg-soft p-7"
              >
                <dt className="font-display text-[1.08rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
                  {faq.question}
                </dt>
                <dd className="mt-3 text-[0.94rem] leading-relaxed text-steel">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* I. Pathways --------------------------------------------------------- */}
      <section
        aria-labelledby="tool-pathways-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="tool-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {toolsPathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{pathway.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
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
