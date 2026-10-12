import { expect, test } from "@playwright/test";

test("移动端筛选入口明确且在选项末尾仍有提交按钮", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/wheels");

  const filter = page.locator("details[data-catalogue-mobile-filter]");
  const trigger = filter.locator(":scope > summary");
  await expect(trigger).toBeVisible();
  await expect(trigger).toContainText("Filter wheels");

  await trigger.click();
  await expect(filter).toHaveAttribute("open", "");

  const widthMore = filter
    .getByRole("group", { name: "Width" })
    .locator("details > summary");
  await expect(widthMore).toContainText("Show 4 more");

  const bottomApply = filter.locator('[data-mobile-filter-apply="bottom"]');
  await bottomApply.scrollIntoViewIfNeeded();
  await expect(bottomApply).toBeVisible();
  await expect(bottomApply).toHaveText("Apply filters");
});

test("移动端目录筛选入口不受全站悬浮询盘遮挡", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/wheels");

  await expect(page.locator('[data-catalogue-mobile-filter]')).toBeInViewport();
  await expect(page.locator("[data-floating-quote]")).toHaveCount(0);
});

test("移动端组合筛选可提交、刷新恢复并逐项移除", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/wheels");

  const filter = page.locator("details[data-catalogue-mobile-filter]");
  await filter.locator(":scope > summary").click();
  const form = filter.getByRole("form", { name: "Filter the wheel catalogue" });

  await form.locator('label[for="mobile-pcd-5x112"]').click();
  await form.locator('label[for="mobile-diameter-18"]').click();
  await expect(form.locator('#mobile-pcd-5x112')).toBeChecked();
  await expect(form.locator('#mobile-diameter-18')).toBeChecked();
  await form.locator('[data-mobile-filter-apply="bottom"]').click();

  await expect.poll(() => {
    const params = new URL(page.url()).searchParams;
    return [params.get("pcd"), params.get("diameter")];
  }).toEqual(["5x112", "18"]);
  await expect(filter.locator(":scope > summary")).toContainText("2 applied");

  const results = page.getByRole("region", { name: "Wheel catalogue results" });
  const summary = results.locator("p:visible").filter({
    hasText: /models? match the selected production specifications/,
  });
  await expect(summary).toHaveCount(1);
  const total = Number((await summary.textContent())?.match(/^\d+/)?.[0] ?? "0");
  expect(total).toBeGreaterThan(0);
  await expect(results.locator("article")).toHaveCount(Math.min(total, 24));

  await page.reload();
  await expect(page.locator('#mobile-pcd-5x112')).toBeChecked();
  await expect(page.locator('#mobile-diameter-18')).toBeChecked();

  await page.getByRole("link", { name: /PCD 5×112/ }).click();
  await expect.poll(() => {
    const params = new URL(page.url()).searchParams;
    return [params.get("pcd"), params.get("diameter")];
  }).toEqual([null, "18"]);
  await expect(page.locator('#mobile-diameter-18')).toBeChecked();
});

test("桌面型号搜索、排序、分页和清空都保留正确 URL 状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/wheels");

  const filters = page.locator('aside form[aria-label="Filter the wheel catalogue"]');
  await expect(filters).toBeVisible();
  await expect(filters.getByRole("button", { name: "Apply filters" })).toBeVisible();
  await filters.getByRole("searchbox", { name: "Model search" }).fill("DM902");
  await filters.getByRole("button", { name: "Apply filters" }).click();

  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("DM902");
  const results = page.getByRole("region", { name: "Wheel catalogue results" });
  await expect(results.locator("article")).toHaveCount(1);
  await expect(results.getByRole("link", { name: "DM902 — view specifications" })).toBeVisible();

  const sort = page.getByRole("form", { name: "Sort the wheel catalogue" });
  await sort.getByRole("combobox", { name: "Sort" }).selectOption("variants-desc");
  await sort.getByRole("button", { name: "Apply" }).click();
  await expect.poll(() => {
    const params = new URL(page.url()).searchParams;
    return [params.get("q"), params.get("sort")];
  }).toEqual(["DM902", "variants-desc"]);

  await filters.getByRole("link", { name: "Clear filters" }).click();
  await expect.poll(() => new URL(page.url()).search).toBe("");

  await page.goto("/products/wheels?pcd=5x114.3");
  const next = page.getByRole("navigation", { name: "Catalogue pagination" })
    .getByRole("link", { name: "Next" });
  await expect(next).toHaveAttribute("href", /pcd=5x114\.3.*page=2/);
  await next.click();
  await expect.poll(() => {
    const params = new URL(page.url()).searchParams;
    return [params.get("pcd"), params.get("page")];
  }).toEqual(["5x114.3", "2"]);
  await expect(results.locator("article")).toHaveCount(24);
});
