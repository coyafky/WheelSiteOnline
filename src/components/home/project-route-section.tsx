import Image from "next/image";
import Link from "next/link";

import type { HomepageContent, HomepageEvidence } from "@/content/types";
import { localizedPath, type Locale } from "@/lib/i18n/types";

function EvidenceVisual({ evidence }: { evidence: HomepageEvidence }) {
  const media = evidence.media;
  const canRender = media.hasRender && media.approvalStatus === "approved";

  if (canRender) {
    return (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        className="object-cover transition duration-700 group-hover:scale-[1.03]"
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
      />
    );
  }

  return (
    <div
      className="fh-industrial-grid absolute inset-0"
      aria-label={media.alt}
      role="img"
    >
      <div className="absolute inset-x-5 bottom-5 top-12 border border-white/10" />
      <div className="absolute bottom-5 left-5 h-14 w-1 bg-forge" />
      <div className="absolute bottom-5 left-10 right-5 h-px bg-white/20" />
    </div>
  );
}

export function ProjectRouteSection({
  delivery,
  locale,
}: {
  delivery: HomepageContent["delivery"];
  locale: Locale;
}) {
  return (
    <section data-module-id="H04" className="bg-hero py-20 text-white sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div
          className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20"
          data-reveal-group
        >
          <div data-reveal>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-forge-bright">
              {delivery.eyebrow}
            </p>
            {/* Headings need an explicit colour: the Astryx Neutral theme's
                `:where(h1…h6) { color: var(--color-text-primary) }` is scoped by
                landmark, not by surface, so an `<h2>` relying on inherited colour
                takes the light-mode ink on this dark band (measured 1.06:1 — WCAG
                1.4.3 fail). Same bug class as P1's h1 fix. */}
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              {delivery.heading}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/66 sm:text-lg">
              {delivery.lead}
            </p>

            <ol className="relative mt-12 border-l border-white/18 pl-8">
              {delivery.stages.map((stage, index) => (
                <li
                  key={stage.title}
                  className="relative pb-9 last:pb-0"
                  data-reveal
                >
                  <span className="absolute -left-[2.47rem] top-0 grid size-5 place-items-center rounded-full border border-forge-bright bg-hero font-mono text-[0.52rem] font-bold text-forge-bright">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
                    {stage.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/58">
                    {stage.body}
                  </p>
                </li>
              ))}
            </ol>

            <Link
              href={localizedPath(delivery.action.href, locale)}
              className="mt-12 inline-flex min-h-12 items-center justify-center bg-forge px-6 text-sm font-semibold text-white transition hover:bg-forge-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge"
            >
              {delivery.action.label}
            </Link>
          </div>

          <div className="grid content-start gap-5 sm:grid-cols-2" data-reveal>
            {delivery.evidence.map((evidence, index) => (
              <article
                key={evidence.id}
                className={`group overflow-hidden border border-white/12 bg-white/[0.035] ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden ${
                    index === 0 ? "aspect-[16/8]" : "aspect-[4/3]"
                  }`}
                >
                  <EvidenceVisual evidence={evidence} />
                  <span className="absolute left-5 top-5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-forge-bright">
                    0{index + 1}
                  </span>
                </div>
                <div className="border-t border-white/12 p-5 sm:p-6">
                  <h3 className="text-xl font-semibold tracking-[-0.025em] text-white">
                    {evidence.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/58">
                    {evidence.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
