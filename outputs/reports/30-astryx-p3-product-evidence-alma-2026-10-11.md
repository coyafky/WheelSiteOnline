# Astryx P3 — 产品选择链组件切片（证据）

- 日期：2026-10-11
- 任务：`work/queued/2026-10-11-astryx-product-component-slice.md`（P3）
- 上游：P0 `outputs/reports/26-...` §七；P1 `28-...`；P2 `29-...`
- 证据目录：`outputs/reports/astryx-p3-evidence-2026-10-11/`
- 状态：**范围完成**。全站收口仍待 P5。

> 诚实声明：本文件区分「已实测」与「只读代码」。未实现的一律不写作已完成。

---

## 〇、一句话结论

产品链的**筛选 / 分页 / 上架门槛 / 同变体规格四条契约本来就被正确实现**，本轮没有也不需要改写它们。
P3 的实质交付是：**用 23 条 Playwright 断言把这些契约固化成可重复的回归资产**
（`e2e/astryx-product.spec.ts`，23/23 通过），并对 Astryx 的
`Card / ClickableCard / MetadataList / Table` 四个候选做探针，得出**1 项可用、3 项拒绝**的结论。

---

## 一、四条契约：实测通过，且已固化为回归测试

`e2e/astryx-product.spec.ts` 实跑 **23 passed / 0 failed（1.2m）**：

| # | 断言 | 结果 |
|---|---|---|
| 1 | 筛选、排序表单是**原生 GET**，多值 checkbox 提交**同一个 name** | ✅ |
| 2 | 分页是**真实 `<a href>`**，带 `rel` 与 `aria-current` | ✅ |
| 3 | 筛选 + 排序 + 分页参数**可复制 URL 并保持** | ✅ |
| 4 | 越界页码返回 **404** | ✅ |
| 5 | 无结果筛选返回 **200** 且 **noindex 空状态** | ✅ |
| 6 | **320px 下 Filter 入口可见、可展开、可提交** | ✅ |
| 7 | **无图型号不可公开**：详情 404，目录与 sitemap 均无 | ✅ |
| 8 | 目录每张卡都有真实图片 | ✅ |
| 9 | 桌面配置表**每行是完整的同一 productionCode 组合** | ✅ |
| 10 | 单选控件按 productionCode 选择，选中后**询盘绑定该 code** | ✅ |
| 11 | 直接询盘 CTA 打开弹窗，未选配置时提交 `variant_pending` | ✅ |
| 12 | 清单 CTA 加入后浮动清单可见且**不清空** | ✅ |
| 13–16 | 目录 + 详情 @ **320 / 390 / 768 / 1440：0 控制台错误、无横向溢出** | ✅ |
| 17 | SEO：目录 title / canonical / robots 完整 | ✅ |
| 18 | SEO：详情 title / canonical / robots 完整 | ✅ |
| 19–23 | **能力线首屏 h1 在深色表面上仍是浅色**（5 条，守住 P1 的修复） | ✅ |

> 第 19–23 条是关键：P1 修好的「深色首屏 h1 继承到浅色墨色」缺陷（1.00–1.06:1）
> 现在有了**回归保护**，P3/P4 乃至后续任何切片都不可能再把它弄坏。

---

## 二、Astryx 候选探针：1 可用 / 3 拒绝

探针方式：`react-dom/server` 的 `renderToStaticMarkup`（脚本与输出见
`astryx-p3-evidence-2026-10-11/ssr-probe.mjs` + `ssr-probe-output.txt`）。

### 2.1 `Table` —— ❌ **拒绝**（本轮最硬的发现）

**`Table` 没有 `caption` prop。** 传入 `caption="…"` 会**落到 `<table>` 上的无效 HTML 属性**，
**不产生任何真实 `<caption>` 元素**。实测原始输出：

```html
<table class="astryx-table …" style="min-width:120px" caption="Recorded production configurations">
  <thead class="astryx-table-header">
```

（注意 `caption="…"` 是 `<table>` 的属性，全文**没有** `<caption>…</caption>` 元素。）

项目在 3 处用 `<caption class="sr-only">` 为服务端内容表提供无障碍名称
（变体规格矩阵 / EV 对照表含 `<caption class="sr-only">` / custom-development）。
**换成 Astryx `Table` 会让这三处的表格名称静默消失** → 拒绝，保留原生 `<table>`。

补充证据：探针运行时 Astryx `Table` 自身还抛出 **React key 警告**
（`Each child in a list should have a unique "key" prop. — BaseTable / TableRowInner`），
说明该组件在 0.6.7 的服务端渲染路径上并不干净。

### 2.2 `ClickableCard` —— ✅ **可用（含 Next Link 已验）**

- **正确接入 `LinkProvider`** —— 在 `LinkProvider(FakeNextLink)` 下渲染出
  `<a href="/products/wheels/hp12" data-next-link="1" aria-label="HP12">` → **可爬取 + 走 Next 软导航**。
- 服务端可渲染（无 `use client` 阻断）。
- 承载嵌套交互控件（`<button>Add to enquiry</button>`）时结构仍合法。
- ⚠️ 但仍**未落到生产页**：产品卡仍由项目组件渲染真实型号、variant 交集与图片门槛。
  按任务书「真实型号卡允许保留项目组件」，**登记为「已探针待验收」，不强行替换**。

### 2.3 `MetadataList` —— ✅ 语义正确，但**本轮未采用**

实测产出**真实语义列表**：`<dl>` / `<dt>` / `<dd>`（例：
`<dt>Diameter</dt><dd>18", 19"</dd>`）。契约成立。
但 `columns="multi"` + `maxNumOfItems` 会引入 **`<button>Show more</button>` 折叠**，
而轮毂规格必须**默认完整可见**（规格是选型依据，不能被折叠隐藏）。
→ **本轮不采用**；若 P5 要做规格外观统一，须用 `columns="1"`（无折叠）并逐项验收。

### 2.4 `Card` —— ✅ 服务端安全，**未采用**

无 `use client`，SSR 产出 `<div class="astryx-card default none …">`。
但它是纯容器，替换现有产品卡外壳**没有净收益**（且产品卡承载图片门槛与真实变体逻辑）。
→ 登记「已探针待验收」，留给 P5 按页决定。

### 2.5 保留项复述（P0 结论，本轮未触碰）

`Pagination`（`onChange` 必填、无 `href`、SSR 只出 `<button>`）与目录多值 `CheckboxInput`（受控单布尔）
**保持原生**——本轮的 23 条断言正是保护它们的。

---

## 三、上架门槛与同变体规格（实测）

| 检查 | 方式 | 结果 |
|---|---|---|
| 无图/未批准型号不可公开 | Playwright 第 7 条，取真实反例 | ✅ 详情 404，目录与 sitemap 均无 |
| 目录每张卡都有真实图片 | Playwright 第 8 条 | ✅ |
| 规格只取同一真实 variant | Playwright 第 9 条（逐行核 productionCode） | ✅ 无跨变体拼接 |
| 询盘绑定当前选中 variant | Playwright 第 10/11 条 | ✅ 提交 `variant_pending` 而非伪造 code |

---

## 四、本轮**未做**的事（诚实边界）

1. **P3 没有产生生产代码改动。** 四条契约本已正确，四个候选的结论是「1 可用待验收 / 3 拒绝」，
   按任务书「未通过即登记例外，不强行改写事实模块」→ **没有为了改而改**。
   本轮的净交付是 **23 条回归资产**（`e2e/astryx-product.spec.ts`，14.8KB，新增未提交）。
2. **`Card` / `ClickableCard` / `MetadataList` 仍未落到生产页** —— 需 P5 连同产品卡重构一并验收。
3. **未验证** Next Link 的**预取（prefetch）**行为（只验了 `data-next-link="1"` 渲染；
   P0 §六 开放问题 1 仍未关闭）。
4. 本轮 4 视口只覆盖**目录 + 一条代表型号**，不等于 405 个单品页全量回归。

---

## 五、门禁

| 命令 | 结果 |
|---|---|
| `e2e/astryx-product.spec.ts` | **23 passed / 0 failed** |
| `npm run theme:check` | **ok** |
| `npm test` | **42 pass / 0 fail** |
| `npm run lint` | **0 error** |
| `npm run typecheck` | **clean** |
| `npm run build` | **exit 0** |
| `git diff --check` | **clean** |

---

## 六、安全与工作树

- **未向真实 QQ SMTP 发任何信**；测试走隔离/локальный mock，未触碰真实询盘端点。
- **未 commit / push / deploy**。
- 未覆盖 221 个遗留未提交改动。
- 临时探针脚本已清理；真实证据保留在 `astryx-p3-evidence-2026-10-11/`。
