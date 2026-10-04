import { DICTIONARIES } from "./dictionaries";
import { DEFAULT_LOCALE, translate, type Locale } from "./types";

/**
 * Client-safe translation helper.
 *
 * ⚠️ This module must NOT import `./index` — that one pulls in `next/headers`
 * and would drag server-only code into the client bundle (build error:
 * "You're importing a component that needs next/headers").
 */

/** Returns a bound translator for a locale known at render time. */
export function createT(locale: Locale) {
  const dict = DICTIONARIES[locale];
  return (key: string) => translate(dict, DICTIONARIES[DEFAULT_LOCALE], key);
}

export type { Locale };
