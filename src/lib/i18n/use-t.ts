import { DICTIONARIES } from "./dictionaries";
import { translateStrict, type Locale } from "./types";

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
  // UI keys must exist in every locale. Returning the key makes a missing
  // translation visible in development and test output instead of silently
  // presenting English to visitors on another locale URL.
  return (key: string) => translateStrict(dict, key);
}

export type { Locale };
