import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { WheelDetailInteractive } from "@/components/wheels/wheel-detail-interactive";
import {
  WheelDetailHero,
  WheelFinishSection,
  WheelFitmentSection,
  WheelRelatedModels,
} from "@/components/wheels/wheel-detail-sections";
import {
  centreBoreLabel,
  offsetLabel,
  pcdLabel,
  sizeLabel,
  toBrowserVariant,
} from "@/components/wheels/spec-format";
import type { ProductFamily } from "@/content/types";
import { wheelDetailSeo } from "@/content/wheel-detail";
import {
  getWheelDetailPage,
  listPublishedWheelSlugs,
  type PublicWheelVariant,
  type WheelDetailView,
} from "@/lib/wheels";

/**
 * Wheel detail page — `/products/wheels/[model]`, viewports WD01–WD06.
 *
 * ── One public collection, three consumers ────────────────────────────────
 * `generateStaticParams`, the page query and the sitemap all read the same
 * published set through `@/lib/wheels` (spec §13.2). A model missing an image, a
 * publication / image-rights / supply / specification approval, or any approved
 * variant is not in that set, so guessing the URL is a real 404 rather than a
 * 200 with a placeholder image (spec §3.1).
 *
 * ── What this page refuses to do ──────────────────────────────────────────
 * No vehicle fitment claim, no stock, price, lead time, load rating or
 * certification; no size or PCD range standing in for recorded specifications;
 * no `styleName` trade marks or vehicle hints; no cross-variant configuration
 * builder (spec §3.3, §6, §9, §14). Every specification shown — and every
 * specification the enquiry carries — comes from one approved variant.
 */

type WheelModelPageProps = {
  params: Promise<{ model: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * The family list handed to the embedded `<InquiryForm>` — deliberately empty.
 *
 * The site's family taxonomy lives in `@/content/products`, which this route may
 * not import (it holds the placeholder product data the wheel routes are being
 * moved off). Nothing else about the form changes: the enquiry's identity is
 * carried by `model + productionCode`, which the route re-resolves server-side.
 *
 * §7's field list does not ask a visitor to re-classify a model they have already
 * chosen, so the shared form's own "advise me" option is the honest answer for
 * this control. If a populated selector is preferred, the trade is either passing
 * that module's family list (a wheel-data boundary change) or moving the enquiry
 * to a `/request-a-quote` link, which needs no family list at all.
 */
const familiesForEnquiry: ProductFamily[] = [];

/** §13.2: every published slug, from the module that also serves the sitemap. */
export async function generateStaticParams() {
  const slugs = await listPublishedWheelSlugs();
  return slugs.map((model) => ({ model }));
}

export async function generateMetadata({
  params,
}: Pick<WheelModelPageProps, "params">): Promise<Metadata> {
  const { model } = await params;
  const detail = await getWheelDetailPage(model);

  if (!detail) {
    return { title: "Wheel model not found", robots: { index: false, follow: false } };
  }

  return {
    // §11 verbatim. `absolute` because the root layout would otherwise append the
    // brand a second time.
    title: { absolute: wheelDetailSeo.title(detail.model) },
    description: wheelDetailSeo.description(detail.model),
    // §11: canonical is the model URL and never carries `variant`, so a shared
    // configuration link cannot be indexed as a separate page.
    alternates: { canonical: `/products/wheels/${detail.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function WheelModelPage({
  params,
  searchParams,
}: WheelModelPageProps) {
  const { model: requestedModel } = await params;
  const detail = await getWheelDetailPage(requestedModel);
  if (!detail) notFound();

  const query = await searchParams;

  // §11: a case variation (or a stale link) is folded onto the canonical slug —
  // only because the public collection resolved it, i.e. the mapping is certain.
  // Anything that resolves to nothing has already 404'd above.
  if (requestedModel !== detail.slug) {
    permanentRedirect(`/products/wheels/${detail.slug}${rawQuerySuffix(query)}`);
  }

  const selectedCode = resolveSelectedCode(
    detail.approvedVariants,
    firstValue(query.variant) ?? firstValue(query.code),
  );

  return (
    <>
      <script
        type="application/ld+json"
        // Only our own resolved catalogue data is serialised — no visitor input
        // reaches this node.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema(detail)) }}
      />

      {/* WD01 — identity: one approved image, the real model, recorded process */}
      <WheelDetailHero
        model={detail.model}
        primaryImage={detail.primaryImage}
        processLabel={detail.processLabel}
      />

      {/* WD02 + WD03 — configuration selection and the embedded enquiry.
          Both read from `approvedVariants`; nothing is assembled model-wide.
          The list is projected before it crosses to the client, so the raw
          Chinese source `finish` never reaches the browser (see spec-format.ts). */}
      <WheelDetailInteractive
        model={detail.model}
        variants={detail.approvedVariants.map(toBrowserVariant)}
        initialSelectedCode={selectedCode}
        families={familiesForEnquiry}
      />

      {/* WD04 — hidden until a finish has an approved public name (§4, §8) */}
      <WheelFinishSection model={detail.model} variants={detail.approvedVariants} />

      {/* WD05 — application boundary: production record ≠ vehicle fitment */}
      <WheelFitmentSection />

      {/* WD06 — related models, already scored from the public collection (§10) */}
      <WheelRelatedModels related={detail.relatedModels} />
    </>
  );
}

/* ---------------------------------------------------------------------------
 * URL helpers
 * ------------------------------------------------------------------------- */

function firstValue(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : null;
}

/** Preserve a redirect's query string so a `?variant=` link survives the 308. */
function rawQuerySuffix(params: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) search.append(key, item);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * §6 "URL 与恢复": a request may only restore a configuration that exists on
 * **this** model's approved variants.
 *
 *   · one approved variant → defaulted, because there is no decision to make;
 *   · several              → only an explicit, recognised code is selected;
 *   · another model's code, an unapproved code or junk → ignored (the client then
 *     rewrites the URL and drops it), never echoed back as specifications.
 */
function resolveSelectedCode(
  variants: PublicWheelVariant[],
  requested: string | null,
): string | null {
  if (variants.length === 1) return variants[0].productionCode;
  if (!requested) return null;

  const needle = requested.toLowerCase();
  const match = variants.find(
    (variant) => variant.productionCode.toLowerCase() === needle,
  );
  return match?.productionCode ?? null;
}

/* ---------------------------------------------------------------------------
 * Structured data (§11)
 * ------------------------------------------------------------------------- */

/**
 * `Product` — deliberately without an `Offer`.
 *
 * There is no price and no stock level on this page, and an `Offer` node would
 * publish a purchasable thing that does not exist. `name`, `image` and `sku` are
 * the model and its approved primary image. The variant table may travel as
 * `additionalProperty`, restricted to the public specification values: no finish
 * (no approved public name), no vehicle fitment, no availability.
 */
function productSchema(detail: WheelDetailView) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: detail.model,
    sku: detail.model,
    image: detail.primaryImage,
    description: wheelDetailSeo.description(detail.model),
    url: `/products/wheels/${detail.slug}`,
    brand: { "@type": "Brand", name: "Fenghuai" },
    additionalProperty: detail.approvedVariants.map((variant) => ({
      "@type": "PropertyValue",
      propertyID: variant.productionCode,
      value: [
        sizeLabel(variant),
        pcdLabel(variant),
        offsetLabel(variant),
        centreBoreLabel(variant),
      ].join(" · "),
    })),
  };
}
