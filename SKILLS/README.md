# 项目 Skills 使用地图

`SKILLS/` 是随仓库维护的本地技能库。按 [项目工程工作流](fenghuai-engineering-workflow/SKILL.md) 选择当前步骤需要的技能；**不默认加载所有技能**，一个步骤通常选一个主技能，专门工具只在对应工作发生时加载。

## 按工作流步骤选择

| 工作流步骤 | 主技能 / 可选技能 | 什么时候用 |
|---|---|---|
| 0. 任务分流与收尾 | [`fenghuai-engineering-workflow`](fenghuai-engineering-workflow/SKILL.md) | 工程工作时参考。它负责选择流程，不替代项目规则，也不要求小改动写规格 |
| 1. 需求理解与方案 | [`redesign-existing-projects`](redesign-existing-projects/SKILL.md)、[`seo-market-research`](seo-market-research/SKILL.md) | 仅在重做现有业务/架构，或需要 SEO 市场证据时使用 |
| 2. 视觉方案 | [`design-taste-frontend`](design-taste-frontend/SKILL.md)、[`brandkit`](brandkit/SKILL.md)、[`impeccable`](impeccable/SKILL.md) | 有明确界面/品牌任务时选用；品牌套件只用于品牌工作，常规页面不必先生成整套视觉系统 |
| 3. 设计到实现 | [`image-to-code`](image-to-code/SKILL.md)、[`shadcn`](shadcn/SKILL.md)、[`migrate-radix-to-base`](migrate-radix-to-base/SKILL.md) | 还原已提供设计、使用对应 UI 原语或执行明确组件迁移时用；技能对生成图像的要求不能覆盖用户给定素材与项目图权门槛 |
| 3a. 新视觉资产 | [`imagegen-frontend-web`](imagegen-frontend-web/SKILL.md)、[`imagegen-frontend-mobile`](imagegen-frontend-mobile/SKILL.md) | 仅在任务明确需要新的网页视觉参考或移动端概念稿时使用；生成图不得伪装成真实产品、工厂、认证或测试证据 |
| 4. 自测与风险验证 | [`security-audit`](security-audit/SKILL.md) | 安全问题做聚焦检查；只有用户明确要求完整安全审计、渗透测试或报告时才跑完整审计流程 |
| 5. 独立审查 | [`open-code-review`](open-code-review/SKILL.md)、[`open-code-review-delegate`](open-code-review-delegate/SKILL.md) | 中高风险、跨模块或准备交付的代码改动；选择一种审查路径，不对每个小改动强制委派 |
| 6. 交付完整性 | [`full-output-enforcement`](full-output-enforcement/SKILL.md) | 用户要求完整、无截断的大型输出时；一般代码任务不加载 |

## 视觉参考（不是并行强制流程）

以下技能提供不同设计视角，按实际方向选一个参考，不同时套用：

- [`impeccable`](impeccable/SKILL.md)：界面文案和视觉精修。
- [`gpt-taste`](gpt-taste/SKILL.md)：视觉品味评估。
- [`stitch-design-taste`](stitch-design-taste/SKILL.md)：Stitch 设计产出协作。
- [`high-end-visual-design`](high-end-visual-design/SKILL.md)：高端视觉方向。
- [`minimalist-ui`](minimalist-ui/SKILL.md)：极简方向。
- [`industrial-brutalist-ui`](industrial-brutalist-ui/SKILL.md)：工业粗粝方向。
- `design-taste-frontend-v1`：旧版存档，仅在比较迁移差异时读取；默认使用当前 `design-taste-frontend`。

当前站点的实际视觉正本在 [`DESIGN.md`](../DESIGN.md)，不是以上技能中的通用审美描述。当前为 Astryx Neutral 暖白主题。

## 使用纪律

1. 先读工作流分流结果，再加载当前步骤直接相关的技能；不要把技能数量当作质量指标。
2. 技能是操作参考，项目 `AGENTS.md`、事实正本、页面 SPEC 和用户要求优先。
3. 技能建议与项目现状不符时，不执行冲突步骤；只吸收满足用户目标的部分。
4. 本地技能复制自其他项目/上游不代表自动同步。来源、锁定版本及本地补丁分别见 `skills-lock.json` 与各技能的 `UPSTREAM.md` / `.local-patch.md`（如存在）。
5. 新增技能前先确认同一步骤没有现成技能；可复用能力稳定重复多次后再沉淀，单次提示词不放进技能库。

## 来源

技能由不同来源逐步迁入。旧 README 中的目录数量、项目视觉方向、模型配置和兄弟项目同步说明已不再作为当前事实；逐项以目录和技能内来源文件为准。
