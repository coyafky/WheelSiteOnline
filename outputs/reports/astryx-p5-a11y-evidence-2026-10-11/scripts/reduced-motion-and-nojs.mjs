/**
 * P5 a11y — reduced-motion + no-JS probes.
 *
 * REDUCED MOTION
 *   The site's reveal system is fail-visible: content is visible unless JS
 *   positively arms it (`html.motion-ready[data-motion-armed]` + `.is-revealed`).
 *   The thing worth proving is not "the CSS block exists" (that's a read), but
 *   that with `prefers-reduced-motion: reduce` emulated, every `[data-reveal]`
 *   element actually computes to visible and paints pixels.
 *
 * NO-JS
 *   Without JavaScript: FAQ full text present, long-form outline/anchors
 *   readable, wheel catalogue GET filter form submittable, article body
 *   renders. Also: nothing is stuck at opacity 0 (the fail-visible contract).
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

/** Full-page reveal/hidden census. */
const CENSUS = `(() => {
  const els = [...document.querySelectorAll('[data-reveal], [data-reveal-group] > *')];
  const bad = [];
  for (const el of els) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const opacity = parseFloat(cs.opacity);
    const visible = cs.visibility !== 'hidden' && cs.display !== 'none';
    const hasArea = r.width > 0 && r.height > 0;
    const textLen = (el.innerText || '').trim().length;
    const translucent = opacity < 0.99;
    const blurred = (cs.filter || 'none') !== 'none' && (cs.filter || '').includes('blur') && !/blur\\(0(px)?\\)/.test(cs.filter);
    const shifted = cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)';
    if (!visible || !hasArea || textLen === 0 ? false : (translucent || blurred)) {
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 70),
        opacity, filter: cs.filter, transform: cs.transform,
        text: (el.innerText||'').replace(/\\s+/g,' ').trim().slice(0,50),
      });
    }
  }
  return {
    revealCount: els.length,
    hidden: bad,
    htmlAttrs: {
      motionReady: document.documentElement.classList.contains('motion-ready'),
      motionArmed: document.documentElement.hasAttribute('data-motion-armed'),
    },
    reducedMotionMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})()`;

/** Count CSS animations actually running. */
const ANIM = `(() => {
  const running = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.animationName && cs.animationName !== 'none') {
      const dur = parseFloat(cs.animationDuration) || 0;
      if (dur > 0.02) running.push({ tag: el.tagName.toLowerCase(), cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 60), name: cs.animationName, dur: cs.animationDuration, iter: cs.animationIterationCount });
    }
    if (cs.transitionProperty && cs.transitionProperty !== 'none' && cs.transitionProperty !== 'all') {
      // only note transitions on reveal/parallax elements
      if (el.hasAttribute('data-reveal') || el.hasAttribute('data-reveal-group') || el.hasAttribute('data-parallax-media')) {
        running.push({ tag: el.tagName.toLowerCase(), transition: cs.transitionProperty + ' ' + cs.transitionDuration });
      }
    }
  }
  const kb = [...document.querySelectorAll('.fh-kenburns')].map((el) => ({ name: getComputedStyle(el).animationName, dur: getComputedStyle(el).animationDuration, transform: getComputedStyle(el).transform }));
  return { runningCount: running.length, running: running.slice(0, 14), kenburns: kb };
})()`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const out = { generatedAt: new Date().toISOString(), base: BASE };

  const ROUTES = ["/", "/about", "/capabilities", "/products/wheels", "/insights", "/insights/how-to-measure-fitment", "/support/returns", "/products/wheels/dx035"];

  // ── 1 · reduced motion ───────────────────────────────────────────────
  out.reducedMotion = {};
  for (const route of ROUTES) {
    for (const vp of [{ n: "320x568", width: 320, height: 568 }, { n: "1440x900", width: 1440, height: 900 }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      const key = `${route}@${vp.n}`;
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
        await page.waitForTimeout(1200);
        const census = await page.evaluate(CENSUS);
        const anim = await page.evaluate(ANIM);
        // Double-check by scrolling the whole page and re-measuring: a
        // scroll-triggered reveal that would only fire on intersect must not
        // leave anything behind.
        await page.evaluate(async () => {
          const H = document.documentElement.scrollHeight;
          for (let y = 0; y < H; y += window.innerHeight) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 80));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1000);
        const afterScroll = await page.evaluate(CENSUS);
        out.reducedMotion[key] = {
          revealCount: census.revealCount,
          hiddenBeforeScroll: census.hidden.length,
          hiddenAfterScroll: afterScroll.hidden.length,
          hiddenDetail: afterScroll.hidden.slice(0, 8),
          htmlAttrs: census.htmlAttrs,
          reducedMotionMatches: census.reducedMotionMatches,
          animationsStillRunning: anim.runningCount,
          animationsSample: anim.running.slice(0, 8),
          kenburns: anim.kenburns,
        };
        log(`RM ${key.padEnd(46)} reveals=${census.revealCount} hidden(before/after)=${census.hidden.length}/${afterScroll.hidden.length} animRunning=${anim.runningCount} kenburnsAnim=${anim.kenburns.map((k) => k.name).join(",") || "none"}`);
        if (afterScroll.hidden.length) afterScroll.hidden.forEach((h) => log(`     HIDDEN: ${h.tag}.${h.cls} opacity=${h.opacity} filter=${h.filter} "${h.text}"`));
      } catch (e) {
        out.reducedMotion[key] = { error: e.message.split("\n")[0] };
        log(`RM ${key} ERR ${e.message.split("\n")[0]}`);
      }
      await ctx.close();
    }
  }

  // ── 2 · no-JS ────────────────────────────────────────────────────────
  out.noJs = {};
  const njCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const njPage = await njCtx.newPage();

  // 2a FAQ full text (native <details> on /about, /capabilities, /dealers, /tools/offset-calculator)
  for (const route of ["/about", "/capabilities", "/dealers", "/tools/offset-calculator"]) {
    try {
      await njPage.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
      const r = await njPage.evaluate(`(() => {
        const dets = [...document.querySelectorAll('details')];
        return {
          detailCount: dets.length,
          openCount: dets.filter(d => d.open).length,
          sample: dets.slice(0,3).map(d => ({
            summaryLen: (d.querySelector('summary')?.textContent || '').trim().length,
            bodyLen: [...d.children].filter(c => c.tagName !== 'SUMMARY').map(c => (c.textContent||'').trim()).join(' ').length,
            bodyText: [...d.children].filter(c => c.tagName !== 'SUMMARY').map(c => (c.textContent||'').trim()).join(' ').slice(0, 90),
          })),
          // full text is in the DOM regardless of open/closed
          allFaqTextLen: dets.map(d => (d.textContent||'').trim().length).reduce((a,b)=>a+b,0),
        };
      })()`);
      out.noJs[`faq:${route}`] = r;
      log(`NOJS faq ${route.padEnd(26)} details=${r.detailCount} open=${r.openCount} faqTextChars=${r.allFaqTextLen}`);
    } catch (e) { out.noJs[`faq:${route}`] = { error: e.message.split("\n")[0] }; }
  }

  // 2b long-form outline / anchors
  for (const route of ["/support/returns", "/support/privacy"]) {
    try {
      await njPage.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
      const r = await njPage.evaluate(`(() => {
        const outline = document.querySelector('nav[aria-label], .astryx-outline, aside nav, nav');
        const links = outline ? [...outline.querySelectorAll('a[href^="#"]')] : [];
        const resolved = links.map(a => {
          const id = a.getAttribute('href').slice(1);
          const t = document.getElementById(id);
          return { href: a.getAttribute('href'), text: (a.textContent||'').trim().slice(0,30), targetExists: !!t, targetTextLen: t ? (t.textContent||'').trim().length : 0 };
        });
        const h2s = [...document.querySelectorAll('main h2[id], article h2[id], h2[id]')].map(h => ({ id: h.id, text: (h.textContent||'').trim().slice(0,40) }));
        return { outlineFound: !!outline, outlineLinkCount: links.length, resolved: resolved.slice(0,8), resolvedAllOk: resolved.every(x => x.targetExists), h2WithIdCount: h2s.length, h2s: h2s.slice(0,6), bodyTextLen: document.body.innerText.length };
      })()`);
      out.noJs[`outline:${route}`] = r;
      log(`NOJS outline ${route.padEnd(20)} links=${r.outlineLinkCount} allAnchorsResolve=${r.resolvedAllOk} h2ids=${r.h2WithIdCount} textLen=${r.bodyTextLen}`);
    } catch (e) { out.noJs[`outline:${route}`] = { error: e.message.split("\n")[0] }; }
  }

  // 2c wheel catalogue GET filter form
  try {
    await njPage.goto(`${BASE}/products/wheels`, { waitUntil: "load", timeout: 90_000 });
    const r = await njPage.evaluate(`(() => {
      const forms = [...document.querySelectorAll('form')].map(f => ({
        method: (f.getAttribute('method')||'get').toLowerCase(),
        action: f.getAttribute('action'),
        controls: f.querySelectorAll('input,select,button[type=submit],button:not([type])').length,
        inputs: [...f.querySelectorAll('input[name],select[name]')].map(i => i.tagName.toLowerCase()+'['+i.name+']'+(i.type?' type='+i.type:'')),
        submitButtons: [...f.querySelectorAll('button')].map(b => ({ type: b.getAttribute('type')||'submit', text: (b.textContent||'').trim().slice(0,20) })),
      }));
      const selects = [...document.querySelectorAll('form select')].map(s => ({ name: s.name, options: s.options.length }));
      const results = document.querySelectorAll('a[href^="/products/wheels/"]').length;
      return { formCount: forms.length, forms: forms.slice(0,5), selects: selects.slice(0,5), productLinks: results, textLen: document.body.innerText.length };
    })()`);
    // Actually SUBMIT the GET form with JS off and check the URL + results change.
    const submitPath = await njPage.evaluate(`(() => {
      const f = document.querySelector('form');
      if (!f) return null;
      const sel = f.querySelector('select[name], input[name][type=search], input[name]:not([type=hidden])');
      if (!sel) return null;
      return { formIndex: [...document.querySelectorAll('form')].indexOf(f), controlName: sel.name, tag: sel.tagName.toLowerCase() };
    })()`);
    let submitted = null;
    if (submitPath && submitPath.tag === "select") {
      const selectHandle = await njPage.$(`form select[name="${submitPath.controlName}"]`);
      const opts = await njPage.$$(`form select[name="${submitPath.controlName}"] option`);
      if (opts.length > 1) {
        const value = await opts[1].getAttribute("value");
        await selectHandle.selectOption(value);
        await Promise.all([
          njPage.waitForNavigation({ waitUntil: "load", timeout: 60_000 }).catch(() => null),
          njPage.keyboard.press("Enter"),
        ]);
        submitted = { selected: value, url: njPage.url(), productLinks: await njPage.$$eval('a[href^="/products/wheels/"]', (a) => a.length) };
      }
    } else if (submitPath) {
      const inputHandle = await njPage.$(`form [name="${submitPath.controlName}"]`);
      await inputHandle.fill("dx");
      await Promise.all([
        njPage.waitForNavigation({ waitUntil: "load", timeout: 60_000 }).catch(() => null),
        njPage.keyboard.press("Enter"),
      ]);
      submitted = { typed: "dx", url: njPage.url(), productLinks: await njPage.$$eval('a[href^="/products/wheels/"]', (a) => a.length) };
    }
    out.noJs["catalogue:/products/wheels"] = { ...r, submitPath, submitted };
    log(`NOJS catalogue forms=${r.formCount} productLinks=${r.productLinks} submitPath=${JSON.stringify(submitPath)} submitted=${JSON.stringify(submitted)}`);
  } catch (e) { out.noJs["catalogue:/products/wheels"] = { error: e.message.split("\n")[0] }; log("NOJS catalogue ERR", e.message.split("\n")[0]); }

  // 2d article body renders without JS
  for (const route of ["/insights/how-to-measure-fitment", "/insights/bolt-patterns/5x120"]) {
    try {
      await njPage.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
      const r = await njPage.evaluate(`(() => {
        const main = document.querySelector('main') || document.body;
        const h1 = document.querySelector('h1');
        const paras = [...main.querySelectorAll('p')];
        const bodyLen = paras.map(p => (p.textContent||'').trim()).join(' ').length;
        return {
          h1: h1 ? (h1.textContent||'').trim().slice(0,60) : null,
          paragraphCount: paras.length,
          bodyTextLen: bodyLen,
          totalTextLen: document.body.innerText.length,
          tables: main.querySelectorAll('table').length,
          lists: main.querySelectorAll('ul,ol').length,
        };
      })()`);
      out.noJs[`article:${route}`] = r;
      log(`NOJS article ${route.padEnd(38)} h1="${r.h1}" paras=${r.paragraphCount} bodyChars=${r.bodyTextLen} tables=${r.tables}`);
    } catch (e) { out.noJs[`article:${route}`] = { error: e.message.split("\n")[0] }; }
  }

  // 2e nothing hidden without JS (fail-visible contract)
  out.noJsHiddenCensus = {};
  for (const route of ["/", "/about", "/products/wheels", "/insights/how-to-measure-fitment"]) {
    try {
      await njPage.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
      const c = await njPage.evaluate(CENSUS);
      out.noJsHiddenCensus[route] = { revealCount: c.revealCount, hidden: c.hidden.length, htmlAttrs: c.htmlAttrs, detail: c.hidden.slice(0, 6) };
      log(`NOJS hidden ${route.padEnd(38)} reveals=${c.revealCount} hidden=${c.hidden.length} motionReady=${c.htmlAttrs.motionReady} armed=${c.htmlAttrs.motionArmed}`);
    } catch (e) { out.noJsHiddenCensus[route] = { error: e.message.split("\n")[0] }; }
  }
  await njCtx.close();

  await browser.close();
  fs.writeFileSync(path.join(OUT, "reduced-motion-and-nojs-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "reduced-motion-and-nojs-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
