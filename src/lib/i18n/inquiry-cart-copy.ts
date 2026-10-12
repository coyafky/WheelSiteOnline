import { inquiryCartUi } from "@/content/inquiry-cart";
import type { Locale } from "./types";

type CartCopy = {
  addLabel: string;
  addedLabel: string;
  addedToast: (model: string, code: string) => string;
  quantityUpdatedToast: (model: string, code: string, quantity: number) => string;
  fullToast: string;
  listTitle: string;
  selectedCount: (count: number, max: number) => string;
  clear: string;
  selectedAria: string;
  quantity: string;
  quantityAria: (model: string, code: string) => string;
  remove: string;
  removeAria: (model: string, code: string) => string;
};

const cartCopy: Record<Locale, CartCopy> = {
  en: {
    ...inquiryCartUi,
    listTitle: "Wheel enquiry list",
    selectedCount: (count, max) => `${count} of ${max} configurations selected`,
    clear: "Clear list", selectedAria: "Selected wheel configurations", quantity: "Qty",
    quantityAria: (model, code) => `Quantity for ${model} ${code}`,
    remove: "Remove", removeAria: (model, code) => `Remove ${model} ${code}`,
  },
  zh: {
    addLabel: "加入询盘", addedLabel: "已加入",
    addedToast: (model, code) => `${model} / ${code} 已加入总询盘。`,
    quantityUpdatedToast: (model, code, quantity) => `${model} / ${code} 已在总询盘中，数量现为 ${quantity}。`,
    fullToast: "总询盘已包含 20 项配置。请移除一项后再添加。",
    listTitle: "轮毂询盘清单", selectedCount: (count, max) => `已选择 ${count} / ${max} 项配置`,
    clear: "清空清单", selectedAria: "已选轮毂配置", quantity: "数量",
    quantityAria: (model, code) => `${model} ${code} 的数量`,
    remove: "移除", removeAria: (model, code) => `移除 ${model} ${code}`,
  },
  es: {
    addLabel: "Añadir a la consulta", addedLabel: "Añadida",
    addedToast: (model, code) => `${model} / ${code} se añadió a la consulta general.`,
    quantityUpdatedToast: (model, code, quantity) => `${model} / ${code} ya está en la consulta general. Cantidad actual: ${quantity}.`,
    fullToast: "La consulta general ya contiene 20 configuraciones. Quite una antes de añadir otra.",
    listTitle: "Lista de consulta de llantas", selectedCount: (count, max) => `${count} de ${max} configuraciones seleccionadas`,
    clear: "Vaciar lista", selectedAria: "Configuraciones de llantas seleccionadas", quantity: "Cant.",
    quantityAria: (model, code) => `Cantidad de ${model} ${code}`,
    remove: "Quitar", removeAria: (model, code) => `Quitar ${model} ${code}`,
  },
  th: {
    addLabel: "เพิ่มในรายการสอบถาม", addedLabel: "เพิ่มแล้ว",
    addedToast: (model, code) => `เพิ่ม ${model} / ${code} ในรายการสอบถามรวมแล้ว`,
    quantityUpdatedToast: (model, code, quantity) => `${model} / ${code} อยู่ในรายการสอบถามรวมแล้ว จำนวนปัจจุบันคือ ${quantity}`,
    fullToast: "รายการสอบถามรวมมี 20 รูปแบบแล้ว โปรดนำออกหนึ่งรายการก่อนเพิ่มรายการใหม่",
    listTitle: "รายการสอบถามล้อ", selectedCount: (count, max) => `เลือกแล้ว ${count} จาก ${max} รูปแบบ`,
    clear: "ล้างรายการ", selectedAria: "รูปแบบล้อที่เลือก", quantity: "จำนวน",
    quantityAria: (model, code) => `จำนวนของ ${model} ${code}`,
    remove: "นำออก", removeAria: (model, code) => `นำ ${model} ${code} ออก`,
  },
};

export function inquiryCartCopyFor(locale: Locale): CartCopy {
  return cartCopy[locale];
}
