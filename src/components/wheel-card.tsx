import Link from "next/link";
import type { FeaturedWheel } from "@/content/types";

/**
 * A single wheel model card.
 *
 * ⚠️ Shared component — four call sites planned (homepage strip, catalogue,
 * series page, "related models" on the model page). See PAGE-SPECS/index.md
 * §2.1. Do not fork a local copy at a call site; extend this one.
 *
 * ── Image discipline (DEC-014) ──────────────────────────────────────────────
 * `object-contain` on a 1:1 box, never `cover`: a wheel is round, and cover
 * crops the rim edge off. The plate behind the image is `bg-hero` so a slow or
 * missing file degrades to a clean dark tile rather than a hole in the row.
 *
 * These are catalogue photographs — the filename is the product code (DEC-012),
 * not retouched marketing imagery. The card therefore keeps the type small and
 * lets the *number* of wheels carry the message.
 *
 * ── Caption layout (2026-10-02) ─────────────────────────────────────────────
 * The caption used to be a two-column flex (text left, process chip right),
 * which left a dead gutter on the right of every card whose model code is
 * short — i.e. almost all of them. It is now three stacked spec rows: label
 * over value, one row per attribute, each attribute full-bleed across the
 * card. Density comes from *more* information (size / PCD / finish), not from
 * a wider box.
 *
 * `process` is absent for ~62% of the catalogue (index.md §2.3), and the
 * homepage strip happens to be all six of them. So the row set is built as
 * data first and rendered second: a missing process simply does not produce a
 * row, rather than producing an empty one. Finish — which the catalogue
 * records for every model — carries the visual weight the chip used to.
 */

/** Attribute rows are declared once, so "all six have process: null" is a
 *  one-line change rather than a layout collapse. */
const SPEC_ROWS: { key: keyof FeaturedWheel; label: string }[] = [
  { key: "size", label: "Size" },
  { key: "pcd", label: "PCD" },
  { key: "finish", label: "Finish" },
  { key: "process", label: "Process" },
];

export type WheelCardProps = {
  wheel: FeaturedWheel;
  href?: string;
  /** Above-the-fold images only. */
  priority?: boolean;
  /** Emit the model/size caption under the wheel. */
  showSpec?: boolean;
};

export function WheelCard({
  wheel,
  href = "/products/wheels",
  priority = false,
  showSpec = true,
}: WheelCardProps) {
  // Resolve the rows this particular wheel actually has. Building the list
  // first means a null `process` costs nothing instead of leaving a gap.
  const rows = SPEC_ROWS.map((row) => ({
    label: row.label,
    value: wheel[row.key],
  })).filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <Link
      href={href}
      aria-label={`${wheel.model} — view wheel range`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-hero transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-forge focus-visible:border-forge focus-visible:outline-none"
    >
      {/* 1:1 plate — contain, never cover */}
      <div className="relative aspect-square w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- the strip renders
            2757 potential catalogue images; next/image's optimizer adds no value
            for pre-sized WebP and complicates the generated-path contract. */}
        <img
          src={wheel.image}
          alt={wheel.alt}
          width={640}
          height={640}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 size-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04] lg:p-4"
        />
      </div>

      {showSpec ? (
        <div className="flex flex-1 flex-col border-t border-white/10 px-3.5 py-3">
          {/* Model code — the one thing a buyer quotes back to us. */}
          <p className="truncate font-display text-[0.86rem] font-700 uppercase tracking-[0.04em] text-white">
            {wheel.model}
          </p>

          {/* Spec rows: label over value, full width. Rendered from data so a
              wheel without a recorded process has three rows, not a hole. */}
          <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {rows.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="text-[0.58rem] uppercase tracking-[0.12em] text-white/40">
                  {row.label}
                </dt>
                <dd className="truncate text-[0.72rem] leading-tight text-white/75">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </Link>
  );
}
