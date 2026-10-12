import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleHelp, Clock, TriangleAlert } from "lucide-react";
import {
  boltPatternNotice,
  boltPatternPathways,
  boltPatternVerifyLabel,
  boltPatterns,
  getBoltPattern,
} from "@/content/bolt-patterns";
import { DealerCta } from "@/components/sections/dealer-cta";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { getLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/types";

type PatternPageProps = {
  params: Promise<{ pattern: string }>;
};

/** Build every pattern guide at build time. */
export function generateStaticParams() {
  return boltPatterns.map((entry) => ({ pattern: entry.slug }));
}

export async function generateMetadata({
  params,
}: PatternPageProps): Promise<Metadata> {
  const { pattern: slug } = await params;
  const entry = getBoltPattern(slug);

  if (!entry) {
    return { title: "Bolt pattern guide not found" };
  }

  return {
    title: `${entry.pattern} Bolt Pattern — ${entry.label}`,
    description: entry.intro,
    robots: { index: false, follow: true },
  };
}

/**
 * Bolt-pattern guide (`/insights/bolt-patterns/[pattern]`).
 *
 * Same shape as a guide article on `/insights/[slug]` — dark hero with
 * breadcrumb → standing safety notice → method section → prose with a sticky
 * table of contents → vehicle references, marked → sibling patterns → CTA.
 *
 * The standing notice and the per-reference verify marker are load-bearing:
 * no vehicle → pattern mapping on this page is presented as verified fact.
 */
export default async function BoltPatternPage({ params }: PatternPageProps) {
  const locale = await getLocale();
  const { pattern: slug } = await params;
  const entry = getBoltPattern(slug);

  if (!entry) {
    notFound();
  }

  const siblings = boltPatterns.filter((item) => item.slug !== slug);
  const allSections = [...entry.explanation, ...entry.sections];

  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="pattern-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_78%_0%,rgba(194,101,10,0.22)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-14 pt-[140px] lg:pb-16 lg:pt-[168px]">
          <SiteBreadcrumbs
            label="Breadcrumb"
            tone="dark"
            items={[
              { label: "Insights", href: localizedPath("/insights", locale) },
              {
                label: "Bolt patterns",
                href: localizedPath("/insights/bolt-patterns", locale),
              },
              { label: entry.pattern },
            ]}
          />

          <p className="eyebrow mt-6 !text-forge">Bolt pattern</p>
          <h1
            id="pattern-title"
            className="mt-5 font-display text-[clamp(2.8rem,9vw,6rem)] font-800 uppercase leading-[0.88] tracking-[-0.02em] text-white"
          >
            {entry.pattern}
          </h1>
          <p className="mt-3 font-display text-[clamp(1rem,2.2vw,1.4rem)] font-700 uppercase tracking-[0.02em] text-white/60">
            {entry.label}
          </p>
          <p className="mt-6 max-w-[760px] text-[1.05rem] leading-relaxed text-white/75">
            {entry.intro}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.16em] text-white/45">
                Read time
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <Clock className="size-3.5" aria-hidden="true" />5 min read
              </dd>
            </div>
            <div>
              <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.16em] text-white/45">
                Data status
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <CircleHelp className="size-3.5" aria-hidden="true" />
                {boltPatternVerifyLabel}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* B. Standing safety notice ----------------------------------------- */}
      <section
        aria-labelledby="pattern-notice-title"
        data-reveal
        className="border-b border-forge/35 bg-forge-soft py-12 lg:py-14"
      >
        <div className="container-fh grid gap-7 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-9">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/15 text-forge-deep">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="eyebrow !text-forge-deep">{boltPatternNotice.label}</p>
            <h2
              id="pattern-notice-title"
              className="mt-3 font-display text-[clamp(1.3rem,3vw,1.9rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {boltPatternNotice.heading}
            </h2>
            <p className="mt-4 max-w-[820px] text-[1rem] leading-relaxed text-steel">
              {boltPatternNotice.body}
            </p>
          </div>
        </div>
      </section>

      {/* C. Body ----------------------------------------------------------- */}
      <section
        aria-labelledby="pattern-body-title"
        data-reveal
        className="border-b border-border bg-white py-18 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16">
          {/* Table of contents + contact rail */}
          <aside className="lg:sticky lg:top-[110px] lg:self-start">
            <h2
              id="pattern-body-title"
              className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel"
            >
              On this page
            </h2>

            <nav aria-label="Guide sections" className="mt-5">
              <ol className="grid gap-2.5">
                {allSections.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#section-${index + 1}`}
                      className="text-sm leading-snug text-ink/70 transition-colors hover:text-forge"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-9 rounded-xl border border-border bg-soft p-6">
              <p className="font-display text-[0.94rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
                Get it confirmed in writing
              </p>
              <p className="mt-2 text-sm leading-relaxed text-steel">
                Send us the vehicle and your measured pattern — we check it
                against centre bore, offset and load rating before an order.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm text-forge transition-colors hover:text-forge-deep"
              >
                Send vehicle details
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </aside>

          {/* Prose */}
          <div>
            <div data-reveal-group className="grid gap-12">
              {allSections.map((section, index) => (
                <article
                  key={section.heading}
                  id={`section-${index + 1}`}
                  className="scroll-mt-[110px] border-t border-border pt-8 first:border-t-0 first:pt-0"
                >
                  <h2 className="font-display text-[clamp(1.24rem,2.8vw,1.7rem)] font-800 uppercase leading-[1.04] tracking-[-0.005em] text-ink">
                    {section.heading}
                  </h2>

                  <div className="mt-5 grid gap-4">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="max-w-[720px] text-[0.98rem] leading-relaxed text-steel"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* D. Vehicle references --------------------------------------------- */}
      <section
        aria-labelledby="references-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[760px]">
            <p className="eyebrow">Starting references</p>
            <h2
              id="references-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Vehicles sometimes associated with {entry.pattern}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Research pointers only — compiled from public references and NOT
              verified fitment data. Every entry below needs confirming against
              the specific vehicle, trim, model year and brake package. Measure
              before you rely on any of them.
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid gap-6 lg:grid-cols-3"
          >
            {entry.commonVehicles.map((vehicle) => (
              <article
                key={vehicle.vehicle}
                className="rounded-xl border border-forge/35 bg-forge-soft p-7"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 font-display text-[0.58rem] font-700 uppercase tracking-[0.12em] text-forge-deep">
                  <CircleHelp className="size-3.5" aria-hidden="true" />
                  {boltPatternVerifyLabel}
                </span>
                <h3 className="mt-5 font-display text-[1.1rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {vehicle.vehicle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">
                  {vehicle.note}
                </p>
              </article>
            ))}
          </div>

          {!entry.verified ? (
            <p className="mt-8 max-w-[860px] rounded-xl border border-dashed border-border bg-white p-6 text-[0.92rem] leading-relaxed text-steel">
              <strong className="font-600 text-ink">
                Pending engineering verification.
              </strong>{" "}
              Fenghuai has not signed off a per-vehicle pattern mapping for this
              entry. The list above exists so you can orient your research, not
              so you can order from it.
            </p>
          ) : null}
        </div>
      </section>

      {/* E. Measuring notes ------------------------------------------------- */}
      <section
        aria-labelledby="measuring-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[760px]">
            <p className="eyebrow">The method</p>
            <h2
              id="measuring-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              How to measure {entry.pattern} yourself
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2"
          >
            {entry.measuringNotes.map((note) => (
              <article
                key={note.heading}
                className="bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <h3 className="font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {note.heading}
                </h3>
                <div className="mt-3 grid gap-3">
                  {note.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-relaxed text-steel"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* F. Sibling patterns ------------------------------------------------ */}
      <section
        aria-labelledby="siblings-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Other patterns</p>
            <h2
              id="siblings-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Compare patterns
            </h2>
          </div>

          <div data-reveal-group className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {siblings.map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/insights/bolt-patterns/${sibling.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <span className="font-display text-[1.5rem] font-800 uppercase leading-none tracking-[0.01em] text-ink">
                  {sibling.pattern}
                </span>
                <p className="mt-3 font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {sibling.label}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {sibling.intro}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  Read the guide
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/insights/bolt-patterns"
            className="mt-10 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
          >
            All bolt pattern guides
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* G. Pathways --------------------------------------------------------- */}
      <section
        aria-labelledby="pattern-pathways-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="pattern-pathways-title"
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
                className="group flex flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
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
