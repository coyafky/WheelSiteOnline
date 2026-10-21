# 询盘可靠性生产化（本地验收）

## 目标

在不向真实客户发信的前提下，把询盘邮件链路验证为可恢复的生产形态：询盘落库、事务 outbox、worker 投递、提供商 `delivered/bounced` 事件回写、积压告警，以及暂停后的恢复演练。

## 范围

- 复用现有 WordPress 内置 PHPMailer/SMTP 发送器；本轮不引入 Nodemailer。
- 增加带时间戳 HMAC 签名的邮件事件回调端点。
- 增加只记录计数和时间的积压监控，不把客户邮箱、电话或正文写入日志。
- 用合成询盘和本地暂停开关完成重复事件、乱序事件、过期租约和恢复测试。

## 生产边界

QQ SMTP 的成功只代表 SMTP 接受（`accepted`），不能天然提供 `delivered/bounced` 回调。真正上线前仍需选择支持签名 Webhook 的邮件提供商，并配置密钥、公开 HTTPS 回调地址和可靠的 WP-Cron/系统定时器。

## 验收门槛

- [x] PHP 插件语法检查通过。
- [x] 本地事件回调路由、签名校验、去重和状态投影测试通过。
- [x] 本地积压摘要、告警去抖和租约恢复测试通过。
- [x] 既有 outbox/worker 回归测试无新增失败；历史列表字段顺序探针仍有 1 项既存失败。
- [x] 更新 `STATUS.md`、`DECISIONS.md` 和完成记录，明确生产接入剩余项。

## 证据

- `docker exec fh-wp php -l .../fenghuai-inquiries.php`：通过。
- `python3 scripts/verify-inquiry-delivery.py`：全部投递、回调、告警和恢复断言通过。
- `python3 scripts/verify-inquiry-backend.py`：77/78 通过；唯一失败为既有 WordPress 询盘列表字段顺序探针，不由本任务引入。
- `docker compose ... config --quiet`：本地与部署 Compose 文件均可解析（未设置部署环境变量时仅有预期警告）。

## 未决生产事项

QQ SMTP 不提供本任务所需的 `delivered/bounced` Webhook。生产上线前需要批准支持签名 Webhook 的邮件服务、回调域名/HTTPS、`FH_INQUIRY_WEBHOOK_SECRET`、可靠 cron/队列和告警接收人；本地合成测试不会替代真实提供商验收。
