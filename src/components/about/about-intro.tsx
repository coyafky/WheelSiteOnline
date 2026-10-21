import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";

import { PageHero } from "@/components/sections/page-hero";
import type { AboutContent } from "@/content/types";

/**
 * About opening band.
 *
 * ── Why this is warm-light and not the old dark band ───────────────────────
 * It used to be `bg-hero text-white` under a 55% `.fh-industrial-grid`. There
 * is no photograph here — measured `imgs=0` — so the dark surface was tone, not
 * information.
 *
 * It was also a measured accessibility failure. The generated theme scopes
 * heading ink by landmark, not by surface (`site-theme.css:11-14`,
 * `:where(h1…) { color: var(--color-text-primary) }`), so an `<h1>` that does
 * not declare its own colour on a dark surface resolves to `--fh-ink`
 * (#292621) on `--fh-hero` (#302a24): **1.06:1**. On a 390px phone the About
 * headline was dark-on-dark and effectively unreadable.
 *
 * The band now uses the shared warm-light `PageHero` — the same surface as
 * `/products`, `/capabilities`, `/products/wheels` and `/custom-development`,
 * so the company/product family opens with one identity band.
 *
 * Preserved: `<section id="top">`, the `aria-labelledby` contract, the `<h1>`
 * id, both Next `<Link>` CTAs (crawlable), and the location/company-name rail —
 * which moves into `PageHero`'s trailing slot rather than being dropped.
 */
export function AboutHero({ hero }: { hero: AboutContent["hero"] }) {
  return (
    <PageHero
      titleId="about-title"
      eyebrow={hero.eyebrow}
      heading={hero.heading}
      headingMaxWidth="920px"
    >
      <p className="w-full max-w-[720px] text-base leading-7 text-steel sm:text-lg sm:leading-8">
        {hero.lead}
      </p>

      {/* The rail used to be a bordered left column on a dark band. On the warm
          surface a top hairline carries the same "here is the legal entity"
          separation without inventing a second surface colour. */}
      <div className="w-full border-t border-border pt-6">
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-forge">
          {hero.location}
        </p>
        <p className="mt-3 font-display text-2xl font-semibold uppercase leading-tight tracking-[-0.02em] text-ink">
          {hero.companyName}
        </p>
      </div>

      <div className="flex w-full flex-wrap gap-4">
        <Link href={hero.primaryAction.href} className="btn-pill-solid">
          {hero.primaryAction.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href={hero.secondaryAction.href} className="btn-pill-outline text-ink">
          {hero.secondaryAction.label}
          <ArrowDownRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </PageHero>
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

        <div className="mt-14 border-t border-muted pt-12" data-reveal>
          <div className="max-w-3xl">
            <p className="eyebrow">{role.groupEyebrow}</p>
            <h3
              id="company-group-title"
              className="mt-5 font-display text-3xl font-700 uppercase leading-[0.98] tracking-[-0.03em] text-ink sm:text-4xl"
            >
              {role.groupHeading}
            </h3>
            <p className="mt-6 text-base leading-7 text-steel">{role.groupIntro}</p>
          </div>

          {/* 用「编号行」而非并列卡片：5 条在 2/3 列网格里会留下半宽空卡（本项目踩过） */}
          <ol className="mt-10 border-t border-muted" aria-labelledby="company-group-title">
            {role.groupStages.map((stage, index) => (
              <li
                key={stage.id}
                className="grid gap-1.5 border-b border-muted py-5 sm:grid-cols-[3rem_minmax(0,13rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6"
              >
                <p className="font-mono text-xs tabular-nums text-forge">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h4 className="text-base font-semibold tracking-[-0.01em] text-ink">{stage.title}</h4>
                <p className="text-sm leading-6 text-steel">{stage.body}</p>
              </li>
            ))}
          </ol>

          <p className="mt-6 max-w-3xl border-l-2 border-forge bg-forge-soft px-5 py-4 text-sm leading-6 text-ink/72">
            {role.groupNote}
          </p>
        </div>
      </div>
    </section>
  );
}
