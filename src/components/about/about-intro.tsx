import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";

import type { AboutContent } from "@/content/types";

export function AboutHero({ hero }: { hero: AboutContent["hero"] }) {
  return (
    <section
      id="top"
      aria-labelledby="about-title"
      className="relative isolate overflow-hidden bg-hero text-white"
    >
      <div className="fh-industrial-grid absolute inset-0 -z-20 opacity-55" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-hero via-hero/96 to-hero/65" aria-hidden="true" />
      <div className="container-fh grid min-h-[760px] items-end gap-14 pb-18 pt-[132px] lg:grid-cols-[minmax(0,1fr)_320px] lg:pb-24 lg:pt-[168px]">
        <div data-reveal>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1
            id="about-title"
            className="mt-5 max-w-[920px] font-display text-[clamp(3.1rem,7.5vw,7rem)] font-800 uppercase leading-[0.86] tracking-[-0.035em]"
          >
            {hero.heading}
          </h1>
          <p className="mt-8 max-w-[720px] text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
            {hero.lead}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={hero.primaryAction.href} className="btn-pill-solid">
              {hero.primaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={hero.secondaryAction.href} className="btn-pill-outline text-white">
              {hero.secondaryAction.label}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="border-l border-white/18 pl-6 lg:mb-2" data-reveal>
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-forge">
            {hero.location}
          </p>
          <p className="mt-4 font-display text-2xl font-semibold uppercase leading-tight tracking-[-0.02em] text-white/88">
            {hero.companyName}
          </p>
          <div className="mt-8 h-px w-full bg-white/16" />
        </aside>
      </div>
    </section>
  );
}

export function CompanyRole({ role }: { role: AboutContent["role"] }) {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32" aria-labelledby="company-role-title">
      <div className="container-fh">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow">{role.eyebrow}</p>
            <h2
              id="company-role-title"
              className="mt-5 max-w-xl font-display text-4xl font-700 uppercase leading-[0.95] tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl"
            >
              {role.heading}
            </h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-steel sm:text-lg">
              {role.body}
            </p>
          </div>

          <div data-reveal-group>
            <div className="grid border-l border-t border-muted sm:grid-cols-2">
              {role.responsibilities.map((item) => (
                <article key={item.title} className="border-b border-r border-muted p-6 sm:p-8">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-steel">{item.body}</p>
                </article>
              ))}
            </div>
            <p className="mt-6 border-l-2 border-forge bg-forge-soft px-5 py-4 text-sm leading-6 text-ink/72">
              {role.disclosure}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
