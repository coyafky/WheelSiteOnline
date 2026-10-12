# Astryx 组件兼容性基线与全站盘点（P0）

- 日期：2026-10-11
- 任务：`work/queued/2026-10-11-astryx-component-compatibility-matrix.md`（P0，全站迁移第一项）
- 上游：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`、`PAGE-SPECS/astryx-neutral-global.md`、`PAGE-SPECS/astryx-neutral-page-families.md`
- 依赖版本：`@astryxdesign/core@0.6.7`（实测 `package.json` `"version": "0.6.7"`）
- 原始证据：`outputs/reports/27-astryx-probe-evidence-alma-2026-10-11.md`、`outputs/reports/astryx-p0-probes/`
- 状态：**只读审计完成**。未改业务逻辑 / 页面 JSX / 组件代码；未提交、推送或部署。

> 诚实声明：本文件区分「已探针（有命令+输出）」与「只读（读 `.d.ts` / 源码，未跑）」。
> 未实现的东西一律不写作「已迁移」。

---

## 一、方法与推导

### 1.1 31 个渲染模板的推导（实测，非引用）

```
find src/app -name page.tsx | wc -l                        # 38
find src/app -name page.tsx | grep -v '\[' | wc -l         # 32 静态
find src/app -name page.tsx | grep '\[' | wc -l            #  6 动态族
grep -rln "permanentRedirect\|redirect(" src/app --include=page.tsx   # 8 命中
```

8 个重定向命中里，`src/app/products/wheels/[model]/page.tsx` 是**渲染模板**（仅在 slug 需要规范化时
`permanentRedirect`，另有 `notFound`），**不是纯重定向路由**。因此纯重定向 = **7 个**：

`gallery/`、`gallery/wheels/`、`manufacturing/`、`resources/`、`resources/[slug]/`、
`resources/bolt-patterns/`、`resources/bolt-patterns/[pattern]/`。

**38 − 7 = 31 个渲染模板。** 与任务书「31 个渲染模板 + 7 个重定向」一致，本推导即其出处。
（任务书正文写的「36 个 page.tsx」是旧数；当前工作树实测为 **38**。）

> 与「任务书说 36」的差异已按验收要求如实标出：以**实测 38** 为准，**31 + 7** 结论不变。

### 1.2 探针手段

- **SSR 静态渲染**：`react-dom/server` 的 `renderToStaticMarkup` 直接渲染候选原语，看真实 DOM 标签。
  （探针脚本见 `astryx-p0-probes/ssr-probe*.mjs`，输出见 `ssr-probe*-output.txt`。）
- **客户端边界**：`grep -rl "^'use client'"` 每个候选目录（§二.1 证据）。
- **契约**：读 `.d.ts` 逐 props（证据见 `astryx-p0-probes/raw-dts-signals.txt`，带行号）。
- **现状 HTML**：复用 :3200 运行中的开发服务器（**未新起进程**），`curl` 取真实响应。
- **源码只读**：读现有项目组件确认语义（FAQ、分页、筛选、Insights、Header）。

未跑：真实浏览器键盘/焦点、无 JS 端到端、四语言逐页、320px 重跑（见 §六 开放问题）。

---

## 二、逐候选探针发现（争议候选）

### 2.1 Pagination —— `有理由保留原生/项目组件`

| 项 | 发现 |
|---|---|
| 契约 | `PaginationProps.onChange: (page: number) => void` **必填**；**无 `href` / `as` / link 组件属性**（`Pagination.d.ts`，`raw-dts-signals.txt`） |
| SSR 实测 | 产出 `<nav aria-label="Pagination"><div><button type="button" disabled …>`；**输出中无任何 `<a href>`**（`ssr-probe-output.txt`） |
| 客户端边界 | `use client` 文件 2/2 → 纯客户端 |
| 现状 | `src/components/wheels/wheel-catalogue-pagination.tsx` 用 Next `<Link>`，带 `rel="prev\|next"` + `aria-current="page"`；真实 HTML 里是 `<a rel="next" href="/products/wheels?page=2">` |
| 结论 | **保留原生链接分页**。Astryx Pagination 只能 `onChange` 切页 → 破坏①可爬取 URL ②无 JS 翻页 ③URL 携带完整筛选态。`PAGE-SPECS/wheel-catalog.md §5.4/§10` 明确要求可爬取普通链接与无 JS。 |

### 2.2 CheckboxInput —— `有理由保留原生/项目组件`

| 项 | 发现 |
|---|---|
| 契约 | `onChange?: (checked: boolean, e) => void`（受控**单布尔**），有 `htmlName` 但语义是单值布尔 |
| 客户端边界 | `use client` 2/2 → 纯客户端 |
| 现状 | 目录筛选真实 HTML 是 **76 个原生 `<input type="checkbox" name="pcd\|process\|…" value="…">`**，靠 `<form method="get">` 同名多值提交 |
| 结论 | **保留原生多值 checkbox**。Astryx 受控单布尔 `onChange` 不等价于「同名多值 GET 提交」；替换会①引入客户端边界②破坏无 JS 提交③改变 URL 契约。 |
| 例外 | `CheckboxInput` 在**单个布尔同意项**（如询盘表单的隐私同意）上是**已采用**：见 `src/components/inquiry-form.tsx:9`。这两处语义不同，别混。 |

### 2.3 Table —— `有理由保留原生/项目组件`（当前切片）

| 项 | 发现 |
|---|---|
| 契约 | 数据驱动：`TableProps<T>` + `columns`/`data` + `renderCell`（`Table/Table.d.ts`） |
| 客户端边界 | `use client` **30/18** → 纯客户端、重 |
| 现状 | `<table>` 用于 3 处：变体规格矩阵（`wheel-variant-selector.tsx`）、EV 对照表（`ev-components-page.tsx`，含 `<caption class="sr-only">`）、`custom-development/page.tsx`。都是**内容驱动**、`md` 以上才切真表、语义化 `<caption>`/`<th>` |
| 结论 | 当前切片**保留原生 `<table>`**：Astryx Table 引入纯客户端边界与数据编排层，而这三处是服务端渲染的内容表；若 P3 要统一外观，须先证明 `renderCell` 能逐格等价且不丢 `<caption>`/`sr-only`。 |

### 2.4 Card / ClickableCard —— `已采用`（Card）/ `已探针待验收`（ClickableCard）

| 项 | 发现 |
|---|---|
| Card 契约 | 纯容器 `Card({children, padding, variant, elevation, …})`；**无 `use client`** → Server Component 可用（`ssr-probe-output.txt`：`<div class="astryx-card default none …">`） |
| ClickableCard 契约 | `href?` + `target?` + `onClick?`；`use client` 2/2；SSR 产出 `<div class="astryx-card …"><a …>`（`ssr-probe-2-output.txt`） |
| 现状 | 产品卡/能力卡目前是**项目组件**（真实型号、variant 交集、图片门槛、`hasRender` 兜底），未用 Astryx Card |
| 结论 | `Card` 作为**外壳**可按页族采用（服务端安全）。`ClickableCard` 就绪但**待 P3 按页验收**：必须验证①`href` 是否走 Next `Link`（站点已 `LinkProvider component={Link}`）②是否与「同一 variant 才渲染规格」的卡逻辑兼容 ③图片缺失兜底不被吞。**不得**用通用卡推断/拼接规格。 |

### 2.5 Markdown —— `不适用`（内容正文）

| 项 | 发现 |
|---|---|
| 契约 | `Markdown({ children: string, onLinkClick, components, plugins, … })`，把字符串渲染成 Astryx 组件 |
| 现状 | 正文来自 `src/content`（TypeScript 结构化 sections）与 WordPress 批准正文，**不是 Markdown 字符串** |
| 结论 | **不适用**：现有正文不是 Markdown 源，接入需要把结构化内容降级成字符串再重解析，反而丢锚点/组件化能力。正文本就可服务端渲染，无迁移收益。 |

### 2.6 TopNav / MobileNav —— `有理由保留项目组件`

| 项 | 发现 |
|---|---|
| TopNav 契约 | `TopNav({heading, startContent, centerContent, endContent})` + `TopNavItem({href, as, isSelected})`；`use client` 11/11；SSR 产出 `<nav role="navigation"><a href>`（`ssr-probe-2-output.txt`） |
| MobileNav 契约 | `MobileNav({isOpen, onOpenChange})`，原生 `<dialog>`；`use client` 3/4 |
| 现状 | `src/components/site-header.tsx`：Next `<Link>` + 原生 `<button>` + **自管 flyout 层级**（hover 展开、click 保持、Enter 切换、Escape 关闭——见 STATUS.md「本地交互整体失效已修复」） |
| 结论 | **保留项目 Header/移动导航**：现有是**多级 flyout**（不是扁条），Astryx `TopNav` 是扁平 strip、`MobileNav` 是单层 `dialog`，语义不匹配。**不强制 shell 变客户端**的说法成立（TopNav 有 `href`/`as`，且项目 Header 本就客户端），但**它表达不了现有菜单层级**，故保留。若 P1 要试，只能作为**同级并列条**的局部替换，不能承载 flyout。 |

### 2.7 TabList —— 语义核对

| 项 | 发现 |
|---|---|
| 契约 | `TabList({value, onChange})` 必填受控；**缺省 `role` 时是 `<nav>` landmark + `aria-current`**，Tab 带 `href` 才渲染 `<a>`；显式 `role="tablist"` 时 `href` 被忽略 |
| 现状 | `/insights` 的分类不是 tab：是**并列 `<section>`**（`#guides-title`、`#reference-sets-title`、`#resource-pathways-title`），`category` 只是卡片标签 |
| 结论 | **不适用（Insights）**：分类是全展示的分节，不是互斥视图切换。`TabList` 的 tabs 语义（WAI-ARIA tabs，一次只显示一个 panel）会把「全展示」变成「选中才显示」，改变 SEO 与无 JS 正文可见性。**核对通过：Insights 分类确非 tabs。** |

### 2.8 Collapsible —— FAQ 全文可见性核对

| 项 | 发现 |
|---|---|
| 契约 | `Collapsible({trigger, children, defaultIsOpen, isOpen, onOpenChange})` |
| SSR 实测 | 缺省（不给 `defaultIsOpen`）与 `defaultIsOpen` 都输出 `aria-expanded="true"`（**缺省展开**），且正文 `<p>` 始终在 DOM |
| 客户端边界 | `use client` 5/5 → 客户端 |
| 现状 | `src/components/faq-accordion.tsx` 用原生 `<details open={index===defaultOpenIndex}>`，注释明写「keeps working with JavaScript disabled」 |
| 结论 | **有理由保留原生 `<details>`**：Astryx Collapsible 是客户端 `<button>`，无 JS 时开关行为需另行证明；现有 `<details>` 天然支持无 JS、首项展开、全文常驻。**核对通过：Astryx Collapsible 缺省即展开，不满足「必须默认折叠」也满足「全文可见」，但客户端边界是它被保留的真实原因。** |

### 2.9 Button —— `已采用` + 可承载可爬取 CTA

| 项 | 发现 |
|---|---|
| 契约 | `href?: string` + `as?: LinkComponentType`（注释：`Useful for Next.js <Link>`） |
| SSR 实测 | `Button as=NextLink href` → `<a href="/products/wheels" data-next-link="1" class="astryx-button …">`（`ssr-probe-2-output.txt`） |
| 现状 | 已用于 `inquiry-form.tsx`、`direct-wheel-inquiry-dialog.tsx`；站点 `providers.tsx:19` 已 `LinkProvider component={Link}` |
| 结论 | **已采用**；**证得可渲染成 `<a>`（可爬取 CTA）**。P1–P4 的 CTA 可放心从项目 `btn-pill-*` 迁到 `Button href`。 |

---

## 三、四态矩阵

四态定义：**已采用** / **已探针待验收** / **有理由保留原生或项目组件** / **不适用**。
「已采用」= 生产代码已在用且契约已核；「待验收」= 契约已探针通过但未落生产页；「保留」/「不适用」附具体可复现理由。

| 通用模式 | 优先 Astryx 候选 | 状态 | 证据 / 保留理由（可复现） |
|---|---|---|---|
| 全局主题 / 语义令牌 | `Theme`(neutral) | **已采用** | `data-astryx-theme="neutral"` 服务端出现在所有采样页；`providers.tsx` |
| 全局链接适配 | `LinkProvider component={Link}` | **已采用** | `src/app/providers.tsx:19`；使组件 `href` 走 Next Link |
| Toast 视口 | `ToastViewport` + `useToast` | **已采用** | `providers.tsx`、`inquiry-cart-summary.tsx:5` |
| 四语言消息 | `InternationalizationProvider` | **已采用** | `providers.tsx`（es/zh 生成包 + th 覆盖） |
| 面包屑 | `Breadcrumbs` / `BreadcrumbItem` | **已采用** | `site-breadcrumbs.tsx` |
| 长文目录 | `Outline` | **已采用** | `longform-outline.tsx`（仅接管滚动词键盘导航） |
| 普通按钮 / CTA | `Button`（含 `href`/`as`） | **已采用（可爬取已验）** | `inquiry-form.tsx`；探针证 `<a href>` |
| 提示 / 状态 | `Banner` | **已采用** | `inquiry-form.tsx:7`、`wheel-catalogue-filters.tsx:2` |
| 状态徽标 | `Badge` | **已采用** | `floating-quote.tsx:6`；`Badge` 服务端安全 |
| 空状态 | `EmptyState` | **已采用** | `wheel-catalogue-empty.tsx:2`；服务端安全 |
| 表单字段 | `Field` / `TextInput` / `TextArea` / `Selector` / `RadioList` / `NumberInput` | **已采用** | `inquiry-form.tsx`、`offset-calculator.tsx:5`、`direct-wheel-inquiry-dialog.tsx` |
| 多选列表（表单内） | `CheckboxList` / `CheckboxListItem` | **已采用** | `inquiry-form.tsx:10` |
| 表单布局 | `FormLayout` | **已采用** | `inquiry-form.tsx:11` |
| 对话框 | `Dialog` / `DialogHeader` / `Layout` / `LayoutContent` | **已采用** | `direct-wheel-inquiry-dialog.tsx:5-7` |
| 产品 / 通用卡外壳 | `Card` | **已探针待验收** | 服务端安全（无 `use client`）；待 P3 按页验收 |
| 可点卡片 | `ClickableCard` | **已探针待验收** | `href`/`target` 已探针；待验 Next Link + 规格卡兼容 |
| 规格/对照表 | `Table` | **有理由保留原生 `<table>`** | 现用 3 处为服务端内容表；Astryx Table 纯客户端、数据驱动、30/18 use-client |
| 元数据列表 | `MetadataList` | **已探针待验收** | 契约已读；无生产使用；P3 产品规格可试 |
| 目录分页 | `Pagination` | **有理由保留原生链接** | `onChange` 必填、SSR 出 `<button>` 无 `<a>`；破坏可爬取/无 JS（§2.1） |
| 多值筛选 | `CheckboxInput` | **有理由保留原生多值 checkbox** | 受控单布尔 `onChange`；现用 76 原生同名多值 GET（§2.2） |
| 表单内单布尔同意 | `CheckboxInput` | **已采用** | `inquiry-form.tsx:9`（与筛选语义不同） |
| 分类切换 | `TabList` / `Tab` | **不适用（Insights）** | 分类是并列分节全展示，非互斥 tabs（§2.7） |
| 二级导航条（若需要） | `TabList`（缺省 `<nav>` + `href`） | **已探针待验收** | 缺省渲染 `<nav>`+`<a>`；**不用于 Insights** |
| FAQ / 折叠 | `Collapsible` | **有理由保留原生 `<details>`** | Collapsible 是客户端 `<button>`；现有 `<details>` 支持无 JS（§2.8） |
| 顶部导航 | `TopNav` / `TopNavItem` | **有理由保留项目 Header** | 现有多级 flyout；TopNav 是扁平 strip（§2.6） |
| 移动导航 | `MobileNav` | **有理由保留项目 Header** | 现有自管层级 + Escape/焦点；MobileNav 单层 `dialog`（§2.6） |
| 长文正文 | `Markdown` | **不适用** | 正文非 Markdown 字符串源（§2.5） |
| 品牌 Hero / 真实媒体 / 能力关系 | —（保留项目组件） | **有理由保留项目组件** | `hasRender` 兜底、图片门槛、主体边界；不塞进通用 Card（plan §二） |
| 图片/图权门槛 | —（项目组件） | **有理由保留项目组件** | 无图/未批准不上架，通用组件不表达发布门槛 |

### 四态计数

| 状态 | 行数 |
|---|---|
| 已采用 | 15 |
| 已探针待验收 | 5 |
| 有理由保留原生/项目组件 | 7 |
| 不适用 | 2 |
| **合计** | **29** |

---

## 四、31 个渲染模板清单

约定：所有 31 个模板都**继承**根 `Theme`(neutral) + `LinkProvider`(Next Link) + `ToastViewport` +
`FloatingQuote`（`layout.tsx`），因此「Astryx 已用（继承）」一栏只列**页面族特有**的直接采用；
「当前通用模式」写真实控件；「保留理由」只写有实质保留的项。

页面族代号：**SH** 共享外壳 · **CP** 公司/产品入口 · **WH** 轮毂 · **OL** 其他能力线 ·
**CV** 转化 · **CR** 内容与参考 · **LG** 历史别名(仅重定向，另见 §五)

| # | 路由 | 类型 | 页面族 | 当前通用 UI 模式 | Astryx 已用（直接） | 待探针候选 | 保留项目组件及理由 |
|---|---|---|---|---|---|---|---|
| 1 | `/` | 静态 | CP | 品牌 Hero、四线产品卡、媒体兜底 | 继承 | Card, Button(href) | Hero/媒体归属保留（证据+图权） |
| 2 | `/about` | 静态 | CP | 主体关系、工厂证据、FAQ(`<details>`) | 继承 | Card, Button | FAQ 保留原生 `<details>`（无 JS） |
| 3 | `/capabilities` | 静态 | CP | 能力矩阵、流程线、FAQ | 继承 | Card, Button | 同上 |
| 4 | `/products` | 静态 | CP | 四线卡、行动 | 继承 | Card, Button | 产品卡保留（真实四线） |
| 5 | `/contact` | 静态 | CV | 询盘表单、FAQ | `Banner`,`Button`,`CheckboxInput`,`CheckboxList`,`FormLayout`,`RadioList`,`Selector`,`TextArea`,`TextInput`,`Field`(inquiry-form) | — | 表单状态/Zod/隐私版本保留 |
| 6 | `/custom-development` | 静态 | CV | 项目流程、原生 `<table>`、CTA | 继承 | Button(href) | `<table>` 保留原生（§2.3） |
| 7 | `/dealers` | 静态 | CR | 经销商计划、FAQ | 继承 | Card, Button | FAQ 保留 `<details>` |
| 8 | `/dealers/private-label` | 静态 | CR | 计划说明、面包屑 | `Breadcrumbs` | Card | — |
| 9 | `/fitment` | 静态 | CR | 适配边界说明、警示 | 继承 | Banner | 未验证适配边界保留（不承诺保证） |
| 10 | `/fitment/[platform]` | 动态族 | CR | 平台适配表、提示、面包屑 | `Breadcrumbs` | Banner, Button | 适配数据边界保留 |
| 11 | `/gallery/finishes` | 静态 | CR | 表面处理图库 | 继承 | Card | 图片/图权门槛保留 |
| 12 | `/insights` | 静态 | CR | 并列 `<section>` 分节（非 tabs）、卡列表 | 继承 | Card | 分类保留分节（§2.7） |
| 13 | `/insights/[slug]` | 动态族 | CR | 服务端长文、目录、锚点 | 继承(`Outline` 经 LongformOutline) | — | 正文/锚点/无 JS 保留（§2.5） |
| 14 | `/insights/bolt-patterns` | 静态 | CR | 孔距指南列表、偏距工具、面包屑 | `Breadcrumbs`,`NumberInput`(offset-calculator) | — | 公式/单位保留 |
| 15 | `/insights/bolt-patterns/[pattern]` | 动态族 | CR | 孔距详情、面包屑 | `Breadcrumbs` | — | 未验证边界保留 |
| 16 | `/products/wheels` | 静态 | WH | **`<form method=get>` 多值筛选 + 链接分页** + 排序 `<form>` | `Breadcrumbs`,`Banner`,`Field`,`EmptyState`,`FloatingQuote` | Card, ClickableCard | ↓ |
| 17 | `/products/wheels/[model]` | 动态族 | WH | 单变体规格、直接询盘 Dialog、总清单 | `Dialog`,`NumberInput`,`useToast`(经 direct-dialog/cart) | Card, MetadataList | 变体/规格/无图 404 保留 |
| 18 | `/products/wheels/flow-formed` | 静态 | WH | 旋压入口 + 同款筛选/分页 | 继承(经 flow-formed-page 同分页组件) | Card, ClickableCard | 同上（GET/分页保留） |
| 19 | `/products/wheels/forged` | 静态 | WH | 锻造定制项目、原生 `<table>` 规格 | 继承 | Button | `<table>`/工程边界保留 |
| 20 | `/products/ev-components` | 静态 | OL | 分类锚点分节、原生 `<table>` 对照 | 继承 | Banner | 不虚构 SKU/性能；`<table>` 保留 |
| 21 | `/products/custom-aluminum` | 静态 | OL | 能力说明、证据图 | 继承 | Card, Banner | 不虚构载荷/认证 |
| 22 | `/products/safety-tires` | 静态 | OL | 自密封说明、证据图 | 继承 | Card, Banner | 同上 |
| 23 | `/request-a-quote` | 静态 | CV | 询盘表单、面包屑 | `Breadcrumbs`,`Banner`,`Button`,`CheckboxInput`,`CheckboxList`,`FormLayout`,`RadioList`,`Selector`,`TextArea`,`TextInput` | — | Zod/落库成功语义保留 |
| 24 | `/thank-you` | 静态 | CV | 成功态说明 | 继承 | Banner | 落库成功语义保留 |
| 25 | `/tools` | 静态 | CR | 工具卡 | `NumberInput`(offset-calculator 引入) | Card | — |
| 26 | `/tools/offset-calculator` | 静态 | CR | 计算器输入、原生 `<details>` | `Breadcrumbs`,`NumberInput` | — | 公式保留；`<details>` 保留 |
| 27 | `/support/privacy` | 静态 | CR | 法律长文、目录、面包屑 | `Breadcrumbs`,`Outline`(经 LongformOutline) | — | 草稿标识/版本门槛保留 |
| 28 | `/support/returns` | 静态 | CR | 法律长文、目录 | 继承(经 LongformOutline) | — | 同上 |
| 29 | `/support/shipping` | 静态 | CR | 法律长文、目录 | 继承(经 LongformOutline) | — | 同上 |
| 30 | `/support/terms` | 静态 | CR | 法律长文、目录 | 继承(经 LongformOutline) | — | 同上 |
| 31 | `/support/warranty` | 静态 | CR | 法律长文、目录 | 继承(经 LongformOutline) | — | 同上 |

> 说明：第 16 行起 WH 族三处保留项（GET 多值筛选 / 链接分页 / 真实产品卡）合并写入 16–19 行适用范围，
> 避免重复；对应理由见 §2.1、§2.2、§2.3。

### 4.1 全站 Astryx 直接采用汇总（实测 grep）

9 个项目组件含 `astryxdesign` 导入，被页面引用情况：

| 项目组件 | 含 Astryx 原语 | 被哪些渲染模板引用 |
|---|---|---|
| `site-breadcrumbs.tsx` | `Breadcrumbs` | `/dealers/private-label`、`/fitment/[platform]`、`/insights/bolt-patterns`(含 `[pattern]`)、`/request-a-quote`、`/products/wheels`、`/tools/offset-calculator` |
| `inquiry-form.tsx` | `Banner`,`Button`,`CheckboxInput`,`CheckboxList`,`FormLayout`,`RadioList`,`Selector`,`TextArea`,`TextInput` | `/contact`、`/request-a-quote`（引用） |
| `floating-quote.tsx` | `Badge` | 全站（`layout.tsx`）+ `/products/wheels` |
| `offset-calculator.tsx` | `NumberInput` | `/tools`、`/tools/offset-calculator`、`/insights/bolt-patterns` |
| `longform-outline.tsx` | `Outline` | 法律页与 Insights 长文（间接） |
| `wheel-catalogue-filters.tsx` | `Banner`,`Field` | `/products/wheels` |
| `wheel-catalogue-empty.tsx` | `EmptyState` | `/products/wheels` |
| `direct-wheel-inquiry-dialog.tsx` | `Dialog`,`DialogHeader`,`Layout`,`LayoutContent`,`NumberInput`,`Button` | 轮毂详情族（经客户端引用） |
| `inquiry-cart-summary.tsx` | `NumberInput`,`useToast` | 轮毂详情族（经客户端引用） |

**没有任何页面直接 `import @astryxdesign/core/*`**——采用全部经由共享组件与根 Provider，
这是「不因一个控件把 Server Component 变 Client Component」的现状基础。

---

## 五、重定向登记（7 个）

实测 `curl -w "%{http_code}"`（:3200 运行中）：

| # | 路由 | 目标 | 实测状态 | 源码手段 |
|---|---|---|---|---|
| 1 | `/gallery` | `/fitment` | **308** | `gallery/page.tsx:32` `permanentRedirect` |
| 2 | `/gallery/wheels` | `/products/wheels` | **308** | `gallery/wheels/page.tsx:31` `permanentRedirect` |
| 3 | `/manufacturing` | `/capabilities` | **308** | `manufacturing/page.tsx:14` `permanentRedirect` |
| 4 | `/resources` | `/insights` | **308** | `resources/page.tsx:15` `permanentRedirect` |
| 5 | `/resources/[slug]` | `/insights/[slug]` | **308** | `resources/[slug]/page.tsx:20` `permanentRedirect` |
| 6 | `/resources/bolt-patterns` | `/insights/bolt-patterns` | **308** | `resources/bolt-patterns/page.tsx:13` `permanentRedirect` |
| 7 | `/resources/bolt-patterns/[pattern]` | `/insights/bolt-patterns/[pattern]` | **307** | `resources/bolt-patterns/[pattern]/page.tsx:24` `redirect()`（注释说明：保留分析落地，用 307；见 `ARCHITECTURE.md §6.2`） |

> 第 7 个用的是 `redirect()`（307，临时），与其余 6 个的 `permanentRedirect()`（308）**不同**，
> 且源码注释明确是刻意选择。P1–P5 **不得为了一致性把它改成 308**。
> 这 7 个只验 URL/状态，**不做组件迁移**（plan §一.1、§二「历史别名：无组件迁移」）。

---

## 六、开放问题（P1–P4 需先答）

1. **`Button href` 在真机是否真走 Next Link 预取？** 站点已 `LinkProvider component={Link}`，SSR 探针
   证 `<a href>` 由 `as` 注入；但**未在浏览器验证客户端路由软导航与预取**。P1 首切片须实测。
2. **`ClickableCard href` 是否继承 `LinkProvider`？** 探针用原生 `href` 得到 `<a>`，未验 Next Link 分支
   （`ClickableCard` 是客户端组件，`useLinkComponent` 生效条件需真机确认）。
3. **Astryx Collapsible 无 JS 行为**：客户端 `<button>` 在禁用 JS 时是否仍能展开？现有 `<details>` 天然可用。
   若 P4 想统一 FAQ 外观，必须先给出无 JS 等价证明（plan §二「FAQ 公开全文不用默认折叠」）。
4. **`Table` 逐格等价**：`renderCell` 能否保留 `sr-only <caption>`、`md` 断点切换、单元格 `className` 语义。
5. **四语言与 320px**：本轮未逐页重跑（沿用 STATUS.md 既有 76 组合结论），P1–P4 每切片按 plan §六 视口矩阵自测。
6. **`MetadataList` 生产可行性**：契约已读、无生产使用；P3 产品规格面板可试，需验字段诚实性。

---

## 七、给 P1–P4 的可执行结论

- **可直接用（已采用 + 契约已核）**：`Theme`、`LinkProvider`、`ToastViewport`、`InternationalizationProvider`、
  `Breadcrumbs`、`Outline`、`Button`(含 `href`/`as` 可爬取)、`Banner`、`Badge`、`EmptyState`、
  `Field`/`TextInput`/`TextArea`/`Selector`/`RadioList`/`NumberInput`、`CheckboxList`、`FormLayout`、
  `Dialog`/`DialogHeader`/`Layout`/`LayoutContent`。
- **先探针待验收再落生产**：`Card`（外壳）、`ClickableCard`、`MetadataList`、`TabList`（仅作二级导航条，非 Insights）。
- **明确保留（勿替换）**：轮毂 `Pagination`、目录多值 `CheckboxInput`、原生 `<table>`、
  FAQ 原生 `<details>`、`TopNav`/`MobileNav`（保留项目 Header 的多级 flyout）。
- **明确不适用**：`Markdown`（正文非 Markdown 源）、`TabList` 作 Insights 分类。
- **重定向（7 个）**：只验状态；**第 7 个 307 不得改 308**。
