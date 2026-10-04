#!/usr/bin/env node
/**
 * 把生产目录 JSON 生成类型化的内容模块。
 *
 *   输入：assets/wheel-data/WHEEL-CATALOG-ALL.json   （只读，禁止手改）
 *   输出：src/content/wheel-catalogue.ts             （生成物，禁止手改）
 *
 * 用法：
 *   node scripts/generate-wheel-catalogue.mjs            # 生成
 *   node scripts/generate-wheel-catalogue.mjs --check    # 只校验不写入（CI 用）
 *
 * 设计纪律（见 ARCHITECTURE/page-architecture/wheel-catalog-page.md）：
 *   1. 只做归一化与补全，**绝不推断**。「看起来像旋压」不是数据，是猜测。
 *   2. 缺数据要显式暴露（`undefined`），不得静默丢弃，也不得填占位词。
 *   3. 上架门槛：无图型号保留数据但 `hasImage: false`，由 UI 层决定不生成页面。
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "assets/wheel-data/WHEEL-CATALOG-ALL.json");
const IMAGE_DIR = join(ROOT, "assets/wheel-images-webp");
const OUTPUT = join(ROOT, "src/content/wheel-catalogue.ts");
const PUBLIC_IMAGE_BASE = "/images/wheels";

/** 合法的孔数。非白名单的 PCD 首段是脏数据（实测存在 "120孔"）。 */
const LUG_WHITELIST = new Set([4, 5, 6, 8, 10]);

/** 已知的制造工艺。源数据里出现其它值时按未标注处理，不臆造。 */
const KNOWN_PROCESSES = new Set(["旋压", "低压", "低压+旋压", "锻造"]);

/**
 * 归一化尺寸归类。
 * 源数据混有分册名（"17寸-3"、"18寸-2"、"19寸-2"）与 "HP轮毂"，
 * 这些都不是真实尺寸，必须剥离成尺寸 + 独立的款式标记。
 */
function normalizeSizeCategory(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (value.startsWith("越野")) return "越野款";
  if (/^HP/i.test(value)) return "HP";
  // "17寸-3" → "17寸"
  const match = value.match(/^(\d{2})寸/);
  return match ? `${match[1]}寸` : value;
}

/** 从 PCD 字符串派生孔数。非白名单返回 null —— 不猜。 */
function deriveLugCount(pcd) {
  const head = String(pcd ?? "").split("*")[0].trim();
  if (!/^\d+$/.test(head)) return null;
  const lug = Number(head);
  return LUG_WHITELIST.has(lug) ? lug : null;
}

/**
 * 图片文件名 → 产品代码。
 * 规则：`<尺寸前缀>-<产品代码>[-<序号>].webp`，剥掉前缀与末尾序号后小写归一化。
 * 见 DEC-012。
 */
function imageFileToModelCode(fileName) {
  return fileName
    .replace(/\.webp$/i, "")
    .replace(/^(\d+|off-road|off|hp)-\d*-?/i, "")
    .replace(/-\d+$/, "")
    .toLowerCase();
}

/** 建立「产品代码 → 图片文件名数组」索引（按文件名自然排序，保证确定性）。 */
function buildImageIndex() {
  const index = new Map();
  let files = [];
  try {
    files = readdirSync(IMAGE_DIR).filter((f) => /\.webp$/i.test(f));
  } catch {
    console.warn(
      `⚠️  找不到图片目录 ${IMAGE_DIR} —— 所有型号将标记为无图（不上架）。`
    );
    return index;
  }
  for (const file of files.sort()) {
    const code = imageFileToModelCode(file);
    if (!code) continue;
    const bucket = index.get(code);
    if (bucket) bucket.push(file);
    else index.set(code, [file]);
  }
  return index;
}

/** 从 `styleName` 派生车系线索。**仅为目录标注，不是车辆出厂规格。** */
const VEHICLE_KEYWORDS = [
  "坦克",
  "BJ40",
  "北京212",
  "牧马人",
  "方程豹",
  "丰田",
  "霸道",
  "途乐",
  "奔驰",
  "宝马",
  "奥迪",
  "福特",
  "猛禽",
  "哈佛",
  "哈弗",
  "本田",
  "雷克萨斯",
  "特斯拉",
  "长城炮",
  "五菱",
  "大众",
];

function deriveVehicleHints(styleName) {
  if (!styleName) return [];
  return VEHICLE_KEYWORDS.filter((kw) => styleName.includes(kw));
}

function uniqSorted(values) {
  return [...new Set(values)].sort();
}

function buildModel(raw, imageIndex) {
  const model = String(raw.model ?? "").trim();
  const code = model.toLowerCase();

  const sizeCategory = normalizeSizeCategory(raw.sizeCategory);
  const styleName = raw.styleName ? String(raw.styleName).trim() : undefined;

  let process;
  if (raw.process && KNOWN_PROCESSES.has(raw.process)) process = raw.process;

  const variants = (raw.variants ?? []).map((v) => ({
    productionCode: String(v.productionCode ?? ""),
    size: String(v.size ?? ""),
    pcd: String(v.pcd ?? ""),
    offset: typeof v.offset === "number" ? v.offset : Number(v.offset),
    centerBore:
      typeof v.centerBore === "number" ? v.centerBore : Number(v.centerBore),
    finish: String(v.finish ?? ""),
  }));

  // 只保留合法孔距的配置解析路径（此处仅用于统计，不写进产物）。
  variants.forEach((v) => deriveLugCount(v.pcd));

  const imageFiles = imageIndex.get(code) ?? [];

  return {
    model,
    sizeCategory,
    sizes: uniqSorted(raw.sizes ?? []),
    pcds: uniqSorted(raw.pcds ?? []),
    offsets: [...new Set(raw.offsets ?? [])].sort((a, b) => a - b),
    centerBores: [...new Set(raw.centerBores ?? [])].sort((a, b) => a - b),
    finishes: uniqSorted(raw.finishes ?? []),
    variants,
    styleName,
    process,
    vehicleHints: deriveVehicleHints(styleName),
    hasImage: imageFiles.length > 0,
    images: imageFiles.map((f) => `${PUBLIC_IMAGE_BASE}/${f}`),
  };
}

function renderModule(catalogue) {
  const { models, stats, generatedAt } = catalogue;
  const withoutImage = models.filter((m) => !m.hasImage);

  return `/**
 * 轮毂生产目录 —— 自动生成，禁止手改。
 *
 * 生成命令：node scripts/generate-wheel-catalogue.mjs
 * 数据源：  assets/wheel-data/WHEEL-CATALOG-ALL.json
 * 生成时间：${generatedAt}
 *
 * 统计：${stats.total} 型号（上架 ${stats.withImage} / 未上架 ${stats.withoutImage}）
 *      ${stats.variants} 个可下单配置
 *
 * ⚠️ 手改会在下次生成时被覆盖。要改数据，改源 JSON 或改生成脚本。
 */

import type { WheelCatalogue, WheelModel } from "./types";

/** 全部型号（含无图未上架的）。声明在引用之前，避免 TDZ 编译错误。 */
const allModels: WheelModel[] = ${JSON.stringify(models, null, 2)};

/** 全部型号（含无图未上架的）。 */
export const wheelCatalogue: WheelCatalogue = {
  generatedAt: ${JSON.stringify(generatedAt)},
  sourceFile: "assets/wheel-data/WHEEL-CATALOG-ALL.json",
  models: allModels,
  stats: {
    total: ${stats.total},
    withImage: ${stats.withImage},
    withoutImage: ${stats.withoutImage},
    variants: ${stats.variants},
  },
};

/**
 * ★ 上架型号 —— **只有这些可以生成页面、进目录、进 sitemap**。
 * 无图型号不在此列（DEC-013 上架门槛）。
 */
export const publishedWheelModels: WheelModel[] = allModels.filter(
  (m) => m.hasImage
);

/** 按型号代码（小写）查单个型号。 */
export const wheelModelByCode: ReadonlyMap<string, WheelModel> = new Map(
  allModels.map((m) => [m.model.toLowerCase(), m])
);

${withoutImage.length > 0 ? `/** 无图、暂不上架的型号代码（保留用于追溯与将来放开）。 */\nexport const unpublishedWheelModelCodes: string[] = ${JSON.stringify(withoutImage.map((m) => m.model), null, 2)};\n` : ""}`;
}

function main() {
  const checkOnly = process.argv.includes("--check");

  let raw;
  try {
    raw = JSON.parse(readFileSync(SOURCE, "utf8"));
  } catch (err) {
    console.error(`✖ 读不到数据源：${SOURCE}\n  ${err.message}`);
    process.exit(1);
  }

  const rawModels = Array.isArray(raw.models) ? raw.models : [];
  if (rawModels.length === 0) {
    console.error("✖ 数据源里没有 models 数组，格式可能变了。");
    process.exit(1);
  }

  const imageIndex = buildImageIndex();
  const models = rawModels.map((m) => buildModel(m, imageIndex));

  const stats = {
    total: models.length,
    withImage: models.filter((m) => m.hasImage).length,
    withoutImage: models.filter((m) => !m.hasImage).length,
    variants: models.reduce((sum, m) => sum + m.variants.length, 0),
  };

  // ---- 自检：按源数量反查产物，不信任自己累加的计数器 ----
  const problems = [];
  if (stats.withImage + stats.withoutImage !== stats.total) {
    problems.push("上架数 + 未上架数 ≠ 总数");
  }
  if (stats.total !== rawModels.length) {
    problems.push(`产物型号数 ${stats.total} ≠ 源型号数 ${rawModels.length}`);
  }
  const emptyModel = models.filter((m) => !m.model).length;
  if (emptyModel > 0) problems.push(`${emptyModel} 个型号缺少 model 代码`);
  const badVariant = models.reduce(
    (n, m) =>
      n +
      m.variants.filter(
        (v) => !v.productionCode || Number.isNaN(v.offset) || Number.isNaN(v.centerBore)
      ).length,
    0
  );
  if (badVariant > 0) problems.push(`${badVariant} 个配置字段不完整`);

  console.log("── 轮毂目录生成 ──");
  console.log(`  型号总数    ${stats.total}`);
  console.log(`  上架（有图）${stats.withImage}`);
  console.log(`  未上架      ${stats.withoutImage}`);
  console.log(`  可下单配置  ${stats.variants}`);
  console.log(`  图片索引    ${imageIndex.size} 个产品代码`);

  const withStyle = models.filter((m) => m.styleName).length;
  const withProcess = models.filter((m) => m.process).length;
  const withHints = models.filter((m) => m.vehicleHints.length > 0).length;
  console.log(
    `  字段覆盖    styleName ${withStyle} ｜ process ${withProcess} ｜ 车系线索 ${withHints}`
  );

  if (problems.length > 0) {
    console.error("\n✖ 自检未通过：");
    problems.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }
  console.log("  ✓ 自检通过");

  if (checkOnly) {
    console.log("\n--check 模式：未写入文件。");
    return;
  }

  const catalogue = {
    models,
    stats,
    generatedAt: new Date().toISOString(),
  };

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, renderModule(catalogue), "utf8");
  console.log(`\n✔ 已写入 ${OUTPUT.replace(`${ROOT}/`, "")}`);
}

main();
