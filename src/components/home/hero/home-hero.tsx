import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroBackground } from "./hero-background";
import { heroCopy, heroSlides } from "@/content/homepage-hero";

/**
 * Homepage hero — the company-level entry view.
 *
 * Layout: photography behind, brand positioning on the left, four product
 * entries on the right (hero PageSpec §2). The background carries the mood; the
 * left column carries who we are; the right column routes visitors.
 *
 * ⚠️ Height. The section is `min-h-svh` and the site header floats OVER it
 * (see site-header.tsx), so header + hero together fill exactly one viewport
 * — previously the header sat above a separate 100svh hero, pushing the first
 * fold past a full screen (spec §5, AC-02).
 */
export function HomeHero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-hero"
    >
      <HeroBackground slides={heroSlides} />

      {/*
        Vertical rhythm (hero PageSpec §21): the composition should sit slightly
        BELOW the optical centre, so the block gets more bottom padding than top
        and the section uses items-center against that asymmetry. The top inset
        clears the fixed header — 96px on mobile (74px bar) and 152px from lg
        (86px bar), both leaving breathing room rather than butting against it.
      */}
      {/*
        ⚠️ No `w-full` here: it emits `width:100%`, which outranks the
        container's own `width: min(calc(100% - 40px), 1180px)` and silently
        collapses the gutter — the left column then jams against the viewport
        edge and the cards bleed past the right one.
      */}
      <div className="container-fh pb-20 pt-[96px] lg:pb-28 lg:pt-[152px]">
        {/*
          Single column. The hero answers exactly one question — "who are we?"
          (DESIGN.md §0.5.1). The four product cards that used to sit on the
          right now live in their own section (`ProductLines`), because a
          viewport carries one primary action and the cards were competing with
          the hero's CTA for the same click.
        */}
        <div className="max-w-[760px]">
          {/* ── Left: brand positioning ───────────────────────────────── */}
          <div className="max-w-[650px]">
            <p className="eyebrow !text-forge">{heroCopy.eyebrow}</p>

            <h1
              id="hero-title"
              className="mt-5 font-display text-[clamp(2.7rem,6.2vw,5.4rem)] font-800 uppercase leading-[0.92] tracking-[-0.02em] text-white"
            >
              {heroCopy.headingLines.map((line, i) => (
                <span key={line} className="block">
                  {i === 1 ? <span className="text-forge">{line}</span> : line}
                </span>
              ))}
              <span className="mt-3 block font-display text-[clamp(1.15rem,2.4vw,1.9rem)] font-600 uppercase leading-tight tracking-[0.01em] text-white/85">
                {heroCopy.supporting}
              </span>
            </h1>

            <p className="mt-7 max-w-[600px] text-[1rem] leading-relaxed text-white/75">
              {heroCopy.description}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={heroCopy.primaryCta.href} className="btn-pill-solid">
                {heroCopy.primaryCta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={heroCopy.secondaryCta.href}
                className="btn-pill-outline !text-white"
              >
                {heroCopy.secondaryCta.label}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
