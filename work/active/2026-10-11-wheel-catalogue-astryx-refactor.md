# 轮毂产品目录页 Astryx 交互层重构

- **状态**：进行中
- **创建日期**：2026-10-11
- **对应页面**：`/products/wheels`（一页列多款轮毂的产品目录）
- **来源**：用户 2026-10-11 指令 + `ai-dev-workflow` 阶段① 澄清

> ⚠️ **前置更正**：此前我误将范围定为 `/fitment`（适配页），已作废并移出仓库。
> 正确目标 = **`/products/wheels` 轮毂产品目录**。

---

## 1. 范围（做什么）

用 Astryx 组件库（`@astryxdesign/core@0.6.7`，本机已装）优化 `/products/wheels` 的
**筛选栏 + 卡片网格**两块。

### 1.1 筛选栏（用户定案：**方案 A 轻量增强**）

| 改动 | 做法 |
|---|---|
| **分组折叠** | 各筛选组（PCD / Diameter / Width / Process）包一层可折叠容器 |
| **选项搜索** | 选项数多的组（PCD 32 项、Width 22 项）加搜索框 |
| **已选计数** | 用 Badge 显示「已选 N 项」 |
| **保留原机制** | ✅ 现有 checkbox + **纯服务端 GET 表单**提交方式**完全不动** |

🔴 **明确不做**：不改成客户端即时筛选（那会推翻「无 JS 可用」基线）。

### 1.2 卡片网格（用户定案：**重点 ① 信息层次 + ③ 询盘按钮更醒目**）

| 改动 | 做法 |
|---|---|
| **① 信息层次** | 拉开型号 / 工艺 / 规格行 / CTA 的视觉权重差，扫视时知道先看什么 |
| **③ 询盘按钮醒目** | `AddWheelToInquiryButton` 是真实转化点，从与「View specifications」并列改为**视觉突出** |

❌ **不在本次重点**（用户未选）：密度调整、图片区观感、排序/视图切换控件

## 2. 非范围（不做什么）

- ❌ **不改筛选机制本身**：URL 参数格式、`parseCatalogueSearchParams` 解析、服务端筛选逻辑
- ❌ **不破坏无 JS 基线**：`<form method="get">` 纯服务端提交必须保持可用
- ❌ **不碰询盘清单功能**：`AddWheelToInquiryButton` 的业务行为不变（只调视觉突出度）
- ❌ **不碰上架门槛与证据纪律**：无图不上架、规格必须来自真实 variant
- ❌ **不碰 SEO**：canonical / sitemap / 分页 noindex 逻辑
- ❌ **不改数据契约**：`src/lib/wheels/*` 的类型与查询逻辑
- ❌ **不引新依赖**（Astryx 已装）
- ❌ **不 commit / push / 部署**

## 3. 本机硬约束（实测证据，非推测）

| 约束 | 证据 |
|---|---|
| Astryx 版本 | `@astryxdesign/core` **0.6.7** ｜ `theme-neutral` 同版本 |
| 主题接入方式 | **局部包裹** `<Theme theme={neutralTheme} mode="light">`，项目内 3 处既有先例 |
| 页面性质 | `src/app/products/wheels/page.tsx` 是 **Server Component**，静态生成 |
| ✅ 可行性已证 | `wheel-catalogue-empty.tsx` 同为 Server Component 且已成功用 Astryx `EmptyState` |
| 现有 Astryx 用法 | `direct-wheel-inquiry-dialog`（Dialog/NumberInput）、`inquiry-cart-summary`（NumberInput/Toast）|
| **筛选栏实测规模** | 237px 宽 ｜ **40 个 input / 38 个 checkbox / 0 个 select** |
| **筛选选项分布** | PCD **32** ｜ Width **22** ｜ Diameter **12** ｜ Process **10** |
| **卡片实测** | 297×522 ｜ 网格 `auto-fill minmax(220px,1fr)` ｜ 1440 下 3 列 |
| 基线数据 | 公开型号 **138** ｜ 每页 **24** 条 ｜ 共 6 页 |

## 4. 🚧 三条护栏（用户定案：全锁）

1. **筛选功能本身**（URL 参数 / 服务端筛选）→ 回归用《QA-轮毂筛选器-测试用例》34 条
2. **无 JS 基线**（GET 表单可用）→ 验收矩阵第 7 条
3. **询盘清单**（`AddWheelToInquiryButton`）→ 不能因改样式而失效
4. **上架门槛 / 证据纪律** → 无图不上架、规格来自真实 variant
5. **SEO**（canonical / sitemap / 分页 noindex）→ 不能碰坏

## 5. 验收标准（沿用 QA 测试用例文档规范）

产出 `outputs/reports/QA-轮毂目录-Astryx重构-测试用例-2026-10-11.md`
（**用例先行 → 执行 → 回填 → 截图内嵌**，与《QA-轮毂筛选器》同构）

### ① 代码层门禁
- `npm run lint` → 0 error
- `npm run typecheck` → 0 error
- `npm run build` → 成功，**191 页静态生成不减少**
- `npm test` → 现有 **42 条**单测全绿
- `npx playwright test` → 现有 **60 条** e2e 全绿（**零回归**）

### ② 护栏回归（必做）
- 重跑《QA-轮毂筛选器-测试用例》**34 条**，**结果不得劣化**（原 33 通过 / 1 部分通过）
- 特别回归：TC-14（非法参数归一化）、TC-17（摘要数=卡片数）、TC-29（无 JS GET 表单）
- 询盘清单专项：`AddWheelToInquiryButton` 仍可加入清单

### ③ 浏览器层（Playwright 真实巡检）
- @1440×900 与 @390×844：**零横向溢出**
- 控制台 **Errors: 0**
- **零破图**（滚动预热后检测）
- `h1` = 1
- **新功能专项**：分组可折叠 ｜ 选项搜索可用（输入过滤生效）｜ 已选计数正确
- 卡片层次专项：型号/工艺/规格/CTA 权重差可辨 ｜ 询盘按钮视觉突出

## 6. 对抗性审查（1.3 步）

| 维度 | 审查问题 | 结论 |
|---|---|---|
| **可行性** | Server Component 能用 Astryx client 组件？ | ✅ 已证（`wheel-catalogue-empty` 先例）|
| **可行性** | 折叠/搜索需要 client 交互，会不会破坏**无 JS 基线**？ | 🔴 **最大风险** —— 必须用 `<details>/<summary>`（原生，无 JS 可用）而非 Astryx 的 JS 折叠。**已有先例**：移动端筛选抽屉就是原生 `<details>` |
| **边界** | 选项搜索框在无 JS 时怎么办？ | ⚠️ 搜索框是**增强**（有 JS 才过滤全部选项；无 JS 时退化为浏览器 Ctrl+F / 原生滚动），**不得成为唯一入口** |
| **依赖** | Astryx 组件是否需要 `"use client"`？ | `Collapsible` 5/5、`Banner` 2/2 均为 client —— 注意 page 本身是 RSC，按局部组件包裹 |
| **替代方案** | 有更简单做法吗？ | 有 —— 完全不动。但用户明确要 Astryx 化，且只限交互层，收益/风险比可接受 |
| **回归风险** | 筛选功能被改坏 | 🔴 已锁定护栏 + 34 条回归用例 |
| **回归风险** | 无 JS 基线被破坏 | 🔴 见上，强制用原生 `<details>` |
| **回归风险** | 询盘按钮失效 | 已列入非范围 + 专项验收 |

**审查发现的两个真风险（已转为验收项 + 实现约束）**：
1. 🔴 **无 JS 基线被折叠/搜索组件破坏** → **强制使用原生 `<details>/<summary>`**，禁止纯 JS 折叠
2. 🔴 **选项搜索框在无 JS 下成为死路** → 搜索是**增强**不是**替代**，无 JS 时选项仍全部可见

## 7. 完成定义

1. 筛选栏 3 项增强（折叠/搜索/计数）+ 卡片 2 项改善（层次/询盘按钮）完成
2. §4 五条护栏全部未破
3. §5 三类验收全通过，产出 QA 测试用例文档（含截图）
4. 34 条筛选器回归不劣化
5. `STATUS.md` 反映新状态；做决定则记入 `DECISIONS.md`
6. **不 commit、不 push、不部署**

## 8. 已知遗留（不属本任务）

- 工作区 175+ 项未提交改动（含 `src/app/fitment/[platform]/page.tsx` 的面包屑改动，非本次所改）
- `work/queued/2026-10-11-qa-followups-pagination-and-e2e-port.md` 挂账的 3 条 QA 问题

---

## 9. 🔴 实测更正（2026-10-11，动手前核查发现）

**§1.1 筛选栏的假设三项，有两项已经实现 —— 不能重复造。**

| Spec 原假设 | 实测 | 结论 |
|---|---|---|
| 「76 个裸 checkbox 全平铺，可用性最差」 | **PCD 组已有专用组件 `PcdSearchGroup`**（`src/components/wheels/pcd-search-group.tsx`） | ⚠️ 假设不成立 |
| 「选项多时加搜索框」 | **`PcdSearchGroup` 已实现搜索**（穿透全部匹配项） | ✅ 已有 |
| 「分组折叠」 | **已实现**（原生 `<details>`；Width 组 `collapseAfter={5}`） | ✅ 已有 |
| 「已选计数 Badge」 | **已实现**（`· N selected`，4 处） | ✅ 已有 |
| 「无 JS 基线风险」 | **已用原生 `<details>`**，风险从设计上已排除 | ✅ 非风险 |

**实测数据**：PCD 32 ｜ Diameter 12 ｜ Width 22 ｜ Process 10 = 76 个 checkbox（原假设数量正确）

**真正的缺口**（这才是本任务该做的）：
1. **只有 PCD 组享受了「搜索 + 折叠」** —— Diameter / Width / Process 仍用朴素 `CheckboxGroup`
   - Width（22 个值）只配了 `collapseAfter={5}`，**没有搜索**
   - Diameter（12 个值）**既无折叠也无搜索**（注释说「6 个值不需要」—— 但实测是 12 个）
   - ⚠️ 代码注释与实际数据量已不符
2. **卡片网格**的两项改善（信息层次 / 询盘按钮醒目）—— **未核查，待实测**

**处置**：§1.1 由「新增三项功能」改为「**把 PCD 组已有的能力对齐到其余组**」（统一组件），
并把「卡片网格」重新实测后再定具体改动点。

⚠️ **不再新增 Astryx 组件到筛选栏** —— 现有实现已经用了正确的原生机制（`<details>` + GET 表单），
换成 Astryx 的 client 折叠组件反而**会引入无 JS 回归风险**。护栏优先。
