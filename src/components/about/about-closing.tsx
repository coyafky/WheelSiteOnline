import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { AboutContent } from "@/content/types";

export function AboutClosing({ closing }: { closing: AboutContent["closing"] }) {
  return (
    <section className="bg-forge-soft py-20 sm:py-24 lg:py-28" aria-labelledby="about-closing-title">
      <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-20">
        <div data-reveal>
          <p className="eyebrow">{closing.eyebrow}</p>
          <h2
            id="about-closing-title"
            className="mt-5 font-display text-4xl font-700 uppercase leading-[0.95] tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl"
          >
            {closing.heading}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-steel">{closing.body}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={closing.primaryAction.href} className="btn-pill-solid">
              {closing.primaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={closing.secondaryAction.href} className="btn-pill-outline text-ink">
              {closing.secondaryAction.label}
            </Link>
          </div>
        </div>

        <dl className="border-l border-t border-ink/14" data-reveal-group>
          {closing.facts.map((fact) => (
            <div key={fact.label} className="grid gap-2 border-b border-r border-ink/14 px-5 py-5 sm:grid-cols-[150px_1fr] sm:gap-8 sm:px-7">
              <dt className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-forge-deep">{fact.label}</dt>
              <dd className="text-sm font-medium leading-6 text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
