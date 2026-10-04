import type { NavItem } from "./types";

/**
 * Site-level configuration: identity, navigation, contact, legal.
 *
 * `PLACEHOLDER` marks anything that must be replaced with Fenghuai's real
 * details before launch. Grep for it before going live.
 */

export const site = {
  name: "Fenghuai",
  shortName: "Technology",
  /**
   * ⚠️ Four parallel product lines — the company is NOT a wheel-only shop.
   * The clone-era name/tagline below said "Forged Wheels" and made every page
   * read as a single-line supplier. See ARCHITECTURE/page-architecture/README.md §0①.
   */
  tagline: "Aluminum components across four product lines",
  description:
    "Aluminum component manufacturing across four product lines — wheels, EV powertrain housings, custom aluminum parts and safety tires — for dealers, Tier 1 suppliers and OEM programmes.",
  /** PLACEHOLDER: confirm production domain before launch. */
  url: "https://www.fenghuai.com",
  /** PLACEHOLDER: replace with the real sales inbox and phone. */
  contact: {
    email: "sales@fenghuai.com",
    phone: "+86 000 0000 0000",
    addressLines: ["Fenghuai Manufacturing", "Guangdong, China"],
    hours: "Mon–Sat, 09:00–18:00 (GMT+8)",
    /**
     * Set to `true` once the email and phone above are Fenghuai's real
     * business details. Pages that must not publish a fake number (e.g.
     * `/thank-you`'s urgent-contact block) read this flag and fall back to an
     * explicit placeholder until it flips.
     */
    confirmed: false,
  },
  /**
   * ⚠️ There is deliberately no `leadTime` field here.
   *
   * One used to live here — `leadTime: "20–30 days"`, marked "Confirm before
   * launch" — and it was never confirmed. It had **zero consumers**, so it
   * never rendered, which made it worse rather than better: a dead constant
   * holding an unverified commercial commitment, one `site.leadTime` reference
   * away from publishing itself on any page.
   *
   * The same unconfirmed window had also been copied into `faq.ts` and into a
   * homepage capability cell. Those are now removed (2026-10-02) and the FAQ
   * answer states the timing is quoted in writing rather than as a standing
   * figure.
   *
   * If Fenghuai confirms a real production window, add it back **as a single
   * field with a named owner and a date**, and have every page read from it —
   * do not restate the number in page copy.
   */
} as const;

export const primaryNav: NavItem[] = [
  {
    label: "Products",
    labelKey: "nav.products",
    href: "/products",
    children: [
      { label: "All Product Lines", labelKey: "nav.products.allLines", href: "/products" },
      { label: "Wheels", labelKey: "nav.products.wheels", href: "/products/wheels" },
      { label: "EV Powertrain Housings", labelKey: "nav.products.evComponents", href: "/products/ev-components" },
      { label: "Custom Aluminum", labelKey: "nav.products.customAluminum", href: "/products/custom-aluminum" },
      { label: "Safety Tires", labelKey: "nav.products.safetyTires", href: "/products/safety-tires" },
    ],
  },
  {
    label: "Capabilities",
    labelKey: "nav.capabilities",
    href: "/capabilities",
    children: [
      { label: "Manufacturing & Quality", labelKey: "nav.capabilities", href: "/capabilities" },
      { label: "Custom Development", labelKey: "nav.customDevelopment", href: "/custom-development" },
    ],
  },
  {
    label: "Dealer Programs",
    labelKey: "nav.dealerPrograms",
    href: "/dealers",
    children: [
      { label: "Dealer Supply", labelKey: "nav.dealers.supply", href: "/dealers" },
      { label: "Private Label", labelKey: "nav.dealers.privateLabel", href: "/dealers/private-label" },
    ],
  },
  {
    label: "Insights",
    labelKey: "nav.insights",
    href: "/insights",
    children: [
      { label: "All Guides", labelKey: "nav.insights.allGuides", href: "/insights" },
      { label: "Bolt Pattern Guides", labelKey: "nav.insights.boltPatterns", href: "/insights/bolt-patterns" },
    ],
  },
  { label: "About Us", labelKey: "nav.about", href: "/about" },
];

export const footerNav: {
  heading: string;
  headingKey: string;
  links: { label: string; labelKey?: string; href: string }[];
}[] = [
  {
    heading: "Products",
    headingKey: "footer.group.products",
    links: [
      { label: "Wheels", labelKey: "nav.products.wheels", href: "/products/wheels" },
      { label: "EV Powertrain Housings", labelKey: "nav.products.evComponents", href: "/products/ev-components" },
      { label: "Custom Aluminum", labelKey: "nav.products.customAluminum", href: "/products/custom-aluminum" },
      { label: "Safety Tires", labelKey: "nav.products.safetyTires", href: "/products/safety-tires" },
    ],
  },
  {
    heading: "Company",
    headingKey: "footer.group.company",
    links: [
      { label: "About Us", labelKey: "nav.about", href: "/about" },
      { label: "Capabilities", labelKey: "nav.capabilities", href: "/capabilities" },
      { label: "Custom Development", labelKey: "nav.customDevelopment", href: "/custom-development" },
      { label: "Dealer Supply", labelKey: "nav.dealers.supply", href: "/dealers" },
      { label: "Private Label", labelKey: "nav.dealers.privateLabel", href: "/dealers/private-label" },
      { label: "Insights", labelKey: "nav.insights", href: "/insights" },
    ],
  },
  {
    heading: "Support",
    headingKey: "footer.group.support",
    links: [
      { label: "Warranty Policy", labelKey: "footer.support.warranty", href: "/support/warranty" },
      { label: "Return & Refund", labelKey: "footer.support.returns", href: "/support/returns" },
      { label: "Shipping & Packaging", labelKey: "footer.support.shipping", href: "/support/shipping" },
      { label: "Terms of Service", labelKey: "footer.support.terms", href: "/support/terms" },
      { label: "Privacy Policy", labelKey: "footer.support.privacy", href: "/support/privacy" },
    ],
  },
  {
    heading: "Enquiries",
    headingKey: "footer.group.enquiries",
    links: [
      { label: "Request a Quote", labelKey: "cta.requestQuote", href: "/request-a-quote" },
      { label: "Contact Us", labelKey: "footer.enquiries.contact", href: "/contact" },
      { label: "Offset Calculator", labelKey: "footer.enquiries.offsetCalculator", href: "/tools/offset-calculator" },
    ],
  },
]
