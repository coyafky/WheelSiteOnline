# 项目文档导航

更新：2026-10-11。本文件是项目文档的唯一入口，用来区分现行正本、执行记录、研究材料与历史快照。

## 先读什么

| 顺序 | 文档 | 作用 | 状态 |
|---:|---|---|---|
| 1 | [PROJECT.md](PROJECT.md) | 业务范围、目标、约束 | 现行正本 |
| 2 | [STATUS.md](STATUS.md) | 当前进度、阻断项、下一步 | 现行正本，持续更新 |
| 3 | [ARCHITECTURE.md](ARCHITECTURE.md) | 模块边界与数据流 | 现行架构总纲 |
| 4 | [首发总计划](outputs/site-launch-plan/README.md) | 一个月排期、预算、部署与验收 | 现行执行计划 |
| 5 | [首发页面规格](PAGE-SPECS/2026-10-04-launch-viewport-spec.md) | 逐页、逐视口内容与素材 | 唯一现行页面施工正本 |
| 5a | [Astryx Neutral 暖白界面规格](PAGE-SPECS/astryx-neutral-global.md) | 跨页视觉与通用控件，不改变内容门槛 | 本地 P5 验收完成 |
| 5a.1 | [现行设计正本](DESIGN.md) | 暖白令牌、组件选用、无浮动询盘与验收规则 | 现行；旧版已归档 |
| 5b | [Astryx P5 最终交接与商用 SEO 下一步](outputs/reports/33-astryx-p5-final-commercial-seo-handoff-2026-10-11.md) | P0–P5 本地验收与下一阶段 No-Go 门槛；[原执行计划](outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md)供追溯 | 现行交接 |
| 6 | [当前任务](work/active/2026-10-04-launch-phase-0-baseline.md) | 本阶段已经完成和仍待处理的事项 | 进行中 |

## 文档模块

| 目录 | 放什么 | 不放什么 |
|---|---|---|
| `PAGE-SPECS/` | 当前页面施工规格与入口 | 被替代的旧规格 |
| `ARCHITECTURE.md` / `ARCHITECTURE/` | 当前模块边界、数据流与架构入口 | 当前进度与历史详细设计 |
| `outputs/` | 可以交付或评审的计划、清单、素材库 | 临时分析 |
| `resources/` | 原始资料的核验记录、提取过程与来源证据 | 已批准的公开资产 |
| `docs/` | 长期技术说明与专题研究 | 当前执行任务 |
| `work/active/` | 正在执行的任务 | 已完成或已取消任务 |
| `work/completed/` | 已完成任务及结果 | 下一阶段承诺 |
| `work/queued/` | 已确认但尚未开始的任务 | 已被新计划覆盖的旧待办 |
| `archive/` | 被替代的完整历史快照 | 现行正本 |

## 当前交付物

- [首发总计划](outputs/site-launch-plan/README.md)：范围、四周排期、月度预算、部署与总体验收。
- [数据与询盘设计](outputs/site-launch-plan/02-data-and-inquiry-design.md)：WordPress 内容模型和询盘持久化。
- [内容与素材分配](outputs/site-launch-plan/03-content-and-assets.md)：三家公司资料如何进入网站。
- [开发任务卡](outputs/site-launch-plan/04-task-cards.md)：T00–T23 的依赖、步骤、产出与验收。
- [代码与资产盘点](outputs/site-launch-plan/05-code-and-assets-inventory.md)：执行前的代码、数据、素材现状。
- [航鹏轮毂素材库](outputs/hangpeng-wheel-media/README.md)：68 张候选素材、清单和本地浏览页。
- [首页 Page SPEC](PAGE-SPECS/homepage.md)：2N 结构参考、四条产品线、六项制造能力、合作制造边界、交付路径和统一询盘。
- [About 公司角色分工模块](PAGE-SPECS/about-company-role.md)：A02 四项角色与集团纵向一体化链条、同一 ownership group 公开口径、六类禁发内容和证据边界。
- [About 轮毂制造合作方模块](PAGE-SPECS/about-wheel-factory.md)：四张 WordPress 工厂图片、英文文案、双端布局与验收。
- [Capabilities 轮毂制造与质量能力](PAGE-SPECS/capabilities-wheel-manufacturing.md)：五个视口、12 张工艺/检测图、2 张证书候选和证据门槛。
- [锻造轮毂高端定制](PAGE-SPECS/forged-wheel-customization.md)：六个视口、WordPress 真实媒体绑定、装车案例发布门槛和英文内容。
- [自密封轮胎](PAGE-SPECS/self-sealing-tires.md)：六个视口、8 mm 测试口径、17 张候选媒体和现有页面替换要求。
- [About 自密封轮胎制造合作方](PAGE-SPECS/about-self-sealing-tire-factory.md)：三个视口、七张生产图、制造主体与证据边界。
- [轮毂产品目录](PAGE-SPECS/wheel-catalog.md)：Vossen 参考取舍、真实目录筛选、卡片、分页、SEO 和发布门槛。
- [轮毂详情页](PAGE-SPECS/wheel-detail.md)：2N 参考取舍、单图首屏、真实变体、嵌入式询盘、finish 与相关型号。
- [旋压轮毂入口](PAGE-SPECS/flow-formed-wheels.md)：旋压与低压+旋压口径、批准型号筛选、WP 116 工艺图、真实变体询盘和发布门槛。
- [新能源三电铝制品](PAGE-SPECS/ev-components.md)：三类有图壳体、工程问题、制造路线证据、WordPress 媒体绑定和询盘输入。
- [定制铝制品](PAGE-SPECS/custom-aluminum.md)：来图来样评估、四类应用范围、工程方法示例、五阶段开发和发布门槛。
- [项目询盘页](PAGE-SPECS/request-a-quote.md)：四条产品线与 B/C 分流、两步短表单、产品上下文、事务持久化、隐私和错误状态。
- [Astryx Neutral 页面族映射](PAGE-SPECS/astryx-neutral-page-families.md)：全站外壳、各路由族控件选择、业务禁区和验收状态。
- [给 Alma 的 Astryx 暖白交接](outputs/reports/24-astryx-neutral-warm-handoff-alma-2026-10-11.md)与[全站组件化执行计划](outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md)：既有证据、未完边界、六阶段任务与停止条件。
- [架构与 README 校准审计](outputs/architecture-alignment-audit.md)：旧描述与当前代码/决策的差异、三份核心文档修正和剩余实现缺口。

## 历史版本

2026-10-01 的详细架构、页面施工图、视口审计、旧交接文档和四个旧待办已经整体保存到
[2026-10-01 文档基线](archive/2026-10-01-document-baseline/README.md)。这些文件用于追溯设计过程，不再驱动当前开发。

任何新文档先判断它属于“正本、任务、证据、交付物、历史”中的哪一类。已经有正本时，更新正本或把旧版归档，不再并列创建第二套“最新版”。
