# Astryx 产品选择链组件切片（P3）

- 状态：**已完成并归档（2026-10-11）**。P5 最终 116/116；清单回归已改为原位询盘页检查。下文“留在 queued／浮动清单”是阶段性原始记录。
- 总计划：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`。

## 范围

产品入口、轮毂目录/详情、旋压/锻造、其他能力线。对可复用的提示、字段、卡片外壳、规格呈现与空态探针 Astryx；真实型号卡、品牌 Hero 和工程事实允许保留项目组件。

## 实施与验收

1. 保留 `form method=get` 多值筛选、普通链接分页、排序 URL 和无 JavaScript 提交；移动端 Filter 入口必须可见可用。
2. 目录/详情只展示有图且已批准型号；规格取同一真实 variant，不拼接跨变体尺寸；未批准/无图反例必须不可公开。
3. 对 Card/ClickableCard/MetadataList/Table 做链接、语义、SSR、键盘和移动布局探针；未通过即登记例外，不强行改写事实模块。
4. 用 320/390/768/1440 视口及代表型号做 Playwright 回归，核验筛选、分页、直接/清单 CTA、控制台和 SEO。运行项目质量门禁，记录实际采用与拒绝原因。

---

## 完成记录（2026-10-11）

**状态：范围完成，任务留在 queued/ 不声明 completed**（须等 P5 与总任务）。

### 核心判断：四条契约本来就对，本轮把它们变成回归资产

产品链的**筛选 / 分页 / 上架门槛 / 同变体规格**本来就被正确实现，**没有也不需要改写**。
P3 的净交付是新增 **`e2e/astryx-product.spec.ts`**（14.8KB）—— **23 条断言，23 passed / 0 failed**：

| # | 断言 |
|---|---|
| 1 | 筛选/排序是**原生 GET**，多值 checkbox 同一 `name` |
| 2 | 分页是真实 `<a href>`，带 `rel` + `aria-current` |
| 3 | 筛选+排序+分页参数**可复制 URL 并保持** |
| 4 | 越界页码 **404** |
| 5 | 无结果筛选 **200 + noindex 空状态** |
| 6 | **320px Filter 入口可见/可展开/可提交** |
| 7 | **无图型号不可公开**（详情 404，目录与 sitemap 均无） |
| 8 | 目录每张卡都有真实图片 |
| 9 | 配置表**每行是同一 productionCode 组合**（无跨变体拼接） |
| 10–11 | 询盘绑定当前选中 variant；未选时提交 `variant_pending` |
| 12 | 清单 CTA 加入后浮动清单**不清空** |
| 13–16 | 目录+详情 @ 320/390/768/1440：**0 控制台错误、无横向溢出** |
| 17–18 | 目录/详情 SEO title/canonical/robots 完整 |
| 19–23 | **能力线首屏 h1 在深色表面上仍是浅色**（守住 P1 修复） |

> 第 19–23 条意义最大：P1 修好的「深色首屏 h1 继承到浅色墨色」缺陷（1.00–1.06:1）
> 现在**有了回归保护**，后续任何切片都弄不坏它。

### Astryx 候选探针：1 可用 / 3 拒绝

| 候选 | 结论 | 依据 |
|---|---|---|
| **`Table`** | ❌ **拒绝** | **无 `caption` prop** —— 传 `caption="…"` 只落到 `<table>` 上的**无效 HTML 属性**，**不产生 `<caption>` 元素**（实测原始输出）。项目 3 处用 `<caption class="sr-only">`，换掉会让表格无障碍名称静默消失。另：0.6.7 的 SSR 路径还抛 React key 警告（`BaseTable` / `TableRowInner`） |
| **`ClickableCard`** | ✅ 可用（**Next Link 已验**） | `LinkProvider` 下渲染 `<a href data-next-link="1">` → 可爬取 + 走软导航；无 `use client` 阻断；可承载嵌套 `<button>` |
| **`MetadataList`** | ✅ 语义成立，**本轮不采用** | 产出真实 `<dl>/<dt>/<dd>`；但 `columns="multi"` + `maxNumOfItems` 会引入 `<button>Show more</button>` **折叠**，而规格必须默认完整可见 |
| **`Card`** | ✅ 服务端安全，**本轮不采用** | 无 `use client`，纯容器；替换现有产品卡外壳无净收益（产品卡承载图片门槛与真实变体逻辑） |

**保留项未触碰**：`Pagination`（`onChange` 必填/无 `href`）、目录多值 `CheckboxInput`（受控单布尔）、
原生 `<table>`、项目产品卡。

### 证据与门禁

- 证据：`outputs/reports/30-astryx-p3-product-evidence-alma-2026-10-11.md`
  ＋ `outputs/reports/astryx-p3-evidence-2026-10-11/`（`ssr-probe.mjs` / `ssr-probe-output.txt` / `playwright-run.txt`）
- `e2e/astryx-product.spec.ts` **23 passed** ｜ `theme:check` ok ｜ `npm test` **42/42** ｜
  `lint` 0 error ｜ `typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean
- **未向真实 QQ SMTP 发信**；**未 commit/push/deploy**；临时脚本已清理

### 诚实边界（未做）

- **P3 没有生产代码改动** —— 按任务书「未通过即登记例外，不强行改写事实模块」，**没有为了改而改**。
- `Card` / `ClickableCard` / `MetadataList` **仍未落到生产页**，需 P5 连同产品卡一并验收。
- **未验证** Next Link 的 prefetch（只验了 `data-next-link="1"` 渲染；P0 §六 开放问题 1 未关闭）。
- 4 视口只覆盖**目录 + 一条代表型号**，不等于 405 个单品页全量回归。
