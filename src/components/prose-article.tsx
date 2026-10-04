import Link from "next/link";
import { ArrowRight, Clock, TriangleAlert } from "lucide-react";
import type { GuideEntry } from "@/content/types";
import { guideVerificationNotice } from "@/content/resources";
import { site } from "@/content/site";

/**
 * Shared renderer for a long-form guide article.
 *
 * Used by `/insights/[slug]`. Same shape as the legal-document renderer —
 * dark hero with breadcrumb → optional verification notice → sticky table of
 * contents beside the prose body → related-guides footer — so any long-form
 * article on the site reads consistently.
 *
 * The verification notice is driven by `guide.needsVerification`, NOT passed
 * in by the route: a guide that contains figures requiring engineering
 * sign-off always shows the warning, and cannot accidentally be rendered
 * without it.
 */
export function ProseArticle({
  guide,
  related,
}: {
  guide: GuideEntry;
  related: GuideEntry[];
}) {
  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="article-title"
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
          <nav aria-label="Breadcrumb" className="eyebrow !text-white/45">
            <Link href="/" className="transition-colors hover:!text-forge">
              Home
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <Link
              href="/insights"
              className="transition-colors hover:!text-forge"
            >
              Resources
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span className="!text-forge">{guide.category}</span>
          </nav>

          <p className="eyebrow mt-6 !text-forge">{guide.category}</p>
          <h1
            id="article-title"
            className="mt-5 max-w-[900px] font-display text-[clamp(2.2rem,6vw,4.2rem)] font-800 uppercase leading-[0.94] tracking-[-0.02em] text-white"
          >
            {guide.title}
          </h1>
          <p className="mt-6 max-w-[720px] text-[1.05rem] leading-relaxed text-white/75">
            {guide.answer}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.16em] text-white/45">
                Reading time
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                <Clock className="size-3.5" aria-hidden="true" />
                {guide.readingTime}
              </dd>
            </div>
            <div>
              <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.16em] text-white/45">
                Written for
              </dt>
              <dd className="mt-1 text-sm text-white/80">
                Dealers and wheel shops
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* B. Verification notice (conditional) ------------------------------ */}
      {guide.needsVerification ? (
        <section
          aria-labelledby="verification-notice-title"
          data-reveal
          className="border-b border-forge/35 bg-forge-soft py-12 lg:py-14"
        >
          <div className="container-fh grid gap-7 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-9">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/15 text-forge-deep">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>

            <div>
              <p className="eyebrow !text-forge-deep">
                {guideVerificationNotice.label}
              </p>
              <h2
                id="verification-notice-title"
                className="mt-3 font-display text-[clamp(1.3rem,3vw,1.9rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
              >
                Check figures with us before you rely on them
              </h2>
              <p className="mt-4 max-w-[760px] text-[1rem] leading-relaxed text-steel">
                {guideVerificationNotice.body}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* C. Body ----------------------------------------------------------- */}
      <section
        aria-labelledby="article-body-title"
        data-reveal
        className="border-b border-border bg-white py-18 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:gap-16">
          {/* Table of contents + contact rail */}
          <aside className="lg:sticky lg:top-[110px] lg:self-start">
            <h2
              id="article-body-title"
              className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel"
            >
              On this page
            </h2>

            <nav aria-label="Article sections" className="mt-5">
              <ol className="grid gap-2.5">
                {guide.sections.map((section, index) => (
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
                Questions about your fitment
              </p>
              <p className="mt-2 text-sm leading-relaxed text-steel">
                Send us the vehicle and we will confirm the specification in
                writing.
              </p>
              <a
                href={`mailto:${site.contact.email}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-forge transition-colors hover:text-forge-deep"
              >
                {site.contact.email}
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </aside>

          {/* Prose */}
          <div>
            <div data-reveal-group className="grid gap-12">
              {guide.sections.map((section, index) => (
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

      {/* D. Related guides ------------------------------------------------- */}
      <section
        aria-labelledby="related-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Related guides</p>
            <h2
              id="related-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Keep reading
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/insights/${item.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{item.category}</p>
                <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {item.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  Read guide
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/insights"
            className="mt-10 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
          >
            All insights
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
