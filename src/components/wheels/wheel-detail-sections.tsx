import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import {
  WHEEL_DETAIL_CONFIGURATION_ANCHOR,
  WHEEL_DETAIL_ID,
  wheelDetailBreadcrumb,
  wheelDetailFinishes,
  wheelDetailFitment,
  wheelDetailIdentity,
  wheelDetailRelated,
  wheelDetailSeo,
} from "@/content/wheel-detail";
import type { PublicWheelVariant, WheelCatalogueCard } from "@/lib/wheels";

import { WheelCatalogueCardView } from "./wheel-catalogue-card";

/**
 * WD01, WD04, WD05 and WD06 — the parts of the detail page that hold no state.
 *
 * They are Server Components: they render approved data that was already
 * resolved by `getWheelDetailPage()`, so nothing extra is shipped to the browser
 * (spec §12). Only WD02/WD03 are interactive.
 */

/* ============================================================================
 * WD01 — product identity
 * ========================================================================== */

/**
 * Single-image template (DEC-014, spec §2.2).
 *
 * `object-contain` inside a 1:1 box: a wheel is round, so `cover` would crop the
 * rim, and a 390 px viewport gets a ~350 px square that never runs off the side.
 * There is deliberately no thumbnail strip, arrow, zoom or carousel — a one-image
 * "gallery" with fake controls is exactly what §2.2 forbids.
 */
export function WheelDetailHero({
  model,
  primaryImage,
  processLabel,
}: {
  model: string;
  primaryImage: string;
  /** Approved process label; `undefined` means the source record has none. */
  processLabel?: string;
}) {
  return (
    <section
      aria-labelledby={`${WHEEL_DETAIL_ID}-title`}
      data-reveal
      className="border-b border-border bg-card pb-14 pt-[112px] lg:pb-16 lg:pt-[136px]"
    >
      <div className="container-fh">
        <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap items-center gap-x-2">
          <Link
            href={wheelDetailBreadcrumb.rootHref}
            className="transition-colors hover:text-forge"
          >
            {wheelDetailBreadcrumb.rootLabel}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={wheelDetailBreadcrumb.sectionHref}
            className="transition-colors hover:text-forge"
          >
            {wheelDetailBreadcrumb.sectionLabel}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink" aria-current="page">
            {model}
          </span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-14">
          <figure data-reveal>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-hero">
              <Image
                src={primaryImage}
                alt={wheelDetailSeo.imageAlt(model)}
                fill
                // One image, declared sizes, WebP from the asset layer: the
                // largest thing on the page must not be re-fetched per breakpoint.
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-contain"
                priority
              />
            </div>
          </figure>

          <div data-reveal className="lg:pt-2">
            <p className="eyebrow !text-forge">{wheelDetailIdentity.eyebrow}</p>
            <h1
              id={`${WHEEL_DETAIL_ID}-title`}
              className="mt-4 font-display text-[clamp(2.2rem,6.4vw,3.8rem)] font-800 uppercase leading-[0.94] tracking-[-0.02em] text-ink"
            >
              {model}
            </h1>

            {/* Unknown process is stated, never inferred into 旋压/低压/锻造 (§14). */}
            <p
              className={
                processLabel
                  ? "mt-4 font-display text-[0.74rem] font-700 uppercase tracking-[0.14em] text-forge"
                  : "mt-4 max-w-[520px] text-[0.9rem] leading-relaxed text-steel"
              }
            >
              {processLabel
                ? wheelDetailIdentity.processRecorded(processLabel)
                : wheelDetailIdentity.processMissing}
            </p>

            <p className="mt-6 max-w-[560px] text-[1.02rem] leading-relaxed text-ink/80">
              {wheelDetailIdentity.intro(model)}
            </p>

            <p className="mt-6 max-w-[560px] border-l-2 border-forge pl-4 text-[0.86rem] leading-relaxed text-steel">
              {wheelDetailIdentity.boundary}
            </p>

            {/* The configuration entry point — §5 asks for it in the first
                screen, and it never carries a fabricated spec. */}
            <Link
              href={`#${WHEEL_DETAIL_CONFIGURATION_ANCHOR}`}
              className="btn-pill-solid mt-8"
            >
              {wheelDetailIdentity.selectAnchor}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * WD04 — recorded finish options
 * ========================================================================== */

/**
 * Human-approved Chinese → English finish names, keyed by the raw source value.
 *
 * ⚠️ EMPTY BY DESIGN — this is the publication gate, not a placeholder.
 *
 * Every approved variant carries a raw `finish`, but the source values are
 * Chinese and none of them has an approved English public name yet (spec §3.3
 * fact 4, §8; DEC-035). A finish becomes publishable by gaining an entry here —
 * and nothing else can publish it:
 *
 *   · the raw Chinese value is not printed (spec §3.3 fact 4, §14);
 *   · no colour is inferred from a name, and no generic sample image stands in
 *     for a real one (spec §8, §2.2);
 *   · an empty list hides the whole block rather than showing "Coming soon"
 *     (spec §4 WD04, §14).
 *
 * Filling this map is the only change needed to switch WD04 on.
 */
const APPROVED_PUBLIC_FINISH_NAMES: Readonly<Record<string, string>> = {};

/** Distinct public finish names recorded on this model's approved variants. */
export function publicFinishNames(variants: PublicWheelVariant[]): string[] {
  const names: string[] = [];
  for (const variant of variants) {
    const publicName = APPROVED_PUBLIC_FINISH_NAMES[variant.finish];
    if (publicName && !names.includes(publicName)) names.push(publicName);
  }
  return names;
}

export function WheelFinishSection({
  model,
  variants,
}: {
  model: string;
  variants: PublicWheelVariant[];
}) {
  const names = publicFinishNames(variants);
  // No approved name → the whole WD04 block is absent. The finish that is
  // recorded on each variant is still visible as part of its configuration row.
  if (names.length === 0) return null;

  return (
    <section
      id={`${WHEEL_DETAIL_ID}-finishes`}
      aria-labelledby={`${WHEEL_DETAIL_ID}-finishes-title`}
      data-reveal
      className="border-b border-border bg-card py-16 lg:py-20"
    >
      <div className="container-fh">
        <h2
          id={`${WHEEL_DETAIL_ID}-finishes-title`}
          className="max-w-[720px] font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
        >
          {wheelDetailFinishes.heading(model)}
        </h2>
        <p className="mt-4 max-w-[780px] text-[0.98rem] leading-relaxed text-steel">
          {wheelDetailFinishes.body}
        </p>

        {/* Text cards only (§8): a colour swatch generated from a name would be
            a claim we cannot back. */}
        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {names.map((name) => (
            <li key={name} className="rounded-xl border border-border bg-soft px-5 py-4">
              <p className="font-display text-[0.96rem] font-700 uppercase leading-tight tracking-[0.02em] text-ink">
                {name}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================
 * WD05 — application boundary
 * ========================================================================== */

/**
 * Production record and vehicle-fitment review are kept apart on purpose (§9).
 * No model is ever declared to fit a vehicle, and none of
 * "universal fitment" / "guaranteed fit" / "direct replacement" appears here.
 */
export function WheelFitmentSection() {
  return (
    <section
      id={`${WHEEL_DETAIL_ID}-fitment`}
      aria-labelledby={`${WHEEL_DETAIL_ID}-fitment-title`}
      data-reveal
      className="border-b border-border bg-card py-16 lg:py-20"
    >
      <div className="container-fh grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <h2
            id={`${WHEEL_DETAIL_ID}-fitment-title`}
            className="max-w-[560px] font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
          >
            {wheelDetailFitment.heading}
          </h2>
          <p className="mt-5 max-w-[560px] text-[1rem] leading-relaxed text-steel">
            {wheelDetailFitment.body}
          </p>
        </div>

        <ul className="grid content-start gap-4 self-start rounded-xl border border-border bg-soft p-7">
          {wheelDetailFitment.checklist.map((item) => (
            <li key={item} className="flex items-start gap-3.5">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              </span>
              <span className="text-[0.95rem] leading-relaxed text-ink/80">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================================
 * WD06 — related models
 * ========================================================================== */

/**
 * Renders the cards `getWheelDetailPage()` already scored (PCD +4, diameter +3,
 * recorded process +2 — spec §10) from the same public collection. The page does
 * not re-rank, relax the publication gate to fill three slots, use `styleName`
 * or hand-pick "similar" models. Fewer than three is a correct answer.
 */
export function WheelRelatedModels({ related }: { related: WheelCatalogueCard[] }) {
  if (related.length === 0) return null;

  return (
    <section
      id={`${WHEEL_DETAIL_ID}-related`}
      aria-labelledby={`${WHEEL_DETAIL_ID}-related-title`}
      data-reveal
      className="border-b border-border bg-soft py-16 lg:py-20"
    >
      <div className="container-fh">
        <h2
          id={`${WHEEL_DETAIL_ID}-related-title`}
          className="max-w-[640px] font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
        >
          {wheelDetailRelated.heading}
        </h2>

        <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* No `priority`: only the WD01 primary image is allowed to compete
              with the LCP element (spec §12). */}
          {related.map((card) => (
            <WheelCatalogueCardView key={card.slug} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

