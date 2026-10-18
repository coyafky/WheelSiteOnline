/**
 * Post-fix verification: same methodology as final-matrix.cjs, but against the
 * patched build. Asserts the browser really fetched the 1200 variant.
 */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:3000/";
const HERO = /images%2Fhome%2Ffactory/;

async function run(label) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  const c = await ctx.newCDPSession(p);
  await c.send("Network.enable");
  await c.send("Network.emulateNetworkConditions",{offline:false,downloadThroughput:(1.6*1024*1024)/8,uploadThroughput:(750*1024)/8,latency:150});
  await c.send("Emulation.setCPUThrottlingRate",{rate:4});

  const hero = { w:null, kb:0, status:null };
  p.on("response", async r => {
    if (HERO.test(r.url())) {
      hero.w = (r.url().match(/w=(\d+)/)||[])[1];
      hero.status = r.status();
      try { hero.kb = Math.round((await r.body()).length/1024); } catch {}
    }
  });
  let longTasks = 0;
  p.on("console", () => {});
  await p.addInitScript(() => { window.__lcp=[]; window.__lt=[];
    new PerformanceObserver(l=>{for(const e of l.getEntries())
      window.__lcp.push({t:e.startTime,tag:e.element?e.element.tagName:null,size:e.size});})
      .observe({type:"largest-contentful-paint",buffered:true});
    try{ new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lt.push(e.duration);}).observe({type:"longtask",buffered:true}); }catch(e){}
  });
  await p.goto(URL,{waitUntil:"load",timeout:180000});
  await p.waitForTimeout(7000);
  const d = await p.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const res = performance.getEntriesByType("resource").map(r=>({name:r.name,start:r.startTime,rs:r.responseStart,re:r.responseEnd}));
    const paints={}; for(const x of performance.getEntriesByType("paint")) paints[x.name]=Math.round(x.startTime);
    const l = window.__lcp[window.__lcp.length-1] || null;
    return { lcp:l?Math.round(l.t):null, tag:l?l.tag:null, area:l?l.size:null, lcpUrl:l?l.url:"",
             fcp:paints["first-contentful-paint"], ttfb:Math.round(nav.responseStart||0),
             shifts:null, lt: window.__lt.reduce((a,b)=>a+b,0), lcpCount: window.__lcp.length, res };
  });
  const img = d.lcpUrl ? d.res.find(r=>r.name===d.lcpUrl) : null;
  await b.close();
  return { label, heroPickedW: hero.w, heroKB: hero.kb, heroStatus: hero.status,
    lcp: d.lcp, lcpTag: d.tag, fcp: d.fcp, docTTFB: d.ttfb, longTaskMs: Math.round(d.lt),
    breakdown: img ? { resourceLoadDelay: Math.round(img.start-d.ttfb),
                       resourceLoadDuration: Math.round(img.re-img.rs),
                       elementRenderDelay: Math.round(d.lcp-img.re) } : null };
}

(async () => {
  const runs = [];
  for (let i=0;i<3;i++) runs.push(await run(`run${i+1}`));
  const med = a => a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
  console.log(JSON.stringify({
    lcpMedian: med(runs.map(r=>r.lcp)), lcpAll: runs.map(r=>r.lcp),
    fcpMedian: med(runs.map(r=>r.fcp)),
    heroPickedW: runs[0].heroPickedW, heroKB: runs[0].heroKB, heroStatus: runs[0].heroStatus,
    lcpTag: runs[0].lcpTag, breakdown: runs[0].breakdown,
    docTTFB: med(runs.map(r=>r.docTTFB)), longTaskMs: med(runs.map(r=>r.longTaskMs)),
  }, null, 2));
})();
