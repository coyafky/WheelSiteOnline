/**
 * 只读的 WordPress Page 语言覆盖检查。
 * 用法：node scripts/i18n/audit-page-locales.mjs http://127.0.0.1:8081
 * 只检查内容记录与发布状态；不替代浏览器、法务和工程人工验收。
 */
const origin = process.argv[2];
if (!origin || !/^https?:\/\/[^/]+\/?$/.test(origin)) {
  console.error("用法：node scripts/i18n/audit-page-locales.mjs <WordPress 根地址>");
  process.exit(2);
}

const requiredKeys = ["request-a-quote", "privacy", "thank-you"];
const locales = ["en", "zh", "es", "th"];
const endpoint = new URL("/wp-json/fh/v1/pages", origin);
const response = await fetch(endpoint, { headers: { accept: "application/json" } });
if (!response.ok) throw new Error(`WordPress 返回 HTTP ${response.status}`);
const payload = await response.json();
if (payload.authoritative !== true || !Array.isArray(payload.items)) {
  throw new Error("WordPress Page 响应并非权威集合");
}

const records = new Map(
  payload.items
    .filter((item) => typeof item?.page?.page_key === "string")
    .map((item) => [item.page.page_key, item.page]),
);
const keys = [...new Set([...records.keys(), ...requiredKeys])].sort();
let missing = 0;
console.log("页面键\ten\tzh\tes\tth");
for (const key of keys) {
  const page = records.get(key);
  const statuses = locales.map((locale) => {
    const approved = page?.locale_status?.[locale] === "approved";
    const body = locale === "en" ? page?.content : page?.content_by_locale?.[locale];
    const ready = approved && body && typeof body === "object";
    if (!ready) missing += 1;
    return ready ? "通过" : "缺失/未批准";
  });
  console.log([key, ...statuses].join("\t"));
}
console.log(`记录 ${records.size} 个；未通过的页面×语言 ${missing} 个。`);
if (missing > 0) process.exitCode = 1;
