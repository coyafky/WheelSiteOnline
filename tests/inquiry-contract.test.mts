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
  inquirySubmissionSchema,
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

test("多款轮毂清单最多 20 项，旧单产品载荷仍兼容", () => {
  const legacy = validate(validBody, "privacy-2026-10");
  assert.equal(legacy.ok, true);
  if (legacy.ok) assert.equal(legacy.input.items, undefined);

  const items = Array.from({ length: 2 }, (_, index) => ({
    model: `FH-${index + 1}`,
    productionCode: `FH-${index + 1}-001`,
    quantity: index + 1,
  }));
  const accepted = validate({ ...validBody, items }, "privacy-2026-10");
  assert.equal(accepted.ok, true);
  if (accepted.ok) {
    assert.deepEqual(accepted.input.items?.map((item) => item.quantity), [1, 2]);
  }

  const tooMany = inquirySubmissionSchema.safeParse({
    ...validBody,
    items: Array.from({ length: 21 }, (_, index) => ({
      model: `FH-${index}`,
      productionCode: `FH-${index}-001`,
      quantity: 1,
    })),
  });
  assert.equal(tooMany.success, false);
});

test("轮毂配置数量接受任意安全正整数，不设置业务上限", () => {
  const result = inquirySubmissionSchema.safeParse({
    ...validBody,
    items: [
      { model: "FH-001", productionCode: "FH001-001", quantity: 5_000 },
      { model: "FH-002", productionCode: "FH002-001", quantity: 1_000_000 },
    ],
  });
  assert.equal(result.success, true);
});

test("轮毂配置数量拒绝零、负数、小数和不安全整数", () => {
  for (const quantity of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    const result = inquirySubmissionSchema.safeParse({
      ...validBody,
      items: [{ model: "FH-001", productionCode: "FH001-001", quantity }],
    });
    assert.equal(result.success, false, `quantity=${quantity} 应被拒绝`);
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

test("不需要隐私勾选字段也可提交询盘", () => {
  const result = validate(
    { ...validBody, privacyConsent: undefined, privacyVersion: undefined },
    "privacy-2026-10",
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.input.privacyVersion, "");
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
  const localDevPort = new Request("http://localhost/api/inquiries", {
    headers: { origin: "http://127.0.0.1:3100" },
  });
  assert.equal(originAllowed(allowed), true);
  assert.equal(originAllowed(rejected), false);
  assert.equal(originAllowed(localDevPort), true);
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
