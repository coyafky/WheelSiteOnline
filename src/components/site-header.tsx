"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { primaryNav, site } from "@/content/site";
import { createT } from "@/lib/i18n/use-t";
import { localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

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
  const pathname = stripLocalePrefix(usePathname());
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

  const hrefFor = (href: string) => localizedPath(href, locale);
  // The warm-light system uses the same readable header over every page hero.
  const solid = true;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,color] duration-200 ease-out",
        solid
          ? "border-b border-border bg-background/96 text-ink shadow-[0_8px_24px_rgba(41,38,33,0.06)] backdrop-blur-xl"
          : "border-b border-white/10 bg-transparent text-white",
      )}
    >
      <div className="container-fh flex h-[78px] items-center justify-between gap-5 lg:h-[92px]">
        <Link
          href={hrefFor("/")}
          className="group flex items-center gap-3"
          aria-label={`${site.name} home`}
        >
          <Wordmark solid={solid} division={t("brand.division")} />
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
                  href={hrefFor(item.href)}
                  className={cn(
                    "relative whitespace-nowrap border-b-2 border-transparent px-2.5 py-3 font-display text-[0.76rem] font-700 uppercase tracking-[0.08em] transition-colors xl:px-3",
                    solid ? "text-ink/80 hover:text-forge" : "text-white/80 hover:text-white",
                    active && (solid ? "border-forge !text-forge" : "border-forge-bright !text-white"),
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
                  onClick={(event) => {
                    setExpanded((current) => {
                      // A pointer enters the wrapper before click, so hover has
                      // already opened this menu. A pointer click must keep it
                      // open instead of immediately toggling it closed. Keyboard
                      // activation has detail=0 and retains true toggle behavior.
                      if (event.detail > 0) return item.label;
                      return current === item.label ? null : item.label;
                    });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setExpanded(null);
                      event.currentTarget.focus();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap border-b-2 border-transparent px-2.5 py-3 font-display text-[0.76rem] font-700 uppercase tracking-[0.08em] transition-colors xl:px-3",
                    solid ? "text-ink/80 hover:text-forge" : "text-white/80 hover:text-white",
                    active && (solid ? "border-forge !text-forge" : "border-forge-bright !text-white"),
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
                        href={hrefFor(child.href)}
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

        <div className="flex items-center gap-5">
          <div className="hidden xl:block">
            <LanguageSwitcher
              locale={locale}
              label={t("a11y.switchLanguage")}
              tone={solid ? "light" : "dark"}
            />
          </div>
          <Link
            href={hrefFor("/request-a-quote")}
            className={cn(
              "group hidden min-h-10 items-center gap-2 whitespace-nowrap px-1 font-display text-[0.72rem] font-700 uppercase tracking-[0.1em] transition-colors xl:inline-flex",
              solid ? "text-forge hover:text-forge-deep" : "text-forge-bright hover:text-white",
            )}
          >
            {t("cta.requestQuote")}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
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
                  href={hrefFor(item.href)}
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
                      setExpanded((current) =>
                        current === item.label ? null : item.label,
                      )
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
                        href={hrefFor(child.href)}
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

          <div className="flex items-center justify-between gap-5 py-5">
            <LanguageSwitcher
              locale={locale}
              label={t("a11y.switchLanguage")}
            />
            <Link
              href={hrefFor("/request-a-quote")}
              className="group inline-flex min-h-11 items-center gap-2 bg-forge px-4 font-display text-[0.72rem] font-700 uppercase tracking-[0.1em] text-white transition-colors hover:bg-forge-deep"
              onClick={() => setOpen(false)}
            >
              {t("cta.requestQuote")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="pb-5">
            {site.contact.confirmed ? (
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 text-sm text-steel"
              >
                <Phone className="size-4" />
                {site.contact.phone}
              </a>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}

/** Wordmark with a light/dark variant swap driven by header state. */
function Wordmark({ solid, division }: { solid: boolean; division: string }) {
  return (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-10 place-items-center border font-display text-[0.78rem] font-800 tracking-[0.12em] transition-colors",
          solid
            ? "border-ink bg-ink text-white"
            : "border-white/75 bg-white/5 text-white",
        )}
        aria-hidden="true"
      >
        FH
      </span>
      <span className="flex flex-col gap-1">
      <span
        className={cn(
          "font-display text-[1.28rem] font-800 uppercase leading-none tracking-[0.01em] transition-colors",
          solid ? "text-ink" : "text-white",
        )}
      >
        Fenghuai
      </span>
      <span
        className={cn(
          "font-display text-[0.58rem] font-700 uppercase leading-none tracking-[0.28em] transition-colors",
          solid ? "text-forge" : "text-white/70",
        )}
      >
        {division}
      </span>
      </span>
    </span>
  );
}
