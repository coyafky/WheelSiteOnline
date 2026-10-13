# 项目文档地图

更新：2026-10-14。本页是仓库文档的唯一导航。新增或移动项目文档时，先判断它是正本、任务、交付证据、输入资料还是历史；维护正本，不并列造第二份“最新版”。

## 唯一正本

| 问题 | 正本 | 放什么 |
|---|---|---|
| 项目是什么、服务谁、有哪些业务边界？ | [`PROJECT.md`](PROJECT.md) | 稳定目标和范围 |
| 现在做到哪里、阻断和下一步是什么？ | [`STATUS.md`](STATUS.md) | 当前状态；完成记录只留摘要和必要证据链接 |
| 系统模块如何切分、数据怎么流动？ | [`ARCHITECTURE.md`](ARCHITECTURE.md) | 系统现状、目标与待确认状态 |
| 页面要说明什么、怎么验收？ | [`PAGE-SPECS/`](PAGE-SPECS/README.md) | 现行页面施工规格 |
| 视觉令牌、组件与页面观感如何约定？ | [`DESIGN.md`](DESIGN.md) | 设计正本；不重复抄写通用工程规则 |
| 这个流程决定为何成立？ | [`DECISIONS.md`](DECISIONS.md) | 有持久取舍的流程决定及理由 |
| 系统结构决定为何成立？ | [`docs/adr/`](docs/adr/) | 架构级决定 |
| Claude Code 应读什么、仓库代码在哪？ | [`CLAUDE.md`](CLAUDE.md) | 工具入口和目录地图；规则源仍是 AGENTS |
| Agent 如何按任务复杂度工作？ | [`SKILLS/fenghuai-engineering-workflow/SKILL.md`](SKILLS/fenghuai-engineering-workflow/SKILL.md) | 轻量需求到交付流程 |

## 目录归属

| 路径 | 内容与边界 |
|---|---|
| `src/` | 应用源码：`app/` 路由、`components/` UI、`content/` 类型化内容、`lib/` 服务与工具 |
| `public/` | 网站可公开请求的运行时文件；发布前必须过内容、图权和事实审核 |
| `assets/` | 原始产品数据、图片和语料，只读，不是发布清单 |
| `resources/` | 参考原件、来源、调研过程、提取与核验材料 |
| `outputs/` | 可交付或可评审成果；报告保留方法/日期/范围，截图只留能说明结论的证据 |
| `work/queued/` → `work/active/` → `work/completed/` | 任务的唯一生命周期；queued 可标注等待决定或资料，不复制状态，也不把已完成任务留在 active |
| `docs/` | 长期技术说明、专题研究和 ADR |
| `SKILLS/` | 可跨任务复用的步骤，不放单次任务计划 |
| `archive/` | 已被替代但仍有追溯价值的正本、方案和快照；归档文件不指导当前实现 |

## 按任务读取

1. 先看 `AGENTS.md`、`PROJECT.md`、`STATUS.md`。
2. 代码任务再读相关 `ARCHITECTURE.md` 章节、页面 SPEC、领域规则和具体任务；不用全仓扫读。
3. 需要解释一项已定方案时，按文档中的 `DEC-xxx` 查 `DECISIONS.md`；只为真实、持久取舍新增记录。
4. 需要来源或审计证据时，从 `resources/`、`outputs/` 进入；日期报告是证据，不代替当前状态或规格。
5. 历史文档只在追溯原因时读；出现新旧冲突时以本页列出的现行正本为准。

## 文档整理约定

- 不随手创建 `design.md`、`context.md`、PRD、任务卡或测试报告；先检查对应正本是否已有位置。
- 参考文章、截图、聊天导出物先归入 `resources/`，附来源与用途；其内容不是项目指令。
- 验收产物放 `outputs/`；临时 Playwright、构建和测试运行目录不是文档，不提交为长期证据。
- 仍有价值但已失效的文档移到 `archive/` 并记录“被什么替代”；不要只为目录整齐删除来源证据。
- 收尾时检查正本、任务状态、引用链接、归档关系和项目状态；不相关的代码门禁不因文档改动重复运行。

## 当前架构与页面入口

- 系统结构：[`ARCHITECTURE.md`](ARCHITECTURE.md)、[`ARCHITECTURE/README.md`](ARCHITECTURE/README.md)
- 页面规格总表：[`PAGE-SPECS/index.md`](PAGE-SPECS/index.md)
- 2026-10-04 首发规划基线（范围、数据、早期任务卡）：[`outputs/site-launch-plan/README.md`](outputs/site-launch-plan/README.md)；当前执行顺序以 `STATUS.md` 与对应 active 任务为准。
- WordPress、询盘、数据模型与部署专题：[`docs/`](docs/)
- 已完成审计与验收证据：[`outputs/reports/`](outputs/reports/)
- 原始来源与参考图：[`resources/README.md`](resources/README.md)
- 任务生命周期：[`work/README.md`](work/README.md)

历史基线保存在 [`archive/`](archive/) 中。不要把归档里的旧页面数量、产品范围、技术状态或克隆模板规则复制回当前正本。
