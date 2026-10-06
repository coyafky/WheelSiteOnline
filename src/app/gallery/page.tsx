import { permanentRedirect } from "next/navigation";

/**
 * Legacy route: `/gallery` → `/fitment`.
 *
 * This route is retired. **It published fictional content**: nine invented
 * "completed builds" (`@/content/builds.ts`) with made-up platforms, sizes and
 * finishes, and `public/images/builds/` held zero real photographs for any of
 * them. There was never a page-specific Page SPEC for `/gallery` (see DEC-059)
 * and the homepage link to it was already withdrawn for exactly this reason
 * (`@/components/wheel-strip-section.tsx`: *"no assets — the link led to an
 * empty page"*). The route itself was the last remaining promise the site could
 * not keep, so it is retired here.
 *
 * The destination is the **real** vehicle-fitment reference: `/fitment` answers
 * the same visitor question ("which wheel sizes fit my platform?") from the
 * platform data the project actually holds. The retired hub is archived at
 * `archive/2026-10-06-fictional-galleries/`.
 *
 * ⚠️ Deliberately 308, not 307. `/manufacturing` and `/resources` use
 * `redirect()`, which throws a **307** (temporary) from a Server Component. This
 * retirement is **permanent** — the fictional content is not coming back and
 * the surviving route is the canonical one — so the signal must be
 * `permanentRedirect()`, which emits **308**, so crawlers transfer ranking to
 * `/fitment` and stop reconsidering `/gallery`. The difference from the other
 * two legacy routes is intentional.
 *
 * The route is kept as a redirecting page rather than deleted so existing links,
 * sitemaps and search results do not 404.
 */
export default function GalleryPage() {
  permanentRedirect("/fitment");
}
