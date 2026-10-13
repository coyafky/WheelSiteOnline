# 项目当前状态

更新：2026-10-14。**本文件只写现在有效的状态、当前阻断和下一步，不记逐日流水。** Agent 开始工作先读本页，再只打开它指向的相关任务/报告；不要为理解当前情况通读历史。

## 当前阶段

开发与预发布验证阶段，尚未达到正式商用发布条件。9080 是预发布环境，保持 `noindex`；预发布测试成功不代表正式内容、法律文本或生产运行时已批准。项目目标与稳定范围见 [`PROJECT.md`](PROJECT.md)。

## 当前优先事项

1. **P0 · 自密封轮胎机制图**：2026-10-13 视觉诊断发现 3 张机制 WebP 带伪文字/乱码，不能作为当前页面证据继续展示。先替换为已核准来源，或从页面撤下后再复验。[诊断报告](outputs/reports/pre-run-visual-diagnosis-2026-10-13.md)
2. **P0 · Fitment 索引门槛**：JEV 审计发现车型平台页数据 `verified: false`，但仍可索引且 sitemap 无条件收录。修正索引/sitemap 与确认数据门槛后，再审核其他 noindex 页面是否开放。[审计报告](outputs/reports/41-jev-seo-code-keyword-audit-2026-10-12.md)
3. **P1 · 内容接管与多语言**：WordPress 内容接缝和全站四语正文仍在实施；中文、英语之外的正文/审批状态不能按 URL 存在推断为完成。按当前任务推进，并以页面内容、SEO 元数据和审批矩阵共同验收。[四语任务](work/active/2026-10-12-full-site-four-language-implementation.md) · [近期覆盖审计](outputs/reports/36-sitewide-multilingual-text-coverage-2026-10-12.md)

## 仍未满足的发布条件

- 产品图、供货主体、图权和实际规格按型号/页面完成审核；没有真实证据的内容撤下或保持草稿。
- fitment 数据未验证前不能公开索引；竞品残留扫描、正式域名 canonical/OG/sitemap/robots 核对仍需在发布前完成。
- 正式法律文本、生产 WordPress/数据库/邮件可靠性、OpenNext 目标平台、备份恢复和负责人交接需要各自完成核验。
- 未完成项目目标与费用/责任人核对前，不标记上线就绪。

稳定产品与发布边界见 [`PROJECT.md`](PROJECT.md)；系统状态、接缝和运行时见 [`ARCHITECTURE.md`](ARCHITECTURE.md)；页面验收见 [`PAGE-SPECS/`](PAGE-SPECS/README.md)。不要在本页重复这些规则全文。

## 等待启动

- [方案甲范围确认](work/queued/2026-10-12-planA-scope-and-order.md)：等待确认法律内容是否合并为一个 WP Page、全站 `site` 常量的归属、轮毂目录页是否排除在迁移范围外。
- [首发产品与图片可信度核验](work/queued/2026-10-10-product-image-trust-verification.md)：等待首发型号清单、供货主体、图片/产品可发布声明和工程变体签字。

## Agent 更新约定

- 每次完成有意义的切片、发现阻断或用户改变范围时，更新本页的**当前事实**、优先级和下一步；替换已经过期的条目，不按日期追加流水。
- 完成过程、命令输出、截图和详细发现写在对应 `work/completed/` 或 `outputs/reports/`，本页只链接结论。
- 决策原因记入 `DECISIONS.md` 或 `docs/adr/`，本页只引用当前仍有效的影响。
- 当前任务只读 `work/active/` 中与本切片直接相关的一份任务文件；历史状态快照在 [`archive/status-history/`](archive/status-history/README.md)，默认无需加载。
- 若某个事实已被新验证推翻，直接更新本页和事实正本；旧记录留在历史档案，不继续作为当前要求引用。

## 最近完成

- [2026-10-13 文档与 Agent 工作流整理](work/completed/2026-10-13-documentation-workflow-reorganization.md)：统一文档地图，Claude Code 加入项目目录导航，工程流程按风险伸缩；DEC-101。
- [2026-10-13 预发布视觉诊断](outputs/reports/pre-run-visual-diagnosis-2026-10-13.md)：发现并记录当前 P0 图像问题。
- [2026-10-12 询盘端到端验证](outputs/reports/40-consentless-inquiry-qq-smtp-2026-10-12.md)：预发布 WordPress 持久化与 SMTP 接受已验证；不等同于正式法律审批或生产发布。
