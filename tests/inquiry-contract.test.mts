import assert from "node:assert/strict";
import test from "node:test";
import {
  automationTrap,
  hashedRateLimitKey,
  originAllowed,
  rateLimit,
  resetRateLimitsForTest,
} from "../src/lib/inquiry/guard.ts";
import { validate } from "../src/lib/inquiry/validate.ts";
import {
  issueInquiryReceipt,
  verifyInquiryReceipt,
} from "../src/lib/inquiry/receipt.ts";
import {
  inquiryStepOneSchema,
  inquiryStepTwoSchema,
  zodFieldErrors,
} from "../src/lib/inquiry/schema.ts";

const validBody = {
  customerType: "business",
  productLine: "wheels",
  message: "We need a prototype wheel review.",
  quantity: "prototype",
  inputsAvailable: ["2d-drawing"],
  name: "Test Buyer",
  email: "buyer@example.com",
  country: "DE",
  company: "Example GmbH",
  privacyConsent: true,
  privacyVersion: "privacy-2026-10",
};

test("四线询盘有效输入通过且不截断", () => {
  const result = validate(validBody, "privacy-2026-10");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.input.customerType, "business");
    assert.equal(result.input.productLine, "wheels");
    assert.equal(result.input.quantity, "prototype");
  }
});

test("两步表单共用 Zod 契约并规范化输入", () => {
  const firstStep = inquiryStepOneSchema.safeParse({
    customerType: "business",
    productLine: "wheels",
    message: "  We need a forged wheel quotation.  ",
    quantity: "  10 sets  ",
    inputsAvailable: ["2d-drawing"],
  });
  assert.equal(firstStep.success, true);
  if (firstStep.success) {
    assert.equal(firstStep.data.message, "We need a forged wheel quotation.");
    assert.equal(firstStep.data.quantity, "10 sets");
  }

  const secondStep = inquiryStepTwoSchema.safeParse({
    name: "  Test Buyer  ",
    email: " buyer@example.com ",
    country: " de ",
    company: " Example GmbH ",
    whatsapp: "",
    privacyConsent: true,
  });
  assert.equal(secondStep.success, true);
  if (secondStep.success) {
    assert.equal(secondStep.data.name, "Test Buyer");
    assert.equal(secondStep.data.country, "DE");
  }
});

test("Zod 步骤错误可稳定映射回具体表单字段", () => {
  const result = inquiryStepOneSchema.safeParse({
    customerType: "",
    productLine: "",
    message: "short",
    quantity: "x".repeat(41),
    inputsAvailable: [],
  });
  assert.equal(result.success, false);
  if (!result.success) {
    const errors = zodFieldErrors(result.error);
    assert.ok(errors.customerType);
    assert.ok(errors.productLine);
    assert.match(errors.message, /10/);
    assert.match(errors.quantity, /40/);
  }
});

test("超长字段显式返回错误而不是静默截断", () => {
  const result = validate({ ...validBody, message: "x".repeat(5001) }, "privacy-2026-10");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.fieldErrors.message, /5000/);
});

test("政策版本不匹配或未勾选时拒绝", () => {
  const result = validate(
    { ...validBody, privacyConsent: false, privacyVersion: "old" },
    "privacy-2026-10",
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.fieldErrors.privacyConsent);
});

test("蜜罐与时间陷阱阻止自动提交", () => {
  const now = Date.now();
  assert.ok(automationTrap({ website: "spam", formStartedAt: now - 5_000 }, now));
  assert.ok(automationTrap({ website: "", formStartedAt: now - 100 }, now));
  assert.equal(automationTrap({ website: "", formStartedAt: now - 5_000 }, now), null);
});

test("Origin 白名单拒绝跨站来源", () => {
  process.env.INQUIRY_ALLOWED_ORIGINS = "https://staging.example.com";
  const allowed = new Request("http://localhost/api/inquiries", {
    headers: { origin: "https://staging.example.com" },
  });
  const rejected = new Request("http://localhost/api/inquiries", {
    headers: { origin: "https://evil.example" },
  });
  assert.equal(originAllowed(allowed), true);
  assert.equal(originAllowed(rejected), false);
});

test("同一邮箱十分钟内第四次请求被限流", () => {
  resetRateLimitsForTest();
  const request = new Request("http://localhost/api/inquiries", {
    headers: { "x-real-ip": "192.0.2.10" },
  });
  const now = Date.now();
  assert.equal(rateLimit(request, "buyer@example.com", now), null);
  assert.equal(rateLimit(request, "buyer@example.com", now), null);
  assert.equal(rateLimit(request, "buyer@example.com", now), null);
  assert.ok((rateLimit(request, "buyer@example.com", now) ?? 0) > 0);
});

test("限流键只保存散列，不包含邮箱或 IP 原文", () => {
  const emailKey = hashedRateLimitKey("email", "Buyer@Example.com");
  const ipKey = hashedRateLimitKey("ip", "192.0.2.10");
  assert.match(emailKey, /^email:[a-f0-9]{64}$/);
  assert.match(ipKey, /^ip:[a-f0-9]{64}$/);
  assert.doesNotMatch(emailKey, /buyer|example\.com/i);
  assert.doesNotMatch(ipKey, /192\.0\.2\.10/);
});

test("感谢页回执只能验证原询盘号且十五分钟后失效", () => {
  process.env.INQUIRY_RECEIPT_SECRET = "test-receipt-secret-with-enough-entropy";
  const now = Date.parse("2026-10-08T09:00:00Z");
  const token = issueInquiryReceipt("INQ-20261008-0001", now);
  assert.ok(token);
  assert.equal(verifyInquiryReceipt("INQ-20261008-0001", token, now), true);
  assert.equal(verifyInquiryReceipt("INQ-20261008-9999", token, now), false);
  assert.equal(verifyInquiryReceipt("INQ-20261008-0001", token, now + 16 * 60_000), false);
});
