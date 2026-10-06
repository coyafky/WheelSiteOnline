import { permanentRedirect } from "next/navigation";

/**
 * Legacy route: `/gallery/wheels` → `/products/wheels`.
 *
 * This route is retired. **It published fictional content**: twenty-two
 * invented design names (`@/content/wheel-designs.ts`) rendered as technical
 * `WheelSketch` line drawings — no photographs exist behind any of them. The
 * data module is marked `PLACEHOLDER` in its own header. The archived
 * architecture already planned this merge
 * (`archive/2026-10-01-document-baseline/ARCHITECTURE/page-architecture/README.md`:
 * *"`/gallery/wheels` → 合并进 `/products/wheels`"*), and DEC-059 completes it.
 *
 * The destination is the **real** published wheel catalogue: `/products/wheels`
 * browses the same idea (wheel designs by construction, size and finish) from
 * `@/lib/wheels`, where every model is a genuine record. The retired gallery is
 * archived at `archive/2026-10-06-fictional-galleries/`.
 *
 * ⚠️ Deliberately 308, not 307. `/manufacturing` and `/resources` use
 * `redirect()`, which throws a **307** (temporary) from a Server Component. This
 * retirement is **permanent** — the fictional catalogue is not coming back and
 * `/products/wheels` is the canonical one — so the signal must be
 * `permanentRedirect()`, which emits **308**, so crawlers transfer ranking here
 * and stop reconsidering the old path. The difference from the other two legacy
 * routes is intentional.
 *
 * The route is kept as a redirecting page rather than deleted so existing links,
 * sitemaps and search results do not 404.
 */
export default function WheelGalleryPage() {
  permanentRedirect("/products/wheels");
}
