"use client";

// 历史归档：DEC-094 已移除全站悬浮询盘；不要重新导入公开界面。

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@/theme/fenghuai-neutral/neutral";
import { cn } from "@/lib/utils";
import { createT } from "@/lib/i18n/use-t";
import { localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/types";
import { useInquiryCart } from "@/lib/wheels/inquiry-cart";

/**
 * Persistent accent pill linking to the quote form.
 *
 * Two suppression rules:
 *
 *   1. **Conversion pages** — hidden on pages that already ARE the conversion
 *      step, so it never competes with the form itself.
 *   2. **Homepage first fold** — the homepage hero already carries two quote
 *      entry points (the header CTA and the hero button). A third one visible
 *      in the same viewport is noise, so on `/` the pill waits until the
 *      visitor has scrolled past ~30% of the viewport (hero PageSpec §22).
 *      Other pages keep it visible immediately.
 */

const HIDDEN_ON = ["/contact", "/request-a-quote", "/thank-you"];

/** Pages where the pill is revealed only after a scroll threshold. */
const DELAYED_ON = ["/"];

/** Fraction of the viewport that must be scrolled before the pill appears. */
const REVEAL_AT = 0.3;

export function FloatingQuote({ locale }: { locale: Locale }) {
  const pathname = stripLocalePrefix(usePathname());
  const t = createT(locale);
  const cartItems = useInquiryCart();

  const hidden = HIDDEN_ON.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const delayed = DELAYED_ON.includes(pathname);

  // Lazily initialised so non-delayed pages never touch state or listeners.
  // The scroll handler is the only thing that ever sets this — no synchronous
  // setState inside the effect (which would cascade renders).
  const [passedThreshold, setPassedThreshold] = useState(!delayed);
  const [catalogueFilterOpen, setCatalogueFilterOpen] = useState(false);
  const [suppressionZoneVisible, setSuppressionZoneVisible] = useState(false);

  useEffect(() => {
    if (!delayed) return;

    const onScroll = () => {
      setPassedThreshold(window.scrollY > window.innerHeight * REVEAL_AT);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [delayed, pathname]);

  useEffect(() => {
    const filter = document.querySelector<HTMLDetailsElement>(
      "details[data-catalogue-mobile-filter]",
    );
    if (!filter) return;

    const onToggle = () => setCatalogueFilterOpen(filter.open);
    filter.addEventListener("toggle", onToggle);
    return () => filter.removeEventListener("toggle", onToggle);
  }, [pathname]);

  useEffect(() => {
    const visibility = new Map<Element, boolean>();
    const observed = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visibility.set(entry.target, entry.isIntersecting);
        setSuppressionZoneVisible([...visibility.values()].some(Boolean));
      },
      // Suppression sections can be tens of thousands of pixels tall. A 2%
      // ratio then requires hundreds of visible pixels and misses the filter
      // controls at the section entrance. Any real intersection is enough.
      { threshold: 0 },
    );

    // App Router can stream the page section after this client component has
    // hydrated. A one-time query then sees only the footer and misses the
    // catalogue's suppression zone, allowing the floating CTA to cover filter
    // and sort controls. Keep the observed set in sync with streamed DOM.
    const syncZones = () => {
      const current = new Set(
        document.querySelectorAll("footer, [data-floating-quote-hide]"),
      );

      for (const zone of observed) {
        if (current.has(zone)) continue;
        observer.unobserve(zone);
        observed.delete(zone);
        visibility.delete(zone);
      }
      for (const zone of current) {
        if (observed.has(zone)) continue;
        observed.add(zone);
        observer.observe(zone);
      }

      setSuppressionZoneVisible([...visibility.values()].some(Boolean));
    };

    syncZones();
    const mutations = new MutationObserver(syncZones);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  const visible = !hidden && !catalogueFilterOpen && !suppressionZoneVisible && passedThreshold;

  return (
    <Link
      data-floating-quote
      data-floating-quote-safe-zone
      href={localizedPath("/request-a-quote", locale)}
      aria-label={`${t("cta.requestQuote")}${cartItems.length > 0 ? ` (${cartItems.length})` : ""}`}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={cn(
        "fixed bottom-[calc(78px+env(safe-area-inset-bottom))] right-3 z-40 inline-flex min-h-[46px] max-w-[calc(100vw-1.5rem)] items-center rounded-full bg-forge px-5 sm:right-6 lg:bottom-[calc(22px+env(safe-area-inset-bottom))]",
        "font-text text-[0.85rem] font-600 tracking-normal text-white",
        "shadow-[0_14px_34px_rgba(138,68,6,0.34)]",
        "transition-[transform,background,box-shadow,opacity] duration-300 ease-out",
        "hover:-translate-y-[3px] hover:bg-forge-deep hover:shadow-[0_18px_42px_rgba(138,68,6,0.42)]",
        "active:translate-y-[-1px] active:scale-[0.98]",
        visible && "motion-safe:animate-[fh-nudge_8s_ease-in-out_infinite]",
        !visible && "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      {t("cta.requestQuote")}
      {cartItems.length > 0 ? (
        <Theme theme={neutralTheme} mode="light">
          <Badge aria-hidden="true" variant="orange" label={cartItems.length} />
        </Theme>
      ) : null}
    </Link>
  );
}
