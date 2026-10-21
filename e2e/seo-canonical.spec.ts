import { expect, test } from "@playwright/test";

/**
 * Canonical / robots consistency across the public routes.
 *
 * `buildRouteMetadata()` produces both fields from one publication decision, so
 * they cannot disagree. These assertions check that on the rendered HTML, which
 * is the only place the result is actually observable — a unit test cannot see
 * it because the module is server-only.
 *
 * The invariant: a page is either indexable AND carries exactly one
 * self-referential canonical, or it is non-indexable AND carries none.
 */

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/capabilities",
  "/contact",
  "/custom-development",
  "/dealers",
  "/dealers/private-label",
  "/insights",
  "/insights/bolt-patterns",
  "/products",
  "/products/wheels",
  "/products/ev-components",
  "/products/safety-tires",
  "/request-a-quote",
  "/tools",
  "/tools/offset-calculator",
  "/support/privacy",
  "/support/returns",
  "/support/shipping",
  "/support/terms",
  "/support/warranty",
] as const;

function extractCanonical(html: string): string[] {
  return [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/g)].map((m) => m[0]);
}

function extractRobots(html: string): string | null {
  const m = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/);
  return m ? m[1] : null;
}

test("公开路由的 canonical 与 robots 保持一致", async ({ request }) => {
  const failures: string[] = [];

  for (const route of PUBLIC_ROUTES) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status(), `${route} 应可访问`).toBe(200);

    const html = await response.text();
    const canonicals = extractCanonical(html);
    const robots = extractRobots(html);
    // No robots meta at all means "index by default", which is indexable.
    // Only an explicit `noindex` marks a page as withheld.
    const explicitlyNoindex = robots !== null && /noindex/.test(robots);

    if (canonicals.length > 1) {
      failures.push(`${route}: 出现 ${canonicals.length} 个 canonical（必须唯一）`);
    }

    if (!explicitlyNoindex && canonicals.length === 0) {
      failures.push(`${route}: 可索引（robots=${robots ?? "未设置"}）但没有 canonical`);
    }
    if (explicitlyNoindex && canonicals.length > 0) {
      failures.push(`${route}: robots="${robots}" 不可索引，却仍有 canonical`);
    }
  }

  expect(failures, failures.join("\n")).toEqual([]);
});

test("canonical 指向自身且为绝对地址", async ({ request }) => {
  for (const route of ["/about", "/products/wheels", "/support/terms"] as const) {
    const html = await (await request.get(route)).text();
    const [canonical] = extractCanonical(html);
    expect(canonical, `${route} 应有 canonical`).toBeTruthy();

    const href = canonical.match(/href="([^"]+)"/)?.[1] ?? "";
    expect(href.startsWith("http"), `${route} 的 canonical 应为绝对地址`).toBe(true);

    expect(new URL(href).pathname, `${route} 的 canonical 应指向自身`).toBe(route);
  }
});

test("转化确认页不索引也不被跟随", async ({ request }) => {
  const html = await (await request.get("/thank-you")).text();
  expect(extractCanonical(html)).toHaveLength(0);
  const robots = extractRobots(html) ?? "";
  expect(robots).toContain("noindex");
  expect(robots).toContain("nofollow");
});

test("未批准的图集页不索引且无 canonical", async ({ request }) => {
  const html = await (await request.get("/products/custom-aluminum")).text();
  expect(extractCanonical(html)).toHaveLength(0);
  expect(extractRobots(html) ?? "").toContain("noindex");
});
