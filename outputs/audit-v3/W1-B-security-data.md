# W1-B · 安全与数据完整性审计（M10 / M11 / M14）

> Agent：**B · 安全与数据完整性**
> 依据：`outputs/audit-v3/BASELINE.md`（唯一事实源）
> 采集方式：只读源码（E1）+ 引 BASELINE 实跑（E5）。**未跑 build / 未跑 E2E / 未 npm install / 未连 WordPress 数据库 / 未提交测试询盘 / 未发任何邮件。**
> 证据等级：**E1** = 源码；**E5** = BASELINE 本机实跑；**E4** = 仓库内自述报告（不作为「已满足」依据）。

---

## 执行摘要

**结论：M10、M11、M14 三个模块的「数据不丢失」这条底线，代码层面是真的守住了，而且是全项目质量最高的部分。** 事务边界、幂等唯一键、outbox、fail-closed 鉴权、HMAC 常量时间比对，这五件事都有逐行代码证据。

但 **M11 的那个已知矛盾是真的，而且比 BASELINE 猜的更糟**：不是「两套并存」，是 **三层并存**（Next Resend 死代码 / WP SMTP 主通道 / WP Resend 兜底），并且**回执密钥与上游服务密钥可以静默降级复用**。

同时发现 **2 个此前未被记录的实质缺陷**：

1. **幂等键用 `CHAR(64)` + `utf8mb4` 排序规则做主键**（`fenghuai-inquiries.php:281-288`）。MySQL 对 CHAR 主键做尾随空格填充 + `_ci` 大小写不敏感比较 → **语义上不同的幂等键会碰撞**。碰撞后果在客户侧表现为「显示成功、实际未新增询盘」。
2. **`/thank-you` 显式 `robots: index: true`**（`src/app/thank-you/page.tsx:19`）—— 询盘感谢页允许被索引。

还有 **1 个自述与代码不符的回归**：`.env.example:55` 声称「隐私版本留空 → API 返回 503」，但该闸门已在 2026-10-12 被移除（`validate.ts:19` 参数带下划线未使用）。**代码是对的，注释是错的**，但这条注释现在是唯一还写着「有隐私闸门」的地方 —— 法务若据此判断会误判。

---

## M10 询盘系统

**成熟度**: **4/5**（BASE 判定 4，因幂等键排序规则缺陷与 0 条事务自动化断言，下调为 4- ）
**状态**: **部分满足**（核心链路已满足；幂等键实现有技术缺陷；无自动化事务回归）

### 证据

#### 事务（逐行）

- [E1] `local-wp/.../fenghuai-inquiries.php:1057` — `$wpdb->query('START TRANSACTION');` 事务起点，**在幂等键 INSERT 之前**。
- [E1] `:1060-1064` — 幂等键 INSERT 先于 CPT 创建（先占唯一键，这是正确的并发顺序）。
- [E1] `:1066` — 唯一键冲突分支：`$wpdb->query('ROLLBACK');` → 走 `fh_inquiry_find_existing()` 重放。
- [E1] `:1085-1094` — `wp_insert_post()` 被显式包在事务内（注释明说「wp_insert_post() 本身不构成事务单元」）。
- [E1] `:1095-1150` — meta、`email_status`/`business_status` 初值、键→CPT 关联，**每一步失败都 `ROLLBACK`**（`:1098` `:1124` `:1133` `:1150`）。
- [E1] `:1136-1150` — outbox 行在**事务内**插入，失败 `ROLLBACK`。
- [E1] `:1157` — `$wpdb->query('COMMIT');` — **主记录 + meta + 幂等键 + outbox 全部在同一个事务内提交。这一条 BASELINE 的问题答案是「是」。**
- [E1] `:1160` — `COMMIT` 之后才 `fh_inquiry_dispatch_email()`，且注释写明「绝不在长事务里发信」。
- [E1] `:2627-2652` — 保留期删除的级联：`START TRANSACTION` → 删 event → 删 outbox → 删 key → `wp_delete_post($postId, true)` → `COMMIT`；`catch` 里 `ROLLBACK`。
- [E1] `store.ts:180-262` — Next 侧 `save()` **不持有任何事务**，只 `wpWrite()` 转发。事务全部在 WordPress。这是 DEC-055 的正确设计，不是缺口。

**⚠️ 未验证的隐含前提**：上述事务要真正可回滚，`wp_posts` / `wp_postmeta` **必须是 InnoDB**。`fenghuai-inquiries.php:270` 只取了 `$wpdb->get_charset_collate()`，**没有显式 `ENGINE=InnoDB`**，MyISAM 下 `START TRANSACTION` 静默无效（`wp_insert_post` 不可回滚，但幂等键表可回滚 → 会产生「键行消失但 CPT 留下」的脏数据）。属**移交 4 号 Agent（部署）** 核实 MySQL 默认引擎；本报告不假设。

#### 幂等键

- [E1] `local-wp/.../fenghuai-inquiries.php:281-288` — 表结构：`idempotency_key char(64) NOT NULL` + `PRIMARY KEY (idempotency_key)` + `seq bigint AUTO_INCREMENT` + `UNIQUE KEY seq (seq)`。
- [E1] `:279-280` 与 `:927-936` — 询盘号 `INQ-YYYYMMDD-NNNN` 的 NNNN 取自 `seq`，**故意不用 `wp_posts.ID`**（避免泄露全站文章总数）。这个决策是正确的，注释也诚实标注了跳号。
- [E1] `:759-766` — 服务端正则 `^[A-Za-z0-9_-]{32,64}$`，不合法 → `fieldErrors.idempotencyKey`。
- [E1] `src/app/api/inquiries/route.ts:38` — 客户端契约同为 `^[A-Za-z0-9_-]{32,64}$`；`:43-48` `readIdempotencyKey()`：**缺失不拒绝，服务端补一个，降级为 at-least-once**（注释写明「不能把传输问题变成丢线索」）。
- [E1] `store.ts:364-368` — `generateIdempotencyKey()`：`crypto.getRandomValues(24 字节)` → 48 位 hex。
- [E1] `local-wp/.../fenghuai-inquiries.php:949-967` — `fh_inquiry_find_existing()` 用 `LEFT JOIN posts` 取回原询盘，**并要求 `inquiry_id > 0` 且 `post_title` 非空**才认为是有效重放（防「键行写了但 CPT 没写」的孤儿当成功返回）。
- [E1] `:1006-1015` — 重放返回 `HTTP 200` + `replayed: true`；`:1024-1027` 首次创建返回 `201`。
- [E1] `:1050-1051` — 注释明确拒绝「先查再插」的竞态做法，以唯一键冲突为权威判据。

**🔴 缺陷（本次新发现）**：`idempotency_key` 是 **`char(64)`**，而表用 `$wpdb->get_charset_collate()`（`:270`，即 `utf8mb4_unicode_520_ci` 之类 `_ci` 排序规则）。MySQL 对 `CHAR` 主键做 **PAD SPACE 尾随空格填充**，且 `_ci` 排序规则**大小写不敏感**。后果：
- `"Aaaa…(64)"` 与 `"aaaa…(64)"` 被判为**同一个键** → 第二个客户（或同一客户的第二次真实提交）被当作重放，返回 `200 + replayed:true` 与**第一个客户的询盘号**。
- 违反正则契约（正则允许 32–64 位，`char(64)` 只存 64；32 位键被尾部补齐）。
- 危害等级取决于客户端随机性：Next 生成的 48 位小写 hex 不会自撞，但**契约允许大写**，且 WP 端点是**公网可达**（只要有服务密钥）的，攻击面不为零。
- 修法明确：改 `VARCHAR(64)` + `utf8mb4_bin`（或 `ascii_bin`），并提升 `FH_INQUIRY_DB_VERSION`（`:44-48` 已有版本闸门，改 DDL 必须提升 —— 注释 `:31` 已警告）。

#### 状态流转

- [E1] `local-wp/.../fenghuai-inquiries.php:112-121` — 业务状态 5 个：`new` / `assigned` / `contacted` / `closed` / `spam`。
- [E1] `:123-135` — 邮件状态 7 个（只读，投递流程写）。
- [E1] `:2052-2073` — `fh_inquiry_save_fields()`：`wp_verify_nonce` + `current_user_can('edit_post', $postId)` + **枚举白名单 fail-closed**（非法取值直接不改）。
- [E1] `:2078-2098` — `admin_post_fh_inquiry_update_status` 列表页内联改状态，有 `current_user_can(FH_INQUIRY_CAP_MANAGE)`。
- [E1] `:2826-2862` — 按状态计数 + 状态 tab。
- **结论：销售能否接手/跟进/记录结果？——能。** 不是只有「已收到」。`assigned` / `contacted` / `closed` / `spam` 四态齐全，有独立销售角色（见 M14）。
- [E1] `store.ts:410-412` — `assignOwner()` **恒返回 `"unassigned"`**。自动分配**未实现**（注释 `:398-408` 说明：「按区域分配属客户未拍板的开放问题」）。这是**有意不做**，不是遗漏。

#### 多产品清单（cart）

- [E1] `src/lib/wheels/inquiry-cart.ts`（存在，>60 行）— 归一化单款：`model`/`productionCode`/`slug`/`size`/`pcd`/`offset`/`centerBore`/`quantity`，`normalizeItems()` 用 `Map` **按键合并重复项**。
- [E1] `src/lib/i18n/inquiry-cart-copy.ts` 存在 —— 该文件是**多语言文案表**，不是 cart 逻辑。**它说明 cart 是已上产品的功能（有 4 语 UI 文案），不是原型。**
- [E1] 引用方 6 处：`components/inquiry-form.tsx`、`components/wheels/inquiry-cart-summary.tsx`、`components/wheels/wheel-inquiry-panel.tsx`、`components/wheels/wheel-catalogue-card.tsx`、`lib/wheels/inquiry-cart.ts`、`lib/i18n/inquiry-cart-copy.ts`。
- [E1] `schema.ts:118-121` — `items: z.array(inquiryItemSchema).max(20)`。
- [E1] `src/app/api/inquiries/route.ts:126-140` — **服务端对每一项按公开目录重查** `bindWheelEnquiryItems()`，解析不到的**不拒绝**（仍是真线索），但**清空客户端传来的 spec**，改为 `variant_pending`。这一条直接对应 `PAGE-SPECS/wheel-detail.md §7` 的「客户端隐藏字段不能成为订单事实源」。
- [E1] `e2e/inquiry.spec.ts:98,155,188,255` — 4 条 E2E 覆盖多款清单（恢复、提交、删除/清空、详情页只提交当前配置）。**属 E3，BASELINE 未实跑。**
- **结论：cart 已实现，且服务端回查是正确做法。**

#### 数据保留

- [E1] `local-wp/.../fenghuai-inquiries.php:2572-2580` — `fh_inquiry_retention_days()`：常量或 `getenv('FH_INQUIRY_RETENTION_DAYS')`，非数字 → 0；`min($days, 36500)` 封顶。
- [E1] `:2684-2701` — `fh_inquiry_schedule_retention()`：**days === 0 时主动 `wp_clear_scheduled_hook()`**（关闭状态下连残留 cron 都清掉，这是好设计）。
- [E1] `:2655-2682` — `fh_inquiry_run_retention()` 执行删除，逐条 `fh_inquiry_delete_cascade()`，返回 `deleted`/`failed` 计数。
- [E1] `.env.example:40` — `FH_INQUIRY_RETENTION_DAYS=0`（默认关闭）。
- [E1] `.env.example:39` — 注释：「**仅供部署清单对照；真正取值配置在 WordPress 运行环境**」。
- **答案：有执行者。** `fh_inquiry_run_retention` 挂在 `FH_INQUIRY_RETENTION_HOOK`（`:2683`），由 `:2684` 每日排程。**但默认值为 0 = 永不删除。** 这是**有意为之**（`outputs/reports/04-privacy-logging-retention-audit-2026-10-09.md:41` 明言「在法务批准前保持 0，避免代理替法务选删除期限」）。
- **⚠️ 遗留风险**：Next 侧 `.env.example` 也写了同名变量（`:40`）。若运维只配了 Next 侧，**WordPress 侧仍然是 0 → 永不清理**，且没有任何告警。这是一个**配置哑弹**。

#### 防垃圾

- [E1] `guard.ts:49-70` — `originAllowed()`：`Origin` 头缺失时 `return process.env.NODE_ENV !== "production"`（生产 fail-closed，正确）；`configuredOrigins()` 来自 `NEXT_PUBLIC_APP_URL` + `INQUIRY_ALLOWED_ORIGINS`（`:16-35`）；非生产额外放行 localhost。
- [E1] `guard.ts:72-87` — `automationTrap()`：**蜜罐**（`website` 字段非空 → 拒绝）+ **时间陷阱**（`MIN_FILL_MS=1500` / `MAX_FILL_MS=24h`）。
- [E1] `src/components/inquiry-form.tsx:734-745` — 蜜罐是真的隐藏：`absolute -left-[9999px]` + `aria-hidden="true"` + `tabIndex={-1}` + `autoComplete="off"`（对屏幕阅读器与键盘用户也隐藏，合规）。
- [E1] `guard.ts:94-115` — `rateLimit()`：**IP 6 次 / 10 分钟**，**邮箱 3 次 / 10 分钟**；键用 `sha256` 摘要（`:97-101`），**不存 IP/邮箱原文**；`counters.size > 5000` 时顺带清扫过期项（`:108-112`）。
- [E1] `guard.ts:104-109` — `clientAddress()` 取 `cf-connecting-ip` → `x-real-ip` → `x-forwarded-for[0]`。**⚠️ 这三个头都可被客户端伪造**，除非前置代理强制覆盖。当前部署是 `nginx` 反代（BASELINE §11），需确认 nginx 是否 `proxy_set_header X-Real-IP`。
- [E1] `route.ts:59-63` — 16KB body 上限，且**双检**（`content-length` 与 `text()` 实际字节）。
- **Akismet：未使用。** [E1] `grep -rn "akismet" local-wp/.../mu-plugins/` 零命中 —— BASELINE §7 记录了 akismet 插件已安装，但询盘链路**没有调用**它。属**已知缺口，非缺陷**（自研蜜罐+限流已覆盖主要场景）。
- **⚠️ 限流是进程内内存**（`guard.ts:9` `const counters = new Map()`）。多实例 / 容器重启即失效；`standalone` 单实例部署下可接受，**但这是「已知能力边界」而不是「可扩展方案」**。

#### 校验

- [E1] `schema.ts:1` — `import { z } from "zod"` —— **是 Zod，v4.6.5**（BASELINE §4 已核）。
- [E1] `schema.ts:17-32` `inquiryItemSchema` / `:36-58` `inquiryStepOneSchema` / `:60-101` `inquiryStepTwoSchema` / `:103-124` `inquirySubmissionSchema`（`.extend` 复用）。全部 `.trim()` + `.max()` + **显式中文 error 文案**，不是默认报错。
- [E1] `schema.ts:58` — `quantity` 允许任意安全正整数（E2E/单测覆盖）。
- [E1] `validate.ts:23-26` — 服务端**独立执行** `inquirySubmissionSchema.safeParse()`，不信任客户端。
- [E1] `validate.ts:46-76` — context 字段每个都过 `contextString(max)` 白名单截断；`selectedSpec` 限 12 键 / 每值 120 字符。
- [E1] **前后端同源**：`components/inquiry-form.tsx` 与 `validate.ts` 共用 `schema.ts`（`inquiry-contract.test.mts:20` 导入 schema 断言）。
- [E1] **双层校验确实存在**：Next（Zod）→ WordPress（`:755-802` 手写 PHP 校验，含 `idempotencyKey` 正则、枚举白名单、`mb_strlen` 长度上限、**超限报错而非静默截断**）。
- [E1] `tests/inquiry-contract.test.mts` 13 条：覆盖 4 产品线、20 项上限、数量边界、两步契约、字段错误映射、超长不截断、无需隐私勾选、蜜罐+时间陷阱、Origin 白名单、限流第 4 次、限流键不含原文、回执 15 分钟失效（`:36-200`）。
- [E5] BASELINE §3：`npm test` **68/68 通过**，含上述 13 条。

#### 数据完整性约束

- [E1] **有，且有真正的唯一约束**：`idempotency_key` `PRIMARY KEY`（`:286`）、`seq` `UNIQUE KEY`（`:287`）、`provider_event (provider_event_id, event_type)` `UNIQUE KEY`（`:321`）。
- [E1] **没有外键**：`KEY inquiry_id (...)` 是普通索引（`:288` `:307`），不是 `FOREIGN KEY`。理由合理 —— WordPress 生态不用 FK（`wp_posts` 表本身就没有），`wp_delete_post` 会绕过 FK 语义。**级联一致性靠应用层 `fh_inquiry_delete_cascade()`（`:2612-2653`）。**
- [E1] `:312-322` — event 表 `UNIQUE(provider_event_id, event_type)` 是「重复/乱序回调只记一次」的**硬保证**（`:309-311` 注释）。
- **判定：数据完整性不是「全靠应用层」，唯一性是数据库层的；引用完整性（级联）是应用层的，且只有一条路径（保留期清理）实现了级联，人工后台删除需核实是否走同一路径 → 移交 4 号 Agent。**

### 已具备

1. 主记录 + meta + 幂等键 + outbox **同一事务**，5 条 ROLLBACK 分支齐全（E1 逐行）。
2. 幂等键是**数据库主键**，不是应用层去重（`:286`）。
3. 事务内**不发信**，COMMIT 后才派发（`:1157-1160`）。
4. `wp_insert_post` 被显式纳入事务，注释诚实承认它不是天然事务单元（`:1085-1087`）。
5. 服务端强制回查轮毂规格，客户端 spec 不可信（`route.ts:126-140`）。
6. 双层 Zod + PHP 校验，超限报错不静默截断。
7. 保留期有真实执行者且默认关闭、关闭时主动清 cron。

### 缺口

| # | 缺口 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G-M10-1 | **`idempotency_key char(64)` + `_ci` 排序规则** → 尾随空格填充 + 大小写不敏感 → 语义不同的键碰撞，客户侧表现为「假成功」 | **高** | **是**（数据正确性，非安全，但属一票否决级） |
| G-M10-2 | **`store.ts`（420 行）没有任何专属测试**。`tests/` 下 grep `store.ts` / `wpWrite` **零命中**。事务/幂等/持久化断言 **0 条自动化** | **高** | 否（但必须有 E3/E5 补证） |
| G-M10-3 | 事务可回滚**依赖 InnoDB**，DDL 未显式 `ENGINE=InnoDB`（`:270` 只取 collate） | 中 | 需核实后定 |
| G-M10-4 | 限流是**进程内 Map**（`guard.ts:9`），重启即清零，多实例不共享 | 中 | 否 |
| G-M10-5 | `clientAddress()` 信任 `x-forwarded-for` / `cf-connecting-ip`（`guard.ts:104-109`），若反代不覆盖则可伪造绕过限流 | 中 | 否 |
| G-M10-6 | `FH_INQUIRY_RETENTION_DAYS` 在 `.env.example` 出现两次（Next 侧），**Next 侧不是执行者** → 配错地方 = 永不清理且无告警 | 中 | 否 |
| G-M10-7 | Akismet 已安装但询盘链路未调用 | 低 | 否 |
| G-M10-8 | `assignOwner()` 恒返回 `"unassigned"`（`store.ts:410-412`）—— 自动分配未实现 | 低 | 否（有意不做） |

### 重复实现

- **无实质重复。** Next 侧（`store.ts`）与 WP 侧（`fenghuai-inquiries.php`）的 `PRODUCT_LINES` / `CUSTOMER_TYPES` 枚举各写一份（`store.ts:38-44` vs `fenghuai-inquiries.php` 的 `fh_inquiry_product_line_options()`），但这是**跨语言边界的必要重复**，且两侧都从同一份 Zod 契约派生取值 —— 属可接受的双写，非漂移。
- [E1] `store.ts:31-35` 注释明确「Next 不再写任何 `wp_*` 表，也不持有 DB 凭证」—— **没有第二套写库实现**。

### 风险

1. **G-M10-1 的实际触发面**：当前客户端生成的是 48 位小写 hex，撞不上。但契约（`route.ts:38` `^[A-Za-z0-9_-]{32,64}$`）允许大写与 `-`/`_`，且 WP 端点只要求服务密钥。**属「现在还不会发，但契约允许发」**。
2. **零事务自动化**是本次审计最该点出来的：`scripts/verify-inquiry-backend.py:13-16` 里写着「用一个在 COMMIT 前故意失败��探针实测 ROLLBACK」，但 **该脚本不在 CI**（BASELINE §10：CI 只有 checkout/node/ci/test/check/audit:prod）。**结论：事务正确性当前只有「读代码」这一层证据，没有「跑过」这一层。**
3. `nextMockId()`（`store.ts:113-121`）生成 `INQ-YYYYMMDD-NNNN`，**与 WP 侧真实编号格式相同**。虽然 `persisted:false` 会阻止当成成功（`route.ts:169-180` 返回 503），但日志/截图中两种编号无法肉眼区分。

### 建议动作

1. **[阻塞] 修 G-M10-1**：`idempotency_key` 改 `VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin`（或 `utf8mb4_bin`），**提升 `FH_INQUIRY_DB_VERSION`**（`:45`，否则 dbDelta 不重跑）。
2. **[阻塞] 把 `scripts/verify-inquiry-backend.py` 接进 CI**，或至少在发布 checklist 里定为必跑项 —— 它已有事务探针与幂等双发探针，是现成的。
3. 给 `store.ts` 补单测：`save()` 的 5 条分支（live 成功 / not_configured×prod / not_configured×dev / 422 / 5xx）+ `replayed` 透传。
4. 在 `.env.example` 给 `FH_INQUIRY_RETENTION_DAYS` 加一行警告：「此变量在 Next 侧无效，必须在 WordPress 容器配置」，或直接**从 Next 侧 `.env.example` 删除**。
5. 确认 nginx 是否覆盖 `X-Real-IP`；若不覆盖，`clientAddress()` 应改为只信任反代注入的头。

### 依赖

- **依赖 4 号 Agent（部署）**：MySQL 默认引擎是否为 InnoDB；后台人工删除询盘是否走 `fh_inquiry_delete_cascade`。
- **依赖 5 号 Agent（测试）**：`e2e/inquiry.spec.ts` 15 条的真实通过率（BASELINE 未跑）；`playwright-report/` 最近一次结果。

### 验收方式

- **G-M10-1**：`SHOW CREATE TABLE wp_fh_inquiry_key` 必须为 `VARCHAR(64)` + `_bin` 排序规则；构造 `"A"*64` 与 `"a"*64` 两次提交，必须返回**两个不同询盘号**（当前会返回同一个）。
- **G-M10-3**：`SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_NAME IN ('wp_posts','wp_postmeta','wp_fh_inquiry_key')` 必须全为 `InnoDB`。
- **事务**：跑 `python3 scripts/verify-inquiry-backend.py`，确认 ROLLBACK 探针通过（提交前注入失败 → CPT/键行/outbox 全部消失）。

---

## M11 邮件通知

**成熟度**: **3/5**（功能可用且有效；但通道分层混乱、密钥降级、模板与 6 层配置耦合、并发可重复发信）
**状态**: **有风险**（**这是本报告最重要的模块**）

### 证据

#### 那个已知矛盾 —— 查清了，比 BASELINE 想的更复杂

**BASELINE 猜「两套并存」。实际是三层：**

| # | 路径 | 实现 | 是否活着 |
|---|---|---|---|
| **L1** | Next `src/lib/inquiry/mailer.ts` → **Resend HTTP** | `fetch("https://api.resend.com/emails")`（`mailer.ts:87-105`），键 `RESEND_API_KEY`（`:78`） | **死代码** |
| **L2** | WP `fh_inquiry_send_via_smtp()` → **PHPMailer / QQ SMTP** | `fenghuai-inquiries.php:2976-3029` | **活着，主通道** |
| **L3** | WP `fh_inquiry_dispatch_email()` → **Resend HTTP 兜底** | 同文件 `:1543-1594`，键 `fh_inquiry_resend_key()`（`:1223-1226`） | **活着，备通道** |

**L1 是死代码，证据链完整：**
- [E1] `mailer.ts:78` `const apiKey = process.env.RESEND_API_KEY;` —— 存在。
- [E1] `mailer.ts:1` `import type { InquiryRecord }` —— **唯一的 import**。
- [E1] **`grep -rn "markDelivered|isMockMode" src` 只返回定义处，零调用点**：`mailer.ts:100`（定义）、`index.ts:12`（再导出）、`store.ts:371`（`markDelivered` 定义）。
- [E1] `index.ts:12` `export { isMockMode, send } from "./mailer";` —— 只有 barrel 再导出，**没有任何消费者 import `send`**。
- [E1] `route.ts:29-31` 注释亲口承认：「The **mail step also moves there** — it runs after WordPress commits its transaction」。
- [E1] `route.ts:150-153`：「It also queued (and attempted) the sales mail inside the same commit, **so there is nothing to send here**」。
- [E1] `.env.example:47-52` —— **仓库自己已经写清楚了**：「── 旧邮件适配器（**当前询盘路由不使用**）── 自 DEC-055 起，销售通知只由 WordPress Outbox 在事务提交后发出」。

**→ 所以「STATUS.md 说走 QQ SMTP / PHPMailer」是【对的】，`RESEND_API_KEY` 在 `.env.example` 里是【历史残留】。BASELINE 的矛盾点，答案是：`mailer.ts` 整个文件是死代码，`RESEND_API_KEY` 对询盘链路无作用。**

**但 L3 让事情变复杂**：WP 侧仍有 Resend 兜底（`:1543-1594`），且 **`fh_inquiry_resend_key()` 会读 `getenv('RESEND_API_KEY')`**（`:1225`）。这意味着：**只要 WordPress 容器环境里有 `RESEND_API_KEY`，L3 就是活的**。若 SMTP 配置不全（`fh_inquiry_smtp_configured()` 缺任一项即 false，`:2953-2958`），邮件会**静默地从 QQ SMTP 切换到 Resend 通道**，发件人地址、送达率、退信处理全部改变，而**没有任何告警**。

#### 主通道判定

- [E1] `fenghuai-inquiries.php:2978-2983` — 注释：「配了 SMTP 就走 SMTP，没配才回落 Resend，两者都没配仍是 pending（保持 fail-closed，不假装成功）」。
- [E1] `:1475` `$useSmtp = fh_inquiry_smtp_configured();`
- [E1] `:1476-1486` — 两条都没配 → `email_status=pending` + `last_error='未配置发信通道'` + outbox `pending`，**返回 'pending' 而非假装成功**。
- [E1] `:1509-1515` — SMTP 分支，成功 → `accepted`。
- [E1] `:1543-1594` — Resend 分支（`if (!$useSmtp)` 之后）。
- **主通道 = SMTP（QQ，`smtp.qq.com:465` ssl，`:2985-2990` 默认值）。兜底 = Resend。**

#### 会不会重复发信？

- [E1] **不会「双通道各发一次」** —— `$useSmtp` 是排他分支，SMTP 成功即 `return 'accepted'`（`:1515`），不会走到 Resend。
- [E1] **但可能「同一询盘发 2 次」**：`fh_inquiry_dispatch_email()` 在 REST create 路径（`:1160`）**立即同步调用一次**，同时 outbox 行 `status=pending`。若这次调用写入 `accepted` 失败（如 `$wpdb->update` 静默失败），而 cron worker 随后领到该行（`fh_inquiry_claim_outbox()` `:2369-2429`），就会**再发一次**。outbox 有租约（`:2376` `FH_INQUIRY_DISPATCH_LEASE_MINUTES = 5`）+ 原子抢单（`:2402-2429` `$affected === 1`），**但没有「已发送」的幂等锚点** —— SMTP 路径**完全没有 `provider_message_id`**（只有 Resend 分支写，`:1577`）。
- **判定：SMTP 通道下的重试不具备去重能力。** 属**中等风险**（重复发一封销售通知，不是重复给客户发）。

#### Outbox 与重试

- [E1] 表存在：`fenghuai-inquiries.php:292-308`（`status` / `attempts` / `next_attempt_at` / `lease_owner` / `lease_expires_at` / `provider_message_id` / `last_error`）。
- [E1] `:2217` `FH_INQUIRY_DISPATCH_MAX_ATTEMPTS = 5`。
- [E1] `:1618-1623` `fh_inquiry_backoff_at()`：**1 / 5 / 15 / 60 分钟，之后 60 分钟封顶**。
- [E1] `:2211` + `:2248-2250` — `wp_schedule_event(..., 'fh_inquiry_every_5_minutes', ...)`，**每 5 分钟一批，`FH_INQUIRY_DISPATCH_BATCH = 10`**（`:2214`）。
- [E1] `:2492-2517` — 达到上限 → `status=failed` + `next_attempt_at=NULL` + `last_error='已放弃：达到最大尝试次数 5'`。
- [E1] `:2462-2490` — `try/catch` 包住每次投递，**异常不让循环抛出**（否则 WP-Cron 会标记失败并停排）。
- [E1] `:2496-2531` — 注释承认踩过 bug：「attempts 恒为 0 → 退避永远停在第一档、上限判定永不生效 → 坏记录被无限重试」，**已修**：worker 统一以「领单前值 + 1」为准（`:2502-2531`）。这是一条**诚实的、有修复痕迹的**记录。

#### 失败后谁告警

- [E1] `:2326-2363` `fh_inquiry_run_alert_monitor()`，挂在 `FH_INQUIRY_ALERT_HOOK`（`:2359`），`:2251-2252` 每 5 分钟排程。
- [E1] 触发条件（`:2336`）：`due >= threshold` 或 `abandoned > 0`。
- [E1] `:2309-2318` 阈值默认 **1**（「避免失败记录静默堆积」）。
- [E1] **告警方式：`error_log()` + `do_action('fh_inquiry_delivery_alert', $summary)`（`:2352-2357`）+ 写 option `fh_inquiry_last_alert_summary`。**
- **⚠️ 缺口**：`do_action` 之后**仓库内没有任何监听器**（grep 无 `add_action('fh_inquiry_delivery_alert'`）。也就是说：**告警「发出去了」，但没人接。** 唯一实际可见的只有 `error_log`。
- [E1] `:2345-2347` — 相同指纹 **15 分钟内不重复写日志**（防日志洪水，好设计）。

#### 模板与可维护性

- [E1] `fenghuai-inquiries.php:1236-1401` — `fh_inquiry_render_email()`：`$section()` 闭包拼 HTML 字符串 + 平行维护 `$lines` 纯文本。**模板 = PHP 字符串拼接，硬编码在 3029 行文件的中段。**
- [E1] 好处：`multipart/alternative` 双份（html + text）齐全，中文 `base64` 编码（`:3011`）。
- [E1] 坏处：**改一句邮件文案要动 mu-plugin**，且有 6 层配置解析链 `常量 → option → 默认值`（`:1181-1194` `fh_inquiry_config()`）。
- **可维护性判定：差。** 属技术债，非阻塞。

#### 密钥处理（这个做得好）

- [E1] `:1603-1615` `fh_inquiry_sanitize_delivery_error()`：**正则抹掉 email / 电话**，遍历 `[fh_inquiry_resend_key(), fh_inquiry_smtp_pass(), fh_inquiry_service_key()]` 做 `str_replace(secret, '[secret]')`，`mb_substr(..., 0, 500)`。
- [E1] `:2961-2975` — `fh_inquiry_smtp_pass()` 注释：「**不得写进任何日志或 last_error**」。
- [E1] `:2961-2975` — SMTP debug 内容「只在显式开启时输出，且不得落库」。
- [E1] `:3018` — catch 里只取 `$e->getMessage()`，注释「不落授权码」。
- **这一块是全项目 PII 处理最规范的地方，值得肯定。**

### 已具备

1. **不存在「Next 与 WP 双发同一封」** —— Next 侧邮件路径是彻底死代码。
2. SMTP 主 / Resend 备的**排他**通道选择，不会双通道齐发。
3. 两条都没配时 **fail-closed 返回 pending**，不假装成功。
4. Outbox 有 lease + 原子抢单 + 退避（1/5/15/60）+ 上限 5 次。
5. 错误日志做了 email/phone/secret 三重脱敏（`:1603-1615`）。
6. 「COMMIT 后才发信」的排序在代码里被严格执行（`:1157` vs `:1160`）。

### 缺口

| # | 缺口 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G-M11-1 | **通道静默切换**：SMTP 配置缺任一项（`fh_inquiry_smtp_configured()` 三条件 AND，`:2953-2958`）就**无声**掉到 Resend，发件人/送达率全变，无告警 | **高** | **是** |
| G-M11-2 | **保留期在法务批准前永不清理**（默认 0），但邮件正文含完整 PII（`:1369-1384` 含 message / email / whatsapp） | **高** | **是**（合规） |
| G-M11-3 | **告警 `do_action` 零监听器** —— `fh_inquiry_delivery_alert` 发出去没人接，只剩 `error_log` | 中 | 否 |
| G-M11-4 | **SMTP 路径无 `provider_message_id`** → 重试无幂等锚点，可能重复发同一询盘 | 中 | 否 |
| G-M11-5 | 邮件模板是 PHP 字符串拼接（`:1236-1401`），改文案要动 3029 行插件 | 中 | 否 |
| G-M11-6 | **三层配置并存**（Next RESEND 死代码 / WP SMTP / WP Resend），`RESEND_API_KEY` 语义在不同容器里完全不同 | 中 | 否（但必须文档化） |
| G-M11-7 | `mailer.ts`（102 行）+ `index.ts:12` 的 `send`/`isMockMode` 导出是**死代码**，会误导下一位维护者 | 低 | 否 |

### 重复实现

- **一套实现、三个残留。** `mailer.ts` 与 WP Resend 分支（`fenghuai-inquiries.php:1543-1594`）是**同一件事（Resend HTTP）的两次实现**，一份在 TS 一份在 PHP，参数形状几乎相同（`from`/`to`/`reply_to`/`subject`/`html`/`text`）。**TS 那份已死但未删。**
- `INQUIRY_FROM` / `INQUIRY_TO`（`.env.example:51-52`）与 WP 侧 `FH_INQUIRY_MAIL_FROM` / `FH_INQUIRY_MAIL_TO`（`fenghuai-inquiries.php:1213-1221`）是**同一配置的两套变量名**，前者只服务死代码。

### 风险

1. **G-M11-1 是最危险的静默失败**：QQ SMTP 授权码过期（QQ 邮箱授权码会因改密失效）→ `fh_inquiry_smtp_pass()` 返回空 → `fh_inquiry_smtp_configured()` false → 若 WP 环境有 `RESEND_API_KEY`，邮件改从 Resend 发；若没有，邮件永远 `pending`。**两种情况下，站点上都没有任何信号。** 唯一能看见的是 wp-admin 发件箱面板（`:2730+`）和 `error_log`。
2. **`pending` 会永远 pending**：`:1476-1486` 未配置通道时把 `next_attempt_at` 写成 `$now`（不是 NULL），worker 会**每 5 分钟重试一次、5 次后转 `failed`**。之后 `abandoned > 0` 触发告警 —— 但告警没人接。**所以「SMTP 挂了」的最终表现是：询盘照存，邮件 25 分钟后彻底放弃，无人知道。**

### 建议动作

1. **[阻塞] 消除静默切换**：`fh_inquiry_dispatch_email()` 在检测到「SMTP 从 configured 变 unconfigured 且存在 Resend key」时，**必须** `error_log` + 写 `email_error` 明确标注 `fallback:resend`；wp-admin 概览页加一个「当前生效通道」只读展示。
2. **[阻塞] 法务先定保留期**，然后 `FH_INQUIRY_RETENTION_DAYS` 必须在 **WordPress 容器**配一个非 0 值，并由运维核对 `SHOW VARIABLES` 证明生效。
3. 给 `fh_inquiry_delivery_alert` 接一个真实监听器（企业微信/邮件/监控），否则这个 action 等于不存在。
4. 删 `mailer.ts` 及其 `index.ts:12` 再导出，或加 `@deprecated` + 注释说明「DEC-055 后死代码」。
5. SMTP 路径补 `provider_message_id`（可用 `PHPMailer::$MessageID`），让重试能去重。
6. 邮件模板抽出到独立文件（如 `templates/inquiry-notification.php`），用 `locate_template` 加载。

### 依赖

- **依赖 4 号 Agent**：WordPress 容器的实际 env（是否有 `RESEND_API_KEY`、`FH_INQUIRY_SMTP_*` 是否齐全）—— 本次**禁止连 WordPress**，只能从 `deploy/wordpress/.env.example` 看到 `FH_INQUIRY_SMTP_USER=` / `_PASS=` **留空**。
- **依赖 2 号 Agent（GEO/内容）**：无。

### 验收方式

- 从 wp-admin 发件箱面板确认最近一条 outbox 的 `status` / `attempts` / `last_error`（**不新建测试询盘**）。
- 或运维侧 `SELECT status, attempts, last_error, next_attempt_at FROM wp_fh_inquiry_outbox ORDER BY id DESC LIMIT 5;`
- 「生效通道」判定：临时 `error_log(fh_inquiry_smtp_configured() ? 'smtp' : 'resend')` —— **不建议直接改生产**，改为在 wp-admin 面板加只读展示。

---

## M14 安全与权限

**成熟度**: **4/5**
**状态**: **部分满足**

### 证据

#### `/api/revalidate/wordpress`（66 行）

- [E1] `src/app/api/revalidate/wordpress/route.ts:1` — `import { createHmac, timingSafeEqual } from "node:crypto"` —— **两者都在。**
- [E1] `:17-25` `validSignature()`：
  ```
  const expected = process.env.WP_REVALIDATE_SECRET?.trim();
  if (!expected || !provided) return false;          // fail-closed
  const signature = provided.startsWith("sha256=") ? provided.slice(7) : "";
  const expectedSignature = createHmac("sha256", expected).update(body).digest("hex");
  const left = Buffer.from(expectedSignature);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
  ```
  **→ 是 HMAC-SHA256，且是 `timingSafeEqual`，不是 `===`。长度先比再 `timingSafeEqual`（避免 throw 泄露长度）。这是正确写法。**
- [E1] `:29-32` — 签名验证**在 JSON.parse 之前**，对原始 `rawBody` 签名（防解析歧义攻击 `:` 正确）。
- [E1] **时间戳：❌ 没有。重放保护：❌ 没有。** body 里无 `timestamp` / `nonce`；`validSignature()` 只签 `body`。
- **重放的实际影响：有限。** 攻击者需先拿到一次合法请求体（含合法签名），重放只会让 `revalidateTag` / `revalidatePath` 再跑一次 —— **是重新验证，不是写入**。最坏效果是缓存抖动 / 触发回源。**属低危，但确实是缺口。**
- [E1] `:47-58` — `type` 严格白名单（`wheels` / `insights` / `pages`），`slug` 过 `validSitePageKey()` / `validInsightPreviewSlug()`，`locale` 过 `isLocale()`，`revision` 截 80 字符。**输入面收得很紧。**
- [E1] 发送端 `fenghuai-content-webhooks.php:46` — `'x-fh-signature' => 'sha256=' . hash_hmac('sha256', $body, $config['secret'])`。**两侧算法一致。**

#### `/api/preview`（48 行）+ `/exit`（8 行）

- [E1] `src/app/api/preview/route.ts:23` — `if (!secret || url.searchParams.get("secret") !== secret || ...)` — **用的是 `!==`，不是 `timingSafeEqual`**。⚠️ 理论上有定时侧信道，但：secret 从 URL query 来（本身已会进 access log），且比较的是短字符串 —— **实际风险低，但和 revalidate 的写法不一致，属一致性缺陷。**
- [E1] `:23` — `!secret` → 401，fail-closed 正确。
- **secret 有有效期吗？❌ 没有。** `WP_PREVIEW_SECRET` 是静态密钥，URL 里带 `?secret=xxx` 可**永久**换取 `draftMode().enable()`。
- [E1] `:37-39` / `:45-47` — `draftMode().enable()` 后 `redirect(...)`。`draftMode` 是 **Next 签名的 HttpOnly cookie**，过期由 Next 控制（默认 session），**不能直接改 URL 反复用**。
- [E1] `src/app/api/preview/exit/route.ts:4-8` — `POST` 才 disable，**没有 GET 触发 CSRF 的问题**。
- **会不会泄漏成永久后门？—— 部分会。** 只要 `WP_PREVIEW_SECRET` 不轮换，任何人拿到这个 secret（WordPress 后台 `settings` 页明文可见，`fenghuai-content-webhooks.php:121` 用 `type="password"` 但 `value` 回填了明文）就能**永久**开启 draft mode 看草稿。但 draft mode 只影响**当前浏览器会话**，不改变公开输出。**属「草稿泄露」而非「站点沦陷」。**
- [E1] `request-a-quote/page.tsx:24` — `robots: { index: !preview, follow: true }` —— **预览态正确 noindex**。但同样的思路**没有用在 `/thank-you`** 上（见下）。

#### `/api/inquiries`（215 行）

- [E1] `route.ts:57-60` — `if (!originAllowed(request)) return 403` —— **第一件事就是 Origin 检查，在任何解析之前。**
- [E1] `guard.ts:38-52` `originAllowed()`：`const origin = request.headers.get("origin"); if (!origin) return process.env.NODE_ENV !== "production";` —— **生产环境无 Origin = 拒绝。**
- [E1] `guard.ts:16-35` `configuredOrigins()`：`NEXT_PUBLIC_APP_URL` + `INQUIRY_ALLOWED_ORIGINS.split(",")`，`new URL(value).origin` 规范化，非法值 fail-closed 跳过。
- **`INQUIRY_ALLOWED_ORIGINS` 真的被检查了吗？—— 是。** 具体代码 `guard.ts:18`（读取）→ `:22-30`（解析入 Set）→ `:51`（`configuredOrigins().has(origin)`）。链路完整。
- [E1] `route.ts:69-85` `rateLimit()` —— **有限流**：IP 6/10min、邮箱 3/10min（`guard.ts:4-5`），键 sha256 摘要（`guard.ts:97-101`）。
- **鉴权：❌ 无（这是公开端点，设计如此）。** 但它不是「无防护」：Origin + 蜜罐 + 时间陷阱 + 限流 + 16KB 上限 + 双层校验 六道闸。
- [E1] `route.ts:196-215` — `GET /api/inquiries` **恒返回 404**（注释：「权威列表只存在于 wp-admin」）。**这一手很关键 —— 它把「Next 进程内投影」这个最大的潜在泄露点直接封死了。**

#### CSP

- [E1] `next.config.ts:102-118` 完整策略：
  ```
  default-src 'self'; base-uri 'self'; form-action 'self';
  frame-ancestors 'none'; object-src 'none';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: <cmsOrigin>;
  connect-src 'self' <cmsOrigin>;
  font-src 'self' data:;
  upgrade-insecure-requests (仅 https)
  ```
- [E1] `:104-107` — `'unsafe-eval'` **只在 `NODE_ENV === "development"` 追加**。生产无 `unsafe-eval`。
- [E1] `next.config.ts:123-131` — 另送 `Referrer-Policy` / `X-Content-Type-Options: nosniff` / `X-Frame-Options: DENY` / `Permissions-Policy` / HSTS（仅 https）。
- [E5] BASELINE §3.2 — `security-headers.test.mts` 4 条用例通过，覆盖「HTTP 测试地址不升级 HTTPS」「HTTPS 保留 upgrade + HSTS」「dev 允许 eval / prod 不允许」。
- **`script-src 'self' 'unsafe-inline'` 的具体风险评估：**
  - ✅ **防的是外部脚本注入**：无 `*.google-analytics.com` 之类第三方域，`default-src 'self'` 兜底。外部 CDN 被投毒打不进来。
  - ⚠️ **防不住内联脚本注入**：任何能往 HTML 里塞 `<script>...</script>` 的路径（XSS）都能执行。`'unsafe-inline'` 使 `script-src` 这层**对 XSS 近乎失效**。
  - 🔍 **但风险被三层压住了**：(1) `object-src 'none'` + `base-uri 'self'` 堵住 `<base>` 劫持与 Flash/插件路径；(2) **Next.js App Router + RSC 的转义** 使反射型 XSS 需绕过 React 的 ES3 转义；(3) 本项目**没有用户生成内容**（无评论、无论坛、无 UGC 渲染）—— 唯一的用户输入是询盘表单，而它 **POST 后 redirect，不做 HTML 回显**。
  - **判定：可接受的遗留风险，不阻塞。** 但要明确写进 FINAL_REPORT：**这不是「有 CSP」，是「有 CSP 但 XSS 防护靠 React 而非 CSP」**。
  - ⚠️ **`style-src 'unsafe-inline'` 同理**，且 Stylex 原子化 CSS 大量依赖内联 style，短期难改（属 BASELINE §4 的 `@stylexjs/stylex 0.19.1`）。
  - **改进路线**：`script-src 'self' 'nonce-xxx'`（Next 16 支持 `headers()` 里注入 nonce），这是唯一能真正关掉 `unsafe-inline` 的路径。**属中期债，本次不阻塞。**

#### 凭证

- [E1] `.env.example` **全文 62 行已扫**：19 个 `=`，**非空值只有 4 个**：`WP_MODE=mock`、`FH_INQUIRY_RETENTION_DAYS=0`、`INQUIRY_FROM=inquiry@fenghuai.com`、`INQUIRY_TO=sales@fenghuai.com`。
- [E1] `awk` 扫描 **长度 > 40 的值：0 个**。→ **`.env.example` 无任何疑似真实凭证。**
- [E1] 头部 `:3` 明写「⚠️ 这里只放**变量名**与说明，任何真实密钥都不要写进本文件」。**实际做到了。**
- [E1] `deploy/wordpress/.env.example` 与 `deploy/frontend/.env.example`（**域外，仅因凭证扫描必须看**）：所有密钥位置都是占位文本「请生成独立随机值」/「与 WordPress 端相同的独立密钥」。**无真实值。** → **移交 4 号 Agent 作正式判定**，本报告只作佐证。
- **🔴 唯一发现：`deploy/frontend/.env.example` 硬编码了生产 IP `NEXT_PUBLIC_APP_URL=http://119.91.205.130:9080`。** 这不是密钥，但**属生产信息泄露到仓库**，且是 **`http://` 明文**（面板/管理走 HTTP）。**移交 4 号 Agent。**

#### WordPress 侧

**`WP_INQUIRY_SERVICE_KEY`（询盘写入鉴权）—— 这个做得很扎实：**

- [E1] `fenghuai-inquiries.php:241-254` `fh_inquiry_service_key()`：常量优先 → `getenv` → **「没有默认值，缺失返回空串，调用方必须 fail-closed」**。
- [E1] `:509-535` `fh_inquiry_rest_permission()`：
  - `:512-518` 密钥未配 → **`503`**（不是放行）。
  - `:522` `$provided = (string) $request->get_header(FH_INQUIRY_SERVICE_KEY_HEADER);` —— **只读请求头**。
  - `:524` `if ($provided === '' || !hash_equals($expected, $provided))` → **`401`，且是 `hash_equals`（常量时间）。**
  - `:497-508` 注释：「只读请求头 —— 不接受 `?key=`（查询参数会进访问日志，也会随 Referer 外泄）」「**不是 WP 用户账号**」「根本不看当前用户」。
- [E1] `:51` `FH_INQUIRY_SERVICE_KEY_HEADER = 'X-FH-Service-Key'`。
- [E1] Next 侧发送：`client.ts:245-248` — `"X-FH-Service-Key": serviceKey`，**不拼 URL**（`:212-214` 注释「Never in the URL」）。
- **→ `WP_INQUIRY_SERVICE_KEY` 不是 WordPress 应用密码，是一条独立共享密钥。写路径不用任何 WP 用户权限。这是全项目最好的一处鉴权设计。**

**`WP_API_TOKEN`（内容读取）—— 这个宽了：**

- [E1] `.env.example:14` — 注释：「**应用密码**，形如 `"user:xxxx xxxx xxxx xxxx"`（Basic）。仅服务端使用」。
- [E1] `client.ts:18` + `:20` + `:60-61` / `:104-105` — `Authorization: Basic ${cfg.authToken}`，**用在所有 `wpFetch`（读）和 `wpWrite`（写）上**。
- [E1] `store.ts:31-35` 注释声称「Next 不再写任何 `wp_*` 表，也**不持有 DB 凭证**」—— 对 DB 是对的，但 **Next 确实持有一个 WP 用户的应用密码**。
- **权限范围：由该应用密码背后的 WP 用户角色决定，代码层面无任何约束。** 若配成 `administrator` 的密码（本地开发常态），**Next 进程被拿下 = WordPress 全站被拿下**（含 ACF、页面、插件安装）。
- **→ 这是本次审计**最值得提的凭证风险**：一个「只读内容」的用途，用了一个可能拥有全站写权限的凭证。**
- **建议（高优先级，不阻塞）**：为 `WP_API_TOKEN` 建一个只带 `read` 能力的专用 WP 用户；`fh/v1` 写入**已完全独立于它**（走 service key），所以降低它的权限不影响任何功能。

**能力矩阵（权限分级）—— 做得对：**

- [E1] `:54-57` — `edit_fh_inquiries` / `manage_fh_inquiry_delivery` 两个自定义 cap，带 `FH_INQUIRY_CAP_VERSION = '1'` 版本闸门。
- [E1] `:380-421` `fh_inquiry_install_capabilities()`：
  - `:388-396` 销售角色 `fh_inquiry_sales`：`read` + `edit_fh_inquiries` + `edit_others` + `edit_published` + `read_private` —— **只读 + 改业务字段，没有 delete，没有 delivery**。
  - `:397-405` 管理员：合并销售 caps + 全部 `delete_*` + `FH_INQUIRY_CAP_DELIVERY`。
  - `:379-380` 注释：「**普通 Contributor/Author 不再因 `edit_posts` 获得客户 PII**」—— 这是一条有意识的 PII 隔离设计。
- [E1] `:364-372` — CPT 配置：`'capability_type' => ['fh_inquiry', 'fh_inquiries']` + `'create_posts' => 'do_not_allow'`（后台无法手动新建询盘）+ `show_in_rest: false` + `public: false` + `publicly_queryable: false` + `exclude_from_search: true`。**询盘不进公开 REST，不能被按序号查询。**
- [E1] `:2052-2073` — 后台写字段：`wp_verify_nonce` + `current_user_can('edit_post', $postId)` + 枚举白名单。
- [E1] `:2703-2721` — 手动派发：`current_user_can(FH_INQUIRY_CAP_DELIVERY)` + `check_admin_referer('fh_inquiry_dispatch', ...)`。

#### Webhook 签名

- [E1] `fenghuai-inquiries.php:541-576` `fh_inquiry_email_event_permission()`：
  - `:543-549` secret 未配 → **503**。
  - `:552-555` 缺 `X-FH-Webhook-Timestamp` / `X-FH-Webhook-Signature` → 401。
  - `:557-559` **`abs(time() - (int)$timestamp) > FH_INQUIRY_WEBHOOK_MAX_AGE`** → 401。`:62` `FH_INQUIRY_WEBHOOK_MAX_AGE = 300`（**5 分钟窗口，有重放保护**）。
  - `:561-565` `hash_hmac('sha256', $timestamp . '.' . $request->get_body(), $secret)` —— **签 timestamp + body，绑定时间**。
  - `:566-571` 逐候选 `hash_equals`（支持多签名轮换，且常量时间）。
- [E1] `:62` — `FH_INQUIRY_WEBHOOK_SECRET` 解析链（`:1202-1211`）：`getenv` → 常量 → option → filter，**无默认值**。
- **→ WP 的 webhook 签名比 Next 的 revalidate 更完整（多了时间戳）。这是两个端点的不对称，值得记一笔。**

**内容 webhook（revalidate 发送端）：**

- [E1] `fenghuai-content-webhooks.php:15-22` `fh_content_revalidate_config()`：`FH_NEXT_REVALIDATE_URL` / `FH_NEXT_REVALIDATE_SECRET` 常量优先，回落到 option。
- [E1] `:25-55` `fh_content_send_revalidation()`：`:25` 未配置直接 `return false`（fail-closed）；`:26` type 白名单；`:27` `sanitize_title($slug)`；`:46` HMAC 签名；`:38` `timeout 0.5` + `blocking: false`（**不阻塞发布流程，好设计**）。
- ⚠️ [E1] `:121` — 后台设置页把 secret 以 `value="%s"` **明文回填到 HTML**（`type="password"` 只做视觉遮挡）。任何能进 `admin_init`/`writing` 设置页的用户都能读到。**属低危（需 admin 权限），但和「密钥不落日志」的严谨程度不对称。**

### 已具备

1. **revalidate 端 HMAC-SHA256 + `timingSafeEqual` + 先比长度**（`route.ts:17-25`）—— 教科书级。
2. **询盘写入鉴权用 `hash_equals` + 专用头 + 无默认值 + 未配置 503**（`fenghuai-inquiries.php:509-535`）—— 全项目最佳实践。
3. **WP 侧 webhook 有 5 分钟时间戳窗口**（`:62`, `:557-559`），有重放保护。
4. `GET /api/inquiries` 恒 404（`route.ts:196-215`），主动封死进程内投影泄露。
5. PII 按能力隔离：销售角色无 delete、无 delivery；Contributor/Author 拿不到询盘（`:379-396`）。
6. 询盘 CPT 完全私有（`show_in_rest:false` / `public:false` / `create_posts: do_not_allow`）。
7. `.env.example` **零真实凭证**（19 个变量，非空值仅 4 个且全为域名/开关）。
8. 生产 CSP **无 `unsafe-eval`**（`next.config.ts:104-107`），且有测试守着（E5）。
9. HSTS 仅在 https 时下发（`next.config.ts:129-131`），不会在 HTTP 测试环境误伤。

### 缺口

| # | 缺口 | 严重度 | 阻塞上线 |
|---|---|---|---|
| G-M14-1 | **`WP_API_TOKEN` 可能用 administrator 应用密码**（`.env.example:14` 只写「应用密码」，代码无角色约束），Next 泄露 = WP 全站沦陷 | **高** | **是**（需核实并降权） |
| G-M14-2 | **`/thank-you` 显式 `robots: index: true`**（`src/app/thank-you/page.tsx:19`）—— 询盘感谢页、含回执参数、允许被索引 | **高** | **是** |
| G-M14-3 | `/api/revalidate/wordpress` **无时间戳、无重放保护**（`route.ts:17-25` 只签 body） | 中 | 否（影响是缓存抖动，非写入） |
| G-M14-4 | `/api/preview` secret 用 `!==` 而非 `timingSafeEqual`（`preview/route.ts:23`），与 revalidate 不一致 | 低 | 否 |
| G-M14-5 | `WP_PREVIEW_SECRET` **永久有效**，且后台明文回填（`fenghuai-content-webhooks.php:121`）→ 长期草稿泄露向量 | 中 | 否 |
| G-M14-6 | `script-src 'unsafe-inline'`（`next.config.ts:106`）—— CSP 对 XSS 防护实际失效，靠 React 转义兜 | 中 | 否（但必须写进报告） |
| G-M14-7 | `clientAddress()` 信任 `x-forwarded-for` / `cf-connecting-ip`（`guard.ts:104-109`），反代不覆盖即可绕过限流 | 中 | 否 |

### 重复实现

- **两处签名验证风格不统一**：`route.ts:17-25` 用 `timingSafeEqual`，`preview/route.ts:23` 用 `!==`。同一个项目两种写法，**下一位维护者会照着错的抄**。
- **两处「密钥比对」语义不同**：`fh_inquiry_rest_permission`（`hash_equals`，安全）vs `fh_inquiry_email_event_permission`（`hash_equals` 逐候选，安全）vs `preview/route.ts`（`!==`，不安全）。三处三样。

### 风险

1. **G-M14-2 的具体危害**：`/thank-you` 带 `?id=INQ-...&receipt=...`。回执 15 分钟过期（`receipt.ts:4`），页面会显示「unverified」文案 —— 但**询盘号本身仍在 URL 里**。若被搜索引擎收录，等于把「本站确实收询盘、编号形如 INQ-YYYYMMDD-NNNN」公开，且给了攻击者一个**编号格式样本**（虽然编号不能用于查询，`get_inquiry` 类端点不存在）。
   **对照证据**：`request-a-quote/page.tsx:24` 用了 `index: !preview`，说明作者知道该怎么做 —— **`thank-you` 是漏了，不是不会。**
2. **G-M14-1 的连锁**：`client.ts:104-105` 把 `WP_API_TOKEN` 也送给 `wpWrite`。虽然 `wpWrite` 走 `fh/v1`（service key 鉴权），但请求里**同时带了 Basic Auth**。若某天 `fh/v1` 的 permission_callback 失效，Basic Auth 会成为第二道（意外）防线——**这不是设计，是巧合**。反过来说，如果 Basic Auth 用户是 administrator，任何 `wpFetch` 路径的 SSRF 都更危险。
3. **CSP 的 `img-src ... ${cmsOrigin}`**：WordPress origin 被直接拼进 CSP 字符串（`next.config.ts:114`），若 `WP_API_URL` 配错（带路径/查询），`new URL(...).origin` 会规范化，**安全**。这一处写法是对的。

### 建议动作

1. **[阻塞] 核实并降权 `WP_API_TOKEN`**：在 WordPress 建一个只带 `read` 能力的专用用户（如 `next-reader`），重发应用密码。**功能上零影响**（写入已走独立 service key）。
2. **[阻塞] `/thank-you` 改 `robots: { index: false, follow: false }`**，并在 `proxy.ts` 或 layout 层对 `/thank-you*` 兜底加 `X-Robots-Tag: noindex`。
3. revalidate 端点加时间戳：body 里带 `ts`，`validSignature()` 校验 `|now - ts| <= 300`，与 WP 侧 `FH_INQUIRY_WEBHOOK_MAX_AGE` 对齐。
4. `preview/route.ts:23` 改 `timingSafeEqual`，抽一个 `src/lib/security/compare.ts` 统一两处。
5. 后台设置页回填密钥时改为占位符（`value=""` + `placeholder="已配置"`），并给 `WP_PREVIEW_SECRET` 加轮换说明。
6. 中期：CSP 上 nonce（`script-src 'self' 'nonce-xxx'`），关掉 `'unsafe-inline'`。

### 依赖

- **依赖 4 号 Agent**：确认生产 WordPress 上 `WP_API_TOKEN` 对应哪个用户/角色；确认 nginx 是否覆盖 `X-Real-IP`；确认 `deploy/*/.env.example` 的生产 IP 是模板还是实际。
- **依赖 3 号 Agent（SEO）**：`/thank-you` 与 `/request-a-quote` 的索引策略是否应为统一规则（本报告只指出 `thank-you` 与自身逻辑冲突）。

### 验收方式

- `curl -sI https://<site>/thank-you | grep -i x-robots-tag` 应为 `noindex`；`view-source` 中 `<meta name="robots">` 应为 `noindex`。
- revalidate 重放：拿一个合法 body+签名，5 分钟后再发一次 → 当前返回 200，期望返回 401。
- `WP_API_TOKEN` 权限：用该 token `POST /wp-json/wp/v2/posts` → 期望 **401/403**（当前若是 administrator 会成功）。

---

## 跨模块交叉发现

### C-1 · 「隐私闸门已移除」与 `.env.example` 注释矛盾（**新发现，非 BASELINE 记录**）

- [E1] `.env.example:55` — 「已批准且可追溯的隐私政策版本。**留空时浏览器不显示可提交表单，API 返回 503。**」
- [E1] `src/lib/inquiry/validate.ts:19` — `export function validate(body: unknown, _expectedPrivacyVersion = "")` —— **参数带下划线前缀（ESLint 约定的「有意未使用」），函数体内从未引用。**
- [E1] `schema.ts:103-108` — `privacyVersion` 是 `.optional().default("")`。
- [E1] `route.ts` — **全文无任何 `503` 由隐私版本触发的分支**（503 只在 `:161` 内存 fallback 与 `:213` 持久化失败时出现）。
- [E1] `components/inquiry-form.tsx:297-300` — 注释原文：「Keep the version for backward-compatible payloads；**an empty version no longer disables the business enquiry form.**」
- [E4] `outputs/reports/40-consentless-inquiry-qq-smtp-2026-10-12.md:10-24` — 记录了移除三层隐私闸门的过程。
- **判定：`.env.example:55` 是过期注释。** 代码是对的（业务要能收询盘），注释错了。**但这是目前唯一还写着「有隐私闸门」的地方** —— 法务/运维若读 `.env.example` 会得到与代码相反的理解。**属文档缺陷，中危。**
- **另外**：`.env.example:56` 说「修改后需要重新构建前端」也是对的（`NEXT_PUBLIC_*` 构建期内联），但**它现在只影响回执文案，不影响可提交性**。

### C-2 · `m11` 与 `m14` 的配置来源分裂

同一个逻辑配置存在两套变量名，且**哪套生效取决于容器**：

| 关注点 | Next 侧变量 | WP 侧变量 | 实际生效 |
|---|---|---|---|
| 发件人 | `INQUIRY_FROM`（`.env.example:51`） | `FH_INQUIRY_MAIL_FROM`（`fenghuai-inquiries.php:1213`） | **WP 侧**（Next 是死代码） |
| 收件人 | `INQUIRY_TO`（`:52`） | `FH_INQUIRY_MAIL_TO`（`:1218-1221`） | **WP 侧** |
| 保留期 | `FH_INQUIRY_RETENTION_DAYS`（`:40`） | 同名（`getenv`，`:2574-2576`） | **WP 侧** |
| Resend key | `RESEND_API_KEY`（`:50`） | `RESEND_API_KEY`（`getenv`，`:1225`） | **两边都可能读** |

**→ 建议在 `.env.example` 顶部加一张「变量归属表」，否则运维一定会配错地方。**

---

## 一票否决项汇总

以下是**阻塞上线**的安全/数据完整性问题，按严重度排序：

| # | 项 | 位置 | 为什么是一票否决 |
|---|---|---|---|
| **1** | **幂等键 `char(64)` + `_ci` 排序规则导致碰撞** | `fenghuai-inquiries.php:281-288`（`idempotency_key char(64) NOT NULL` + `PRIMARY KEY`，collate 取自 `:270`） | 两个语义不同的键被判为同一询盘 → **客户看到「提交成功」，实际询盘未新增、丢失**。这是「数据丢失」，正是一票否决的定义。契约（`route.ts:38`）允许大写键，缺陷可被真实触发。 |
| **2** | **`WP_API_TOKEN` 权限未收敛，可能为 administrator 应用密码** | `.env.example:14`（只写「应用密码」）+ `client.ts:18,60-61,104-105`（用于所有读写） | Next 进程任何一处 SSRF/凭据泄露 = **WordPress 全站沦陷**（含 ACF、页面、插件）。属于「一个读内容用途换来全站写权限」。**必须先核实再放行。** |
| **3** | **`/thank-you` 显式 `robots: index: true`** | `src/app/thank-you/page.tsx:19` | 询盘感谢页（含 `INQ-` 编号与回执参数）允许被索引，与同项目 `request-a-quote/page.tsx:24` 的正确做法自相矛盾。属**确定性的信息泄露**（非概率性）。 |
| **4** | **邮件通道静默切换（SMTP → Resend）无告警** | `fenghuai-inquiries.php:1486`（`$useSmtp`）+ `:2953-2958`（三条件 AND）+ `:1543-1594`（Resend 兜底） | QQ SMTP 授权码失效是**必然会发生的事**（改密即失效）。发生时无人知情，销售漏单。属「业务中断但系统自认为健康」。 |
| **5** | **询盘 PII 保留期默认永不清理，法务未批准** | `fenghuai-inquiries.php:2572-2580` + `.env.example:40`（`=0`），邮件正文含完整 PII（`:1369-1384`） | 客户姓名/邮箱/WhatsApp/公司/自由文本**永久留存**。这是合规一票否决项，且 `04-privacy-logging-retention-audit-2026-10-09.md:41` 自己承认「批准前保持 0」。**上线 = 未定义保留期即收集 PII。** |

### 明确「不阻塞」但必须记录的风险

- `script-src 'unsafe-inline'`（`next.config.ts:106`）—— XSS 防护实际靠 React 转义，不靠 CSP。
- revalidate 无时间戳（`route.ts:17-25`）—— 影响是缓存抖动，非写入。
- 限流是进程内 Map（`guard.ts:9`）—— 重启清零，单实例可接受。
- `store.ts` 零专属测试 —— 是「验证缺口」不是「实现缺陷」，但**必须由 Agent 5 或 `verify-inquiry-backend.py` 补上 E3/E5 证据后才能认定事务正确性成立**。

### 本报告未能验证的事项（诚实声明）

| 项 | 原因 | 归属 |
|---|---|---|
| MySQL 实际表引擎是否 InnoDB | 禁止连 WordPress 数据库 | 4 号 Agent |
| `wp_fh_inquiry_key` 的实际 DDL（是否已是 VARCHAR） | 同上 | 4 号 Agent |
| WordPress 容器实际 env（`RESEND_API_KEY` / `FH_INQUIRY_SMTP_*` 是否有值） | 同上；`deploy/wordpress/.env.example:19-22` 的 USER/PASS 均为**空** | 4 号 Agent |
| `e2e/inquiry.spec.ts` 15 条真实通过率 | BASELINE 未跑 E2E | 5 号 Agent |
| 生产 nginx 是否覆盖 `X-Real-IP` | 属部署配置 | 4 号 Agent |
| 「QQ SMTP 已验收」 | **E4 自述**（`outputs/reports/40-...md:60-72` 记录了 `INQ-20261012-0013` / `email_status=accepted` / Outbox `attempts=1`），**本次未复现，未验证** | 需在正式域名下重跑 |
