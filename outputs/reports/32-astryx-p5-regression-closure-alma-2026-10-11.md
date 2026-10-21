# Astryx P5 — 全站回归与迁移收口（进度报告）

- 日期：2026-10-11
- 任务：`work/queued/2026-10-11-astryx-sitewide-regression-closure.md`（P5）
- 上游：P0 `26-...` ｜ P1 `28-...` ｜ P2 `29-...` ｜ P3 `30-...` ｜ P4 `31-...`
- 证据：`outputs/reports/astryx-p5-a11y-evidence-2026-10-11/`（12 份 JSON + `scripts/` 复现脚本）
- 状态：**进行中**。用户要求中途暂停输出成果 → 本文件是**阶段性成果**，不是收口声明。

> 诚实声明：区分「已实测」与「只读代码」。**未实现的收口项已逐条列在 §六**。

---

## 〇、一句话结论

P5 的实质产出是：**整套 E2E 从 3 failed 修到 84 passed / 0 failed**，
并在此过程中挖出**三个真缺陷**（一个询盘回归 + 两个 WCAG 对比度缺陷，其一本轮之前的切片完全没发现）。
**全站收口尚未完成** —— 四语言全站回归、键盘全序、全模板 axe、设计正本回写仍在 §六。

---

## 一、E2E 全量实跑：3 failed → **84 passed / 0 failed**

**环境**：隔离端口 `PLAYWRIGHT_PORT=3214`（`WP_MODE=mock`，`reuseExistingServer: false`）。
⚠️ **默认端口 3100 被另一个项目占用** —— 实测该端口返回 `<title>蓝辉轻改 LANHUI</title>`（**不是本站**）。
按 `playwright.config.ts` 自己的注释，复用他人服务会让测试「静默跑在错误的站上」→ **改用 3214**。

### 1.1 首轮实跑（修复前）

```
3 failed ｜ 1 flaky ｜ 80 passed (14.5m)

✘ e2e/accessibility.spec.ts  ›  / 通过 WCAG A/AA 基础扫描
✘ e2e/accessibility.spec.ts  ›  /insights 通过 WCAG A/AA 基础扫描
✘ e2e/inquiry.spec.ts        ›  422 字段错误聚焦服务端指出的第一个字段
```

### 1.2 修复后

```
84 passed (3.8m)   ← 全绿，零失败
```

---

## 二、真缺陷 #1：询盘 422 的服务端消息被客户端文案覆盖（**P2 引入的回归**）

### 现象
`422 字段错误聚焦服务端指出的第一个字段` 失败。**失败点不是焦点**（焦点断言通过），
而是**服务端具体错误没渲染出来**。

测试注入：`fieldErrors: { email: "This address cannot receive replies." }`
页面实际渲染：**"That email address looks incomplete."**（客户端通用文案）

### 根因（代码级）
`src/components/inquiry-form.tsx` 的 `localizeServerErrors()` —— **P2 新增的函数**（`git show HEAD` 里为 0 处引用）：

```ts
return [ field, ui.validationMessages[field] ?? message ];   // ← 无条件覆盖
```

它的注释假设「两层共用一份 Zod 契约，所以消息等价」—— **但这个假设是错的**：
服务端可以因为**客户端不可能知道的原因**拒绝一个客户端已接受的值
（例："这个地址收不到回信"）。无条件覆盖会**把访客唯一能拿到的解释抹掉**。

### 修法
把通用文案降级为**兜底**而非**覆盖**：服务端消息若**不等于**客户端通用文案，则原样保留。

```ts
const generic: ReadonlySet<string> = new Set<string>(Object.values(ui.validationMessages));
// 服务端消息若不是客户端自己的措辞，则携带额外信息 → 原样保留
if (message && !generic.has(message)) return [field, message];
```

### 复验
- 单测：`422 字段错误聚焦…` → **1 passed**
- 询盘全量：**17 passed / 0 failed**（含「前端拒绝 persisted false 的二百响应」——成功判定未被破坏）
- ⚠️ **诚实边界**：全量 E2E 里该用例曾报 1 flaky（重跑即过），与本次改动无关，属既有时序抖动。

---

## 三、真缺陷 #2/#3：首页与 Insights 的对比度缺陷（**本轮之前完全没发现**）

`/` 与 `/insights` 的 axe 扫描报 `color-contrast`（impact: serious）。
用真 Chrome 逐元素测（`getBoundingClientRect` + 逐层合成背景）得 **22 + 2 处失败**。

### 3.1 继承的标题墨色（**P1 那个 bug 类，首页仍在**）

| 元素 | 实测 | 说明 |
|---|---|---|
| `<h2>`「One project interface…」 | **1.06:1** | 60px 大标题，几乎不可见 |
| `<h3>`「Define the requirement」等 ×5 | **1.06:1** | 步骤标题 |
| `<h3>`「Our wheel manufacturing base」等 ×3 | **1.06:1** | 证据卡标题 |

**根因与 P1 完全相同**：Astryx 生成主题的
`:where(h1…h6) { color: var(--color-text-primary) }` **按 landmark 而非按表面**取墨色。
这些标题**没有自己的颜色类**、纯靠继承 → 在深色带上拿到浅色模式的墨色。

**修法**：给每个标题**显式声明颜色**（`text-white`）。**未加任何全局 CSS 覆盖。**

### 3.2 深色表面上的强调色过暗

| 元素 | 实测 | 根因 |
|---|---|---|
| eyebrow / 步骤序号 ×11 | **4.32:1** | `--fh-forge-bright: #c77c45` 在 `--fh-hero #302a24` 上不足 4.5 |
| 证据卡计数器「01/02/03」×3 | **2.31:1** | 用了 `text-forge`（`#9b4b1d`）—— 那是**浅色表面**的角色 |
| Insights「Technical library」 | **3.2:1** | `text-forge-bright` 落在 `bg-hero/70` 照片覆盖层上 |

**修法（三处，各自最小）**：
1. **令牌** `--fh-forge-bright: #c77c45 → #cb8150`（同色相，仅提亮）→ hero **4.58:1** / ink **4.88:1**
   - 依据：`globals.css` 自己写着「All component utilities resolve here」→ 深色表面强调色必须在**唯一来源**处达标
2. **计数器** `text-forge` → `text-forge-bright`（深色带上该用 bright 角色）
3. **Insights 标签** `text-forge-bright` → `text-white/75`（照片覆盖层上，与其同级 caption 一致）

### 3.3 复验（真 Chrome 逐元素测）

| 路由 | 修复前 | 修复后 |
|---|---|---|
| `/` | **22** 处失败 | **0** |
| `/insights` | **2** 处失败 | **0** |

- `e2e/accessibility.spec.ts` → **18 passed / 0 failed**（7 条代表路由 × 桌面 + 键盘/焦点/缩放用例）

> ⚠️ **踩坑记录**：改令牌后页面仍显示旧色 —— Next dev 的 CSS 是内容哈希且**缓存到 `.next`**，
> **必须整个删掉 `.next` 重启**才生效（只删 `.next/cache` 不够）。

---

## 四、A11y 子 agent 的采集**大部分不可用**（重要更正）

`outputs/reports/astryx-p5-a11y-evidence-2026-10-11/axe-results.json` 报了 62 行、含 7 类违规。
**逐条复核后：其中 `/fitment/bmw-m` 那一组是假阳性。**

| 违规 | 子 agent 报告 | 复核结论 |
|---|---|---|
| `html-has-lang`（`/fitment/bmw-m`） | serious | ❌ **假阳性** —— 实测该页 `<html lang="en">` |
| `document-title`（同上） | serious | ❌ **假阳性** —— 实测 `<title>BMW M Forged Wheels …</title>` |
| `landmark-one-main` / `page-has-heading-one`（同上） | moderate | ❌ **假阳性** —— 实测该页有 `<main>` |
| `region`（52 次）/ `landmark-*`（8×3） | moderate | ⚠️ **存疑** —— 抽查 `/about` 有 1 `<main>` + 3 `<nav>`，需重跑确认 |
| `color-contrast`（7） | serious | ✅ **真** —— 已在 §三 修复 |

**根因**：子 agent 的扫描服务器（:3210）在采集期间未真正服务该路由 → 扫到空页 → 报出「无 lang / 无 title / 无 main」。
**这不是应用缺陷，是采集环境缺陷**（与 P1/P4 我踩过的同类坑）。

→ **处置**：`axe-results.json` 保留为**原始记录**，但**不作为结论引用**；结论以 §三 的真 Chrome 实测为准。

---

## 五、键盘 / 无 JS / 重定向（已实测，结论如下）

| 项 | 结果 | 证据 |
|---|---|---|
| 弹窗关闭后焦点回触发器 | ✅ | `dialog-escape-results.json`：`focus-trigger` 事件 `activeIsTrigger` |
| 弹窗打开焦点落在标题 | ✅ | 同上：`activeTag: h2` |
| 弹窗焦点陷阱 | ✅ | `dialog-wraparound-results.json`：`shiftTabBack.escapes = 0` |
| **无 JS 目录筛选可提交** | ✅ | `nojs-get-submit-results.json`：`?q=dx` → 26 → **17** 结果 |
| **无 JS FAQ 全文** | ✅ | `nojs-part2-results.json`：`<details>` 全文在 DOM |
| 首页 4 个卡片链接**无可见焦点环** | ⚠️ **真缺陷**，**已修** | 见下 |

### 5.1 已修：首页 4 个卡片链接 `outline: none`

`src/components/sections/product-showcase.tsx:45` 原本是
`focus-visible:border-forge focus-visible:outline-none` —— **显式移除轮廓，只换边框色**，
实测 `outline-style: none`（WCAG 2.4.7 失败）。**该写法在 HEAD 就存在（非本次迁移引入）**。

**修法**：保留边框色暗示，**另加真实焦点环**
（`focus-visible:ring-2 ring-forge ring-offset-2 ring-offset-white`）。

### 5.2 重定向登记（7 个，`curl -I` 实测）

6 个 **308** + `/resources/bolt-patterns/[pattern]` **307（刻意，源码注释说明保留分析落地）** → **未改动**。

---

## 六、**尚未完成**的收口项（P5 未收口，诚实清单）

| # | 项 | 状态 |
|---|---|---|
| 1 | **四语言全站回归** | ⚠️ 只验了 `/about` 四语言 + 索引门（`en` 可索引、`zh/es/th` 全 `noindex, follow`，实测 ✅）；**未做四语言 × 31 模板全量** |
| 2 | **键盘全序** | ⚠️ 只做了代表页 + 弹窗；**未做 31 模板逐页 Tab 顺序** |
| 3 | **全模板 axe 扫描** | ⚠️ 子 agent 的 62 行采集**大部分不可用**（§四）；**已修的两条路由是干净的，其余需重跑** |
| 4 | **31 模板 × 4 视口全量溢出/控制台** | ⚠️ P0–P4 累计覆盖了大部分，但**没有一次统一的全量 sweep** |
| 5 | **收缩重复外壳/样式** | ❌ **未做**（P4 已把 10 处手写首屏收进 `PageHero`，但其他重复包装未收缩） |
| 6 | **`DESIGN.md` 全量回写** | ⚠️ 已回写暖白迁移段 + P1 WCAG 发现（16:0x）；**其余历史色彩章节未整体改写** |
| 7 | **Page SPEC 回写** | ❌ **未做** |
| 8 | **总任务移至 `work/completed/`** | ❌ **未做**（按任务书「总任务完成才移至」→ 现在还不能移） |
| 9 | **`work/completed/` 目录** | ❌ **不存在**，需创建 |

---

## 七、门禁（当前状态，全绿）

| 命令 | 结果 |
|---|---|
| `npx playwright test` | **84 passed / 0 failed** |
| `npm run theme:check` | **ok** |
| `npm test` | **42 pass / 0 fail** |
| `npm run lint` | **0 error / 0 warning** |
| `npm run typecheck` | **clean** |
| `npm run build` | **exit 0** |
| `git diff --check` | **clean** |

---

## 八、本轮改动文件（6 个）

| 文件 | 改动 |
|---|---|
| `src/components/inquiry-form.tsx` | 修 422 服务端消息被覆盖（**P2 回归**） |
| `src/components/home/project-route-section.tsx` | `<h2>`/`<h3>` 显式颜色（1.06:1）+ 计数器改 `forge-bright` |
| `src/app/insights/page.tsx` | 「Technical library」标签改 `text-white/75`（3.2:1） |
| `src/app/globals.css` | `--fh-forge-bright: #c77c45 → #cb8150`（4.32 → 4.58/4.88） |
| `src/components/sections/product-showcase.tsx` | 补真实焦点环（WCAG 2.4.7） |
| `eslint.config.mjs` | 排除 `outputs/reports/**/scripts/**`（证据复现脚本，非源码） |

（`src/components/legal-document.tsx`、`src/content/inquiry-form.ts` 为 P2/P4 既有改动，本轮未再动。）

---

## 九、安全与工作树

- **未向真实 QQ SMTP 发任何信**；E2E 全程 `WP_MODE=mock` + 隔离端口 3214。
- **未 commit / push / deploy**（`git log -1` 仍为 `338d228`；stash 空）。
- 未覆盖 221 个遗留未提交改动。
- 已停止全部 dev server（3200/3210/3214/3220 全部释放）。
