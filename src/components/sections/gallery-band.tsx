import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Full-bleed dark band where the heading itself is the call to action.
 * The oversized skewed wordmark is the visual anchor of the lower page.
 */
export function GalleryBand() {
  return (
    <section
      id="galleries"
      aria-labelledby="galleries-title"
      data-reveal
      className="relative isolate flex min-h-[80svh] items-end overflow-hidden bg-hero text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_78%_18%,rgba(194,101,10,0.28)_0%,rgba(5,7,11,0)_58%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_64px)]"
        aria-hidden="true"
      />

      <div className="container-fh pb-16 pt-28 lg:pb-24">
        <p className="eyebrow">Completed builds</p>

        <h2
          id="galleries-title"
          className="mt-6 font-display text-[clamp(3.2rem,12vw,9rem)] font-800 uppercase leading-[0.84] tracking-[-0.02em]"
        >
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-4 transition-[transform,text-shadow] duration-200 ease-out hover:[text-shadow:0_0_36px_rgba(194,101,10,0.55)]"
          >
            <span className="-skew-x-[10deg]">Gallery</span>
            <ArrowUpRight className="size-[0.55em] transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </h2>

        <p className="mt-6 max-w-[560px] text-[1.02rem] leading-relaxed text-white/70">
          See how our wheels sit on real vehicles — fitment references across
          performance, luxury and off-road platforms.
        </p>
      </div>
    </section>
  );
}
