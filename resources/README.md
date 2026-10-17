# 资料与来源

`resources/` 保存为了形成规格、实现或交付物而收集的输入和过程证据，不保存已批准的运行时发布文件，也不充当产品事实的第二正本。

## 子目录

| 路径 | 内容 |
|---|---|
| `research/` | 调研过程、来源分析、核验记录与中间结论 |
| `screenshots/` | 竞品或参考页面截图；需注明来源、日期和参考目的 |
| `references/` | 外部文章、用户提供的文档、图表与其他原始参考材料 |
| `wheel-data-pack/`、`generated/` | 仅在对应数据整理工作需要时保留的派生产物；来源仍指向 `assets/` |

原始产品数据、供应商图片、语料和具备业务事实的资料以 `assets/` 为只读来源；确认可公开后，才将获准资源复制或导入 `public/` / WordPress。

## 当前来源

- [`research/`](research/)：项目规划、竞品结构、关键词以及产品/媒体来源核验。
- [全站 SEO Topic Map 研究 run](research/seo-sitewide/2026-10-16-us-en-google/RUN.md)：包含 81 条去重 query、SERP/意图证据、页面所有权图和 [关键词 CSV 导出](research/seo-sitewide/2026-10-16-us-en-google/deliverables/keyword-export.csv)；它是有日期和市场范围的研究快照，不是实时需求数据。
- [关键词意图与 Topic Map 复核 run](research/seo-sitewide/2026-10-16-us-en-google-knowledge-followup/RUN.md)：补充显性/隐性意图与候选页面归属；目标域名尚未部署，实时 sitemap 映射未核验。
- [Hostinger 与 Cloudflare 部署选项调研](research/2026-10-14-hostinger-cloudflare-deployment-options.md)：官方部署能力、与当前 Next.js/WordPress/询盘架构的差距和样机验收项；不代表平台已选定。
- [SEO Machine 来源核对](research/seo-machine-reference-2026-10-16.md)：用户提供的 GitHub 项目参考，用于评估可适配的 SEO 内容工作流模块；不是本站实现或业务规则。
- [`screenshots/`](screenshots/)：2N 与 Vossen 页面参考截图，不是可发布素材。
- [AI 开发工作流原件](references/ai-development-workflow/README.md)：本次用户提供的流程图和心得文章，仅作为方法参考；项目采用后的流程以 `SKILLS/fenghuai-engineering-workflow/SKILL.md` 为准。

整理输入资料时保留原件、来源、用途与日期；只摘录确实会影响项目的结论到对应正本，不把整篇参考内容复制进 `AGENTS.md`。
