# primaryNav 对齐四条产品线

- **状态**：待开始
- **创建日期**：2026-10-01
- **领域**：站点框架 / 内容接缝（`src/content/site.ts`）

## 目标

让 header 的产品入口与 footer、与「丰怀四条产品线」的事实一致，消除
**已上线的 header / footer 不一致**。

## 现状

实测 `src/content/site.ts` 第 41 行 `primaryNav`，Products 下拉仍是旧结构：

```
Products
├── All Wheels            → /products
├── Monoblock Wheels      → /products/monoblock
├── Two-Piece Forged Wheels → /products/two-piece
└── Off-Road & Truck      → /products/off-road
```

**没有三条能力线**（EV 三电壳体 / 铝制品定制 / 安全轮胎）。而 `footerNav` 的
Products 组已改为四条产品线（含 `ev-components` / `custom-aluminum` /
`safety-tires`）→ **两边不一致**。

根本问题：`/products/monoblock`、`/products/two-piece`、`/products/off-road`
是**竞品的业务切法**，`src/content/products.ts` 的 `productFamilies` 仍是这
**3 个虚构系列**，`/products/[slug]` 仍按它们出页（`ARCHITECTURE.md` §6.2）。
header 沿用了竞品三分类，等于用户看到的产品入口仍是竞品视角。

## 待办

1. 把 `primaryNav` 的 Products 组改为**四条产品线**（与 footer 一致）：
   轮毂 / EV 三电壳体 / 铝制品定制 / 安全轮胎。
2. 判断 `productFamilies`（3 个虚构系列）与 `/products/[slug]` 的处置 ——
   这是 header 对齐的前置：**入口指向哪里，取决于信息架构怎么切**
   （`STATUS.md` Next Actions #2「前端业务改造」）。
3. 更新后核查 `AGENTS.md` §9：lint / typecheck / build 三绿，且无新增
   `PLACEHOLDER`。

## 阻塞 / 依赖

- **不是纯文案改动** —— 若只改 `primaryNav` 字面值而 `productFamilies` 与
  `/products/[slug]` 未动，会造出「导航指向四条线、路由只有三条虚构系列」的
  新不一致。**需与「前端业务改造」一并定案。**
- 安全轮胎线在归属确认前不上线（`DEC-017`）—— header 是否暴露该入口需一并决定。
- `STATUS.md` 把它列为 **In Progress 中优先级最高**的一项：它是**已上线的不
  一致**，而另两项（首页后三段复核、PAGE-SPECS 轴心）是文档一致性。

## 完成后

关闭时把 `STATUS.md` 的 Blockers 表里「`primaryNav` 仍是旧结构」一行移除，
并在 In Progress 中划掉对应条目。
