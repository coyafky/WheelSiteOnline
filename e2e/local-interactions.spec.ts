import { expect, test } from "@playwright/test";

test("桌面导航点击后展开产品子菜单", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/wheels");

  const products = page.getByRole("button", { name: "Products" });
  await products.click();

  await expect(products).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("[data-nav-submenu]").first()).toBeVisible();
});

test("关键客户端交互完成水合", async ({ page }) => {
  await page.goto("/products/wheels/DM902?variant=DM902177501W");

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("motion-ready")),
    )
    .toBe(true);

  await page.getByRole("button", { name: "Request this configuration" }).click();
  await expect(
    page.getByRole("dialog", { name: "Request this configuration" }),
  ).toBeVisible();
});
