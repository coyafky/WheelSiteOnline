import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { footerNav, site } from "@/content/site";
import { createT } from "@/lib/i18n/use-t";
import type { Locale } from "@/lib/i18n/types";
import { localizedPath } from "@/lib/i18n/types";

/**
 * Site footer.
 *
 * Two things changed when the product architecture moved to four parallel
 * lines (see ARCHITECTURE/page-architecture/README.md §0①):
 *
 *   1. The brand tagline no longer says "custom forged wheels" — the company
 *      makes four product lines, and the old line made the site read as a
 *      wheel-only shop.
 *   2. The nav is now driven by `footerNav`'s four groups (Products / Company /
 *      Support / Enquiries) instead of the clone-era five columns, which still
 *      listed Monoblock / Two-Piece / Off-Road — the competitor's split, not
 *      the client's.
 *
 * All chrome text comes from the i18n dictionary; only link labels that exist
 * exclusively in the footer stay inline.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const hrefFor = (href: string) => localizedPath(href, locale);

  return (
    <footer className="overflow-hidden bg-ink text-white/70">
      <div className="container-fh">
        <div className="grid gap-10 border-b border-white/15 py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-end lg:py-24">
          <div>
            <p className="font-display text-[0.66rem] font-700 uppercase tracking-[0.24em] text-forge-bright">
              {t("footer.ctaEyebrow")}
            </p>
            <h2 className="mt-5 max-w-[900px] font-display text-[clamp(2.7rem,7vw,6.8rem)] font-800 uppercase leading-[0.82] tracking-[-0.035em] text-white">
              {t("footer.ctaHeading")}
            </h2>
          </div>
          <div className="lg:pb-2">
            <p className="max-w-md text-[0.98rem] leading-relaxed text-white/65">
              {t("footer.ctaBody")}
            </p>
            <Link
              href={hrefFor("/request-a-quote")}
              className="mt-7 inline-flex items-center gap-3 border-b border-forge-bright pb-2 font-display text-sm font-700 uppercase tracking-[0.12em] text-white transition-colors hover:text-forge-bright"
            >
              {t("cta.requestQuote")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid gap-14 border-b border-white/15 py-14 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] lg:py-18">
          <div>
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center border border-white/70 font-display text-sm font-800 tracking-[0.14em] text-white">
                FH
              </span>
              <div>
                <p className="font-display text-[1.45rem] font-800 uppercase leading-none tracking-[0.02em] text-white">
                  {site.name}
                </p>
                <p className="mt-1 font-display text-[0.58rem] font-700 uppercase tracking-[0.28em] text-forge-bright">
                  {t("brand.division")}
                </p>
              </div>
            </div>
            <p className="mt-7 max-w-sm font-display text-[1.05rem] font-600 uppercase leading-[1.4] tracking-[0.04em] text-white/85">
              {t("footer.tagline1")}
              <br />
              {t("footer.tagline2")}
            </p>
          </div>

          <nav
            aria-label={t("a11y.footerNav")}
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4"
          >
            {footerNav.map((group, groupIndex) => (
              <div key={group.headingKey}>
                <p className="font-display text-[0.6rem] font-700 tracking-[0.16em] text-forge-bright">
                  {String(groupIndex + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-white">
                  {t(group.headingKey)}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={`${group.headingKey}-${link.href}`}>
                      <Link
                        href={hrefFor(link.href)}
                        className="text-sm transition-colors hover:text-forge-bright"
                      >
                        {link.labelKey ? t(link.labelKey) : link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-8 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-5">
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} {site.name}. {t("footer.rights")}.
            </p>
            <LanguageSwitcher
              locale={locale}
              label={t("a11y.switchLanguage")}
              tone="dark"
            />
          </div>
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-forge-bright"
          >
            {t("cta.backToTop")}
            <span className="inline-flex size-8 items-center justify-center border border-white/25">
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
