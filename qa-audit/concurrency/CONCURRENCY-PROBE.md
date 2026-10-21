# 询盘并发实测（本地）

- **日期**：2026-10-18
- **回答的问题**：仓库里**有没有做过**本地并发测试？
- **答案**：❌ **没有**。本文件是**第一次**。
- **环境**：本地生产构建 `next start -p 3000` ＋ docker `fh-wp`(:8081) / `fh-wp-db`
- **方法**：真并发（`ThreadPoolExecutor`，HTTP 真打），每轮重启服务清空内存限流桶

---

## 一、结论速览

| 场景 | 期望 | 实测 | 结果 |
|---|---|---|---|
| 同一幂等键 × 15 并发（完整用户路径） | 恰好 1 条询盘 | **1 条**，DB 1 行，`{'201':1,'200':5,'429':9}` | ✅ **正确** |
| 同一幂等键 × 20 并发（直打 WP） | 恰好 1 条询盘 | **1 条** | ✅ **正确** |
| 同 email × 12 并发（Next 内存限流 3） | ≤3 通过 | **3 个 201 / 9 个 429** | ✅ **精确命中** |
| 同 IP × 12 并发（Next 内存限流 6） | ≤6 通过 | **6 个 201 / 6 个 429** | ✅ **精确命中** |
| 不同键 × 30 并发（直打 WP，local 免限流） | 全部落库 | **30/30 落库成功** | ✅ **无丢失** |
| outbox 一致性 | 询盘与 outbox 都写 | 43 行 key / outbox 43 条 | ✅ **一致** |

**并发正确性本身是过关的。** 幂等靠 `PRIMARY KEY (idempotency_key)` 硬保证，不是「先查后写」。

---

## 二、⚠️ 但发现 4 个真实问题（并发场景下会放大）

### 🔴 P1 · Next 内存限流 + WP transient 限流 = **双重计费**，用户会觉得「我才提交一次就被封」
- 两层限流**都放行前都会先计数**（见 `route.ts:90` → `rateLimit()` 在 `save()` 之前）
  - `rateLimit()` 先计 IP 桶、再计 email 桶（`guard.ts:97-98` 的 `??` 短路）
  - `save()` 之后才到 WP 的 `fh_inquiry_rate_limit_exceeded()`
- **实测证据**：同一幂等键 15 并发 → 1 个 201 + 5 个 200（重放）+ **9 个 429**
  → **15 次点击 = 15 次限流计数**，但用户意图只有 1 次
- Next 侧额度：IP 6 次 / email 3 次 / 10 分钟；WP 侧：20 次 / 10 分钟 / IP
- **风险**：用户点「提交」→网络抖动→多点几下 → **第 4 次就被 429**，而他的询盘其实早就进去了
- 📌 前端对 429 有文案（`inquiry-form.tsx:440` `ui.rateLimited`）但这文案**没告诉用户「你可能已经提交成功了」**

### 🔴 P1 · `WP_ENVIRONMENT_TYPE=local` **静默关掉** WP 侧限流 → 本地测不出真实行为
- `fenghuai-inquiries.php:585`：非 production 环境**直接 return false**
- 实测：本地 `wp_get_environment_type()` = **`local`**，限流桶数 **0 个**
- 而生产 `deploy/wordpress/compose.yml:42` 是 **`WP_ENVIRONMENT_TYPE: production`** → 限流**是开的**
- **后果**：在本地做任何限流相关验证**结论都不可信**（永远看不到 429）
- 📌 附带发现：该豁免的注释里自述「measured impact: ~80 submissions → 67 pass / 12 fail, every failure an unexpected 429」→ **这个坑踩过一次了**

### 🟡 P2 · Next 内存限流**不支持多实例**
- `guard.ts:10` `const counters = new Map<string, Counter>()` —— **进程内内存**
- 后果：多实例（或滚动发布中新旧并存）→ **每个进程一套计数** → 实际额度变成 `N × 配置值`
- 且**进程重启即清零**（我每轮重启服务都验证到了这一点）
- 生产 `deploy/frontend/compose.yml` 当前**单实例**，所以暂时不是问题
- 📌 与既有任务卡 A-04 的 todo 呼应：「测单实例及计划实例数的缓存失效、滚动发布和重放」

### 🟡 P2 · 用户重试**没有指数退避**，是固定 10 分钟窗口
- 429 响应的 `Retry-After` 是**距窗口结束的剩余秒数**（`guard.ts:72`）
- 用户等窗口结束再提交**必然成功**（因为内存计数已随重启/窗口清零）→ 行为可预期，但体验粗糙

---

## 三、✅ 已验证正确的部分（可以放心的）

1. **幂等是硬的**：`fenghuai-inquiries.php:286` `PRIMARY KEY (idempotency_key)` —— 并发重放走数据库唯一约束，**不是先查后写**，所以没有 TOCTOU 竞态
2. **重放语义正确**：首次 `201`、重放 `200`，**返回同一询盘号**
3. **不同键并发不串号**：30 并发 → 30 条独立记录，`seq` 自增列无冲突
4. **outbox 与 key 表一致**：43 / 43
5. **429 有明确错误码与 `Retry-After`**，前端有对应文案
6. **限流不信任 `X-Forwarded-For`**（`tests/inquiry-consent-ratelimit.test.mts` 有断言，且绑 `REMOTE_ADDR`）

---

## 四、关于 outbox 里那 20 条 `failed`（**不是并发缺陷**）

实测 outbox：`accepted 22 / failed 20 / pending 1`

排查结论：**全部是 `smtp: SMTP Error: Could not authenticate.`**
- 时间：`2026-10-12 09:11` → `2026-10-18 04:11`
- 原因：**本地没配 SMTP 凭据**，邮件发不出去
- ✅ **关键**：询盘**数据全部正确落库**，只是邮件投递失败 → 这正是「先存后发」设计要达到的效果
- 启动时报的 `WARN INQUIRY_TO: 未配置 → 销售收不到询盘通知邮件（询盘本身仍会入库）` 就是这个

---

## 五、复现命令

```bash
# 1. 起本地生产服务（必须带 Origin 白名单，否则 403）
cd /Users/fkycoya/Documents/Code/WordpressWheelSIte
ALLOW_LOOPBACK_WP_MEDIA=true NODE_ENV=production \
INQUIRY_ALLOWED_ORIGINS="http://127.0.0.1:3000" npx next start -p 3000

# 2. 跑并发探针（每轮测前重启服务，清空内存限流桶）
python3 qa-audit/concurrency/concurrency-probe.py
```

⚠️ **两个必踩的坑**
1. **`Origin not allowed` (403)**：生产构建**不加 localhost** 到白名单（`guard.ts` 只在 `NODE_ENV !== "production"` 时加）→ 必须显式传 `INQUIRY_ALLOWED_ORIGINS`
2. **限流桶跨轮污染**：内存限流窗口 10 分钟，**测 B/C 前必须重启服务**，否则前面测出的 429 全被算进后面的

---

## 六、建议动作

| 优先级 | 动作 | 理由 |
|---|---|---|
| P1 | **让 429 文案说清「可能已提交成功」** | 用户重复点击时最痛的点 |
| P1 | **本地开 `WP_ENVIRONMENT_TYPE=production` 做限流验证**，或加专用开关 | 否则本地限流永远测不出 |
| P2 | **重放（`replayed=true`）不计限流** | 幂等重放不该消耗额度 |
| P2 | **内存限流换共享存储**（仅多实例时需要） | 当前单实例，可延后 |
| P2 | 把并发用例并入 `scripts/verify-inquiry-backend.py` | 那是 A-04 任务卡的验收条件 |

---

## 七、与既有任务卡的关系

`work/queued/2026-10-17-audit-04-inquiry-idempotency-transaction.md`（A-04）的 Todo 明确写着：

> - [ ] 在隔离数据库实测大小写、尾随空格、**并发重放**及不同请求键冲突，先备份再演练迁移。
> - [ ] 验证事务回滚、outbox 持久化、**重放响应**和故障错误码

**本次实测覆盖了其中「并发重放」「不同请求键冲突」「重放响应」「outbox 持久化」四项的运行时行为**，
但 A-04 的另外两项**仍未做**：
- ❌ 大小写 / 尾随空格的幂等键碰撞（需要二进制 collation 迁移演练）
- ❌ 事务回滚的隔离库演练（需要备份 + 独立库）

**A-04 状态：仍未完成**（本次是其运行时部分的第一步证据）。

---

# 附：限流放宽 + 重放退还（2026-10-18 12:20 修复）

用户决策：**email 10 / IP 60**，并「全做」配套三件事。

## 改动清单（5 个文件）

| 文件 | 改动 |
|---|---|
| `src/lib/inquiry/guard.ts` | 额度 6/3 → **60/10**；改 env 可配；新增 `refundRateLimit()`；`consume()` 改为饱和计数 |
| `src/app/api/inquiries/route.ts` | `save()` 之后按 `saved.replayed` 退还额度 |
| `local-wp/mu-plugins/fenghuai-inquiries.php` | `apply_filters('fh_inquiry_rate_limit', 20)` → **60** 且可经 `FH_INQUIRY_RATE_LIMIT` 配置 |
| `tests/inquiry-contract.test.mts` | 断言从「第 4 次限流」改为「第 11 次」；**新增 3 条用例** |
| `src/content/inquiry-form.ts` + `src/lib/i18n/inquiry-form-copy.ts` | 4 语言 429 文案补「你可能已提交成功」 |
| `.env.example` | 补 `INQUIRY_RATE_LIMIT_IP` / `INQUIRY_RATE_LIMIT_EMAIL` |

## 最终额度（两层，谁小谁生效）

| 层 | 维度 | 旧 | 新 |
|---|---|---|---|
| Next | IP | 6 | **60** |
| Next | email | 3 | **10** |
| WP | IP | 20 | **60** |

## 端到端实测（真实路径，重建后）

```
TEST 1  同一幂等键 × 15 并发（重放应退还额度）
   状态码 {'201': 1, '200': 14}   不同询盘号 1
   → 429 数量 0  ✅ 重放已退还

TEST 2  同一 email 不同幂等键，连提 12 次（额度应为 10）
   状态码 {'201': 10, '429': 2}
   → 恰好 10 次放行、第 11 次起限流  ✅ 额度精确
```

对照修复前：同一幂等键 15 并发 = `{'201':1,'200':5,'429':9}` → **9 个 429**。
**现在同样操作 0 个 429。**

## 🐛 实现过程中被测试抓到的 2 个真 bug（都已修）

1. **退款只退了一个桶** —— `rateLimit()` 里 IP 桶未超限时会**继续走到 email 桶**，
   所以一次放行的请求两个桶**各加 1**。第一版只退 IP 桶 → email 计数永远追不平，
   退完仍被限流。
2. **被拦的那次也自增计数** —— 计数停在 `limit+1`，于是「退 1 次」只能拉回 `limit`，
   下一次又是 `limit+1`，**退款永远追不平**。改为 `>= limit` 就不再自增（饱和计数）。

> 两个都是「看起来对、跑起来错」，且都只有靠**断言计数变化**才发现 —— 光看
> 「返回了 429」是看不出来的。

## 🛡️ 安全性论证（为什么放宽不会变成漏洞）

1. **重放不能创建询盘**：退款只在 `saved.replayed === true` 时发生，每次重放自身也
   消耗 1 次额度 → 净支出为 0，但**永远不会新增一条询盘**。
2. **被拦的请求拿不到退款**：`rateLimit()` 在 `route.ts:90` 就 429 返回，**走不到
   `save()`**，所以退款只覆盖真的重放了的那一次。
3. **退款只减 1、绝不删桶**：删桶等于给每个知道幂等键的人一个重置计数的入口。
   有专门用例断言「退款 1 次只买回 1 次、买不回一整桶」。
4. **放宽后主力防护仍在**：`automationTrap`（填表耗时判定）+ Origin 白名单
   （实测裸 curl 会被 403），限流只是兜底。
5. **配错不会静默失效**：非法/非正数 env 一律回落到默认值，有专门用例覆盖
   （`0` / `-5` / `abc` / 空串都不允许变成「无限」）。

## 门禁

`tsc --noEmit` ✅ ｜ `eslint` ✅ ｜ `npm test` **144 pass / 0 fail** ✅ ｜ `next build` 186/186 ✅

## 回滚件

`/tmp/guard.bak.ts` ｜ `/tmp/route.bak.ts` ｜ `/tmp/fh-inquiries.bak.php` ｜
`/tmp/inquiry-contract.bak.mts` ｜ `/tmp/copy.bak.ts`

## ⏳ 仍未处理

- **Next 内存限流不支持多实例**（当前单实例，未动）
- **本地 `WP_ENVIRONMENT_TYPE=local` 仍豁免 WP 侧限流** → 本地验证的是 Next 侧；
  WP 侧只做到「解析值 = 60」的静态核验，**真实 429 行为未在本地复现**
