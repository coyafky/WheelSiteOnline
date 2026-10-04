# 首页 Hero 重做与结构拆分

- **状态**：已完成
- **创建日期**：2026-10-01
- **领域**：首页 / 组件

## 目标

按用户给出的 Hero PageSpec（35 节 + 10 条验收标准）重做首页 Hero，并让首页
的信息架构与丰怀**四条产品线**的事实一致。

## 执行结果

**交付组件**（实测）：

```
src/components/home/hero/home-hero.tsx
src/components/home/hero/hero-background.tsx
src/components/home/hero/hero-product-card.tsx
src/components/home/hero/hero-product-grid.tsx
src/content/homepage-hero.ts        ← Hero 内容数据
```

**新增图片**（实测）：`public/images/hero/` 3 张汽车背景图
（`hero-01/02/03.webp`）+ `public/images/cards/` 4 张产品线卡图
（`card-wheels / card-ev / card-aluminum / card-tires.webp`），全部 WebP
（**36–115 KB**），由 micu-image MCP / gpt-image-2 生成。

**新增 token**：`--fh-hero`（`#05070a`）。

**首页当前结构**（`src/app/page.tsx`，实测）：

```
<HomeHero />        ← 我们是谁
<TrustStrip />
<ProductShowcase /> ← 四条产品线
<GalleryBand />
<DealerCta />
```

## 重要结论

1. **Hero 拆分：品牌独占一屏，四张产品卡移出**（`DEC-022`）。根因（实测）：
   **Hero 里 7 个出口挤一屏**（4 张产品卡 + 2 个 CTA + 导航），而视口上限是
   1 + 2 = 3（`DEC-020`）；更麻烦的是**两个入口争同一次点击** —— 右栏卡片指向
   `/products/wheels`，主 CTA 指向 `/products`，用户点哪个都在说「我想看产品」
   却落到不同地方。
2. **`ProductShowcase` 从「竞品三分类」改造为四条产品线**：原「三宫格锻造轮毂」
   是把**竞品**（纯轮毂公司）的业务切法搬了过来，改后首页不再自相矛盾
   （`AGENTS.md` §7.8：竞品结构按竞品业务切，需重新判断）。
3. **新增 `--fh-hero`（`#05070a`）** —— 收编一个**存在已久但未 token 化的
   第 4 阶深色**（原 `home-hero.tsx` / `gallery-band.tsx` 用的是裸 hex
   `#05070b`）。`--fh-hero` 从此是深色的第 4 阶，新增深色场景应优先复用而不是
   新写 hex（符合 `AGENTS.md` §7.3：用 token，不用裸 hex）。
4. **顺带修了两个真 bug（不是美化）**：
   - ① **`.btn-pill` 缺 `white-space: nowrap`** → header 的 `REQUEST A QUOTE`
     **折成两行**（高 106px → 修后 157px 的问题消除）。
   - ② **`w-full` 覆盖了 `.container-fh` 的 width** → 首页左右**贴边出血**
     （实测左列 x=0、卡片右缘 1440）→ 修后 **130/1310 对称**。
   - ⚠️ `w-full` 覆盖容器类这条属于**我引入的回归**：在重做 Hero 时给外层加了
     `w-full`，把 `.container-fh` 的左右内边距挤掉了。**教训**：容器类与宽度
     工具类同时出现在一个元素上时，工具类会静默改写容器契约 —— 排查布局出血
     要先看有没有这类覆盖。
5. **Header 透明态**：`bg-transparent` → **`bg-hero/72 + backdrop-blur-xl`**
   （让背景透出来）。**浮动 CTA**：首页**滚动 30% 后**才出现（其他页恒显），
   且指向 `/request-a-quote`。

## 未解决问题

- **首页后三段（`TrustStrip` / `GalleryBand` / `DealerCta`）尚未按视口原则
  复核** —— Hero 已改，其余三段待议。
  → 后续任务见 `work/queued/homepage-remaining-sections-viewport-review.md`。
- **首页视口划分的正式定案尚未做**：`PAGE-SPECS/index-home.md` 与
  `_viewport-audit.md` 的首页章节前提已失效。
  → 后续任务见 `work/queued/homepage-viewport-division-decision.md`。
- **`ProductShowcase` 改四条线后，与 `primaryNav`（header 下拉仍是旧结构）不一致** ——
  header 的 Products 下拉仍是 `All Wheels / Monoblock / Two-Piece / Off-Road`。
  → 后续任务见 `work/queued/primary-nav-align-with-footer.md`。
- **Hero 图片是生成素材**（gpt-image-2），非真实工厂/产品照片；上线前需评估是否
  用真实素材替换（关联 `STATUS.md` Open Questions #7 三条线无图）。
