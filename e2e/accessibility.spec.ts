import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const representativePages = [
  "/",
  "/request-a-quote",
  "/insights",
  "/insights/how-to-measure-fitment",
  "/products/ev-components",
  "/support/privacy",
  "/tools/offset-calculator",
];

for (const path of representativePages) {
  test(`${path} 通过 WCAG A/AA 基础扫描`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    }));
    expect(summary).toEqual([]);
  });
}

async function tabUntil(page: Page, selector: string, limit = 40) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press("Tab");
    if (await page.locator(selector).evaluate((node) => node === document.activeElement)) return;
  }
  throw new Error(`键盘 Tab ${limit} 次后仍未聚焦 ${selector}`);
}

test("键盘可到达询盘主操作且焦点可见", async ({ page }) => {
  await page.goto("/request-a-quote");
  const continueButton = page.getByRole("button", { name: "Continue" });
  const selector = await continueButton.evaluate((node) => {
    node.setAttribute("data-e2e-focus-target", "true");
    return '[data-e2e-focus-target="true"]';
  });
  await tabUntil(page, selector);
  await expect(continueButton).toBeFocused();
  const focusStyle = await continueButton.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outlineStyle, shadow: style.boxShadow };
  });
  expect(focusStyle.outline !== "none" || focusStyle.shadow !== "none").toBeTruthy();
});

test("第一步错误会聚焦首个单选项", async ({ page }) => {
  await page.goto("/request-a-quote");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Business")).toBeFocused();
});

test("等效 200% 缩放下没有页面级横向溢出", async ({ page }) => {
  // 1280px 桌面视口在 200% 浏览器缩放下等效为 640 CSS px。
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/request-a-quote");
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("等效 200% 缩放下偏距计算器没有页面级横向溢出", async ({ page }) => {
  // 1280px 桌面视口在 200% 浏览器缩放下等效为 640 CSS px。
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/tools/offset-calculator#calculator");
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("轮毂筛选器在 GET 状态下通过 WCAG A/AA 基础扫描", async ({ page }) => {
  await page.goto("/products/wheels?diameter=18&pcd=5x112");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("轮毂筛选器型号搜索可键盘聚焦且保留可见焦点", async ({ page }) => {
  await page.goto("/products/wheels?diameter=18&pcd=5x112");
  const search = page.locator('aside input[type="search"][name="q"]');
  await search.focus();
  await expect(search).toBeFocused();
  const focusStyle = await search.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outlineStyle, border: style.borderBottomColor };
  });
  expect(focusStyle.outline !== "none" || focusStyle.border !== "rgba(0, 0, 0, 0)").toBeTruthy();
});

test("等效 200% 缩放下轮毂筛选器没有横向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/products/wheels?diameter=18&pcd=5x112");
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("页脚询盘入口可用且没有全站悬浮入口", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-floating-quote]")).toHaveCount(0);
  await expect(page.locator('footer a[href="/request-a-quote"]').first()).toBeVisible();
});

test("移动端菜单保留询盘入口且无悬浮遮挡", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await expect(page.locator("[data-floating-quote]")).toHaveCount(0);
  await page.getByRole("button", { name: /open navigation/i }).click();
  await expect(page.locator('#mobile-nav a[href="/request-a-quote"]')).toBeVisible();
});

test("首页首图失败时仍保留首屏标题和行动入口", async ({ page }) => {
  await page.goto("/");
  const heroImage = page.locator('[data-hero-media] img').first();
  await expect(heroImage).toBeVisible();
  await heroImage.evaluate((node) => node.dispatchEvent(new Event("error")));

  await expect(page.locator("[data-hero-media-fallback]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Request a project review" }).first(),
  ).toBeVisible();
});

test("首页主行动恢复品牌展示字体与大写字形", async ({ page }) => {
  await page.goto("/");
  const cta = page.locator("#top .btn-pill-solid").first();
  const style = await cta.evaluate((node) => {
    const computed = getComputedStyle(node);
    return { fontFamily: computed.fontFamily, textTransform: computed.textTransform };
  });
  expect(style.fontFamily.toLowerCase()).toContain("barlow");
  expect(style.textTransform).toBe("uppercase");
});
