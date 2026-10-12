import {
  contactAside,
  contactDetailsCopy,
  contactFormHeading,
  contactHero,
  contactPathways,
  contactSteps,
  contactWhatHappens,
} from "./contact.ts";
import { quoteFormHeading, requestQuoteHero } from "./request-a-quote.ts";
import type { Locale } from "@/lib/i18n/types";

/** Page-body records mirrored by WordPress Page keys `request-a-quote` and `contact`. */
export type ConversionQuoteBody = {
  hero: { eyebrow: string; heading: string; lede: string };
  formHeading: { title: string; body: string };
  dataNotice: { eyebrow: string; body: string; footLabel: string; footHref: string };
  seo: { title: string; description: string };
};

export type ConversionContactBody = {
  hero: { eyebrow: string; heading: string; lede: string; supporting: string };
  formHeading: { title: string; body: string };
  whatHappens: { eyebrow: string; heading: string; body: string; points: string[] };
  steps: { step: string; title: string; body: string }[];
  details: { eyebrow: string; heading: string; body: string };
  aside: { eyebrow: string; heading: string; points: string[] };
  pathways: {
    eyebrow: string;
    heading: string;
    links: { eyebrow: string; title: string; body: string; href: string; linkLabel: string }[];
  };
  seo: { title: string; description: string };
};

const quote: Record<Locale, ConversionQuoteBody> = {
  en: {
    hero: requestQuoteHero,
    formHeading: quoteFormHeading,
    dataNotice: {
      eyebrow: "How we handle your details",
      body: "The privacy notice must be approved before this form can accept a project enquiry.",
      footLabel: "Have another question? Go to the contact page",
      footHref: "/contact",
    },
    seo: {
      title: "Request a Quote",
      description: "Send a project enquiry for wheels, EV components, custom aluminium parts or safety tires. Approved product context carries over from model pages.",
    },
  },
  zh: {
    hero: {
      eyebrow: "项目询盘",
      heading: "告诉我们您需要采购或开发什么",
      lede: "选择产品线，告诉我们您已经掌握的信息。型号、图纸准备情况或应用描述足以启动评估。您无需事先确定所有规格；缺失的技术细节可在报价或生产批准前核实。",
    },
    formHeading: {
      title: "项目询盘",
      body: "选择产品线并发送已知信息。缺失的技术细节可在报价或生产批准前确认。",
    },
    dataNotice: {
      eyebrow: "我们如何处理您的信息",
      body: "隐私声明须经批准后，此表单才会接收项目询盘。",
      footLabel: "还有其他问题？前往联系页面",
      footHref: "/contact",
    },
    seo: {
      title: "提交项目询盘 | 丰怀",
      description: "就轮毂、新能源三电壳体、铝制品定制或安全轮胎发送项目询盘；已选产品上下文会随询盘保留。",
    },
  },
  es: {
    hero: {
      eyebrow: "Consulta de proyecto",
      heading: "Cuéntenos qué necesita adquirir o desarrollar",
      lede: "Elija una línea de producto y comparta lo que ya sabe. Un número de modelo, el estado de los planos o una descripción de la aplicación bastan para iniciar la revisión. No necesita tener todas las especificaciones; los detalles técnicos pendientes se confirman antes de aprobar una oferta o la producción.",
    },
    formHeading: {
      title: "Consulta de proyecto",
      body: "Elija una línea de producto y envíe la información disponible. Los detalles técnicos pendientes se pueden confirmar antes de aprobar una oferta o la producción.",
    },
    dataNotice: {
      eyebrow: "Cómo tratamos sus datos",
      body: "El aviso de privacidad debe aprobarse antes de que este formulario pueda recibir consultas de proyecto.",
      footLabel: "¿Tiene otra pregunta? Vaya a la página de contacto",
      footHref: "/contact",
    },
    seo: {
      title: "Enviar una consulta de proyecto | Fenghuai",
      description: "Envíe una consulta sobre llantas, carcasas para vehículos eléctricos, componentes de aluminio a medida o neumáticos de seguridad.",
    },
  },
  th: {
    hero: {
      eyebrow: "สอบถามโครงการ",
      heading: "บอกเราว่าคุณต้องการจัดหาหรือพัฒนาอะไร",
      lede: "เลือกสายผลิตภัณฑ์และแจ้งข้อมูลที่คุณมีอยู่แล้ว หมายเลขรุ่น สถานะแบบ หรือคำอธิบายการใช้งานก็เพียงพอสำหรับเริ่มการพิจารณา ไม่จำเป็นต้องมีข้อมูลจำเพาะครบทุกข้อ โดยจะยืนยันรายละเอียดทางเทคนิคที่ขาดก่อนอนุมัติใบเสนอราคาหรือการผลิต",
    },
    formHeading: {
      title: "สอบถามโครงการ",
      body: "เลือกสายผลิตภัณฑ์และส่งข้อมูลที่คุณมี รายละเอียดทางเทคนิคที่ยังขาดสามารถยืนยันก่อนอนุมัติใบเสนอราคาหรือการผลิต",
    },
    dataNotice: {
      eyebrow: "การจัดการข้อมูลของคุณ",
      body: "ต้องอนุมัติประกาศความเป็นส่วนตัวก่อนแบบฟอร์มนี้จึงจะรับคำสอบถามโครงการได้",
      footLabel: "มีคำถามอื่นหรือไม่? ไปที่หน้าติดต่อ",
      footHref: "/contact",
    },
    seo: {
      title: "ส่งคำสอบถามโครงการ | Fenghuai",
      description: "ส่งคำสอบถามเกี่ยวกับล้อ ชิ้นส่วนยานยนต์ไฟฟ้า อะลูมิเนียมสั่งทำ หรือยางนิรภัย พร้อมข้อมูลผลิตภัณฑ์ที่เลือกไว้",
    },
  },
};

const contact: Record<Locale, ConversionContactBody> = {
  en: {
    hero: contactHero,
    formHeading: contactFormHeading,
    whatHappens: contactWhatHappens,
    steps: contactSteps,
    details: contactDetailsCopy,
    aside: { ...contactAside, points: [...contactAside.points] },
    pathways: { ...contactPathways, links: contactPathways.links.map((link) => ({ ...link })) },
    seo: {
      title: "Contact Us — Request a Quote",
      description: "Send Fenghuai your drawing, sample or target specification and the quantities you are considering. Discuss the project scope before quotation.",
    },
  },
  zh: {
    hero: {
      eyebrow: "项目询盘", heading: "告诉我们您需要采购或开发什么",
      lede: "选择产品线，并发送需求、预计数量以及已有的图纸或样件。",
      supporting: "无需事先确定所有规格。缺失的技术细节可在报价或生产批准前确认。",
    },
    formHeading: { title: "项目询盘", body: "选择产品线并发送已知信息。缺失的技术细节可在报价或生产批准前确认。" },
    whatHappens: {
      eyebrow: "后续流程", heading: "从您的留言到书面报价",
      body: "询盘记录将项目详情与参考编号关联保存。报价获批前，可进一步确认技术范围、数量和目的地市场。",
      points: ["提交的详情关联在同一询盘编号下", "可以识别缺失的适配、接口或性能信息", "规格和商务条款须针对项目另行确认", "生产批准不同于初次询盘"],
    },
    steps: [
      { step: "01", title: "发送需求信息", body: "可说明车辆、预计数量、表面处理方向和销售市场。初步需求也足以开始沟通。" },
      { step: "02", title: "核对关键问题", body: "所需的适配、接口、性能和商务信息取决于所选产品线。" },
      { step: "03", title: "确认项目范围", body: "规格、价格和交期应针对实际项目确认，而不是从初次留言推断。" },
      { step: "04", title: "明确批准节点", body: "提交询盘本身不代表图纸、订单或生产计划已获批准。" },
    ],
    details: { eyebrow: "联系信息", heading: "也可以直接联系我们", body: "如果询盘紧急，或您希望直接沟通，请使用以下已确认的联系方式。办公时间按中国标准时间标注。" },
    aside: {
      eyebrow: "发送前", heading: "哪些信息有助于更快评估报价",
      points: ["提供具体型号与配置，而不仅是系列名称", "说明制动系统或悬挂是否改动", "告知首年的大致需求数量", "说明轮毂将销往哪个市场", "说明使用您的品牌还是我们的品牌"],
    },
    pathways: {
      eyebrow: "还未准备好询价？", heading: "先了解，再沟通",
      links: [
        { eyebrow: "技术文章", title: "适配指南", body: "了解适配测量、偏距以及有助于准确询价的基础知识。", href: "/insights", linkLabel: "打开指南" },
        { eyebrow: "合作项目", title: "经销商供货", body: "若您仍在评估是否开展轮毂业务，可先了解经销商合作方式。", href: "/dealers", linkLabel: "了解合作项目" },
      ],
    },
    seo: { title: "联系丰怀并提交项目询盘", description: "提供需求、图纸或样件以及预计数量，与丰怀讨论轮毂及铝制品等项目的技术范围和报价。" },
  },
  es: {
    hero: {
      eyebrow: "Consulta de proyecto", heading: "Cuéntenos qué necesita adquirir o desarrollar",
      lede: "Elija una línea de producto y envíe sus requisitos, la cantidad prevista y los planos o muestras que ya tenga.",
      supporting: "No necesita tener todas las especificaciones. Los detalles técnicos pendientes se confirman antes de aprobar una oferta o la producción.",
    },
    formHeading: { title: "Consulta de proyecto", body: "Elija una línea de producto y comparta lo que ya sabe. Los detalles técnicos pendientes se pueden confirmar antes de la oferta o la aprobación de producción." },
    whatHappens: {
      eyebrow: "Qué ocurre después", heading: "De su mensaje a una oferta por escrito",
      body: "El registro de la consulta mantiene juntos los datos del proyecto y el número de referencia. El alcance técnico, la cantidad y el mercado de destino se pueden aclarar antes de aprobar una oferta.",
      points: ["Los datos enviados permanecen vinculados a una referencia de consulta", "Se identifican los datos de compatibilidad, interfaz o rendimiento que faltan", "Las especificaciones y condiciones comerciales requieren confirmación para cada proyecto", "La aprobación de producción es independiente de la consulta inicial"],
    },
    steps: [
      { step: "01", title: "Envíe los detalles", body: "Indique vehículo, volumen aproximado, acabado previsto y mercado de destino. Basta con una descripción inicial." },
      { step: "02", title: "Aclaramos las cuestiones clave", body: "Los datos de compatibilidad, interfaz, rendimiento y condiciones comerciales dependen de la línea de producto elegida." },
      { step: "03", title: "Confirmamos el alcance", body: "Cualquier especificación, precio o plazo se confirma para el proyecto real, sin inferirlo del primer mensaje." },
      { step: "04", title: "La aprobación es explícita", body: "Una consulta no aprueba por sí sola un plano, un pedido ni un calendario de producción." },
    ],
    details: { eyebrow: "Datos de contacto", heading: "O contacte directamente", body: "Si su consulta es urgente o prefiere hablarla, utilice los datos confirmados que aparecen abajo. El horario se indica en hora de China." },
    aside: {
      eyebrow: "Antes de enviar", heading: "Datos que agilizan la evaluación de una oferta",
      points: ["Indique el modelo y la versión exactos, no solo la marca", "Mencione cambios en frenos o suspensión", "Estime cuántos juegos necesita el primer año", "Indique el mercado de destino de las llantas", "Aclare si las llantas llevarán su marca o la nuestra"],
    },
    pathways: {
      eyebrow: "¿Aún no va a pedir una oferta?", heading: "Infórmese primero y después hablemos",
      links: [
        { eyebrow: "Artículos", title: "Guías de compatibilidad", body: "Cómo medir la compatibilidad, entender el desplazamiento y preparar una consulta precisa.", href: "/insights", linkLabel: "Abrir las guías" },
        { eyebrow: "Programa", title: "Suministro a distribuidores", body: "Conozca el modelo de colaboración si aún está valorando una línea de llantas.", href: "/dealers", linkLabel: "Ver el programa" },
      ],
    },
    seo: { title: "Contacto y consulta de proyecto | Fenghuai", description: "Envíe requisitos, planos o muestras y cantidades previstas para comentar el alcance técnico y solicitar una oferta a Fenghuai." },
  },
  th: {
    hero: {
      eyebrow: "สอบถามโครงการ", heading: "บอกเราว่าคุณต้องการจัดหาหรือพัฒนาอะไร",
      lede: "เลือกสายผลิตภัณฑ์แล้วส่งความต้องการ จำนวนที่คาดไว้ และแบบหรือตัวอย่างที่มีอยู่",
      supporting: "ไม่จำเป็นต้องมีข้อมูลจำเพาะครบทุกข้อ รายละเอียดทางเทคนิคที่ขาดสามารถยืนยันก่อนอนุมัติใบเสนอราคาหรือการผลิต",
    },
    formHeading: { title: "สอบถามโครงการ", body: "เลือกสายผลิตภัณฑ์และส่งข้อมูลที่คุณมี รายละเอียดทางเทคนิคที่ยังขาดสามารถยืนยันก่อนอนุมัติใบเสนอราคาหรือการผลิต" },
    whatHappens: {
      eyebrow: "ขั้นตอนต่อไป", heading: "จากข้อความของคุณสู่ใบเสนอราคาเป็นลายลักษณ์อักษร",
      body: "บันทึกคำสอบถามจะเก็บรายละเอียดโครงการและหมายเลขอ้างอิงไว้ด้วยกัน จากนั้นจึงชี้แจงขอบเขตทางเทคนิค จำนวน และตลาดปลายทางก่อนอนุมัติใบเสนอราคา",
      points: ["ข้อมูลที่ส่งผูกกับหมายเลขอ้างอิงคำสอบถามเดียว", "สามารถระบุข้อมูลด้านความเข้ากันได้ จุดเชื่อมต่อ หรือสมรรถนะที่ยังขาด", "ข้อมูลจำเพาะและเงื่อนไขการค้าต้องยืนยันสำหรับแต่ละโครงการ", "การอนุมัติการผลิตแยกจากคำสอบถามเบื้องต้น"],
    },
    steps: [
      { step: "01", title: "ส่งรายละเอียด", body: "แจ้งรถ ปริมาณคร่าว ๆ แนวทางผิวสำเร็จ และตลาดที่จะจำหน่าย ข้อมูลเบื้องต้นก็เริ่มต้นได้" },
      { step: "02", title: "สอบถามประเด็นสำคัญ", body: "ข้อมูลความเข้ากันได้ จุดเชื่อมต่อ สมรรถนะ และการค้าจะต่างกันตามสายผลิตภัณฑ์ที่เลือก" },
      { step: "03", title: "ยืนยันขอบเขต", body: "ข้อมูลจำเพาะ ราคา และระยะเวลาต้องยืนยันตามโครงการจริง ไม่อนุมานจากข้อความแรก" },
      { step: "04", title: "อนุมัติอย่างชัดเจน", body: "คำสอบถามไม่ได้เป็นการอนุมัติแบบ คำสั่งซื้อ หรือกำหนดการผลิต" },
    ],
    details: { eyebrow: "ข้อมูลติดต่อ", heading: "หรือติดต่อเราโดยตรง", body: "หากเรื่องเร่งด่วนหรือคุณต้องการพูดคุย โปรดใช้ช่องทางติดต่อที่ยืนยันแล้วด้านล่าง เวลาทำการอ้างอิงเวลามาตรฐานจีน" },
    aside: {
      eyebrow: "ก่อนส่ง", heading: "ข้อมูลที่ช่วยให้ประเมินราคาได้เร็วขึ้น",
      points: ["ระบุรุ่นและรายละเอียดที่ชัดเจน ไม่ใช่เพียงชื่อแบรนด์", "แจ้งการเปลี่ยนแปลงเบรกหรือช่วงล่าง", "ประเมินจำนวนชุดที่ต้องการในปีแรก", "บอกตลาดปลายทางของล้อ", "แจ้งว่าจะใช้แบรนด์ของคุณหรือของเรา"],
    },
    pathways: {
      eyebrow: "ยังไม่พร้อมขอราคา?", heading: "ศึกษาเบื้องต้น แล้วค่อยพูดคุย",
      links: [
        { eyebrow: "บทความ", title: "คู่มือความเข้ากันได้", body: "เรียนรู้วิธีวัดความเข้ากันได้ ค่าออฟเซ็ต และข้อมูลพื้นฐานที่ช่วยให้สอบถามราคาได้แม่นยำ", href: "/insights", linkLabel: "เปิดคู่มือ" },
        { eyebrow: "โครงการ", title: "การจัดหาให้ตัวแทนจำหน่าย", body: "ศึกษารูปแบบการร่วมงานหากคุณยังพิจารณาเริ่มธุรกิจล้อ", href: "/dealers", linkLabel: "ดูโครงการ" },
      ],
    },
    seo: { title: "ติดต่อและสอบถามโครงการ | Fenghuai", description: "ส่งความต้องการ แบบหรือตัวอย่าง และจำนวนที่คาดไว้เพื่อหารือขอบเขตทางเทคนิคและใบเสนอราคากับ Fenghuai" },
  },
};

export function localQuoteBody(locale: Locale): ConversionQuoteBody { return quote[locale]; }
export function localContactBody(locale: Locale): ConversionContactBody { return contact[locale]; }

/** Data-only export for a guarded local WordPress seed; no implicit approval. */
export const conversionPageSeed = { "request-a-quote": quote, contact } as const;
