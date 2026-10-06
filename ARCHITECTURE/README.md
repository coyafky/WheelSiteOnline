# 架构文档导航

更新：2026-10-05。本目录是架构阅读入口，系统结构正本位于根目录 [`ARCHITECTURE.md`](../ARCHITECTURE.md)。

## 推荐阅读顺序

| 顺序 | 文档 | 回答的问题 |
|---:|---|---|
| 1 | [`PROJECT.md`](../PROJECT.md) | 网站服务谁、首发做什么、有哪些业务边界 |
| 2 | [`STATUS.md`](../STATUS.md) | 当前已经做到哪里、哪些事项仍阻断上线 |
| 3 | [`ARCHITECTURE.md`](../ARCHITECTURE.md) | 模块如何切分、数据怎样流动、哪些依赖被禁止 |
| 4 | [`PAGE-SPECS/README.md`](../PAGE-SPECS/README.md) | 每条路由按哪些视口和内容模块施工 |
| 5 | [`02-data-and-inquiry-design.md`](../outputs/site-launch-plan/02-data-and-inquiry-design.md) | WordPress 内容模型、询盘表和事务发件箱如何设计 |
| 6 | [`04-task-cards.md`](../outputs/site-launch-plan/04-task-cards.md) | 按什么依赖顺序实现和验收 |
| 7 | [`DECISIONS.md`](../DECISIONS.md) | 这些选择为什么成立、何时定案 |

## 架构分区

现行架构集中在一份总纲中，按章节拆分阅读：

| 分区 | 总纲章节 | 相关施工或设计 |
|---|---|---|
| 业务与主体 | §1–2 | `PROJECT.md`、About/Home Page SPEC |
| 模块与接缝 | §3–4 | `src/content/`、`src/lib/wordpress/`、`src/lib/inquiry/` |
| 内容、证据与媒体 | §5 | 内容素材分配、各产品线 Page SPEC |
| 产品与发布 | §6 | 轮毂目录、详情、旋压和锻造 Page SPEC |
| 页面与 SEO | §7 | `PAGE-SPECS/` 现行规格 |
| 询盘 | §8 | 询盘页 Page SPEC、数据与询盘设计 |
| 运行时与部署 | §9–10 | 首发计划、DEC-005、DEC-009、DEC-024、DEC-028 |
| 仓库与实施 | §11–13 | `STATUS.md`、任务卡和 `AGENTS.md` |

## 状态词

- **已实现**：当前仓库代码、数据或本地运行结果可以验证。
- **已设计**：接口、数据流或验收条件已经确定，代码仍需完成。
- **待确认**：依赖业务授权、供应商材料、费用或运行时选择。
- **历史**：已被现行正本替代，只用于追溯。

阅读架构时必须保留这些状态。WordPress 客户端存在不等于页面已经接入 WordPress；询盘 API 返回 201 不等于有生产数据库；`output: "standalone"` 不等于 OpenNext 已部署；图片存在不等于已获发布授权。

当前已接入 WordPress 批量媒体适配器并完成页面验收的公开路由为：首页、`/about`、`/capabilities` 与 `/products/safety-tires`。自密封轮胎页的 8 mm 数据以结构化 `supplier-stated` 证据保存，取得具体型号报告前不会升级为已验证结论。

## 页面规格入口

- [首页](../PAGE-SPECS/homepage.md)
- [轮毂目录](../PAGE-SPECS/wheel-catalog.md)
- [轮毂详情](../PAGE-SPECS/wheel-detail.md)
- [旋压轮毂](../PAGE-SPECS/flow-formed-wheels.md)
- [锻造轮毂](../PAGE-SPECS/forged-wheel-customization.md)
- [新能源三电铝制品](../PAGE-SPECS/ev-components.md)
- [定制铝制品](../PAGE-SPECS/custom-aluminum.md)
- [自密封轮胎](../PAGE-SPECS/self-sealing-tires.md)
- [项目询盘](../PAGE-SPECS/request-a-quote.md)
- [英文首发总规格](../PAGE-SPECS/2026-10-04-launch-viewport-spec.md)

## 历史文档

2026-10-01 的逐页架构、竞品拆解、经销商/贴牌/适配方案和旧技术架构位于 [`archive/2026-10-01-document-baseline/ARCHITECTURE/`](../archive/2026-10-01-document-baseline/ARCHITECTURE/README.md)。其中的设计思路可供追溯，旧路由、数量和业务假设不得覆盖当前正本。

新的专题架构文件只有在总纲不足以表达、且当天有实际内容时才创建；创建后同步更新本页、`DOCUMENTATION.md`、`STATUS.md`，架构决策同时记录到 `DECISIONS.md`。
