"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n/types";

/**
 * Locale toggle.
 *
 * Writes the `fh-locale` cookie and refreshes the server components so the
 * header/footer re-render in the new language. Chosen over a `[locale]` route
 * segment because the site has 26 existing routes and a segment rewrite is a
 * separate migration.
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pick(next: Locale) {
    if (next === locale) return;
    persistLocale(next);
    startTransition(() => router.refresh());
  }

  const base =
    tone === "dark"
      ? "border-white/25 text-white/70 hover:border-forge hover:text-forge"
      : "border-border text-steel hover:border-forge hover:text-forge";

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex flex-nowrap items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-1 ${base} ${
        pending ? "opacity-60" : ""
      }`}
    >
      <Languages className="mx-1 size-3.5" aria-hidden="true" />
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => pick(code)}
          aria-current={code === locale ? "true" : undefined}
          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs uppercase tracking-[0.08em] transition-colors ${
            code === locale ? "bg-forge text-white" : "hover:text-forge"
          }`}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
