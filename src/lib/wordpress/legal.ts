import "server-only";

import { getLegalDocument } from "@/content/legal";
import type { LegalDocument } from "@/content/types";
import { getLocale } from "@/lib/i18n";
import { resolveLocalized } from "@/lib/i18n/localized-page";

import { getWordpressPageDocument } from "./pages";

/**
 * WordPress-backed legal documents.
 *
 * The five support documents used to be read straight out of the checked-in
 * `legalDocuments` constant in `@/content/legal`. That constant is the English
 * master, and a constant cannot carry a translation, so this adapter moves the
 * body copy onto native WordPress pages and keeps the constant only as the
 * English fallback — the same shape as `safety-tires.ts`.
 *
 * Page key convention is `legal-<slug>`. The prefix matters: it keeps a legal
 * record from ever colliding with a business page key (`privacy` is already
 * used by the privacy *contact* page's metadata read, which is a different
 * document from this policy body).
 */

/** The slugs the five `/support/*` routes and the seeder both agree on. */
export const LEGAL_DOCUMENT_SLUGS = [
  "warranty",
  "returns",
  "shipping",
  "terms",
  "privacy",
] as const;

export type LegalDocumentSlug = (typeof LEGAL_DOCUMENT_SLUGS)[number];

/**
 * Single source of truth for the slug → WordPress page key mapping, so the
 * routes and the seeding script can never drift apart.
 */
export function legalPageKey(slug: LegalDocumentSlug | string): string {
  return `legal-${slug}`;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isLegalSection(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    nonEmptyString(candidate.heading) &&
    Array.isArray(candidate.body) &&
    candidate.body.every(nonEmptyString)
  );
}

function isLegalDocument(value: unknown): value is LegalDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    nonEmptyString(candidate.slug) &&
    nonEmptyString(candidate.title) &&
    nonEmptyString(candidate.eyebrow) &&
    nonEmptyString(candidate.summary) &&
    nonEmptyString(candidate.intro) &&
    Array.isArray(candidate.sections) &&
    candidate.sections.every(isLegalSection)
  );
}

/**
 * Resolve one legal document for the active locale.
 *
 * Reads from the WordPress page (`legal-<slug>`) when it is published and
 * approved, falling back to the checked-in English constant otherwise. The
 * returned object always comes from whichever source won — never a merge —
 * so an English render stays byte-identical to the constant.
 */
export async function getLegalDocumentContent(
  slug: LegalDocumentSlug,
): Promise<LegalDocument> {
  const fallback = getLegalDocument(slug);
  if (!fallback) {
    throw new Error(`Missing legal document: ${slug}`);
  }

  const locale = await getLocale();
  const native = await getWordpressPageDocument<LegalDocument>(
    legalPageKey(slug),
    { locale },
  );
  const { content } = resolveLocalized<LegalDocument>({
    requested:
      native && isLegalDocument(native.content) ? native.content : null,
    default: fallback,
    locale,
    scope: `legal:${slug}`,
  });
  return content;
}
