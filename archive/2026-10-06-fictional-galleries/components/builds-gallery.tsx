"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { BuildEntry } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Client-side build gallery.
 *
 * Filters by family (single select, with an "all" option) AND a free-text query
 * matched against vehicle name and tags. Filtering is deliberately local — the
 * build list is small and static, so there is nothing to gain from a round trip.
 *
 * Build cards render a branded placeholder rather than requesting
 * `/images/builds/*.jpg`: no real build photography exists yet, so asking for
 * it would only produce broken images. Flip `hasImages` in `builds.ts` (and
 * render an `<img>` layer here) once assets are supplied.
 */
export function BuildsGallery({
  builds,
  families,
  emptyState,
}: {
  builds: BuildEntry[];
  families: readonly string[];
  emptyState: {
    title: string;
    body: string;
    action: { label: string; href: string };
  };
}) {
  const [family, setFamily] = useState<string>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return builds.filter((build) => {
      const familyMatch = family === "all" || build.family === family;

      if (!familyMatch) return false;
      if (!needle) return true;

      const haystack = [build.vehicle, build.family, build.finish, ...build.tags]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [builds, family, query]);

  const isFiltered = family !== "all" || query.trim() !== "";

  return (
    <div>
      {/* Controls ---------------------------------------------------------- */}
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-soft p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
        <div
          role="group"
          aria-label="Filter builds by wheel family"
          className="flex flex-wrap gap-2.5"
        >
          <FilterPill
            active={family === "all"}
            onClick={() => setFamily("all")}
          >
            All builds
          </FilterPill>
          {families.map((item) => (
            <FilterPill
              key={item}
              active={family === item}
              onClick={() => setFamily(item)}
            >
              {item}
            </FilterPill>
          ))}
        </div>

        <div className="relative lg:w-[300px]">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-steel"
            aria-hidden="true"
          />
          <label htmlFor="build-search" className="sr-only">
            Search builds by vehicle or tag
          </label>
          <input
            id="build-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search vehicle or tag…"
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
      </div>

      {/* Result count ------------------------------------------------------ */}
      <p
        aria-live="polite"
        className="mt-6 font-display text-[0.76rem] font-700 uppercase tracking-[0.14em] text-steel"
      >
        {results.length} {results.length === 1 ? "build" : "builds"}
        {isFiltered ? " match your filter" : " in the gallery"}
      </p>

      {/* Grid or empty state ----------------------------------------------- */}
      {results.length > 0 ? (
        <div
          data-reveal-group
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
        >
          {results.map((build) => (
            <BuildCard key={build.id} build={build} />
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
              onClick={() => {
                setFamily("all");
                setQuery("");
              }}
              className="btn-pill-outline text-ink"
            >
              Clear filters
            </button>
            <Link href={emptyState.action.href} className="btn-pill-solid">
              {emptyState.action.label}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** A single filter chip. */
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-[42px] items-center rounded-full border px-5",
        "font-display text-[0.72rem] font-700 uppercase tracking-[0.13em]",
        "transition-[background,color,border-color] duration-200 ease-out",
        active
          ? "border-forge bg-forge text-white"
          : "border-border bg-white text-ink/75 hover:border-forge hover:text-forge",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Build card.
 *
 * The media area is a branded placeholder — no `<img>` is rendered because the
 * build photography does not exist yet. Swap in a `<picture>` when it does.
 */
function BuildCard({ build }: { build: BuildEntry }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-white transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge">
      <div className="relative aspect-4/3 overflow-hidden bg-ink">
        <div
          className="flex size-full items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,rgba(194,101,10,0.22)_0%,rgba(11,15,22,0)_62%)]"
          aria-hidden="true"
        >
          <span className="font-display text-[0.72rem] font-700 uppercase tracking-[0.24em] text-white/35">
            Build photo coming soon
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(5,7,11,0.88)_0%,rgba(5,7,11,0)_100%)] p-5 pt-16">
          <span className="font-display text-[0.68rem] font-700 uppercase tracking-[0.18em] text-forge">
            {build.family}
          </span>
          <h3 className="mt-1.5 font-display text-[1.3rem] font-700 uppercase leading-none tracking-[0.01em] text-white">
            {build.vehicle}
          </h3>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-white px-5 py-4">
          <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel">
            Sizes
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-ink">{build.sizes}</dd>
        </div>
        <div className="bg-white px-5 py-4">
          <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel">
            Finish
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-ink">{build.finish}</dd>
        </div>
      </dl>

      {build.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 px-5 pb-5 pt-4">
          {build.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-soft px-2.5 py-1 text-[0.7rem] font-medium text-steel"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
