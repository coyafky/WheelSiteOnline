# 页面长图与教学白板索引（2026-10-19）

本轮用 Playwright CLI 对本地开发站 `localhost:3000` 的 33 个路由模板截取桌面 1440×900 全页长图，并将图片逐条附到 [Notion 页面记录](https://app.notion.com/p/841a05e0dda44e32b27a053db959c077)。[Notion 长图索引](https://app.notion.com/p/3fe8de6ee7d281a49650e0f9805c2e6a?pvs=204) 提供逐页跳转；上传 ID、文件哈希与实例路径见 [机器清单](page-screenshot-manifest-2026-10-19.json)。

**口径**：25 个普通页面、3 个动态模板示例、5 个兼容重定向。动态模板不代表全部实例；重定向图展示最终页面而非独立视觉页面。截图不是生产证据，也不替代移动端、交互、内容审批或上线验收。

后续的 390×844 移动端烟测、8 张重点页面手机长图、关键交互和 404 状态证据见[移动端与关键交互核验](mobile-interaction-acceptance-2026-10-19.md)。两轮的设备条件和验收边界不同，不应合并成“全端通过”。

| 路由模板 | 截图口径 | Notion | 本地文件 |
|---|---|---|---|
| `/` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d28195bb93cf90d7bd339f) | [长图](../../outputs/project-audit/page-screenshots/PAGE-HOME.png) |
| `/about` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2810aa15edecbd88f377f) | [长图](../../outputs/project-audit/page-screenshots/PAGE-ABOUT.png) |
| `/capabilities` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281c28b91f62ed7050ff8) | [长图](../../outputs/project-audit/page-screenshots/PAGE-CAPABILITIES.png) |
| `/contact` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2815b85b6d2b73eb044a4) | [长图](../../outputs/project-audit/page-screenshots/PAGE-CONTACT.png) |
| `/custom-development` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281a38e3cd0757a89cd22) | [长图](../../outputs/project-audit/page-screenshots/PAGE-CUSTOM-DEVELOPMENT.png) |
| `/dealers` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2815fa505e5f0004758cb) | [长图](../../outputs/project-audit/page-screenshots/PAGE-DEALERS.png) |
| `/dealers/private-label` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281cfa1cddf8e288b1847) | [长图](../../outputs/project-audit/page-screenshots/PAGE-DEALERS-PRIVATE-LABEL.png) |
| `/insights` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281a78767c87de76eb86c) | [长图](../../outputs/project-audit/page-screenshots/PAGE-INSIGHTS.png) |
| `/insights/[slug]` | 动态示例：`/insights/forged-vs-cast` | [记录](https://app.notion.com/3fd8de6ee7d281179e53d4c0f727a9b1) | [长图](../../outputs/project-audit/page-screenshots/PAGE-INSIGHTS-SLUG.png) |
| `/insights/bolt-patterns` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d28112a36ce94744baa3f3) | [长图](../../outputs/project-audit/page-screenshots/PAGE-INSIGHTS-BOLT-PATTERNS.png) |
| `/insights/bolt-patterns/[pattern]` | 动态示例：`/insights/bolt-patterns/5x112` | [记录](https://app.notion.com/3fd8de6ee7d281e1a418f6c06087fc49) | [长图](../../outputs/project-audit/page-screenshots/PAGE-INSIGHTS-BOLT-PATTERNS-PATTERN.png) |
| `/manufacturing` | 兼容重定向：→ `/capabilities` | [记录](https://app.notion.com/3fd8de6ee7d28191b27de2d8171ea559) | [长图](../../outputs/project-audit/page-screenshots/PAGE-MANUFACTURING.png) |
| `/products` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2810db3ddfd8eee7ad3bb) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS.png) |
| `/products/custom-aluminum` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2811db98cd27297785beb) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS-CUSTOM-ALUMINUM.png) |
| `/products/ev-components` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281adbc65cc0edd00739f) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS-EV-COMPONENTS.png) |
| `/products/safety-tires` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d28155bae3c2cc3ac1a4c4) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS-SAFETY-TIRES.png) |
| `/products/wheels` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2814986b1e3ee2fa7f1d6) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS-WHEELS.png) |
| `/products/wheels/[model]` | 动态示例：`/products/wheels/a015` | [记录](https://app.notion.com/3fd8de6ee7d2815d9289ca64e98c42bd) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS-WHEELS-MODEL.png) |
| `/products/wheels/flow-formed` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d28147a40dede7027fa4c9) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS-WHEELS-FLOW-FORMED.png) |
| `/products/wheels/forged` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281fa8b62e199f3d01362) | [长图](../../outputs/project-audit/page-screenshots/PAGE-PRODUCTS-WHEELS-FORGED.png) |
| `/request-a-quote` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281c8a62df7605e83c8e4) | [长图](../../outputs/project-audit/page-screenshots/PAGE-REQUEST-A-QUOTE.png) |
| `/resources` | 兼容重定向：→ `/insights` | [记录](https://app.notion.com/3fd8de6ee7d2816182a0d4a14e72e0e6) | [长图](../../outputs/project-audit/page-screenshots/PAGE-RESOURCES.png) |
| `/resources/[slug]` | 兼容重定向：→ `/insights/forged-vs-cast` | [记录](https://app.notion.com/3fd8de6ee7d281e6a879d32934c0c37d) | [长图](../../outputs/project-audit/page-screenshots/PAGE-RESOURCES-SLUG.png) |
| `/resources/bolt-patterns` | 兼容重定向：→ `/insights/bolt-patterns` | [记录](https://app.notion.com/3fd8de6ee7d2817c9c9eea0541ef7319) | [长图](../../outputs/project-audit/page-screenshots/PAGE-RESOURCES-BOLT-PATTERNS.png) |
| `/resources/bolt-patterns/[pattern]` | 兼容重定向：→ `/insights/bolt-patterns/5x112` | [记录](https://app.notion.com/3fd8de6ee7d2811b9825f1499d8b4ad2) | [长图](../../outputs/project-audit/page-screenshots/PAGE-RESOURCES-BOLT-PATTERNS-PATTERN.png) |
| `/support/privacy` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281428182f1ac6c9ebe62) | [长图](../../outputs/project-audit/page-screenshots/PAGE-SUPPORT-PRIVACY.png) |
| `/support/returns` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281798023e611d4daba25) | [长图](../../outputs/project-audit/page-screenshots/PAGE-SUPPORT-RETURNS.png) |
| `/support/shipping` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d28129985cec6beb7b0e0a) | [长图](../../outputs/project-audit/page-screenshots/PAGE-SUPPORT-SHIPPING.png) |
| `/support/terms` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2810cbe97e68f8f11b750) | [长图](../../outputs/project-audit/page-screenshots/PAGE-SUPPORT-TERMS.png) |
| `/support/warranty` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2819dbbf9de9af5ad0ccd) | [长图](../../outputs/project-audit/page-screenshots/PAGE-SUPPORT-WARRANTY.png) |
| `/thank-you` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d2818bb907d438d9e4328f) | [长图](../../outputs/project-audit/page-screenshots/PAGE-THANK-YOU.png) |
| `/tools` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281729e3fcabf4570c76c) | [长图](../../outputs/project-audit/page-screenshots/PAGE-TOOLS.png) |
| `/tools/offset-calculator` | 普通页面 | [记录](https://app.notion.com/3fd8de6ee7d281118eadcbb828368fa2) | [长图](../../outputs/project-audit/page-screenshots/PAGE-TOOLS-OFFSET-CALCULATOR.png) |

## 白板教学图

三张图分别讲清 Git / WordPress / Notion 职责、内容公开双重门槛、询盘先保存再通知。可在 [Notion 架构文章](https://app.notion.com/p/3fe8de6ee7d28177b86bd454700482e6) 查看，也可下载本地 [draw.io 源文件](../../outputs/project-audit/whiteboards/project-core-lessons.drawio) 或 [压缩包](../../outputs/project-audit/whiteboards/project-core-lessons-drawio.zip)。

- [第一课：三本账](../../outputs/project-audit/whiteboards/01-system-ownership.png)
- [第二课：内容发布](../../outputs/project-audit/whiteboards/02-publication-gate.png)
- [第三课：询盘持久化](../../outputs/project-audit/whiteboards/03-inquiry-persistence.png)

## 本轮新发现

`/support/privacy` 的本地页面标题为 **Staging Test Privacy Notice**。对应截图已保留并在 Notion 标注；正式隐私政策仍须法务和内容负责人审核，不能从“页面能打开”推断为可公开内容。
