# 正文多语言填充前：页面内容来源分类（只读盘点）

- **状态**：盘点完成，待拍板
- **日期**：2026-10-11
- **性质**：**只读调查，零代码改动、零数据写入**
- **目的**：回答「哪几页填 WP 就能中文、哪几页必须先做内容层改造」

## 结论（一句话）

**5 个页面里，4 个是「纯 WP 托管」可以直接填；只有 `/products` 是混合页，需要先改内容层。**

⚠️ 但即使那 4 个「纯 WP」页，仍有**共约 5 处硬编码 UI 标签**不在 WP 里，
→ **填完 WP 后它们会留在英文**，必须单独处理（详见 §3）。

---

## 1. 分类总表

| 页面 | WP post | 页面正文来源 | 分类 | 能否直接填？ |
|---|---:|---|---|---|
| `/capabilities` | 1313 | **100% WP** | **A 纯 WP** | ✅ 直接填 |
| `/products/ev-components` | 1315 | **100% WP** + 1 处硬编码标签 | **A 纯 WP** | ✅ 填 + 补 1 标签 |
| `/products/custom-aluminum` | 1316 | **100% WP** + 4 处硬编码标签 | **A 纯 WP** | ✅ 填 + 补 4 标签 |
| `/products/safety-tires` | 1317 | **100% WP** | **A 纯 WP** | ✅ 直接填 |
| **`/products`** | 1314 | **约 14% WP / 86% 本地常量** | **B 混合页** | ❌ 需先做内容层改造 |

判定依据（每条都实测）：

- 4 个 A 类页面 `src/app/*/page.tsx` **只 import WP 适配器，零 `@/content/*` 文案 import**
- `/products` 同时 import `getProductLines`（WP）**和 6 个本地常量块 + faq**

---

## 2. B 类：`/products` 的精确拆解

### 2.1 WP 托管的部分（约 14%）

| 区块 | 来源 |
|---|---|
| 四张产品线卡片（名称/副标题/摘要/图/href） | ✅ WordPress `product-lines` 页 |

实测：`/zh/products` 的四张卡**已渲染中文**（`轮毂` / `电驱铝制壳体` / `定制铝制品开发` / `自密封轮胎`）——
因为这一页的 `product-lines` 词表我上一轮已经填好并 seed 了。

### 2.2 本地常量托管的部分（约 86%，**全部仍为英文**）

| 区块 | 本地来源 | 实测证据 |
|---|---|---|
| eyebrow / **H1** / lede / supporting | `src/content/products.ts` → `catalogueIntro` | 实测 `/zh/products` 的 **H1 = 「Four product lines」（英文）** |
| 能力指引（eyebrow/heading/lede） | `catalogueGuidance` | 同文件 |
| SKU 说明 + CTA 标签 | `catalogueSkuCallout` | 同文件 |
| 4 条工艺路线（title/body） | `catalogueRoutes` | 同文件 |
| 适配支持（eyebrow/heading/lede/points） | `catalogueFitmentSupport` | 同文件 |
| 相关资源链接 | `catalogueResourceLinks` | 同文件 |
| **FAQ 全部问答** | `src/content/faq.ts` → `faqs` | `products/page.tsx:12` import |
| 底部 CTA | `src/components/sections/dealer-cta.tsx` ← `src/content/site.ts` | `dealer-cta.tsx:3` import |

**页面上 8 处硬编码 JSX 文本**（实测提取）：
`Four product lines` · `Four lines, one factory` · `Request a quote` ·
`Fitment resources` · `Keep exploring` · `Related resources` · `Questions` · `Ordering questions, answered`

### 2.3 为什么它是混合页（结构性原因）

`/products` 是**产品线索引页**，它的职责是「介绍四条线 + 路由到子页 + FAQ」，
而 WordPress 侧的 `product-lines` 页只被设计成托管**四张卡的数据**（一个 `ProductLine[]` 数组）。

**这不是 bug，是当初的接缝只开在卡片那一层。** 其余 6 个区块从没被搬进 WP。

---

## 3. A 类页面的「硬编码 UI 标签」清单（填 WP 后仍会是英文）

这些不在 WP 内容里，`make-locale-content.py` 覆盖不到 —— **必须单独处理**。

| 页面 | 行号 | 字符串 | 性质 |
|---|---:|---|---|
| ev-components | `ev-components-page.tsx:252` | `Stated in supplier material` | **证据等级徽标**（`claimStatus === "supplier-stated"` 时显示）|
| custom-aluminum | `custom-aluminum-page.tsx:216` | `Accepted as an engineering input` | 输入类型标签 |
| custom-aluminum | `custom-aluminum-page.tsx:325` | `Start with this group` | 分组引导 |
| custom-aluminum | `custom-aluminum-page.tsx:400` | `Start with this input` | 输入引导 |
| custom-aluminum | `custom-aluminum-page.tsx:643` | `Not taken on`（**还兼任 `aria-label`**）| 边界声明标题 |

⚠️ 两点要注意：

1. **`Stated in supplier material` 是证据等级标记**，与英文的 `supplier-stated` 是**同一件事的两种呈现**
   → 中文应统一为「供应商自述」，与我在词表里给 `supplier-stated` 的译法**保持一致**（否则同一概念两种说法）
2. **`Not taken on` 同时是可见标题和 `aria-label`** → 改文案会**同时影响无障碍名称**，要一起改

补充：`capabilities` 与 `safety-tires` 的两个页面组件实测 **0 处硬编码 JSX 字符串**，是四个里最干净的。

---

## 4. 一个容易误判的点：`automotiveScenes`

`ev-components` 与 `safety-tires` 都 import 了 `@/content/automotive-scenes`，
看 import 会以为「有本地文案泄漏」—— **实测不是**：

```ts
export const automotiveScenes = {
  evAssessment: { src: "/images/generated/ev-crossover-campus-hero.webp", focalPoint: "right" },
  selfSealingHero: { src: "/images/generated/safety-suv-rain-hero.webp", focalPoint: "right" },
}
```

- 只有**图片路径 + 焦点位**，**零用户可见文本**
- 文件头注释明确写着：这些是**合成装饰图**，必须当装饰处理（空 alt / aria-hidden）
- → **不需要翻译，不是本轮的缺口**（我已排除，避免后续误报）

---

## 5. 类型 import 与文案 import 的区分（避免重复误判）

三个页面组件有 `from "@/content/..."` 命中，但性质不同：

| 文件 | import 内容 | 是否文案 |
|---|---|---|
| `wheel-capabilities.tsx:11` | `from "@/content/types"` | ❌ **纯类型**（`MediaAsset` 等） |
| `self-sealing-tire-page.tsx:17` | `from "@/content/types"` | ❌ **纯类型** |
| `ev-components-page.tsx:6` | `from "@/content/types"` | ❌ **纯类型** |
| `ev-components-page.tsx:5` | `automotiveScenes` | ❌ 仅图片路径（见 §4） |
| `self-sealing-tire-page.tsx:19` | `automotiveScenes` | ❌ 仅图片路径 |

📌 **判定纪律**：`grep '@/content/'` 的命中**必须区分「类型」与「值」**——
`import type` / `content/types` 是编译期的东西，**与多语言无关**。
我在本轮一开始就差点把它们记成「本地文案泄漏」。

---

## 6. 待拍板：`/products` 怎么处理？

两条路，成本差一个量级：

### 方案 A · 把 `/products` 的本地区块也搬进 WP（推荐）
- 给 WP `product-lines` 页新增字段（如 `catalogue: { intro, guidance, skuCallout, routes, fitmentSupport, resourceLinks, faqs }`）
- 前端 `catalogueIntro` 等常量改为**从 WP 解析 + 本地回落**（复用已验证的 `resolveLocalized` 模式）
- ✅ 一次性解决，之后 `/es` `/th` 也自动可用；✅ 运营能在后台改文案
- ⚠️ 成本：要扩 WP 字段契约 + 改 6 处 import + 写一批词条

### 方案 B · 只做 WP 那 14%（不碰本地常量）
- `/zh/products` = 卡片中文 + 其余 86% 英文
- ⚠️ **会造成「半中文页」**，观感比全英文更差（用户会以为翻译坏了）
- ❌ 我不建议

### 方案 C · 先跳过 `/products`，把 4 个 A 类页做完
- 4 页都是纯 WP，**填完就是完整中文页**，无半成品风险
- ✅ 风险最低、当日可交付；⚠️ 但 `/products` 是产品线入口，缺它导航链不完整

**我的建议：C 先做（立刻拿到 4 个完整中文页）→ 再按 A 的结构化改造 `/products`。**
理由：A 需要动 WP 契约与 6 处 import，是**独立的一个切片**，不该和「填 4 页」混在一次交付里。

---

## 7. 本盘点的方法与边界（诚实标注）

**做了什么**：
- 逐页读 `page.tsx` 的 import 与 JSX
- 逐页下钻到它渲染的组件，检查是否二次 import 本地文案
- 用脚本提取每页的硬编码 JSX 文本与属性字面量
- 用 live REST（`127.0.0.1:8081`）核对 WP payload 的 top-level keys 与组件所需字段是否匹配

**没做什么（边界）**：
- ❌ **未修改任何文件、未写入任何数据**（本轮是只读盘点）
- ❌ **只盘了这 5 个页面**（用户指定的范围）；26 个非 WP 页面、Insights、support/* 法律页**未在本轮范围**
- ❌ 未核 `SiteHeader` / `SiteFooter`（已知走字典，不在正文范围）
- ⚠️ 硬编码文本提取用的是**正则启发式**（`>text<` 与属性字面量），
  可能漏掉跨行 JSX 或三元表达式里的字符串 → **§3 的 5 处是下限，不是上限**；
  正式填充时应以「渲染后仍出现英文」为准做一次实测复核
- ⚠️ `/products` 的「14% / 86%」是按**区块数与文案量级**的估算，不是字符级精确统计
