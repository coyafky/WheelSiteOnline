# 四个 A 类页（capabilities / ev-components / custom-aluminum / safety-tires）中文落地

- **状态**：已完成
- **日期**：2026-10-11
- **前置**：`work/completed/2026-10-11-i18n-page-body-classification.md`（历史分类结论）

## 目标

给 4 个纯 WP 页面补 zh 正文，使 `/zh/*` 真正渲染中文。

## 完成记录（2026-10-11）

### ① 4 页 zh 词表与数据

| 页面 | WP post | 词表 | REST 状态 |
|---|---:|---|---|
| `capabilities` | 1313 | 新增 | `{en: approved, zh: approved}` |
| `ev-components` | 1315 | 新增 | `{en: approved, zh: approved}` |
| `custom-aluminum` | 1316 | 新增 | `{en: approved, zh: approved}` |
| `safety-tires` | 1317 | 新增 | `{en: approved, zh: approved}` |

`translations_zh.py` 现共 **7 个页面词表**（home / about / product-lines / capabilities / ev-components / custom-aluminum / safety-tires）。

**实测渲染**（4 条 zh 路由的 `<h1>`）：
- `/zh/capabilities` → `工程决策优先，每道关口均有工…`
- `/zh/products/ev-components` → `面向电驱电机与控制器项目的铝…`
- `/zh/products/custom-aluminum` → `从图纸、3D 模型或实物样件开始`
- `/zh/products/safety-tires` → `面向适用胎面穿刺的自密封轮胎`
- 对应 4 条英文路由**均未变**（仍英文）

### ② 🔴🔴 顺带挖出并修掉一个**影响全站多语言**的真缺陷

**症状**：`/zh/products/safety-tires` 的正文已全中文，但**图片说明（caption）仍全是英文**。

**排查链**：
1. 先确认 WP 数据 → `content_by_locale.zh` 的 caption **确实是中文**（`滞留在胎面区域的穿刺物` 等）→ **数据没问题**
2. 再确认渲染 → 页面 caption 却是英文 → 问题在**渲染层**
3. 定位到组件读的是 `item.media?.caption`（`self-sealing-tire-page.tsx:312`）→ 该值来自 resolver 的 media 合并
4. 找到元凶 `src/lib/wordpress/media.ts:19`：
   ```ts
   alt: wordpressMedia.alt_text.trim() || media.alt,
   caption: stripHtml(wordpressMedia.caption.rendered) || media.caption,
   ```
   **媒体库（`wp/v2/media`）优先于内容载荷** —— 但媒体库的 `alt_text` / `caption` 是
   **英文单语资源，没有按 locale 分版**；而载荷里的 `alt` / `caption` 是**按语言翻译好的**。
   → 结果：**任何非英文页面都被强制回落英文图注**。

**影响面**：不止 safety-tires。实测 `capabilities` 12 条、`ev-components` 4 条、`custom-aluminum` 3 条、
`safety-tires` 17 条 —— **共 36 条图注全部受影响**。且这是**先于本轮的既存缺陷**，
`about` / `product-lines` 等页同样中招（只是当时没扫到 caption 这一层）。

**修法**：反转优先级 —— **载荷文本优先，媒体库兜底**，`src` 仍取媒体库（资源定位与语言无关）。
```ts
alt: media.alt.trim() || wordpressMedia.alt_text.trim(),
caption: media.caption.trim() || stripHtml(wordpressMedia.caption.rendered),
```

**安全性验证（为什么 en 不受影响）**：实测 `content_by_locale.en` 的 caption 与媒体库
逐字一致（media 151 → 两边都是 `A penetrating object lodged in the tread area`）
→ 英文侧「首选载荷」与「首选媒体库」结果相同。**已实测 en 页 caption 与 alt 零变化。**

**修复后实测**：`/zh/products/safety-tires` 图注 →
`自密封轮胎生产基地内的自动化设备` / `生产环境中的检验设备`（中文）✅
`/products/safety-tires` 图注 → `Automated equipment in the self-sealing tyre production base`（**未变**）✅

### ③ 渲染后 HTML 扫描（4 条 zh 路由）

剩余拉丁文本全部可归类为**结构性/技术性 token**，无真实文案缺口：

| 类别 | 实例 | 判定 |
|---|---|---|
| 品牌名 | `Fenghuai` | ✅ 不译 |
| 语言切换器 | `English` / `Español` | ✅ 不译 |
| **区块 ID（来自载荷）** | `WM01`–`WM05` / `EV02`–`EV06` / `CA02`、`CA04` | ✅ 结构标识（实测 `zh.engineering.id`） |
| 工艺缩写 | `CNC` / `HPDC` / `LPDC` | ✅ 行业术语保留 |
| 锚点 slug | `project-inputs` / `development-flow` / `capability-boundary` / `custom-aluminum-assessment` | ✅ 机器值 |
| **组件硬编码标签** | `Stated in supplier material`（ev-components）、`Accepted as an engineering input` / `Start with this group` / `Start with this input`（custom-aluminum）、`puncture-test spike · tread area`（safety-tires 图示注记） | ⚠️ **真实缺口，范围外**（见下） |

## 门禁（全绿）

`npm test` **42/42** ｜ `npx tsc --noEmit` exit 0 ｜ `npx eslint .` **0 error 0 warning** ｜
`npm run build` exit 0 ｜ `git diff --check` clean ｜ 无 commit

## 改动文件

| 文件 | 改动 |
|---|---|
| `scripts/i18n/translations_zh.py` | +4 个页面词表（capabilities / ev-components / custom-aluminum / safety-tires）|
| **`src/lib/wordpress/media.ts`** | **修 bug**：图注/alt 优先级反转（载荷优先、媒体库兜底）—— 这是本轮唯一的 src 改动，且**修的是既存缺陷** |
| WP posts 1313 / 1315 / 1316 / 1317 | 写入 zh 内容 + `locale_status.zh = approved` |

## 重要结论

1. **`media.ts` 的优先级 bug 是全站性的** —— 它让「正文已翻译、图注仍英文」，
   且**因为不留痕，肉眼很难发现**。所有走 `resolveWordpressMedia*` 的页面都受影响。
2. **「生成器报 0 untranslated」不等于「渲染无英文」** —— 本轮 4 个页面生成器全报 0，
   但渲染层仍有 36 条英文图注。**两者测的是不同层**：生成器测「载荷是否漏译」，
   渲染扫描测「页面是否漏译」。**必须两个都做。**
3. **`grep "@/content/"` 判类型 vs 值的纪律再次生效**：`custom-aluminum` import 了
   `customAluminumPage`（一个**值**），但它只用于读 `boundary.declinedConfirmed` 发布门禁标志，
   **不参与渲染** → 判定为纯 WP 页是正确的，不能因为 grep 命中就误判成混合页。

## 未做（范围外）

- **组件硬编码标签**（3 个页面共 5 处 + `puncture-test spike` 图示注记）—— 属 UI chrome，
  需走字典体系（同 `/products` 那轮的做法），是**独立切片**
- `/es`、`/th` 翻译（本轮只做 zh）
- `INDEXABLE_LOCALES` 仍为 `["en"]`；noindex / hreflang / sitemap **未动**
- 26 个非 WP 页面仍未接 locale
