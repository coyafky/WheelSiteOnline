# 目标架构（TARGET_ARCHITECTURE）

制定日期：2026-10-17
基线来源：《Next.js + Headless WordPress 企业级架构设计 V3.0》+ [`CURRENT_ARCHITECTURE.md`](../audit/CURRENT_ARCHITECTURE.md) 的实际现状
配套：[`GAP_ANALYSIS.md`](../audit/GAP_ANALYSIS.md) ｜ [`DATA_FLOW.md`](DATA_FLOW.md) ｜ [`DEPLOYMENT.md`](DEPLOYMENT.md) ｜ [`CONTENT_SCHEMA.md`](CONTENT_SCHEMA.md) ｜ [`I18N.md`](I18N.md) ｜ [`SEO_GEO.md`](SEO_GEO.md) ｜ [`SECURITY.md`](SECURITY.md)

> **本文是"目标"，不是"现状"。**
> 物理定位一律以现有仓库为准：V3.0 的 `apps/web/src/lib/cms` 对应本仓库的 `src/lib/wordpress/`；
> `packages/content-schema` 对应 `src/content/` + `local-wp/mu-plugins/` 的契约层。**不为命名整齐搬迁代码。**

---

## 1. 架构原则（本项目版）

| V3.0 原则 | 本项目落地口径 |
|---|---|
| 内容与表现分离 | WordPress 管内容与批准状态；Next 管渲染与 SEO。已成立，保持 |
| 免费优先 | 已满足：无付费插件、无付费 CMS、无云服务依赖（Resend 仅为兜底）。**不引入 next-intl/Polylang Pro**，除非有明确收益证据 |
| 单一事实源 | ⚠️ 当前最大缺口。目标是每个字段有唯一所有者（见 §5 契约登记表） |
| 模块化单体 | 保持单仓单服务。**不拆微服务，不引入 Prisma**（询盘已在 WP 事务内，迁出会制造双写） |
| 可观测 | ⚠️ 当前空白。目标：错误追踪 + uptime + 备份脚本 + 告警接线 |
| 可恢复 | ⚠️ 当前空白。目标：异地备份 + 恢复演练 + 可追溯镜像 tag |
| 可扩展 | 模块注册表化、schema 版本化覆盖全内容域 |
| Agent 安全 | 契约硬化（hook 强制）+ 内容审计日志 + 默认拒绝 |
| SEO 优先 | fail-closed 已成立；补 canonical 单点 + 结构化数据覆盖 |
| 渐进改造 | 保留 18 个模块中 10 个"部分满足"里已正确的骨架，只补接线 |

---

## 2. 目标部署形态

**保持"模块化单体"，一台云服务器 + Docker Compose，不引入 K8s / Redis / ES / 队列服务。**

```
公网
 │
 ├── HTTPS 443 ──► Nginx（TLS 终结 + 安全头 + 限流）
 │                   │
 │                   ▼ 127.0.0.1:9081
 │              Next.js standalone 容器
 │                   │
 │                   ├─ 只读 GET ──► WordPress 容器 127.0.0.1:7081
 │                   │                  │
 │                   └─ 写 POST ───────┤
 │                                      ▼
 │                                MySQL 8.0（命名卷）
 │
 └── 后台 7080 ──► **必须 HTTPS**（当前仅 HTTP，是 M14 的高风险项）
```

**变化点（相对现状）**：
1. 前端与 WP 后台全部走 HTTPS（当前全 HTTP）
2. 前端镜像 tag 改为 git SHA
3. Nginx 增加限流区（`limit_req`）作为进程内限流的兜底
4. 增加 uptime 探活 + 备份 cron

**明确不做**：V3.0 提到的 Docker Compose 多容器只是现状确认；不引入 Kubernetes、Kafka、RabbitMQ、Elasticsearch。

---

## 3. 18 模块目标与责任归属

| 模块 | 目标能力（本项目口径） | 责任人面 |
|---|---|---|
| M01 项目基础架构 | 单仓 + env schema 启动期校验 + 脚本索引；样式体系统一到 Tailwind + Astryx | Frontend |
| M02 CMS 接入层 | 读路径统一错误模型（区分 hang/空/契约坏）+ Zod 边界 + 重试 | CMS |
| M03 内容模型 | 字段唯一所有者登记表 + PHP⇄TS 契约自动比对 + schemaVersion 覆盖全域 | CMS |
| M04 页面组件系统 | 模块注册表（非 switch）+ 未知类型降级 + 非首页页面补版本 | Frontend |
| M05 多语言 | 修 `localizedAlternates` 默认值 + 跨语言 entityId + 逐页面族审批闭环 | i18n |
| M06 SEO | canonical 单点 + Organization/WebSite/Breadcrumb + sitemap 清单单源 | SEO |
| M07 GEO | `lastVerifiedAt` / `sourceReferences` / `shortAnswer` 三字段 + FAQ 收敛 + llms.txt 事实层 | SEO |
| M08 产品系统 | 统一产品分类（一套）+ 图集链路接通 + 死链清除 | Business |
| M09 博客 | 分类上 taxonomy + 分页 + 100 上限解除 | CMS |
| M10 询盘 | WP 侧限流 + 同意采集 + 分派持久化 | Business |
| M11 邮件 | 告警接到真实通道 + 死信重放入口 + SMTP Message-ID 去重 | Business |
| M12 媒体 | AVIF + 生产剥离 localhost remotePatterns + 媒体一致性校验 | Frontend |
| M13 缓存同步 | 失效失败重投 + 结果对账 + 细粒度标签 | CMS |
| M14 安全 | 预览密钥改 header + 信任链收紧 + TLS + CSP 收紧 | Security |
| M15 CI/CD | E2E 进 CI + CD 到预发布 + 镜像 tag 可追溯 + 部署校验脚本 | DevOps |
| M16 监控备份 | 备份脚本 + 恢复演练 + uptime + 告警接收人 | DevOps |
| M17 Agent | pre-commit 强制 + 内容审计日志 + 任务卡 schema | Architecture |
| M18 质量 | CWV 采集 + 性能预算 + a11y 扩展到动态态 | QA |

---

## 4. 内容与表现的分界（保持并加强）

```
┌──────────────────────────────────────────────┐
│ WordPress（内容 + 批准状态的唯一权威）          │
│  · 正文、图片、SEO 元数据                       │
│  · fh_publication_status（批准）                │
│  · fh_locale_status_json（逐语言状态）          │
│  · fh_page_schema_version（版本）               │
└───────────────┬──────────────────────────────┘
                │ 只读 REST（/wp/v2 + /fh/v1）
┌───────────────▼──────────────────────────────┐
│ src/content/（类型化内容缝 + 类型守卫）          │
│  · 业务类型定义（不含 WP 原始响应形状）          │
│  · 构建期事实层（wheel-catalogue）              │
└───────────────┬──────────────────────────────┘
                │ 纯业务类型
┌───────────────▼──────────────────────────────┐
│ src/components/（展示）                        │
│  · 零 CMS import                              │
│  · 只消费业务类型                               │
└──────────────────────────────────────────────┘
```

**铁律**：展示组件不得 import `@/lib/wordpress/*`。当前合规（首页 5 组件已做到），目标是把这条从"约定"变成"lint 规则"。

---

## 5. 单一事实源登记（目标）

每个字段在目标态下**只有一个写入方**：

| 事实 | 唯一写入方 | 只读者 | 当前状态 |
|---|---|---|---|
| 页面正文/SEO | WordPress Page meta | Next | ✅ 已成立 |
| 页面批准状态 | WordPress `fh_publication_status` | Next | ✅ 已成立 |
| 逐语言批准 | WordPress `fh_locale_status_json` | Next | ✅ 已成立 |
| 轮毂型号规格 | `wheel-catalogue.ts`（构建期生成） | 页面/询盘 | ✅ 已成立 |
| 轮毂人工批准 | WordPress → `wheel-publication.json` | 页面 | ✅ 已成立（快照） |
| 产品线卡片图/链接 | **待定**（当前 3 处） | 页面 | ⚠️ 三份手抄 |
| 语言前缀映射 | `src/lib/i18n/types.ts` | proxy/切换器/sitemap | ✅ 单点 |
| 发布资格 | `publication.ts:getPublicLocalesForPath` | 4 处消费 | ⚠️ 消费端有绕过（hreflang 默认值） |
| 询盘 | WordPress 事务 | 无外部读 | ✅ 已成立 |
| 缓存标签 | 各 contract 常量 | webhook route | ⚠️ 未集中 |
| 站点域名 | `NEXT_PUBLIC_APP_URL` | canonical/sitemap/robots | ✅ 单点但无启动告警 |

**目标**：把 ⚠️ 三项收敛，并新增 `docs/architecture/CONTENT_SCHEMA.md` 的字段所有者表作为唯一登记处。

---

## 6. 技术选型裁决（保留 / 新增 / 暂缓）

| 项 | 裁决 | 理由 |
|---|---|---|
| Next.js App Router + TS | **保留** | 已用 16.4，无需变动 |
| 自研 i18n | **保留**（不用 next-intl） | 现有方案与 Next 16 Proxy 协作正确；改造成本 > 收益。补 `localizedAlternates` 缺陷即可 |
| 无 Polylang | **保留** | 靠 WP 独立 Page + 翻译字段已能表达；装 Polylang Free 会与现有 `fh_translation_group` 产生第二套语言关系 → **制造双事实源** |
| ACF Free | **保留（最小化）** | 只有 1 个字段组；其余用 `register_post_meta` 更可控 |
| WordPress MySQL 同库 | **保留** | 询盘在事务内，迁出必制造双写 |
| Prisma | **暂缓** | 无独立业务库需求；引入即第二事实源 |
| Zod | **新增（限 CMS 边界）** | 已用于询盘；扩展到 CMS 响应校验，是 M02 的核心修补 |
| Redis | **暂缓** | 单实例；限流改 DB/文件即可。多实例时再议 |
| 对象存储 | **暂缓** | 先量化收益；当前 2926 个 WebP 进仓库尚可接受 |
| Sentry / Uptime Kuma | **新增（Uptime Kuma 优先）** | 免费自托管；Sentry 按需 |
| Lighthouse CI / web-vitals | **新增** | M18 的核心缺口 |
| shadcn/ui | **清理** | 当前 `ui/button.tsx` 零引用；要么接线要么删 |
| Stylex | **删除** | 死依赖 |

---

## 7. 架构决策记录（本方案新增）

| ADR | 决策 | 状态 |
|---|---|---|
| ADR-001 | 保留自研 i18n，不迁 next-intl | 待确认（本文提出） |
| ADR-002 | 不引入 Polylang，沿用 WP 独立 Page + 翻译字段 | 待确认 |
| ADR-003 | 询盘保持 WP 单一写入方，不迁 Prisma | 待确认 |
| ADR-004 | 模块系统改注册表模式（替换 switch） | 待确认 |
| ADR-005 | 默认拒绝原则：`needsVerification` / 翻译 / 索引三项默认改为 false 语义 | 待确认 |

> 现有 ADR 在 `docs/adr/`（3 份）。新增 ADR 沿用该目录的命名约定 `YYYY-MM-DD-<slug>.md`。

---

## 8. 与 V3.0 的偏离说明（诚实记录）

| V3.0 建议 | 本项目偏离 | 理由 |
|---|---|---|
| 用 next-intl | 不用 | 现有自研方案已在生产路径跑通，且与 Next 16 Proxy 集成正确；迁移会引入 `messages/{locale}.json` 与现有 `dictionaries/*.ts` 的双轨期 |
| 用 Polylang Free | 不用 | 与现有 `fh_translation_group` / 独立 Page 模型冲突，会制造第二套语言关系 |
| `apps/web` + `packages/` monorepo | 不用 | 单服务单仓，无跨包共享需要；为命名整齐搬迁代码违反"渐进改造"原则 |
| Prisma ORM | 暂缓 | 询盘已在 WP 事务内，迁移会制造双写与一致性难题 |
| 目录 `src/lib/cms`、`src/features` | 保留现有 `src/lib/wordpress`、`src/content`、`src/components` | V3.0 自己写明"如果现有项目已经合理地采用 `src/services/wordpress`，就没有必要仅为了命名而迁到 `src/lib/cms`" |

**结论**：V3.0 的技术清单是"候选集"不是"必装清单"。本方案按现有代码基础裁决，只吸收其中真正缺失的能力（可观测、可恢复、契约硬化、GEO 字段、质量门禁）。

---

## 9. 目标态验收全景

一个改造完成的目标态应能通过以下检查（具体分解见 `../implementation/TEST_PLAN.md`）：

```bash
# 静态与契约
npm run check                          # theme + test + lint + typecheck + build 全绿
grep -rn "from \"@/lib/wordpress" src/components/ | wc -l   # 必须 0
php scripts/verify-page-v2-contract.php
python3 scripts/sync-mu-plugins.py --check
node scripts/verify-contract-parity.mjs # 新增：PHP⇄TS 常量比对

# 边界
grep -rn "zod" src/lib/wordpress/ | wc -l                   # 目标 ≥1
git ls-files | grep -iE "\.env($|\.)" | grep -v example     # 必须空

# SEO/GEO
curl -s /sitemap.xml        # 与 e2e 断言一致
curl -s /dealers | grep -c FAQPage                          # 目标 ≥1
curl -s /llms.txt | grep -cE "Founded|MOQ|ISO"              # 目标 ≥3

# 可观测与可恢复
ls scripts/ | grep -iE "backup|restore"                     # 目标 ≥1
grep -rn "fh_inquiry_delivery_alert" .                      # 必须有监听器

# 质量
npx playwright test                                          # 在 CI 中执行
```

---

## 10. 演进路线

分阶段任务与验收见 [`../implementation/ROADMAP.md`](../implementation/ROADMAP.md) 与 [`../implementation/TASKS.md`](../implementation/TASKS.md)。

| 阶段 | 目标 | 关键产出 |
|---|---|---|
| P0 | 止血：消除已影响线上内容正确性的缺陷 | hreflang 单点修复、sitemap 矛盾裁决、PLACEHOLDER FAQ 下线、预览密钥不进日志 |
| P1 | 地基：契约、SEO、多语言、缓存、可观测 | Zod 边界、契约比对脚本、canonical 单点、失效重投、备份+恢复演练 |
| P2 | 能力：GEO、模块化、媒体、CI/CD | GEO 三字段、模块注册表、AVIF、E2E 进 CI + CD |
| P3 | 治理：Agent 硬化、性能、长期约束 | pre-commit、审计日志、CWV 采集、性能预算 |
