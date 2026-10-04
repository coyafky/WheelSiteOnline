"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductFamily } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Product family card.
 *
 * Renders the base render, optionally swapping to `hoverImage` on hover/focus
 * (only where a fine pointer exists, so touch devices never get a stuck state).
 * Falls back to a CSS placeholder panel when the image file is missing.
 */
export function ProductCard({
  family,
  className,
}: {
  family: ProductFamily;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [baseFailed, setBaseFailed] = useState(false);
  const [hoverFailed, setHoverFailed] = useState(false);

  const showHover = hovered && family.hoverImage && !hoverFailed;

  return (
    <Link
      href={family.href}
      aria-label={`${family.name} — ${family.summary}`}
      className={cn("group relative block", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-ink">
        {/* Placeholder is the base layer: it shows through whenever the real
            render is missing, so a missing asset never looks broken. */}
        <Placeholder label={family.name} />

        {family.hasRender && !baseFailed ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={family.image}
              alt={`${family.name} forged wheel`}
              loading="lazy"
              decoding="async"
              onError={() => setBaseFailed(true)}
              className={cn(
                "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 ease-out",
                showHover ? "opacity-0" : "opacity-100 group-hover:scale-[1.03]",
              )}
            />
            {family.hoverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={family.hoverImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                onError={() => setHoverFailed(true)}
                className={cn(
                  "absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out",
                  showHover ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null}
          </>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(5,7,11,0.88)_0%,rgba(5,7,11,0)_100%)] p-6 pt-20">
          <h3 className="font-display text-[1.4rem] font-700 uppercase leading-none tracking-[0.01em] text-white">
            {family.name}
          </h3>
          <p className="mt-2 max-w-[320px] text-sm leading-snug text-white/75">
            {family.summary}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Neutral placeholder base layer for a missing render. */
function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex size-full items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,rgba(194,101,10,0.22)_0%,rgba(11,15,22,0)_62%)]">
      <span className="font-display text-[0.78rem] font-700 uppercase tracking-[0.24em] text-white/35">
        {label}
      </span>
    </div>
  );
}
