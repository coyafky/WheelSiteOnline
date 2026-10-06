import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import {
  fitmentPageCopy,
  platformFitments,
} from "@/content/fitment";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "Vehicle Fitment — Forged Wheels by Platform",
  description:
    "Fitment landing pages for BMW M, Mercedes-AMG and Audi RS. Starting size references, design directions and engineering notes — final specifications confirmed per order.",
};

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
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="fitment-index-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_72%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <p className="eyebrow !text-forge">Fitment</p>
          <h1
            id="fitment-index-title"
            className="mt-5 max-w-[900px] font-display text-[clamp(2.6rem,7.6vw,5.2rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-white"
          >
            Fitment by Platform
          </h1>
          <p className="mt-7 max-w-[700px] text-[1.05rem] leading-relaxed text-white/75">
            High-intent starting points for the platforms we build for most
            often. Each page lists the chassis codes we discuss, a starting size
            reference and the design directions that suit the car — never a
            fitment table you are expected to match yourself.
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
