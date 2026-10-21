# SEO 与 GEO（SEO_GEO）

制定日期：2026-10-17
依据：[`GAP_ANALYSIS.md` M06/M07](../audit/GAP_ANALYSIS.md#m06-seo-基础设施) 实测证据
配套：[`I18N.md`](I18N.md) ｜ [`CONTENT_SCHEMA.md`](CONTENT_SCHEMA.md)

---

## 1. 已成立的基础（保持不动）

| 能力 | 位置 | 说明 |
|---|---|---|
| fail-closed | `sitemap.ts:16-17`、`robots.ts:14-15`、`llms.txt/route.ts:8-14` | 未配域名 → sitemap 空 / robots 全禁 / llms 404 |
| metadataBase 单点 | `layout.tsx:57` | 相对 canonical 自动绝对化 |
| 查询参数策略 | `wheels/page.tsx:90-97` | 筛选 → noindex + canonical 指回基础目录；分页 → canonical 带 `?page=N` |
| 不伪造 Offer | `[model]/page.tsx:203-227` | `Product` 用 `additionalProperty` 表达规格，不写 price/availability |
| 308 保留 query | `[model]/page.tsx:159` | 旧路径迁移 |
| 草稿隔离 | `draftMode()` + preview secret | 预览页 noindex |

---

## 2. SEO 缺口与修复

### 2.1 Canonical 非单点 ⚠️ High

**现状**：`layout.tsx:73-85` 生成一次，**另有 20 处页面级 `generateMetadata` 各自再生成并覆盖**。
`/about`、`/insights` 列表**完全没有 canonical**。

**修复（P0/P1）**：
- 建立 `src/lib/seo/metadata.ts` 的 `buildMetadata({ path, locale, title, description })` 单一入口
- 所有页面级 `generateMetadata` 改为调用它，不允许手写 `alternates`
- 加 E2E：抓 30 个模板 URL，断言 `<link rel="canonical">` **存在且唯一**

### 2.2 sitemap 与 e2e 硬矛盾 ⚠️ 必须裁决

| 路径 | `sitemap.ts` | `e2e/site-contract.spec.ts:29-30` |
|---|---|---|
| `/thank-you` | `:37` 包含 | 断言 `not.toContain` |
| `/gallery/finishes` | `:40` 包含 | 断言 `not.toContain` |

**必有一方错。** 裁决依据必须来自业务意图，不能靠猜：
- `/thank-you` 是转化确认页，**不应索引**
- `/gallery/finishes` 是图集页，应看内容是否达到索引质量阈值

**动作**：先确认业务意图 → 改 sitemap 或改 e2e → 二者必须一致。

### 2.3 结构化数据覆盖不足 ⚠️ Medium

**现状 4 类**：`Product`、`ItemList`、`CollectionPage`、`Service`

**缺失**：
- `Organization`（公司主体、logo、sameAs）
- `WebSite`（站内搜索、name）
- `BreadcrumbList`（`site-breadcrumbs.tsx` 无任何 JSON-LD）
- `FAQPage`（FAQ 用 `<article><h3><p>` 而非 `<details>`）

**修复（P2）**：新增 `src/lib/seo/jsonld.ts` 集中生成；FAQ 收敛到 `FaqAccordion` 后统一出 schema。

### 2.4 索引判断散落 ⚠️ Medium

`robots.index` 在 20 个 `generateMetadata` 里各写一遍，其中 **14 处硬编码 `index: true`**（完整清单见 [`GAP_ANALYSIS.md` M06](../audit/GAP_ANALYSIS.md#m06-seo-基础设施)），全部绕过 `preview` 判断。

→ **绕过 preview 判断**，草稿预览会话中仍声明可索引。

**修复**：统一由 `publication.ts` 决定，页面级不允许写死。

### 2.5 重定向散落 ⚠️ Low

`next.config.ts` **无 `redirects()`**，规则在 6 个 `page.tsx` 里。
`resources/*` 用 `redirect()` → **307 而非 308**（同文件注释已承认）。

**修复**：迁到 `next.config.ts` 的 `redirects()`，静态迁移用 308，或统一改用 `permanentRedirect`。

### 2.6 `NEXT_PUBLIC_APP_URL` 缺失无启动告警 ⚠️ Medium

模块加载期求值（`site-url.ts:18`），容器内漏注入 → **全站禁抓**，但没有任何告警。

**修复**：启动时校验 + 日志告警；CI 加构建期断言。

---

## 3. GEO 字段设计【目标，当前全缺】

V3.0 要求的 8 个 GEO 字段，本项目落地版本：

```ts
interface GeoFields {
  canonicalQuestion: string;      // 页面主要回答的问题
  shortAnswer: string;            // 40–60 词可直接摘录的答案
  supportingEvidence: string[];   // 数据与引用
  applicability: string;          // 适用条件
  limitations: string;            // 边界与风险
  relatedEntities: string[];      // 品牌/产品/技术概念
  lastVerifiedAt: string;         // 最近事实核查时间（YYYY-MM-DD）
  sourceReferences: SourceRef[];  // 结构化引用
}

interface SourceRef {
  label: string;
  url?: string;           // 可公开回溯的链接
  internalRef?: string;   // 内部记录号（不可单独作为证据）
  verifiedBy?: string;
  verifiedAt?: string;
}
```

### 3.1 现状对照

| 字段 | 现状 | 缺口 |
|---|---|---|
| `canonicalQuestion` | ❌ | 需新增 |
| `shortAnswer` | ⚠️ 有 `answer`（一句话 takeaway），非独立可摘录块 | 需新增独立字段 |
| `supportingEvidence` | ⚠️ 有 `evidenceStatus`（supplier-stated / verified） | 需扩展为可渲染列表 |
| `applicability` | ⚠️ 散落在文案 | 需结构化 |
| `limitations` | ⚠️ 有 `pendingNote` | 需结构化 |
| `relatedEntities` | ❌ | 需新增 |
| `lastVerifiedAt` | ❌ **全站零命中** | 需新增 |
| `sourceReferences` | ⚠️ 有 `sourceRef` 但值是 `"WP 116"` 这类内部记录号 | 需改为结构化 |

### 3.2 三条硬纪律

1. **`sourceReferences` 必须可外部回溯**：`"WP 116"` 不是证据，必须补公开 URL 或明确标注「内部资料，不可外部核验」
2. **`lastVerifiedAt` 必须真实**：不能自动填「今天」
3. **`needsVerification` 默认必须是 true**（当前默认 0 → 编辑忘记勾选就漏警告）

---

## 4. FAQ 收敛【P0，含已上线的合规风险】

**现状三处分布**：
- `src/content/faq.ts`（6 条）→ `/dealers` 与 `/products` **复用同一份**
- `src/content/fitment.ts`（12 条，三平台各 4）→ `/fitment/[platform]`
- `FaqAccordion` 写好但**未启用**

**风险（真实，非理论）**：
`src/content/faq.ts:3-8` 至今是 **PLACEHOLDER**，注释写着「answers must be confirmed against Fenghuai's real terms — lead time, MOQ, warranty length and shipping incoterms are commitments」，
但**已经上线渲染在 `/dealers` 与 `/products`**，内容涉及 **MOQ / 交期 / 质保 / 贸易术语**。

→ 这是**未核验的商业承诺已在发布**，且没有任何机制阻止 AI 把它引用为事实。

**修复（P0）**：
1. 确认这 6 条 FAQ 的真实业务口径，或**从两个页面移除**
2. 统一到 `FaqAccordion` + 输出 `FAQPage` JSON-LD
3. 加单测：`grep PLACEHOLDER` 必须为 0

---

## 5. llms.txt【目标】

**现状**：纯链接索引（4 个 section），无事实层。

**目标结构**：

```
# 深圳峰徊科技有限公司

> 一句话定位（谁、做什么、不做什么）

## 事实（带核验边界）
- 成立时间：…（last verified 2026-10-xx）
- 主营四条产品线：…
- 不提供的：在线订购、零售库存查询…

## 核验声明
- 规格与适配以逐型号工程确认为准
- 商业条款（MOQ / 交期 / 质保）以书面合同为准

## 内容索引
- [产品] ...
- [技术文章] ...
```

**要求**：`curl -s /llms.txt | grep -cE "Founded|MOQ|ISO|capacity"` ≥ 3。

---

## 6. 验收清单

```bash
# 1. canonical 唯一性（30 个模板 URL）
for u in $(cat e2e/urls.txt); do
  curl -s "$u" | grep -c 'rel="canonical"'   # 必须每页恰好 1
done

# 2. hreflang == sitemap 语言集合（新增脚本）
node scripts/verify-hreflang-parity.mjs

# 3. sitemap 与 e2e 一致
curl -s /sitemap.xml | grep -c "/thank-you"   # 必须与 e2e 断言同向

# 4. 结构化数据
curl -s / | grep -c "Organization"
curl -s /about | grep -c "application/ld+json"
curl -s /dealers | grep -c "FAQPage"

# 5. GEO 字段
grep -rn "lastVerifiedAt\|sourceReferences\|shortAnswer" src local-wp/mu-plugins | wc -l   # ≥ 3

# 6. llms.txt 事实层
curl -s /llms.txt | grep -cE "Founded|MOQ|ISO|capacity"   # ≥ 3

# 7. PLACEHOLDER 清零
grep -rn "PLACEHOLDER" src/content/faq.ts | wc -l   # = 0

# 8. fail-closed 仍生效
# 未配 NEXT_PUBLIC_APP_URL 构建后：
curl -sI /robots.txt | grep -i "disallow: /"
```
