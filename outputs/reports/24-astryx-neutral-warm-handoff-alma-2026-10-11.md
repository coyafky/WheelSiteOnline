# 给 Alma：Astryx Neutral 暖白全站迁移交接

- 日期：2026-10-11
- 状态：**进行中，不是全站完成验收**。
- 用户决定：全站目标为白色、暖色调；旧 `DESIGN.md` 的黑灰橙/深色开场是历史实测，不是新的设计目标。
- 总任务：`work/active/2026-10-11-astryx-neutral-sitewide-migration.md`；全站组件化执行计划：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`。

## Alma 接手顺序

1. 先看 `git status`、本交接和全站计划；不要把这份交接的上一轮证据当作全站验收。
2. 首先执行 `work/queued/2026-10-11-astryx-component-compatibility-matrix.md`（P0），核对 0.6.7 实际组件 API 与 31 个渲染模板。之后执行共享外壳/首屏 P1、询盘 P2、产品 P3、内容/工具/政策 P4；各任务在 `work/queued/`，依赖与完成条件见全站计划。
3. 最后执行 `work/queued/2026-10-11-astryx-sitewide-regression-closure.md`（P5），证据齐全才收口总任务。不要把 WordPress 正文、产品事实或询盘落库判断“替换”为 Astryx；Astryx 只负责界面层。

## 已落地

1. 使用 `@astryxdesign/cli@0.6.7` 复制并构建 Neutral 源码。入口 `src/theme/fenghuai-neutral/neutralTheme.ts`，产物 `site-theme.css`、`neutral.js` 及声明文件；`package.json` 增加 `theme:build`/`theme:check`，`npm run check` 先查产物漂移。CLI 虽提示 `theme add` 源码复制接口将弃用，但 0.6.7 本轮可用；不要运行会重置现有项目配置的 `init`。
2. `src/app/providers.tsx` 在根层提供 `Theme mode="light"`；`src/app/globals.css` 的 `--fh-*` 仍是品牌色的单一数值来源，本地主题通过 CSS 变量引用。Figtree 用 `next/font` 加载。既有 Astryx 组件改用本地主题；未把内容/业务组件改成 WordPress 原始 JSON 消费者。
3. Header、Footer、首页、共享 PageHero、产品总览、轮毂目录改成暖白底/暖灰文字/铜色动作。轮毂目录移动照片加浅色遮罩，首屏隐藏遮挡正文的悬浮询盘。保留目录服务端 GET 与分页普通链接、产品事实和询盘 API。
4. 320px 巡检发现网格最小内容宽度与不换行 CTA 导致 About、Capabilities、轮毂目录/旋压排序、锻造、定制铝件横向溢出；相关组件加 `min-w-0`、可换行的长按钮或可收缩的排序栏。没有全局强制裁切内容。
5. 规格与记录：DEC-093、`docs/adr/2026-10-11-astryx-warm-light-presentation.md`、`PAGE-SPECS/astryx-neutral-global.md`、`PAGE-SPECS/astryx-neutral-page-families.md`、`ARCHITECTURE.md`、`DESIGN.md` 顶部迁移说明，以及页面规格索引均已更新。

## 本轮证据

- 最终代码改动后完整 `npm run check` 通过：主题产物新鲜度、42/42 单元测试、lint、typecheck、production build（191/191 静态页面生成）；`git diff --check` 亦通过。
- Playwright CLI 在本仓库的 `http://127.0.0.1:3200` 检查 19 个代表路由 × 320、390、768、1440 四视口：共 76 个路由-视口组合，全部 HTTP 200、无页面级横向溢出；320 的 19 个路由均见到 `data-astryx-theme="neutral"`。
- 320 目录 `Filter wheels` 按钮可点击并展开 `Filter the wheel catalogue` 表单；DX424 的 `Request this wheel model` 打开当前页原生 Astryx Dialog；320/768 截图无遮挡关闭入口，320 页面没有横向溢出。测试没有提交真实询盘或发信。
- 浏览器代表流程的 `console error` 为 0。截图：`outputs/reports/astryx-warm-home-current.png`、`astryx-warm-quote-current.png`、`astryx-warm-wheel-catalog-after.png`、`astryx-warm-wheel-catalog-320-after.png`、`astryx-warm-wheel-filter-320.png`、`astryx-direct-dialog-320.png`、`astryx-direct-dialog-768.png`。

## 必须接着做

1. **逐页视觉收尾**：仍有约 21 个文件含旧深色 Hero 模板。它们并非都应机械转白；按实际照片、文字对比和业务任务逐一处理。不要用全局 `section#top` CSS 强改——本轮试探性方案未采纳。完成后才把 `DESIGN.md` 其余历史色彩章节整体更新为实测新系统。
2. **组件收尾**：全站已有共同 Theme，**不等于每个区块都改成官方 Astryx 组件**。继续沿 `PAGE-SPECS/astryx-neutral-page-families.md` 查官方导出和 SSR/无 JS/键盘行为。导航、服务器 GET 筛选、真实工程规格、已批准 WordPress 正文不应仅为了覆盖率替换。
3. **完整回归**：四语言与全部页面模板、键盘/axe、Validation/Submitting/Success/Server Error 截图要重新跑；当前 76 次检查只证实 200/溢出/主题，不替代这些验收。独立 mock 服务器上的完整 Playwright 套件尚未在本切片重跑；现有 3200 开发进程占有 Next 开发锁。保持 `WP_MODE=mock`，绝不把测试指向真实 QQ SMTP。
4. **设计和业务边界**：询盘只有 WordPress/MySQL 已持久化才成功；Outbox/QQ SMTP 是后续状态。型号无图/未批准不公开；实际 variant 不得由尺寸笛卡尔组合伪造；已批准内容经 `src/content` 稳定契约供组件消费。

## 安全与工作树

开始时仓库已有大量未提交的询盘、WordPress、E2E 等改动；本切片在同一工作树上叠加，**未清理、覆盖或提交那些改动**。没有 commit、push、deploy，也没有向真实邮箱发信。Alma 接手时先读 `git status`，再按本交接的文件和报告区分本切片与此前修改。
