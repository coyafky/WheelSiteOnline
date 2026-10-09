import type { Metadata } from "next";
import { getLegalDocument } from "@/content/legal";
import { LegalDocumentPage } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms on which Fenghuai quotes, manufactures and supplies to dealers, distributors and OEM programmes.",
  robots: { index: false, follow: false },
};

/**
 * Thin route: the document body lives in `@/content/legal` and the shared
 * renderer handles structure, the draft-pending-legal-review notice and
 * cross-navigation. Nothing is duplicated across the five support routes.
 */
export default function Page() {
  const doc = getLegalDocument("terms");

  // The slug is a literal, so this cannot be undefined at runtime; the guard
  // exists so the type narrows without a non-null assertion.
  if (!doc) {
    throw new Error("Missing legal document: terms");
  }

  return <LegalDocumentPage doc={doc} />;
}
