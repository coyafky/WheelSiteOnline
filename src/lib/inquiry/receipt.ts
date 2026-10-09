import { createHmac, timingSafeEqual } from "node:crypto";

const RECEIPT_TTL_SECONDS = 15 * 60;
const MAX_CLOCK_SKEW_SECONDS = 60;

function receiptSecret(): string | null {
  return (
    process.env.INQUIRY_RECEIPT_SECRET?.trim() ||
    process.env.WP_INQUIRY_SERVICE_KEY?.trim() ||
    null
  );
}

function signature(id: string, issuedAt: number, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${id}.${issuedAt}`)
    .digest("base64url");
}

/** 签发只证明“本应用刚收到持久化成功响应”，不携带任何客户信息。 */
export function issueInquiryReceipt(id: string, now = Date.now()): string | null {
  const secret = receiptSecret();
  if (!secret) return null;
  const issuedAt = Math.floor(now / 1000);
  return `${issuedAt}.${signature(id, issuedAt, secret)}`;
}

/** 感谢页只在短期回执有效时展示成功状态，直接拼 URL 不能伪造成功。 */
export function verifyInquiryReceipt(
  id: string,
  token: string,
  now = Date.now(),
): boolean {
  const secret = receiptSecret();
  const match = /^(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!secret || !match) return false;

  const issuedAt = Number(match[1]);
  const current = Math.floor(now / 1000);
  if (
    !Number.isSafeInteger(issuedAt) ||
    issuedAt > current + MAX_CLOCK_SKEW_SECONDS ||
    current - issuedAt > RECEIPT_TTL_SECONDS
  ) {
    return false;
  }

  const supplied = Buffer.from(match[2], "utf8");
  const expected = Buffer.from(signature(id, issuedAt, secret), "utf8");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
