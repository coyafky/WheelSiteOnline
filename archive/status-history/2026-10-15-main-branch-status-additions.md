# 2026-10-15 main 分支状态补录（历史快照）

来源：合并前 `origin/main` 的根目录 `STATUS.md` 新增段落。其流程与双语状态描述只反映 2026-10-15 当时判断；当前状态以 [任务正本](../../docs/implementation/TASKS.md) 和 [目标架构](../../docs/architecture/TARGET_ARCHITECTURE.md) 为准。

## 2026-10-15 Spec-Driven Develop 治理迁移

**流程治理已建立，当前业务状态不变，发布判断仍为 No-Go。** 本轮新增唯一 Spec-Driven Develop 正本、Deep Discuss、Review SPD、`docs/progress/MASTER.md` 与模板；现行 active/queued 任务已补充 Phase、Milestone/Issue 占位、依赖、Delivery Batch、S.U.P.E.R、验收和验证元数据。`work/completed/` 与 `archive/` 保持历史原文和原结论，不补造 GitHub Issue/PR。

- 当前模式固定为 `GITHUB_FULL`：Issue 为任务事实，Milestone 为阶段聚合，Project 为跨阶段看板，Delivery Batch/批次 PR 为集成边界，本地 `work/` 保存中文规格和证据。
- GitHub 只读核对：仓库 `coyafky/WheelSiteOnline`，默认分支 `main`，账户 `coyafky` 权限 `ADMIN`；当前 Issue 为空，Milestone API 返回空。
- GitHub Project 未能验证：当前 token 缺少 `read:project` scope；没有刷新权限，也没有伪造 Project 编号或字段。待用户/管理员决定是否补 scope 后再创建看板。
- 本轮未创建 Issue/Milestone/Project/PR，未 commit、push、deploy、改 DNS 或发信。外部资源创建仍限于本次流程治理授权，并须逐项检查重复项和目标。
- 当前治理迁移 drift score 为 `1/5`；若后续达到 2 重新分解，达到 3 回 Phase 2，达到 4–5 停止并进入 Deep Discuss。
- 未验证：Project 字段、worktree 互斥、PR 自动关联、归档脚本和 GitHub 写入后的实际看板行为。

证据入口：[`docs/progress/MASTER.md`](../../docs/progress/MASTER.md)、[`SKILLS/spec-driven-development/SKILL.md`](../../SKILLS/spec-driven-development/SKILL.md)、[`SKILLS/deep-discuss/SKILL.md`](../../SKILLS/deep-discuss/SKILL.md)、[`SKILLS/review-spd/SKILL.md`](../../SKILLS/review-spd/SKILL.md)。

## 2026-10-15 中英双语缺译合同收口

**当前判断仍为 No-Go。** 本阶段冻结为英文根路径 + 中文 `/zh/*`；`es/th` 未注册、未创建字典，也不属于当前支持语言。中文正文仍未逐页完成，未批准中文页面继续保持 `noindex`，不进入 sitemap，不输出已批准的中文 hreflang。

本阶段完成：

- i18n 语言注册继续只包含 `en` 与 `zh`，字典由英文键集推导，中文通过 `satisfies` 做编译期完整性校验；
- UI 字典缺键不再回退英文，而是返回可见键名；新增 `resolveLocalized()`，缺失或未批准的正文翻译返回 `unavailable`，已批准翻译才返回 `translated`；
- 新增 `tests/i18n-coverage.test.mts`，覆盖注册语言、字典键集、UI 缺键 fail-closed、正文翻译状态和索引资格；专项 i18n 测试 8/8 通过；
- 发现计划指定的 `work/active/2026-10-12-full-site-four-language-implementation.md` 在当前工作树不存在，未伪造任务文件或把四语言计划标成完成；当前活动任务以实际目录为准。

验证与阻塞：

- `node --experimental-strip-types --test tests/i18n-coverage.test.mts tests/i18n-routing.test.mts`：8/8 通过；
- `npm test`：20/21 通过，唯一失败因工作区没有 `node_modules`，`zod` 无法加载；
- `npm run typecheck`、`npm run lint`、`npm run build`：依赖未安装，无法完成，不能标记通过；未运行 Playwright 浏览器验收；
- 下一切片：依赖恢复后重跑完整门禁，再进行旋压轮毂页面浏览器验收与中文正文迁移。当前不得开放中文索引或启动 `es/th` 扩展。
