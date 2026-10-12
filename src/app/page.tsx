import type { Metadata } from "next";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/hero/home-hero";
import { ProjectRouteSection } from "@/components/home/project-route-section";
import { ProductShowcase } from "@/components/sections/product-showcase";
import { TrustStrip } from "@/components/sections/trust-strip";
import { getHomepageContent } from "@/lib/wordpress/homepage";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";
import type { HomepageContent } from "@/content/types";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const page = await getWordpressPageDocument<HomepageContent>("home", { locale });
  return {
    title: { absolute: page?.seoTitle || "Fenghuai | Wheels, EV Housings, Custom Aluminum & Safety Tires" },
    description: page?.seoDescription || "Explore Fenghuai's four automotive product lines, manufacturing capabilities, project process and inquiry entry point for global B2B programs.",
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [content, locale] = await Promise.all([getHomepageContent(), getLocale()]);

  return (
    <>
      <HomeHero hero={content.hero} locale={locale} />
      <ProductShowcase copy={content.productLines} locale={locale} />
      <TrustStrip capabilities={content.capabilities} locale={locale} />
      <ProjectRouteSection delivery={content.delivery} locale={locale} />
      <HomeClosing closing={content.closing} locale={locale} />
    </>
  );
}
