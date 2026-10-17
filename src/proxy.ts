import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  localeFromPathname,
  type Locale,
} from "@/lib/i18n/types";
import { siteUrlIsConfigured } from "@/lib/site-url";

export function proxy(request: NextRequest) {
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
