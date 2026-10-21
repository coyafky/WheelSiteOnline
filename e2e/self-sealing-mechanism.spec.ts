import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
]) {
  test(`T03 机制图在 ${viewport.width}px 显示三张新图`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/products/safety-tires");

    const images = page.locator("#self-sealing-mechanism img");
    await expect(images).toHaveCount(3);
    await expect(images.nth(0)).toHaveAttribute("src", /mechanism-entry/);
    await expect(images.nth(1)).toHaveAttribute("src", /mechanism-surround/);
    await expect(images.nth(2)).toHaveAttribute("src", /mechanism-close/);
    await expect(images.nth(0)).toHaveAttribute("alt", /object entering/i);
    await expect(images.nth(1)).toHaveAttribute("alt", /surrounding/i);
    await expect(images.nth(2)).toHaveAttribute("alt", /closing/i);

    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate((node) =>
              node instanceof HTMLImageElement ? node.naturalWidth : 0,
            ),
          { timeout: 5_000 },
        )
        .toBeGreaterThan(0);
    }

    const articleRightEdges = await page
      .locator("#self-sealing-mechanism article")
      .evaluateAll((nodes) => nodes.map((node) => Math.ceil(node.getBoundingClientRect().right)));
    for (const rightEdge of articleRightEdges) {
      expect(rightEdge).toBeLessThanOrEqual(viewport.width);
    }

    await page.locator("#self-sealing-mechanism").screenshot({
      path: `outputs/reports/self-sealing-mechanism-asset-replacement-2026-10-16/t03-${viewport.width}.png`,
    });
  });
}
