import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import type { HomepageContent } from "@/content/types";

export function HomeHero({ hero }: { hero: HomepageContent["hero"] }) {
  const showMedia = hero.media.hasRender && hero.media.approvalStatus === "approved";

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-hero"
    >
      <div className="absolute inset-0 -z-20 bg-hero" aria-hidden="true" />

      {showMedia ? (
        <div className="absolute inset-0 -z-10" data-parallax-media>
          <Image
            src={hero.media.src}
            alt={hero.media.alt}
            fill
            preload
            sizes="100vw"
            className="object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-linear-to-r from-hero via-hero/85 to-hero/35" />
          <div className="absolute inset-0 bg-linear-to-t from-hero via-transparent to-hero/25" />
        </div>
      ) : (
        <div
          className="fh-industrial-grid absolute inset-0 -z-10 overflow-hidden"
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
            className="mt-5 max-w-[760px] font-display text-[clamp(3rem,6.5vw,5.8rem)] font-800 uppercase leading-[0.9] tracking-[-0.025em] text-white"
          >
            {hero.heading}
          </h1>

          <p className="mt-7 max-w-[690px] text-[clamp(1rem,1.5vw,1.16rem)] leading-relaxed text-white/78">
            {hero.lead}
          </p>

          <div className="mt-7 flex max-w-[680px] gap-4 border-l-2 border-forge pl-5">
            <p className="text-sm leading-relaxed text-white/58">{hero.disclosure}</p>
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={hero.primaryAction.href} className="btn-pill-solid">
              {hero.primaryAction.label}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={hero.secondaryAction.href}
              className="btn-pill-outline !text-white"
            >
              {hero.secondaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {showMedia ? (
          <p className="absolute bottom-7 right-6 hidden max-w-[320px] text-right font-display text-xs font-600 uppercase tracking-[0.12em] text-white/55 lg:block">
            {hero.mediaLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}
