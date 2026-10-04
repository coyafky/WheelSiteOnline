# 三条非轮毂产品线的页面架构

- **状态**：已完成
- **创建日期**：2026-10-01
- **领域**：页面架构（ARCHITECTURE/page-architecture）

## 目标

为丰怀四条产品线里**轮毂之外的三条**（EV 三电壳体 / 铝制品定制 / 自修复安全
轮胎）建立页面架构文档，说清每页「给谁看、说明什么、按什么结构搭」。

## 执行结果

产出三份页面架构文档（八段式）：

- `ARCHITECTURE/page-architecture/ev-components-page.md`
- `ARCHITECTURE/page-architecture/custom-aluminum-page.md`
- `ARCHITECTURE/page-architecture/safety-tires-page.md`

并在 `ARCHITECTURE/page-architecture/README.md` 里为三页各加一条索引，
统一标注「**⚠️ 本页无竞品底本**」（实测 README 第 288 / 309 / 328 行）。

三份文档结构同为八段式，与轮毂目录页（`wheel-catalog-page.md`）和关于页
（`about-page.md`）的九段式**刻意不同**。

## 重要结论

1. **这三页没有竞品底本，结构对不上是刻意的。** 竞品 2nforged.com 是**纯轮毂
   公司**，它的 12 个页面里根本没有这三条线。凡是拿这三页去和竞品逐页对比、
   发现结构不一致的地方，都是**刻意设计，不是漏做**（`DEC-016`）。
2. **安全轮胎页有一条品牌归属红线。** 语料库里的「**洛克 LOAKE**」「**航鹏**」
   是**第三方品牌**，归属未定。该页逐段标注归属状态（✅ 丰怀自有 / ⚠️ 归属待定
   / ❌ 第三方专属），并给出两条实现路径：
   - **A 品牌方路径**：确认属丰怀 → 按自有品牌正常呈现
   - **B 合作方路径**：确认属第三方 → 只能以「合作品牌 / 代理」口径呈现
   - **归属确认前该页不上线。** 且该红线不限于本页 —— 任何已上线页面都不得把
     这两个品牌放进「自有产品」语境（`DEC-017`）
3. **EV 三电零件数实测为 17 项**（`ev-components-page.md` 第 356 行「可承接零件
   清单 ✅ 语料 17 项齐」），**不是先前口头说的 20**。文档按 17 项写。
4. **定位 = 能力页 + 预留产品位**（`DEC-016`，用户选项 B）：页面主叙事是
   「我们能做什么」，不列做不到的型号；版式上预留产品位，但**预留位不渲染空
   模块** —— 没有数据的模块不出现，而不是显示一个空壳。
5. **三条线都没型号、没图**，与轮毂线（1349 型号 / 2757 图）形成对照。三条
   产品线对应的 `页面架构 → 页面路由` 落点为 `/products/{ev-components,
   custom-aluminum,safety-tires}`。

## 未解决问题

- **三条线的丰怀待确认数据仍未到位**：EV 的 IATF 16949 认证状态、铝制品的
  「不做清单」、轮胎的品牌归属（见 `STATUS.md` Blockers 与 Open Questions #6）。
- 三条线**均无图**（`Open Questions #7`），产品中心那三条线只能先出能力页。
- 安全轮胎页归属一经确认，需按 A/B 路径改写 B 节措辞，其余骨架复用 —— 这是
  一项**待触发的独立任务**，不在本轮范围内。
- 页面施工图（「照着搭什么」）在 `PAGE-SPECS/products/{ev-components,
  custom-aluminum,safety-tires}.md`，与本架构文档分工不同（见
  `work/completed/page-specs-module-created.md`）。
