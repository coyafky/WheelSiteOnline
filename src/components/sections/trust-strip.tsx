import { capabilities } from "@/content/capabilities";

/**
 * Six-cell capability band directly beneath the hero.
 * Grid: 1 column on mobile, 2 at sm, 3 at lg — borders are drawn per cell so
 * the divider pattern survives every breakpoint.
 */
export function TrustStrip() {
  return (
    <section
      aria-label="Core capabilities"
      data-reveal-group
      className="border-b border-border bg-white"
    >
      <div className="container-fh-wide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((item) => (
          <article
            key={item.index}
            className="group relative min-h-[188px] border-b border-border px-7 py-9 transition-colors hover:bg-soft sm:px-8 lg:px-9"
          >
            <span className="font-display text-[0.88rem] font-800 tracking-[0.08em] text-forge">
              {item.index}
            </span>
            <h3 className="mt-4 font-display text-[1.16rem] font-700 uppercase leading-tight tracking-[0.01em] text-ink">
              {item.title}
            </h3>
            <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-steel">
              {item.body}
            </p>
            <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-forge transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </article>
        ))}
      </div>
    </section>
  );
}
