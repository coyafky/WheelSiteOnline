import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, CircleAlert, Clock, Mail } from "lucide-react";
import {
  thankYouConfirm,
  thankYouResponsePromise,
  thankYouUnverified,
  thankYouUrgentContact,
} from "@/content/thank-you";
import { site } from "@/content/site";
import { verifyInquiryReceipt } from "@/lib/inquiry/receipt";

export const metadata: Metadata = {
  title: "Inquiry Received — Fenghuai",
  description:
    "Confirmation that your forged wheel inquiry reached Fenghuai, and what happens next.",
  // A confirmation page should never be indexed or used as a landing page.
  robots: { index: false, follow: false },
};

/**
 * `/thank-you` — the submission confirmation page.
 *
 * Answers exactly two questions: "did it work?" and "what happens next?".
 * There is NO CTA on this page, no product recommendations, no promos and no
 * `<DealerCta>` — the visitor just submitted and is checking that it landed;
 * anything that sells would read as doubt. See PAGE-SPECS/thank-you.md §0.
 *
 * Three blocks:
 *   ① confirmation (+ the real reference id, when the URL carries one)
 *   ② response window — an explicit ⏳ placeholder, never an invented promise
 *   ③ urgent contact — real details only once `site.contact.confirmed` is true
 */
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawId = params.id;
  const referenceId = (Array.isArray(rawId) ? rawId[0] : rawId)?.trim() || undefined;
  const rawReceipt = params.receipt;
  const receipt = (Array.isArray(rawReceipt) ? rawReceipt[0] : rawReceipt)?.trim();
  const confirmed = Boolean(
    referenceId && receipt && verifyInquiryReceipt(referenceId, receipt),
  );
  const confirmationCopy = confirmed ? thankYouConfirm : thankYouUnverified;

  const { contact } = site;
  const hasRealContact = contact.confirmed;

  return (
    <>
      {/* ① Confirmation ---------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="thank-you-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_24%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-20 pt-[140px] lg:pb-24 lg:pt-[168px]">
          <span
            data-reveal
            className="inline-flex size-14 items-center justify-center rounded-full bg-forge text-white"
          >
            {confirmed ? (
              <Check className="size-7" strokeWidth={3} aria-hidden="true" />
            ) : (
              <CircleAlert className="size-7" aria-hidden="true" />
            )}
          </span>

          <p className="eyebrow mt-7 !text-forge">{confirmationCopy.eyebrow}</p>

          <h1
            id="thank-you-title"
            className="mt-5 max-w-[820px] font-display text-[clamp(2.4rem,6.6vw,4.6rem)] font-800 uppercase leading-[0.92] tracking-[-0.02em] text-white"
          >
            {confirmationCopy.title}
          </h1>

          <p className="mt-7 max-w-[600px] text-[1.05rem] leading-relaxed text-white/75">
            {confirmationCopy.body}
          </p>

          {/* ⚠️ Only ever the id that actually arrived in the URL. No id, no line. */}
          {confirmed && referenceId ? (
            <p className="mt-8 inline-flex flex-wrap items-baseline gap-3 rounded-lg border border-white/15 bg-white/5 px-5 py-4">
              <span className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-white/50">
                Reference
              </span>
              <span className="font-mono text-[1.05rem] font-semibold text-white">
                {referenceId}
              </span>
            </p>
          ) : null}

          {/* Quiet text link home — deliberately not a button. */}
          <p className="mt-9">
            <Link
              href={confirmationCopy.backHref}
              className="inline-flex items-center gap-2 text-[0.9rem] text-white/55 transition-colors hover:text-forge"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {confirmationCopy.backLabel}
            </Link>
          </p>
        </div>
      </section>

      {/* ② Response promise ------------------------------------------------ */}
      {confirmed ? <section
        aria-labelledby="thank-you-promise-title"
        data-reveal
        className="border-b border-border bg-white py-16 lg:py-20"
      >
        <div className="container-fh max-w-[720px]">
          <p className="eyebrow">{thankYouResponsePromise.eyebrow}</p>
          <h2
            id="thank-you-promise-title"
            className="mt-4 font-display text-[clamp(1.6rem,3.6vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
          >
            {thankYouResponsePromise.heading}
          </h2>

          <p className="mt-6 inline-flex items-center gap-3 rounded-lg border border-border bg-soft px-5 py-4">
            <Clock className="size-4 shrink-0 text-forge" aria-hidden="true" />
            <span className="text-[0.95rem] text-ink">
              {thankYouResponsePromise.window}
            </span>
          </p>

          <p className="mt-4 text-[0.82rem] leading-relaxed text-steel">
            {thankYouResponsePromise.windowNote}
          </p>

          <p className="mt-6 text-[0.98rem] leading-relaxed text-steel">
            {thankYouResponsePromise.nextStepNote}
          </p>
        </div>
      </section> : null}

      {/* ③ Urgent contact -------------------------------------------------- */}
      <section
        aria-labelledby="thank-you-urgent-title"
        data-reveal
        className="bg-soft py-16 lg:py-20"
      >
        <div className="container-fh max-w-[720px]">
          <p className="eyebrow">{thankYouUrgentContact.eyebrow}</p>
          <h2
            id="thank-you-urgent-title"
            className="mt-4 font-display text-[clamp(1.6rem,3.6vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
          >
            {thankYouUrgentContact.heading}
          </h2>

          {hasRealContact ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <a
                href={`mailto:${contact.email}`}
                className="rounded-xl border border-border bg-white px-5 py-4 transition-colors hover:border-forge"
              >
                <span className="font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-steel">
                  Email
                </span>
                <span className="mt-1.5 block text-[0.95rem] text-ink">
                  {contact.email}
                </span>
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="rounded-xl border border-border bg-white px-5 py-4 transition-colors hover:border-forge"
              >
                <span className="font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-steel">
                  Telephone
                </span>
                <span className="mt-1.5 block text-[0.95rem] text-ink">
                  {contact.phone}
                </span>
              </a>
            </div>
          ) : (
            <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-border bg-white px-5 py-4 text-[0.86rem] leading-relaxed text-steel">
              <Mail className="mt-0.5 size-4 shrink-0 text-forge" aria-hidden="true" />
              <span>{thankYouUrgentContact.pendingNote}</span>
            </p>
          )}

          <p className="mt-6 text-[0.86rem]">
            <Link
              href={thankYouUrgentContact.contactHref}
              className="text-steel underline decoration-border underline-offset-4 transition-colors hover:text-forge"
            >
              {thankYouUrgentContact.contactLabel}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
