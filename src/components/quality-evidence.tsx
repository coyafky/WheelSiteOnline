import { TriangleAlert } from "lucide-react";
import type { QualityRow } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The quality section's evidence table.
 *
 * Read by the people who decide whether a supplier is credible — procurement
 * engineers, quality managers — and they will notice two things immediately:
 * which rows carry an actual mechanism, and which standards are claimed.
 *
 * That is why the component treats an unconfirmed row as a first-class state
 * rather than something to hide. A quality section that lists control steps but
 * skips the certification question is answering the parts it likes. Here a
 * row without a confirmed answer renders with its label, an em dash where the
 * value would go, and a sentence saying it is being verified — which is
 * visibly a gap, and reads as one.
 *
 * The prohibited alternative, "in line with industry standards", is not
 * rendered by any code path: it names nothing and cannot be checked.
 *
 * `disclosure` is required, so a page cannot ship this table without stating
 * how the unconfirmed rows will be resolved.
 */
export function QualityEvidence({
  rows,
  disclosure,
  eyebrow,
  heading,
  lede,
  className,
}: {
  rows: QualityRow[];
  /** Required standing statement covering every unconfirmed row. */
  disclosure: string;
  eyebrow?: string;
  heading: string;
  lede?: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div className="max-w-[720px]">
        <p className="eyebrow">{eyebrow ?? "Reference"}</p>
        <h2 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink">
          {heading}
        </h2>
        {lede ? (
          <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">{lede}</p>
        ) : null}
      </div>

      <dl
        data-reveal-group
        className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border"
      >
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 bg-white p-7 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-8"
          >
            <dt className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-steel">
              {row.label}
            </dt>
            <dd>
              {row.confirmed ? (
                <p className="text-[1rem] leading-relaxed text-ink/85">
                  {row.value}
                </p>
              ) : (
                <p className="flex flex-wrap items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="font-display text-[1.6rem] font-800 leading-none text-forge"
                  >
                    —
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                    <TriangleAlert className="size-3" aria-hidden="true" />
                    {row.pendingNote ?? "Being verified"}
                  </span>
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 max-w-[820px] rounded-xl border border-forge/30 bg-forge-soft px-5 py-4 text-sm leading-relaxed text-ink/80">
        <span className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge-deep">
          Still to confirm —{" "}
        </span>
        {disclosure}
      </p>
    </div>
  );
}
