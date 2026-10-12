import { expect, test } from "@playwright/test";

test("偏距计算器使用六个 Astryx NumberInput 并保留负偏距和小数计算", async ({ page }) => {
  await page.goto("/tools/offset-calculator");

  const inputs = page.locator(".astryx-number-input");
  await expect(inputs).toHaveCount(6);

  const replacementWidth = page.getByRole("spinbutton", { name: "Replacement wheel width" });
  const replacementOffset = page.getByRole("spinbutton", { name: "Replacement wheel offset" });
  await replacementWidth.fill("9.5");
  await replacementWidth.press("Enter");
  await replacementOffset.fill("-10");
  await replacementOffset.press("Enter");

  await expect(page.getByText("−26 mm", { exact: true })).toBeVisible();
  await expect(page.getByText("+64 mm", { exact: true })).toBeVisible();
});

test("偏距计算器在 390px 下可聚焦、可清空且没有横向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/offset-calculator#calculator");

  const replacementWidth = page.getByRole("spinbutton", {
    name: "Replacement wheel width",
  });
  await replacementWidth.focus();
  await expect(replacementWidth).toBeFocused();
  await replacementWidth.fill("");
  await replacementWidth.press("Enter");

  await expect(
    page.getByText("Enter a width greater than zero for both wheels to see a result."),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("Insights 分类筛选保持按钮状态、结果范围和完整文章入口", async ({ page }) => {
  await page.goto("/insights");

  const filter = page.getByRole("group", { name: "Filter guides by category" });
  const categoryButton = filter.getByRole("button").nth(1);
  const category = (await categoryButton.textContent())?.trim();
  expect(category).toBeTruthy();

  await categoryButton.click();
  await expect(categoryButton).toHaveAttribute("aria-pressed", "true");
  await expect(filter.getByRole("button", { name: "All guides" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  const visibleCards = page.locator('ul[aria-live="polite"] > li:not([aria-hidden="true"])');
  await expect(visibleCards.first()).toBeVisible();
  await expect(visibleCards.first().getByRole("link")).toHaveAttribute("href", /\/insights\//);
  await expect(visibleCards.first()).toContainText(category!);
});

test("长文 Outline 支持键盘导航、hash 落点与滚动激活", async ({ page }) => {
  await page.goto("/support/privacy");

  const outline = page.getByRole("navigation", { name: "Page sections" });
  const links = outline.getByRole("link");
  await expect(outline).toHaveClass(/astryx-outline/);
  await expect(links.first()).toHaveAttribute("aria-current", "location");

  await links.first().focus();
  await page.keyboard.press("End");
  await expect(links.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(links.nth(1)).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#section-2$/);
  await expect(outline.locator('a[href="#section-2"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  const landing = await page.locator("#section-2").evaluate((target) => ({
    targetTop: target.getBoundingClientRect().top,
    headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
  }));
  expect(landing.targetTop).toBeGreaterThanOrEqual(landing.headerBottom);
  expect(landing.targetTop).toBeLessThanOrEqual(130);

  await page.locator("#section-3").evaluate((target) =>
    target.scrollIntoView({ block: "start" }),
  );
  await expect(outline.locator('a[href="#section-3"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("长文 Outline 在 390px 和等效 200% 视口没有横向溢出", async ({ page }) => {
  for (const width of [390, 640]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/insights/how-to-measure-fitment");
    await expect(page.locator(".astryx-outline")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }
});
