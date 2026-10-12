# 多款轮毂询价清单实施报告

日期：2026-10-10

## 结论

阶段 2 已完成。客户可以从目录或轮毂详情页选择多款已批准配置，在一次两步询盘中分别填写数量；页面刷新后清单仍保留，提交成功后清空。服务端会重新核验每个 `model + productionCode`，不会把客户端伪造的尺寸、PCD、ET 或中心孔写入询盘。

## 数据链路

1. 浏览器 `localStorage` 保存最多 20 项清单，仅作暂存和恢复用途。
2. Next.js `/api/inquiries` 使用 Zod 校验数量与数组边界，逐项从公开轮毂集合解析 canonical 规格。
3. WordPress `POST /fh/v1/inquiries` 在事务中创建 `fh_inquiry` CPT，并写入 `inquiry_items_json` 不可变快照。
4. 同一快照生成 HTML 与纯文本 QQ SMTP 通知，后台详情以只读清单展示；幂等键覆盖整次提交。

## 验证结果

- `npm run lint`：通过
- `npm run typecheck`：通过
- `npm test`：26/26
- `npm run build`：通过，191 个页面生成
- `CI=1 npx playwright test e2e/inquiry.spec.ts --project=chromium`：12/12
- `python3 scripts/verify-inquiry-backend.py`：80/80
- `docker exec fh-wp php -l .../fenghuai-inquiries.php`：通过

## 明确边界

当前采用轻量 CRM 方案：CPT 保存主询盘，JSON 保存历史明细快照；暂不引入价格、订单、支付、客户账号或独立明细表。若后续需要按 SKU 独立统计、排序或高并发检索，再按 DEC-074 评估 `fh_inquiry_item` 迁移。
