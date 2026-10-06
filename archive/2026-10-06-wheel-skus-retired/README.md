# 退休：虚构轮毂 SKU 数据

归档日期：2026-10-06

## 归档内容
- `wheel-skus.ts` —— 16 条虚构 `WheelSku`、`getSkusByFamily()`、`productFamilies`
  以及虚构的 Monoblock / Two-Piece / Off-Road 三分类。

## 为什么归档
`PAGE-SPECS/wheel-catalog.md` §13 与 `wheel-detail.md` §13 都是**替换要求**：
目录页与详情页原本消费这批虚构数据，与真实生产数据（1349 条源记录 → 1219 个唯一型号）
没有任何对应关系。规格要求改读公开轮毂目录模块。

两条路由现已改接 `src/lib/wheels`：

| 路由 | 现在的数据源 |
|---|---|
| `/products/wheels` | `getWheelCataloguePage()` |
| `/products/wheels/[model]` | `getWheelDetailPage()` + `resolvePublishedWheelSelection()` |
| `sitemap.ts` | `listPublishedWheelSlugs()` |
| `/api/inquiries` | `bindWheelEnquiry()` 服务端复核 |

`wheel-skus.ts` 已 **0 处真实引用**后才归档（注释里提到它的地方已改为说明「不 import」）。

## 注意：`WheelSketch` 未归档
`src/components/wheel-gallery.tsx` 的 `WheelSketch`（SVG 轮毂插画）**仍在 `/gallery/wheels`
使用**。那是另一个 PAGE-SPEC（轮毂设计画廊），不在本次两条规格范围内 ——
若要一并退休，需要先处理 `/gallery/wheels` 自身的规格与数据来源。

## 回滚
需要恢复时把 `wheel-skus.ts` 移回 `src/content/` 即可；两条路由需同步改回旧 import。
