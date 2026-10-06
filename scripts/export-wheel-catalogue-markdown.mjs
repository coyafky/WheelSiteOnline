#!/usr/bin/env node

/**
 * 把轮毂事实目录导出为按实际直径分类的 Markdown 审核底稿。
 *
 * 输入：assets/wheel-data/ 下组成总表的 17 份尺寸目录（只读）
 * 对账：assets/wheel-data/WHEEL-CATALOG-ALL.json
 * 输出：outputs/exports/wheel-catalogue-by-size.md
 *
 * 纪律：
 * - 不自动合并重复 model；
 * - 不把“有图”写成“已批准”；
 * - 不跨 variant 拼规格；
 * - styleName 原样保留并明确标成内部来源字段；
 * - 每条 variant 只进入与自身 size 对应的直径章节。
 */

import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "assets/wheel-data");
const IMAGE_DIR = join(ROOT, "assets/wheel-images-webp");
const ALL_SOURCE = join(DATA_DIR, "WHEEL-CATALOG-ALL.json");
const OUTPUT = join(ROOT, "outputs/exports/wheel-catalogue-by-size.md");

const EXCLUDED_CATALOGUES = new Set([
  "WHEEL-CATALOG-ALL.json",
  // 该库存表的 29 型号 / 255 variant 不属于当前 1349 / 3485 正本。
  "HP-WHEEL-CATALOG.json",
]);

const SOURCE_FILES = readdirSync(DATA_DIR)
  .filter(
    (file) =>
      file.endsWith("-WHEEL-CATALOG.json") &&
      !EXCLUDED_CATALOGUES.has(file),
  )
  .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }));

const SIZE_PATTERN = /^(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)$/;
const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CANONICAL_PCD_PATTERN = /^(4|5|6|8|10)\*[0-9]+(?:\.[0-9]+)?$/;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sourceCatalogueKey(file) {
  return file.replace(/-WHEEL-CATALOG\.json$/u, "");
}

function sourceKey(file, model) {
  return `${sourceCatalogueKey(file)}:${String(model).trim().toLowerCase()}`;
}

function variantKey(record, variant) {
  return `${record.sourceKey}:${String(variant.productionCode).trim()}`;
}

function comparableRecord(record) {
  const { sizeCategory: _ignored, ...rest } = record;
  return JSON.stringify(rest);
}

function imageFileToModelCode(fileName) {
  return fileName
    .replace(/\.webp$/iu, "")
    .replace(/^(\d+|off-road|off|hp)-\d*-?/iu, "")
    .replace(/-\d+$/u, "")
    .toLowerCase();
}

function buildImageIndex() {
  const index = new Map();
  for (const file of readdirSync(IMAGE_DIR)
    .filter((item) => item.endsWith(".webp"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
    const code = imageFileToModelCode(file);
    const bucket = index.get(code) ?? [];
    bucket.push(`/images/wheels/${file}`);
    index.set(code, bucket);
  }
  return index;
}

function md(value) {
  if (value === undefined || value === null || value === "") return "—";
  return String(value)
    .replace(/\|/gu, "\\|")
    .replace(/\r?\n/gu, " / ")
    .trim();
}

function code(value) {
  if (value === undefined || value === null || value === "") return "—";
  return `\`${String(value).replace(/`/gu, "\\`")}\``;
}

function anchorForDiameter(diameter) {
  return `diameter-${String(diameter).replace(/\./gu, "-")}`;
}

const canonical = readJson(ALL_SOURCE);
const records = [];

for (const file of SOURCE_FILES) {
  const document = readJson(join(DATA_DIR, file));
  const catalogueKey = sourceCatalogueKey(file);
  const sourceDocument = document.metadata?.sourceDocument ?? file;

  for (const model of document.models ?? []) {
    records.push({
      ...model,
      sourceFile: file,
      sourceDocument,
      catalogueKey,
      sourceKey: sourceKey(file, model.model),
    });
  }
}

// 对账 17 份来源与总表。忽略总表追加的 sizeCategory，其余必须逐条一致。
const canonicalCounts = new Map();
for (const item of canonical.models ?? []) {
  const key = comparableRecord(item);
  canonicalCounts.set(key, (canonicalCounts.get(key) ?? 0) + 1);
}
for (const record of records) {
  const key = comparableRecord(record);
  const count = canonicalCounts.get(key) ?? 0;
  if (count === 0) {
    throw new Error(`来源记录无法在总表中对账：${record.sourceKey}`);
  }
  canonicalCounts.set(key, count - 1);
}
const unmatchedCanonical = [...canonicalCounts.values()].reduce(
  (sum, count) => sum + count,
  0,
);
if (unmatchedCanonical !== 0) {
  throw new Error(`总表仍有 ${unmatchedCanonical} 条记录未匹配到17份来源目录`);
}

const imageIndex = buildImageIndex();
const modelGroups = new Map();
const productionCodeGroups = new Map();

for (const record of records) {
  const modelCode = String(record.model).trim().toLowerCase();
  const modelBucket = modelGroups.get(modelCode) ?? [];
  modelBucket.push(record);
  modelGroups.set(modelCode, modelBucket);

  for (const variant of record.variants ?? []) {
    const productionCode = String(variant.productionCode).trim();
    const variantBucket = productionCodeGroups.get(productionCode) ?? [];
    variantBucket.push({ record, variant });
    productionCodeGroups.set(productionCode, variantBucket);
  }
}

const duplicateModelGroups = [...modelGroups.entries()].filter(
  ([, group]) => group.length > 1,
);
const duplicateProductionCodeGroups = [...productionCodeGroups.entries()].filter(
  ([, group]) => group.length > 1,
);

const styleConflictModels = duplicateModelGroups.filter(([, group]) => {
  const values = new Set(group.map((item) => item.styleName).filter(Boolean));
  return values.size > 1;
});
const processConflictModels = duplicateModelGroups.filter(([, group]) => {
  const values = new Set(group.map((item) => item.process).filter(Boolean));
  return values.size > 1;
});

const diameterGroups = new Map();
const invalidSizeRows = [];
const nonCanonicalPcdRows = [];
let variantCount = 0;

for (const record of records) {
  for (const variant of record.variants ?? []) {
    variantCount += 1;
    const parsed = String(variant.size).trim().match(SIZE_PATTERN);
    if (!parsed) {
      invalidSizeRows.push({ record, variant });
      continue;
    }

    if (!CANONICAL_PCD_PATTERN.test(String(variant.pcd).trim())) {
      nonCanonicalPcdRows.push({ record, variant });
    }

    const diameter = Number(parsed[1]);
    const bucket = diameterGroups.get(diameter) ?? [];
    bucket.push({ record, variant, width: Number(parsed[2]) });
    diameterGroups.set(diameter, bucket);
  }
}

if (records.length !== canonical.metadata.models || variantCount !== canonical.metadata.variants) {
  throw new Error(
    `数量对账失败：记录 ${records.length}/${canonical.metadata.models}，variant ${variantCount}/${canonical.metadata.variants}`,
  );
}

const imageMatchedRecords = records.filter(
  (record) => (imageIndex.get(String(record.model).trim().toLowerCase()) ?? []).length > 0,
);
const unsafeSlugRecords = records.filter(
  (record) => !SAFE_SLUG_PATTERN.test(String(record.model).trim().toLowerCase()),
);
const processCounts = new Map();
for (const record of records) {
  const value = record.process || "未标注";
  processCounts.set(value, (processCounts.get(value) ?? 0) + 1);
}

const lines = [];
const push = (...items) => lines.push(...items);

push(
  "# 轮毂完整数据清洗稿（按实际尺寸分类）",
  "",
  `- 生成日期：2026-10-06`,
  `- 数据范围：${records.length} 条源记录 / ${variantCount} 条 variant / ${SOURCE_FILES.length} 份来源目录`,
  `- 来源正本：\`assets/wheel-data/WHEEL-CATALOG-ALL.json\`，并与17份组成目录逐条对账`,
  `- 图片候选：\`assets/wheel-images-webp\`，共 ${readdirSync(IMAGE_DIR).filter((item) => item.endsWith(".webp")).length} 个 WebP 文件`,
  "- 用途：内部数据审核、首发型号选择、WordPress 发布录入和公开目录开发底稿",
  "",
  "> 本文档不是公开产品目录。`有图片候选` 不等于图权、供货、规格或发布已批准；原始 `styleName` 可能包含第三方名称，只用于内部溯源。重复型号不会在本文档中自动合并。",
  "",
  "## 1. 清洗规则",
  "",
  "1. 使用每条 variant 自身的 `size` 判断直径，不使用来源文件名推断实际尺寸。",
  "2. 多尺寸源记录会分别出现在对应直径章节，但每条 variant 只出现一次。",
  "3. 以 `来源目录:model` 形成 `sourceKey`；以 `sourceKey:productionCode` 形成 `variantKey`。",
  "4. `model` 与 `productionCode` 的重复项只标记，不自动合并或删除。",
  "5. PCD 中带逗号的双孔距/多孔距值原样保留并标成“复合PCD待审核”。",
  "6. 图片只按现有文件名规则列为候选，不代表图片归属或对外使用权已通过。",
  "",
  "## 2. 总体统计",
  "",
  "| 指标 | 数量 |",
  "|---|---:|",
  `| 源记录 | ${records.length} |`,
  `| 大小写归一化后的型号代码 | ${modelGroups.size} |`,
  `| variant | ${variantCount} |`,
  `| 有图片候选的源记录 | ${imageMatchedRecords.length} |`,
  `| 没有匹配图片的源记录 | ${records.length - imageMatchedRecords.length} |`,
  `| 重复型号代码组 | ${duplicateModelGroups.length} |`,
  `| 重复 productionCode 组 | ${duplicateProductionCodeGroups.length} |`,
  `| styleName 冲突组 | ${styleConflictModels.length} |`,
  `| process 冲突组 | ${processConflictModels.length} |`,
  `| 不适合直接作为 URL 的型号记录 | ${unsafeSlugRecords.length} |`,
  `| 非标准/复合 PCD variant | ${nonCanonicalPcdRows.length} |`,
  `| 无法解析尺寸的 variant | ${invalidSizeRows.length} |`,
  "",
  "### 2.1 工艺字段覆盖",
  "",
  "| 工艺原值 | 源记录数 |",
  "|---|---:|",
);

for (const [process, count] of [...processCounts.entries()].sort((a, b) =>
  a[0].localeCompare(b[0], "zh-CN"),
)) {
  push(`| ${md(process)} | ${count} |`);
}

push("", "### 2.2 实际直径分布", "", "| 直径 | variant | 涉及源记录 | 宽度 |", "|---:|---:|---:|---|");
for (const [diameter, entries] of [...diameterGroups.entries()].sort(
  (a, b) => a[0] - b[0],
)) {
  const recordKeys = new Set(entries.map((item) => item.record.sourceKey));
  const widths = [...new Set(entries.map((item) => item.width))].sort((a, b) => a - b);
  push(
    `| [${diameter}英寸](#${anchorForDiameter(diameter)}) | ${entries.length} | ${recordKeys.size} | ${widths.join(" / ")} |`,
  );
}

push(
  "",
  "## 3. 重复与异常索引",
  "",
  "### 3.1 重复型号代码",
  "",
  "| model | 源记录数 | sourceKey | styleName 原值 | process 原值 |",
  "|---|---:|---|---|---|",
);
for (const [model, group] of duplicateModelGroups.sort((a, b) =>
  a[0].localeCompare(b[0], "en", { numeric: true }),
)) {
  push(
    `| ${code(model)} | ${group.length} | ${group.map((item) => code(item.sourceKey)).join("<br>")} | ${group.map((item) => md(item.styleName)).join("<br>")} | ${group.map((item) => md(item.process)).join("<br>")} |`,
  );
}

push(
  "",
  "### 3.2 重复 productionCode",
  "",
  "| productionCode | 出现次数 | variantKey |",
  "|---|---:|---|",
);
for (const [productionCode, group] of duplicateProductionCodeGroups.sort((a, b) =>
  a[0].localeCompare(b[0], "en", { numeric: true }),
)) {
  push(
    `| ${code(productionCode)} | ${group.length} | ${group.map(({ record, variant }) => code(variantKey(record, variant))).join("<br>")} |`,
  );
}

push(
  "",
  "### 3.3 特殊字符型号",
  "",
  "| model 原值 | sourceKey | 处理建议 |",
  "|---|---|---|",
);
for (const record of unsafeSlugRecords) {
  push(
    `| ${code(record.model)} | ${code(record.sourceKey)} | 发布时分配独立且稳定的 publicSlug，不直接清洗覆盖原值 |`,
  );
}

push("", "## 4. 按实际尺寸分类的完整数据", "");

for (const [diameter, entries] of [...diameterGroups.entries()].sort(
  (a, b) => a[0] - b[0],
)) {
  const recordBuckets = new Map();
  for (const entry of entries) {
    const bucket = recordBuckets.get(entry.record.sourceKey) ?? {
      record: entry.record,
      entries: [],
    };
    bucket.entries.push(entry);
    recordBuckets.set(entry.record.sourceKey, bucket);
  }

  push(
    `<a id="${anchorForDiameter(diameter)}"></a>`,
    `## ${diameter}英寸`,
    "",
    `本节共 ${entries.length} 条 variant，来自 ${recordBuckets.size} 条源记录。`,
    "",
  );

  for (const { record, entries: recordEntries } of [...recordBuckets.values()].sort(
    (a, b) => {
      const modelCompare = String(a.record.model).localeCompare(
        String(b.record.model),
        "en",
        { numeric: true },
      );
      return modelCompare || a.record.sourceKey.localeCompare(b.record.sourceKey, "zh-CN");
    },
  )) {
    const normalizedModel = String(record.model).trim().toLowerCase();
    const images = imageIndex.get(normalizedModel) ?? [];
    const duplicateModel = (modelGroups.get(normalizedModel) ?? []).length > 1;
    const styleConflict = styleConflictModels.some(([model]) => model === normalizedModel);
    const processConflict = processConflictModels.some(([model]) => model === normalizedModel);
    const notes = [];
    if (duplicateModel) notes.push("重复model待人工判断是否合并");
    if (styleConflict) notes.push("styleName冲突");
    if (processConflict) notes.push("process冲突");
    if (!SAFE_SLUG_PATTERN.test(normalizedModel)) notes.push("需要独立publicSlug");
    if (images.length === 0) notes.push("无图片匹配，不得上架");

    push(
      `### ${md(record.model)} · ${md(record.catalogueKey)}`,
      "",
      `- sourceKey：${code(record.sourceKey)}`,
      `- 来源文件：${code(`assets/wheel-data/${record.sourceFile}`)}`,
      `- 来源说明：${md(record.sourceDocument)}`,
      `- styleName 原值（内部）：${md(record.styleName)}`,
      `- process 原值：${md(record.process)}`,
      `- 图片候选：${images.length} 张${images.length ? ` — ${images.map(code).join("、")}` : ""}`,
      `- 清洗标记：${notes.length ? notes.join("；") : "未发现型号级结构异常；仍需发布审批"}`,
      "",
      "| variantKey | productionCode | 尺寸 | PCD | ET | CB | finish 原值 | 数据标记 |",
      "|---|---|---:|---|---:|---:|---|---|",
    );

    for (const { variant } of recordEntries.sort((a, b) =>
      String(a.variant.productionCode).localeCompare(
        String(b.variant.productionCode),
        "en",
        { numeric: true },
      ),
    )) {
      const variantNotes = [];
      if ((productionCodeGroups.get(String(variant.productionCode).trim()) ?? []).length > 1) {
        variantNotes.push("productionCode重复");
      }
      if (!CANONICAL_PCD_PATTERN.test(String(variant.pcd).trim())) {
        variantNotes.push("复合PCD待审核");
      }
      push(
        `| ${code(variantKey(record, variant))} | ${code(variant.productionCode)} | ${md(String(variant.size).replace("*", "×"))} | ${md(variant.pcd)} | ${md(variant.offset)} | ${md(variant.centerBore)} | ${md(variant.finish)} | ${variantNotes.length ? variantNotes.join("；") : "—"} |`,
      );
    }
    push("");
  }
}

if (invalidSizeRows.length > 0) {
  push(
    "## 5. 无法按尺寸归类的 variant",
    "",
    "| sourceKey | productionCode | size 原值 |",
    "|---|---|---|",
  );
  for (const { record, variant } of invalidSizeRows) {
    push(
      `| ${code(record.sourceKey)} | ${code(variant.productionCode)} | ${md(variant.size)} |`,
    );
  }
  push("");
}

push(
  "## 5. 使用边界",
  "",
  "- 本文档保留原始中文 finish、styleName 和 process，未做对外英文化。",
  "- 图片为文件名匹配候选，不表示图权、型号对应、供货和使用授权已经批准。",
  "- PCD 中的复合值可能表示双孔距/多孔距设计，必须由工程或供应方确认后决定公开形式。",
  "- 重复 model 可能是同一设计跨尺寸，也可能是代码复用；WordPress 发布记录必须逐组决定合并或拆分。",
  "- 公开目录只能消费经过批准覆盖层生成的 PublicWheelModel，不能直接消费本文或全部事实记录。",
  "",
);

const output = `${lines.join("\n")}\n`;
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const existing = readFileSync(OUTPUT, "utf8");
  if (existing !== output) {
    console.error(`✖ 导出文件已过期：${OUTPUT.replace(`${ROOT}/`, "")}`);
    process.exit(1);
  }
  console.log(`✓ 导出文件与数据一致：${OUTPUT.replace(`${ROOT}/`, "")}`);
} else {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, output, "utf8");
  console.log(`✔ 已输出 ${OUTPUT.replace(`${ROOT}/`, "")}`);
  console.log(`  ${records.length} 条源记录 / ${variantCount} 条 variant / ${diameterGroups.size} 个直径组`);
}
