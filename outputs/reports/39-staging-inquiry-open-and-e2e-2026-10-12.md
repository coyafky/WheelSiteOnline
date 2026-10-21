# 预发布询盘开放与端到端验收报告

日期：2026-10-12  
范围：本地 `127.0.0.1:3200`、远程预发布 `119.91.205.130:9080`  
验收工具：Playwright CLI、MySQL 只读查询、项目门禁脚本

## 结论

本轮“询盘未发送 / 无法连接询盘服务”已修复。询盘在本地和远程预发布均可完成真实浏览器提交，Next.js API 返回 `201 Created`，WordPress CPT、MySQL 幂等键和 Outbox 均有记录。以 DEC-092 为准，只有持久化成功才进入确认页。

## 修复内容

1. 为预发布环境写入独立的 `privacy` Page，版本为 `staging-test-2026-10-12`，四语均为 approved，并显式标记 `staging_only`。脚本为 `scripts/i18n/seed-staging-test-privacy.php`，需要 `FH_ALLOW_STAGING_SEED=1` 且只接受 `staging-test-` 版本前缀。
2. 隐私 Page 变更后的 Next 缓存失效路径增加 `/request-a-quote` 与 `/contact`，防止转化页继续读到“询盘未开放”的旧缓存。
3. 前端构建时注入同一测试隐私版本，远程容器使用最新 `inquiry-open-20261012` 镜像。

## 浏览器证据

### 远程 9080

- URL：`/zh/request-a-quote?product_line=wheels&ui-test=20261012`
- 产品线通过页面上下文带入，客户类型选择“企业客户”。
- 已填写中文项目描述、姓名、`staging-test@example.invalid`、国家 `CN`，勾选预发布测试隐私声明。
- `POST /api/inquiries`：`201 Created`。
- 页面跳转到 `/zh/thank-you`。
- Playwright CLI 控制台：0 errors，网络请求无询盘失败。

### 本地 3200

- URL：`/zh/request-a-quote?product_line=wheels&ui-test=20261012-local`
- 同样完成两步表单和提交。
- `POST /api/inquiries`：`201 Created`。
- 页面跳转到 `/thank-you`。
- Playwright CLI 控制台：0 errors。

## 数据库证据

| 环境 | `fh_inquiry` | Outbox | Outbox 状态 | 最近记录错误 |
| --- | ---: | ---: | --- | ---: |
| 本地 WordPress/MySQL | 1 | 1 | `accepted` 1 | 0 |
| 远程 WordPress/MySQL | 9 | 9 | `accepted` 9 | 0 |

远程记录包含此前保留的历史测试询盘、本轮 API 验收记录和本轮浏览器验收记录；没有删除或覆盖既有线索。

## 同步口径

本轮确认的是“转化链和相关内容”同步，不是整库同步：

- 插件代码、询盘表结构、轮毂数据与媒体入口已核验。
- `request-a-quote`、`contact` 的四语业务正文和 SEO 在本地/远程一致。
- 远程 WordPress 仍保留自身历史询盘；本地仍有自己的测试数据。
- 远程全量 Page 集合尚未与本地 17 个公开 Page 完全一致，不得用本报告宣称 WordPress 全库同步。

## 发布边界

这次是 9080 预发布测试开关。测试隐私声明不是正式法律文本；正式商用前必须替换为业务/法务批准的版本，并重新验证版本一致性、真实收件人、SMTP 投递和 Outbox 失败重试。远程站点仍处于 noindex 预发布状态。

## 门禁

- `npm test`：42/42
- `npm run lint`：通过
- `npm run typecheck`：通过
- `npm run build`：通过
- 远程轮毂目录图片：此前 Playwright 25/25 加载，0 broken，0 image HTTP error

