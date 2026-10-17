#!/usr/bin/env node
/**
 * PHP ⇄ TypeScript contract parity check.
 *
 * Three constants are transcribed by hand on both sides of the headless
 * boundary. Nothing else in the toolchain compares them, so a one-sided edit
 * silently changes behaviour: the CMS would accept a module the front end cannot
 * render, or pin a card image the front end no longer ships.
 *
 *   FH_HOME_MODULES              <-> CMS_MODULES
 *   FH_HOME_PRODUCT_LINE_FACTS   <-> productLines image/href
 *   FH_PAGE_LOCALES              <-> LOCALES
 *
 * Fails (exit 1) on any mismatch, and prints both sides so the fix is obvious.
 */
import { readFileSync } from "node:fs";

const PHP_PAGES = "local-wp/mu-plugins/fenghuai-pages.php";
const TS_PAGE_VIEW = "src/content/page-view.ts";
const TS_PRODUCT_LINES = "src/content/product-lines.ts";
const TS_I18N_TYPES = "src/lib/i18n/types.ts";

const failures = [];
const checks = [];

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    failures.push(`无法读取 ${path}: ${error instanceof Error ? error.message : error}`);
    return "";
  }
}

/** `'H01' => ['type' => 'hero', ...]` -> { H01: "hero" } */
function parsePhpModuleMap(source) {
  const block = source.match(/const FH_HOME_MODULES = \[([\s\S]*?)\n\];/);
  if (!block) return null;
  const map = {};
  for (const line of block[1].split("\n")) {
    const m = line.match(/'([^']+)'\s*=>\s*\[[^\]]*'type'\s*=>\s*'([^']+)'/);
    if (m) map[m[1]] = m[2];
  }
  return Object.keys(map).length ? map : null;
}

/** `const CMS_MODULES = { H01: "hero", ... } as const;` -> { H01: "hero" } */
function parseTsModuleMap(source) {
  const block = source.match(/const CMS_MODULES = \{([\s\S]*?)\}\s*as const;/);
  if (!block) return null;
  const map = {};
  for (const line of block[1].split("\n")) {
    const m = line.match(/([A-Za-z0-9_]+)\s*:\s*"([^"]+)"/);
    if (m) map[m[1]] = m[2];
  }
  return Object.keys(map).length ? map : null;
}

function compare(key, phpValue, tsValue, label) {
  const php = JSON.stringify(phpValue, Object.keys(phpValue ?? {}).sort());
  const ts = JSON.stringify(tsValue, Object.keys(tsValue ?? {}).sort());
  const ok = php === ts;
  checks.push({ key, ok, php, ts, label });
  if (!ok) failures.push(`${label}（${key}）两侧不一致`);
  return ok;
}

// ── 1. 首页模块 id → type ────────────────────────────────────────────────────
{
  const phpSource = read(PHP_PAGES);
  const tsSource = read(TS_PAGE_VIEW);
  const phpModules = parsePhpModuleMap(phpSource);
  const tsModules = parseTsModuleMap(tsSource);

  if (!phpModules) failures.push(`无法从 ${PHP_PAGES} 解析 FH_HOME_MODULES`);
  if (!tsModules) failures.push(`无法从 ${TS_PAGE_VIEW} 解析 CMS_MODULES`);
  if (phpModules && tsModules) {
    compare("FH_HOME_MODULES", phpModules, tsModules, "首页模块 id → type 映射");
  }
}

// ── 2. 产品线卡片事实（image / href）──────────────────────────────────────────
{
  const phpSource = read(PHP_PAGES);
  const tsSource = read(TS_PRODUCT_LINES);

  const block = phpSource.match(/const FH_HOME_PRODUCT_LINE_FACTS = \[([\s\S]*?)\n\];/);
  const phpFacts = {};
  if (block) {
    for (const line of block[1].split("\n")) {
      const m = line.match(
        /'([^']+)'\s*=>\s*\[\s*'image'\s*=>\s*'([^']+)'\s*,\s*'href'\s*=>\s*'([^']+)'/,
      );
      if (m) phpFacts[m[1]] = { image: m[2], href: m[3] };
    }
  } else {
    failures.push(`无法从 ${PHP_PAGES} 解析 FH_HOME_PRODUCT_LINE_FACTS`);
  }

  // productLines: 每个条目形如 slug: "wheels" ... image: "..." ... href: "..."
  const tsFacts = {};
  const entryRe = /slug:\s*"([^"]+)"[\s\S]*?image:\s*"([^"]+)"[\s\S]*?href:\s*"([^"]+)"/g;
  let match;
  while ((match = entryRe.exec(tsSource)) !== null) {
    const [, slug, image, href] = match;
    // 只比较 PHP 侧声明过的四条产品线所属事实
    if (slug in phpFacts || Object.keys(phpFacts).length) {
      tsFacts[slug] = { image, href };
    }
  }

  const onlyPhp = Object.keys(phpFacts).filter((k) => !(k in tsFacts));
  if (Object.keys(phpFacts).length && onlyPhp.length) {
    failures.push(
      `产品线卡片事实：PHP 声明了但 TS 未找到 -> ${onlyPhp.join(", ")}`,
    );
  }
  for (const key of Object.keys(phpFacts)) {
    if (key in tsFacts) compare(`PRODUCT_LINE_FACTS:${key}`, phpFacts[key], tsFacts[key], `产品线「${key}」卡片事实`);
  }
}

// ── 3. 语言清单 ──────────────────────────────────────────────────────────────
{
  const phpSource = read(PHP_PAGES);
  const tsSource = read(TS_I18N_TYPES);

  const phpBlock = phpSource.match(/const FH_PAGE_LOCALES = \[([^\]]*)\]/);
  const phpLocales = phpBlock
    ? [...phpBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort()
    : null;

  const tsBlock = tsSource.match(/export const LOCALES = \[([^\]]*)\]/);
  const tsLocales = tsBlock
    ? [...tsBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort()
    : null;

  if (!phpLocales) failures.push(`无法从 ${PHP_PAGES} 解析 FH_PAGE_LOCALES`);
  if (!tsLocales) failures.push(`无法从 ${TS_I18N_TYPES} 解析 LOCALES`);
  if (phpLocales && tsLocales) {
    compare("FH_PAGE_LOCALES", phpLocales, tsLocales, "支持的语言清单");
  }
}

// ── 输出 ─────────────────────────────────────────────────────────────────────
const pass = checks.filter((c) => c.ok).length;
if (failures.length === 0) {
  console.log(`✔ 契约一致（${pass} 项检查全部通过）`);
  process.exit(0);
}

console.error(`✖ 契约不一致：${failures.length} 项`);
for (const item of failures) console.error(`   - ${item}`);
console.error("");
for (const c of checks) {
  console.error(`  ${c.ok ? "✔" : "✖"} ${c.label}`);
  if (!c.ok) {
    console.error(`      PHP: ${c.php}`);
    console.error(`      TS : ${c.ts}`);
  }
}
process.exit(1);
