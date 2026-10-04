import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { footerNav, site } from "@/content/site";
import { createT } from "@/lib/i18n/use-t";
import type { Locale } from "@/lib/i18n/types";

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

  return (
    <footer className="bg-ink text-white/70">
      <div className="container-fh py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          {/* Brand block */}
          <div className="max-w-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[1.5rem] font-800 uppercase leading-none tracking-tight text-white">
                {site.name}
              </span>
              <span className="font-display text-[0.7rem] font-600 uppercase leading-none tracking-[0.2em] text-forge">
                {site.shortName ?? "Forged"}
              </span>
            </div>

            <p className="mt-5 font-display text-[1.05rem] font-600 uppercase leading-[1.35] tracking-wide text-white/90">
              {t("footer.tagline1")}
              <br />
              {t("footer.tagline2")}
            </p>

            <div className="mt-6 space-y-1.5 text-sm">
              <p>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="transition-colors hover:text-forge"
                >
                  {site.contact.email}
                </a>
              </p>
              <p>{site.contact.phone}</p>
              <p className="text-white/50">{site.contact.hours}</p>
            </div>
          </div>

          {/* Navigation groups — four, matching footerNav */}
          <nav
            aria-label={t("a11y.footerNav")}
            className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-10"
          >
            {footerNav.map((group) => (
              <div key={group.headingKey}>
                <h2 className="font-display text-[0.72rem] font-700 uppercase tracking-[0.16em] text-white">
                  {t(group.headingKey)}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={`${group.headingKey}-${link.href}`}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-forge"
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

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} {site.name}. {t("footer.rights")}.
          </p>

          <a
            href="#top"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-forge"
          >
            {t("cta.backToTop")}
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-white/25">
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
