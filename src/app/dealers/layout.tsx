import type { ReactNode } from "react";
import { AstryxScope } from "@/components/astryx-scope";

/**
 * Astryx scope for the `/dealers` sub-tree.
 *
 * Breadcrumbs on the dealer and private-label pages.
 *
 * The root layout deliberately does not mount `<Providers>`: doing so charged
 * every route for this library. See `src/components/astryx-scope.tsx`.
 * Do not move this back up to the root layout.
 */
export default function DealersLayout({ children }: { children: ReactNode }) {
  return <AstryxScope>{children}</AstryxScope>;
}
