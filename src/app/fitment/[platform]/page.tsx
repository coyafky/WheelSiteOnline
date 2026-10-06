import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleHelp, TriangleAlert } from "lucide-react";
import {
  fitmentPageCopy,
  fitmentPathwayCopy,
  fitmentResourceLinks,
  getPlatform,
  platformFitments,
} from "@/content/fitment";
import { DealerCta } from "@/components/sections/dealer-cta";

type PlatformPageProps = {
  params: Promise<{ platform: string }>;
};

/** Build every platform page at build time. */
export function generateStaticParams() {
  return platformFitments.map((platform) => ({ platform: platform.slug }));
}

export async function generateMetadata({
  params,
}: PlatformPageProps): Promise<Metadata> {
  const { platform: slug } = await params;
  const platform = getPlatform(slug);

  if (!platform) {
    return { title: "Fitment page not found" };
  }

  return {
    title: `${platform.name} Forged Wheels — Fitment & Design`,
    description: `${platform.heroLine}. Starting size references, design directions and engineering notes for ${platform.name} models — final specifications confirmed per order.`,
  };
}

/**
 * Platform fitment landing page (`/fitment/[platform]`).
 *
 * Highest-intent template on the site: someone searching "G80 M3 forged wheels"
 * lands here. Structure mirrors the reference's marque archetype — hero →
 * answer/notice → model quick paths → fitment references → design directions →
 * notes → resource bridge → FAQ → CTA.
 *
 * The standing notice and per-model "pending verification" markers are load-
 * bearing, not decoration: no figure on this page is a confirmed specification.
 */
export default async function PlatformFitmentPage({
  params,
}: PlatformPageProps) {
  const { platform: slug } = await params;
  const platform = getPlatform(slug);

  if (!platform) {
    notFound();
  }

  const others = platformFitments.filter((item) => item.slug !== slug);
  const { notice } = fitmentPageCopy;

  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="platform-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_80%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <nav aria-label="Breadcrumb" className="eyebrow !text-white/45">
            <Link href="/fitment" className="transition-colors hover:!text-forge">
              Fitment
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span className="!text-forge">{platform.name}</span>
          </nav>

          <h1
            id="platform-title"
            className="mt-6 font-display text-[clamp(2.6rem,8vw,5.6rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
          >
            {platform.name} Wheels
          </h1>

          <p className="mt-7 max-w-[680px] text-[1.05rem] leading-relaxed text-white/75">
            {platform.intro}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/contact" className="btn-pill-solid">
              Send your vehicle details
              <ArrowRight className="size-4" />
            </Link>
            {/* "Browse designs → /gallery/wheels" removed 2026-10-06 (DEC-059):
                that catalogue was fictional and is archived. The real
                catalogue is reachable from the navigation and /products. */}
          </div>
        </div>
      </section>

      {/* B. Answer + standing notice --------------------------------------- */}
      <section
        aria-labelledby="fitment-notice-title"
        data-reveal
        className="border-b border-forge/35 bg-forge-soft py-14 lg:py-16"
      >
        <div className="container-fh grid gap-7 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-9">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-forge/15 text-forge-deep">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="eyebrow !text-forge-deep">{notice.label}</p>
            <h2
              id="fitment-notice-title"
              className="mt-3 font-display text-[clamp(1.5rem,3.4vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {notice.heading}
            </h2>
            <p className="mt-4 max-w-[820px] text-[1rem] leading-relaxed text-steel">
              {notice.body}
            </p>
          </div>
        </div>
      </section>

      {/* C. Model quick paths ---------------------------------------------- */}
      <section
        aria-labelledby="models-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{fitmentPageCopy.modelEyebrow}</p>
            <h2
              id="models-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {fitmentPageCopy.modelHeading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {fitmentPageCopy.modelsIntro}
            </p>
          </div>

          <ul
            data-reveal-group
            className="mt-10 flex flex-wrap gap-3"
          >
            {platform.models.map((model) => (
              <li key={model.code}>
                <a
                  href={`#model-${model.code.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-border bg-soft px-5 font-display text-[0.72rem] font-700 uppercase tracking-[0.13em] text-ink transition-[background,border-color,color] duration-200 ease-out hover:border-forge hover:text-forge"
                >
                  <span className="text-forge">{model.code}</span>
                  {model.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* D. Fitment references --------------------------------------------- */}
      <section
        aria-labelledby="references-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">Reference ranges</p>
            <h2
              id="references-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Sizes we discuss, by chassis
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {fitmentPageCopy.verifiedNote}
            </p>
          </div>

          <div data-reveal-group className="mt-10 grid gap-6 lg:grid-cols-2">
            {platform.models.map((model) => (
              <article
                key={model.code}
                id={`model-${model.code.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                className="scroll-mt-[110px] rounded-xl border border-border bg-white p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-[1.5rem] font-800 uppercase leading-none tracking-[0.01em] text-ink">
                      {model.code}
                    </span>
                    <span className="font-display text-[0.9rem] font-700 uppercase tracking-[0.06em] text-steel">
                      {model.name}
                    </span>
                  </div>

                  {!model.verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forge-soft px-3 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                      <CircleHelp className="size-3.5" aria-hidden="true" />
                      {fitmentPageCopy.verifiedLabel}
                    </span>
                  ) : null}
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                  <div className="bg-white px-5 py-4">
                    <dt className="font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-steel">
                      Years
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-ink">
                      {model.years}
                    </dd>
                  </div>
                  <div className="bg-white px-5 py-4">
                    <dt className="font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-steel">
                      Starting reference
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-ink">
                      {model.sizes}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 text-sm leading-relaxed text-steel">
                  {model.notes}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* E. Design directions ---------------------------------------------- */}
      <section
        aria-labelledby="directions-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{fitmentPageCopy.designEyebrow}</p>
            <h2
              id="directions-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {fitmentPageCopy.designHeading}
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2"
          >
            {platform.designDirections.map((direction) => (
              <article
                key={direction.name}
                className="bg-white p-7 transition-colors hover:bg-forge-soft"
              >
                <h3 className="font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {direction.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">
                  {direction.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* F. Fitment notes --------------------------------------------------- */}
      <section
        aria-labelledby="notes-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{fitmentPageCopy.notesEyebrow}</p>
            <h2
              id="notes-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {fitmentPageCopy.notesHeading}
            </h2>
          </div>

          <ul data-reveal-group className="grid content-start gap-5 self-start">
            {platform.fitmentNotes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-3.5 rounded-xl border border-border bg-white p-5"
              >
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                  <TriangleAlert className="size-3.5" strokeWidth={2.4} />
                </span>
                <span className="text-[0.94rem] leading-relaxed text-ink/80">
                  {note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* G. Construction→dealer bridge ------------------------------------- */}
      <section
        aria-labelledby="bridge-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{fitmentPageCopy.bridgeEyebrow}</p>
            <h2
              id="bridge-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {fitmentPageCopy.bridgeHeading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {fitmentPageCopy.bridgeBody}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {fitmentResourceLinks.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group flex flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{resource.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {resource.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {resource.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {resource.linkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* H. FAQ ------------------------------------------------------------- */}
      <section
        aria-labelledby="fitment-faq-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">Fitment FAQ</p>
            <h2
              id="fitment-faq-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {platform.name} questions we get asked
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              Short answers. None of them quote a measurement value, because the
              correct figure depends on your specific car.
            </p>
          </div>

          <dl data-reveal-group className="grid content-start gap-6">
            {platform.faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-border bg-white p-7"
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

      {/* I. Sibling platforms ---------------------------------------------- */}
      <section
        aria-labelledby="other-platforms-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">{fitmentPathwayCopy.eyebrow}</p>
            <h2
              id="other-platforms-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {fitmentPathwayCopy.heading}
            </h2>
          </div>

          <div data-reveal-group className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/fitment/${other.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <h3 className="font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {other.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {other.heroLine}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  View fitment
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
