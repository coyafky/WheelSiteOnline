import type { FaqEntry } from "./types";

/**
 * Dealer-facing FAQ.
 *
 * WITHDRAWN 2026-10-17. The six entries that used to live here were placeholder
 * copy, not confirmed terms: they stated MOQ, lead time, warranty length and
 * shipping incoterms, all of which are commercial commitments. Publishing them
 * meant shipping unverified promises, and any answer surfaced here is quotable
 * by AI crawlers as fact.
 *
 * The array stays empty on purpose so both consumers (`/dealers` and the
 * `/products` catalogue contract) keep a valid shape and render nothing.
 *
 * Do not repopulate this until each answer is confirmed in writing. When that
 * happens, add the confirmed entries and re-enable the FAQ sections that were
 * removed from `src/app/dealers/page.tsx` and `src/app/products/page.tsx`,
 * together with `FaqAccordion` and `FAQPage` structured data.
 */
export const faqs: FaqEntry[] = [];
