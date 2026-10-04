# work/

管理具有明确生命周期的工作项。

```
work/
├── queued/      # 已确定要做，尚未开始
├── active/      # 当前正在执行
└── completed/   # 已完成
```

生命周期：

```
QUEUED  →  ACTIVE  →  COMPLETED
```

## 规则

- **`active/` 只保留真正正在执行的任务。** 一次打开几十个 active 任务等于没有
  焦点。经验值：同时不超过 3 个。
- 任务开始时从 `queued/` 移到 `active/`；完成时移到 `completed/`。
- **不要删除已完成的任务文件。** 它是历史证据。

## 任务文件格式

文件名用 kebab-case，如 `inquiry-system-db-selection.md`。

```markdown
# <任务标题>

- **状态**：进行中
- **创建日期**：YYYY-MM-DD
- **领域**：<对应的 areas/ 领域，若有>

## 目标

要达成什么。

## 执行结果

做了什么，产生了哪些文件。

## 重要结论

将来需要知道的发现。

## 未解决问题

做完之后仍然敞开的事项。
```

## 当前状态

**三个子目录均为空。** 下一步工作（`STATUS.md` 的 Next Actions）需等
前置问题答复后再建任务文件。
