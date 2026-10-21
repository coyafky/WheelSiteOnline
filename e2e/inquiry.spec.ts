import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { completeInquiryForm, mockInquiryResponse } from "./helpers/inquiry";

test("询盘页使用 Astryx 面包屑与表单组件", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/request-a-quote");

  const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumbs).toHaveClass(/astryx-breadcrumbs/);
  await expect(breadcrumbs.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  await expect(breadcrumbs.getByText("Request a Quote")).toHaveAttribute("aria-current", "page");

  await expect(page.locator(".astryx-radio-list")).toHaveCount(1);
  await expect(page.locator(".astryx-selector")).toHaveCount(1);
  await expect(page.locator(".astryx-text-area")).toHaveCount(1);
  await expect(page.locator('.astryx-button[data-variant="primary"]')).toHaveCount(1);
  expect(consoleErrors).toEqual([]);
});

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
      { ok: true, id: "INQ-E2E-0001", persisted: true, delivered: true, receiptToken: null },
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
    persisted: true,
    delivered: true,
    receiptToken: null,
  });
  await page.goto("/request-a-quote");
  await completeInquiryForm(page);
  await page.getByRole("button", { name: "Submit project enquiry" }).click();
  await expect(page.getByText("INQ-E2E-REPLAY")).toBeVisible();
});

test("多款轮毂清单可在刷新后恢复并按项提交数量", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "fenghuai-inquiry-cart-v1",
      JSON.stringify([
        {
          model: "DM902",
          productionCode: "DM902177501W",
          slug: "dm902",
          size: "17*7.5",
          pcd: "4x100",
          offset: 32,
          centerBore: 73.1,
          quantity: 2,
        },
        {
          model: "FH-002",
          productionCode: "FH002-001",
          slug: "fh-002",
          size: "19*9",
          pcd: "5x114.3",
          offset: 35,
          centerBore: 67.1,
          quantity: 1,
        },
      ]),
    );
  });
  let requestBody: Record<string, unknown> | undefined;
  await mockInquiryResponse(
    page,
    201,
    { ok: true, id: "INQ-E2E-MULTI", persisted: true, delivered: true, receiptToken: null },
    (body) => {
      requestBody = body;
    },
  );
  await page.goto("/request-a-quote?product_line=wheels");
  await expect(page.getByText("2 of 20 configurations selected")).toBeVisible();
  await expect(page.getByText(/^DM902177501W ·/)).toBeVisible();
  await expect(page.getByText(/^FH002-001 ·/)).toBeVisible();

  await page.reload();
  await expect(page.getByText("2 of 20 configurations selected")).toBeVisible();
  await page.getByRole("spinbutton", { name: "Quantity for DM902 DM902177501W" }).fill("4");
  await completeInquiryForm(page);
  await page.getByRole("button", { name: "Submit project enquiry" }).click();
  await expect(page.getByText("INQ-E2E-MULTI")).toBeVisible();

  const items = requestBody?.items as Array<Record<string, unknown>> | undefined;
  expect(items).toHaveLength(2);
  expect(items?.map((item) => [item.model, item.productionCode, item.quantity])).toEqual([
    ["DM902", "DM902177501W", 4],
    ["FH-002", "FH002-001", 1],
  ]);
});

test("多款轮毂清单可删除和清空", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "fenghuai-inquiry-cart-v1",
      JSON.stringify([{ model: "FH-002", productionCode: "FH002-001", slug: "fh-002", quantity: 1 }]),
    );
  });
  await page.goto("/request-a-quote?product_line=wheels");
  await expect(page.getByText(/^FH002-001 ·/)).toBeVisible();
  await page.getByRole("button", { name: "Clear list" }).click();
  await expect(page.getByText("Wheel enquiry list")).toHaveCount(0);

  await page.evaluate(() => {
    localStorage.setItem(
      "fenghuai-inquiry-cart-v1",
      JSON.stringify([
        { model: "FH-002", productionCode: "FH002-001", slug: "fh-002", quantity: 2 },
        { model: "FH-002", productionCode: "FH002-001", slug: "fh-002", quantity: 3 },
        { model: "DM902", productionCode: "DM902177501W", slug: "dm902", quantity: 5000 },
      ]),
    );
    window.dispatchEvent(new CustomEvent("fenghuai:inquiry-cart"));
  });
  await expect(page.getByText("Wheel enquiry list")).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Quantity for FH-002 FH002-001" })).toHaveValue("5");
  await expect(page.getByRole("spinbutton", { name: "Quantity for DM902 DM902177501W" })).toHaveValue("5000");

  await page.getByRole("button", { name: "Remove FH-002 FH002-001" }).click();
  await expect(page.getByRole("spinbutton", { name: "Quantity for DM902 DM902177501W" })).toBeVisible();
  await page.getByRole("button", { name: "Clear list" }).click();
  await expect(page.getByText("Wheel enquiry list")).toHaveCount(0);
});

test("详情页直接询盘只提交当前配置并保留总询盘清单", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "fenghuai-inquiry-cart-v1",
      JSON.stringify([
        {
          model: "FH-002",
          productionCode: "FH002-001",
          slug: "fh-002",
          size: "19*9",
          pcd: "5x114.3",
          offset: 35,
          centerBore: 67.1,
          quantity: 3,
        },
      ]),
    );
  });

  let requestBody: Record<string, unknown> | undefined;
  await mockInquiryResponse(
    page,
    201,
    { ok: true, id: "INQ-E2E-DIRECT", persisted: true, delivered: true, receiptToken: null },
    (body) => {
      requestBody = body;
    },
  );

  await page.goto("/products/wheels/DM902?variant=DM902177501W");
  const trigger = page.getByRole("button", { name: "Request this configuration" });
  await expect(trigger).toBeVisible();
  await expect(page.getByRole("form", { name: "Project enquiry form" })).toHaveCount(0);

  await expect(page).toHaveURL(/model=DM902/);
  const detailUrl = page.url();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Request this configuration" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(detailUrl);
  await expect(dialog.getByText("Wheel enquiry list")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await dialog.getByRole("spinbutton", { name: "Quantity for this configuration" }).fill("5000");
  await completeInquiryForm(page);
  await dialog.getByRole("button", { name: "Request this configuration" }).click();
  await expect(dialog.getByText("INQ-E2E-DIRECT")).toBeVisible();

  expect(requestBody?.items).toEqual([
    { model: "DM902", productionCode: "DM902177501W", quantity: 5000 },
  ]);
  expect(requestBody?.context).toMatchObject({
    productLine: "wheels",
    model: "DM902",
    productionCode: "DM902177501W",
    intent: "wheel_model_quote",
  });
  const storedCart = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("fenghuai-inquiry-cart-v1") ?? "[]"),
  );
  expect(storedCart).toHaveLength(1);
  expect(storedCart[0]).toMatchObject({ productionCode: "FH002-001", quantity: 3 });
});

test("加入总询盘后用 Toast 确认，清单在询盘页保留且去重", async ({ page }) => {
  await page.goto("/products/wheels/DM902?variant=DM902177501W");

  const addButton = page.getByRole("button", { name: "Add to total enquiry" });
  await addButton.click();

  await expect(page.locator(".astryx-toast")).toContainText(
    "DM902 / DM902177501W added to your total enquiry.",
  );
  await addButton.click();
  await expect(page.locator(".astryx-toast")).toContainText("Quantity is now 2.");
  await page.goto("/request-a-quote");
  await expect(page.getByRole("heading", { name: "1 of 20 configurations selected" })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Quantity for DM902 DM902177501W" })).toHaveValue("2");
});

test("320x568 直接询盘成功后回到弹窗顶部", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await mockInquiryResponse(page, 201, {
    ok: true,
    id: "INQ-E2E-MOBILE-SUCCESS",
    persisted: true,
    delivered: true,
    receiptToken: null,
  });
  await page.goto("/products/wheels/DM902?variant=DM902177501W");
  await page.getByRole("button", { name: "Request this configuration" }).click();

  const dialog = page.getByRole("dialog", { name: "Request this configuration" });
  await completeInquiryForm(page);
  await dialog.getByRole("button", { name: "Request this configuration" }).click();
  await expect(dialog.getByText("INQ-E2E-MOBILE-SUCCESS")).toBeVisible();
  await expect(dialog.locator(".astryx-layout-content")).toHaveJSProperty("scrollTop", 0);
  await expect(dialog.getByRole("heading", { name: "Request this configuration" })).toBeInViewport();
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
  await expect(
    page.getByRole("form", { name: "Project enquiry form" }).getByText(
      "This address cannot receive replies.",
      { exact: true },
    ),
  ).toBeVisible();
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

test("未写入 WordPress 时不得把内存询盘显示为成功", async ({ page }) => {
  await page.goto("/request-a-quote");
  await completeInquiryForm(page, { email: "persistence-gate@example.com" });
  await page.getByRole("button", { name: "Submit project enquiry" }).click();

  await expect(page.locator('form [role="alert"]')).toContainText("not sent");
  await expect(page.getByText(/^INQ-/)).toHaveCount(0);
  await expect(page.getByLabel("Email")).toHaveValue(
    "persistence-gate@example.com",
  );
});

test("前端拒绝 persisted false 的二百响应并保留输入", async ({ page }) => {
  await mockInquiryResponse(page, 201, {
    ok: true,
    id: "INQ-E2E-NOT-PERSISTED",
    persisted: false,
    delivered: false,
    receiptToken: null,
  });
  await page.goto("/request-a-quote");
  await completeInquiryForm(page, { email: "not-persisted@example.com" });
  await page.getByRole("button", { name: "Submit project enquiry" }).click();

  await expect(page.locator('form [role="alert"]')).toContainText("not sent");
  await expect(page.getByText("INQ-E2E-NOT-PERSISTED")).toHaveCount(0);
  await expect(page.getByLabel("Email")).toHaveValue("not-persisted@example.com");
});

test("数据已存但邮件失败仍显示询盘号与待投递说明", async ({ page }) => {
  await mockInquiryResponse(page, 201, {
    ok: true,
    id: "INQ-E2E-MAIL-FAIL",
    persisted: true,
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
