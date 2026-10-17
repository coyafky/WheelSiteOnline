import type { Metadata } from "next";
import { getLegalDocumentContent } from "@/lib/wordpress/legal";
import { LegalDocumentPage } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/i18n/types";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Terms of Service",
    description:
      "The terms on which Fenghuai quotes, manufactures and supplies to dealers, distributors and OEM programmes.",
    alternates: localizedAlternates("/support/terms", locale),
    robots: { index: true, follow: true },
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
  const doc = await getLegalDocumentContent("terms");

  return <LegalDocumentPage doc={doc} />;
}
