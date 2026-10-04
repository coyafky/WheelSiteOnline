import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HeroProduct } from "@/content/types";

/**
 * One product-line entry card in the hero.
 *
 * ── The cut corner (hero PageSpec §16) ────────────────────────────────────
 * An ordinary 2×2 card grid reads as a Bootstrap layout. These cards instead
 * carry a single clipped corner (top-right), giving the group an industrial,
 * fabricated-plate feel without resorting to rotation — the text stays
 * perfectly horizontal, so nothing becomes harder to read.
 *
 * Alternating which corner is cut would look noisy at four cards, so all four
 * share the same corner: the group then reads as one machined assembly rather
 * than four unrelated tiles.
 *
 * ── Legibility ────────────────────────────────────────────────────────────
 * `object-cover` on a card this wide crops unpredictably, and the hero photo
 * sits directly behind — so the image is desaturated and darkened well below
 * the hero, and only lifts on hover (§18).
 *
 * ⚠️ Real `<a>` via `next/link`, never a clickable `<div>` (§27).
 */

/**
 * Cut size in px. Larger cards get a larger cut so the proportion holds.
 * Kept as one value per breakpoint rather than a percentage: a percentage
 * cut would change shape as the card flexes, and the corner should look
 * machined, not stretched.
 */
const CUT = 22;

export function HeroProductCard({ product }: { product: HeroProduct }) {
  return (
    <Link
      href={product.href}
      aria-label={`Explore ${product.title}`}
      style={{
        // Applied inline because the value is also needed by the border layer
        // below — keeping one source avoids the two drifting apart.
        clipPath: `polygon(0 0, calc(100% - ${CUT}px) 0, 100% ${CUT}px, 100% 100%, 0 100%)`,
      }}
      className="group relative flex min-h-[128px] flex-col justify-end overflow-hidden p-4 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none lg:min-h-[152px] lg:p-5"
    >
      {/* Card art */}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative card
          art, sized by the card box rather than the image's own dimensions. */}
      <img
        src={product.image}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover brightness-[.42] saturate-[.7] transition-[filter,transform] duration-300 group-hover:scale-[1.04] group-hover:brightness-[.7]"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(2,4,8,0.92)_0%,rgba(2,4,8,0.45)_65%,rgba(2,4,8,0.30)_100%)]" />

      <div className="relative flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-[1.02rem] font-700 uppercase leading-[1.1] tracking-[0.02em] text-white lg:text-[1.12rem]">
            {product.title}
          </h3>
          {product.subtitle ? (
            <p className="mt-1.5 text-[0.72rem] leading-[1.35] text-white/60 lg:text-[0.76rem]">
              {product.subtitle}
            </p>
          ) : null}
        </div>
        <ArrowUpRight
          className="mb-0.5 size-4 shrink-0 text-white/50 transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-forge"
          aria-hidden="true"
        />
      </div>

      {/* Accent rule along the bottom edge */}
      <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-forge transition-transform duration-300 group-hover:scale-x-100" />

      {/*
        Border. Three plain elements instead of an SVG outline: SVG's `d`
        attribute does not evaluate CSS `calc()`, so a path expressed in mixed
        px/percent silently fails to draw — the cut edge then has no visible
        line at all.
        These are absolutely-positioned 1px rules that sit inside the clipped
        box, so the clip removes exactly the parts that should not show.
      */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/15 transition-colors duration-300 group-hover:bg-forge" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15 transition-colors duration-300 group-hover:bg-forge" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/15 transition-colors duration-300 group-hover:bg-forge" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/15 transition-colors duration-300 group-hover:bg-forge" />
    </Link>
  );
}
