/**
 * P5 a11y — independent confirmation of the axe `color-contrast` findings.
 *
 * axe already reports the numbers; this measures them a second time in real
 * Chrome by walking up the DOM from each flagged element and compositing every
 * ancestor background (including ::before/::after grid overlays) into one
 * effective backdrop, then applying the WCAG 2.x relative-luminance formula.
 *
 * Why a second measurement: P1 found that Playwright's chrome-headless-shell
 * returns raw `oklab(...)` for Tailwind colour utilities, which silently
 * poisons any contrast maths. Real Chrome is the only trustworthy source, and
 * a second independent number is what turns "axe says 2.45" into evidence.
 */
import { chromium } from "playwright-core";
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
const CHROME = process.env.CHROME_BIN ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const log = (...a) => console.log(...a);

const MEASURE_SRC = `(selector) => {
  const el = document.querySelector(selector);
  if (!el) return { error: 'not found: ' + selector };

  const parse = (c) => {
    if (!c) return null;
    const m = c.match(/^rgba?\\(([^)]+)\\)$/);
    if (!m) return null;
    const p = m[1].split(/[,\\/]+/).map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => {
    if (!fg) return bg;
    if (fg.a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
    return {
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const hi = Math.max(l1,l2), lo = Math.min(l1,l2); return (hi + 0.05) / (lo + 0.05); };

  const cs = getComputedStyle(el);
  const fg = parse(cs.color);
  const layers = [];
  let bg = { r: 255, g: 255, b: 255, a: 1 };
  for (let n = el; n; n = n.parentElement) {
    const s = getComputedStyle(n);
    const c = parse(s.backgroundColor);
    if (c && c.a > 0) { layers.push({ node: n.tagName.toLowerCase() + (n.id ? '#'+n.id : '') + '.' + ((n.className && typeof n.className === 'string' ? n.className : '').split(' ').slice(0,2).join('.')), color: s.backgroundColor }); bg = over(c, bg); }
    for (const which of ['::before','::after']) {
      const ps = getComputedStyle(n, which);
      if (ps.content === 'none' || !ps.content) continue;
      const pc = parse(ps.backgroundColor);
      if (pc && pc.a > 0) { layers.push({ node: n.tagName.toLowerCase() + which, color: ps.backgroundColor }); bg = over(pc, bg); }
    }
  }
  const r = ratio(fg, bg);
  const px = parseFloat(cs.fontSize);
  const weight = parseInt(cs.fontWeight, 10) || 400;
  const large = px >= 24 || (px >= 18.66 && weight >= 700);
  const need = large ? 3 : 4.5;
  const toHex = (c) => '#' + [c.r,c.g,c.b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
  return {
    selector,
    text: (el.textContent || '').replace(/\\s+/g,' ').trim().slice(0, 50),
    color: cs.color, colorHex: fg ? toHex(fg) : null,
    effectiveBg: toHex(bg),
    ratio: Math.round(r * 100) / 100,
    fontSizePx: px, fontWeight: weight, isLargeText: large,
    required: need,
    passes: r >= need,
    layers,
    tag: el.tagName.toLowerCase(),
  };
}`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const out = { generatedAt: new Date().toISOString(), method: "real Chrome, DOM-walk bg compositing incl. pseudo-elements", findings: [] };

  const TARGETS = [
    { route: "/contact", selector: ".rounded-xl.p-7.bg-ink > p.eyebrow", note: "axe: 'Before you send' eyebrow on bg-ink panel" },
    { route: "/insights", selector: "p.eyebrow", note: "axe: 'Insights' eyebrow on bg-hero" },
    { route: "/products/wheels/flow-formed", selector: "p.text-forge", note: "axe: text-forge on dark surface" },
    { route: "/products/wheels/flow-formed", selector: "a.text-forge", note: "axe: CTA link text-forge on dark" },
    { route: "/products/wheels/flow-formed", selector: "p.font-mono.text-forge", note: "axe: step number text-forge on dark" },
    { route: "/products/wheels/flow-formed", selector: "span.font-mono.text-forge", note: "axe: WFF code text-forge on dark" },
  ];

  for (const t of TARGETS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${t.route}`, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y < H; y += window.innerHeight) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(600);
    const res = await page.evaluate(
      new Function("selector", `return (${MEASURE_SRC})(selector);`),
      t.selector,
    );
    out.findings.push({ ...t, ...res, viewport: "1440x900" });
    if (res.error) log(`ERR ${t.route} ${t.selector} :: ${res.error}`);
    else log(
      `${res.passes ? "PASS" : "FAIL"} ${t.route.padEnd(34)} ratio=${String(res.ratio).padStart(6)} need=${res.required} fg=${res.colorHex} bg=${res.effectiveBg} size=${res.fontSizePx}px/${res.fontWeight} "${res.text}"`,
    );
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "contrast-cdp-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "contrast-cdp-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
