# PAGE-SPECS 页面施工图模块新建

- **状态**：已完成
- **创建日期**：2026-10-01
- **领域**：页面规格（PAGE-SPECS）

## 目标

把「为什么这样设计」（决策与取舍）和「照着搭什么」（骨架、逐块规格、组件、
数据契约）拆成两个目录各管一头，让要动手搭页面的人不必先读完一篇讲道理的长文
才能找到「第几段用什么组件」。

## 执行结果

新建 `PAGE-SPECS/` —— 按路由命名的页面施工图模块。

**实测目录内共 22 个 `.md` 文件**，分三类：

| 类别 | 数量 | 文件 |
|---|---|---|
| 公共文件 | **3** | `README.md`、`_components.md`、`_viewport-audit.md` |
| 模块索引（`index.md`） | **5** | 根 `index.md` + `products/`、`dealers/`、`fitment/`、`insights/` 各一 |
| 页面规格 | **14** | 见下 |

14 份页面规格实测清单：

```
about.md                     products/custom-aluminum.md
capabilities.md              products/ev-components.md
contact.md                   products/safety-tires.md
custom-development.md        products/wheels.md
dealers/private-label.md     products/wheels/[model].md
index-home.md                products/wheels/series/[series].md
request-a-quote.md
thank-you.md
```

> ⚠️ **数字更正**：任务描述里写「22 个文件 = 18 份页面规格 + 3 份公共 + 1 份
> 模块总表」，实测**对不上**。真实拆分是 **14 份页面规格 + 5 份 `index.md`
> 模块索引 + 3 份公共文件 = 22**。`DEC-015` 与 CHANGELOG 里「18 份页面规格」
> 的表述同样与实测不符，均需回改（见「未解决问题」）。

**每份规格固定 7 节**：① 一句话判断 → ② 骨架（段数表 + 组件树）→ ③ 逐块规格
（**含真实 TS props 契约**）→ ④ 组件清单（复用 / 新建）→ ⑤ 数据契约 → ⑥ 布局
响应式 → ⑦ 待补阻塞。

公共引用集中在 `PAGE-SPECS/_components.md`（现有组件 + 全部设计 token +
图片资产真相）。

`PAGE-SPECS/_viewport-audit.md` —— 视口合规审查报告，实测 **123239 字节**
（约 122 KB），**83 个视口 / 24 条合并建议**。

## 重要结论

1. **与 `ARCHITECTURE/page-architecture/` 的分工**（`DEC-015`）：
   - `ARCHITECTURE/page-architecture/` = 「**为什么这样设计**」（决策、取舍、竞品对照）
   - `PAGE-SPECS/` = 「**照着搭什么**」（骨架、逐块规格、组件、数据契约）
   - **按路由命名**是刻意的：一个 worker 拿到一条路由就能找到唯一对应的那份
     规格，不需要先建索引。
2. **第 ③ 节写真实 TS props 契约**，是为了让 developer 不必回头猜组件接口 ——
   施工图必须是**可执行**的。
3. **新建共享组件的优先级由规格统计得出**（按引用页数排序）：
   `DataNotice`（6 页）/ `RouteBlock`（4）/ `ProcessSteps`（4）/ `WheelCard`（4）/
   `FaqAccordion` / `StatStrip` / `CapabilityGrid` …
   **实现顺序建议**：先做 `DataNotice`（6 处用，且是纪律要求），再做
   `WheelCard`，然后 `RouteBlock` / `ProcessSteps` / `StatStrip`。
4. **阶段裁剪（用户定案）**：`/gallery`、`/gallery/finishes`、`/tools`、
   `/tools/offset-calculator` **本阶段不做** —— 分别因为无素材、只有示意值、
   代码已存在无需施工图。**代码保留不删，只是不进本轮施工范围。**
5. **新增页面必须先出规格再动手** —— 否则第 ⑦ 节「待补阻塞」形同虚设，会把
   不确定性带进写代码阶段。

> **口径说明（2026-10-01 核准）**：`PAGE-SPECS/` 共 **22 个 .md** =
> **18 份路由规格** + **3 份公共文件**（`README.md` / `_components.md` / `_viewport-audit.md`）
> + **1 份模块总表**（`index.md`）。
> ⚠️ `dealers/index.md`、`fitment/index.md`、`insights/index.md`、`products/index.md`
> **是路由 `/dealers` 等页面的规格，不是模块索引** —— 不要按文件名把它们归成索引页。
> 早先出现过「21 份」「19 份」等错数，均已作废。

## 未解决问题

- **规格数口径需回改**：实测 14 份页面规格（不是 18），`DEC-015` 与
  `CHANGELOG.md` `[0.1.0]` 的表述需一并更正。（本任务只记事实，未改这两份文件。）
- **轴心改造待做**：`DESIGN.md §0.5.6` 已声明规格轴心应改为「视口 → 段 →
  组件 → 内容」，但现有规格仍是「第 N 段」写法，**文档与规格当前不一致**。
  → 后续任务见 `work/queued/page-specs-axis-migration.md`（牵动全部 22 份文件）。
- **执行阶段的下一步**：按优先级先建 `DataNotice` 等 4 个共享组件；执行情况
  受 `STATUS.md` Next Actions 第 0 条（补 `WheelSku` 规格字段）前置约束。
