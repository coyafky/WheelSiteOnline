import type { Metadata } from "next";
import { HomeHero } from "@/components/home/hero/home-hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { ProductShowcase } from "@/components/sections/product-showcase";
import { WheelStripSection } from "@/components/wheel-strip-section";
import { DealerCta } from "@/components/sections/dealer-cta";

export const metadata: Metadata = {
  // Company-level, matching the four-line architecture (see DEC-022 and
  // src/content/site.ts). The previous title said "Forged Wheels" and the
  // description listed monoblock/two-piece/off-road — the competitor's wheel
  // taxonomy — which made the whole site read as a wheel-only shop.
  title: "Fenghuai | Automotive Component Manufacturer",
  description:
    "Fenghuai manufactures aluminium components across four product lines — forged wheels, EV powertrain housings, custom aluminium parts and self-healing safety tires — for dealers, Tier 1 suppliers and OEM programmes.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <TrustStrip />
      <ProductShowcase />
      <WheelStripSection />
      {/* `closing` — the band is the last thing on this page, so its action
          must not land in the corner where FloatingQuote sits. */}
      <DealerCta variant="closing" />
    </>
  );
}
