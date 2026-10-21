/**
 * P5 a11y audit — keyboard order, focus visibility, Dialog focus trap/restore,
 * mobile nav operability at 320px.
 *
 * Run: node keyboard-scan.mjs --base http://127.0.0.1:3210 --out <dir>
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

/** Describe the currently-focused element in a stable, reviewable way. */
const FOCUS_DESC = `(() => {
  const el = document.activeElement;
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const ring = {
    outlineStyle: cs.outlineStyle,
    outlineWidth: cs.outlineWidth,
    outlineColor: cs.outlineColor,
    outlineOffset: cs.outlineOffset,
    boxShadow: cs.boxShadow === 'none' ? 'none' : cs.boxShadow.slice(0, 120),
    borderColor: cs.borderTopColor,
  };
  const visible =
    (ring.outlineStyle !== 'none' && parseFloat(ring.outlineWidth) > 0) ||
    (ring.boxShadow !== 'none');
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    role: el.getAttribute('role') || null,
    type: el.getAttribute('type') || null,
    name:
      el.getAttribute('aria-label') ||
      (el.labels && el.labels[0] && el.labels[0].textContent || '').trim().slice(0,40) ||
      null,
    text: (el.textContent || '').replace(/\\s+/g,' ').trim().slice(0, 56) || null,
    href: el.getAttribute('href') || null,
    cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 90),
    inHeader: !!el.closest('header'),
    inDialog: !!el.closest('[role="dialog"], dialog'),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    ring,
    focusVisibleStylePresent: visible,
  };
})()`;

async function tabWalk(page, n, label, log_) {
  const seen = [];
  for (let i = 0; i < n; i++) {
    await page.keyboard.press("Tab");
    const d = await page.evaluate(FOCUS_DESC);
    seen.push(d);
    log_.push(`${String(i + 1).padStart(2)}. ${d ? `${d.tag}${d.id ? "#" + d.id : ""}${d.href ? " href=" + d.href : ""} "${(d.text || d.name || "").slice(0, 40)}" ring=${d.focusVisibleStylePresent ? "yes" : "NO"}` : "(none)"}`);
    if (i > 0 && d && seen[i - 1] && JSON.stringify({ t: d.tag, i: d.id, h: d.href, x: d.text }) === JSON.stringify({ t: seen[i - 1].tag, i: seen[i - 1].id, h: seen[i - 1].href, x: seen[i - 1].text })) {
      // looped back or stuck
      log_.push(`   ^ repeated focus target — stopping walk at index ${i}`);
      break;
    }
  }
  return seen;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const report = { generatedAt: new Date().toISOString(), base: BASE, routes: {}, dialog: {}, mobileNav: {} };

  // ── 1 · keyboard tab order on representative templates ────────────────
  const walkTargets = [
    ["/", 30],
    ["/products/wheels", 40],
    ["/request-a-quote", 40],
    ["/insights/bolt-patterns/5x120", 30],
    ["/tools/offset-calculator", 30],
    ["/support/returns", 30],
    ["/insights/bolt-patterns", 30],
  ];

  // resolve a real wheel detail slug
  const probeCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const probe = await probeCtx.newPage();
  await probe.goto(`${BASE}/products/wheels`, { waitUntil: "load", timeout: 90_000 });
  const model = await probe.$$eval("a[href^='/products/wheels/']", (as) =>
    [...new Set(as.map((a) => a.getAttribute("href")))].filter(
      (h) => h && h.split("/").length === 4 && !h.includes("?"),
    )[0] ?? null,
  );
  await probeCtx.close();
  log("[discover] wheel detail:", model);
  if (model) walkTargets.splice(3, 0, [model, 45]);
  report.wheelDetailRoute = model;

  for (const [route, n] of walkTargets) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const lines = [];
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(700);
      // start from the top of the document (before <body> focus)
      await page.evaluate(() => window.scrollTo(0, 0));
      const focused = await tabWalk(page, n, route, lines);
      // first Tab from a fresh document focus: press again if body was focused
      const skipped = focused.filter((f) => !f).length;
      report.routes[route] = {
        steps: focused.length,
        skipped,
        noVisibleRing: focused.filter((f) => f && !f.focusVisibleStylePresent).map((f) => `${f.tag}${f.id ? "#" + f.id : ""} "${(f.text || f.name || "").slice(0, 30)}"`),
        order: focused,
        log: lines,
      };
      log(`\n=== TAB ORDER ${route} (${focused.length} steps) ===`);
      log(lines.join("\n"));
    } catch (e) {
      report.routes[route] = { error: e.message.split("\n")[0] };
      log(`ERR ${route}: ${e.message.split("\n")[0]}`);
    }
    await ctx.close();
  }

  // ── 2 · Dialog: open → tab trap → Escape → focus restore ───────────────
  if (model) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const d = { route: model, steps: [] };
    try {
      await page.goto(`${BASE}${model}`, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(800);
      // find the trigger
      const triggerSel = await page.evaluate(() => {
        const cands = [...document.querySelectorAll("button, a")];
        const t = cands.find((el) =>
          /direct|询盘|直接|Direct/i.test((el.textContent || "") + (el.getAttribute("aria-label") || "")),
        );
        if (!t) return null;
        t.setAttribute("data-p5-trigger", "1");
        return "data-p5-trigger";
      });
      d.triggerSelector = triggerSel;
      log("\n=== DIALOG ===  trigger:", triggerSel);
      if (triggerSel) {
        await page.click(`[${triggerSel}]`);
        await page.waitForTimeout(600);
        const opened = await page.evaluate(() => {
          const dl = document.querySelector('[role="dialog"], dialog[open]');
          return dl ? { present: true, label: dl.getAttribute("aria-label") || dl.getAttribute("aria-labelledby") || null } : { present: false };
        });
        d.opened = opened;
        d.steps.push(`open → dialog present: ${opened.present}`);

        // tab around inside; record whether focus stays inside
        const inside = [];
        for (let i = 0; i < 35; i++) {
          await page.keyboard.press("Tab");
          const f = await page.evaluate(FOCUS_DESC);
          inside.push(f);
        }
        const escaped = inside.filter((f) => f && !f.inDialog);
        d.trap = {
          steps: inside.length,
          escapeCount: escaped.length,
          escapedExamples: escaped.slice(0, 6).map((f) => `${f.tag}${f.id ? "#" + f.id : ""} "${(f.text || f.name || "").slice(0, 40)}" inHeader=${f.inHeader}`),
        };
        d.steps.push(`tab x${inside.length} → ${escaped.length} landed outside dialog`);
        log(`  trap: ${inside.length} tabs, ${escaped.length} escaped`, d.trap.escapedExamples);

        // Escape → closed + focus restored to trigger
        await page.keyboard.press("Escape");
        await page.waitForTimeout(600);
        const after = await page.evaluate(
          (sel) => {
            const dl = document.querySelector('[role="dialog"], dialog[open]');
            const el = document.activeElement;
            const trig = sel ? document.querySelector(`[${sel}]`) : null;
            return {
              dialogStillPresent: !!dl,
              activeTag: el ? el.tagName.toLowerCase() : null,
              activeIsTrigger: !!(trig && el === trig),
              activeDesc: el ? (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50) : null,
            };
          },
          triggerSel,
        );
        d.afterEscape = after;
        d.steps.push(
          `Escape → dialog closed: ${!after.dialogStillPresent}; focus restored to trigger: ${after.activeIsTrigger} (active=${after.activeTag} "${after.activeDesc}")`,
        );
        log("  after Escape:", after);
      }
    } catch (e) {
      d.error = e.message.split("\n")[0];
      log("  ERR:", d.error);
    }
    report.dialog = d;
    await ctx.close();
  }

  // ── 3 · mobile nav at 320px, keyboard only ────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } });
    const page = await ctx.newPage();
    const m = { steps: [] };
    try {
      await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(800);
      // identify the menu button
      const btn = await page.evaluate(() => {
        const cands = [...document.querySelectorAll("button, [role='button']")];
        const b = cands.find((el) => {
          const al = (el.getAttribute("aria-label") || "") + " " + (el.textContent || "");
          const cs = getComputedStyle(el);
          return (
            /menu|菜单|nav/i.test(al) &&
            el.offsetParent !== null &&
            parseFloat(cs.width) > 0
          );
        });
        if (!b) return null;
        b.setAttribute("data-p5-navbtn", "1");
        return {
          label: b.getAttribute("aria-label"),
          text: (b.textContent || "").trim().slice(0, 30),
          expanded: b.getAttribute("aria-expanded"),
          controls: b.getAttribute("aria-controls"),
        };
      });
      m.button = btn;
      log("\n=== MOBILE NAV @320 ===  button:", JSON.stringify(btn));
      if (!btn) {
        m.result = "not-found";
      } else {
        // keyboard-only: focus + Enter
        const beforeLen = await page.evaluate(() => document.body.innerText.length);
        await page.focus("[data-p5-navbtn]");
        m.steps.push("focused trigger via keyboard.focus");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(700);
        const afterOpen = await page.evaluate(() => {
          const b = document.querySelector("[data-p5-navbtn]");
          const panel =
            document.querySelector("[role='dialog']") ||
            document.querySelector(b?.getAttribute("aria-controls") ? "#" + b.getAttribute("aria-controls") : "null") ||
            document.querySelector("nav[data-mobile], div[data-mobile-nav], [data-state='open']");
          const links = panel ? panel.querySelectorAll("a[href]").length : 0;
          return {
            ariaExpanded: b?.getAttribute("aria-expanded"),
            panelPresent: !!panel,
            panelLinks: links,
            bodyTextLen: document.body.innerText.length,
          };
        });
        m.openViaEnter = afterOpen;
        m.steps.push(`Enter → aria-expanded=${afterOpen.ariaExpanded} panel=${afterOpen.panelPresent} links=${afterOpen.panelLinks}`);
        log("  after Enter:", afterOpen);

        // tab into the panel and confirm nav links are reachable
        const reached = [];
        for (let i = 0; i < 25; i++) {
          await page.keyboard.press("Tab");
          const f = await page.evaluate(FOCUS_DESC);
          if (f) reached.push(f);
          if (f && f.tag === "a" && f.href) break;
        }
        const firstLink = reached.find((f) => f.tag === "a" && f.href);
        m.firstReachableLink = firstLink
          ? { href: firstLink.href, text: (firstLink.text || "").slice(0, 40), tabsToReach: reached.indexOf(firstLink) + 1 }
          : null;
        m.steps.push(
          firstLink
            ? `first nav link reachable after ${m.firstReachableLink.tabsToReach} Tab(s): ${firstLink.href}`
            : "first nav link NOT reachable by Tab within 25 presses",
        );
        log("  first nav link:", JSON.stringify(m.firstReachableLink));

        // Escape to close
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
        m.afterEscape = await page.evaluate(() => {
          const b = document.querySelector("[data-p5-navbtn]");
          return { ariaExpanded: b?.getAttribute("aria-expanded"), activeIsButton: document.activeElement === b };
        });
        m.steps.push(`Escape → aria-expanded=${m.afterEscape.ariaExpanded} focusBackOnButton=${m.afterEscape.activeIsButton}`);
        log("  after Escape:", m.afterEscape);
      }
    } catch (e) {
      m.error = e.message.split("\n")[0];
      log("  ERR:", m.error);
    }
    report.mobileNav = m;
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "keyboard-results.json"), JSON.stringify(report, null, 1));
  log(`\n[written] ${path.join(OUT, "keyboard-results.json")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
