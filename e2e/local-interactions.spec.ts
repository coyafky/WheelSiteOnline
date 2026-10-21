import { expect, test } from "@playwright/test";

test("桌面导航父级文字可导航且 Chevron 独立展开产品子菜单", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const products = page.getByRole("link", { name: "Products", exact: true }).first();
  await expect(products).toHaveAttribute("href", "/products");
  await products.click();
  await expect(page).toHaveURL(/[/]products$/);

  await page.goto("/");
  const submenuToggle = page.getByRole("button", {
    name: "Toggle submenu for Products",
  });

  await submenuToggle.click();
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#submenu-Products")).toHaveClass(/pointer-events-auto/);
  await expect(page.locator("#submenu-Products a").first()).toBeVisible();
});

test("桌面导航 hover 展开下拉且键盘 Escape 收起并恢复焦点", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const submenuToggle = page.getByRole("button", {
    name: "Toggle submenu for Products",
  });

  await submenuToggle.hover();
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#submenu-Products")).toHaveCSS("opacity", "1");

  await submenuToggle.focus();
  await page.keyboard.press("Enter");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Enter");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Space");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(submenuToggle).toHaveAttribute("aria-expanded", "false");
  await expect(submenuToggle).toBeFocused();
});

test("移动端父级文字导航、Chevron 子菜单和子链接跳转均可用", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.click();
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  const mobileProducts = page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Products", exact: true });
  await expect(mobileProducts).toHaveAttribute("href", "/products");
  await mobileProducts.click();
  await expect(page).toHaveURL(/[/]products$/);

  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileSubmenuToggle = page.getByRole("button", {
    name: "Toggle submenu for Products",
  });
  await mobileSubmenuToggle.click();
  await expect(mobileSubmenuToggle).toHaveAttribute("aria-expanded", "true");

  const wheels = page.locator("#mobile-nav").getByRole("link", {
    name: "Wheels",
    exact: true,
  });
  await expect(wheels).toBeVisible();
  await wheels.click();
  await expect(page).toHaveURL(/[/]products[/]wheels$/);
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
