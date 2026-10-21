# Astryx 长文 Outline 实施与交互审计

- 日期：2026-10-10
- 范围：五个法律文档共享模板、Insights 长文共享模板
- Astryx：`@astryxdesign/core@0.6.7` 的 `Outline`

## 结论

Astryx `Outline` 适合统一长文目录的滚动激活和键盘导航，但不应接管正文、URL 或 WordPress 原始
字段。本次采用薄客户端适配器，服务端仍生成可索引全文、稳定 `section-*` ID 和普通 hash 链接。
禁用 JavaScript 后，目录和正文仍完整存在。

## 实现边界

- `LegalDocumentPage` 与 `ProseArticle` 只把 `{ id, label, level }` 传给 `LongformOutline`；
- Outline 使用 Neutral 局部主题、compact 密度和 `offset={0}`；
- 固定 Header 留白继续由目标元素 `scroll-mt-[110px]` 负责，原生 hash 与 JS 增强共享落点；
- 英文、中文、西班牙语、泰语目录标签进入 i18n 字典；
- 正文数据仍来自既有内容接缝，未修改 WordPress 契约。

## Playwright CLI 发现与修复

首次桌面点击第三节后，目标最终顶部为 81.67px，而 Header 底部为 93px。根因不是 Outline offset
不足，而是锚点 `article` 本身作为 `data-reveal-group` 子项参与 translate 入场：浏览器按位移状态
计算滚动，动画结束后目标再上移。修复后锚点保持稳定，reveal 只作用于内部正文；最终目标顶部为
109.67px，Header 底部为 93px。

新增隐私页 axe 代表扫描还发现：该页专属浅色询盘政策面板位于深色 Hero 前，但 Header 初始仍用
透明白字，形成严重对比度失败并遮挡首块内容。现已让 `/support/privacy` 首屏使用实色 Header，并
让面板预留固定导航高度；复扫无 A/AA 违规。

## 交互与视觉证据

- 桌面 1440×900：第三节 hash 与 `aria-current="location"` 一致，目标未被 Header 遮挡，页面溢出 0；
- 移动 390×844：文章 Outline 显示 5 个链接，首项激活，页面溢出 0；
- 两个 Playwright CLI 会话均为控制台 0 error；
- 桌面截图：`outputs/reports/ui-evidence-2026-10-10/astryx-longform-outline/legal-desktop-active.png`；
- 移动截图：`outputs/reports/ui-evidence-2026-10-10/astryx-longform-outline/article-mobile-outline.png`。

## 自动化验收

- 键盘：ArrowDown、Home、End、Enter；
- 导航：hash 更新、最终落点、滚动激活；
- 渲染：无 JavaScript HTML 保留 Outline 链接与全文；
- 响应式：390px 与等效 200% 的 640px 无横向溢出；
- 国际化：四语言标签；
- 可访问性：文章与隐私页均通过 axe WCAG A/AA 代表扫描；
- 质量门禁：41/41 单元测试、lint、typecheck、191/191 production build、53/53 Chromium E2E、
  `git diff --check`。

## 后续边界

轮毂详情浅色首屏 Header tone 仍是独立排队任务；本次只修复由隐私页 axe 直接证明的同类缺陷，
没有扩展为全站 Header 重构，也没有提交、推送或部署。
