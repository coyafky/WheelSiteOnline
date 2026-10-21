# 询盘持久化与 QQ SMTP 端到端修复报告

日期：2026-10-11

## 结论

客户询盘成功的最低标准已经统一为 **WordPress/MySQL 数据库事务成功**。进程内记录、HTTP 201
本身或 SMTP 发送结果都不能单独构成成功。

当前链路为：

```text
浏览器 → Next.js /api/inquiries → WordPress REST → MySQL 事务
                                              ├─ fh_inquiry CPT/meta
                                              ├─ 幂等键
                                              └─ Outbox → QQ SMTP
```

只有前三项数据库写入全部成功，Next.js 才返回 `ok:true + persisted:true`，浏览器才显示询盘号。
邮件失败时询盘仍然存在，页面显示“已保存、待投递”；数据库失败时页面保留输入与总询盘清单。

## 根因

本地 `.env.local` 缺少 `WP_MODE=live`、`WP_API_URL` 和 `WP_REST_ROOT`。仓储因此退回进程内记录并
标记 `persisted:false`，但 API 仍返回 HTTP 201 与 `ok:true`；前端成功类型没有要求
`persisted:true`，于是把未落库记录误报成成功。WordPress 与 Outbox 都没有记录，QQ SMTP 自然
没有邮件可发送。

## 修复

1. `POST /api/inquiries` 只有收到 WordPress 的持久化结果才返回成功；未持久化统一返回 503，
   不签发感谢页回执，也不调用旧邮件兜底。
2. `InquiryForm` 只接受 HTTP 200/201、`ok:true` 且 `persisted:true` 的组合；其余情况进入错误态并
   保留用户输入与询盘清单。
3. 本地 Next.js 环境接入 `http://127.0.0.1:8081/wp-json`；真实密钥继续仅保存在忽略的
   `.env.local`，未写入仓库。
4. Playwright 强制 `WP_MODE=mock`，所有成功 mock 都必须显式给出 `persisted:true`；配置禁止
   静默复用端口上的其他网站。
5. 后端验收脚本不再删除全部 `fh_inquiry`，只清理专用测试邮箱和固定探针标题关联的数据。

## 真实链路证据

本次只发送 1 条明确标记的合成询盘：

- Next.js：HTTP 201；
- 询盘号：`INQ-20261011-0001`；
- 响应：`persisted:true`、`emailStatus:accepted`、`mock:false`；
- MySQL 核对：CPT 1 条、幂等键 1 条、Outbox 1 条，关联关系一致；
- Outbox：`status=accepted`、`attempts=1`、`last_error` 为空；
- Next.js 日志：`POST /api/inquiries 201`。

`accepted` 证明 QQ SMTP 已接受邮件，不等于最终进入收件箱。需要在 QQ 邮箱中搜索询盘号，并同时
检查垃圾箱。后续运行旧版验收清理时，该合成记录被其“全表清理”误删；邮件没有重复发送。清理器
已经修复并用哨兵记录验证不会再删除普通询盘。

## 自动化证据

- TDD：新增“未写入 WordPress 不得成功”和“前端拒绝 `200 + persisted:false`”测试，均先红后绿；
- 询盘 Playwright：18/18；
- Node 单元测试：42/42；
- WordPress 后端：80/80；
- 邮件事件、积压告警与恢复接缝：18/18；
- ESLint：通过；
- TypeScript：通过；
- Next.js production build：191/191 页面；
- PHP 语法：通过；
- 验收清理边界：普通询盘哨兵保留，测试夹具删除。

## 涉及文件

- `src/app/api/inquiries/route.ts`
- `src/components/inquiry-form.tsx`
- `e2e/inquiry.spec.ts`
- `playwright.config.ts`
- `scripts/verify-inquiry-backend.py`
- `.env.example`
- `.env.local`（仅本机、被忽略）
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`

没有提交、推送或部署。
