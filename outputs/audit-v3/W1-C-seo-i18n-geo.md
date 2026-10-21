# Wave 1 · Agent C · SEO / 多语言 / GEO 审计

> 审计对象：`/Users/fkycoya/Documents/Code/WordpressWheelSIte`
> 采集时间：2026-10-17
> 文件域：`src/lib/i18n/**`、`src/app/layout.tsx`、`src/proxy.ts`、`src/app/sitemap.ts`、`src/app/robots.ts`、`src/app/llms.txt/**`、38 个 `page.tsx` 的 metadata、`src/lib/site-url.ts`、`src/lib/wordpress/{homepage,pages,insights}.ts`、含 JSON-LD 的组件、`PAGE-SPECS/**`、`src/content/{faq,fitment}.ts`
> **纪律声明**：本报告只使用 E1（源码）与 E5（BASELINE 实测）。历史报告一律降级为 E3、`STATUS.md` 自述降级为 E4，只用于「交叉核对自述是否与代码一致」，**不单独支撑任何「已满足」判定**。未跑 build / E2E / 未连生产。

---

## 0. 结论速览

| 模块 | 成熟度 | 状态 | 一句话 |
|---|---|---|---|
| **M05 多语言系统** | **2/5** | 部分满足 + 有风险 | 自研 i18n 的路由/变体/回退设计是**对的且优于现成方案**，但 `INDEXABLE_LOCALES` 实际是「全放行」，与「未批准译文不公开索引」直接矛盾；跨语言实体靠 slug 隐式关联。 |
| **M06 SEO 基础设施** | **3/5** | 部分满足 + 有风险 | sitemap / robots / llms.txt 三件的 fail-closed 做得比多数项目干净；但 **17/38 页没有 canonical**，sitemap 声明了 noindex 页面，redirect 有 307/308 混用，JSON-LD 有 2 处非绝对 URL。 |
| **M07 GEO 内容结构** | **1/5** | 未实现（有零散雏形） | V3.0 的 8 个 GEO 字段**一个都没有作为字段存在**（0/8）。现有的 `answer` / `needsVerification` 是「手工雏形」，不是可查询、可校验、可跨语言对齐的结构。 |

---

## M05 多语言系统

**成熟度**: 2/5
**状态**: 部分满足 + 有风险

### 证据

**[E1] 路由形态：无前缀默认英文 + 前缀变体（设计正确）**

| 项 | 值 | 证据 |
|---|---|---|
| 语言集 `LOCALES` | `["en", "zh", "es", "th"]`（4 个） | `src/lib/i18n/types.ts:7` |
| 默认语言 | `en`，前缀为空字符串 | `src/lib/i18n/types.ts:16,27` |
| 前缀表 | `en:""` / `zh:"/zh"` / `es:"/es"` / `th:"/th"` | `src/lib/i18n/types.ts:29-31`（`LOCALE_CONFIG`） |
| `localizedPath` 算法 | 先 `stripLocalePrefix` 去前缀得 base，再拼目标语言前缀；base 为 `/` 时返回裸前缀本身 | `src/lib/i18n/types.ts:68-73` |
| 短横线语义 | `/zh`（无尾斜杠）是首页；`/zh/products/wheels` 是子页 | `src/lib/i18n/types.ts:56-67` |
| 单测锁定 | `localizedPath("/", "zh") === "/zh"`、切回 en 保留路径 | `tests/i18n-routing.test.mts:37-43` |

> **判定**：这是**无前缀默认语言**形态。改 URL 结构会毁收录，**但这个形态本身是对的**——英文根 URL 保留（`types.ts:26` 注释：*"Default English routes stay at the root to preserve existing links"*）。**不建议改成 `/en/` 前缀**。

**[E1] Proxy 不把 `/` 重定向到 `/en/`，但会按 cookie/Accept-Language 做语言跳转**

- `preferredLocale()` 依次读 cookie `fh-locale` → `Accept-Language` → 默认 `en`：`src/proxy.ts:10-21`
- **仅当** 路径未本地化 **且** 偏好语言非 en **且** 不是 RSC 数据请求时，才 302 到 `/zh/*`：`src/proxy.ts:51-55`
- 也就是：**`/` 永远不跳到 `/en/`**（en 无前缀，无处可跳）；但**一个存了中文 cookie 的老外访问 `/products` 会被 302 到 `/zh/products`**：`src/proxy.ts:52-55` + `src/proxy.ts:74-77`（回写 cookie）
- 内部 rewrite：`/zh/*` → 内部无前缀路径，并注入 `x-fh-locale` / `x-fh-public-path`：`src/proxy.ts:62-72`
- 专门处理了 RSC prefetch 的 `ERR_TOO_MANY_REDIRECTS`：`src/proxy.ts:41-50`（`rsc=1` / `sec-fetch-dest: empty` / `_rsc` 三种判据）
- `Content-Language` 头：`src/proxy.ts:26,78-80`，`zh→zh-CN`、`th→th-TH`、`es→es-ES`
- matcher 排除 `robots.txt` / `sitemap.xml` / 静态文件：`src/proxy.ts:84`

> **这是本模块最扎实的部分**：代理层的循环、prefetch、内部 rewrite 三个坑都被显式处理并写进注释。**不是「没装 next-intl 所以未实现」**。

**[E1] i18n 实现：自研，三层结构**

| 层 | 位置 | 规模 | 覆盖 |
|---|---|---|---|
| ① Chrome 字典（导航/页脚/CTA/无障碍） | `src/lib/i18n/dictionaries/{en,zh,es,th}.ts` | 每种语言 **70 个 key**，四种语言键集合完全一致 | 全站 header/footer/404 |
| ② 领域 copy 模块（类型化、带函数） | `src/lib/i18n/{wheel-catalogue,wheel-card,wheel-detail,wheel-enquiry,inquiry-form,inquiry-cart,flow-formed,conversion-ui}-copy.ts` | 8 个文件共 1,000+ 行 | 轮毂目录/详情/询盘/旋压页/转化页 |
| ③ 页面正文 | `src/content/*.ts`（英文常量，**不进字典**） | 40 个文件 | about / capabilities / products / fitment / insights 等 |

- 字典 `translateStrict` 缺 key 直接返回 key 本身：`src/lib/i18n/types.ts:118-120`（**不做运行时回退到 en**，靠测试锁定键集合）
- 键集合一致性由测试锁定：`tests/i18n-routing.test.mts:19-24`
- 目录/卡片 copy 的四语完整性由测试锁定：`tests/wheel-catalogue-i18n.test.mts:5-20`（`assert.deepEqual(Object.keys)` + `assert.ok(value.trim())`）
- 回退可观测：`resolveLocalized()` 在非 en 走回退时打 `[i18n] fallback locale=… scope=… reason=no-approved-translation`：`src/lib/i18n/localized-page.ts:56-62`

**[E1] `INDEXABLE_LOCALES` 实际是「全放行」——与要求矛盾**

```
src/lib/i18n/types.ts:41-43
/** Every configured public locale may be indexed. */
export const INDEXABLE_LOCALES = LOCALES;          // ← ["en","zh","es","th"]
export function isIndexableLocale(locale) { return INDEXABLE_LOCALES.includes(locale); }
```

消费点只有 4 处（`grep INDEXABLE_LOCALES src/`）：
- `src/app/sitemap.ts:68`（多语言展开）
- `src/app/layout.tsx:68`（hreflang + noindex 判定）
- `src/app/layout.tsx:99`（语言下拉的可用语言）
- `src/app/products/wheels/page.tsx:98`（经 `isIndexableLocale` 进 `robots.index`）

> **与自述的冲突（E4 vs E1）**：
> `STATUS.md:9,16` 写「负责人现要求未批准译文不公开索引，**首页已收口，其他页面族待迁移**」。
> 历史报告 `outputs/reports/11-multilingual-routing-seo-implementation-2026-10-10.md:20` 写「`INDEXABLE_LOCALES` 是唯一 SEO 放行点，**目前值为 `['en']`**」。
> **代码现实（E1）是 `INDEXABLE_LOCALES = LOCALES` = 四语言全放行。首页通过另一套就地判定收口了（见下），其余页面族完全没收口。**
> 这正是 BASELINE §5.3 的判断，**我确认成立**。

**[E1] 首页与「非首页」走两套索引门槛——只有首页收口**

`src/app/layout.tsx:58-90`（`generateMetadata`）：
```ts
const basePath = stripLocalePrefix(publicPath);
if (basePath === "/" && (await draftMode()).isEnabled) { ... noindex ... }   // :65-67
const readyLocales = basePath === "/" ? await getHomepagePublicLocales()     // :68 ← 逐语言门槛
                                       : INDEXABLE_LOCALES;                  //      ← 全放行
if (!readyLocales.includes(locale)) return { ...robots:{index:false}... };    // :69-75
```
`getHomepagePublicLocales()` 判据：对 `LOCALES` 逐个跑 `getHomepagePageView({locale})`，**只收集 `status === "ready"` 的**：`src/lib/wordpress/homepage.ts:180-186`。
`status` 要 `ready` 必须过完整校验：版本化 CMS 文档 → `normalizeHomepageCmsDocument`（`schemaVersion===1 && pageKey==="home" && locale===locale && modules.length===REQUIRED_MODULES.length`，`src/content/page-view.ts:133-135`）→ 内容结构 `isValidHomepageContent` → SEO 非空 `hasHomepageSeo` → 模块合法性 `validateHomepageModules`：`src/lib/wordpress/homepage.ts:148-155`。

> **判定**：首页的门槛是**真门槛**（fail-closed，任何一环失败即 `temporarily-unavailable`），其余 30+ 页面族是**无门槛**。与「未批准译文不公开索引」的要求**不一致**。

**[E1] `hreflang` 成对互指 + `x-default` 回落——但只对「首页」和「有 canonical 的页」生效**

- 生成点一（站点级兜底）：`src/app/layout.tsx:76-88` —— 由 `readyLocales` 生成 `languages`，`readyLocales.includes("en")` 时补 `x-default: localizedPath(basePath,"en")`（`:86`）
- 生成点二（页面级 helper）：`src/lib/i18n/types.ts:76-88` `localizedAlternates(pathname, locale, readyLocales = LOCALES)` —— 同样逻辑，`x-default` 只在 readyLocales 含 en 时输出（`:83`）
- 单测锁定「只列入已批准语言」：`tests/i18n-routing.test.mts:26-35`

> **`x-default` 的回退语义是有条件的**：如果 `readyLocales` 不含 `en`（例如英文首页未就绪但 `zh` 就绪），**完全不输出 `x-default`**。这比「硬塞一个 en」安全，但意味着「缺翻译时不会回落到 x-default」这个验收项**当前实现是「干脆不声明」**，不是「回落」。

**[E1] 跨语言实体关系：靠 slug 隐式关联，没有稳定 entityId**

| 场景 | 关联方式 | 证据 | 风险 |
|---|---|---|---|
| 首页 | `pageKey: "home"` + `locale` 字段 | `src/content/page-view.ts:133`（`value.pageKey !== "home" \|\| value.locale !== locale`） | ✅ **唯一有真实身份锚点的地方** |
| 轮毂型号 | URL slug（`/products/wheels/${slug}`）+ `productionCode` | `src/app/products/wheels/[model]/page.tsx:214`、同一文件 `productSchema` 的 `sku: detail.model`（:212） | ⚠️ slug 即身份；改 slug 靠 `permanentRedirect`（同一文件 :99-102）兜 |
| Fitment 平台 | 硬编码 `slug: "bmw-m" / "mercedes-amg" / "audi-rs"` | `src/content/fitment.ts:27,123,205` | ⚠️ 只有英文 TS 常量，**没有任何语言维度** |
| Insights 指南 | 靠 slug 在语言化文档数组里 `find` | `src/lib/wordpress/insights.ts:74-80`（`documents.find(d => d.guide.slug === slug)`） | ⚠️ **暗坑**：`getInsightGuideDocuments` 用 `resolveLocalized(requested: 本地化结果 ?? null, default: 英文库)`（`:66-71`）—— 如果**任一**语言的翻译集合非空但缺了某个 slug，就会 `null` 回退成**整库英文**，slug 相同的英文文替换掉本该存在的中文文；且**没有任何 entityId 能把 zh 版和 en 版认成同一篇** |
| 产品线 | 常量数组下标 / key | `src/content/product-lines.ts` | ⚠️ 同上 |

**具体反例**（用真实数据说明「靠 slug 猜」会怎样）：
- `/zh/products/wheels/hp12` 与 `/products/wheels/hp12` 是同一型号的两种语言版本，关联**仅**来自 `localizedPath` 拼前缀（`types.ts:68-73`）—— 如果某个型号中文未批准、sitemap 仍会列出 `/zh/products/wheels/hp12`（见 M06），于是**一个没有中文正文的 URL 被索引，指向英文正文**。
- `/zh/fitment/bmw-m` 的中文页正文**永远是英文**（`src/content/fitment.ts` 无语言维度），但 `layout.tsx:68` 给它 `INDEXABLE_LOCALES` 全放行 → **中英重复内容 + hreflang 互指**。

**[E1] 硬编码英文文案的规模**

- 字典只有 70 key，且 `en.ts:13-14` 明确写「This file holds CHROME text only. Page body copy lives in `src/content/*`」
- 因此**所有页面正文都是英文常量**，四语 URL 下渲染的是英文正文 + 中文 chrome
- `hreflang` 仍然声明 `zh/es/th` 三语互指（`layout.tsx:77-81`）→ **hreflang 语义与内容实际语言不一致**

### 已具备

1. 四语言路由 + 默认语言无前缀，`localizedPath` / `stripLocalePrefix` / `localeFromPathname` 三函数正确且有单测（`types.ts:55-73`、`tests/i18n-routing.test.mts:37-49`）。
2. Proxy 把内部 rewrite、RSC prefetch 循环、cookie 偏好、`Content-Language` 四件事都处理了（`proxy.ts:22-82`）。
3. 字典键集合四语一致，有测试锁定（`tests/i18n-routing.test.mts:19-24`）；轮毂目录 copy 四语非空，有测试锁定（`tests/wheel-catalogue-i18n.test.mts:5-20`）。
4. 回退**可观测**（`localized-page.ts:56-62`），把「翻译发版了」和「翻译从没被读过」分开——这是多数项目做不到的。
5. 首页有**真实的逐语言发布门槛**（`homepage.ts:180-186` + `page-view.ts:133-155`），不是布尔开关。
6. `<html lang>` 正确映射（`layout.tsx:122-124`：`zh→zh-CN` 等），`Content-Language` 响应头同步（`proxy.ts:26,78-80`）。

### 缺口

| ID | 缺口 | 证据 |
|---|---|---|
| M05-G1 | `INDEXABLE_LOCALES` 等于 `LOCALES`，非首页页面族**四语全放行索引**，与「未批准译文不公开索引」矛盾 | `src/lib/i18n/types.ts:41-43` vs `src/app/layout.tsx:68` |
| M05-G2 | 页面正文四语缺失 = 0 覆盖；`hreflang` 仍声明三语互指，制造 hreflang/语言不一致 | 字典 `en.ts:13-14` 声明只装 chrome；`src/content/*.ts` 无语言维度；`layout.tsx:77-81` |
| M05-G3 | 无跨语言实体 ID（除首页 `pageKey`），型号/指南/平台全靠 slug 隐式关联 | `insights.ts:66-80`、`fitment.ts:27,123,205`、`wheels/[model]/page.tsx:214` |
| M05-G4 | Insights 多语言集合的「部分回退」会**整库**退成英文，缺 slug 级 fallback | `src/lib/wordpress/insights.ts:66-71` |
| M05-G5 | 语言下拉把「可用语言」等同「可索引语言」（`INDEXABLE_LOCALES`），未来收口后下拉会只剩英文，**可用语言与可索引语言没有拆开** | `layout.tsx:99` 与 `layout.tsx:68` 用同一个来源 |

### 重复实现

- **两套 alternates 生成器**：`src/lib/i18n/types.ts:76-88`（`localizedAlternates`，12 个页面在用）与 `src/app/layout.tsx:68-88`（`generateMetadata` 站点级兜底）。逻辑几乎一致但**不是同一个函数**，`x-default` 条件也各写一遍。**这是本模块最该合并的一处重复**。
- **三套 locale→BCP47 映射**：`types.ts:16-21`（`intlLocale: "zh-CN"`）、`layout.tsx:122-124`（`htmlLanguage`）、`proxy.ts:82-84`（`languageTag`）。三处实现等价、各自硬编码。
- **两套字典取用方式**：`getTranslator()`（`i18n/index.ts:26-36`，走 `translateStrict`）与 `translatorFor()`（`i18n/index.ts:39-42`）与 `createT()`（`i18n/use-t.ts:13`，客户端用）。功能重叠。

### 风险

| ID | 风险 | 严重度 | 证据 |
|---|---|---|---|
| M05-R1 | **四语 URL 全量进 sitemap 并被声明 hreflang**，正文却是英文 → 判为重复内容 / 低质多语言页，可能拉低整站信任 | **P0** | `sitemap.ts:68-77` + `types.ts:41-43` + `layout.tsx:77-84` |
| M05-R2 | **cookie 驱动的 302** 会把回归测试机 / 爬虫（若携带 `Accept-Language: zh`）从 `/products` 跳到 `/zh/products` → 爬虫看到的 URL 树与 sitemap 不一致；`preferredLocale` 没有 UA 豁免 | 中 | `proxy.ts:10-21,51-55` |
| M05-R3 | hreflang 用裸相对路径（`/zh/products`）而非绝对 URL；Next 的 `alternates.languages` 会经 `metadataBase` 解析，**但 `metadataBase` 在未配置 env 时是 `http://localhost:3000`**（见 M06-R1）→ 可能产出 `http://localhost:3000/zh/...` 的 hreflang | 高 | `layout.tsx:56` + `site-url.ts:1,19` |
| M05-R4 | 语言收口后 `availableLocales`（语言下拉）会跟着塌成 `["en"]`，用户失去切换入口 | 中 | `layout.tsx:99` |

### 建议动作

1. **P0 · 把 `INDEXABLE_LOCALES` 从 `LOCALES` 拆出**，并引入第三个概念：`AVAILABLE_LOCALES`（可访问）≠ `INDEXABLE_LOCALES`（可索引）≠ `APPROVED_LOCALES`（有已批准译文）。
   - 落点：`src/lib/i18n/types.ts:41-43`。
   - 短期最小改法：`INDEXABLE_LOCALES = ["en"]`，与历史报告 `11-multilingual-routing-seo-implementation-2026-10-10.md:20` 描述一致；随后逐页族按 `getHomepagePublicLocales()` 的模式补门槛。
2. **P0 · 把逐语言门槛从「首页特例」升级为通用能力**：在 `layout.tsx:68` 处，非首页分支不要直接返回 `INDEXABLE_LOCALES`，改调一个逐路径×逐语言的 `getPublicLocalesForPath(basePath)`。首页现有实现可直接抽成模板（`homepage.ts:180-186`）。
3. **P1 · 合并 alternates 生成器**：让 `layout.tsx` 直接调用 `localizedAlternates(basePath, locale, readyLocales)`，删掉 `layout.tsx:76-88` 的重复实现。同时把 `x-default` 策略写死在一处。
4. **P1 · 补 entityId**：给 `GuideEntry`/`PlatformFitment`/`WheelDetailView` 加 `entityId`（或 `translationKey`），让 zh/en/es/th 四份记录共享一个 ID。落点：`src/content/types.ts:805-824`（`GuideEntry`）、`src/content/fitment.ts:19-27`。
5. **P2 · 修 Insights 的整库回退**：`src/lib/wordpress/insights.ts:66-71` 改成按 slug 逐条 `resolveLocalized`，而不是对整个数组做二选一。
6. **P2 · 三处 locale→BCP47 映射合并为一个导出**（`types.ts` 里加 `languageTag(locale)`，`layout.tsx:122`、`proxy.ts:82` 改为引用）。

### 依赖

- 建议动作 2 依赖 M06 的 sitemap 重构（同一份 `readyLocales` 要同时喂 `sitemap.ts:68` 与 `layout.tsx:68`）。
- 建议动作 4 依赖 Agent A（内容接缝）确认 WordPress 侧是否已有 `translation_key` 之类字段——**移交 A 号 Agent**。
- 建议动作 1 会**降低**索引页数量，需与产品/负责人确认发布节奏——**移交 G 号 Agent（业务对齐）**。

### 验收方式

- 单测：`localizedAlternates("/products", "zh", ["en"])` 必须只返回 `{canonical:"/zh/products", languages:{en:"/products","x-default":"/products"}}` 且**不含** `zh`（当前实现会含，因为默认参数是 `LOCALES`，`types.ts:77`）。
- 构建后 `curl /sitemap.xml | grep '/zh/'` → 在未批准译文时应为 **0 条**（当前应为 100+ 条，可证伪）。
- `curl -H 'Accept-Language: zh-CN' /products -I` → 检查是否 302（当前应 302 到 `/zh/products`，需业务确认是否可接受）。

---

## M06 SEO 基础设施

**成熟度**: 3/5
**状态**: 部分满足 + 有风险

### 证据

**[E1] Metadata 集中度：31/38 有 metadata，但**没有统一 helper**

| 形态 | 数量 | 典型位置 |
|---|---|---|
| `generateMetadata()`（异步、读 CMS） | 24 | `about/page.tsx:12`、`products/page.tsx:9`、`fitment/[platform]/page.tsx:27`、`insights/[slug]/page.tsx:24` |
| `export const metadata`（静态） | 7 | `dealers/page.tsx:13`、`dealers/private-label/page.tsx`、`insights/bolt-patterns/page.tsx:15`、`tools/page.tsx:8`、`tools/offset-calculator/page.tsx`、`support/{terms,shipping,returns,warranty}/page.tsx` |
| 完全无 metadata | 7 | `/gallery`、`/gallery/wheels`、`/manufacturing`、`/resources`、`/resources/[slug]`、`/resources/bolt-patterns`、`/resources/bolt-patterns/[pattern]` |

- **唯一的"半集中"是** `localizedAlternates`（`src/lib/i18n/types.ts:76-88`），它只负责 `canonical + languages`，**不管 title/description/robots**。
- 每个页面各自手写 `title` / `description` / `robots`，风格不统一：
  - `robots: { index: !preview, follow: true }` 有 7 处（`contact/page.tsx:29`、`insights/page.tsx:26`、`insights/[slug]/page.tsx:40`、`request-a-quote/page.tsx:24`、`support/privacy/page.tsx:21`、`page.tsx:25`）
  - `robots: { index: true, follow: true }` 硬编码 `true` 有 10+ 处（`fitment/page.tsx:17`、`fitment/[platform]/page.tsx:42`、`dealers/page.tsx:21` 等）
  - `products/wheels/page.tsx:98` 用 `isIndexableLocale(locale)` 做第三套判据
  - `custom-aluminum/page.tsx:34` 用 `isCustomAluminumPageIndexable()` 做第四套判据
  - `flow-formed/page.tsx:107` 用 `hasUserFilters(...) || !publicationOpen` 做第五套判据
  - → **6 套 robots 判定逻辑，没有一处统一**

**[E1] Canonical：17/38 页面输出 `<link rel="canonical">`，21 页没有**

有 canonical 的（`grep -n "canonical\|alternates"` 实测）：
`support/privacy`(20) / `support/terms` / `support/shipping` / `support/returns` / `support/warranty` / `request-a-quote`(10) / `contact`(26) / `fitment`(8) / `fitment/[platform]` / `products/wheels`(99) / `products/wheels/[model]`(78) / `products/wheels/flow-formed`(114) / `products/wheels/forged`(20) / `products/ev-components` / `products/custom-aluminum`(37) / `insights/[slug]`(38) / `insights/bolt-patterns/[pattern]`(39) / `thank-you`(22)

**没有 canonical 的 21 页**（逐文件 grep 返回空）：
`/`（`page.tsx:26` 只在 `!preview` 时给 `{canonical: result.page.seo.canonicalPath}`，**只给 canonical 字符串、不给 languages**）、`/about`、`/capabilities`、`/custom-development`、`/dealers`、`/dealers/private-label`、`/products`、`/products/safety-tires`、`/insights`、`/insights/bolt-patterns`、`/tools`、`/tools/offset-calculator`、`/gallery/finishes` 之外的 gallery 族、`/products/wheels` 之外的…（完整 21 条见下方缺口表）

- **E3 交叉印证**：`outputs/reports/jev-seo-9080-2026-10-12/audit.json` 的 `canonical_missing` finding 明确列出 **17 of 60 pages** 无 canonical，且 URL 列表与上面的 grep 结果高度重合（`/products`、`/products/custom-aluminum`、`/products/safety-tires`、`/capabilities`、`/custom-development`、`/dealers`、`/dealers/private-label`、`/insights`、`/insights/bolt-patterns`、`/about`、`/support/*`、`/tools/offset-calculator`、`/gallery/finishes`）。**E1 与 E3 一致**。

**[E1] `site-url.ts` 的 fallback——这是本模块最大的单点风险**

```ts
// src/lib/site-url.ts:1-20
const FALLBACK_SITE_URL = "http://localhost:3000";     // :1
export const configuredSiteUrl = parseConfiguredUrl();  // :18（env 缺失 → null）
export const siteUrl = configuredSiteUrl ?? new URL(FALLBACK_SITE_URL);  // :19
```

- 判定「已配置」的唯一条件：`NEXT_PUBLIC_APP_URL` 非空 + `new URL()` 能解析 + protocol ∈ {http,https}（`:4-16`）
- **fallback 是 `http://localhost:3000`**，不是某个真实域名
- `siteUrl` 的唯一消费点：`src/app/layout.tsx:56` 的 `metadataBase`
- **因此 `NEXT_PUBLIC_APP_URL` 缺失时**：
  - `sitemap.ts` → `[]`（正确闭锁，`:24`）
  - `robots.ts` → `disallow: "/"`（正确闭锁，`:15`）
  - `llms.txt` → 404（正确闭锁，`route.ts:11-17`）
  - **但 `metadataBase` 仍是 `http://localhost:3000`** → **所有相对 canonical / hreflang 会被烤成 `http://localhost:3000/...`**

> **⚠️ 与任务书假设的偏差（必须写明）**：任务书说「会 fallback 到某个字面量域名」。**代码实测（E1）fallback 的是 `http://localhost:3000`，不是字面量生产域名**。真正会「静默烤成字面量域名」的是**另一处**：
>
> - `src/content/site.ts:22` —— `url: "https://www.fenghuai.com"`（**带 `www`**）
> - `src/app/layout.tsx:54-55` 注释自承：*"⚠️ `metadataBase` is still the placeholder domain in `content/site.ts` (`fenghuai.com`) — confirm before launch"*
>
> 但**实测 `site.ts:22` 的 `site.url` 并没有被 `site-url.ts` 或 `layout.tsx` 引用**（`grep -rn "siteUrl\|siteUrlIsConfigured\|NEXT_PUBLIC_APP_URL" src/` 只有 6 处命中，不含 `site.ts`）。
> **所以真实结论是**：`metadataBase` 只受 env 控制；env 缺失 → `localhost:3000`；env 设成 `https://fenghuai.com` → 全部 canonical 变裸域；而 `site.ts:22` 的 `www.fenghuai.com` 目前是**死字段**，谁也没用它，**但它是下一个人会顺手拿起来用的地雷**。

**[E1] sitemap：fail-closed 正确，但**声明了 noindex 页面**

- fail-closed：`if (!configuredSiteUrl) return [];`（`sitemap.ts:24`）
- 内容门槛：`customAluminumIndexable`（`sitemap.ts:27`，`isCustomAluminumPageIndexable()` → `content/custom-aluminum.ts:67` 要求 `publicationStatus === "approved" && boundary.declinedConfirmed`；当前 `publicationStatus: "draft"`，`custom-aluminum.ts:74` → **不会入 sitemap**）；`flowFormedIndexable`（`sitemap.ts:28-29`，gate 当前全开，`flow-formed-wheels.ts:213-216,220-224`）
- **问题 1 · `/thank-you` 在 sitemap 里**：`sitemap.ts:44` 硬编码。而 `thank-you/page.tsx:20` 给了 `robots: { index: true, follow: true }`（**index！**）→ 一个「感谢页」被允许索引。E3 侧 `jev-seo-9080-2026-10-12/audit.json` 的 `sitemap_bad_urls` finding 亦点名多条 URL 进 sitemap 但带 noindex。
- **问题 2 · 多语言展开无条件**：`sitemap.ts:68-77`
  ```ts
  const localizedEntries = INDEXABLE_LOCALES
    .filter((locale) => locale !== "en")
    .flatMap((locale) => englishEntries
      .filter((entry) => new URL(entry.url).pathname !== "/" || homepageLocales.includes(locale))
      .map(...))
  ```
  → **除 `/` 外，所有路径对 `zh/es/th` 无条件展开**。BASELINE §5.3 的判断成立。
- **问题 3 · `priority` 只按英文路径算**：`priorityFor(path)`（`sitemap.ts:88-94`）在多语言展开时被复制，逻辑上没错，但 `priority` 对 Google 已无实际作用。

**[E1] robots：fail-closed 正确**

```ts
// src/app/robots.ts:15
if (!configuredSiteUrl) return { rules: [{ userAgent: "*", disallow: "/" }] };
// :18-28
return { rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }], sitemap: `${base}/sitemap.xml` };
```
- `disallow: "/api/"`（`:25`）覆盖 4 个 API 路由（BASELINE §5.1）
- **但没有按 UA 分组的 AI 爬虫规则**（无 `GPTBot` / `ClaudeBot` / `PerplexityBot` 显式 Allow）——对一家想被 AI 引用的 B2B 站，这是**遗漏而非错误**（默认 `*` 已 allow）
- **预发布 noindex 不靠 robots.txt，靠 nginx 的 `X-Robots-Tag`**：`deploy/frontend/nginx-9080.conf:9` → `add_header X-Robots-Tag "noindex, nofollow" always;`
  - **⚠️ 这是「靠环境」而非「靠应用」**：Next 侧**没有任何代码**产生 `X-Robots-Tag`（`grep -rn "x-robots-tag" src/ next.config.ts` 零命中）。生产若不走这份 nginx（例如换成 Vercel / CDN / 另一份反代配置），**预发布守卫直接消失**，而 robots.txt 仍会 allow（因为生产 env 配了域名）。
  - 同一份 `noindex, nofollow` 也加在 WordPress 侧 `deploy/wordpress/nginx-7080.conf:9`。

**[E1] 7 个无 metadata 页面：**不是双漏，是**有意的 308 重定向页**（判定明确）

逐个读完 7 个文件，全部是**一行式的 legacy 重定向页**，不含正文、不需要 metadata：

| 路由 | 实现 | 目标 | 状态码 | 证据 |
|---|---|---|---|---|
| `/gallery` | `permanentRedirect("/fitment")` | `/fitment` | **308** | `src/app/gallery/page.tsx:33` |
| `/gallery/wheels` | `permanentRedirect("/products/wheels")` | `/products/wheels` | **308** | `src/app/gallery/wheels/page.tsx:30-32` |
| `/manufacturing` | `permanentRedirect("/capabilities")` | `/capabilities` | **308** | `src/app/manufacturing/page.tsx:15` |
| `/resources` | `permanentRedirect("/insights")` | `/insights` | **308** | `src/app/resources/page.tsx:16` |
| `/resources/[slug]` | `permanentRedirect(\`/insights/${slug}\`)` | `/insights/[slug]` | **308** | `src/app/resources/[slug]/page.tsx:20` |
| `/resources/bolt-patterns` | `permanentRedirect("/insights/bolt-patterns")` | 308 | `src/app/resources/bolt-patterns/page.tsx:13` |
| `/resources/bolt-patterns/[pattern]` | **`redirect(...)`（307！）** | `/insights/bolt-patterns/[pattern]` | **⚠️ 307** | `src/app/resources/bolt-patterns/[pattern]/page.tsx:24` |

- **它们的定位是「已下线内容 / 已改名路由的 308 迁移桩」**，文件头注释写得很清楚：`/gallery` 曾发布**虚构内容**（九条编造的已完成项目 + 零张真实照片），已归档到 `archive/2026-10-06-fictional-galleries/`（`gallery/page.tsx:6-25`）。
- **不在 sitemap 里 = 正确**（重定向页不该进 sitemap）。**这是「有意」，不是双漏。**
- **是否被导航暴露 = 否**：`src/content/site.ts:61-97` 的 header nav 与 `:105-144` 的 footer nav **不含** `/gallery`、`/gallery/wheels`、`/manufacturing`、`/resources*` 任何一个。唯一的旧链残留是 `/gallery/finishes`（**是另一个仍存活的真实页面**，有 metadata，在 sitemap `sitemap.ts:45`）。`src/components/wheel-strip-section.tsx:18` 注释记录了首页 link「already withdrawn」。
- **→ IA 一致，无导航-孤儿问题。**

> **但发现一处不一致**：`resources/bolt-patterns/[pattern]/page.tsx:24` 用 `redirect()`（**307 临时**），而同级 6 个兄弟全部用 `permanentRedirect()`（308）。该文件自己的注释（`:15-18`）说「`redirect()` throws 307 … Keeping a page that redirects preserves any analytics」——**这是已知但未修的不一致**，会在 Search Console 里表现为「临时重定向」而非「页面已永久移动」。

**[E1] `next.config.ts` 完全没有 `redirects` / `rewrites`**

- `grep -n "redirects\|rewrites" next.config.ts` → **零命中**（文件 143 行，只有 `headers()` 在 `:88`）
- 所有 301/308 都是**路由级的 `permanentRedirect()` 调用**（7 个 legacy 页 + `products/wheels/[model]/page.tsx:99-102` 的 slug 折叠 + `products/wheels/page.tsx` 的空参数清洗）
- **没有集中式旧 URL 映射表**。含义：URL 迁移知识散落在 7 个文件头注释里（如 `gallery/page.tsx:6-25`、`manufacturing/page.tsx:3-14`），**下一个做迁移的人必须逐个 grep 才能知道历史**。

**[E1] 404 / 410**

- 有 `src/app/not-found.tsx`（客户端组件，`"use client"`，读 `localeFromPathname` 渲染双语 404，`:1-15`）
- `notFound()` 调用点 7 处（`grep "notFound()" src/app`）
- **无任何 410**（`grep -rn "410"` 在 `src/app` 零命中）→ 下线内容走 308，不走 410。对虚构内容页（`/gallery`）**308 到 `/fitment` 意味着把「曾经的虚构内容」的链接权重传给 `/fitment`**——语义上可以接受，但严格说 410 更诚实（该文件注释明确选择了 308，理由写在 `gallery/page.tsx:20-27`）。

**[E1] JSON-LD：4 个页面、5 种 schema、无 Organization/Breadcrumb/FAQ/Article**

| 页面 | `@type` | 位置 | 关键字段 |
|---|---|---|---|
| `/products/wheels/[model]` | `Product` | `wheels/[model]/page.tsx:208-226` | `name`/`sku`（=model）/`image`/`description`/`url`/`brand`/`additionalProperty[]`（`PropertyValue`：尺寸·PCD·ET·中心孔） |
| `/products/wheels` | `ItemList` | `wheels/page.tsx:289-303` | `itemListOrder`/`numberOfItems`/`itemListElement[]`（`ListItem`） |
| `/products/wheels/flow-formed` | `CollectionPage` → `mainEntity.ItemList` | `flow-formed/page.tsx:144-161` | 同上 + `url: canonical` |
| `/products/ev-components` | `Service` → `provider.Organization` | `ev-components/page.tsx:57-68` | `name`/`serviceType`/`description`/`provider`/`url`/`areaServed` |

**`grep -rn "BreadcrumbList\|FAQPage\|Article\|dateModified\|datePublished" src/` → 全部零命中。**

**事实字段与正文一致性——有 2 处**「正文没有的规格」/「schema 独有的断言」：

1. **`Service.areaServed: "Worldwide"`（`ev-components/page.tsx:67`）—— 正文没有这句话。** 这是 schema 里**独有**的商业断言（服务全球），页面上找不到对应文本。按「不能出现正文没有的规格」的标准，**这一条不合格**。
2. **`Product.additionalProperty` 直接暴露 `productionCode` 作 `propertyID`（`wheels/[model]/page.tsx:217-222`）** —— 正文的变体表经过 `toBrowserVariant` 投影、**刻意剥掉了 `finish`**（同文件 `:130` 注释：「the raw Chinese source `finish` never reaches the browser」），但 JSON-LD 里 `propertyID` 仍是内部生产码。**生产码算不算「正文没有的规格」，需产品确认**（保守判定：属内部标识符泄漏，非规格）。

**[E1] `OpenGraph` 覆盖率 = 1/38**

- `grep -rln "openGraph" src/app/` → **仅 1 个文件**（`products/wheels/flow-formed/page.tsx:103-107`）
- 其余 37 页**没有任何 OG / Twitter Card**。B2B 分销商把链接发到 WhatsApp / 微信 / LinkedIn 时**无预览卡**。这是 B2B 场景的实际损失，不是「nice to have」。

### 已具备

1. **三件套 fail-closed 全部正确**：`sitemap.ts:24` → `[]`、`robots.ts:15` → `disallow:"/"`、`llms.txt/route.ts:11-17` → 404。三者**共用同一个 `configuredSiteUrl`**，不会出现「一个开了另一个没开」。
2. **内容级发布门槛是真门槛**：`isCustomAluminumPageIndexable` 要求 `publicationStatus === "approved" && boundary.declinedConfirmed`（`content/custom-aluminum.ts:67`），当前 `draft` → 不入 sitemap；`isFlowFormedPublishingOpen` 要求两个 flag 同时清除（`content/flow-formed-wheels.ts:220-224`）。
3. **筛选参数不污染索引**：`products/wheels/page.tsx:90-98` —— 带筛选 → `noindex, follow` + canonical 回基础目录；分页 → canonical 带 `?page=`；越界 → 404（`:113-116`）。`flow-formed/page.tsx:95,107,115` 同构。
4. **`Product` schema 刻意不发 `Offer`**（`wheels/[model]/page.tsx:200-207` 注释 + `:208-226` 实际代码）——「没有价格和库存就不发购买节点」是正确的判断，比多数站点的伪 Offer 强。
5. **7 个 legacy 页的定位清晰且已归档证据**：`gallery/page.tsx:6-25` 记录了「九条虚构 completed builds + 零张真实照片 + 归档路径」。这是**有据可查的下线**，不是失踪。
6. **重定向状态码选择有理由**：`gallery/page.tsx:20-27` 明确论证「为何 308 不是 307」，并把与 `/manufacturing`、`/resources` 的差异写进注释。
7. `metadataBase` 存在，`title.template: "%s | Fenghuai"` 统一品牌后缀，且注释记录了「后缀曾全是 Forged Wheels 导致 EV/铝件页都被读成轮毂店」的修复（`layout.tsx:33-49`）。

### 缺口

| ID | 缺口 | 证据 |
|---|---|---|
| M06-G1 | **21/38 页无 canonical**（含 `/`、`/about`、`/products`、`/capabilities`、`/dealers`、`/insights`、`/tools` 等高权重页） | 逐文件 grep 空；E3 侧 `jev-seo-9080-2026-10-12/audit.json` `canonical_missing` = "17 of 60 pages" |
| M06-G2 | **`/thank-you` 在 sitemap 里且 `index: true`** | `sitemap.ts:44` + `thank-you/page.tsx:20` |
| M06-G3 | **sitemap 多语言无门槛展开**（除首页） | `sitemap.ts:68-77` |
| M06-G4 | **`metadataBase` 在 env 缺失时 = `http://localhost:3000`**，会把 relativ canonical/hreflang 烤成 localhost | `site-url.ts:1,19` + `layout.tsx:56` |
| M06-G5 | **`content/site.ts:22` 的 `https://www.fenghuai.com` 是死字段**，属未爆雷 | `site.ts:22` vs `grep` 零引用 |
| M06-G6 | **无 Organization / BreadcrumbList / FAQPage / Article schema** | `grep BreadcrumbList\|FAQPage\|Article` 零命中 |
| M06-G7 | **`Service.areaServed: "Worldwide"` 无正文支撑** | `ev-components/page.tsx:67` |
| M06-G8 | **OG/Twitter 覆盖 1/38** | `grep -rln openGraph src/app` = 1 |
| M06-G9 | **无统一 metadata helper**，6 套 robots 判据并存 | `layout.tsx:58-90` / `wheels/page.tsx:98` / `custom-aluminum:34` / `flow-formed:107` / `thank-you:19` / `contact:29` |
| M06-G10 | **无集中式 redirect 映射表**，历史散在 7 个文件头注释 | `next.config.ts` 无 `redirects`；`gallery/page.tsx:6-25` 等 |
| M06-G11 | **`resources/bolt-patterns/[pattern]` 用 307**，与 6 个兄弟的 308 不一致 | `resources/bolt-patterns/[pattern]/page.tsx:24` |
| M06-G12 | **预发布 noindex 只靠 nginx `X-Robots-Tag`**，应用侧零实现；换部署即失效 | `deploy/frontend/nginx-9080.conf:9`；`grep x-robots-tag src/` 零命中 |
| M06-G13 | robots.txt 无 AI 爬虫显式分组 | `robots.ts:20-27` 只有 `userAgent:"*"` |

### 重复实现

- **6 套 robots 判定**（见 M06-G9）。这是本模块最该收口的一处。
- **JSON-LD 序列化模板重复 4 遍**：`<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(...)}}/>` 在 4 个页面各写一遍（`wheels/[model]:107-111`、`wheels/page.tsx:285-288`、`flow-formed:240-242`、`ev-components:77-80`）。无共享 `<JsonLd data={...} />` 组件——**交 Agent A 确认这是否属于组件层问题（移交 A 号 Agent）**，但序列化这层建议在 SEO 域内统一。
- **`ItemList` 构造逻辑重复 2 次**：`wheels/page.tsx:289-303` 与 `flow-formed/page.tsx:144-161`（后者还多包一层 `CollectionPage`），`positionBase` / `itemListElement.map` 逻辑几乎相同。

### 风险

| ID | 风险 | 严重度 | 证据 |
|---|---|---|---|
| M06-R1 | **env 未配时 `metadataBase=localhost:3000` → 所有 canonical/hreflang 变 localhost，且 sitemap/robots 已闭锁所以不易被发现** | **P0** | `site-url.ts:1,19` + `layout.tsx:56` |
| M06-R2 | **`site.ts:22` 的 `www.fenghuai.com` 与 `NEXT_PUBLIC_APP_URL` 可能不一致**（一个带 `www`，一个由部署填裸域 `deploy/frontend/.env.example:1` 是 `http://119.91.205.130:9080`）→ 一旦有人「顺手」把 `metadataBase` 改成 `site.url`，canonical 立刻变 `www`，而 sitemap 是裸域 → **双域重复** | 高 | `site.ts:22` + `deploy/frontend/.env.example:1` |
| M06-R3 | **`/thank-you` 可被索引**：一个只对提交者有意义、带 `?id=` 和 `?receipt=` 的确认页进入索引，且 URL 参数会进 Google | 高 | `thank-you/page.tsx:19` + `sitemap.ts:44` |
| M06-R4 | **预发布 noindex 依赖 nginx 单点**；若上线走 CDN/Vercel，`X-Robots-Tag` 消失 → 预发布内容可被索引 | 高 | `deploy/frontend/nginx-9080.conf:9`（应用侧零实现） |
| M06-R5 | **21 页无 canonical + hreflang 缺失** → 参数化 URL、大小写变体、`/products` vs `/products/` 全部被当作独立页 | 中 | 见 M06-G1 |
| M06-R6 | **`Service.areaServed: "Worldwide"` 属于「schema 说了正文没说的话」**，触及 GEO/广告合规的「可验证性」底线 | 中 | `ev-components/page.tsx:67` |

### 建议动作

1. **P0 · `site-url.ts` 把 fallback 改成「显式 null + 显式错误」**：
   - 最小改动：`siteURL` 在 `!configuredSiteUrl` 时**不返回 localhost**，而是抛错或返回 `undefined`，让 `layout.tsx:56` 不设 `metadataBase`（Next 会在缺 `metadataBase` 时对相对 URL 打 build 警告）。
   - 更好的做法：`metadataBase` 直接从 `configuredSiteUrl` 取，未配置时**不输出 canonical/hreflang**（与 sitemap/robots 的闭锁语义对齐）。
   - 落点：`src/lib/site-url.ts:19`、`src/app/layout.tsx:56`。
2. **P0 · 删掉或明确标注 `src/content/site.ts:22` 的 `www.fenghuai.com`**，或把它作为 `NEXT_PUBLIC_APP_URL` 缺省值的**唯一来源**并统一 `www` 策略（要么全裸域要么全 www，不能两套）。
3. **P0 · `/thank-you` 改 `index: false` 并从 sitemap 移除**。落点：`thank-you/page.tsx:19`、`sitemap.ts:44`。
4. **P1 · 给 21 页补 `localizedAlternates`**（有 CMS 内容的用 `generateMetadata`，静态的用 `metadata`）。落点按 M06-G1 清单逐个，或**先抽一个 `buildPageMetadata({path, title, description, robots})` helper 再批量替换**。
5. **P1 · 抽统一 `buildPageMetadata` helper**，把 6 套 robots 判据收敛成：`index = !preview && !noindexByGate && readyLocales.includes(locale)`。
6. **P1 · 补 `BreadcrumbList`**：现有面包屑是纯视觉组件（`components/sections/page-hero.tsx:41` `breadcrumb?: ReactNode`），schema 侧零实现。补 `Organization`（全站一份，进 `layout.tsx`）。
7. **P1 · 补 OG/Twitter 默认值**：在 `layout.tsx` 的 `baseMetadata` 里加 `openGraph` + `twitter`，让 37 个没写的页至少有一份。
8. **P2 · 修 `Service.areaServed`**：要么删，要么在 `ev-components` 正文加一句「we support projects worldwide」并有出处。
9. **P2 · `resources/bolt-patterns/[pattern]` 的 307 → 308**：`resources/bolt-patterns/[pattern]/page.tsx:1,24` 改 `permanentRedirect`（与 6 个兄弟一致）。
10. **P2 · 把 7 个 legacy 重定向集中到 `next.config.ts` 的 `redirects()`**（`permanent: true`），删掉 7 个 page.tsx。收益：redirect 不再进 RSC 渲染流程、可在配置层一眼看全、`config` 里可加注释表。
11. **P2 · `X-Robots-Tag` 上移到应用层**：在 `proxy.ts` 里对「非生产 env」注入 `X-Robots-Tag: noindex, nofollow`，让预发布守卫不依赖某份 nginx。

### 依赖

- 建议 1/2 依赖部署侧确认最终域名形态（裸域 or www）——**移交 D 号 Agent（部署）**。
- 建议 11 依赖 env 分层方案（如何判定「非生产」）——**移交 D 号 Agent**。
- 建议 4/5 会触及 21 个 `page.tsx` 的 metadata 块，**若同时有 Agent A 在改这些文件会冲突**——需与 A 号 Agent 协商顺序。
- `redirects()` 集中化会删 7 个路由文件，属于结构改动——**移交 G 号 Agent 判断是否值得**。

### 验收方式

- `grep -L "rel=\"canonical\"\|alternates" src/app/**/page.tsx` → 期望**无输出**（当前 21 个文件）。
- `NEXT_PUBLIC_APP_URL= npm run build && grep -o 'rel="canonical" href="[^"]*"' .next/**/*.html | head` → 期望**不出现 `localhost`**。
- `curl -s localhost:3100/sitemap.xml | grep -c thank-you` → 期望 **0**。
- 对 `/products` 做 Rich Results 测试 → 期望出现 `BreadcrumbList`（当前无）。

---

## M07 GEO 内容结构

**成熟度**: 1/5
**状态**: 未实现（有零散手工雏形）

### 证据

**[E1] V3.0 的 8 个字段：全仓 0/8 存在**

`grep -rn "canonicalQuestion\|shortAnswer\|supportingEvidence\|applicability\|limitations\|relatedEntities\|lastVerifiedAt\|sourceReferences" src/` → **完全零命中**（无 TS 字段、无 ACF 字段名、无组件 prop）。

`grep -rn "canonical_question\|short_answer\|last_verified\|source_references\|applicability\|limitations" local-wp/wp-data/wp-content/mu-plugins/` → **零命中**（7 个 MU 插件 5,711 行，无任何 GEO 字段注册）。

| # | 字段 | 是否有等价物 | 落在哪 | 判定 |
|---|---|---|---|---|
| 1 | `canonicalQuestion` | **无** | — | ❌ 0 |
| 2 | `shortAnswer` | **有近似物**：`GuideEntry.answer`（"One-line takeaway shown as an answer-first standfirst"） | `src/content/types.ts:820-821`；渲染 `src/components/prose-article.tsx:85` | 🟡 半个（仅 6 篇指南，非全站，且不含「问题」） |
| 3 | `supportingEvidence` | **无显式字段**；散在正文段落里 | `resources.ts` 各 `sections[].paragraphs` | ❌ 0 |
| 4 | `applicability`（适用范围） | **无显式字段**；但 fitment 页有"适用范围"语义 (`PlatformFitment.models[].notes`) | `src/content/fitment.ts:41-44` | ❌ 0 |
| 5 | `limitations`（局限声明） | **有强近似物**：`needsVerification: boolean` + 页面级 verification notice | `types.ts:822-823`；`prose-article.tsx:111-130` | 🟡 半个（布尔，不是可读的局限清单） |
| 6 | `relatedEntities` | **无**；只有 UI 层的 `relatedModels` / `related` 链接 | `wheels/[model]/page.tsx:141`（`WheelRelatedModels`） | ❌ 0 |
| 7 | `lastVerifiedAt` | **完全无日期字段**：`grep -rn "datePublished\|dateModified\|lastReviewed\|updatedAt\|publishedAt" src/content/*.ts` 零命中 | — | ❌ 0 |
| 8 | `sourceReferences` | **无**；正文里的「Ask us for the test documentation」是文案，不是可解析引用 | `content/faq.ts:33` | ❌ 0 |

> **8 项里 0 项作为字段存在，2 项（shortAnswer / limitations）有布尔或单句雏形。** 这是「有零散手工雏形」，不是「有 GEO 结构」。

**[E1] 唯一真正有价值的 GEO 资产：`needsVerification` 的可见降级**

- 类型：`GuideEntry.needsVerification: boolean`（`src/content/types.ts:822-823`，注释：「Whether the copy contains figures that still need engineering sign-off」）
- 内容侧：6 篇指南里 3 篇为 `true`（`resources.ts:57, 276, 421`），3 篇 `false`（`:130, :204, :347`）
- 渲染：`true` 时显示整块 warning section「Check figures with us before you rely on them」（`src/components/prose-article.tsx:111-130`）
- WordPress 侧透传：`fields?.needs_verification === true`（`src/lib/wordpress/insights-contract.ts:476`）
- 文件头自承：`src/content/resources.ts:12-16` — **「PLACEHOLDER: technical guidance below … every figure and standard referenced must be checked by Fenghuai's engineers before it is presented as authoritative」**

> **这是全仓最诚实的一处内容纪律**：知道自己不可信，并在 UI 上说出来。**但它不是 GEO 结构**——它是「二元警告」，机器无法从中抽取「哪一句有证据、哪一句是估计、谁核的、什么时候」。

**[E1] Fitment：`verified: false` 全量为 false——这是**正确的反批量生成设计**，不是缺口**

- `platformFitments` **只有 3 条**：`bmw-m`（`fitment.ts:27`）、`mercedes-amg`（`:123`）、`audi-rs`（`:205`）
- `models[]` 合计 **11 条**型号记录（`grep -c "verified: false"` = **11**；`grep -c "verified: true"` = **0**）
- 文件头 20 行是**安全声明**：*"Wheel fitment is safety-critical. A wrong PCD, centre bore or offset published as fact can lead to a wheel that does not seat, a stud that shears, or an accident."*（`fitment.ts:10-13`）
- `sizes` 明确标为 *"STARTING REFERENCE RANGES ONLY … not a confirmed offset/PCD/centre-bore specification"*（`:15-17`）
- UI 侧：每行渲染 `pending verification` 标记 + 常驻提示（文件头 `:18-20` 描述；`fitment/[platform]/page.tsx:380-395` 渲染 FAQ）
- `sitemap.ts:42` 只展开 3 个平台 → **3 个 fitment 详情页 + 1 个 hub，共 4 条**

> **对「批量机器生成低质量页面」的风险判定：低。** 3 个平台 × 11 型号是**手工维护的小集合**，且**全量标记未核验**。**真正的风险不是「生成太多」，而是「`verified` 可能永远不翻 true」** —— 一旦某天为了 SEO 把 `verified` 改成 true 而没有工程签核，这套安全设计会瞬间失效。这需要一道**流程门禁**（谁能改 `verified`），代码侧目前没有任何保护（`verified` 就是一个裸 boolean，`fitment.ts:40` 等 11 处）。

**[E1] `llms.txt`：生成物（不是手写），内容结构合理，但缺失关键 GEO 语义**

- 实现：`src/app/llms.txt/route.ts`（79 行，`export async function GET()`）
- **是生成物**：从 `boltPatterns` / `platformFitments` / `guides` / `listPublishedWheelSlugs()` **动态拼装**（`:1-5, 22, 40-46`）
- **fail-closed**：`if (!configuredSiteUrl) return 404`（`:11-17`）
- 内容结构：`# Fenghuai` 标题 + 一段 blockquote 定位 + **一段关键免责声明** + 5 个 section（Company / Products / Insights / Policies）
- 免责声明原文（`:26`）：
  > *"Confirm specifications, vehicle fitment, production entity, certifications, availability, lead times and commercial terms with Fenghuai for each project. Public reference pages may include illustrative or unverified material and are not a substitute for project-specific engineering confirmation."*
- Cache：`public, max-age=3600, s-maxage=3600`（`:76`）
- **没有 `## Optional` / `## Notes` 段落**，也没有 llms.txt 社区提案里的 `key facts` 摘要块
- **E3 交叉**：`outputs/reports/jev-seo-9080-2026-10-12/audit.json` 的 `llms_txt_missing`（severity `info`）说「No llms.txt at the site root」。→ **该 E3 报告的时间点 llms.txt 尚未上线，或 9080 预发布未被访问到**。E1 确证当前代码有实现。**这不是矛盾，是时间差**（`src/app/llms.txt/route.ts` 可能在 10-12 之后加入）。

> **`llms.txt` 是本模块最接近 GEO 的一件**：它是「给 AI 读的入口」，动态生成、与 sitemap 同源、有免责。**但它描述的是「有哪些页面」，不是「我们的知识主张是什么」**——后者才是 AI 引用需要的。

**[E1] FAQ 结构化：**有 FAQ 内容，**没有 FAQPage schema**

- FAQ 数据存在 4 处：
  - `src/content/faq.ts`（6 问，`dealers` 页用：`dealers/page.tsx:13,305`）
  - `src/content/fitment.ts`（每平台 `faqs[]`，`fitment/[platform]/page.tsx:382`）
  - `src/content/tools.ts`（`offsetCalculatorFaqs`，`tools/offset-calculator/page.tsx:323`）
  - `src/content/products.ts`（`faqs`，`products/page.tsx:300`）
  - 合计 `question:`/`answer:` 键 **71 处**
- 渲染形式：
  - `dealers` → `<article><h3>{question}</h3><p>{answer}</p></article>`（`dealers/page.tsx:301-308`）
  - `fitment` → `<dl><dt>{question}</dt><dd>{answer}</dd></dl>`（`fitment/[platform]/page.tsx:383-394`）
- **`grep -rn "FAQPage" src/` → 零命中**。FAQ 内容在页面上，但**没有一条 FAQ 被 schema 标记** → 拿不到 Google 的 FAQ rich result，AI 也无法结构化抽取。

**[E1] 答案优先（answer-first）只覆盖 6 篇指南**

- `GuideEntry.answer`（`types.ts:820-821`）→ `prose-article.tsx:85` 渲染为 standfirst
- 覆盖：`/insights/[slug]` 6 篇
- **不覆盖**：`/fitment/[platform]`（3 页，最高意图页）、`/products/*`（5 页）、`/capabilities`、`/about` —— 这些页的正文都是段落流，没有一句「先给结论」

### 已具备

1. **`needsVerification` 的可见降级机制**（`types.ts:822-823` + `prose-article.tsx:111-130` + `insights-contract.ts:476` + `resources.ts:57,276,421`）—— 内容自知不可信并明说，**是全仓最强的可信度信号**。
2. **fitment 的「不把范围当事实」纪律**（`fitment.ts:10-20` 的 20 行安全声明 + `verified: false` ×11 + `sizes` 明标「STARTING REFERENCE RANGES ONLY」）—— 主动拒绝批量生成高质量假数据。
3. **`llms.txt` 是生成物、fail-closed、与 sitemap 同源、带免责**（`route.ts:11-17, 22-46, 26`）。
4. **6 篇指南有 answer-first standfirst**（`types.ts:821` + `prose-article.tsx:85`）。
5. **FAQ 内容真实存在于 4 个高价值页面**（71 组 Q/A），不是空壳。

### 缺口

| ID | 缺口 | 证据 |
|---|---|---|
| M07-G1 | **8 个 GEO 字段全仓 0 存在**（无 TS 字段、无 ACF 注册） | `grep` 零命中（src + mu-plugins） |
| M07-G2 | **`canonicalQuestion` 完全没有**——没有任何页面声明「我在回答哪个问题」 | — |
| M07-G3 | **`lastVerifiedAt` 完全没有**——`GuideEntry` 有 `readingTime` 却没有日期；`InsightGuideDocument`（`insights-contract.ts:55-63`）也无日期 | `types.ts:805-824` |
| M07-G4 | **`sourceReferences` 没有**——「Ask us for the test documentation」（`faq.ts:33`）是话术，不是引用 | `faq.ts:33` |
| M07-G5 | **`relatedEntities` 没有**——`relatedModels` 只是 UI 链接，无实体 ID、无关系类型 | `wheels/[model]/page.tsx:141` |
| M07-G6 | **FAQPage schema = 0**，71 组 Q/A 全部无结构标记 | `grep FAQPage` 零命中；`dealers/page.tsx:301-308`、`fitment/[platform]/page.tsx:383-394` |
| M07-G7 | **answer-first 只覆盖 6 篇指南**，最高意图的 fitment 平台页无 | `prose-article.tsx:85` vs `fitment/[platform]/page.tsx:352-395` |
| M07-G8 | **`llms.txt` 只有「页面目录」，无「知识主张」段落**，也没有 `## Optional` / key facts | `llms.txt/route.ts:28-72` |
| M07-G9 | **`verified` 是无保护裸 boolean**——谁都能改成 true，无签核留痕 | `fitment.ts:40` 等 11 处 |

### 重复实现

- **FAQ 渲染逻辑 4 套**：`dealers/page.tsx:301-308`（`article/h3/p`）、`fitment/[platform]/page.tsx:383-394`（`dl/dt/dd`）、`tools/offset-calculator/page.tsx:323-333`、`products/page.tsx:300-305`。**4 种语义标记、4 套样式**，且没有一个是 `<details>` 或共享组件。这也解释了为什么 FAQPage schema 一条都没发——**根本没有 FAQ 组件的统一出口**。
- **「局限声明」重复实现 3 处**：`needsVerification` 块（`prose-article.tsx:111`）、fitment 常驻提示（`fitment/[platform]/page.tsx` 侧）、`llms.txt:26` 的免责段。三处措辞不同、逻辑不同。

### 风险

| ID | 风险 | 严重度 | 证据 |
|---|---|---|---|
| M07-R1 | **`needsVerification: true` 的 3/6 指南仍在公开索引**（`resources.ts:57,276,421` 且 `insights/[slug]/page.tsx:40` 只按 preview 判 index）→ 带「请向我们核对数字」警告的技术指南被 AI 当作事实引用，而页面自己声明不可依赖 | **P0（GEO 信任）** | `insights/[slug]/page.tsx:40` + `resources.ts:12-16,57` |
| M07-R2 | **`verified: false` 的 fitment 页可被索引且被 hreflang 声明为四语**（3 平台 × 4 语言 = 12 个 URL 潜在），而每一行都标「未核验」 | 高 | `fitment.ts:40` 等；`sitemap.ts:42` + `layout.tsx:68` |
| M07-R3 | **无 `lastVerifiedAt` + 无 `dateModified`** → AI 无法判断内容新旧，Google 也无法判断时效；对「轮毂适配」这类会随车型年款变化的内容是结构性缺陷 | 高 | `grep dateModified` 零命中 |
| M07-R4 | 若未来为 SEO 把 `verified` 批量改 true（无门禁）→ **发布错误的轮毂适配参数**，属于人身安全级风险 | **P0（若发生）** | `fitment.ts:40`（裸 boolean） |

### 建议动作

1. **P0 · 给 `GuideEntry` 与 `InsightGuideDocument` 加三个最小字段**：`canonicalQuestion: string`、`lastVerifiedAt: string`（ISO 日期）、`sourceReferences: {label,url?}[]`。
   - 落点：`src/content/types.ts:805-824`、`src/lib/wordpress/insights-contract.ts:55-63`。
   - **这是最小可落地集**：3 个字段就能让 6 篇指南 + 3 个平台页变成「可被 AI 判断时效与出处」的内容。
2. **P0 · 让 `needsVerification: true` 的指南 `robots.index = false`**（或强制补齐 `lastVerifiedAt` 才允许 index）。
   - 落点：`src/app/insights/[slug]/page.tsx:40`。
3. **P1 · 抽一个 `<FaqList>` 组件并把 71 组 Q/A 收进去，同时输出 `FAQPage` schema**。
   - 落点：新建组件；替换 `dealers/page.tsx:301-308`、`fitment/[platform]/page.tsx:383-394`、`tools/offset-calculator/page.tsx:323-333`、`products/page.tsx:300-305`。
   - 注意：Google 自 2023 起对非政府/医疗站点收紧 FAQ rich result，但 **FAQPage schema 对 AI 抽取仍有价值**，且成本极低。
4. **P1 · 给 `PlatformFitment` 加 `applicability` / `limitations` 字段**，把 `platformFitments` 里已有的散文化 `intro` / `models[].notes` 提升为可抽取字段。
   - 落点：`src/content/types.ts`（`PlatformFitment` 类型）+ `fitment.ts:27,123,205`。
5. **P1 · `llms.txt` 加一段「Key facts」**（公司主体、四产品线、服务范围、最近核验日期、免责边界），让它从「目录」变成「摘要」。
   - 落点：`src/app/llms.txt/route.ts:22-30` 之间插入。
6. **P2 · 给 `verified` 加门禁**：把 `verified` 从 `boolean` 改为 `{ verified: true, by: string, at: string, source: string } | { verified: false }` 的判别联合，让「翻 true」必须带签核信息。
   - 落点：`src/content/fitment.ts:19`（类型导入处）+ 11 处 `verified: false`。
7. **P2 · answer-first 扩展到 fitment 平台页**：`platform.heroLine` 之下加一句 `platform.shortAnswer`。
   - 落点：`fitment/[platform]/page.tsx`。

### 依赖

- 建议 1/4/6 都要改动 WordPress ACF 字段与 REST 合同 → **移交 A 号 Agent（内容接缝）+ B 号 Agent（数据完整性）**，并与 WordPress MU 插件（5,711 行）的字段注册联动。
- 建议 2 会降低 `insights` 可索引页数（6 → 3）→ **移交 G 号 Agent（业务对齐）**确认是否可接受。
- 建议 3 的组件抽取与 `dealers`/`products`/`tools` 三个页面耦合 → **移交 A 号 Agent**。

### 验收方式

- `grep -rn "canonicalQuestion\|lastVerifiedAt\|sourceReferences" src/` → 期望有输出（当前零）。
- 对 `/insights/offset-and-backspacing`（`needsVerification: false`）与 `/insights/how-to-measure-fitment`（`needsVerification: true`）分别 Rich Results 测试 → 后者当前应能拿到 index，改后应为 noindex。
- `curl localhost:3100/llms.txt | head -20` → 期望看到 `Key facts` 段。
- 对 `/dealers` 做 Rich Results 测试 → 期望出现 `FAQPage`（当前无）。

---

## SEO 立即可见的硬缺口

> 按「影响 × 修复成本」排序。**前 4 项都不需要重构，单文件级别即可修。**

| # | 缺口 | 影响 | 修法（单文件级） | 证据 |
|---|---|---|---|---|
| **1** | **`/thank-you` 可被索引且在 sitemap 里** | 高 — 一个只对提交者有意义、带 `?id=`/`?receipt=` 的确认页会被收录，参数进入 Google 索引 | `src/app/thank-you/page.tsx:19` 改 `index: false`；`src/app/sitemap.ts:44` 删 `"/thank-you"` | E1 |
| **2** | **`metadataBase` 在 env 缺失时 = `http://localhost:3000`** | 高 — 所有相对 canonical/hreflang 烤成 localhost；因 sitemap/robots 已闭锁，**不会报错，静默上线** | `src/lib/site-url.ts:19` 不返回 localhost；`src/app/layout.tsx:56` 未配置时不设 `metadataBase` | E1 |
| **3** | **`needsVerification: true` 的 3 篇指南仍被索引** | 高（GEO/信任）— 页面自己写「请先核对数字」，却被 AI 当事实引用 | `src/app/insights/[slug]/page.tsx:40` 加 `&& !document.guide.needsVerification` | E1 |
| **4** | **sitemap 多语言无条件展开** | 高 — `zh/es/th` 全量 URL 进 sitemap，正文是英文，hreflang 互指 → 重复内容 + 低质多语言信号 | `src/app/sitemap.ts:68-77` 把 `homepageLocales` 的 filter 提升为通用 `readyLocalesFor(path)`，或临时 `INDEXABLE_LOCALES = ["en"]`（`src/lib/i18n/types.ts:42`） | E1 |
| **5** | **21 页无 canonical** | 中 — 参数化 URL / 大小写 / 尾斜杠全部成为独立页；E3 侧 Jev 审计独立复现（17/60） | 逐页补 `localizedAlternates(...)`（清单见 M06-G1），或先抽 `buildPageMetadata` helper | E1 + E3 |
| **6** | **`Service.areaServed: "Worldwide"` 无正文支撑** | 中 — schema 说了正文没说的话，触及可验证性底线 | `src/app/products/ev-components/page.tsx:67` 删除，或在正文加对应句 | E1 |
| **7** | **OG/Twitter 覆盖 1/38** | 中 — B2B 分销商转发链接无预览卡，直接影响询盘转化 | `src/app/layout.tsx:52-58` 的 `baseMetadata` 加默认 `openGraph` + `twitter` | E1 |
| **8** | **FAQPage schema 完全缺失（71 组 Q/A）** | 中 — 零结构标记，AI/搜索引擎无法抽取已有 FAQ | 抽 `<FaqList>` 组件并输出 `FAQPage`；或先在最热页（`/dealers`、`/fitment/[platform]`）加 schema | E1 |
| **9** | **`resources/bolt-patterns/[pattern]` 用 307 而兄弟用 308** | 低 — Search Console 报「临时重定向」，信号迁移慢 | `src/app/resources/bolt-patterns/[pattern]/page.tsx:1,24` 改 `permanentRedirect` | E1 |
| **10** | **`sitemap.ts` 的 `priority` 手工表** | 低 — Google 已声明忽略 priority，维护成本 > 收益 | 可保留；若清理则 `src/app/sitemap.ts:88-94` | E1 |

### 附：一处需要修正 BASELINE 的事实

BASELINE §5.3 判断「`localizedEntries` 的 filter 条件只对首页做门槛过滤」——**成立**（`sitemap.ts:71`）。
但 BASELINE 未提「`/thank-you` 在 sitemap 里而且是 `index: true`」这一条，**这是本次新发现**（`sitemap.ts:44` + `thank-you/page.tsx:19`），且已被独立 E3 报告（`outputs/reports/jev-seo-9080-2026-10-12/audit.json` 的 `sitemap_bad_urls`）间接印证。

另外需修正任务书的两处假设：
1. `site-url.ts` 的 fallback 是 **`http://localhost:3000`**，**不是**「某个字面量域名」。字面量域名 `www.fenghuai.com` 在 `src/content/site.ts:22`，**但没有任何代码引用它**（死字段）。
2. 7 个无 metadata 页面**不是双漏**，是 7 个显式的 legacy 重定向页（其中 6 个 308、1 个 307），**且都不在导航里**。这是正确的 IA 行为。

### 移交说明

| 事项 | 移交 |
|---|---|
| WordPress ACF 侧 GEO 字段注册、REST 合同扩展 | A 号 Agent（内容接缝） |
| `verified` 签核字段的数据完整性（谁能改、有无审计） | B 号 Agent |
| 生产域名形态（裸域 vs www）、`X-Robots-Tag` 的应用层实现、部署是否存在第二套反代 | D 号 Agent |
| `INDEXABLE_LOCALES` 收口对收录量的业务影响、`needsVerification` 页面是否值得放弃索引 | G 号 Agent |
| JSON-LD 序列化组件的组件层归属、`<FaqList>` 组件的实现 | A 号 Agent |
