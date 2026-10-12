
import { chromium } from "playwright-core";
const CHROME = process.env.HOME + "/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const b = await chromium.launch({ executablePath: CHROME, args:["--no-sandbox","--disable-gpu"] });
for (const vp of [{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:1440,height:900}]) {
  for (let i=0;i<3;i++) {
    const c = await b.newContext({viewport:vp});
    const p = await c.newPage();
    let st=null, err=null, words=0;
    try { const r = await p.goto("http://127.0.0.1:3210/fitment/bmw-m",{waitUntil:"load",timeout:90000}); st=r.status();
      words = (await p.evaluate(()=>document.body.innerText.length));
    } catch(e){ err=e.message.split("\n")[0]; }
    console.log(vp.width+"x"+vp.height, "try"+(i+1), "status="+st, "textLen="+words, err?("ERR "+err):"");
    await c.close();
  }
}
await b.close();
