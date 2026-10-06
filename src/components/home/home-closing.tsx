import Link from "next/link";

import type { HomepageContent } from "@/content/types";

export function HomeClosing({
  closing,
}: {
  closing: HomepageContent["closing"];
}) {
  return (
    <section className="bg-forge-soft py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div
          className="grid gap-12 border-t border-forge/30 pt-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20 lg:pt-14"
          data-reveal-group
        >
          <div data-reveal>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-forge-dark">
              {closing.eyebrow}
            </p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl">
              {closing.heading}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-steel sm:text-lg">
              {closing.body}
            </p>
          </div>

          <div data-reveal>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-steel">
              {closing.inputLabel}
            </p>
            <ul className="mt-5 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
              {closing.inputPrompts.map((input, index) => (
                <li key={input} className="bg-white p-5 sm:min-h-36">
                  <span className="font-mono text-[0.62rem] font-semibold text-forge">
                    0{index + 1}
                  </span>
                  <p className="mt-7 text-sm font-semibold leading-6 text-ink">
                    {input}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 pr-14 sm:flex-row sm:items-center sm:pr-0">
              <Link
                href={closing.primaryAction.href}
                className="inline-flex min-h-12 items-center justify-center bg-forge px-6 text-sm font-semibold text-white transition hover:bg-forge-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge"
              >
                {closing.primaryAction.label}
              </Link>
              <Link
                href={closing.secondaryAction.href}
                className="inline-flex min-h-12 items-center justify-center border border-ink/20 px-6 text-sm font-semibold text-ink transition hover:border-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {closing.secondaryAction.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
