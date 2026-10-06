# PAGE-SPECS 轴心改造：第 N 段 → 视口

- **状态**：待开始
- **创建日期**：2026-10-01
- **领域**：页面规格（PAGE-SPECS）/ 视口原则

## 目标

把 `PAGE-SPECS/` 的组织轴心从「**第 N 段 → 组件**」改为
「**视口 → 段 → 组件 → 内容**」，消除 `DESIGN.md` 与规格之间的结构性不一致。

## 现状

- `DESIGN.md §0.5.6` 已声明**规格轴心应改为「视口 → 段 → 组件 → 内容」**；
- 但 `PAGE-SPECS/` 现有规格仍是**「第 N 段」写法**；
- **文档与规格当前不一致** —— 这是 `STATUS.md` In Progress 第 3 项。

**牵动范围（实测）**：`PAGE-SPECS/` 共 **22 个 `.md`** =
**14 份页面规格** + **5 份 `index.md`**（根 + products/dealers/fitment/insights）
+ **3 份公共文件**（`README.md` / `_components.md` / `_viewport-audit.md`）。

> ⚠️ **数字更正**：任务描述写「牵动 21 份文件」，实测目录内是 **22 份**；
> 且「18 份页面规格」的说法与实测（**14 份**）不符 —— 本任务**顺带修正
> `DEC-015` 与 `CHANGELOG.md [0.1.0]` 里的规格数口径**。

## 待办

1. 定义新轴心的**节次模板**：① 一句话判断 → ② 视口切分（视口表）→
   ③ 逐视口规格（视口内各段 → 组件 → 内容）→ ④ 组件清单 → ⑤ 数据契约 →
   ⑥ 布局响应式 → ⑦ 待补阻塞。
2. 逐份改造 14 份页面规格；`index.md` 5 份（含组件复用矩阵）与
   `_components.md` 随轴心调整。
3. **回改数字**：`DEC-015`、`CHANGELOG.md [0.1.0]` 的规格数改为实测值，
   并说明「`index.md` 是模块索引，不是页面规格」。
4. 与 `_viewport-audit.md` 的 83 个视口切分口径对齐（注意其首页章节已被证伪）。

## 阻塞 / 依赖

- **依赖首页视口划分定案** —— 首页（`index-home.md`）的轴心怎么写，取决于
  `work/queued/homepage-viewport-division-decision.md` 的结论；
  **前一项的结论决定这一项怎么写**（`STATUS.md` 明确此依赖链）。
- **建议顺序**（`STATUS.md` Next Actions #1）：
  `primaryNav` 对齐 → 首页后三段复核 → 本项。本项是三者里**范围最大、最偏
  文档一致性**的一项，优先级应低于前两者。

## 完成后

- 划掉 `STATUS.md` In Progress 第 3 项；
- 在 `DECISIONS.md` 记一条「规格轴心改为视口」的决策（或并入 DEC-015 的修订）。

> **口径说明（2026-10-01 核准）**：`PAGE-SPECS/` 共 **22 个 .md** =
> **18 份路由规格** + **3 份公共文件**（`README.md` / `_components.md` / `_viewport-audit.md`）
> + **1 份模块总表**（`index.md`）。
> ⚠️ `dealers/index.md`、`fitment/index.md`、`insights/index.md`、`products/index.md`
> **是路由 `/dealers` 等页面的规格，不是模块索引** —— 不要按文件名把它们归成索引页。
> 早先出现过「21 份」「19 份」等错数，均已作废。
