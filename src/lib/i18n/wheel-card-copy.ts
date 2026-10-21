import type { Locale } from "./types";

type WheelCardCopy = {
  viewAria: (model: string) => string;
  imageAlt: (model: string) => string;
  processMissing: string;
  diameter: string;
  variantCount: (count: number) => string;
  finishCount: (count: number) => string;
  view: string;
  add: string;
  added: string;
};

const cardCopy: Record<Locale, WheelCardCopy> = {
  en: {
    viewAria: (model) => `${model} — view specifications`,
    imageAlt: (model) => `Fenghuai wheel model ${model}, front view`,
    processMissing: "Process not specified",
    diameter: "Diameter",
    variantCount: (count) => `${count} recorded ${count === 1 ? "configuration" : "configurations"}`,
    finishCount: (count) => `${count} ${count === 1 ? "finish" : "finishes"}`,
    view: "View specifications",
    add: "Add to enquiry",
    added: "Added",
  },
  zh: {
    viewAria: (model) => `${model} — 查看规格`,
    imageAlt: (model) => `丰怀轮毂型号 ${model} 正面图`,
    processMissing: "未注明工艺",
    diameter: "直径",
    variantCount: (count) => `${count} 项已记录配置`,
    finishCount: (count) => `${count} 项表面处理`,
    view: "查看规格",
    add: "加入询盘",
    added: "已加入",
  },
  es: {
    viewAria: (model) => `${model} — ver especificaciones`,
    imageAlt: (model) => `Vista frontal de la llanta Fenghuai modelo ${model}`,
    processMissing: "Proceso no especificado",
    diameter: "Diámetro",
    variantCount: (count) => `${count} ${count === 1 ? "configuración registrada" : "configuraciones registradas"}`,
    finishCount: (count) => `${count} ${count === 1 ? "acabado" : "acabados"}`,
    view: "Ver especificaciones",
    add: "Añadir a la consulta",
    added: "Añadida",
  },
  th: {
    viewAria: (model) => `${model} — ดูข้อมูลจำเพาะ`,
    imageAlt: (model) => `ภาพด้านหน้าล้อ Fenghuai รุ่น ${model}`,
    processMissing: "ไม่ระบุกระบวนการ",
    diameter: "เส้นผ่านศูนย์กลาง",
    variantCount: (count) => `${count} รูปแบบที่บันทึกไว้`,
    finishCount: (count) => `${count} ผิวสำเร็จ`,
    view: "ดูข้อมูลจำเพาะ",
    add: "เพิ่มในรายการสอบถาม",
    added: "เพิ่มแล้ว",
  },
};

export function wheelCardCopyFor(locale: Locale): WheelCardCopy {
  return cardCopy[locale];
}
