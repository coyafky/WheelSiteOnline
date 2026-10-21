# 文档地图（docs/README.md）

最后更新：2026-10-21（补充已公开页面商业表达问题台账入口）

> 本页是**唯一文档入口**。新增或移动文档前先看这里，判断它属于哪一类。
> 原则：**维护正本，不并列造第二份"最新版"**。

---

## 一、按问题找文档

| 我想知道… | 看这里 |
|---|---|
| 代码现在实际是什么样？ | [`audit/CURRENT_ARCHITECTURE.md`](audit/CURRENT_ARCHITECTURE.md) |
| 18 个模块各缺什么、风险多大？ | [`audit/GAP_ANALYSIS.md`](audit/GAP_ANALYSIS.md) |
| 目标架构长什么样、技术选型怎么定？ | [`architecture/TARGET_ARCHITECTURE.md`](architecture/TARGET_ARCHITECTURE.md) |
| 数据怎么流动、谁拥有什么？ | [`architecture/DATA_FLOW.md`](architecture/DATA_FLOW.md) |
| 内容实体和字段由谁管？ | [`architecture/CONTENT_SCHEMA.md`](architecture/CONTENT_SCHEMA.md) |
| 多语言怎么做、有什么坑？ | [`architecture/I18N.md`](architecture/I18N.md) |
| SEO / GEO 要求什么？ | [`architecture/SEO_GEO.md`](architecture/SEO_GEO.md) |
| 安全边界在哪？ | [`architecture/SECURITY.md`](architecture/SECURITY.md) |
| 怎么部署、怎么回滚？ | [`architecture/DEPLOYMENT.md`](architecture/DEPLOYMENT.md) |
| 先做什么、后做什么？ | [`implementation/ROADMAP.md`](implementation/ROADMAP.md) |
| 具体任务是什么？ | [`implementation/TASKS.md`](implementation/TASKS.md) |
| 怎么验收？ | [`implementation/TEST_PLAN.md`](implementation/TEST_PLAN.md) |
| 2026-10-18 全量审计与 Notion 同步交付？ | [`project-audit/project-overview.md`](project-audit/project-overview.md) |
| 核心代码模块及架构图解索引？ | [`project-audit/core-module-inventory-2026-10-19.md`](project-audit/core-module-inventory-2026-10-19.md) |
| 每个页面的本地长图和教学白板在哪？ | [`project-audit/page-screenshot-index-2026-10-19.md`](project-audit/page-screenshot-index-2026-10-19.md) |
| 移动端烟测、关键交互与异常状态核验？ | [`project-audit/mobile-interaction-acceptance-2026-10-19.md`](project-audit/mobile-interaction-acceptance-2026-10-19.md) |
| 已公开页面有哪些待审定的商业表达、测试内容和内部占位？ | [`../outputs/project-audit/2026-10-21-live-commercial-copy-register.md`](../outputs/project-audit/2026-10-21-live-commercial-copy-register.md) |
| 第二阶段代码、线上与商业发布深度审计结论在哪？ | [`project-audit/deep-dive/DEEP_DIVE_EXECUTIVE_SUMMARY.md`](project-audit/deep-dive/DEEP_DIVE_EXECUTIVE_SUMMARY.md)（证据、问题、发布门禁与实施建议由该页进入） |
| 2026-10-15 的流程治理迁移记录在哪？ | [`progress/MASTER.md`](progress/MASTER.md)（历史快照，当前状态仍以 `implementation/TASKS.md` 为准） |
| 为什么这么决策？ | [`adr/`](adr/) + `architecture/TARGET_ARCHITECTURE.md` §7 |
| 历史文档在哪？ | [`../archive/2026-10-17-pre-v3-docs/README.md`](../archive/2026-10-17-pre-v3-docs/README.md) |
| 页面施工规格？ | [`../PAGE-SPECS/`](../PAGE-SPECS/README.md) |
| Agent 规则？ | [`../AGENTS.md`](../AGENTS.md)、[`../CLAUDE.md`](../CLAUDE.md) |

---

## 二、目录归属

```
docs/
├── README.md                  ← 本页（唯一入口）
├── audit/                     ★ 从代码还原的现状与差距（只写"是什么"）
│   ├── CURRENT_ARCHITECTURE.md
│   └── GAP_ANALYSIS.md
├── architecture/              ★ 目标架构与专项设计（只写"应该是什么"）
│   ├── TARGET_ARCHITECTURE.md
│   ├── DATA_FLOW.md
│   ├── DEPLOYMENT.md
│   ├── CONTENT_SCHEMA.md
│   ├── I18N.md
│   ├── SEO_GEO.md
│   └── SECURITY.md
├── implementation/            ★ 执行：路线、任务、验收
│   ├── ROADMAP.md
│   ├── TASKS.md
│   └── TEST_PLAN.md
├── adr/                       架构决策记录（YYYY-MM-DD-<slug>.md）
├── research/                  调研输入（关键词、SEO 知识库）— 是证据不是规则
├── runbooks/                  运维手册（备份恢复、故障处理）
├── project-audit/             2026-10-18 有日期的审计交付快照（不替代正本）
├── progress/                  2026-10-15 流程治理历史快照与模板（不作当前状态正本）
├── api/                       接口契约文档
├── assets/                    文档用图
└── design-references/         设计参考
```

### 仓库其他目录的边界

| 路径 | 放什么 | 不放什么 |
|---|---|---|
| `src/` | 应用源码 | 文档 |
| `public/` | 运行时公开文件 | 原始素材 |
| `assets/` | 原始产品数据、图片（**只读**） | 发布清单 |
| `resources/` | 参考原件、来源、调研过程 | 项目指令 |
| `outputs/` | 交付证据、报告、截图 | 当前状态 |
| `work/` | 任务生命周期 queued/active/completed（历史） | 新任务（新任务走 `docs/implementation/TASKS.md`） |
| `PAGE-SPECS/` | 页面施工规格（有效正本） | 通用架构 |
| `SKILLS/` | 可复用步骤 | 单次任务计划 |
| `archive/` | 已被替代的正本 | 当前实现依据 |

---

## 三、写文档的规矩

1. **先查正本再新建**：不随手创建 `design.md`、`context.md`、PRD、任务卡或测试报告
2. **audit 与 architecture 严格分开**：
   - `audit/` 只写"代码里实际有什么"，每条结论必须有 `文件:行号`
   - `architecture/` 只写"目标是什么"，可以写建议
   - **不要把"待实现"写进 audit**，也不要把"当前实现"当目标写进 architecture
3. **没有证据就写「待核实」**：不猜测，不推断
4. **证据分级**：
   - 文件路径 + 行号 = 硬证据
   - 命令输出 = 运行证据
   - 「按经验」= 必须明确标注
5. **决策必须留痕**：有持久取舍的决定写进 `adr/` 或 `TARGET_ARCHITECTURE.md` §7
6. **已被推翻的结论直接改**，旧记录留在 `archive/`，不继续作为当前要求引用

---

## 四、当前状态速览

| 项 | 状态 |
|---|---|
| 文档体系 | ✅ V3.0 重构完成（2026-10-17） |
| 审计 | ✅ M01–M18 全量完成，含文件级证据 |
| 差距分析 | ✅ 8 个 High 风险模块已识别 |
| 目标架构 | ✅ 定稿（含与 V3.0 的偏离说明） |
| 基线提交 | ✅ 215 处未提交改动已分批落库（`dffc7bf`…`35a262c`） |
| **P0 止血** | ✅ **8 项全部完成**（`502c1aa`…`18d704e`），`npm run check` 全绿 ｜ 69 tests ｜ E2E 15/15 |
| P0 遗留 | ⚠️ T-04 的 nginx `log_format` 需在服务器手工加并 `nginx -t` |
| **P1（全部完成）** | ✅ T-09（未批准译文 404）｜ T-10（Zod 边界，pages 试点）｜ T-11（契约比对进 check）｜ T-12（canonical 单点）｜ T-13（失效重投）｜ T-14（备份+恢复演练，本地）｜ T-15（告警接线）｜ T-16（health + uptime）｜ T-17（env 启动期校验）｜ T-18（跨语言 entityId）｜ T-19（双开关互斥）｜ T-20（缓存标签登记） |
| P2 | 见 [`docs/implementation/TASKS.md`](implementation/TASKS.md) T-21 起 |
| 运维手册 | ✅ [`docs/runbooks/backup-and-restore.md`](runbooks/backup-and-restore.md) ｜ [`docs/runbooks/monitoring.md`](runbooks/monitoring.md) |
| 未做（服务器侧） | 异地备份、加密、备份定时任务 —— 按负责人口径暂缓 |
| 已知预存问题 | ⚠️ `e2e/publication-qualification.spec.ts:37` 的 RSC 用例在基线上也失败（Next 会把 `?_rsc=<x>` 改写为自身 hash 并 307，测试用了固定值） |

**下一步**：从 [`implementation/TASKS.md`](implementation/TASKS.md) 的 P0 组开始。
P0 里有两项需要人工决策（T-01 sitemap 业务意图、T-03 FAQ 真实口径），其余可自主执行。
