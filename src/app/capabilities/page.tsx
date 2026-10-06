import type { Metadata } from "next";

import {
  CapabilitiesHero,
  DocumentedEvidence,
  EngineeringCapability,
  FormingRoutesCapability,
  InspectionCapability,
  ValidationCapability,
} from "@/components/capabilities/wheel-capabilities";
import { getWheelManufacturingCapabilities } from "@/lib/wordpress/wheel-capabilities";

export const metadata: Metadata = {
  title: "Wheel Manufacturing & Quality Capabilities",
  description:
    "Review Fenghuai wheel engineering, forming-route selection, process inspection, validation equipment and the evidence required for an approved wheel program.",
};

export default async function CapabilitiesPage() {
  const content = await getWheelManufacturingCapabilities();

  return (
    <main id={content.anchor}>
      <CapabilitiesHero hero={content.hero} />
      <EngineeringCapability section={content.engineering} />
      <FormingRoutesCapability section={content.formingRoutes} />
      <InspectionCapability section={content.processInspection} />
      <ValidationCapability section={content.validationTests} />
      <DocumentedEvidence section={content.documentedEvidence} />
    </main>
  );
}
