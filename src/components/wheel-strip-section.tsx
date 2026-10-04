import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WheelCard } from "./wheel-card";
import { homeWheelStrip } from "@/content/home-wheel-strip";

/**
 * Homepage viewport 04 — "what does it actually look like?".
 *
 * ── Why this is its own viewport (DESIGN.md §0.5.1) ────────────────────────
 * It answers exactly one question, and it is the *only* place on the homepage
 * that shows real product. Delete it and the four product lines exist purely as
 * text — so it earns its screen.
 *
 * It must not restate viewport 03 (manufacturing) or 01 (hero): no workshop
 * imagery, no process copy, no automotive scene photography. Product only.
 *
 * ── What it replaced ───────────────────────────────────────────────────────
 * `<GalleryBand>` used to sit here and pointed at `/gallery`, which is out of
 * scope this phase and has no assets — the link led to an empty page. It was
 * removed rather than kept as a promise the site cannot keep. See
 * PAGE-SPECS/index-home.md §2 视口 04.
 */

export function WheelStripSection() {
  const wheels = homeWheelStrip;

  return (
    <section
      id="wheel-strip"
      aria-labelledby="wheel-strip-title"
      data-reveal
      className="border-b border-border bg-hero py-20 lg:py-24"
    >
      <div className="container-fh">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow !text-forge">Range</p>
            <h2
              id="wheel-strip-title"
              className="mt-4 max-w-[620px] font-display text-[clamp(1.8rem,3.8vw,2.8rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-white"
            >
              From 15 to 20 inches
            </h2>
            <p className="mt-4 max-w-[560px] text-[0.98rem] leading-relaxed text-white/65">
              {wheels.length} of the range, one per diameter — every one of them
              a real catalogue model you can quote today.
            </p>
          </div>

          <Link
            href="/products/wheels"
            className="btn-pill-outline !text-white"
          >
            View the full range
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul
          data-reveal-group
          className="mt-11 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4"
        >
          {wheels.map((wheel, i) => (
            <li key={wheel.model}>
              <WheelCard
                wheel={wheel}
                href={`/products/wheels?model=${encodeURIComponent(wheel.model)}`}
                // The first row is above the fold on most desktop viewports.
                priority={i < 3}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
