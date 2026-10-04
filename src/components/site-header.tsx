"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { primaryNav, site } from "@/content/site";
import { useScrolled } from "@/hooks/use-scrolled";
import { createT } from "@/lib/i18n/use-t";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  // Remount the bar on every route change so the mobile menu and any open
  // submenu start closed. Using `key` is React's sanctioned way to reset state
  // — doing it with a `pathname` effect would either fire a cascading render
  // or, if done during render, desync the client tree from the server HTML and
  // break every following client-side navigation.
  return <HeaderBar key={pathname} locale={locale} />;
}

/**
 * Resolve a nav label through the dictionary, falling back to the English
 * string in the content module.
 *
 * The nav data still carries English `label`s because it lives in a plain
 * content module with no access to the render-time locale; every entry now
 * pairs one with a `labelKey` so the chrome localises like the rest of the
 * page instead of staying English-only.
 */
function navLabel(
  t: (key: string) => string,
  item: { label: string; labelKey?: string },
): string {
  if (!item.labelKey) return item.label;
  const translated = t(item.labelKey);
  // `createT` returns the key itself when it is missing from the dictionary —
  // falling back to the English label keeps a missing key visible as English
  // rather than showing the raw dot-path to a visitor.
  return translated === item.labelKey ? item.label : translated;
}

function HeaderBar({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const scrolled = useScrolled(16);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Lock body scroll while the mobile nav is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close if the viewport grows into desktop territory.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Over a dark hero the bar is a translucent plate so the photography reads
  // through it (hero PageSpec §4, option A); scrolled or opened it turns solid.
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,color] duration-200 ease-out",
        solid
          ? "bg-white/96 text-ink shadow-[0_12px_32px_rgba(11,15,22,0.10)] backdrop-blur-xl"
          : "bg-hero/72 text-white backdrop-blur-xl",
      )}
    >
      <div className="container-fh flex h-[74px] items-center justify-between gap-6 lg:h-[86px]">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${site.name} home`}
        >
          <Wordmark solid={solid} />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label={t("a11y.primaryNav")}
          className="hidden items-center gap-0.5 xl:flex"
        >
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            if (!item.children) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "eyebrow whitespace-nowrap rounded-full px-2.5 py-2 !text-[0.7rem] !tracking-[0.1em] transition-colors xl:px-3",
                    solid ? "text-ink/80 hover:text-forge" : "text-white/80 hover:text-white",
                    active && "!text-forge",
                  )}
                >
                  {navLabel(t, item)}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="group relative"
                onMouseEnter={() => setExpanded(item.label)}
                onMouseLeave={() => setExpanded(null)}
              >
                <button
                  type="button"
                  aria-expanded={expanded === item.label}
                  aria-controls={`submenu-${item.label}`}
                  onClick={() =>
                    setExpanded(expanded === item.label ? null : item.label)
                  }
                  className={cn(
                    "eyebrow flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 !text-[0.7rem] !tracking-[0.1em] transition-colors xl:px-3",
                    solid ? "text-ink/80 hover:text-forge" : "text-white/80 hover:text-white",
                    active && "!text-forge",
                  )}
                >
                  {navLabel(t, item)}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      expanded === item.label && "rotate-180",
                    )}
                  />
                </button>

                <div
                  id={`submenu-${item.label}`}
                  data-nav-submenu
                  className={cn(
                    "absolute left-0 top-full min-w-[220px] origin-top pt-2 transition-[opacity,transform] duration-150",
                    expanded === item.label
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none -translate-y-1 opacity-0",
                  )}
                >
                  <div className="overflow-hidden rounded-lg border border-border bg-white py-2 shadow-[0_20px_60px_rgba(11,15,22,0.14)]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-ink/80 transition-colors hover:bg-soft hover:text-forge"
                      >
                        {navLabel(t, child)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher
            locale={locale}
            label={t("a11y.switchLanguage")}
            tone={solid ? "light" : "dark"}
          />

          <Link
            href="/request-a-quote"
            className={cn(
              "hidden xl:inline-flex",
              solid ? "btn-pill-solid" : "btn-pill-outline !text-white",
            )}
          >
            {t("cta.requestQuote")}
          </Link>

          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full border transition-colors xl:hidden",
              solid ? "border-border text-ink" : "border-white/40 text-white",
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("a11y.closeNav") : t("a11y.openNav")}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-border bg-white transition-[max-height] duration-300 ease-out xl:hidden",
          open ? "max-h-[80vh] overflow-y-auto" : "max-h-0",
        )}
      >
        <nav aria-label={t("a11y.mobileNav")} className="container-fh py-4">
          {primaryNav.map((item) => (
            <div key={item.label} className="border-b border-border/60 last:border-0">
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  className="eyebrow py-4 !text-[0.74rem] text-ink"
                  onClick={() => setOpen(false)}
                >
                  {navLabel(t, item)}
                </Link>
                {item.children ? (
                  <button
                    type="button"
                    aria-label={`Toggle ${item.label} submenu`}
                    aria-expanded={expanded === item.label}
                    onClick={() =>
                      setExpanded(expanded === item.label ? null : item.label)
                    }
                    className="p-2 text-steel"
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        expanded === item.label && "rotate-180",
                      )}
                    />
                  </button>
                ) : null}
              </div>

              {item.children ? (
                <div
                  className={cn(
                    "grid overflow-hidden transition-[grid-template-rows] duration-200",
                    expanded === item.label
                      ? "grid-rows-[1fr] pb-3"
                      : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block py-2 pl-4 text-sm text-steel"
                        onClick={() => setOpen(false)}
                      >
                        {navLabel(t, child)}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          <div className="flex flex-col gap-3 py-5">
            <Link
              href="/request-a-quote"
              className="btn-pill-solid w-full"
              onClick={() => setOpen(false)}
            >
              {t("cta.requestQuote")}
            </Link>
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 text-sm text-steel"
            >
              <Phone className="size-4" />
              {site.contact.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/** Wordmark with a light/dark variant swap driven by header state. */
function Wordmark({ solid }: { solid: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span
        className={cn(
          "font-display text-[1.35rem] font-800 uppercase leading-none tracking-tight transition-colors",
          solid ? "text-ink" : "text-white",
        )}
      >
        Fenghuai
      </span>
      <span
        className={cn(
          "font-display text-[0.68rem] font-600 uppercase leading-none tracking-[0.2em] transition-colors",
          solid ? "text-forge" : "text-white/70",
        )}
      >
        Forged
      </span>
    </span>
  );
}
