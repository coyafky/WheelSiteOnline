"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the page has scrolled past a threshold.
 * Used by the site header to swap from transparent-over-hero to the frosted bar.
 *
 * HYDRATION SAFETY — read this before changing the initial value.
 *
 * The server has no `window`, so it always renders `scrolled = false`. If the
 * client's *first* render produced `true` (a restored scroll position, an
 * anchor deep-link, or an early effect that runs before paint), the header's
 * className would differ between server and client. React reports that as a
 * hydration mismatch and — in development — deliberately does NOT patch it up,
 * leaving the tree inconsistent so that every following client-side navigation
 * renders blank until a hard refresh.
 *
 * So: the first client render MUST also be `false`. We only flip to the real
 * value inside an effect, which React runs after hydration has completed.
 * A module-scoped cache keeps in-app navigation from flickering the header:
 * on the client we already know the scroll position, so we can seed the state
 * lazily WITHOUT touching the server render (the lazy initialiser is only
 * called on the client, after hydration).
 */
let cachedScrolled: boolean | null = null;

export function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(cachedScrolled ?? false);

  useEffect(() => {
    const sync = () => {
      const next = window.scrollY > threshold;
      cachedScrolled = next;
      setScrolled(next);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [threshold]);

  return scrolled;
}
