# Issue：支持一次询盘提交多款轮毂

## Spec-Driven 元数据

- **Phase**：3
- **Milestone**：待创建/映射
- **GitHub Issue**：[#7](https://github.com/coyafky/WheelSiteOnline/issues/7)
- **Delivery Batch**：多产品询盘批次
- **依赖**：单产品询盘契约、公开集合和 WordPress 快照模型
- **S.U.P.E.R 关注**：Single Purpose（询盘清单而非购物车）；Ports over Implementation（客户端清单与服务端逐项解析分离）；Replaceable Parts（邮件/后台展示消费同一快照）
- **验证命令**：`npm run lint`、`npm run typecheck`、`npm test`、`npm run build`、浏览器 E2E 与邮件失败路径
- **漂移规则**：若引入价格、支付、账户或订单，立即停止并进入 Deep Discuss

状态：已排队，尚未开始
优先级：P1（不阻塞当前单产品询盘链路）
来源：2026-10-09 询盘多产品核验

## 问题

当前 `/request-a-quote` 及 WordPress 询盘记录只保存一组 `model + productionCode + selectedSpec`。客户想同时询价 FH-001、FH-002 等多款轮毂时，只能拆成多次提交或手工写入消息，销售无法获得结构化清单，数量也无法按产品分别记录。

## 目标

客户可以从目录/详情页把多款已发布轮毂加入询价清单，在一次提交中完成联系信息填写；WordPress 后台和通知邮件都能看到逐项、可追溯、不可被后续产品修改影响的规格快照。

## 实施计划

1. 扩展共享类型与 Zod 契约：`InquiryItemInput[]`、数量上限、最多 20 项、重复项合并规则。
2. 实现客户端询价清单：添加/删除/数量修改/清空、刷新后保留、移动端可用、无障碍键盘操作。
3. 扩展服务端逐项绑定：按 `model + productionCode` 重新解析 WordPress 公开集合；无法解析的项返回字段错误，不接受客户端伪造规格。
4. 扩展 WordPress CPT/自定义表、后台详情和 REST 写入契约，保留旧单项字段兼容已有记录。
5. 扩展 HTML/纯文本邮件模板和 outbox 验收，确保 Reply-To、敏感信息脱敏和失败重试规则不变。
6. 补全 E2E：一款、多款、重复项、未发布项、篡改规格、数量越界、幂等重放、邮件失败、后台可见。

## 完成定义

- `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 和浏览器 E2E 全绿；
- WordPress 询盘详情和 QQ 通知邮件显示相同的多款清单及服务端规格快照；
- 修改或撤回产品不会改变历史询盘；
- 旧单产品请求和已有记录无需迁移即可继续工作；
- 更新 `STATUS.md`、`DECISIONS.md`，并将本 Issue 移至 `work/completed/`。

## 暂不做

不引入在线购物车、价格计算、订单支付、客户账号或 WooCommerce；这是询盘清单，不是交易购物车。
