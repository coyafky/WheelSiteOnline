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
 *
 * ── FAIL-VISIBLE IS THE CONTRACT (DESIGN.md §1.5, globals.css) ──────────────
 * "Content is visible unless a revealed-scroll state is positively established
 * by JS. The animation is opt-in, the content is not."
 *
 * Every line below is written to keep that promise, which means: whenever a
 * `[data-reveal]` section ends up on screen, something must have *positively*
 * decided to reveal it. Hiding without that decision is the one forbidden state.
 */

/** Mirrors the `[data-reveal]` / `[data-reveal-group]` rules in globals.css. */
const REVEAL_SELECTOR = "[data-reveal], [data-reveal-group]";
const GROUP_SELECTOR = "[data-reveal-group]";

/**
 * Reveal layer.
 *
 * ── Why this watches the DOM and not the route (fixed 2026-10-06) ───────────
 * This used to be a single `useEffect(…, [])` that collected its targets once,
 * at mount. `SiteMotion` lives in the root layout, and App Router **keeps the
 * root layout mounted across client-side navigation** — so the collected node
 * list belonged to the *first* page forever. Every page reached by an in-page
 * link had sections that no observer ever saw, and they stayed at `opacity: 0`.
 *
 * Measured on `/about` reached by clicking a nav link: 13 of 18 sections
 * invisible; still 13 seven seconds later (the old 5s JS failsafe iterated the
 * stale mount-time list, so it revealed nothing); still 13 after scrolling. A
 * hard load of the same URL showed 0 hidden. Crawlers and Lighthouse never saw
 * it, because the markup is complete and only the computed `opacity` differs —
 * which is why it survived every automated check and only showed up for a human
 * who clicked a link.
 *
 * Watching for **DOM insertions** is deliberately the more general repair than
 * watching the pathname: a navigation, a streamed Suspense boundary, and a
 * late-mounting section all arrive as the same event type. It also means the
 * hook has no dependency on the router at all.
 *
 * The absolute "nothing stays hidden" guarantee is owned by CSS, not by a timer
 * here — see `fh-reveal-backstop` in globals.css.
 */
function useReveal() {
  useEffect(() => {
    // Reduced motion never arms. The CSS media block also forces these
    // properties, so this is belt-and-braces rather than the only guard.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;

    /**
     * Stagger indices, read by the children's `transition-delay`.
     *
     * Scoped rather than global: on a navigation only the incoming subtree
     * needs indices, and `Math.min(index, 8)` truncation means this is built
     * for small groups, not for re-walking a whole page.
     */
    const assignStagger = (scope: ParentNode) => {
      for (const group of scope.querySelectorAll<HTMLElement>(GROUP_SELECTOR)) {
        Array.from(group.children).forEach((child, index) => {
          (child as HTMLElement).style.setProperty(
            "--motion-order",
            String(Math.min(index, 8)),
          );
        });
      }
    };

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

    /** Track everything currently in `scope`. `observe()` is idempotent. */
    const track = (scope: ParentNode) => {
      for (const el of scope.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)) {
        revealObserver.observe(el);
      }
    };

    /**
     * Reveal everything at or above the fold.
     *
     * Queried **fresh from the document** on every call. The previous version
     * iterated a list captured at mount, which is precisely why its failsafe
     * could not rescue anything that arrived later.
     */
    const revealInView = () => {
      const limit = window.scrollY + window.innerHeight;
      for (const el of document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)) {
        if (el.classList.contains("is-revealed")) continue;
        if (el.getBoundingClientRect().top + window.scrollY < limit) {
          el.classList.add("is-revealed");
        }
      }
    };

    const prepare = (scope: ParentNode) => {
      assignStagger(scope);
      track(scope);
    };

    // 1 · Whatever the server already rendered.
    prepare(document);

    // 2 · Reveal what the visitor can already see, BEFORE arming. Arming first
    //     would hide content they are looking at and fade it back in, which
    //     reads as a flash rather than as motion.
    revealInView();

    // 3 · Arm. Until `data-motion-armed` is present CSS hides nothing, so an
    //     exception anywhere above leaves the page fully readable — the failure
    //     direction is "no animation", never "no content".
    root.classList.add("motion-ready");
    root.setAttribute("data-motion-armed", "");

    // 4 · Anything that arrives afterwards: a client navigation, a streamed
    //     boundary, a late-mounting section.
    const mutations = new MutationObserver((records) => {
      let touchedReveal = false;

      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          if (node.matches(REVEAL_SELECTOR)) {
            // The section itself is the target; its parent is the scope so
            // stagger indices are computed against the real sibling set.
            prepare(node.parentNode ?? document);
            touchedReveal = true;
          } else if (node.querySelector(REVEAL_SELECTOR)) {
            prepare(node);
            touchedReveal = true;
          }
        }
      }

      // New sections legitimately start hidden — that IS the entrance
      // animation. What must not happen is a section the visitor can already
      // see waiting for a scroll event that will never arrive, because the page
      // did not move.
      if (touchedReveal) revealInView();
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    // 5 · Second pass once layout settles — web fonts and images change heights,
    //     which can pull content that was legitimately below the fold back into
    //     view without any scroll event.
    const settle = window.setTimeout(revealInView, 350);

    return () => {
      window.clearTimeout(settle);
      mutations.disconnect();
      revealObserver.disconnect();
      root.classList.remove("motion-ready");
      root.removeAttribute("data-motion-armed");
    };
  }, []);
}

/**
 * Parallax layer.
 *
 * Kept separate from the reveal layer: this one has nothing to do with
 * visibility, so it must never be able to affect whether content is on screen.
 */
function useParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const media = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax-media]"),
    );
    if (media.length === 0) return;

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
      parallaxObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

export function useSiteMotion() {
  useReveal();
  useParallax();
}
