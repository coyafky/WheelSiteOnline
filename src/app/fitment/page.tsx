import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { fitmentPageCopy, platformFitments } from "@/content/fitment";
import { DealerCta } from "@/components/sections/dealer-cta";
import { PageHero } from "@/components/sections/page-hero";
import { getLocale } from "@/lib/i18n";
import { getPublicLocalesForPath, localizedRouteMetadata } from "@/lib/i18n/publication";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  // Rendering, sitemap and hreflang all read one publication decision
  const extraPublicLocales = await getPublicLocalesForPath(`/fitment`);
  return {
    title: "Vehicle Fitment — Forged Wheels by Platform",
    description:
      "Fitment landing pages for BMW M, Mercedes-AMG and Audi RS. Starting size references, design directions and engineering notes — final specifications confirmed per order.",
    alternates: await localizedRouteMetadata("/fitment", locale, { extraPublicLocales }),
    robots: { index: extraPublicLocales.includes(locale), follow: true },
  };
}

/**
 * Fitment hub (`/fitment`).
 *
 * Small index so the nav group has a landing page and the platform breadcrumb
 * resolves. Each card routes to a platform page built by
 * `/fitment/[platform]`.
 */
export default function FitmentIndexPage() {
  return (
    <>
      {/* A. Hero -----------------------------------------------------------
          Identity band from the shared `PageHero` (tone="dark"). This page
          family keeps the ink surface — no photograph, an engineering
          register — but the composition is no longer a local copy: the radial
          wash, grid and copy rhythm come from one place, so it cannot drift
          from `/old`… `/support/*` again. */}
      <PageHero
        id="top"
        titleId="fitment-index-title"
        tone="dark"
        eyebrow="Fitment"
        heading="Fitment by Platform"
        lede={
          <>
            High-intent starting points for the platforms we build for most
            often. Each page lists the chassis codes we discuss, a starting size
            reference and the design directions that suit the car — never a
            fitment table you are expected to match yourself.
          </>
        }
      >
        <Link href="/contact" className="btn-pill-solid">
          Send your vehicle details
          <ArrowRight className="size-4" />
        </Link>
        {/* "Browse designs → /gallery/wheels" removed 2026-10-06 (DEC-059):
            that catalogue was fictional and is archived. The real
            catalogue is reachable from the navigation and /products. */}
      </PageHero>

      {/* B. Platform cards -------------------------------------------------- */}
      <section
        aria-labelledby="platforms-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh-wide">
          <div className="max-w-[720px] px-4">
            <p className="eyebrow">{fitmentPageCopy.notice.label}</p>
            <h2
              id="platforms-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Platforms we engineer fitment for
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {fitmentPageCopy.notice.body}
            </p>
          </div>

          <div
            data-reveal-group
            className="mt-12 grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {platformFitments.map((platform) => (
              <Link
                key={platform.slug}
                href={`/fitment/${platform.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">Platform</p>
                <h3 className="mt-4 font-display text-[1.4rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {platform.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {platform.heroLine}
                </p>

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {platform.models.map((model) => (
                    <li
                      key={model.code}
                      className="rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-medium text-steel ring-1 ring-border"
                    >
                      {model.code}
                    </li>
                  ))}
                </ul>

                <span className="mt-6 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  View fitment
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-10 flex items-start gap-3 px-4 text-sm leading-relaxed text-steel">
            <CircleHelp className="mt-0.5 size-4 shrink-0 text-forge" aria-hidden="true" />
            <span>
              {fitmentPageCopy.verifiedNote} If your platform is not listed, send
              us the chassis code and we will build a reference for it.
            </span>
          </p>
        </div>
      </section>

      <DealerCta />
    </>
  );
}
