# 首页瘦身与资产优化 — 审计与方案

- **日期**：2026-10-18
- **基线**：`7afc608`
- **构建**：`next build` + `next start`（生产模式）
- **测法**：真实浏览器 + CDP 节流 + 构建产物静态分析 + gzip 实测

---

## 1. 结论：首页只有两个真问题

| 项 | 状态 |
|---|---|
| **图片** | ✅ **已在最优状态**，无可优化空间（见 §2）|
| **字体** | ✅ 2 字族，`display: swap`，子集 latin，正常 |
| **CSS/JS 里的 astryx** | ❌ **唯一真问题**：首页不用却下载 ~80KB gzip（见 §3）|
| 死代码 | ✅ 已清理 3 个文件（代码卫生，非性能收益）|

---

## 2. 图片：查完了，**已经最优**

### 2.1 源图大 ≠ 用户下载大

`public/images/home/factory.webp` 源文件 **482KB**，看起来是个问题。但实测优化器输出：

| 用户浏览器接受 | 实际收到 | 体积 |
|---|---|---|
| AVIF | **AVIF** | **121 KB** |
| WebP | WebP | 229 KB |

**482KB → 121KB（AVIF）**，next/image 已经在做正确的事。源图大小不影响用户 —— 它只在构建/优化时读一次。

### 2.2 源图再压缩收益极低

实测 `cwebp -q 82 -m 6`（cwebp 1.6.0）重压首页各图：

| 图 | 原始 | q82 重压 | 收益 |
|---|---|---|---|
| `home/factory.webp` | 483 KB | 463 KB | **-10%** |
| `cards/card-tires.webp` | 114 KB | 108 KB | -10% |
| `cards/card-wheels.webp` | 80 KB | 75 KB | -10% |
| `cards/card-aluminum.webp` | 86 KB | 79 KB | -10% |

**只省 10%，且要重压 2900+ 张图** —— 性价比极低，且引入图片质量回归风险。**建议不做。**

### 2.3 首页实际加载 8 张图（真实测量）

```
/images/home/factory.webp                    ← LCP 元素，已 preload ✅
/images/cards/card-wheels.webp
/images/cards/card-ev.webp
/images/cards/card-aluminum.webp
/images/cards/card-tires.webp
/images/about/casting-process.webp
/images/about/machining-workshop.webp
/images/safety-tires/automated-production-line.webp
```

`factory.webp` 用 `<link rel="preload">` + `fetchpriority` —— **LCP 优化已做对**。

---

## 3. astryx：唯一真问题（约 80KB gzip）

### 3.1 事实

- `src/app/layout.tsx` 用 `<Providers>` 包住**整站**（含 header/footer/所有页面）
- `Providers` 引入 `@astryxdesign/core`：Theme + InternationalizationProvider + **4 语言包** + ToastViewport + LinkProvider
- **首页整条渲染链（含 SiteHeader / SiteFooter）零个 astryx 组件** —— 实测 `grep @astryxdesign` 在 home/ sections/ header/ footer/ 全部为 **0**
- 但首页**仍然下载 4 个 astryx chunk**

### 3.2 实测卸载量（gzip 后 = 真实网络成本）

| chunk | 原始 | **gzip** | 内容特征 |
|---|---|---|---|
| `43n_v-t4csfxi` | 156 KB | **46 KB** | Breadcrumb / Selector |
| `0i0pnqcv8u8tx` | 57 KB | **14 KB** | Selector |
| `2ng-d2lh92_vo` | 33 KB | **10 KB** | Breadcrumb |
| `1v5lg4p748trk` | 26 KB | **10 KB** | Toast / ToastViewport / ToastSurface |
| | | **≈ 80 KB** | |

### 3.3 CSS 同样受影响，**但拆 Provider 解决不了 CSS**

361KB 的 CSS 文件里含 **361 处 astryx 样式**：
- `--astryx*` 自定义属性 **212 处**
- astryx 类名 **149 处**

🔴 **关键限制**：`src/app/globals.css` 第 3–4 行**全量导入** astryx 样式表：

```css
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
```

这是**全局 CSS 导入，不是 React 组件树的一部分** → **下移 Provider 不会减少 CSS**。

要省 CSS 必须另想办法（如把 astryx 样式从 globals.css 拆出、只在需要页面引入），
但那会动到 Tailwind 的 `@layer` 顺序（`astryx-base` / `astryx-theme` 夹在中间），
**风险明显高于 JS 部分** → 建议 CSS 单独评估，不跟 JS 一起做。

**所以 B 档的收益只算 JS 那 ~80KB，CSS 不在此列。**

### 3.4 影响范围（不只是首页）

实测 `/`、`/about`、`/contact` **加载完全相同的 astryx chunk 集合**。
即 **`/about`、`/`、`/insights` 等不用 astryx 的页面，全都在白付这 ~80KB**。

**真正需要 astryx 的页面**（实测依赖面）：

| 组件 | 使用页面 |
|---|---|
| `inquiry-form` | `/contact`、`/request-a-quote` |
| `wheel-catalogue-filters` / `-empty` | `/products/wheels` |
| `site-breadcrumbs` | `/products/wheels`、`/insights/bolt-patterns`(+`/[pattern]`)、`/tools`、`/tools/offset-calculator`、`/request-a-quote`、`/dealers/private-label` |
| `offset-calculator` | `/tools/offset-calculator` |
| `direct-wheel-inquiry-dialog` / `inquiry-cart-summary` | 轮毂详情页 |

---

## 4. B 档方案（未执行，待你拍板）

### 方案：把 astryx Provider 从全局 layout 下移

**现状**：
```
layout.tsx
  └─ <Providers>          ← 全局，每页都付 astryx 成本
       ├─ SiteHeader / SiteFooter / SiteMotion   ← 不用 astryx
       └─ {children}                           ← 只有部分页面用
```

**目标**：
```
layout.tsx
  └─ 不包 Providers（header/footer/site-motion 本来就不需要）
       └─ {children}
            ├─ /contact            → 页面内包 <Providers>
            ├─ /request-a-quote    → 包
            ├─ /products/wheels    → 包
            └─ 其余页面            → 不包，省 80KB
```

### 三种落地方式

| 方式 | 做法 | 优点 | 缺点 |
|---|---|---|---|
| **B1** | 新建 `(astryx)` route group，其 `layout.tsx` 包 Providers | Next 官方模式，干净 | 需移动文件到 route group |
| **B2** | 各页面自己包 `<Providers>` | 改动局部，最小 | 7 处重复包裹 |
| **B3** | 把 Provider 拆成两个：`CoreProviders`(轻) + `AstryxProviders`(重)，layout 只挂轻的 | 对现有代码侵入最小 | astryx 的 ToastViewport 若需跨页持久会受影响 |

**推荐 B2 或 B1**（B2 改动最小、最易回滚；B1 更规范）。

### ✅ 有利证据：项目已有「局部包裹 astryx」的先例

`src/components/inquiry-form.tsx:237` 与 `:249` **自己就包了两层 `<Theme theme={neutralTheme} mode="light">`**
（`DirectInquiryForm` 和 `CartInquiryForm` 各一处）。

这说明：**astryx 支持在组件级局部包裹，不依赖 layout 的全局 Provider** → B 档不是新架构，是**沿用项目已有的写法**，风险比想象的低。

### 必须验证的点（风险）

1. **Toast 确实在被使用** —— `components/wheels/inquiry-cart-summary.tsx:40` 调用 `useToast()`，而 `ToastViewport` 唯一挂载点在 `providers.tsx:51`。
   → **`ToastViewport` 必须与它的调用方（轮毂询盘相关页面）在同一棵 Provider 子树里**，否则 toast 不会显示。
   这是 B 档最需要注意的约束：不能简单地把 Providers 从 layout 删掉，得保证用 toast 的页面被包住。
2. **主题变量作用域** —— astryx 的 `Theme` 注入 CSS 变量，下移后只在需要的子树生效。需确认无全局依赖
3. **`globals.css` 是否依赖 astryx 变量** —— 实测 `globals.css` 里有 `@astryxdesign` 引用，需查清是 import 样式还是用变量
4. **回归范围** —— 所有页面都要重测（build + E2E + 视觉）

### 预期收益

- **首页 / about / insights 等**：省 **~80KB gzip JS** + 部分 CSS
- **首页 LCP**：按 4G 节流实测，总传输 597KB → 约 517KB，**LCP 预计从 3.7s 降到 ~3.2s**
- ⚠️ **注意：仍达不到 2.5s 目标**。因为大头是 React 框架本身（202KB + 155KB 两个 chunk，gzip 后 63KB + 43KB = **106KB**），那部分动不了。

### 诚实结论

**首页要真正进 2.5s，光靠瘦身不够。** 按当前数据：
- 总传输 597KB ÷ 200KB/s ≈ **3.0s 是理论下限**
- 卸掉 astryx（80KB）→ 约 517KB ≈ **2.6s**，仍差一点
- 要再往下，需要：减少首屏字体（79KB）、或上 CDN/边缘缓存（本地测的是 `next start` 直出，无 CDN）

**所以：B 档值得做（真实收益），但别指望它单独达成 2.5s。**

---

## 5. 其他发现（未处理）

| 项 | 数据 | 建议 |
|---|---|---|
| 孤儿图 | **86 张 / 14.5 MB** | 可清理，建议先归档 |
| 重复图 | **484 组 / 14.9 MB 浪费** | 含 `hero-road.webp` == `hero-road-alt.webp`（sha256 相同，各 2.3MB，且都无人引用）|
| 图片编码 | 2835 张纯 VP8 / 91 张 VP8X | 源图编码正常，无异常 |
| 首页模块数 | 仅 5 个（H01–H05），且多为服务端组件 | 结构本就精简 |

---

## 6. 本次已执行（A 档）

| 动作 | 结果 |
|---|---|
| 删 `hero-background.tsx` / `hero-product-card.tsx` / `hero-product-grid.tsx` | ✅ 0 引用死代码，tsc 通过 |
| 构建体积变化 | **无变化**（1448KB → 1448KB）—— 死代码本就不进包 |
| `npm run check` | ✅ 全绿（契约 7 项 + 141 tests）|

**这条是代码卫生，不是性能收益。** 我没有把它包装成成效。
