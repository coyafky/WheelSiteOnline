import { cookies, headers } from "next/headers";
import { DICTIONARIES } from "./dictionaries";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  translate,
  type Locale,
} from "./types";

export * from "./types";

/**
 * Resolve the active locale on the server.
 *
 * V1 reads the `fh-locale` cookie only. No `[locale]` route segment yet —
 * that would require rewriting every route and is deliberately deferred
 * (see PAGE-SPECS/index.md on routing changes being a separate migration).
 */
export async function getLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const routed = requestHeaders.get("x-fh-locale");
  if (isLocale(routed)) return routed;
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Get a bound translator for the given locale. */
export async function getTranslator(): Promise<{
  locale: Locale;
  t: (key: string) => string;
}> {
  const locale = await getLocale();
  const dict = DICTIONARIES[locale];
  return {
    locale,
    t: (key: string) => translate(dict, key),
  };
}

/** Synchronous lookup for a known locale — for client components. */
export function translatorFor(locale: Locale) {
  const dict = DICTIONARIES[locale];
  return (key: string) => translate(dict, key);
}

export { DICTIONARIES };
