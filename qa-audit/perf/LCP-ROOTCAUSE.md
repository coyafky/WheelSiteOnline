# 首页 LCP 根因分析（本地实测 · 最新代码）

- **日期**：2026-10-18
- **被测代码**：主仓库 `/Users/fkycoya/Documents/Code/WordpressWheelSIte` @ `d3a8a7e`（最新）
- **本地构建**：`.next` BUILD_ID `2TXFhhE0P8ipuKHcceL3n`（07:36 构建，`next build`）
- **本地服务**：`next start -p 3000`（生产模式）＋ 本地 WordPress docker `fh-wp` on `:8081`
- **测法**：Playwright 真实 Chromium ＋ CDP 节流（Slow 4G = 1.6Mbps/RTT150ms ＋ CPU 4×）
- ⚠️ **全程只测本地，未对服务器做任何测试**

---

## 一、结论（一句话）

**根因是 `hero-media.tsx:38` 的 `sizes="100vw"`。**

它让浏览器在桌面视口认定首图「占满整屏 1440px」，按 DPR 2 需要 2880 设备像素；
而 srcset 里 `2048 < 2880`，浏览器只能跳到下一档 **`w=3840`（197 KB）** ——
可这张图的源图只有 **2560px 宽**，**3840 是硬放大 1.5 倍，纯浪费 142 KB**。

**LCP 的 76% 花在「下这张被放大的图」上。**

---

## 二、决定性对照矩阵（每个场景只改一处，两次实测取中位数）

| 场景 | LCP | LCP 元素 | 浏览器实取档位 | 说明 |
|---|---|---|---|---|
| **A 现状 `100vw`** | **3920 ms** | IMG | **w=3840** | 基线 |
| B `sizes` → 60vw | 3444 ms | IMG | w=1920 | −476 ms |
| C `sizes` → 50vw | 3436 ms | IMG | w=1920 | −484 ms |
| **D `sizes` → 40vw** | **2300 ms** | IMG | **w=1200** | **−1620 ms（−41%）** |
| E 首图完全不渲染 | 1832 ms | H1（改人） | 请求被 abort | −2088 ms |
| F 禁掉全部字体 | 1904 ms | H1（改人） | w=3840 | ⚠️ **假象，见 §五** |

✅ **D 达标**：2300 ms ≤ 2500 ms（Core Web Vitals「良好」阈值）。
✅ **E 不必要**：删图会丢掉整个首屏视觉；D 用 1/4 的字节换到同一档效果。

---

## 三、相位分解（A 现状）

```
docTTFB              53 ms    (1%)
resourceLoadDelay   169 ms    (4%)   ← preload 正常，无延迟问题
resourceLoadDuration 3001 ms  (76%)  ← 问题全在这里
elementRenderDelay  177 ms    (4%)
```

**不是 TTFB、不是 preload、不是渲染延迟 —— 就是「这张图多少字节」。**

---

## 四、档位实测（本地，AVIF，q=75）

| 档位 | 字节 | 说明 |
|---|---|---|
| 640 | 22,082 | |
| 828 | 33,436 | |
| 1080 | 50,992 | |
| **1200** | **60,093** | ← **D 方案实取，LCP 2300 ms** |
| 1920 | 121,180 | |
| 2048 | 133,558 | 源图原生 2560，到此为止有意义 |
| **3840** | **201,676** | ← **A 现状实取，硬放大 1.5×** |

源图 `public/images/home/factory.webp`：**2560 × 1463，483 KB**
→ 2048 之后源图已无更多细节，**3840 档是纯浪费**。

**A → D 省下 141.6 KB（−70%）。**

---

## 五、⚠️ 必须警惕：三个「看起来正确」的假象

**任何「禁掉 X → LCP 变好」的测试，都要检查 LCP 元素有没有换人。**

| 测试 | 表面结论 | 真相 |
|---|---|---|
| **禁 CSS** | 「LCP 352ms，CSS 是元凶！」 | ❌ **假象**。禁 CSS 后布局塌掉，`heroImgBox` 虽报 1440×900 但 `opacity` 变成 1（内联层失效），**hero 图根本没进入 LCP 候选**，LCP 换成未排版的小 H1（area 31376 vs 原 272586）。 |
| **禁字体** | 「LCP 1904ms，字体是元凶！」 | ❌ **假象**。LCP **元素从 IMG 换成了 H1**，且 hero 图的 `w=3840` 请求**照常发生**。对比 B/C/D：那三组 LCP 元素**始终是 IMG**，只是字节变少 → 那才是真因果。 |
| 移动端「3.68× 超规格」 | 「移动端浪费更严重」 | ❌ **测量假象**。那 3 张产线图在移动端是 `loading="lazy"`，页面底部 6000px 外根本没被拉取，读到的是默认 `src` 而非 `currentSrc`。移动端实测：hero 1200（需要 1170，**1.03× 正常**），卡片 1200（需要 1044，1.15×）。 |

**→ 所以「本地由于 CSS 才渲染慢」这个说法不成立。CSS 那组数字是元素替换造成的假象。**

---

## 六、画质验证：D 方案是否会掉画质？

同一页面、同一 CSS，只换 hero 档位，**逐像素比对渲染结果**：

```
A(3840) vs D(1200) 渲染差异 → 平均 0.082/255   最大 3   差异>8 的通道占比 0.00%
```

**肉眼与数值双重无差异。** 并排图：`qa-audit/perf/quality/local-A-vs-D.png`

原因：这张 hero 图在页面上被
① `opacity-65` ② `bg-linear-to-r from-background via-background/94 to-background/45`
③ `bg-linear-to-t from-background/65 …` 三层浅色遮罩压住，
真实可见对比度极低 → **高分辨率细节本来就被抹掉了，压缩不可见**。

---

## 七、修复方案

### P0 · 改 `sizes`（一行，收益最大）
`src/components/home/hero/hero-media.tsx:38`

```diff
-            sizes="100vw"
+            sizes="(min-width: 1024px) 40vw, 100vw"
```

**实测 LCP 3920 ms → 2300 ms（−41%），达标。**
40vw 对应 1440×0.4 = 576 CSS px，DPR2 → 1152，向上取 1200 档（60 KB）。

> ⚠️ `40vw` 是「按需索取」的选择，不是「图片只占 40% 宽度」。
> hero 是背景板，实际用 `object-cover` 铺满整屏；
> 但因为它被三层遮罩压到接近不可见（§六），取 1200 档在视觉上无损失。
> 若要保守，用 **50vw → 1920 档（121 KB）→ LCP 3436 ms**，仍然优于现状但不达标。

### P0 · 去掉 3840 档（防御性）
`next.config.ts` 加：

```ts
images: { deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048] }
```

源图只有 2560，任何 DPR 下 3840 档都是无意义放大。
去掉后即使 `sizes` 写错，浏览器最多取 2048（134 KB），不会再出现 3840。

### 顺带确认（本地已实测）
- ✅ **AVIF 已生效**：`next.config.ts` 有 `formats: ["image/avif","image/webp"]`，实测返回 `image/avif`
- ✅ **`minimumCacheTTL: 604800`** 已配，减少重复编码
- ✅ **preload 正常**：`resourceLoadDelay` 仅 169 ms
- ✅ **CLS = 0**
- ✅ **卡片图不是问题**：源图本身够小，1200 之上字节不再增长
- ⚠️ **`project-route-section.tsx:18` 声明偏小**（桌面渲染 756px 实取 640，0.42×）→ 可能发虚，**但字节上无浪费**，属另一类问题（画质方向）

---

## 八、复现命令（全部本地）

```bash
# 1. 起本地生产服务（需先 next build）
cd /Users/fkycoya/Documents/Code/WordpressWheelSIte
ALLOW_LOOPBACK_WP_MEDIA=true NODE_ENV=production npx next start -p 3000

# 2. 决定性对照矩阵
cd ~/.config/alma/tools/pw-shot
NODE_PATH=<repo>/node_modules node <repo>/qa-audit/perf/final-matrix.cjs

# 3. 逐像素画质比对
NODE_PATH=<repo>/node_modules node <repo>/qa-audit/perf/quality/local-ab.cjs
```

⚠️ `next start` 会警告 `output: standalone`，但**服务正常可用**（实测 Ready + 页面 200）。
⚠️ 生产构建默认不注册 `localhost:8081` 媒体白名单（防 SSRF）→ 必须带
**`ALLOW_LOOPBACK_WP_MEDIA=true`**，否则所有 WP 图 400。
