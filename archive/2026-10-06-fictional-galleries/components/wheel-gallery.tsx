"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type {
  SpokePattern,
  WheelApplication,
  WheelConstruction,
  WheelDesign,
  WheelFinish,
} from "@/content/types";
import { wheelFinishSwatches } from "@/content/wheel-designs";
import { cn } from "@/lib/utils";

/**
 * Client-side wheel design gallery.
 *
 * Filters across FOUR axes simultaneously (spoke pattern, construction, finish,
 * application) plus a free-text query. Every facet is multi-select within its
 * own axis and AND-ed across axes — picking two finishes shows designs in
 * either finish, while also requiring the selected spoke pattern.
 *
 * Nothing here requests an image: no wheel photography exists, so each card
 * draws a technical SVG from the design's own data (see `WheelDrawing`).
 */

type Facets = {
  spokes: SpokePattern[];
  construction: WheelConstruction[];
  finish: WheelFinish[];
  application: WheelApplication[];
};

const EMPTY_FACETS: Facets = {
  spokes: [],
  construction: [],
  finish: [],
  application: [],
};

export function WheelGallery({
  designs,
  facets,
  emptyState,
}: {
  designs: WheelDesign[];
  facets: {
    spokes: SpokePattern[];
    construction: WheelConstruction[];
    finish: WheelFinish[];
    application: WheelApplication[];
  };
  emptyState: {
    title: string;
    body: string;
    action: { label: string; href: string };
  };
}) {
  const [selected, setSelected] = useState<Facets>(EMPTY_FACETS);
  const [query, setQuery] = useState("");

  /**
   * Toggle one value within one axis.
   *
   * Non-generic on purpose: the four axes hold different string-literal
   * unions, and a generic signature fights TS's inference across the union.
   * Values arrive from the facet data itself, so the cast is safe at the
   * boundary and the arrays stay correctly typed.
   */
  const toggle = (axis: keyof Facets, value: string) => {
    setSelected((current) => {
      const list = current[axis] as string[];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...current, [axis]: next } as Facets;
    });
  };

  const clearAll = () => {
    setSelected(EMPTY_FACETS);
    setQuery("");
  };

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return designs.filter((design) => {
      if (selected.spokes.length && !selected.spokes.includes(design.spokes)) {
        return false;
      }
      if (
        selected.construction.length &&
        !selected.construction.includes(design.construction)
      ) {
        return false;
      }
      if (selected.finish.length && !selected.finish.includes(design.finish)) {
        return false;
      }
      if (
        selected.application.length &&
        !selected.application.includes(design.application)
      ) {
        return false;
      }
      if (!needle) return true;

      return [
        design.name,
        design.spokes,
        design.construction,
        design.finish,
        design.application,
        ...design.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [designs, selected, query]);

  /** Active facet chips, flattened for the removable-chip row. */
  const activeChips = useMemo(() => {
    const chips: { axis: keyof Facets; label: string; value: string }[] = [];
    for (const value of selected.spokes) {
      chips.push({ axis: "spokes", label: "Spoke", value });
    }
    for (const value of selected.construction) {
      chips.push({ axis: "construction", label: "Construction", value });
    }
    for (const value of selected.finish) {
      chips.push({ axis: "finish", label: "Finish", value });
    }
    for (const value of selected.application) {
      chips.push({ axis: "application", label: "Application", value });
    }
    return chips;
  }, [selected]);

  const isFiltered =
    activeChips.length > 0 || query.trim() !== "";

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
      {/* Facet rail ------------------------------------------------------- */}
      <aside
        aria-label="Filter wheel designs"
        className="h-fit rounded-xl border border-border bg-soft p-6 lg:sticky lg:top-[100px]"
      >
        <FacetAxis
          legend="Spoke pattern"
          axis="spokes"
          options={facets.spokes}
          selected={selected.spokes}
          onToggle={toggle}
        />
        <FacetAxis
          legend="Construction"
          axis="construction"
          options={facets.construction}
          selected={selected.construction}
          onToggle={toggle}
        />
        <FacetAxis
          legend="Finish"
          axis="finish"
          options={facets.finish}
          selected={selected.finish}
          onToggle={toggle}
          swatches
        />
        <FacetAxis
          legend="Application"
          axis="application"
          options={facets.application}
          selected={selected.application}
          onToggle={toggle}
        />

        <button
          type="button"
          onClick={clearAll}
          disabled={!isFiltered}
          className={cn(
            "mt-2 inline-flex min-h-[42px] items-center font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] transition-colors",
            isFiltered
              ? "text-forge hover:text-forge-deep"
              : "cursor-not-allowed text-steel/50",
          )}
        >
          Clear all filters
        </button>
      </aside>

      {/* Results ---------------------------------------------------------- */}
      <div>
        {/* Search + count */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-[340px]">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-steel"
              aria-hidden="true"
            />
            <label htmlFor="wheel-search" className="sr-only">
              Search wheel designs
            </label>
            <input
              id="wheel-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search design or tag…"
              className={cn(
                "min-h-[48px] w-full rounded-full border border-border bg-white pl-11 pr-11 text-sm text-ink",
                "placeholder:text-steel/80",
                "outline-none transition-[border-color,box-shadow] duration-200",
                "focus:border-forge focus:ring-2 focus:ring-forge/25",
              )}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-steel transition-colors hover:bg-soft hover:text-ink"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <p
            aria-live="polite"
            className="font-display text-[0.76rem] font-700 uppercase tracking-[0.14em] text-steel"
          >
            {results.length} {results.length === 1 ? "design" : "designs"}
            {isFiltered ? " match your filters" : " in the catalogue"}
          </p>
        </div>

        {/* Active chips */}
        {activeChips.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {activeChips.map((chip) => (
              <li key={`${chip.axis}-${chip.value}`}>
                <button
                  type="button"
                  onClick={() => toggle(chip.axis, chip.value)}
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-forge bg-forge/10 px-4 font-display text-[0.7rem] font-700 uppercase tracking-[0.12em] text-forge transition-colors hover:bg-forge/18"
                >
                  <span className="text-forge/60">{chip.label}:</span>
                  {chip.value}
                  <X className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Remove filter</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Grid or empty state */}
        {results.length > 0 ? (
          <div
            data-reveal-group
            className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {results.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-soft px-8 py-20 text-center">
            <p className="font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
              {emptyState.title}
            </p>
            <p className="mt-3 max-w-[440px] text-sm leading-relaxed text-steel">
              {emptyState.body}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="btn-pill-outline text-ink"
              >
                Clear all filters
              </button>
              <Link href={emptyState.action.href} className="btn-pill-solid">
                {emptyState.action.label}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** One facet axis: an accessible multi-select group of toggle buttons. */
function FacetAxis({
  legend,
  axis,
  options,
  selected,
  onToggle,
  swatches = false,
}: {
  legend: string;
  axis: keyof Facets;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (axis: keyof Facets, value: string) => void;
  swatches?: boolean;
}) {
  const id = useId();

  return (
    <fieldset className="border-b border-border pb-6 pt-6 first:pt-0 last:border-b-0">
      <legend
        id={id}
        className="font-display text-[0.7rem] font-700 uppercase tracking-[0.16em] text-ink"
      >
        {legend}
      </legend>
      <div role="group" aria-labelledby={id} className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(axis, option)}
              className={cn(
                "inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3.5",
                "font-display text-[0.68rem] font-700 uppercase tracking-[0.1em]",
                "transition-[background,color,border-color] duration-200 ease-out",
                active
                  ? "border-forge bg-forge text-white"
                  : "border-border bg-white text-ink/75 hover:border-forge hover:text-forge",
              )}
            >
              {swatches ? (
                <span
                  aria-hidden="true"
                  className="size-3 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{
                    background:
                      wheelFinishSwatches[option as WheelFinish].swatch,
                  }}
                />
              ) : null}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** A single design card: generated wheel drawing + metadata. */
function DesignCard({ design }: { design: WheelDesign }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge">
      <div className="relative aspect-square overflow-hidden bg-ink">
        <WheelDrawing design={design} />
        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
          {design.construction}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.1rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
          {design.name}
        </h3>

        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
          <div className="bg-white px-3.5 py-3">
            <dt className="font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-steel">
              Spokes
            </dt>
            <dd className="mt-1 text-[0.82rem] font-medium text-ink">
              {design.spokes}
            </dd>
          </div>
          <div className="bg-white px-3.5 py-3">
            <dt className="font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-steel">
              Application
            </dt>
            <dd className="mt-1 text-[0.82rem] font-medium text-ink">
              {design.application}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ background: wheelFinishSwatches[design.finish].swatch }}
          />
          <span className="text-[0.82rem] text-steel">{design.finish}</span>
        </div>

        {design.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {design.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-soft px-2.5 py-1 text-[0.68rem] font-medium text-steel"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Generated technical drawing of a wheel design.
 *
 * Spoke count and geometry come from the design's `spokes` value; the stroke
 * and face tint come from its finish swatch. The result is a clean line
 * diagram — a hub, a rim, and N radial spokes — not a photograph, and not an
 * `<img>` pointing at a file that does not exist.
 *
 * This is a thin adapter over `WheelSketch`, which is the shared primitive:
 * the gallery passes a spoke *pattern*, while per-SKU product pages pass an
 * explicit spoke *count*. Both resolve to the same drawing so the two
 * surfaces can never drift apart.
 */
function WheelDrawing({ design }: { design: WheelDesign }) {
  return (
    <WheelSketch
      id={design.id}
      spokes={design.spokes}
      finish={design.finish}
      label={`${design.name} — ${design.spokes} in ${design.finish}`}
      className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
    />
  );
}

/**
 * Shared wheel drawing primitive.
 *
 * Accepts either a named spoke `SpokePattern` (the design gallery's axis) or a
 * raw spoke `count` (used by the per-SKU product pages, where the catalogue
 * carries a number). Finish drives the tint through the same swatch
 * vocabulary everywhere, so a Gunmetal SKU and a Gunmetal gallery design
 * render identically.
 *
 * Nothing here requests a file — the site has no wheel photography, so every
 * wheel visual on the site is drawn from data.
 */
export function WheelSketch({
  id,
  spokes,
  count,
  finish,
  label,
  className,
}: {
  /** Unique DOM id fragment for the gradient definition. */
  id: string;
  /** Named pattern — geometry resolved via `spokeGeometry`. */
  spokes?: SpokePattern;
  /** Explicit spoke count — overrides pattern geometry when supplied. */
  count?: number;
  finish: WheelFinish;
  /** Accessible description of what the drawing shows. */
  label: string;
  className?: string;
}) {
  const { swatch, accent } = wheelFinishSwatches[finish];
  const geometry = count
    ? {
        count,
        offset: -90,
        spokeWidth: spokeWidthForCount(count),
        split: false,
        mesh: count >= 18,
      }
    : spokeGeometry(spokes ?? "Five-Spoke");

  const cx = 100;
  const cy = 100;
  const hubRadius = 15;
  const rimOuter = 82;
  const rimInner = 70;
  const spokeInner = hubRadius + 4;
  const spokeOuter = rimInner - 2;

  /** One entry per spoke, rotated around the hub by index. */
  const spokeList = Array.from({ length: geometry.count }, (_, index) => {
    const angle = (360 / geometry.count) * index + geometry.offset;
    return { angle, index };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        <radialGradient id={`face-${id}`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={swatch} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.95" />
        </radialGradient>
      </defs>

      {/* Ambient field */}
      <rect width="200" height="200" fill="transparent" />

      {/* Outer rim band */}
      <circle
        cx={cx}
        cy={cy}
        r={(rimOuter + rimInner) / 2}
        fill="none"
        stroke={swatch}
        strokeWidth={rimOuter - rimInner}
        opacity="0.28"
      />
      <circle
        cx={cx}
        cy={cy}
        r={rimOuter}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <circle
        cx={cx}
        cy={cy}
        r={rimInner}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />

      {/* Spokes */}
      <g>
        {spokeList.map(({ angle, index }) => (
          <Spoke
            key={index}
            angle={angle}
            cx={cx}
            cy={cy}
            inner={spokeInner}
            outer={spokeOuter}
            width={geometry.spokeWidth}
            fill={swatch}
            split={geometry.split}
            mesh={geometry.mesh}
          />
        ))}
      </g>

      {/* Hub */}
      <circle cx={cx} cy={cy} r={hubRadius} fill={accent} />
      <circle
        cx={cx}
        cy={cy}
        r={hubRadius}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <circle cx={cx} cy={cy} r="4" fill="#ffffff" fillOpacity="0.55" />
    </svg>
  );
}

/** A single spoke, drawn as a tapered wedge rotated around the hub. */
function Spoke({
  angle,
  cx,
  cy,
  inner,
  outer,
  width,
  fill,
  split,
  mesh,
}: {
  angle: number;
  cx: number;
  cy: number;
  inner: number;
  outer: number;
  width: number;
  fill: string;
  split: boolean;
  mesh: boolean;
}) {
  const halfWidth = width / 2;
  const outerHalf = mesh ? halfWidth * 1.7 : halfWidth * 0.85;

  // A tapered wedge opening toward the rim (+outer) and narrow at the hub.
  const points = [
    [-halfWidth, -inner],
    [halfWidth, -inner],
    [outerHalf, -outer],
    [-outerHalf, -outer],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <polygon
        points={points}
        transform={`translate(${cx} ${cy})`}
        fill={fill}
        fillOpacity="0.9"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="1"
      />

      {/* Split-spoke centres the pair with a machined gap. */}
      {split ? (
        <line
          x1={cx}
          y1={cy - inner}
          x2={cx}
          y2={cy - outer}
          stroke="#0b0f16"
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />
      ) : null}

      {/* Mesh adds a cross-brace ring of small connecting struts. */}
      {mesh ? (
        <line
          x1={cx - halfWidth}
          y1={cy - (inner + outer) / 2}
          x2={cx + halfWidth}
          y2={cy - (inner + outer) / 2}
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="1.2"
        />
      ) : null}
    </g>
  );
}

/**
 * Spoke width for a raw spoke count.
 *
 * Choosing width from count (rather than a lookup table) keeps an arbitrary
 * SKU's spoke count drawable: a 5-spoke gets a wide tapered wedge, a 20-spoke
 * gets fine blades, and both stay legible at card size.
 */
function spokeWidthForCount(count: number): number {
  if (count <= 5) return 17;
  if (count <= 6) return 15;
  if (count <= 10) return 9;
  if (count <= 12) return 7.5;
  if (count <= 15) return 6;
  return 4;
}

/**
 * Translate a spoke pattern into drawable geometry.
 *
 * Counts are chosen to represent each pattern honestly: a five-spoke has five
 * spokes, a mesh has many, a multi-spoke sits between. These are illustrative
 * counts, not a specification of any Fenghuai mould.
 */
function spokeGeometry(pattern: SpokePattern): {
  count: number;
  offset: number;
  spokeWidth: number;
  split: boolean;
  mesh: boolean;
} {
  switch (pattern) {
    case "Five-Spoke":
      return { count: 5, offset: -90, spokeWidth: 17, split: false, mesh: false };
    case "Retro Five-Spoke":
      return { count: 5, offset: -90, spokeWidth: 21, split: false, mesh: false };
    case "Split-Spoke":
      return { count: 10, offset: -90, spokeWidth: 9, split: true, mesh: false };
    case "Multi-Spoke":
      return { count: 15, offset: -90, spokeWidth: 6, split: false, mesh: false };
    case "Turbine":
      return { count: 11, offset: -72, spokeWidth: 12, split: false, mesh: false };
    case "Mesh":
      return { count: 24, offset: -90, spokeWidth: 3.5, split: false, mesh: true };
    case "Full-Face":
      return { count: 7, offset: -90, spokeWidth: 22, split: false, mesh: false };
    default:
      return { count: 5, offset: -90, spokeWidth: 16, split: false, mesh: false };
  }
}
