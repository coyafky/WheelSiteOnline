import {
  wheelDetailBreadcrumb,
  wheelDetailConfigurations,
  wheelDetailFinishes,
  wheelDetailFitment,
  wheelDetailIdentity,
  wheelDetailRelated,
  wheelDetailSeo,
} from "@/content/wheel-detail";
import type { Locale } from "./types";

type LocalizedCopy<T> = {
  [Key in keyof T]: T[Key] extends (...args: infer Args) => string
    ? (...args: Args) => string
    : T[Key] extends readonly string[]
      ? readonly string[]
      : string;
};

type DetailCopy = {
  breadcrumb: LocalizedCopy<typeof wheelDetailBreadcrumb>;
  identity: LocalizedCopy<typeof wheelDetailIdentity>;
  configurations: LocalizedCopy<typeof wheelDetailConfigurations>;
  finishes: LocalizedCopy<typeof wheelDetailFinishes>;
  fitment: LocalizedCopy<typeof wheelDetailFitment>;
  related: LocalizedCopy<typeof wheelDetailRelated>;
  seo: LocalizedCopy<typeof wheelDetailSeo>;
};

// Local template copy. Product facts still come exclusively from approved variant data.
// Non-English copy is a translation draft until commercial/technical review.
const detailCopy: Record<Locale, DetailCopy> = {
  en: {
    breadcrumb: wheelDetailBreadcrumb,
    identity: wheelDetailIdentity,
    configurations: wheelDetailConfigurations,
    finishes: wheelDetailFinishes,
    fitment: wheelDetailFitment,
    related: wheelDetailRelated,
    seo: wheelDetailSeo,
  },
  zh: {
    breadcrumb: { ...wheelDetailBreadcrumb, rootLabel: "产品", sectionLabel: "轮毂" },
    identity: {
      eyebrow: "已发布轮毂型号",
      processRecorded: (process) => `已记录工艺：${process}`,
      processMissing: "来源记录未注明制造工艺。",
      intro: (model) => `型号 ${model} 展示了目前可用于询盘的已批准生产配置。请选择下方一项已记录的配置，以便团队核对供应、应用场景和目标市场要求。`,
      boundary: "图片用于识别轮毂设计。最终表面效果、车辆适配、刹车间隙及载荷要求须针对所选项目确认。",
      selectAnchor: "选择配置",
    },
    configurations: {
      heading: "已记录的生产配置",
      lead: "每行代表一组已记录的组合。尺寸、PCD、偏距、中心孔和表面处理必须与同一生产代码对应。",
      disclosure: "已记录的配置可用于询盘，但不代表车辆适配或库存保证。",
      columnSelect: "选择", columnProductionCode: "生产代码", columnSize: "尺寸", columnPcd: "PCD", columnOffset: "偏距", columnCentreBore: "中心孔", columnFinish: "表面处理",
      selectRow: (code) => `选择已记录配置 ${code}`,
      tableCaption: (model) => `轮毂型号 ${model} 的已记录生产配置`,
      filterLabel: "筛选这些已记录配置",
      filterPlaceholder: "尺寸、PCD、偏距、中心孔或生产代码",
      filterCount: (shown, total) => `显示 ${shown} / ${total} 项已记录配置。`,
      filterEmpty: "没有符合筛选条件的已记录配置。",
      filterClear: "清除筛选",
    },
    finishes: {
      heading: (model) => `${model} 的已记录表面处理选项`,
      body: "以下表面处理来自该型号已批准的生产记录。量产前应根据已批准样品确认颜色、光泽和机加工外观。",
    },
    fitment: {
      heading: "量产前确认应用场景",
      body: "直径和 PCD 相同并不代表适配车辆。请提供车辆或应用场景、年款或代次、制动系统、悬挂改动、轮胎方案、载荷要求和目标市场，以供核对。",
      checklist: ["车辆或应用场景及年款", "制动系统与悬挂改动", "轮胎尺寸及预期用途", "所需数量与目的地市场"],
    },
    related: { heading: "比较其他已发布轮毂型号" },
    seo: {
      title: (model) => `${model} 轮毂规格与配置 | 丰怀`,
      description: (model) => `查看丰怀轮毂型号 ${model} 已批准的生产配置，包括尺寸、PCD、偏距和中心孔，并选取配置发送询盘。`,
      imageAlt: (model) => `丰怀轮毂型号 ${model} 正面图`,
    },
  },
  es: {
    breadcrumb: { ...wheelDetailBreadcrumb, rootLabel: "Productos", sectionLabel: "Llantas" },
    identity: {
      eyebrow: "MODELO DE LLANTA PUBLICADO",
      processRecorded: (process) => `Proceso registrado: ${process}`,
      processMissing: "El proceso de fabricación no figura en el registro de origen.",
      intro: (model) => `El modelo ${model} muestra las configuraciones de producción aprobadas que actualmente pueden consultarse. Seleccione una configuración registrada para que el equipo revise el suministro, la aplicación y los requisitos del mercado de destino.`,
      boundary: "La imagen identifica el diseño de la llanta. El acabado final, la compatibilidad con el vehículo, el espacio para los frenos y los requisitos de carga se confirman para cada proyecto.",
      selectAnchor: "Seleccionar una configuración",
    },
    configurations: {
      heading: "Configuraciones de producción registradas",
      lead: "Cada fila corresponde a una combinación registrada. La medida, el PCD, el desplazamiento, el diámetro central y el acabado deben pertenecer al mismo código de producción.",
      disclosure: "Una configuración registrada se puede consultar, pero no garantiza compatibilidad con el vehículo ni existencias.",
      columnSelect: "Elegir", columnProductionCode: "Código de producción", columnSize: "Medida", columnPcd: "PCD", columnOffset: "Desplazamiento", columnCentreBore: "Diámetro central", columnFinish: "Acabado",
      selectRow: (code) => `Elegir la configuración registrada ${code}`,
      tableCaption: (model) => `Configuraciones de producción registradas para la llanta ${model}`,
      filterLabel: "Filtrar configuraciones registradas",
      filterPlaceholder: "Medida, PCD, desplazamiento, diámetro central o código",
      filterCount: (shown, total) => `Se muestran ${shown} de ${total} configuraciones registradas.`,
      filterEmpty: "Ninguna configuración registrada coincide con el filtro.",
      filterClear: "Borrar filtro",
    },
    finishes: {
      heading: (model) => `Acabados registrados para ${model}`,
      body: "Estos acabados proceden de registros de producción aprobados para este modelo. Confirme el color, el brillo y el aspecto mecanizado con una muestra aprobada antes de producir.",
    },
    fitment: {
      heading: "Confirme la aplicación antes de producir",
      body: "Coincidir en diámetro y PCD no confirma la compatibilidad con un vehículo. Indique el vehículo o aplicación, año o generación, frenos, cambios de suspensión, neumáticos previstos, carga requerida y mercado de destino para su revisión.",
      checklist: ["Vehículo o aplicación y año", "Frenos y cambios de suspensión", "Medida de neumático y uso previsto", "Cantidad necesaria y mercado de destino"],
    },
    related: { heading: "Compare otros modelos de llantas publicados" },
    seo: {
      title: (model) => `Especificaciones y configuraciones de llanta ${model} | Fenghuai`,
      description: (model) => `Consulte las configuraciones de producción aprobadas de la llanta Fenghuai ${model}, incluidas medida, PCD, desplazamiento y diámetro central, y envíe una consulta.`,
      imageAlt: (model) => `Vista frontal de la llanta Fenghuai modelo ${model}`,
    },
  },
  th: {
    breadcrumb: { ...wheelDetailBreadcrumb, rootLabel: "ผลิตภัณฑ์", sectionLabel: "ล้อ" },
    identity: {
      eyebrow: "รุ่นล้อที่เผยแพร่แล้ว",
      processRecorded: (process) => `กระบวนการที่บันทึกไว้: ${process}`,
      processMissing: "ไม่พบข้อมูลกระบวนการผลิตในบันทึกต้นทาง",
      intro: (model) => `ล้อรุ่น ${model} แสดงรูปแบบการผลิตที่ได้รับอนุมัติและเปิดให้สอบถามในขณะนี้ โปรดเลือกรูปแบบที่บันทึกไว้ด้านล่าง เพื่อให้ทีมตรวจสอบการจัดหา การใช้งาน และข้อกำหนดของตลาดปลายทาง`,
      boundary: "ภาพใช้ระบุการออกแบบล้อเท่านั้น ต้องยืนยันผิวสำเร็จ ความเข้ากันได้กับรถ ระยะห่างเบรก และข้อกำหนดการรับน้ำหนักสำหรับแต่ละโครงการ",
      selectAnchor: "เลือกรูปแบบ",
    },
    configurations: {
      heading: "รูปแบบการผลิตที่บันทึกไว้",
      lead: "แต่ละแถวเป็นชุดข้อมูลที่บันทึกไว้หนึ่งชุด ขนาด PCD ค่าออฟเซ็ต รูดุม และผิวสำเร็จต้องตรงกับรหัสการผลิตเดียวกัน",
      disclosure: "รูปแบบที่บันทึกไว้สามารถสอบถามได้ แต่ไม่ได้รับประกันความเข้ากันได้กับรถหรือการมีสินค้าในสต็อก",
      columnSelect: "เลือก", columnProductionCode: "รหัสการผลิต", columnSize: "ขนาด", columnPcd: "PCD", columnOffset: "ออฟเซ็ต", columnCentreBore: "รูดุม", columnFinish: "ผิวสำเร็จ",
      selectRow: (code) => `เลือกรูปแบบที่บันทึกไว้ ${code}`,
      tableCaption: (model) => `รูปแบบการผลิตที่บันทึกไว้สำหรับล้อรุ่น ${model}`,
      filterLabel: "กรองรูปแบบที่บันทึกไว้",
      filterPlaceholder: "ขนาด PCD ออฟเซ็ต รูดุม หรือรหัสการผลิต",
      filterCount: (shown, total) => `แสดง ${shown} จาก ${total} รูปแบบที่บันทึกไว้`,
      filterEmpty: "ไม่พบรูปแบบที่ตรงกับตัวกรอง",
      filterClear: "ล้างตัวกรอง",
    },
    finishes: {
      heading: (model) => `ตัวเลือกผิวสำเร็จที่บันทึกไว้สำหรับ ${model}`,
      body: "ผิวสำเร็จเหล่านี้มาจากบันทึกการผลิตที่ได้รับอนุมัติของรุ่นนี้ โปรดยืนยันสี ความเงา และลักษณะงานกลึงกับตัวอย่างที่อนุมัติก่อนผลิต",
    },
    fitment: {
      heading: "ยืนยันการใช้งานก่อนการผลิต",
      body: "เส้นผ่านศูนย์กลางและ PCD ที่ตรงกันไม่ได้ยืนยันว่าล้อเข้ากับรถได้ โปรดแจ้งรถหรือการใช้งาน ปีหรือรุ่น ระบบเบรก การปรับช่วงล่าง แผนยาง ข้อกำหนดน้ำหนักบรรทุก และตลาดปลายทางเพื่อตรวจสอบ",
      checklist: ["รถหรือการใช้งานและปีรุ่น", "ระบบเบรกและการปรับช่วงล่าง", "ขนาดยางและการใช้งานที่คาดไว้", "จำนวนที่ต้องการและตลาดปลายทาง"],
    },
    related: { heading: "เปรียบเทียบล้อรุ่นอื่นที่เผยแพร่แล้ว" },
    seo: {
      title: (model) => `ข้อมูลจำเพาะและรูปแบบล้อ ${model} | Fenghuai`,
      description: (model) => `ดูรูปแบบการผลิตที่ได้รับอนุมัติของล้อ Fenghuai รุ่น ${model} รวมถึงขนาด PCD ออฟเซ็ต และรูดุม แล้วส่งคำสอบถามสำหรับรูปแบบที่เลือก`,
      imageAlt: (model) => `ภาพด้านหน้าล้อ Fenghuai รุ่น ${model}`,
    },
  },
};

export function wheelDetailCopyFor(locale: Locale): DetailCopy {
  return detailCopy[locale];
}
