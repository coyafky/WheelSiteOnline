import Link from "next/link";
import { ArrowRight, Scale, TriangleAlert } from "lucide-react";
import {
  draftNotice,
  legalDocuments,
  legalHref,
  legalPathways,
} from "@/content/legal";
import type { LegalDocument } from "@/content/types";
import { site } from "@/content/site";
import { DealerCta } from "@/components/sections/dealer-cta";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { LongformOutline } from "@/components/longform-outline";
import { getTranslator } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n/types";

/**
 * Shared renderer for the five support/legal documents.
 *
 * Each route under `src/app/support/*` is a thin wrapper that passes its
 * document from `@/content/legal` into this component, so structure, warning
 * banner and cross-navigation stay identical across all five.
 *
 * The draft notice is NOT optional and is not driven by a prop — every legal
 * surface on this site renders it, because every one of them is still a
 * template pending legal review.
 */
export async function LegalDocumentPage({ doc }: { doc: LegalDocument }) {
  const { locale, t } = await getTranslator();
  const others = legalDocuments.filter((item) => item.slug !== doc.slug);

  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="legal-title"
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
              { label: "Home", href: localizedPath("/", locale) },
              { label: doc.title },
            ]}
          />

          <p className="eyebrow mt-6 !text-forge">{doc.eyebrow}</p>
          <h1
            id="legal-title"
            className="mt-5 max-w-[900px] font-display text-[clamp(2.2rem,6vw,4.2rem)] font-800 uppercase leading-[0.94] tracking-[-0.02em] text-white"
          >
            {doc.title}
          </h1>
          <p className="mt-6 max-w-[680px] text-[1.02rem] leading-relaxed text-white/75">
            {doc.summary}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.16em] text-white/45">
                Last updated
              </dt>
              <dd className="mt-1 text-sm text-white/80">{doc.lastUpdated}</dd>
            </div>
            <div>
              <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.16em] text-white/45">
                Applies to
              </dt>
              <dd className="mt-1 text-sm text-white/80">
                Dealers, distributors and business customers
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* B. Draft notice -----------------------------------------------------
          Shown only while `draftNotice.show` is true. The documents carry
          industry-standard defaults rather than bare placeholders, so the
          banner now says what is provisional instead of warning that the page
          is structurally incomplete. Flip `show` to false once Fenghuai's
          counsel has signed off. */}
      {draftNotice.show ? (
        <section
          aria-labelledby="draft-notice-title"
          data-reveal
          className="border-b border-forge/35 bg-forge-soft py-12 lg:py-14"
        >
          <div className="container-fh grid gap-7 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-9">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/15 text-forge-deep">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>

            <div>
              <p className="eyebrow !text-forge-deep">{draftNotice.label}</p>
              <h2
                id="draft-notice-title"
                className="mt-3 font-display text-[clamp(1.4rem,3.2vw,2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
              >
                {draftNotice.heading}
              </h2>
              <p className="mt-4 max-w-[760px] text-[1rem] leading-relaxed text-steel">
                {draftNotice.body}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* C. Document body ----------------------------------------------------- */}
      <section
        aria-labelledby="document-title"
        data-reveal
        className="border-b border-border bg-white py-18 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16">
          {/* Table of contents + contact rail */}
          {/* `min-w-0` is required: the Astryx <Outline> is a flex/nowrap rail
              that will not shrink below its content width, and a grid child
              defaults to `min-width:auto` — without it the aside overflowed the
              320px viewport by 33px on /support/returns. */}
          <aside className="min-w-0 lg:sticky lg:top-[110px] lg:self-start">
            <h2
              id="document-title"
              className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel"
            >
              {t("outline.heading")}
            </h2>

            <div className="mt-5">
              <LongformOutline
                label={t("outline.label")}
                items={doc.sections.map((section, index) => ({
                  id: `section-${index + 1}`,
                  label: section.heading,
                  level: 2,
                }))}
              />
            </div>

            <div className="mt-9 rounded-xl border border-border bg-soft p-6">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-forge/12 text-forge">
                <Scale className="size-4" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-[0.94rem] font-700 uppercase leading-snug tracking-[0.01em] text-ink">
                Questions about this document
              </p>
              <p className="mt-2 text-sm leading-relaxed text-steel">
                Contact us before you rely on any clause here.
              </p>
              {site.contact.confirmed ? (
                <a
                  href={`mailto:${site.contact.email}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-forge transition-colors hover:text-forge-deep"
                >
                  {site.contact.email}
                  <ArrowRight className="size-3.5" />
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-forge transition-colors hover:text-forge-deep"
                >
                  Open the contact page
                  <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          </aside>

          {/* Body */}
          <div>
            <p className="max-w-[720px] text-[1.05rem] leading-relaxed text-ink/85">
              {doc.intro}
            </p>

            <div className="mt-12 grid gap-12">
              {doc.sections.map((section, index) => (
                <article
                  key={section.heading}
                  id={`section-${index + 1}`}
                  className="scroll-mt-[110px] border-t border-border pt-8"
                >
                  <div data-reveal>
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
                  </div>
                </article>
              ))}
            </div>

            {/* Governing law callout ------------------------------------- */}
            <div className="mt-14 rounded-xl border border-border bg-ink p-8">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/8 text-forge">
                <Scale className="size-4" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-[1.05rem] font-700 uppercase leading-snug tracking-[0.02em] text-white">
                Governing law and jurisdiction
              </h2>
              <p className="mt-3 max-w-[680px] text-sm leading-relaxed text-white/70">
                {doc.governingNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* D. Other documents --------------------------------------------------- */}
      <section
        aria-labelledby="other-docs-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">{legalPathways.eyebrow}</p>
            <h2
              id="other-docs-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {legalPathways.heading}
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {others.map((item) => (
              <Link
                key={item.slug}
                href={legalHref(item.slug)}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{item.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {item.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  Open policy
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
