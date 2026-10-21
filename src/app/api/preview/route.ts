import { timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getInsightGuideDocument } from "@/lib/wordpress/insights";
import { validInsightPreviewSlug } from "@/lib/wordpress/insights-contract";
import { getWordpressPageDocument } from "@/lib/wordpress/pages";
import { getWordpressPageResult } from "@/lib/wordpress/pages";
import { isLocale, localizedPath } from "@/lib/i18n/types";

const pagePreviewPaths: Record<string, string> = {
  "request-a-quote": "/request-a-quote",
  privacy: "/support/privacy",
  "thank-you": "/thank-you",
  home: "/",
};

/**
 * Constant-time comparison for the preview secret.
 *
 * Previously this used `!==`, which short-circuits on the first differing byte
 * and leaks timing information. The revalidation route already compared with
 * `timingSafeEqual`; this brings the two in line.
 */
function validPreviewSecret(provided: string | null): boolean {
  const expected = process.env.WP_PREVIEW_SECRET?.trim();
  if (!expected || !provided) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  // `secret` may arrive either as a query parameter (legacy links and the WP
  // editor) or as the `x-fh-preview-secret` header, which never reaches the
  // access log. The header is preferred when both are present.
  const providedSecret =
    request.headers.get("x-fh-preview-secret") ?? url.searchParams.get("secret");
  const slug = validInsightPreviewSlug(url.searchParams.get("slug"));
  const pageKey = url.searchParams.get("page")?.trim() ?? "";
  const pagePath = pagePreviewPaths[pageKey];
  if (!validPreviewSecret(providedSecret) || (!slug && !pagePath)) {
    return new Response("Invalid preview request.", { status: 401 });
  }

  if (pagePath) {
    const requestedLocale = url.searchParams.get("locale");
    const locale = isLocale(requestedLocale) ? requestedLocale : "en";
    if (pageKey === "home") {
      const result = await getWordpressPageResult(pageKey, { preview: true, locale });
      if (result.status !== "ready") return new Response("Preview content not found.", { status: 404 });
    } else {
      const document = await getWordpressPageDocument(pageKey, { preview: true, locale });
      if (!document) return new Response("Preview content not found.", { status: 404 });
    }

    const draft = await draftMode();
    draft.enable();
    redirect(localizedPath(pagePath, locale));
  }

  const document = await getInsightGuideDocument(slug!, { preview: true });
  if (!document) return new Response("Preview content not found.", { status: 404 });

  const draft = await draftMode();
  draft.enable();
  redirect(`/insights/${document.guide.slug}`);
}
