/**
 * P5 a11y — single-route axe re-scan (used to close the /fitment/bmw-m @320 gap
 * after the one-off 500 seen during the sweep).
 * Usage: node axe-one.mjs --base=... --route=/fitment/bmw-m --vp=320x568 --out=./one.json
 */
import { chromium } from "playwright-core";
import { AxeBuilder } from "@axe-core/playwright";
import fs from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=") || true];
  }),
);
const BASE = args.base ?? "http://127.0.0.1:3210";
const ROUTE = args.route;
const [w, h] = (args.vp ?? "320x568").split("x").map(Number);
const OUT = args.out ?? "./one.json";
const CHROME =
  process.env.CHROME_BIN ??
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
const ctx = await browser.newContext({ viewport: { width: w, height: h } });
const page = await ctx.newPage();
const rec = { route: ROUTE, viewport: `${w}x${h}`, attempts: [] };
for (let i = 0; i < 3; i++) {
  const r = await page.goto(`${BASE}${ROUTE}`, { waitUntil: "load", timeout: 90_000 });
  const st = r?.status();
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  rec.attempts.push({
    status: st,
    passes: axe.passes.length,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => ({ target: n.target, html: n.html.slice(0, 200) })),
    })),
  });
  console.log(`attempt ${i + 1}: status=${st} rules=${axe.violations.length} nodes=${axe.violations.reduce((s, v) => s + v.nodes.length, 0)} passes=${axe.passes.length}`);
  if (st === 500) break;
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(rec, null, 1));
console.log("[written]", OUT);
