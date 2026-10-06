# Capabilities 页面实现

- 日期：2026-10-05
- 状态：已完成
- 路由：`/capabilities#wheel-manufacturing`
- 依据：`PAGE-SPECS/capabilities-wheel-manufacturing.md`

## 范围

- 按 WM01–WM05 重建轮毂工程设计、成形路线、过程检查、验证试验和文件证据。
- 接入 WP 65/67/96/48、82/116、87/115/101、45/43/39。
- 修正错位媒体标题并补 alt、caption、来源、用途。
- 证书 WP 53/106 只修元数据，核准前不公开。
- 删除旧页面的产能占位、固定容差、固定流水线和泛化认证表达。
- 完成桌面/移动视觉、WordPress live、lint/typecheck/build 与生产实例验收。

## 完成结果

- WM01–WM05 已全部实现，旧产能占位、固定容差、线性工序和泛化认证表达已移除。
- 12 张公开媒体通过单次 WordPress REST 请求读取，并有同图 WebP 回退。
- WP 96/48/87/115/101/53/106 错位标题已修正；14 张相关媒体已补 alt、caption、来源、用途与批准状态。
- 证书 WP 53/106 未公开。
- CTA 保留 `product_line=wheels` 与 `intent=manufacturing_capability`。

## 验收

- `npm run check`：通过。
- 桌面 1440×900：完整页、12 张图片加载、无横向溢出。
- 移动 390×844：完整页、12 张图片加载、`scrollWidth = 390`。
- 补测 1280×800 与 360×800：12 张图片加载，`scrollWidth` 分别等于 1280 与 360。
- standalone 生产实例：`GET /capabilities` 返回 200，0.56 秒，HTML 使用 12 个 WordPress 媒体 URL。
- 页面扫描：无 `PLACEHOLDER`、227 kg、12,000 t 等旧数字或竞品残留。
- 视觉交付：`outputs/capabilities-page-review/`。
