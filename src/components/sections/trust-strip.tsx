import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageContent } from "@/content/types";

export function TrustStrip({
  capabilities,
}: {
  capabilities: HomepageContent["capabilities"];
}) {
  return (
    <section
      aria-labelledby="capabilities-title"
      data-reveal
      className="border-b border-border bg-soft py-20 lg:py-28"
    >
      <div className="container-fh">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">{capabilities.eyebrow}</p>
            <h2
              id="capabilities-title"
              className="mt-4 max-w-[800px] font-display text-[clamp(2.2rem,4.8vw,3.8rem)] font-800 uppercase leading-[0.95] tracking-[-0.02em] text-ink"
            >
              {capabilities.heading}
            </h2>
          </div>
          <Link href={capabilities.action.href} className="btn-pill-outline text-ink">
            {capabilities.action.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div
          data-reveal-group
          className="mt-12 grid border-l border-t border-border sm:grid-cols-2 lg:mt-14 lg:grid-cols-3"
        >
          {capabilities.items.map((item) => (
            <article
              key={item.id}
              data-evidence-status={item.evidenceStatus}
              className="group relative min-h-[250px] border-b border-r border-border bg-white px-6 py-7 transition-colors hover:bg-forge-soft/45 lg:px-8 lg:py-9"
            >
              <div className="flex items-start justify-between gap-5">
                <span className="font-display text-sm font-800 tracking-[0.14em] text-forge">
                  {item.id}
                </span>
                <span className="max-w-[190px] text-right font-display text-[0.66rem] font-600 uppercase tracking-[0.1em] text-steel">
                  {item.appliesTo.join(" · ")}
                </span>
              </div>
              <h3 className="mt-8 font-display text-[1.42rem] font-800 uppercase leading-[1] tracking-[0.01em] text-ink">
                {item.title}
              </h3>
              <p className="mt-4 max-w-[330px] text-sm leading-relaxed text-steel">
                {item.body}
              </p>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-forge transition-transform duration-300 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
