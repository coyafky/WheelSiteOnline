/**
 * LCP decomposition probe.
 * Loads the live site in a real Chromium, records the LCP element + phase
 * breakdown (TTFB / resource load delay / resource load duration / element
 * render delay) using the PerformanceObserver LCP entry's own sub-parts.
 */
const { chromium } = require("playwright");

const URL = process.argv[2] || "http://119.91.205.130:9080/";
const MODE = process.argv[3] || "mobile";

const VIEWPORTS = {
  mobile: { width: 390, height: 844, dpr: 3, mobile: true },
  desktop: { width: 1440, height: 900, dpr: 2, mobile: false },
};

(async () => {
  const vp = VIEWPORTS[MODE];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    userAgent: vp.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  const page = await ctx.newPage();

  const requests = [];
  page.on("request", (r) => requests.push({ url: r.url(), ts: Date.now(), type: r.resourceType() }));
  page.on("response", async (r) => {
    const rec = requests.find((x) => x.url === r.url() && !x.status);
    if (rec) {
      rec.status = r.status();
      rec.respTs = Date.now();
      try { rec.bytes = (await r.body()).length; } catch { rec.bytes = -1; }
    }
  });

  await page.addInitScript(() => {
    window.__lcp = [];
    window.__shifts = [];
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          window.__lcp.push({
            startTime: e.startTime,
            renderTime: e.renderTime,
            loadTime: e.loadTime,
            size: e.size,
            url: e.url,
            element: e.element ? e.element.outerHTML.slice(0, 300) : null,
            tag: e.element ? e.element.tagName : null,
          });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (err) { window.__lcpErr = String(err); }
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shifts.push({ v: e.value, t: e.startTime });
      }).observe({ type: "layout-shift", buffered: true });
    } catch (err) {}
  });

  const t0 = Date.now();
  const nav = await page.goto(URL, { waitUntil: "load", timeout: 90000 });
  const loadMs = Date.now() - t0;

  // Give LCP observer time to settle (LCP stops at first input / end of load+idle)
  await page.waitForTimeout(3500);

  const data = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const res = performance.getEntriesByType("resource").map((r) => ({
      name: r.name, initiatorType: r.initiatorType,
      start: r.startTime, dur: r.duration, size: r.transferSize || 0,
      ttfb: r.responseStart, done: r.responseEnd,
    }));
    const paints = {};
    for (const p of performance.getEntriesByType("paint")) paints[p.name] = p.startTime;
    return {
      lcp: window.__lcp,
      shifts: window.__shifts,
      nav: {
        ttfb: nav.responseStart, domContentLoaded: nav.domContentLoadedEventEnd,
        loadEvent: nav.loadEventEnd, domComplete: nav.domComplete,
      },
      paints,
      res,
    };
  });

  const lcpLast = data.lcp.length ? data.lcp[data.lcp.length - 1] : null;
  const heroImg = data.res.filter((r) => /_next\/image|wp-content/.test(r.name));

  const out = {
    url: URL, mode: MODE, viewport: vp,
    loadWaitMs: loadMs,
    ttfb: Math.round(data.nav.ttfb),
    fcp: Math.round(data.paints["first-contentful-paint"] || -1),
    lcpMs: lcpLast ? Math.round(lcpLast.startTime) : null,
    lcpRenderTime: lcpLast ? Math.round(lcpLast.renderTime) : null,
    lcpElement: lcpLast ? lcpLast.element : null,
    lcpUrl: lcpLast ? lcpLast.url : null,
    lcpEntries: data.lcp.length,
    cls: Math.round(data.shifts.reduce((a, b) => a + b.v, 0) * 1000) / 1000,
    imageRequests: heroImg.map((r) => ({
      url: r.name.slice(0, 160), start: Math.round(r.start), ttfb: Math.round(r.ttfb),
      done: Math.round(r.done), dur: Math.round(r.dur), kb: Math.round(r.size / 1024),
    })),
    blockedBy: [],
    slowestResources: data.res
      .filter((r) => r.dur > 50)
      .sort((a, b) => b.dur - a.dur)
      .slice(0, 15)
      .map((r) => ({ url: r.name.slice(0, 140), type: r.initiatorType, start: Math.round(r.start), dur: Math.round(r.dur), kb: Math.round(r.size / 1024) })),
  };

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
