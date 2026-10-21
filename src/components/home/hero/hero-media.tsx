"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaAsset } from "@/content/types";

function HeroMediaFallback() {
  return (
    <div
      data-hero-media-fallback
      className="fh-industrial-grid-light absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -right-[8%] top-[12%] aspect-square w-[58vw] rounded-full border border-ink/10" />
      <div className="absolute -right-[2%] top-[20%] aspect-square w-[43vw] rounded-full border border-ink/10" />
      <div className="absolute right-[7%] top-[30%] aspect-square w-[25vw] rounded-full border border-forge/35" />
      <div className="absolute bottom-[12%] right-[4%] h-px w-[48%] bg-ink/15" />
      <div className="absolute bottom-[18%] right-[12%] h-px w-[34%] bg-forge/50" />
    </div>
  );
}

/** Hero media with a complete, same-size fallback when the approved asset fails. */
export function HeroMedia({ media }: { media: MediaAsset }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="absolute inset-0 -z-10" data-parallax-media data-hero-media>
      {failed ? (
        <HeroMediaFallback />
      ) : (
        <>
          <Image
            src={media.src}
            alt={media.alt}
            fill
            preload
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover object-center opacity-65"
            onError={() => setFailed(true)}
          />
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/94 to-background/45" />
          <div className="absolute inset-0 bg-linear-to-t from-background/65 via-transparent to-background/30" />
        </>
      )}
    </div>
  );
}
