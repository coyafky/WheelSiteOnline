import { expect, test } from "@playwright/test";

const configuredTestOrigin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? 3100}`;

test("首页公开语言和模块顺序由同一发布结果决定", async ({ page, request }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("main [data-module-id]")).toHaveCount(5);
  await expect(page.locator("main [data-module-id]").first()).toHaveAttribute("data-module-id", "H01");
  expect(await page.locator("main [data-module-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-module-id"))))
    .toEqual(["H01", "H02", "H03", "H04", "H05"]);
  await expect(page.locator('main [data-module-id="H01"] img').first()).toHaveAttribute("src", /factory\.webp/);
  await expect(page.locator('link[rel="alternate"][hreflang="zh"]')).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: /language/i }).first().locator("option")).toHaveCount(1);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain(`<loc>${configuredTestOrigin}/</loc>`);
  for (const locale of ["zh", "es", "th"]) {
    expect(xml).not.toMatch(new RegExp(`<loc>[^<]+/${locale}</loc>`));
    const unavailable = await request.get(`/${locale}`, { maxRedirects: 0 });
    expect(unavailable.status()).toBe(404);
    expect(await unavailable.text()).toContain('name="robots" content="noindex"');
  }
});

test("中文草稿经授权预览可看本语言内容，退出后仍不可公开", async ({ page, request }) => {
  test.skip(process.env.PLAYWRIGHT_LIVE_WP !== "1" || !process.env.WP_API_TOKEN, "需要本地 WordPress 编辑凭据");
  await page.goto("/api/preview?secret=e2e-preview-secret&page=home&locale=zh");
  await expect(page).toHaveURL(/\/zh$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("main [data-module-id]")).toHaveCount(5);
  await expect(page.locator("main [data-module-id=H02]")).toContainText("轮毂");

  await page.context().clearCookies();
  const unavailable = await request.get("/zh", { maxRedirects: 0 });
  expect(unavailable.status()).toBe(404);
});
