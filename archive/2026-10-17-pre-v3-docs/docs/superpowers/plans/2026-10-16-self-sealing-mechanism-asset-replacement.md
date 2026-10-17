# 自密封轮胎机制图替换实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: 使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，按任务逐项实施。所有步骤使用复选框跟踪；本项目未获明确授权前不得 commit、push 或 deploy。

> **执行状态（2026-10-16）：** 任务 1–3 已完成；任务 5 的本地开发/生产回归、截图和文档已完成。任务 4 的本地 WordPress 导入与 live 双通道复验因 Docker daemon 不可用而阻断，故不关闭 P0。

**目标：** 生成三张不含伪文字、乱码、品牌标识或未经证实数字的自密封轮胎 T03 机制说明图，转为 WebP 后替换现有公开资源，并在本地回退内容、WordPress 权威内容、桌面/移动页面和发布文档中完成一致性验收。

**架构：** 保持 `src/content/` → `src/lib/wordpress/` → 页面组件的内容接缝不变。图片只负责清晰表达三个物理阶段，所有标题、阶段编号、限制说明和工程边界继续由 HTML 文案提供；这样图片生成模型不承担文字排版，也不会把测试结论烘焙进视觉资产。旧 WebP 先归档，候选 PNG 先放在审核目录，只有人工视觉/事实审核通过后才进入 `public/images/safety-tires/` 并标记为已批准。

**技术栈：** Next.js 16、TypeScript、类型化内容接缝、WordPress 原生 Page JSON、本地 `imagegen` 图片生成、macOS `cwebp`/`sips` WebP 转换、Node 内置测试、Playwright。

## 全局约束

- 项目记录一律用中文；页面公开文案继续以英文正本和已批准翻译为准。
- `MediaAsset` 必须保留 `hasRender` 和 `approvalStatus` 兜底；候选图未审核前不能作为公开图片渲染。
- 新图只能表达“适用胎面穿刺下的自密封材料反应”，不能表达“任何穿刺都安全”“100% 不漏气”“无需检查”、修复保证、认证结果或供应商专属事实。
- 新图不得包含任何可读文字、数字、箭头标签、品牌 Logo、水印、车型标识、第三方产品标识或生成模型伪文字；标题与说明由页面 HTML 提供。
- 三张图必须保持同一视角、轮胎剖面比例、光线和材料配色，只改变三个机制阶段，避免被误解为三套不同产品。
- 生成图属于解释性视觉，不得继续标记为“supplier illustration”；`alt`、`caption`、`sourceRef` 必须明确其为基于已批准机制文案的解释性图示，不是测试报告或实拍证据。
- 旧资产不直接删除：先保存到 `archive/`，再用审核通过的新 WebP 替换同名公开路径。
- 只操作本地工作区和本地 WordPress；不上传远程媒体、不发布正式站、不发送真实询盘、不修改 DNS。
- 不改变 T03 HTML 结构、移动布局或 `hasRender` 兜底；本计划只改媒体资产、媒体元数据、权威内容同步和验收证据。
- 未获明确授权不执行 commit、push 或 deploy；每个任务结束只留下可检查的工作区结果。

---

## 文件结构与职责

| 路径 | 操作 | 职责 |
|---|---|---|
| `resources/research/2026-10-16-self-sealing-mechanism-image-brief.md` | 创建 | 固化三阶段视觉 brief、生成提示词、事实边界、审核清单和文件映射 |
| `resources/generated/self-sealing-mechanism/` | 创建 | 暂存生成后的 PNG 候选；未审核前不被页面引用 |
| `public/images/safety-tires/mechanism-entry.webp` | 归档后替换 | T03-01：物体进入胎面和密封层 |
| `public/images/safety-tires/mechanism-surround.webp` | 归档后替换 | T03-02：密封材料包围仍在位的物体 |
| `public/images/safety-tires/mechanism-close.webp` | 归档后替换 | T03-03：物体移除后通道闭合 |
| `archive/2026-10-16-self-sealing-mechanism-webp-replacement/` | 创建 | 保存三张旧 WebP 及替换说明，便于追溯和回滚 |
| `src/content/safety-tires.ts` | 修改 | 将三张图的来源、alt、caption 和批准边界改为生成解释图，不再引用旧 WordPress 媒体 ID |
| `tests/self-sealing-mechanism-assets.test.mts` | 创建 | 验证三阶段顺序、文件路径、批准元数据、来源说明和公开文件存在 |
| `e2e/self-sealing-mechanism.spec.ts` | 创建 | 在 1440、390、360 视口验证三张图可加载、alt 正确、尺寸稳定且 T03 无横向溢出 |
| `outputs/reports/self-sealing-mechanism-asset-replacement-2026-10-16.md` | 创建 | 保存生成版本、审核结论、截图路径、转换参数和回归结果 |
| `PAGE-SPECS/self-sealing-tires.md` | 修改 | 记录 T03 新媒体类型、解释性图示边界和验收结果 |
| `PAGE-SPECS/index.md` | 修改 | 移除“机制图待替换”这一过期状态，但保留其他未解决发布阻断 |
| `STATUS.md` | 修改 | 仅在三张图和权威内容双通道都验收通过后关闭该 P0，并链接交付报告 |

---

### 任务 1：锁定三阶段媒体契约与事实边界

**文件：**

- 创建：`resources/research/2026-10-16-self-sealing-mechanism-image-brief.md`
- 修改：`src/content/safety-tires.ts:7-23,68-87`
- 创建：`tests/self-sealing-mechanism-assets.test.mts`

**接口：**

- 消费：现有 `SelfSealingTirePage.mechanism.items` 和 `MediaAsset` 类型。
- 产出：三个 T03 item 继续使用 `id = "01" | "02" | "03"` 和现有图片路径，但 `wordpressId` 不再指向旧媒体；`sourceRef`、`caption` 明确为解释性图示；本地视觉审核和 WebP 安装完成后使用 `approvalStatus = "approved"`，live WordPress 同步另行复验。

- [x] **步骤 1：先写失败测试，锁定媒体契约**

```ts
import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { selfSealingTirePage } from "../src/content/safety-tires.ts";

test("T03 机制图按三个阶段使用解释性媒体契约", () => {
  const items = selfSealingTirePage.mechanism.items;
  assert.deepEqual(items.map((item) => item.id), ["01", "02", "03"]);
  assert.deepEqual(
    items.map((item) => item.media?.src),
    [
      "/images/safety-tires/mechanism-entry.webp",
      "/images/safety-tires/mechanism-surround.webp",
      "/images/safety-tires/mechanism-close.webp",
    ],
  );
  for (const item of items) {
    assert.ok(item.media);
    assert.equal(item.media.wordpressId, undefined);
    assert.match(item.media.sourceRef, /explanatory illustration/i);
    assert.doesNotMatch(item.media.caption, /Supplier illustration/);
    assert.equal(item.media.hasRender, true);
    assert.equal(item.media.approvalStatus, "approved");
    assert.ok(existsSync(join(process.cwd(), "public", item.media.src)));
  }
});
```

- [x] **步骤 2：运行失败测试，确认旧内容被识别**

运行：

```bash
node --experimental-strip-types --test tests/self-sealing-mechanism-assets.test.mts
```

预期：在旧媒体元数据仍带 WordPress ID、旧 `Supplier illustration` caption 或旧文件尚未替换时失败；失败原因必须指向 T03 媒体契约，而不是模块渲染错误。

- [x] **步骤 3：写入解释性媒体元数据**

在 `src/content/safety-tires.ts` 中把 T03 三项改为以下语义；保持 `src` 文件名不变，避免组件、CSS 和页面链接改动：

```ts
const generatedMechanismSourceRef =
  "AI-generated explanatory illustration based on the approved supplier-stated sealing mechanism copy; not a test photograph or test report";

function generatedMechanismMedia(
  src: string,
  alt: string,
  caption: string,
): MediaAsset {
  return {
    src,
    alt,
    caption,
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: generatedMechanismSourceRef,
  };
}
```

使用以下固定文本，防止生成图被误认为供应商原图：

```ts
generatedMechanismMedia(
  "/images/safety-tires/mechanism-entry.webp",
  "Explanatory cutaway showing an object entering the tyre tread and sealing layer",
  "Explanatory illustration of the initial tread-puncture stage; not a test result",
);
generatedMechanismMedia(
  "/images/safety-tires/mechanism-surround.webp",
  "Explanatory cutaway showing sealing material surrounding a penetrating object",
  "Explanatory illustration of sealing material around the object; not a test result",
);
generatedMechanismMedia(
  "/images/safety-tires/mechanism-close.webp",
  "Explanatory cutaway showing the sealing layer closing the channel after object removal",
  "Explanatory illustration of channel closure after object removal; inspection remains required",
);
```

保留页面现有的标题和 body，不把“适用胎面区域”“仍需专业检查”等限制说明移入图片。

- [x] **步骤 4：重新运行契约测试**

运行：

```bash
node --experimental-strip-types --test tests/self-sealing-mechanism-assets.test.mts
```

预期：三项顺序、来源、caption、旧 ID、批准状态和公开文件断言全部通过。

- [x] **步骤 5：任务检查点**

确认 T03 内容现在只描述三阶段机制和审核边界；在任务 3 的 WebP 安装完成前，不启动页面发布验收，也不把 P0 从 `STATUS.md` 移除。

### 任务 2：生成三张候选解释图并进行人工内容审核

**文件：**

- 创建：`resources/generated/self-sealing-mechanism/01-entry.png`
- 创建：`resources/generated/self-sealing-mechanism/02-surround.png`
- 创建：`resources/generated/self-sealing-mechanism/03-close.png`
- 修改：`resources/research/2026-10-16-self-sealing-mechanism-image-brief.md`

**接口：**

- 消费：任务 1 固化的三阶段语义和页面 HTML 文案。
- 产出：三张同一视觉系统下的无文字 PNG 候选，宽高比约 2:1，建议至少 1536×768；任务 3 只接受人工审核通过的候选。

- [x] **步骤 1：把完整 brief 写入资源研究记录**

记录统一视觉约束：深石墨色轮胎剖面、暖黄色密封层、金属色钝头穿刺物、浅色中性背景、清晰工业示意风格、同一侧视剖面和相同构图；禁止文字、数字、箭头、Logo、水印、车型、品牌和夸张爆炸效果。

- [x] **步骤 2：生成第一阶段候选**

使用 image generation 工具生成 `01-entry.png`，提示词必须包含：

```text
Clean technical cutaway illustration of a passenger tyre tread and inner liner in side section, stage one of a self-sealing tyre mechanism: a single blunt metallic puncturing object enters vertically through the tread and reaches the polymer sealing layer, the sealing layer is visible below the tread, realistic industrial educational diagram, neutral light background, dark graphite rubber, warm amber sealing material, consistent centered composition, wide 2:1 canvas. No words, no letters, no numbers, no arrows, no labels, no logo, no watermark, no brand, no vehicle, no claim of guaranteed sealing.
```

- [x] **步骤 3：生成第二阶段候选**

使用相同镜头、颜色和构图生成 `02-surround.png`，仅把物理阶段改为：穿刺物仍在胎面中，暖黄色密封材料连续包围穿刺物并缩短空气通道；不显示压力数值、测试结论或文字。

- [x] **步骤 4：生成第三阶段候选**

使用相同镜头、颜色和构图生成 `03-close.png`，仅把物理阶段改为：穿刺物已经移除，胎面下方密封层恢复并覆盖小型通道；保留“仍需检查”的事实边界在 HTML，不在图片内画文字或勾选标识。

- [x] **步骤 5：逐张查看并拒绝生成伪文字符号**

用 `view_image` 查看三张 PNG，逐项检查：

1. 图片中没有任何可读或疑似可读的字符、数字、Logo、箭头或水印。
2. 三张图的轮胎剖面方向、胎面位置、密封层颜色和光源一致。
3. 01/02/03 的阶段差异与 HTML 标题一一对应，没有把“物体移除后”画成物体仍在位。
4. 没有夸张的爆炸、火花、裂纹、轮胎爆裂或“完全不会漏气”的视觉暗示。
5. 图片没有使用供应商原图中的品牌标识或第三方设计元素。

不满足任一项就重新生成候选，不把问题推迟到 CSS 或 WebP 转换阶段。

- [x] **步骤 6：把通过人工检查的候选文件名和检查结论写入 brief**

记录每张图的像素尺寸、生成日期、使用的提示词版本和审核结论；未通过的候选保留在资源记录中但不进入 `public/`。

### 任务 3：归档旧图、转换 WebP 并安装公开资源

**文件：**

- 创建：`archive/2026-10-16-self-sealing-mechanism-webp-replacement/`
- 归档：旧的 `mechanism-entry.webp`、`mechanism-surround.webp`、`mechanism-close.webp`
- 替换：`public/images/safety-tires/mechanism-entry.webp`、`mechanism-surround.webp`、`mechanism-close.webp`
- 修改：`tests/self-sealing-mechanism-assets.test.mts`

**接口：**

- 消费：任务 2 已审核 PNG 候选。
- 产出：三个同名、可被 Next `Image` 请求的 WebP；页面不需要改组件引用，旧版本可通过 archive 回滚。

- [x] **步骤 1：先归档现有公开 WebP**

执行：

```bash
mkdir -p archive/2026-10-16-self-sealing-mechanism-webp-replacement
cp public/images/safety-tires/mechanism-entry.webp archive/2026-10-16-self-sealing-mechanism-webp-replacement/mechanism-entry-before.webp
cp public/images/safety-tires/mechanism-surround.webp archive/2026-10-16-self-sealing-mechanism-webp-replacement/mechanism-surround-before.webp
cp public/images/safety-tires/mechanism-close.webp archive/2026-10-16-self-sealing-mechanism-webp-replacement/mechanism-close-before.webp
```

在 archive 中写入 `README.md`，注明旧图包含伪文字/乱码、替换日期、三个新图的阶段映射和恢复路径；不删除旧文件。

- [x] **步骤 2：把审核通过的 PNG 转为 WebP**

优先使用本机 `cwebp`，保持宽高不变并使用质量 82：

```bash
cwebp -q 82 -m 6 resources/generated/self-sealing-mechanism/01-entry.png -o public/images/safety-tires/mechanism-entry.webp
cwebp -q 82 -m 6 resources/generated/self-sealing-mechanism/02-surround.png -o public/images/safety-tires/mechanism-surround.webp
cwebp -q 82 -m 6 resources/generated/self-sealing-mechanism/03-close.png -o public/images/safety-tires/mechanism-close.webp
```

如果本机没有 `cwebp`，使用 macOS `sips` 对同一审核 PNG 转换，不重新生成图片：

```bash
sips -s format webp resources/generated/self-sealing-mechanism/01-entry.png --out public/images/safety-tires/mechanism-entry.webp
sips -s format webp resources/generated/self-sealing-mechanism/02-surround.png --out public/images/safety-tires/mechanism-surround.webp
sips -s format webp resources/generated/self-sealing-mechanism/03-close.png --out public/images/safety-tires/mechanism-close.webp
```

- [x] **步骤 3：检查格式、尺寸和文件可读性**

运行：

```bash
for file in public/images/safety-tires/mechanism-entry.webp public/images/safety-tires/mechanism-surround.webp public/images/safety-tires/mechanism-close.webp; do
  sips -g format -g pixelWidth -g pixelHeight "$file"
done
```

预期：三项均为 WebP；宽高与对应 PNG 一致；宽高比接近 2:1；文件大小大于 0。再用 `view_image` 查看转换后的 WebP，确认转换没有引入色块、字符伪影或裁切。

- [x] **步骤 4：补充公开文件存在断言**

让 `tests/self-sealing-mechanism-assets.test.mts` 逐项断言 `public` 下三个 WebP 存在，并断言文件名与 `src/content/safety-tires.ts` 的路径完全一致；不要在测试里把图片的 OCR 结果当作唯一质量门槛。

- [x] **步骤 5：重新运行媒体契约测试**

运行：

```bash
node --experimental-strip-types --test tests/self-sealing-mechanism-assets.test.mts
```

预期：通过；三张 WebP 均存在，元数据为解释性图示且没有旧 WordPress ID。

- [x] **步骤 6：审核通过后再把媒体状态改为已批准**

将三个 T03 `MediaAsset.approvalStatus` 从 `"candidate"` 改为 `"approved"`，重新运行同一测试；如果人工审阅或格式检查仍有一项未通过，保持 `"candidate"`，让页面按既有 `MediaVisual` 兜底，不公开不合格图片。

### 任务 4：同步本地 WordPress 权威内容，避免 live 模式继续返回旧图

**文件：**

- 输入：`src/content/safety-tires.ts`、`scripts/export-native-pages.mjs`、`scripts/import-native-pages.php`
- 生成：`/tmp/fenghuai-native-pages-20261016.json` 和只含安全轮胎页的 `/tmp/fenghuai-safety-tires-page-20261016.json`
- 验证：`scripts/verify-native-pages.py` 和本地 REST 响应
- 不修改：`src/lib/wordpress/safety-tires.ts`、`src/components/safety-tires/self-sealing-tire-page.tsx`

**接口：**

- 消费：任务 1 的新 `MediaAsset` 元数据和任务 3 的公开 WebP。
- 产出：WordPress `safety-tires` Page 的英文正本与当前代码一致；`getSelfSealingTirePage()` 在 `WP_MODE=live` 和本地回退模式都返回新路径与新来源说明。

- [x] **步骤 1：生成只包含当前代码快照的迁移包**

运行：

```bash
node scripts/export-native-pages.mjs /tmp/fenghuai-native-pages-20261016.json
node - <<'NODE'
const fs = require("node:fs");
const payload = JSON.parse(fs.readFileSync("/tmp/fenghuai-native-pages-20261016.json", "utf8"));
const record = payload.records.find((item) => item.key === "safety-tires");
if (!record) throw new Error("safety-tires page record is missing");
fs.writeFileSync(
  "/tmp/fenghuai-safety-tires-page-20261016.json",
  JSON.stringify({ version: payload.version, records: [record] }, null, 2),
);
console.log("wrote focused safety-tires migration package");
NODE
```

- [x] **步骤 2：在导入前检查迁移包中的 T03 三项**

运行：

```bash
node - <<'NODE'
const fs = require("node:fs");
const payload = JSON.parse(fs.readFileSync("/tmp/fenghuai-safety-tires-page-20261016.json", "utf8"));
const record = payload.records.find((item) => item.key === "safety-tires");
const items = record?.content?.mechanism?.items ?? [];
if (items.length !== 3) throw new Error(`expected 3 mechanism items, got ${items.length}`);
for (const item of items) {
  if (item.media?.wordpressId !== undefined) throw new Error(`${item.id} still has old WordPress media ID`);
  if (!/explanatory illustration/i.test(item.media?.sourceRef ?? "")) throw new Error(`${item.id} sourceRef is not explanatory`);
}
console.log("safety-tires T03 migration record is clean");
NODE
```

- [ ] **步骤 3：先保存本地 WordPress 当前页面快照**（Docker daemon 不可用，待恢复后执行）

在本地 WordPress 服务可用时保存当前 `safety-tires` Page REST/数据库快照到 `resources/` 或本地备份目录；确认快照包含旧 `mechanism.items`，这样导入失败时能恢复原页面内容。不得对远程 WordPress 执行这一操作。

- [ ] **步骤 4：把迁移包复制到本地 WordPress 容器并导入**（Docker daemon 不可用，待恢复后执行）

运行：

```bash
docker compose -f local-wp/docker-compose.yml cp /tmp/fenghuai-safety-tires-page-20261016.json wp:/tmp/fenghuai-safety-tires-page-20261016.json
docker compose -f local-wp/docker-compose.yml cp scripts/import-native-pages.php wp:/tmp/import-native-pages.php
docker compose -f local-wp/docker-compose.yml exec -T wp php /tmp/import-native-pages.php /tmp/fenghuai-safety-tires-page-20261016.json
```

预期：导入报告 `ok: true`，只更新 `safety-tires` Page；导入前记录并在导入后复核 `fh_pages_authoritative`，不得因本次单页同步意外改变其他页面的权威状态。如果本地 WordPress 未运行，只完成迁移包检查并记录“未同步”，不能宣称 live 模式验收通过。

- [ ] **步骤 5：读取 live 页面并验证 T03 路径**（Docker daemon 不可用，待恢复后执行）

使用本项目的本地 WordPress REST 读取路径验证：

```bash
curl --fail 'http://127.0.0.1:8081/wp-json/fh/v1/pages?key=safety-tires'
```

响应中 `page.content.mechanism.items[*].media.src` 必须是三个 `/images/safety-tires/mechanism-*.webp` 路径，且 `wordpressId` 不得回到旧 149/131/139 媒体引用。

- [ ] **步骤 6：验证 Next 的两种内容模式**（live 通道待 Docker 恢复后执行）

分别以 `WP_MODE=mock` 和本地 `WP_MODE=live` 启动页面，确认 `/products/safety-tires` 的 T03 均显示同三张新图；live 模式若仍返回旧图，停止发布验收并修正 WordPress Page JSON，不通过修改组件来绕过权威内容。

### 任务 5：建立页面回归、截图证据和发布状态闭环

**文件：**

- 创建：`e2e/self-sealing-mechanism.spec.ts`
- 修改：`PAGE-SPECS/self-sealing-tires.md`
- 修改：`PAGE-SPECS/index.md`
- 修改：`STATUS.md`
- 创建：`outputs/reports/self-sealing-mechanism-asset-replacement-2026-10-16.md`

**接口：**

- 消费：任务 3 的 WebP 和任务 4 的本地 WordPress 权威内容。
- 产出：可审阅的 1440/390/360 截图、自动化结果和已解除/仍保留的发布阻断；只有全部门槛通过才关闭 P0。

- [x] **步骤 1：先写 E2E 失败测试**

```ts
import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
]) {
  test(`T03 机制图在 ${viewport.width}px 显示三张新图`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/products/safety-tires");
    const images = page.locator("#self-sealing-mechanism img");
    await expect(images).toHaveCount(3);
    await expect(images.nth(0)).toHaveAttribute("src", /mechanism-entry/);
    await expect(images.nth(1)).toHaveAttribute("src", /mechanism-surround/);
    await expect(images.nth(2)).toHaveAttribute("src", /mechanism-close/);
    await expect(images.nth(0)).toHaveAttribute("alt", /object entering/i);
    await expect(images.nth(1)).toHaveAttribute("alt", /surrounding/i);
    await expect(images.nth(2)).toHaveAttribute("alt", /closing/i);
    for (const image of await images.all()) {
      const naturalWidth = await image.evaluate((node) =>
        node instanceof HTMLImageElement ? node.naturalWidth : 0,
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
    const articleRightEdges = await page.locator("#self-sealing-mechanism article").evaluateAll((nodes) =>
      nodes.map((node) => Math.ceil(node.getBoundingClientRect().right)),
    );
    for (const rightEdge of articleRightEdges) expect(rightEdge).toBeLessThanOrEqual(viewport.width);
  });
}
```

图片解码使用 `naturalWidth > 0`；卡片右边界使用真实 viewport 宽度断言，避免用全局 section 的 `scrollWidth` 掩盖单卡片裁切。

- [x] **步骤 2：运行开发模式专项 E2E，确认失败原因**

运行：

```bash
PLAYWRIGHT_PORT=3220 PLAYWRIGHT_PRODUCTION=0 PLAYWRIGHT_HTML_OPEN=never npx playwright test e2e/self-sealing-mechanism.spec.ts
```

预期：在旧图仍被引用或文件未安装时失败；通过后保存三张视口截图到 `outputs/reports/self-sealing-mechanism-asset-replacement-2026-10-16/`。

- [x] **步骤 3：运行生产模式专项 E2E**

运行：

```bash
PLAYWRIGHT_PORT=3221 PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_HTML_OPEN=never npx playwright test e2e/self-sealing-mechanism.spec.ts
```

预期：1440、390、360 三个视口全部通过；无图片请求失败、无 T03 元素横向裁切、三张图在移动端完整显示。

- [x] **步骤 4：人工审阅最终 WebP 截图**

逐张查看生产模式截图，确认 HTML 标题与图片阶段一致，图片内没有伪文字/乱码，T03 下方限制说明仍可见。截图必须包含三张图和对应阶段标题，不能只截图片局部。

- [x] **步骤 5：更新页面规格和交付报告**

在 `PAGE-SPECS/self-sealing-tires.md` 记录：T03 已改为三张无文字解释性图示；图片不承担测试证据；验收视口为 1440×900、390×844、360×800。交付报告记录旧图 archive 路径、新图尺寸/转换质量、WordPress 同步结果、专项 E2E 命令和截图。

- [x] **步骤 6：只在所有门槛通过后更新当前状态**（保留 P0，已记录 live 同步阻断）

从 `STATUS.md` 的 P0 条目移除“3 张机制图带伪文字/乱码”阻断，改为链接交付报告；保留真实媒体、图权、专业审核、Fitment、法律和生产运行时等其他发布阻断。`PAGE-SPECS/index.md` 只更新该项，不把整页标为已可正式发布。

- [x] **步骤 7：运行项目门禁**

运行：

```bash
node --experimental-strip-types --test tests/self-sealing-mechanism-assets.test.mts
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

预期：全部通过；Next build 只允许出现已知 WordPress 本地不可用回退警告，不得出现新图片 404、类型错误或 `PLACEHOLDER`。

- [x] **步骤 8：保留用户授权边界**

确认没有执行 commit、push、deploy 或远程 WordPress 写入；如用户随后明确授权提交，再单独整理本任务相关文件并提交，不把其他工作区改动带入提交。

---

## 验收矩阵

| 层级 | 验收信号 | 失败处理 |
|---|---|---|
| 图片内容 | 三张图无文字/乱码/Logo，阶段 01→02→03 语义准确 | 重新生成候选，不进入 WebP 安装 |
| 媒体契约 | 三项路径、alt、caption、sourceRef 一致；不再引用旧 WP ID | 修正 `src/content/safety-tires.ts` 和 WP Page JSON |
| 资源格式 | 三个文件均为 WebP、尺寸一致、可解码、无 0 字节 | 重新转换，不修改页面组件绕过 |
| 页面渲染 | 1440/390/360 三张图均加载，T03 无横向溢出 | 修正资源或回滚到 archive，不能隐藏图片问题 |
| 内容权威性 | mock 与 live 都返回同一新路径；live 不继续覆盖旧图 | 停止发布状态更新，先同步本地 WP |
| 发布文档 | SPEC、STATUS、交付报告只反映已验证事实 | 不关闭 P0，不声称发布就绪 |

## 自审结论

- **规格覆盖：** 生成、人工审核、WebP 转换、旧图归档、内容元数据、WordPress 权威同步、桌面/移动 E2E、页面规格和状态更新均有独立任务。
- **完整性扫描：** 计划没有未填充标记或未定义的函数名；所有新增测试和命令均给出具体路径与预期结果。
- **接口一致性：** 三个固定 `src` 路径在内容契约、公开 WebP、迁移包检查和 E2E 断言中一致；媒体来源使用同一个 `generatedMechanismSourceRef` 语义。
- **未解决边界：** 本计划只解除三张机制图的伪文字/乱码阻断，不解除自密封轮胎其他素材、图权、专业审核或全站正式发布门槛。
