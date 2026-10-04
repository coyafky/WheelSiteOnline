"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { HeroSlide } from "@/content/types";

/**
 * Hero background: photographic slides under a three-layer dark wash.
 *
 * Per the hero PageSpec §7 the photo is never shown raw — a global dark
 * overlay, a left-side reading gradient and a bottom fade sit on top. The left
 * gradient is what makes the headline legible no matter which photo is up, so
 * it is deliberately strongest in the first third.
 *
 * Rotation is a crossfade with a very slow scale (Ken Burns). No arrows, no
 * dots, no horizontal slide (spec §8) — the background should feel like it is
 * happening, not like a carousel component.
 *
 * ⚠️ `prefers-reduced-motion` freezes on the first slide (spec AC-10).
 */
export function HeroBackground({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  /**
   * Motion preference via useSyncExternalStore rather than an effect: it reads
   * the media query during render (server snapshot = motion allowed) and
   * subscribes without a synchronous setState inside an effect, which the
   * react-hooks lint rule correctly rejects.
   */
  const motionOk = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true, // SSR: assume motion allowed; the client corrects on hydration
  );

  useEffect(() => {
    if (!motionOk || slides.length <= 1) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      7000,
    );
    return () => window.clearInterval(id);
  }, [motionOk, slides.length]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-hero" aria-hidden="true">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- the hero
              image is decorative art with no intrinsic size contract; using
              next/image here would add a layout wrapper we do not want inside
              an absolutely-positioned stack. */}
          <img
            src={slide.image}
            alt=""
            // First slide is the LCP element (spec §28 / AC-09).
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            // Positioned so the car sits to the RIGHT of the product cards, not behind
        // them: at `70%` the car body landed exactly under the lower-right cards
        // and fought them for attention. Pushing the focal point right keeps the
        // vehicle visible while leaving the card zone clean.
        className={`size-full object-cover object-[88%_center] ${
              motionOk ? "fh-kenburns" : ""
            }`}
          />
        </div>
      ))}

      {/* Layer 1 — global dark wash */}
      <div className="absolute inset-0 bg-hero/55" />

      {/* Layer 2 — left reading gradient (strongest in the first third) */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,4,8,0.92)_0%,rgba(2,4,8,0.72)_37%,rgba(2,4,8,0.28)_68%,rgba(2,4,8,0.40)_100%)]" />

      {/* Layer 3 — bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(0deg,rgba(2,4,8,0.80)_0%,transparent_100%)]" />
    </div>
  );
}
