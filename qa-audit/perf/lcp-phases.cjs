/**
 * Phase-accurate LCP breakdown under Slow 4G, with counterfactuals.
 * Breakdown follows web.dev: docTTFB / resourceLoadDelay / resourceLoadDuration / elementRenderDelay.
 */
const { chromium } = require("playwright");
const URL = "http://119.91.205.130:9080/";

async function run(label, opts = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, deviceScaleFactor: opts.dpr || 2, isMobile: false });
  const page = await ctx.newPage();
  const client = await ctx.newCDPSession(page);
  await client.send("Network.enable");
  if (!opts.noThrottle) await client.send("Network.emulateNetworkConditions", { offline:false, downloadThroughput:(1.6*1024*1024)/8, uploadThroughput:(750*1024)/8, latency:150 });
  if (opts.cpu) await client.send("Emulation.setCPUThrottlingRate", { rate: opts.cpu });

  if (opts.rewriteW) {
    await page.route("**/_next/image**", (r) => {
      const u = r.request().url();
      if (!/%E5%8E%82%E5%8C%BA/.test(u)) return r.continue();
      r.continue({ url: u.replace(/w=\d+/, "w=" + opts.rewriteW) });
    });
  }
  if (opts.abortHero) await page.route("**/_next/image**", (r) => /%E5%8E%82%E5%8C%BA/.test(r.request().url()) ? r.abort() : r.continue());
  if (opts.blockJs) await page.route("**/*.js", (r) => r.abort());

  let heroFetch = null;
  page.on("response", async (r) => {
    if (/%E5%8E%82%E5%8C%BA/.test(r.url())) { try { heroFetch = { kb: Math.round((await r.body()).length/1024), w: (r.url().match(/w=(\d+)/)||[])[1] }; } catch(e){} }
  });

  await page.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({ t:e.startTime, rt:e.renderTime, tag:e.element?e.element.tagName:null, size:e.size, url:e.url||"" }); }).observe({type:"largest-contentful-paint",buffered:true});
  });

  await page.goto(URL, { waitUntil: "load", timeout: 180000 });
  await page.waitForTimeout(6000);

  const d = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const res = performance.getEntriesByType("resource").map(r => ({ name:r.name, start:r.startTime, rs:r.responseStart, re:r.responseEnd, kb:Math.round((r.transferSize||0)/1024), it:r.initiatorType }));
    const paints = {}; for (const p of performance.getEntriesByType("paint")) paints[p.name] = Math.round(p.startTime);
    return { lcp: window.__lcp, nav: { ttfb: nav.responseStart }, paints, res };
  });

  const last = d.lcp[d.lcp.length - 1] || null;
  const img = last && last.url ? d.res.find(r => r.name === last.url) : null;
  const out = {
    label,
    viewport: (opts.viewport || { width:1440, height:900 }).width + "x" + (opts.viewport || {height:900}).height,
    dpr: opts.dpr || 2, cpu: opts.cpu || 1, throttled: !opts.noThrottle,
    heroImageFetched: heroFetch,
    fcp: d.paints["first-contentful-paint"],
    lcpMs: last ? Math.round(last.t) : null,
    lcpTag: last ? last.tag : null,
    lcpArea: last ? last.size : null,
    breakdown: (last && img) ? {
      docTTFB: Math.round(d.nav.ttfb),
      resourceLoadDelay: Math.round(img.start - d.nav.ttfb),
      resourceLoadDuration: Math.round(img.re - img.rs),
      elementRenderDelay: Math.round(last.t - img.re),
    } : null,
    lcpCount: d.lcp.length,
    lcpSequence: d.lcp.map(x => `${Math.round(x.t)}ms ${x.tag} area=${x.size}`),
  };
  await browser.close();
  return out;
}

(async () => {
  const results = [];
  results.push(await run("A · as shipped (w=3840 picked)", { cpu: 4 }));
  results.push(await run("B · hero forced to w=828", { cpu: 4, rewriteW: 828 }));
  results.push(await run("C · hero forced to w=1200", { cpu: 4, rewriteW: 1200 }));
  results.push(await run("D · hero aborted (H1 becomes LCP)", { cpu: 4, abortHero: true }));
  results.push(await run("E · as shipped but NO JS", { cpu: 4, blockJs: true }));
  results.push(await run("F · as shipped, no throttle", { cpu: 1, noThrottle: true }));
  console.log(JSON.stringify(results, null, 2));
})();
