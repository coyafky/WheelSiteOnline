import type { Dictionary } from "../types";

/**
 * English dictionary — the source of truth.
 *
 * ⚠️ Rules:
 *   1. Every key here must also exist in `zh.ts`. A missing key falls back to
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
  "nav.products.safetyTires": "Safety Tires",
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

  // ── Accessibility labels ───────────────────────────────────────────────
  "a11y.primaryNav": "Primary navigation",
  "a11y.mobileNav": "Mobile navigation",
  "a11y.footerNav": "Footer navigation",
  "a11y.openNav": "Open navigation",
  "a11y.closeNav": "Close navigation",
  "a11y.switchLanguage": "Switch language",

  // ── Footer ─────────────────────────────────────────────────────────────
  "footer.tagline1": "Aluminum components for four product lines —",
  "footer.tagline2": "wheels, EV housings, custom parts, safety tires.",
  "footer.rights": "All rights reserved",
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
