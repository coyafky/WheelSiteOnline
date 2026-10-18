/**
 * For every next/image on the page: compare the DEVICE PIXELS actually needed
 * (rendered CSS width x DPR) against the variant the browser actually fetched.
 * The ratio is the over-fetch factor — the direct measure of wasted bytes.
 */
const { chromium } = require("playwright");
const URL = process.env.TARGET || "http://127.0.0.1:3000/";

(async () => {
  for (const [label, vp, dpr] of [["桌面 1440 DPR2", {width:1440,height:900}, 2], ["移动 390 DPR3", {width:390,height:844}, 3]]) {
    const b = await chromium.launch();
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: dpr===3, hasTouch: dpr===3 });
    const p = await ctx.newPage();
    const bytes = {};
    p.on("response", async r => {
      if (r.url().includes("/_next/image")) { try { bytes[r.url()] = (await r.body()).length; } catch {} }
    });
    await p.goto(URL, { waitUntil:"load", timeout:120000 });
    await p.waitForTimeout(4000);
    const rows = await p.evaluate((dpr) => [...document.querySelectorAll("img")]
      .filter(i => (i.currentSrc||i.src).includes("/_next/image"))
      .map(i => {
        const r = i.getBoundingClientRect();
        const m = (i.currentSrc||i.src).match(/w=(\d+)/);
        return {
          file: decodeURIComponent(((i.currentSrc||i.src).match(/url=([^&]+)/)||[])[1]||"").split("/").slice(-1)[0],
          sizesAttr: i.getAttribute("sizes"),
          cssWidth: Math.round(r.width), cssH: Math.round(r.height),
          needed: Math.round(r.width * dpr),
          fetched: m ? +m[1] : null,
        };
      }), dpr);
    await b.close();
    console.log(`\n=== ${label} ===`);
    console.log(`  ${"文件".padEnd(26)}${"声明的sizes".padEnd(38)}${"渲染宽".padStart(7)}${"需要".padStart(7)}${"实取".padStart(7)}${"倍率".padStart(7)}`);
    for (const r of rows) {
      const ratio = r.fetched && r.needed ? (r.fetched / r.needed) : null;
      console.log(`  ${(r.file||"?").slice(0,25).padEnd(26)}${(r.sizesAttr||"-").slice(0,37).padEnd(38)}${String(r.cssWidth).padStart(7)}${String(r.needed).padStart(7)}${String(r.fetched).padStart(7)}${(ratio?ratio.toFixed(2)+"x":"-").padStart(7)}`);
    }
  }
})();
