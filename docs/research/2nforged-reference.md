# 2N Forged — Structural Blueprint (Reference Site Recon)

**Target:** https://2nforged.com/ — WordPress, custom theme `2nforged-theme`.
**Stylesheet:** `/wp-content/themes/2nforged-theme/assets/css/forged-site.min.css` (281,069 bytes, single minified file).
**JS:** `/wp-content/uploads/siteground-optimizer-assets/forged-site.min.js` (52,310 bytes, SiteGround-optimizer concatenation of theme script).
**Purpose of this doc:** learn the *page architecture, section inventory, and interaction model*. No content/brand copying.

**Evidence base:** `curl` of 13 pages (home + 12 subpages), the live minified CSS, and the live minified theme JS. All values below are quoted verbatim from those files.

---

## 1. Full page inventory

| URL | `<title>` | `<h1>` | Top-level `<section>` class sequence |
|---|---|---|---|
| `/` | `2N Forged – Custom Forged Wheels Manufacturer` | Custom Forged Wheels Engineered for Aggressive Fitment | `hero` (data-reveal) → `trust-strip` (data-reveal-group) → `section product-preview product-collection` → `gallery-hero` |
| `/2-piece-forged-wheels/` | `Custom 2 Piece Forged Wheels for Dealers \| 2N Forged` | CUSTOM 2-PIECE FORGED WHEELS | `two-piece-hero` (data-reveal) → `two-piece-section two-piece-answer` → `…two-piece-intro` → `…two-piece-cases` → `…two-piece-detail` → `…two-piece-designs` → `…two-piece-faq` → `…two-piece-related-resources resources-related` → `dealer-final-cta two-piece-final-cta` |
| `/about-us/` | `About 2N Forged \| Custom Forged Wheel Factory` | Factory-Backed Custom Forged Wheel Manufacturer | `dealer-hero about-dealer-hero` → `about-capability-strip` → `dealer-section dealer-split-section about-supply-chain` → `…about-trust` → `dealer-section dealer-brand-section about-brand-section` → `…dealer-split-section about-positioning` → `…dealer-quality about-quality` → `…about-next-paths` → `dealer-final-cta about-final-cta` |
| `/bmw-m-wheels/` | `BMW M Wheels \| Custom Forged Wheel Gallery \| 2N Forged` | BMW M Wheels | `bmw-m-hero` (data-reveal) → `bmw-m-intro` → `bmw-m-section` (paths) → `bmw-m-section` (references, group) → `bmw-m-section bmw-m-design-section` (group) → `…bmw-m-direction-section` → `…bmw-m-resource-section` → `…bmw-m-bridge-section` → `…bmw-m-support-section` → `…bmw-m-faq-section` |
| `/contact-us/` | `Contact 2N Forged \| Request a Custom Forged Wheel Quote` | Request Wheel Quote | `section inquiry-section contact-page-section` (single section) |
| `/custom-forged-wheels-for-dealers/` | `Custom Forged Wheels for Dealers \| No Stock First \| 2N Forged` | Sell custom forged wheels without stocking them first | `dealer-hero` → `dealer-section dealer-model-section` → `…dealer-data-support dealer-split-section` → `…dealer-section` (risks) → `…dealer-chapter-section` (program) → `…dealer-split-section dealer-shipping-math` → `…dealer-process` → `…dealer-traceability-section` → `…dealer-split-section dealer-proof-detail` → `…dealer-brand-section dealer-owner-section` → `…dealer-split-section dealer-brand-path` → `…dealer-gallery-tools` → `…dealer-faq` → `dealer-final-cta` (14 sections, all `data-reveal`) |
| `/forged-wheel-resources/` | `Forged Wheel Resources \| Guides for Dealers and Wheel Shops` | Forged Wheel Resources for Dealers and Wheel Shops | `resources-hero` (data-reveal) → `resources-category-strip` (data-reveal-group) → `resources-layout` |
| `/gallery/` | `Vehicle Gallery \| Custom Forged Wheel Fitment References \| 2N Forged` | VEHICLE GALLERY | `section section-light gallery-page-hero` (data-reveal) → `gallery-albums` (group) → `gallery-pathways` |
| `/monoblock-wheels/` | `Custom Monoblock Forged Wheels \| Complete Guide & Custom Options` | Custom Monoblock Forged Wheels | `two-piece-hero monoblock-hero` → `two-piece-section two-piece-answer` → `…two-piece-intro monoblock-value` → `…monoblock-process` → `…two-piece-detail monoblock-construction` → `…two-piece-detail monoblock-compare` → `…monoblock-cast-compare` → `…monoblock-featured-builds` → `…two-piece-intro monoblock-fitment-questions` → `…two-piece-intro` (use) → `…two-piece-detail monoblock-custom-data` → `…monoblock-pricing` → `…monoblock-checklist` → `…monoblock-start-steps` → `…two-piece-faq` → `…two-piece-related-resources monoblock-related-resources resources-related` → `dealer-final-cta two-piece-final-cta monoblock-final-cta` (17 sections) |
| `/private-label-wheels/` | `Private Label Forged Wheels for Your Brand \| 2N Forged` | Private Label Forged Wheels for Your Brand | `dealer-hero private-label-hero` → 15 × `dealer-section …` variants → `dealer-final-cta` (all `data-reveal`) |
| `/process/` | `Forged Wheel Manufacturing Process \| CNC Machining & Finishing` | Forged Wheel Manufacturing Process | `section section-light process-section manufacturing-section` (single section; internal slider steps) |
| `/products/` | `Custom Forged Wheel Designs \| Monoblock, 2-Piece & Off-Road Wheels` | Custom Forged Wheels | `section products-page product-catalog-page` → `products-guidance-section products-start-section` → `…products-route-section` → `…products-fitment-support` → `…products-faq` |
| `/wheel-gallery/` | `Wheel Gallery \| Custom Forged Wheel References \| 2N Forged` | Wheel Gallery | `section section-light gallery-page-hero product-gallery-page-hero` → `gallery-albums product-gallery-albums` (group) → `gallery-pathways` |

**Structural patterns worth noting:**
- Only the home page uses the `hero` class family; subpages reuse themed hero classes (`two-piece-hero`, `dealer-hero`, `bmw-m-hero`, `resources-hero`).
- `dealer-hero` / `dealer-section` is the shared "long-form landing" system used by `/about-us/`, `/custom-forged-wheels-for-dealers/`, and `/private-label-wheels/` (all sections carry `data-reveal`).
- `two-piece-*` is the shared "product explainer" system (used by both `/2-piece-forged-wheels/` and `/monoblock-wheels/`), with dark hero + alternating light sections.
- Most long-form pages end with a `dealer-final-cta` closing band.
- `/forged-wheel-resources/` is an index/hub page (`resources-layout` list), not a long-form page.

---

## 2. Homepage section-by-section breakdown

Page body: `<body class="home wp-singular page-template-default page page-id-700 wp-custom-logo wp-theme-2nforged-theme">`. Content order: skip-link → `header.site-header` → `main#main` (4 sections) → `footer` → floating quote button.

### 2.1 `section.hero` (`#top`, `aria-labelledby="hero-title"`, `data-reveal`)
- **Purpose:** full-viewport brand hero.
- **Layout:** `min-height:100svh; display:grid; align-items:center; overflow:hidden; background:#05070b`. Image `picture.hero-bg` is absolutely positioned (`inset:0`), object-fit cover, `object-position:80% center`. Single-column content grid: `grid-template-columns:minmax(0,820px)` inside `width:min(calc(100% - 32px),var(--container))` with `padding:116px 0 54px`, pushed down by `transform:translateY(clamp(84px,10vh,120px))`.
- **Overlay:** `.hero-overlay` = two stacked linear-gradients: `linear-gradient(90deg,rgba(5,8,14,.68) 0%,rgba(5,8,14,.34) 46%,rgba(5,8,14,6%) 100%), linear-gradient(0deg,rgba(5,8,14,.58) 0%,rgba(5,8,14,2%) 58%)`.
- **Text structure:** `p.eyebrow` ("Factory-direct forged wheel", uppercase `.76rem`, letter-spacing `.12em`) → `h1#hero-title` split into three `span.hero-title-line` (first line wraps `span.hero-title-custom` at `font-size:1.3em`; third line `span.hero-title-sub` at `.82em` and contains a mobile-only `<br>`). → `p.hero-lede` (`max-width:680px`).
- **CTAs:** none in the hero markup — the hero is copy-only; the adjacent `trust-strip` carries the first action affordances. (`.hero-actions` exists in CSS for other pages but is not used on home.)
- **Assets:** `hero-m2-04-optimized-900/-1200.webp/.jpg` (mobile, ≤760px), `Home-Banner.jpg` (1672×941, ≥761px).

### 2.2 `section.trust-strip` (`aria-label="Core capabilities"`, `data-reveal-group`)
- **Purpose:** 6-item capability band directly under the hero (`background:var(--color-white)`, `border-bottom:1px solid var(--color-muted)`).
- **Layout:** `display:grid; grid-template-columns:repeat(3,1fr)` → **3 columns × 2 rows**. Each `.trust-item` `min-height:184px; padding:34px; border-right:1px solid var(--color-muted)`; 3rd and 6th items drop the right border (`nth-child(3n)`), first row gets bottom border (`nth-child(-n+3)`).
- **Item structure (repeated ×6):** `<span>01</span>` (accent-dark, `font-weight:800`, `.88rem`) → `<strong>` (`margin-top:18px`, `1.16rem`) → `<p>` (`max-width:260px`, steel color). Content: 01 Tailored Fitment / 02 Deep Concave / 03 Factory Direct / 04 Custom Finishes / 05 Customized Accessories / 06 Fast Production.
- **CTAs:** none. On some pages this block is swapped for `.trust-strip.is-trust-rotator` (JS `setupTrustRotator`, `animation:trust-panel-in 260ms ease both`).

### 2.3 `section.section.product-preview.product-collection` (`#products`)
- **Purpose:** product showcase / "custom forged wheel partner".
- **Layout:** contained. `padding-top:86px; padding-bottom:82px; border-bottom:1px solid var(--color-muted); background:var(--color-white)`.
  - Heading block `.product-collection-heading` = `width:min(calc(100% - 32px),780px); margin:0 auto; text-align:center`. Contains the wordmark image `logo-wordmark-cropped.png` (220×47) → `h2#products-title` → `<p>`.
  - Render grid `.product-render-grid` = `width:min(calc(100% - 20px),1520px); margin:50px auto 0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(10px,1.8vw,28px); align-items:end` — **3 equal columns** (near full-bleed, max 1520px), `data-reveal-group`.
  - Three `a.product-render` cards (`-left`/`-center`/`-right`), each holding two `<picture>`: `product-render-angle-base` (always visible) and `product-render-angle-hover` (`aria-hidden`, revealed on hover/focus via `setupProductRenderHover`, gated behind `(hover:hover) and (pointer:fine)`).
  - Action row `.product-actions.product-collection-actions` (`width:min(calc(100% - 32px),var(--container)); margin:28px auto 0`): two `a.button.button-outline-dark` → "View all wheel styles" (`/products/`) and "VIEW WHEEL GALLERY" (`/wheel-gallery/`). `.button-outline-dark` = `border:2px solid var(--color-graphite); background:0 0; color:var(--color-graphite); font-size:.72rem; letter-spacing:.14em; text-transform:uppercase`; hover flips to accent bg.
- **Assets:** `product-render-01/02/03.jpg|.webp` + `-hover` variants, `logo-wordmark-cropped.png`.

### 2.4 `section.gallery-hero` (`#galleries`)
- **Purpose:** full-bleed "GALLERY" call-to-gallery band.
- **Layout:** `min-height:100svh` style block, dark (`background:#05070b; color:#fff; isolation:isolate`); `.gallery-hero-bg` absolutely positioned decorative layer; `.gallery-hero-content` = `width:min(calc(100% - 32px),var(--container)); max-width:780px; margin:0 auto 0 max(0px,calc((100% - var(--container))/2 - 72px)); padding:0 0 clamp(54px,8vh,86px)`.
- **Heading:** `h2#galleries-title` contains a single link wrapping the word "GALLERY" plus `span.gallery-link-arrow`. Typography is deliberately loud: `font-family:arial black,arial narrow,roboto condensed,var(--font-display),sans-serif; font-size:clamp(3.2rem,7.5vw,7.6rem); font-style:italic; font-weight:900; line-height:.88; letter-spacing:.02em; text-transform:uppercase; transform:skewX(-10deg)` with text-shadow. Link hover animates `transform 180ms ease,text-shadow 180ms ease`.
- **CTA:** the heading *is* the CTA (whole h2 links to `/gallery/`).
- **Note:** `.gallery-hero-label` (span/strong/p/a + `.gallery-hero-label a` button) exists in CSS for a richer gallery-hero variant (used on other pages), but the home instance renders only the title link.

### 2.5 `footer` (site footer, dark)
- Logo (`logo-white-cropped.png`, 150×95) + tagline paragraph ("Custom / Forged Wheels / Engineered for Aggressive Fitment").
- `nav.footer-nav` = `display:grid; grid-template-columns:repeat(4,max-content); gap:clamp(16px,2.6vw,34px); align-items:start; justify-content:end; margin-left:clamp(10px,1.4vw,18px)` — **4 column groups**, each `.footer-nav-group { display:grid; gap:10px }` with an `h2` heading.
- `a.footer-back-top` (right-aligned "Back to top", circular arrow icon; `display:none` at some breakpoints — the CSS shows responsive toggles). Hidden entirely on small screens per the later `.footer-back-top{display:none}` rules.

### 2.6 `.floating-quote` (floating "Request Quote" button)
- Rendered after the footer. `position:fixed; right:24px; bottom:22px; z-index:90; min-height:46px; border-radius:999px; background:var(--color-accent); color:#fff; padding:0 18px; font-family:var(--font-display); font-size:.88rem; font-weight:900`.
- Has a self-running attention animation: `animation:floating-quote-nudge 8s ease-in-out infinite` (0–86% idle, small translate nudge near the end of each loop), plus hover/active transforms and a `transition:translate 180ms ease,transform 180ms ease,background 180ms ease,box-shadow 180ms ease,opacity 180ms ease`.
- Hidden contexts (see §4).

---

## 3. Design tokens from the live stylesheet

### 3.1 `:root` custom properties (verbatim, single block)

```css
:root{
  --color-ink:#0f172a;
  --color-graphite:#111827;
  --color-panel:#1e293b;
  --color-steel:#64748b;
  --color-muted:#e2e8f0;
  --color-soft:#f8fafc;
  --color-white:#ffffff;
  --color-accent:#b91c1c;
  --color-accent-dark:#7f1d1d;
  --shadow-soft:0 20px 60px rgba(15, 23, 42, 0.14);
  --shadow-dark:0 20px 60px rgba(0, 0, 0, 0.28);
  --radius:8px;
  --container:1180px;
  --container-wide:1420px;
  --font-sans:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-display:-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  --motion-duration-reveal:760ms;
  --motion-duration-parallax:120ms;
  --motion-ease-out:cubic-bezier(0.16, 1, 0.3, 1);
  --motion-distance-reveal:12px;
  --motion-stagger-step:90ms;
  --motion-parallax-y:8px;
}
```

**Palette read:** a slate-ink/graphite base (`#0f172a`, `#111827`, `#1e293b`), one hot accent (red `#b91c1c`, dark red `#7f1d1d`), neutral support (`steel #64748b`, `muted #e2e8f0`, `soft #f8fafc`, `white`). Classic Tailwind-slate + single-accent-dark scheme. No secondary accent, no gradients in tokens.

**Spacing/scale tokens:** only two container widths and one radius are tokenized (`--container:1180px`, `--container-wide:1420px`, `--radius:8px`). There is **no spacing scale** — spacing is hand-authored per rule (`padding:34px`, `gap:clamp(10px,1.8vw,28px)`, etc.). Typography uses `clamp()` throughout rather than a token scale. Font-sizes observed: `.72rem–.94rem` body/small, `1.02–1.2rem` lede, hero/subpage displays up to `clamp(3.2rem,7.5vw,7.6rem)`.

### 3.2 Fonts
- **No `@font-face` rules exist.** No `@import` in the stylesheet either.
- `font-family` declarations: 27 use `var(--font-display)`, 3 use `open sans,Arial,sans-serif`, 1 each for `var(--font-sans)`, `segoe ui light,helvetica neue,Arial,sans-serif`, `arial black,arial narrow,roboto condensed,var(--font-display),sans-serif`, `quicksilvertopics,var(--font-display)`, `inherit`.
- `--font-sans` and `--font-display` are both **system font stacks** (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`).
- **Conclusion: fonts are neither self-hosted nor loaded from Google Fonts — the site relies entirely on system fonts.** The only "display" flavor is the local/fallback stack `arial black, arial narrow, roboto condensed` (used for the loud GALLERY-style headings); `open sans` and `quicksilvertopics` appear only as one-off fallbacks. No webfont network request.
- (Font loading is via `lazysizes.min.js` from the SG cachepress plugin for images, and a SiteGround-optimizer concatenated theme JS — unrelated to fonts.)

---

## 4. Interaction model (verbatim CSS + JS)

Driven by one theme script (`forged-site.min.js`). Key global objects in the JS: `reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")`, a helper `motionBehavior()` returning `"auto"` when reduced motion is on else `"smooth"`.

### 4.1 `data-reveal` / `data-reveal-group` — scroll reveal
- JS adds `motion-ready` to `document.documentElement` (so reveals only hide once JS is active — progressive enhancement), assigns each child of a `[data-reveal-group]` a stagger index via `--motion-order` (`Math.min(index, 8)` — **stagger is capped at index 8**), then observes targets with an `IntersectionObserver` (`rootMargin:"18% 0px"`, `threshold:.01`) and adds `.is-revealed` on intersect. If reduced-motion is on it returns early (no observer).

CSS:
```css
.motion-ready [data-reveal],
.motion-ready [data-reveal-group] {
  transition:opacity var(--motion-duration-reveal) var(--motion-ease-out),
             transform var(--motion-duration-reveal) var(--motion-ease-out),
             filter var(--motion-duration-reveal) var(--motion-ease-out);
}
.motion-ready [data-reveal]:not(.is-revealed) {
  opacity:0; transform:translate3d(0,var(--motion-distance-reveal),0); filter:blur(2px);
}
.motion-ready [data-reveal-group]:not(.is-revealed) { opacity:1; }   /* group container stays visible */
.motion-ready [data-reveal-group] > * {
  transition:opacity var(--motion-duration-reveal) var(--motion-ease-out),
             transform var(--motion-duration-reveal) var(--motion-ease-out),
             filter var(--motion-duration-reveal) var(--motion-ease-out);
  transition-delay:calc(var(--motion-order,0) * var(--motion-stagger-step));
}
.motion-ready [data-reveal-group]:not(.is-revealed) > * {
  opacity:0; transform:translate3d(0,var(--motion-distance-reveal),0); filter:blur(2px);
}
.motion-ready [data-reveal-group].is-revealed > * { opacity:1; transform:translate3d(0,0,0); filter:blur(0); }
```
- **Initial state:** `opacity:0; translate3d(0, 12px, 0); filter:blur(2px)`.
- **Final state:** `opacity:1; translate3d(0, 0, 0); filter:blur(0)`.
- **Timing:** `760ms cubic-bezier(0.16, 1, 0.3, 1)` (a strong ease-out / expo-out feel).
- **Stagger:** `transition-delay: calc(var(--motion-order,0) * 90ms)`; indices clamped to 0–8.
- **Exclusions:** `.dealer-landing`, `.private-label-landing`, `.wheel-brand-startup-landing` reveals are forced visible; `.gallery-albums[data-reveal-group]` (and its children) are forced visible with `transition:none`.

### 4.2 `data-parallax-media` — hero parallax
- JS `IntersectionObserver` (same `rootMargin:"18% 0px"`, `threshold:.01`) tracks visible media; a `requestAnimationFrame`-throttled handler computes, per element, `offset = (rect.top + rect.height/2 - innerHeight/2) / innerHeight` then `value = clamp(-t, min, t)` where `t = parseFloat(getComputedStyle(:root).getPropertyValue("--motion-parallax-y")) || 8`, and writes `el.style.setProperty("--motion-parallax-offset", `${value.toFixed(2)}px`)`. It is disabled under reduced motion and only runs when elements are visible.

CSS:
```css
.motion-ready [data-parallax-media] {
  --motion-parallax-offset:0px;
  transform:translate3d(0,var(--motion-parallax-offset),0);
  transition:transform var(--motion-duration-parallax) linear;   /* 120ms linear */
  will-change:transform;
}
```
- **Rate:** vertical translate clamped to **±8px** (`--motion-parallax-y:8px`) across a viewport of travel — a *very subtle* parallax (≤8px), smoothed with `120ms linear`. Homepage hero `<picture class="hero-bg" data-parallax-media>` is the only home instance.

### 4.3 Header behavior on scroll
- JS `syncHeader()` toggles `is-scrolled` on the header: **threshold `window.scrollY > 16`** (`header.classList.toggle("is-scrolled", window.scrollY > 16)`), bound to scroll.
- Before (default): `position:fixed; top:0; right:0; left:0; z-index:100; color:var(--color-white)` (transparent over hero), `transition:background 180ms ease,box-shadow 180ms ease,color 180ms ease,opacity 220ms ease,transform 360ms var(--motion-ease-out)`.
- After (`.is-scrolled` / also `.header-solid`): `background:rgba(255,255,255,.96); color:var(--color-ink); box-shadow:0 12px 32px rgba(15,23,42,9%); backdrop-filter:blur(18px)` — i.e. a frosted white bar, dark text, soft shadow.
- Logo swap: `.site-header .brand-logo-light { display:none }` and `.brand-logo-dark { display:block }` when scrolled (two `<img>` logos live in the brand link). `.admin-bar .site-header { top:32px }` (46px on mobile).
- Mobile nav open adds `body.nav-open`, which repaints the header dark: `body.nav-open .site-header { background:rgba(5,7,11,.98); color:var(--color-white) }` and re-shows the light logo.

### 4.4 `floating-quote` (floating Request Quote button)
- **Position:** `position:fixed; right:24px; bottom:22px; z-index:90` (mobile: `right:14px; bottom:calc(16px + env(safe-area-inset-bottom))`).
- **Appearance/idle:** always visible on home; perpetual subtle nudge animation `@keyframes floating-quote-nudge` (idle 0–86%, tiny translate near 100%): `animation:floating-quote-nudge 8s ease-in-out infinite`.
- **Hover/active:** `:hover → transform:translateY(-3px); background:var(--color-accent-dark); box-shadow:0 18px 42px rgba(127,29,29,.4)`; `:active → transform:translateY(-1px) scale(.98)`.
- **When it disappears (page-template scoping, `display:none`):** about/contact/thank-you pages, `/custom-forged-wheels-for-dealers/`, `/products/`, product-detail previews, gallery-detail previews, single product/album templates, and resource hub/article pages (`.resources-hub-page~.floating-quote, .resources-article-page~.floating-quote`).
- **When it's suppressed by state:** in the mobile nav overlay, `body.nav-open .floating-quote { opacity:0; pointer-events:none; transform:translateY(10px) }`.

### 4.5 Smooth scroll
- **Not found:** no Lenis (`.lenis` / `Lenis`), no Locomotive Scroll, no smooth-scroll library in JS or CSS (`lenis:0`, `Lenis:0`, `locomotive:0` in the bundle). The only smoothing is native `scroll-behavior` hinted by `motionBehavior()` returning `"smooth"` / `"auto"` (used for in-page anchor jumps like `#top`), and one JS `scrollCarousel` / native scrolling.

### 4.6 Carousels / sliders / tabs / filters / accordions / modals
From the theme JS function inventory (real function names quoted):
- **Carousels/sliders:** `scrollCarousel`, `setupManufacturingSliders` (the manufacturing/process page steps slider), `setupProductDetailGallery`, `setupDeferredMedia` / `loadSlideAssets` / `loadDeferredImage` (lazy slide media loading). No third-party slider library — hand-rolled.
- **Gallery filters:** `setupGalleryPage`, `setupGalleryFilters`, `setupCatalogFilters`, `setupResourcesFilters` — client-side filter UIs (the gallery/products/resources pages each have a `Filter` / `Filter Gallery` panel, `h2:Filter`). Also `setupGalleryShare`.
- **Tabs / pills:** the `resources-category-strip` and gallery filter controls act as pill/tab selectors; JS `setupResourcesSectionRail` (sticky section rail). No dedicated tab component class found.
- **Accordions:** **not found** (no `accordion`/`Accordion` in the bundle). FAQ sections are static `h2/…` blocks, not `<details>` accordions, in the fetched HTML.
- **Modals:** only 2 loose matches for "modal" in JS — no modal component. There is a `setupWheelCalculatorZoom` (zoomable wheel-offset calculator) and `setupOemWheelSpecs`.
- **Trust rotator:** `setupTrustRotator` (rotates the `.trust-strip` items where `.is-trust-rotator` is used).
- **Product render hover:** `setupProductRenderHover` swaps `.product-render-angle-base` ↔ `.product-render-angle-hover` on `(hover:hover) and (pointer:fine)`.
- **Nav interactions:** `syncHeader`, `closeMenu`, `closeSubmenus`, `openActiveSubmenus`, `setupSiteMotion`; submenu open/close on hover/focus-within (desktop) or click accordion `+`/`-` (mobile).
- **Forms/attribution:** `captureAttribution`, `appendAttributionToMessage`, `applyAttributionToForm`, `addSubmitterMirror`, `submitFormInHiddenFrame`, `submitFormWithFetch`, `submitWpformsInBackground` (WPForms-based contact/inquiry forms with hidden attribution pass-through), `setupContactFormLabels`, `setupThankYouPage`.
- **Reduced-motion guard:** `setupSiteMotion` returns early when `prefers-reduced-motion: reduce`; reveal/parallax are effectively disabled on those users.

---

## 5. Nav + footer IA

### 5.1 Primary nav (`header.site-header > nav.nav-shell`, `aria-label="Primary navigation"`)
The nav is a horizontal bar with 3 dropdown groups (`div.nav-item … data-nav-submenu`) and 3 direct links (labels as rendered):

- **Home** → `https://2nforged.com/#top`
- **Products** (submenu `#products-submenu`)
  - All Wheels → `/products/`
  - BMW M Wheels → `/bmw-m-wheels/`
  - Monoblock Wheels → `/monoblock-wheels/`
  - 2-Piece Forged Wheels → `/2-piece-forged-wheels/`
- **Gallery** (submenu `#gallery-submenu`)
  - Vehicle Gallery → `/gallery/`
  - Wheel Gallery → `/wheel-gallery/`
- **Manufacturing** → `/process/` (direct link)
- **Dealer Programs** (submenu `#dealer-programs-submenu`)
  - Dealer Supply → `/custom-forged-wheels-for-dealers/`
  - Private Label Wheels → `/private-label-wheels/`
- **Resources** → `/forged-wheel-resources/` (direct link)
- **About Us** → `/about-us/` (direct link)

Interaction: each `button.nav-submenu-toggle` (`aria-expanded`, `aria-controls`, `data-nav-submenu-toggle`) toggles `div.nav-submenu[data-nav-submenu-panel]`. Desktop = hover/focus-within reveal (`.nav-item:hover>.nav-submenu, .nav-item:focus-within>.nav-submenu`); mobile = click accordion with `+`/`-` pseudo-element. Brand = `a.brand` → home, two stacked logos (light/dark). Hamburger = `button.nav-toggle` (3 `<span>` bars, `.sr-only` label).

Note: the task brief's group names ("Site / Programs / Company / Support") are the **footer** group headings; the **header** nav groups are Products / Gallery / Dealer Programs plus direct links.

### 5.2 Footer IA (`footer > nav.footer-nav`, `aria-label="Footer navigation"`, 4 `.footer-nav-group`)
1. **Site**
   - Home → `/#top`
   - Products → `/products/`
   - Vehicle Gallery → `/gallery/`
   - Wheel Gallery → `/wheel-gallery/`
   - Manufacturing → `/process/`
   - Forged Wheel Resources → `/forged-wheel-resources/`
2. **Programs**
   - Custom Forged Wheels → `/products/`
   - Monoblock Wheels → `/monoblock-wheels/`
   - 2-Piece Forged Wheels → `/2-piece-forged-wheels/`
   - Dealers → `/custom-forged-wheels-for-dealers/`
   - Private Label → `/private-label-wheels/`
3. **Company**
   - About Us → `/about-us/`
   - Contact Us → `/contact-us/`
4. **Support**
   - Privacy Policy → `/privacy-policy/`
   - Warranty Policy → `/warranty-policy/`
   - Return & Refund Policy → `/return-refund-policy/`
   - Terms of Service → `/terms-of-service/`
   - Shipping & Packaging → `/shipping-packaging/`

Plus footer brand (logo `logo-white-cropped.png` 150×95 + tagline) and `a.footer-back-top` → `#top`.

---

## 6. Images / assets under `/wp-content/themes/2nforged-theme/assets/images/`

Distinct asset groups referenced across the fetched pages (filename → section/use). Many ship as paired `.webp` + `.jpg` (`<picture>` with `<source type="image/webp">`). Do NOT download.

**Brand / logo**
- `logo-white-nav.png`, `logo-black-nav.png` — header brand, light/dark swap on scroll.
- `logo-white-cropped.png` — footer brand.
- `logo-wordmark-cropped.png` — homepage product-collection heading wordmark.

**Hero banners**
- `Home-Banner.jpg` — homepage hero (desktop, 1672×941).
- `hero-m2-04-optimized-900/-1200.jpg|.webp` — homepage hero mobile (≤760px).
- `model-3-hero.jpg|.webp`, `tesla-model-y-hero.jpg|.webp` — vehicle/resource hero banners.

**Product renders / gallery cards**
- `product-render-01/02/03.jpg|.webp` + `product-render-01/02/03-hover.jpg|.webp` — homepage product-render grid (base + hover pair).
- `G80-M3-Side-view.jpg|.webp`, `RAM-1500-Side-view.jpg|.webp`, `Toyota-Tacoma-Side-view.jpg|.webp` — vehicle fitment reference cards.
- `gallery-gt4rs-1-quality-1600.jpg|.webp` — gallery image (vehicle gallery).
- `monoblock` (dir ref), `2-piece` (dir ref) — product-category image folders.

**Manufacturing / process shots** (used by `/process/` manufacturing slider)
- `manufacturing-wireframe`, `manufacturing-forgings`, `manufacturing-lathe`, `manufacturing-milling-01`, `manufacturing-milling-xi1/xi2/xi3-optimized`, `manufacturing-prep-01/02`, `manufacturing-color-optimized`, `manufacturing-quality-control`, `manufacturing-fea2-optimized.png` (all `.jpg|.webp` variants).

**About page**
- `about-factory-floor`, `about-cnc-station`, `about-cad-fitment`, `about-machining-detail`, `about-wheel-measurement`, `about-principles-factory` (`.jpg|.webp`).

**Dealer program**
- `dealer-program-office-consultation`, `dealer-fitment-data-support`, `dealer-order-engineering-review`, `dealer-order-cnc-progress`, `dealer-order-finished-wheel-check` (`.jpg|.webp`).

**Private label**
- `private-label-center-cap-logo`, `private-label-design-privacy`, `private-label-wheel-logo-mark` (`.jpg|.webp`).

**Resources**
- `resources-hero-wheel-collage.jpg`, `resource-manufacturing-hero.jpg`, `resource-offset-hero-diagram.jpg`, `resource-wheel-offset-calculator-sketch.jpg|.webp`, `resource-finish-solid-contrast.jpg`, `resource-category-install-guides.png`, `resource-5x1143-related-thumb.jpg`.

**UI**
- `submit-spin.svg` — form submit spinner.

**Image behavior:** served through SiteGround Optimizer + `lazysizes` (`lazysizes.min.js`), `loading="lazy" decoding="async"` on non-hero, `loading="eager" fetchpriority="high"` on the hero. Responsive `<picture>` with `srcset`/`sizes` and `<source media=… type=…>` webp/avif-free (webp + jpg).

---

## 7. Reusable blueprint notes for our build

- **Page archetypes:** (1) Home = hero + 6-cell capability strip + 3-up product grid + full-bleed gallery band. (2) Product explainer (`two-piece-*`) = dark hero + alternating answer/why/cases/detail/designs/FAQ/resources/CTA. (3) Dealer landing (`dealer-*`) = long-form 12–15 section story ending in a final CTA. (4) Hub/index pages (`resources-*`, `gallery-albums`) = hero + filter strip + grid. (5) Single-section process page with an internal slider.
- **Motion system is tiny and tokenized:** only two effects (reveal 760ms expo-out with ≤8-item 90ms stagger; ≤±8px parallax @120ms linear), both reduced-motion-aware, plus header is-scrolled at 16px. Easy to replicate exactly.
- **No third-party front-end framework:** no Lenis, no Swiper, no jQuery UI — hand-rolled IntersectionObserver + rAF. Fonts are system stacks (fast, zero webfont). Single minified CSS + single concatenated JS.
- **CTA system:** pill `.button` (`border-radius:999px`) with outline/primary/dark variants; persistent `.floating-quote` accent pill bottom-right (hidden on about/contact/products/dealer/resource pages); footer `Back to top`.
- **IA:** 4 nav groups (Products / Gallery / Dealer Programs + 3 direct links) and 4 footer groups (Site / Programs / Company / Support).

---

*Method note: home + 12 subpage HTML fetched via `curl -s -L`; interaction/logic read from the live minified `forged-site.min.js`; all CSS values quoted from the live `forged-site.min.css`. Items not present are marked "not found" rather than inferred.*
