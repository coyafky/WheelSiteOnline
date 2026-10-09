# 询盘多产品、邮件通道与 Insights 内容来源核验

日期：2026-10-09
范围：询盘提交模型、邮件通知实现、Insights 首批文章的内容正本。

## 结论

1. 当前询盘只支持一条轮毂上下文：`model + productionCode + selectedSpec`。客户可以填写数量，但不能在一次提交中携带多款轮毂；这一点与早期方案中“多产品询价清单延期”的决定一致。
2. 项目没有使用 `nodemailer`。远程正式联调使用 WordPress 自带 PHPMailer 通过 QQ SMTP 发信，Resend 是备用通道；邮件先落库、再进 outbox、再投递，询盘仍可在 WordPress 后台查看。
3. 首批 6 篇 Insights 已经迁移到 WordPress，但不是 WordPress 官方 `post` 类型，而是项目自定义的 `fh_guide` 内容类型。Next.js 在 `WP_MODE=live` 且 `authoritative=true` 时从 `/fh/v1/guides` 读取；CMS 不可用或未接管时才回退 `src/content/resources.ts`。

## 证据

### 询盘目前是单产品

- `src/lib/inquiry/types.ts` 只有单数的 `model`、`productionCode` 和 `selectedSpec`。
- `src/lib/inquiry/schema.ts` 没有 `items[]` 字段。
- `src/lib/wheels/inquiry-binding.ts` 只按一组 `model + productionCode` 重新解析规格。
- `local-wp/mu-plugins/fenghuai-inquiries.php` 保存的是 `context_model`、`context_production_code`、`context_spec_json` 三个单值元数据，邮件模板也只渲染一组配置。
- `docs/plans/inquiry-system-architecture.md` 明确把 Inquiry Cart / 多产品询价清单放在后续 P2，不作为首发门槛。

### 邮件通道

- `package.json` 和锁文件均没有 `nodemailer` 依赖。
- `local-wp/mu-plugins/fenghuai-inquiries.php` 使用 WordPress 自带 `PHPMailer\\PHPMailer\\PHPMailer`，支持 multipart/alternative（HTML + 纯文本），SMTP 优先、Resend 兜底。
- 远程验收 `INQ-20261009-0007` 已确认：HTTP 201、WordPress 记录存在、outbox `accepted`、尝试次数为 1、无错误。`accepted` 只表示 SMTP 接收，不等于 QQ 最终投递。
- `src/lib/inquiry/mailer.ts` 仍保留 Next 无 CMS 开发回退和 Resend 代码；生产 `WP_MODE=live` 时由 WordPress 负责实际发送。

### Insights 首批文章

- 初始内容确实定义在 `src/content/resources.ts`，因此在 CMS 未接管的开发模式下会由前台静态渲染。
- `scripts/import-insights-wordpress.php` 将这些文章导入 `fh_guide`，并写入结构化元字段与媒体。
- `local-wp/wp-data/wp-content/mu-plugins/fenghuai-guides.php` 注册 `fh_guide`，公开契约是 `/fh/v1/guides`，并要求 WordPress `publish` 与 `publication_status=approved` 双重通过。
- 远程实际响应已核验：`authoritative=true`、6 条记录，slug 为：
  `importing-freight-and-duties`、`finishing-options-explained`、`how-to-measure-fitment`、`offset-and-backspacing`、`monoblock-vs-two-piece`、`forged-vs-cast`。
- `src/lib/wordpress/insights.ts` 在 live 模式读取该契约；`src/app/insights/page.tsx` 和 `src/app/insights/[slug]/page.tsx` 只消费适配后的视图模型。

## 多产品询盘建议方案

新增“询价清单”而不是把多个型号拼进 `message`：

1. 浏览器端保存最多 20 条清单项，每项只保存 `model`、`productionCode`、客户数量和来源 URL；提供添加、删除、数量修改和清空。
2. 提交载荷增加 `items[]`，服务端仅信任型号和生产代码，再逐条从公开 WordPress 产品集合解析规格；客户端传入的尺寸、PCD、ET、中心孔一律不作为事实源。
3. WordPress 询盘增加 `items_json`（或独立 `fh_inquiry_items` 表），每条保存不可变产品/规格快照、数量和排序；旧的单产品字段保留兼容历史记录。
4. 邮件正文改为“询价清单”表格，并在 WordPress 后台详情页显示每一项；数量应是每项数量，不再共用一个全局 quantity。
5. 幂等键仍然针对整次提交；限制清单数量、每项数量、总请求体大小，并拒绝重复 `productionCode` 或明确提示合并数量。

## 计划与验收门槛

对应任务见 [`work/queued/2026-10-09-inquiry-cart-multi-item.md`](../../work/queued/2026-10-09-inquiry-cart-multi-item.md)。完成前不应声称“支持一次询价多款轮毂”。
