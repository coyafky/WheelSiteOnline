# 测试与验收计划（TEST_PLAN）

制定日期：2026-10-17
配套：[`ROADMAP.md`](ROADMAP.md) ｜ [`TASKS.md`](TASKS.md) ｜ [`../architecture/SEO_GEO.md`](../architecture/SEO_GEO.md)

---

## 0. 铁律

1. **不得伪造测试结果**。跑不了就写「未能运行」+ 原因 + 未验证风险。
2. **区分「已实施且通过验证」/「已实施但未验证」/「已设计但未实施」/「需要授权」**——四态必须写清。
3. **外部依赖不可用时不跳过验收**，而是明确标 阻塞 + 需要什么。
4. **测试要能证伪**：探测器本身要能被证伪（历史教训：探测器只 grep 一种错误码，把「模型改名」误记成「上游 429」，连报 8 次假结论）。

---

## 1. 静态门禁（每次提交）

```bash
npm run check
# = theme:check && npm test && lint && typecheck && build
```

| 检查 | 命令 | 通过标准 |
|---|---|---|
| 主题令牌 | `npm run theme:check` | 无 diff |
| 单测 | `npm test` | 全绿（16 个 .test.mts） |
| Lint | `npm run lint` | 0 error |
| 类型 | `npm run typecheck` | 0 error |
| 构建 | `npm run build` | 成功，产物 `.next/` 完整 |
| 生产依赖漏洞 | `npm run audit:prod` | 无 high/critical |

---

## 2. 契约测试（P1 新增）

```bash
# PHP ⇄ TS 常量比对
node scripts/verify-contract-parity.mjs

# WordPress 侧 schema 与运行时一致
python3 scripts/sync-mu-plugins.py --check
php scripts/verify-page-v2-contract.php

# 展示层不碰 CMS
grep -rn 'from "@/lib/wordpress' src/components/ | wc -l     # 必须 0

# 环境变量未入库
git ls-files | grep -iE "\.env($|\.)" | grep -v example     # 必须空
```

---

## 3. 多语言验收（T-02 / T-18）

| 检查 | 命令/方法 | 通过标准 |
|---|---|---|
| hreflang 与 sitemap 一致 | `node scripts/verify-hreflang-parity.mjs` | 全 URL 语言集合相等 |
| 未公开译文 404 | `curl -sI /zh/products/wheels` | 404（当前对非首页应如此） |
| 404 带 noindex | `curl -s /zh/... \| grep -c 'name="robots"'` | ≥1（当前**未验证**） |
| 非 en 响应头 | `curl -sI /zh` | `Content-Language: zh-CN` |
| 切换器不暴露未公开语言 | 页面结构断言 | 未公开语言为 disabled |
| 英文 URL 不被重定向 | `curl -sI /about`（带 `Accept-Language: zh`） | 200，不跳 `/zh/about` |

---

## 4. SEO / GEO 验收（T-01 / T-12 / T-25–T-28）

```bash
# canonical 唯一
for u in $(cat e2e/urls.txt); do
  n=$(curl -s "$u" | grep -c 'rel="canonical"'); [ "$n" = "1" ] || echo "FAIL $u ($n)"
done

# sitemap 与 e2e 同向
curl -s /sitemap.xml | grep -c "/thank-you"        # 必须与 e2e 断言一致

# 结构化数据
curl -s / | grep -c "Organization"                  # ≥1
curl -s /about | grep -c "application/ld+json"      # ≥1
curl -s /dealers | grep -c "FAQPage"                # ≥1

# GEO 字段
grep -rn "lastVerifiedAt\|sourceReferences\|shortAnswer" src local-wp/mu-plugins | wc -l   # ≥3
curl -s /llms.txt | grep -cE "Founded|MOQ|ISO|capacity"                                    # ≥3

# PLACEHOLDER 清零
grep -c "PLACEHOLDER" src/content/faq.ts            # 0

# fail-closed 仍在
# 未配 NEXT_PUBLIC_APP_URL 构建后：
curl -sI /robots.txt | grep -i "disallow: /"
```

---

## 5. 业务验收（T-36）

| 检查 | 方法 | 通过标准 |
|---|---|---|
| 询盘事务 | `python3 scripts/verify-inquiry-backend.py` | 全绿（含 Case B 回滚） |
| 幂等 | 同 key 连发 2 次 | 201 + 200，库里 1 行 |
| 匿名不可读 | `GET /api/inquiries` | 404 |
| 限流 | 同邮箱 10 分钟内第 4 次 | 429 |
| 邮件失败不丢询盘 | 停 SMTP 提交 | `email_status=failed`，询盘数只增 |
| 重试退避 | 查 outbox | attempts 递增，间隔 1/5/15/60，5 次后终止 |
| WP 侧限流 | 绕过 Next 直打 | 受限（T-36 后） |

---

## 6. 安全验收（T-04 / T-06 / T-08 / T-46）

| 检查 | 命令 | 通过标准 |
|---|---|---|
| 安全头 | `curl -sI https://<host>/` | 六条头齐全 |
| 密钥不进日志 | `grep -c "secret=" /var/log/nginx/*access.log` | 0 |
| 限流不可绕过 | 伪造 `CF-Connecting-IP` 连打 10 次 | 第 7 次起 429 |
| preview 无 index | preview 模式访问两页 | `noindex` |
| 生产无 localhost | `grep -o "8081" .next/server/**/*.js \| wc -l` | 0 |
| 敏感路径 | `/.env` `/.git/config` `/wp-json/wp/v2/users` | 404 或不泄露 |
| CSP 无 unsafe-inline | `curl -sI /` | T-46 后成立 |

---

## 7. 可观测与可恢复验收（T-14 / T-15 / T-16）

| 检查 | 方法 | 通过标准 |
|---|---|---|
| 备份脚本存在 | `ls scripts/ \| grep -iE "backup\|restore"` | ≥1 |
| 备份可用 | 跑一次 + sha256 校验 | 通过 |
| **恢复演练** | 新容器导入 dump | `wp option get home` 与线上一致；3 张图可访问；记录耗时与负责人 |
| 告警有接收人 | `grep -rn "fh_inquiry_delivery_alert" .` | 找到监听器 |
| 告警可达 | 制造积压 | 收到真实通知 |
| 健康检查 | 停 WP → `curl /healthz` | 503 |
| uptime | 停站点 | 3 分钟内收到告警 |

---

## 8. E2E 与性能（T-33 / T-43 / T-45）

```bash
npx playwright test              # 17 spec / 93 test
```

| 检查 | 通过标准 |
|---|---|
| 全量 E2E | 零失败（已知既有失败需单列） |
| CI 中执行 | `verify.yml` 含 playwright |
| LCP | 75 分位 ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| a11y | axe 零 violation（含筛选后状态） |
| 性能预算 | 首屏 JS / 图片不超阈值 |

---

## 9. 部署验收（T-34）

```bash
# 镜像可追溯
docker image inspect <image> --format '{{.Config.Labels}}' | grep git

# 烤入值一致（跨机部署必查）
grep -r "NEXT_PUBLIC_APP_URL" .next/ | head
curl -s / | grep -o 'rel="canonical" href="[^"]*"'
curl -s /sitemap.xml | head -3

# 回滚可用
docker compose down && docker compose up -d --no-build   # 用上一版本
```

| 检查 | 通过标准 |
|---|---|
| 镜像 tag | 含 git SHA |
| canonical 域名 | 与目标环境一致（**不是** Vercel/localhost） |
| `appDir` | 与目标机路径一致 |
| 回滚 | 5 分钟内回到上一版本 |
| healthcheck | 应用级探活通过 |

---

## 10. 分阶段验收清单

### P0 验收（止血）

- [ ] T-01 sitemap 与 e2e 同向
- [ ] T-02 `grep localizedAlternates` 全部显式传参
- [ ] T-03 `grep PLACEHOLDER src/content/faq.ts` = 0
- [ ] T-04 `grep "secret=" access.log` = 0
- [ ] T-05 新建 Insight 默认带警告条
- [ ] T-06 14 处硬编码 index 改为走发布资格
- [ ] T-07 无 404 链接
- [ ] T-08 生产产物无 8081
- [ ] `npm run check` 全绿

### P1 验收（地基）

- [ ] T-10 Zod 边界 + 错误模型（试点域 + 至少 2 个域）
- [ ] T-11 契约比对进 CI
- [ ] T-12 canonical 30 URL 唯一
- [ ] T-13 断网 15 分钟内失效收敛
- [ ] T-14 备份 + **恢复演练有记录**
- [ ] T-15 告警有接收人
- [ ] T-16 `/healthz` + uptime
- [ ] T-17 缺 env 启动即失败
- [ ] T-18 跨语言 entityId 生效
- [ ] T-19 双开关互斥
- [ ] T-20 标签集中

### P2 验收（能力）

- [ ] T-25 GEO 三字段
- [ ] T-26 FAQPage schema
- [ ] T-27 Organization/WebSite/Breadcrumb
- [ ] T-28 llms.txt 事实层
- [ ] T-29 模块注册表
- [ ] T-30 schemaVersion 全域
- [ ] T-31 图集
- [ ] T-32 AVIF
- [ ] T-33 E2E 进 CI
- [ ] T-34 CD + 可追溯镜像
- [ ] T-35 taxonomy + 分页
- [ ] T-36 同意采集 + WP 限流
- [ ] T-37 分类统一
- [ ] T-38 死代码清零

### P3 验收（治理）

- [ ] T-40 pre-commit 拦截
- [ ] T-41 内容审计日志
- [ ] T-42 任务卡 schema
- [ ] T-43 CWV 阈值
- [ ] T-44 性能预算
- [ ] T-45 a11y 动态态
- [ ] T-46 nonce CSP
- [ ] T-47 对象存储结论
- [ ] T-48 样式依赖清理

---

## 11. 需要授权 / 生产窗口的操作

这些**不自动执行**，必须先获得明确授权：

| 操作 | 影响 | 为什么需要授权 |
|---|---|---|
| 生产数据库任何写操作 | 不可逆 | 数据安全 |
| DNS / 域名变更 | 不可逆 | 对外影响 |
| 部署到生产 | 对外可见 | 需窗口 |
| 真实发信测试 | 骚扰客户 | 对外 |
| 轮换生产密钥 | 可能中断服务 | 可用性 |
| 删除任何内容 | 不可逆 | 数据 |
| 修改正式 URL 结构 | SEO 收录 | 需 301 规划 |
