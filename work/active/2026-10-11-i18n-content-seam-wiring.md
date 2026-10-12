# P1 正文多语言打通（预览版：功能优先）

- **状态**：进行中
- **创建日期**：2026-10-11
- **来源**：用户 2026-10-11 指令「正文一定要多语言模式执行好；现在是预览版本，先把功能实现，再考虑权限问题」

## 背景（实测确认，2026-10-11）

`src/lib/i18n` 骨架完整（LOCALES / proxy rewrite / 字典 / language-switcher），但**正文层从未接线**：

```
Proxy rewrite (/zh/* → 内部路由)     ✅ 已做
   └─ getLocale()                     ✅ 已做
        ├─ site-header / site-footer  ✅ 吃 t()，有字典
        └─ 页面正文                    ❌ 吃英文常量
```

三条根因：

1. **`src/content/*.ts` 无 locale 维度** —— 38 个模块、77,196 行正文常量，`grep locale` 零命中
2. **WP 适配器有 locale 参数，11 处调用从不传**
   - `getWordpressPageDocument<T>(key, {locale?})` 支持 locale，`about/capabilities/custom-aluminum/ev-components/homepage/product-lines/safety-tires/wheel-capabilities` 全部省略
   - `pages.ts:37` 有 `?? await getLocale()` 兜底，所以「看起来能用」
   - `normalizeWordpressPage` 的 `locale_status` 门（`pages-contract.ts:81`）是**对的**，但 `homepage.ts:26` 的 `native ?? homepageContent` 会**静默回落到英文常量**
   - Insights 页面**连 `getLocale` 都没导入**
3. **26 个页面直接 `import from "@/content/"`**，绕过任何 resolve 层

实测证据（2026-10-11）：
- `GET /wp-json/fh/v1/pages?key=home` → `locale_status={"en":"approved"}`，`content_by_locale` 只有 `en` 键
- `curl /zh` 与 `curl /` 的 `<h1>` **完全相同** → zh 页面在渲染英文

## 本切片目标（预览版口径）

**功能优先**：让四种 locale 的 URL 能真正渲染对应语言的正文，链路端到端可验证。

**本轮不做**（按用户「先功能、后权限」）：
- 不解除 `INDEXABLE_LOCALES`（保持只有 `en`）
- 不调整 noindex / hreflang / sitemap 门槛
- 不批量机翻业务/法律/工程正文
- 不 commit / push / deploy

## 执行分层

### 第 1 刀 · 接线 + 可观测（无翻译，纯工程）

目标：让「未批准 / 未翻译」变成**可观测**，而不是静默回落。

1. **8 处适配器调用传 locale**
   `about.ts` / `capabilities.ts`(=wheel-capabilities.ts) / `custom-aluminum.ts` / `ev-components.ts` /
   `homepage.ts` / `product-lines.ts` / `safety-tires.ts`
   → `getWordpressPageDocument<T>("key", { locale: await getLocale() })`

2. **Insights 页面补 locale**
   `insights/page.tsx` / `insights/[slug]/page.tsx` → 传 locale 进 `getInsightGuideDocuments/Document`

3. **非 en 回落必须可见**
   - `normalizeWordpressPage` 在 `locale !== "en"` 且无批准翻译时返回 `null`（现状）→ **页面必须走一个明确的「本页暂无该语言」路径**，而不是拿英文常量冒充
   - 方案：新增 `resolveLocalizedPage()` 帮助函数，返回 `{ content, locale, fallback: boolean }`；
     `fallback === true` 时服务端打 structured log（`[i18n] fallback locale=zh key=home`）
   - ⚠️ **预览版可以仍然回落渲染英文**（为了页面不 500），但**必须留痕**，不能静默

4. **WP 侧填 zh 数据（功能验证用）**
   用 `content_by_locale.zh` + `locale_status.zh = "approved"` 给 **home** 一个真实中文版本
   （用于证明链路通；文案质量不追求，正式翻译是后续 P1 的活）

### 第 2 刀 · 正文来源分层（本轮只做接线，不改 38 个内容模块）

按页面类型分组的接线顺序（**只做能接线即生效的**，不重构内容模块）：

| 组 | 页面 | 本轮动作 |
|---|---|---|
| A | home / about / capabilities / products×4 / request-a-quote / thank-you / privacy | 接线（第 1 刀）+ WP 填数据 |
| B | 轮毂目录 / 详情 / bolt-patterns / fitment | **只接 locale 到 label/表头层**，数据字段不翻 |
| C | support/* / resources/* / custom-development / dealers/* / manufacturing | **本轮不动**（须人工核验） |
| D | tools/offset-calculator / contact | 接线（文案少） |

## 完成记录（2026-10-11）

### 第 1 刀 · 接线 + 可观测 ✅

| 文件 | 改动 |
|---|---|
| `src/lib/i18n/localized-page.ts` **(新建)** | `resolveLocalized()` —— 有对应 locale 就返回，否则回落默认语言并打 `[i18n] fallback locale=X scope=Y reason=no-approved-translation`；`en` 是严格 no-op（同一对象引用、零日志） |
| `src/lib/wordpress/{homepage,about,wheel-capabilities,product-lines,ev-components,custom-aluminum,safety-tires}.ts` | 传 `{ locale }`，回落改走 `resolveLocalized` |
| `src/lib/wordpress/insights.ts` | 三条回落分支全部透传 locale，`scope=insights:index` |
| `src/app/insights/page.tsx` + `insights/[slug]/page.tsx` | 读 locale 并透传（含 `generateMetadata`） |
| `src/app/page.tsx` + `src/app/about/page.tsx` | **诊断遗漏项**：`generateMetadata()` 里直接调 `getWordpressPageDocument` 且不传 locale → 本地化 URL 会吐英文 SEO。已修 |

**grep 证据**：9 处 `getWordpressPageDocument` 调用点全部带 locale（唯二例外是 `pages.ts:20` 的定义行与 `api/preview/route.ts`——后者走 `preview:true`，契约本就跳过 locale 门，保持原样）。
Insights 4 处调用全部 `{ preview, locale }`。

### 第 2 刀 · WP 侧填 zh 数据（功能验证）✅

| 交付 | 说明 |
|---|---|
| `scripts/i18n/make-locale-content.py` | 从 `content_by_locale.en` **派生同构**中文 JSON；不透传的字段（id/href/media/enum）原样拷贝；**结构一致性硬校验**（形状不符直接 exit 非零），并列出未翻译叶子路径 |
| `scripts/i18n/seed-locale-content.php` | 通过 wp-cli 写入 `fh_content_by_locale_json` + `fh_locale_status_json`（**合并**而非覆盖其他语言），读回自证 |

**home 页 zh 覆盖**：`hero / capabilities / delivery / closing / productLines` 全部字段——未翻译叶子 **0 个**。
结构化校验通过：`shape(source) == shape(derived)`。

### 端到端实测（全部真跑）

| 检查 | 结果 |
|---|---|
| `GET /wp-json/fh/v1/pages?key=home` | `locale_status: {en: approved, zh: approved}`；`content_by_locale` keys `[en, zh]` |
| `curl /zh` | `<h1>以专业制造能力支撑的汽车部件` ✅ |
| `curl /` | `<h1>Automotive components backed by specialized manufacturing` ✅ |
| `curl /es` `/th`（无数据） | 回落英文 + 日志 `[i18n] fallback locale=es scope=home` ✅ |
| 中文是否泄漏进 en 页 | `grep -c 以专业制造能力 /en` = **0** ✅ |
| 撤回落门（`zh=draft`） | **双层门都生效**：WP 插件 `fenghuai-pages.php:104` 把非 approved 语言从公开 payload 剔除；Next `pages-contract.ts:81` 再判一次 → 契约返回 `null` |

### 门禁

`npm test` **42/42** ｜ `npx tsc --noEmit` exit 0 ｜ `npx eslint .` **0 error 0 warning** ｜ 无 commit

### 关键发现（写进 STATUS/DECISIONS）

1. **诊断漏了 2 个调用点**：`src/app/page.tsx:13`、`src/app/about/page.tsx:12` 在 `generateMetadata()` 里**直接调适配器**，绕过 resolver → 只修那 7 个文件会让每个本地化 URL 吐英文 SEO。
2. **撤回门是双层的**（WP 插件 + Next 契约各判一次）—— 比诊断时以为的只有一层更稳。
3. **改 WP meta 会触发 `save_post_page`**：该钩子只保存表单字段，会**清掉**其他未提交 meta。用 wp-cli 直接改 meta 时**必须避开或绕过该钩子**，否则 `content_by_locale` 被整个覆盖（本轮踩到并确认 `keys: en,zh` 仍在，未真正丢数据）。
4. **`next dev` 改模块后必须整进程重启**：只删 `.next/cache/fetch-cache` 不够，内存里的旧模块图会继续服务旧内容。
5. **`safety-tires.ts` 既存缺陷（非本轮引入）**：返回的 viewport 读本地常量（`resolveViewport(selfSealingTirePage.painPoint)`）而不是 `source.painPoint` → 即使有已批准 WP 内容，viewport 也会用本地版本。第一刀为控制范围只标记未修；**已在「第 3 刀」真修**（见下）。

### 未做（刻意）

- 其余 5 个 WP 页面（capabilities / product-lines / ev-components / custom-aluminum / safety-tires）**未填 zh 数据**
- 26 个非 WP 页面（轮毂目录 / insights 正文 / support 法律页 / tools 等）**仍未接 locale**——它们的正文在 `src/content/*.ts`，需要单独一层设计（工作文件的「第 2 刀 · 分组表」已列）
- `INDEXABLE_LOCALES` 仍为 `["en"]`；noindex / hreflang / sitemap 门槛**未动**

---

## 第 3 刀 · 修 safety-tires 缺陷 + 第二个页面（about）落地 ✅

### A. `safety-tires.ts` 缺陷已修（本轮真修，不再只是标记）

**症状**：五个 viewport 从**本地英文常量**取数，而不是 WP 解析后的 `source`：
```ts
painPoint: resolveViewport(selfSealingTirePage.painPoint),   // ❌ 本地常量
painPoint: resolveViewport(source.painPoint),                // ✅ 已修
```
→ 即使 WordPress 返回了已批准译文，这五个视口仍渲染英文正本。

**全仓扫描确认这是孤例**（不是系统性模式）：`about` / `wheel-capabilities` / `custom-aluminum` / `ev-components` 四个 resolver 全部正确使用 `source.*`，只有 `safety-tires` 写错。已加注释说明为何必须读 `source`。

### B. `about` 页中文已落地

- 生成器重构为**页面无关**：翻译词表拆到独立的 `scripts/i18n/translations_zh.py`（按 page key 分组），新增页面 = 加一个 key，不动逻辑
- 新增 **`UNTRANSLATABLE_PREFIXES` 加 `#`**（`#product-lines` / `#wheel-manufacturing` 这类锚点是结构值）
- ⚠️ 踩坑：数据模块最初命名为 `translations-zh.py`（**连字符**）→ Python 无法 import → 改名 `translations_zh.py`
- `about` 全部字段覆盖：`hero / role / wheelFactory / tireFactory / closing`，**未翻译叶子 0 个**
- 已 seed 进 WP（post **1312**），`locale_status: {en: approved, zh: approved}`

### 端到端矩阵（4 locale × 2 页，全部实跑）

| URL | H1 |
|---|---|
| `/` | Automotive components backed by specialized manufacturing |
| `/zh` | 以专业制造能力支撑的汽车部件 |
| `/es`、`/th` | 英文 + 日志 `[i18n] fallback locale=es scope=home` |
| `/about` | One Shenzhen project interface. Specialized manufacturing behind every line. |
| **`/zh/about`** | **一个深圳项目接口，每条产品线背后都有专业制造能力。** |
| `/es/about`、`/th/about` | 英文 + 日志 `[i18n] fallback locale=es scope=about` |

- **zh 的 fallback 日志计数 = 0**（正确：有译文就不该回落）
- es/th 的 fallback 日志 4 条（home + about 各 2）—— 回落可见
- `zh/about` 深层区块逐项命中：`清晰的商务接口` / `集团结构` / `核验责任制造商` / `轮毂生产基地` / `自密封轮胎` / `从您需要服务的产品与市场开始`
- CJK 字符统计：`zh/about` **2267** 个 ｜ `en/about` **6** 个 —— 且逐一定位确认那 6 个是**语言下拉里的「中文」选项**（预期，不是泄漏）
- 撤回门（`about` `zh=draft`）：WP 公开 payload 的 `content_by_locale` 立刻缩回 `['en']` ✅

### 🔴🔴 本轮最重要的新发现：Next 16 的 data cache 不能用清目录解决

**现象**：seed `about` 之后 `/zh/about` 仍渲染英文，且服务端持续打印
`[i18n] fallback locale=zh scope=about reason=no-approved-translation`
—— 但**同一个 REST 端点用 curl 打返回的明确是 `zh: approved`**。

**排查过程（可复用）**：
1. 写脚本**逐条复现 `normalizeWordpressPage` 的门禁逻辑**并喂实时 REST 数据 → 结论 `>>> SERVED`（契约本身没问题）
2. 在 `pages-contract.ts` 加诊断日志 → `status=undefined`（运行时拿到的 locale_status 是空的！）
3. 在 `client.ts` 的 `wpRead` fetch 之后加探针 → **探针从未触发**，但 reject 日志照打
   → **决定性线索**：请求根本没走到 fetch，响应来自缓存
4. `rm -rf .next/cache/fetch-cache` **无效**（且该目录当时甚至不存在）
5. ✅ **`kill` 进程 + `rm -rf .next` + 重启 → 立刻正常**

**结论**：Next 16 把 WP 读取缓存在**进程内存**（配合 `next: { revalidate, tags }`），
**不是**只落在 `.next/cache`。所以改了 WP 数据后，**必须整进程重启 dev server**，
删磁盘缓存目录不够。这解释了上一轮 `/zh` 首测失败后我重启才通过的现象。

📌 **纪律**：今后改 WP 内容后验证，标准动作 = **杀掉 dev server → `rm -rf .next` → 重启**，
然后才采信渲染结果。否则会把「缓存未失效」误判成「代码有 bug」（本轮就差点这样）。

### 🔑 第二个页面立刻暴露的东西（正是做这一步的理由）
1. **`safety-tires` 的缺陷会污染任何以它为例的验证** —— 先修它是对的顺序
2. **首页通过 ≠ 机制通用**：`about` 第一次就失败了，原因却**不在 i18n 代码**，而在 Next 的缓存语义。
   若只信首页的绿灯，会得出「机制已经跑通，剩下就是填数据」的**错误结论**。
3. **词表必须按页拆分**：`about` 的字符串里有一批和首页**同名不同上下文**的（如 `Casting and forming`、
   `Precision machining` 在两页都出现）。共用一张表会串味；按页分组后每页可独立取词。
4. **「未翻译叶子数」是最有用的回归指标**：home 加了 5 个新字段名后仍是 0 泄漏，
   靠的就是每次生成都重新数一遍 gap。

### 门禁（全绿）

`npm test` **42/42** ｜ `npx tsc --noEmit` exit 0 ｜ `npx eslint .` **0 error 0 warning** ｜
`npm run build` exit 0 ｜ 无 commit

---

## 第 4 刀 · 剩余 5 页批量填充：**发现混合页，批量方案不成立** ⚠️

### 先说结论：不能「一次全填掉」，原因不是工作量，是页面结构

我先量化了可复用率 —— **之前的判断是错的**：

| 页面 | 唯一字符串 | 可复用（已有词表） | 新增 |
|---|---:|---:|---:|
| capabilities | 108 | 4 (3%) | 104 |
| product-lines | 16 | 1 (6%) | 15 |
| ev-components | 108 | 1 (0%) | 107 |
| custom-aluminum | 167 | 0 (0%) | 167 |
| safety-tires | 156 | 4 (2%) | 152 |
| **合计** | **555** | **10 (2%)** | **529** |

**我原先说「词表可直接复用 about/home 里已翻好的大量共性术语」是不成立的** —— home/about 是面向客户的门面文案，
这 5 页是**工程/规格正文**，词汇几乎不重叠。真实工作量是 529 条新技术文案。

### 关键发现：`/products` 是**混合页**，WP 只托管了它的一部分

我完整跑通了 `product-lines` 这一页作为验证（生成 → seed → REST → 渲染）：

- ✅ **成功**：WP 侧 `locale_status {en:approved, zh:approved}`，`content_by_locale keys=[en,zh]`
- ✅ **卡片层渲染中文**：`/zh/products` 页面里 `轮毂` / `电驱铝制壳体` / `定制铝制品开发` / `自密封轮胎` **全部命中**
- ❌ **但 H1 仍是英文**：`Four product lines` —— 因为该页 `<h1>` 取自 **`src/content/products.ts` 的 `catalogueIntro.heading`**，**根本不经过 WordPress**

`src/app/products/page.tsx` 的正文来源是**两套拼起来的**：

| 区块 | 来源 |
|---|---|
| 四张产品线卡片 | ✅ WordPress `product-lines` 页 |
| eyebrow / H1 / lede / supporting（`catalogueIntro`） | ❌ 本地 `src/content/products.ts` |
| `catalogueGuidance` / `catalogueSkuCallout` / `catalogueFitmentSupport` / `catalogueRoutes` / `catalogueResourceLinks` | ❌ 本地常量 |
| `faqs`（`src/content/faq.ts`） | ❌ 本地常量 |

→ **所以「把 WP 页翻完」只能让这类页面翻一半** —— 这正是我在最初方案里标的 **B/C 组问题**，
只是它比我预期的更普遍：**不只非 WP 页面，连「已被 WP 接管」的页面也常常只是混合态**。

### 已落地（本轮唯一的真交付）

- `scripts/i18n/translations_zh.py` 新增 `product-lines` 词表（16 条，0 untranslated）
- WP post **1314** 已 seed：`locale_status {en:approved, zh:approved}`
- 🔧 **修掉 `seed-locale-content.php` 的一个脆弱断言**：原读回自检写死 `content[$locale]['hero']['heading']`，
  而 `product-lines` 的内容是**数组**没有 `hero` → 报 `VERIFY FAILED`（**写其实成功了**）。
  已改为「递归取任意一条人类可读字符串」→ 现在对象/数组两种形状都通过，且 home/about 回归仍 ✔

### 🔴 本轮最重要的方法学教训：子 agent 的「结构诊断」被证伪

子 agent 停下并报告说：「`content_by_locale` 无法变成 `[en,zh]`，编辑词表达不到目标，
根因是 `fenghuai-pages.php` 的过滤器 / 序列化缝隙，我不猜，请你拍板开哪个缝」。

**该诊断是错的。** 我亲手跑了一遍：
1. 词表不存在 → 生成器报 `no translation table`（很正常，它还没干活）
2. 补上词表 → 生成 **0 untranslated**
3. seed → **`keys=[en,zh]` 写入成功**
4. REST → **`{"en":"approved","zh":"approved"}`，`zh[0].name = 轮毂`**

→ **它把一个「自己还没执行到那一步」的状态，误判成了「机制有缺陷」**，并据此停工。
它的谨慎（不擅自改 `src/`）是对的，**但结论下错了**。

📌 **纪律**：
- **子 agent 说「某机制不可行」时，必须自己复现一遍再采信** —— 它可能只是卡在自己没走完的流程上
- **凡「A 不可能实现」的断言，用一次最小端到端实跑就能证伪**，成本远低于围绕它做架构决策
- 与之相对：**它报告的第二个事实是对的且很有价值** —— `VERIFY FAILED` 确实发生了，只是根因是**我的脚本断言太窄**，不是机制问题

### 混合页 vs 纯 WP 页：需要重新分类（下轮的输入）

| 类型 | 页面 | 翻 WP 是否足够 |
|---|---|---|
| **纯 WP** | home ✓ / about ✓ / capabilities ? | 是（已验证 2 个） |
| **混合** | **/products（已实测）** | **否** —— 需同时给 `src/content/*.ts` 加 locale 变体 |
| **纯本地** | 26 个非 WP 页面 | 否 |

⚠️ **因此「还剩 5 个 WP 页面，纯填活」这个前提本身需要修正**：
必须先逐页确认它是纯 WP 还是混合，再决定是否动 `src/content/*.ts`（那是另一层设计，非填词）。

### 本轮改动 & 状态

| 文件 | 改动 |
|---|---|
| `scripts/i18n/translations_zh.py` | +`product-lines` 词表（16 条） |
| `scripts/i18n/seed-locale-content.php` | 读回断言改为形状无关（修脆性 bug） |

- WP post 1314 已含 zh；其余 4 页（1313/1315/1316/1317）**未动**，仍是 `{en:approved}`
- 门禁：generator 0 untranslated ｜ REST 双语言确认 ｜ 渲染抽验中文命中
- 无 commit
- dev server 已按纪律 `kill` + `rm -rf .next` + 重启（3200 正常）

### 本轮改动文件

| 文件 | 改动 |
|---|---|
| `src/lib/wordpress/safety-tires.ts` | 五个 viewport 改读 `source.*`（**真缺陷修复**） |
| `scripts/i18n/translations_zh.py` **(新建)** | 按页分组的 zh 词表（home + about） |
| `scripts/i18n/make-locale-content.py` | 重构为页面无关；`#` 前缀加入不翻译名单 |
| `work/active/2026-10-11-*.md` / `STATUS.md` | 记录 |

（`client.ts` / `pages-contract.ts` 曾加诊断探针，**已全部移除并确认 diff 为空**）

## 非范围

- 不做全站人工翻译（后续纵向 Issue）
- 不解除任何索引门槛
- 不修改 `INDEXABLE_LOCALES`
- 不改 `src/content/*.ts` 的 38 个模块结构
- 不 commit / push / deploy
