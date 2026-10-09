# 询盘通知邮件与 WordPress 可见性修复

## 问题

当前销售通知邮件虽然能送达，但正文退化为一段连续纯文本，联系人、产品、规格、来源等
信息难以扫描；邮件里也没有直达 WordPress 询盘详情的入口。与此同时，WordPress 询盘
列表的表头和实际单元格顺序不一致，会让客户、客户类型、产品线、业务状态等字段显示在
错误列下，影响销售判断。

## 本次结果

1. 销售通知同时提供结构化 HTML 正文和可读的纯文本备用正文。
2. 邮件中的询盘号、联系人、需求、提交时规格快照和来源字段，与 WordPress 同一条
   `fh_inquiry` 记录一致。
3. 邮件提供需登录且需具备权限的 WordPress 详情链接。
4. WordPress 列表列顺序正确，询盘号可进入完整详情；详情继续转义客户输入。
5. 自动验收覆盖邮件结构、HTML 转义、后台记录可查和详情链接，不只检查“函数存在”。

## 非范围

- 不改变询盘持久化、幂等、事务、outbox 或 worker 的既有架构。
- 不承诺邮件“提供商已接受”等于最终送达；送达/退信事件仍依赖生产提供商回调。
- 不改正式收件人、发件人、域名或生产部署配置。
- 不向客户地址发送测试邮件；测试数据使用保留域名 `example.com`。

## 验收条件

- [x] `fh_inquiry_render_email()` 返回 `subject`、`text`、`html`，正文分区清楚。
- [x] SMTP 发送 multipart HTML + 纯文本备用；Resend 同时发送 `html` 与 `text`。
- [x] HTML 中所有客户输入均经过转义，来源 URL 与后台 URL 经过 URL 转义。
- [x] 邮件中的 WordPress 链接指向同一询盘的编辑详情页。
- [x] WordPress 列表按“询盘号、客户、客户类型、产品线、型号/生产代码、业务状态、
  邮件状态、时间”显示。
- [x] Docker 询盘验收、PHP 语法、项目完整门禁和差异检查通过。

## 证据记录

- 红灯：实现前合成探针得到 `html_present=False`、邮件无详情链接、后台列表字段位置
  非递增，证明探针能捕捉原始问题。
- Docker 完整验收：**78/78 通过**；覆盖 CPT、权限、幂等、事务、outbox、worker、
  邮件 HTML/纯文本、客户输入转义、后台详情链接和列表列顺序。脚本运行时暂停真实
  投递，收尾清除暂停开关。
- 工程门禁：`npm run lint`、`npm run typecheck`、`npm test`（7/7）、带站点 URL 与
  隐私版本的 `npm run build`（188 个页面数据项）、Python 语法与 `git diff --check`
  均通过。
- Playwright：900px 与 390px 邮件渲染通过；390px `scrollWidth=clientWidth=390`；
  控制台 0 错误。证据：
  `resources/screenshots/2026-10-08-inquiry-email/notification-email-desktop.png`、
  `notification-email-mobile.png`。
- 视觉复核发现并修复 HTML 缺少 UTF-8 声明导致中文乱码的问题。
- 真实闭环：使用 `example.com` 合成联系人提交 1 条内部格式验收询盘，HTTP 201，
  SMTP 状态 `accepted`；WordPress 同号记录为 `INQ-20261008-0001`、`post_id=538`，
  后台详情 URL 指向该记录。该记录保留供人工查看。
- 外部副作用：仅向服务端已配置的内部收件邮箱发送 1 封“内部格式验收”通知；没有
  向客户地址发信。`accepted` 不代表 delivered，最终送达/退信仍待提供商事件回调。
- 未 commit、未 push、未部署，未修改 DNS。
