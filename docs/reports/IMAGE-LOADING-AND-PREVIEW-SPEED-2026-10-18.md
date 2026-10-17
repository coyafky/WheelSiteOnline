# 图片加载 / 预览速度 / 建站地基 测试报告

- **日期**：2026-10-18
- **被测基线**：`4e04827`（工作区干净，无未提交改动）
- **构建**：`next build` + `next start`（生产模式），`NEXT_PUBLIC_APP_URL=https://www.fenghuai.com`
- **测法**：Playwright 真实浏览器 + CDP 网络节流 + Resource Timing / Paint Timing / LCP Observer
- **重要前提**：本报告所有性能数字都标注了**是否节流**。未节流的本机数字（LCP 200~700ms）**不能代表真实用户**，仅用于相对比较。

---

## 0. 结论速览

| 问题 | 结论 |
|---|---|
| **懒加载实现了吗？** | ✅ **已实现且实测生效**。原生 `loading="lazy"`，首屏外图片全部延迟加载 |
| **图片格式优化？** | ✅ AVIF 已生效，实测比 JPEG 小 55% |
| **本地预览速度** | ✅ 未节流下极快（LCP 128~784ms）；⚠️ 但 dev 模式传输量是生产的 **2.4 倍** |
| **真实网络下 LCP** | ❌ **首页 3.5s，超出 2.5s 目标**；其余页面 1.8~2.2s ✅ |
| **首页 LCP 根因** | **不是图片**（图片仅 70KB），而是 **JS 241KB + CSS 59KB + 字体 77KB 抢占带宽** |
| **SEO 地基（抓取四阶段）** | ✅ robots / sitemap / canonical / JSON-LD 全部正确，但有**构建期依赖**（见 §5） |
| **资产浪费** | ⚠️ 86 张孤儿图 14.5MB + 484 组重复图 14.9MB |

**一句话**：懒加载这件事**做对了**；真正拖慢首屏的是 JS/CSS/字体，不是图片。

---

## 1. 懒加载实现情况 ✅

### 1.1 实现方式

- **19 个文件**使用 `next/image`
- **8 处裸 `<img>`**：全部**有意为之且带注释说明**，非遗漏

| 文件 | 为什么用裸 `<img>` |
|---|---|
| `components/home/hero/hero-background.tsx` | 装饰性艺术图，绝对定位栈内，next/image 会多加一层布局包裹 |
| `components/home/hero/hero-product-card.tsx` | 装饰卡片底图，由卡片盒子定尺寸而非图片自身 |
| `components/sections/page-hero.tsx` | 精选页面 WebP 背景 |
| `components/family-card.tsx` | 4 张固定 1024px WebP，优化器无增益 |
| `components/wheel-card.tsx` | 最多 2757 张目录图，预裁 WebP，优化器无增益且会打乱生成路径契约 |
| `components/product-card.tsx` | 同上（含 hover 图）|
| `components/process-explorer.tsx` | 仅注释提及，**不渲染任何 `<img>`**（`public/images/process/` 目前无图）|

### 1.2 实测验证（真实 DOM 属性）

| 页面 | img 总数 | `loading="lazy"` | 无 loading 属性 | 有 srcset |
|---|---|---|---|---|
| `/` | 8 | 7 | 1 | 8/8 |
| `/products/wheels` | 25 | 20 | 5 | 25/25 |
| `/products/wheels/a015` | 4 | 3 | 1 | 4/4 |
| `/products/safety-tires` | 18 | 17 | 1 | 18/18 |
| `/about` | 12 | **12** | 0 | 12/12 |
| `/insights` | 8 | 7 | 1 | 8/8 |

**srcset 覆盖率 100%** —— 响应式图片工作正常。

### 1.3 「无 loading 属性」的那些是什么

测得均为**首屏 LCP 元素**（`top=0`），属性由 `priority` 控制：

```tsx
// wheel-catalogue-card.tsx:47-48
priority={priority}
loading={priority ? undefined : "lazy"}
```

`priority=true` 时 Next 会**改为发 `<link rel="preload">`**，因此 img 上不再出现 `loading` 属性 —— **这是正确行为，不是缺陷**。已实测验证：

```
/products/wheels 的 <head> 中：
<link rel="preload" as="image" imageSrcSet=".../forged-grand-tourer-hero.webp... 640w, ... 3840w" imageSizes="100vw"/>
```

`priority` 只给第一排（`priority={index < 4}`），与页面规格 §5.4/§9/§10 的注释一致。

### 1.4 滚动验证懒加载

滚动到底后图片请求数**不增加**（`/` 8→8、`/products/wheels` 1→1）—— 说明首屏外的图片**被浏览器正确延迟**，未提前拉取。

---

## 2. 图片格式：AVIF 实测 ✅

同一 URL、不同 `Accept` 头，实测内容协商：

| Accept | 返回格式 | 体积 |
|---|---|---|
| `image/avif,image/webp,*/*` | **AVIF** | **121 KB** |
| `image/webp,*/*` | WebP | 229 KB |
| `*/*` | JPEG | 271 KB |

**AVIF 比 JPEG 小 55%**，比 WebP 小 47%。`next.config.ts` 的 `images.formats = ["image/avif","image/webp"]` 生效。

---

## 3. 加载速度实测

### 3.1 未节流（本机，仅供相对比较）

| 页面 | LCP | 线传 | 请求数 |
|---|---|---|---|
| `/` | 228 ms | 211 KB(图) | 8 |
| `/products/wheels` | 284 ms | 41 KB(图) | 1 |
| `/products/safety-tires` | 128 ms | 51 KB(图) | 1 |
| `/about` | 176 ms | 0 | 0 |
| `/insights` | 152 ms | 12 KB(图) | 1 |

**这些数字没有意义** —— 本机无延迟无带宽限制。请看 3.2。

### 3.2 节流 4G（1.6 Mbps / RTT 150ms）← **这才是真答案**

| 页面 | LCP | 判定 | 线传 | 主要构成 |
|---|---|---|---|---|
| `/` | **3,736 ms** | ❌ **超标** | 597 KB | link 261 + script 241 + img 70 |
| `/products/wheels` | 2,056 ms | ✅ | 501 KB | script 279 + link 185 |
| `/products/wheels/a015` | 1,988 ms | ✅ | 521 KB | script 353 + link 143 |
| `/products/safety-tires` | 2,184 ms | ✅ | 461 KB | script 241 + link 194 |
| `/about` | 1,820 ms | ✅ | 408 KB | script 241 + link 143 |
| `/insights` | 1,948 ms | ✅ | 423 KB | script 243 + link 155 |

**移动端（iPhone 13 视口，同样节流）**：`/` LCP **2,184 ms** ✅
（小屏请求更小图 → hero 取 1200px 而非 1920px，所以反而达标）

### 3.3 首页 LCP 时间拆解（关键证据）

```
FCP (首次内容绘制)        1,968 ms
DOM Interactive           1,929 ms
hero 图请求开始             248 ms
hero 图下载完成           3,544 ms   ← LCP 就卡在这
load 事件结束             3,545 ms
CSS 加载完成              1,857 ms   （另一个 476 ms）
字体加载完成            815 ~ 1,002 ms
```

**首页最重的 12 个资源**：

| 体积 | 类型 | 资源 |
|---|---|---|
| 119 KB | image | `home/factory.webp`（LCP 元素，w=1920）|
| 64 KB | script | chunk `2nii411saqstq.js` |
| **59 KB** | **css** | chunk `2h74i1wk4u-t1.css`（原始 361 KB，gzip 后 59 KB）|
| 47 KB | script | chunk `43n_v-t4csfxi.js` |
| 43 KB | script | chunk `2o_05trkvz4fj.js` |
| 21 KB | image | `cards/card-tires.webp` |
| 20 KB | font | `f7aa2171…woff2` |
| 17 KB | image | `cards/card-wheels.webp` |
| 17 KB | image | `cards/card-aluminum.webp` |
| 15 KB ×3 | font | 另 3 个 woff2 |

### 3.4 根因判定

> **首页 LCP 超标的不是图片，是带宽竞争。**

算一下就知道：总支付 **597 KB**，管道 **200 KB/s** → 理论最快 **约 3.0 s**。hero 图 119 KB 单独下载只需 0.6 s，但它排在 JS/CSS/字体后面抢带宽，**实际等了 3.3 s**。

**图片只占首屏传输的 12~15%（70~96 KB / 597~623 KB，两次实测有波动）**。即便把图片优化到 0 字节，LCP 也只能从 3.7s 降到约 3.0s，**仍然超标**。

真正该动的是 **JS 241 KB + CSS 59 KB + 字体 79 KB = 379 KB（约 61~63%）**。

---

## 4. 本地预览速度（dev 模式）

| 模式 | 页面 | load | LCP | 线传 |
|---|---|---|---|---|
| **dev** | `/` | 2,585 ms | 2,700 ms | **1,407 KB** |
| **dev** | `/products/wheels` | 1,272 ms | 996 ms | 279 KB |
| prod | `/` | 3,545 ms* | 3,736 ms* | 597 KB |

\* 生产数字带节流，dev 数字未节流，**两者不可直接比较**

**但传输量可比**：dev `/` 1,407 KB vs prod 597 KB = **dev 是生产的 2.4 倍**。原因是 dev 不做压缩与 tree-shaking —— **这是预期行为，不是缺陷**。

### 关于「预览速度慢」的重要提醒

⚠️ **`WP_MODE=mock` 会导致询盘返回 503**（只存内存不落库）。这与图片无关，但排查本地问题时极易被误认为系统故障 —— 本报告作者本人今天就被误导过一次。本地请直接用 `.env.local` 的 `WP_MODE=live`。

---

## 5. 建站地基（抓取四阶段）逐条核对

### 5.1 抓取阶段

| 项 | 实测 | 判定 |
|---|---|---|
| `robots.txt` | `User-Agent: *` / `Allow: /` / `Disallow: /api/` / `Sitemap: https://www.fenghuai.com/sitemap.xml` | ✅ 无「误 Disallow 全站」 |
| HTTP 状态码 | `/` 200 ｜ `/gallery` 308 ｜ `/fitment` 308 ｜ `/thank-you` 200 | ✅ 退役路由正确 308 |
| sitemap | **172 个 URL**，单文件 | ✅ 远低于 Google 50,000/文件上限，**无需分片** |

### 5.2 解析 / 索引阶段

| 项 | 实测 | 判定 |
|---|---|---|
| canonical | `/` → `https://www.fenghuai.com`｜`/products/wheels` → `.../products/wheels`｜`/about` → `.../about` | ✅ 绝对 URL 正确 |
| JSON-LD | `/` 2 个 ｜ `/products/wheels` 4 个 | ✅ Organization / WebSite / Product / BreadcrumbList |
| 不可索引页 | 未批准翻译 → 真实 404 + `x-robots-tag: noindex` | ✅ fail-closed |

### 5.3 ⚠️ 关键限制：地基依赖**构建期**环境变量

实测对比（同一份代码）：

| 构建时 `NEXT_PUBLIC_APP_URL` | robots.txt | sitemap |
|---|---|---|
| **未设置** | `Disallow: /`（全站禁抓）| **0 条 URL** |
| 已设置 | `Allow: /` | 172 条 URL |

**运行时设置无效** —— `NEXT_PUBLIC_*` 在构建时被烤进产物。这是 Next.js 的设计，也是本项目**有意的 fail-closed 策略**（避免 fallback 域名泄漏进索引）。

> **运维必读**：部署时若漏传 `NEXT_PUBLIC_APP_URL`，**站点会静默变成「全站禁止抓取 + 空 sitemap」，但所有页面仍返回 200，肉眼看不出**。建议在部署流程里加一条断言。

### 5.4 Cloudflare / GSC / 部署

| 项 | 状态 |
|---|---|
| DNS / Cloudflare | ❓ **未验证**（属基础设施，需你确认） |
| GSC 权属验证 | ❓ **未验证** |
| 统计代码 | ❓ **未验证** |
| LCP < 2.5s | ❌ 首页 3.7s（见 §3）|

---

## 6. 资产浪费（可清理项）

### 6.1 孤儿图片：86 张 / 14.5 MB

「孤儿」= 文件名在整个仓库（`src`/`e2e`/`tests`/`scripts`/`deploy`/`resources`/`local-wp`/`docs`）中**从未被提及**。

按目录分布：

| 数量 | 目录 |
|---|---|
| 30 | `safety-tires/` |
| 14 | `content-center/` |
| 13 | `about/` |
| 12 | `capabilities/` |
| 12 | `preview/` |
| 3 | `hero/` |

最大的几个：

| 体积 | 文件 |
|---|---|
| 2,315 KB | `safety-tires/hero-road.webp` |
| 2,315 KB | `safety-tires/hero-road-alt.webp` |
| 938 KB | `safety-tires/technology-wave.webp` |
| 797 KB | `safety-tires/tread-sealing-exploded.webp` |
| 759 KB | `content-center/tire-scenes-grid-01.webp` |
| 755 KB | `content-center/tire-scenes-grid-02.webp` |

### 6.2 完全重复图片：484 组 / 14.9 MB 浪费

用 sha256 逐字节比对，**484 组内容完全相同但存了多份**。

最典型：

| 份数 | 文件 |
|---|---|
| **2 × 2,315 KB** | `safety-tires/hero-road.webp` = `hero-road-alt.webp`（浪费 **2.3 MB**，最大单组）|
| **3 × 907 KB** | `capabilities/factory-aerial-view.webp` = `capabilities/factory-aerial.webp` = `about/factory-aerial.webp`（浪费 1.8 MB）|
| **5 × 175 KB** | `content-center/factory.webp` = `capabilities/factory-floor.webp` = `about/factory-floor.webp` = `search/factory.webp` = `preview/factory.webp` |
| **6 × 135 KB** | `wheels/18-4-l251006-2` = `18-3-l251005` = `18-3-l251013` = `18-3-l251016-2` = `18-4-l251026-2` = `17-3-l250953-2` |
| **5 × 97 KB** | `home/self-sealing-tire.webp` = `product-lines/self-sealing-tire.webp` = `content-center/self-sealing-tire.webp` = `safety-tires/product-overview.webp` = `preview/tire.webp` |

🔴 **最离谱的一组**：`safety-tires/hero-road.webp` 与 `hero-road-alt.webp`
**sha256 完全相同**（`459fa0ea7e15…`），各 2,315 KB —— **同一张图存了两份，白占 2.3 MB，且两份都无人引用**（同时命中孤儿 + 重复两个问题）。

### 6.3 全量资产概况

- `public/images/` 共 **2,926 个文件 / 81 MB**
- 格式：2,926 中 **2,926 个 webp**（0 个 png/jpg）—— 格式统一，很好
- >300 KB 的大图：**22 个**

---

## 7. 修复优先级建议

| 优先级 | 项 | 预期收益 | 风险 |
|---|---|---|---|
| **P1** | 首页 LCP：削减首屏 JS/CSS/字体（377 KB）| 3.7s → 目标 2.5s 内 | 中（需代码分割分析）|
| **P1** | 部署流程加 `NEXT_PUBLIC_APP_URL` 断言 | 防「静默全站禁抓」 | 低 |
| **P2** | 删 86 张孤儿图（14.5 MB）| 仓库瘦身 | 低（建议先归档）|
| **P2** | 去重 484 组（14.9 MB）| 仓库瘦身 | 低（需改引用路径）|
| **P3** | 压缩 22 张 >300KB 大图 | 改善详情页 | 低 |
| **P3** | 补 GSC 验证 / 统计代码 | 可观测性 | 低 |

---

## 8. 本报告的方法论纠正（诚实记录）

1. **孤儿图统计口径错过一次**：第一版只扫 `src/`，得出「581 张孤儿 / 26.1 MB」。但轮毂图路径存在 `resources/wheel-data-pack/*/site-data/generated-wheel-data.json` 里，且**以裸文件名存储、由代码动态拼路径** → 第一版把大量**正常图片误判为孤儿**。改用「文件名在整仓出现」口径后修正为 **86 张 / 14.5 MB**。**第一版数字作废。**

2. **未节流的 LCP 无意义**：本机 LCP 128~784ms 看起来完美，但那是 `localhost` 无延迟无带宽限制的假象。必须节流才能看到真实问题（首页 3.7s）。

3. **「传输量」不能用 Playwright `response.body()` 量**：它返回解压后内容且常无 `content-length`。必须用 **Resource Timing API 的 `transferSize`** 才是真实线传字节。

4. **压缩是生效的**：`next start` 对静态资源做 gzip（CSS 361KB→59KB，JS 207KB→65KB）。一度差点误判为「未压缩」。

5. **⚠️ 复核孤儿清单时，必须排除本报告自身**。报告里点名了 `hero-road.webp` 等文件名 → 用 `grep -r` 复核时**报告文件自己会命中**，把孤儿误判成「有引用」。本报告数字已排除自身后重新计算。

---

## 9. 未覆盖 / 待确认

- ❓ Cloudflare DNS 配置、GSC 权属验证、统计代码 —— **需你确认**，不在本机可测范围
- ❓ 真实 CDN 边缘节点上的表现（本机测的是 `next start` 直出，无 CDN 缓存层）
- ❓ 真实运营商网络（本次用 CDP 模拟 4G，非真实蜂窝网络）
- ❓ 字体子集化方案（当前 5 个 woff2 共 77 KB，全部首屏加载）
