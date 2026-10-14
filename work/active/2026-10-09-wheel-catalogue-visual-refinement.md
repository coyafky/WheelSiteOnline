# 轮毂目录视觉质感优化

## Spec-Driven 元数据

- **Phase**：5（历史活动任务，待按新流程重新确认）
- **Milestone**：待创建/映射
- **GitHub Issue**：[#1](https://github.com/coyafky/WheelSiteOnline/issues/1)
- **Delivery Batch**：待拆分；不得与图片规范化共享未隔离文件集
- **依赖**：首发集合、图片规范和真实公开集合确认
- **S.U.P.E.R 关注**：Single Purpose（仅目录视觉）；Ports over Implementation（保留现有产品契约）；Environment-Agnostic（视口验收不依赖生产环境）
- **验证命令**：`npm run check`、23 项浏览器 E2E、360/390/768/1440px 视口检查、`git diff --check`
- **漂移规则**：若产品集合、组件契约或公开资格变化，drift ≥ 2，回到 Phase 2 重新确认

## 目标

以 Vossen 轮毂目录的留白、无框产品陈列、统一方形图片、居中信息层级和轻量筛选为参考，
优化丰怀轮毂目录；保留现有生产规格筛选、真实图片、事实边界与服务端 URL 契约。

## 验收标准

- [x] 保存桌面/移动参考截图并记录可借鉴与禁止复制项。
- [ ] 产品卡改为白色无框陈列，型号、工艺、尺寸、PCD、配置数量层级清晰。
- [ ] 结果区、筛选栏、排序和分页使用一致的直角/细线视觉语言。
- [ ] 360/390/768/1440px 无横向溢出，筛选与分页行为不退化。
- [ ] `npm run check` 与 23 项浏览器 E2E 通过。
- [ ] 更新状态与截图证据后归档。
