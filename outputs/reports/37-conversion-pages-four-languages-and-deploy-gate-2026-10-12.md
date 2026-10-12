# 询盘转化页四语验收与预发布门槛

- 日期：2026-10-12
- 范围：`/request-a-quote`、`/contact` 的 `en/zh/es/th`；仅本地业务文案可标记批准。
- 结论：这两页的本地切片通过，并已随全量快照部署到 9080 预发布；整站四语和正式生产发布仍未通过。

## 内容归属与安全边界

- WordPress Page 键 `request-a-quote` 与 `contact` 分别持有业务正文和 SEO，Next.js 使用稳定的类型化适配器；交互标签仍属本地字典。
- 旧询盘 Page 1339 是草稿聚合结构，迁移前字段已保存在同一记录的 `fh_conversion_legacy_backup_json`；受控迁移复用该 ID。联系页新建为 1428。两个页面四语言业务文本的 `locale_status` 均为 `approved`。本次未改 `privacy` 草稿或法律文档。
- `getInquiryContent` 只接受独立、公开且获准的 `privacy` Page 作为提交同意版本，页面预览也不能读取隐私草稿来开启表单；隐私展示页也不再显示环境变量里的测试版本。业务页面批准不代表隐私或法律批准；本地真实 WordPress 模式下表单保持关闭。
- 新译文中不发布未经核准的“信息只用于报价”“不加入营销名单”等法律性承诺。隐私状态以中性提示呈现。

## 六轴验收

| 轴 | 本地结果 | 边界 |
|---|---|---|
| 内容 | 两页四语 H1/说明来自批准 Page；`zh/es/th` 浏览器断言通过 | 法律/工程主张不在本次业务批准范围 |
| 媒体 | 两页不依赖内容图片；320px 浏览器无破图 | 全站其他图片说明未完成 |
| SEO | 四语标题、描述、canonical 接线；非英语 `noindex` | 非英语暂不进入可索引集合 |
| 交互 | 模拟模式表单可用于回归；真实 WP 模式下隐私未批，表单不出现 | 未测试真实客户提交，也未发送邮件 |
| 错误 | 页面无 JS 异常；隐私缺失显示对应语言的关闭提示 | 服务端字段错误稳定代码尚待后续切片 |
| 索引 | 已核验非英语 `noindex` 与 canonical；英文按既有规则 | 整站发布门槛不因两页通过而放开 |

执行结果：`npm run lint`、`npm run typecheck`、`npm run build` 通过，`npm test` 42/42；Playwright CLI 全量 **131 passed / 1 skipped / 0 failed**。跳过项是显式要求真实 WordPress 权限的只读用例，默认 mock 模式不会执行真实写入。覆盖审计 `node scripts/i18n/audit-page-locales.mjs http://127.0.0.1:8081` 返回 17 个 Page 键中仍有 **42 个页面×语言未通过**，退出码 1 为正确门禁。

## 远端预发布检查

- 已确认测试入口是 `http://119.91.205.130:9080`（前端）与 `:7080`（WordPress），均不是正式商用环境；9080 保持 `X-Robots-Tag: noindex, nofollow`。
- 本次使用 `PersonWeb.pem` 通过 SSH 访问远端；先完成数据库、compose、配置和 mu-plugin 备份，再加载 `fenghuai-frontend-9080:d91d8ae`。本地镜像为 `linux/amd64`，摘要 `sha256:88764fad0b1b0113483b203af39adcf35cb19aac41eb19b7bdf24243ace671ec`。
- WordPress Pages 接缝及受控运行时 seeder 已部署。远端生成页面 ID 1262（`request-a-quote`）与 1263（`contact`），四语业务内容为 `approved`；单页请求返回 `authoritative: true`，全量接管开关保持关闭。
- 远端只读冒烟：8 个中英文/中文/西语/泰语询盘与联系路径均 200；语言声明正确，非英文 `noindex, follow`；页面保留“Project enquiry is not open yet / The privacy notice has not been approved”；`robots.txt` 的 sitemap 为 9080 地址；询盘 GET 读取接口不公开。未提交真实表单、未发真实 SMTP 邮件。
- 备份目录：`/opt/fenghuai-backups/20261012-162734`。回滚方向是恢复该目录中的 compose、mu-plugin 与数据库，并将前端 compose 镜像改回 `fenghuai-frontend-9080:2026-10-09`；本轮未删除旧镜像或旧站目录。

因此本轮**已推送并部署到预发布，不等于正式上线**。整站四语覆盖仍有 42 个页面×语言门槛，隐私/法律批准、正式域名 SEO、真实 SMTP 投递和生产发布继续保持阻断。
