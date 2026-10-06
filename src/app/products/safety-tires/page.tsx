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

export const metadata: Metadata = {
  title: "Self-Sealing Tyres | Puncture Response & Test Conditions",
  description:
    "Learn how an inner-liner sealing layer responds to an applicable tread puncture, what the supplier-stated 8 mm test condition means, and which tyre and market documents to confirm.",
};

export default async function SafetyTiresPage() {
  const content = await getSelfSealingTirePage();

  return (
    <main>
      <SelfSealingHero content={content} />
      <RoadsideProblem section={content.painPoint} />
      <TyreDefinition section={content.definition} />
      <SealingMechanism section={content.mechanism} />
      <PunctureValidation section={content.punctureValidation} />
      <ProductEvidence section={content.evidenceSystem} />
      <ApplicationInquiry section={content.applicationAndInquiry} />
    </main>
  );
}
