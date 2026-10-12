/**
 * Locale contracts.
 *
 * English is the default because the audience is overseas distributors. The
 * other locales are independently addressable, but remain noindex until their
 * page body, metadata and business review are complete.
 */

export const LOCALES = ["en", "zh", "es", "th"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that remembers the visitor's choice across requests. */
export const LOCALE_COOKIE = "fh-locale";

/** 中文使用独立公开前缀；英文继续占用既有根 URL，避免破坏外链。 */
export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  zh: "/zh",
  es: "/es",
  th: "/th",
};

/** Names shown in the language dropdown; each is recognizable in its locale. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  th: "ไทย",
};

/** Only reviewed locales may be indexed. English is the current release gate. */
export const INDEXABLE_LOCALES = ["en"] as const;

export function isIndexableLocale(locale: Locale): boolean {
  return (INDEXABLE_LOCALES as readonly Locale[]).includes(locale);
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function stripLocalePrefix(pathname: string): string {
  for (const locale of LOCALES) {
    const prefix = LOCALE_PREFIX[locale];
    if (!prefix) continue;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length) || "/";
  }
  return pathname || "/";
}

export function localeFromPathname(pathname: string): Locale {
  for (const locale of LOCALES) {
    const prefix = LOCALE_PREFIX[locale];
    if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return locale;
    }
  }
  return "en";
}

export function localizedPath(pathname: string, locale: Locale): string {
  const base = stripLocalePrefix(pathname);
  const prefix = LOCALE_PREFIX[locale];
  if (prefix) return base === "/" ? prefix : `${prefix}${base}`;
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
