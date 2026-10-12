import "server-only";

import { DEFAULT_LOCALE, type Locale } from "./types";

/**
 * Locale fallback observability.
 *
 * Every content resolver reads its body copy from Headless WordPress and falls
 * back to the checked-in English constants in `src/content/*.ts` when the
 * request cannot be served. That fallback is intentional on this preview build,
 * but it used to be silent: a `/zh` visitor received English body copy with no
 * signal anywhere that a translation was missing, so "the translation shipped"
 * and "the translation was never read" looked identical from the outside.
 *
 * This module makes the fallback observable without changing what is rendered.
 * The `en` path is a strict no-op — no log line, same object identity — so an
 * English render stays byte-identical to before.
 */

export type LocalizedResolution<T> = {
  content: T;
  locale: Locale;
  /** true when we could not serve the requested locale and served the default-locale content instead */
  fellBackToDefault: boolean;
};

/**
 * Why the requested locale could not be served. Kept coarse on purpose: the
 * resolvers cannot distinguish "the record has no translation" from "the
 * translation exists but is not approved" — the WordPress contract collapses
 * both into `null` — and inventing a finer reason here would report a
 * distinction the data does not carry.
 */
const FALLBACK_REASON = "no-approved-translation";

/**
 * Pick the requested-locale content when it exists, otherwise the default-locale
 * content, and report which one was used.
 *
 * `requested` is `null` whenever the adapter could not produce content for the
 * requested locale — the WordPress page/guide contracts return `null` for a
 * non-`en` locale with no approved translation, and for a failed or
 * non-authoritative read. Callers pass that value straight through.
 */
export function resolveLocalized<T>(args: {
  requested: T | null;
  default: T;
  locale: Locale;
  scope: string;
}): LocalizedResolution<T> {
  const { requested, default: fallback, locale, scope } = args;
  if (requested !== null && requested !== undefined) {
    return { content: requested, locale, fellBackToDefault: false };
  }
  if (locale !== DEFAULT_LOCALE) {
    console.info(
      `[i18n] fallback locale=${locale} scope=${scope} reason=${FALLBACK_REASON}`,
    );
  }
  return { content: fallback, locale, fellBackToDefault: true };
}

export { DEFAULT_LOCALE };
export type { Locale };
