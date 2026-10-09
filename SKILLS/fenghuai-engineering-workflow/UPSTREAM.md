# 上游来源与版本固定

## 来源

- 仓库：`mattpocock/skills`
- 固定版本：`v1.3.1`
- 许可证：MIT
- 引入日期：2026-10-08
- 引入方式：功能归并、中文适配，不复制上游英文项目记录模板

## 纳入的方法来源

| 上游文件 | v1.3.1 Git blob SHA | 本地去向 |
|---|---|---|
| `skills/engineering/tdd/SKILL.md` | `250871ccdfefa7525309acfebda090edf4046882` | `references/tdd-and-diagnosis.md` |
| `skills/engineering/diagnosing-bugs/SKILL.md` | `1b929e29fb519c26b500d3eda744177986883ac8` | `references/tdd-and-diagnosis.md` |
| `skills/engineering/to-spec/SKILL.md` | `3f52599ae2a4347aee5a07432c2707518e691a7f` | `references/spec-and-tickets.md` |
| `skills/engineering/to-tickets/SKILL.md` | `e868c831fcfb1e124e010bcdf84a429ec879160f` | `references/spec-and-tickets.md` |
| `skills/engineering/code-review/SKILL.md` | `e28d7acbf7b3bb4d7817b7eb5d9c105af03f6ec4` | `references/review-and-retro.md` |
| `skills/engineering/retro/SKILL.md` | `12149acf2dd23b4514dec57b04a6293eaa1352fa` | `references/review-and-retro.md` |
| `skills/engineering/domain-modeling/SKILL.md` | `a4438c6879c517d1a08e2b5fbca049b632688dfe` | 主技能的文档路由与术语纪律 |
| `skills/engineering/implement/SKILL.md` | `7a0b11f5f4fe9505ea5c7983c3083ba1bf754f69` | 主技能的实现与完成链路 |

## 更新方法

1. 用 GitHub API 比较上游新 tag 与上述 blob SHA。
2. 阅读对应上游文件的完整差异。
3. 只吸收能改善本项目的方法，不覆盖 `.local-patch.md` 中的强制偏离。
4. 所有本地项目记录仍使用中文。
5. 更新本文件、`.local-patch.md`、`skills-lock.json` 与 `SKILLS/README.md`。
6. 运行技能结构检查和 `git diff --check`。
