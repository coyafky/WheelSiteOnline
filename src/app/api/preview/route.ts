import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getInsightGuideDocument } from "@/lib/wordpress/insights";
import { validInsightPreviewSlug } from "@/lib/wordpress/insights-contract";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = process.env.WP_PREVIEW_SECRET?.trim();
  const slug = validInsightPreviewSlug(url.searchParams.get("slug"));
  if (!secret || url.searchParams.get("secret") !== secret || !slug) {
    return new Response("Invalid preview request.", { status: 401 });
  }

  const document = await getInsightGuideDocument(slug, { preview: true });
  if (!document) return new Response("Preview content not found.", { status: 404 });

  const draft = await draftMode();
  draft.enable();
  redirect(`/insights/${document.guide.slug}`);
}
