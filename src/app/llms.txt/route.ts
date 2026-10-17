import { boltPatterns } from "@/content/bolt-patterns";
import { guides } from "@/content/resources";
import { configuredSiteUrl } from "@/lib/site-url";
import { listPublishedWheelSlugs } from "@/lib/wheels";

/** Curated entry point for agents, aligned with the public sitemap. */
export async function GET(): Promise<Response> {
  if (!configuredSiteUrl) {
    return new Response("Site origin is not configured.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const base = configuredSiteUrl.origin;
  const wheelSlugs = await listPublishedWheelSlugs();
  const section = (title: string, items: Array<readonly [string, string]>) => [
    `## ${title}`,
    "",
    ...items.map(([label, path]) => `- [${label}](${base}${path})`),
    "",
  ];

  const content = [
    "# Fenghuai",
    "",
    "> Public information for Fenghuai, a B2B supplier coordinating forged wheel, EV aluminum component, custom aluminum component and self-sealing tire projects.",
    "",
    "Confirm specifications, vehicle fitment, production entity, certifications, availability, lead times and commercial terms with Fenghuai for each project. Public reference pages may include illustrative or unverified material and are not a substitute for project-specific engineering confirmation.",
    "",
    ...section("Company and capabilities", [
      ["Homepage", "/"],
      ["Company overview", "/about"],
      ["Manufacturing capabilities", "/capabilities"],
      ["Dealer supply programme", "/dealers"],
      ["Private label programme", "/dealers/private-label"],
    ]),
    ...section("Products and engineering", [
      ["Product lines", "/products"],
      ["Wheel catalogue", "/products/wheels"],
      ["Forged wheels", "/products/wheels/forged"],
      ["Flow-formed wheels", "/products/wheels/flow-formed"],
      ...wheelSlugs.map((slug) => [slug, `/products/wheels/${slug}`] as const),
      ["EV components", "/products/ev-components"],
      ["Custom aluminum components", "/products/custom-aluminum"],
      ["Self-sealing tires", "/products/safety-tires"],
      ["Custom development", "/custom-development"],
    ]),
    ...section("Insights and reference guides", [
      ["Insights library", "/insights"],
      ["Bolt pattern guides", "/insights/bolt-patterns"],
      ...boltPatterns.map((item) => [`${item.pattern} bolt pattern`, `/insights/bolt-patterns/${item.slug}`] as const),
      ...guides.map((item) => [item.title, `/insights/${item.slug}`] as const),
      ["Tools", "/tools"],
      ["Wheel offset calculator", "/tools/offset-calculator"],
    ]),
    ...section("Policies and inquiries", [
      ["Privacy policy", "/support/privacy"],
      ["Returns policy", "/support/returns"],
      ["Shipping and packaging", "/support/shipping"],
      ["Terms of service", "/support/terms"],
      ["Warranty policy", "/support/warranty"],
      ["Contact Fenghuai", "/contact"],
      ["Request a quote", "/request-a-quote"],
      ["Inquiry confirmation", "/thank-you"],
    ]),
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
