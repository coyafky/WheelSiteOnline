import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { getTranslator } from "@/lib/i18n";

/**
 * Closing conversion band used at the foot of most pages.
 * Deliberately text-forward — the only accent surface on the page.
 *
 * ── Default copy is company-level (rewritten 2026-10-02) ───────────────────
 * The defaults used to read "Open a forged wheel line with us … your target
 * fitments and volumes … a production window" — wheel-only, and the phrase
 * "production window" restated the unconfirmed 20–30 day lead time. Twenty of
 * the twenty-five call sites use the bare `<DealerCta />`, so those defaults
 * were the site-wide footer copy, not the homepage's.
 *
 * The defaults are now part-art, part-agnostic: they must read correctly on
 * the EV housing pages, the aluminium pages and the tire pages too. Pages that
 * know their own offer pass `title`/`body` — see `caCta` in
 * `content/custom-aluminum.ts` and `customDevCta` in
 * `content/custom-development.ts`. That is the preferred pattern; the defaults
 * are only the fallback.
 *
 * ── `variant="closing"` (2026-10-02) ────────────────────────────────────────
 * The closing action sits under the copy on short final sections. The former
 * floating quote pill was removed site-wide on 2026-10-11; this layout remains
 * useful for a clear single conversion action at the end of a page.
 *
 * ── Localised defaults (2026-10-11) ─────────────────────────────────────────
 * The eyebrow, title, body and button label were hardcoded English, so this
 * band stayed English on every localized page. They now resolve through the
 * dictionary. `title`/`body` remain real overrides — a page that knows its own
 * offer still wins over the dictionary defaults.
 *
 * This component is async so it can read the request locale. Every call site is
 * a server component; do not import it from a client component (the translator
 * pulls in `next/headers`).
 */

export async function DealerCta({
  title,
  body,
  variant = "default",
}: {
  title?: string;
  body?: string;
  /**
   * `"closing"` places the final action under the copy in a single column.
   */
  variant?: "default" | "closing";
}) {
  const { t } = await getTranslator();
  const resolvedTitle = title ?? t("cta.dealerTitle");
  const resolvedBody = body ?? t("cta.dealerBody");
  const closing = variant === "closing";

  return (
    <section
      data-reveal
      aria-labelledby="dealer-cta-title"
      className="bg-forge-soft"
    >
      <div
        className={
          closing
            ? "container-fh py-16 lg:py-20"
            : "container-fh grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20"
        }
      >
        <div className={closing ? "max-w-[720px]" : undefined}>
          <p className="eyebrow">{t("cta.enquiriesEyebrow")}</p>
          <h2
            id="dealer-cta-title"
            className="mt-4 max-w-[640px] font-display text-[clamp(1.9rem,4.2vw,3rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
          >
            {resolvedTitle}
          </h2>
          <p className="mt-5 max-w-[560px] text-[1.02rem] leading-relaxed text-steel">
            {resolvedBody}
          </p>

          {closing ? (
            // Inline with the copy, not in the pill's corner.
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/contact" className="btn-pill-solid">
                {t("cta.requestQuote")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              {site.contact.confirmed ? (
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-sm text-steel transition-colors hover:text-forge"
                >
                  {site.contact.email}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        {closing ? null : (
          <div className="flex flex-col gap-3 lg:items-end">
            <Link href="/contact" className="btn-pill-solid">
              {t("cta.requestQuote")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            {site.contact.confirmed ? (
              <a
                href={`mailto:${site.contact.email}`}
                className="text-sm text-steel transition-colors hover:text-forge"
              >
                {site.contact.email}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
