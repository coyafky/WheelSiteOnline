import type { Metadata } from "next";

import {
  EvAssessmentInquiry,
  EvEngineeringConcerns,
  EvEvidenceMatrix,
  EvHousingCategories,
  EvHousingHero,
  EvProcessRoute,
} from "@/components/ev-components/ev-components-page";
import { getEvHousingPage } from "@/lib/wordpress/ev-components";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";
import { getLocale } from "@/lib/i18n";
import { buildRouteMetadata } from "@/lib/seo/metadata";

/**
 * `/products/ev-components` — EV01–EV06.
 *
 * ── WHAT THIS ROUTE IS ──────────────────────────────────────────────────────
 * A B2B capability and engineering-assessment entry for motor and
 * power-electronics housing projects. Three housing categories with
 * supplier-provided photography; no SKUs, no stock, no grades, no tolerances,
 * no leak rates, no capacity and no certification marks.
 *
 * This public content route is indexable at the owner's direction. Claims and
 * project-specific scope remain subject to the page's visible evidence notes.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const page = await getWordpressPageDocument("ev-components");
  return {
    title: {
      absolute:
        page?.seoTitle ||
        "EV Motor & Controller Aluminum Housings | Engineering Assessment | Fenghuai",
    },
    description:
      page?.seoDescription ||
      "Review supplier-supported aluminum housing categories for EV motor and controller projects, then submit drawing, cooling, sealing and volume requirements for engineering assessment.",
    ...(await buildRouteMetadata("/products/ev-components", locale)),
  };
}

/**
 * `Service` schema — deliberately not `Product`.
 *
 * The spec permits `Service` and forbids `Product`/`Offer`: there is no price,
 * no stock level and no orderable SKU on this page, and an `Offer` node would
 * publish a purchasable thing that does not exist. The catalogue of categories
 * therefore lives in `serviceType` as text, and no `offers`, `price`,
 * `availability` or `aggregateRating` property is emitted anywhere.
 */
function serviceSchema(content: Awaited<ReturnType<typeof getEvHousingPage>>) {
  const categories = content.categories.items.map((item) => item.publicName);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.hero.heading,
    serviceType: `Aluminum housing engineering assessment for EV motor and controller projects (${categories.join(", ")})`,
    description: content.hero.lead,
    provider: {
      "@type": "Organization",
      name: "Fenghuai",
    },
    url: "/products/ev-components",
    areaServed: "Worldwide",
  };
}

export default async function EvComponentsPage() {
  const content = await getEvHousingPage();

  return (
    <>
      <script
        type="application/ld+json"
        // Only our own content module is serialised here; no visitor input and
        // no CMS text reaches this node.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema(content)) }}
      />

      {/* EV01 — category hero. Photograph follows the copy on mobile. */}
      <EvHousingHero content={content} />
      {/* EV02 — three categories, each labelled "Project category — not a stock SKU" */}
      <EvHousingCategories section={content.categories} />
      {/* EV03 — cooling path, sealing boundary, critical interfaces */}
      <EvEngineeringConcerns section={content.engineeringConcerns} />
      {/* EV04 — five stated route steps, with the capability disclosure */}
      <EvProcessRoute section={content.processRoutes} />
      {/* EV05 — the evidence gates: table on desktop, cards on mobile */}
      <EvEvidenceMatrix section={content.evidenceMatrix} />
      {/* EV06 — the required inputs and the engineering-assessment CTA */}
      <EvAssessmentInquiry section={content.inquiry} />
    </>
  );
}
