import type { Metadata } from "next";

import {
  ForgedCompletion,
  ForgedForgingRoute,
  ForgedInquiryInputs,
  ForgedMaterialReview,
  ForgedWheelHero,
} from "@/components/forged-wheel/forged-wheel-page";
import { getForgedWheelCustomizationPage } from "@/lib/wordpress/forged-wheel";

export const metadata: Metadata = {
  title: "Custom Forged Wheels | Engineering & Manufacturing Support | Fenghuai",
  description:
    "Discuss a custom forged wheel program with Fenghuai, from application and material review through forging, CNC machining, finish and inspection.",
  alternates: { canonical: "/products/wheels/forged" },
};

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
