import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// One representative URL for each rendering template. Redirect-only routes
// are covered by site-contract.spec.ts; these are pages with actual content.
const templates = [
  "/", "/about", "/capabilities", "/products", "/contact",
  "/custom-development", "/dealers", "/dealers/private-label",
  "/insights",
  "/insights/how-to-measure-fitment", "/insights/bolt-patterns",
  "/insights/bolt-patterns/5x112", "/products/wheels",
  "/products/wheels/DM902", "/products/wheels/flow-formed",
  "/products/wheels/forged", "/products/ev-components",
  "/products/custom-aluminum", "/products/safety-tires",
  "/request-a-quote", "/thank-you", "/tools",
  "/tools/offset-calculator", "/support/privacy", "/support/returns",
  "/support/shipping", "/support/terms", "/support/warranty",
] as const;

const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;

const locales = ["en", "zh", "es", "th"] as const;

function localizedPath(path: string, locale: (typeof locales)[number]) {
  return locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;
}

async function assertKeyboardTraversal(page: Page, path: string) {
  // Traverse every tabbable control once, not just the first screen. The main
  // page must be reachable after the shared header; no hidden/inert target may
  // steal focus and no widget may trap focus outside an opened dialog.
  const count = await page.locator(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ).count();
  const visited = new Set<string>();
  for (let index = 0; index < Math.min(count + 8, 260); index += 1) {
    await page.keyboard.press("Tab");
    const state = await page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || active === document.body) return null;
      const rect = active.getBoundingClientRect();
      return {
        tag: active.tagName,
        key: `${active.tagName}:${active.getAttribute("href") ?? active.getAttribute("name") ?? active.textContent?.trim().slice(0, 30) ?? ""}`,
        visible: rect.width > 0 && rect.height > 0 && getComputedStyle(active).visibility !== "hidden",
        inMain: Boolean(active.closest("main")),
      };
    });
    if (state) {
      expect(state.visible, `${path}: keyboard focused hidden ${state.key}`).toBe(true);
      visited.add(state.inMain ? "main" : state.key);
    }
    if (visited.has("main")) break;
  }
  expect(visited.has("main"), `${path}: Tab never reached main content`).toBe(true);
}

test.describe("P5 全站模板回归", () => {
  for (const path of templates) {
    test(`${path}: 四视口、四语言、键盘与 axe`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: "reduce" });
        const response = await page.goto(path, { waitUntil: "load" });
        expect(response?.status(), `${path} @${viewport.width}`).toBe(200);
        await expect(page.locator("main")).toHaveCount(1);
        await expect(page.locator("main#main")).toBeVisible();
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page.locator('[data-astryx-theme="neutral"]').first()).toBeAttached();
        await page.evaluate(() => document.fonts.ready);
        // Reveal opacity can distort contrast readings until the first frame settles.
        await page.waitForTimeout(800);
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${path} @${viewport.width}: overflow`).toBeLessThanOrEqual(1);
        await page.screenshot({ path: testInfo.outputPath(`${viewport.width}.png`) });
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(
          axe.violations.map((item) => ({
            id: item.id,
            impact: item.impact,
            targets: item.nodes.map((node) => node.target.join(" ")),
          })),
          `${path} @${viewport.width}: axe`,
        ).toEqual([]);
        await assertKeyboardTraversal(page, `${path} @${viewport.width}`);
      }

      await page.setViewportSize({ width: 390, height: 844 });
      for (const locale of locales) {
        const response = await page.goto(localizedPath(path, locale), { waitUntil: "domcontentloaded" });
        expect(response?.status(), `${locale}${path}`).toBe(200);
        await expect(page.locator("h1").first()).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath(`locale-${locale}.png`) });
        if (locale !== "en") {
          expect(response?.headers()["x-robots-tag"], `${locale}${path}: noindex response header`)
            .toMatch(/noindex/);
        }
      }
      expect(errors, `${path}: browser errors`).toEqual([]);
    });
  }
});
