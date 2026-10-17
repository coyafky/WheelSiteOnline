import type { Metadata } from "next";

import {
  ApplicationScope,
  AssessmentInquiry,
  CapabilityBoundary,
  CustomAluminumClosing,
  CustomAluminumHero,
  DevelopmentStages,
  EngineeringMethods,
  ProjectInputs,
} from "@/components/custom-aluminum/custom-aluminum-page";
import { getCustomAluminumPage, isCustomAluminumPageIndexable } from "@/lib/wordpress/custom-aluminum";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";
import { getLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/i18n/types";

/** `/products/custom-aluminum` — public engineering assessment page. */

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const page = await getWordpressPageDocument("custom-aluminum");
  const indexable = await isCustomAluminumPageIndexable();
  return {
    title: {
      absolute:
        page?.seoTitle ||
        "Custom Aluminum Components | Drawing & Sample Assessment | Fenghuai",
    },
    description:
      page?.seoDescription ||
      "Start a drawing-led aluminum component assessment with 2D drawings, 3D data or a physical sample, covering DFM, tooling, first article and supplier-supported production.",
    ...(indexable ? { alternates: localizedAlternates("/products/custom-aluminum", locale) } : {}),
    robots: { index: indexable, follow: true },
  };
}

export default async function CustomAluminumPage() {
  const content = await getCustomAluminumPage();

  return (
    <div>
      {/* CA01 — photo-free engineering-input hero, plus the EV housing fork */}
      <CustomAluminumHero content={content} />
      {/* CA02 — four application groups, each labelled "Assessment scope" */}
      <ApplicationScope section={content.applications} />
      {/* CA03 — 2D drawing / 3D data / physical sample */}
      <ProjectInputs section={content.inputs} />
      {/* CA04 — DFM, structural analysis and casting simulation examples */}
      <EngineeringMethods section={content.methods} />
      {/* CA05 — five auditable stages, each with an exit */}
      <DevelopmentStages section={content.stages} />
      {/* CA06 — listed / assessed per project / not yet confirmed */}
      <CapabilityBoundary section={content.boundary} />
      {/* CA07 — the enquiry inputs and the unified inquiry route */}
      <AssessmentInquiry section={content.inquiry} />
      <CustomAluminumClosing closing={content.closing} />
    </div>
  );
}
