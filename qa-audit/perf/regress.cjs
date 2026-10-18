/** Regression sweep: after removing the 3840 deviceSize, confirm no page breaks. */
const { chromium } = require("playwright");
const PAGES = ["/", "/about", "/products/wheels", "/products/wheels/forged",
               "/products/safety-tires", "/products/ev-components", "/capabilities",
               "/contact", "/insights", "/products/wheels/a015"];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
  const page = await ctx.newPage();
  const bad = [];
  page.on("response", r => {
    if (r.url().includes("/_next/image") && r.status() >= 400)
      bad.push({ status:r.status(), url:r.url().slice(0,120) });
  });
  let imgTotal = 0, imgOk = 0;
  page.on("response", r => { if (r.url().includes("/_next/image")) { imgTotal++; if (r.status()<400) imgOk++; } });
  const rows = [];
  for (const path of PAGES) {
    const errs = [];
    const onErr = r => { if (r.url().includes("/_next/image") && r.status()>=400) errs.push({s:r.status(),u:r.url()}); };
    page.on("response", onErr);
    const r = await page.goto("http://127.0.0.1:3000"+path, { waitUntil:"load", timeout:90000 });
    await page.waitForTimeout(2500);
    // scroll to trigger lazy images
    await page.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=1200){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,120)); } });
    await page.waitForTimeout(1500);
    const broken = await page.evaluate(() => [...document.querySelectorAll("img")]
      .map(i=>({src:(i.currentSrc||i.src)}))
      .filter(x=>x.src.includes("/_next/image"))
      .length);
    rows.push({ path, status: r.status(), imgTags: broken, imgErrors: errs.length });
    errs.forEach(e => bad.push({ status:e.s, url:e.u.slice(0,120), path }));
    page.off("response", onErr);
  }
  const brokenImg = await page.evaluate(() => [...document.querySelectorAll("img")]
    .filter(i => /\/_next\/image/.test(i.currentSrc||i.src) && i.complete && i.naturalWidth === 0)
    .map(i => (i.currentSrc||i.src).slice(0,110)));
  await b.close();
  console.log(JSON.stringify({ rows, imageRequests:{total:imgTotal, ok:imgOk}, brokenImageElements: brokenImg, imageErrors: bad.slice(0,20), errorCount: bad.length }, null, 2));
})();
