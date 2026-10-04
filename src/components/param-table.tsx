import { Check, CircleHelp } from "lucide-react";
import type { ParamRow } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A performance-parameter table with its provenance attached.
 *
 * Figures here are the kind a buyer will repeat — they end up in a tender
 * document or a customer conversation. So every row carries whether a test
 * report stands behind it, and `reportNote` states the standing condition
 * under which the numbers are published.
 *
 * What this component will not do:
 *   - print a number without the accompanying provenance line
 *   - claim a certification. `standardNote` is worded as a *reference*
 *     standard, because citing a standard and holding a certificate are
 *     different claims and only one of them is being made here.
 *   - derive a comparative conclusion ("better than the market") from a raw
 *     value. The table states values; the reader draws conclusions.
 *
 * Figures use the display face at full size — DESIGN.md §3.4 records numbers
 * as the visual anchor of a spec section, and the condensed face is what makes
 * them scan as data rather than as prose.
 */
export function ParamTable({
  rows,
  standardNote,
  highlightNote,
  reportNote,
  anchorId,
  className,
}: {
  rows: ParamRow[];
  /** The standard cited as reference, plus any test-condition qualifier. */
  standardNote?: { label: string; value: string; note: string };
  /** The one contrast worth pulling out of the table (e.g. 3 mm vs 8 mm). */
  highlightNote?: { title: string; body: string };
  /** Required standing condition under which the figures are published. */
  reportNote: string;
  anchorId?: string;
  className?: string;
}) {
  return (
    <div id={anchorId} className={cn("scroll-mt-[120px]", className)}>
      <dl
        data-reveal-group
        className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
      >
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col bg-white p-7">
            <dt className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel">
              {row.label}
            </dt>
            {row.labelEn ? (
              <span className="mt-1 font-display text-[0.62rem] font-600 uppercase tracking-[0.12em] text-steel/70">
                {row.labelEn}
              </span>
            ) : null}
            <dd className="mt-4 flex-1">
              <span className="block font-display text-[1.5rem] font-800 uppercase leading-none tracking-[0.01em] text-forge-deep">
                {row.value}
              </span>
              {row.reportAvailable ? (
                <span className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-steel">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  Test report on file
                </span>
              ) : (
                <span className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                  <CircleHelp className="size-3" strokeWidth={2.5} aria-hidden="true" />
                  Report to be confirmed
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {standardNote ? (
        <div className="mt-6 rounded-xl border border-border bg-white p-6">
          <p className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-steel">
            {standardNote.label}
          </p>
          <p className="mt-2 font-display text-[1.05rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
            {standardNote.value}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-steel">
            {standardNote.note}
          </p>
        </div>
      ) : null}

      {highlightNote ? (
        <div className="mt-6 rounded-xl border border-forge/30 bg-forge-soft p-6">
          <p className="font-display text-[1.05rem] font-800 uppercase leading-tight tracking-[0.01em] text-ink">
            {highlightNote.title}
          </p>
          <p className="mt-2 max-w-[760px] text-sm leading-relaxed text-ink/80">
            {highlightNote.body}
          </p>
        </div>
      ) : null}

      <p className="mt-6 text-sm leading-relaxed text-steel">{reportNote}</p>
    </div>
  );
}
