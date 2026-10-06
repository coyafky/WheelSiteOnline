# 组件库参考 —— 现有 19 个组件 + 设计系统 token

> **本文件是 PAGE-SPECS 各页规格的公共引用。** 规格里写「复用 `<X>`」时，
> 详情都在这里。**本文件不含规划，只记现状。**

- 核查日期：2026-10-01（实测源码，非推断）
- 上位：`../ARCHITECTURE/tech-architecture/README.md`

---

## 1. 设计系统 token（**⚠️ 无 `tailwind.config`**）

项目用 **Tailwind v4 CSS-first 配置** —— 全部 token 在 `src/app/globals.css`。
**写规格时引用 `globals.css` 行号，不要去改配置文件**（它不存在）。

### 1.1 品牌色（`globals.css:41-93`）

| `@theme` token | 值 | 用途提示 |
|---|---|---|
| `--color-ink` | `#0b0f16` | **最深**：深色段底 / 页脚 |
| `--color-graphite` | `#151a23` | 次深：深色卡片 |
| `--color-panel` | `#1f2733` | 深色段内的面板 |
| `--color-steel` | `#5d6a7d` | **正文灰**（次要文字） |
| `--color-muted` | `#dfe3ea` | 分隔线 / 边框 |
| `--color-soft` | `#f5f7fa` | **浅底**（区块交替色） |
| `--color-forge` | `#c2650a` | **★ 品牌主色**（橙 / CTA / eyebrow） |
| `--color-forge-deep` | `#8a4406` | 主色深阶（hover） |
| `--color-forge-soft` | `#fdf3e7` | 主色浅阶（底色） |

### 1.2 字体（`globals.css:20-28` + `layout.tsx:9-21`）

| token | 实际字体 | 用在哪 |
|---|---|---|
| `--font-text` / `font-sans` | **Inter**（next/font/google） | 正文 |
| `--font-display` / `font-display` | **Barlow Condensed** 500/600/700/800 | **标题 / eyebrow / 数字 / wordmark** |

**⚠️ 纪律**：标题一律 `font-display` + uppercase + `tracking-[0.0xem]`。
数字（统计带、规格表）也用 `font-display`（瘦长，视觉锚点）。

### 1.3 圆角 / 容器 / 动效

| 类别 | token | 值 |
|---|---|---|
| 圆角 | `--radius` | `6px`（sm/md/lg/xl 按 0.6/0.8/1/1.4 派生） |
| **容器** | `--container-fh` | **1180px** |
| | `--container-fh-wide` | **1440px** |
| 动效 | `--motion-duration-reveal` | `760ms` |
| | `--motion-ease-out` | `cubic-bezier(0.16,1,0.3,1)` |
| | `--motion-distance-reveal` | `14px` |
| | `--motion-stagger-step` | `80ms` |
| | `--motion-duration-parallax` | `120ms` |
| | `--motion-parallax-y` | `8px` |

**⚠️ 无自定义 spacing token** —— 间距全用 Tailwind 默认刻度（`py-16` `gap-6`…）。

### 1.4 全局 utility 类（`globals.css`）

| 类 | 定义 | 说明 |
|---|---|---|
| `.container-fh` | `width: min(calc(100% - 40px), 1180px)` | **标准内容容器** |
| `.container-fh-wide` | `width: min(calc(100% - 32px), 1440px)` | **全宽容器**（网格类页面用） |
| `.eyebrow` | display 字体 / `0.76rem` / `tracking .14em` / uppercase / forge 色 | **每段的小标签**，全站统一 |
| `.btn-pill` | 药丸基类，`min-height:48px`，`padding-inline:26px`，`radius:999px` | 按钮基类 |
| `.btn-pill-solid` | + forge 底 + 白字 | **主 CTA** |
| `.btn-pill-outline` | + 透明底 + `2px solid currentColor` | **次 CTA** |

### 1.5 动效钩子（**fail-visible 设计**）

| 钩子 | 作用 |
|---|---|
| `[data-reveal]` | 单元素淡入上移 |
| `[data-reveal-group]` | **子元素错峰**揭示（`--motion-stagger-step` 80ms） |
| `[data-parallax-media]` | 视差 |

**⚠️ fail-visible**：内容**默认可见**，只有 JS 给 `<html>` 加 `data-motion-armed`
后才隐藏未揭示元素（`globals.css:224-267` 注释）。
**→ 写新组件时不要自己加 `opacity-0`，否则 JS 挂了内容就没了。**

关键帧：`fh-nudge`（`globals.css:322-336`）—— 右下角询盘按钮的轻推循环。

---

## 2. 现有组件清单（19 文件 / 20 导出）

**全部命名导出，无 default export。**

### 2.1 全局布局组件（挂载点 = `src/app/layout.tsx:33-44`，唯一）

| 组件 | 文件 | 行 | 挂载 |
|---|---|---|---|
| `<SiteMotion>` | `site-motion.tsx` | 9 | `layout.tsx:34`（渲染 null，只挂观察器） |
| `<SiteHeader>` | `site-header.tsx` | 282 | `layout.tsx:35` |
| `<SiteFooter>` | `site-footer.tsx` | 86 | `layout.tsx:39` |
| `<FloatingQuote>` | `floating-quote.tsx` | 39 | `layout.tsx:40`（`/contact` 上自动隐藏） |

**⚠️ 没有嵌套 layout、没有 `loading.tsx` / `error.tsx` / `not-found.tsx` / `template.tsx`。**

### 2.2 跨页复用组件

| 组件 | 文件 | 行 | client | props | 复用度 |
|---|---|---|---|---|---|
| **`<DealerCta>`** | `sections/dealer-cta.tsx` | 51 | ❌ | `{ title?, body? }` | **21 处**（几乎每页页脚）|
| `<WheelSketch>` | `wheel-gallery.tsx` | — | ✅ | 数据驱动 | 3 页 |
| `<ProductCard>` | `product-card.tsx` | 97 | ✅ | `{ family, className? }` | 2 处 |
| `<LegalDocumentPage>` | `legal-document.tsx` | 261 | ❌ | `{ doc }` | 5 个 support 页 |

**★ `<DealerCta>` 是全站复用冠军** —— 任何页面收尾默认用它，除非该页有自己的收尾设计。

### 2.3 页面级组件（只服务一页）

| 组件 | 文件 | 行 | 服务页面 | client |
|---|---|---|---|---|
| `<HomeHero>` | `sections/home-hero.tsx` | 63 | `/` | ❌ |
| `<TrustStrip>` | `sections/trust-strip.tsx` | 36 | `/` | ❌ |
| `<ProductShowcase>` | `sections/product-showcase.tsx` | 54 | `/` | ❌ |
| `<GalleryBand>` | `sections/gallery-band.tsx` | 48 | `/` | ❌ |
| `<WheelGallery>` | `wheel-gallery.tsx` | 709 | `/gallery/wheels` | ✅ |
| `<BuildsGallery>` | `builds-gallery.tsx` | 251 | `/gallery` | ✅ |
| `<GuidesAccordion>` | `guides-accordion.tsx` | 210 | `/resources` | ✅ |
| `<ProseArticle>` | `prose-article.tsx` | 260 | `/resources/[slug]` | ❌ |
| `<ProcessExplorer>` | `process-explorer.tsx` | 256 | `/manufacturing` | ✅ |
| `<OffsetCalculator>` | `offset-calculator.tsx` | 512 | `/tools/offset-calculator` | ✅ |
| `<InquiryForm>` | `inquiry-form.tsx` | 566 | `/contact` | ✅ |

### 2.4 ⚠️ 当前未被使用的组件

**`ui/button.tsx`（`Button` / `buttonVariants`）零 import** —— shadcn 脚手架残留。
站点实际全部用 `.btn-pill-*` CSS 类。
**→ 规格里写按钮时用 `className="btn-pill-solid"`，不要写 `<Button>`。**

---

## 3. 内容层 `src/content/`（21 模块 / `types.ts` 38 个类型）

### 3.1 页面 → content 映射

| 页面 | import 的模块 |
|---|---|
| `/` | （无直接 import，全靠组件） |
| `/about` | `about` |
| `/contact` | `contact` `products` `site` |
| `/dealers` | `dealer-programs` `faq` |
| `/dealers/private-label` | `private-label` |
| `/fitment` `/fitment/[platform]` | `fitment` |
| ~~`/gallery`~~ | ~~`gallery` `builds`~~ ← **本阶段不做**（见 `index.md` §1 暂缓表） |
| ~~`/gallery/finishes`~~ | ~~`finish-guide` `finishes`~~ ← **本阶段不做** |
| `/gallery/wheels` | `wheel-designs` |
| `/manufacturing` | `process` |
| `/products` | `products` `faq` |
| `/products/[slug]` | `products` `wheel-skus` |
| `/products/wheels` | `wheel-skus` `products` |
| `/products/wheels/[sku]` | `wheel-skus` `products` `resources` `wheel-designs` |
| `/resources` `/resources/[slug]` | `resources` |
| `/resources/bolt-patterns/*` | `bolt-patterns` |
| `/support/*` | `legal` |
| ~~`/tools`~~ ~~`/tools/offset-calculator`~~ | ~~`tools`~~ ← **本阶段不做** |

### 3.2 ⚠️ 组件级消费（页面不直接 import 的）

| 模块 | 谁在消费 |
|---|---|
| `content/capabilities` | 只有 `<TrustStrip>` |
| `content/site` | `<SiteHeader>` `<SiteFooter>` `layout.tsx` metadata |

### 3.3 ⚠️ 轮毂真实数据 vs `wheel-skus`

| 文件 | 内容 | 状态 |
|---|---|---|
| `content/wheel-skus.ts`（342 行，16 SKU） | 克隆原型的示意数据 | ⚠️ **不是真实目录** |
| `content/wheel-designs.ts`（396 行） | 25 个设计 + 4 轴 facet | ⚠️ 全部 `hasRender:false` |
| **`assets/wheel-data/WHEEL-CATALOG-ALL.json`** | **1349 型号 / 3485 variant（真实）** | ⚠️ **尚未接进 `src/`** |

**→ 写轮毂页规格时注意：真实目录在 `assets/`，类型层（`WheelModel`）虽已定义但未接数据。**

---

## 4. 图标与图表

| 项 | 现状 |
|---|---|
| 图标库 | **`lucide-react ^1.6.0`**（唯一），已用 24 个图标 |
| 手绘 SVG | `<WheelSketch>`（数据驱动技术线稿，代实拍图） |
| 图表库 | **无**（无 recharts / d3 / visx / nivo / chart.js） |
| UI 原语库 | `@base-ui/react`（仅 `ui/button.tsx` 用） |

**常用 lucide 图标**：`ArrowRight` `ArrowUpRight` `Check` `ChevronDown`
`CircleAlert` `CircleHelp` `Filter` `Info` `Lock` `Phone` `RotateCcw` `Search`
`ShieldQuestion` `Ship` `TriangleAlert` `Wrench` `X`

---

## 5. 🔴 图片资产的真相（**写规格时必须知道**）

| 位置 | 实况 |
|---|---|
| `public/images/` | ⚠️ **只有 `.gitkeep`，零张真实图片** |
| `public/images/products/` | ❌ **不存在**（但 `content/products.ts` 指向它） |
| `public/videos/` `public/seo/` | 只有 `.gitkeep` |
| `assets/preview-media/` | 20 个文件（`ev-*` `custom-*` `tire-*` `wheel-0~3` `factory.webp`） |
| `assets/wheel-images-webp/` | 2757 张轮毂 WebP |
| **两者关系** | ⚠️ **代码零引用 `assets/`** —— 完全脱钩，是离线素材 |

**→ 三个后果**：
1. **所有页面当前都在跑占位降级**（`ProductCard` 有 `hasRender` + `onError` 回退）
2. 规格里的「图片从哪来」必须写明 **`assets/` → `public/` 的搬运步骤**
3. 按 `ARCHITECTURE/page-architecture/README.md` 「**无图不上架**」纪律，
   **图片未接入前，产品网格类页面无法按规格完整实现**

---

## 6. 路由现状（31 个 app 文件 / 26 个页面路由）

```
/  /about  /contact
/dealers  /dealers/private-label
/fitment  /fitment/[platform]
/gallery  /gallery/finishes  /gallery/wheels
/manufacturing
/products  /products/[slug]
/products/wheels  /products/wheels/[sku]
/resources  /resources/[slug]
/resources/bolt-patterns  /resources/bolt-patterns/[pattern]
/support/{privacy,returns,shipping,terms,warranty}
/tools  /tools/offset-calculator
+ robots.ts / sitemap.ts
```

**⚠️ 与 `ARCHITECTURE/page-architecture/README.md` 的目标站点地图的差异**：

| 目标（README §1） | 现状 | 动作 |
|---|---|---|
| `/capabilities` | `/manufacturing` | **改路由名** |
| `/insights/*` | `/resources/*` | **改路由名** |
| `/products/wheels/[model]` | `[sku]` | **改动态段名** |
| `/products/ev-components` 等三线 | 不存在 | 新建 |
| `/request-a-quote` `/thank-you` `/privacy-policy` | 不存在 | 新建 |
| `/gallery/wheels` | 存在 | **合并进 `/products/wheels`** |
