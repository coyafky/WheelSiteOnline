import type { Metadata } from "next";

import {
  ForgedCompletion,
  ForgedForgingRoute,
  ForgedInquiryInputs,
  ForgedMaterialReview,
  ForgedWheelHero,
} from "@/components/forged-wheel/forged-wheel-page";
import { getForgedWheelCustomizationPage } from "@/lib/wordpress/forged-wheel";
import { getLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/i18n/types";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Custom Forged Wheels | Engineering & Manufacturing Support | Fenghuai",
    description:
      "Discuss a custom forged wheel program with Fenghuai, from application and material review through forging, CNC machining, finish and inspection.",
    alternates: localizedAlternates("/products/wheels/forged", locale),
  };
}

export default async function ForgedWheelPage() {
  const content = await getForgedWheelCustomizationPage();

  return (
    <div>
      <ForgedWheelHero content={content} />
      <ForgedMaterialReview section={content.materialReview} />
      <ForgedForgingRoute section={content.forgingRoute} />
      <ForgedCompletion section={content.completion} />
      <ForgedInquiryInputs section={content.inquiryInputs} />
    </div>
  );
}
