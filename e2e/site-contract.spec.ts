import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

function signedRevalidation(payload: { type: "insights" | "wheels"; slug: string }) {
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
  expect(robotsText).toContain("Sitemap: http://127.0.0.1:3100/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("http://127.0.0.1:3100/products/wheels");
  expect(xml).not.toContain("/thank-you");
  expect(xml).not.toContain("/api/inquiries");
  expect(xml).not.toContain("/gallery/finishes");

  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:3100",
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
});

test("中文独立 URL、语言声明和切换路径保持正确", async ({ page, request }) => {
  const response = await request.get("/zh/insights", {
    headers: { Cookie: "fh-locale=zh" },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-language"]).toBe("zh-CN");
  expect(response.headers()["x-robots-tag"]).toBe("noindex, follow");

  await page.context().addCookies([
    { name: "fh-locale", value: "zh", url: "http://127.0.0.1:3100" },
  ]);
  await page.goto("/zh/insights?from=language-test");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
  await expect(page.getByRole("link", { name: "获取报价" }).first()).toHaveAttribute(
    "href",
    "/zh/request-a-quote",
  );

  await page.getByRole("button", { name: "EN" }).first().click();
  await expect(page).toHaveURL(/\/insights\?from=language-test$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
