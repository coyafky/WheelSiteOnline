# Astryx 长文目录 Outline 切片

- **状态**：已完成
- **创建日期**：2026-10-10
- **开始日期**：2026-10-10
- **完成日期**：2026-10-10
- **优先级**：P1
- **来源**：`outputs/reports/18-astryx-all-page-ui-audit-2026-10-10.md`

## 范围

用 Astryx `Outline` 渐进增强 `LegalDocumentPage` 与 `ProseArticle` 的共享目录。继续使用现有
`section-*` ID、服务端正文和 `href="#section-*"`，不把 WordPress 原始字段交给组件。

## 实施结果

- 新增 `LongformOutline` 薄客户端适配器，法律文档与 Insights 文章共享；
- 服务端保留正文、标题、section ID 与普通 hash 链接，无 JavaScript 时仍可浏览全文；
- 补齐英文、中文、西班牙语与泰语目录标签；
- 支持滚动激活及 ArrowDown、Home、End、Enter 键盘行为；
- 把声明式 reveal 移到锚点内部，避免动画结束后目标被固定 Header 遮挡；
- 将文章页和隐私页加入 axe 代表路由；由此发现并修复隐私页浅色首屏 Header 对比度及顶部遮挡。

## 验收证据

- Playwright CLI：桌面目标顶部 109.67px、Header 底部 93px、横向溢出 0、控制台 0 error；
- 390×844：Outline 5 个链接、首项滚动激活、横向溢出 0、控制台 0 error；
- 自动化覆盖 hash、scroll spy、键盘、四语言、无 JS、390px、等效 200% 与 axe；
- `npm test`：41/41；
- `npm run lint`：通过；
- `npm run typecheck`：通过；
- `npm run build`：191/191 页面；
- Chromium E2E：53/53（单 worker 稳定复验）；
- `git diff --check`：通过。

## 产出

- 报告：`outputs/reports/21-astryx-longform-outline-2026-10-10.md`；
- 桌面截图：`outputs/reports/ui-evidence-2026-10-10/astryx-longform-outline/legal-desktop-active.png`；
- 移动截图：`outputs/reports/ui-evidence-2026-10-10/astryx-longform-outline/article-mobile-outline.png`；
- 决定：DEC-091。

未提交、推送或部署。
