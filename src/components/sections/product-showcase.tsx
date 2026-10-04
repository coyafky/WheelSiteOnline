import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { heroProducts } from "@/content/homepage-hero";

/**
 * Product lines — the answer to "what do we make?".
 *
 * ── Why this replaced the three-up forged-wheel grid ──────────────────────
 * The previous version showed three wheel construction types (monoblock /
 * two-piece / off-road) — the *competitor's* taxonomy, not ours. Meanwhile the
 * hero showed four product lines. The homepage therefore answered "what do we
 * make?" twice, with two different answers.
 *
 * DESIGN.md §0.5.2 gives the remedy for exactly this: if two sections do not
 * answer two different questions, merge or delete. The four-line version is the
 * accurate one, so it absorbed the section.
 *
 * ── Why this is a full viewport, not a hero rail ──────────────────────────
 * These same four cards used to sit inside the hero, competing with the hero's
 * CTA for the same click (§0.5.1 — one viewport, one primary action). They now
 * own their own screen, so the hero can be purely "who are we?".
 *
 * ⚠️ This section owns "what do we make". No other homepage section may
 * restate it (§0.5.2).
 */
export function ProductShowcase() {
  return (
    <section
      id="product-lines"
      aria-labelledby="product-lines-title"
      data-reveal
      className="border-b border-border bg-white py-20 lg:py-24"
    >
      <div className="container-fh">
        <p className="eyebrow">Product lines</p>
        <h2
          id="product-lines-title"
          className="mt-4 max-w-[760px] font-display text-[clamp(2rem,4.6vw,3.2rem)] font-800 uppercase leading-[0.95] tracking-[-0.01em] text-ink"
        >
          Four lines, one factory
        </h2>
        <p className="mt-5 max-w-[600px] text-[1.02rem] leading-relaxed text-steel">
          Wheels are where we started. The same aluminium, casting and machining
          capability now runs across four product lines.
        </p>

        <ul
          data-reveal-group
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6"
        >
          {heroProducts.map((product) => (
            <li key={product.id}>
              <Link
                href={product.href}
                aria-label={`Explore ${product.title}`}
                className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-xl border border-border p-6 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-forge focus-visible:border-forge focus-visible:outline-none lg:min-h-[320px] lg:p-7"
              >
                {/* Line art */}
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative
                    card art sized by the card box, not by the image's own
                    dimensions. */}
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 -z-10 size-full object-cover brightness-[.5] transition-[filter,transform] duration-500 group-hover:scale-[1.04] group-hover:brightness-[.72]"
                />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(2,4,8,0.94)_0%,rgba(2,4,8,0.55)_55%,rgba(2,4,8,0.35)_100%)]" />

                <div className="relative">
                  <h3 className="font-display text-[1.4rem] font-800 uppercase leading-[1.05] tracking-[0.01em] text-white lg:text-[1.6rem]">
                    {product.title}
                  </h3>
                  {product.subtitle ? (
                    <p className="mt-2 font-display text-[0.82rem] font-600 uppercase tracking-[0.12em] text-forge">
                      {product.subtitle}
                    </p>
                  ) : null}
                  {product.description ? (
                    <p className="mt-3.5 max-w-[420px] text-[0.92rem] leading-relaxed text-white/70">
                      {product.description}
                    </p>
                  ) : null}

                  <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.78rem] font-700 uppercase tracking-[0.13em] text-white/80 transition-colors duration-300 group-hover:text-forge">
                    View line
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link href="/products" className="btn-pill-outline text-ink">
            All products
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
