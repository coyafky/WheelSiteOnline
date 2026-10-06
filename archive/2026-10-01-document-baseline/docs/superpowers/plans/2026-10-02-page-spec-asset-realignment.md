# PageSpec Asset Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the non-wheel PageSpecs around the real image assets available for each product and capability page, then align page modules and implementation paths with those assets.

**Architecture:** Treat image availability as a content constraint, not as decoration. Each route gets a named asset directory under `public/images/`; each visual module answers one viewport question and only uses assets that exist in that route directory. Wheel product imagery remains isolated under `public/images/wheels/` and is excluded from this realignment.

**Tech Stack:** Next.js 16.3.5, React 19.2.4, TypeScript, Tailwind CSS v4, WebP assets, Markdown PageSpecs.

## Global Constraints

- Only WebP assets are imported into the project.
- Wheel product imagery is excluded from this pass.
- No image is used as evidence for a claim unless its source filename and page context support that claim.
- A missing image must produce an explicit placeholder or a text-first module; do not invent a gallery.
- One viewport answers one core question; consecutive sections with the same question are merged or deleted.
- Inquiry CTA content must fit completely inside one viewport.
- Existing page-specific image directories are the source of truth for route-specific assets.
- Product lines remain parallel: wheels, EV components, custom aluminum, and safety tires have equal visual weight on shared entry surfaces.

---

## Asset map confirmed on 2026-10-02

| Route / surface | Project directory | Confirmed visual material | Recommended role |
|---|---|---|---|
| `/` | `public/images/home/` and `public/images/product-lines/` | factory, EV component, custom aluminum, self-sealing tire | Product-line entry and homepage proof, not a wheel gallery |
| `/products/ev-components` | `public/images/ev-components/` | EV housing hero, interfaces, welded housing, production | Hero backdrop + part/process evidence |
| `/products/custom-aluminum` | `public/images/custom-aluminum/` | custom aluminum hero, overview, machined part | Hero backdrop + example-part evidence |
| `/products/safety-tires` | `public/images/safety-tires/` | tire production, sealing layer, puncture tests, roadside damage, certificate | Hero backdrop + mechanism + risk/test evidence |
| `/capabilities` | `public/images/capabilities/` | factory aerial, factory floor, casting, machining, CAD, FEA, inspection, certificates | Factory proof, engineering proof, quality proof |
| `/about` | `public/images/about/` | factory floor, company events, factory evidence | Company/factory proof; no forced three-card gallery |
| `/resources` / content center | `public/images/content-center/` | EV, factory, tire service, road risk, vehicle/tire scenes | Editorial cards and two 3×3 tire-scene grids |
| search / fallback | `public/images/search/` | factory | Search result fallback only |

---

### Task 1: Freeze and validate the asset registry

**Files:**
- Create: `docs/agent/page-spec-asset-map.md`
- Modify: `PAGE-SPECS/_components.md`
- Modify: `PAGE-SPECS/README.md`
- Inspect: `public/images/{home,product-lines,ev-components,custom-aluminum,safety-tires,capabilities,about,content-center,search}`

**Interfaces:**
- Produces a route-to-asset registry with exact public paths, dimensions, source folder, and intended semantic role.
- Later PageSpec tasks consume this registry instead of guessing filenames.

- [ ] Record the 9 project image directories and their WebP file counts.
- [ ] Record the two generated content-center composites: `tire-scenes-grid-01.webp` and `tire-scenes-grid-02.webp`.
- [ ] Mark the following as excluded from this pass: `public/images/wheels/**`, all JPG/PNG sources, and `ximada-logo.webp` until brand ownership is confirmed.
- [ ] Add a short asset rule to `_components.md`: use a route asset only when its role is named in the route PageSpec.
- [ ] Add the registry link to `PAGE-SPECS/README.md`.
- [ ] Verify every registry path exists and every listed file is a true WebP.

### Task 2: Reframe the `/about` PageSpec around available evidence

**Files:**
- Modify: `PAGE-SPECS/about.md`
- Modify: `src/content/about.ts`
- Modify: `src/app/about/page.tsx`

**Interfaces:**
- About consumes `/images/about/factory-floor-wide.webp`, `/images/about/factory-floor.webp`, `/images/about/inspection-camera.webp`, and `/images/about/company-events.webp`.
- About does not require the old `TrustTriad` of three separate factory photos.

- [ ] Replace the unavailable “3 cards / 3 factory photos” requirement with one factory-evidence figure plus one inspection-evidence figure.
- [ ] Define the visual question as “Where does the manufacturing advantage come from?” rather than “Can we fill three cards?”
- [ ] Keep confirmed facts: in-house raw material, integrated forging capability, 12,000 t maximum forging force, and global markets.
- [ ] Keep unconfirmed facts visible as placeholders: founding year, monthly capacity, and facility area.
- [ ] Keep the existing B-1, B-2, and B-3 viewport decisions.
- [ ] Verify the About page has no old “Forged Wheel Factory” H1.

### Task 3: Reframe the three product-line PageSpecs around real visual proof

**Files:**
- Modify: `PAGE-SPECS/products/ev-components.md`
- Modify: `PAGE-SPECS/products/custom-aluminum.md`
- Modify: `PAGE-SPECS/products/safety-tires.md`
- Modify: `src/app/products/ev-components/page.tsx`
- Modify: `src/app/products/custom-aluminum/page.tsx`
- Modify: `src/app/products/safety-tires/page.tsx`

**Interfaces:**
- Shared `PageHero.backgroundImage` consumes `{ src: string; alt: string }`.
- EV uses `/images/ev-components/hero.webp` and process/part evidence from the same directory.
- Custom aluminum uses `/images/custom-aluminum/hero.webp` and `/images/custom-aluminum/machined-part.webp`.
- Safety tires uses `/images/safety-tires/hero-road.webp`, `/images/safety-tires/roadside-damage.webp`, and mechanism/test assets.

- [ ] For EV, make the hero answer “What component family do you build?” and use the housing/interface/production images as evidence, not decorative cards.
- [ ] For custom aluminum, make the hero answer “Can you develop from my drawing or sample?” and use the machined-part visual as the proof point.
- [ ] For safety tires, make the hero answer “What problem does the self-sealing layer solve?” and use the roadside risk image plus puncture/sealing visuals.
- [ ] Replace any PageSpec requirement for unavailable generic factory cards with route-specific evidence modules.
- [ ] Keep third-party/partner ownership language explicitly marked where the source data does not establish Fenghuai ownership.
- [ ] Verify each page loads only assets from its own directory, except shared product-line cards.

### Task 4: Reframe `/capabilities` around evidence tiers

**Files:**
- Modify: `PAGE-SPECS/capabilities.md`
- Modify: `src/app/capabilities/page.tsx`
- Modify: `src/content/process.ts`

**Interfaces:**
- Capabilities consumes `public/images/capabilities/`.
- Evidence tiers: factory scale, engineering workflow, manufacturing process, inspection/quality documentation.

- [ ] Make the viewport sequence explicit: “What can the factory do?”, “How is the route engineered?”, “How is the output checked?”
- [ ] Use factory aerial/floor images for factory-scale evidence.
- [ ] Use CAD/FEA/casting simulation for engineering evidence.
- [ ] Use machining/casting/inspection/impact-test images for process and quality evidence.
- [ ] Treat certificate images as documents requiring confirmation, not as proof of a certification claim unless the content data confirms the exact certificate.
- [ ] Remove any requirement for a generic six-card strip when one evidence-led image module answers the same question more clearly.

### Task 5: Reframe content-center and safety-tire image usage

**Files:**
- Modify: `PAGE-SPECS/insights/index.md`
- Modify: `PAGE-SPECS/products/safety-tires.md`
- Modify: `public/images/content-center/tire-scenes-grid-01.webp`
- Modify: `public/images/content-center/tire-scenes-grid-02.webp`

**Interfaces:**
- Content center uses the two 3×3 composites as editorial scene assets, not as product specifications.
- Safety tires uses route-specific mechanism/risk/test images.

- [ ] Define the two nine-grid images as one editorial visual module with two panels, not 18 individual cards.
- [ ] Keep the grid captions factual and avoid inventing vehicle/model claims from scene images.
- [ ] Use `roadside-damage.webp` only for risk/context, not as proof of puncture-sealing performance.
- [ ] Keep performance numbers and certificate claims tied to existing structured content and explicit provenance.

### Task 6: Cross-route verification

**Files:**
- Verify: `src/components/sections/page-hero.tsx`
- Verify: `src/app/{about,capabilities,products/ev-components,products/custom-aluminum,products/safety-tires}/page.tsx`
- Verify: `PAGE-SPECS/*.md`

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run lint` and confirm no new warnings are introduced by asset integration.
- [ ] Run `npm run build`.
- [ ] Open `/about`, `/products/ev-components`, `/products/custom-aluminum`, `/products/safety-tires`, and `/capabilities` in a real browser.
- [ ] Assert every intended image has `naturalWidth > 0`.
- [ ] Assert no page requests a wheel asset except wheel routes and the shared wheel strip.
- [ ] Assert every inquiry CTA remains fully visible in its viewport.
- [ ] Update `PAGE-SPECS/_viewport-audit.md` only after the new module boundaries are implemented and measured.

---

## Self-review

- Asset availability is treated as a constraint, not a reason to fabricate modules.
- Wheel imagery is excluded as requested.
- The existing About implementation already has a valid factory figure and inspection figure; the plan keeps those and expands the same rule to the other routes.
- The two generated nine-grid images are explicitly assigned to content-center editorial use.
- No task claims an unconfirmed certificate, facility size, founding year, monthly capacity, or partner ownership as fact.
- Every code-facing interface in later tasks is defined in the asset map or the shared `PageHero` contract.
