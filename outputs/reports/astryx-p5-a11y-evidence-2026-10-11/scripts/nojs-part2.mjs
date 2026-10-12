/**
 * P5 a11y — no-JS probes, corrected selectors.
 *
 * Corrections over the first pass:
 *  · FAQ native `<details>` does NOT live on /about · /capabilities · /dealers.
 *    Those pages carry no FAQ at all any more. The native `<details>` FAQ that
 *    actually ships is on /products/wheels (5) and /tools/offset-calculator (1).
 *  · The long-form outline anchors are `href="#section-N"`. The first pass's
 *    `nav` selector matched the header nav instead, hence "links=0".
 *  · The catalogue GET form's text input is hidden at some widths, so the first
 *    pass's `fill()` timed out; we submit a visible control or the form itself.
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
const CHROME =
  process.env.CHROME_BIN ??
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const log = (...a) => console.log(...a);

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  const out = { generatedAt: new Date().toISOString(), jsEnabled: false, note: "javaScriptEnabled:false context" };

  // ── A · FAQ full text is in the DOM with JS off ──────────────────────
  out.faq = {};
  for (const route of ["/products/wheels", "/tools/offset-calculator"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
    const r = await page.evaluate(`(() => {
      const dets = [...document.querySelectorAll('details')];
      return {
        detailCount: dets.length,
        openCount: dets.filter(d => d.open).length,
        entries: dets.map(d => ({
          summary: (d.querySelector('summary')?.textContent || '').replace(/\\s+/g,' ').trim().slice(0, 60),
          bodyChars: [...d.children].filter(c => c.tagName !== 'SUMMARY').map(c => (c.textContent || '').trim()).join(' ').length,
          bodyHead: [...d.children].filter(c => c.tagName !== 'SUMMARY').map(c => (c.textContent || '').trim()).join(' ').slice(0, 120),
          open: d.open,
        })),
        totalFaqChars: dets.reduce((a, d) => a + (d.textContent || '').trim().length, 0),
      };
    })()`);
    out.faq[route] = r;
    log(`\nNOJS FAQ ${route}  details=${r.detailCount} open=${r.openCount} totalChars=${r.totalFaqChars}`);
    r.entries.forEach((e) => log(`   open=${e.open} bodyChars=${e.bodyChars} summary="${e.summary}"  body="${e.bodyHead.slice(0, 70)}"`));
  }

  // ── B · long-form outline anchors ────────────────────────────────────
  out.outline = {};
  for (const route of ["/support/returns", "/support/privacy", "/support/terms", "/support/shipping", "/support/warranty", "/insights/how-to-measure-fitment"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
    const r = await page.evaluate(`(() => {
      const anchors = [...document.querySelectorAll('a[href^="#section-"], a[href^="#"]')].filter(a => (a.getAttribute('href')||'').length > 1);
      const resolved = anchors.map(a => {
        const id = a.getAttribute('href').slice(1);
        const t = document.getElementById(id);
        return { href: a.getAttribute('href'), label: (a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40), targetExists: !!t, targetChars: t ? (t.textContent||'').trim().length : 0 };
      });
      const h2ids = [...document.querySelectorAll('h2[id]')].map(h => ({ id: h.id, text: (h.textContent||'').trim().slice(0,40) }));
      return {
        anchorCount: anchors.length,
        allResolve: resolved.length > 0 && resolved.every(x => x.targetExists),
        secAnchors: resolved.filter(x => x.href.startsWith('#section-')),
        unresolved: resolved.filter(x => !x.targetExists),
        h2WithId: h2ids,
        bodyTextLen: document.body.innerText.length,
      };
    })()`);
    out.outline[route] = r;
    log(`\nNOJS OUTLINE ${route}  anchors=${r.anchorCount} sectionAnchors=${r.secAnchors.length} allResolve=${r.allResolve} h2ids=${r.h2WithId.length} textLen=${r.bodyTextLen}`);
    if (r.unresolved.length) log("   UNRESOLVED:", JSON.stringify(r.unresolved.slice(0, 5)));
  }

  // ── C · wheel catalogue GET filter form submits with JS off ──────────
  {
    await page.goto(`${BASE}/products/wheels`, { waitUntil: "load", timeout: 90_000 });
    const before = await page.evaluate(`(() => {
      const forms = [...document.querySelectorAll('form')];
      return {
        formCount: forms.length,
        forms: forms.map((f, i) => ({
          i,
          method: (f.getAttribute('method') || 'get').toLowerCase(),
          action: f.getAttribute('action'),
          controls: [...f.querySelectorAll('input[name],select[name]')].map(c => c.tagName.toLowerCase() + '[name=' + c.name + ']' + (c.type ? ' type=' + c.type : '') + (c.offsetParent === null ? ' (hidden)' : '')),
          submit: [...f.querySelectorAll('button')].map(b => ({ type: b.getAttribute('type') || 'submit', text: (b.textContent || '').trim().slice(0, 18) })),
        })),
        results: document.querySelectorAll('a[href^="/products/wheels/"]').length,
        url: location.href,
      };
    })()`);
    out.catalogue = { before };
    log(`\nNOJS CATALOGUE forms=${before.formCount} results=${before.results} url=${before.url}`);
    before.forms.forEach((f) => log(`   form#${f.i} method=${f.method} action=${f.action} controls=${JSON.stringify(f.controls)} submit=${JSON.stringify(f.submit)}`));

    // Submit a GET form with JS off.
    //
    // Note: the two "Apply filters" submit buttons measure as NOT VISIBLE at
    // 1440px. They are the mobile filter drawer's buttons — the desktop filter
    // rail is always open, so its copy of the same <form> is the one on screen.
    // Rather than click something off-screen, this drives the visible desktop
    // form's own submit path (a real form submit, still JS-free) and records
    // the visibility fact as its own observation.
    const visibility = await page.evaluate(`(() => {
      const btns = [...document.querySelectorAll('form button[type=submit], form button')];
      return btns.map(b => ({
        text: (b.textContent || '').trim().slice(0, 18),
        formIndex: [...document.querySelectorAll('form')].indexOf(b.closest('form')),
        visible: b.offsetParent !== null && b.getBoundingClientRect().height > 0,
        rect: (r => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }))(b.getBoundingClientRect()),
      }));
    })()`);
    out.catalogue.submitButtonVisibility = visibility;
    log(`   submit buttons: ${JSON.stringify(visibility)}`);

    // Pick a genuinely visible form control to change, then submit the form
    // by pressing Enter inside it (native form submission, no JS involved).
    const plan = await page.evaluate(`(() => {
      const forms = [...document.querySelectorAll('form')];
      for (let i = 0; i < forms.length; i++) {
        const f = forms[i];
        const ctrl = [...f.querySelectorAll('select[name], input[name][type=search]')].find(c => c.offsetParent !== null && c.getBoundingClientRect().height > 0);
        if (ctrl) return { formIndex: i, name: ctrl.name, tag: ctrl.tagName.toLowerCase() };
      }
      return null;
    })()`);
    out.catalogue.submitPlan = plan;
    let after = null;
    if (plan) {
      const sel = `form >> nth=${plan.formIndex} >> [name="${plan.name}"]`;
      if (plan.tag === "select") {
        const opts = await page.$$(`form:nth-of-type(${plan.formIndex + 1}) select[name="${plan.name}"] option`);
        const v = opts.length > 1 ? await opts[1].getAttribute("value") : null;
        if (v !== null) {
          await page.selectOption(sel, v);
          await Promise.all([
            page.waitForNavigation({ waitUntil: "load", timeout: 60_000 }).catch(() => null),
            page.press(sel, "Enter"),
          ]);
          after = { selected: v, ...(await page.evaluate(`(() => ({ url: location.href, results: document.querySelectorAll('a[href^="/products/wheels/"]').length, hasForm: !!document.querySelector('form') }))()`)) };
        }
      }
    }
    out.catalogue.afterSubmit = { plan, after };
    log(`   submit plan=${JSON.stringify(plan)} → after=${JSON.stringify(after)}`);

    // And a URL-driven GET (the contract the form exists for) with JS off.
    await page.goto(`${BASE}/products/wheels?q=dx&sort=name-asc`, { waitUntil: "load", timeout: 90_000 });
    const params = await page.evaluate(`(() => ({
      url: location.href,
      results: document.querySelectorAll('a[href^="/products/wheels/"]').length,
      pagination: document.querySelectorAll('a[rel], nav a[href*="page="]').length,
      activeFilters: [...document.querySelectorAll('input:checked, select option:checked')].map(e => (e.name||e.parentElement?.name||'') + '=' + e.value).slice(0,6),
    }))()`);
    out.catalogue.urlDriven = params;
    log(`   URL-driven ?q=dx&sort=name-asc → results=${params.results} activeFilters=${JSON.stringify(params.activeFilters)}`);

    // Pagination links present + followable without JS
    const pagId = await page.evaluate(`(() => {
      const a = [...document.querySelectorAll('a[href*="page="]')][0];
      return a ? { href: a.getAttribute('href'), text: (a.textContent||'').trim().slice(0,20) } : null;
    })()`);
    out.catalogue.paginationLink = pagId;
    log(`   pagination link: ${JSON.stringify(pagId)}`);
  }

  // ── D · article body renders without JS ──────────────────────────────
  out.articles = {};
  for (const route of ["/insights/how-to-measure-fitment", "/insights/bolt-patterns/5x120", "/insights/offset-and-backspacing"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
    const r = await page.evaluate(`(() => {
      const h1 = document.querySelector('h1');
      const main = document.querySelector('main') || document.body;
      return {
        status: 'ok',
        h1: h1 ? (h1.textContent||'').replace(/\\s+/g,' ').trim().slice(0,70) : null,
        paragraphs: main.querySelectorAll('p').length,
        bodyChars: [...main.querySelectorAll('p')].map(p => (p.textContent||'').trim()).join(' ').length,
        totalText: document.body.innerText.length,
        headings: main.querySelectorAll('h2,h3').length,
        tables: main.querySelectorAll('table').length,
        lists: main.querySelectorAll('ul,ol').length,
      };
    })()`);
    out.articles[route] = r;
    log(`\nNOJS ARTICLE ${route}  h1="${r.h1}" paras=${r.paragraphs} bodyChars=${r.bodyChars} headings=${r.headings} tables=${r.tables} total=${r.totalText}`);
  }

  // ── E · nothing left invisible with JS off (fail-visible contract) ───
  out.hiddenCensus = {};
  for (const route of ["/", "/about", "/capabilities", "/products", "/products/wheels", "/insights", "/insights/how-to-measure-fitment", "/support/returns", "/request-a-quote", "/tools/offset-calculator"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
    const c = await page.evaluate(`(() => {
      const els = [...document.querySelectorAll('[data-reveal], [data-reveal-group] > *')];
      const bad = [];
      for (const el of els) {
        const cs = getComputedStyle(el);
        const op = parseFloat(cs.opacity);
        const blurry = (cs.filter||'').includes('blur') && !/blur\\(0(px)?\\)/.test(cs.filter);
        const shifted = cs.transform && cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)';
        if (op < 0.99 || blurry || shifted) bad.push({ tag: el.tagName.toLowerCase(), opacity: op, filter: cs.filter, transform: cs.transform, text: (el.innerText||'').replace(/\\s+/g,' ').trim().slice(0,44) });
      }
      return {
        revealCount: els.length,
        hiddenCount: bad.length,
        hidden: bad.slice(0, 6),
        motionReady: document.documentElement.classList.contains('motion-ready'),
        armed: document.documentElement.hasAttribute('data-motion-armed'),
        bodyText: document.body.innerText.length,
      };
    })()`);
    out.hiddenCensus[route] = c;
    log(`NOJS HIDDEN ${route.padEnd(38)} reveals=${c.revealCount} hidden=${c.hiddenCount} motionReady=${c.motionReady} armed=${c.armed} text=${c.bodyText}`);
    if (c.hiddenCount) c.hidden.forEach((h) => log(`     STUCK: ${h.tag} opacity=${h.opacity} filter=${h.filter} "${h.text}"`));
  }

  await ctx.close();
  await browser.close();
  fs.writeFileSync(path.join(OUT, "nojs-part2-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "nojs-part2-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
