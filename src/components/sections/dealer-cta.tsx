import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";

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
 * `FloatingQuote` is a fixed pill anchored 22px from the bottom-right corner.
 * On a short closing band the pill lands *on top of* this section's own
 * button, and two identical "Request a quote" controls overlap — it reads as a
 * rendering fault, not as a call to action.
 *
 * The homepage is the worst case: the band is the last element on the page, so
 * the pill never gets a chance to scroll clear of it. `variant="closing"` moves
 * this section's action to the left column, out of the pill's corner, and keeps
 * it as the page's primary CTA rather than hiding either control.
 *
 * Suppressing the pill instead was the obvious alternative and was rejected:
 * the pill is the persistent entry point on *every other* page, and page
 * position — not page identity — is what makes it collide here.
 */

export function DealerCta({
  title = "Tell us what the part has to do",
  body = "Send a drawing, a sample or a target specification. We will come back with a process route, a tooling position and pricing.",
  variant = "default",
}: {
  title?: string;
  body?: string;
  /**
   * `"closing"` keeps the action out of the bottom-right corner so it does not
   * sit underneath `FloatingQuote`. Use it on any page where this band is the
   * final section.
   */
  variant?: "default" | "closing";
}) {
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
          <p className="eyebrow">Enquiries</p>
          <h2
            id="dealer-cta-title"
            className="mt-4 max-w-[640px] font-display text-[clamp(1.9rem,4.2vw,3rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-[560px] text-[1.02rem] leading-relaxed text-steel">
            {body}
          </p>

          {closing ? (
            // Inline with the copy, not in the pill's corner.
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/contact" className="btn-pill-solid">
                Request a quote
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
              Request a quote
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
