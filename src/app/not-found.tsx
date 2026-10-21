"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createT } from "@/lib/i18n/use-t";
import { localeFromPathname, localizedPath } from "@/lib/i18n/types";

export default function NotFound() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = createT(locale);

  return (
    <main className="container-fh flex min-h-[70vh] flex-col justify-center py-28" lang={locale}>
      <p className="eyebrow">404</p>
      <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,7.6vw,5.4rem)] font-800 uppercase leading-[0.9] tracking-[-0.02em] text-ink">
        {t("error.notFound.heading")}
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-steel">
        {t("error.notFound.body")}
      </p>
      <Link href={localizedPath("/", locale)} className="btn-pill-solid mt-8 w-fit">
        {t("error.notFound.cta")}
      </Link>
    </main>
  );
}
