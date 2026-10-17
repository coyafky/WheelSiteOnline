import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { InquiryForm } from "@/components/inquiry-form";
import { PreviewBanner } from "@/components/preview-banner";
import { QuoteContextBar } from "@/components/quote-context-bar";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { getTranslator, getLocale } from "@/lib/i18n";
import { localizedAlternates, localizedPath } from "@/lib/i18n/types";
import { quoteContextCopyFor, quoteFormCopyFor, quoteSpecLabelsFor } from "@/lib/i18n/conversion-ui-copy";
import { buildInquiryContext, hasContext } from "@/lib/inquiry-context";
import { getInquiryContent } from "@/lib/wordpress/inquiry-content";
import { getQuotePageBody } from "@/lib/wordpress/conversion-pages";

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: preview } = await draftMode();
  const locale = await getLocale();
  const body = await getQuotePageBody({ locale, preview });
  return {
    title: body.seo.title,
    description: body.seo.description,
    alternates: localizedAlternates("/request-a-quote", locale),
    robots: { index: !preview, follow: true },
  };
}

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
  const { isEnabled: preview } = await draftMode();
  const { locale, t } = await getTranslator();
  const body = await getQuotePageBody({ preview, locale });
  const inquiry = await getInquiryContent({ preview, locale });
  const params = await searchParams;
  const context = buildInquiryContext(params, "/request-a-quote");

  return (
    <>
      <PreviewBanner enabled={preview} exitHref="/request-a-quote" />
      {/* ① Hero ------------------------------------------------------------ */}
      <PageHero
        id="top"
        titleId="quote-title"
        eyebrow={body.hero.eyebrow}
        heading={body.hero.heading}
        lede={body.hero.lede}
        breadcrumb={
          <SiteBreadcrumbs
            label={t("breadcrumb.label")}
            tone="light"
            items={[
              { label: t("breadcrumb.home"), href: localizedPath("/", locale) },
              { label: t("cta.requestQuote") },
            ]}
          />
        }
      />

      {/* ② Carry-over ------------------------------------------------------ */}
      {hasContext(context) ? (
        <QuoteContextBar
          context={context}
          copy={{ ...quoteContextCopyFor(locale), changeHref: localizedPath("/products", locale) }}
          specLabels={quoteSpecLabelsFor(locale)}
        />
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
              {body.formHeading.title}
            </h2>
            <p className="mt-3 max-w-[560px] text-[0.98rem] leading-relaxed text-steel">
              {body.formHeading.body}
            </p>

            <div className="mt-8">
              <InquiryForm
                locale={locale}
                copy={quoteFormCopyFor(locale)}
                ui={inquiry.formUi}
                preparation={inquiry.preparation}
                privacyVersion={inquiry.privacyVersion}
              />
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
            <p className="eyebrow">{body.dataNotice.eyebrow}</p>
            <h2 id="quote-notice-title" className="sr-only">
              {body.dataNotice.eyebrow}
            </h2>
            <p className="mt-4 text-[0.94rem] leading-relaxed text-steel">
              {body.dataNotice.body}
            </p>
            <Link
              href={localizedPath(body.dataNotice.footHref, locale)}
              className="mt-4 inline-block text-[0.86rem] text-steel underline decoration-border underline-offset-4 transition-colors hover:text-forge"
            >
              {body.dataNotice.footLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
