import type { Metadata } from "next";
import { getLegalDocument } from "@/content/legal";
import { LegalDocumentPage } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data Fenghuai collects from enquiries and orders, why, who it is shared with, and your rights.",
};

/**
 * Thin route: the document body lives in `@/content/legal` and the shared
 * renderer handles structure, the draft-pending-legal-review notice and
 * cross-navigation. Nothing is duplicated across the five support routes.
 */
export default function Page() {
  const doc = getLegalDocument("privacy");

  // The slug is a literal, so this cannot be undefined at runtime; the guard
  // exists so the type narrows without a non-null assertion.
  if (!doc) {
    throw new Error("Missing legal document: privacy");
  }

  return <LegalDocumentPage doc={doc} />;
}
