import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  localeFromPathname,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/types";
import { siteUrlIsConfigured } from "@/lib/site-url";

/**
 * Ask the app whether one locale of a path may be served publicly.
 *
 * Proxy cannot import the publication module directly: it is marked
 * `server-only` and pulls in the WordPress adapters. A same-origin request to an
 * internal route keeps the rules in one place instead of duplicating them.
 *
 * Fails closed — any error means "not approved", so an unreviewed translation
 * is never exposed.
 */
async function isLocaleWithheld(origin: string, path: string, locale: Locale): Promise<boolean> {
  try {
    const response = await fetch(
      `${origin}/api/publication?path=${encodeURIComponent(path)}&locale=${locale}`,
      { headers: { "x-fh-internal": "proxy" }, cache: "no-store" },
    );
    if (!response.ok) return true;
    const body = (await response.json()) as { publicLocales?: unknown };
    if (!Array.isArray(body.publicLocales)) return true;
    return !(body.publicLocales as string[]).includes(locale);
  } catch {
    return true;
  }
}

/**
 * A withheld translation answers 404 with an explicit noindex, matching the
 * published contract (status + header + meta agree).
 */
function withheldResponse(locale: Locale): NextResponse {
  const html = `<!doctype html><html lang="${languageTag(locale)}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Not found</title></head><body><h1>404</h1></body></html>`;
  return new NextResponse(html, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-language": languageTag(locale),
      "x-robots-tag": "noindex",
      "cache-control": "no-store",
    },
  });
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const routedPathLocale = localeFromPathname(url.pathname);
  const isLocalized = routedPathLocale !== DEFAULT_LOCALE;
  const routedLocale = request.headers.get("x-fh-locale");

  // A `/zh/*` rewrite re-enters Proxy at its internal unprefixed pathname.
  // Preserve the locale header instead of redirecting that internal pass back
  // to `/zh/*`, which would create a rewrite/redirect loop.
  if (!isLocalized && isLocale(routedLocale) && routedLocale !== DEFAULT_LOCALE) {
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.headers.set("Content-Language", languageTag(routedLocale));
    if (!siteUrlIsConfigured) response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }

  // URL choice is explicit. A stale locale cookie or Accept-Language value must
  // never redirect an English URL to a language version that is still a draft.

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-fh-locale", routedPathLocale);
  requestHeaders.set("x-fh-public-path", url.pathname);

  let response: NextResponse;
  if (isLocalized) {
    // Decide before rewriting: Next 16 does not re-enter Proxy for the internal
    // unprefixed pass, so the withheld check has to happen here, once.
    const publicPath = stripLocalePrefix(request.nextUrl.pathname);
    if (await isLocaleWithheld(request.nextUrl.origin, publicPath, routedPathLocale)) {
      return withheldResponse(routedPathLocale);
    }

    url.pathname = request.nextUrl.pathname === `/${routedPathLocale}`
      ? "/"
      : request.nextUrl.pathname.slice(`/${routedPathLocale}`.length);
    response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }
  response.cookies.set(LOCALE_COOKIE, routedPathLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  response.headers.set("Content-Language", languageTag(routedPathLocale));
  if (!siteUrlIsConfigured) response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}

function languageTag(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : locale === "es" ? "es-ES" : "en";
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
