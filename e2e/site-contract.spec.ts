import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

const configuredTestOrigin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? 3100}`;

function signedRevalidation(payload: { type: "insights" | "wheels" | "pages"; slug: string }) {
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", "e2e-revalidate-secret").update(body).digest("hex");
  return {
    data: body,
    headers: {
      "content-type": "application/json",
      "x-fh-signature": `sha256=${signature}`,
    },
  };
}

test("robots 与 sitemap 只发布配置域名和可索引页面", async ({ page, request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsText = await robots.text();
  expect(robotsText).toContain(`Sitemap: ${configuredTestOrigin}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain(`${configuredTestOrigin}/products/wheels`);
  expect(xml).not.toContain("/thank-you");
  expect(xml).not.toContain("/api/inquiries");
  expect(xml).not.toContain("/gallery/finishes");
  expect(xml).toContain(`<loc>${configuredTestOrigin}/</loc>`);
  expect(xml).not.toContain(`<loc>${configuredTestOrigin}/zh</loc>`);
  expect(xml).not.toContain(`<loc>${configuredTestOrigin}/es</loc>`);
  expect(xml).not.toContain(`<loc>${configuredTestOrigin}/th</loc>`);

  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    configuredTestOrigin,
  );
});

test("敏感 URL 与询盘读取接口均不公开", async ({ request }) => {
  const paths = [
    "/api/inquiries",
    "/.env",
    "/.git/config",
    "/wp-admin",
    "/wp-json/wp/v2/fh-inquiry",
  ];
  for (const path of paths) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect([404, 405]).toContain(response.status());
    expect(await response.text()).not.toMatch(/WP_INQUIRY_SERVICE_KEY|RESEND_API_KEY/);
  }
});

test("预览与 WordPress 缓存失效接口默认拒绝未授权请求", async ({ request }) => {
  const preview = await request.get("/api/preview?slug=how-to-measure-fitment", {
    maxRedirects: 0,
  });
  expect(preview.status()).toBe(401);
  expect(await preview.text()).not.toContain("how-to-measure-fitment —");

  const pagePreview = await request.get("/api/preview?page=privacy", {
    maxRedirects: 0,
  });
  expect(pagePreview.status()).toBe(401);
  const homePreview = await request.get("/api/preview?page=home&locale=zh", {
    maxRedirects: 0,
  });
  expect(homePreview.status()).toBe(401);

  const revalidate = await request.post("/api/revalidate/wordpress", {
    data: { slug: "how-to-measure-fitment" },
  });
  expect(revalidate.status()).toBe(401);
  await expect(revalidate.json()).resolves.toMatchObject({ ok: false });
});

test("授权预览可以进入、退出，并按文章路径触发缓存失效", async ({ page, request }) => {
  await page.goto(
    "/api/preview?secret=e2e-preview-secret&slug=how-to-measure-fitment",
  );
  await expect(page).toHaveURL(/\/insights\/how-to-measure-fitment$/);
  await expect(page.getByRole("status")).toContainText("WordPress preview");

  await page.getByRole("button", { name: "Exit preview" }).click();
  await expect(page).toHaveURL(/\/insights$/);
  await expect(page.getByRole("status")).toHaveCount(0);

  const revalidate = await request.post("/api/revalidate/wordpress", {
    ...signedRevalidation({ type: "insights", slug: "how-to-measure-fitment" }),
  });
  expect(revalidate.status()).toBe(200);
  await expect(revalidate.json()).resolves.toMatchObject({
    ok: true,
    paths: ["/insights", "/insights/how-to-measure-fitment"],
  });

  const wheelRevalidate = await request.post("/api/revalidate/wordpress", {
    ...signedRevalidation({ type: "wheels", slug: "fh-002" }),
  });
  expect(wheelRevalidate.status()).toBe(200);
  await expect(wheelRevalidate.json()).resolves.toMatchObject({
    ok: true,
    tag: "wheel-publication",
    paths: [
      "/products/wheels",
      "/products/wheels/flow-formed",
      "/products/wheels/fh-002",
      "/sitemap.xml",
    ],
  });

  const pageRevalidate = await request.post("/api/revalidate/wordpress", {
    ...signedRevalidation({ type: "pages", slug: "request-a-quote" }),
  });
  expect(pageRevalidate.status()).toBe(200);
  await expect(pageRevalidate.json()).resolves.toMatchObject({
    ok: true,
    tag: "site-pages",
    paths: ["/request-a-quote", "/zh/request-a-quote", "/es/request-a-quote", "/th/request-a-quote", "/sitemap.xml"],
  });
});

test("未批准的中文内容直达返回 404，旧 cookie 不改变英文路径", async ({ page, request }) => {
  const response = await request.get("/zh/insights", {
    headers: { Cookie: "fh-locale=zh" },
  });
  expect(response.status()).toBe(404);
  expect(response.headers()["content-language"]).toBe("zh-CN");
  const deniedHtml = await response.text();
  expect(deniedHtml).toContain('name="robots" content="noindex"');
  expect(deniedHtml).not.toContain('rel="canonical"');
  expect(deniedHtml).not.toContain('hreflang=');

  await page.context().addCookies([
    { name: "fh-locale", value: "zh", url: configuredTestOrigin },
  ]);
  await page.goto("/insights?from=language-test");
  await expect(page).toHaveURL(/\/insights\?from=language-test$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("combobox", { name: "Switch language" }).first().locator("option")).toHaveCount(1);
});

test("西班牙语与泰语未批准路径不可公开", async ({ request }) => {
  for (const [path, language] of [["/es/about", "es-ES"], ["/th/about", "th-TH"]] as const) {
    const response = await request.get(path, {
      headers: { Cookie: `fh-locale=${path.slice(1, 3)}` },
    });
    expect(response.status()).toBe(404);
    expect(response.headers()["content-language"]).toBe(language);
    expect(await response.text()).toContain('name="robots" content="noindex"');
  }
});

test("未批准的中文首页不公开，旧 cookie 不改写英文询盘路径", async ({ request }) => {
  const home = await request.get("/zh", { maxRedirects: 0 });
  expect(home.status()).toBe(404);
  expect(await home.text()).toContain('name="robots" content="noindex"');
  const documentVisit = await request.get("/request-a-quote?from=home", {
    headers: { Cookie: "fh-locale=zh", Accept: "text/html", "Sec-Fetch-Dest": "document" },
    maxRedirects: 0,
  });
  expect(documentVisit.status()).toBe(200);
  expect(documentVisit.headers().location).toBeUndefined();
});

test("首页恢复完整品牌首屏并保留五个内容区块", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-home-intent-entry]")).toHaveCount(0);
  await expect(page.locator("main > section")).toHaveCount(5);
  await expect(page.locator("#top")).toBeVisible();
  await expect(page.locator("#product-lines")).toBeAttached();
  await expect(page.locator('[aria-labelledby="capabilities-title"]')).toBeAttached();
  await expect(page.locator("#top .btn-pill-solid")).toBeVisible();
  await expect(page.locator("#top .btn-pill-outline")).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-home-intent-entry]")).toHaveCount(0);
  const heroBox = await page.locator("#top").boundingBox();
  expect(heroBox).not.toBeNull();
  expect(heroBox!.height).toBeGreaterThanOrEqual(844);
});

test("公开内容页统一使用 Astryx 面包屑并标记当前页面", async ({ page }) => {
  const routes = [
    "/products/wheels",
    "/products/wheels/dm902",
    "/dealers/private-label",
    "/fitment/bmw-m",
    "/insights/bolt-patterns",
    "/insights/bolt-patterns/5x112",
    "/insights/how-to-measure-fitment",
    "/tools/offset-calculator",
    "/support/privacy",
    "/products/wheels/flow-formed",
  ];

  for (const route of routes) {
    await page.goto(route);
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb).toHaveClass(/astryx-breadcrumbs/);
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveCount(1);
  }

  const denied = await page.goto("/zh/products/wheels");
  expect(denied?.status()).toBe(404);
});

test("轮毂无结果页使用 Astryx EmptyState 并保留筛选恢复入口", async ({ page }) => {
  await page.goto("/products/wheels?q=__no_published_model__");

  const emptyState = page.locator(".astryx-empty-state");
  await expect(emptyState).toHaveCount(1);
  await expect(emptyState.getByRole("heading", { level: 2 })).toContainText(
    "No published model matches",
  );
  const emptyRegion = page.getByRole("region", { name: "Wheel catalogue empty results" });
  await expect(emptyRegion.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
    "href",
    "/products/wheels",
  );
  await expect(emptyRegion.getByRole("link", { name: "Request a wheel review" })).toHaveAttribute(
    "href",
    /\/request-a-quote\?/,
  );
});

test("轮毂筛选器使用 Astryx Field 外壳并保留原生 GET 字段与 URL 状态", async ({
  page,
  request,
}) => {
  await page.goto("/products/wheels?diameter=18&pcd=5x112");

  const desktopForm = page.locator(
    'aside form[aria-label="Filter the wheel catalogue"]',
  );
  await expect(desktopForm.locator(".astryx-field").first()).toBeVisible();
  await expect(
    desktopForm.locator('input[name="diameter"][value="18"]'),
  ).toBeChecked();
  await expect(
    desktopForm.locator('input[name="pcd"][value="5x112"]'),
  ).toBeChecked();

  const html = await (await request.get("/products/wheels?diameter=18&pcd=5x112")).text();
  expect(html).toContain('name="diameter"');
  expect(html).toContain('name="pcd"');
  expect(html).toContain('value="5x112"');
});

test("轮毂筛选提示使用 Astryx Banner 且结果摘要不被当成警报", async ({ page }) => {
  await page.goto("/products/wheels?diameter=18&pcd=5x112");

  await expect(page.locator(".astryx-banner")).toHaveCount(2);
  await expect(
    page.locator('[role="status"]').filter({ hasText: "How filters combine" }),
  ).toHaveCount(2);
  await expect(
    page.locator('[role="alert"]').filter({ hasText: "How filters combine" }),
  ).toHaveCount(0);
  await expect(
    page.locator('.astryx-banner-description:visible').filter({
      hasText: "Values in the same group add together.",
    }),
  ).toHaveCount(1);
  await expect(
    page.locator('p:visible').filter({ hasText: "models match the selected production specifications" }),
  ).toHaveCount(1);
});

test("面包屑与空状态在无 JavaScript 的 HTML 中仍然存在", async ({ request }) => {
  const breadcrumbHtml = await (await request.get("/products/wheels")).text();
  expect(breadcrumbHtml).toContain("astryx-breadcrumbs");

  const emptyHtml = await (await request.get("/products/wheels?q=__no_published_model__")).text();
  expect(emptyHtml).toContain("astryx-empty-state");
  expect(emptyHtml).toContain("No published model matches");
});

test("已公开的英文法律文档与 Insights 文章共享 Astryx Outline", async ({ page }) => {
  await page.goto("/support/privacy");
  await expect(page.getByRole("heading", { name: "On this page", level: 2 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Page sections" })).toHaveClass(/astryx-outline/);

  await page.goto("/insights/how-to-measure-fitment");
  await expect(page.locator(".astryx-outline")).toHaveCount(1);
});

test("长文 Outline 在无 JavaScript 的 HTML 中保留锚点与全文", async ({ request }) => {
  for (const route of ["/support/privacy", "/insights/how-to-measure-fitment"]) {
    const html = await (await request.get(route)).text();
    expect(html).toContain("astryx-outline");
    expect(html).toContain('href="#section-1"');
    expect(html).toContain('id="section-1"');
  }
});
