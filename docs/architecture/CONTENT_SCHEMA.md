# 内容 Schema（CONTENT_SCHEMA）

制定日期：2026-10-17
依据：[`CURRENT_ARCHITECTURE.md` §5](../audit/CURRENT_ARCHITECTURE.md#5-wordpress-内容模型local-wpmu-plugins7-文件-5711-行) 实测还原
配套：[`TARGET_ARCHITECTURE.md`](TARGET_ARCHITECTURE.md) ｜ [`I18N.md`](I18N.md)

> **本页是字段所有者的唯一登记处。** 改字段前先查这里；新增字段必须先在此登记。

---

## 1. 统一实体契约（目标）

```ts
interface ContentEntity {
  entityId: string;        // 跨语言稳定标识（当前缺失 → M05 待补）
  wpId: number;            // 具体语言的 WordPress 记录 ID
  locale: string;          // en | zh | es | th
  slug: string;
  title: string;
  status: "draft" | "publish" | "private";
  schemaVersion: number;   // 当前只有 Page 域有
  updatedAt: string;
  seo: SeoMetadata;
}
```

**铁律**：`entityId` 与 `wpId` 不得混用。`entityId` 跨语言稳定，`wpId` 只对单条语言记录有效。

**当前状况**：`entityId` 语义缺失；`wpId` 存在；`schemaVersion` 只在 Page 域。

---

## 2. CPT 登记

| CPT | 常量 | rest_base | `show_in_rest` | `show_ui` | 状态 |
|---|---|---|---|---|---|
| `wheel_model` | `fenghuai-wheels.php:30` | `wheel-models` | ✅ | ✅ | 活跃 |
| `fh_guide` | `fenghuai-guides.php:15` | `fh-guides` | ✅ | ❌ | **迁移期只读回滚源** |
| `fh_inquiry` | `fenghuai-inquiries.php:39` | — | ❌ | ✅（独立权限矩阵） | 活跃 |
| 原生 `post` | `fenghuai-insights-authoring.php:16` | `posts` | ✅ | ✅ | **Insights 正式载体** |

**退役计划**：`fh_guide` 在 native post 稳定运行一个发布周期后停用；停用前必须保证 `fh_guides_authoritative` 为 0，避免「前台读得到、后台改不了」。

---

## 3. Taxonomy 登记

| Taxonomy | 常量 | rest_base | 层级 | 用途 |
|---|---|---|---|---|
| `wheel_diameter` | `fenghuai-wheels.php:31` | `wheel-diameters` | ❌ | 轮毂尺寸筛选 |
| `wheel_process` | `fenghuai-wheels.php:32` | `wheel-processes` | ❌ | 旋压/锻造/… |

**【目标】新增**：`insight_category`（替换当前裸文本 `category` meta，见 M09）

---

## 4. 字段所有者表

### 4.1 Page 域（`fenghuai-pages.php:54-70`，12 个）

| 字段 | 类型 | 所有者 | 消费方 |
|---|---|---|---|
| `fh_page_key` | string | WP | Next（按 key 定位） |
| `fh_publication_status` | enum `draft/approved` | **WP（唯一批准权威）** | Next 发布门槛 |
| `fh_content_json` | JSON | WP | Next（legacy） |
| `fh_content_by_locale_json` | JSON（按 locale 分槽） | WP | Next（v2） |
| `fh_seo_title` | string | WP | Next |
| `fh_seo_description` | string | WP | Next |
| `fh_seo_by_locale_json` | JSON | WP | Next |
| `fh_locale_status_json` | JSON（locale → status） | **WP（逐语言批准权威）** | Next 发布门槛 |
| `fh_page_media` | array of media id | WP | Next |
| `fh_page_locale` | string | WP | Next |
| `fh_translation_group` | string | WP | **（当前未被前端消费）** |
| `fh_page_schema_version` | int | WP | Next（不符即判 unpublished） |

### 4.2 Wheel 域（`fenghuai-wheels.php:46`、`:99-115`）

决策字段 4 组：
`publication_status` / `image_rights_status` / `supply_status` / `specification_status`

事实快照 12 个 `fact_*` 字段（`:99-115`）+ `hero_media_id`（`:241`）

**规格事实的唯一所有者是 `src/content/wheel-catalogue.ts`（构建期生成）**，WP 侧 `fact_*` 是审核用快照，不作为页面渲染来源。

### 4.3 Insight 域（`fenghuai-insights-authoring.php`）

| 字段 | 类型 | 用途 |
|---|---|---|
| `fh_answer` | text | answer-first 导语（H1 正下方） |
| `fh_needs_verification` | bool，**默认 0** | 触发「需工程确认」警告条 |
| `category` | text（**裸文本，非 taxonomy**） | 分类 |
| `translations_json` | JSON | 各语言翻译字典 |
| `translation_status` | JSON | 逐语言批准 |
| `fh_featured_media_id` | int | 封面图 |

**【目标】新增**：`last_verified_at`（date）、`source_references`（结构化数组）、`short_answer`（独立短答案）、`date_modified`（date）

### 4.4 Inquiry 域（`fenghuai-inquiries.php:428+`）

`business_status` / `assigned_to` / `internal_note` / `email_status` / `email_error` / `variant_pending`

**全部 `show_in_rest: false`**，只有独立权限矩阵（`fh_inquiry_sales` 角色）能读。

### 4.5 ACF 字段组（唯一的 1 个）

`group_fh_insights_structured`（`fenghuai-insights-authoring.php:18`）
- 挂载：原生 `post`
- `show_in_rest: 0`
- 内容：text / textarea / image + 条件性 repeater（ACF Free 无 Repeater 时退回自绘 meta box）

**原则**：ACF 只在"编辑体验明显更好"时使用；其余用 `register_post_meta`（可控、可版本化、可 `auth_callback`）。

---

## 5. 同一事实存多份 —— 收敛计划

| # | 事实 | 当前副本 | 目标唯一源 | 收敛方式 |
|---|---|---|---|---|
| 1 | 产品线卡片图/链接 | `product-lines.ts:46` + `homepage-hero.ts:68` + `fenghuai-pages.php:41` | `product-lines.ts` | PHP 侧改为从 REST 读，不硬编码 |
| 2 | Insights 正文 | `fh_guide` CPT + 原生 post | 原生 post | 停用 legacy 分支 |
| 3 | Wheel 规格 | CPT + `fh/v1/wheels` + `wheel-publication.json` | `wheel-catalogue.ts`（规格）+ WP（批准） | 明确分工写进本文档 |
| 4 | 首页 H01 组件 | `home/hero/home-hero.tsx` + `.retired` | 活跃那份 | 删除 retired |
| 5 | Pages 读取 | `fh/v1/pages` + `fh/v2/pages` | v2 | 迁移完成后关闭 v1 分支 |
| 6 | 首页模块类型 | `types.ts` + `page-view.ts` + `page.tsx` + `pages.php` | 单一注册表（M04） | 改注册表模式 |
| 7 | 缓存标签 | 3 个 contract 各自定义 | `cache-tags.ts` | 集中导出 |
| 8 | 产品分类 | `products.ts` + `product-lines.ts` + `wheel-catalogue.ts` | 一套 | 删除 `products.ts` 死数据 |

---

## 6. 契约自动比对【目标，当前缺失】

PHP 常量与 TS 常量各存一份，靠人眼维持同步：

| PHP | TS | 需要比对 |
|---|---|---|
| `FH_HOME_MODULES`（`pages.php:31-37`） | `CMS_MODULES`（`page-view.ts:118-124`） | id → type 映射 |
| `FH_HOME_PRODUCT_LINE_FACTS`（`pages.php:40-45`） | `productLineFacts`（`product-lines.ts`） | image / href |
| `fh_wheel_is_approved()` | `passesHumanApproval()`（`publication.ts:66-92`） | 批准判定 |

**目标**：`scripts/verify-contract-parity.mjs` 在 CI 中执行，任一处不一致即失败。

---

## 7. Schema 版本化现状

| 域 | 有版本号 | 不符时行为 |
|---|---|---|
| Page | ✅ `fh_page_schema_version` | 直接判 `unpublished`（fail-closed） |
| 首页模块 | ✅ 类型级 `schemaVersion: 1` | `normalizeHomepageCmsDocument` 返回 `null` |
| Wheel | ❌ | — |
| Insight | ❌ | — |
| Inquiry | ❌ | — |

**目标**：Wheel / Insight 补版本号；Inquiry 由表结构迁移脚本管理（非 meta 版本）。

---

## 8. 内容编辑纪律

1. **正文一个字都不在前端代码里写死**（除兜底 fallback）
2. **PLACEHOLDER 内容不得上线**：`src/content/faq.ts` 当前违反此条（M07）
3. **未核验数据必须显式标注**：`verified: false` / `pendingNote` / `needsVerification`
4. **图片必须有真实来源与图权**：`approvalStatus` + `sourceRef`
5. **每次新增字段**：先登记本文档 §4，再写代码
