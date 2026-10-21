"use client";

import { usePathname } from "next/navigation";
import { createT } from "@/lib/i18n/use-t";
import { localeFromPathname } from "@/lib/i18n/types";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = localeFromPathname(usePathname());
  const t = createT(locale);

  return (
    <main className="container-fh flex min-h-[70vh] flex-col justify-center py-28" lang={locale}>
      <p className="eyebrow">{t("error.generic.heading")}</p>
      <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.2rem,6vw,4.4rem)] font-800 uppercase leading-[0.92] tracking-[-0.02em] text-ink">
        {t("error.generic.body")}
      </h1>
      <button type="button" onClick={reset} className="btn-pill-solid mt-8 w-fit">
        {t("error.generic.retry")}
      </button>
    </main>
  );
}
