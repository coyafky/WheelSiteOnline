import { Fragment } from "react";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { renderHomeModule } from "@/components/home/home-module-registry";
import { getHomepagePageView, getHomepagePublicLocales } from "@/lib/wordpress/homepage";
import { getLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/i18n/types";
import { siteUrlIsConfigured } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { isEnabled: preview } = await draftMode();
  const result = await getHomepagePageView({ locale, preview });
  if (result.status !== "ready") {
    return {
      title: "Fenghuai",
      robots: { index: false, follow: true },
    };
  }
  const publicLocales = preview ? [] : await getHomepagePublicLocales();
  const indexable = siteUrlIsConfigured && publicLocales.includes(locale);
  return {
    title: { absolute: result.page.seo.title },
    description: result.page.seo.description,
    robots: { index: indexable, follow: true },
    alternates: indexable
      ? localizedAlternates(result.page.seo.canonicalPath, locale, publicLocales)
      : {},
  };
}

export default async function HomePage() {
  const locale = await getLocale();
  const { isEnabled: preview } = await draftMode();
  const result = await getHomepagePageView({ locale, preview });
  if (result.status !== "ready") notFound();

  return (
    <>
      {result.page.modules.map((module) => (
        <Fragment key={module.id}>{renderHomeModule(module, locale)}</Fragment>
      ))}
    </>
  );
}
