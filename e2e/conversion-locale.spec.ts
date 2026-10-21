import { expect, test } from "@playwright/test";

const cases = [
  {
    locale: "zh", quote: "告诉我们您需要采购或开发什么", contact: "告诉我们您需要采购或开发什么",
    notice: "我们如何处理您的信息",
  },
  {
    locale: "es", quote: "Cuéntenos qué necesita adquirir o desarrollar", contact: "Cuéntenos qué necesita adquirir o desarrollar",
    notice: "Cómo tratamos sus datos",
  },
  {
    locale: "th", quote: "บอกเราว่าคุณต้องการจัดหาหรือพัฒนาอะไร", contact: "บอกเราว่าคุณต้องการจัดหาหรือพัฒนาอะไร",
    notice: "การจัดการข้อมูลของคุณ",
  },
] as const;

for (const item of cases) {
  test(`${item.locale} 询盘与联系页正文使用目标语言`, async ({ page }) => {
    await page.goto(`/${item.locale}/request-a-quote`);
    await expect(page.getByRole("heading", { level: 1, name: item.quote })).toBeVisible();
    await expect(page.locator('section[aria-labelledby="quote-notice-title"] p.eyebrow')).toHaveText(item.notice);

    await page.goto(`/${item.locale}/contact`);
    await expect(page.getByRole("heading", { level: 1, name: item.contact })).toBeVisible();
    await expect(page.getByRole("heading", { name: "From your message to a written quotation" })).toHaveCount(0);
  });
}

for (const locale of ["en", "zh", "es", "th"] as const) {
  for (const route of ["request-a-quote", "contact"] as const) {
    test(`${locale}/${route} 内容、媒体、SEO、交互、错误与索引门槛`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width: 320, height: 568 });
      const path = `/${locale === "en" ? "" : `${locale}/`}${route}`;
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      if (process.env.PLAYWRIGHT_LIVE_WP === "1") {
        await expect(page.locator("main form")).toHaveCount(0);
      } else {
        await expect(page.locator("main form")).toHaveCount(1);
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${route}$`));
      if (locale !== "en") {
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      }
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
      }));
      expect(state.overflow).toBe(false);
      expect(state.brokenImages).toBe(0);
      expect(errors).toEqual([]);
    });
  }
}

test("真实 WordPress 未批准隐私页不展示环境测试版本", async ({ page }) => {
  test.skip(process.env.PLAYWRIGHT_LIVE_WP !== "1", "仅用于本地真实 WordPress 只读验收");
  await page.goto("/support/privacy");
  await expect(page.getByText("待公司确认（表单保持关闭）")).toBeVisible();
});
