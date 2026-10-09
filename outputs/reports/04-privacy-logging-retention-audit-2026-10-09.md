# 询盘日志、隐私与保留删除审计

- 日期：2026-10-09
- 范围：Next.js 询盘入口、限流、WordPress 询盘记录、邮件错误、保留与删除接口
- 结论：本地工程基线通过；正式保留天数、法定依据、生产日志平台与权限仍需管理层/法务确定

## 1. 已验证结论

| 检查项 | 结果 | 证据 |
|---|---|---|
| IP/邮箱限流键 | 只保留 SHA-256 前缀键，不含原文 | `tests/inquiry-contract.test.mts` |
| Next 异常日志 | 只记录错误类型，不输出异常 message | `src/app/api/inquiries/route.ts` |
| WordPress 邮件错误 | 入库前替换邮箱、电话、SMTP/Resend 密钥并限长 | `fenghuai-inquiries.php` Docker 探针 |
| 询盘真相源 | WordPress CPT；邮件只是通知副本 | 78/78 询盘后端验收与 DEC-064 |
| 保留策略 | `FH_INQUIRY_RETENTION_DAYS=0` 默认关闭，不擅自删除 | `.env.example`、Docker compose |
| 删除接口 | 同事务级联删除 CPT、幂等键、outbox、provider event | Docker 合成记录探针 |
| 浏览器回归 | 失败态不泄漏密钥，敏感 URL 不公开 | Playwright 23/23 |

Docker 探针结果：保留关闭时不删除；错误字符串成功脱敏为
`smtp [email] [phone] [secret]`；合成记录级联删除后残留为 0。探针未触碰保留的内部验收
询盘 `INQ-20261008-0001`。

## 2. 已建立的技术接口

- `fh_inquiry_retention_days()`：读取并过滤保留天数；
- `fh_inquiry_retention_candidates()`：只选择超过期限的候选；
- `fh_inquiry_delete_cascade()`：单条事务级联删除；
- `fh_inquiry_run_retention()`：批量执行并返回删除/失败数量；
- 日计划任务只在保留天数大于 0 时注册。

这些接口解决“系统是否有能力执行批准后的政策”，不代替法务决定“应保留多久”。

## 3. 上线前仍需批准

1. 各目标市场适用的保留期限、删除例外、诉讼保全和审计要求；
2. 谁可修改保留天数、谁审批和谁复核删除；
3. 生产日志平台、保存周期、访问角色、告警与导出范围；
4. 备份中的个人信息如何到期清理，以及恢复后如何重新执行删除；
5. 客户访问、更正、删除请求的受理渠道、身份核验和响应时限。

在上述事项批准前，保持 `FH_INQUIRY_RETENTION_DAYS=0`，避免代理替法务选择删除期限。
