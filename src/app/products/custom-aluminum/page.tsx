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
import { customAluminumPage } from "@/content/custom-aluminum";
import { getCustomAluminumPage } from "@/lib/wordpress/custom-aluminum";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";

/**
 * `/products/custom-aluminum` — CA01–CA07.
 *
 * ── THE PUBLISHING GATE IS IN THE METADATA, NOT IN THE CSS ──────────────────
 * `capabilityBoundary.declinedConfirmed` is false because the business has not
 * confirmed which categories it declines. While it is false the route declares
 * `robots: { index: false, follow: true }` and publishes no canonical URL, so
 * an empty-boundary version of this page cannot be indexed. Nothing in the
 * component tree hides or reveals the gap by looking at a viewport — the flag
 * is the only switch.
 *
 * The moment the declined list is confirmed: set `declinedConfirmed: true` and
 * `publicationStatus: "approved"` in `src/content/custom-aluminum.ts`, add the
 * rows, and this file starts emitting `alternates.canonical` and drops the
 * robots block on its own. Removing the robots block by hand while the flag is
 * still false would publish the claim the gate exists to prevent.
 */
const PUBLISHING_GATE_OPEN = customAluminumPage.boundary.declinedConfirmed;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWordpressPageDocument("custom-aluminum");
  return {
    title: {
      absolute:
        page?.seoTitle ||
        "Custom Aluminum Components | Drawing & Sample Assessment | Fenghuai",
    },
    description:
      page?.seoDescription ||
      "Start a drawing-led aluminum component assessment with 2D drawings, 3D data or a physical sample, covering DFM, tooling, first article and supplier-supported production.",
    ...(PUBLISHING_GATE_OPEN
      ? { alternates: { canonical: "/products/custom-aluminum" } }
      : { robots: { index: false, follow: true } }),
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
