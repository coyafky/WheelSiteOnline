import { Check, CircleHelp, Minus } from "lucide-react";
import type { BoundaryRow } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The three-state scope table: what we make, what we do not, and what needs
 * assessing.
 *
 * This section is the inverse of every other capability section on the site —
 * instead of listing what we can do, it draws a line and explicitly rules
 * things out. The commercial reason is in the page copy: the expensive
 * accident in custom work is finding out at the end of an evaluation that the
 * part cannot be made. Ruling work out early costs both sides less.
 *
 * 🔴 WHAT THIS COMPONENT REFUSES TO DO
 * The "not made" column is empty because the business has not confirmed which
 * categories it declines. `excludedConfirmed: false` therefore renders that
 * column as an explicit reserved slot with the disclosure sentence attached —
 * it does not disappear, and it does not get filled with a plausible guess.
 * An omitted column reads as "we do everything", which is the precise
 * impression the page exists to avoid. Pass `excludedConfirmed: true` only
 * once real rows exist.
 */
export function BoundaryTable({
  rows,
  excludedConfirmed,
  excludedNote,
  closingLine,
  className,
}: {
  rows: BoundaryRow[];
  /** Page-level switch. While false the excluded column stays a reserved slot. */
  excludedConfirmed: boolean;
  /** Required while `excludedConfirmed` is false. */
  excludedNote?: string;
  /** Resulting sentence — the engineering wording, used verbatim. */
  closingLine: string;
  className?: string;
}) {
  const included = rows.filter((row) => row.state === "included");
  const excluded = rows.filter((row) => row.state === "excluded");
  const assess = rows.filter((row) => row.state === "assess");

  return (
    <div className={cn(className)}>
      <div
        data-reveal-group
        className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-7"
      >
        <BoundaryColumn
          tone="included"
          icon={<Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
          title="We make these"
          titleZh="能做"
          rows={included}
          emptyNote="Confirmed scope is being restated."
        />

        <BoundaryColumn
          tone="excluded"
          icon={<Minus className="size-3.5" strokeWidth={3} aria-hidden="true" />}
          title="We do not make these"
          titleZh="不做"
          rows={excludedConfirmed ? excluded : []}
          emptyNote={
            excludedConfirmed
              ? undefined
              : (excludedNote ??
                "This list is still being confirmed, so it is shown here empty rather than filled with a guess.")
          }
        />

        <BoundaryColumn
          tone="assess"
          icon={<CircleHelp className="size-3.5" strokeWidth={2.5} aria-hidden="true" />}
          title="Assessed on the drawing"
          titleZh="需评估"
          rows={assess}
          emptyNote="Anything outside the confirmed envelope."
        />
      </div>

      <p className="mt-8 max-w-[820px] border-l-2 border-forge/40 pl-5 text-[1.02rem] leading-relaxed text-ink/80">
        {closingLine}
      </p>
    </div>
  );
}

function BoundaryColumn({
  tone,
  icon,
  title,
  titleZh,
  rows,
  emptyNote,
}: {
  tone: "included" | "excluded" | "assess";
  icon: React.ReactNode;
  title: string;
  titleZh: string;
  rows: BoundaryRow[];
  emptyNote?: string;
}) {
  const styles: Record<typeof tone, { card: string; chip: string }> = {
    included: {
      card: "border-border bg-white",
      chip: "bg-forge/12 text-forge",
    },
    excluded: {
      card: "border-border bg-soft",
      chip: "border border-border bg-white text-steel",
    },
    assess: {
      card: "border-border bg-white",
      chip: "border border-forge/35 bg-forge-soft text-forge-deep",
    },
  } as const;

  const style = styles[tone];

  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col rounded-xl border p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge lg:p-8",
        style.card,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
            style.chip,
          )}
        >
          {icon}
        </span>
        <h3 className="font-display text-[1.16rem] font-800 uppercase leading-tight tracking-[0.01em] text-ink">
          {title}
        </h3>
        <span className="font-display text-[0.68rem] font-700 uppercase tracking-[0.14em] text-steel">
          {titleZh}
        </span>
      </div>

      <ul className="mt-6 grid flex-1 content-start gap-5">
        {rows.map((row) => (
          <li key={row.label}>
            <p className="text-[0.96rem] leading-snug text-ink">
              {row.label}
              {!row.confirmed ? (
                <span className="ml-2 align-middle font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                  ⚠️ pending
                </span>
              ) : null}
            </p>
            {row.note ? (
              <p className="mt-1.5 text-[0.84rem] leading-relaxed text-steel">
                {row.note}
              </p>
            ) : null}
          </li>
        ))}

        {rows.length === 0 && emptyNote ? (
          <li className="rounded-lg border border-dashed border-border bg-white/70 px-4 py-3 text-[0.84rem] leading-relaxed text-steel">
            <span className="block font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
              ⚠️ Reserved — to be confirmed
            </span>
            <span className="mt-1.5 block">{emptyNote}</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
