# Astryx P0 探针原始证据

- 日期：2026-10-11
- 任务：`work/queued/2026-10-11-astryx-component-compatibility-matrix.md`（P0 兼容性基线）
- 版本：`@astryxdesign/core@0.6.7`（`node_modules/@astryxdesign/core/package.json` `"version": "0.6.7"`）
- 本文件只登记**实测**证据：命令、输出、`.d.ts` 摘录。未修改任何业务代码。
- 配套命令索引见同目录 `COMMANDS.md`；主矩阵见 `../26-astryx-component-compatibility-matrix-alma-2026-10-11.md`。

---

## 0. 证据文件清单

| 文件 | 内容 |
|---|---|
| `COMMANDS.md` | 所有命令与推导步骤 |
| `raw-dts-signals.txt` | 15 个候选 `.d.ts` 的 grep 抽取（含行号） |
| `ssr-probe.mjs` / `ssr-probe-output.txt` | SSR 探针 1：Card/Button/EmptyState/Badge/CheckboxInput/Pagination |
| `ssr-probe-2.mjs` / `ssr-probe-2-output.txt` | SSR 探针 2：TabList/Tab/Collapsible/TopNav/MobileNav/Button as=Link/ClickableCard |
| `rendered/*.html` | 运行中 :3200 开发服务器的真实 HTML 快照（6 个渲染页 + 5 个重定向页） |

---

## 1. 客户端边界（`grep -rl "^'use client'"` 每个组件目录）

命令：
```
for n in CheckboxInput Table Card ClickableCard Markdown TabList Collapsible TopNav MobileNav \
         Button Link Outline Breadcrumbs Dialog NumberInput TextInput Banner EmptyState Badge \
         Field Selector RadioList CheckboxList FormLayout Toast; do
  dir=node_modules/@astryxdesign/core/dist/$n
  echo "$n: useclient_files=$(grep -rl "^'use client'\|^\"use client\"" "$dir" 2>/dev/null | wc -l) / js_files=$(ls "$dir"/*.js 2>/dev/null | wc -l)"
done
```

实测输出：

```
CheckboxInput: useclient_files=2 / js_files=2      ← 客户端
Table:         useclient_files=30 / js_files=18    ← 客户端
Card:          useclient_files=0 / js_files=2      ← 服务端可用
ClickableCard: useclient_files=2 / js_files=2      ← 客户端
Markdown:      useclient_files=5 / js_files=13     ← 混合
TabList:       useclient_files=5 / js_files=6      ← 客户端
Collapsible:   useclient_files=5 / js_files=5      ← 客户端
TopNav:        useclient_files=11 / js_files=11    ← 客户端
MobileNav:     useclient_files=3 / js_files=4      ← 客户端
Button:        useclient_files=2 / js_files=2      ← 客户端
Link:          useclient_files=6 / js_files=8      ← 客户端
Outline:       useclient_files=5 / js_files=8      ← 客户端
Breadcrumbs:   useclient_files=3 / js_files=3      ← 客户端
Dialog:        useclient_files=5 / js_files=5      ← 客户端
EmptyState:    useclient_files=0 / js_files=2      ← 服务端可用
Badge:         useclient_files=0 / js_files=3      ← 服务端可用
```

**结论**：`Card`、`EmptyState`、`Badge` 无 `"use client"`，可留在 Server Component；
其余都带客户端边界（React 允许服务端渲染客户端组件，但会引入水合与依赖 JS 的交互）。

---

## 2. `.d.ts` 关键契约摘录（行号来自 `raw-dts-signals.txt` 同源文件）

### 2.1 Pagination — `node_modules/@astryxdesign/core/dist/Pagination/Pagination.d.ts`

```ts
export interface PaginationProps extends Omit<BaseProps<HTMLElement>, 'onChange'> {
    page: number;                              // 当前页（必填）
    onChange: (page: number) => void;          // 必填；唯一翻页入口
    changeAction?: (page: number) => void | Promise<void>;
    totalItems?: number; totalPages?: number; hasMore?: boolean;
    pageSize?: number; pageSizeOptions?: number[]; onPageSizeChange?: (n: number) => void;
    variant?: PaginationVariant;               // pages|count|compact|dots|input|none
    ...
}
```

**关键点**：翻页**只有 `onChange` 回调，没有 `href`／没有 `as`／没有 link 组件属性**。

### 2.2 CheckboxInput — `dist/CheckboxInput/CheckboxInput.d.ts`

```ts
export interface CheckboxInputProps extends Omit<BaseProps, 'onChange'> {
    onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;  // 单个布尔
    htmlName?: ...;                            // 允许原生 name，但语义是单值布尔
    isReadOnly?; isRequired?; isOptional?; status?; ...
}
export declare function CheckboxInput({ label, ..., onChange, htmlName, value, ... }): JSX.Element;
```

对比：目录筛选在真实 HTML 里是 76 个**原生多值** checkbox
（`<input type="checkbox" name="pcd" value="5x112">` 等同名多值），提交靠 `<form method="get">`。
`CheckboxInput` 的受控单布尔 `onChange` 不等价于「同名多值 GET 提交」。

### 2.3 Button — `dist/Button/Button.d.ts`

```ts
export interface ButtonProps extends BaseProps<HTMLButtonElement> {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    href?: string;                             // 提供即渲染为 <a>
    as?: LinkComponentType;                    // 自定义 link 组件（如 Next <Link>）
    target?: string; rel?: string;
}
```
注释（同文件）：`When href is provided (and the button is not disabled), renders as an <a>
element (or custom link component) with full button styling` / `Useful for Next.js <Link>`。
→ **Button 可承载可爬取 CTA**（探针见 §3.5）。

### 2.4 TabList / Tab — `dist/TabList/TabList.d.ts`、`dist/TabList/Tab.d.ts`

```ts
export interface TabListProps extends Omit<BaseProps<HTMLElement>, 'onChange'> {
    value: string; onChange: (value: string) => void;   // 必填，受控
    role?: AriaRole;   // "tablist" = WAI-ARIA tabs；缺省 = <nav> landmark + aria-current
}
export declare function Tab({ as, value, label, href, panelId, ... }): JSX.Element;
```
Tab 注释：`Ignored in a TabList given an explicit role="tablist": activating a tab there swaps a
panel in place`；TabList 注释：`Left unset, the strip is a <nav> landmark marking the current tab
with aria-current`。
→ **TabList 缺省是导航条（可带 `<a href>`），`role="tablist"` 时 `href` 被忽略**。

### 2.5 Collapsible — `dist/Collapsible/Collapsible.d.ts`

```ts
export declare function Collapsible({ trigger, children, defaultIsOpen, isOpen: controlledIsOpen,
  isDisabled, onOpenChange, chevronPosition, value, ... }): JSX.Element;
```
`defaultIsOpen?: boolean` 存在（第 50 行邻近）。探针见 §3.3：**缺省即 `aria-expanded="true"`（展开）**。

### 2.6 TopNav / MobileNav — `dist/TopNav/TopNav.d.ts`、`dist/TopNav/TopNavItem.d.ts`、`dist/MobileNav/MobileNav.d.ts`

```ts
export declare function TopNav({ heading, startContent, children, centerContent, endContent, ... }): JSX.Element | null;
export declare function TopNavItem({ as, href, target, onClick, label, isSelected, isDisabled, ... }): JSX.Element;  // extends BaseProps<HTMLAnchorElement>
export declare function MobileNav({ isOpen, onOpenChange, children, header, width, side, ... }): JSX.Element;  // extends Omit<BaseProps,'title'>
```
`TopNavItem` 有 `href` + `as`；`MobileNav` 是 `isOpen`/`onOpenChange` 受控 `dialog`。

### 2.7 Link / LinkProvider / useLinkComponent

```ts
// dist/Link/LinkProvider.d.ts
export interface LinkProviderProps { component: LinkComponentType; children: ReactNode; }
// dist/Link/useLinkComponent.d.ts
export declare function useLinkComponent(as?: LinkComponentType): LinkComponentType;
// dist/Link/Link.d.ts
export declare function Link({ as, label, href, isDisabled, isExternalLink, target, onClick, ... }): JSX.Element;
```
→ 站点已在 `src/app/providers.tsx:19` 用 `<LinkProvider component={Link}>`（Next Link）包裹全站，
因此 Astryx 组件的 `href`／`as` 缺省即解析为 Next `<Link>`。

### 2.8 Card / ClickableCard / Markdown / Table / MetadataList

```ts
// Card.d.ts —— 无 use client，纯容器
export declare function Card({ width, height, maxWidth, minHeight, children, padding, variant, elevation, ... }): JSX.Element;
// ClickableCard.d.ts —— 有 href / target，客户端
export declare function ClickableCard({ label, onClick, onMouseUp, href, target, isDisabled, children, ... }): JSX.Element;
// Markdown.d.ts —— 受控字符串→Astryx 组件；有 onLinkClick、components、plugins
export declare function Markdown({ children, display, density, headingLevelStart, isStreaming, onLinkClick, sources, ... }): React.ReactElement;
// Table.d.ts —— 数据驱动，columns/data/renderCell
export declare const Table: <T extends Record<string, unknown>>(props: TableProps<T> & {...}) => ...;
// MetadataList.d.ts
export declare function MetadataList({ children, columns, label, maxNumOfItems, orientation, title, ... }): JSX.Element;
```

---

## 3. SSR 探针实测输出

命令：`node outputs/reports/astryx-p0-probes/ssr-probe.mjs`（探针 1）与 `ssr-probe-2.mjs`（探针 2），
用 `react-dom/server` 的 `renderToStaticMarkup` 在 Node 24 下直接渲染。

### 3.1 Card（探针 1）
```
### @astryxdesign/core/Card
OK renders. html(len=311):
<div class="astryx-card default none ..." data-variant="default" data-elevation="none">card child</div>
```

### 3.2 EmptyState / Badge（探针 1）
```
### EmptyState  <div role="status" class="astryx-empty-state ..."><h3 class="astryx-empty-state-title ...">None</h3></div>
### Badge       <span class="astryx-badge neutral ..." data-variant="neutral">...</span>
```

### 3.3 Collapsible 缺省状态（探针 2）— **缺省即展开**
```
### Collapsible default(closed)   →  <button type="button" aria-expanded="true" ... class="...trigger end open">
### Collapsible defaultIsOpen     →  <button type="button" aria-expanded="true" ... class="...trigger end open">
```
两者 HTML 完全一致（len 均 1173），**且 `<p>Answer text</p>` 始终在 DOM 中**。
即：Astryx Collapsible 缺省展开、内容常驻 DOM（对 FAQ 正文可见性有利），但它是**客户端 `<button>`**，
不是原生 `<details>`，无 JS 时的展开/折叠开关行为需另行验证（P4 验收项）。

### 3.4 Pagination（探针 1）— **渲染 `<button type="button">`，不是 `<a>`**
```
### @astryxdesign/core/Pagination
OK renders. html(len=7356):
<nav class="astryx-pagination pages md ..." data-variant="pages" data-size="md" aria-label="Pagination">
  <div ...>
    <button type="button" disabled="" class="astryx-button ghost ...">
```
**决定性证据**：Astryx `Pagination` 产出的是带 `onChange` 的 `<button>`，输出里**没有任何 `<a href>`**。
与站点现有可爬取 `<a rel="prev|next" href="…?page=N">` 分页不等价。

### 3.5 Button `as`=自定义 Link（探针 2）— **渲染真实 `<a href>`**
```
### Button as=NextLink href
tags: {"<a":1,"<span":3}
body: <a href="/products/wheels" data-next-link="1" class="astryx-button secondary md none ...">
```
证得 `Button href + as` 可渲染成 Next Link（或任意 `<a>`），CTA 可爬取。

### 3.6 ClickableCard（探针 2）— **渲染 `<div>` 外壳内含 `<a href>`**
```
### ClickableCard href
tags: {"<div":1,"<a":1,"<span":1}
body: <div class="astryx-card ..."><a ...> ... (label/body)
```

### 3.7 TabList + Tab（探针 2）
```
### TabList+Tab(button)   tags: {"<nav":1,"<div":1,"<button":2,"<span":10,"<template":1}
   <nav aria-label="Tabs" data-astryx-edge-comp="" class="astryx-tab-list md ..."><button type="button" data-astryx-pressable ...
### TabList+Tab(href)     tags: {"<nav":1,"<div":1,"<a":1,"<span":5,"<template":1}
   <nav aria-label="Tabs" ...><a data-astryx-pressable="" data-astryx-edge-comp="" data-tab-...
```
缺省（未指定 `role="tablist"`）时 TabList 是 `<nav>` 导航条，带 `href` 的 Tab 渲染为 `<a>`。

### 3.8 TopNav / MobileNav（探针 2）
```
### TopNav          tags: {"<nav":1,"<div":2,"<a":1}   <nav role="navigation" aria-label="Main" class="astryx-top-nav ..."><a href="/">Home</a>
### MobileNav closed tags: {"<dialog":1,...}            <dialog id="_R_0_" class="astryx-mobile-nav ...">
```
TopNav 服务端产出 `<nav>` + 真实 `<a>`；MobileNav 基于原生 `<dialog>`。

### 3.9 TabList 无 `role` 之外的失败样例
```
### TabList（探针 1，只塞字符串，无 Tab 子节点）
FAIL: Error: useTabListContext must be used within TabList. Wrap your Tab/TabMenu in <TabList>.
```
→ TabList 子节点必须是 `<Tab>`/`<TabMenu>`。

---

## 4. 运行中开发服务器（:3200）的实际 HTML

复用既有 Next 开发进程（未新起 `next dev`）。`curl -s -o … -w "%{http_code}"`。

### 4.1 HTTP 状态

| 路由 | 状态 |
|---|---|
| `/` | 200 |
| `/products/wheels` | 200 |
| `/products/wheels?page=2` | 200 |
| `/insights` | 200 |
| `/request-a-quote` | 200 |
| `/tools/offset-calculator` | 200 |
| `/gallery` | **308** |
| `/gallery/wheels` | **308** |
| `/manufacturing` | **308** |
| `/resources` | **308** |
| `/resources/bolt-patterns` | **308** |

### 4.2 根主题服务端可见

`data-astryx-theme="neutral"` 出现在每个渲染页的服务端 HTML 中（连结构最简单的 `/` 与 `/insights`
也有各 1 处），证得首屏主题不依赖水合注入。

| 页 | `data-astryx-theme` 数 | 其它 `data-astryx-*` | `astryx*` class 片段 |
|---|---|---|---|
| `/` | 1 | — | 0 |
| `/products/wheels` | 5 | — | 17 |
| `/products/wheels?page=2` | 5 | — | 17 |
| `/insights` | 1 | — | 0 |
| `/request-a-quote` | 3 | `data-astryx-pressable`×14 | 78 |
| `/tools/offset-calculator` | 3 | `data-astryx-pressable`×18, `data-astryx-edge-comp`×6 | 57 |

### 4.3 轮毂目录原生契约在真实 HTML 中成立

```
<form aria-label="Filter the wheel catalogue" action="/products/wheels" method="get">
<form class="…" action="/products/wheels" method="get">                 ← 排序（含 name="sort"）
<input id="desktop-pcd-5x112" type="checkbox" name="pcd" value="5x112"/>
<input id="desktop-process-forged" type="checkbox" disabled name="process" value="forged"/>
…
<input id="desktop-process-flow-formed" type="checkbox" name="process" value="flow-formed"/>
```
统计：`type="checkbox"` **76** 个、`type="radio"` 0、`type="hidden"` 0。
分页为真实锚点：
```
<a rel="next" class="… focus-visible:outline-forge …" href="/products/wheels?page=2">
aria-current="page"  （出现 2 次）
```

---

## 5. 源码侧现状（只读）

- `src/components/faq-accordion.tsx`：用原生 `<details open={index===defaultOpenIndex}>`，
  注释明写「keeps working with JavaScript disabled」；缺省第一项展开、正文常驻。
- `src/components/wheels/wheel-catalogue-pagination.tsx`：普通 Next `<Link>`，带
  `rel="prev|next"`、`aria-current="page"`，注释明写「无 JS 时照样能翻页」。
- `src/components/wheels/wheel-catalogue-filters.tsx`：`<form method="get">` +
  `fieldset` + 原生同名多值 checkbox；另有 Astryx `Banner`/`Field` 作外壳。
- `src/app/insights/page.tsx`：分类是**并列 `<section>`**（`#guides-title`、`#reference-sets-title`、
  `#resource-pathways-title`），`category` 只是卡片标签，**不是 Tab 切换**。
- `src/components/site-header.tsx`：Next `<Link>` + 原生 `<button>` + 自管 flyout 层级，
  不是 Astryx `TopNav`/`MobileNav`。
- `src/app/providers.tsx:19`：`<LinkProvider component={Link}>`（Next Link）已包全站。

---

## 6. 探针未覆盖（诚实标注）

- **真实浏览器键盘/焦点/无 JS 行为未在本轮实测**：本轮只做 SSR 静态渲染 + 既有 HTML 快照，
  未跑 Playwright 的 Tab/Escape/焦点恢复/`prefers-reduced-motion`。留待 P1–P4 每切片自测。
- **四语言**：只验证了 Astryx i18n Provider 已接（`providers.tsx`），未逐语言实测组件文案。
- **`320×568` 布局**：沿用 STATUS.md 已记录的 76 组合结论，本轮未重跑。
- **StyleX 编译**：探针拿到的是 class 名（如 `x1k57tk5`），未核对样式产物是否随 `npm run theme:build` 产出。
