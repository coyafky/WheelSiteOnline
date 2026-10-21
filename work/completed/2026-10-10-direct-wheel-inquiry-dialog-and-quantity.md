# 轮毂直接询盘弹窗与数量语义拆分

- **状态**：已完成
- **创建日期**：2026-10-10
- **来源规格**：`PAGE-SPECS/wheel-detail.md` §7、`PAGE-SPECS/request-a-quote.md` §3/§7、用户反馈与附件截图
- **优先级**：P1（影响轮毂详情页的直接转化路径）

## 问题

当前轮毂详情页把两种不同的业务意图放进同一块界面：

1. `Add selected configuration` 把配置加入可跨页面保留的总询盘清单；
2. 详情页下方直接展示完整 `InquiryForm`，用户本意是只询问当前产品/配置。

共享表单还会无条件读取 cart，并在提交成功后清空 cart。结果是用户无法清楚判断“这次提交
会发送当前产品，还是发送整个清单”，也可能在直接询问当前产品时误提交或清空已经收集的
其他配置。

另一个问题是单条轮毂配置的 `Qty` 目前在以下三层被限制为 1–999：

- `src/lib/wheels/inquiry-cart.ts` 的 `MAX_ITEM_QUANTITY` 与 clamp；
- cart 行输入的 `max={999}`；
- `src/lib/inquiry/schema.ts` 中 `InquiryItem.quantity` 的 `.max(999)`。

附件截图只作为当前 cart 行视觉证据，不把截图中的数量 1 或 999 视为新的业务决定。

## 目标结果

用户在轮毂详情页能明确选择：

- **加入总询盘**：只加入当前已选配置，继续浏览其他型号；
- **直接询问当前产品**：点击按钮后在当前页打开弹窗，只提交当前型号/配置，不读取、不清空总询盘清单。

两条路径继续使用同一个 `/api/inquiries`、同一个隐私同意、同一个服务端型号/生产代码复核和
同一个 WordPress 询盘契约，不复制第二套邮件或持久化逻辑。

数量字段要区分“总项目数量”和“清单中某一配置的行数量”，不再让用户从 cart 的 999 上限
推断整个项目只能询问 999 件。

## 用户故事

1. 作为只想询问当前轮毂配置的访客，我希望点击详情页按钮后在当前页填写并提交，不被送到
   `/request-a-quote`，也不需要先加入总清单。
2. 作为正在比较多个轮毂配置的访客，我希望点击“加入询盘清单”后继续浏览，最后在统一询盘页
   一次提交多项配置。
3. 作为已经有总清单的访客，我希望直接询问当前产品时清单仍保留，不能因为直接提交而被清空。
4. 作为项目采购方，我希望数量字段允许表达真实项目规模；单项数量限制应有明确标签和可追溯
   的业务依据，而不是只在前端被静默截断。

## 现状证据与影响面

- `src/components/wheels/wheel-inquiry-panel.tsx`：当前同时渲染加入清单按钮和内嵌完整表单。
- `src/components/inquiry-form.tsx`：当前无模式参数，直接渲染 `InquiryCartSummary`，提交时
  总是发送 `cartItems`，成功后总是 `clearInquiryCart()`。
- `src/lib/wheels/inquiry-cart.ts`：本地清单合并、持久化和单项数量均经过 999 clamp。
- `src/components/wheels/inquiry-cart-summary.tsx`：cart 行显示 `Qty`，输入限制为 1–999。
- `src/lib/inquiry/schema.ts`：服务端 `items[].quantity` 限制为 1–999，是不能只改 UI 的公共契约。
- `src/components/wheels/wheel-detail-interactive.tsx`：当前型号和合法 `productionCode` 已有 URL
  状态与服务端复核基础，可复用而不新增 API。
- `PAGE-SPECS/wheel-detail.md` §7 当前描述的是内嵌紧凑表单，需要改成弹窗直接询盘与清单入口
  的双路径规格。

## 实现决定

### 1. 明确询盘模式

为共享 `InquiryForm` 增加显式模式边界，名称和最终类型在实现前固定，但语义必须等价于：

- `direct`：当前详情页单产品/单配置；不渲染 `InquiryCartSummary`，提交 payload 只包含当前上下文
  对应的一项（未选配置时不得伪造规格）；成功后不清空总清单；
- `cart`：`/request-a-quote` 总询盘；渲染清单并提交清单全部项目；成功后继续清空清单。

直接模式通过显式的当前产品上下文传入表单，URL 仅作为无 JavaScript/刷新恢复的辅助来源；服务端
仍按 `model + productionCode` 重新解析，客户端传入的规格永远不是事实源。

### 2. 详情页交互

- 移除轮毂详情页下方的完整内嵌表单。
- 保留 `Add selected configuration`，文案和反馈明确为“加入总询盘清单”，不打开弹窗。
- 增加独立的 `Request this configuration`（无合法选择时显示型号级询盘或禁用，具体按现有
  `variant_pending` 规格确认）。
- 点击直接询盘按钮后在当前页打开可访问弹窗；不改变 URL，不跳转 `/request-a-quote`。
- 弹窗优先使用已锁定版本的 Astryx `Dialog purpose="form"` 与 `DialogHeader`；内容继续复用现有
  Astryx 表单控件。若数量上限确认且 `NumberInput` 探针通过，单配置数量可使用同一公开组件。
- 弹窗关闭方式：关闭按钮、Escape、合理的背景点击；关闭后焦点回到触发按钮，打开时焦点进入
  弹窗标题或第一个可填写字段；背景不可操作，页面不产生横向滚动。
- 390×844 下采用可滚动的全宽/底部弹层容器，桌面保持适度宽度；尊重
  `prefers-reduced-motion`，不增加新的弹跳动效。

### 3. 数量语义与边界

用户已于 2026-10-10 明确确认：询盘不是购物车或订单，单个配置数量**没有业务上限**。前端、
共享 schema、WordPress 契约和测试必须统一为“正整数”，禁止继续出现 999 或用另一个任意数字
替代。系统仍保留 JavaScript 安全整数、请求体大小和最多 20 个配置等技术防护；这些不是业务
数量上限。

建议拆成两个字段语义：

- `configurationQuantity`：cart 或直接询问的某条批准配置数量，正整数、无业务上限，界面标签
  写明 `Quantity for this configuration`；
- `projectQuantity`：跨配置或年度项目规模，保留当前文本表达能力，如 `prototype`、`1,000`
  或 `500/year`，不受单行配置数量上限替代。

本次同步更新客户端归一化、输入属性、Zod、WordPress 字段约束、邮件快照和后端验收，不接受
只改截图中的输入框。

### 4. API 与持久化

- 不新增 API 路由；`POST /api/inquiries` 继续是唯一写入口。
- `direct` 模式提交一项当前配置；服务端复核失败时清空伪造规格或按既有 `variant_pending`
  语义处理，不信任隐藏字段。
- `cart` 模式保持现有多项上限、去重、幂等与服务端逐项复核。
- 直接提交成功不调用清单清空；总清单提交成功才清空。
- 直接和清单两种成功、邮件未投递、422、429、持久化失败仍使用现有真实状态语义。

## 纵向切片与依赖

### 切片一：数量契约先行

**依赖**：已完成，业务确认无数量上限。

- 固化 `configurationQuantity` 的正整数规则和错误文案；
- 同步 cart clamp、`input` 边界、Zod、WordPress 快照/邮件显示；
- 增加 0、负数、小数、大数量、安全整数边界和项目文本数量的单元/接口测试；
- 不改变直接弹窗外观，先保证数量行为可独立验收。

### 切片二：直接询盘弹窗

**依赖**：切片一；隐私版本配置只影响本地/预发布是否可提交，不改变结构。

- 为共享表单增加 `direct/cart` 模式与显式上下文接缝；
- 详情页只保留两个意图清晰的 CTA；
- 完成弹窗键盘、焦点、滚动锁定、移动端和关闭恢复；
- direct payload 只带当前型号/配置，且不读取或清空 cart；
- 使用现有 Astryx 表单控件与内容接缝，不在组件中写新营销文案。
- “加入总询盘”反馈可评估 Astryx `Toast`，但 Toast 只反馈动作，不能替代 localStorage 清单事实。

### 切片三：总询盘清单回归与迁移

**依赖**：切片二。

- 保持目录卡、详情页“加入清单”和 `/request-a-quote` 的多项提交路径；
- 验证 direct 成功后 cart 仍在、cart 成功后才清空；
- 更新页面规格、状态记录与必要的架构/决定记录；
- 删除详情页旧内嵌表单路径，避免两套 CTA 并存造成歧义。

## 测试决定

### 单元/契约

- 数量边界与集中常量：客户端归一化、Zod、服务端拒绝路径一致；
- direct 模式不读 cart，cart 模式提交全部项目；
- direct 成功不清空 cart，cart 成功清空 cart；
- 当前 `model + productionCode` 被服务端复核，伪造规格不能进入快照；
- 隐私版本、幂等、429、数据库失败和邮件 pending 继续通过已有契约。

### Playwright CLI / Chromium E2E

必须使用 Playwright CLI 先做手工证据，再运行自动化回归：

1. 轮毂详情页选择一个合法 variant，确认页面同时提供“加入总询盘”和“直接询问当前配置”；
2. 点击直接询问，确认弹窗出现在当前 URL，内嵌表单不再重复出现；
3. 预置一条 cart，再完成 direct 提交，确认请求只有当前配置，提交后 cart 仍保留；
4. 关闭弹窗、Escape、Tab/Shift+Tab、移动端滚动和触发按钮焦点恢复；
5. 走“加入清单 → 继续浏览 → `/request-a-quote`”路径，确认多项仍按数量提交；
6. 验证 5,000 以上数量不被截断，0、负数和小数仍被拒绝；
7. 1440px 与 390px 视口检查横向溢出、遮挡、断图、焦点和控制台错误为 0。

### 完成门禁

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `CI=1 npx playwright test e2e/inquiry.spec.ts e2e/site-contract.spec.ts --project=chromium --retries=0`
- 按询盘后端可用性运行 Docker/WordPress 验收脚本；未启动 CMS 时明确记录只验证 mock/内存回退。
- `git diff --check`

## 非范围

- 不新增第二个询盘 API、第二套邮件发送器或第二种 WordPress 记录；
- 不把直接询盘变成订单、支付、库存或价格确认；
- 不自动把未批准的隐私文本视为正式批准；
- 不把所有产品线都强行改成轮毂配置弹窗；
- 不删除总询盘清单、多项询价或无 JavaScript 的 `/request-a-quote` 入口；
- 不在没有业务确认的情况下擅自把 999 改成另一个数字。

## 实施取舍

1. 未选择 variant 时保留型号级 `variant_pending` 路径，不强迫客户先决定配置。
2. 弹窗关闭后不把姓名、邮箱、消息或草稿写入 localStorage；重新打开是新的直接询盘会话。

## 实施结果

- `InquiryForm` 已有显式 `direct/cart` 模式；direct 不订阅、不提交、不清空总询盘清单，也不跳转
  感谢页，成功状态留在当前弹窗；cart 保持多项提交与成功清空。
- 详情页移除内嵌完整表单，使用 Astryx `Dialog`、`DialogHeader`、`Layout` 与 `NumberInput`；两个
  CTA 的业务含义、选中配置摘要和数量说明均来自 `src/content/wheel-detail.ts` 内容接缝。
- 浏览器归一化、Zod、WordPress 校验和真实后端快照均接受 5,000 及更大的安全正整数；0、负数、
  小数和 JavaScript 不安全整数仍被拒绝；最多 20 个配置与请求体限制保持不变。
- 页面规格与 DEC-074/DEC-089 已同步，旧 1–999 决定明确被替代。

## 验收证据

- `npm test`：37/37；`npm run lint`、`npm run typecheck`、`npm run build`（191 页）通过。
- `CI=1 npx playwright test e2e/inquiry.spec.ts e2e/site-contract.spec.ts --project=chromium --retries=0`：
  26/26；direct payload 只含当前配置，direct 成功后总清单仍保留，cart 成功才清空。
- Playwright CLI：1440px/390px 当前页弹窗、Escape、焦点恢复、内部滚动、5,000 数量、横向溢出
  与控制台均通过；移动截图在 `outputs/reports/ui-evidence-2026-10-10/`。
- `python3 scripts/verify-inquiry-backend.py`：80/80，WordPress 不可变快照保存数量 5,000；
  `python3 scripts/verify-inquiry-delivery.py` 全部通过；测试数据已由脚本清理。
- `php -l local-wp/mu-plugins/fenghuai-inquiries.php` 与 `git diff --check` 通过。
