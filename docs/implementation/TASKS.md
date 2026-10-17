# 任务清单（TASKS）

制定日期：2026-10-17
配套：[`ROADMAP.md`](ROADMAP.md) ｜ [`TEST_PLAN.md`](TEST_PLAN.md) ｜ [`../audit/GAP_ANALYSIS.md`](../audit/GAP_ANALYSIS.md)

> 每个 Task 含：所属模块 / 现有问题 / 目标结果 / 修改范围 / 依赖 / 风险 / 步骤 / 验收 / 回滚。
> 状态：`待办` / `进行中` / `阻塞` / `完成`。

---

## P0 · 止血

### T-01 裁决 sitemap 与 e2e 矛盾

- **模块**：M06
- **现有问题**：`sitemap.ts:37` 含 `/thank-you`、`:40` 含 `/gallery/finishes`；`e2e/site-contract.spec.ts:29-30` 断言 `not.toContain`。必有一方错。
- **目标结果**：代码与测试同向；`/thank-you` 不在 sitemap；`/gallery/finishes` 按业务意图定
- **修改范围**：`src/app/sitemap.ts` 或 `e2e/site-contract.spec.ts`
- **依赖**：需负责人裁决 `/gallery/finishes` 是否应索引
- **风险**：Low（改错只影响收录清单）
- **步骤**：
  1. 跑 `npm run build`，读 `.next/server/app/sitemap.xml` 实际 body，确认当前真实输出
  2. 与负责人确认两个路径的业务意图
  3. 改 sitemap 或改 e2e，使二者一致
  4. 补一条 e2e：sitemap 内容与页面 `robots` meta 一致
- **验收**：`curl -s /sitemap.xml | grep -c "/thank-you"` 与 e2e 断言同向
- **回滚**：单文件改动，git revert

---

### T-02 修复 `localizedAlternates` 默认值

- **模块**：M05
- **现有问题**：`types.ts:80-93` 第三参默认 `INDEXABLE_LOCALES = ["en"]`；20 处调用中 19 处不传 → hreflang 被默认值清空
- **目标结果**：`readyLocales` 成为必填参数；所有调用点显式传 `getPublicLocalesForPath()` 结果
- **修改范围**：`src/lib/i18n/types.ts`、20 处 `generateMetadata`
- **依赖**：无
- **风险**：Medium（改签名会引发大量 TS 报错，这是好事——正好暴露全部调用点）
- **步骤**：
  1. 删掉 `readyLocales` 默认值（TS 编译立即暴露 20 处）
  2. 每处改为 `await getPublicLocalesForPath(href)`
  3. 加单测：对任意 path，`alternates` 语言集合 == `getPublicLocalesForPath` 返回值
  4. 加 E2E：抓 sitemap 全 URL，断言页面 hreflang 集合 == sitemap 同路径语言集合
- **验收**：
  - `grep -rn "localizedAlternates(" src/app | grep -v -c "getPublicLocalesForPath"` → 0
  - `node scripts/verify-hreflang-parity.mjs` 通过
- **回滚**：git revert

---

### T-03 处理已上线的 PLACEHOLDER FAQ

- **模块**：M07
- **现有问题**：`src/content/faq.ts:3-8` 是 PLACEHOLDER（注释：「answers must be confirmed… lead time, MOQ, warranty length and shipping incoterms are commitments」），但已渲染在 `/dealers` 与 `/products`
- **目标结果**：要么换成已确认的真实回答，要么从两个页面移除
- **修改范围**：`src/content/faq.ts`、`src/app/dealers/page.tsx`、`src/app/products/page.tsx`
- **依赖**：**需负责人提供真实业务口径**（MOQ / 交期 / 质保 / 贸易术语）
- **风险**：Medium（改错影响转化，但当前是合规风险）
- **步骤**：
  1. 列出 6 条 FAQ 当前文本，交负责人逐条确认或标注「不能承诺」
  2. 已确认的写真实答案；不能承诺的改为「以书面报价为准」而不是删光
  3. 移除 PLACEHOLDER 注释
  4. 加单测：`grep PLACEHOLDER src/content/faq.ts` 为 0
- **验收**：`grep -c PLACEHOLDER src/content/faq.ts` = 0，且页面渲染的 FAQ 答案都经负责人签字
- **回滚**：git revert

---

### T-04 预览密钥移出 URL + 常量时间比较

- **模块**：M14
- **现有问题**：`src/app/api/preview/route.ts:22` 用 URL query 传 secret，且用 `!==` 比较
- **目标结果**：密钥不进 URL 与日志；比较用 `timingSafeEqual`
- **修改范围**：`src/app/api/preview/route.ts`、`deploy/frontend/nginx-9080.conf`（日志脱敏）
- **依赖**：无
- **风险**：Medium（改认证方式，需确认预览链路不中断）
- **步骤**：
  1. 改为短时效 token（HMAC(secret, timestamp + path)），一次性有效
  2. 用 `timingSafeEqual` 比较
  3. nginx 加日志脱敏规则（`secret=`/`token=` 打码）
  4. 更新 e2e 预览用例
- **验收**：`grep -c "secret=" /var/log/nginx/*access.log` = 0；预览进出仍可用
- **回滚**：恢复旧 route.ts（保留旧 secret 环境变量一段时间）

---

### T-05 `needsVerification` 默认改为 true

- **模块**：M07
- **现有问题**：`fenghuai-insights-authoring.php:100` `'default_value' => 0`
- **目标结果**：新建内容默认带「需工程确认」标记；编辑显式勾掉才算核验
- **修改范围**：该 mu-plugin + `src/content/types.ts` 默认值
- **依赖**：无
- **风险**：Low（会让更多页面显示警告条，这是预期）
- **步骤**：改默认值 → 迁移已有内容（已核验的可回填为 false）→ 加单测
- **验收**：新建一篇 Insight 默认渲染警告条；已有已核验内容不受影响
- **回滚**：改回默认值

---

### T-06 14 处硬编码 `robots: index: true` 改为走发布资格

- **模块**：M06
- **现有问题**：实测 **14 处** `robots: { index: true, follow: true }` 硬编码，全部绕过 `preview` 判断：
  `insights/bolt-patterns/[pattern]/page.tsx:41`、`insights/bolt-patterns/page.tsx:22`、`products/wheels/[model]/page.tsx:77`、`products/ev-components/page.tsx:41`、`thank-you/page.tsx:19`、`gallery/finishes/page.tsx:28`、`fitment/[platform]/page.tsx:42`、`fitment/page.tsx:17`、`support/terms|shipping|returns|warranty/page.tsx:14`、`dealers/private-label/page.tsx:25`、`dealers/page.tsx:21`
- **目标结果**：由 `publication.ts` 统一决定；`thank-you` 这类转化页应固定 `noindex`
- **修改范围**：14 个页面文件
- **依赖**：T-02
- **风险**：Low
- **验收**：preview 模式下这两页输出 `noindex`
- **回滚**：git revert

---

### T-07 修 `products.ts` 死链

- **模块**：M08
- **现有问题**：`src/content/products.ts:33/49/65` 的 href 指向 `/products/monoblock`、`/products/two-piece`、`/products/off-road`，三个路由不存在
- **目标结果**：要么建路由，要么改 href 到现有页面，要么删掉 `productFamilies` 死数据
- **修改范围**：`src/content/products.ts`、可能的 `src/app/products/` 新路由
- **依赖**：T-37（分类统一）可合并处理
- **风险**：Low
- **验收**：`grep -rn "productFamilies" src` 只剩有意保留的引用；无 404 链接
- **回滚**：git revert

---

### T-08 生产 remotePatterns 剥离 localhost

- **模块**：M12
- **现有问题**：`next.config.ts:4-18` 写死 `localhost:8081`，配合 `dangerouslyAllowLocalIP`
- **目标结果**：生产构建产物不含 8081
- **修改范围**：`next.config.ts`
- **依赖**：先核实生产 `WP_API_URL` 是否非 localhost
- **风险**：Medium（配错会导致图片全部 404）
- **步骤**：按 `WP_API_URL` 主机名条件化；本地开发仍保留；加构建后断言
- **验收**：`grep -o "8081" .next/server/**/*.js | wc -l` = 0
- **回滚**：git revert

---

## P1 · 地基

### T-10 CMS 边界加 Zod 校验 + 统一读错误模型

- **模块**：M02
- **现有问题**：`client.ts` 读路径只返回 `null`，无重试，无 schema 边界
- **目标结果**：`wpReadResult<T>()` 返回判别联合 `{ ok: true, data } | { ok: false, reason }`；每域加 Zod schema
- **修改范围**：`src/lib/wordpress/client.ts` + 各 adapter
- **风险**：High（触及所有内容读取路径）
- **步骤**：先在 1 个域试点（about）→ 加回归测试 → 逐步铺开
- **验收**：畸形响应 → 返回 `{ ok: false, reason: "contract" }` 而非崩溃；断网 → `reason: "network"` 且 8s 内返回
- **回滚**：保留旧 `wpRead` 直到全部迁移完

### T-11 PHP⇄TS 契约自动比对

- **模块**：M03
- **现有问题**：`FH_HOME_MODULES` / `FH_HOME_PRODUCT_LINE_FACTS` 与 TS 侧手抄
- **目标结果**：`scripts/verify-contract-parity.mjs` 在 CI 中断言一致
- **验收**：故意改一侧常量 → CI 失败

### T-12 canonical 单点化

- **模块**：M06
- **现有问题**：layout 一次 + 20 处页面级覆盖；`/about`、`/insights` 无 canonical
- **目标结果**：`src/lib/seo/metadata.ts` 的 `buildMetadata()` 唯一入口
- **验收**：30 个模板 URL 的 `<link rel="canonical">` 存在且唯一

### T-13 缓存失效失败重投

- **模块**：M13
- **现有问题**：`blocking: false` + 0.5s 超时，失败仅 `error_log`
- **目标结果**：WP 侧队列表 + cron 重投；Next 返回结果码供对账
- **验收**：断网 Next 后发布，恢复 15 分钟内收敛

### T-14 备份脚本 + 恢复演练

- **模块**：M16
- **现有问题**：仓库内无 backup/dump/restore 脚本；同机备份；无加密
- **目标结果**：`scripts/backup/` + 异地副本 + 首次演练记录
- **验收**：新容器导入 dump，`wp option get home` 与线上一致

### T-15 告警接线

- **模块**：M11
- **现有问题**：`do_action('fh_inquiry_delivery_alert')` **无监听者**
- **目标结果**：接到真实通道（邮件 + IM 机器人）
- **验收**：`grep -rn "fh_inquiry_delivery_alert" .` 能找到监听器；制造积压能收到告警

### T-16 Uptime + 应用级健康检查

- **模块**：M16
- **现有问题**：healthcheck 只探 `/robots.txt`；无外部探活
- **目标结果**：`/healthz` 探 DB + WP + 缓存；Uptime Kuma
- **验收**：停 WP → `/healthz` 返回 503 且 3 分钟内收到告警

### T-17 `.env` 启动期校验

- **模块**：M01
- **现有问题**：缺变量只在运行时报 503
- **目标结果**：启动即校验，缺必需变量直接失败并打印清单
- **验收**：删掉 `NEXT_PUBLIC_APP_URL` → 启动报错并点名

### T-18 跨语言 entityId

- **模块**：M05
- **现有问题**：`fh_translation_group` 存在但前端未消费；无稳定 entityId
- **目标结果**：hreflang / 切换器 / sitemap 用 entityId 聚合
- **验收**：某语言用不同 slug 时切换仍正确

### T-19 修 legacy/native 双开关死内容风险

- **模块**：M09
- **现有问题**：`fh_guides_authoritative=1` 而 native=0 时前台读 legacy、后台改不了
- **目标结果**：开关语义互斥并有校验
- **验收**：`wp option get` 两开关不能同时为 1；迁移完成后关闭 legacy 分支

### T-20 缓存标签集中登记

- **模块**：M13
- **现有问题**：3 处散落常量
- **目标结果**：`src/lib/wordpress/cache-tags.ts` 单一导出
- **验收**：无其他文件重复定义标签字符串

---

## P2 · 能力

### T-25 GEO 三字段

- **模块**：M07 ｜ **依赖**：T-03
- **内容**：`lastVerifiedAt` / `sourceReferences`（结构化，可外部回溯）/ `shortAnswer`
- **验收**：`grep -rn "lastVerifiedAt\|sourceReferences\|shortAnswer" src local-wp/mu-plugins` 每个 ≥1 且为必填

### T-26 FAQ 收敛 + `FAQPage` JSON-LD

- **模块**：M07 ｜ **依赖**：T-03
- **验收**：`curl -s /dealers | grep -c FAQPage` ≥ 1；三处重复渲染统一到 `FaqAccordion`

### T-27 补 Organization / WebSite / BreadcrumbList

- **模块**：M06 ｜ **依赖**：T-12
- **验收**：`/` 与 `/about` 各至少 1 个 `application/ld+json` 且含 Organization

### T-28 llms.txt 事实层

- **模块**：M07 ｜ **依赖**：T-25
- **验收**：`curl -s /llms.txt | grep -cE "Founded|MOQ|ISO|capacity"` ≥ 3

### T-29 模块注册表替换 switch

- **模块**：M04
- **内容**：`const MODULE_REGISTRY: Record<ModuleType, Component>`；未知类型降级渲染
- **验收**：加第 6 个模块只改注册表一处；未知 type 不静默消失

### T-30 非首页页面补 schemaVersion

- **模块**：M04 ｜ **依赖**：T-10
- **验收**：`grep -rn "schemaVersion" src local-wp/mu-plugins` 覆盖全部内容域

### T-31 图集链路接通

- **模块**：M08
- **验收**：任一上架型号返回 ≥2 张图

### T-32 AVIF + `minimumCacheTTL`

- **模块**：M12
- **验收**：`curl -H 'Accept: image/avif' /_next/image?...` 返回 `image/avif`

### T-33 E2E 进 CI

- **模块**：M15/M18
- **验收**：`grep -c playwright .github/workflows/verify.yml` ≥ 1；同时去掉重复的 `npm test`

### T-34 CD + 镜像 tag 改 git SHA

- **模块**：M15 ｜ **依赖**：T-33
- **验收**：`docker image inspect` 能反查 commit；部署有校验脚本

### T-35 Insight 分类上 taxonomy + 分页

- **模块**：M09 ｜ **依赖**：T-19
- **验收**：`wp term list insight_category` 有内容；`/insights?page=2` 可用；解除 100 条截断

### T-36 询盘同意采集 + WP 侧限流

- **模块**：M10
- **验收**：提交记录带 `consentedAt` + 隐私版本号；绕过 Next 直打 WP 也受限

### T-37 产品分类统一

- **模块**：M08 ｜ **依赖**：T-07
- **验收**：只剩一套分类定义

### T-38 孤儿与死代码清理

- **模块**：M01/M04
- **清单**：`ui/button.tsx`、`home-hero.tsx.retired`、`WheelStripSection`、`homepage-hero.ts`、`process.ts`、`capabilities.ts`、`wordpress/index.ts` barrel、`inquiry/mailer.ts`、`markDelivered()`、`@stylexjs/stylex`
- **验收**：`grep` 各零引用项为 0；`npm run check` 全绿

---

## P3 · 治理

### T-40 pre-commit hook

- **模块**：M17
- **内容**：提交前检查密钥模式、禁止无授权 commit、lint 变更文件
- **验收**：故意提交含 `sk-` 的文件被拦

### T-41 内容变更审计日志

- **模块**：M17
- **内容**：Agent 独立账号 + 每次内容写入记录（账号/时间/对象/前后 diff 摘要）
- **验收**：改一篇文章后能查到该账号 + 时间戳 + 前后值

### T-42 任务卡改 frontmatter

- **模块**：M17
- **内容**：`status: queued|active|done` + `scripts/verify-work-tasks.mjs` 校验目录一致性
- **验收**：状态与所在目录不一致即报错

### T-43 CWV 采集

- **模块**：M18
- **内容**：web-vitals 或 Lighthouse CI，对 `/`、`/products/wheels`、`/request-a-quote`、`/insights` 设阈值
- **验收**：LCP < 2.5s、INP < 200ms、CLS < 0.1 在 PR 上可见

### T-44 性能预算

- **模块**：M18
- **验收**：首屏 JS 超阈值即 CI 失败

### T-45 a11y 扩展到动态态

- **模块**：M18
- **验收**：筛选后状态也跑 axe，零 violation

### T-46 nonce-based CSP

- **模块**：M14
- **验收**：`script-src` 不含 `'unsafe-inline'`

### T-47 对象存储评估

- **模块**：M12
- **验收**：有量化收益结论（省多少 / 成本多少），再决定做不做

### T-48 清理样式依赖

- **模块**：M01
- **验收**：`npm ls` 只剩实际使用的样式方案
