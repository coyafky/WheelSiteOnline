import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buildFamilies, builds } from "@/content/builds";
import {
  galleryAnswer,
  galleryEmptyState,
  galleryHero,
  galleryPathways,
} from "@/content/gallery";
import { BuildsGallery } from "@/components/builds-gallery";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  title: "Vehicle Gallery — Forged Wheel Fitment References",
  description:
    "Browse completed Fenghuai forged wheel builds with the sizes and finishes we manufactured to — fitment references across performance, luxury and off-road platforms.",
};

/** Vehicle gallery hub: hero → filtered build grid → guidance → pathways. */
export default function GalleryPage() {
  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="gallery-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_78%_0%,rgba(194,101,10,0.28)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-16 pt-[140px] lg:pb-20 lg:pt-[168px]">
          <p className="eyebrow !text-forge">{galleryHero.eyebrow}</p>
          <h1
            id="gallery-title"
            className="mt-5 font-display text-[clamp(2.8rem,9vw,6.4rem)] font-800 uppercase leading-[0.88] tracking-[-0.02em] text-white"
          >
            {galleryHero.heading}
          </h1>
          <p className="mt-7 max-w-[680px] text-[1.05rem] leading-relaxed text-white/75">
            {galleryHero.lede}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/contact" className="btn-pill-solid">
              Request a fitment
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/gallery/finishes" className="btn-pill-outline !text-white">
              Finish reference
            </Link>
          </div>
        </div>
      </section>

      {/* B. Filtered grid --------------------------------------------------- */}
      <section
        aria-labelledby="builds-title"
        className="border-b border-border bg-white py-16 lg:py-20"
      >
        <div className="container-fh-wide">
          <div data-reveal className="max-w-[680px] px-4">
            <p className="eyebrow">Filter the gallery</p>
            <h2
              id="builds-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              Completed builds
            </h2>
          </div>

          <div data-reveal className="mt-10 px-4">
            <BuildsGallery
              builds={builds}
              families={buildFamilies}
              emptyState={galleryEmptyState}
            />
          </div>
        </div>
      </section>

      {/* C. How to read this ------------------------------------------------ */}
      <section
        aria-labelledby="gallery-answer-title"
        data-reveal
        className="border-b border-border bg-soft py-20 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">{galleryAnswer.eyebrow}</p>
            <h2
              id="gallery-answer-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {galleryAnswer.heading}
            </h2>
            <p className="mt-5 max-w-[520px] text-[1.02rem] leading-relaxed text-steel">
              {galleryAnswer.body}
            </p>
          </div>

          <ul data-reveal-group className="grid content-start gap-5 self-start">
            {galleryAnswer.points.map((point) => (
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

      {/* D. Pathways -------------------------------------------------------- */}
      <section
        aria-labelledby="gallery-pathways-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">Keep exploring</p>
            <h2
              id="gallery-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Where to go next
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {galleryPathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="group flex flex-col rounded-xl border border-border bg-soft p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
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
