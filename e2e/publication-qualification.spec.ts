import { expect, test } from "@playwright/test";

const origin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? 3100}`;

test("已批准英文首页的离线快照保持公开索引", async ({ page, request }) => {
  test.skip(process.env.PLAYWRIGHT_LIVE_WP === "1", "此用例验证隔离 WordPress 后的已批准英文快照");
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", origin);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", origin);
  await expect(page.getByRole("combobox", { name: "Switch language" }).first().locator("option")).toHaveCount(1);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`<loc>${origin}/</loc>`);
  for (const locale of ["zh", "es", "th"]) {
    expect(sitemap).not.toMatch(new RegExp(`<loc>${origin}/${locale}(?:/|<)`));
  }
});

test("未批准译文在页面、元数据、站点地图和切换器同时关闭", async ({ page, request }) => {
  for (const path of ["/zh/about", "/es/products/wheels", "/th/insights/how-to-measure-fitment", "/zh/support/privacy"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
    const html = await response.text();
    expect(html, path).toContain('name="robots" content="noindex"');
    expect(html, path).not.toContain('rel="canonical"');
    expect(html, path).not.toContain('hreflang=');
  }

  await page.goto("/about");
  await expect(page.getByRole("combobox", { name: "Switch language" }).first().locator("option")).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="zh"]')).toHaveCount(0);
});

test("旧语言 cookie、浏览器首选语言和查询参数都不重定向英文路径", async ({ request }) => {
  const response = await request.get("/request-a-quote?source=old-cookie", {
    maxRedirects: 0,
    headers: {
      Cookie: "fh-locale=zh",
      "Accept-Language": "zh-CN,zh;q=0.9",
      Accept: "text/html",
      "Sec-Fetch-Dest": "document",
    },
  });
  expect(response.status()).toBe(200);
  expect(response.headers().location).toBeUndefined();
  expect(response.headers()["content-language"]).toBe("en");

  const rsc = await request.get("/about?_rsc=qualification", {
    maxRedirects: 0,
    headers: { Cookie: "fh-locale=th", RSC: "1", "Next-Router-Prefetch": "1" },
  });
  expect(rsc.status()).toBe(200);
  expect(rsc.headers().location).toBeUndefined();
});
