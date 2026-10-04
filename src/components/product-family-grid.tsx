import { FamilyCard } from "./family-card";
import type { ProductLine } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The four-line grid.
 *
 * ── ★ Mandatory shared component (PAGE-SPECS/products/index.md §3.2) ────────
 * `index.md` §2.1 requires `/products` and the homepage product section to use
 * **the same grid**. Two copies of a four-across card row drift — one gets a
 * tweak the other misses — and since the whole point is that the four lines
 * look equal, drift here is a positioning bug, not a styling one.
 *
 * ── The two call sites differ in exactly two ways ───────────────────────────
 * `density` — the homepage runs it tighter because it is one screen among
 * several; `/products` gives it more air because it is the page's main object.
 * `columns` — exposed so a future surface can opt out of four-across without
 * forking the component. **Both call sites omit it**, so four-across is the
 * default and the one the parallelism discipline assumes.
 *
 * ── Why `grid` + `items-stretch` and not flex ───────────────────────────────
 * The cards must be equal *height*, not just equal width. Grid rows stretch
 * their children to the tallest by default; combined with `h-full` on the card
 * that is what makes a 3-line summary and a 2-line summary produce identical
 * boxes. Flex would need explicit basis juggling to get the same result.
 *
 * ── Responsive ──────────────────────────────────────────────────────────────
 * 1440 → 4 across (one row, the parallelism is literal)
 * 768  → 2 × 2      (the tablet case — audit flagged this breakpoint for
 *                     overflow in the old three-card row; two-across at the
 *                     md tier is what keeps four cards legible on an iPad)
 * 390  → 1 column
 */
export function ProductFamilyGrid({
  lines,
  density = "roomy",
  columns,
  className,
}: {
  /** Exactly four today — see `productLines` in `content/product-lines.ts`. */
  lines: ProductLine[];
  /** `compact` = homepage rhythm; `roomy` = full-width product page. */
  density?: "compact" | "roomy";
  /** Omit for the standard four-across. */
  columns?: "auto" | 2 | 4;
  className?: string;
}) {
  const gapClass = density === "compact" ? "gap-3.5 lg:gap-4" : "gap-5 lg:gap-6";

  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <ul
      data-reveal-group
      className={cn("grid items-stretch", colClass, gapClass, className)}
    >
      {lines.map((line) => (
        <li key={line.slug} className="flex">
          {/* h-full so the card fills the stretched grid cell rather than
              sitting at its natural height and leaving the row ragged. */}
          <FamilyCard line={line} className="h-full w-full" />
        </li>
      ))}
    </ul>
  );
}
