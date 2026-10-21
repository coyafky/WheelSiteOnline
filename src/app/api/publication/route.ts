import { NextResponse } from "next/server";
import { getPublicLocalesForPath } from "@/lib/i18n/publication";
import { isLocale } from "@/lib/i18n/types";

/**
 * Internal publication lookup used by the Proxy.
 *
 * The Proxy needs to know whether a given locale of a path is approved, but it
 * cannot import the publication module (marked `server-only`, and it pulls in
 * the WordPress adapters). This route is the single source of truth it queries.
 *
 * It leaks nothing beyond what the sitemap already publishes: only the list of
 * locales whose bodies have been approved for that path.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") ?? "/";
  const locale = url.searchParams.get("locale");

  if (!path.startsWith("/")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }
  if (locale !== null && !isLocale(locale)) {
    return NextResponse.json({ error: "invalid locale" }, { status: 400 });
  }

  const publicLocales = await getPublicLocalesForPath(path);
  return NextResponse.json(
    { publicLocales },
    { headers: { "cache-control": "no-store" } },
  );
}
