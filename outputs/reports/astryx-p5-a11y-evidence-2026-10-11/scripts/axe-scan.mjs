/**
 * P5 a11y audit — axe-core scan over the 31 rendered templates.
 *
 * Uses REAL Chrome (Playwright `channel`-less executablePath override is not
 * enough) — we pass the "Google Chrome for Testing" full binary, not
 * chrome-headless-shell, because the shell cannot composite Tailwind colour
 * utilities (`oklab(...)`) and would produce false-healthy contrast values.
 *
 * Usage: node axe-scan.mjs --base http://127.0.0.1:3210 --out <dir>
 */
import { chromium } from "playwright-core";
import { AxeBuilder } from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=") || true];
  }),
);
const BASE = args.base ?? "http://127.0.0.1:3210";
const OUT = args.out ?? "./";
const CHROME =
  process.env.CHROME_BIN ??
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "1440x900", width: 1440, height: 900 },
];

// 31 rendered templates (P0 report 26 §四) — dynamic routes use real instances.
const TEMPLATES = [
  ["/", "CP 首页"],
  ["/about", "CP About"],
  ["/capabilities", "CP Capabilities"],
  ["/products", "CP 产品中心"],
  ["/contact", "CV 联系"],
  ["/custom-development", "CV 定制开发"],
  ["/dealers", "CR 经销商"],
  ["/dealers/private-label", "CR 自有品牌"],
  ["/fitment", "CR 适配边界"],
  ["/fitment/bmw-m", "CR 适配平台详情"],
  ["/gallery/finishes", "CR 表面处理图库"],
  ["/insights", "CR 洞察列表"],
  ["/insights/bolt-patterns", "CR 孔距指南"],
  ["/insights/bolt-patterns/5x120", "CR 孔距详情"],
  ["/products/wheels", "WH 轮毂目录"],
  ["/products/wheels/flow-formed", "WH 旋压入口"],
  ["/products/wheels/forged", "WH 锻造"],
  ["/products/ev-components", "OL EV 组件"],
  ["/products/custom-aluminum", "OL 定制铝件"],
  ["/products/safety-tires", "OL 安全轮胎"],
  ["/request-a-quote", "CV 询盘"],
  ["/thank-you", "CV 感谢"],
  ["/tools", "CR 工具"],
  ["/tools/offset-calculator", "CR 偏距计算器"],
  ["/support/privacy", "CR 隐私"],
  ["/support/returns", "CR 退货"],
  ["/support/shipping", "CR 运输"],
  ["/support/terms", "CR 条款"],
  ["/support/warranty", "CR 质保"],
];

const log = (...a) => console.log(...a);

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  // ---- discover the wheel detail + insights article slugs from the live site ----
  const probe = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const probePage = await probe.newPage();
  const discovered = [];
  try {
    await probePage.goto(`${BASE}/products/wheels`, { waitUntil: "load", timeout: 60_000 });
    const models = await probePage.$$eval("a[href^='/products/wheels/']", (as) =>
      [
        ...new Set(
          as
            .map((a) => a.getAttribute("href"))
            .filter((h) => h && h.split("/").length === 4 && !h.includes("?")),
        ),
      ],
    );
    if (models[0]) discovered.push([models[0], "WH 轮毂详情(实例)"]);
    log("[discover] wheel model:", models.slice(0, 5).join(", "));

    await probePage.goto(`${BASE}/insights`, { waitUntil: "load", timeout: 60_000 });
    const articles = await probePage.$$eval("a[href^='/insights/']", (as) =>
      [
        ...new Set(
          as
            .map((a) => a.getAttribute("href"))
            .filter(
              (h) =>
                h &&
                h.split("/").length === 3 &&
                !h.includes("?") &&
                h !== "/insights/bolt-patterns",
            ),
        ),
      ],
    );
    if (articles[0]) discovered.push([articles[0], "CR 洞察文章(实例)"]);
    log("[discover] insights article:", articles.slice(0, 5).join(", "));
  } catch (e) {
    log("[discover] FAILED:", e.message);
  }
  await probe.close();

  const all = [...TEMPLATES.slice(0, 12), ...discovered, ...TEMPLATES.slice(12)];
  log(`[plan] ${all.length} routes x ${VIEWPORTS.length} viewports`);

  const results = [];
  for (const [route, label] of all) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await ctx.newPage();
      const record = { route, label, viewport: vp.name, ok: false, error: null, violations: [], passes: 0, incomplete: [] };
      try {
        const resp = await page.goto(`${BASE}${route}`, {
          waitUntil: "load",
          timeout: 90_000,
        });
        record.status = resp?.status() ?? null;
        // warm-up: settle hydration + fonts, then scan whole document
        await page.waitForTimeout(700);
        await page.evaluate(async () => {
          const h = document.documentElement.scrollHeight;
          for (let y = 0; y < h; y += window.innerHeight) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(900);

        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
          .analyze();

        record.ok = true;
        record.passes = axe.passes.length;
        record.violations = axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          tags: v.tags,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            html: n.html.slice(0, 260),
            summary: (n.failureSummary ?? "").split("\n").slice(0, 4).join(" | "),
            impact: n.impact,
          })),
        }));
        record.incomplete = axe.incomplete.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: (n.failureSummary ?? "").split("\n")[0] })),
        }));
      } catch (e) {
        record.error = e.message.split("\n")[0];
      }
      await ctx.close();
      results.push(record);
      const n = record.violations.reduce((s, v) => s + v.nodes.length, 0);
      log(
        `${record.ok ? "ok " : "ERR"} ${route.padEnd(38)} ${vp.name.padEnd(9)} status=${record.status} rules=${record.violations.length} nodes=${n}${record.error ? " :: " + record.error : ""}`,
      );
    }
  }

  await browser.close();
  const payload = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    chrome: CHROME,
    axeVersion: JSON.parse(
      fs.readFileSync(
        path.resolve("node_modules/axe-core/package.json"),
        "utf8",
      ),
    ).version,
    viewports: VIEWPORTS,
    results,
  };
  fs.writeFileSync(path.join(OUT, "axe-results.json"), JSON.stringify(payload, null, 1));
  log(`\n[written] ${path.join(OUT, "axe-results.json")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
