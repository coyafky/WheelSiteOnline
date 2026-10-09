import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const representativePages = [
  "/",
  "/request-a-quote",
  "/insights",
  "/products/ev-components",
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

test("进入页脚后悬浮询盘按钮不会遮挡页脚导航", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-floating-quote]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});
