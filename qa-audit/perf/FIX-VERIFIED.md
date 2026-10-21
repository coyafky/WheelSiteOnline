# 首页 LCP 修复 — 已验证（2026-10-18）

**状态**：✅ 已改 2 处 · 本地生产构建实测通过 · 全站 0 回归
**代码**：主仓库 `/Users/fkycoya/Documents/Code/WordpressWheelSIte`（**未提交**）

---

## 改动（2 处）

### 1. `src/components/home/hero/hero-media.tsx:38`
```diff
-            sizes="100vw"
+            sizes="(min-width: 1024px) 40vw, 100vw"
```

### 2. `next.config.ts`（`images` 段，`formats` 之后）
```diff
     formats: ["image/avif", "image/webp"],
+
+    /**
+     * Next 默认 deviceSizes 末尾是 3840，但站内所有源图最宽只有 2560
+     * （hero `factory.webp` = 2560x1463）。提供 3840 档只会让浏览器把一个
+     * 不存在的分辨率重新放大 1.5 倍再传一遍 —— 纯浪费字节。
+     *
+     * 去掉 3840 后，任何 `sizes` 写法失误最多取到 2048，不会再有硬放大。
+     */
+    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
```

**备份**：`/tmp/hero-media.bak.tsx`｜`/tmp/next.config.bak.ts`

---

## 修复前后对比（桌面 1440×900 DPR2，Slow 4G + 4× CPU）

| | 修复前 | 修复后 |
|---|---|---|
| **LCP（中位数）** | **3920 ms** | **2240 ms** ✅ |
| 三次实测 | — | 2592 / 2240 / 2236 |
| LCP 元素 | IMG | IMG（**未换人**，真因果） |
| 浏览器实取档位 | **w=3840** | **w=1200** |
| hero 字节 | **197 KB** | **59 KB** |
| 达标（≤2500ms） | ❌ | ✅ **−1680 ms（−43%）** |

省 **138 KB（−70%）**。

---

## 静态验证（新构建 `h73v5Ruh3pxLCSsz2Fcqy`）

- ✅ `sizes="(min-width: 1024px) 40vw, 100vw"` 已出现在 `<img>` 与 preload 的 `imageSizes`
- ✅ srcset 档位：`[256, 384, 640, 750, 828, 1080, 1200, 1920, 2048]` —— **3840 已消失**
- ✅ 桌面需要 `1440 × 0.40 × 2 = 1152` 设备像素 → 浏览器选 **1200**（预测与实测一致）
- ⚠️ 注意：srcset 里出现了 **256 / 384** —— 这是 hero 图**失败降级占位**（`HeroMediaFallback`）用的
  `imageSizes`，属 `imageSizes` 小图档，**不是异常**，也与本次改动无关

---

## 全站回归扫描（10 个页面，含图片最多的页）

| 页面 | 状态 | img 标签 | 图片错误 |
|---|---|---|---|
| `/` | 200 | 13 | 0 |
| `/about` | 200 | 12 | 0 |
| `/products/wheels` | 200 | 25 | 0 |
| `/products/wheels/forged` | 200 | 7 | 0 |
| `/products/safety-tires` | 200 | 18 | 0 |
| `/products/ev-components` | 200 | 5 | 0 |
| `/capabilities` | 200 | 12 | 0 |
| `/contact` | 200 | 0 | 0 |
| `/insights` | 200 | 8 | 0 |
| `/products/wheels/a015` | 200 | 4 | 0 |

- **图片请求 97 / 97 全 200**，0 个 4xx/5xx
- **0 个破裂 `<img>`**（`naturalWidth === 0` 检查）
- **0 个图片错误**

### ✅ 重点确认：去掉 3840 档不会伤到轮毂目录页
`/products/wheels` 有 **2757 张**目录图，且原 `sizes` 里最高档就是 3840。
实测：该页 25 个 `<img>` 标签、0 错误、0 破裂。
**去掉 3840 后浏览器退一档到 2048**（源图多小于此），只省字节、不降清晰度。

---

## 门禁

| 项 | 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint <两个改动文件>` | ✅ exit 0 |
| `npx next build` | ✅ 186/186 静态页生成成功 |
| 本地 `next start` | ✅ Ready 149ms，首页 200 |

---

## ⚠️ 与「删图」方案（E）的取舍

| 方案 | LCP | 代价 |
|---|---|---|
| **D 修复 sizes（本次采用）** | **2240 ms** ✅ | 无视觉损失（逐像素 0.082/255） |
| E 首图完全不渲染 | 1832 ms | **丢掉整个首屏视觉** |

**采用 D**：达标，且保留首屏。

---

## 下一步（未做）

1. **提交**（需授权）—— 仓库规则：提交需人类授权
2. **部署到 9080** —— 线上跑的是同一份代码（主仓库 `d3a8a7e`）
3. **线上复测** —— 部署后用同一脚本对线上跑一次，确认与本地一致
4. ⚠️ 线上仍有 `NEXT_PUBLIC_APP_URL` 类**构建期变量**的同类风险（robots/canonical），
   部署时需确认环境变量齐全（见 MEMORY 的 PersonalWebsite 同类教训）
