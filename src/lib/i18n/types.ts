/**
 * Locale contracts.
 *
 * The site is bilingual (the client's source corpus is already zh/en paired —
 * see ARCHITECTURE/page-architecture/README.md §3.3). English is the default
 * because the audience is overseas distributors; Chinese is the second locale.
 */

export const LOCALES = ["en", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that remembers the visitor's choice across requests. */
export const LOCALE_COOKIE = "fh-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * A dictionary is a flat map of key → string.
 * Keys are dot-namespaced ("nav.requestQuote", "footer.rights").
 */
export type Dictionary = Record<string, string>;

/** Look up a key, falling back to the default locale, then to the key itself. */
export function translate(
  dict: Dictionary,
  fallback: Dictionary,
  key: string,
): string {
  return dict[key] ?? fallback[key] ?? key;
}
