# 交接文档 · 首页 LCP 优化（给 Codex）

- **交接时间**：2026-10-18 09:10（Asia/Shanghai）
- **交接方**：Alma
- **基线**：本分支 `codex/full-site-current-20261012`，起点 `d3a8a7e`
- **状态**：✅ 代码已改并本地验证通过 · ⏳ **未部署到线上**
- **用户约束**：本次排查与测试**全程只在本地**，未对服务器 `119.91.205.130:9080` 做任何测试

---

## 一、本次交付内容（两个工作块）

### 工作块 A：首页 LCP 根因定位 + 修复（**本次主线**）

**问题**：首页 LCP 远超 Core Web Vitals「良好」阈值 2.5s，用户要求给出图片处理方案。

**根因（一行代码）**：`src/components/home/hero/hero-media.tsx:38` 的 `sizes="100vw"`

链条：

1. `sizes="100vw"` → 浏览器认定首图占满整屏
2. 桌面 1440px × DPR 2 = **需要 2880 设备像素**
3. srcset 档位 `640/750/828/1080/1200/1920/2048/3840` → **2048 < 2880，只能跳到 `w=3840`**
4. 但源图 `public/images/home/factory.webp` **只有 2560×1463**
5. → **3840 是把 2560 硬放大 1.5 倍，纯浪费 138 KB**

**相位分解佐证**：`docTTFB` 53ms（1%）｜`resourceLoadDelay` 169ms（4%，preload 正常）｜**`resourceLoadDuration` 3001ms（76%）**｜`elementRenderDelay` 177ms（4%）

→ **决定量是「这张图多少字节」**，不是 TTFB、不是 JS、不是 CSS。

**已改 2 处**：

```diff
# src/components/home/hero/hero-media.tsx:38
-            sizes="100vw"
+            sizes="(min-width: 1024px) 40vw, 100vw"
```

```diff
# next.config.ts · images 段（formats 之后）
     formats: ["image/avif", "image/webp"],
+    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
```

**实测结果**（本地生产构建，桌面 1440×900 DPR2，Slow 4G + 4× CPU，3 次取中位数）：

| | 修复前 | 修复后 |
|---|---|---|
| LCP 中位数 | **3920 ms** | **2240 ms** ✅ |
| 三次实测 | — | 2592 / 2240 / 2236 |
| LCP 元素 | IMG | IMG（**未换人 → 真因果**） |
| 实取档位 | **w=3840** | **w=1200** |
| hero 字节 | **197 KB** | **59 KB** |

**−1680 ms（−43%），省 138 KB（−70%），达标。**

**全站回归**：10 页全 200，97/97 图片请求全 200，0 破裂图。

**门禁**：`tsc --noEmit` ✅ ｜ `eslint`（改动文件）✅ ｜ `next build` 186/186 ✅

**画质验证**：逐像素比对 `A(3840) vs D(1200)` → **平均差 0.082/255，最大 3，差异>8 占比 0.00%**。

原因：该图被 `opacity-65` + 两层浅色渐变遮罩压住，高分辨率细节本就被抹平。

---

### 工作块 B：Astryx Provider 拆分实装

> ⚠️ **代码不是我写的**，但它在工作区里处于未提交状态，用户要求「提交全部改动」，故一并说明并纳入提交。

**内容**：把根布局的 `<Providers>`（Astryx）从全站包裹改为**按路由段 scope**，只在真正渲染 Astryx 组件的子树挂载。

- `src/app/layout.tsx` —— 移除根级 `<Providers>`，留注释指向 `astryx-scope.tsx`
- `src/components/astryx-scope.tsx` —— 新增 scope 组件（`Providers` + `getLocale` 包装）
- 新增 7 个 segment layout：`contact/` `dealers/` `insights/` `products/wheels/` `request-a-quote/` `support/` `tools/`
- 动机（来自代码内注释与 `docs/reports/HOME-SLIMMING-PLAN-2026-10-18.md`）：首页与 `/about` 不渲染任何 Astryx 组件，却白下 **~39 KB gzip** 的 JS（实测 241 KB → 202 KB）

**我做的验证（因为漏一个 scope 就是运行时崩溃，构建期不会报错）**：

用真实 Chromium **BFS 爬取 60 个路由**，记录 `pageerror` / `console.error`：

```
爬取路由数: 60 | 有问题: 0 | 运行时错误: 0 | 非 200: 0
```

Astryx 组件实际使用点全部覆盖（`inquiry-form` / `longform-outline` / `offset-calculator` /
`site-breadcrumbs` / `direct-wheel-inquiry-dialog` / `inquiry-cart-summary` / `wheel-catalogue-empty` /
`wheel-catalogue-filters` → 落到 `contact` `request-a-quote` `tools` `insights` `dealers`
`products/wheels` `support/*`）。

**结论：该在建工作完好，可安全提交。**

---

## 二、产出文件清单

`qa-audit/perf/`（216 KB，已放入仓库，未 ignore）

| 文件 | 用途 |
|---|---|
| `LCP-ROOTCAUSE.md` | 根因分析（含决策矩阵、三个假象、与既有报告的冲突） |
| `FIX-VERIFIED.md` | 修复与验证（完整 diff、回归表、取舍分析） |
| `README.md` | 测试目录说明与**测试纪律** |
| `verify-fix.cjs` | 修复后验证（3 次中位数 + 断言实取档位） |
| `final-matrix.cjs` | 决定性对照矩阵（A 现状 / B 60vw / C 50vw / D 40vw / E 删图 / F 禁字体） |
| `lcp-probe.cjs` | 单次 LCP 探针（元素 + 相位 + 慢资源） |
| `lcp-throttled-desktop.cjs` | 桌面视口节流 LCP 分解 |
| `lcp-phases.cjs` | 相位分解 + 反事实对照 |
| `oversize.cjs` | 每张图「需要的设备像素 vs 实际拉取档位」超规格倍数 |
| `regress.cjs` | 全站回归扫描（10 页，图片 4xx / 破裂 img） |
| `quality/local-ab.cjs` | A(3840) vs D(1200) 逐像素渲染比对 |
| `quality/local-A-vs-D.png` | 并排画质对照图 |

---

## 三、本地复现环境（**照抄即可**）

### 前置

本地 WordPress 后端：docker 容器 **`fh-wp` on `:8081`**（配套 `fh-wp-db`）

### 起本地生产服务

```bash
cd <repo>
npx next build
ALLOW_LOOPBACK_WP_MEDIA=true NODE_ENV=production npx next start -p 3000
```

### ⚠️ 三个必踩的坑

1. **必须带 `ALLOW_LOOPBACK_WP_MEDIA=true`** —— `next.config.ts` 出于防 SSRF 的设计，
   生产构建默认**不注册 `localhost:8081`** 的媒体白名单 → 不带则**所有 WP 图 400**。
   注意 `remotePatterns` 是**构建期固化**的，**改运行时不生效，必须重新 build**。
2. `next start` 会警告 `output: standalone`（建议用 `node .next/standalone/server.js`），
   但 `next start` **服务正常可用**（实测 Ready 149ms、页面 200）。
3. **`deviceSizes` 也是构建期固化** —— 改完必须重新 `next build`。

### 跑测试

```bash
cd ~/.config/alma/tools/pw-shot        # Playwright 1.63.0 + 匹配的 chromium
NODE_PATH=<repo>/node_modules node <repo>/qa-audit/perf/verify-fix.cjs
```

节流参数（脚本内已写死，Lighthouse 移动端基线）：

- `Network.emulateNetworkConditions` → Slow 4G（1.6 Mbps 下行 / 750 Kbps 上行 / RTT 150ms）
- `Emulation.setCPUThrottlingRate` → **4**

⚠️ **本地不节流时 LCP 只有 492ms，绝对值毫无意义** → 必须加节流才复现真实用户场景。

---

## 四、🔴 测试纪律（**本次最重要的经验，务必继承**）

### 任何「禁掉 X → LCP 变好」的结论，**必须先检查 LCP 元素有没有换人**。

本次踩到**三个「看起来对、其实错」的假象**：

| 测试 | 表面结论 | 真相 |
|---|---|---|
| **禁 CSS** | 「LCP 352ms，CSS 是元凶！」 | ❌ **假象**。禁 CSS 后布局塌掉，hero 图 `opacity` 由 0.65 变 1（遮罩层失效）、**根本没进入 LCP 候选**，LCP 换成了未排版的小 H1（area 31376 vs 原 272586） |
| **禁字体** | 「LCP 1904ms，字体是元凶！」 | ❌ **假象**。**LCP 元素从 IMG 换成了 H1**，且 hero 的 `w=3840` 请求**照常发生** |
| 移动端「3.68× 超规格」 | 「移动端浪费更严重」 | ❌ **测量假象**。那 3 张产线图是 `loading="lazy"` 且在 6000px 之外**根本没被拉取**，脚本读到的是默认 `src` 而非 `currentSrc` |

**对照组 B/C/D 为什么可信**：它们的 LCP 元素**始终是 IMG**，只是字节变少 → 那才是真因果。

> 因此：`docs/reports/IMAGE-LOADING-AND-PREVIEW-SPEED-2026-10-18.md` 里
> 「首页 LCP 根因**不是图片**，而是 JS/CSS/字体抢占带宽」这条**不成立**；
> `docs/reports/HOME-SLIMMING-PLAN-2026-10-18.md` 里「图片**已最优**、无可优化空间」**也不成立**。
> 这两份测的是**更早的本地基线**（hero 走本地 `factory.webp`、无 `sizes="100vw"` 问题），
> 与线上 `d3a8a7e` 的 `hero-media.tsx`（`sizes="100vw"`）**不是同一份代码**。

---

## 五、⏳ 遗留事项与建议

### 1.【P0】部署到线上 9080 并线上复测

- 线上 `http://119.91.205.130:9080` 跑的是**同一份代码**（`deploy/frontend/` Docker Compose）
- ⚠️ 部署时必须确认**构建期变量齐全**，特别是 `NEXT_PUBLIC_APP_URL`：
  - 该变量控制 `robots.ts` / `sitemap.ts` / canonical，**缺失时静默 fail-closed**
    （`Disallow: /` + 空 sitemap），而**页面照常 200，肉眼看不出**
  - 仓库里同类事故已发生过一次
- 建议部署后用同一套脚本对线上跑一次 `verify-fix.cjs`，确认与本地一致

### 2.【P1】`project-route-section.tsx:18` 声明偏小（**画质类问题，不是字节浪费**）

- 声明 `sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"`
- 实测桌面**渲染宽 756px、需要 1513 设备像素、实际只取 640 档**（0.42×）
- 后果是**可能发虚**（清晰度不足），而非浪费流量
- 与 hero 的问题**方向相反**，建议单独评估，**不要与本次改动混在一起**

### 3.【P1】`hero-media.tsx` 的 `40vw` 是**有意为之的取舍**，不是笔误

- hero 用 `object-cover` 实际铺满整屏，按「真实几何」它需要 2880 像素
- 但它被 `opacity-65` + 两层浅色渐变遮罩压到接近不可见（见 §一 画质验证）
- **取 1200 档在视觉上无损失**（逐像素 0.082/255）
- 若将来有人加强遮罩对比度或换图 → **必须重跑 `quality/local-ab.cjs` 重新评估**
- 保守替代：`50vw` → 取 1920 档（121 KB）→ LCP 3436 ms（优于现状但不达标）

### 4.【观察】移动端目前正常

hero 取 1200（需要 1170，1.03×）｜卡片取 1200（需要 1044，1.15×）→ **移动端无需改动**。

### 5.【已排除，别再查】

- AVIF **已生效**（`formats: ["image/avif","image/webp"]`）
- `minimumCacheTTL: 604800` 已配
- preload 正常（`resourceLoadDelay` 仅 ~170ms）
- CLS = 0
- 卡片图**不是问题**（源图本身够小，到 1200 后字节不再增长）
- 去掉 3840 **不伤 2757 张轮毂目录图**（实测该页 0 错误，退一档到 2048）

---

## 六、回滚

```bash
# 备份点
/tmp/hero-media.bak.tsx      # hero-media.tsx 改动前
/tmp/next.config.bak.ts      # next.config.ts 改动前

# 用 git 回滚
git revert <本次提交 sha>
```

---

## 七、本地服务现状

- **`127.0.0.1:3000` 上的生产服务仍在运行**（用 `next start` 起的）
- 如需重启：先 `pkill -f "next start -p 3000"`，再按 §三 的命令起

---

## 八、一句话交接

> **首页 LCP 的根因是 `hero-media.tsx` 的 `sizes="100vw"` 让浏览器在桌面选择了硬放大的 `w=3840`（197KB）；改成 `40vw` 并在 `deviceSizes` 里去掉 3840 后，本地实测 LCP 3920→2240ms（达标）、字节 −70%、逐像素无差异。代码已改未部署，下一步是带齐 `NEXT_PUBLIC_APP_URL` 部署到 9080 并线上复测。**
