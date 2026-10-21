/**
 * Locale contracts.
 *
 * English is the default because the audience is overseas distributors.
 * Registration does not confer publication or indexability.
 */

export const LOCALES = ["en", "zh", "es", "th"] as const;

export type Locale = (typeof LOCALES)[number];

export type LocaleConfig = {
  label: string;
  intlLocale: string;
  prefix: string;
};

/** The single registry for route names and language-aware formatting. */
export const LOCALE_CONFIG = {
  en: { label: "English", intlLocale: "en-US", prefix: "" },
  zh: { label: "中文", intlLocale: "zh-CN", prefix: "/zh" },
  es: { label: "Español", intlLocale: "es-ES", prefix: "/es" },
  th: { label: "ไทย", intlLocale: "th-TH", prefix: "/th" },
} as const satisfies Record<Locale, LocaleConfig>;

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that remembers the visitor's choice across requests. */
export const LOCALE_COOKIE = "fh-locale";

/** Default English routes stay at the root to preserve existing links. */
export const LOCALE_PREFIX: Record<Locale, string> = Object.fromEntries(
  Object.entries(LOCALE_CONFIG).map(([locale, config]) => [locale, config.prefix]),
) as Record<Locale, string>;

/** Names shown in the language dropdown; each is recognizable in its locale. */
export const LOCALE_LABELS: Record<Locale, string> = Object.fromEntries(
  Object.entries(LOCALE_CONFIG).map(([locale, config]) => [locale, config.label]),
) as Record<Locale, string>;

/** Legacy English-only default; route publication lives in publication.ts. */
export const INDEXABLE_LOCALES: readonly Locale[] = ["en"];

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
 * Build a self-canonical URL and matching language alternates for one route.
 *
 * `readyLocales` is deliberately REQUIRED. It used to default to
 * `INDEXABLE_LOCALES` (`["en"]`), which silently emptied the hreflang set for
 * any route once a translation was approved: the page stayed reachable, its
 * sitemap entry appeared, but it advertised no alternates. Publication
 * qualification must feed this directly — see `getPublicLocalesForPath` and the
 * `localizedRouteMetadata` helper below.
 */
export function localizedAlternates(pathname: string, locale: Locale, readyLocales: readonly Locale[]) {
  const base = stripLocalePrefix(pathname);
  if (!readyLocales.includes(locale)) return { languages: {} };
  const languages = Object.fromEntries(
    readyLocales.map((language) => [language, localizedPath(base, language)]),
  );
  return {
    canonical: localizedPath(base, locale),
    languages: {
      ...languages,
      ...(readyLocales.includes(DEFAULT_LOCALE) ? { "x-default": localizedPath(base, DEFAULT_LOCALE) } : {}),
    },
  };
}

export function formatLocaleNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(LOCALE_CONFIG[locale].intlLocale, options).format(value);
}

export function formatLocaleDate(value: Date | number, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE_CONFIG[locale].intlLocale, options).format(value);
}

/**
 * A dictionary is a flat map of key → string.
 * Keys are dot-namespaced ("nav.requestQuote", "footer.rights").
 */
export type Dictionary = Record<string, string>;

/** A page/body translation must be explicitly approved before it is renderable. */
export type LocalizedValue = {
  value: string;
  approved: boolean;
};

export type LocalizedContent = Partial<Record<Locale, LocalizedValue>>;

export type LocalizedResolution =
  | {
      status: "translated";
      locale: Locale;
      value: string;
    }
  | {
      status: "unavailable";
      locale: Locale;
    };

/** Look up a UI key without falling back to another language. */
export function translate(dict: Dictionary, key: string): string {
  return dict[key] ?? key;
}

/** Resolve approved body copy; missing or unapproved translations stay unavailable. */
export function resolveLocalized(
  content: LocalizedContent,
  locale: Locale,
): LocalizedResolution {
  const candidate = content[locale];
  if (candidate?.approved === true) {
    return { status: "translated", locale, value: candidate.value };
  }
  return { status: "unavailable", locale };
}

/** Strict lookup for UI that has completed locale coverage. */
export function translateStrict(dict: Dictionary, key: string): string {
  return dict[key] ?? key;
}
