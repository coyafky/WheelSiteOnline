import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  isIndexableLocale,
  LOCALE_COOKIE,
  localeFromPathname,
  localizedPath,
  type Locale,
} from "@/lib/i18n/types";

function preferredLocale(request: NextRequest): Locale {
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;
  const accepted = request.headers.get("accept-language")?.toLowerCase() ?? "";
  for (const entry of accepted.split(",")) {
    const language = entry.trim().split(";", 1)[0]?.split("-", 1)[0];
    if (isLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}

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
    if (!isIndexableLocale(routedLocale)) {
      response.headers.set("X-Robots-Tag", "noindex, follow");
    }
    return response;
  }

  const preferred = preferredLocale(request);
  // A Next Link RSC prefetch can target an unprefixed href while a previously
  // visited locale is stored in the cookie. Redirecting that fetch to /zh/*
  // makes Next's localized rewrite redirect back to the original RSC URL,
  // causing ERR_TOO_MANY_REDIRECTS. Keep cookie preference for document
  // visits, but let router data requests use their explicit URL.
  // Next may consume the `rsc` header before Proxy; browser Fetch Metadata
  // still marks these background requests with Sec-Fetch-Dest: empty.
  const isRouterDataRequest =
    request.headers.get("rsc") === "1" ||
    request.headers.get("sec-fetch-dest") === "empty" ||
    request.nextUrl.searchParams.has("_rsc");
  if (!isLocalized && preferred !== DEFAULT_LOCALE && !isRouterDataRequest) {
    url.pathname = localizedPath(url.pathname, preferred);
    return NextResponse.redirect(url);
  }

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
  if (isLocalized && !isIndexableLocale(routedPathLocale)) {
    // 正文尚未逐页完成翻译前，独立 URL 可验收但不进入搜索索引。
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }
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
