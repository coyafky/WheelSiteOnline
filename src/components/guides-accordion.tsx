"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Clock, Filter } from "lucide-react";
import type { GuideEntry } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Resources hub guide list.
 *
 * Each card offers BOTH a short in-place preview (the accordion) and a real
 * link to the full article at `/insights/[slug]`. The link is the primary
 * action; the accordion is a summary for someone scanning the hub.
 *
 * Category filtering is client-side; the list is small and static, so a round
 * trip would buy nothing.
 */
export function GuidesAccordion({
  guides,
  copy,
}: {
  guides: GuideEntry[];
  copy: {
    expandLabel: string;
    collapseLabel: string;
    inlineNote: string;
    readLabel: string;
  };
}) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const guide of guides) {
      if (!seen.includes(guide.category)) seen.push(guide.category);
    }
    return seen;
  }, [guides]);

  const [category, setCategory] = useState<string>("all");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      category === "all"
        ? guides
        : guides.filter((guide) => guide.category === category),
    [guides, category],
  );

  const toggle = (slug: string) =>
    setOpenSlug((current) => (current === slug ? null : slug));

  return (
    <div>
      {/* Category filter --------------------------------------------------- */}
      <div
        role="group"
        aria-label="Filter guides by category"
        className="flex flex-col gap-6 rounded-xl border border-border bg-soft p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7"
      >
        <div className="flex flex-wrap gap-2.5">
          <FilterPill active={category === "all"} onClick={() => setCategory("all")}>
            All guides
          </FilterPill>
          {categories.map((item) => (
            <FilterPill
              key={item}
              active={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </FilterPill>
          ))}
        </div>

        <p className="flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-steel">
          <Filter className="size-3.5" aria-hidden="true" />
          {guides.length} reference guides
        </p>
      </div>

      {/* Guide cards ------------------------------------------------------- */}
      <ul
        aria-live="polite"
        className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7"
      >
        {visible.map((guide) => {
          const open = openSlug === guide.slug;
          const detailId = `guide-detail-${guide.slug}`;

          return (
            <li key={guide.slug} className="h-fit">
              <article
                className={cn(
                  "flex flex-col overflow-hidden rounded-xl border bg-white transition-[border-color] duration-200 ease-out",
                  open ? "border-forge" : "border-border hover:border-forge/60",
                )}
              >
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-forge-soft px-2.5 py-1 font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                      {guide.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-steel">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {guide.readingTime}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                    {guide.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-steel">
                    {guide.summary}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link
                      href={`/insights/${guide.slug}`}
                      className="inline-flex min-h-[42px] items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
                    >
                      {copy.readLabel}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggle(guide.slug)}
                      aria-expanded={open}
                      aria-controls={detailId}
                      className="inline-flex min-h-[42px] items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-steel transition-colors hover:text-ink"
                    >
                      {open ? copy.collapseLabel : copy.expandLabel}
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200 ease-out",
                          open && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <p className="mt-5 text-[0.7rem] uppercase tracking-[0.1em] text-steel/70">
                    {copy.inlineNote}
                  </p>
                </div>

                {/* Expanded detail ----------------------------------------- */}
                <div
                  id={detailId}
                  hidden={!open}
                  className="border-t border-border bg-soft px-7 py-7"
                >
                  <div className="grid gap-7">
                    {guide.detail.map((block) => (
                      <div key={block.heading}>
                        <h4 className="font-display text-[1rem] font-700 uppercase leading-snug tracking-[0.02em] text-ink">
                          {block.heading}
                        </h4>
                        {block.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="mt-3 text-sm leading-relaxed text-steel"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A single category chip. */
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
