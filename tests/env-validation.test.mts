import assert from "node:assert/strict";
import test from "node:test";
import {
  formatEnvReport,
  validateEnv,
} from "../src/lib/env/validate.ts";

const COMPLETE = {
  NEXT_PUBLIC_APP_URL: "https://example.com",
  WP_MODE: "live",
  WP_INQUIRY_SERVICE_KEY: "key",
  WP_REVALIDATE_SECRET: "secret",
  WP_PREVIEW_SECRET: "preview",
  INQUIRY_RECEIPT_SECRET: "receipt",
  INQUIRY_TO: "sales@example.com",
};

test("配置齐全时无错误", () => {
  const result = validateEnv(COMPLETE, { production: true });
  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test("生产环境缺 NEXT_PUBLIC_APP_URL 判为错误", () => {
  const result = validateEnv({ ...COMPLETE, NEXT_PUBLIC_APP_URL: "" }, { production: true });
  assert.equal(result.ok, false);
  const issue = result.issues.find((i) => i.key === "NEXT_PUBLIC_APP_URL");
  assert.ok(issue);
  assert.equal(issue.severity, "error");
  // The impact must name the real symptom, not a generic "invalid config".
  assert.match(issue.impact, /sitemap/);
});

test("非法的 NEXT_PUBLIC_APP_URL 判为错误", () => {
  const result = validateEnv(
    { ...COMPLETE, NEXT_PUBLIC_APP_URL: "not a url" },
    { production: true },
  );
  const issue = result.issues.find((i) => i.key === "NEXT_PUBLIC_APP_URL");
  assert.ok(issue);
  assert.equal(issue.severity, "error");
});

test("生产必需项在开发环境降级为警告（本地无密钥是合理的）", () => {
  const result = validateEnv(
    { ...COMPLETE, WP_INQUIRY_SERVICE_KEY: "", WP_REVALIDATE_SECRET: "" },
    { production: false },
  );
  assert.equal(result.ok, true, "开发环境不应因此判为不可用");
  for (const key of ["WP_INQUIRY_SERVICE_KEY", "WP_REVALIDATE_SECRET"]) {
    const issue = result.issues.find((i) => i.key === key);
    assert.ok(issue, `${key} 应有提示`);
    assert.equal(issue.severity, "warn");
  }
});

test("仅生产必须的项在开发环境缺省不算错误", () => {
  const result = validateEnv(
    { NEXT_PUBLIC_APP_URL: "http://localhost:3000", WP_MODE: "mock" },
    { production: false },
  );
  assert.equal(result.ok, true);
});

test("WP_MODE 缺失是关键错误（内容来源不确定）", () => {
  const result = validateEnv({ ...COMPLETE, WP_MODE: "" }, { production: true });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((i) => i.key === "WP_MODE" && i.severity === "error"));
});

test("缺 INQUIRY_TO 只是警告：询盘仍会入库", () => {
  const result = validateEnv({ ...COMPLETE, INQUIRY_TO: "" }, { production: true });
  assert.equal(result.ok, true, "丢通知不该让启动判定为不可用");
  const issue = result.issues.find((i) => i.key === "INQUIRY_TO");
  assert.ok(issue);
  assert.equal(issue.severity, "warn");
  assert.match(issue.impact, /入库/);
});

test("报告只含变量名，绝不含变量值", () => {
  const secret = "super-secret-value-should-never-appear";
  const result = validateEnv(
    { ...COMPLETE, WP_INQUIRY_SERVICE_KEY: secret, NEXT_PUBLIC_APP_URL: "" },
    { production: true },
  );
  const report = formatEnvReport(result);
  assert.match(report, /NEXT_PUBLIC_APP_URL/);
  assert.ok(!report.includes(secret), "报告中不得出现任何变量值");
  assert.ok(!report.includes("example.com"), "报告中不得出现任何变量值");
});

test("空字符串与纯空白同样视为未配置", () => {
  const result = validateEnv({ ...COMPLETE, WP_MODE: "   " }, { production: true });
  assert.ok(result.issues.some((i) => i.key === "WP_MODE"));
});
