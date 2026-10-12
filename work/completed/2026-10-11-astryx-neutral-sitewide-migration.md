# 全站 Astryx Neutral 界面迁移

- 提出日期：2026-10-11
- 来源：用户希望全站采用 Astryx Neutral 主题和组件，同时保留 Next.js 前端、WordPress 内容后端。
- 状态：**已完成界面迁移与 P0–P5 本地回归（2026-10-11）**；商用上线另受 `work/queued/2026-10-08-commercial-launch-remediation.md` 约束，当前 No-Go。最终交接见 `outputs/reports/33-astryx-p5-final-commercial-seo-handoff-2026-10-11.md`。下方“尚需／不得标记完成”是 P5 前的阶段记录。

## 2026-10-11 已完成的切片与剩余工作

- 全站根 Theme、本地 Neutral 源码/静态 CSS、品牌暖白令牌与构建漂移校验已接入。
- Header/Footer、首页、通用 PageHero、产品总览和轮毂目录已转暖白；现有 Astryx 控件统一读取本地主题。保留服务端 GET、真实变体、WordPress 接缝与询盘落库语义。
- Playwright CLI 对 19 个代表路由 × 4 视口完成 76 次 200/主题/横向溢出检查；筛选与直接询盘弹窗做了交互和截图；移动宽度缺陷已修复。
- 尚需：逐页处理其余旧深色 Hero 模板；补齐全路由、四语言视觉和键盘/axe 审计；在独立 mock 测试服务器上重跑完整 Chromium E2E，不可复用真实 SMTP 环境。
- 给 Alma 的交接：`outputs/reports/24-astryx-neutral-warm-handoff-alma-2026-10-11.md`；分阶段执行计划：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`。P0 兼容性基线、P1 共享外壳与首屏、P2 询盘、P3 产品、P4 内容与工具、P5 全站回归已拆入 `work/queued/`。本任务不得标记完成。

## 目标与边界

让所有公开页面共享一套 Neutral 派生的颜色、字体、间距、圆角、焦点和反馈规范。可复用的导航、面包屑、表单、弹窗、提示、标签、目录等交互优先使用 Astryx 或经过验证的薄适配器。首页品牌视觉、轮毂卡片、真实规格表、文章正文和其他业务模块可以继续由本项目组件渲染，但必须遵守统一令牌和状态规范。

数据流保持 `WordPress 已批准内容 → 服务端适配器 → src/content 稳定视图契约 → Next.js 页面/领域组件 → Astryx 界面原语`。Astryx 不读取 WordPress 原始 JSON，也不决定产品发布资格、真实变体、询盘持久化或邮件结果。

`@astryxdesign/core@0.6.7` 和 `@astryxdesign/theme-neutral@0.6.7` 已安装、CSS 已引入；`npx @astryxdesign/cli theme add neutral` 用于复制可编辑主题源码，并不会自动迁移页面。若采用该命令，先核对与项目依赖相同的 CLI 版本、目标路径、生成文件和构建方式，避免无意覆盖已有令牌。

## 文档施工顺序

1. 在 `DECISIONS.md` 新增全站呈现策略，说明与 DEC-082（局部 Theme）、DEC-084（选择性组件迁移）的关系；DEC-087、DEC-086 已验证的筛选与分页限制在替代方案通过验收前继续有效。
2. 在 `ARCHITECTURE.md` 增加主题/组件层、服务端和客户端边界、WordPress 内容接缝及无 JavaScript 回退；如令牌的唯一来源由 `globals.css` 变更，再同步 `AGENTS.md` §7.3。
3. 新增 `PAGE-SPECS/astryx-neutral-global.md` 作为**拟实施的全站界面规格**：颜色与品牌映射、字号和密度、浅色/深色区、导航和底部行动、组件选用/例外、状态、四语言、可访问性、响应式及截图验收。`DESIGN.md` 是现有设计的实测记录，应在验证新系统后回写实际结果，不能提前把提案写成已实现。
4. 更新 `PAGE-SPECS/2026-10-04-launch-viewport-spec.md` 和已存在的逐页规格：保持每屏任务、内容证据、产品/询盘事实；补充每个模块的 Astryx 映射、主题模式和交互状态。
5. 为目前缺少现行子规格的页面族补规格：全局站点外壳、`/products`、Insights/文章/孔距指南、Fitment、Tools/偏距计算器、法律与感谢页。同步 `PAGE-SPECS/README.md`、`PAGE-SPECS/index.md`、`DOCUMENTATION.md`；修正索引里已过时的“轮毂目录/详情待实现”等状态。
6. 按纵向切片实施后，更新 `STATUS.md`、任务记录和截图/验收报告；若修改 `src/content/types.ts`，另记 WordPress 内容契约决定。

## 页面切片与验收

1. 共享外壳：Theme 范围、Header、导航、语言切换、页脚、原位询盘入口、面包屑；保留 Next.js 链接和 SEO。全站浮动询盘已按用户决定移除。
2. 转化链：询盘页、直接询盘 Dialog、询盘清单、错误/提交/成功反馈；数据库保存成功仍是询盘成功最低标准。
3. 产品链：目录筛选、排序、分页、产品卡、详情变体和四条产品线能力页；筛选 GET URL、真实同变体交集、无图不上架及无 JavaScript 基线不得退化。
4. 内容链：首页、About、Capabilities、Insights、Fitment、Tools 和法律页；WordPress 已批准正文、媒体、翻译和撤回状态继续通过既有适配器进入页面。
5. 每个切片核验桌面与 320/390/768 移动视口、键盘/焦点、WCAG 基础扫描、四语言、控制台、无 JavaScript 可用路径、核心 URL/表单行为。完成后再做全站模板族回归与 production build。

## 本轮设计定案

- 用户已明确偏好白色、暖色调。Neutral 作为组件与语义底座；以近白背景、暖灰文字、克制铜色强调构成全站新视觉。现有黑灰橙 `DESIGN.md` 作为旧状态，不再作为迁移后的目标。
- “全部使用 Astryx”的含义：推荐以**全站统一主题、交互原语优先**为目标；业务事实模块使用本项目组件。若要求每个区块都替换为官方 Astryx 导出，需逐个验证组件 API、服务端渲染、可访问性与无 JavaScript 行为，不能预设可行。
