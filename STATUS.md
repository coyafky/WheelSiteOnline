# 项目状态

## 2026-10-04 当前状态

**本轮完成：在既有规划（5 份文档 + T00–T23 任务卡 + 视口规格）基础上进入执行阶段——产出 [代码与资产盘点报告](outputs/site-launch-plan/05-code-and-assets-inventory.md)；T02 工程基线三项门禁全绿（修复 sitemap 损坏尾段、wheel-skus 缺失函数、目录生成器两处错误）；T03 询盘泄漏关闭并经生产实例运行时验证（GET 404/401、POST 503、页面 200）；真实轮毂口径重跑：1349 型号 → **1073 有图上架 / 276 无图**（历史"1018"更正）；Git 基线建立并本地提交（推送远程进行中）；本地 WordPress 实验场上线（Docker：WP 8081 + MySQL 33061，媒体库已导入 157 张 PPT 图片，REST API 正常）。部署与发信仍未执行（DEC-028 本地先行）。**

用户已确认：公司按 PPT 为深圳峰徊科技有限公司；与蓝辉为同一股东名下不同公司；四线平行、B/C 客户；海外英文优先；目标 2026-11-04；整体运行维护约 1000 元/月。当前重点由既有首页微调转为首发范围与真实产品/询盘链路。

交付入口：

- [总计划与月预算](outputs/site-launch-plan/README.md)
- [数据库与询盘契约](outputs/site-launch-plan/02-data-and-inquiry-design.md)
- [素材分配](outputs/site-launch-plan/03-content-and-assets.md) 与 [40 条 PPT 图片对象定位](resources/research/2026-10-04-site-plan/ppt-image-locations.csv)
- [逐页逐视口施工图](PAGE-SPECS/2026-10-04-launch-viewport-spec.md)
- [开发任务卡与 DeepSeek 提示模板](outputs/site-launch-plan/04-task-cards.md)

### 新核查到的发布阻断项

1. `GET /api/inquiries` 无鉴权返回记录；询盘 Map 重启即丢。生产前必须关闭公开读取并完成真实持久化。
2. 邮件已有 Resend HTTP 调用，不能再记为“没有任何真实发信代码”；但 accepted 被当 delivered、缺重试/回调、模拟日志输出个人数据仍待修。
3. WordPress 读取函数尚未接入页面内容；不能声称只加 URL 就完成全站内容后台。
4. 蓝辉主表 1349 个 models、生成表 1307 条 products、实体图 2757 张；历史有图 1018 的口径需重跑匹配，不能直接当可销售授权数量。
5. PPT/PDF 素材有试用水印、规格表列顺序问题、面积单位冲突及未经核准的数字；逐项处理，不直接批量上线。

### 下一步

1. **T00/T01 业务事实冻结**：正式域名/邮箱、航鹏与洛克授权范围、首发 10–20 个型号（从 1073 有图型号中选）、PPT 水印/单位/表格歧义处理。
2. **WP 文案录入**：把 3 个 PPT 的模块内容（文案+图片关联）录入本地 WP 实验场（媒体已就位，逐模块建页建文，标注 DRAFT/待审核）。
3. **数据接缝接线**：目录/详情/筛选改读 `wheel-catalogue.ts`（T07/T11），sitemap 清除虚构 URL（T18）。
4. **T04 运行时样机**：本地验证 OpenNext/数据库/邮件，锁定部署层与费用，再谈远程。
5. 完成 Git 推送并确认远程仓库可克隆。

未决：正式域名/邮箱、目标国家优先级、C 端交付与安装/售后、供应方与图权逐项确认、首发批次、服务商与实际费用/恢复能力。计划中的预算数字是分配上限，不是已核价报价。

收尾：旧 PROJECT 已归档；项目说明/架构/决策已同步（新增 DEC-027/028）；原资料只读，核验输出位于 resources；本轮执行产物（盘点报告、任务卡流转、本地 WP 编排）已归档；应用 lint/typecheck/build 已三绿；Git 已初始化、提交并关联远程（推送进行中）；本地 WordPress 实验场数据不入库（gitignore）。

## 历史快照：2026-10-01（以下不是本轮实测）

Last Updated:
2026-10-01 21:30

## Current Phase

**阶段 3：文档三层建立 + 首页结构重构完成，进入「视口语义对齐 + 规格轴心改造」**

这一阶段最大的变化**不是代码，是「怎么记录」**：一日之内多出**三个文档层**
——`DESIGN.md`（设计正本）、`PAGE-SPECS/`（页面施工图）、
`ARCHITECTURE/` 下三条非轮毂产品线的页面架构。
站点也随之从 **26 个页面路由扩到 33 个**，首页 Hero 完成结构级拆分。

```
前端克隆骨架  █████████░  90%  竞品痕迹已清；但 primaryNav 仍是旧结构（见 Blocker）
资产层        ██████████ 100%  1349 型号 / 2757 图 / 语料库 / 技能库
类型层        ████░░░░░░  40%  ⚠️ 仍缺规格字段，接不住资产层（未动）
内容后端      █░░░░░░░░░  10%  Headless WP 读取层已建（mock 模式），未接真站
部署层        ░░░░░░░░░░   0%  OpenNext 未接入，仓库里零依赖零配置
询盘系统      ████░░░░░░  40%  API 路由已可跑（POST 201 / 422），DB 与邮件仍是 mock
文档与设计层  █████████░  90%  DESIGN / PAGE-SPECS / page-architecture 三线已成，轴心待统一
```

## Current Focus

**从「能跑起来」转向「按视口原则把页面切对」。**

`DESIGN.md` §0.5 确立了一条全站第一原则 —— **一个视口 = 一个核心问题**
（1 主信息 + 1 主视觉 + 1 主行动 + 0–2 次行动），并由此推出
**★ 合并或删除律**（两个连续 Section 没回答两个不同问题 → 合并或删除）。

首页 Hero 已经按这条原则动过刀（品牌独占一屏、四张产品卡移出），
但**页面其余部分和新规格尚未系统对齐** —— 这是当前正在做的事。

## Completed

- ✅ **前端克隆骨架**：以竞品 [2nforged.com](https://2nforged.com) 为蓝本，
  逆向重建为 Next.js 16 App Router，26 个路由全部静态预渲染
- ✅ **内容层结构**：21 个类型化内容模块（`src/content/*.ts`），契约在 `types.ts`
- ✅ **两块画廊**：`/gallery`（按车型）与 `/gallery/wheels`（按设计）刻意分开
- ✅ **偏距计算器**：可用，公式已对独立基准验证
- ✅ **空白页事故修复**：动效系统 fail-hidden 缺陷已定位并修复
  （详见 `docs/BLANK-PAGE-AUDIT.md`）
- ✅ **竞品结构侦察**：`docs/research/2nforged-reference.md`（UI 蓝本记录）
- ✅ **询盘系统架构定稿**：`docs/plans/inquiry-system-architecture.md`
- ✅ **对标架构调研**：`docs/research/next-wp/` 四篇分册
- ✅ **项目档案层**：四个根文件 + `inbox/` `resources/` `outputs/` `work/`
- ✅ **架构规范**：`ARCHITECTURE.md`（7 层模块模型 · 26 KB）
- ✅ **架构文档集**：`ARCHITECTURE/`（14 份）
  - `page-architecture/2nforged-page-inventory.md` —— 竞品 **12 页 / 88 section** 完整清单
  - `page-architecture/content-design-and-new-pages.md` —— **内容设计法 + 新增页决策**
  - `page-architecture/README.md` —— 我们的页面架构（九段式模板）
  - `page-architecture/wheel-detail-page.md` —— ★★ **单车品页（1018 页的模板）**
  - `page-architecture/fitment-pages-plan.md` + `wheel-browsing-and-fitment-pages.md`
    —— 车系适配页 + 浏览维度（对口 WheelPros）
  - `page-architecture/wheel-catalog-page.md` —— ★★ **轮毂目录页（1018 + 7 组筛选器）**
  - `page-architecture/dealers-page.md` —— ★★ **经销商页（竞品 14 段底本）**
  - `page-architecture/private-label-page.md` —— ★★ **贴牌页（竞品 16 段底本）**
  - `page-architecture/resources-hub-page.md` —— ★★ **资源中心（12 选题）**
  - `page-architecture/about-page.md` —— ★★ **关于我们（工厂信任页）**
  - `page-architecture/contact-page.md` —— ★★ **联系页（全站最短 · 连着后端）**
  - `page-architecture/private-label-page.md` —— ★★ **贴牌页（竞品 16 段底本）**
  - `tech-architecture/README.md` —— 数据流与类型契约
- ✅ **真实产品数据到位**：`assets/`（72 MB / 2810 文件）—— **1349 型号 /
  3485 变体 / 2757 张图**，含真实 PCD / ET / CB / 尺寸
- ✅ **文案底座到位**：中英内容语料库 43 KB（162 条术语 + 60 词汇 + 40 文案句）
- ✅ **技能库到位**：`SKILLS/` 20 个技能（含 `skills-lock.json` 来源记录）
- ✅ **门禁实测通过**：`typecheck` / `lint` / `build` 三绿
  （已把 `SKILLS/` `assets/` `resources/` 加入 eslint ignore —— 它们是第三方
  资产与只读数据，不是我们的源码）

### 2026-10-01 新增（本日 · 按类别）

**① 文档层（本日最大结构变化）**
- ✅ **`DESIGN.md` 设计正本**（项目根）—— 从已跑起来的页面上**反推好设计**，
  性质是**沉淀，不是禁令清单**。含 **§0.5 视口驱动设计（全站第一原则）**、
  §1 视觉基调（深色 = 页首专用 / `forge-soft` 是段级 token / `.eyebrow` 是
  受控词汇表 / fail-visible 三层保护）、§3 CTA 四级体系、
  §6 **已知裂缝 6 处**（记录，不擅自改）。见 `DEC-019` `DEC-020`
- ✅ **`PAGE-SPECS/` 页面施工图模块** —— 按路由命名，说「照着搭什么」。
  实测目录内 **22 个文件**（3 份公共文件 + `index.md` 总表 + 18 份页面规格）。
  `_components.md` 收录现有组件 + 全部设计 token + **图片资产真相**；
  `_viewport-audit.md` 是视口合规审查报告（83 个视口 / 24 条合并建议）。见 `DEC-015`
- ✅ **`ARCHITECTURE/page-architecture/` 三条非轮毂产品线页面架构**：
  `ev-components-page.md` / `custom-aluminum-page.md` / `safety-tires-page.md`
  —— 这三页**没有竞品底本**（竞品是纯轮毂公司），结构刻意不同。见 `DEC-016` `DEC-017`

**② 代码层：三个新库 + 第一个 API 路由**
- ✅ **`src/lib/wordpress/`**（`types` / `client` / `index`）—— Headless WP
  读取层，`mode: "mock"`；**切 live 只改一个文件**（`client.ts`）
- ✅ **`src/lib/inquiry/`**（`types` / `store` / `mailer` / `validate` / `index`）
  —— 询盘域，三条纪律：**先落库再发信** / **存快照不存引用** / **上下文随询盘走**
- ✅ **`src/lib/i18n/`**（`types` / `dictionaries/{en,zh,index}` / `index` / `use-t`）
  —— 中英双语层。**关键结构约束**：`index.ts` 用 `next/headers`（服务端专用），
  `use-t.ts` 只能从 `dictionaries/index.ts` 导入
- ✅ **`src/app/api/inquiries/route.ts`** —— 本项目**第一个 API 路由**，
  实测 POST 返回 **201**、校验失败返回 **422**
- ✅ **`src/components/` 新组件**：`home/hero/`（`home-hero` / `hero-background` /
  `hero-product-card` / `hero-product-grid`）、`language-switcher`、
  `quote-context-bar`、`sections/page-hero`，以及三条能力线共用的
  `part-group-cards` / `boundary-table` / `param-table` / `mechanism-steps` /
  `input-type-cards` / `process-diagram` / `faq-accordion` / `route-block` /
  `data-notice` 等

**③ 页面路由（实测 26 → 33 个 `page.tsx`）**
- ✅ 三条非轮毂产品线：`/products/ev-components`、`/products/custom-aluminum`、
  `/products/safety-tires`
- ✅ `/capabilities` —— 由 `/manufacturing` **改名**，旧路由保留并 **307 重定向**
- ✅ `/custom-development`、`/request-a-quote`、`/thank-you`

**④ ★ 首页 Hero 结构重构**
- ✅ **Hero 拆分**：品牌独占一屏（回答「我们是谁」），四张产品卡**移出**成为
  独立视口。原因：**Hero 里 7 个出口挤一屏**（4 卡 + 2 CTA + 导航），
  上限是 1+2=3。见 `DEC-022`
- ✅ **`ProductShowcase` 改造**：原「三宫格锻造轮毂」（**竞品切法**）→
  **四条产品线**，首页不再自相矛盾
- ✅ 新增 token **`--fh-hero`（`#05070a`）** —— 收编长期未 token 化的第 4 阶深色
- ⚠️ 首页现结构：`HomeHero`（我们是谁）→ `TrustStrip` → `ProductShowcase`
  → `GalleryBand` → `DealerCta`。**后三段尚未按视口原则复核**（见 In Progress）

**⑤ 图片资产真相更正**
- ✅ **`image-registry.json` 的 253 条全部指向 `assets/image/...`，该目录不存在**
  → 全数标记 `no-asset`；索引从此**只作线索，不作依据**。见 `DEC-018`
- ✅ 新建 **`assets/site-data/asset-manifest.json`** —— 按**实际文件扫描**生成，
  实测 **2772 条**（2757 轮毂图 + 15 preview-media）
- ✅ 5 个 jpg/png 移入 `assets/_non-webp-archive/`（站点**只留 webp**）
- ✅ 新增图片落地 `public/images/`：`hero/`（3 张汽车背景）、`cards/`
  （4 张产品线卡）、`wheels/`（2757）、`preview/`（15）

**⑥ i18n**
- ✅ 语言切换用 **cookie（`fh-locale`）**，**不是 `[locale]` 路由段**
- ⚠️ **代价：中英文没有独立 URL，SEO 上不利于双语收录** —— 已知取舍
- ✅ header 的 `Request Quote` 走 i18n 并改指 `/request-a-quote`
- ✅ footer 从「竞品三分类（Monoblock / Two-Piece / Off-Road）」改为
  **四条产品线**；`site.name` 从 `"Fenghuai Forged Wheels"` 改为 `"Fenghuai"`

## In Progress

三项，皆因 `DESIGN.md §0.5` 确立后浮出：

1. **首页后三段视口复核** —— `TrustStrip` / `GalleryBand` / `DealerCta` 尚未
   按「一视口一核心问题 + 合并或删除律」复核；Hero 已改，其余三段待议。
2. **`primaryNav` 对齐** —— header 下拉仍是旧结构（Products 下拉还是
   `All Wheels / Monoblock / Two-Piece / Off-Road`，**没有三条能力线**）；
   **footer 已改而 header 未改，两边不一致**（详见 Blockers）。
3. **`PAGE-SPECS/` 轴心改造** —— `DESIGN.md §0.5.6` 已声明规格轴心应改为
   **「视口 → 段 → 组件 → 内容」**，但 PAGE-SPECS 现有规格仍是
   「第 N 段」写法，**文档与规格当前不一致**，需改造。

## Next Actions

按优先级排序。

0. **★ 补 `WheelSku` 规格字段（P0，一切的前置，仍未动）** —— 实测 `types.ts` 的
   `WheelSku` **没有** size / pcd / offset / centerBore / process / variant。
   **资产层比类型层更完整** —— 真实数据有，类型接不住。
   不补这一步，1349 个型号无法进 SKU 页、无法做筛选、询盘无法带规格快照。
   见 `ARCHITECTURE.md` §4.3。
0b. **★ 三个竞品结构性缺口要补（P0，都是竞品没有的）** ——
   `content-design-and-new-pages.md` §2.2 表 B：
   - **N2** `/products/wheels/[model]` **单品页 × 1018** —— 竞品把整个目录压一页，**没有单品页**
   - **N3** `/request-a-quote` **独立询盘页** —— ✅ **已建**（本日）
   - **N4** `/thank-you` **提交成功页** —— ✅ **已建**（本日）

1. **完成 In Progress 三项** —— 首页后三段视口复核 → `primaryNav` 对齐 →
   `PAGE-SPECS/` 轴心改造（前一项的结论决定后一项怎么写）。**优先级最高的
   是 `primaryNav` 对齐**：它是**已上线的不一致**，而另两项是文档一致性。
2. **前端业务改造（P0，未完成）** —— 竞品品牌痕迹已清，但
   **信息架构仍未重建为四条平行产品线**：`src/content/products.ts` 的
   `productFamilies` **仍是 3 个虚构系列**（`monoblock` / `two-piece` / `off-road`），
   `/products/[slug]` 仍按它们出页。见 `ARCHITECTURE.md` §6.2。
   技能用 `SKILLS/redesign-existing-projects`。
3. **OpenNext 落地** —— 选平台（Cloudflare Workers / AWS Lambda / 自托管）→
   装依赖 → 改配置 → 重做 `Dockerfile` / `docker-compose.yml`（现在还是克隆
   模板默认值）→ 跑通部署
4. **内容层接 WordPress** —— `src/content/*.ts` → REST API fetcher
   （`src/lib/wordpress/` 已就位，等切 `mode: "live"`）
5. **`PLACEHOLDER` 清查**：实测 `src/content/` 共 **98 处**（`legal.ts` 占 48 处）
6. **询盘系统实装**：API 路由已可跑（mock），待接真实 DB + Resend

## Blockers

| 阻塞 | 影响 |
|---|---|
| **`primaryNav` 仍是旧结构** | header 与 footer 不一致；用户看到的产品入口仍是竞品三分类 |
| **三条非轮毂线大量数据待丰怀确认** | EV 的 IATF 16949 认证 / 铝制品的「不做清单」/ 轮胎的品牌归属 |
| **安全轮胎页品牌归属未定**（「洛克 LOAKE」「航鹏」是第三方品牌） | **归属确认前该页不上线**（`DEC-017`） |
| **`suitableVehicles` 全空**（0 / 1349） | **车型适配页无数据可发布**，`/fitment/*` 只能保持待确认态 |
| 四条产品线中 **三条无图** | 产品中心那三条线只能先出能力页 |
| OpenNext 平台未定 | 部署与询盘运行时 |

**已大幅缓解**：资产到位后，「没有丰怀数据」这个阻塞基本解除 ——
**轮毂这条线是全站数据最完整的一条**（1349 型号 / 2757 图 / 完整规格，随时可开工）。

## Open Questions

**✅ 已答（本日新增）**：
- ~~设计规范该是「规范」还是「沉淀」？~~ → **沉淀**。从已跑页面反推，不建禁令清单（`DEC-019`）
- ~~首页 Hero 里能放几个出口？~~ → **上限 3**（1 主行动 + 2 次行动）；品牌与产品线必须分属两个视口（`DEC-022`）
- ~~图片索引可信吗？~~ → **不可信**。`image-registry.json` 的 253 条指向不存在的目录，改以实体文件为准（`DEC-018`）

**✅ 更早已答**：
- ~~丰怀的真实产品线是什么？~~ → **四条平行线**：轮毂 / EV三电壳体 / 铝制品定制 / 自修复安全轮胎
- ~~规格字段有无真实数据？~~ → **有，且完整**。1349 型号 3485 变体带 PCD/ET/CB/尺寸

**⏳ 待答**：

| # | 问题 | 影响 |
|---|---|---|
| 1 | **OpenNext 落到哪个平台？**（Cloudflare Workers / AWS Lambda / 自托管 Node） | 决定部署配置形状与询盘运行时 |
| 2 | `sizeCategory` 里的 `17寸-3`/`18寸-2` 是**真实尺寸**还是**源分册名**？ | 轮毂筛选器设计 —— 见 `ARCHITECTURE.md` §3.2 |
| 3 | `styleName` 缺失的 **587 个**型号如何归类？ | 设计系列页（只有 762 有分类） |
| 4 | `suitableVehicles` 全空 —— 工程能否补齐？ | 车型适配页能否上线 |
| 5 | `process` 未标注的 **837 个**能否从其他字段推断？ | 工艺筛选（只有 512 有标注） |
| 6 | 语料库里「**航鹏**」「**洛克**」是第三方品牌 —— 内容可否用于本站？ | 文案可用范围（法务，关联 `DEC-017`） |
| 7 | 四条线中三条无图，何时提供资产？ | 产品中心三条线能否完整上线 |
| 8 | 「无头 WordPress」由谁托管？ | 整个内容层的前提 |
| 9 | i18n 是否要从 cookie 迁到 `[locale]` 路由段？ | **SEO 双语收录**（cookie 方案没有独立 URL，见本日 i18n 条目） |

## Recent Changes

- **2026-10-01（本日）** — **详见 `CHANGELOG.md` `[0.1.0]`**。要点：
  - **文档三层建立**：`DESIGN.md`（设计正本，含 §0.5 视口驱动设计 =
    全站第一原则）、`PAGE-SPECS/`（21 份施工图 + 3 份公共文件）、
    `ARCHITECTURE/page-architecture/` 三条非轮毂产品线
  - **代码三层新增**：`src/lib/{wordpress,inquiry,i18n}` +
    `src/app/api/inquiries/route.ts`（第一个 API 路由）
  - **页面 26 → 33**：三条产品线 + `/capabilities`（改自 `/manufacturing`，
    307 重定向）+ `/custom-development` / `/request-a-quote` / `/thank-you`
  - **首页 Hero 拆分**：品牌独占一屏，产品卡移出；`ProductShowcase` 改四条线
  - **图片资产更正**：`image-registry` 253 条全指向不存在的目录 → 改以
    `asset-manifest.json`（实测 2772 条）为准（`DEC-018`）
  - 新增决策 **`DEC-015` ~ `DEC-022`** 共 8 条
- **2026-10-01 17:10** — **资产与技能到位，建立架构规范**：
  详见 `CHANGELOG.md` 之上一条记录与 `ARCHITECTURE.md`。
- **2026-10-01** — **纠正项目状态的过度表述**：此前文档把前端描述为「结构
  完整原型」，未说明它是竞品克隆。现已更正为「三层都还没做完」，并新增
  **DEC-009（OpenNext）** 与 **DEC-010（克隆来源与合规边界）** 两条决策。

## Notes on the repository state

- **实际技术栈的现状（实测，别信推测）**：
  - `package.json` 依赖只有 10 个（base-ui / cva / clsx / lucide / next /
    react / react-dom / shadcn / tailwind-merge / tw-animate-css）
  - **无任何 `@opennextjs/*`、无 `wrangler`、无 DB/邮件依赖**
  - `next.config.ts` = `output: "standalone"`
  - `docker-compose.yml` / `Dockerfile` = **克隆模板默认值**
    （镜像名 `ai-website-cloner:latest`，Node 24.14.1-slim）
  - `src/app/api/` **已存在**（`inquiries/route.ts`，本日建立）
- **本仓库还不是 git 仓库。** 根目录无 `.git`（实测 `git rev-parse` 报错）。
- **`README.md` 已改写**为本项目自己的文本（不再是克隆模板遗留）；
  `CONTRIBUTING.md` 仍待整理。
- **`docs/` 早于项目规范存在**，不被本规范重构。技术文档归 `docs/`，
  项目档案归根目录四个文件。
