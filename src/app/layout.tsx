import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import { Barlow_Condensed, Figtree } from "next/font/google";
import { SiteMotion } from "@/components/site-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLocale } from "@/lib/i18n";
import {
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/types";
import { getPublicLocalesForPath, getRoutePublicationDecision } from "@/lib/i18n/publication";
import {
  jsonLdGraph,
  organizationJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";
import { siteUrl, siteUrlIsConfigured } from "@/lib/site-url";
import { site } from "@/content/site";
import { Providers } from "./providers";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-text",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow_Condensed({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

/**
 * Site-wide metadata.
 *
 * ── The title suffix is the brand, NOT the product (rewritten 2026-10-02) ──
 * Both the `default` and the `template` used to end in "Fenghuai Forged Wheels".
 * Because `template` appends to *every* page title, every search result on the
 * site read as a wheel shop — including `/products/ev-components`,
 * `/products/custom-aluminum` and `/products/safety-tires`, which sell things
 * that are not wheels and are not forged.
 *
 * A title suffix is the one string the whole site cannot escape, so it has to
 * be the thing all four lines share: the company. Pages describe their own
 * subject through their own `title`; the suffix says whose page it is.
 *
 * ⚠️ `metadataBase` is still the placeholder domain in `content/site.ts`
 * (`fenghuai.com`) — confirm before launch along with the contact details.
 */
const baseMetadata: Metadata = {
  title: {
    default: "Fenghuai | Automotive Components",
    template: "%s | Fenghuai",
  },
  description:
    "Fenghuai coordinates projects across four automotive lines: wheels, EV housings, custom aluminum components and self-sealing tires. Scope and supporting records are confirmed for each project.",
  metadataBase: siteUrl,
};

/** 为当前开放索引的语言输出自 canonical 与 hreflang。 */
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = await getLocale();
  const publicPath = requestHeaders.get("x-fh-public-path") || "/";
  const basePath = stripLocalePrefix(publicPath);
  if ((await draftMode()).isEnabled || !siteUrlIsConfigured) {
    return { ...baseMetadata, robots: { index: false, follow: true }, alternates: {} };
  }
  const readyLocales = await getPublicLocalesForPath(basePath);
  if (!readyLocales.includes(locale)) {
    return {
      ...baseMetadata,
      robots: { index: false, follow: true },
      alternates: { languages: {} },
    };
  }
  const languages = Object.fromEntries(
    readyLocales.map((locale) => [locale, localizedPath(basePath, locale)]),
  );
  return {
    ...baseMetadata,
    alternates: {
      canonical: localizedPath(basePath, locale),
      languages: {
        ...languages,
        ...(readyLocales.includes("en") ? { "x-default": localizedPath(basePath, "en") } : {}),
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const requestHeaders = await headers();
  const basePath = stripLocalePrefix(requestHeaders.get("x-fh-public-path") || "/");
  const decision = await getRoutePublicationDecision(basePath, locale, (await draftMode()).isEnabled);
  const availableLocales = decision.publicLocales;

  /**
   * Site-level entities. Emitted from the layout because Organization and
   * WebSite describe the publisher, not the page — every page needs them once.
   *
   * Skipped entirely when no site URL is configured: the fallback is
   * localhost:3000, and publishing that as the Organization's `@id` would teach
   * search engines a wrong identity that outlives the preview.
   */
  const publisher = {
    name: site.name,
    description: site.description,
    contact: {
      confirmed: site.contact.confirmed,
      email: site.contact.email,
      phone: site.contact.phone,
    },
  };
  const siteStructuredData = siteUrlIsConfigured
    ? jsonLdGraph([
        organizationJsonLd(siteUrl.toString(), publisher),
        websiteJsonLd(siteUrl.toString(), availableLocales, publisher),
      ])
    : null;

  /**
   * Withheld translations are rejected earlier by `proxy.ts`, which answers a
   * real 404 with an explicit noindex. `notFound()` is not allowed inside the
   * root layout (Next 16), so this component must not try to enforce that here.
   *
   * A route that does not exist at all is a different case: it is left to Next's
   * not-found surface.
   */
  return (
    <html
      lang={htmlLanguage(locale)}
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${figtree.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {siteStructuredData ? (
          <script
            type="application/ld+json"
            // Read by crawlers, never executed as script. The serializer escapes
            // `<`, so CMS content embedded here cannot close the tag early.
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteStructuredData) }}
          />
        ) : null}
        <Providers locale={locale}>
          <SiteMotion />
          <SiteHeader locale={locale} availableLocales={availableLocales} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter locale={locale} availableLocales={availableLocales} />
        </Providers>
      </body>
    </html>
  );
}

function htmlLanguage(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : locale === "es" ? "es-ES" : "en";
}
