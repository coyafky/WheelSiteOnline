import {
  finishNamePending,
  wheelDetailEnquiry,
  wheelDetailFormCopy,
} from "@/content/wheel-detail";
import type { Locale } from "./types";

type SummaryParts = Parameters<typeof wheelDetailEnquiry.selectedSummary>[0];
type EnquiryCopy = {
  [Key in keyof typeof wheelDetailEnquiry]:
    (typeof wheelDetailEnquiry)[Key] extends (...args: infer Args) => string
      ? (...args: Args) => string
      : string;
};
type FormCopy = { [Key in keyof typeof wheelDetailFormCopy]: string };

const copyByLocale: Record<Locale, EnquiryCopy> = {
  en: wheelDetailEnquiry,
  zh: {
    heading: "询问此轮毂配置",
    noSelection: "请选择一项已记录的配置，以便在询盘中附上对应的生产规格。",
    selectedLabel: "已选配置",
    cta: "询问此配置",
    addToListLabel: "加入总询盘",
    addedToListLabel: "已加入总询盘",
    addToListHelp: "比较其他轮毂时，将此配置保留在询盘清单中。",
    directHelp: "仅就当前轮毂直接发送询盘，不会改动已保存的询盘清单。",
    modelCta: "询问此轮毂型号",
    dialogTitle: "询问此配置",
    dialogModelTitle: "询问此轮毂型号",
    dialogSelectedSubtitle: (summary) => `本次询盘仅包含 ${summary}。`,
    dialogModelSubtitle: (model) => `本次询盘包含型号 ${model}；具体配置可在后续沟通中确认。`,
    configurationQuantityLabel: "此配置的预计数量",
    configurationQuantityHelp: "填写此配置的预计数量。询盘没有业务数量上限。",
    fallbackNote: "表单无法使用，或已关闭 JavaScript？",
    fallbackLabel: "携带此型号打开完整询盘页",
    selectedSummary: wheelDetailEnquiry.selectedSummary,
  },
  es: {
    heading: "Consultar esta configuración de llanta",
    noSelection: "Seleccione una configuración registrada para adjuntar sus especificaciones de producción a la consulta.",
    selectedLabel: "Configuración seleccionada",
    cta: "Consultar esta configuración",
    addToListLabel: "Añadir a la consulta general",
    addedToListLabel: "Añadida a la consulta general",
    addToListHelp: "Guarde esta configuración en su lista mientras compara otras llantas.",
    directHelp: "Envíe una consulta solo sobre esta llanta sin modificar su lista guardada.",
    modelCta: "Consultar este modelo de llanta",
    dialogTitle: "Consultar esta configuración",
    dialogModelTitle: "Consultar este modelo de llanta",
    dialogSelectedSubtitle: (summary) => `Esta consulta incluirá únicamente ${summary}.`,
    dialogModelSubtitle: (model) => `Esta consulta incluirá el modelo ${model}; la configuración se puede confirmar después.`,
    configurationQuantityLabel: "Cantidad prevista para esta configuración",
    configurationQuantityHelp: "Indique la cantidad prevista. Las consultas no tienen un límite comercial de cantidad.",
    fallbackNote: "¿No funciona el formulario o tiene JavaScript desactivado?",
    fallbackLabel: "Abrir el formulario completo con este modelo",
    selectedSummary: wheelDetailEnquiry.selectedSummary,
  },
  th: {
    heading: "สอบถามรูปแบบล้อนี้",
    noSelection: "เลือกรูปแบบที่บันทึกไว้เพื่อแนบข้อมูลจำเพาะการผลิตไปกับคำสอบถาม",
    selectedLabel: "รูปแบบที่เลือก",
    cta: "สอบถามรูปแบบนี้",
    addToListLabel: "เพิ่มในรายการสอบถามรวม",
    addedToListLabel: "เพิ่มในรายการสอบถามรวมแล้ว",
    addToListHelp: "เก็บรูปแบบนี้ไว้ในรายการสอบถามระหว่างเปรียบเทียบล้อรุ่นอื่น",
    directHelp: "ส่งคำสอบถามเฉพาะล้อรุ่นนี้โดยไม่เปลี่ยนรายการสอบถามที่บันทึกไว้",
    modelCta: "สอบถามเกี่ยวกับล้อรุ่นนี้",
    dialogTitle: "สอบถามรูปแบบนี้",
    dialogModelTitle: "สอบถามเกี่ยวกับล้อรุ่นนี้",
    dialogSelectedSubtitle: (summary) => `คำสอบถามนี้มีเฉพาะ ${summary}`,
    dialogModelSubtitle: (model) => `คำสอบถามนี้มีล้อรุ่น ${model} และสามารถยืนยันรูปแบบภายหลังได้`,
    configurationQuantityLabel: "จำนวนที่คาดว่าจะใช้สำหรับรูปแบบนี้",
    configurationQuantityHelp: "ระบุจำนวนที่คาดว่าจะใช้ คำสอบถามไม่มีเพดานจำนวนทางธุรกิจ",
    fallbackNote: "แบบฟอร์มใช้ไม่ได้หรือปิด JavaScript อยู่?",
    fallbackLabel: "เปิดหน้าสอบถามฉบับเต็มพร้อมรุ่นนี้",
    selectedSummary: wheelDetailEnquiry.selectedSummary,
  },
};

const formCopyByLocale: Record<Locale, FormCopy> = {
  en: wheelDetailFormCopy,
  zh: {
    requiredNote: "必填项",
    optional: "选填",
    submit: "询问此配置",
    submitting: "正在发送…",
    successTitle: "已收到您的询盘。",
    successBody: "请保留下面的编号，以便后续沟通。",
    resetLabel: "再次发送询盘",
    errorSummaryTitle: "请检查以下字段",
    errorSummaryBody: "询盘尚未发送，请修正以下问题：",
    networkErrorTitle: "询盘未发送",
    networkErrorBody: "无法连接服务器。没有提交任何内容，您填写的信息仍保留在表单中，请稍后重试。",
    pendingDeliveryNote: "询盘已安全保存。通知邮件暂未发出，销售团队会人工跟进，您无需重复提交。",
  },
  es: {
    requiredNote: "Campo obligatorio",
    optional: "opcional",
    submit: "Consultar esta configuración",
    submitting: "Enviando…",
    successTitle: "Hemos recibido su consulta.",
    successBody: "Conserve el número de referencia para el seguimiento.",
    resetLabel: "Enviar otra consulta",
    errorSummaryTitle: "Revise estos campos",
    errorSummaryBody: "Su consulta no se ha enviado. Corrija lo siguiente:",
    networkErrorTitle: "Su consulta no se ha enviado",
    networkErrorBody: "No pudimos conectar con el servidor. No se envió nada y sus datos siguen en el formulario. Vuelva a intentarlo.",
    pendingDeliveryNote: "Su consulta se ha guardado. El correo de aviso no pudo enviarse ahora; el equipo comercial hará el seguimiento manualmente. No necesita volver a enviarla.",
  },
  th: {
    requiredNote: "ช่องที่ต้องกรอก",
    optional: "ไม่บังคับ",
    submit: "สอบถามรูปแบบนี้",
    submitting: "กำลังส่ง…",
    successTitle: "ได้รับคำสอบถามของคุณแล้ว",
    successBody: "โปรดเก็บหมายเลขอ้างอิงด้านล่างไว้สำหรับติดตามผล",
    resetLabel: "ส่งคำสอบถามอีกครั้ง",
    errorSummaryTitle: "ตรวจสอบข้อมูลต่อไปนี้",
    errorSummaryBody: "ยังไม่ได้ส่งคำสอบถาม โปรดแก้ไขรายการต่อไปนี้:",
    networkErrorTitle: "ยังไม่ได้ส่งคำสอบถาม",
    networkErrorBody: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ยังไม่มีการส่งข้อมูลและข้อมูลที่กรอกไว้ยังอยู่ในแบบฟอร์ม โปรดลองอีกครั้ง",
    pendingDeliveryNote: "บันทึกคำสอบถามเรียบร้อยแล้ว ขณะนี้ยังส่งอีเมลแจ้งเตือนไม่ได้ ทีมขายจะติดตามด้วยตนเองโดยคุณไม่ต้องส่งซ้ำ",
  },
};

const finishPendingByLocale: Record<Locale, string> = {
  en: finishNamePending,
  zh: "已记录（名称待批准）",
  es: "Registrado (nombre pendiente de aprobación)",
  th: "บันทึกแล้ว (ชื่อรอการอนุมัติ)",
};

export function wheelEnquiryCopyFor(locale: Locale): EnquiryCopy {
  return copyByLocale[locale];
}

export function wheelEnquiryFormCopyFor(locale: Locale): FormCopy {
  return formCopyByLocale[locale];
}

export function wheelFinishPendingFor(locale: Locale): string {
  return finishPendingByLocale[locale];
}

export type { SummaryParts };
