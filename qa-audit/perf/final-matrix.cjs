/**
 * LOCAL-ONLY decisive matrix. Each scenario changes exactly ONE thing and
 * asserts what the browser actually received, so no number can be an artifact.
 *
 * A  现状 (sizes="100vw")
 * B  sizes -> 60vw   (只改这一处)
 * C  sizes -> 50vw
 * D  sizes -> 40vw
 * E  首图彻底不渲染 (请求失败 -> 组件自带 fallback 接管)
 * F  禁字体（复核那份报告的说法）
 */
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:3000/";
const HERO = /images%2Fhome%2Ffactory/;

async function once(scenario) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  const c = await ctx.newCDPSession(p);
  await c.send("Network.enable");
  await c.send("Network.emulateNetworkConditions",{offline:false,downloadThroughput:(1.6*1024*1024)/8,uploadThroughput:(750*1024)/8,latency:150});
  await c.send("Emulation.setCPUThrottlingRate",{rate:4});

  const proof = { heroReq:0, heroAborted:0, fontsBlocked:0 };

  if (scenario.sizes) {
    await ctx.route(u => u.hostname==="127.0.0.1" && u.pathname==="/", async route => {
      const res = await route.fetch();
      let html = await res.text();
      html = html.replace(/imageSizes="100vw"/g, `imageSizes="${scenario.sizes}"`)
                 .replace(/sizes="100vw"/g, `sizes="${scenario.sizes}"`);
      const h = { ...res.headers() }; delete h["content-encoding"]; delete h["content-length"];
      await route.fulfill({ status:200, headers:h, body:html, contentType:"text/html; charset=utf-8" });
    });
  }
  if (scenario.killHero) await ctx.route("**/_next/image**", r =>
    HERO.test(r.request().url()) ? (proof.heroAborted++, r.abort()) : r.continue());
  if (scenario.noFont) await ctx.route("**/*.woff*", r => { proof.fontsBlocked++; return r.abort(); });
  p.on("requestfinished", r => { if (HERO.test(r.url())) proof.heroReq++; });

  await p.addInitScript(() => { window.__lcp=[];
    new PerformanceObserver(l=>{for(const e of l.getEntries())
      window.__lcp.push({t:e.startTime,tag:e.element?e.element.tagName:null,size:e.size});})
      .observe({type:"largest-contentful-paint",buffered:true}); });

  await p.goto(URL,{waitUntil:"load",timeout:180000});
  await p.waitForTimeout(7000);
  const d = await p.evaluate(() => {
    const paints={}; for(const x of performance.getEntriesByType("paint")) paints[x.name]=Math.round(x.startTime);
    const l = window.__lcp[window.__lcp.length-1] || null;
    const heroImg = [...document.querySelectorAll("img")].find(i=>/factory/.test(i.currentSrc||i.src));
    const rect = heroImg ? heroImg.getBoundingClientRect() : null;
    return {
      lcp: l?Math.round(l.t):null, tag:l?l.tag:null, area:l?l.size:null,
      fcp: paints["first-contentful-paint"],
      imgSizesAttr: heroImg ? heroImg.getAttribute("sizes") : null,
      imgCurrentW: heroImg ? (heroImg.currentSrc.match(/w=(\d+)/)||[])[1] : null,
      imgVisible: rect ? (rect.width>0 && rect.height>0) : false,
    };
  });
  await b.close();
  return { ...d, ...proof };
}

const med = a => a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];

(async () => {
  const scenarios = [
    ["A 现状 (100vw)",       {}],
    ["B sizes=60vw",        { sizes:"(min-width: 1024px) 60vw, 100vw" }],
    ["C sizes=50vw",        { sizes:"(min-width: 1024px) 50vw, 100vw" }],
    ["D sizes=40vw",        { sizes:"(min-width: 1024px) 40vw, 100vw" }],
    ["E 首图不渲染",         { killHero:true }],
    ["F 禁字体",            { noFont:true }],
  ];
  const out = [];
  for (const [label, opts] of scenarios) {
    const runs = [];
    for (let i=0;i<2;i++) runs.push(await once(opts));
    const r = runs[0];
    out.push({
      label,
      lcpMedian: med(runs.map(x=>x.lcp)),
      lcpAll: runs.map(x=>x.lcp),
      lcpTag: r.tag,
      imgW: r.imgCurrentW, imgSizes: r.imgSizesAttr, imgVisible: r.imgVisible,
      heroReq: r.heroReq, heroAborted: r.heroAborted, fontsBlocked: r.fontsBlocked,
    });
  }
  console.log(JSON.stringify(out, null, 2));
})();
