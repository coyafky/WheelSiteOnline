import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PartGroup } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A grid of part-group cards — "the kinds of part we can take on".
 *
 * Shared by `/products/ev-components` §③ (three groups: motor / controller /
 * battery) and `/products/custom-aluminum` §⑥ (two groups: drivetrain /
 * chassis). The column count is derived from `groups.length` rather than
 * hard-coded, so a two-group caller does not leave a hole in a three-column
 * grid.
 *
 * 🔴 THE BOUNDARY SENTENCE IS NOT OPTIONAL.
 * `boundaryNote` is a required prop with no default. Without it a reader
 * reasonably concludes we sell these as standard parts — which is exactly the
 * misunderstanding these pages exist to prevent. Callers must supply the
 * sentence that fits their page (part types assessed on a drawing vs. typical
 * parts assessed per drawing).
 *
 * Part names are deliberately NOT links: there is no per-part page, and a
 * link that 404s is worse than plain text.
 */
export function PartGroupCards({
  groups,
  boundaryNote,
  genericNote,
  className,
}: {
  groups: PartGroup[];
  /** Required. Rendered under the grid; the component forces the disclosure. */
  boundaryNote: string;
  /** Optional trailing note — used for the two shared generic parts. */
  genericNote?: { text: string; href: string; linkLabel: string };
  className?: string;
}) {
  // Two groups get two columns, three get three. Never invent an empty cell.
  const columnClass =
    groups.length >= 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-2";

  return (
    <div className={cn(className)}>
      <div
        data-reveal-group
        className={cn(
          "grid grid-cols-1 items-stretch gap-6 lg:gap-7",
          columnClass,
        )}
      >
        {groups.map((group) => (
          <article
            key={group.slug}
            className="flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge lg:p-8"
          >
            <h3 className="font-display text-[1.34rem] font-800 uppercase leading-tight tracking-[0.01em] text-ink">
              {group.name}
            </h3>
            <p className="mt-1.5 font-display text-[0.7rem] font-700 uppercase tracking-[0.14em] text-steel">
              {group.nameEn}
            </p>

            <p className="mt-5 rounded-lg border border-border bg-soft px-4 py-3 text-[0.86rem] leading-relaxed text-ink/80">
              {group.difficulty}
            </p>

            <ul className="mt-6 grid flex-1 content-start gap-px overflow-hidden rounded-lg bg-border">
              {group.parts.map((part) => (
                <li
                  key={part.name}
                  className="flex items-baseline justify-between gap-4 bg-white py-3"
                >
                  <span className="text-[0.94rem] leading-snug text-ink">
                    {part.name}
                  </span>
                  <span className="text-right font-display text-[0.68rem] font-600 uppercase tracking-[0.1em] text-steel">
                    {part.nameEn}
                    {part.process ? (
                      <span className="ml-2 text-forge">{part.process}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-4">
        <p className="max-w-[760px] text-sm leading-relaxed text-steel">
          {boundaryNote}
        </p>

        {genericNote ? (
          <p className="max-w-[760px] text-sm leading-relaxed text-steel">
            {genericNote.text}{" "}
            <Link
              href={genericNote.href}
              className="inline-flex items-center gap-1.5 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
            >
              {genericNote.linkLabel}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
