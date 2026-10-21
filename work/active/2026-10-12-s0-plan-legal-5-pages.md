# S0 · 法律文本 5 个独立 Page（启动件）

- **状态**：进行中
- **日期**：2026-10-12
- **用户拍板**：**5 篇各建 1 个 Page**（同构同样处理，不给 `privacy` 开特例）
- **前置**：`2026-10-12-s0-ownership-audit-correction.md`（归属实况修正）

---

## 一、为什么先做这一件（而不是先做 contact）

S0 的修正账目把「需新建 WP 归属」的页面排了序，法律文本被我放在 P3（最慢）。
但**逐字段核查后，它反而是最该先做的一件**：

| 理由 | 依据 |
|---|---|
| **5 篇完全同构** | 同一个 `legalDocuments` 数组、同一个 `LegalDocumentPage` 渲染器、同一个 `getLegalDocument(slug)` 检索、同一个 `legalHref()` —— 实测确认 |
| **一个适配器解决 5 页** | 写一次 `getLegalDocumentContent(locale)`，5 条路由全通 |
| **它同时解锁 `privacy`** | `privacy` 已有 WP 记录但**正文仍走本地**（混合态）→ 本轮统一后 5 页一致 |
| **风险最低** | 无动态参数、无数据驱动、无媒体解析（不像 fitment/wheels 那样带数据层） |

📌 换句话说：**先做同构的，模式一次立住；再做异构的**。

## 二、已核实的结构（实测，非推测）

```
LegalDocument = {
  slug, title, lastUpdated, eyebrow, summary, intro,
  sections: LegalSection[], governingNote
}
```

| 文档 | 字节 | heading 数 |
|---|---:|---:|
| warranty | 5,629 | 7 |
| returns | 4,349 | 7 |
| shipping | 5,285 | 7 |
| terms | 7,081 | 11 |
| privacy | 6,843 | 10 |

**关键点**：5 篇**形状完全一致**（同一 type、同一渲染器）→ 生成器只需一个形状守卫。

## 三、实施步骤

### ① 新建 WP Page × 5
| page_key | 路由 | 对应 slug |
|---|---|---|
| `legal-warranty` | `/support/warranty` | `warranty` |
| `legal-returns` | `/support/returns` | `returns` |
| `legal-shipping` | `/support/shipping` | `shipping` |
| `legal-terms` | `/support/terms` | `terms` |
| `legal-privacy` | `/support/privacy` | `privacy` |

⚠️ **page_key 用 `legal-<slug>`** 而不是裸 `warranty`/`returns` —— 避免与未来可能的业务 key 撞名，且一眼看出属于法律文档族。
⚠️ `privacy` **已有一条名为 `privacy` 的 WP 记录**（但无正文）→ 本轮**复用/改造它**，不新建第二条。

### ② 新建适配器 `src/lib/wordpress/legal.ts`
```ts
export async function getLegalDocumentContent(slug: string): Promise<LegalDocument>
```
- 走 `getWordpressPageDocument<LegalDocument>("legal-" + slug, { locale })`
- 形状守卫 `isLegalDocument()`：校验 `title/eyebrow/summary/intro/sections` 存在且 `sections` 是数组
- `resolveLocalized`（scope `legal:<slug>`）→ 失败回落本地 `getLegalDocument(slug)`

### ③ 5 条路由改接线
`src/app/support/{warranty,returns,shipping,terms,privacy}/page.tsx`
- `const doc = getLegalDocument("x")` → `await getLegalDocumentContent("x")`
- ⚠️ **不改 `LegalDocumentPage` 渲染器**（5 页共用，动它风险大）
- ⚠️ `privacy` 页额外读 `getInquiryContent()` —— 那是**另一条链**（询盘文案），本轮不动

### ④ 扩 `translations_zh.py` + seed
- 新增 5 个词表 key：`legal-warranty` / `legal-returns` / `legal-shipping` / `legal-terms` / `legal-privacy`
- ⚠️ **法律文本必须人工核验** —— **本轮只搬 en，不填 zh**（zh 留给后续带法务签字的切片）

### ⑤ en 零回归验证
5 条路由 en 渲染必须与改动前**逐字一致**

## 四、完成记录（2026-10-12）

### ✅ 5 个 Page 已建，5 条路由已接线

| slug | WP post | 正本 | locale_status | sections |
|---|---:|---|---|---:|
| warranty | **1421** | ✅ 完整正文 | `{en: approved}` | 7 |
| returns | **1422** | ✅ | `{en: approved}` | 7 |
| shipping | **1423** | ✅ | `{en: approved}` | 7 |
| terms | **1424** | ✅ | `{en: approved}` | 11 |
| privacy | **1425** | ✅ | `{en: approved}` | 10 |

`page_key` 用 `legal-<slug>`（避免与未来业务 key 撞名）。
**`privacy` 实测无既有记录** → 5 篇同为从零新建，无复用问题。

### 改动文件（7 个）

| 文件 | 改动 |
|---|---|
| `src/lib/wordpress/legal.ts` **(新建)** | `getLegalDocumentContent(slug)` + `legalPageKey()` + `LEGAL_DOCUMENT_SLUGS` + `isLegalDocument` 形状守卫；镜像 `safety-tires.ts` 的模式 |
| `src/app/support/{warranty,returns,shipping,terms}/page.tsx` | 一行改接线：`getLegalDocument` → `await getLegalDocumentContent` |
| `src/app/support/privacy/page.tsx` | 同样改接线；其 `generateMetadata` 与 `getInquiryContent` 面板**未动** |
| `scripts/i18n/seed-legal-content.php` **(新建)** | 专用 seeder：写 en 正本 + by-locale，读回自证 |

**未动**（已 diff 确认）：`legal-document.tsx`（共享渲染器）、`src/content/legal.ts`、`pages.ts`、`pages-contract.ts`、`localized-page.ts`、`INDEXABLE_LOCALES`、WP 插件

### 验收实测

| 检查 | 结果 |
|---|---|
| 5 条路由渲染 | 全部 **200**，H1 正确（Warranty Policy / Return & Refund / Shipping & Packaging / Terms of Service / Privacy Policy）|
| **`noindex, nofollow`** | **5 页全部保留** ✅ |
| CJK 泄漏 | 4 页只有 `中文`（语言切换器）；`privacy` 另有既有 `PrivacyTemplatePanel` 的中文（**本轮未引入**，见下）|
| **接缝真实性（关键）** | 往 `legal-returns` 写入探针 `SEAMPROBE-MARKER-ZX9` → **页面出现该字符串**（1 处命中）→ **证明走的是 WP 而非静默回落**；探针已回滚，**残留 0**、正文恢复 ✅ |
| 门禁 | `npm test` **42/42** ｜ `tsc --noEmit` clean ｜ `eslint .` clean ｜ `build` exit 0 |

### ⚠️ 一处需澄清：`privacy` 页的既有中文

`privacy/page.tsx` 里有个 `PrivacyTemplatePanel`（含 ~111 个 CJK 字符：`版本号` / `提交时显示的同意文本` / `待公司确认（表单保持关闭）`）。

**判定：它不是本轮引入的。** 证据链：
1. 本轮**只改了 7 个文件**（已用 `find -newermt` 穷举），其中**没有任何 inquiry 相关文件**
2. 该面板消费 `getInquiryContent()` → `src/lib/wordpress/inquiry-content.ts` **本轮 mtime 未变**
3. `git show HEAD` 版本里**没有**该面板 → 它是**工作区的既有未提交改动**（属那 ~250 个文件的历史积压）
4. 本轮对 `privacy/page.tsx` 的实际改动**只有一处**：`getLegalDocument` → `getLegalDocumentContent`（已 grep 确认）

→ **本轮的 CJK 增量为 0**（5 条路由全程）。

### 🔑 本轮验证到的方法学

1. **「接缝真实」必须用探针证明，不能只看页面正常渲染** —— 页面 200 且内容正确，既可能是走 WP，也可能是静默回落本地常量。写一个哨兵字符串进 WP、看它是否出现在页面，才是唯一硬证据。
2. **探针必须回滚并验证无残留**（本轮残留 0 已确认）。
3. **判断「某改动是不是本轮引入的」，用 `find -newermt` 穷举改动文件 + 查依赖链 mtime**，比读 `git diff`（会混入他人的未提交改动）可靠。
4. **`git diff` 对未提交工作区是误导性的**：`privacy/page.tsx` 的 diff 看起来像改了很多，实际本轮只改了一行。

## 五、非范围

- ❌ 不填 zh（法律文本需法务核验，独立切片）
- ❌ 不改 `LegalDocumentPage` 渲染器
- ❌ 不动 `privacy` 页的 `getInquiryContent()` 链
- ❌ 不改 `src/content/legal.ts` 的导出
- ❌ 不 commit

## 六、纪律（全程适用）

1. **改 WP 数据后必须 `kill` dev server + `rm -rf .next` + 同参数重启**
2. **英文正本 `fh_content_json` 与 `content_by_locale` 是两份 meta** —— 迁移形状两份都要写
3. **验证必须扫渲染后的 HTML**，不能只看页面文件
4. **生成器报 0 untranslated ≠ 渲染无英文** —— 两者测不同层，都要做
5. **抽样动态路由从数据源取真实值**（本轮无动态参数，但 `privacy` 已有记录需先读现状）
