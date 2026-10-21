/**
 * P5 a11y — does the wheel catalogue GET filter form still work with JS off?
 *
 * The contract under test (plan §六 "轮毂 … 无 JS 提交"): a visitor with
 * JavaScript disabled types/picks a filter and the form must submit as a plain
 * navigation whose query string the server honours.
 *
 * Two independent proofs:
 *   1. the desktop form (#1) submitted natively by invoking its own submit
 *      button — a real HTML form submission, no JS
 *   2. the resulting URL fetched again, confirming the server renders a
 *      filtered result set from the query string alone
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

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const out = { generatedAt: new Date().toISOString(), jsEnabled: false };

  // ── 1 · native submit of the visible desktop filter form ─────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/products/wheels`, { waitUntil: "load", timeout: 90_000 });

    const before = await page.evaluate(`(() => ({
      url: location.href,
      results: document.querySelectorAll('a[href^="/products/wheels/"]').length,
      forms: [...document.querySelectorAll('form')].map((f, i) => ({
        i, method: (f.getAttribute('method')||'get').toLowerCase(), action: f.getAttribute('action'),
        visible: f.offsetParent !== null,
        namedControls: [...f.querySelectorAll('input[name],select[name]')].length,
        q: f.querySelector('[name="q"]') ? { visible: f.querySelector('[name="q"]').offsetParent !== null, type: f.querySelector('[name="q"]').type } : null,
      })),
    }))()`);
    out.before = before;
    log("before:", JSON.stringify(before, null, 1));

    // Type into a VISIBLE q input (there is one in the on-screen form) and
    // submit by pressing Enter inside the field — no JS in the page.
    const plan = await page.evaluate(`(() => {
      for (const f of document.querySelectorAll('form')) {
        const q = f.querySelector('input[name="q"]');
        if (q && q.offsetParent !== null && q.getBoundingClientRect().height > 0) {
          q.setAttribute('data-p5-q','1');
          return { found: true, formAction: f.getAttribute('action'), method: f.getAttribute('method'), placeholder: q.getAttribute('placeholder') };
        }
      }
      // fall back to the sort form, which is visible and also a GET
      const s = document.querySelector('form select[name="sort"]');
      if (s && s.offsetParent !== null) { s.setAttribute('data-p5-sort','1'); return { found: true, via: 'sort', formAction: s.closest('form')?.getAttribute('action') }; }
      return { found: false };
    })()`);
    out.submitPlan = plan;
    log("submitPlan:", JSON.stringify(plan));

    let afterEnter = null;
    if (plan.found && plan.via !== "sort") {
      await page.fill('[data-p5-q="1"]', "dx");
      await Promise.all([
        page.waitForNavigation({ waitUntil: "load", timeout: 60_000 }).catch((e) => log("  nav timeout:", e.message.split("\n")[0])),
        page.press('[data-p5-q="1"]', "Enter"),
      ]);
      afterEnter = await page.evaluate(`(() => ({
        url: location.href,
        results: document.querySelectorAll('a[href^="/products/wheels/"]').length,
        qStillFilled: document.querySelector('input[name="q"]') ? document.querySelector('input[name="q"]').value : null,
        bodyLen: document.body.innerText.length,
      }))()`);
    }
    out.afterEnterSubmit = afterEnter;
    log("after Enter submit:", JSON.stringify(afterEnter));

    // Also submit via the on-screen "Apply filters" button, so both the
    // implicit (Enter) and explicit (button) paths are covered.
    let afterButton = null;
    await page.goto(`${BASE}/products/wheels`, { waitUntil: "load", timeout: 90_000 });
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('form button')].find(
        (x) => /Apply filters/i.test(x.textContent || "") && x.offsetParent !== null,
      );
      if (b) b.setAttribute("data-p5-apply", "1");
    });
    const hasApply = await page.$('[data-p5-apply="1"]');
    if (hasApply) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "load", timeout: 60_000 }).catch(() => null),
        page.click('[data-p5-apply="1"]'),
      ]);
      afterButton = await page.evaluate(`(() => ({ url: location.href, results: document.querySelectorAll('a[href^="/products/wheels/"]').length, hasForm: !!document.querySelector('form') }))()`);
    }
    out.afterButtonSubmit = afterButton;
    log("after Apply-filters button:", JSON.stringify(afterButton));

    // ── 2 · the same query string, fetched fresh, must render filtered ──
    const filtered = {};
    for (const q of ["/products/wheels?q=dx", "/products/wheels?sort=model-asc", "/products/wheels?pcd=5x120"]) {
      await page.goto(`${BASE}${q}`, { waitUntil: "load", timeout: 90_000 });
      filtered[q] = await page.evaluate(`(() => ({
        url: location.href,
        results: document.querySelectorAll('a[href^="/products/wheels/"]').length,
        checked: [...document.querySelectorAll('input:checked')].map(i => i.name + '=' + i.value).slice(0, 6),
        selectedSort: document.querySelector('select[name="sort"]') ? document.querySelector('select[name="sort"]').value : null,
        qValue: document.querySelector('input[name="q"]') ? document.querySelector('input[name="q"]').value : null,
        bodyLen: document.body.innerText.length,
      }))()`);
      log(`  ${q} → url=${filtered[q].url} results=${filtered[q].results} q=${filtered[q].qValue} sort=${filtered[q].selectedSort}`);
    }
    out.filtered = filtered;
    await ctx.close();
  }

  // ── 3 · locale redirect of an unlocalised path (observed mid-audit) ──
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    const hops = [];
    page.on("response", async (r) => {
      if (r.request().isNavigationRequest()) hops.push({ status: r.status(), url: r.url() });
    });
    await page.goto(`${BASE}/products/wheels`, { waitUntil: "load", timeout: 90_000 });
    out.localeHop = { finalUrl: page.url(), hops };
    log("\nlocale hop:", JSON.stringify(hops), "final:", page.url());
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "nojs-get-submit-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "nojs-get-submit-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
