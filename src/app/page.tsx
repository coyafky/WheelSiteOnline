import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/hero/home-hero";
import { ProjectRouteSection } from "@/components/home/project-route-section";
import { ProductShowcase } from "@/components/sections/product-showcase";
import { TrustStrip } from "@/components/sections/trust-strip";
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
      {result.page.modules.map((module) => {
        switch (module.type) {
          case "home.hero":
            return <HomeHero key={module.id} hero={module.content} locale={locale} />;
          case "home.product-lines":
            return <ProductShowcase key={module.id} copy={module.content} locale={locale} />;
          case "home.capabilities":
            return <TrustStrip key={module.id} capabilities={module.content} locale={locale} />;
          case "home.delivery":
            return <ProjectRouteSection key={module.id} delivery={module.content} locale={locale} />;
          case "home.closing":
            return <HomeClosing key={module.id} closing={module.content} locale={locale} />;
        }
      })}
    </>
  );
}
