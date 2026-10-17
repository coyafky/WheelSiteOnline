import { expect, test } from "@playwright/test";

const cases = [
  { locale: "zh", title: "按已核实的生产规格查找轮毂", filter: "按规格筛选", sort: "排序", sortForm: "轮毂目录排序" },
  { locale: "es", title: "Encuentre una rueda por especificaciones de producción verificadas", filter: "Filtrar por especificación", sort: "Ordenar", sortForm: "Ordenar el catálogo de ruedas" },
  { locale: "th", title: "ค้นหาล้อตามข้อมูลการผลิตที่ตรวจสอบแล้ว", filter: "กรองตามข้อมูลจำเพาะ", sort: "เรียงตาม", sortForm: "เรียงแค็ตตาล็อกล้อ" },
] as const;

for (const scenario of cases) {
  test(`${scenario.locale} 轮毂目录页面、筛选和排序文案本地化`, async ({ page }) => {
    await page.goto(`/${scenario.locale}/products/wheels`);

    await expect(page.getByRole("heading", { level: 1, name: scenario.title })).toBeVisible();
    await expect(page.locator("aside").getByText(scenario.filter, { exact: true })).toBeVisible();
    await expect(page.getByRole("form", { name: scenario.sortForm })).toBeVisible();
    await expect(page.getByRole("form", { name: scenario.sortForm }).getByLabel(scenario.sort)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    const bodyText = await page.locator("body").innerText();
    for (const untranslated of [
      "Filter by specification",
      "Clear filters",
      "Sort the wheel catalogue",
      "No published model matches all selected specifications",
      "Need a specification that is not listed?",
    ]) {
      expect(bodyText).not.toContain(untranslated);
    }
  });

  test(`${scenario.locale} 筛选提交保留语言 URL`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${scenario.locale}/products/wheels`);

    const panel = page.locator("details[data-catalogue-mobile-filter]");
    await panel.locator(":scope > summary").click();
    await panel.locator('label[for="mobile-pcd-5x112"]').click();
    await panel.locator('[data-mobile-filter-apply="bottom"]').click();

    await expect.poll(() => new URL(page.url()).pathname)
      .toBe(`/${scenario.locale}/products/wheels`);
    await expect.poll(() => new URL(page.url()).searchParams.get("pcd"))
      .toBe("5x112");
  });
}
