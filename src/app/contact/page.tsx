import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  TriangleAlert,
} from "lucide-react";
import {
  contactAside,
  contactDetailsCopy,
  contactFormCopy,
  contactHero,
  contactPathways,
  contactSteps,
  contactWhatHappens,
} from "@/content/contact";
import { productFamilies } from "@/content/products";
import { site } from "@/content/site";
import { InquiryForm } from "@/components/inquiry-form";

export const metadata: Metadata = {
  title: "Contact Us — Request a Quote",
  description:
    "Send Fenghuai your drawing, sample or target specification, along with the volumes you are planning. We come back with a process route, a delivery position and pricing.",
};

/**
 * Quote request page.
 *
 * This route IS the conversion step, so it deliberately does NOT end with
 * `<DealerCta />` — the form is the call to action. The floating quote button
 * is also suppressed on `/contact` (see `floating-quote.tsx`).
 *
 * The form is a client component and submission is NOT wired to a backend
 * yet — see the comment block at the top of `inquiry-form.tsx`.
 */
export default function ContactPage() {
  return (
    <>
      {/* A. Hero ----------------------------------------------------------- */}
      <section
        id="top"
        aria-labelledby="contact-title"
        data-reveal
        className="relative isolate overflow-hidden bg-ink"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_70%_0%,rgba(194,101,10,0.26)_0%,rgba(11,15,22,0)_58%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
          aria-hidden="true"
        />

        <div className="container-fh pb-14 pt-[140px] lg:pb-16 lg:pt-[168px]">
          <p className="eyebrow !text-forge">{contactHero.eyebrow}</p>
          <h1
            id="contact-title"
            className="mt-5 max-w-[900px] font-display text-[clamp(2.4rem,6.8vw,4.9rem)] font-800 uppercase leading-[0.92] tracking-[-0.02em] text-white"
          >
            {contactHero.heading}
          </h1>
          <p className="mt-7 max-w-[680px] text-[1.05rem] leading-relaxed text-white/75">
            {contactHero.lede}
          </p>
          <p className="mt-4 max-w-[640px] text-sm leading-relaxed text-white/55">
            {contactHero.supporting}
          </p>
        </div>
      </section>

      {/* B. Form + contact details ------------------------------------------ */}
      <section
        aria-labelledby="enquiry-title"
        className="border-b border-border bg-soft py-18 lg:py-24"
      >
        <div className="container-fh grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-14">
          {/* Form column */}
          <div data-reveal>
            <h2
              id="enquiry-title"
              className="font-display text-[clamp(1.6rem,3.6vw,2.2rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              Wheel enquiry form
            </h2>
            <p className="mt-3 max-w-[560px] text-[0.98rem] leading-relaxed text-steel">
              Everything we need to come back with a specification rather than a
              follow-up question.
            </p>

            <div className="mt-8">
              <InquiryForm families={productFamilies} copy={contactFormCopy} />
            </div>
          </div>

          {/* Details column */}
          <aside data-reveal className="grid content-start gap-8">
            <div className="rounded-xl border border-border bg-white p-7">
              <p className="eyebrow">{contactDetailsCopy.eyebrow}</p>
              <h2 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                {contactDetailsCopy.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                {contactDetailsCopy.body}
              </p>

              <dl className="mt-7 grid gap-5">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <Mail className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel">
                      Sales enquiries
                    </dt>
                    <dd className="mt-1 text-sm">
                      <a
                        href={`mailto:${site.contact.email}`}
                        className="text-ink transition-colors hover:text-forge"
                      >
                        {site.contact.email}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <Phone className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel">
                      Telephone
                    </dt>
                    <dd className="mt-1 text-sm">
                      <a
                        href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                        className="text-ink transition-colors hover:text-forge"
                      >
                        {site.contact.phone}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <MapPin className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel">
                      Factory
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink">
                      {site.contact.addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <Clock className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel">
                      Office hours
                    </dt>
                    <dd className="mt-1 text-sm text-ink">
                      {site.contact.hours}
                    </dd>
                  </div>
                </div>
              </dl>

              {/* Placeholder warning — the contact details in site.ts are not real. */}
              <p className="mt-7 flex items-start gap-2.5 rounded-lg border border-forge/35 bg-forge-soft px-4 py-3.5 text-[0.78rem] leading-relaxed text-forge-deep">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  PLACEHOLDER contact details — the email address and phone
                  number above are structural. Replace them in{" "}
                  <code className="font-mono text-[0.74rem]">
                    src/content/site.ts
                  </code>{" "}
                  before launch.
                </span>
              </p>
            </div>

            {/* What makes a quote fast */}
            <div className="rounded-xl border border-border bg-ink p-7">
              <p className="eyebrow !text-forge">{contactAside.eyebrow}</p>
              <h2 className="mt-4 font-display text-[1.2rem] font-700 uppercase leading-tight tracking-[0.01em] text-white">
                {contactAside.heading}
              </h2>

              <ul className="mt-6 grid gap-3.5">
                {contactAside.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-forge/20 text-forge">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-white/75">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* C. What happens next ------------------------------------------------ */}
      <section
        aria-labelledby="next-title"
        data-reveal
        className="border-b border-border bg-white py-20 lg:py-28"
      >
        <div className="container-fh">
          <div className="max-w-[720px]">
            <p className="eyebrow">{contactWhatHappens.eyebrow}</p>
            <h2
              id="next-title"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-800 uppercase leading-[0.96] tracking-[-0.01em] text-ink"
            >
              {contactWhatHappens.heading}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-steel">
              {contactWhatHappens.body}
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16">
            <ol
              data-reveal-group
              className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2"
            >
              {contactSteps.map((step) => (
                <li key={step.step} className="bg-white p-7">
                  <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
                    {step.step}
                  </span>
                  <h3 className="mt-4 font-display text-[1.14rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-steel">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>

            <ul
              data-reveal-group
              className="grid content-start gap-5 self-start rounded-xl border border-border bg-soft p-8"
            >
              {contactWhatHappens.points.map((point) => (
                <li key={point} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-forge/12 text-forge">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[0.96rem] leading-relaxed text-ink/80">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* D. Read first pathways ---------------------------------------------- */}
      <section
        aria-labelledby="contact-pathways-title"
        data-reveal
        className="bg-soft py-20 lg:py-24"
      >
        <div className="container-fh">
          <div className="max-w-[640px]">
            <p className="eyebrow">{contactPathways.eyebrow}</p>
            <h2
              id="contact-pathways-title"
              className="mt-4 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink"
            >
              {contactPathways.heading}
            </h2>
          </div>

          <div
            data-reveal-group
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {contactPathways.links.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="group flex flex-col rounded-xl border border-border bg-white p-7 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-forge"
              >
                <p className="eyebrow">{pathway.eyebrow}</p>
                <h3 className="mt-4 font-display text-[1.3rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
                  {pathway.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {pathway.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {pathway.linkLabel}
                  <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
