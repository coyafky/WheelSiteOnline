import type { Metadata } from "next";

import {
  ApplicationInquiry,
  ProductEvidence,
  PunctureValidation,
  RoadsideProblem,
  SealingMechanism,
  SelfSealingHero,
  TyreDefinition,
} from "@/components/safety-tires/self-sealing-tire-page";
import { getSelfSealingTirePage } from "@/lib/wordpress/safety-tires";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWordpressPageDocument("safety-tires");
  return {
    title: page?.seoTitle || "Self-Sealing Tires | Puncture Response & Test Conditions",
    description:
      page?.seoDescription ||
      "Learn how an inner-liner sealing layer responds to an applicable tread puncture, what the supplier-stated 8 mm test condition means, and which tire and market documents to confirm.",
  };
}

export default async function SafetyTiresPage() {
  const content = await getSelfSealingTirePage();

  return (
    <div>
      <SelfSealingHero content={content} />
      <RoadsideProblem section={content.painPoint} />
      <TyreDefinition section={content.definition} />
      <SealingMechanism section={content.mechanism} />
      <PunctureValidation section={content.punctureValidation} />
      <ProductEvidence section={content.evidenceSystem} />
      <ApplicationInquiry section={content.applicationAndInquiry} />
    </div>
  );
}
