import { flowFormedWheelsPage } from "../../content/flow-formed-wheels.ts";
import type { FlowFormedWheelsPage } from "../../content/types.ts";
import type { Locale } from "./types";

type FlowFormedPageCopy = {
  hero: {
    breadcrumb: string[];
    breadcrumbLabel: string;
    eyebrow: string;
    heading: string;
    lead: string;
    boundary: string;
    primaryCta: string;
    secondaryCta: string;
    noApprovedModel: string;
    featuredLabels: {
      imageAlt: string;
      diameters: string;
      configurations: string;
      process: string;
      viewSpecifications: string;
    };
  };
  processDefinition: {
    eyebrow: string;
    heading: string;
    body: string;
    cards: Array<{ title: string; body: string }>;
    forgedProjectCtaLabel: string;
    evidenceNote: string;
  };
  manufacturingRoute: {
    eyebrow: string;
    heading: string;
    steps: Array<{ title: string; body: string }>;
    equipmentAlt: string;
    equipmentCaption: string;
    evidenceBoundary: string;
  };
  catalogue: {
    eyebrow: string;
    heading: string;
    emptyResultHeading: string;
    emptyResultBody: string;
    clearFiltersLabel: string;
    sendSpecificationLabel: string;
    resultSearch: string;
    resultFiltered: string;
    resultAll: string;
    disclosure: string;
  };
  inquiry: {
    eyebrow: string;
    heading: string;
    checklist: string[];
    primaryCta: string;
    scopeLabel: string;
    filterSnapshotLabel: string;
  };
  seo: { title: string; description: string };
};

/**
 * 非英文版本是待业务/工程审核的翻译草稿。不要据此开放该语言索引。
 * 数量、工艺、型号、媒体来源和页面路径继续由英文内容正本提供。
 */
const translatedCopy = {
  zh: {
    hero: {
      breadcrumb: ["产品", "轮毂", "旋压轮毂"],
      breadcrumbLabel: "面包屑导航",
      eyebrow: "旋压轮毂",
      heading: "按已记录的生产规格浏览旋压轮毂",
      lead: "浏览生产资料记录了旋压工序的轮毂型号。提交适配与供货审核前，请先选择实际的尺寸和 PCD 组合。",
      boundary: "已记录的工艺和目录规格只是审核起点。接受订单前，须针对具体项目确认车辆适配、制动间隙、载荷要求、表面处理供应情况及目的市场文件。",
      primaryCta: "浏览已记录型号",
      secondaryCta: "咨询轮毂需求",
      noApprovedModel: "此页面目前没有已批准发布的旋压轮毂型号；上方的工艺说明仍然适用。",
      featuredLabels: {
        imageAlt: "Fenghuai 轮毂型号 {model} 正面图",
        diameters: "已记录直径",
        configurations: "已记录配置",
        process: "已记录工艺",
        viewSpecifications: "查看规格",
      },
    },
    processDefinition: {
      eyebrow: "工艺定义",
      heading: "旋压用于成形轮辋截面，不会把轮毂变成锻造轮毂",
      body: "对于适用的轮毂毛坯，会根据已批准的设计和工艺方案对轮辋截面进行受控成形。毛坯路线、材料状态、最终几何尺寸和验证要求均由具体轮毂项目决定。",
      cards: [
        { title: "旋压成形", body: "目录记录了旋压工序；除非另有记录，否则不据此推断毛坯的其他制造路线。" },
        { title: "低压铸造后旋压", body: "目录同时记录低压铸造路线和后续旋压工序。" },
        { title: "锻造轮毂项目", body: "锻造属于独立的定制开发路线，不能与旋压轮毂互换称呼。" },
      ],
      forgedProjectCtaLabel: "咨询锻造轮毂项目",
      evidenceNote: "重量与性能取决于已批准的设计、材料、工艺参数和验证结果。本页不适用统一的性能提升百分比。",
    },
    manufacturingRoute: {
      eyebrow: "制造路线",
      heading: "须针对实际轮毂型号确认制造路线",
      steps: [
        { title: "确认毛坯路线", body: "依据已记录的路线和项目文件确认。目录仅标注旋压时，不推断其采用低压铸造。" },
        { title: "成形适用的轮辋截面", body: "供应商提供的设备场景展示了适用于特定轮毂项目的旋压工序。" },
        { title: "完成已批准的后续工序", body: "机加工、热处理和表面处理按该型号批准的路线及图纸执行；不同轮毂不一定采用相同顺序。" },
        { title: "检验并验证", body: "依据项目控制计划和目标市场要求，审核尺寸、动平衡及适用的验证资料。" },
      ],
      equipmentAlt: "适用于特定轮毂项目的旋压设备",
      equipmentCaption: "供应商提供的旋压设备场景。具体轮毂型号的适用路线需单独确认。",
      evidenceBoundary: "设备图片展示供应商提供的制造场景，不代表所有目录型号均使用该设备，也不证明任何特定测试已经通过。",
    },
    catalogue: {
      eyebrow: "已记录型号",
      heading: "筛选已批准的旋压轮毂规格",
      emptyResultHeading: "没有已批准型号符合这些筛选条件。",
      emptyResultBody: "清除尺寸和 PCD 筛选条件，或提交所需规格以供审核。",
      clearFiltersLabel: "清除尺寸和 PCD 筛选条件",
      sendSpecificationLabel: "提交所需规格",
      resultSearch: "“{query}”找到 {count} 个型号",
      resultFiltered: "{count} 个型号符合所选生产规格",
      resultAll: "{count} 个已批准轮毂型号",
      disclosure: "目录显示的规格是生产记录，不构成车辆适配保证。",
    },
    inquiry: {
      eyebrow: "适配与供货审核",
      heading: "目录规格匹配后仍需进行应用审核",
      checklist: [
        "所选型号及完整的已记录配置",
        "车辆或应用信息；适用时请注明配置和年份",
        "制动、悬架或车身改装情况",
        "载荷要求和预期用途",
        "所需表面处理和数量",
        "目的市场及所需文件",
        "样品或交付时间要求",
      ],
      primaryCta: "提交旋压轮毂审核请求",
      scopeLabel: "已记录的工艺范围",
      filterSnapshotLabel: "随询盘提交的筛选条件",
    },
    seo: {
      title: "按已记录规格浏览旋压轮毂 | Fenghuai",
      description: "浏览已记录为旋压成形或低压铸造后旋压的已批准轮毂型号，选择实际规格以提交适配与供货审核。",
    },
  },
  es: {
    hero: {
      breadcrumb: ["Productos", "Llantas", "Llantas conformadas por flujo"],
      breadcrumbLabel: "Ruta de navegación",
      eyebrow: "LLANTAS CONFORMADAS POR FLUJO",
      heading: "Consulte llantas conformadas por flujo según sus especificaciones registradas",
      lead: "Explore modelos cuyos datos de producción registran el conformado por flujo como parte de la ruta de fabricación. Seleccione una combinación real de medida y PCD antes de solicitar una revisión de compatibilidad y suministro.",
      boundary: "El proceso registrado y las especificaciones del catálogo son solo el punto de partida. Antes de aceptar un pedido, se confirman la compatibilidad con el vehículo, el espacio para los frenos, la carga requerida, la disponibilidad del acabado y los documentos del mercado de destino.",
      primaryCta: "Ver modelos registrados",
      secondaryCta: "Consultar una necesidad de llantas",
      noApprovedModel: "Todavía no hay ningún modelo de llanta conformada por flujo aprobado en esta página. La explicación del proceso sigue siendo válida.",
      featuredLabels: {
        imageAlt: "Llanta Fenghuai modelo {model}, vista frontal",
        diameters: "Diámetros registrados",
        configurations: "Configuraciones registradas",
        process: "Proceso registrado",
        viewSpecifications: "Ver especificaciones",
      },
    },
    processDefinition: {
      eyebrow: "DEFINICIÓN DEL PROCESO",
      heading: "El conformado por flujo da forma a la sección de la llanta; no la convierte en una llanta forjada",
      body: "En una pieza en bruto aplicable se realiza un conformado controlado de la sección de la llanta conforme al diseño y al plan de proceso aprobados. La ruta de la pieza en bruto, el estado del material, la geometría final y los requisitos de validación dependen de cada programa de llantas.",
      cards: [
        { title: "Conformada por flujo", body: "El catálogo registra el conformado por flujo, pero no identifica la ruta de la pieza en bruto salvo que se haya registrado por separado." },
        { title: "Fundición a baja presión + conformado por flujo", body: "El catálogo registra tanto la ruta de fundición a baja presión como la operación posterior de conformado por flujo." },
        { title: "Proyecto de llanta forjada", body: "La forja se gestiona como una ruta independiente de desarrollo a medida; no debe usarse como sinónimo de una llanta conformada por flujo." },
      ],
      forgedProjectCtaLabel: "Consultar un programa de llantas forjadas",
      evidenceNote: "El peso y el rendimiento dependen del diseño, el material, los parámetros del proceso y los resultados de validación aprobados. Esta página no aplica un porcentaje universal de mejora.",
    },
    manufacturingRoute: {
      eyebrow: "RUTA DE FABRICACIÓN",
      heading: "La ruta se confirma para el modelo real de llanta",
      steps: [
        { title: "Confirmar la ruta de la pieza en bruto", body: "Utilice la ruta registrada y los documentos del proyecto. No deduzca fundición a baja presión si el catálogo solo indica conformado por flujo." },
        { title: "Conformar la sección aplicable de la llanta", body: "La escena del equipo proporcionada por el proveedor muestra una operación de conformado por flujo disponible para determinados programas de llantas." },
        { title: "Completar las operaciones posteriores aprobadas", body: "El mecanizado, el tratamiento térmico y el acabado siguen la ruta y el plano aprobados para ese modelo; no todas las llantas usan la misma secuencia." },
        { title: "Inspeccionar y validar", body: "Las dimensiones, el equilibrado y las pruebas aplicables se revisan según el plan de control del programa y el mercado de destino." },
      ],
      equipmentAlt: "Equipo de conformado por flujo para un programa de llantas aplicable",
      equipmentCaption: "Escena de equipo de conformado por flujo proporcionada por el proveedor. La ruta aplicable se confirma para cada modelo de llanta.",
      evidenceBoundary: "La imagen muestra una escena de fabricación proporcionada por un proveedor. No demuestra que todos los modelos del catálogo utilicen esta máquina ni que hayan superado una prueba específica.",
    },
    catalogue: {
      eyebrow: "MODELOS REGISTRADOS",
      heading: "Filtre especificaciones aprobadas de llantas conformadas por flujo",
      emptyResultHeading: "Ningún modelo aprobado coincide con estos filtros.",
      emptyResultBody: "Borre los filtros de medida y PCD, o envíe la especificación requerida para su revisión.",
      clearFiltersLabel: "Borrar los filtros de medida y PCD",
      sendSpecificationLabel: "Enviar la especificación requerida",
      resultSearch: "{count} modelos encontrados para “{query}”",
      resultFiltered: "{count} modelos coinciden con las especificaciones seleccionadas",
      resultAll: "{count} modelos de llantas aprobados",
      disclosure: "Las especificaciones del catálogo son registros de producción, no una garantía de compatibilidad con el vehículo.",
    },
    inquiry: {
      eyebrow: "REVISIÓN DE COMPATIBILIDAD Y SUMINISTRO",
      heading: "Una coincidencia en el catálogo todavía requiere revisar la aplicación",
      checklist: [
        "Modelo seleccionado y configuración registrada completa",
        "Vehículo o aplicación, incluido acabado y año cuando corresponda",
        "Modificaciones de frenos, suspensión o carrocería",
        "Carga y uso previsto",
        "Acabado y cantidad solicitados",
        "Mercado de destino y documentos requeridos",
        "Plazo solicitado para muestras o entrega",
      ],
      primaryCta: "Solicitar revisión de una llanta conformada por flujo",
      scopeLabel: "Alcance del proceso registrado",
      filterSnapshotLabel: "Filtros incluidos en la consulta",
    },
    seo: {
      title: "Llantas conformadas por flujo según especificaciones registradas | Fenghuai",
      description: "Consulte modelos aprobados registrados como conformados por flujo o fundidos a baja presión y conformados por flujo; seleccione una especificación real para revisar compatibilidad y suministro.",
    },
  },
  th: {
    hero: {
      breadcrumb: ["ผลิตภัณฑ์", "ล้อ", "ล้อขึ้นรูปด้วยการรีด"],
      breadcrumbLabel: "เส้นทางนำทาง",
      eyebrow: "ล้อขึ้นรูปด้วยการรีด",
      heading: "เลือกล้อขึ้นรูปด้วยการรีดตามข้อมูลการผลิตที่บันทึกไว้",
      lead: "ดูรุ่นล้อที่บันทึกกระบวนการขึ้นรูปด้วยการรีดไว้ในเส้นทางการผลิต โปรดเลือกรายการขนาดและ PCD ที่มีข้อมูลจริงก่อนขอให้ตรวจสอบการใช้งานและการจัดหา",
      boundary: "กระบวนการและข้อมูลจำเพาะในแค็ตตาล็อกเป็นเพียงจุดเริ่มต้น ต้องยืนยันความเข้ากันได้กับรถ ระยะห่างเบรก ข้อกำหนดน้ำหนักบรรทุก ความพร้อมของผิวสำเร็จ และเอกสารของตลาดปลายทางสำหรับแต่ละโครงการก่อนรับคำสั่งซื้อ",
      primaryCta: "ดูรุ่นที่มีข้อมูลบันทึกไว้",
      secondaryCta: "สอบถามความต้องการล้อ",
      noApprovedModel: "ขณะนี้ยังไม่มีรุ่นล้อขึ้นรูปด้วยการรีดที่อนุมัติให้เผยแพร่ในหน้านี้ คำอธิบายกระบวนการด้านบนยังคงใช้ได้",
      featuredLabels: {
        imageAlt: "ล้อ Fenghuai รุ่น {model} มุมมองด้านหน้า",
        diameters: "เส้นผ่านศูนย์กลางที่บันทึกไว้",
        configurations: "รูปแบบการผลิตที่บันทึกไว้",
        process: "กระบวนการที่บันทึกไว้",
        viewSpecifications: "ดูข้อมูลจำเพาะ",
      },
    },
    processDefinition: {
      eyebrow: "คำจำกัดความของกระบวนการ",
      heading: "การขึ้นรูปด้วยการรีดใช้ขึ้นรูปส่วนขอบล้อ แต่ไม่ได้ทำให้ล้อกลายเป็นล้อฟอร์จ",
      body: "สำหรับชิ้นงานเปล่าที่ใช้กระบวนการนี้ จะขึ้นรูปส่วนขอบล้ออย่างควบคุมตามแบบและแผนกระบวนการที่อนุมัติ เส้นทางของชิ้นงานเปล่า สภาพวัสดุ รูปทรงสุดท้าย และข้อกำหนดการตรวจสอบขึ้นอยู่กับโครงการล้อแต่ละรุ่น",
      cards: [
        { title: "ขึ้นรูปด้วยการรีด", body: "แค็ตตาล็อกบันทึกกระบวนการขึ้นรูปด้วยการรีด แต่จะไม่ระบุเส้นทางของชิ้นงานเปล่าหากไม่มีการบันทึกแยกต่างหาก" },
        { title: "หล่อแรงดันต่ำ + ขึ้นรูปด้วยการรีด", body: "แค็ตตาล็อกบันทึกทั้งกระบวนการหล่อแรงดันต่ำและการขึ้นรูปด้วยการรีดในขั้นตอนถัดไป" },
        { title: "โครงการล้อฟอร์จ", body: "การตีขึ้นรูปเป็นเส้นทางพัฒนาแบบสั่งทำแยกต่างหาก ห้ามใช้เรียกล้อขึ้นรูปด้วยการรีดแทนกัน" },
      ],
      forgedProjectCtaLabel: "สอบถามโครงการล้อฟอร์จ",
      evidenceNote: "น้ำหนักและสมรรถนะขึ้นอยู่กับแบบ วัสดุ พารามิเตอร์กระบวนการ และผลการตรวจสอบที่อนุมัติ หน้านี้ไม่ได้ระบุเปอร์เซ็นต์การปรับปรุงแบบเดียวสำหรับทุกกรณี",
    },
    manufacturingRoute: {
      eyebrow: "เส้นทางการผลิต",
      heading: "ยืนยันเส้นทางการผลิตสำหรับล้อรุ่นที่ใช้งานจริง",
      steps: [
        { title: "ยืนยันเส้นทางของชิ้นงานเปล่า", body: "ใช้เส้นทางที่บันทึกไว้และเอกสารโครงการ ห้ามอนุมานว่าเป็นการหล่อแรงดันต่ำเมื่อแค็ตตาล็อกระบุเพียงการขึ้นรูปด้วยการรีด" },
        { title: "ขึ้นรูปส่วนขอบล้อที่เกี่ยวข้อง", body: "ภาพอุปกรณ์ที่ผู้จัดหาจัดเตรียมแสดงกระบวนการขึ้นรูปด้วยการรีดที่ใช้ได้กับโครงการล้อบางประเภท" },
        { title: "ดำเนินงานขั้นต่อไปที่อนุมัติแล้ว", body: "การกลึง การอบชุบความร้อน และการทำผิวสำเร็จเป็นไปตามเส้นทางและแบบที่อนุมัติสำหรับรุ่นนั้น ล้อแต่ละรุ่นอาจมีลำดับงานต่างกัน" },
        { title: "ตรวจสอบและยืนยันผล", body: "ตรวจสอบขนาด การถ่วงสมดุล และหลักฐานการทดสอบที่เกี่ยวข้องตามแผนควบคุมของโครงการและข้อกำหนดตลาดเป้าหมาย" },
      ],
      equipmentAlt: "อุปกรณ์ขึ้นรูปด้วยการรีดสำหรับโครงการล้อที่เกี่ยวข้อง",
      equipmentCaption: "ภาพอุปกรณ์ขึ้นรูปด้วยการรีดที่ผู้จัดหาเป็นผู้จัดเตรียม ต้องยืนยันเส้นทางที่ใช้กับล้อแต่ละรุ่น",
      evidenceBoundary: "ภาพอุปกรณ์แสดงฉากการผลิตที่ผู้จัดหาเป็นผู้จัดเตรียม ไม่ได้ยืนยันว่าล้อทุกรุ่นในแค็ตตาล็อกใช้เครื่องนี้หรือผ่านการทดสอบใดโดยเฉพาะ",
    },
    catalogue: {
      eyebrow: "รุ่นที่มีข้อมูลบันทึกไว้",
      heading: "กรองข้อมูลจำเพาะของล้อขึ้นรูปด้วยการรีดที่อนุมัติแล้ว",
      emptyResultHeading: "ไม่พบรุ่นที่อนุมัติซึ่งตรงกับตัวกรองนี้",
      emptyResultBody: "ล้างตัวกรองขนาดและ PCD หรือส่งข้อมูลจำเพาะที่ต้องการมาให้ตรวจสอบ",
      clearFiltersLabel: "ล้างตัวกรองขนาดและ PCD",
      sendSpecificationLabel: "ส่งข้อมูลจำเพาะที่ต้องการ",
      resultSearch: "พบ {count} รุ่นสำหรับ “{query}”",
      resultFiltered: "{count} รุ่นตรงกับข้อมูลจำเพาะการผลิตที่เลือก",
      resultAll: "รุ่นล้อที่อนุมัติแล้ว {count} รุ่น",
      disclosure: "ข้อมูลจำเพาะในแค็ตตาล็อกเป็นบันทึกการผลิต ไม่ใช่การรับประกันว่าใช้ได้กับรถ",
    },
    inquiry: {
      eyebrow: "ตรวจสอบการใช้งานและการจัดหา",
      heading: "แม้พบข้อมูลตรงกันในแค็ตตาล็อก ก็ยังต้องตรวจสอบการใช้งาน",
      checklist: [
        "รุ่นที่เลือกและข้อมูลการผลิตที่บันทึกไว้ครบถ้วน",
        "รถหรือการใช้งาน รวมถึงรุ่นย่อยและปีเมื่อเกี่ยวข้อง",
        "การดัดแปลงเบรก ช่วงล่าง หรือตัวถัง",
        "น้ำหนักบรรทุกและการใช้งานที่วางแผนไว้",
        "ผิวสำเร็จและจำนวนที่ต้องการ",
        "ตลาดปลายทางและเอกสารที่ต้องใช้",
        "กำหนดเวลาตัวอย่างหรือการจัดส่งที่ต้องการ",
      ],
      primaryCta: "ขอให้ตรวจสอบล้อขึ้นรูปด้วยการรีด",
      scopeLabel: "ขอบเขตกระบวนการที่บันทึกไว้",
      filterSnapshotLabel: "ตัวกรองที่แนบไปกับคำสอบถาม",
    },
    seo: {
      title: "ล้อขึ้นรูปด้วยการรีดตามข้อมูลจำเพาะที่บันทึกไว้ | Fenghuai",
      description: "ดูรุ่นล้อที่อนุมัติและบันทึกว่าใช้การขึ้นรูปด้วยการรีดหรือการหล่อแรงดันต่ำร่วมกับการขึ้นรูปด้วยการรีด แล้วเลือกข้อมูลจำเพาะจริงเพื่อขอตรวจสอบการใช้งานและการจัดหา",
    },
  },
} satisfies Record<Exclude<Locale, "en">, FlowFormedPageCopy>;

export type FlowFormedCopyStatus = "approved" | "draft";

export function flowFormedCopyStatus(locale: Locale): FlowFormedCopyStatus {
  return locale === "en" ? "approved" : "draft";
}

export function flowFormedPageFor(locale: Locale): FlowFormedWheelsPage {
  if (locale === "en") return flowFormedWheelsPage;

  const copy = translatedCopy[locale];
  const source = flowFormedWheelsPage;
  return {
    ...source,
    hero: {
      ...source.hero,
      breadcrumbLabel: copy.hero.breadcrumbLabel,
      breadcrumb: source.hero.breadcrumb.map((item, index) => ({
        ...item,
        label: copy.hero.breadcrumb[index] ?? item.label,
      })),
      eyebrow: copy.hero.eyebrow,
      heading: copy.hero.heading,
      lead: copy.hero.lead,
      boundary: copy.hero.boundary,
      primaryCta: { ...source.hero.primaryCta, label: copy.hero.primaryCta },
      secondaryCta: { ...source.hero.secondaryCta, label: copy.hero.secondaryCta },
      noApprovedModel: copy.hero.noApprovedModel,
      featuredLabels: copy.hero.featuredLabels,
    },
    processDefinition: {
      ...source.processDefinition,
      eyebrow: copy.processDefinition.eyebrow,
      heading: copy.processDefinition.heading,
      body: copy.processDefinition.body,
      cards: source.processDefinition.cards.map((item, index) => ({
        ...item,
        title: copy.processDefinition.cards[index]?.title ?? item.title,
        body: copy.processDefinition.cards[index]?.body ?? item.body,
      })),
      forgedProjectCtaLabel: copy.processDefinition.forgedProjectCtaLabel,
      evidenceNote: copy.processDefinition.evidenceNote,
    },
    manufacturingRoute: {
      ...source.manufacturingRoute,
      eyebrow: copy.manufacturingRoute.eyebrow,
      heading: copy.manufacturingRoute.heading,
      steps: source.manufacturingRoute.steps.map((item, index) => ({
        ...item,
        title: copy.manufacturingRoute.steps[index]?.title ?? item.title,
        body: copy.manufacturingRoute.steps[index]?.body ?? item.body,
      })),
      equipment: {
        ...source.manufacturingRoute.equipment,
        alt: copy.manufacturingRoute.equipmentAlt,
        caption: copy.manufacturingRoute.equipmentCaption,
      },
      evidenceBoundary: copy.manufacturingRoute.evidenceBoundary,
    },
    catalogue: {
      ...source.catalogue,
      eyebrow: copy.catalogue.eyebrow,
      heading: copy.catalogue.heading,
      emptyResultHeading: copy.catalogue.emptyResultHeading,
      emptyResultBody: copy.catalogue.emptyResultBody,
      clearFiltersLabel: copy.catalogue.clearFiltersLabel,
      sendSpecificationLabel: copy.catalogue.sendSpecificationLabel,
      resultSearch: copy.catalogue.resultSearch,
      resultFiltered: copy.catalogue.resultFiltered,
      resultAll: copy.catalogue.resultAll,
      disclosure: copy.catalogue.disclosure,
    },
    inquiry: {
      ...source.inquiry,
      eyebrow: copy.inquiry.eyebrow,
      heading: copy.inquiry.heading,
      checklist: copy.inquiry.checklist,
      primaryCta: { ...source.inquiry.primaryCta, label: copy.inquiry.primaryCta },
      scopeLabel: copy.inquiry.scopeLabel,
      filterSnapshotLabel: copy.inquiry.filterSnapshotLabel,
    },
    seo: { ...source.seo, ...copy.seo },
  };
}
