import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/types";

function preferredLocale(request: NextRequest): Locale {
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;
  const accepted = request.headers.get("accept-language")?.toLowerCase() ?? "";
  return accepted.split(",").some((entry) => entry.trim().startsWith("zh"))
    ? "zh"
    : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isChinese = url.pathname === "/zh" || url.pathname.startsWith("/zh/");
  const routedLocale = request.headers.get("x-fh-locale");

  // A `/zh/*` rewrite re-enters Proxy at its internal unprefixed pathname.
  // Preserve the locale header instead of redirecting that internal pass back
  // to `/zh/*`, which would create a rewrite/redirect loop.
  if (!isChinese && routedLocale === "zh") {
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.headers.set("Content-Language", "zh-CN");
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }

  if (!isChinese && preferredLocale(request) === "zh") {
    url.pathname = url.pathname === "/" ? "/zh" : `/zh${url.pathname}`;
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-fh-locale", isChinese ? "zh" : "en");
  requestHeaders.set("x-fh-public-path", url.pathname);

  let response: NextResponse;
  if (isChinese) {
    url.pathname = request.nextUrl.pathname === "/zh"
      ? "/"
      : request.nextUrl.pathname.slice(3);
    response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }
  response.cookies.set(LOCALE_COOKIE, isChinese ? "zh" : "en", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  response.headers.set("Content-Language", isChinese ? "zh-CN" : "en");
  if (isChinese) {
    // 正文尚未逐页完成中文内容前，独立 URL 可验收但不进入搜索索引。
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
