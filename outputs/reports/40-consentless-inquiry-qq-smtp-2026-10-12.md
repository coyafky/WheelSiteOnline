# 询盘取消隐私勾选门槛与 QQ SMTP 端到端验收

日期：2026-10-12  
范围：本地 Next.js、远程 9080 Next.js、WordPress/MU 插件、MySQL、Outbox、QQ SMTP

## 结论

询盘转化链已按当前业务要求开放：用户不需要先勾选隐私框，也不需要前端存在已批准的隐私版本才能提交。成功页仍只有在 WordPress 记录和 Outbox 写入成功后才会出现。

9080 远程最终验收通过。真实浏览器提交返回 `201 Created`，进入 `/zh/thank-you`；远程数据库查询显示最近记录的 Outbox 状态为 `accepted`，QQ SMTP 服务端已接受通知消息。

## 根因与修复

此前出现“项目询盘暂未开放”的原因是三层门槛叠加：

1. Next Zod schema 要求 `privacyConsent=true` 和非空 `privacyVersion`。
2. Next `/api/inquiries` 在版本缺失时直接返回 `503`。
3. WordPress MU 插件把 `privacyVersion` 与 `consentedAt` 当成必填字段。

本轮修复：

- `src/lib/inquiry/schema.ts`：隐私字段改为可选兼容字段。
- `src/lib/inquiry/validate.ts`：移除版本匹配与勾选判断，保留业务字段、Origin、蜜罐、时间陷阱、幂等和限流校验。
- `src/app/api/inquiries/route.ts`：移除“没有隐私版本即 503”的分支。
- `src/components/inquiry-form.tsx`：移除隐私 checkbox 和关闭 Banner；空版本也能正常显示表单。
- `src/lib/wordpress/inquiry-content.ts`、`src/app/request-a-quote/page.tsx`：隐私页面不再决定业务表单是否开放。
- `local-wp/mu-plugins/fenghuai-inquiries.php`：允许缺少隐私字段；不再伪造 `consentedAt`；邮件通知标题从 `Source & consent` 改为 `Source`。
- `src/content/conversion-pages.ts` 与 WordPress `request-a-quote` Page：四语 data notice 改为“可提交已有信息，缺失技术细节后续确认”的非阻塞文案。
- `scripts/i18n/update-consentless-conversion-copy.php`：定点更新远程/本地页面的 `dataNotice.body`，并在 WordPress 元数据中保留更新前 JSON 备份。

旧的兼容字段仍留在请求形状中，避免历史调用方破坏；它们不再参与是否开放询盘的判定，也不会被系统伪造成有效同意记录。

## 本地验证

- `npm test`：42/42 通过，其中包括“没有隐私勾选字段也可提交询盘”和轮毂数量为任意安全正整数。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run build`：通过，生成 191 个页面。
- 本地直接 POST 缺少 `privacyConsent` 与 `privacyVersion`：返回 `201`，WordPress 记录与 Outbox 已保存。
- 本地 SMTP 连接失败，原因是本地 SMTP 配置不可用；该失败只反映邮件投递状态，不回滚询盘记录，也没有被误报成“询盘未保存”。

## 远程 9080 验收

### 页面与交互

Playwright CLI 访问：

`http://119.91.205.130:9080/zh/request-a-quote?product_line=wheels`

验收结果：

- 页面显示两步询盘表单。
- 页面不再显示“项目询盘暂未开放”。
- 页面不再渲染隐私 checkbox，隐私相关 checkbox 数量为 0。
- 页面有可交互的 `<form>`。
- 最终页面文案不再包含“隐私声明须经批准后，此表单才会接收项目询盘”。
- 浏览器控制台：0 errors，0 warnings。

### 真实提交链路

最终 UI 提交使用企业客户、项目描述、姓名、测试邮箱、国家和公司字段。结果：

- `POST /api/inquiries`：`201 Created`。
- 成功页：`/zh/thank-you`。
- 远程询盘编号：`INQ-20261012-0013`。
- WordPress/MySQL 记录存在。
- `email_status=accepted`。
- Outbox：`status=accepted`、`attempts=1`、`last_error=NULL`。

这证明 WordPress 保存、Outbox 写入和 QQ SMTP 服务端接受均已接通。由于当前环境没有 QQ 邮箱读取连接器，报告只宣称“SMTP 服务端接受”，不把它扩大为“收件箱已人工看到”；收件箱显示需在 QQ 邮箱中人工确认。

## 部署记录

- 远程 WordPress 页面 ID 1262 的四语 `dataNotice.body` 已同步。
- 远程 WordPress MU 插件与本地源文件已同步，PHP 语法检查通过。
- 远程前端最终镜像：`fenghuai-frontend-9080:consentless-20261012-final2-amd64`。
- 架构：`linux/amd64`。
- 镜像压缩包 SHA-256：`47d09559e43401656f7cba9a4c05bd6c277e29280670ba8ee7a11491bace3bac`。
- 远程容器健康检查：`healthy`。
- 之前的 compose 与 MU 插件备份保存在 `/opt/fenghuai-backups/20261012-remove-consent-gate/`。

## 正式上线门槛

当前变更满足“可以直接做项目询盘测试”的业务要求，但不等于正式法律文本已获批准。正式上线前仍要：

1. 将测试/过渡隐私页面替换为业务与法务确认的正式版本。
2. 在正式域名和正式 SMTP 配置下重复浏览器提交与 Outbox 查询。
3. 人工在 QQ 邮箱确认邮件主题、正文、编码和收件人均正确。
4. 重新构建正式镜像，核对 `NEXT_PUBLIC_APP_URL`、canonical、sitemap、robots 和图片公网地址。

