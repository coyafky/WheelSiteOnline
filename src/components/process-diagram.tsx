import { Lock } from "lucide-react";
import type { FlowStep } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A development flow rendered as a numbered, connected card sequence.
 *
 * The page specs propose a Mermaid fence for this section. The project has no
 * chart dependency and DESIGN.md §5 keeps it that way, so the flow is rendered
 * as semantic markup instead: an ordered list of cards with a drawn connector.
 * That keeps the diagram in the DOM as text — readable by assistive tech and
 * extractable by anything reading the page — rather than as an opaque
 * rendered graph.
 *
 * `stages` drives everything. The step count is never assumed: the custom
 * aluminium flow has eight stages, and a shorter or longer list lays out
 * without change.
 *
 * NDA note: on the aluminium page, confidentiality belongs beside the DFM
 * step, because the first thing a customer worries about is sending drawings
 * to a supplier they have not met. `ndaNote` renders as a pinned aside inside
 * the sequence rather than as a footnote nobody reaches.
 */
export function ProcessDiagram({
  stages,
  ndaNote,
  crossLink,
  anchorId,
  className,
}: {
  stages: FlowStep[];
  /** Rendered as a pinned aside at the start of the sequence. */
  ndaNote?: string;
  /** Optional node after the sequence — usually a `<CrossLink>`. */
  crossLink?: React.ReactNode;
  /** Section anchor, kept stable for cross-page links. */
  anchorId?: string;
  className?: string;
}) {
  return (
    <div id={anchorId} className={cn("scroll-mt-[120px]", className)}>
      {ndaNote ? (
        <p className="mb-8 flex max-w-[760px] items-start gap-3 rounded-xl border border-forge/30 bg-forge-soft px-5 py-4 text-sm leading-relaxed text-ink/80">
          <Lock
            className="mt-0.5 size-4 shrink-0 text-forge-deep"
            aria-hidden="true"
          />
          <span>
            <span className="font-display text-[0.68rem] font-700 uppercase tracking-[0.16em] text-forge-deep">
              Confidentiality —{" "}
            </span>
            {ndaNote}
          </span>
        </p>
      ) : null}

      <ol data-reveal-group className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <li
            key={stage.step}
            className="flex flex-col bg-white p-7 transition-colors hover:bg-forge-soft"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                {stage.step}
              </span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-border"
              />
            </div>
            <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
              {stage.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
              {stage.body}
            </p>
          </li>
        ))}
      </ol>

      {crossLink ? <div className="mt-8">{crossLink}</div> : null}
    </div>
  );
}
