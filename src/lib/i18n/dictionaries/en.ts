import type { Dictionary } from "../types";

/**
 * English dictionary — the source of truth.
 *
 * ⚠️ Rules:
 *   1. Every key here must also exist in every locale dictionary. A missing key falls back to
 *      English, so a gap is invisible at runtime — never leave one.
 *   2. Keys are dot-namespaced by UI region: `nav.*`, `footer.*`, `cta.*`,
 *      `common.*`. Do not invent new namespaces without updating both files.
 *   3. This file holds CHROME text only. Page body copy lives in
 *      `src/content/*` — do not migrate page content here.
 */

export const en: Dictionary = {
  // ── Navigation ─────────────────────────────────────────────────────────
  "nav.products": "Products",
  "nav.products.allWheels": "All Wheels",
  "nav.products.wheels": "Wheels",
  "nav.products.evComponents": "EV Powertrain Housings",
  "nav.products.customAluminum": "Custom Aluminum",
  "nav.products.safetyTires": "Self-Sealing Tires",
  "nav.gallery": "Gallery",
  "nav.fitment": "Fitment",
  "nav.capabilities": "Capabilities",
  "nav.customDevelopment": "Custom Development",
  "nav.dealerPrograms": "Dealer Programs",
  "nav.insights": "Insights",
"nav.resources": "Resources",
  "nav.tools": "Tools",
  "nav.products.allLines": "All Product Lines",
"nav.dealers.supply": "Dealer Supply",
"nav.dealers.privateLabel": "Private Label",
"nav.insights.allGuides": "All Guides",
"nav.insights.boltPatterns": "Bolt Pattern Guides",
"nav.about": "About Us",

  // ── Calls to action ────────────────────────────────────────────────────
  "cta.requestQuote": "Request a Quote",
  "cta.viewRange": "View the range",
  "cta.backToTop": "Back to top",
  // Shared <DealerCta> defaults — used by every bare `<DealerCta />` call
  // site. Pages that know their own offer pass `title`/`body` and override
  // these; the defaults are only the fallback.
  "cta.enquiriesEyebrow": "Enquiries",
  "cta.dealerTitle": "Tell us what the part has to do",
  "cta.dealerBody": "Send a drawing, a sample or a target specification. We will come back with a process route, a tooling position and pricing.",

  // ── Catalogue chrome (/products) ───────────────────────────────────────
  // Section headings/ledes for the product hub. The catalogue BODY copy is
  // served from WordPress; these are the literals that live in JSX.
  "catalogue.families.eyebrow": "Four product lines",
  "catalogue.families.heading": "Four lines, one project interface",
  "catalogue.families.lede": "Wheels, EV components, custom aluminum and self-sealing tires follow product-specific manufacturing routes across our specialized production bases.",
  "catalogue.card.explore": "Explore",
  "catalogue.fitmentLink": "Fitment resources",
  "catalogue.resources.eyebrow": "Keep exploring",
  "catalogue.resources.heading": "Related resources",
  "catalogue.faq.eyebrow": "Questions",
  "catalogue.faq.heading": "Ordering questions, answered",
  "catalogue.faq.lede": "The questions dealers ask before the first order. If yours is not here, ask us directly — we would rather answer it early than discover it at order stage.",
  "brand.division": "Manufacturing",
  "breadcrumb.label": "Breadcrumb",
  "breadcrumb.home": "Home",
  "outline.heading": "On this page",
  "outline.label": "Page sections",

  // ── Homepage procurement starting points ──────────────────────────────
  "home.intent.eyebrow": "Start with what you have",
  "home.intent.heading": "What do you need to develop or source?",
  "home.intent.wheelModel": "I have a wheel model",
  "home.intent.wheelModelHint": "Start with a model, code or fitment.",
  "home.intent.drawingSample": "I have a drawing or sample",
  "home.intent.drawingSampleHint": "Send the brief and we will route it.",
  "home.intent.productLine": "I'm exploring a product line",
  "home.intent.productLineHint": "Compare the four manufacturing routes.",

  // ── Accessibility labels ───────────────────────────────────────────────
  "a11y.primaryNav": "Primary navigation",
  "a11y.mobileNav": "Mobile navigation",
  "a11y.footerNav": "Footer navigation",
  "a11y.openNav": "Open navigation",
  "a11y.closeNav": "Close navigation",
  "a11y.switchLanguage": "Switch language",
  "a11y.toggleSubmenu": "Toggle submenu for",
  "a11y.siteHome": "Fenghuai home",
  "error.notFound.heading": "Page not found",
  "error.notFound.body": "The page may have moved, or the link may be incorrect.",
  "error.notFound.cta": "Return to homepage",
  "error.generic.heading": "Something went wrong",
  "error.generic.body": "We could not load this page. Please try again.",
  "error.generic.retry": "Try again",

  // ── Footer ─────────────────────────────────────────────────────────────
  "footer.tagline1": "Four automotive product lines —",
  "footer.tagline2": "wheels, EV housings, custom parts, self-sealing tires.",
  "footer.rights": "All rights reserved",
  "footer.ctaEyebrow": "Start a production conversation",
  "footer.ctaHeading": "Bring us the brief",
  "footer.ctaBody": "Share the drawing, fitment or supply requirement. We will route it to the right product line and reply with the next information we need.",
  "footer.group.products": "Products",
  "footer.group.company": "Company",
  "footer.support.warranty": "Warranty Policy",
"footer.support.returns": "Return & Refund",
"footer.support.shipping": "Shipping & Packaging",
"footer.support.terms": "Terms of Service",
"footer.support.privacy": "Privacy Policy",
"footer.enquiries.contact": "Contact Us",
"footer.enquiries.offsetCalculator": "Offset Calculator",
"footer.group.support": "Support",
  "footer.group.enquiries": "Enquiries",
};
