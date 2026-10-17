import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const FORM = read("src/components/inquiry-form.tsx");
const PHP = read("local-wp/mu-plugins/fenghuai-inquiries.php");

test("表单提交带上同意时刻，且仅在真正同意时发送", () => {
  // 没有 consentedAt，「何时同意」就没有证据；无条件发送则会在未勾选时
  // 留下一条没有对应同意的假时间戳。
  assert.match(
    FORM,
    /consentedAt:\s*values\.privacyConsent\s*\?\s*new Date\(\)\.toISOString\(\)\s*:\s*undefined/,
    "consentedAt 必须由 privacyConsent 守卫",
  );
});

test("同意时刻与填表开始时刻分开，不复用 formStartedAt", () => {
  assert.match(FORM, /const \[formStartedAt, setFormStartedAt\] = useState/);
  const consentedLine = FORM.split("\n").find((l) => l.includes("consentedAt:"));
  assert.ok(consentedLine);
  assert.ok(
    !consentedLine.includes("formStartedAt"),
    "formStartedAt 是防自动化用的挂载时间，不是同意时刻",
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
