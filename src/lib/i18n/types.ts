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

/** 中文使用独立公开前缀；英文继续占用既有根 URL，避免破坏外链。 */
export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  zh: "/zh",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/zh") return "/";
  return pathname.startsWith("/zh/") ? pathname.slice(3) || "/" : pathname;
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
}

export function localizedPath(pathname: string, locale: Locale): string {
  const base = stripLocalePrefix(pathname);
  if (locale === "zh") return base === "/" ? "/zh" : `/zh${base}`;
  return base;
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
