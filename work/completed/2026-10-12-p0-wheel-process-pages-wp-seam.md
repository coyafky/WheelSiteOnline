# P0 · 轮毂工艺页接入 WordPress 内容层（flow-formed / forged）

- **状态**：已完成
- **日期**：2026-10-12
- **承接**：`2026-10-12-s0-ownership-audit-correction.md` 的 P0 清单

---

## 一、开工前的实测修正（P0 三项 ≠ 三项都能做）

上一轮把 P0 列为三项，实测后**只有两项可做**：

| P0 项 | 实测结论 |
|---|---|
| `flow-formed` / `forged` | ✅ **可做** —— 无业务门禁，纯技术缺口 |
| **`request-a-quote`** | ❌ **不可做 —— 卡在法务门禁** |

### `request-a-quote` 为什么不能做（重要，避免后人误判为遗漏）

实测发现它的 WP 记录**早就存在且内容已填好**（post 1339，`fh_content_json` 7063B），但：

- `post_status = draft`、`fh_publication_status = draft`
- 配套的 `privacy` 页（post 1340）的 `version` 字段是**空字符串 `""`**

**这不是遗漏，是刻意的隐私门禁**（`STATUS.md:645` 明写）：

> 由**业务/法务确认正式隐私版本号和同意文本**，重新导出并批准 `request-a-quote`、`privacy`

代码层有硬约束：`getInquiryContent()` 会**交叉校验**询盘页与隐私页的
`privacyVersion` / `formUi.privacyConsent` / `privacyLinkLabel` / `privacyHref` ——
任一不一致就**整体回落**；`version: ""` 时 `inquiry-form.tsx:315` 的 `if (!privacyVersion)`
让表单 **fail-closed**（显示不可用提示，不写数据）。

→ **强行 approved = 绕开隐私同意门禁**，会写入未经法律确认的同意记录。**本轮跳过，等法务。**

📌 **纪律：`wp=NONE` 有两种成因 —— 「从未建过」与「建了但被门禁挡住」。处置完全不同，
必须先读 `post_status` + 相关业务标志，不能一律当技术缺口处理。**

---

## 二、完成记录

### ✅ 两条 WP 记录已建

| page_key | route | post | master 体积 | locale_status |
|---|---|---:|---:|---|
| `flow-formed` | `/products/wheels/flow-formed` | **1427** | 4,599 B | `{en: approved}` |
| `forged-wheel` | `/products/wheels/forged` | **1426** | 8,003 B | `{en: approved}` |

### 改动文件（4 个）

| 文件 | 改动 |
|---|---|
| `src/lib/wordpress/flow-formed.ts` | +内容层 +locale 接线；**媒体解析与 boundary 覆盖原样保留** |
| `src/lib/wordpress/forged-wheel.ts` | +内容层 +locale 接线；媒体解析保留 |
| `scripts/i18n/dump-wheel-process-content.mts` **(新建)** | 从活的内容常量导出 JSON（避免手抄 ~290 行文案）；**主动剥掉控制字段** |
| `scripts/i18n/seed-wheel-process-content.php` **(新建)** | 写 en 正本 + by-locale，读回自证；不触发 `save_post` |

### 🔑 关键设计：控制字段不进 WP

两个模块里有**三类字段是发布控制而非正文**，必须留在本地模块：

| 字段 | 为什么留下 |
|---|---|
| **`publicationGate`**（flow-formed） | 被 `src/app/sitemap.ts` 与 `isFlowFormedPublishingOpen()` 读取，fail-closed 门禁。dump 脚本**主动剥离** |
| **`seo`**（flow-formed） | `generateMetadata` 的 canonical/索引判定依赖它，noindex 门禁也依赖 |
| **`publicationStatus`**（forged） | 被各 section 渲染器的 `section.publicationStatus !== "approved"` 守卫检查 —— **它 gate 渲染**，故属控制 |

→ WP 正本实测只含：`flow-formed` = `[catalogue, hero, inquiry, manufacturingRoute, processDefinition, slug]`；
`forged-wheel` = `[completion, forgingRoute, hero, inquiryInputs, materialReview]` ✅ 控制字段都不在。

### 验收实测

| 检查 | 结果 |
|---|---|
| **en 零回归** | 剥掉 `<script>`（dev flight payload）后 **DOM 字符级一致**：forged 52,246 = 52,246 ｜ flow-formed 221,620 = 221,620 ✅ |
| **索引行为未变** | flow-formed `robots: index, follow` + canonical ｜ forged 无 robots 标签（默认 index）+ canonical ✅ |
| **接缝真实（哨兵探针）** | 写入 `PROBE-VERIFY-8K2` → 重启后**页面命中 1 处**；回滚后 **probe 残留 0**、正文恢复 ✅ |
| **独立复核 WP 正本 vs 源码** | 逐字段比对：`flow-formed` 6 字段 **✅ EXACT** ｜ `forged-wheel` 5 字段 **✅ EXACT**，source 无多余字段 |
| **WFF03 媒体 boundary 覆盖仍生效** | WP 媒体 116 原始文案（`cast wheel blank`）**命中 0**；页面显示内容模块的 `Supplier-provided flow forming equipment scene…` ✅ |
| 探针零残留（DB） | `wp_postmeta` LIKE %SEAMPROBE% = **0** ｜ `wp_posts` = **0** ✅ |
| CJK 扫描 | 前后一致（forged 18 / flow-formed 5），全部来自语言切换器选项 + WP 媒体**文件名**（`工艺_旋压成型设备.jpeg`），**内容层零 CJK** ✅ |
| 门禁 | `npm test` **42/42** ｜ `tsc --noEmit` clean ｜ `eslint .` clean ｜ `build` exit 0 ✅ |

### ⚠️ 我自己犯的一个错（已修，记录以免重演）

回滚哨兵探针时，我**凭记忆写了一个「原始值」** —— 实际源码里的值是
`Browse flow-formed wheels by recorded production specification`，我写成了别的。

**发现方式**：回滚后用 `dump-wheel-process-content.mts` 导出源码常量，与 WP 正本**逐字段比对**
→ 立刻暴露不一致 → 用正确值修正 → 复比对 **✅ EXACT**。

📌 **纪律：回滚任何写入时，原始值必须从数据源读取（dump/源码），不能凭记忆或推测。**
📌 **反向纪律：改完数据后做一次「WP vs 数据源」的全量比对**，比只看页面有效 —— 页面上看不出细微差异。

### 子 agent 自己抓到的 bug（值得记）

它的第一版 seeder 要求**每个字段都是 array** —— 但 `flow-formed` 的 `slug` 是 string。
它**在容器里先打印 keys 再信绿灯**，因而抓到。已修为「只对 object 字段要求 array，`slug` 单独校验 string」。

📌 与既有教训同源：**「绿灯 ≠ 正确」**，产出型流水线必须按输入反查产物。

---

## 三、门禁

`npm test` **42/42** ｜ `npx tsc --noEmit` exit 0 ｜ `npx eslint .` **0 error 0 warning** ｜
`npm run build` exit 0 ｜ 无 commit

## 四、非范围 / 遗留

- ❌ **`request-a-quote` / `privacy`**：等法务确认隐私版本号（外部依赖）
- ❌ 不填 zh（本轮只搬 en）
- ❌ `INDEXABLE_LOCALES` 仍 `["en"]`；noindex / hreflang / sitemap **未动**
- ⚠️ 子 agent 报告 **`/sitemap.xml` 在本工作区为空**（dev 与 build 产物皆然），
  而 `src/app/sitemap.ts` 属**其他工作流的未提交改动** → 已核实**非本任务引入**，未触碰
- ⏳ P0 之后是 P1：`contact` / `custom-development` / `dealers` / `dealers-private-label`
