import type { Metadata } from "next";
import { getLegalDocumentContent } from "@/lib/wordpress/legal";
import { LegalDocumentPage } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n";
import { buildRouteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Shipping & Packaging",
    description:
      "How Fenghuai packs and ships orders — Incoterms, risk transfer, documentation and damage-in-transit procedure.",
    ...(await buildRouteMetadata("/support/shipping", locale)),
  };
}

/**
 * Thin route: the document body is read from Headless WordPress (page key
 * `legal-<slug>`) through `@/lib/wordpress/legal`, which falls back to the
 * checked-in English constant. The shared renderer handles structure, the
 * draft-pending-legal-review notice and cross-navigation. Nothing is
 * duplicated across the five support routes.
 */
export default async function Page() {
  const doc = await getLegalDocumentContent("shipping");

  return <LegalDocumentPage doc={doc} />;
}
