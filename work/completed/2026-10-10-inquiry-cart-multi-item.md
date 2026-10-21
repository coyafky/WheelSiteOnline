# Issue：支持一次询盘提交多款轮毂

状态：已完成（2026-10-10）
关联迁移 Issue：[#7](https://github.com/coyafky/WheelSiteOnline/issues/7)
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

## 完成证据

- 类型与校验：`npm test` 26/26，覆盖旧单兼容、最多 20 项和数量边界。
- 前端：`CI=1 npx playwright test e2e/inquiry.spec.ts --project=chromium` 12/12；覆盖单款、多款、刷新恢复、改数量、重复合并、删除、清空、幂等重放、错误响应和感谢页回执。
- 后端：`python3 scripts/verify-inquiry-backend.py` 80/80；覆盖 CPT 事务、幂等、outbox、多项 `inquiry_items_json` 快照、后台详情、HTML/纯文本邮件一致性和清理。
- 工程门禁：`npm run lint`、`npm run typecheck`、`npm run build`、PHP 语法检查通过。

## 尚未纳入本 Issue 的后续门槛

- WordPress 目前按约定保存不可变 JSON 快照；只有出现独立 SKU 查询、统计或高并发需求时，才评估 `fh_inquiry_item` 明细表。
- 公开集合由 Next.js 服务端复核；直接调用 WordPress 写接口仍需专用服务密钥，不能将其当作匿名产品规格校验器。

## 暂不做

不引入在线购物车、价格计算、订单支付、客户账号或 WooCommerce；这是询盘清单，不是交易购物车。
