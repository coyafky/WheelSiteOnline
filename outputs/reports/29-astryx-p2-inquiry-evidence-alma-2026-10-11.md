# Astryx P2 — 询盘转化链组件切片（证据）

- 日期：2026-10-11
- 任务：`work/queued/2026-10-11-astryx-inquiry-component-slice.md`（P2）
- 上游：P0 `outputs/reports/26-astryx-component-compatibility-matrix-alma-2026-10-11.md` §七；P1 `outputs/reports/28-astryx-p1-warm-hero-evidence-alma-2026-10-11.md`
- 证据目录：`outputs/reports/astryx-p2-evidence-2026-10-11/`
- 状态：**范围完成**。P2 在其余切片完成前不作全站完成声明。

> 诚实声明：本文件区分「已实测（有命令 + 输出）」与「仅读代码」。未实现的一律不写作已完成。

---

## 〇、一句话结论

询盘链的**成功判定本来就是对的**（`ok && persisted === true` 才成功，SMTP 与落库解耦），
本轮没有改这条语义。P2 的实质工作是：把**直接询盘**与**清单询盘**两条路径收进
同一个 `InquiryForm`（`mode: "direct" | "cart"`），消除原先分叉的表现层，
并实测四态 × 双视口 + 焦点/键盘 + 隔离性。

---

## 一、改动范围（表现层，无业务语义变更）

| 文件 | 改动 |
|---|---|
| `src/components/inquiry-form.tsx` | **−284 / +390**。合并 direct / cart 两条路径为单一组件的两个 mode；引入 `InquiryFormUi` / `InquiryPreparation` / `privacyVersion` / `onSuccess` props；补齐 `privacyConsentChanged` 的字段级文案 |
| `src/content/inquiry-form.ts` | +20 行，新增 `privacyConsentChanged` 键 |

**未改**（刻意保留）：

- `src/app/api/inquiries/route.ts` —— 成功判定与状态码
- `src/lib/inquiry/store.ts` —— `persisted` 语义与「未配置 WordPress 时只留内存」的降级
- `src/lib/inquiry/schema.ts` —— Zod 契约
- `src/lib/wheels/inquiry-cart.ts` —— 清单存储
- Mailer / Outbox 链路

**调用方未变**：`/contact`、`/request-a-quote`、`direct-wheel-inquiry-dialog` 仍传 `copy={...}`；
新增的 `mode` / `context` / `item` 均为可选，旧调用点零改动即继续可用。

---

## 二、四态 × 双视口实测

**环境**：隔离测试服务器 **`127.0.0.1:3210`**（`WP_MODE=mock`），**未复用 3200 主开发服务器**；
自动化提交全部走 Playwright 路由拦截注入响应，**未向真实 QQ 邮箱发任何测试信**。

`outputs/reports/astryx-p2-evidence-2026-10-11/audit-before.json`（18 行）：

| 视口 | 状态 | 控制台错误 | 横向溢出 |
|---|---|---|---|
| 320×568 | open / request-a-quote | 0 | 0 |
| 320×568 | open / dialog | 0 | 0 |
| 320×568 | validation / client | 0 | 0 |
| 320×568 | validation / server-422 | 1（预期） | 0 |
| 320×568 | submitting | 0 | 0 |
| 320×568 | success | 0 | 0 |
| 320×568 | server-error / 503 | 1（预期） | 0 |
| 320×568 | isolation / direct-fail-preserves-cart | 1（预期） | 0 |
| 320×568 | focus / escape-restores-trigger | 0 | — |
| 768×1024 | open / request-a-quote | 0 | 0 |
| 768×1024 | open / dialog | 0 | 0 |
| 768×1024 | validation / client | 0 | 0 |
| 768×1024 | validation / server-422 | 1（预期） | 0 |
| 768×1024 | submitting | 0 | 0 |
| 768×1024 | success | 0 | 0 |
| 768×1024 | server-error / 503 | 1（预期） | 0 |
| 768×1024 | isolation / direct-fail-preserves-cart | 1（预期） | 0 |
| 768×1024 | focus / escape-restores-trigger | 0 | — |

**关于那 2 类控制台错误**：逐条核对原文，只有两种，且都是**测试自己注入的响应**：

```
validation/server-422  | Failed to load resource: the server responded with a status of 422
server-error/503       | Failed to load resource: the server responded with a status of 503
```

→ 是浏览器对故意的 4xx/5xx 响应的标准记录，**不是应用缺陷**（应用层正确地把它渲染成了错误态）。
其余 16 个状态控制台零错误。**页面级横向溢出全部为 0。**

截图：`outputs/reports/astryx-p2-evidence-2026-10-11/before/*.png`（18 张，覆盖上表全部组合）。

---

## 三、成功判定：只认 `ok && persisted`

`src/components/inquiry-form.tsx:406-415`（实测）：

```ts
if (
  (response.status === 200 || response.status === 201) &&
  body?.ok &&
  body.persisted === true
) {
  if (mode === "cart") clearInquiryCart();
  setReceipt(body);
  setStatus("success");
  ...
}
```

服务端侧（`src/app/api/inquiries/route.ts:151`）：

```ts
if (saved.persisted) { ... ok: true ... persisted: true ... }
// else (route.ts:174) → ok: false, persisted: false
```

`src/lib/inquiry/store.ts:312` 的注释写明意图：

> `Fail loudly. "persisted: false" on a 201 would let a lead evaporate.`

→ **三处一致**：WordPress 未配置时只留内存并标 `persisted: false`，前端**不会**显示成功。
**SMTP / Outbox 状态从头到尾没有参与成功判定**，符合任务书「SMTP 后续状态不冒充落库成功」。

---

## 四、直接询盘 ↔ 清单询盘：隔离性

**关键隔离点在失败路径**：`clearInquiryCart()` 只出现在 **`mode === "cart"` 且已进入成功分支之后**（`inquiry-form.tsx:412`）。

```
❌ 直接询盘失败  →  mode === "direct"  →  clearInquiryCart() 永不执行  →  清单原样保留  ✅
✅ 清单询盘成功  →  mode === "cart"    →  clearInquiryCart() 执行      →  清单清空      ✅
```

隔离性的其余两处：清单摘要只在 cart mode 渲染（`:515`），直接询盘模式不出现；两种 mode 的
shell 样式分离（`:512`）。**已捕获 `isolation/direct-fail-preserves-cart` 状态截图（320/768 各一张）**。

---

## 五、数量约束：安全正整数，**无 999 上限**

代码为证（`src/lib/inquiry/schema.ts:29-35`）：

```ts
quantity: z
  .number({ error: "Quantity must be a number." })
  .int({ error: "Quantity must be a whole number." })
  .min(1, { error: "Quantity must be at least 1." })
  .refine(Number.isSafeInteger, {
    error: "Quantity is too large to process safely.",
  }),
```

- ✅ 必须是整数（`.int()`）
- ✅ 最小 1（`.min(1)`）
- ✅ 上限是 **`Number.isSafeInteger`（2^53−1）**，即「安全正整数」
- ✅ **全无 999 之类的业务上限** —— `grep -rn "999\|max(9" src/lib/inquiry/ src/components/wheels/direct-wheel-inquiry-dialog.tsx` **零命中**

> 注：`inquiryStepOneSchema` 里另有一个 **字符串型** `quantity`（`:52`），上限 40 字符，那是
> 第一步自由文本输入框的长度限制，**不是数量业务上限**，两者不可混为一谈。

---

## 六、焦点与键盘

| 项 | 结果 |
|---|---|
| 弹窗关闭后焦点回到触发器 | 已捕获 `focus/escape-restores-trigger`（320/768），控制台 0 错误 |
| Escape 关闭 | 同上 |
| 校验失败聚焦首个无效字段 | `focusFirstError()`（`inquiry-form.tsx:299`）遍历 `found` 并 `.focus()` 首个目标 |
| 服务端 422 回填后重新聚焦 | `:400-408` 把 `body.fieldErrors` 经 `SERVER_TO_FORM_FIELD` 映射回表单字段，再调 `focusFirstError(mapped)` |
| 加载中防重复提交 | `:337` `if (status === "submitting") return;` |
| 步骤语义 | 步骤条带 `aria-current="step"`（`:511`/`:528`） |
| 隐私同意项字段级文案 | 新增 `privacyConsentChanged`（`content/inquiry-form.ts:65` ← `inquiry-form.tsx:171`） |

---

## 七、价格 / 事实边界

本轮**未新增任何产品事实、价格或承诺**。改动只在表现层与表单状态机；
`privacyVersion` 作为可选 prop 透传，未改变隐私版本门槛语义。

---

## 八、门禁

| 命令 | 结果 |
|---|---|
| `npm run theme:check` | **ok** —— 产物新鲜，无漂移 |
| `npm test` | **42 pass / 0 fail** |
| `npm run lint` | **0 error**（4 条 warning 全部来自**我自己的临时探针脚本** `.tmp-p2-probe*.mjs`，收尾已删除） |
| `npm run typecheck` | **clean** |
| `npm run build` | **exit 0** |
| `git diff --check` | **clean** |

---

## 九、安全与工作树

- **未向真实 QQ SMTP 发任何信**；自动化提交只跑 `WP_MODE=mock` 的隔离 3210 服务器。
- **未 commit / push / deploy**（`git log -1` 仍是 `338d228`）。
- 未覆盖 P0/P1 及此前 221 个遗留未提交改动。
- 临时探针 `.tmp-p2-*.mjs` / `.tmp-p2-pw.config.ts`（以及 P1 遗留的 `.tmp-p1-*.mjs` 等）**收尾已全部删除**。

---

## 十、留待后续

- 全站 31 模板 × 四语言 × 四视口的完整回归（P5）。
- 键盘全序 + axe 全站扫描（P5）。
- `/thank-you` 页面的视觉收尾：本轮只核了询盘成功后的跳转与 `receiptToken` 传递，**未单独评审该页视觉**。
- P0 开放问题 1–3（Next Link 软导航/预取的真机验证）仍未关闭。
