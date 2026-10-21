import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import type { HomepageContent } from "@/content/types";
import { localizedPath, type Locale } from "@/lib/i18n/types";
import { HeroMedia } from "./hero-media";

export function HomeHero({ hero, locale }: { hero: HomepageContent["hero"]; locale: Locale }) {
  const showMedia = hero.media.hasRender && hero.media.approvalStatus === "approved";

  return (
    <section
      id="top"
      data-module-id="H01"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden border-b border-border bg-background"
    >
      <div className="absolute inset-0 -z-20 bg-background" aria-hidden="true" />

      {showMedia ? (
        <HeroMedia media={hero.media} />
      ) : (
        <div
          data-hero-media-fallback
          className="fh-industrial-grid-light absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
          data-parallax-media
        >
          <div className="absolute -right-[8%] top-[12%] aspect-square w-[58vw] rounded-full border border-white/10" />
          <div className="absolute -right-[2%] top-[20%] aspect-square w-[43vw] rounded-full border border-white/10" />
          <div className="absolute right-[7%] top-[30%] aspect-square w-[25vw] rounded-full border border-forge/35" />
          <div className="absolute bottom-[12%] right-[4%] h-px w-[48%] bg-white/15" />
          <div className="absolute bottom-[18%] right-[12%] h-px w-[34%] bg-forge/50" />
        </div>
      )}

      <div className="container-fh pb-18 pt-[112px] lg:pb-24 lg:pt-[148px]">
        <div className="max-w-[780px]">
          <p className="eyebrow !text-forge">{hero.eyebrow}</p>

          <h1
            id="hero-title"
          className="mt-5 max-w-[760px] font-display text-[clamp(3rem,6.5vw,5.8rem)] font-800 uppercase leading-[0.9] tracking-[-0.025em] text-ink"
          >
            {hero.heading}
          </h1>

          <p className="mt-7 max-w-[690px] text-[clamp(1rem,1.5vw,1.16rem)] leading-relaxed text-steel">
            {hero.lead}
          </p>

          <div className="mt-7 flex max-w-[680px] gap-4 border-l-2 border-forge pl-5">
            <p className="text-sm leading-relaxed text-steel">{hero.disclosure}</p>
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={localizedPath(hero.primaryAction.href, locale)} className="btn-pill-solid btn-pill-brand">
              {hero.primaryAction.label}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={localizedPath(hero.secondaryAction.href, locale)}
              className="btn-pill-outline btn-pill-brand !text-ink"
            >
              {hero.secondaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {showMedia ? (
          <p className="absolute bottom-7 right-6 hidden max-w-[320px] text-right font-display text-xs font-600 uppercase tracking-[0.12em] text-ink/70 lg:block">
            {hero.mediaLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}
