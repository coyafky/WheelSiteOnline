/**
 * LCP under Lighthouse-equivalent throttling:
 *  - network: Slow 4G (1.6 Mbps down / 750 Kbps up / 150ms RTT)  [Lighthouse mobile default]
 *  - CPU: 4x slowdown
 * Reports the LCP element + its 4 phases (TTFB, load delay, load duration, render delay)
 * computed from the real resource timing entry behind the LCP element.
 */
const { chromium } = require("playwright");

const URL = process.argv[2] || "http://119.91.205.130:9080/";
const PROFILE = process.argv[3] || "slow4g";   // slow4g | fast3g | none
const CPU = parseFloat(process.argv[4] || "4");

const PROFILES = {
  slow4g: { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 },
  fast3g: { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8 * 1.5, uploadThroughput: (750 * 1024) / 8, latency: 150 },
  none: null,
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  });
  const page = await ctx.newPage();
  const client = await ctx.newCDPSession(page);

  if (PROFILES[PROFILE]) {
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", PROFILES[PROFILE]);
  }
  if (CPU > 1) await client.send("Emulation.setCPUThrottlingRate", { rate: CPU });

  await page.addInitScript(() => {
    window.__lcp = [];
    window.__shifts = [];
    window.__lt = [];
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({ t: e.startTime, rt: e.renderTime, lt: e.loadTime, size: e.size, url: e.url, tag: e.element ? e.element.tagName : null, html: e.element ? e.element.outerHTML.slice(0, 260) : null }); })
        .observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {}
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shifts.push(e.value); }).observe({ type: "layout-shift", buffered: true }); } catch (e) {}
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ name: e.name, start: e.startTime, dur: e.duration }); }).observe({ type: "longtask", buffered: true }); } catch (e) {}
  });

  const t0 = Date.now();
  await page.goto(URL, { waitUntil: "load", timeout: 180000 });
  const wallLoad = Date.now() - t0;
  await page.waitForTimeout(6000);

  const d = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const res = performance.getEntriesByType("resource").map((r) => ({ name: r.name, it: r.initiatorType, start: r.startTime, ttfb: r.responseStart, end: r.responseEnd, dur: r.duration, kb: Math.round((r.transferSize || 0) / 1024) }));
    const paints = {}; for (const p of performance.getEntriesByType("paint")) paints[p.name] = Math.round(p.startTime);
    return { lcp: window.__lcp, cls: window.__shifts.reduce((a, b) => a + b, 0), lt: window.__lt, nav: { ttfb: Math.round(nav.responseStart), dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd) }, paints, res };
  });

  const last = d.lcp[d.lcp.length - 1] || null;
  // find resource behind LCP element
  let res = null;
  if (last && last.url) res = d.res.find((r) => r.name === last.url) || d.res.find((r) => r.name.includes(encodeURIComponent(last.url.split("url=")[1] || "###"))) || null;

  const out = {
    url: URL, profile: PROFILE, cpu: CPU,
    wallLoadMs: wallLoad,
    ttfb: d.nav.ttfb, fcp: d.paints["first-contentful-paint"], lcp: last ? Math.round(last.t) : null,
    lcpElementTag: last ? last.tag : null,
    lcpElementHtml: last ? last.html : null,
    lcpImageResource: res ? { url: res.name.slice(0, 130), start: Math.round(res.start), ttfb: Math.round(res.ttfb), end: Math.round(res.end), dur: Math.round(res.dur), kb: res.kb, it: res.it } : null,
    phases: last && res ? {
      ttfb: Math.round(res.ttfb),
      resourceLoadDelay: Math.round(res.start - res.ttfb),
      resourceLoadDuration: Math.round(res.end - res.start),
      elementRenderDelay: Math.round(last.t - res.end),
    } : null,
    cls: Math.round(d.cls * 1000) / 1000,
    longTasks: d.lt.slice(0, 10).map((x) => ({ name: x.name, start: Math.round(x.start), dur: Math.round(x.dur) })),
    totalLongTaskMs: Math.round(d.lt.reduce((a, b) => a + b.dur, 0)),
    lcpAll: d.lcp.map((x) => ({ t: Math.round(x.t), tag: x.tag, size: x.size, url: (x.url || "").slice(0, 90) })),
    heaviest: d.res.sort((a, b) => b.kb - a.kb).slice(0, 12).map((r) => ({ kb: r.kb, dur: Math.round(r.dur), it: r.it, url: r.name.slice(0, 110) })),
    slowest: d.res.filter((r) => r.dur > 100).sort((a, b) => b.dur - a.dur).slice(0, 12).map((r) => ({ dur: Math.round(r.dur), kb: r.kb, it: r.it, url: r.name.slice(0, 110) })),
  };
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
