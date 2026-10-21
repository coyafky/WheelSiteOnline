/**
 * P5 a11y — contrast confirmation on the EXACT nodes axe flagged.
 *
 * The previous pass used `querySelector`, which matched the first instance of
 * the class on the page — usually a light-surface copy — and therefore printed
 * healthy ratios for elements axe had called out on dark surfaces. This pass
 * re-derives the flagged node set from the axe output itself (same selector
 * arrays axe reported) and measures each one in real Chrome.
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
const AXE = args.axe ?? "./axe-results.json";
const CHROME = process.env.CHROME_BIN ?? `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const log = (...a) => console.log(...a);

/** Measure every element matching `selector` on the current page. */
const MEASURE_ALL_SRC = `(selector) => {
  const parse = (c) => {
    if (!c) return null;
    const m = c.match(/^rgba?\\(([^)]+)\\)$/);
    if (!m) return null;
    const p = m[1].split(/[,\\/]+/).map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => (!fg || fg.a >= 1) ? (fg ? { r: fg.r, g: fg.g, b: fg.b, a: 1 } : bg)
    : { r: fg.r*fg.a + bg.r*(1-fg.a), g: fg.g*fg.a + bg.g*(1-fg.a), b: fg.b*fg.a + bg.b*(1-fg.a), a: 1 };
  const lum = (c) => { const f = (v) => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b); };
  const ratio = (a,b) => { const l1=lum(a), l2=lum(b), hi=Math.max(l1,l2), lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const toHex = (c) => '#' + [c.r,c.g,c.b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');

  let nodes = [];
  try { nodes = [...document.querySelectorAll(selector)]; } catch (e) { return [{ error: 'bad selector: ' + selector }]; }
  return nodes.map((el) => {
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    const layers = [];
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) { layers.push(n.tagName.toLowerCase() + '.' + ((n.className && typeof n.className === 'string' ? n.className : '').split(' ').slice(0,2).join('.')) + '=' + s.backgroundColor); bg = over(c, bg); }
      for (const which of ['::before','::after']) {
        const ps = getComputedStyle(n, which);
        if (!ps.content || ps.content === 'none') continue;
        const pc = parse(ps.backgroundColor);
        if (pc && pc.a > 0) { layers.push(n.tagName.toLowerCase()+which + '=' + ps.backgroundColor); bg = over(pc, bg); }
      }
    }
    const px = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
    const large = px >= 24 || (px >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const r = ratio(fg, bg);
    const rect = el.getBoundingClientRect();
    return {
      index: nodes.indexOf(el),
      text: (el.textContent || '').replace(/\\s+/g,' ').trim().slice(0, 50),
      color: cs.color, colorHex: fg ? toHex(fg) : null, effectiveBg: toHex(bg),
      ratio: Math.round(r*100)/100, required: need, passes: r >= need,
      fontSizePx: px, fontWeight: weight, isLargeText: large,
      visible: rect.width > 0 && rect.height > 0,
      layers: layers.slice(0, 6),
    };
  });
}`;

async function main() {
  const axe = JSON.parse(fs.readFileSync(AXE, "utf8"));
  // Collect the exact (route, viewport, selector-array) tuples axe reported.
  const targets = [];
  for (const r of axe.results) {
    for (const v of r.violations || []) {
      if (v.id !== "color-contrast" && v.id !== "scrollable-region-focusable") continue;
      for (const n of v.nodes) {
        targets.push({
          rule: v.id,
          impact: v.impact,
          route: r.route,
          viewport: r.viewport,
          selector: Array.isArray(n.target) ? n.target.join(" >> ") : String(n.target),
          axeSummary: (n.summary || "").split("\n").filter((l) => l.trim()).slice(1, 3).join(" "),
          axeHtml: n.html.replace(/\s+/g, " ").slice(0, 160),
        });
      }
    }
  }
  log(`[plan] ${targets.length} flagged nodes across ${new Set(targets.map(t=>t.route+"@"+t.viewport)).size} combos`);

  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const out = { generatedAt: new Date().toISOString(), source: AXE, measurements: [] };

  const byPage = new Map();
  for (const t of targets) {
    const k = `${t.route}@${t.viewport}`;
    if (!byPage.has(k)) byPage.set(k, []);
    byPage.get(k).push(t);
  }

  for (const [key, list] of byPage) {
    const [route, viewport] = key.split("@");
    const [w, h] = viewport.split("x").map(Number);
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(1000);
    await page.evaluate(async () => {
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y < H; y += window.innerHeight) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(600);

    log(`\n=== ${key} (${list.length} flagged nodes) ===`);
    for (const t of list) {
      // axe targets look like ['.cls > .cls2'] or ['.\\!text-forge.eyebrow']; the
      // joined form is a valid CSS selector already.
      const sel = t.selector;
      let all = [];
      try {
        all = await page.evaluate(new Function("selector", `return (${MEASURE_ALL_SRC})(selector);`), sel);
      } catch (e) {
        all = [{ error: e.message.split("\n")[0] }];
      }
      // keep every measured match so a "0 matches" or a mixed result is visible
      const measured = all.filter((m) => !m.error);
      const failing = measured.filter((m) => !m.passes);
      out.measurements.push({ ...t, matchCount: measured.length, matches: measured, failingCount: failing.length, error: all[0]?.error });
      if (all[0]?.error) log(`  ERR ${sel} :: ${all[0].error}`);
      else {
        log(`  ${failing.length ? "CONFIRMED-FAIL" : "no-fail"} rule=${t.rule} matches=${measured.length} failing=${failing.length}  sel=${sel.slice(0, 70)}`);
        failing.slice(0, 4).forEach((m) =>
          log(`      ratio=${m.ratio} need=${m.required} fg=${m.colorHex} bg=${m.effectiveBg} ${m.fontSizePx}px/${m.fontWeight} "${m.text.slice(0, 40)}" layers=${JSON.stringify(m.layers.slice(0,3))}`),
        );
        if (!failing.length) measured.slice(0, 3).forEach((m) =>
          log(`      (healthy) ratio=${m.ratio} fg=${m.colorHex} bg=${m.effectiveBg} "${m.text.slice(0, 30)}"`),
        );
      }
    }
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "contrast-exact-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "contrast-exact-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
