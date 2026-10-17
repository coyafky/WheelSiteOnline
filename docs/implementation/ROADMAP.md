# 改造路线（ROADMAP）

制定日期：2026-10-17
配套：[`../audit/GAP_ANALYSIS.md`](../audit/GAP_ANALYSIS.md) ｜ [`TASKS.md`](TASKS.md) ｜ [`TEST_PLAN.md`](TEST_PLAN.md)

---

## 排序原则

**不按模块编号机械推进**，按以下优先级：

1. **P0 — 止血**：已在影响线上内容正确性 / 已有合规风险的缺陷
2. **P1 — 地基**：契约、SEO、多语言、缓存、可观测。这些不做，后面每加一个功能就多一处碎片
3. **P2 — 能力**：GEO、模块化、媒体、CI/CD
4. **P3 — 治理**：Agent 硬化、性能、长期约束

每阶段内部按**依赖关系**排：先能测量的，再能验证的，最后是能自动化的。

---

## P0 · 止血（目标：1 周内）

| Task | 内容 | 模块 | 为什么是 P0 |
|---|---|---|---|
| T-01 | 裁决 sitemap 与 e2e 矛盾（`/thank-you`、`/gallery/finishes`） | M06 | 代码与测试硬矛盾，上线那天直接决定收录 |
| T-02 | 修复 `localizedAlternates` 默认值导致 hreflang 脱钩 | M05 | 已存在的逻辑错误，一开放译文立即产生错误 hreflang |
| T-03 | 处理已上线的 PLACEHOLDER FAQ（涉及 MOQ/交期/质保） | M07 | 未核验的商业承诺已在发布，AI 会当事实引用 |
| T-04 | 预览密钥移出 URL query + 改 `timingSafeEqual` | M14 | 密钥已在 nginx 日志里 |
| T-05 | `needsVerification` 默认值改为 true | M07 | 默认放行 = 未核验数字静默发布 |
| T-06 | 14 处硬编码 `robots: index: true` 改为走发布资格 | M06 | 绕过 preview 判断 |
| T-07 | `products.ts` 三个死链 href 修正或删数据 | M08 | 用户可见的 404 |
| T-08 | 生产 remotePatterns 剥离 localhost | M12 | SSRF 面（需先确认生产 `WP_API_URL`） |

**P0 完成判据**：`TEST_PLAN.md` 的「P0 验收」全部通过。

---

## P1 · 地基（目标：2–3 周）

| Task | 内容 | 模块 | 依赖 |
|---|---|---|---|
| T-10 | CMS 边界加 Zod 校验，统一读路径错误模型 | M02 | — |
| T-11 | `scripts/verify-contract-parity.mjs`：PHP⇄TS 常量自动比对 | M03 | — |
| T-12 | canonical 单点化（`buildMetadata()`） | M06 | T-02 |
| T-13 | 缓存失效失败重投 + 结果对账 | M13 | — |
| T-14 | 备份脚本 + 首次恢复演练 | M16 | — |
| T-15 | 告警接线（`fh_inquiry_delivery_alert` 接真实通道） | M11 | T-14 |
| T-16 | Uptime 探活 + 应用级健康检查 `/healthz` | M16 | — |
| T-17 | `.env` 启动期校验（fail-fast） | M01 | — |
| T-18 | 跨语言 `entityId`（提升 `fh_translation_group`） | M05 | T-02 |
| T-19 | 修 legacy/native 双开关死内容风险 | M09 | — |
| T-20 | 缓存标签集中登记 `cache-tags.ts` | M13 | — |

**P1 完成判据**：`TEST_PLAN.md` 的「P1 验收」通过 + 一次完整恢复演练有记录。

---

## P2 · 能力（目标：3–4 周）

| Task | 内容 | 模块 | 依赖 |
|---|---|---|---|
| T-25 | GEO 三字段（`lastVerifiedAt` / `sourceReferences` / `shortAnswer`） | M07 | T-03 |
| T-26 | FAQ 收敛到 `FaqAccordion` + `FAQPage` JSON-LD | M07 | T-03 |
| T-27 | 新增 `Organization` / `WebSite` / `BreadcrumbList` JSON-LD | M06 | T-12 |
| T-28 | llms.txt 事实层 | M07 | T-25 |
| T-29 | 模块注册表替换 switch（未知类型降级） | M04 | — |
| T-30 | 非首页页面补 schemaVersion + 严格守卫 | M04 | T-10 |
| T-31 | 图集（多图）链路接通 | M08 | — |
| T-32 | AVIF + `minimumCacheTTL` | M12 | — |
| T-33 | E2E 进 CI | M15/M18 | — |
| T-34 | CD 到预发布 + 镜像 tag 改 git SHA | M15 | T-33 |
| T-35 | Insight 分类上 taxonomy + 分页 | M09 | T-19 |
| T-36 | 询盘同意采集 + WP 侧限流 | M10 | — |
| T-37 | 产品分类统一（删 `products.ts` 死数据） | M08 | T-07 |
| T-38 | 孤儿组件与死代码清理 | M01/M04 | — |

---

## P3 · 治理（目标：持续）

| Task | 内容 | 模块 |
|---|---|---|
| T-40 | pre-commit hook（commit 授权检查、密钥扫描） | M17 |
| T-41 | 内容变更审计日志（Agent 独立账号 + 操作记录） | M17 |
| T-42 | 任务卡改 frontmatter + `verify-work-tasks.mjs` | M17 |
| T-43 | CWV 采集（web-vitals 或 Lighthouse CI） | M18 |
| T-44 | 性能预算（bundle / 图片 / JS 上限） | M18 |
| T-45 | a11y 扩展到动态筛选状态 | M18 |
| T-46 | nonce-based CSP | M14 |
| T-47 | 对象存储评估（先量化收益） | M12 |
| T-48 | 删除 Stylex 依赖、清理 shadcn 或接线 | M01 |

---

## 里程碑

| 里程碑 | 判据 | 预计 |
|---|---|---|
| M-A 止血完成 | P0 全绿 + 无已知线上内容错误 | 1 周 |
| M-B 可观测可恢复 | 有备份、有恢复演练、有告警、有 uptime | 3 周 |
| M-C 契约硬化 | Zod 边界 + 契约比对进 CI + canonical 单点 | 4 周 |
| M-D 可发布 | 全量验收（`TEST_PLAN.md` 全绿）+ HTTPS + CD | 7 周 |
| M-E 长期治理 | pre-commit + 审计日志 + CWV 门禁 | 持续 |

---

## 明确不做（避免范围蔓延）

| 项 | 理由 |
|---|---|
| 迁 next-intl | 自研方案已跑通，迁移双轨期风险大于收益（ADR-001） |
| 装 Polylang | 与现有 `fh_translation_group` 冲突，制造第二套语言关系（ADR-002） |
| 询盘迁 Prisma / 独立库 | 已在 WP 事务内，迁移制造双写（ADR-003） |
| monorepo 拆分 | 单服务单仓，无跨包共享需要 |
| Kubernetes / ES / Kafka / RabbitMQ | 无规模需求，V3.0 明确"不建议一开始安装" |
| 全站对象存储迁移 | 先量化收益（T-47） |
| 一次性大重构 | 违反「渐进改造」原则，每步必须可验证可回滚 |

---

## 风险与阻塞

| 风险 | 影响 | 缓解 |
|---|---|---|
| 工作区 20+ 文件未提交 | 审计基线与 HEAD 不一致，改代码易冲突 | P0 开始前先落一次基线 commit |
| WP 端口是否对公网暴露未核实 | 决定 M10 风险等级 | 先核实再定 P0/P1 |
| 生产 `WP_API_URL` 是否 localhost 未核实 | 决定 M12 是否 P0 | 先核实 |
| sitemap 业务意图需人工裁决 | T-01 无法自动完成 | 需要负责人确认 `/thank-you`、`/gallery/finishes` 是否该收录 |
| FAQ 真实业务口径需人工确认 | T-03 无法自动完成 | 需要负责人给 MOQ/交期/质保的真实答案，或同意下线 |
