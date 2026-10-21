import assert from "node:assert/strict";
import test from "node:test";
import {
  automationTrap,
  hashedRateLimitKey,
  originAllowed,
  rateLimit,
  refundRateLimit,
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

test("同一邮箱十分钟内前 10 次放行，第 11 次被限流", () => {
  // 额度从 3 放宽到 10：3 次会让「一个真实买家点一下、网络抖几次重试」把
  // 自己封掉（重放也计费）。断言跟着默认值走，改默认值时这里要一起改。
  resetRateLimitsForTest();
  const request = new Request("http://localhost/api/inquiries", {
    headers: { "x-real-ip": "192.0.2.11" },
  });
  const now = Date.now();
  for (let i = 0; i < 10; i += 1) {
    assert.equal(
      rateLimit(request, "buyer@example.com", now),
      null,
      `第 ${i + 1} 次应当放行`,
    );
  }
  assert.ok(
    (rateLimit(request, "buyer@example.com", now) ?? 0) > 0,
    "第 11 次应当被限流",
  );
});

test("额度可用环境变量覆盖，非法值回落到默认", () => {
  const previous = process.env.INQUIRY_RATE_LIMIT_EMAIL;
  const request = new Request("http://localhost/api/inquiries", {
    headers: { "x-real-ip": "192.0.2.12" },
  });
  const now = Date.now();
  try {
    // 覆盖为 1 → 第 2 次就该被拦
    process.env.INQUIRY_RATE_LIMIT_EMAIL = "1";
    resetRateLimitsForTest();
    assert.equal(rateLimit(request, "cap@example.com", now), null);
    assert.ok((rateLimit(request, "cap@example.com", now) ?? 0) > 0);

    // 非法值（0 / 非数字）必须回落到默认 10，而不是变成「无限」
    for (const bad of ["0", "-5", "abc", ""]) {
      process.env.INQUIRY_RATE_LIMIT_EMAIL = bad;
      resetRateLimitsForTest();
      for (let i = 0; i < 10; i += 1) {
        assert.equal(
          rateLimit(request, "bad@example.com", now),
          null,
          `非法值 ${JSON.stringify(bad)} 应回落到默认额度，第 ${i + 1} 次仍放行`,
        );
      }
      assert.ok(
        (rateLimit(request, "bad@example.com", now) ?? 0) > 0,
        `非法值 ${JSON.stringify(bad)} 不应把防护变成无限`,
      );
    }
  } finally {
    if (previous === undefined) delete process.env.INQUIRY_RATE_LIMIT_EMAIL;
    else process.env.INQUIRY_RATE_LIMIT_EMAIL = previous;
    resetRateLimitsForTest();
  }
});

test("幂等重放退还额度：15 次重试只消耗 1 次", () => {
  resetRateLimitsForTest();
  const request = new Request("http://localhost/api/inquiries", {
    headers: { "x-real-ip": "192.0.2.13" },
  });
  const email = "retry@example.com";
  const now = Date.now();

  // 首次提交：计 1 次
  assert.equal(rateLimit(request, email, now), null);
  // 14 次重放：每次计 1 次后立刻退还
  for (let i = 0; i < 14; i += 1) {
    assert.equal(
      rateLimit(request, email, now),
      null,
      `重放第 ${i + 1} 次不应被限流`,
    );
    refundRateLimit(request, email, now);
  }

  // 额度只被首次提交消耗 → 还剩 9 次可用
  for (let i = 0; i < 9; i += 1) {
    assert.equal(rateLimit(request, email, now), null, `剩余额度第 ${i + 1} 次应放行`);
  }
  assert.ok((rateLimit(request, email, now) ?? 0) > 0, "额度耗尽后应被限流");
});

test("退款只减 1，绝不重置计数（不能变成绕过限流的入口）", () => {
  resetRateLimitsForTest();
  const request = new Request("http://localhost/api/inquiries", {
    headers: { "x-real-ip": "192.0.2.14" },
  });
  const email = "abuse@example.com";
  const now = Date.now();

  // 先耗掉全部 10 次额度
  for (let i = 0; i < 10; i += 1) {
    assert.equal(rateLimit(request, email, now), null);
  }
  assert.ok((rateLimit(request, email, now) ?? 0) > 0, "应当已被限流");

  // 退款 1 次只买回 1 次，买不回一整桶
  refundRateLimit(request, email, now);
  assert.equal(rateLimit(request, email, now), null, "退款 1 次后应放行 1 次");
  assert.ok((rateLimit(request, email, now) ?? 0) > 0, "随后仍应被限流，没有被重置");

  // 真正要守的边界：**重放不能让人创建超过额度的新询盘**。
  //
  // 关键前提：退款只在 `saved.replayed === true` 时发生，而被限流的请求在
  // route.ts:90 就 429 返回了、根本走不到 save —— 所以**被拦的请求永远拿不到
  // 退款**。这条断言就是按这个真实顺序建模的。
  resetRateLimitsForTest();
  const fresh = new Request("http://localhost/api/inquiries", {
    headers: { "x-real-ip": "192.0.2.15" },
  });
  const newcomer = "newcomer@example.com";
  let created = 0;
  for (let i = 0; i < 40; i += 1) {
    const retryAfter = rateLimit(fresh, newcomer, now);
    if (retryAfter !== null) continue; // 被拦：429 直接返回，拿不到退款
    // 放行了才可能走到 save。交替模拟「新提交」与「重放」。
    if (i % 2 === 0) {
      created += 1; // 新幂等键 → 不退款 → 实付 1 次
    } else {
      refundRateLimit(fresh, newcomer, now); // 重放 → 退掉刚付的 1 次
    }
  }
  assert.equal(created, 10, `新提交总数应恰好等于额度 10，实际 ${created}`);
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
