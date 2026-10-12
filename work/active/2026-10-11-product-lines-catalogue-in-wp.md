# /products 混合页改造：把 86% 本地区块搬进 WordPress（方案 A）

- **状态**：进行中
- **日期**：2026-10-11
- **前置**：`work/active/2026-10-11-i18n-page-body-classification.md`（盘点结论：`/products` 是唯一混合页）

## 问题

`/products` 的正文来自**两套拼起来**的源：

| 区块 | 来源 | 现状 |
|---|---|---|
| 四张产品线卡片 | ✅ WP `product-lines` 页 | 已可翻译（本轮之前已填 zh）|
| intro（**含 H1**）/ guidance / skuCallout / routes / fitmentSupport / resourceLinks | ❌ `src/content/products.ts` | **恒英文** |
| faqs（6 条） | ❌ `src/content/faq.ts` | 恒英文 |
| DealerCta | ❌ `src/components/sections/dealer-cta.tsx` ← `content/site.ts` | 恒英文 |

→ 实测 `/zh/products` 的 `<h1>` 仍是 `Four product lines`，卡片却是中文 = **半中文页**。

## 🔑 关键前置发现（决定了工作量）

**WordPress 对 `content` 字段是自由 JSON 透传，没有任何 schema 校验。**
实测：`content_by_locale.en` 是 `list`，`zh` 是 `list`，WP 原样存取。

→ **因此 WP 插件（`fenghuai-pages.php`）一行都不用改，也不需要手动改数据库。**
→ 只需改 Next 侧的**类型 + 守卫 + 页面接线**，然后**重新 seed 一次**。

## 设计决定（用户已拍板）

**把 `product-lines` 的 `content` 从「裸数组」改成「包装对象」**：

```jsonc
// before
[ {slug, name, subtitle, summary, ...}, ×4 ]

// after
{
  "lines":     [ {slug, name, subtitle, summary, ...}, ×4 ],   // 原有 4 张卡
  "catalogue": {                                              // 新增：原本地区块
    "intro":            { eyebrow, heading, lede, supporting },
    "guidance":         { eyebrow, heading, lede },
    "skuCallout":       { eyebrow, heading, body, cta: { label, href } },
    "routes":           [ { step, title, body, href, linkLabel }, ×4 ],
    "fitmentSupport":   { eyebrow, heading, lede, points: [string ×4] },
    "resourceLinks":    [ { eyebrow, title, body, href, linkLabel }, ×2 ],
    "faqs":             [ { question, answer }, ×6 ]
  }
}
```

**为什么改形状而不是新开第二个 WP 页**：
- `getProductLines()` **只有一个消费者**（`src/app/products/page.tsx:45`）→ 改造成本可控
- 一个页面 = 一条 WP 记录 → 运营在一个地方编辑，符合直觉
- 复用已验证的 `resolveLocalized()` 回落模式，无新机制

**为什么不是「只搬 intro 一块」**：会留下半中文页，观感比全英文更差（用户已排除）。

## 执行计划

### 1. 类型（`src/content/types.ts` 或就近）
新增：
```ts
export type ProductCatalogueContent = {
  intro: { eyebrow: string; heading: string; lede: string; supporting: string };
  guidance: { eyebrow: string; heading: string; lede: string };
  skuCallout: { eyebrow: string; heading: string; body: string; cta: CtaLink };
  routes: RouteStep[];
  fitmentSupport: { eyebrow: string; heading: string; lede: string; points: string[] };
  resourceLinks: ResourceLink[];
  faqs: FaqEntry[];
};

export type ProductLinesContent = {
  lines: ProductLine[];
  catalogue: ProductCatalogueContent;
};
```

### 2. 本地回落源（新增，不改现有导出）
在 `src/lib/wordpress/product-lines.ts` 里把现有常量**组装**成一个 `localProductLines`：
```ts
const localContent: ProductLinesContent = {
  lines: localProductLines,                       // 现有 4 张卡
  catalogue: {
    intro: catalogueIntro,
    guidance: catalogueGuidance,
    skuCallout: catalogueSkuCallout,
    routes: catalogueRoutes,
    fitmentSupport: catalogueFitmentSupport,
    resourceLinks: catalogueResourceLinks,
    faqs,                                          // from @/content/faq
  },
};
```
⚠️ **不改 `src/content/products.ts` 的任何导出**（其他页可能在用 → 先 grep 确认）。

### 3. 守卫 + 解析器
- `isProductLines` → 改为 `isProductLinesContent`，校验 `lines` 是长度 4 的合法数组 **且** `catalogue` 各字段存在
- 新增 `getProductLinesContent(): Promise<ProductLinesContent>`（走 `resolveLocalized`，scope `product-lines`）
- **保留** `getProductLines()` 兼容导出（内部调新函数取 `.lines`），避免其他引用断裂

### 4. 页面接线（`src/app/products/page.tsx`）
- 删掉 6 个 `@/content/products` 的 import + `faqs` import
- 改成一个 `const content = await getProductLinesContent()`
- 所有 `catalogueIntro.` → `catalogue.intro.`，依此类推；`productLines` → `content.lines`
- **DealerCta**：本轮**不动**（它是共享组件，被多页使用 → 单独切片，避免波及）

### 5. 词表
- `translations_zh.py` 的 `product-lines` 表**从 16 条扩展到覆盖全部新文案**（估 ~50–60 条）
- 生成器已支持嵌套对象/数组 → 无需改逻辑
- ⚠️ **形状守卫会自动发现遗漏**（派生结果与源形状不符则 exit 非零）

### 6. 重新 seed
- WP 里 `product-lines` 的 `content_by_locale.en` **也要更新为新形状**（否则 en 侧守卫失败→回落）
- ⚠️ **要同时更新 `content`（en 正本）与 `content_by_locale.en`** —— 二者在现有数据里是镜像
- zh 用生成器重新产出后 seed

## 完成记录（2026-10-11）

### ✅ 已完成

| 文件 | 改动 |
|---|---|
| `src/content/types.ts` | +`ProductCatalogueContent` / `ProductLinesContent`（复用既有 `ProductLine`/`RouteStep`/`ResourceLink`/`FaqEntry`/`CtaLink`）|
| `src/lib/wordpress/product-lines.ts` | 重写：组装 `localContent`；`isProductLines` → `isProductLinesContent`；新增 `getProductLinesContent()`；**保留 `getProductLines()` 为薄封装** |
| `src/app/products/page.tsx` | 去掉 7 个本地常量 import，改一次 `getProductLinesContent()`，重接 18 处引用 |
| `scripts/i18n/translations_zh.py` | `product-lines` 词表 **16 → 62 条** |
| `scripts/i18n/seed-product-lines-content.php` **(新建)** | 直接 `update_post_meta`（**不触发 `save_post`**）迁移 post 1314 到新形状 |

未动：`fenghuai-pages.php`、`src/content/*.ts`、`site.ts`、`localized-page.ts`、`DealerCta`、`INDEXABLE_LOCALES`

### 🔴 关键发现：英文正本 meta 是独立字段（我原始计划漏了）

我的计划只写了 `content_by_locale`，**这是不够的**：

- **`fh_content_json`（`FH_PAGE_META_CONTENT`）是独立的「英文正本」meta**（插件 :15）
- `normalizeWordpressPage` **对 `en` 读的是 `fields.content`（= 这个正本）**，不是 `content_by_locale.en`（`pages-contract.ts:78-80`）
- → **只写 `content_by_locale` 的话，en 侧会静默回落**
- 实测：首次只写 `content_by_locale` 后，REST 仍返回**旧的裸数组**作为 `content`
- 修法：seeder 同时写 `fh_content_json`（en 正本）+ `content_by_locale.{en,zh}`

📌 **教训：这个项目对英文有「正本 + by_locale 镜像」两份 meta。凡迁移形状必须两份都写**，只写一份会让 en 静默回落（页面照 200，肉眼难发现）。

### 端到端实测（独立复验）

H1 四语言：

| URL | H1 |
|---|---|
| `/products` | `Four product lines` ✅ |
| **`/zh/products`** | **`四条产品线`** ✅ |
| `/es/products`、`/th/products` | 英文 + 日志 `[i18n] fallback locale=es/th scope=product-lines` ✅ |

七块中文覆盖（实测存在）：`四条产品线` / `如何确定订单规格` / `按 SKU 选购产品` / `告知车型信息`（routes[0].title）/ `适配工程随订单一同提供` / `表面处理参考` / `最小起订量` ✅

四张产品线卡片 zh：`轮毂` `电驱铝制壳体` `定制铝制品开发` `自密封轮胎` **未回归** ✅

CJK 计数：`zh/products` **1836** ｜ `en/products` **6**（全是语言下拉的「中文」选项，非泄漏）✅

WP post 1314：`content` / `content_by_locale.en` / `content_by_locale.zh` **三处均为 `{lines(4), catalogue(7 keys)}`**，`locale_status {en:approved, zh:approved}` ✅

### ⚠️ 仍未翻译的（诚实标注，本轮范围外）

`/zh/products` 上仍有 **10 处英文**，全部来自**页面自身的硬编码 JSX**（不是 WP，也不是被搬走的常量）：

| 行 | 字符串 | 性质 |
|---:|---|---|
| L82 | `Four product lines` | **section-B 的 eyebrow**（与 H1 文案巧合重复）|
| L86 | `Four lines, one factory` | 区块标题 |
| L205 | `Request a quote` | 按钮 |
| L209 | `Fitment resources` | 链接文案 |
| L241 | `Keep exploring` | eyebrow |
| L245 | `Related resources` | 区块标题 |
| L285 | `Questions` | eyebrow |
| L289–295 | `Ordering questions, answered` + 其 lede | 区块标题与说明 |
| — | `Wheels, EV components, custom aluminum and self-healing tires — …` | section-B 的 lede |
| — | `Tell us what the part has to do` 等 | **`DealerCta`**（共享组件，按计划本轮不动）|
| — | `Fenghuai` / `English` / `Español` | 品牌名与语言切换器（**不应翻译**）|

📌 **这说明盘点文档 §3 的「5 处硬编码标签」是下限，本页实测是 8 处** —— 与我当时在盘点里写的自我限定（「正则启发式提取，5 处是下限不是上限」）一致。
📌 **这些硬编码字符串本不在本切片范围**（切片范围 = 搬走 `src/content/products.ts` 的七块 + faqs）。要收干净需要再做一刀：给这类内联字面量接 i18n。

### 门禁（全绿）

`npm test` **42/42** ｜ `npx tsc --noEmit` exit 0 ｜ `npx eslint .` **0 error 0 warning** ｜ `npm run build` exit 0 ｜ 无 commit

### 新增术语（本页第一次出现）

`跳动量测量`（runout measurement）｜`车身姿态`（stance）｜`泡棉内衬纸箱`（foam-lined cartons）｜`FOB` 保留原文（行业术语）

### 另一个环境发现

子 agent 在杀 3200 后，**原 supervisor 自动在 3214 拉起了第二个 dev server** → Turbopack 拒绝在 3200 启动，直到杀掉整棵进程树（74318/75555/75673）。
📌 **教训：kill 单个端口不够，要确认整棵树没了再重启**。

## 非范围

- 不动 `DealerCta`（共享组件，另切片）
- 不动 `src/content/*.ts` 的导出结构
- 不解除索引门槛
- 不 commit / push / deploy
- 不做 es / th 翻译（本轮只 zh）

## 纪律（前几轮血泪）

1. **改 WP 数据后必须 `kill` dev server + `rm -rf .next` + 重启** —— 内存缓存删磁盘清不掉
2. **改 globals/令牌后要从「服务端实际吐出的 CSS」验证**，别信源码
3. **抽样动态路由必须从数据源取真实值**，别按命名规律猜
4. **`grep '@/content/'` 要区分「类型 import」与「文案 import」**
