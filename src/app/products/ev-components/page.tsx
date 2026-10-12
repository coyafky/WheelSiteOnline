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

/**
 * `/products/ev-components` — EV01–EV06.
 *
 * ── WHAT THIS ROUTE IS ──────────────────────────────────────────────────────
 * A B2B capability and engineering-assessment entry for motor and
 * power-electronics housing projects. Three housing categories with
 * supplier-provided photography; no SKUs, no stock, no grades, no tolerances,
 * no leak rates, no capacity and no certification marks.
 *
 * ── WHY THERE IS NO INDEXING GATE HERE ──────────────────────────────────────
 * `/products/custom-aluminum` stays `noindex, follow` because its declined
 * categories are unconfirmed, and an empty "what we decline" column would read
 * as a promise to make anything. This route has no such blank: everything it
 * publishes is either supplied material (attributed on the page) or an
 * evidence list the customer is asked to bring. Nothing is withheld behind a
 * flag, so the page declares its canonical URL and stays indexable. The
 * moment a claim on it becomes unconfirmed, that claim comes off the page —
 * the rule is not to hide it in metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
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
    alternates: { canonical: "/products/ev-components" },
    robots: { index: true, follow: true },
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
