import { expect, test } from "@playwright/test";

async function assertNoVisibleDescendantOverflow(page: import("@playwright/test").Page, selector: string) {
  const overflow = await page.locator(selector).evaluateAll((roots) => {
    const viewport = document.documentElement.clientWidth;
    const elements = roots.flatMap((root) => [root, ...Array.from(root.querySelectorAll("*"))]);
    return elements
      .filter((element) => {
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > viewport + 1;
      })
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      }));
  });

  expect(overflow, `${selector} contains a visible element outside the viewport`).toEqual([]);
}

for (const width of [360, 390]) {
  test(`自密封轮胎 ${width}px 内部内容不被固定宽度裁切`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/products/safety-tires");

    await assertNoVisibleDescendantOverflow(page, "#t02 article, #t05 article");
  });

  test(`轮毂目录 ${width}px 每页 24 张且移动端两列`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/products/wheels");

    const cards = page.getByRole("region", { name: "Wheel catalogue results" }).locator("article");
    await expect(cards).toHaveCount(24);
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    const third = await cards.nth(2).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(third).not.toBeNull();
    expect(Math.abs((second?.y ?? 0) - (first?.y ?? 0))).toBeLessThanOrEqual(1);
    expect(second?.x ?? 0).toBeGreaterThan(first?.x ?? 0);
    expect(third?.y ?? 0).toBeGreaterThan(first?.y ?? 0);
    await assertNoVisibleDescendantOverflow(page, '[aria-label="Wheel catalogue results"]');
  });

  test(`旋压轮毂目录 ${width}px 复用 24 张/页两列布局`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/products/wheels/flow-formed");

    const cards = page.locator("#flow-formed-models article");
    await expect(cards).toHaveCount(24);
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    const third = await cards.nth(2).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(third).not.toBeNull();
    expect(Math.abs((second?.y ?? 0) - (first?.y ?? 0))).toBeLessThanOrEqual(1);
    expect(second?.x ?? 0).toBeGreaterThan(first?.x ?? 0);
    expect(third?.y ?? 0).toBeGreaterThan(first?.y ?? 0);
    await assertNoVisibleDescendantOverflow(page, "#flow-formed-models");
  });
}

test("筛选后的 facet 会展示剩余型号数并保留 0 项", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/wheels?diameter=17");

  const filter = page.locator("details[data-catalogue-mobile-filter]");
  await filter.locator(":scope > summary").click();

  const widthOption = filter.locator('label[for="mobile-width-8"]');
  const widthCount = widthOption.locator("span").last();
  await expect(widthCount).not.toHaveText("0");

  const zeroOption = filter.locator('label').filter({ hasText: /0$/ }).first();
  await expect(zeroOption).toHaveCount(1);
  await expect(zeroOption.locator("input")).toBeDisabled();
});
