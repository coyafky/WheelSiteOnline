import type { Metadata } from "next";
import Link from "next/link";
import {
  quoteContextBarCopy,
  quoteDataNotice,
  quoteFormHeading,
  requestQuoteFormCopy,
  requestQuoteHero,
} from "@/content/request-a-quote";
import { PageHero } from "@/components/sections/page-hero";
import { InquiryForm } from "@/components/inquiry-form";
import { QuoteContextBar } from "@/components/quote-context-bar";
import { buildInquiryContext, hasContext } from "@/lib/inquiry-context";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Send a project enquiry for wheels, EV components, custom aluminium parts or safety tires. Approved product context carries over from model pages.",
  alternates: { canonical: "/request-a-quote" },
};

/**
 * `/request-a-quote` — the focused mode of `/contact`.
 *
 * Not a second conversion page: the same `<InquiryForm>` and the same
 * `POST /api/inquiries` backend, with a different shell. This route exists so
 * paid traffic and external links have a clean, stable conversion URL that
 * carries model context across.
 *
 * Four blocks, deliberately:
 *   ① hero             — one line, no "what to send" checklist
 *   ② carry-over bar   — echoes the URL context; vanishes when there is none
 *   ③ the form         — the only exit on the page
 *   ④ data notice      — privacy line + a quiet link back to /contact
 *
 * There is no `<DealerCta>` and no second CTA anywhere: the form is the call
 * to action, and a competitor CTA would split it.
 */
export default async function RequestAQuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const context = buildInquiryContext(params, "/request-a-quote");

  return (
    <>
      {/* ① Hero ------------------------------------------------------------ */}
      <PageHero
        id="top"
        titleId="quote-title"
        eyebrow={requestQuoteHero.eyebrow}
        heading={requestQuoteHero.heading}
        lede={requestQuoteHero.lede}
      />

      {/* ② Carry-over ------------------------------------------------------ */}
      {hasContext(context) ? (
        <QuoteContextBar context={context} copy={quoteContextBarCopy} />
      ) : null}

      {/* ③ Form ------------------------------------------------------------ */}
      <section
        aria-labelledby="quote-form-title"
        className="border-b border-border bg-soft py-18 lg:py-24"
      >
        <div className="container-fh">
          <div data-reveal className="max-w-[760px]">
            <h2
              id="quote-form-title"
              className="font-display text-[clamp(1.6rem,3.6vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {quoteFormHeading.title}
            </h2>
            <p className="mt-3 max-w-[560px] text-[0.98rem] leading-relaxed text-steel">
              {quoteFormHeading.body}
            </p>

            <div className="mt-8">
              <InquiryForm copy={requestQuoteFormCopy} />
            </div>
          </div>
        </div>
      </section>

      {/* ④ Data notice ----------------------------------------------------- */}
      <section
        aria-labelledby="quote-notice-title"
        data-reveal
        className="bg-white py-14 lg:py-16"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">{quoteDataNotice.eyebrow}</p>
            <h2 id="quote-notice-title" className="sr-only">
              {quoteDataNotice.eyebrow}
            </h2>
            <p className="mt-4 text-[0.94rem] leading-relaxed text-steel">
              {quoteDataNotice.body}
            </p>
            <Link
              href={quoteDataNotice.footHref}
              className="mt-4 inline-block text-[0.86rem] text-steel underline decoration-border underline-offset-4 transition-colors hover:text-forge"
            >
              {quoteDataNotice.footLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
