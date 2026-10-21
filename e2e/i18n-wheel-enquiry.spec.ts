import { expect, test } from "@playwright/test";

test("中文轮毂详情的直接询盘入口与弹窗不回落英文", async ({ page }) => {
  await page.goto("/zh/products/wheels/dx424");

  const open = page.getByRole("button", { name: "询问此轮毂型号" });
  await expect(open).toBeVisible();
  await open.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("询问此轮毂型号", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Project enquiry is not open yet")).toHaveCount(0);
});

for (const scenario of [
  {
    locale: "zh",
    heading: "已记录的生产配置",
    fitment: "量产前确认应用场景",
    cta: "询问此轮毂型号",
    breadcrumb: "产品",
  },
  {
    locale: "es",
    heading: "Configuraciones de producción registradas",
    fitment: "Confirme la aplicación antes de producir",
    cta: "Consultar este modelo de llanta",
    breadcrumb: "Productos",
  },
  {
    locale: "th",
    heading: "รูปแบบการผลิตที่บันทึกไว้",
    fitment: "ยืนยันการใช้งานก่อนการผลิต",
    cta: "สอบถามเกี่ยวกับล้อรุ่นนี้",
    breadcrumb: "ผลิตภัณฑ์",
  },
] as const) {
  test(`${scenario.locale} 轮毂详情正文、导航和询盘入口均采用当前语言`, async ({ page }) => {
    await page.goto(`/${scenario.locale}/products/wheels/dx424`);
    await expect(page.getByRole("heading", { name: scenario.heading })).toBeVisible();
    await expect(page.getByRole("heading", { name: scenario.fitment })).toBeVisible();
    await expect(page.getByRole("button", { name: scenario.cta })).toBeVisible();
    await expect(page.getByRole("link", { name: scenario.breadcrumb, exact: true })).toHaveAttribute("href", `/${scenario.locale}/products`);
  });
}
