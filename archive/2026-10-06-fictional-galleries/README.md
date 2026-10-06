# 退休：两条虚构画廊路由（`/gallery`、`/gallery/wheels`）

归档日期：2026-10-06
决定记录：`DECISIONS.md` **DEC-059**

## 归档内容

目录结构镜像原 `src/` 路径，便于对照与回滚：

| 归档路径 | 原路径 | 内容 |
|---|---|---|
| `app/gallery/page.tsx` | `src/app/gallery/page.tsx` | 车辆画廊首页（172 行） |
| `app/gallery/wheels/page.tsx` | `src/app/gallery/wheels/page.tsx` | 轮毂设计画廊（207 行） |
| `content/builds.ts` | `src/content/builds.ts` | **9 条编造的装车案例** + `buildFamilies` |
| `content/gallery.ts` | `src/content/gallery.ts` | 车辆画廊文案（hero / answer / pathways） |
| `content/wheel-designs.ts` | `src/content/wheel-designs.ts` | **22 个编造的设计名** + 画廊文案 |
| `components/builds-gallery.tsx` | `src/components/builds-gallery.tsx` | 案例筛选网格（251 行） |
| `components/wheel-gallery.tsx` | `src/components/wheel-gallery.tsx` | 设计网格 + **`WheelSketch`**（709 行） |
| `components/sections/gallery-band.tsx` | `src/components/sections/gallery-band.tsx` | **死组件**（0 处 import） |

## 为什么归档

**两条路由发布的都是虚构内容，背后没有任何真实素材：**

- `/gallery`：9 个「completed builds」是编的（`builds.ts` 头部写着 `PLACEHOLDER`），
  而 `public/images/builds/` **0 个文件** —— 没有一张实车照片支撑任何一个案例。
- `/gallery/wheels`：22 个设计名是编的（`wheel-designs.ts` 头部写着 `PLACEHOLDER`），
  用 `WheelSketch` 的 SVG 线稿冒充设计图。

这违反项目的证据纪律（DEC-050 / DEC-053 / DEC-054）：**有证据才渲染，没证据整段不渲染。**

**首页链接早已因为同样理由被撤掉** —— `src/components/wheel-strip-section.tsx` 的注释原文：

> `<GalleryBand>` used to sit here and pointed at `/gallery`, which is **out of scope this phase
> and has no assets — the link led to an empty page. It was removed rather than kept as a promise
> the site cannot keep.**

当时只撤了首页链接，路由本身没撤。本轮把这件事补完。

此外，`/gallery/*` **从来没有 Page SPEC**：现行 `PAGE-SPECS/`、`PAGE-SPECS/index.md`
都没有它；归档基线的 `archive/2026-10-01-document-baseline/PAGE-SPECS/_viewport-audit.md`
自己就写着「规格里没有 `/gallery` 的独立页面规格」，并把 `/gallery` 列在「本阶段不做」表里。
所以「先处理它的规格」这个前置条件并不存在。

## 三条路由的处理

| 路由 | 处理 | 现状 |
|---|---|---|
| `/gallery` | **退场** | 308 永久重定向 → `/fitment` |
| `/gallery/wheels` | **退场** | 308 永久重定向 → `/products/wheels` |
| `/gallery/finishes` | **保留 + 门控** | 页面完整渲染；`noindex, follow`、不发 canonical、不进 sitemap |

- 用 `permanentRedirect()`（**308**），不是 `/manufacturing`、`/resources` 用的
  `redirect()`（**307**）。**差异是有意的**：那两条是「改名」，这里是**永久退场**。
- `/gallery/finishes` **不在本归档内**（它原地保留）：8 个色名仍是占位、无真实色板实拍，
  但页面**对用户诚实**（明写 swatch 是示意、引导索取实物样卡），所以它是**门控**不是下架。
  门槛 = `src/content/finish-guide.ts` 的 `finishesPage.publicationGate.finishNamesConfirmed`。

## 回滚

把本目录下 `app/`、`components/`、`content/` 三棵树按上表的「原路径」搬回 `src/` 即可：

```sh
A=archive/2026-10-06-fictional-galleries
mv "$A/app/gallery/page.tsx"        src/app/gallery/page.tsx          # 覆盖重定向文件
mv "$A/app/gallery/wheels"          src/app/gallery/wheels
mv "$A/content/builds.ts"           src/content/builds.ts
mv "$A/content/gallery.ts"          src/content/gallery.ts
mv "$A/content/wheel-designs.ts"    src/content/wheel-designs.ts
mv "$A/components/builds-gallery.tsx"        src/components/builds-gallery.tsx
mv "$A/components/wheel-gallery.tsx"         src/components/wheel-gallery.tsx
mv "$A/components/sections/gallery-band.tsx" src/components/sections/gallery-band.tsx
```

同时需还原：`src/app/sitemap.ts` 的两条 URL 与 `/gallery/finishes` 的无条件收录；
`src/content/products.ts` / `fitment.ts` / `finish-guide.ts` 里被删的 4 张卡片；
`src/app/fitment/page.tsx` 与 `src/app/fitment/[platform]/page.tsx` 里被删的 CTA 按钮。
（`gallery-band.tsx` 回滚后仍是死组件 —— 它从来就没有消费方。）

## 注意：`WheelSketch` 已随本轮归档

`src/components/wheel-gallery.tsx` 的 `WheelSketch`（SVG 轮毂插画）在 `src/` 内**无其它消费方**，
已与 `/gallery/wheels` 一起归档。这**纠正了** `archive/2026-10-06-wheel-skus-retired/README.md`
里的旧说法（「那是另一个 PAGE-SPEC」）—— 见 DEC-059。
