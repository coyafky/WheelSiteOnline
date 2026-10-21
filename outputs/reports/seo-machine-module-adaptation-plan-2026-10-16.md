# SEO Machine 能力适配计划

- **日期**：2026-10-16
- **状态**：计划建议；未安装、未接入数据源、未改变网站代码或 WordPress 内容。
- **参考来源**：[SEO Machine GitHub 仓库](https://github.com/TheCraigHewitt/seomachine)；核对摘要见 [`resources/research/seo-machine-reference-2026-10-16.md`](../../resources/research/seo-machine-reference-2026-10-16.md)。
- **项目背景**：本项目是英文优先的 Next.js + Headless WordPress 多产品线 B2B/B2C 网站；SEO 正文、页面索引、媒体与产品事实受项目发布门槛约束。

## 建议

**吸收 SEO Machine 的内容运营流程与可复用分析能力，将其改造成仓库内的编辑工作流；不把它作为网站运行时依赖，也不整仓克隆。**

SEO Machine 是 Claude Code 工作区，不是一个装入 Next.js 就能得到完整 SEO 能力的 npm 包。README 所列 Python 分析器、GA4、Search Console、DataForSEO 与 WordPress REST 发布各有依赖和凭证配置。本站已有主题研究、类型化内容接缝、WordPress 页面/文章适配器、SEO metadata 与 sitemap，因此接入应围绕现有正本和编辑方式做薄适配。

本计划以今日已完成的[全站 SEO Topic Map 与关键词研究](sitewide-seo-topic-map-run_49640978b2a8.md)为输入，不重复购买或重跑本轮研究。该研究明确没有搜索量、排名、GSC 或付费 provider 数据，候选词和页面归属仍须负责人/业务审核。

## 模块适配清单

| 优先级 | SEO Machine 能力 | 本项目适配方式 | 状态/门槛 |
|---|---|---|---|
| P0 | 品牌、产品、风格、SEO 上下文 | 建立一个项目内内容编辑上下文入口，引用 `PROJECT.md`、页面 SPEC、已批准内容、主题地图和证据来源；记录主体、可说/不可说主张、受众、语言与术语。避免再建一份产品事实或 SEO 规则副本。 | 可做；产品事实仍以项目正本/获批 WordPress 内容为准，`PLACEHOLDER` 不得被润色流程删去或改写为事实。 |
| P0 | `/analyze-existing`、`/optimize`、SEO Optimizer | 先为现有页面和文章提供只读审查：title/description、canonical、语言路径、索引状态、sitemap 一致性、标题结构、内链、图片替代文本和发布门槛。输出可复核的逐项建议，不自动改页面。 | 当前优先处理 fitment 未验证却可索引/sitemap 收录的 P0 审计问题；不得新增宽松索引逻辑。 |
| P1 | `/research`、关键词/意图映射 | 将既有 Topic Map 的 query、SERP 证据、意图、URL owner、置信边界整理成逐主题 brief；仅在市场、产品证据、GSC 数据或 SERP 发生变化时做增量研究。 | 用户可批准主题、页面归属和公开主张后再写作；PAA/扩词假设不冒充搜索量。 |
| P1 | `/write`、`/rewrite`、Editor、Meta Creator | 生成/修改英文技术内容草稿和 metadata 备选，附事实来源、未决问题、建议内链和变更摘要；编辑、产品/工程负责人审核后才录入 WordPress。多语言内容沿用现有 locale registry 与已批准翻译流程。 | 不使用固定 2,000–3,000 字目标；不凭 AI 分数宣称质量/排名；不生成未核实规格、效果、认证、供货或主体主张。 |
| P1 | Internal Linker、Keyword Mapper | 基于已批准页面清单和 Topic Map 给出 URL、锚文本、落点及语言匹配建议；先建议后人工采纳。 | 无效、草稿、noindex、未过发布门槛的页面不能被建议为公开入口；不自动改 sitemap。 |
| P2 | Search Intent、Readability、关键词/结构分析器 | 选择可解释的离线检查项，输出诊断和证据，不把词频密度作为写作目标；优先使用轻量、可本地复核的方式。 | 不引入整套 Python/NLP 依赖，除非样稿对照证明其有净收益；长度比较只作背景，不机械追逐竞品字数。 |
| P2 | GSC、GA4 性能复盘 / `/priorities` | 数据接入获授权后先做只读导出或报表，形成 query × landing page 的机会清单；Search Console 指标与研究员 SERP 观察并读。 | 当前没有项目数据连接或已验证的流量基线；不在本计划里添加账号、凭证或费用。GA4 使用还需符合项目隐私与测量设置。 |
| 暂缓 | `/publish-draft`、`/landing-publish`、Yoast REST 写入 | 不直接复用 SEO Machine 的发布脚本。若未来需要省录入工时，应评估本站现有 WordPress `post`、ACF/结构化字段、locale 与审核状态契约，先做仅创建草稿且可审计的适配。 | 禁止绕过项目 CMS 适配器、内容审批、图权/主体确认、noindex/sitemap 门槛或翻译审核；不得自动发布或改正式内容。 |
| 不装 | 付费广告、邮件序列、定价策略、会员/订阅漏斗、泛用 CRO 等营销技能 | 不纳入首轮 SEO 模块包。 | 与当前网站首发范围无关，避免带入未经确认的商业承诺与外部数据依赖。 |

## 推荐的落地顺序

1. **索引与页面 SEO 审计**：复核并修复 fitment 发布资格与 sitemap/noindex 一致性，再做一次全站只读 SEO 基线。当前状态中的 P0 不因本计划而降级。
2. **内容上下文与单主题 brief**：复用项目事实正本和 Topic Map，为一个已批准主题生成 brief；优先选择证据齐全且页面 owner 明确的主题，不从工具建议直接扩张页面。
3. **草稿、优化与人工审核**：产出单篇文章/页面模块的英文草稿、metadata 选项、内链建议和事实来源表；先进入本地评审成果或 WordPress 草稿，不发布。
4. **形成项目内可复用技能**：单主题流程证明可复用后，再评估在 `SKILLS/` 中沉淀项目专用 SEO 内容工作流。命令名和 Claude Code slash command 不作为必须的技术形态。
5. **性能数据闭环**：待网站、GSC/GA4 权限和隐私设置就绪并获用户授权后，定义只读报告、字段与保留方式；DataForSEO 等收费服务单独评估预算后再决定。
6. **CMS 写入自动化最后评估**：只有手工草稿流程成为明确瓶颈时，才评估 WordPress 草稿 API；写入范围限于草稿，保留审计和人工发布闸门。

## 首轮验收建议

- 能对选定 URL 输出可复现的技术/内容检查清单，并明确区分“代码可验证”“业务需确认”“数据缺失”。
- metadata、canonical、hreflang、robots 与 sitemap 的建议服从同一页面发布资格，尤其不索引未核验 fitment、未批准翻译或草稿。
- 草稿每项具体产品/工程/供应链主张能追溯到获批来源；没有证据时显式保留问题或删掉主张。
- 所有 URL 和内链建议映射到已批准页面；不生成竞品文案/媒体，不复用其品牌信息。
- 不自动调用付费服务、连接真实分析账号、写入 WordPress 正式内容、公开发布或改变生产索引状态。
- 先用人工抽样审阅证明建议有用，再决定是否安装本地分析依赖或实现自动化；分数不能作为唯一验收信号。

## 依赖和未决事项

- 当前 Fitment SEO P0、全站多语言内容覆盖、WordPress 编辑验收和生产运行时审核仍优先于自动化扩展。
- 公开文章主题、英文产品/供应主体表述、各主题 URL owner 与索引门槛须由负责人按项目证据批准。
- 是否接入 GSC/GA4、是否为 DataForSEO 付费、是否允许 WordPress 草稿 API 写入，均不由参考仓库默认配置代替用户授权。
- 计划不代表已安装 SEO Machine，不新增运行时依赖，不改变现有应用或 WordPress 数据。
