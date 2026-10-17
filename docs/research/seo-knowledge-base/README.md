# 峰徊产品与行业 SEO 知识库

更新：2026-10-16。此目录为 SEO 研究与 AI 分析的**上下文包**，用于解释产品实体、买家任务、证据边界和搜索意图。它不是产品事实的第二正本，也不授予公开发布资格。

## 使用入口

做关键词或 Topic Map 分析时，先读本页，再按关键词产品线读取对应条目；随后加载当次关键词导出文件、当次从网站 sitemap 实际取得的完整 URL 清单，以及当前页面规格/索引状态。分析结果要能追溯回这些输入。

| 主题 | 知识条目 | 对应现行事实正本 |
|---|---|---|
| 公司角色与四线关系 | [公司与商业模式](company-and-commercial-model.md) | [`PROJECT.md`](../../architecture/TARGET_ARCHITECTURE.md)、[`PAGE-SPECS/about-company-role.md`](../../../PAGE-SPECS/about-company-role.md) |
| 轮毂：目录、旋压、锻造定制 | [汽车轮毂](automotive-wheels.md) | [`PAGE-SPECS/wheel-catalog.md`](../../../PAGE-SPECS/wheel-catalog.md)、[`flow-formed-wheels.md`](../../../PAGE-SPECS/flow-formed-wheels.md)、[`forged-wheel-customization.md`](../../../PAGE-SPECS/forged-wheel-customization.md) |
| 新能源三电铝壳体 | [EV 铝制部件](ev-aluminum-components.md) | [`PAGE-SPECS/ev-components.md`](../../../PAGE-SPECS/ev-components.md) |
| 来图定制铝件 | [定制铝制品](custom-aluminum.md) | [`PAGE-SPECS/custom-aluminum.md`](../../../PAGE-SPECS/custom-aluminum.md) |
| 自密封轮胎 | [自密封轮胎](self-sealing-tires.md) | [`PAGE-SPECS/self-sealing-tires.md`](../../../PAGE-SPECS/self-sealing-tires.md) |
| 买家任务与行业语义 | [买家任务与行业语言](buyer-jobs-and-industry-language.md) | [`PROJECT.md`](../../architecture/TARGET_ARCHITECTURE.md)、各产品 Page SPEC、当前 SERP 证据 |
| 显性/隐性意图、Topic Map 分析流程 | [分析规程与可复用提示词](topic-map-analysis-protocol.md) | 当次关键词导出、实时 sitemap、当前页面状态 |

## 证据标签

- **已确认事实（FACT）**：由项目正本、页面规格、经审核的内容/资料明确支持。必须附来源；来源有冲突时回到正本。
- **观察（OBSERVED）**：来自某日期、市场、语言、搜索引擎的 SERP、PAA、相关搜索或站点 sitemap 快照。只对该次采样成立，不等于普遍需求或搜索量。
- **推断（INFERENCE）**：从 query 词面、买家任务、页面类型或多条观察推导出的可能需求。说明推理依据与置信度，不能改写成客户事实。
- **待确认（UNKNOWN）**：项目、工程、供货或市场信息尚无充分证据。未知值保持未知，不用行业常见值补齐。
- **禁止推断（DO_NOT_INFER）**：明确不能由 SEO 词面、竞品页面、图片或供应商宣传推出来的主张。

意图判断也分层：query 的字面任务是显性意图候选；买家为什么搜、下一步在规避什么风险属于隐性意图推断。隐性意图必须有线索和置信度，不能声称 AI 能从一个 query “准确读心”。

## 冲突处理与更新

`PROJECT.md`、`STATUS.md`、Page SPEC、产品数据/图权/业务审批分别是当前目标、状态、页面要求与产品事实的正本。此知识库只摘录对搜索分析有用的解释与链接。若正本更新，本库同步；若无法确认，标为 UNKNOWN 并列出待核验者。历史 SEO 报告只能提供线索，不能覆盖 2026-10-16 后更新的正本。

SERP 和关键词导出按独立 run 保存，不覆写旧采样。当前全站样本见 [`2026-10-16 Google US/en-US run`](../../../resources/research/seo-sitewide/2026-10-16-us-en-google/RUN.md)；其关键词 universe 共 81 条，11 条为手动实测 query，其余为 SERP 可见表达或研究假设，细分见导出的 `keyword-export.csv`。

## 给 AI 的最小输入包

1. 本目录 README 与对应产品条目。
2. 当前关键词导出（保留来源类型、市场、语言和证据状态）。
3. 在分析当日直接从目标站 `/sitemap.xml` 获取的完整 sitemap URL 列表；记录获取时间、最终 host、HTTP 状态、语言版本和总数。若无法访问，明确写 `NOT_AVAILABLE`，不要拿代码路由表伪装为实时清单。
4. 相关页面的当前 Page SPEC、索引批准状态和 `STATUS.md` 必要段落。
5. 如果有，实际 Search Console/关键词工具导出及字段定义；没有时明确 `NOT_AVAILABLE`，禁止估量。

推荐提示词和验收结构见[分析规程](topic-map-analysis-protocol.md)。
