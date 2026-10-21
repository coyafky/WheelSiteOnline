# Astryx 轮毂筛选器外壳探针与实现记录

- 日期：2026-10-10
- 状态：已完成本切片，`CheckboxInput` 暂不接入；`Field` 已接入型号搜索
- 关联任务：`work/active/2026-10-10-astryx-ui-expansion.md`
- 关联决定：DEC-087

## 一、问题与用户结果

轮毂目录需要继续使用现有的 GET URL 和服务端筛选，但希望把重复的表单视觉与无障碍外壳逐步交给 Astryx。验收结果必须同时满足：

1. `diameter`、`width`、`pcd`、`process` 仍提交真实业务值；
2. 刷新或复制 URL 后，筛选勾选态仍由服务端恢复；
3. 没有 JavaScript 时，原生表单仍可提交；
4. 移动端 `<details>` 抽屉、桌面筛选栏和旋压子目录的锁定工艺不改变；
5. 键盘焦点、200% 等效视口和基础 WCAG 扫描不回归。

## 二、官方组件核验

本次查阅 Astryx 官方组件目录：

- [Astryx 组件目录](https://astryx.atmeta.com/components)：`Field`、`CheckboxInput` 位于 Form Controls；
- `Field` 的契约是给单个输入或自定义控件提供标签、描述、状态和 `inputID`；
- `CheckboxInput` 的 `value` 是 `boolean | "indeterminate"`，`htmlName` 只设置原生 `name`，没有承载业务字符串的 `value` 属性参数；
- `CheckboxInput` 内部是受控输入，切换需要 `onChange` 更新布尔值。

## 三、探针证据

新增 `tests/astryx-filter-shell-probe.test.mts`，固定验证 Astryx 当前版本 `0.6.7` 的输出：

```text
class="…astryx-checkbox-input…"
name="diameter"
checked
没有 value="18"
```

因此直接把当前筛选项替换成：

```tsx
<CheckboxInput label={'18"'} value={true} htmlName="diameter" />
```

会失去 `value="18"`。浏览器会把勾选值提交成默认的 `on`，服务端 `parseCatalogueSearchParams` 会丢弃它。若用隐藏输入补回业务值，又会在无 JavaScript 时无法同步“取消勾选”状态，违反本项目现有无 JS 表单契约。

## 四、本切片实现

### 已迁移

- `src/components/wheels/wheel-catalogue-filters.tsx`
  - 型号搜索由原生 `<label>` 外壳迁移到 Astryx `Field`；
  - 输入仍是原生 `input[type=search][name=q]`，`inputID` 与 `id` 保持一致；
  - GET、服务端解析、移动抽屉和桌面表单没有改变。

### 保留原生

- `src/components/wheels/wheel-filter-option.tsx`
  - 继续使用原生 checkbox，因为它必须表达 `name + value + checked + disabled` 四元组；
  - 自定义勾选标记继续使用项目设计令牌，不把产品筛选状态交给客户端组件；
  - 这不是放弃 Astryx，而是根据业务接缝拒绝不兼容的替换。

### 顺手修复

axe 扫描发现计数文本 `text-muted-foreground/80` 在白底只有 3.59:1。已改用现有 `text-steel` 令牌并移除额外透明度，使目录筛选器通过 WCAG A/AA 基础扫描。

## 五、自动化验收

### 单元 / API 探针

- `npm test -- --test-name-pattern='Astryx (Pagination|CheckboxInput)'`：33/33 通过（筛选探针与分页探针均通过）。

### 浏览器与无障碍

- `e2e/site-contract.spec.ts`：筛选 URL 状态、真实 `diameter` / `pcd` 字段和服务端 HTML 保持通过；
- `e2e/accessibility.spec.ts`：
  - GET 状态下 axe WCAG A/AA：通过；
  - 型号搜索键盘聚焦与可见焦点：通过；
  - 640px 等效 200% 视口无横向溢出：通过。
- Playwright 截图：
  - [桌面筛选器](ui-evidence-2026-10-10/astryx-filter-shell/desktop.png)
  - [移动筛选抽屉](ui-evidence-2026-10-10/astryx-filter-shell/mobile.png)
  - [桌面无障碍结构快照](ui-evidence-2026-10-10/astryx-filter-shell/desktop-snapshot.yml)
- 截图基于 `npm run build` 后的 production server，没有使用开发覆盖层；英文 locale cookie
  用于避免未翻译中文路径的 RSC 预取重定向。桌面/移动筛选页 0 条运行时错误；移动页有 1 条
  既有 Hero 预加载提示，不影响筛选器或布局。另记录：`next start` 在本项目 `output: standalone`
  配置下会提示部署方式警告，正式部署仍应使用 standalone server 并按部署文件复制静态资源。

## 六、结论与后续条件

本切片完成了低风险的 `Field` 外壳迁移，同时保留了筛选的服务端真相。`CheckboxInput` 不在当前目录筛选器中强行使用，原因是它的组件契约与多值 GET 表单不匹配，而不是视觉或无障碍质量不足。

只有在 Astryx 提供以下任一能力后，才重新评估复选框迁移：

1. 支持独立的原生业务 `value` 属性，同时保持受控状态；或
2. 提供服务端可提交、无 JavaScript 可用的多值 checkbox 适配器。

在此之前，继续使用原生 checkbox 是更小、更可靠的实现；下一条 Astryx 增量可评估 `Banner`（筛选结果说明/错误反馈）或 `FormLayout`（仅布局），不应为覆盖组件目录而改变筛选状态模型。
