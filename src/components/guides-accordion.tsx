"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Clock, Filter } from "lucide-react";
import type { GuideEntry } from "@/content/types";
import type { MediaAsset } from "@/content/types";
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
  media,
}: {
  guides: GuideEntry[];
  media: Record<string, MediaAsset>;
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
        className="flex flex-col gap-6 border-y border-border bg-white py-5 lg:flex-row lg:items-center lg:justify-between"
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
        className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border lg:grid-cols-2"
      >
        {visible.map((guide, index) => {
          const open = openSlug === guide.slug;
          const detailId = `guide-detail-${guide.slug}`;
          const visual = media[guide.slug];

          return (
            <li key={guide.slug} className={cn("h-fit bg-white", index === 0 && "lg:col-span-2")}>
              <article
                className={cn(
                  "flex flex-col overflow-hidden bg-white transition-[box-shadow] duration-200 ease-out",
                  index === 0 && "lg:grid lg:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)]",
                  open && "shadow-[inset_4px_0_0_var(--fh-forge)]",
                )}
              >
                {visual?.hasRender ? (
                  <div className={cn("relative min-h-[210px] overflow-hidden bg-hero", index === 0 && "lg:min-h-[420px]")}>
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      sizes={index === 0 ? "(min-width: 1024px) 44vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
                      className="object-cover brightness-[0.78] transition duration-500 hover:scale-[1.025] hover:brightness-90"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-hero/75 via-transparent to-transparent" aria-hidden="true" />
                    <p className="absolute inset-x-5 bottom-4 text-xs leading-5 text-white/75">
                      {visual.caption}
                    </p>
                  </div>
                ) : null}
                <div className={cn("flex flex-1 flex-col p-7 lg:p-9", index === 0 && "lg:justify-center lg:p-12")}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[0.68rem] font-semibold tracking-[0.14em] text-steel">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-forge-soft px-2.5 py-1 font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                      {guide.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-steel">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {guide.readingTime}
                    </span>
                  </div>

                  <h3 className={cn("mt-5 font-display text-[1.45rem] font-700 uppercase leading-[1.02] tracking-[0.01em] text-ink", index === 0 && "text-[clamp(2rem,4vw,3.4rem)]")}>
                    {guide.title}
                  </h3>

                  <p className={cn("mt-4 text-sm leading-relaxed text-steel", index === 0 && "max-w-[640px] text-base")}>
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

                  <p className="mt-5 text-[0.7rem] uppercase tracking-[0.1em] text-steel">
                    {copy.inlineNote}
                  </p>
                </div>

                {/* Expanded detail ----------------------------------------- */}
                <div
                  id={detailId}
                  hidden={!open}
                  className={cn("border-t border-border bg-soft px-7 py-7", index === 0 && "lg:col-span-2")}
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
        {visible.length > 0 && visible.length % 2 === 0 ? (
          <li
            aria-hidden="true"
            className="fh-industrial-grid hidden min-h-[260px] bg-hero lg:block"
          />
        ) : null}
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
        "inline-flex min-h-[42px] items-center border px-5",
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
