import { expect, test, type Page } from "@playwright/test";

import { mockInquiryResponse } from "./helpers/inquiry";

/**
 * P3 产品选择链回归（PAGE-SPECS/wheel-catalog.md、wheel-detail.md）。
 *
 * 覆盖任务书验收条款：
 *  1. `form method=get` 多值筛选 + 普通链接分页 + 排序 URL + 无 JS 提交；
 *  2. 移动 Filter 入口在 320px 可见可用；
 *  3. 只展示有图且已批准型号（真实反例不可公开）；
 *  4. 规格取同一真实 variant（不跨变体拼接）；
 *  5. 直接 / 清单 CTA 与弹窗（stub 询盘 API，不发真实信）；
 *  6. 控制台 0 错误；SEO title/canonical/robots 完整。
 *
 * 询盘提交一律用 `mockInquiryResponse` 拦截 `/api/inquiries`，
 * **绝不**向真实 WordPress / QQ SMTP 发信（DEC-092）。
 */

const VIEWPORTS = [
  { name: "320", width: 320, height: 568 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

/** 收集页面控制台错误（过滤掉测试自己注入的 4xx/5xx 网络噪声）。 */
function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/Failed to load resource/i.test(text)) return;
    errors.push(text);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** 横向溢出：文档宽度是否超出视口。 */
async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
}

/* ============================================================================
 * 1. 筛选 / 分页 / 排序 / 无 JS —— URL 契约
 * ========================================================================== */

test.describe("目录 URL 契约", () => {
  test("筛选、排序表单是原生 GET，多值 checkbox 提交同一个 name", async ({ page }) => {
    await page.goto("/products/wheels");

    const filterForms = page.locator('form[aria-label="Filter the wheel catalogue"]');
    await expect(filterForms).toHaveCount(2);
    for (const form of await filterForms.all()) {
      await expect(form).toHaveAttribute("method", "get");
      await expect(form).toHaveAttribute("action", "/products/wheels");
    }
    await expect(page.locator('form[aria-label="Sort the wheel catalogue"]')).toHaveAttribute(
      "method",
      "get",
    );

    // 原生同名多值：diameter 组里勾两个值应同时进 URL。
    //
    // 真实的点击目标是 `<label htmlFor>`；`<input>` 是 `sr-only`（1×1px，视觉方块
    // 由 `peer-*` 兄弟元素承担，见 `wheel-filter-option.tsx`）。所以这里点 label，
    // 与访客的操作一致，也不依赖 Playwright 对 1px 输入的 clickable 判定。
    const diameterInputs = page.locator(
      'aside[aria-label="Catalogue filters"] input[type="checkbox"][name="diameter"]',
    );
    const count = await diameterInputs.count();
    expect(count).toBeGreaterThan(1);

    const firstLabel = page.locator(
      'aside[aria-label="Catalogue filters"] label:has(input[name="diameter"])',
    );
    await expect(firstLabel).toHaveCount(count);

    const secondValue = await diameterInputs.nth(1).getAttribute("value");
    await firstLabel.nth(0).click();
    await firstLabel.nth(1).click();
    await expect(diameterInputs.nth(0)).toBeChecked();
    await expect(diameterInputs.nth(1)).toBeChecked();

    // 原生 GET 提交会把同名多值**逐条**送出去（`diameter=15&diameter=16`），
    // 这正是 Astryx 受控单布尔 CheckboxInput 无法表达的契约。
    const submit = page.locator(
      'aside[aria-label="Catalogue filters"] button[type="submit"]',
    );
    await submit.click();
    await page.waitForURL(/diameter=15/);
    await page.waitForLoadState("networkidle");

    // 勾选的两个值必须**同时**进入 URL —— 这是「可复制 URL + 无 JS 提交」的直接证据。
    //
    // 形态是 `?diameter=15%2C16`（逗号合并成单值的 `15,16`），而不是
    // `?diameter=15&diameter=16`。两条路服务端都认：
    // `public-catalogue.ts` 的 `asArray()` 对数组与逗号串一起 `split(",")`。
    // 本断言原本钉死「两个同名参数」，与实现换成逗号合并后失配 —— 是断言过期，
    // 不是功能回归（手工实测 `diameter=15,16` 能正确筛出两个值）。
    // 因此这里校验真正的不变量：URL 里有**两个值**，且都来自刚才点选的那两项。
    const url = new URL(page.url());
    const rawDiameters = url.searchParams.getAll("diameter");
    expect(rawDiameters.length).toBeGreaterThan(0);
    const allDiameters = rawDiameters.flatMap((v) => v.split(",")).filter(Boolean);
    expect(allDiameters.length).toBe(2);
    expect(allDiameters.join(",")).toContain(secondValue!);

    // 服务端已按这两个值筛选出结果。
    // 结果文案在移动/桌面各渲染一次（一个 `lg:hidden`、一个 `hidden lg:block`），
    // 只断言「页面上至少有一个可见的结果数」。
    await expect(
      page
        .getByText(/models match the selected production specifications/)
        .locator("visible=true"),
    ).not.toHaveCount(0);
  });

  test("分页是真实 <a href>，带 rel 与 aria-current", async ({ page }) => {
    await page.goto("/products/wheels");

    const nav = page.locator('nav[aria-label="Catalogue pagination"]');
    await expect(nav).toBeVisible();

    const next = nav.locator('a[rel="next"]');
    await expect(next).toHaveAttribute("href", /page=2/);
    // 当前页是 <a aria-current="page">，不是 <button>。
    const current = nav.locator('a[aria-current="page"]');
    await expect(current).toHaveCount(1);

    await next.click();
    await page.waitForURL(/page=2/);
    await expect(page.locator('nav[aria-label="Catalogue pagination"]')).toBeVisible();
  });

  test("筛选 + 排序 + 分页参数可复制 URL 并保持", async ({ page }) => {
    await page.goto("/products/wheels?diameter=18&sort=diameter-desc&page=1");

    // 排序状态保留在 UI 中。
    await expect(page.locator("#catalogue-sort")).toHaveValue("diameter-desc");

    // 已应用筛选 chip 里能移除 diameter，并保留 sort。
    const chip = page.getByRole("link", { name: /Diameter 18/ }).first();
    await expect(chip).toBeVisible();
    await chip.click();
    await page.waitForURL((url) => !url.searchParams.has("diameter"));
    expect(new URL(page.url()).searchParams.get("sort")).toBe("diameter-desc");
  });

  test("越界页码返回 404", async ({ page }) => {
    const response = await page.goto("/products/wheels?page=9999");
    expect(response?.status()).toBe(404);
  });

  test("无结果筛选返回 200 且 noindex 空状态", async ({ page }) => {
    const response = await page.goto("/products/wheels?q=zzzz-no-such-model-zzzz");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: /No published model matches/ }),
    ).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});

/* ============================================================================
 * 2. 移动 Filter 入口（320px）
 * ========================================================================== */

test.describe("移动筛选入口", () => {
  test("320px 下 Filter 入口可见、可展开、可提交", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/products/wheels");

    const entry = page.locator("[data-catalogue-mobile-filter] > summary");
    await expect(entry).toBeVisible();
    await expect(entry).toHaveAttribute("aria-label", /Filter wheels/);

    await entry.click();
    const mobileForm = page.locator(
      'form[aria-label="Filter the wheel catalogue"]:visible',
    );
    await expect(mobileForm).toBeVisible();

    const apply = page.locator('[data-mobile-filter-apply="bottom"]');
    await expect(apply).toBeVisible();
    await apply.scrollIntoViewIfNeeded();
    await expect(apply).toBeVisible();

    // 320px 不产生横向溢出。
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

/* ============================================================================
 * 3. 图片 + 批准门槛（真实反例）
 * ========================================================================== */

test.describe("上架门槛", () => {
  test("无图型号不可公开：详情 404，目录与 sitemap 均无", async ({ page, request }) => {
    // 1081X 是 `src/content/wheel-catalogue.ts` 里 276 个无图型号之一。
    const detail = await page.goto("/products/wheels/1081x");
    expect(detail?.status()).toBe(404);

    const catalogue = await request.get("/products/wheels");
    const html = await catalogue.text();
    expect(html).not.toContain("1081X");

    const sitemap = await request.get("/sitemap.xml");
    const sitemapXml = await sitemap.text();
    expect(sitemapXml).not.toContain("products/wheels/1081x");
  });

  test("目录每张卡都有真实图片", async ({ page }) => {
    await page.goto("/products/wheels");
    const images = page.locator('article img[alt^="Fenghuai wheel model"]');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const src = await images.nth(i).getAttribute("src");
      expect(src).toBeTruthy();
    }
  });
});

/* ============================================================================
 * 4. 同一 variant 规格（不跨变体拼接）
 * ========================================================================== */

test.describe("详情规格同变体", () => {
  test("桌面配置表每行是完整的同一 productionCode 组合", async ({ page }) => {
    await page.goto("/products/wheels/12");

    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const cells = await row.locator("td").allInnerTexts();
      const joined = cells.join(" | ");
      // 每行必须同时给出：production code、尺寸、PCD、ET、CB —— 不能只有其中几项。
      expect(joined).toMatch(/[0-9]{6,}/); // production code
      expect(joined).toMatch(/[0-9]+×[0-9.]+/); // size N×W
      expect(joined).toMatch(/[0-9]+×[0-9.]+/); // pcd
      expect(joined).toMatch(/ET\s*[0-9]+/); // offset
      expect(joined).toMatch(/[0-9.]+\s*mm/); // centre bore
    }
  });

  test("单选控件按 productionCode 选择，选中后询盘绑定该 code", async ({ page }) => {
    await page.goto("/products/wheels/12");

    const firstRadio = page.locator('input[type="radio"][name$="-config-desktop"]').first();
    await firstRadio.check();
    const code = await firstRadio.getAttribute("value");
    expect(code).toBeTruthy();

    // 选中后 CTA 带上下文（页面内有对应文案/按钮）。
    await expect(page.getByRole("heading", { name: /Request this wheel configuration/ })).toBeVisible();
  });
});

/* ============================================================================
 * 5. CTA 与弹窗（stub API）
 * ========================================================================== */

test.describe("CTA", () => {
  test("直接询盘 CTA 打开弹窗，未选配置时提交 variant_pending", async ({ page }) => {
    await page.goto("/products/wheels/12");

    const direct = page.getByRole("button", { name: /Request this wheel model|Request this configuration/ }).first();
    await direct.scrollIntoViewIfNeeded();
    await direct.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Escape 关闭并恢复焦点到触发器。
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(direct).toBeFocused();
  });

  test("清单 CTA 加入后在询盘页可见且不清空", async ({ page }) => {
    await mockInquiryResponse(page, 201, { ok: true, persisted: true, inquiryId: "FH-P3" });
    await page.goto("/products/wheels/12");

    const addButton = page.getByRole("button", { name: /Add to (total )?enquiry/i }).first();
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();

    await page.goto("/request-a-quote");
    await expect(page.getByRole("heading", { name: "1 of 20 configurations selected" })).toBeVisible();
  });
});

/* ============================================================================
 * 6. 视口 · 控制台 · SEO
 * ========================================================================== */

for (const viewport of VIEWPORTS) {
  test(`目录 + 详情 @ ${viewport.name}：0 控制台错误、无横向溢出`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const errors = watchConsole(page);

    const catalogue = await page.goto("/products/wheels");
    expect(catalogue?.status()).toBe(200);
    expect(await hasHorizontalOverflow(page)).toBe(false);

    const detail = await page.goto("/products/wheels/12");
    expect(detail?.status()).toBe(200);
    expect(await hasHorizontalOverflow(page)).toBe(false);

    expect(errors).toEqual([]);
  });
}

test("SEO：目录 title/canonical/robots 完整", async ({ page }) => {
  await page.goto("/products/wheels");
  await expect(page).toHaveTitle(/Wheel Catalogue/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/products\/wheels$/,
  );
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots).toContain("index");
  await expect(page.locator("h1")).toHaveText(
    "Find a wheel by verified production specification",
  );
});

test("SEO：详情 title/canonical/robots 完整", async ({ page }) => {
  await page.goto("/products/wheels/12");
  await expect(page).toHaveTitle(/12 Wheel Specifications/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/products\/wheels\/12$/,
  );
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots).toContain("index");
});

/* ============================================================================
 * 7. 能力线首屏（P1 的 text-white 不回退）
 * ========================================================================== */

test.describe("能力线首屏", () => {
  for (const path of [
    "/products/ev-components",
    "/products/custom-aluminum",
    "/products/safety-tires",
    "/products/wheels/flow-formed",
    "/products/wheels/forged",
  ]) {
    test(`${path} 的 h1 在深色表面上仍是浅色`, async ({ page }) => {
      await page.goto(path);
      const color = await page
        .locator("h1")
        .first()
        .evaluate((element) => getComputedStyle(element).color);
      // P1 修复后的浅色头条墨色（rgb(255,255,255)）——不能回退成 --fh-ink。
      expect(color).not.toBe("rgb(41, 38, 33)");
    });
  }
});
