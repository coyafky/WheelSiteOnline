import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RouteStep } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The "where to go next" band that closes a long page.
 *
 * DESIGN.md §2.2: a long page does not jump from a fact section straight into
 * a conversion band. It hands over deliberately — a short routing section, then
 * the CTA. This component is that handover.
 *
 * The name is fixed (`RouteBlock`) across the site; do not alias it. The
 * `RouteStep` shape already carries everything needed (`step`, `title`,
 * `body`, `href`, `linkLabel`), so no new contract is introduced here.
 */
export function RouteBlock({
  routes,
  eyebrow,
  heading,
  columns,
  className,
}: {
  routes: RouteStep[];
  /** Defaults to "Keep exploring" — one of the controlled eyebrow values. */
  eyebrow?: string;
  heading: string;
  /** Defaults to the number of routes, capped at three. */
  columns?: 2 | 3;
  className?: string;
}) {
  const resolved = columns ?? (routes.length >= 3 ? 3 : 2);
  const lgColumnClass: Record<number, string> = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
  };

  return (
    <div className={cn(className)}>
      <div className="max-w-[640px]">
        <p className="eyebrow">{eyebrow ?? "Keep exploring"}</p>
        <h2 className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink">
          {heading}
        </h2>
      </div>

      <div
        data-reveal-group
        className={cn(
          "mt-10 grid grid-cols-1 gap-6",
          routes.length > 1 && "sm:grid-cols-2",
          lgColumnClass[resolved],
        )}
      >
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
          >
            <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
              {route.step}
            </span>
            <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
              {route.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
              {route.body}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
              {route.linkLabel}
              <ArrowRight
                className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
