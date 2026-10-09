import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  INSIGHTS_CACHE_TAG,
  insightRevalidationPaths,
  validInsightPreviewSlug,
} from "@/lib/wordpress/insights-contract";
import {
  WHEEL_PUBLICATION_TAG,
  wheelRevalidationPaths,
} from "@/lib/wordpress/wheels-contract";

function validSignature(body: string, provided: string | null): boolean {
  const expected = process.env.WP_REVALIDATE_SECRET?.trim();
  if (!expected || !provided) return false;
  const signature = provided.startsWith("sha256=") ? provided.slice(7) : "";
  const expectedSignature = createHmac("sha256", expected).update(body).digest("hex");
  const left = Buffer.from(expectedSignature);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-fh-signature"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const body = (() => {
    try {
      return JSON.parse(rawBody) as { type?: unknown; slug?: unknown };
    } catch {
      return null;
    }
  })() as {
    type?: unknown;
    slug?: unknown;
  } | null;
  const type = body?.type === "wheels" ? "wheels" : body?.type === "insights" ? "insights" : null;
  if (!type) {
    return NextResponse.json({ ok: false, error: "Invalid content type." }, { status: 422 });
  }
  const slug = validInsightPreviewSlug(typeof body?.slug === "string" ? body.slug : null);
  const tag = type === "wheels" ? WHEEL_PUBLICATION_TAG : INSIGHTS_CACHE_TAG;
  const paths = type === "wheels"
    ? wheelRevalidationPaths(slug ?? undefined)
    : insightRevalidationPaths(slug ?? undefined);
  revalidateTag(tag, { expire: 0 });
  for (const path of paths) revalidatePath(path);
  return NextResponse.json({ ok: true, type, tag, paths });
}
