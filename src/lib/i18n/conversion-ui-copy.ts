import { contactFormCopy } from "@/content/contact";
import { quoteContextBarCopy, requestQuoteFormCopy } from "@/content/request-a-quote";
import type { Locale } from "./types";

type FormCopy = { [Key in keyof typeof requestQuoteFormCopy]: string };
type ContextCopy = { [Key in keyof typeof quoteContextBarCopy]: string };
type ContactLabels = {
  sales: string; phone: string; factory: string; hours: string;
  unverified: string;
  privacyPending: string;
};

const commonForm: Record<Exclude<Locale, "en">, FormCopy> = {
  zh: {
    requiredNote: "必填项", optional: "选填", submit: "提交项目询盘", submitting: "正在发送…",
    successTitle: "您的询盘已保存", successBody: "请保留下方参考编号，以便后续沟通。该编号确认询盘记录已创建。",
    resetLabel: "再次发送询盘", errorSummaryTitle: "请检查以下字段", errorSummaryBody: "询盘尚未发送，请修正以下问题：",
    networkErrorTitle: "询盘未发送", networkErrorBody: "无法连接询盘服务。没有提交任何内容，您填写的信息仍保留在表单中，请稍后重试。",
    pendingDeliveryNote: "询盘记录已保存，但通知邮件仍待发送。请勿重复提交同一项目。",
  },
  es: {
    requiredNote: "Campo obligatorio", optional: "opcional", submit: "Enviar consulta de proyecto", submitting: "Enviando…",
    successTitle: "Su consulta se ha guardado", successBody: "Conserve el número de referencia de abajo para el seguimiento. Confirma que se creó el registro de la consulta.",
    resetLabel: "Enviar otra consulta", errorSummaryTitle: "Revise estos campos", errorSummaryBody: "Su consulta no se ha enviado. Corrija lo siguiente:",
    networkErrorTitle: "Su consulta no se ha enviado", networkErrorBody: "No se pudo conectar con el servicio de consultas. No se envió nada y sus datos siguen en el formulario. Inténtelo más tarde.",
    pendingDeliveryNote: "El registro se guardó, pero el correo de aviso sigue pendiente. No envíe de nuevo el mismo proyecto.",
  },
  th: {
    requiredNote: "ช่องที่ต้องกรอก", optional: "ไม่บังคับ", submit: "ส่งคำสอบถามโครงการ", submitting: "กำลังส่ง…",
    successTitle: "บันทึกคำสอบถามแล้ว", successBody: "โปรดเก็บหมายเลขอ้างอิงด้านล่างไว้สำหรับติดตามผล หมายเลขนี้ยืนยันว่าได้สร้างบันทึกคำสอบถามแล้ว",
    resetLabel: "ส่งคำสอบถามอีกครั้ง", errorSummaryTitle: "ตรวจสอบข้อมูลต่อไปนี้", errorSummaryBody: "ยังไม่ได้ส่งคำสอบถาม โปรดแก้ไขรายการต่อไปนี้:",
    networkErrorTitle: "ยังไม่ได้ส่งคำสอบถาม", networkErrorBody: "ไม่สามารถเชื่อมต่อบริการสอบถามได้ ยังไม่มีการส่งข้อมูลและข้อมูลที่กรอกไว้ยังอยู่ในแบบฟอร์ม โปรดลองอีกครั้งภายหลัง",
    pendingDeliveryNote: "บันทึกคำสอบถามแล้ว แต่อีเมลแจ้งเตือนยังรอส่งอยู่ โปรดอย่าส่งโครงการเดิมซ้ำ",
  },
};

const context: Record<Locale, ContextCopy> = {
  en: quoteContextBarCopy,
  zh: { eyebrow: "您的来源页面", carryOver: "这些规格已随同信息带入下方表单。", notThis: "不是这个型号？", changeModel: "更换型号", changeHref: "/products" },
  es: { eyebrow: "Página de origen", carryOver: "Estas especificaciones ya se han incluido en el formulario de abajo.", notThis: "¿No es este modelo?", changeModel: "Cambiar modelo", changeHref: "/products" },
  th: { eyebrow: "หน้าที่คุณเข้ามา", carryOver: "ข้อมูลจำเพาะนี้ถูกนำไปยังแบบฟอร์มด้านล่างแล้ว", notThis: "ไม่ใช่รุ่นนี้?", changeModel: "เปลี่ยนรุ่น", changeHref: "/products" },
};

const labels: Record<Locale, ContactLabels> = {
  en: {
    sales: "Sales enquiries", phone: "Telephone", factory: "Factory", hours: "Office hours",
    unverified: "Direct contact details are still being verified. Use the project enquiry form so your request follows the tracked intake process.",
    privacyPending: "The privacy notice is available for information. The project enquiry form accepts the information you already have.",
  },
  zh: {
    sales: "销售询盘", phone: "电话", factory: "工厂", hours: "办公时间",
    unverified: "直接联系方式仍在核实中。请使用项目询盘表单，以便需求进入可追踪的处理流程。",
    privacyPending: "隐私声明页面用于说明信息处理方式；项目询盘可直接提交您已经掌握的信息。",
  },
  es: {
    sales: "Consultas comerciales", phone: "Teléfono", factory: "Fábrica", hours: "Horario de oficina",
    unverified: "Los datos de contacto directo aún se están verificando. Utilice el formulario de consulta para que su solicitud siga el proceso registrado.",
    privacyPending: "El aviso de privacidad ofrece información sobre el tratamiento de datos; puede enviar los datos que ya tenga para iniciar la consulta.",
  },
  th: {
    sales: "สอบถามฝ่ายขาย", phone: "โทรศัพท์", factory: "โรงงาน", hours: "เวลาทำการ",
    unverified: "ข้อมูลติดต่อโดยตรงยังอยู่ระหว่างตรวจสอบ โปรดใช้แบบฟอร์มสอบถามโครงการเพื่อให้คำขอของคุณเข้าสู่กระบวนการที่ติดตามได้",
    privacyPending: "ประกาศความเป็นส่วนตัวให้ข้อมูลเกี่ยวกับการจัดการข้อมูล และคุณสามารถส่งข้อมูลที่มีอยู่เพื่อเริ่มคำสอบถามได้",
  },
};

const specLabels: Record<Locale, Record<string, string>> = {
  en: { size: "Size", pcd: "PCD", offset: "Offset", centerBore: "Bore", finish: "Finish" },
  zh: { size: "尺寸", pcd: "PCD", offset: "偏距", centerBore: "中心孔", finish: "表面处理" },
  es: { size: "Medida", pcd: "PCD", offset: "Desplazamiento", centerBore: "Diámetro central", finish: "Acabado" },
  th: { size: "ขนาด", pcd: "PCD", offset: "ออฟเซ็ต", centerBore: "รูดุม", finish: "ผิวสำเร็จ" },
};

export function quoteFormCopyFor(locale: Locale): FormCopy {
  return locale === "en" ? requestQuoteFormCopy : commonForm[locale];
}

export function contactFormCopyFor(locale: Locale): FormCopy {
  return locale === "en" ? contactFormCopy : commonForm[locale];
}

export function quoteContextCopyFor(locale: Locale): ContextCopy { return context[locale]; }
export function contactLabelsFor(locale: Locale): ContactLabels { return labels[locale]; }
export function quoteSpecLabelsFor(locale: Locale): Record<string, string> { return specLabels[locale]; }
