# 商用成熟度差距审计 · 分批 Subagent 执行计划

> 编写日期：2026-10-17
> 审计对象：`/Users/fkycoya/Documents/Code/WordpressWheelSIte`（峰徊四产品线独立站）
> 审计基线：用户提供的《Next.js + Headless WordPress 企业级架构设计 V3.0》18 模块（M01–M18）
> 计划性质：**只读审计**。本计划不修改 `src/`、不写 WordPress、不碰生产、不重建项目。

---

## 0. 为什么这次要单独立一套审计

仓库里已经有两份重要文档：

| 已有 | 定位 | 它没做的事 |
|---|---|---|
| `outputs/reports/nextjs-headless-wordpress-commercial-blueprint-2026-10-14.md` | 32 模块**目标蓝图**（明确说「不审计现有实现」） | 不知道我们做到了哪 |
| `outputs/reports/commercial-rebuild-technology-plan-2026-10-14.md` | 32 模块**建议动作**（有范围静态核查） | 模块口径与 V3.0 的 18 模块不同；没有逐项证据与评分 |
| `STATUS.md` | 当前状态与我方自述的阻断 | 是**自述**，不是证据复核 |
| `outputs/architecture-alignment-audit.md` | 一次架构对齐审计 | 早于 10-14 之后的首页试点、四语、移动端修复 |

所以缺的不是「再来一份建议」，而是：**用 V3.0 的 18 模块口径，对我方真实代码逐项取证、评分、算差距，并指出哪些结论其实是自述而非证据。**

本次审计的产出回答三个问题：

1. **我们现在到哪了？** —— 18 模块 × 5 档状态的证据化判定。
2. **离商用还差多远？** —— 分模块成熟度分数 + 阻塞上线的硬缺口清单。
3. **先补什么、后补什么？** —— 按 P0/P1/P2/P3 排出依赖正确的补课顺序，并指出哪些「看似缺失」其实不该补。

---

## 1. 审计口径（所有 Subagent 必须统一遵守）

### 1.1 五档状态（只允许这五个值）

| 状态 | 判定标准 | 对改造的含义 |
|---|---|---|
| `已满足` | 有源码/配置/运行证据，且满足 V3.0 的最低交付要求 | 保留，禁止无意义重构 |
| `部分满足` | 能力存在，但缺安全、缺测试、缺边界或只覆盖部分页面族 | 局部补齐 |
| `未实现` | 仓库与实际运行系统均未找到 | 按优先级新建 |
| `有风险` | 功能存在，但存在数据安全/运行风险 | 优先修复，优先级高于新建 |
| `待核实` | 无权限、无配置、无运行证据 | 标记阻塞，**禁止猜测** |

### 1.2 成熟度评分（每模块 0–5 分）

| 分 | 含义 |
|---|---|
| 0 | 完全没有 |
| 1 | 有零散代码，跑不起来 |
| 2 | 能跑，但只在 mock/本地成立 |
| 3 | 预发布环境验证过，缺生产观测/测试/边界 |
| 4 | 生产可用，缺成本优化或运营流程 |
| 5 | 商用成熟（有监控、有告警、有恢复演练、有测试门禁） |

> 评分必须同时给 `evidence`。**没有 evidence 的分数一律视为 0，并在报告里标注「无证据」**。

### 1.3 证据等级（每条结论必须标注）

| 等级 | 定义 | 示例 |
|---|---|---|
| `E1 源码` | 直接读到实现代码 | `src/lib/inquiry/store.ts:120` 有事务包裹 |
| `E2 配置` | 读到配置/CI/Docker/环境变量名（不含值） | `.github/workflows/verify.yml` 有 `npm run check` |
| `E3 历史报告` | 只在 `outputs/reports/` 里被声称过 | 报告说「预发布验收通过」 |
| `E4 自述` | 只在 `STATUS.md` / `PROJECT.md` 里写着 | "已由 WordPress 事务持久化" |
| `E5 实测` | 本次审计**亲自跑过**并记录输出 | `npm test` 通过 16/16 |

**关键纪律：`E3`/`E4` 不能等同于 `E1`/`E5`。** 报告里必须区分「我们声称」和「我们验证」。这是本次审计相对历史文档的最大增量。

### 1.4 每个模块的输出契约（统一模板）

```yaml
moduleId: M01
moduleName: 项目基础架构
targetCapability: <摘抄 V3.0 的最低交付要求>
maturityScore: 0-5
status: 已满足 | 部分满足 | 未实现 | 有风险 | 待核实
evidence:
  - level: E1
    path: package.json
    note: next 16.4.0 / react 19.2.4 / TS 已配
  - level: E5
    command: npm run typecheck
    result: exit 0
gaps:
  - id: M01-G1
    desc: <缺什么，具体到可执行>
    severity: Critical | High | Medium | Low
    blocking: 是否阻塞商用上线
duplicates:
  - <同一能力存在多套实现的情况>
risks:
  - <数据安全 / 运行风险>
recommendedAction: 保留 | 局部补齐 | 重构 | 新建 | 暂缓
dependencies: [M02, M13]
acceptanceTests:
  - <可执行的验收命令或检查项>
```

### 1.5 禁止事项（对每个 Subagent 都生效）

- 禁止 `npm install`、禁止装依赖、禁止改动 `package.json`。
- 禁止写任何文件到 `src/`、`local-wp/`、`deploy/`、`.github/`。
- 禁止连接生产 WordPress、禁止发测试邮件、禁止提交询盘。
- 禁止在报告里写出任何密钥、Token、`INQUIRY_RECEIPT_SECRET` 等真实值（只写变量名）。
- 禁止把「V3.0 里有这条」当成「我们应该有这条」——必须判断对我们的业务是否真的必要。
- 禁止为了评分好看而给无 evidence 的分数。

### 1.6 允许的只读操作

```
cat / head / sed -n / grep / rg / find / ls / wc
git log / git status / git diff --stat
npx tsc --noEmit          （只读类型检查）
npm test                  （纯 node test，无网络）
npx eslint                （只读）
npm run typecheck
```
如需跑 `npm run build` / Playwright，**由总控 Agent 统一调度，Subagent 自行不要跑**（避免并发抢 `.next` 和端口）。

---

## 2. 分批执行结构

### 2.1 总体流程（四波 + 一个总控）

```
Wave 0  基线锚定（总控自己跑，不外包）
   │  产出：BASELINE.md（版本、依赖、命令实跑结果、目录事实）
   ▼
Wave 1  五路并行取证（5 个 Subagent，互不重叠文件域）
   │  A 前端+内容接缝   B 安全+数据完整性   C SEO/i18n/GEO
   │  D 部署+CI+可恢复   E 质量+性能+Agent化
   ▼
Wave 2  交叉复核（2 个 Subagent 专门挑错，不重复取证）
   │  F 对抗复核官（专挑「自述当证据」和「假通过」）
   │  G 业务对齐官（判断哪些 V3.0 要求对我们不值得做）
   ▼
Wave 3  汇总定稿（Architecture Lead 单线程）
      产出：FINAL-REPORT.md + GAP-MATRIX.md + ROADMAP.md
```

**为什么这样切：**

- **按文件域切，不按模块切。** M05 多语言和 M06 SEO 都要读 `src/app/layout.tsx`；十个 agent 抢读同一文件既浪费也容易给出互相矛盾的修改建议。按「谁拥有哪些文件」切，边界清楚。
- **取证与复核分离。** 同一个 agent 既取证又下结论，容易把自己的假设写成事实。Wave 2 的对抗复核是这次审计质量的保险丝。
- **业务对齐单独一路。** V3.0 是通用企业级模板，包含多实例缓存、Kubernetes、CRM 等对我们这个询盘站可能完全不必要的项。必须有人敢说「这条我们不需要」。

### 2.2 模块 → 责任 Subagent 映射

| Agent | 负责模块 | 文件域（主要读取范围） |
|---|---|---|
| **A · 前端与内容接缝** | M01 基础架构、M02 CMS 接入层、M03 WP 内容模型、M04 页面组件系统、M09 博客与案例、M12 媒体资源 | `package.json`、`next.config.ts`、`tsconfig.json`、`eslint.config.mjs`、`src/app/**`、`src/components/**`、`src/lib/wordpress/**`、`src/content/**`、`src/types/**`、`local-wp/wp-content/mu-plugins/**` |
| **B · 安全与数据完整性** | M10 询盘系统、M11 邮件通知、M14 安全与权限 | `src/app/api/**`、`src/lib/inquiry/**`、`src/app/request-a-quote/**`、`src/lib/wordpress/inquiry-content.ts`、`local-wp/wp-content/mu-plugins/fenghuai-inquiries.php`、`.env.example`、`next.config.ts`(headers 段) |
| **C · SEO / i18n / GEO** | M05 多语言、M06 SEO 基础设施、M07 GEO 内容结构 | `src/lib/i18n/**`、`src/app/sitemap.ts`、`src/app/robots.ts`、`src/app/llms.txt/**`、所有 `src/app/*/page.tsx` 的 `generateMetadata`、`src/app/layout.tsx`、`src/components/**` 里的 JSON-LD、`PAGE-SPECS/**` |
| **D · 部署 / CI / 可恢复** | M13 缓存与内容同步、M15 CI/CD 与部署、M16 监控与备份 | `deploy/**`、`.github/workflows/**`、`next.config.ts`(output/headers)、`src/app/api/revalidate/**`、`src/app/api/preview/**`、`local-wp/wp-content/mu-plugins/fenghuai-content-webhooks.php`、`scripts/**`、`STATUS.md` 部署段、`outputs/reports/` 中部署相关报告 |
| **E · 质量 / 性能 / Agent 化** | M08 产品系统、M17 AI Agent 接入、M18 性能与质量 | `src/app/products/**`、`src/lib/wheels/**`、`e2e/**`、`tests/**`、`playwright.config.ts`、`AGENTS.md`、`CLAUDE.md`、`.agents/**`、`SKILLS/**` |

> 边界冲突处理：若某结论只能靠跨域证据成立（例如「SEO 元数据是否被 CMS 覆盖」需要同时看 A 和 C），**由总控在 Wave 3 裁决**，Subagent 各自只写自己能证的那一半。

---

## 3. Wave 0 · 基线锚定（总控自己跑，约 20 分钟）

**目标**：在任何 Subagent 开始前，先钉死一组不可争议的客观事实，避免五个 agent 各自 `npm ls` 报出不同版本。

### 3.1 必做清单

| # | 动作 | 产出 |
|---|---|---|
| 0.1 | `node -v`、`npm -v`、`cat .nvmrc` | 运行时版本 |
| 0.2 | 从 `package.json` + `package-lock.json` 提取全部直接依赖与版本 | 依赖清单 |
| 0.3 | `git log --oneline -20`、`git status --short`、`git branch --show-current` | 版本锚点（`codex/full-site-current-20261012` + 未提交改动） |
| 0.4 | `npm run typecheck` 实跑并记录退出码 | E5 证据 |
| 0.5 | `npm run lint` 实跑并记录退出码与告警数 | E5 证据 |
| 0.6 | `npm test` 实跑并记录通过/失败数 | E5 证据 |
| 0.7 | `npm run build` 实跑（**独占，串行**），记录时长、产物大小、是否有警告 | E5 证据 |
| 0.8 | 统计：`src` 下 ts/tsx 文件数、`page.tsx` 路由数（实测 38）、带 `generateMetadata` 的页面数（实测 26）、API 路由数（实测 4）、E2E spec 数（15）、单元测试文件数（16）、MU 插件数（7） | 规模基线 |
| 0.9 | 列 `src/app` 全部路由（含 locale 前缀情况） | 路由清单 |
| 0.10 | 检查 `.env.example` 中每个变量的**用途注释**（不含值） | 配置面清单 |

### 3.2 产出文件

`outputs/audit-v3/BASELINE.md`

**这份文件是后续所有 Subagent 的唯一事实源。** Subagent 报告里的版本号、命令结果若与 BASELINE 冲突，以 BASELINE 为准并以冲突本身作为一个发现记录。

---

## 4. Wave 1 · 五路并行取证

每个 Subagent 的 prompt 必须包含：
1. V3.0 对应模块的原文段落（摘抄，不要让它去猜）
2. 上面 1.4 的输出契约模板
3. 它的文件域边界（不许越界读，越界读会让两份报告重复）
4. `BASELINE.md` 的路径

### Agent A · 前端与内容接缝（M01–M04、M09、M12）

**核心要回答：**

- **M01**：目录结构相对 V3.0 目标结构的偏差是「合理分歧」还是「技术债」？TypeScript 严格度？环境变量有无集中校验（`src/lib/site-url.ts` 之类）？`output: "standalone"` 是否与部署方式一致？
- **M02**：`src/lib/wordpress/` 有 **21 个文件** —— 这是「按内容类型分文件」还是「重复的 fetch 逻辑各写一遍」？是否有统一的 client、错误分类、超时、重试、类型守卫（Zod）？还是各 `*.ts` 自己 `fetch`？
- **M03**：`local-wp/wp-content/mu-plugins/` 有 **7 个 MU 插件**（content-webhooks、guides、inquiries、insights-authoring、pages、wheel-authoring、wheels）。这是不是 V3.0 说的「Headless Core 自研插件」？它是否提供统一的内容读取/翻译关系/结构块/变更事件/受控写入/健康检查六项？CPT 是否有稳定的 `entityId` 跨语言标识？ACF 字段组是否能复现（`acf-json` 落盘）？
- **M04**：`src/components/` 下 `home`/`sections`/`ui` 的边界。是否存在同一视觉模块的多份实现（例如 `home` 与 `sections` 各有一套卡片）？PageView/模块注册机制存在吗，还是硬编码页面？
- **M09**：Insights（博客）是否走 `post` CPT + `insights-contract.ts` 契约？分类/标签/关联内容是否可用？
- **M12**：媒体走 Next Image 还是裸 `<img>`？Alt 覆盖率？`next.config.ts` 的 `remotePatterns` 只放行 `WP_API_URL`/`WP_PUBLIC_API_URL` 与 localhost——生产多域名/CDN 会不会 404？

**额外必查：**
- `src/content/` 是「类型化 fallback」还是「第二套数据库」？与 WordPress 的权威关系是否在代码里明确（注释/类型/函数命名）？
- 是否存在 `WP_MODE=mock/live` 双轨，且 mock 分支与 live 分支行为不一致的地方？

### Agent B · 安全与数据完整性（M10、M11、M14）

**核心要回答：**

- **M10 询盘**：
  - 主记录与明细是否真的**在事务里**？读 `fenghuai-inquiries.php` + `src/lib/inquiry/store.ts` 逐行确认，不要信报告。
  - 幂等键是什么？重复提交如何拦截？`receipt.ts` 的签名算法与过期策略？
  - 状态流转有哪些状态？销售能否接手/跟进/记录结果？还是只有「收到」？
  - 多产品询价清单（cart）是否实现？失效条目的处理？
  - 删除/保留策略：`FH_INQUIRY_RETENTION_DAYS` 是否真有执行者？
- **M11 邮件**：
  - Outbox 表存在吗？重试几次？超过阈值后谁告警？
  - 重试是否幂等（避免重复群发）？
  - `src/lib/inquiry/mailer.ts` 是 Nodemailer 还是 Resend？还是两条路径并存（`.env.example` 里既有 `RESEND_API_KEY` 又有 QQ SMTP 相关）？并存就是重复实现。
  - PHP 侧 PHPMailer 与 Node 侧 mailer 有无同时存在 → 双写入风险？
- **M14 安全**：
  - API 路由鉴权：`src/app/api/revalidate/wordpress/route.ts` 是否有 HMAC + 时间戳 + 重放保护？`preview/route.ts` 的 secret 是否有过期？
  - CORS/来源校验：`INQUIRY_ALLOWED_ORIGINS` 真的被 checked 吗？
  - 限流：有无？在哪一层（Next / Nginx）？
  - CSP 现状：`next.config.ts` 的 `script-src 'self' 'unsafe-inline'` 意味着什么风险？
  - 凭证管理：`.env.example` 是否被误提交真实值？`local-wp/` 是否有明文 wp-config？
  - WordPress 侧：`WP_API_TOKEN` 权限范围？应用密码会不会过宽？

**纪律**：这一路要给「有风险」最多的模块定级。数据丢失风险和无鉴权写入是一票否决项。

### Agent C · SEO / i18n / GEO（M05、M06、M07）

**核心要回答：**

- **M05 多语言**：
  - 路由形态是 `/zh/`、`/en/` 前缀，还是无前缀默认语言？**这直接决定改 URL 会不会毁掉收录**。
  - i18n 是自研（`src/lib/i18n/`）还是 next-intl？自研的话，`messages` 字典是否覆盖全部页面，还是有大量硬编码英文？
  - 跨语言实体关系：同一产品的 zh/en/es/th 版本怎么关联？有稳定 `entityId` 吗，还是靠 slug 猜？
  - 未批准译文不索引的门槛：是否真的每个页面族都实现了，还是只有首页？
  - `hreflang` 是否成对互指？缺翻译时是否正确回落到 `x-default`？
- **M06 SEO**：
  - `generateMetadata` 是集中在 helper 还是散落每个 `page.tsx`？有多少个 `page.tsx` 自带 metadata？
  - canonical：`NEXT_PUBLIC_APP_URL` 缺失时会静默烤成什么？（MEMORY 记过这个坑）
  - `sitemap.ts` 是否真的按「已发布 + 已批准语言」过滤，还是把草稿也列了？
  - `robots.ts` 在无正式域名时是否安全关闭？预发布 `noindex` 如何保证不泄漏到生产？
  - 404/410/301：旧 URL 有没有映射表？`next.config.ts` 的 `redirects` 有没有？
  - JSON-LD：有哪几种 schema？Organization/Product/FAQ/Breadcrumb 是否齐？事实字段是否与页面正文一致（不能出现正文没有的规格）？
- **M07 GEO**：V3.0 的 8 个字段（canonicalQuestion / shortAnswer / supportingEvidence / applicability / limitations / relatedEntities / lastVerifiedAt / sourceReferences）—— 我们有几个？在 ACF 里、在 `src/content` TS 里、还是散在组件文案里？
  - `llms.txt` 的真实内容是什么（是生成物还是手写）？
  - 有没有「批量机器生成的低质量页面」的风险（例如 fitment 页海量生成）？

**额外必查**：抽取 2–3 个真实页面的**服务器返回 HTML**（`curl` 本地/预发布，不碰生产），确认首屏正文是否在 HTML 里（不是 JS 渲染后才有）。

### Agent D · 部署 / CI / 可恢复（M13、M15、M16）

**核心要回答：**

- **M13 缓存与同步**：
  - Webhook 链路：WP 保存 → webhook → `/api/revalidate/wordpress` → 失效。哪一环有重试？失败后事件丢不丢？
  - 失效粒度：是全站 `revalidatePath("/")`，还是有 tag 级（`cms:post:101:zh`）？
  - 多语言失效：改中文会不会漏掉英文列表页？
  - 预览与撤回：`preview/route.ts` + `exit/route.ts` 是否支持「预览不影响线上」？
- **M15 CI/CD 与部署**：
  - `.github/workflows/verify.yml` 只有 `npm ci` + `npm test` + `npm run check` + `audit:prod`。**没有 E2E、没有构建产物发布、没有部署步骤** → 这意味着什么？
  - `deploy/frontend` 与 `deploy/wordpress` 是 Docker Compose 模板。它们是否**真的能起**（读 Dockerfile 是否有 `output: standalone` 适配、Node 版本是否对得上 `.nvmrc`）？还是模板默认值残留（STATUS 自己说过「旧容器为模板默认值」）？
  - 回滚：有没有版本化的构建产物？部署失败怎么回退？
  - 环境隔离：dev/staging/prod 是否真的隔离？`WP_MODE=mock` 与 `live` 的切换靠什么保证？
- **M16 监控与备份**：
  - 备份：谁在跑？（cron？脚本？手工？）恢复演练做过没有？
  - 监控：有没有 uptime 探测、5xx 告警、邮件积压告警、数据库空间告警？
  - 日志：错误有没有关联 ID？是否脱敏？
  - 凭据轮换：有流程吗？

**输出要求**：M15/M16 极可能得分最低。要区分「工程还没做」和「做了但没证据」——例如 `scripts/` 里 34 个脚本里可能有备份脚本，但没人调度。

### Agent E · 质量 / 性能 / Agent 化（M08、M17、M18）

**核心要回答：**

- **M08 产品系统**：
  - 产品三级关系（Category → Series → Product → SKU/规格）是否成立？还是压在一层？
  - 同一 SKU 的参数是否存在多份副本（`src/content/*.ts` 一份 + WordPress 一份 + 组件里硬编码一份）？
  - 产品图集的 Media ID 与前端 URL 映射是否稳定？
  - 已下架产品是否仍能提交询盘？
  - 筛选/分页：是服务端还是客户端？无 JS 回退是否成立？
- **M17 AI Agent 接入**：
  - `AGENTS.md` / `CLAUDE.md` / `.agents/` / `SKILLS/`（23 个）实际定义了什么工作流？
  - 有没有「Agent 可审查、可追踪」的机制（分支策略、PR 模板、diff 审核门禁）？
  - 有没有给 Agent 的**受控内容写入接口**（V3.0 的 `/headless/v1/mutations/`）？如果没有，Agent 改内容只能靠手改数据库或后台点 —— 这是重大缺口。
  - Agent 凭据隔离：工程 Agent 和内容 Agent 是否共用一个 token？
- **M18 性能与质量**：
  - 测试实况：16 个单元测试文件、15 个 E2E spec。**E2E 是否真的全绿？**（STATUS 自己承认「全量 Playwright 仍有既有询盘环境、多语言/robots 基线失败」→ 这是自述，要验证失败清单有多大）
  - 测试覆盖的是契约还是快照？有没有断言「真功能」还是只断言「页面能打开」？
  - 可访问性：`e2e/accessibility.spec.ts` 用的是什么规则集？跑通没有？
  - Core Web Vitals：有没有真实测量？还是完全空白？
  - 构建体积、首屏 JS、图片策略（`unoptimized`？`priority`？）？

**Hard rule**：E2E 的失败清单**必须亲自跑一遍或从最近一次 `playwright-report` 里读真实结果**，不能用 STATUS 的描述当结论。

---

## 5. Wave 2 · 交叉复核（2 个 Subagent，在 Wave 1 之后串行启动）

### Agent F · 对抗复核官（专挑错）

**它的任务不是再取证，而是攻击 Wave 1 的结论。**

必查清单：

| 攻击点 | 做法 |
|---|---|
| 自述当证据 | 扫五份报告里所有 `E3`/`E4` 证据支撑的结论，逐条问「有没有 E1/E5？」没有就降级 |
| 假通过 | 检查有没有把「命令没报错」当成「功能正确」。例如 `npm test` 通过 ≠ 询盘事务正确 |
| 模块口径漂移 | 有没有把 V3.0 的 M07 GEO 偷换成「有 JSON-LD 就算 GEO」 |
| 分数虚高 | 抽 3 个高分模块（≥4），要求复核者独立复核，复核不通过就下调 |
| 重复计数 | 两个 agent 有没有把同一份代码算进两个模块，造成「看起来都做了」 |
| 边界漏判 | 有没有模块因为「不属于我文件域」而五路都没人负责 → 列出来交给总控 |
| 未验证的「已满足」 | 任何标记 `已满足` 的模块，必须有 E1 或 E5，否则一律降为 `部分满足` |

**产出**：`outputs/audit-v3/REVIEW-ADVERSARIAL.md`，格式为**逐条反驳清单**，每条给 `原结论 → 反驳理由 → 建议新结论`。

### Agent G · 业务对齐官（判断哪些不该做）

**它负责回答最容易被忽略的问题：V3.0 里哪些要求对峰徊这个站是过度设计。**

判断依据只来自一处：`PROJECT.md` 的「首期不含」清单——

> 首期不含在线支付、订单管理、客户登录、自研 CRM、AI 客服、中文公开站、在线私密图纸上传、视频制作、多产品询价清单和海量适配页面。

逐条比对：

| V3.0 要求 | 对我们的必要性 | 结论 |
|---|---|---|
| Prisma + 独立业务库（方案 B） | 询盘已由 WP 事务持久化，无 CRM 需求 | 待判（若选方案 A 则应明确「不做」并记录 ADR） |
| 多实例部署的共享缓存协调 | 单实例 → 不需要 | **不适用** |
| Redis 对象缓存 | 请求量未到 → 不必要 | **暂缓** |
| Kubernetes | 明确不需要 | **不适用** |
| 多产品询价清单 | `PROJECT.md` 说首期不含 | **降级为非阻塞** |
| 客户登录/订单 | 同上 | **不适用** |
| Agent 受控内容写入接口 | 已在用 Agent 改代码 → **这条反而必要** | **升级为 P1** |

**产出**：`outputs/audit-v3/SCOPE-DECISIONS.md` —— 「V3.0 要求 vs 我们的必要性」三列表，并给出**建议不做的 5–8 项**及理由，避免 ROADMAP 里堆一堆永远不做的任务。

---

## 6. Wave 3 · 汇总定稿（Architecture Lead 单线程）

### 6.1 合并规则

1. 以 `BASELINE.md` 为事实基准。
2. Wave 1 五份报告 + Wave 2 两份复核 → 逐模块裁决，冲突处以对抗复核结论为准（除非有 E1/E5 直接反驳复核）。
3. 每月/每模块的分数、状态只能出现一次，不许「A 说 3 分、B 说 4 分」并列。
4. 所有 `未实现` 与 `有风险` 都必须挂到 ROADMAP 的某个 Task，不许悬空。

### 6.2 三份定稿

**① `outputs/audit-v3/GAP-MATRIX.md`** —— 一页看总差距

| 模块 | 名称 | 状态 | 分 /5 | 阻塞上线 | 主要缺口（≤20 字） | 建议动作 |
|---|---|---|---|---|---|---|
| M01 | 项目基础架构 | … | … | … | … | … |
| … | | | | | | |
| **合计** | | | **X / 90** | **N 项** | | |

外加：
- **阻塞上线清单**（`blocking: true` 的全部 gap）
- **「看起来缺但其实不缺」清单**（来自 SCOPE-DECISIONS）
- **「看起来有但其实没用」清单**（有代码无调用、有脚本无调度、有测试无断言）

**② `outputs/audit-v3/ROADMAP.md`** —— 补课顺序

按 P0–P3 排，每个 Task 必含：

```yaml
id: T-01
module: M14
title: 给 revalidate API 加时间戳与重放保护
currentProblem: <现状>
targetResult: <可验收的目标>
files: [src/app/api/revalidate/wordpress/route.ts]
dependsOn: []
riskLevel: High
steps: [...]
acceptance: [<命令或检查项>]
rollback: <怎么退>
effort: S | M | L
```

排序纪律（照 V3.0 第三部分第三节）：
- **P0**：安全与上线阻塞（凭证泄露、备份缺失、数据丢失、生产构建失败、无鉴权写入）
- **P1**：架构基础缺失（CMS 数据契约、SEO、多语言、缓存更新、CI/CD、询盘完整性）
- **P2**：内容与工程能力（模块化、媒体优化、GEO、翻译工作流、测试覆盖）
- **P3**：扩展优化（Agent 高级自动化、多实例、服务拆分）

**③ `outputs/audit-v3/FINAL-REPORT.md`** —— 给负责人看的结论

必须含：
1. 一句话结论：**「当前成熟度 X/90，距离可商用发布还差 N 个 P0、M 个 P1」**
2. 18 模块雷达（文字表格即可）
3. 三张清单：**必须补 / 可以缓 / 明确不做**
4. 「自述 vs 证据」对照表 —— 列出 `STATUS.md` 里所有「已完成/已验收」但我们没有 E1/E5 证据的条目
5. 时间估算（按人力：单人 vs 双人）
6. 明确声明：本次审计**没有**修改任何代码、没有连接生产、没有发邮件

---

## 7. 执行排程

| 轮次 | 内容 | 并行度 | 预估 |
|---|---|---|---|
| 第 1 轮 | Wave 0 基线锚定 | 串行（总控） | 20–30 min |
| 第 2 轮 | Wave 1 · A + B + C + D + E | **5 路并行** | 40–60 min |
| 第 3 轮 | Wave 2 · F + G | **2 路并行** | 25–35 min |
| 第 4 轮 | Wave 3 汇总定稿 | 串行（总控） | 20–30 min |
| 合计 | | | **约 2 小时** |

> 若第 2 轮某个 agent 返回证据不足，**只重跑那一路**，不重跑全部。

---

## 8. 验收：这份审计本身怎么算合格

审计报告交出去之前，总控自查：

- [ ] 18 个模块**每个都有**状态、分数、证据、缺口、建议动作，没有空行
- [ ] 每个 `已满足` 至少有 1 条 E1 或 E5 证据
- [ ] 没有把密钥、Token、真实客户数据写进报告
- [ ] 所有「阻塞上线」的 gap 都在 ROADMAP 里有对应 Task
- [ ] ROADMAP 里没有「重构整个项目」「替换 CMS」「一次性重做 UI」这类被 V3.0 和 `PROJECT.md` 双重禁止的项
- [ ] SCOPE-DECISIONS 至少给出 5 项「建议不做」并写明依据
- [ ] 「自述 vs 证据」对照表存在，且逐条对应 `STATUS.md` 原文
- [ ] 报告中明确写出**本次没有跑到的验证项**（例如没连生产 WordPress、没跑全量 Playwright 的理由）

---

## 9. 下一步（审计之后才做，本计划不执行）

审计通过后，才进入 V3.0 的第五阶段「增量实施」。届时按 `ROADMAP.md` 逐个 Task 走：

```
读代码 → 查已有测试 → 补验证 → 最小改动 → tsc/lint → 单测 → build → 关键页 Playwright → 看 diff → 更新任务状态
```

且遵守本仓库既有铁律（来自 `PROJECT.md` / `STATUS.md`）：
- 未获明确授权不提交、不推送
- 花钱、真实发信、改 DNS、正式发布前单独授权
- 不用未核实的法律或性能承诺赶上线
