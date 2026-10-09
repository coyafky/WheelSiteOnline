import { expect, type Page } from "@playwright/test";

export async function completeInquiryForm(
  page: Page,
  options: { productLine?: string; email?: string } = {},
) {
  await page.getByLabel("Business").check();
  const productLine = page.getByLabel("Product line");
  if (!(await productLine.inputValue())) {
    await productLine.selectOption(options.productLine ?? "wheels");
  }
  await page
    .getByLabel("Describe the part, product or result you need")
    .fill("Please review this test project with the recorded configuration.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "How should we reply?" })).toBeFocused();
  await page.getByLabel("Name").fill("Browser Test");
  await page.getByLabel("Email").fill(options.email ?? "browser-test@example.com");
  await page.getByLabel("Country / market code").fill("US");
  await page.getByLabel("Company").fill("Fenghuai E2E");
  await page
    .getByLabel(/I agree that Fenghuai may use the information provided/)
    .check();
}

export async function mockInquiryResponse(
  page: Page,
  status: number,
  body: Record<string, unknown>,
  onBody?: (body: Record<string, unknown>) => void,
) {
  await page.route("**/api/inquiries", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    onBody?.(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
}
