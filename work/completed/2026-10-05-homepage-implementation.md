# 首页 Page SPEC 实现

- 状态：已完成
- 日期：2026-10-05
- 依据：`PAGE-SPECS/homepage.md`

## 目标

把首页按 H01–H05 实现为四条产品线等权、制造主体清楚、内容接缝稳定的英文首发页面。

## 范围

- 首页类型化内容契约与单一 `productLines` 数据源；
- H01 公司级 Hero；
- H02 四产品线入口；
- H03 六项制造与工程能力；
- H04 五阶段项目路径与分主体证据媒体；
- H05 统一询盘收口；
- metadata、响应式、无 JS/reduced motion、媒体兜底；
- lint、typecheck、build 与桌面/移动视觉验收。

## 不包含

- WordPress live 接线；
- 媒体图权批准；
- 轮毂目录/详情改造；
- 询盘页和生产数据库实现。

## 完成结果

- H01–H05 已按 Page SPEC 接入首页，移除首页旧轮毂条带与通用 Dealer CTA；
- 四条产品线读取统一 `productLines`，首页其他文案读取 `homepageContent`；
- 候选工厂媒体按批准状态门控，未批准时不请求图片并显示工业化兜底；
- 桌面 1440×1000 与移动 390×844 已在真实浏览器验收；
- `npm run lint`、`npm run typecheck`、`npm run build` 全部通过；本地 WordPress 运行时目录已从 ESLint 源码范围排除。
- 用户后续批准首页四张工厂媒体；已核对 WordPress 原图，并用 WP 114 的真实厂区航拍替换此前错配的本地兜底图。
- 后续按用户确认把公开归属改为“我们的制造基地”，同时保留法人文件按实际主体展示的边界。
- 首页媒体已接入 Headless WordPress live 适配器；WP 114/61/78/155 的英文 alt、caption、批准状态与使用范围已写回本地媒体库，且保留同图本地兜底。
- `WP_MODE=live` + 本地 WordPress REST 环境下，`npm run check` 与浏览器图片加载验收均通过。
