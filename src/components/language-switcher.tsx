"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  localizedPath,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/i18n/types";

/**
 * Locale toggle.
 *
 * Writes the preference cookie and navigates to the locale's public URL while
 * preserving the current path, query string and fragment.
 */

/**
 * Persist the choice for a year. Kept at module scope rather than inline in the
 * component: the immutability lint rule cannot distinguish a deliberate cookie
 * write from mutating a captured value, and a named function documents intent.
 */
function persistLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
}

export function LanguageSwitcher({
  locale,
  label,
  tone = "light",
}: {
  locale: Locale;
  /** Accessible label — supplied by the caller from the dictionary. */
  label: string;
  /** `dark` renders for the ink header; `light` for light surfaces. */
  tone?: "light" | "dark";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pick(next: Locale) {
    if (next === locale) return;
    persistLocale(next);
    const query = searchParams.toString();
    const hash = window.location.hash;
    const href = `${localizedPath(pathname, next)}${query ? `?${query}` : ""}${hash}`;
    // Locale changes affect the root `<html lang>` attribute. A full navigation
    // is intentional here: App Router preserves the root layout during a soft
    // transition and would otherwise leave assistive technology on the old
    // language even though the URL and visible chrome had changed.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(href);
  }

  return (
    <label
      className={`inline-flex items-center gap-2 whitespace-nowrap font-display text-[0.7rem] font-700 uppercase tracking-[0.12em] ${
        ""
      }`}
    >
      <span className={tone === "dark" ? "sr-only" : "sr-only"}>{label}</span>
      <span aria-hidden="true" className={tone === "dark" ? "text-white/50" : "text-steel"}>
        {locale.toUpperCase()}
      </span>
      <select
        value={locale}
        aria-label={label}
        onChange={(event) => pick(event.target.value as Locale)}
        className={`max-w-[8.5rem] cursor-pointer appearance-none bg-transparent py-2 pr-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forge ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} className="bg-ink text-white">
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
