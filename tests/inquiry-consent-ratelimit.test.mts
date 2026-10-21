import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const FORM = read("src/components/inquiry-form.tsx");
const PHP = read("local-wp/mu-plugins/fenghuai-inquiries.php");

test("privacyConsent 已按产品决策移除，未复活", () => {
  // 10-12 的 4360b01「取消询盘同意门槛」删掉了勾选框，但字段与载荷残留至今，
  // 且我 T-36 加的 consentedAt 依赖它 → 永远不触发的死分支。本轮彻底移除。
  // 这条断言防的是「有人又把门槛加回来」——那是一个需要重新决策的产品变更。
  assert.ok(
    !/privacyConsent\s*:/.test(FORM),
    "表单不应再发送 privacyConsent",
  );
  assert.ok(
    !/consentedAt/.test(FORM),
    "consentedAt 依赖已移除的 privacyConsent，不应残留",
  );
});

test("WP 侧仍把同意字段当可选（老调用方兼容）", () => {
  assert.match(PHP, /\$consentedAt\s*=\s*\$text\('consentedAt',\s*40,\s*false\)/);
});

test("WP 侧限流存在且绑在权限校验上", () => {
  assert.match(PHP, /function fh_inquiry_rate_limit_exceeded/);
  assert.match(
    PHP,
    /fh_inquiry_rate_limit_exceeded\(\$ip\)[\s\S]{0,200}fh_inquiry_rate_limited/,
    "超限必须返回明确的 rate_limited 错误",
  );
});

test("限流不信任 X-Forwarded-For（调用方可伪造）", () => {
  assert.match(PHP, /REMOTE_ADDR/);
  assert.ok(
    !/HTTP_X_FORWARDED_FOR/.test(PHP),
    "信任 XFF 会让攻击者每次换一个桶，等于没有限流",
  );
});

test("计数以 IP 散列存储，不落明文地址", () => {
  assert.match(PHP, /hash\('sha256', \$ip\)/);
  assert.match(PHP, /'fh_rl_'/);
});
