import type { MechanismStep } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A four-card explanation of a physical mechanism, in the order it happens.
 *
 * Written for the self-sealing tyre page, where the section is the strongest
 * content on the page — it comes entirely from our own brochure and does not
 * depend on any partner attribution. The order is the mechanism order
 * (where the layer sits → object goes in → object comes out → the channel
 * closes) and must not be rearranged: reordering it would describe a
 * different physical process.
 *
 * `responseValue` is deliberately optional. A response time is a claim that
 * has to be attributed before it can be published, so while it is undefined
 * the card states the behaviour in words and prints no figure. A confidently
 * wrong number is worse than a sentence with no number in it.
 */
export function MechanismSteps({
  steps,
  eyebrow,
  heading,
  lede,
  mediaNotice,
  anchorId,
  className,
}: {
  steps: MechanismStep[];
  eyebrow?: string;
  heading: string;
  lede?: string;
  /** Standing statement about schematics vs. photographs, when applicable. */
  mediaNotice?: string;
  anchorId?: string;
  className?: string;
}) {
  return (
    <div id={anchorId} className={cn("scroll-mt-[120px]", className)}>
      <div className="max-w-[720px]">
        <p className="eyebrow">{eyebrow ?? "Process"}</p>
        <h2 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink">
          {heading}
        </h2>
        {lede ? (
          <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">{lede}</p>
        ) : null}
      </div>

      <ol
        data-reveal-group
        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map((step) => (
          <li
            key={step.step}
            className="flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
          >
            <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
              {step.step}
            </span>
            <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
              {step.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
              {step.body}
            </p>

            {step.responseValue ? (
              <p className="mt-5 border-t border-border pt-4">
                <span className="block font-display text-[1.4rem] font-800 uppercase leading-none tracking-[0.01em] text-forge-deep">
                  {step.responseValue}
                </span>
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      {mediaNotice ? (
        <p className="mt-6 max-w-[760px] text-sm leading-relaxed text-steel">
          {mediaNotice}
        </p>
      ) : null}
    </div>
  );
}
