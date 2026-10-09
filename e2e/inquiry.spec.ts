import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { completeInquiryForm, mockInquiryResponse } from "./helpers/inquiry";

const contexts = [
  {
    name: "无来源",
    path: "/request-a-quote",
    expected: {},
  },
  {
    name: "产品线来源",
    path: "/request-a-quote?product_line=ev-components&intent=project_assessment",
    expected: { productLine: "ev-components", intent: "project_assessment" },
  },
  {
    name: "轮毂型号来源",
    path: "/request-a-quote?product_line=wheels&model=DM902&intent=wheel_model_quote",
    expected: { productLine: "wheels", model: "DM902", intent: "wheel_model_quote" },
  },
  {
    name: "已批准 variant 来源",
    path:
      "/request-a-quote?product_line=wheels&model=DM902&code=DM902177501W&size=17*7.5&pcd=4*100&et=32&cb=73.1&finish=High%20Gloss%20Black",
    expected: {
      productLine: "wheels",
      model: "DM902",
      productionCode: "DM902177501W",
      selectedSpec: {
        size: "17*7.5",
        pcd: "4*100",
        offset: "32",
        centerBore: "73.1",
        finish: "High Gloss Black",
      },
    },
  },
] as const;

for (const entry of contexts) {
  test(`提交携带${entry.name}上下文`, async ({ page }) => {
    let requestBody: Record<string, unknown> | undefined;
    await mockInquiryResponse(
      page,
      201,
      { ok: true, id: "INQ-E2E-0001", delivered: true, receiptToken: null },
      (body) => {
        requestBody = body;
      },
    );
    await page.goto(entry.path);
    await completeInquiryForm(page);
    await page.getByRole("button", { name: "Submit project enquiry" }).click();
    await expect(page.getByText("INQ-E2E-0001")).toBeVisible();

    expect(requestBody).toBeDefined();
    const context = requestBody?.context as Record<string, unknown>;
    expect(context.pageUrl).toContain(entry.path.split("?")[0]);
    for (const [key, value] of Object.entries(entry.expected)) {
      expect(context[key]).toEqual(value);
    }
  });
}

test("200 幂等重放仍视为成功", async ({ page }) => {
  await mockInquiryResponse(page, 200, {
    ok: true,
    id: "INQ-E2E-REPLAY",
    delivered: true,
    receiptToken: null,
  });
  await page.goto("/request-a-quote");
  await completeInquiryForm(page);
  await page.getByRole("button", { name: "Submit project enquiry" }).click();
  await expect(page.getByText("INQ-E2E-REPLAY")).toBeVisible();
});

test("422 字段错误聚焦服务端指出的第一个字段", async ({ page }) => {
  await mockInquiryResponse(page, 422, {
    ok: false,
    error: "Validation failed.",
    fieldErrors: { email: "This address cannot receive replies." },
  });
  await page.goto("/request-a-quote");
  await completeInquiryForm(page);
  await page.getByRole("button", { name: "Submit project enquiry" }).click();
  await expect(page.getByLabel("Email")).toBeFocused();
  await expect(page.getByText("This address cannot receive replies.")).toBeVisible();
});

test("429 保留表单并显示限流说明", async ({ page }) => {
  await mockInquiryResponse(page, 429, { ok: false, error: "Too many submissions." });
  await page.goto("/request-a-quote");
  await completeInquiryForm(page);
  await page.getByRole("button", { name: "Submit project enquiry" }).click();
  await expect(page.locator('form [role="alert"]')).toContainText("wait a few minutes");
  await expect(page.getByLabel("Email")).toHaveValue("browser-test@example.com");
});

test("数据库失败不进入成功状态且保留输入", async ({ page }) => {
  await mockInquiryResponse(page, 503, {
    ok: false,
    error: "The inquiry could not be saved. Please try again.",
  });
  await page.goto("/request-a-quote");
  await completeInquiryForm(page);
  await page.getByRole("button", { name: "Submit project enquiry" }).click();
  await expect(page.locator('form [role="alert"]')).toBeVisible();
  await expect(page.getByText("INQ-E2E-DB-FAIL")).toHaveCount(0);
  await expect(page.getByLabel("Email")).toHaveValue("browser-test@example.com");
});

test("数据已存但邮件失败仍显示询盘号与待投递说明", async ({ page }) => {
  await mockInquiryResponse(page, 201, {
    ok: true,
    id: "INQ-E2E-MAIL-FAIL",
    delivered: false,
    receiptToken: null,
  });
  await page.goto("/request-a-quote");
  await completeInquiryForm(page);
  await page.getByRole("button", { name: "Submit project enquiry" }).click();
  await expect(page.getByText("INQ-E2E-MAIL-FAIL")).toBeVisible();
  await expect(page.getByText(/notification email is still pending/i)).toBeVisible();
});

function receiptFor(id: string, issuedAt: number): string {
  const digest = createHmac("sha256", "e2e-receipt-secret")
    .update(`${id}.${issuedAt}`)
    .digest("base64url");
  return `${issuedAt}.${digest}`;
}

test("感谢页只接受有效回执", async ({ page }) => {
  const id = "INQ-E2E-RECEIPT";
  const issuedAt = Math.floor(Date.now() / 1000);
  await page.goto(`/thank-you?id=${id}&receipt=${receiptFor(id, issuedAt)}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/received|recorded/i);
  await expect(page.getByText(id)).toBeVisible();

  await page.goto(`/thank-you?id=${id}&receipt=${receiptFor("INQ-OTHER", issuedAt)}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/cannot confirm/i);
  await expect(page.getByText(id)).toHaveCount(0);
});
