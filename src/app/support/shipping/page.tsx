import type { Metadata } from "next";
import { getLegalDocumentContent } from "@/lib/wordpress/legal";
import { LegalDocumentPage } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n";
import { getPublicLocalesForPath, localizedRouteMetadata } from "@/lib/i18n/publication";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  // Rendering, sitemap and hreflang all read one publication decision
  const extraPublicLocales = await getPublicLocalesForPath(`/support/shipping`);
  return {
    title: "Shipping & Packaging",
    description:
      "How Fenghuai packs and ships orders — Incoterms, risk transfer, documentation and damage-in-transit procedure.",
    alternates: await localizedRouteMetadata("/support/shipping", locale, { extraPublicLocales }),
    robots: { index: extraPublicLocales.includes(locale), follow: true },
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
