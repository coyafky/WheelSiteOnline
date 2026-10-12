/**
 * P5 a11y — ring audit (vector-rendered pixel probe at the element edge,
 * robust against `oklab(...)` computed colours) + dialog focus containment
 * re-run with correct accounting (dialog node in a portal, not nested).
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
const WHEEL = args.wheel ?? "/products/wheels/dx035";
const log = (...a) => console.log(...a);

/**
 * Focus-ring probe.
 *
 * Reason it does not just read `outlineColor`: Tailwind v4 utilities report
 * `oklab(0.505813 0.0826646 0.0888046 / X)` which is real but unparseable as a
 * plain colour string, and `outlineStyle` is reported as `none` when a ring is
 * drawn with `outline-width` + a partially-transparent colour on some engines.
 * So: capture two 1px-wide vertical strips of pixels at the element's left edge
 * — one focused, one blurred — and compare them. Any difference is a rendered
 * focus indicator, whatever CSS produced it.
 */
const RING_PROBE = `(async () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { none: true };
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const describe = () => ({
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    href: el.getAttribute('href') || null,
    label: (el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].textContent) || el.textContent || '').replace(/\\s+/g,' ').trim().slice(0,46),
    outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset,
    boxShadow: (cs.boxShadow || '').slice(0,140),
    matchesFocusVisible: el.matches(':focus-visible'),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    hasBorder: cs.borderTopWidth !== '0px',
  });
  const snap = () => {
    const r2 = el.getBoundingClientRect();
    const x = Math.max(0, Math.round(r2.x) - 6);
    const y = Math.max(0, Math.round(r2.y + r2.height / 2) - 30);
    // a 20px-wide strip 60px tall starting 6px left of the element, plus 4px inside
    const w = Math.max(1, Math.min(24, Math.round(r2.x) - x + 6));
    return { x, y, w, h: 60 };
  };
  el.setAttribute('data-p5-probe', '1');
  const box = snap();
  window.__p5Box = box;
  return describe();
})()`;

async function strip(page, box) {
  // Read pixel column sums via canvas of a screenshot region — cheaper and
  // deterministic: compare element screenshots with and without focus.
  return null;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const out = { generatedAt: new Date().toISOString(), method: "clip-screenshot pixel diff focused vs blurred", routes: {} };

  const routes = ["/", "/products/wheels", "/request-a-quote", WHEEL, "/tools/offset-calculator", "/support/returns", "/insights/bolt-patterns/5x120"];
  for (const route of routes) {
    for (const vp of [{ n: "320x568", width: 320, height: 568 }, { n: "1440x900", width: 1440, height: 900 }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const key = `${route}@${vp.n}`;
      const entries = [];
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
        await page.waitForTimeout(800);
        for (let i = 0; i < 28; i++) {
          await page.keyboard.press("Tab");
          // 1 · make sure it is on screen so the ring is genuinely painted
          await page.evaluate(() => {
            const el = document.activeElement;
            if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
          });
          await page.waitForTimeout(40);
          const described = await page.evaluate(RING_PROBE);
          if (described.none) { entries.push({ none: true }); continue; }

          // 2 · focused screenshot of a tight box that includes the ring margin
          let focusedPng = null, blurredPng = null;
          try {
            const box = await page.evaluate(() => window.__p5Box);
            const clip = {
              x: box.x, y: box.y,
              width: Math.max(8, box.w + 12), height: Math.max(12, box.h),
            };
            focusedPng = await page.screenshot({ clip, animations: "disabled" });
            await page.evaluate(() => document.activeElement.blur());
            await page.waitForTimeout(60);
            blurredPng = await page.screenshot({ clip, animations: "disabled" });
          } catch (e) {
            entries.push({ ...described, pixelProbeError: e.message.split("\n")[0] });
            continue;
          }
          const identical = Buffer.compare(focusedPng, blurredPng) === 0;
          entries.push({ ...described, pixelDiffers: !identical, bytesFocused: focusedPng.length, bytesBlurred: blurredPng.length });
          // re-focus so the next Tab continues from a sane place
          await page.evaluate(() => {
            const el = document.querySelector('[data-p5-probe="1"]');
            if (el) el.focus();
          });
        }
      } catch (e) {
        out.routes[key] = { error: e.message.split("\n")[0] };
        await ctx.close();
        continue;
      }
      const real = entries.filter((e) => !e.none && !e.pixelProbeError);
      const noDiff = real.filter((e) => !e.pixelDiffers);
      out.routes[key] = {
        tabbed: real.length,
        withoutRenderedChange: noDiff.map((m) => `${m.tag}${m.id ? "#" + m.id : ""} "${m.label}" fvMatches=${m.matchesFocusVisible} outline=${m.outlineStyle}/${m.outlineWidth}/${m.outlineColor} offset=${m.outlineOffset} shadow=${m.boxShadow} border=${m.hasBorder}`),
        errors: entries.filter((e) => e.pixelProbeError).map((e) => e.tag + " " + e.pixelProbeError),
      };
      log(`\n=== RING PIXEL DIFF ${key} === tabbed=${real.length} noRenderedChange=${noDiff.length}`);
      noDiff.forEach((m) => log(`   NO CHANGE: ${m.tag}${m.id ? "#" + m.id : ""} "${m.label}" fvMatches=${m.matchesFocusVisible} outline=${m.outlineStyle}/${m.outlineWidth}/${m.outlineColor} off=${m.outlineOffset} shadow=${m.boxShadow} border=${m.hasBorder}`));
      if (entries.filter((e) => e.pixelProbeError).length) log("   probe errors:", out.routes[key].errors.slice(0, 4));
      await ctx.close();
    }
  }

  // ── Dialog containment, corrected accounting ─────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const d = { route: WHEEL, steps: [] };
    try {
      await page.goto(`${BASE}${WHEEL}`, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(1000);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /Request this wheel model|direct enquir/i.test(x.textContent || ""));
        if (b) b.setAttribute("data-p5-trigger", "1");
      });
      d.triggerText = await page.evaluate(() => document.querySelector('[data-p5-trigger="1"]')?.textContent?.trim());
      await page.click('[data-p5-trigger="1"]');
      await page.waitForTimeout(900);

      const dialogHandle = await page.$('[role="dialog"], dialog[open], [aria-modal="true"]');
      d.dialogElement = dialogHandle ? await dialogHandle.evaluate((el) => ({
        tag: el.tagName.toLowerCase(), role: el.getAttribute("role"), ariaModal: el.getAttribute("aria-modal"),
        parentTag: el.parentElement?.tagName.toLowerCase(), parentCls: (el.parentElement?.className || "").slice(0, 80),
      })) : null;

      /** Everything that is NOT inside the dialog should be inert/aria-hidden. */
      const outsideState = await page.evaluate(() => {
        const dl = document.querySelector('[role="dialog"], dialog[open], [aria-modal="true"]');
        const outside = [...document.querySelectorAll("a[href], button, input, select, textarea")].filter((el) => dl && !dl.contains(el) && el.offsetParent !== null);
        const reachable = outside.filter((el) => !el.closest("[inert]") && el.getAttribute("aria-hidden") !== "true" && !el.disabled);
        return { outsideCount: outside.length, stillReachable: reachable.length, sample: reachable.slice(0, 5).map((e) => e.tagName.toLowerCase() + "#" + (e.id || "") + " " + (e.textContent || "").trim().slice(0, 24)) };
      });
      d.outsideStateWhileOpen = outsideState;

      const inside = [];
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press("Tab");
        const f = await page.evaluate(`(() => {
          const el = document.activeElement;
          const dl = document.querySelector('[role="dialog"], dialog[open], [aria-modal="true"]');
          return {
            tag: el ? el.tagName.toLowerCase() : null,
            id: el ? el.id : null,
            label: el ? (el.getAttribute?.('aria-label') || el.textContent || '').replace(/\\s+/g,' ').trim().slice(0,36) : null,
            inDialog: !!(dl && el && dl.contains(el)),
            isBody: el === document.body || el === document.documentElement,
          };
        })()`);
        inside.push(f);
      }
      d.forwardTab = {
        presses: inside.length,
        leftDialog: inside.filter((f) => !f.inDialog).length,
        leftDialogEvents: inside.map((f, i) => (!f.inDialog ? `#${i + 1}: ${f.tag}${f.id ? "#" + f.id : ""} body=${f.isBody} "${f.label}"` : null)).filter(Boolean),
        distinctTargets: new Set(inside.filter((f) => f.inDialog).map((f) => f.tag + "#" + (f.id || ""))).size,
      };

      // Escape → close + focus restore
      await page.keyboard.press("Escape");
      await page.waitForTimeout(900);
      d.afterEscape = await page.evaluate(() => {
        const dl = document.querySelector('[role="dialog"], dialog[open], [aria-modal="true"]');
        const el = document.activeElement;
        const trig = document.querySelector('[data-p5-trigger="1"]');
        return {
          dialogClosed: !dl,
          focusOnTrigger: el === trig,
          activeTag: el ? el.tagName.toLowerCase() : null,
          activeId: el ? el.id : null,
          activeText: el ? (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 44) : null,
          isBody: el === document.body,
        };
      });
      log("\n=== DIALOG (corrected) ===");
      log("  outsideWhileOpen:", JSON.stringify(outsideState));
      log("  forwardTab:", JSON.stringify(d.forwardTab));
      log("  afterEscape:", JSON.stringify(d.afterEscape));

      // reopen by keyboard to prove the cycle
      if (d.afterEscape.focusOnTrigger) {
        await page.keyboard.press("Enter");
        await page.waitForTimeout(800);
        d.reopenWithEnter = await page.evaluate(() => !!document.querySelector('[role="dialog"], dialog[open], [aria-modal="true"]'));
        await page.keyboard.press("Escape");
        await page.waitForTimeout(700);
        d.secondEscape = await page.evaluate(() => ({
          closed: !document.querySelector('[role="dialog"], dialog[open], [aria-modal="true"]'),
          focusOnTrigger: document.activeElement === document.querySelector('[data-p5-trigger="1"]'),
        }));
        log("  reopenWithEnter:", d.reopenWithEnter, " secondEscape:", JSON.stringify(d.secondEscape));
      } else {
        // try reopening from wherever focus landed
        await page.keyboard.press("Enter");
        await page.waitForTimeout(800);
        d.reopenFromWhereverFocusLanded = await page.evaluate(() => ({
          dialogOpen: !!document.querySelector('[role="dialog"], dialog[open], [aria-modal="true"]'),
          activeTag: document.activeElement?.tagName.toLowerCase(),
          activeText: (document.activeElement?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 44),
        }));
        log("  reopenFromWhereverFocusLanded:", JSON.stringify(d.reopenFromWhereverFocusLanded));
      }
    } catch (e) {
      d.error = e.message.split("\n")[0];
      log("  ERR:", d.error);
    }
    out.dialog = d;
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "ring-and-dialog-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "ring-and-dialog-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
