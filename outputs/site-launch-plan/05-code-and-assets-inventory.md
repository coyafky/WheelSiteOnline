# 代码模块与产品资料盘点（执行前的家底清单）

日期：2026-10-04。性质：**只读盘点**，未改任何代码。目的：在执行前摸清「前端/后端/内容/数据/素材」五层的真实状态，识别克隆遗留、虚构内容与断链，作为后续 T00–T23 执行的依据。所有数字均来自本日实际扫描，不是推测。

---

## 1. 一句话结论

**表现层（路由/组件/令牌）已基本脱离克隆骨架，但轮毂目录、SKU 页、询盘表单仍跑在虚构数据上（`wheel-skus.ts` 的 N-100RS 系列），sitemap 正在生成虚构 URL；真实产品数据（1349 型号 / 3485 变体 / 2757 图）和三条能力线的 PPT 素材已就位但未接入。类型层已为真实数据准备好了契约（`WheelModel/WheelVariant/WheelCatalogue`），缺的是「数据 → 类型 → 页面」的接缝模块。**

---

## 2. 前端路由全景（33 个 page.tsx）

### 2.1 首发四线 + 公司能力（与 ChatGPT 规划一致，可复用）

| 路由 | 用途 | 数据状态 |
|---|---|---|
| `/` | 首页（Hero 已拆分，后三段待复核） | 内容层 OK |
| `/products` | 产品中心（四线卡） | ✅ 四线轴已建 |
| `/products/wheels` | 轮毂目录 | ⚠️ **虚构 SKU + 死链** |
| `/products/wheels/[sku]` | 轮毂详情 | ⚠️ **虚构 SKU** |
| `/products/ev-components` | 新能源三电 | 能力页已建，待审核内容 |
| `/products/custom-aluminum` | 定制铝制品 | 能力页已建，待审核内容 |
| `/products/safety-tires` | 自密封轮胎 | 能力页已建，品牌归属待定 |
| `/capabilities` | 制造与质量 | 已建；`/manufacturing` 已 307 重定向 |
| `/custom-development` | 定制开发流程 | 已建 |
| `/about` | 关于公司 | 已建，联系方式为 PLACEHOLDER |
| `/contact` `/request-a-quote` `/thank-you` | 询盘链路 | 已建；表单 family 选项是虚构 |
| `/resources` `/resources/[slug]` | 资源/文章 | 已建（与 `/insights` 并存） |
| `/support/*`（5 页） | 政策页 | 模板，48 处 PLACEHOLDER，需律师 |

### 2.2 克隆遗留 / 规划明确延期（先不对外公开）

| 路由 | 说明 |
|---|---|
| `/dealers` `/dealers/private-label` | 竞品经销商/贴牌页底本；首期不做 |
| `/fitment` `/fitment/[platform]` | 车型适配页，`suitableVehicles` 全空（0/1349），无数据可发布 |
| `/gallery` `/gallery/finishes` `/gallery/wheels` | 画廊；图片/内容待核 |
| `/tools` `/tools/offset-calculator` | 偏距计算器（公式已验） |
| `/insights` `/insights/[slug]` `/insights/bolt-patterns`(+`[pattern]`) | 与 `/resources` 重复的旧轴；规划保留 `/resources` |

> 注意：`/products/monoblock`、`/products/two-piece`、`/products/off-road` **路由不存在**，但 `productFamilies` 的 `href` 指向它们 → **死链**（见 §4）。

---

## 3. 内容层全景（31 个模块 `src/content/`）

| 类别 | 模块 | 状态 |
|---|---|---|
| 四线新轴 | `product-lines.ts` | ✅ 四线等权，真实卡片图（hasRender: true） |
| 能力页 | `ev-components.ts` `custom-aluminum.ts` `safety-tires.ts` `capabilities.ts` `custom-development.ts` | 已建，内容待审核 |
| 公司/询盘 | `about.ts` `contact.ts` `request-a-quote.ts` `thank-you.ts` `homepage-hero.ts` `home-wheel-strip.ts` `resources.ts` `faq.ts` `site.ts` | 已建；site.ts 联系方式未确认（confirmed: false） |
| 轮毂轴 | `wheel-skus.ts` | 🔴 **虚构数据**（N-100RS 等，16 个假 SKU） |
| 克隆遗留 | `products.ts`（3 个虚构 family）`builds.ts` `finishes.ts` `finish-guide.ts` `wheel-designs.ts` `private-label.ts` `dealer-programs.ts` `process.ts` `gallery.ts` `fitment.ts` `bolt-patterns.ts` `tools.ts` `legal.ts` | 待清理/改造/延期 |
| 契约 | `types.ts` | ✅ 已含真实数据契约 `WheelModel/WheelVariant/WheelProcess/WheelCatalogue`（**未被引用**） |

**PLACEHOLDER 共 53 处，分布在 22 个文件**（`legal.ts` 占大头，`site.ts`、`about.ts`、`products.ts` 等均有）。规则：不删标记、不上线未确认内容。

---

## 4. 克隆遗留与虚构内容（执行前必须先处理的坑）

| # | 问题 | 位置 | 影响 |
|---|---|---|---|
| 1 | **虚构轮毂 SKU 进入 sitemap** | `src/app/sitemap.ts` 引用 `wheelSkus` | 搜索引擎收录 N-100RS 等不存在的产品 |
| 2 | **虚构 family 进入询盘表单** | `contact/page.tsx`、`request-a-quote/page.tsx` → `<InquiryForm families={productFamilies}>` | 客户表单里可选「Monoblock/Two-Piece/Off-Road」——与四产品线不符 |
| 3 | **死链** | `products.ts` family.href → `/products/monoblock` 等（无此路由） | 「About Monoblock」点击 404 |
| 4 | 轮毂目录按虚构三分类分组 | `products/wheels/page.tsx` 按 `productFamilies` 分组渲染假 SKU | 目录与真实型号（1081X/HP12/1413…）完全脱节 |
| 5 | 旧三分类关键词残留 | 20 个文件含 monoblock/two-piece/off-road（内容层为主） | 信息架构仍是竞品切法 |
| 6 | 竞品品牌字符串 | `src`/`public` 中 `2nforged` 引用 | **0 处** ✅（品牌已清，但 AGENTS.md 要求上线前再扫部署产物） |

---

## 5. 产品资料与数据资产

### 5.1 轮毂真实数据（assets/，只读）

| 文件 | 内容 | 与类型契约的匹配度 |
|---|---|---|
| `assets/wheel-data/WHEEL-CATALOG-ALL.json` | **1349 型号 / 3485 变体**；字段含 model、sizes、pcds、offsets、centerBores、finishes、variants、styleName、process、sizeCategory | ✅ 与 `WheelModel` 契约一致（除图片） |
| `assets/wheel-data/*-WHEEL-CATALOG.json`（9 份分册） | 蓝辉原始分册数据（17寸-2、18寸-3、HP、20寸…） | 源数据，含「分册名」噪音 |
| `assets/site-data/generated-wheel-data.json` | **1307 产品 / 3382 变体** | ⚠️ 旧生成产物，字段形状不同（id/name/group/image），**无 process、无 hasImage**，不能直接当现役数据 |
| `assets/site-data/asset-manifest.json` | 2772 条（实际文件扫描） | 图片事实来源 |
| `assets/site-data/image-registry.json` | 253 条，全部指向不存在目录 | 🔴 **不可信**（DEC-018），只作线索 |
| `assets/wheel-images-webp` | 2757 张 | 图源（与 public/images/wheels 重复） |

**关键缺口（已更新）**：两套数据文件里都没有 `hasImage` 字段。但接缝生成器 `scripts/generate-wheel-catalogue.mjs` **已存在**（按 DEC-012 文件名规则匹配 `assets/wheel-images-webp` 计算 hasImage，输出类型化模块）。本日实测修复了生成器一个变量笔误（`renderModule` 引用不存在的 `allModels`）后运行成功，**真实结果为：1349 型号 → 1073 有图可上架 / 276 无图 / 3485 变体 / 图片索引 995 个产品代码**。历史"1018 有图"口径应更正为 **1073**。生成物 `src/content/wheel-catalogue.ts` 已产出（含 `publishedWheelModels`/`wheelModelByCode`），页面尚未接线。

工艺覆盖率：旋压 350 / 低压 142 / 低压+旋压 20 / **未标注 837**（38%）。`styleName` 762 有 / 587 无（部分含 TE37/BBS 等第三方商标，上线前必须改写或移除）。

### 5.2 三家供应商素材（3家公司的PPT资料/，只读）

| 来源 | 内容 | 状态与使用边界 |
|---|---|---|
| 峰徊科技_A版（23 页） | 四产品线总册 + 45 张图 | 公司定位主源；部分图有试用水印；中英混排需专业审校 |
| 航鹏画册_A版（6 页） | 轮毂工艺/检测/34 个型号表 + 50 张图 | 型号规格主源（与蓝辉数据可交叉验证）；厂区图归属需标注「合作制造方」；175 亩 vs 175 acres 单位冲突待核 |
| 洛克项目手册_A版（26 页） | 自密封轮胎原理/测试/营销 + cropped 图 | 2024 年资料，海外政策/认证需重新确认；事故比例、绝对安全措辞**不得**进网页 |

逐页提取稿与图片对象定位（40 条 CSV）已在 `resources/research/2026-10-04-site-plan/`。

---

## 6. 后端模块（src/lib/，3 个域）

| 模块 | 现状 | 缺口（对应任务） |
|---|---|---|
| `inquiry/`（types/store/mailer/validate） | POST 可跑（201/422）；store 是**内存 Map 重启即丢**；mailer 无 key 时 mock，**mock 日志打印客户全文 PII**；`GET /api/inquiries` **无鉴权公开列表** | T03 关泄漏、T14 真实事务存储、T15 邮件 |
| `wordpress/`（types/client/index） | 读取层已建，`mode: "mock"`，**页面未接入** | T05/T06/T09 内容接缝 |
| `i18n/`（cookie 切换 en/zh） | 可用；无独立语言 URL | 首期固定英文 URL，中文后移 |

API 路由仅 `/api/inquiries` 一个（POST + GET）。

---

## 7. 数据 → 类型 → 页面 接缝（现状 vs 目标）

```
现状：
  WHEEL-CATALOG-ALL.json ──(无人读取)──→ types.ts 契约 ──(未引用)──→ 页面
  public/images/wheels(2757) ──(未被引用)──→ 型号卡片
  页面实际读的是 ──→ wheel-skus.ts（虚构 16 SKU）→ sitemap 虚构 URL
  ✅ 生成器 scripts/generate-wheel-catalogue.mjs 已修复可运行
  ✅ 生成物 src/content/wheel-catalogue.ts 已产出（1073 上架 / 276 未上架）

目标（T05/T09/T11）：
  WHEEL-CATALOG-ALL.json + wheel-images-webp 匹配出 hasImage（1073）
      → 生成 wheel-catalogue.ts（✅ 已生成）
      → 目录/详情/筛选改读 publishedWheelModels（尚未接线 ⚠️）
      → 无图型号不进目录不进 sitemap
      → 询盘表单选项换成 productLines（四线）而非虚构 family
```

---

## 8. 结论：按此盘点的执行顺序（建议）

1. **资料确认（T00/T01）**：正式英文名/域名/邮箱、航鹏与洛克授权范围、首发 10–20 型号清单、`hasImage` 重跑——**先冻结业务事实**
2. **基线（T02/T03）**：Git 初始化 + 三项门禁；关闭 `GET /api/inquiries` 泄漏、清除 mock 日志 PII——**低风险可立即做**
3. **数据接缝（T05）**：把 `WHEEL-CATALOG-ALL.json` 接入类型化模块，产出真实 `hasImage`
4. **换真实目录（T07/T11）**：轮毂目录/详情/筛选切真实数据，sitemap 清除虚构 URL，表单选项换四线
5. **能力页内容审核 + 询盘闭环（T12/T14–T16）**：用已批准的 PPT 素材完善三线能力页；询盘真实落库发信
6. **后端与部署（T06/T09/T21–T22）**：WordPress 内容后台、OpenNext 运行时、上线

依赖用户/朋友确认的阻断项（本日盘点新增）：轮毂真实有图口径已重跑为 **1073/1349**（276 无图），可作为上架基数讨论；`generated-wheel-data.json` 与 `WHEEL-CATALOG-ALL.json` 并存需定唯一事实源（建议后者，生成器已以此为源）。
