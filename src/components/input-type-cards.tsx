import { cn } from "@/lib/utils";

/**
 * The four ways a custom job can start: drawing, 3D data, physical sample,
 * or a reference part to reverse-engineer.
 *
 * The value of this section is not the headline ("we accept drawings" means
 * nothing) but the second line of each card: what we actually need from the
 * customer before the job can be quoted. A card that lists no requirements is
 * a slogan; a card that names three-view drawings, critical dimensions and
 * tolerances is an instruction.
 *
 * The reverse-engineering card is highlighted because it catches a group of
 * buyers who assume they are not eligible — many have a competitor's part on
 * the bench and no drawing for it. Saying so explicitly is the point.
 *
 * The highlighted card claims capability only, never equipment: we can reverse
 * a part; we do not publish a scanner make or a stated accuracy, because
 * neither has been confirmed.
 */
export type InputType = {
  index: string;
  name: string;
  nameEn: string;
  requirements: string[];
  highlight?: boolean;
};

export function InputTypeCards({
  inputs,
  note,
  anchorId,
  className,
}: {
  inputs: InputType[];
  /** Closing sentence for the section. Required — it carries the fourth case. */
  note: string;
  anchorId?: string;
  className?: string;
}) {
  const columnClass =
    inputs.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-2";

  return (
    <div id={anchorId} className={cn("scroll-mt-[120px]", className)}>
      <div
        data-reveal-group
        className={cn("grid grid-cols-1 items-stretch gap-6", columnClass)}
      >
        {inputs.map((input) => (
          <article
            key={input.index}
            className={cn(
              "flex flex-col rounded-xl border p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5",
              input.highlight
                ? "border-forge/35 bg-forge-soft hover:border-forge"
                : "border-border bg-white hover:border-forge",
            )}
          >
            <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
              {input.index}
            </span>
            <h3 className="mt-4 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
              {input.name}
            </h3>
            <p className="mt-1 font-display text-[0.68rem] font-600 uppercase tracking-[0.12em] text-steel">
              {input.nameEn}
            </p>

            <p className="mt-5 font-display text-[0.62rem] font-700 uppercase tracking-[0.14em] text-forge">
              What we need from you
            </p>
            <ul className="mt-3 grid flex-1 content-start gap-2">
              {input.requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-ink/80"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-forge"
                  />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>

            {input.highlight ? (
              <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-forge/35 bg-white px-2.5 py-1 font-display text-[0.6rem] font-700 uppercase tracking-[0.14em] text-forge-deep">
                No drawing needed
              </span>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-7 max-w-[760px] text-sm leading-relaxed text-steel">
        {note}
      </p>
    </div>
  );
}
