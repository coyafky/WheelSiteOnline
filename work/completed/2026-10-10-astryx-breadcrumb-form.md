# Astryx 面包屑与询盘表单第一切片

- **状态**：已完成
- **开始日期**：2026-10-10
- **完成日期**：2026-10-10
- **目标**：使用 Astryx Neutral 的真实组件替换询盘路径中的面包屑与可见表单控件，保持既有业务契约不变。

## 验收条件

1. 根布局接入 Astryx Neutral 样式、Next.js `LinkProvider` 与当前语言环境；Neutral
   `Theme` 局部包围 Astryx 表面，避免污染既有页面；
2. `/request-a-quote` Hero 使用 Astryx `Breadcrumbs`，当前项不可点击且带 `aria-current`；
3. 两步询盘表单使用 Astryx 表单组件、校验状态和按钮，仍保留 Zod、错误聚焦、幂等键、购物清单与原 API 载荷；
4. 英文、中文、西班牙语使用 Astryx 官方语言包；泰语只覆盖本切片用到的内置短语，其余英文回退保持可见；
5. 桌面与移动端无横向溢出，键盘、axe、201/200/422/429/数据库失败/邮件失败回归通过；
6. `npm run lint`、`npm run typecheck`、`npm run build` 通过，并保存 UI 截图证据。

## 非目标

- 不一次性重写全站 UI；
- 不引入或伪造“Meta 品牌主题”；
- 不改变 `src/content`、WordPress REST 或询盘持久化契约；
- 不自动提交、推送或部署。

## 完成结果

- 新增根级链接与四语言 Provider，以及复用型 `SiteBreadcrumbs`；
- `/request-a-quote` 面包屑和询盘表单使用 Astryx 原生组件；
- 保留 Zod、焦点定位、两步流程、清单、幂等键和后端载荷；
- 明确 CSS 级联层并把 Neutral 主题限制在 Astryx 表面；
- 自动化验证全部通过：31/31 单元测试、31/31 Chromium E2E、lint、typecheck、191 页面
  production build、生产依赖审计 0 漏洞；
- 桌面与移动截图存于 `outputs/reports/ui-evidence-2026-10-10/astryx/`。

## 未决与后续

- 其余页面中手写的面包屑尚未批量迁移；
- 目录筛选器可作为下一条纵向切片，但必须保持筛选 URL、移动抽屉与键盘行为；
- Astryx 当前仍为 beta，升级前必须重新跑完整询盘与无障碍回归。
