"use client";

import { useEffect } from "react";

/**
 * Drives the site-wide motion system:
 *
 *  - adds `motion-ready` so reveal styles only engage once JS is live
 *    (progressive enhancement: no JS => content is simply visible)
 *  - observes [data-reveal] and [data-reveal-group] and flips `.is-revealed`
 *  - assigns `--motion-order` stagger indices to group children
 *  - drives [data-parallax-media] offset via rAF
 *
 * Disabled entirely under `prefers-reduced-motion: reduce`.
 */
export function useSiteMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const root = document.documentElement;
    root.classList.add("motion-ready");

    // --- stagger indices -------------------------------------------------
    const groups = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-group]"),
    );
    for (const group of groups) {
      Array.from(group.children).forEach((child, index) => {
        (child as HTMLElement).style.setProperty(
          "--motion-order",
          String(Math.min(index, 8)),
        );
      });
    }

    // --- reveal observer -------------------------------------------------
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-group]"),
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      },
      // threshold 0 (not 0.01): a section taller than the viewport can never
      // reach a 1% ratio on some engines, so it would stay invisible forever.
      // A negative top margin matters for deep links — landing mid-page must
      // still reveal everything at or above the viewport.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    for (const target of targets) revealObserver.observe(target);

    // --- reveal anything already on screen, BEFORE arming the hidden state --
    // Otherwise the first paint would hide content the user is already looking
    // at, and they would watch it fade in on load — which reads as a flash, not
    // as motion.
    const revealInView = () => {
      const limit = window.scrollY + window.innerHeight;
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        if (absoluteTop < limit) target.classList.add("is-revealed");
      }
    };

    revealInView();

    // Arm the hidden state only now, with observers attached and everything
    // above the fold already revealed. Until this attribute is set, CSS hides
    // nothing at all — so a thrown error above leaves the page fully readable.
    root.setAttribute("data-motion-armed", "");

    // Second pass once layout settles (web fonts and images change heights).
    const settle = window.setTimeout(revealInView, 350);

    // Last-resort failsafe: if anything is still hidden after the user has had
    // time to scroll, show it rather than leave a hole in the page.
    const failsafe = window.setTimeout(() => {
      for (const target of targets) target.classList.add("is-revealed");
    }, 5000);

    // --- parallax --------------------------------------------------------
    const media = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax-media]"),
    );

    let frame = 0;
    const visible = new Set<Element>();

    const paint = () => {
      frame = 0;
      const amplitude =
        parseFloat(
          getComputedStyle(root).getPropertyValue("--motion-parallax-y"),
        ) || 8;
      const viewport = window.innerHeight;

      for (const el of media) {
        if (!visible.has(el)) continue;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - viewport / 2) / viewport;
        const value = Math.max(-amplitude, Math.min(amplitude, -offset * amplitude));
        el.style.setProperty("--motion-parallax-offset", `${value.toFixed(2)}px`);
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        schedule();
      },
      { rootMargin: "18% 0px", threshold: 0.01 },
    );

    for (const el of media) parallaxObserver.observe(el);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      root.classList.remove("motion-ready");
      root.removeAttribute("data-motion-armed");
      revealObserver.disconnect();
      parallaxObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearTimeout(settle);
      window.clearTimeout(failsafe);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
