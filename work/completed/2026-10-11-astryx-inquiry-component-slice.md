# Astryx 询盘转化链组件切片（P2）

- 状态：**已完成并归档（2026-10-11）**。P5 全量回归 116/116；全站浮动 Badge 按用户决定移除，清单在询盘页核对。下文“留在 queued”是阶段性原始记录。
- 总计划：`outputs/reports/25-astryx-sitewide-component-plan-alma-2026-10-11.md`。

## 范围

`/request-a-quote`、`/contact`、轮毂详情直接询盘 Dialog、总询盘清单、`/thank-you` 的通用字段、按钮、数量输入、Toast/Badge、错误与成功反馈。只替换可等价的表现层；直接询盘与清单询盘继续隔离。

## 实施与验收

1. 从已批准的页面规格与现有 Astryx 表单/弹窗适配器出发，补齐字段语义、隐私版本、加载/禁用、焦点恢复与关闭行为；不改 WordPress/MySQL/Outbox 成功判定。
2. 数量只限安全正整数，无 999 业务上限；失败保留表单和清单。只有 `ok:true && persisted:true` 展示成功，SMTP 后续状态不冒充落库成功。
3. 在 320×568、768×1024 检查 Open、Validation、Submitting、Success、Server Error，补齐四语言、键盘和视觉证据。
4. Playwright 自动提交只使用隔离 `WP_MODE=mock` 或本地夹具；不得向真实 QQ 邮箱发测试信。跑窄测试及项目质量门禁，并把结果记回任务。

---

## 完成记录（2026-10-11）

**状态：范围完成，任务留在 queued/ 不声明 completed**（须等 P3–P5 与总任务）。

### 核心判断：成功判定本来就是对的，本轮没改它

`ok && persisted === true` 才成功（`inquiry-form.tsx:406-415` ← `api/inquiries/route.ts:151`
← `lib/inquiry/store.ts:312` 注释「persisted: false on a 201 would let a lead evaporate」）。
**SMTP / Outbox 从未参与成功判定**。本轮只做表现层收敛。

### 改动

| 文件 | 改动 |
|---|---|
| `src/components/inquiry-form.tsx` | **−284 / +390**：把**直接询盘**与**清单询盘**两条分叉路径合并为单一组件的 `mode: "direct" \| "cart"`；新增 `InquiryFormUi` / `InquiryPreparation` / `privacyVersion` / `onSuccess` props |
| `src/content/inquiry-form.ts` | +20 行，新增 `privacyConsentChanged` 字段级文案 |

**刻意未改**：`api/inquiries/route.ts`、`lib/inquiry/store.ts`、`lib/inquiry/schema.ts`、mailer/Outbox 链路。
**调用方零改动**（`/contact`、`/request-a-quote`、`direct-wheel-inquiry-dialog` 仍传 `copy`；新 props 全可选）。

### 关键结论（都实测）

1. **隔离性成立**：`clearInquiryCart()` **只在 `mode === "cart"` 且已进入成功分支之后**执行（`:412`）
   → **直接询盘失败永不碰清单**。已捕获 `isolation/direct-fail-preserves-cart` 截图（320/768）。
2. **数量无 999 上限**：`schema.ts:29-35` = `.int().min(1).refine(Number.isSafeInteger)`；
   `grep 999` 零命中。⚠️ 另一处字符串 `quantity`（`:52`，限 40 字符）是第一步文本框长度，**不是业务上限**。
3. **四态 × 双视口 18 组合**全部捕获：Open / Validation(client + server-422) / Submitting / Success /
   Server Error(503) / isolation / focus-escape，**横向溢出全 0**；
   仅有的 2 类控制台错误是测试自己注入的 422/503 响应（预期），其余 16 个状态零错误。
4. **焦点**：弹窗关闭回触发器（已捕获）；校验失败聚焦首个无效字段（`focusFirstError` at `:299`）；
   服务端 422 映射回字段后再聚焦（`:400-408`）；提交中防重复（`:337`）。

### 环境与证据（纪律）

- 用**隔离的 `127.0.0.1:3210`**（`WP_MODE=mock`），**未复用 3200 主开发服务器**。
- 自动化提交全部走 Playwright 路由拦截，**未向真实 QQ 邮箱发任何测试信**。
- 证据：`outputs/reports/29-astryx-p2-inquiry-evidence-alma-2026-10-11.md`
  ＋ `outputs/reports/astryx-p2-evidence-2026-10-11/`（`audit-before.json` 18 行 + 18 张截图）

### 门禁

`theme:check` ok ｜ `npm test` **42/42** ｜ `lint` 0 error ｜ `typecheck` clean ｜ `build` exit 0 ｜ `git diff --check` clean

### 遗留（交 P5 / 后续）

- `/thank-you` 页面**视觉**未单独评审（只核了成功跳转与 `receiptToken` 传递）。
- 键盘全序 + axe 全站扫描、四语言全站回归 → P5。
- P0 开放问题 1–3（Next Link 软导航/预取真机验证）仍未关闭。
- **诚实边界**：本轮的 18 组合是**四态取证**，不等于全站询盘路径的四语言逐条回归。
