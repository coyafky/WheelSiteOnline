# 轮毂公开目录架构分析

- 日期：2026-10-06
- 状态：已完成讨论稿，待业务确认后转为架构决策

## 目标

在改造轮毂目录之前，确认真实事实、WordPress 发布、目录、详情、旋压、sitemap
和询盘之间的统一接缝，避免五条路径分别实现发布规则。

## 结果

- 形成 `outputs/designs/wheel-publication-architecture-2026-10-06.md`。
- 建议新增公开轮毂目录深模块，四个接口覆盖目录、详情、sitemap 与询盘复核。
- 发现 108 组重复型号、77 组重复 productionCode、15 组 styleName 冲突、2 组
  process 冲突和 5 个特殊字符型号，证明 model 不能直接作为全局事实主键。
- 建议使用 `来源目录 + model` 识别源记录，由 WordPress 发布记录人工组合为稳定
  public slug；重复型号不自动合并。
- 本轮没有修改架构正本、类型或应用代码；待方案确认后再更新 ARCHITECTURE 与
  DECISIONS，并进入实现。
