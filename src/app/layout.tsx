import type { Metadata } from "next";
import { headers } from "next/headers";
import { Barlow_Condensed, Figtree } from "next/font/google";
import { SiteMotion } from "@/components/site-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLocale } from "@/lib/i18n";
import {
  INDEXABLE_LOCALES,
  localizedPath,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/types";
import { siteUrl } from "@/lib/site-url";
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
    default: "Fenghuai | Aluminum Component Manufacturer",
    template: "%s | Fenghuai",
  },
  description:
    "Fenghuai manufactures aluminium components across four product lines — forged wheels, EV powertrain housings, custom aluminium parts and self-healing safety tires — for dealers, Tier 1 suppliers and OEM programmes.",
  metadataBase: siteUrl,
};

/** 只为已经通过正文审核的语言输出 hreflang，避免把未翻译页面伪装成多语言页面。 */
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = await getLocale();
  const publicPath = requestHeaders.get("x-fh-public-path") || "/";
  const basePath = stripLocalePrefix(publicPath);
  if (!INDEXABLE_LOCALES.includes(locale as (typeof INDEXABLE_LOCALES)[number])) {
    return { ...baseMetadata, alternates: { languages: {} } };
  }
  const languages = Object.fromEntries(
    INDEXABLE_LOCALES.map((locale) => [locale, localizedPath(basePath, locale)]),
  );
  return { ...baseMetadata, alternates: { languages } };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={htmlLanguage(locale)}
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${figtree.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers locale={locale}>
          <SiteMotion />
          <SiteHeader locale={locale} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter locale={locale} />
        </Providers>
      </body>
    </html>
  );
}

function htmlLanguage(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : locale === "es" ? "es-ES" : "en";
}
