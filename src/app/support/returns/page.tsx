import type { Metadata } from "next";
import { getLegalDocumentContent } from "@/lib/wordpress/legal";
import { LegalDocumentPage } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description:
    "How Fenghuai handles returns for made-to-order aluminum components — defect, error, cancellation and restocking terms.",
  robots: { index: false, follow: false },
};

/**
 * Thin route: the document body is read from Headless WordPress (page key
 * `legal-<slug>`) through `@/lib/wordpress/legal`, which falls back to the
 * checked-in English constant. The shared renderer handles structure, the
 * draft-pending-legal-review notice and cross-navigation. Nothing is
 * duplicated across the five support routes.
 */
export default async function Page() {
  const doc = await getLegalDocumentContent("returns");

  return <LegalDocumentPage doc={doc} />;
}
