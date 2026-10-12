/**
 * P5 a11y — part 2:
 *  (a) Dialog open → Tab focus containment → Escape → focus restore to trigger
 *  (b) Mobile nav @320px keyboard operability (correct selectors:
 *      button[aria-controls="mobile-nav"] and #mobile-nav)
 *  (c) Focus-ring audit using :focus-visible (no mouse interaction, so
 *      :focus-visible genuinely applies)
 *
 * Run: node keyboard-part2.mjs --base http://127.0.0.1:3210 --out <dir>
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
const WHEEL = args.wheel ?? null;
const log = (...a) => console.log(...a);

const RING = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return { none: true };
  const cs = getComputedStyle(el);
  const ow = parseFloat(cs.outlineWidth) || 0;
  const hasOutline = cs.outlineStyle !== 'none' && ow > 0 && cs.outlineColor !== 'rgba(0, 0, 0, 0)';
  const hasShadow = cs.boxShadow && cs.boxShadow !== 'none';
  // also probe ::after / ::before (some designs draw the ring there)
  let pseudo = null;
  for (const which of ['::before','::after']) {
    const ps = getComputedStyle(el, which);
    if (ps.content === 'none') continue;
    const pw = parseFloat(ps.outlineWidth) || 0;
    if ((ps.outlineStyle !== 'none' && pw > 0) || (ps.boxShadow && ps.boxShadow !== 'none')) {
      pseudo = which + ' outline=' + ps.outlineStyle + ' shadow=' + (ps.boxShadow||'').slice(0,80);
    }
  }
  const matchesFV = el.matches(':focus-visible');
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    href: el.getAttribute('href') || null,
    label: (el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].textContent) || el.textContent || '').replace(/\\s+/g,' ').trim().slice(0,44),
    matchesFocusVisible: matchesFV,
    hasOutline, outline: cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor+' off='+cs.outlineOffset,
    hasShadow, shadow: (cs.boxShadow||'').slice(0,110),
    borderTopColor: cs.borderTopColor,
    pseudo,
    visibleRing: hasOutline || hasShadow || !!pseudo,
  };
})()`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const out = { generatedAt: new Date().toISOString(), base: BASE, wheel: WHEEL };

  // ── (a) Dialog ────────────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const d = { route: WHEEL, steps: [] };
    try {
      await page.goto(`${BASE}${WHEEL}`, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(1000);

      // Astryx Button renders a real <button>; locate by the text it shows.
      const trigger = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")].filter(
          (b) => b.offsetParent !== null,
        );
        const b =
          btns.find((x) => /direct enquiry|direct inquiry|enquire|询盘|直接/i.test(x.textContent || "")) ||
          btns.find((x) => /quote|request|contact/i.test(x.textContent || "")) ||
          null;
        if (!b) return null;
        b.setAttribute("data-p5-trigger", "1");
        return {
          text: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
          html: b.outerHTML.slice(0, 200),
          allVisibleButtons: btns.map((x) => (x.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30)),
        };
      });
      d.trigger = trigger;
      log("\n=== DIALOG === trigger:", JSON.stringify(trigger));
      if (!trigger) throw new Error("trigger not found");

      await page.click('[data-p5-trigger="1"]');
      await page.waitForTimeout(800);
      const opened = await page.evaluate(() => {
        const dl = document.querySelector('[role="dialog"], dialog[open]');
        if (!dl) return { present: false };
        const labelled = dl.getAttribute("aria-labelledby");
        return {
          present: true,
          role: dl.getAttribute("role"),
          ariaModal: dl.getAttribute("aria-modal"),
          labelledby: labelled,
          labelText: labelled ? (document.getElementById(labelled)?.textContent || "").slice(0, 60) : null,
          focusables: dl.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length,
        };
      });
      d.opened = opened;
      log("  opened:", opened);

      // Tab forward well past the focusable count and see if focus stays inside
      const trap = [];
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press("Tab");
        const f = await page.evaluate(`(() => {
          const el = document.activeElement;
          if (!el) return null;
          const dl = document.querySelector('[role="dialog"], dialog[open]');
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            label: (el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].textContent) || el.textContent || '').replace(/\\s+/g,' ').trim().slice(0,40),
            insideDialog: !!(dl && dl.contains(el)),
            inBody: el === document.body,
          };
        })()`);
        trap.push(f);
        if (f && !f.insideDialog) { log(`  ESCAPED at tab ${i + 1}:`, f); }
      }
      const escapes = trap.filter((f) => f && !f.insideDialog);
      d.trap = {
        tabs: trap.length,
        escapes: escapes.length,
        escapedAt: escapes.map((e) => `${e.tag}${e.id ? "#" + e.id : ""} inBody=${e.inBody} "${e.label}"`),
        uniques: [...new Set(trap.filter(Boolean).map((f) => f.tag + "#" + (f.id || "") + ":" + f.label))].length,
      };
      log("  trap:", d.trap.tabs, "tabs,", d.trap.escapes, "escapes,", d.trap.uniques, "unique targets");

      // Shift+Tab backwards → still inside?
      const back = [];
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Shift+Tab");
        back.push(await page.evaluate(`(() => { const el=document.activeElement; const dl=document.querySelector('[role="dialog"], dialog[open]'); return { tag: el?.tagName.toLowerCase(), inside: !!(dl && el && dl.contains(el)) }; })()`));
      }
      d.shiftTabBack = { escapes: back.filter((b) => b && !b.inside).length, samples: back.slice(0, 4) };

      // Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(800);
      d.afterEscape = await page.evaluate(() => {
        const dl = document.querySelector('[role="dialog"], dialog[open]');
        const el = document.activeElement;
        const trig = document.querySelector('[data-p5-trigger="1"]');
        return {
          dialogClosed: !dl,
          activeIsTrigger: el === trig,
          activeTag: el ? el.tagName.toLowerCase() : null,
          activeText: el ? (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50) : null,
          activeInBody: el === document.body,
        };
      });
      log("  after Escape:", d.afterEscape);

      // Re-open with keyboard only (focus trigger, Enter) → confirms operable
      await page.focus('[data-p5-trigger="1"]');
      await page.keyboard.press("Enter");
      await page.waitForTimeout(700);
      d.reopenByKeyboard = await page.evaluate(() => {
        const dl = document.querySelector('[role="dialog"], dialog[open]');
        return { reopened: !!dl, activeInsideDialog: !!(dl && document.activeElement && dl.contains(document.activeElement)) };
      });
      log("  reopen via Enter:", d.reopenByKeyboard);
    } catch (e) {
      d.error = e.message.split("\n")[0];
      log("  ERR:", d.error);
    }
    out.dialog = d;
    await ctx.close();
  }

  // ── (b) Mobile nav @320 keyboard only ────────────────────────────────
  {
    for (const route of ["/", "/products/wheels"]) {
      const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } });
      const page = await ctx.newPage();
      const m = { route, steps: [] };
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
        await page.waitForTimeout(900);
        const before = await page.evaluate(() => {
          const b = document.querySelector('button[aria-controls="mobile-nav"]');
          const panel = document.getElementById("mobile-nav");
          return {
            buttonFound: !!b,
            buttonLabel: b?.getAttribute("aria-label"),
            ariaExpanded: b?.getAttribute("aria-expanded"),
            panelFound: !!panel,
            panelHeight: panel ? Math.round(panel.getBoundingClientRect().height) : null,
            panelVisibleLinks: panel ? [...panel.querySelectorAll("a[href]")].filter((a) => a.getBoundingClientRect().height > 0).length : 0,
            panelTabbableLinks: panel ? [...panel.querySelectorAll("a[href]")].filter((a) => a.tabIndex >= 0).length : 0,
          };
        });
        m.before = before;
        log(`\n=== MOBILE NAV @320 ${route} ===`, JSON.stringify(before));

        // Keyboard-only open: focus the trigger then Enter. Never click().
        await page.focus('button[aria-controls="mobile-nav"]');
        await page.keyboard.press("Enter");
        await page.waitForTimeout(900);
        const opened = await page.evaluate(() => {
          const b = document.querySelector('button[aria-controls="mobile-nav"]');
          const panel = document.getElementById("mobile-nav");
          const links = panel ? [...panel.querySelectorAll("a[href]")] : [];
          const visible = links.filter((a) => a.getBoundingClientRect().height > 0 && getComputedStyle(a).visibility !== "hidden");
          return {
            ariaExpanded: b?.getAttribute("aria-expanded"),
            panelHeight: panel ? Math.round(panel.getBoundingClientRect().height) : null,
            visibleLinks: visible.length,
            firstVisibleLink: visible[0] ? { href: visible[0].getAttribute("href"), text: (visible[0].textContent || "").trim().slice(0, 30) } : null,
          };
        });
        m.opened = opened;
        log("  opened via Enter:", JSON.stringify(opened));

        // Tab to the first link inside the panel
        const reached = [];
        for (let i = 0; i < 20; i++) {
          await page.keyboard.press("Tab");
          const f = await page.evaluate(`(() => {
            const el = document.activeElement;
            const panel = document.getElementById('mobile-nav');
            return {
              tag: el?.tagName.toLowerCase(),
              href: el?.getAttribute?.('href') || null,
              label: (el?.getAttribute?.('aria-label') || el?.textContent || '').replace(/\\s+/g,' ').trim().slice(0,40),
              inPanel: !!(panel && el && panel.contains(el)),
            };
          })()`);
          reached.push(f);
          if (f.inPanel && f.tag === "a" && f.href) break;
        }
        const firstLink = reached.find((f) => f.inPanel && f.tag === "a" && f.href);
        m.firstLinkViaTab = firstLink ? { ...firstLink, tabs: reached.indexOf(firstLink) + 1 } : null;
        log("  first in-panel link via Tab:", JSON.stringify(m.firstLinkViaTab));

        // Escape should close + return focus to the burger
        await page.keyboard.press("Escape");
        await page.waitForTimeout(700);
        m.afterEscape = await page.evaluate(() => {
          const b = document.querySelector('button[aria-controls="mobile-nav"]');
          const panel = document.getElementById("mobile-nav");
          return {
            ariaExpanded: b?.getAttribute("aria-expanded"),
            panelHeight: panel ? Math.round(panel.getBoundingClientRect().height) : null,
            focusOnButton: document.activeElement === b,
            activeTag: document.activeElement?.tagName.toLowerCase(),
          };
        });
        log("  after Escape:", JSON.stringify(m.afterEscape));

        // Close again by keyboard (Enter on the trigger) to confirm toggle-back
        await page.focus('button[aria-controls="mobile-nav"]');
        if (m.afterEscape.ariaExpanded === "true") await page.keyboard.press("Enter");
        await page.waitForTimeout(700);
        m.closedAgain = await page.evaluate(() => {
          const b = document.querySelector('button[aria-controls="mobile-nav"]');
          const panel = document.getElementById("mobile-nav");
          return { ariaExpanded: b?.getAttribute("aria-expanded"), panelHeight: panel ? Math.round(panel.getBoundingClientRect().height) : null };
        });
        log("  closed again via Enter:", JSON.stringify(m.closedAgain));

        // Sub-menu disclosure toggle via keyboard
        const sub = await page.evaluate(() => {
          const b = [...document.querySelectorAll('#mobile-nav button')].find((x) => /Toggle .* submenu/.test(x.getAttribute("aria-label") || ""));
          if (!b) return null;
          b.setAttribute("data-p5-sub", "1");
          return { label: b.getAttribute("aria-label"), expanded: b.getAttribute("aria-expanded") };
        });
        if (sub) {
          await page.focus('[data-p5-sub="1"]');
          await page.keyboard.press("Enter");
          await page.waitForTimeout(600);
          m.submenu = await page.evaluate(() => {
            const b = document.querySelector('[data-p5-sub="1"]');
            const panel = document.getElementById("mobile-nav");
            const kids = panel ? panel.querySelectorAll("a[href]") : [];
            return { expanded: b?.getAttribute("aria-expanded"), navLinksInPanel: kids.length, visibleNavLinks: [...kids].filter((a) => a.getBoundingClientRect().height > 0).length };
          });
          log("  submenu via Enter:", JSON.stringify(m.submenu));
        }
      } catch (e) {
        m.error = e.message.split("\n")[0];
        log("  ERR:", m.error);
      }
      out[`mobileNav${route.replace(/\W/g, "_")}`] = m;
      await ctx.close();
    }
  }

  // ── (c) :focus-visible ring audit ────────────────────────────────────
  {
    const routes = ["/", "/products/wheels", "/request-a-quote", WHEEL, "/tools/offset-calculator", "/support/returns"].filter(Boolean);
    out.focusRings = {};
    for (const route of routes) {
      for (const vp of [{ n: "320x568", width: 320, height: 568 }, { n: "1440x900", width: 1440, height: 900 }]) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await ctx.newPage();
        const key = `${route}@${vp.n}`;
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
          await page.waitForTimeout(800);
          const probes = [];
          for (let i = 0; i < 28; i++) {
            await page.keyboard.press("Tab");
            const r = await page.evaluate(RING);
            if (r.none) { probes.push({ none: true }); continue; }
            probes.push(r);
          }
          const withFV = probes.filter((p) => !p.none);
          const missing = withFV.filter((p) => !p.visibleRing);
          out.focusRings[key] = {
            tabbed: withFV.length,
            missingRing: missing.map((m) => `${m.tag}${m.id ? "#" + m.id : ""} "${m.label}" fv=${m.matchesFocusVisible} outline=${m.outline} shadow=${m.shadow}`),
            distinctTargets: new Set(withFV.map((p) => p.tag + "#" + (p.id || "") + ":" + p.label)).size,
          };
          log(`\n=== RINGS ${key} === tabbed=${withFV.length} missing=${missing.length}`);
          missing.slice(0, 10).forEach((m) => log(`   MISSING: ${m.tag}${m.id ? "#" + m.id : ""} "${m.label}" fv=${m.matchesFocusVisible} outline=${m.outline} border=${m.borderTopColor}`));
        } catch (e) {
          out.focusRings[key] = { error: e.message.split("\n")[0] };
        }
        await ctx.close();
      }
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "keyboard-part2-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "keyboard-part2-results.json")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
