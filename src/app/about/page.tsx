import type { Metadata } from "next";

import { AboutClosing } from "@/components/about/about-closing";
import { AboutHero, CompanyRole } from "@/components/about/about-intro";
import { TireFactory } from "@/components/about/tire-factory";
import { WheelFactory } from "@/components/about/wheel-factory";
import { getAboutContent } from "@/lib/wordpress/about";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";
import type { AboutContent } from "@/content/types";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const page = await getWordpressPageDocument<AboutContent>("about", { locale });
  return {
    title: page?.seoTitle || "About Fenghuai | Automotive Component Manufacturing",
    description: page?.seoDescription || "Meet Shenzhen Fenghuai Technology and the specialized manufacturing bases supporting wheel, EV aluminum, custom aluminum and self-sealing tyre programs.",
  };
}

export default async function AboutPage() {
  const content = await getAboutContent();

  return (
    <>
      <AboutHero hero={content.hero} />
      <CompanyRole role={content.role} />
      <WheelFactory section={content.wheelFactory} />
      <TireFactory section={content.tireFactory} />
      <AboutClosing closing={content.closing} />
    </>
  );
}
