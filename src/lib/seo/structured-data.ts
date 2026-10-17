import type { Locale } from "@/lib/i18n/types";

/**
 * Site-level structured data: Organization, WebSite and BreadcrumbList.
 *
 * These describe the *publisher*, not a page's content, so they are emitted once
 * per page from the root layout rather than copied into every page.
 *
 * ── Evidence discipline ────────────────────────────────────────────────────
 * `site.contact.confirmed` is `false`, which means the phone number and inbox in
 * `site.ts` are placeholders. Publishing them as `telephone`/`email` would hand
 * search engines a fake number for a real business — worse than saying nothing,
 * because structured data is treated as a factual claim and surfaces in rich
 * results.
 *
 * So contact fields are emitted only when confirmed. The entity still declares
 * its name, URL and logo, which are safe and useful today.
 */

export type JsonLd = Record<string, unknown>;

/**
 * The publisher facts these entities describe.
 *
 * Passed in rather than imported so the module stays loadable by the test
 * runner (it cannot resolve the `@/` alias) and so a caller cannot silently
 * publish a different company than the one it renders.
 */
export type PublisherInfo = {
  name: string;
  description: string;
  contact: {
    /** When false, the contact fields below are placeholders and are withheld. */
    confirmed: boolean;
    email: string;
    phone: string;
  };
};

/** Absolute URL for this site, honouring the configured base. */
function absolute(path: string, baseUrl: string): string {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

export function organizationJsonLd(baseUrl: string, publisher: PublisherInfo): JsonLd {
  const org: JsonLd = {
    "@type": "Organization",
    "@id": absolute("/#organization", baseUrl),
    name: publisher.name,
    url: absolute("/", baseUrl),
    description: publisher.description,
  };

  // Only publish contact details that the business has confirmed. See the file
  // header: unconfirmed values here are placeholders, not facts.
  if (publisher.contact.confirmed) {
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "sales",
      email: publisher.contact.email,
      telephone: publisher.contact.phone,
      availableLanguage: ["en", "zh", "es", "th"],
    };
    org.address = {
      "@type": "PostalAddress",
      addressLocality: "Guangdong",
      addressCountry: "CN",
    };
  }

  return org;
}

export function websiteJsonLd(baseUrl: string, locales: readonly Locale[], publisher: PublisherInfo): JsonLd {
  const site_: JsonLd = {
    "@type": "WebSite",
    "@id": absolute("/#website", baseUrl),
    url: absolute("/", baseUrl),
    name: publisher.name,
    description: publisher.description,
    inLanguage: locales.length > 0 ? locales : ["en"],
    publisher: { "@id": absolute("/#organization", baseUrl) },
  };
  return site_;
}

/**
 * Breadcrumb trail for one page.
 *
 * Trails are built from the public path so a page's ancestors cannot disagree
 * with its canonical URL. Home is always the first crumb; the current page is
 * always last and carries no link, per schema.org convention.
 */
export function breadcrumbJsonLd(
  baseUrl: string,
  path: string,
  trail: readonly { name: string; path: string }[],
): JsonLd | null {
  if (trail.length < 2) return null; // A one-item trail says nothing.
  return {
    "@type": "BreadcrumbList",
    "@id": absolute(`${path}#breadcrumb`, baseUrl),
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(index < trail.length - 1 ? { item: absolute(crumb.path, baseUrl) } : {}),
    })),
  };
}

/**
 * Combine several entities into one `@graph`.
 *
 * A single script tag with a graph is preferred over several tags: it lets the
 * entities reference each other by `@id` instead of being separate islands.
 */
export function jsonLdGraph(entities: (JsonLd | null)[]): JsonLd | null {
  const present = entities.filter((entity): entity is JsonLd => entity !== null);
  if (present.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@graph": present,
  };
}

/**
 * Serialise for a `<script type="application/ld+json">`.
 *
 * `<` is escaped so a `</script>` inside any string cannot terminate the tag —
 * structured data often interpolates CMS content, which is not trusted here.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
