/**
 * P5 a11y — is `body` after the last dialog control a real tab-escape?
 *
 * Reading so far: 30 Tabs enter the dialog, cycle its 10-12 controls, and at
 * Tab #12 focus lands on `document.body` — i.e. the last control does NOT wrap
 * forward to the first control the way a hand-rolled focus trap would.
 * Everything after that returns into the dialog, so the page behind never
 * receives focus; but "focus left a modal to <body>" is still a finding worth
 * pinning down precisely.
 *
 * This probe answers three things:
 *   A. where the last control's forward-Tab goes
 *   B. whether Shift+Tab from that resting point returns into the dialog
 *   C. whether any control *behind* the dialog can ever receive focus
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

const PROBE = `(() => {
  const dlg = document.querySelector('dialog');
  const anyDlg = document.querySelector('dialog, [role="dialog"], [aria-modal="true"]');
  const el = document.activeElement;
  const trig = document.querySelector('[data-p5-trigger="1"]');
  const focusables = anyDlg ? [...anyDlg.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')].filter(e => e.offsetParent !== null || e === anyDlg) : [];
  const insideOutside = !anyDlg ? 'no-dialog' : (dlg && dlg.contains(el)) ? 'inside-dialog' : 'outside-dialog';
  return {
    anyDialogPresent: !!anyDlg,
    nativeOpen: dlg ? dlg.open : null,
    activeTag: el ? el.tagName.toLowerCase() : null,
    activeId: el ? (el.id || null) : null,
    activeText: el ? (el.textContent || '').replace(/\\s+/g,' ').trim().slice(0,40) : null,
    activeIsBody: el === document.body,
    activeIsHtml: el === document.documentElement,
    activeIsTrigger: el === trig,
    activeOutsideDialog: !!(anyDlg && el && !anyDlg.contains(el)),
    dialogFocusableCount: focusables.length,
    dialogFocusables: focusables.map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ':' + (e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,18)),
  };
})()`;

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const out = { generatedAt: new Date().toISOString(), route: WHEEL, method: "keyboard-only, mark trigger then Enter" };

  await page.goto(`${BASE}${WHEEL}`, { waitUntil: "load", timeout: 90_000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /Request this wheel model/i.test(x.textContent || ""));
    if (b) b.setAttribute("data-p5-trigger", "1");
  });

  // Keyboard-only open (no mouse), which is the mode under test.
  await page.evaluate(() => document.querySelector('[data-p5-trigger="1"]').focus());
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  const opened = await page.evaluate(PROBE);
  out.openedState = opened;
  log("opened:", JSON.stringify({ nativeOpen: opened.nativeOpen, focusables: opened.dialogFocusableCount, active: opened.activeTag + "#" + opened.activeId }));

  // A. Walk all the way forward past the last control, logging each step.
  const fwd = [];
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(PROBE);
    fwd.push({ i: i + 1, tag: s.activeTag, id: s.activeId, text: s.activeText, inDialog: !s.activeOutsideDialog, isBody: s.activeIsBody });
  }
  out.forward = fwd;
  fwd.forEach((s) => log(`  TAB ${String(s.i).padStart(2)} ${s.inDialog ? "in " : "OUT"} ${s.tag}#${s.id} body=${s.isBody} "${s.text}"`));

  const firstBody = fwd.find((s) => s.isBody);
  out.lastControlForwardTab = firstBody ? { afterTab: firstBody.i, landedOn: "document.body" } : { note: "never landed on body" };

  // B. From wherever we are, Shift+Tab — does it come back into the dialog?
  const back = [];
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Shift+Tab");
    const s = await page.evaluate(PROBE);
    back.push({ i: i + 1, tag: s.activeTag, id: s.activeId, text: s.activeText, inDialog: !s.activeOutsideDialog, isBody: s.activeIsBody });
  }
  out.shiftTabFromBody = back;
  out.shiftTabReturnsIntoDialog = back.some((b) => b.inDialog);
  log("  Shift+Tab back:", back.map((b) => `${b.inDialog ? "in" : "OUT"}:${b.tag}#${b.id}`).join(" → "));

  // C. Can any control behind the dialog be reached? Try Shift+Tab many times,
  //    and also try Tab from the body resting point repeatedly.
  const behind = [];
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Shift+Tab");
    const s = await page.evaluate(PROBE);
    if (s.activeOutsideDialog && !s.activeIsBody && !s.activeIsHtml) {
      behind.push({ i: i + 1, tag: s.activeTag, id: s.activeId, text: s.activeText });
    }
  }
  out.reachedBehindDialog = behind;
  out.reachedBehindDialogCount = behind.length;
  log("  reached behind dialog:", behind.length, JSON.stringify(behind.slice(0, 5)));

  // Mouse-click test: does a click on chrome behind the modal reach it?
  out.clickBehindBlocked = await page.evaluate(() => {
    // topmost element at the header's coordinates while the modal is open
    const header = document.querySelector("header a[href], header button");
    if (!header) return null;
    const r = header.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return {
      headerControl: header.tagName.toLowerCase() + " " + (header.textContent || "").trim().slice(0, 24),
      topElementThere: top ? top.tagName.toLowerCase() + "." + ((top.className && typeof top.className === "string" ? top.className : "").slice(0, 60)) : null,
      blocked: !!(top && (top.closest("dialog") || top.tagName === "DIALOG")),
    };
  });
  log("  clickBehindBlocked:", JSON.stringify(out.clickBehindBlocked));

  // Finally: Escape still works from the body resting point
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  const after = await page.evaluate(PROBE);
  out.escapeFromBodyResting = {
    dialogClosed: !after.nativeOpen,
    focusReturnedToTrigger: after.activeIsTrigger,
    active: after.activeTag + "#" + after.activeId,
  };
  log("  escapeFromBodyResting:", JSON.stringify(out.escapeFromBodyResting));

  await browser.close();
  fs.writeFileSync(path.join(OUT, "dialog-wraparound-results.json"), JSON.stringify(out, null, 1));
  log(`\n[written] ${path.join(OUT, "dialog-wraparound-results.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
