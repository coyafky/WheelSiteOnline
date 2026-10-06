# 首页后三段视口复核

- **状态**：待开始
- **创建日期**：2026-10-01
- **领域**：首页 / 视口原则（`DESIGN.md` §0.5）

## 目标

按视口驱动原则（`DEC-020`）复核首页 Hero 之后的三个段，判断每段回答什么问题、
有无重复，并给出「保留 / 合并 / 删除」的结论。

## 现状

首页实测结构（`src/app/page.tsx`）：

```
<HomeHero />         ← 已按视口原则重做（DEC-022）
<TrustStrip />       ← 待复核
<ProductShowcase />  ← 已改为四条产品线（DEC-022 顺带）
<GalleryBand />      ← 待复核
<DealerCta />        ← 待复核
```

**`TrustStrip` / `GalleryBand` / `DealerCta` 尚未按「一视口一核心问题 + 合并
或删除律」复核。** 这是 `STATUS.md` In Progress 第 1 项。

## 待办

1. 对三段逐段回答：**它回答了哪个前面没回答过的问题？**
   （依「合并或删除律」：答不上来 → 合并或删除）
2. 特别核查**重复**：
   - `TrustStrip`（信任）与后续页面的信任区是否重复回答同一问题
   - `GalleryBand`（画廊）与 `/gallery` 路由的关系 —— 首页这段是否只是把路由
     内容再放一遍（属「重复回答」的典型嫌疑）
   - `DealerCta`（经销商行动号召）与 header 浮动 CTA / `/request-a-quote`
     的关系 —— 是否构成同一意图的第二出口
3. 给出每段的处置并落到 `PAGE-SPECS/index-home.md` 的骨架更新。

## 阻塞 / 依赖

- **依赖首页视口划分的正式定案** —— 若
  `work/queued/homepage-viewport-division-decision.md` 先定了首页整页切成几个
  视口，本任务的逐段判定会更省事；反之本任务的结论又应回喂给那个定案。
  **两项需一起做或明确先后。**
- `PAGE-SPECS/_viewport-audit.md` 的首页章节前提已被证伪（见其「前提更正」段），
  本任务不能直接沿用那份报告的首页结论。

## 完成后

- 更新 `PAGE-SPECS/index-home.md`；
- 若某段被删/合并，需在 `DESIGN.md` §6「已知裂缝」或 CHANGELOG 里记录；
- 划掉 `STATUS.md` In Progress 第 1 项。
