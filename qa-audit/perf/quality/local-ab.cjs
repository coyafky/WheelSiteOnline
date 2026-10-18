/**
 * LOCAL A/B: does fetching the 1200 variant instead of 3840 change what the
 * user sees? Same page, same CSS, only the hero variant differs — then diff
 * the RENDERED hero region pixel by pixel.
 */
const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");
const URL = "http://127.0.0.1:3000/";
const OUT = "qa-audit/perf/quality";
fs.mkdirSync(OUT, { recursive: true });

async function shot(sizes, file) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
  const p = await ctx.newPage();
  if (sizes) await ctx.route(u => u.hostname==="127.0.0.1" && u.pathname==="/", async route => {
    const res = await route.fetch(); let html = await res.text();
    html = html.replace(/imageSizes="100vw"/g, `imageSizes="${sizes}"`).replace(/sizes="100vw"/g, `sizes="${sizes}"`);
    const h = { ...res.headers() }; delete h["content-encoding"]; delete h["content-length"];
    await route.fulfill({ status:200, headers:h, body:html, contentType:"text/html; charset=utf-8" });
  });
  await p.goto(URL, { waitUntil:"load", timeout:120000 });
  await p.waitForTimeout(5000);
  await p.evaluate(() => window.scrollTo(0,0));
  await p.screenshot({ path:file, clip:{x:0,y:0,width:1440,height:900} });
  const w = await p.evaluate(() => { const i=[...document.querySelectorAll("img")].find(x=>/factory/.test(x.currentSrc||x.src)); return i?(i.currentSrc.match(/w=(\d+)/)||[])[1]:null; });
  await b.close();
  return w;
}

(async () => {
  const wA = await shot(null, `${OUT}/local-A.png`);
  const wD = await shot("(min-width: 1024px) 40vw, 100vw", `${OUT}/local-D.png`);
  console.log(`  A fetched w=${wA}   D fetched w=${wD}`);

  // Tighter crop: the headline + hero background in the left column,
  // where the image sits directly under the text overlays.
  const R = { left: 0, top: 0, width: 1440, height: 900 };
  const a = await sharp(`${OUT}/local-A.png`).extract(R).raw().toBuffer({ resolveWithObject:true });
  const d = await sharp(`${OUT}/local-D.png`).extract(R).raw().toBuffer({ resolveWithObject:true });
  let sum=0, mx=0, n=0, big=0;
  for (let i=0;i<a.data.length;i+=a.info.channels)
    for (let c=0;c<3;c++){ const v=Math.abs(a.data[i+c]-d.data[i+c]); sum+=v; if(v>mx)mx=v; if(v>8)big++; n++; }
  console.log(`  A(3840) vs D(1200) 渲染差异 → 平均 ${(sum/n).toFixed(3)}/255  最大 ${mx}  差异>8 占比 ${(big/n*100).toFixed(2)}%`);

  // side-by-side of a detail region (headline area = busiest pixels)
  const CROP = { left: 480, top: 120, width: 900, height: 320 };
  const ca = await sharp(`${OUT}/local-A.png`).extract(CROP).png().toBuffer();
  const cd = await sharp(`${OUT}/local-D.png`).extract(CROP).png().toBuffer();
  const bar = t => sharp({create:{width:CROP.width,height:40,channels:3,background:"#111"}})
    .composite([{input:Buffer.from(`<svg width="${CROP.width}" height="40"><text x="10" y="28" font-family="Helvetica" font-size="22" fill="#fff">${t}</text></svg>`),top:0,left:0}]).png().toBuffer();
  await sharp({create:{width:CROP.width,height:CROP.height*2+80,channels:3,background:"#000"}})
    .composite([{input:await bar(`A  w=3840 (197KB)`),top:0,left:0},{input:ca,top:40,left:0},
                {input:await bar(`D  w=1200 (59KB)`),top:CROP.height+40,left:0},{input:cd,top:CROP.height+80,left:0}])
    .png().toFile(`${OUT}/local-A-vs-D.png`);
  console.log(`  并排图: ${OUT}/local-A-vs-D.png`);
})();
