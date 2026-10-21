"use client";

import { useEffect, useState } from "react";

export const INQUIRY_CART_STORAGE_KEY = "fenghuai-inquiry-cart-v1";
export const INQUIRY_CART_EVENT = "fenghuai:inquiry-cart";
export const MAX_INQUIRY_ITEMS = 20;

export type InquiryCartItem = {
  model: string;
  productionCode: string;
  slug: string;
  size: string;
  pcd: string;
  offset: number | null;
  centerBore: number | null;
  quantity: number;
};

/**
 * 询盘数量没有业务上限；这里只排除浏览器无法精确表示的数值和非正整数。
 * 无效的旧 localStorage 数据回落到 1，避免静默提交被四舍五入的数量。
 */
export function normalizeInquiryQuantity(value: number): number {
  return Number.isSafeInteger(value) && value >= 1 ? value : 1;
}

function normalizeItem(value: unknown): InquiryCartItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const model = typeof raw.model === "string" ? raw.model.trim() : "";
  const productionCode = typeof raw.productionCode === "string" ? raw.productionCode.trim() : "";
  const slug = typeof raw.slug === "string" ? raw.slug.trim().toLowerCase() : "";
  if (!model || !productionCode || !slug) return null;
  return {
    model,
    productionCode,
    slug,
    size: typeof raw.size === "string" ? raw.size : "",
    pcd: typeof raw.pcd === "string" ? raw.pcd : "",
    offset: typeof raw.offset === "number" && Number.isFinite(raw.offset) ? raw.offset : null,
    centerBore:
      typeof raw.centerBore === "number" && Number.isFinite(raw.centerBore) ? raw.centerBore : null,
    quantity: normalizeInquiryQuantity(typeof raw.quantity === "number" ? raw.quantity : 1),
  };
}

function normalizeItems(value: unknown): InquiryCartItem[] {
  if (!Array.isArray(value)) return [];
  const merged = new Map<string, InquiryCartItem>();
  for (const candidate of value) {
    const item = normalizeItem(candidate);
    if (!item) continue;
    const key = `${item.model.toLowerCase()}::${item.productionCode.toLowerCase()}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = normalizeInquiryQuantity(existing.quantity + item.quantity);
    } else {
      merged.set(key, item);
    }
    if (merged.size >= MAX_INQUIRY_ITEMS) break;
  }
  return [...merged.values()];
}

export function readInquiryCart(): InquiryCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return normalizeItems(JSON.parse(window.localStorage.getItem(INQUIRY_CART_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function emitCart(items: InquiryCartItem[]): void {
  window.localStorage.setItem(INQUIRY_CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(INQUIRY_CART_EVENT));
}

export function addInquiryCartItem(item: Omit<InquiryCartItem, "quantity">, quantity = 1): void {
  const items = readInquiryCart();
  const key = `${item.model.toLowerCase()}::${item.productionCode.toLowerCase()}`;
  const existing = items.find(
    (candidate) => `${candidate.model.toLowerCase()}::${candidate.productionCode.toLowerCase()}` === key,
  );
  if (existing) {
    existing.quantity = normalizeInquiryQuantity(existing.quantity + quantity);
  } else if (items.length < MAX_INQUIRY_ITEMS) {
    items.push({ ...item, quantity: normalizeInquiryQuantity(quantity) });
  }
  emitCart(items.slice(0, MAX_INQUIRY_ITEMS));
}

export function setInquiryCartQuantity(productionCode: string, quantity: number): void {
  const items = readInquiryCart().map((item) =>
    item.productionCode === productionCode
      ? { ...item, quantity: normalizeInquiryQuantity(quantity) }
      : item,
  );
  emitCart(items);
}

export function removeInquiryCartItem(productionCode: string): void {
  emitCart(readInquiryCart().filter((item) => item.productionCode !== productionCode));
}

export function clearInquiryCart(): void {
  emitCart([]);
}

/** 询价页和目录按钮共享的持久化清单订阅。 */
export function useInquiryCart(): InquiryCartItem[] {
  const [items, setItems] = useState<InquiryCartItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(readInquiryCart());
    sync();
    window.addEventListener(INQUIRY_CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(INQUIRY_CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}
