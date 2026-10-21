import { expect, test } from "@playwright/test";

const locales = [
  {
    locale: "en",
    htmlLang: "en",
    heading: "Browse flow-formed wheels by recorded production specification",
    catalogueHeading: "Filter approved flow-formed wheel specifications",
    breadcrumb: "Flow-formed wheels",
    unavailable: "No approved flow-formed model is published on this page yet.",
    title: "Flow-Formed Wheels by Recorded Specification | Fenghuai",
    languageLabel: "Switch language",
  },
  {
    locale: "zh",
    htmlLang: "zh-CN",
    heading: "按已记录的生产规格浏览旋压轮毂",
    catalogueHeading: "筛选已批准的旋压轮毂规格",
    breadcrumb: "旋压轮毂",
    unavailable: "此页面目前没有已批准发布的旋压轮毂型号；上方的工艺说明仍然适用。",
    title: "按已记录规格浏览旋压轮毂 | Fenghuai",
    languageLabel: "切换语言",
  },
  {
    locale: "es",
    htmlLang: "es-ES",
    heading: "Consulte llantas conformadas por flujo según sus especificaciones registradas",
    catalogueHeading: "Filtre especificaciones aprobadas de llantas conformadas por flujo",
    breadcrumb: "Llantas conformadas por flujo",
    unavailable: "Todavía no hay ningún modelo de llanta conformada por flujo aprobado en esta página. La explicación del proceso sigue siendo válida.",
    title: "Llantas conformadas por flujo según especificaciones registradas | Fenghuai",
    languageLabel: "Cambiar idioma",
  },
  {
    locale: "th",
    htmlLang: "th-TH",
    heading: "เลือกล้อขึ้นรูปด้วยการรีดตามข้อมูลการผลิตที่บันทึกไว้",
    catalogueHeading: "กรองข้อมูลจำเพาะของล้อขึ้นรูปด้วยการรีดที่อนุมัติแล้ว",
    breadcrumb: "ล้อขึ้นรูปด้วยการรีด",
    unavailable: "ขณะนี้ยังไม่มีรุ่นล้อขึ้นรูปด้วยการรีดที่อนุมัติให้เผยแพร่ในหน้านี้ คำอธิบายกระบวนการด้านบนยังคงใช้ได้",
    title: "ล้อขึ้นรูปด้วยการรีดตามข้อมูลจำเพาะที่บันทึกไว้ | Fenghuai",
    languageLabel: "เปลี่ยนภาษา",
  },
] as const;

for (const scenario of locales) {
  test(`${scenario.locale} 旋压轮毂页呈现对应语言并遵守索引门槛`, async ({ page }) => {
    await page.goto(`/${scenario.locale === "en" ? "" : `${scenario.locale}/`}products/wheels/flow-formed`);

    await expect(page.locator("html")).toHaveAttribute("lang", scenario.htmlLang);
    await expect(page.getByRole("heading", { level: 1, name: scenario.heading })).toBeVisible();
    await expect(page.getByRole("heading", { name: scenario.catalogueHeading })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /breadcrumb|面包屑导航|ruta de navegación|แสดงเส้นทาง/i }))
      .toContainText(scenario.breadcrumb);
    await expect(page.getByRole("link", { name: /browse recorded models|浏览已记录型号|ver modelos registrados|ดูรุ่นที่บันทึกไว้/i }))
      .toBeVisible();
    await expect(page.getByRole("link", { name: /browse recorded models|浏览已记录型号|ver modelos registrados|ดูรุ่นที่บันทึกไว้/i }))
      .toHaveAttribute("href", "#flow-formed-models");
    const languageSelect = page.getByRole("combobox", { name: scenario.languageLabel });
    await expect(languageSelect).toHaveValue(scenario.locale);
    await expect(languageSelect.locator("option")).toHaveCount(4);
    await expect(page).toHaveTitle(scenario.title);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", scenario.title);

    const bodyText = await page.locator("body").innerText();
    const emptyState = page.getByText(scenario.unavailable, { exact: true });
    if (await emptyState.count()) await expect(emptyState).toBeVisible();
    for (const untranslated of [
      "Recorded diameters",
      "Recorded configurations",
      "Recorded process",
      "View specifications",
      "Clear the size and PCD filters",
      "Send the required specification",
    ]) {
      if (scenario.locale !== "en") expect(bodyText).not.toContain(untranslated);
    }

    if (scenario.locale !== "en") {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    } else {
      await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]'))
        .toHaveAttribute("href", /\/products\/wheels\/flow-formed$/);
    }

    if (scenario.locale !== "en") {
      await expect(page.locator(`a[href^="/${scenario.locale}/"]`).first()).toBeVisible();
    }
  });
}
