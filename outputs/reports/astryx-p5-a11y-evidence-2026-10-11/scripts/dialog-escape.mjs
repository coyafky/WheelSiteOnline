/**
 * P5 a11y — targeted Dialog Escape / focus-return probe.
 *
 * The earlier runs gave contradictory readings (`dialogClosed:false` yet
 * `dialogOpen:true` on a subsequent Enter), so this isolates the question:
 *   Q1  does Escape close the dialog?
 *   Q2  does focus return to the trigger?
 *   Q3  is focus contained while open?
 *
 * Everything is polled over time so an async close animation is not mistaken
 * for "never closed".
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

const STATE = `(() => {
  const dlg = document.querySelector('dialog');
  const anyDlg = document.querySelector('dialog, [role="dialog"], [aria-modal="true"]');
  const el = document.activeElement;
  const trig = document.querySelector('[data-p5-trigger="1"]');
  return {
    nativeDialogPresent: !!dlg,
    nativeOpen: dlg ? dlg.open : null,
    nativeDisplay: dlg ? getComputedStyle(dlg).display : null,
    anyDialogPresent: !!anyDlg,
    ariaModal: anyDlg ? anyDlg.getAttribute('aria-modal') : null,
    activeTag: el ? el.tagName.toLowerCase() : null,
    activeId: el ? (el.id || null) : null,
    activeText: el ? (el.textContent || '').replace(/\\s+/g,' ').trim().slice(0,40) : null,
    activeIsTrigger: el === trig,
    activeIsBody: el === document.body,
    activeInside: !!(anyDlg && el && anyDlg.contains(el)),
  };
})()`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const out = { generatedAt: new Date().toISOString(), route: WHEEL, events: [] };

  await page.goto(`${BASE}${WHEEL}`, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /Request this wheel model/i.test(x.textContent || ""));
    if (b) b.setAttribute("data-p5-trigger", "1");
  });
  const trigInfo = await page.evaluate(() => {
    const t = document.querySelector('[data-p5-trigger="1"]');
    return t ? { text: t.textContent.trim(), html: t.outerHTML.slice(0, 180) } : null;
  });
  out.trigger = trigInfo;
  log("trigger:", JSON.stringify(trigInfo));

  const step = async (name) => {
    const s = await page.evaluate(STATE);
    out.events.push({ name, ...s });
    log(`  ${name}: nativeOpen=${s.nativeOpen} display=${s.nativeDisplay} active=${s.activeTag}#${s.activeId} "${s.activeText}" isTrigger=${s.activeIsTrigger} inside=${s.activeInside}`);
    return s;
  };

  await step("before-open");

  // Open with the mouse (matches a normal visitor) AND note whether that
  // creates the native dialog element.
  await page.click('[data-p5-trigger="1"]');
  await page.waitForTimeout(500);
  await step("after-click-open");

  // Containment: 30 Tabs, count departures from the dialog
  const seq = [];
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(STATE);
    seq.push({ i: i + 1, tag: s.activeTag, id: s.activeId, inside: s.activeInside, isBody: s.activeIsBody, text: (s.activeText || "").slice(0, 26) });
  }
  const departures = seq.filter((s) => !s.inside);
  out.containment = {
    tabs: seq.length,
    departures: departures.length,
    departureDetail: departures,
    distinctInside: new Set(seq.filter((s) => s.inside).map((s) => s.tag + "#" + s.id)).size,
    sequence: seq,
  };
  log("  containment: 30 tabs,", departures.length, "departures,", out.containment.distinctInside, "distinct targets");
  departures.forEach((d) => log(`     TAB ${d.i} → ${d.tag}#${d.id} body=${d.isBody} inside=false`));

  // Escape, polled over 2s to let any close animation settle
  await page.keyboard.press("Escape");
  const timeline = [];
  for (const delay of [0, 50, 150, 300, 600, 1000, 1600]) {
    if (delay) await page.waitForTimeout(delay - (timeline.at(-1)?.t ?? 0));
    timeline.push({ t: delay, ...(await page.evaluate(STATE)) });
  }
  out.escapeTimeline = timeline;
  log("  Escape timeline:");
  timeline.forEach((t) => log(`     +${t.t}ms nativeOpen=${t.nativeOpen} display=${t.nativeDisplay} active=${t.activeTag}#${t.activeId} isTrigger=${t.activeIsTrigger}`));

  const final = timeline.at(-1);
  out.escapeResult = {
    dialogClosed: !final.nativeOpen,
    dialogClosedByDisplay: final.nativeDisplay === "none" || !final.anyDialogPresent,
    focusReturnedToTrigger: final.activeIsTrigger,
    focusLanded: `${final.activeTag}#${final.activeId} "${final.activeText}"`,
    focusIsBody: final.activeIsBody,
  };
  log("  escapeResult:", JSON.stringify(out.escapeResult));

  // Where DID focus go? Climb the tree from the active element for context.
  out.afterEscapeContext = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const chain = [];
    let cur = el;
    for (let i = 0; i < 5 && cur; i++) {
      chain.push(`${cur.tagName.toLowerCase()}${cur.id ? "#" + cur.id : ""}${cur.className && typeof cur.className === 'string' ? "." + cur.className.split(" ").slice(0, 2).join(".") : ""}`);
      cur = cur.parentElement;
    }
    return { chain, outer: el.outerHTML.slice(0, 260) };
  });
  log("  afterEscapeContext:", JSON.stringify(out.afterEscapeContext));

  // Keyboard reopen from the trigger: does focus + Enter still work?
  await page.evaluate(() => document.querySelector('[data-p5-trigger="1"]').focus());
  await step("focus-trigger");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);
  const reopened = await step("after-enter");
  out.reopenWithEnter = { open: !!reopened.nativeOpen, activeInside: reopened.activeInside };

  // Escape again, confirm repeatable
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  const second = await step("after-2nd-escape");
  out.secondEscape = { closed: !second.nativeOpen, focusReturnedToTrigger: second.activeIsTrigger };

  await browser.close();
  fs.writeFileSync(path.join(OUT, "dialog-escape-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "dialog-escape-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
