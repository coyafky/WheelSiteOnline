import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleHelp, TriangleAlert } from "lucide-react";
import {
  boltPatternFaqs,
  boltPatternNotice,
  boltPatternPathways,
  boltPatternVerifyLabel,
  boltPatterns,
  boltPatternsIndexCopy,
} from "@/content/bolt-patterns";
import { DealerCta } from "@/components/sections/dealer-cta";
import { PageHero } from "@/components/sections/page-hero";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { getLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/types";
import { getPublicLocalesForPath, localizedRouteMetadata } from "@/lib/i18n/publication";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const extraPublicLocales = await getPublicLocalesForPath("/insights/bolt-patterns");
  return {
    title: "Bolt Pattern Guides — 5x112, 5x114.3, 5x120",
    description:
      "What the two numbers in a bolt pattern mean, how to measure the pattern yourself, and why a vehicle list is a starting point rather than a fitment authority.",
    alternates: await localizedRouteMetadata("/insights/bolt-patterns", locale, { extraPublicLocales }),
    robots: { index: extraPublicLocales.includes(locale), follow: true },
  };
}

/**
 * Bolt-pattern guides index (`/insights/bolt-patterns`).
 *
 * Follows the fitment-page idiom for safety-critical data: a standing honesty
 * notice above the fold, a "pending verification" marker on every vehicle
 * reference, and the measuring method as the primary content rather than the
 * vehicle list.
 */
export default async function BoltPatternsIndexPage() {
  const locale = await getLocale();
  return (
    <>
      {/* A. Hero -----------------------------------------------------------
          Shared identity band, ink tone. The bolt-pattern guides remain
          parallel server-rendered sections below — no tab semantics. */}
      <PageHero
        id="top"
        titleId="bolt-patterns-title"
        tone="dark"
        breadcrumb={
          <SiteBreadcrumbs
            label="Breadcrumb"
            tone="dark"
            items={[
              { label: "Insights", href: localizedPath("/insights", locale) },
              { label: "Bolt patterns" },
            ]}
          />
        }
        eyebrow={boltPatternsIndexCopy.eyebrow}
        heading={boltPatternsIndexCopy.heading}
        lede={boltPatternsIndexCopy.lede}
        supporting={boltPatternsIndexCopy.supporting}
      >
        <Link href="#patterns" className="btn-pill-solid">
          Open a pattern guide
          <ArrowRight className="size-4" />
        </Link>
        <Link href="/contact" className="btn-pill-outline !text-white">
          Send your vehicle details
        </Link>
      </PageHero>

      {/* B. Standing honesty notice ---------------------------------------- */}
      <section
        aria-labelledby="bolt-notice-title"
        data-reveal
        className="border-b border-forge/35 bg-forge-soft py-14 lg:py-16"
      >
        <div className="container-fh grid gap-7 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-9">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/15 text-forge-deep">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="eyebrow !text-forge-deep">
              {boltPatternNotice.label}
            </p>
            <h2
              id="bolt-notice-title"
              className="mt-3 font-display text-[clamp(1.5rem,3.4vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {boltPatternNotice.heading}
            </h2>
            <p className="mt-4 max-w-[860px] text-[1rem] leading-relaxed text-steel">
              {boltPatternNotice.body}
            </p>
          </div>
        </div>
      </section>

      {/* C. Pattern cards -------------------------------------------------- */}
      <section
        id="patterns"
        aria-labelledby="patterns-title"
        data-reveal
        className="scroll-mt-[100px] border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">Three guides</p>
            <h2
              id="patterns-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Pick your pattern
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {boltPatternsIndexCopy.listNote}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7"
          >
            {boltPatterns.map((entry) => (
              <Link
                key={entry.slug}
                href={`/insights/bolt-patterns/${entry.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-soft p-8 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-[1.9rem] font-800 uppercase leading-none tracking-[0.01em] text-ink">
                    {entry.pattern}
                  </span>
                  {!entry.verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forge-soft px-3 py-1 font-display text-[0.58rem] font-700 uppercase tracking-[0.12em] text-forge-deep">
                      <CircleHelp className="size-3.5" aria-hidden="true" />
                      {boltPatternVerifyLabel}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {entry.label}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-steel">
                  {entry.intro}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  Read the guide
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* D. The method ----------------------------------------------------- */}
      <section
        aria-labelledby="method-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{boltPatternsIndexCopy.methodEyebrow}</p>
            <h2
              id="method-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {boltPatternsIndexCopy.methodHeading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {boltPatternsIndexCopy.methodBody}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-pill-solid">
                Ask us to confirm
              </Link>
              <Link href="/tools/offset-calculator" className="btn-pill-outline text-ink">
                Offset calculator
              </Link>
            </div>
          </div>

          <ul data-reveal-group className="grid content-start gap-5 self-start">
            {[
              "Count the fixing points first — that half is easy and unambiguous.",
              "For an odd count, measure centre-of-one to outer-edge-of-the-opposite.",
              "For an even count, measure centre-to-centre across the widest span.",
              "Read the marking on the wheel and check it matches your measurement.",
              "Confirm centre bore as well — the pattern alone does not centre a wheel.",
            ].map((point) => (
              <li
                key={point}
                className="flex items-start gap-3.5 rounded-xl border border-border bg-white p-5"
              >
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                  <TriangleAlert className="size-3.5" strokeWidth={2.4} />
                </span>
                <span className="text-[0.94rem] leading-relaxed text-ink/80">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* E. FAQ -------------------------------------------------------------- */}
      <section
        aria-labelledby="bolt-faq-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">Questions</p>
            <h2
              id="bolt-faq-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Bolt pattern FAQ
            </h2>
          </div>

          <dl data-reveal-group className="grid content-start gap-6">
            {boltPatternFaqs.map((faq) => (
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

      {/* F. Pathways -------------------------------------------------------- */}
      <section
        aria-labelledby="bolt-pathways-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="bolt-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {boltPatternPathways.map((pathway) => (
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
