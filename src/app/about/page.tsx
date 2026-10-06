import type { Metadata } from "next";

import { AboutClosing } from "@/components/about/about-closing";
import { AboutHero, CompanyRole } from "@/components/about/about-intro";
import { TireFactory } from "@/components/about/tire-factory";
import { WheelFactory } from "@/components/about/wheel-factory";
import { getAboutContent } from "@/lib/wordpress/about";

export const metadata: Metadata = {
  title: "About Fenghuai | Automotive Component Manufacturing",
  description:
    "Meet Shenzhen Fenghuai Technology and the specialized manufacturing bases supporting wheel, EV aluminum, custom aluminum and self-sealing tyre programs.",
};

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
