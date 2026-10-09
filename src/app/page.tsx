import type { Metadata } from "next";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/hero/home-hero";
import { ProjectRouteSection } from "@/components/home/project-route-section";
import { ProductShowcase } from "@/components/sections/product-showcase";
import { TrustStrip } from "@/components/sections/trust-strip";
import { getHomepageContent } from "@/lib/wordpress/homepage";

export const metadata: Metadata = {
  title: {
    absolute:
      "Fenghuai | Wheels, EV Housings, Custom Aluminum & Safety Tires",
  },
  description:
    "Explore Fenghuai's four automotive product lines, manufacturing capabilities, project process and inquiry entry point for global B2B programs.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const content = await getHomepageContent();

  return (
    <>
      <HomeHero hero={content.hero} />
      <ProductShowcase copy={content.productLines} />
      <TrustStrip capabilities={content.capabilities} />
      <ProjectRouteSection delivery={content.delivery} />
      <HomeClosing closing={content.closing} />
    </>
  );
}
