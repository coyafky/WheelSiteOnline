"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  localizedPath,
  LOCALE_COOKIE,
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

const LABELS: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

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
  const [pending, startTransition] = useTransition();

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
    startTransition(() => window.location.assign(href));
  }

  const inactive =
    tone === "dark"
      ? "text-white/52 hover:text-white"
      : "text-steel hover:text-ink";
  const active = tone === "dark" ? "text-forge-bright" : "text-forge";

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex flex-nowrap items-center whitespace-nowrap font-display text-[0.7rem] font-700 uppercase tracking-[0.12em] ${
        pending ? "opacity-60" : ""
      }`}
    >
      {LOCALES.map((code, index) => (
        <span key={code} className="inline-flex items-center">
          {index > 0 ? (
            <span className={tone === "dark" ? "px-2 text-white/18" : "px-2 text-ink/18"} aria-hidden="true">
              /
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => pick(code)}
            aria-current={code === locale ? "true" : undefined}
            className={`whitespace-nowrap py-2 transition-colors ${
              code === locale ? active : inactive
            }`}
          >
            {LABELS[code]}
          </button>
        </span>
      ))}
    </div>
  );
}
