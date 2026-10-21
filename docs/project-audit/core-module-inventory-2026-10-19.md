# 核心代码模块审计索引（2026-10-19）

本页是 2026-10-19 的代码审计快照，供 Notion 增量同步和核对使用；当前架构正本仍为 [`../audit/CURRENT_ARCHITECTURE.md`](../audit/CURRENT_ARCHITECTURE.md)。基线为 `961762e` 加当前未提交工作树，不能等同于已发布版本。

| 领域 | 核心模块 | 代码位置 | 稳定 ID |
|---|---|---|---|
| 内容接缝 | 类型化内容契约 | `src/content/types.ts` | `CORE-CONTENT-TYPES` |
| CMS 接入 | WordPress 访问客户端 | `src/lib/wordpress/client.ts` | `CORE-WP-CLIENT` |
| CMS 接入 | 首页内容与模块适配器 | `src/lib/wordpress/homepage.ts` | `CORE-WP-HOMEPAGE` |
| CMS 接入 | Insights 文章适配器 | `src/lib/wordpress/insights.ts` | `CORE-WP-INSIGHTS` |
| CMS 接入 | 页面内容适配器 | `src/lib/wordpress/pages.ts` | `CORE-WP-PAGES` |
| CMS 接入 | 页面响应结构校验 | `src/lib/wordpress/pages-schema.ts` | `CORE-WP-PAGE-SCHEMA` |
| 发布与语言 | 多语言发布判定 | `src/lib/i18n/publication.ts` | `CORE-LOCALE-PUBLICATION` |
| 发布与语言 | 多语言入口代理 | `src/proxy.ts` | `CORE-LOCALE-PROXY` |
| SEO | 元数据构建 | `src/lib/seo/metadata.ts` | `CORE-SEO-METADATA` |
| 轮毂公开 | 发布闸门 | `src/lib/wheels/publication.ts` | `CORE-WHEEL-PUBLICATION` |
| 轮毂公开 | 公开目录服务 | `src/lib/wheels/public-catalogue.ts` | `CORE-WHEEL-CATALOGUE` |
| 询盘 | 入口防护 | `src/lib/inquiry/guard.ts` | `CORE-INQUIRY-GUARD` |
| 询盘 | 请求结构校验 | `src/lib/inquiry/schema.ts` | `CORE-INQUIRY-SCHEMA` |
| 询盘 | API 写入边界 | `src/app/api/inquiries/route.ts` | `CORE-INQUIRY-API` |
| 询盘 | 轮毂规格绑定 | `src/lib/wheels/inquiry-binding.ts` | `CORE-WHEEL-BINDING` |
| WordPress | 询盘持久化与发件箱 | `local-wp/mu-plugins/fenghuai-inquiries.php` | `CORE-WP-INQUIRIES` |
| WordPress | 轮毂编辑与公开接口 | `local-wp/mu-plugins/fenghuai-wheel-authoring.php` | `CORE-WP-WHEEL-AUTHORING` |
| 契约验证 | 跨端一致性脚本 | `scripts/verify-contract-parity.mjs` | `CORE-CONTRACT-PARITY` |
| 运维 | 备份脚本 | `scripts/backup/backup.sh` | `CORE-BACKUP` |
| 运维 | 可用性探针 | `scripts/monitor/uptime-probe.sh` | `CORE-UPTIME-PROBE` |

以上 20 条已写入 [Notion「页面与模块」数据库](https://app.notion.com/p/841a05e0dda44e32b27a053db959c077)，类型为「核心代码模块」。每条包含职责、来源、代码路径、哈希、相关功能和待核验事项；映射见 [`notion-sync-manifest.json`](notion-sync-manifest.json)。

同日对这 17 条原有记录逐条补入「关键代码与解析」：当前工作树的短代码片段、精确文件行号、中文职责解释、数据流和边界/核验说明。17 条均从 Notion 读回确认且该小节只出现一次；17 条记录中的源内容哈希也与当前文件的 SHA-256 一致。代码片段是教学用摘录，不代表相关代码已提交、部署或通过业务验收；完整实现仍以仓库源码为准。

随后新增首页、Insights 与询盘 API 三个链路入口模块，并在首页、轮毂目录、轮毂详情、报价询盘和 Insights 五条 Notion 页面记录补入「页面与代码模块对照」：页面入口摘录、模块原生引用、数据流与测试局限。五条页面及三个新增模块均从 Notion 读回确认。

## 第二批页面代码对照计划（2026-10-19）

目标：在现有页面记录中补充 12 条尚无代码对照、且对转化、产品公开、内容、法律或工具风险有解释价值的页面，不新建平行页面库。

1. **转化与回执**：`PAGE-CONTACT`、`PAGE-THANK-YOU`。说明表单内容来源、写入边界、回执校验与索引限制。
2. **产品入口与产品线**：`PAGE-PRODUCTS`、`PAGE-PRODUCTS-WHEELS-FORGED`、`PAGE-PRODUCTS-WHEELS-FLOW-FORMED`、`PAGE-PRODUCTS-CUSTOM-ALUMINUM`、`PAGE-PRODUCTS-EV-COMPONENTS`。区分内容页、公开产品集合和真实规格审批。
3. **内容、法律与工具**：`PAGE-INSIGHTS-SLUG`、`PAGE-SUPPORT-PRIVACY`、`PAGE-TOOLS-OFFSET-CALCULATOR`。记录动态详情、预览/法律边界和计算公式待核实事项。
4. **合作与能力**：`PAGE-DEALERS`、`PAGE-CAPABILITIES`。解释内容来源、撤回 FAQ 与制造能力主张的审核边界。

每页先核对 Notion 原文和当前源码，再只追加一段入口代码、精确行号、直接依赖模块、数据流和既有测试的证明范围；逐页读回，避免重复写入。`/manufacturing` 仅作兼容重定向，本批不按内容页扩写。完成后更新本索引与既有任务记录；不改业务代码或验收状态。

**执行结果：12/12 完成。** 12 条 Notion 页面均只新增一次「页面与代码模块对照」；逐条读回确认源码行号、代码块、说明与待办引用。重点保留三个未决事实：`/products` 后续旧区块待整理、偏距计算器公式与函数不一致、`/support/privacy` 法律文案未通过专业审核。原有 5 条关键页面加本批 12 条，此阶段累计 17 条页面拥有代码对照；当时其余页面尚未覆盖。

## 全路由代码对照收尾（2026-10-19）

在上述 17 条之外，再核对并补齐其余 16 条页面记录：公司与合作 3 条、产品/孔距/工具 4 条、法律支持 4 条、兼容重定向 5 条。每条均追加源码行号、入口代码、中文职责解析、核心模块引用及待核验边界；Notion 逐条读回，16/16 均只出现一段本批对照。

至此，`PAGE-*` 记录 **33/33** 均有且仅有一段「页面与代码模块对照」及代码块；核心代码模块仍为 **20** 条。`/manufacturing`、`/resources`、`/resources/[slug]`、`/resources/bolt-patterns` 是永久重定向，`/resources/bolt-patterns/[pattern]` 的当前实现是临时 `redirect()`，不能误称 308。五条旧路由只解释兼容逻辑，不计作五项独立业务能力。代码映射覆盖率不代表内容批准、测试通过、业务验收或上线就绪。

后续按风险给 7 条页面补充「测试—待办—审批证据链」：轮毂目录、轮毂详情、报价、联系、Insights 详情、隐私和偏距计算器。新增适用的原生关系并保留既有关联；报价页原有关联测试不直接覆盖真实询盘，已在正文注明局限。没有专属测试的页面保留空测试关系，并写清证据缺口与验收出口。7/7 从 Notion 回读，正文各出现一次，关系数量与预期一致。现有测试和审批状态未改；技术文章仅增加导航与教学示意图，不复制状态正本。

架构关系、发布闸门和询盘链路见 [Notion 架构图解](https://app.notion.com/p/3fe8de6ee7d28177b86bd454700482e6)。管理层信息图源文件为 [SVG](../../outputs/project-audit/release-gates-2026-10-19.svg)，交付图片为 [PNG](../../outputs/project-audit/release-gates-2026-10-19.png)；图中状态仅代表审计快照，不是完成率或上线批准。
