import type { ReactNode } from "react";
import { AstryxScope } from "@/components/astryx-scope";

/**
 * Astryx scope for the `/insights` sub-tree.
 *
 * Breadcrumbs and the long-form outline — covers `/insights`, `/[slug]`,
 *  `/bolt-patterns` and `/bolt-patterns/[pattern]`.
 *
 * The root layout deliberately does not mount `<Providers>`: doing so charged
 * every route for this library. See `src/components/astryx-scope.tsx`.
 * Do not move this back up to the root layout.
 */
export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <AstryxScope>{children}</AstryxScope>;
}
