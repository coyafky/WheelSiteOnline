import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A cross-link between two pages that would otherwise cover the same ground.
 *
 * Used where a topic is deliberately split across two routes and each page
 * keeps only the half it owns — e.g. `/custom-development` owns the commercial
 * "how we cooperate" story while `/products/custom-aluminum` owns the
 * engineering flow. Each page ends its section with one of these pointing at
 * the other half, so the visitor always knows which side of the line the
 * detail sits on.
 *
 * This is not the same as `ResourceLink` (a same-page routing card): the
 * destination here is a specific anchor on a specific sibling page, and the
 * copy's job is to justify the hop, not just offer it.
 *
 * Styling is deliberately quieter than a pathway card — it is an aside, and
 * must not compete with the section it closes.
 */
export function CrossLink({
  eyebrow,
  title,
  body,
  href,
  linkLabel,
  className,
}: {
  eyebrow: string;
  title: string;
  body: string;
  /** May include an anchor, e.g. "/products/custom-aluminum#development-flow". */
  href: string;
  linkLabel: string;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge lg:p-8",
        className,
      )}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-3 font-display text-[1.24rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
        {title}
      </h3>
      <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-steel">
        {body}
      </p>
      <Link
        href={href}
        className="group mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge transition-colors hover:text-forge-deep"
      >
        {linkLabel}
        <ArrowRight
          className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </aside>
  );
}
