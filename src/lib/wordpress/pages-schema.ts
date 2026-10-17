import { z } from "zod";
import type {
  WordpressLocalePageResponse,
  WordpressPageCollection,
} from "./pages-contract";

/**
 * Structural schemas for the Pages REST payloads.
 *
 * The domain normalisers (`normalizeWordpressLocalePage` /
 * `normalizeWordpressPage`) already enforce the *publication* rules — key and
 * locale match, approved status, non-empty SEO. What they cannot do is survive a
 * payload whose shape is wrong in the first place: `items` arriving as an object
 * instead of an array throws before any of those checks run.
 *
 * These schemas pin the envelope only. Record-level tolerance stays with the
 * normalisers, which turn a bad record into an explicit non-public status.
 *
 * Each schema is annotated with the domain type so the parsed output is exactly
 * what callers already expect; unknown keys are stripped rather than carried
 * through.
 */

const pageFieldsSchema = z.object({
  page_key: z.string().optional(),
  locale: z.enum(["en", "zh", "es", "th"]).optional(),
  revision: z.string().optional(),
  schema_version: z.number().optional(),
  publication_status: z.enum(["draft", "approved", "withdrawn"]).optional(),
  content: z.unknown().optional(),
  content_by_locale: z.record(z.string(), z.unknown()).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_by_locale: z
    .record(
      z.string(),
      z.object({ title: z.string().optional(), description: z.string().optional() }),
    )
    .optional(),
  locale_status: z.record(z.string(), z.enum(["draft", "approved", "withdrawn"])).optional(),
  image: z
    .object({
      id: z.number().optional(),
      src: z.string().optional(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })
    .nullish(),
});

const pageRecordSchema = z.object({
  id: z.number(),
  slug: z.string(),
  // Only the statuses the publication rules reason about; anything else is
  // treated as non-publishable downstream.
  status: z.enum(["publish", "draft", "pending", "private", "future", "trash"]).optional(),
  title: z.object({ rendered: z.string() }),
  content: z.object({ rendered: z.string() }),
  page: pageFieldsSchema.optional(),
});

export const wordpressPageCollectionSchema: z.ZodType<WordpressPageCollection> = z.object({
  authoritative: z.boolean(),
  items: z.array(pageRecordSchema),
});

export const wordpressLocalePageResponseSchema: z.ZodType<WordpressLocalePageResponse> = z.object({
  authoritative: z.boolean(),
  status: z.enum(["ready", "missing-locale", "unpublished", "withdrawn"]),
  item: pageRecordSchema.optional(),
});
