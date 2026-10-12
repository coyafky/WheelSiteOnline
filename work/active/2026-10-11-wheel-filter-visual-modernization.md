# 筛选栏视觉现代化（Astryx 观感 · 机制不动）

- **状态**：进行中
- **创建日期**：2026-10-11
- **对应页面**：`/products/wheels`（轮毂产品目录）
- **来源**：用户 2026-10-11 指令（选 **A**）+ `ai-dev-workflow` 阶段① 澄清

> ⚠️ **前置更正**：本任务初稿误定为 `/products/wheels` 全页重构 + Astryx 组件替换。
> 用户明确选择 **A 方案：筛选栏太丑/太土，要 Astryx 那种现代观感 —— 但保留原生 checkbox，机制不动、外观照改。**

---

## 1. 目标（一句话）

**把筛选栏从"土"改到"现代"，视觉向 Astryx 看齐；但筛选机制、URL 契约、无 JS 基线全部不动。**

## 2. 🔴 技术路线（为什么这样最省事且零风险）

**关键发现**：现有 `wheel-filter-option.tsx` **已经用了正确的模式** ——

```tsx
<input type="checkbox" className="peer sr-only" ... />   ← 原生 input（机制）
<span className="grid size-4 ... peer-checked:bg-forge">  ← 视觉层（外观）
```

原生 input 用 `sr-only` 藏起来，视觉由**兄弟元素 + `peer` 伪类**承担。

→ **这意味着：外观可以完全重写，而表单提交、`name`/`value`、无 JS 行为一行都不用动。**

### 因此能做 / 不能做

| | 内容 |
|---|---|
| ✅ **能做** | 改视觉元素的颜色/圆角/间距/尺寸/动效/hover 态/选中态/禁用态 |
| ✅ **能做** | 用 Astryx 的设计令牌（颜色、圆角、间距）对齐观感 |
| ✅ **能做** | 改 `CheckboxGroup` 的布局（列数、间距、分隔线、标题层级） |
| ❌ **不能做** | 改 `<input>` 的 `name`/`value`/`type` |
| ❌ **不能做** | 换成 Astryx `CheckboxInput`（DEC-087 实测：它不输出业务 `value`，且强制 `onChange`） |
| ❌ **不能做** | 移除 `sr-only` 原生 input 或改成纯 JS 组件 |

## 3. 范围（做什么）

### 3.1 主改：`WheelFilterOption`（63 行，四组共用）

| 项 | 现状 | 目标 |
|---|---|---|
| 勾选框 | `size-4` 方块 + `✓` 文字 + `border-ink/28` | Astryx 观感：更规整的圆角、更清晰的圆角/描边、选中态更有质感 |
| 间距 | `gap-2` / `min-h-7` | 按 Astryx 密度令牌调整 |
| hover 态 | `group-hover:border-forge` | 更细腻的过渡 |
| 选中态 | `peer-checked:bg-forge` 实心橙 | 保留品牌橙，但过渡更顺 |
| 禁用态 | `peer-disabled:bg-soft` | 视觉弱化更明确 |
| 计数 | `text-[0.7rem] text-steel` | 与 Astryx 数字样式对齐 |

### 3.2 次改：`CheckboxGroup` / `PcdSearchGroup` 的容器观感

- 分组标题层级（`legend` 的 eyebrow 样式）
- 选项列表间距与分隔
- 「Show N more」折叠按钮的视觉（已是原生 `<details>`，只改外观）
- 已选计数 `· N selected` 的呈现（现为纯文字，可考虑 Astryx `Badge` 观感 —— **纯 CSS 实现，不引组件**）

### 3.3 交付物

- 改造前/后截图对比（桌面 + 移动）

## 4. 非范围（不做什么）

- ❌ 不改 `/fitment`（那是另一个页面，错误的初稿已作废）
- ❌ 不改卡片网格（**本次只做筛选栏** —— 用户选的是 A，2①③ 待本轮后再议）
- ❌ 不改筛选机制、URL 参数格式、服务端筛选逻辑
- ❌ 不破坏无 JS 基线（`<details>` + GET 表单保持）
- ❌ 不引入 Astryx `CheckboxInput` / `Collapsible` 等 client 组件到筛选栏
- ❌ 不改数据契约 `src/lib/wheels/*`
- ❌ 不 commit / push / 部署

## 5. 🚧 护栏（用户定案：全锁）

1. **筛选功能本身**（URL 参数 / 服务端筛选）→ 用《QA-轮毂筛选器-测试用例》34 条回归
2. **无 JS 基线**（GET 表单可用）→ 验收矩阵第 7 条
3. **询盘清单**（`AddWheelToInquiryButton`）→ 不能因改样式失效
4. **上架门槛 / 证据纪律** → 无图不上架、规格来自真实 variant
5. **SEO**（canonical / sitemap / 分页 noindex）

## 6. 实测基线（动手前的事实）

| 项 | 值 |
|---|---|
| 筛选栏宽度 | **237px** |
| 控件数 | **40 input / 38 checkbox / 0 select** |
| 选项分布 | PCD **32** ｜ Width **22** ｜ Diameter **12** ｜ Process **10** = **76** |
| 组件分派 | PCD → `PcdSearchGroup`（已有搜索+折叠+pin）｜ 其余三组 → `CheckboxGroup` |
| 已有折叠 | Width 组 `collapseAfter={5}`；其余无 |
| 现有选中标记 | `peer-checked:bg-forge` + `✓` 文字 |
| 原生 input | **已 `sr-only`** → 外观可自由改 ✅ |
| Astryx 版本 | `@astryxdesign/core@0.6.7`（已装） |
| Astryx 主题 | `theme-neutral/theme.css` 已在 `globals.css` 引入 |
| 项目品牌令牌 | `--fh-ink/steel/forge/forge-bright/forge-deep/forge-soft/soft/muted` |

## 7. 对抗性审查（1.3 步）

| 维度 | 审查问题 | 结论 |
|---|---|---|
| **可行性** | 改外观会不会动到机制？ | ✅ **不会** —— input 已 `sr-only`，外观在兄弟元素上，两者解耦 |
| **可行性** | 能不能直接用 Astryx `CheckboxInput`？ | ❌ **不能** —— DEC-087 实测：不输出业务 `value`，且强制受控 `onChange` → 会破坏 URL 筛选 |
| **边界** | 改 CSS 会不会破坏 `peer-*` 伪类链？ | ⚠️ **需注意** —— 视觉元素必须**紧邻** input 且保持兄弟关系，否则 `peer` 失效 → 列为实现约束 |
| **边界** | 390px 移动端会不会溢出？ | ⚠️ 筛选栏 237px 固定宽，视觉元素只能变小不能变大 → 加 390 视口用例 |
| **回归风险** | 无 JS 基线 | ✅ 不涉及 JS，原生 `<details>` 与表单不动 |
| **回归风险** | 焦点可见性（键盘/无障碍） | 🔴 **真风险** —— 现有 `peer-focus-visible:outline-forge`；改样式**必须保住焦点环**，否则键盘用户失去焦点指示 |
| **替代方案** | 有更简单的做法吗？ | 有 —— 什么都不改。但用户明确说"太丑/太土"，属真实诉求 |

**审查发现的真风险（已转为验收项）**：
1. 🔴 **焦点环可能被改没** → 加专项验收：Tab 键聚焦时必须有可见焦点指示
2. ⚠️ **`peer` 兄弟关系被破坏则选中态失效** → 实现约束 + 验收时检查选中态仍变色
3. ⚠️ **390px 溢出** → 专项用例

## 8. 验收标准（沿用 QA 测试用例文档规范）

产出 `outputs/reports/QA-筛选栏视觉现代化-测试用例-2026-10-11.md`
（**用例先行 → 执行 → 回填 → 截图内嵌**）

### ① 护栏回归（最重要）
- 重跑《QA-轮毂筛选器-测试用例》**34 条**，**结果不得劣化**
- 重点：TC-14（非法参数归一化）、TC-17（摘要数=卡片数）、TC-19/20（已应用标签/单项移除）、TC-29（GET 表单）

### ② 代码层门禁
- `npm run lint` / `typecheck` → 0 error
- `npm run build` → 191 页静态生成不减少
- `npm test` → 42 条单测全绿
- `npx playwright test` → 60 条 e2e 全绿（零回归）

### ③ 浏览器层（Playwright 真实巡检）
- @1440×900 与 @390×844：**零横向溢出**
- 控制台 **Errors: 0**
- **选中态可见**：勾选后视觉元素变品牌橙
- **🔴 焦点环可见**：Tab 聚焦时有清晰焦点指示
- **禁用态可见**：count=0 的选项明确弱化
- 改造前/后截图对比

## 9. 完成定义

1. `WheelFilterOption` + 分组容器视觉现代化，向 Astryx 观感对齐
2. §5 五条护栏全部未破；§7 三个风险均有验收覆盖
3. §8 三类验收全通过，产出 QA 测试用例文档（含前后对比截图）
4. 34 条筛选器回归不劣化
5. `STATUS.md` 更新；决定记入 `DECISIONS.md`
6. **不 commit、不 push、不部署**

---

## 10. 改造前基线观察（2026-10-11，截图实判）

对 `outputs/reports/qa-filter-visual-2026-10-11/01-筛选栏-改造前-桌面.png`（237×789）逐项判读：

| # | 问题 | 证据 | 归因 |
|---|---|---|---|
| 1 | **方框勾选框生硬** | 纯白方块 + 1px `border-ink/28`，直角无层次 | `WheelFilterOption` 视觉层 |
| 2 | **提示框是"外来蓝"** | `astryx-banner-description` —— **它已经是 Astryx Banner**（DEC-088 引入），但 neutral 主题的 accent 蓝**与品牌橙完全冲突** | Astryx neutral 主题 accent ≠ 品牌色 |
| 3 | **APPLY FILTERS 是死黑直角块** | 无圆角、无层次、无 hover 暗示 | 按钮样式 |
| 4 | **"Show 6 more" 的 `+` 圆圈过大** | 直径 > checkbox，喧宾夺主 | `<details>` summary 视觉 |
| 5 | **分组标题以破折号开头** | `— BOLT PATTERN (PCD)` | legend 样式 |
| 6 | **计数数字无对齐感** | `42 / 51 / 14` 紧贴右缘、字号偏小 | 计数 span |
| 7 | **浮动询盘按钮压住选项** | 黑色圆形 `FloatingQuote`（`fixed bottom right`）在 237px 栏内遮住 `18"` | ⚠️ **非筛选栏问题**（viewport 固定元素），但窄栏下确实遮挡 → 单列观察项 |

### 🔑 关键洞察
**第 2 条推翻了"Astryx = 现代感"的简单等式**：
项目里**唯一已用的 Astryx 组件**（Banner）恰恰是**看起来最不协调的那块** —— 因为
`theme-neutral` 的 accent 是蓝色，而本页品牌色是橙色 `#aa5208`。

→ **所以这次的方向是「用 Astryx 的形态语言（圆角/间距/层次/过渡），配品牌色」**，
   而不是「把 Astryx 默认配色搬过来」。**这是本轮最重要的设计决策。**

### 明确不做
- ❌ 不动 `FloatingQuote`（第 7 条）—— 属另一个组件，本轮非范围
- ❌ 不改 Astryx Banner 的**组件**，但会调整其在品牌语境下的**配色**（使其不再是外来蓝）

---

## 11. 增量 1 执行记录（2026-10-11）

### 改了什么
| 文件 | 改动 |
|---|---|
| `src/components/wheels/wheel-filter-option.tsx` | 勾选框：`rounded-[5px]` + `ring-1 ring-inset`（替代实心 border）+ 选中态柔光 + **整行 hover 高亮** + 行高 28→32px + 计数零值弱化 |
| `src/components/wheels/wheel-catalogue-filters.tsx` | ① 两个 Apply 按钮：`rounded-md` + `shadow-sm` + 柔光 hover ② `Show N more` 折叠标：大橙圆圈 → 柔和橙色箭头（`rotate-90`）+ hover 底色 ③ 分组标题：加 4×3px 品牌橙标记 + 已选计数改胶囊徽标 |
| `src/components/wheels/pcd-search-group.tsx` | 同上分组标题处理（该组件有独立的 legend 渲染，**首次改动漏了它**，实测 `markExists:false` 后补修） |

### 验收证据
| 项 | 结果 |
|---|---|
| `npm run typecheck` | **EXIT=0** ✅ |
| `npm run lint` | **EXIT=0** ✅ |
| `npm test` | **42 通过 / 0 失败** ✅ |
| `npm run build` | **EXIT=0**，191/191 页 ✅ |
| 🔴 护栏①筛选机制回归 | **138 / 42 / 14 / 27 / 0、GET 表单 3 个 —— 与改造前逐项一致** ✅ |
| 机制完整性 | `input name="pcd" value="4x100" type="checkbox"` + `peer` 兄弟关系成立 ✅ |
| 4 组 legend 标记 | 全部渲染（实测 16×3px × 4）✅ |

### ⚠️ 未解决的问题（需决策）

**蓝色 `How filters combine` 提示框无法用现有手段改成品牌色。**

- 它是 **Astryx `Banner status="info"`**（DEC-088 引入），info 态用 neutral 主题的 accent 蓝
- 实测：Banner 的 status 只有 `accent / info / success / warning / error`，**没有品牌橙选项**
- Banner 用 **StyleX（哈希类名）**，不是 CSS 变量 → **无法用 Tailwind 类或 CSS 变量局部覆盖**
- 唯一正规路径：**`defineTheme`**（Astryx 官方 API，可定义品牌主题）→ 但那是**独立的一件大工作**，不该塞进本次勾选框改造

**处置建议**：本轮先不碰。单独立项「Astryx 品牌主题」（用 `defineTheme` 建一个品牌主题，
一次性解决 Banner 蓝、以及未来所有 Astryx 组件的配色统一问题）。
