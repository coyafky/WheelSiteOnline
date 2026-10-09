import type { Metadata } from "next";
import { getLegalDocument } from "@/content/legal";
import { LegalDocumentPage } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Shipping & Packaging",
  description:
    "How Fenghuai packs and ships orders — Incoterms, risk transfer, documentation and damage-in-transit procedure.",
  robots: { index: false, follow: false },
};

/**
 * Thin route: the document body lives in `@/content/legal` and the shared
 * renderer handles structure, the draft-pending-legal-review notice and
 * cross-navigation. Nothing is duplicated across the five support routes.
 */
export default function Page() {
  const doc = getLegalDocument("shipping");

  // The slug is a literal, so this cannot be undefined at runtime; the guard
  // exists so the type narrows without a non-null assertion.
  if (!doc) {
    throw new Error("Missing legal document: shipping");
  }

  return <LegalDocumentPage doc={doc} />;
}
