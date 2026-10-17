import type { Metadata } from "next";
import { getLegalDocumentContent } from "@/lib/wordpress/legal";
import { LegalDocumentPage } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n";
import { getPublicLocalesForPath, localizedRouteMetadata } from "@/lib/i18n/publication";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  // Rendering, sitemap and hreflang all read one publication decision
  const extraPublicLocales = await getPublicLocalesForPath(`/support/warranty`);
  return {
    title: "Warranty Policy",
    description:
      "Fenghuai's manufacturing warranty for aluminum components — coverage, exclusions, claim process and remedies.",
    alternates: await localizedRouteMetadata("/support/warranty", locale, { extraPublicLocales }),
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
  const doc = await getLegalDocumentContent("warranty");

  return <LegalDocumentPage doc={doc} />;
}
