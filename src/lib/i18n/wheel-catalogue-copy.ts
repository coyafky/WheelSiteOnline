import type { Locale } from "./types";

export type WheelCatalogueCopy = {
  seoTitle: string;
  seoPageTitle: (page: number) => string;
  seoDescription: string;
  resultSearch: (count: number, query: string) => string;
  resultFiltered: (count: number) => string;
  resultAll: (count: number) => string;
  products: string;
  wheels: string;
  eyebrow: string;
  heading: string;
  intro: string;
  boundary: string;
  flowFormedLink: string;
  forgedLink: string;
  resultsLabel: string;
  catalogueDisclosure: string;
  filterTitle: string;
  filterApply: string;
  filterClear: string;
  filterInstructionTitle: string;
  filterInstructionBody: string;
  filterSearch: string;
  filterSearchPlaceholder: string;
  filterPcd: string;
  filterDiameter: string;
  filterWidth: string;
  filterProcess: string;
  filterShowMore: (count: number) => string;
  filterShowFewer: string;
  filterSelected: (count: number) => string;
  filterMatchCount: (count: number) => string;
  filterAvailableCount: (count: number) => string;
  filterLockedProcessNote: (processes: string) => string;
  mobileFilter: string;
  filterClose: string;
  mobileFilterAria: (count: number) => string;
  mobileAllModels: string;
  mobileApplied: (count: number) => string;
  filterFormAria: string;
  filtersAria: string;
  searchChip: (query: string) => string;
  diameterChip: (diameter: string) => string;
  widthChip: (width: string) => string;
  pcdChip: (pcd: string) => string;
  processChip: (process: string) => string;
  appliedFilters: string;
  removeFilter: string;
  clearAll: string;
  sortAria: string;
  sortLabel: string;
  sortApply: string;
  sortModel: string;
  sortDiameterAsc: string;
  sortDiameterDesc: string;
  sortVariants: string;
  emptyAria: string;
  emptyTitle: string;
  emptyBody: string;
  requestReview: string;
  endTitle: string;
  endBody: string;
  pagination: string;
  previous: string;
  next: string;
  pcdSearchPlaceholder: string;
  pcdSearchAria: (group: string) => string;
  pcdClearSearch: string;
  pcdNoMatches: (query: string, total: number) => string;
  pcdShowingAll: (total: number) => string;
  pcdShowingSome: (matched: number, total: number, hidden: number) => string;
  processName: (key: string) => string;
  pcdUi: {
    selected: string;
    showMore: string;
    showFewer: string;
    searchPlaceholder: string;
    searchAria: string;
    clearSearch: string;
    showingAll: string;
    showingSome: string;
    noMatches: string;
  };
};

const copy: Record<Locale, WheelCatalogueCopy> = {
  en: {
    seoTitle: "Wheel Catalogue | Sizes, PCDs & Production Specifications | Fenghuai",
    seoPageTitle: (page) => `Wheel Catalogue — Page ${page} | Sizes, PCDs & Production Specifications | Fenghuai`,
    seoDescription: "Browse approved wheel models by diameter, width, PCD and recorded manufacturing process, then select an actual production configuration for enquiry.",
    resultSearch: (count, query) => `${count} models found for “${query}”`,
    resultFiltered: (count) => `${count} models match the selected production specifications`,
    resultAll: (count) => `${count} published wheel models`,
    products: "Products", wheels: "Wheels", eyebrow: "Wheel catalogue",
    heading: "Find a wheel by verified production specification",
    intro: "Browse published wheel models by diameter, width, PCD and recorded manufacturing process. Every result has an approved image, and every selectable specification comes from an actual recorded variant.",
    boundary: "A catalogue match is a starting point for quotation. Vehicle fitment, brake clearance, load requirements and destination-market documents are confirmed before an order is approved.",
    flowFormedLink: "Browse recorded flow-formed wheels", forgedLink: "Discuss a custom forged wheel",
    resultsLabel: "Wheel catalogue results",
    catalogueDisclosure: "Specifications shown in the catalogue are production records, not a vehicle-fitment guarantee.",
    filterTitle: "Filter by specification", filterApply: "Apply filters", filterClear: "Clear filters",
    filterInstructionTitle: "How filters combine", filterInstructionBody: "Select one or more values in each group. Values in the same group add together.",
    filterSearch: "Model search", filterSearchPlaceholder: "e.g. HP12", filterPcd: "Bolt pattern (PCD)", filterDiameter: "Diameter", filterWidth: "Width", filterProcess: "Recorded process",
    filterShowMore: (count) => `Show ${count} more`, filterShowFewer: "Show fewer", filterSelected: (count) => `${count} selected`,
    filterMatchCount: (count) => `${count} match`, filterAvailableCount: (count) => `${count} available`,
    filterLockedProcessNote: (processes) => `This page only shows models whose production record states one of the following processes: ${processes}. The process filter cannot be widened from the URL.`,
    mobileFilter: "Filter wheels", filterClose: "Close filters", mobileFilterAria: (count) => count ? `Filter wheels, ${count} applied` : "Filter wheels, all models",
    mobileAllModels: "All models", mobileApplied: (count) => `${count} applied`,
    filterFormAria: "Filter the wheel catalogue", filtersAria: "Catalogue filters",
    searchChip: (query) => `Search “${query}”`, diameterChip: (value) => `Diameter ${value}`, widthChip: (value) => `Width ${value}`, pcdChip: (value) => `PCD ${value}`, processChip: (value) => `Process ${value}`,
    appliedFilters: "Applied filters", removeFilter: "Remove filter", clearAll: "Clear all",
    sortAria: "Sort the wheel catalogue", sortLabel: "Sort", sortApply: "Apply", sortModel: "Model A–Z", sortDiameterAsc: "Diameter: low to high", sortDiameterDesc: "Diameter: high to low", sortVariants: "Most recorded configurations",
    emptyAria: "Wheel catalogue empty results", emptyTitle: "No published model matches all selected specifications", emptyBody: "Try removing one filter, check that the selected size and PCD belong to the same required configuration, or send the project details for an engineering review.", requestReview: "Request a wheel review",
    endTitle: "Need a specification that is not listed?", endBody: "Share the vehicle or application, target size, PCD, offset, centre bore, quantity and finish. The team will confirm whether an existing variant or a custom program is the appropriate route.",
    pagination: "Catalogue pagination", previous: "Previous", next: "Next",
    pcdSearchPlaceholder: "e.g. 5x114 or 112", pcdSearchAria: (group) => `Search ${group}`, pcdClearSearch: "Clear search", pcdNoMatches: (query, total) => `No bolt pattern matches “${query}”. Clear the search to see all ${total}.`, pcdShowingAll: (total) => `Showing all ${total}`, pcdShowingSome: (matched, total, hidden) => `${matched} of ${total} — ${hidden} hidden`,
    processName: (key) => ({ "flow-formed": "Flow-formed", "low-pressure-cast": "Low-pressure cast", "low-pressure-flow-formed": "Low-pressure flow-formed", forged: "Forged", "not-specified": "Not specified in source data" })[key] ?? key,
    pcdUi: { selected: "{count} selected", showMore: "Show {count} more", showFewer: "Show fewer", searchPlaceholder: "e.g. 5x114 or 112", searchAria: "Search {group}", clearSearch: "Clear search", showingAll: "Showing all {total}", showingSome: "{matched} of {total} — {hidden} hidden", noMatches: "No bolt pattern matches “{query}”. Clear the search to see all {total}." },
  },
  zh: {
    seoTitle: "轮毂目录 | 尺寸、孔距与生产规格 | 峰徊",
    seoPageTitle: (page) => `轮毂目录 — 第 ${page} 页 | 尺寸、孔距与生产规格 | 峰徊`,
    seoDescription: "按直径、宽度、孔距和已记录工艺浏览已批准的轮毂型号，并选择真实生产配置提交询盘。",
    resultSearch: (count, query) => `找到 ${count} 个包含“${query}”的型号`, resultFiltered: (count) => `有 ${count} 个型号符合所选生产规格`, resultAll: (count) => `已发布 ${count} 个轮毂型号`,
    products: "产品", wheels: "轮毂", eyebrow: "轮毂目录", heading: "按已核实的生产规格查找轮毂",
    intro: "按直径、宽度、孔距和已记录的制造工艺浏览已发布型号。每条结果均有已批准图片，每项可选规格均来自真实生产配置。",
    boundary: "目录匹配结果仅用于开始询价。订单获批前，需确认车辆适配、制动间隙、载荷要求及目标市场所需文件。",
    flowFormedLink: "查看已记录的旋压轮毂", forgedLink: "沟通定制锻造轮毂", resultsLabel: "轮毂目录结果",
    catalogueDisclosure: "目录所示规格是生产记录，不构成车辆适配保证。",
    filterTitle: "按规格筛选", filterApply: "应用筛选", filterClear: "清除筛选", filterInstructionTitle: "筛选条件如何组合", filterInstructionBody: "每组可选择一个或多个值。同一组中的多个值按“或”匹配。",
    filterSearch: "型号搜索", filterSearchPlaceholder: "例如 HP12", filterPcd: "孔距（PCD）", filterDiameter: "直径", filterWidth: "宽度", filterProcess: "已记录工艺",
    filterShowMore: (count) => `再显示 ${count} 项`, filterShowFewer: "收起", filterSelected: (count) => `已选 ${count} 项`, filterMatchCount: (count) => `匹配 ${count} 个`, filterAvailableCount: (count) => `共 ${count} 个`,
    filterLockedProcessNote: (processes) => `此页面仅显示生产记录中标注以下工艺的型号：${processes}。无法通过 URL 扩大工艺范围。`,
    mobileFilter: "筛选轮毂", filterClose: "关闭筛选", mobileFilterAria: (count) => count ? `筛选轮毂，已应用 ${count} 项` : "筛选轮毂，显示全部型号", mobileAllModels: "全部型号", mobileApplied: (count) => `已应用 ${count} 项`, filterFormAria: "筛选轮毂目录", filtersAria: "目录筛选条件",
    searchChip: (query) => `搜索“${query}”`, diameterChip: (value) => `直径 ${value}`, widthChip: (value) => `宽度 ${value}`, pcdChip: (value) => `孔距 ${value}`, processChip: (value) => `工艺 ${value}`, appliedFilters: "已应用的筛选", removeFilter: "移除筛选", clearAll: "全部清除",
    sortAria: "轮毂目录排序", sortLabel: "排序", sortApply: "应用", sortModel: "型号 A–Z", sortDiameterAsc: "直径：从小到大", sortDiameterDesc: "直径：从大到小", sortVariants: "生产配置数最多",
    emptyAria: "轮毂目录无匹配结果", emptyTitle: "没有型号符合全部所选规格", emptyBody: "请尝试移除一项筛选，确认所选尺寸与孔距属于同一条生产配置，或提交项目资料进行工程评估。", requestReview: "申请轮毂评估",
    endTitle: "没有找到所需规格？", endBody: "请提供车辆或应用、目标尺寸、孔距、偏距、中心孔、数量和表面处理。团队会确认现有配置或定制项目哪种方式更合适。",
    pagination: "目录分页", previous: "上一页", next: "下一页", pcdSearchPlaceholder: "例如 5x114 或 112", pcdSearchAria: (group) => `搜索${group}`, pcdClearSearch: "清除搜索", pcdNoMatches: (query, total) => `没有匹配“${query}”的孔距。清除搜索以查看全部 ${total} 项。`, pcdShowingAll: (total) => `显示全部 ${total} 项`, pcdShowingSome: (matched, total, hidden) => `显示 ${matched}/${total} 项，已隐藏 ${hidden} 项`,
    processName: (key) => ({ "flow-formed": "旋压", "low-pressure-cast": "低压铸造", "low-pressure-flow-formed": "低压铸造旋压", forged: "锻造", "not-specified": "源数据未注明" })[key] ?? key,
    pcdUi: { selected: "已选 {count} 项", showMore: "再显示 {count} 项", showFewer: "收起", searchPlaceholder: "例如 5x114 或 112", searchAria: "搜索{group}", clearSearch: "清除搜索", showingAll: "显示全部 {total} 项", showingSome: "显示 {matched}/{total} 项，已隐藏 {hidden} 项", noMatches: "没有匹配“{query}”的孔距。清除搜索以查看全部 {total} 项。" },
  },
  es: {
    seoTitle: "Catálogo de ruedas | Medidas, PCD y especificaciones de producción | Fenghuai",
    seoPageTitle: (page) => `Catálogo de ruedas — Página ${page} | Medidas, PCD y especificaciones | Fenghuai`, seoDescription: "Explore modelos de ruedas aprobados por diámetro, anchura, PCD y proceso registrado; después seleccione una configuración real para solicitar información.",
    resultSearch: (count, query) => `${count} modelos encontrados para “${query}”`, resultFiltered: (count) => `${count} modelos coinciden con las especificaciones seleccionadas`, resultAll: (count) => `${count} modelos de ruedas publicados`,
    products: "Productos", wheels: "Ruedas", eyebrow: "Catálogo de ruedas", heading: "Encuentre una rueda por especificaciones de producción verificadas",
    intro: "Explore modelos publicados por diámetro, anchura, PCD y proceso de fabricación registrado. Cada resultado tiene una imagen aprobada y cada especificación seleccionable procede de una variante real registrada.", boundary: "Una coincidencia del catálogo es un punto de partida para solicitar presupuesto. Antes de aprobar un pedido se confirman la compatibilidad del vehículo, el espacio para frenos, la carga y los documentos del mercado de destino.",
    flowFormedLink: "Ver ruedas conformadas por flujo registradas", forgedLink: "Consultar una rueda forjada a medida", resultsLabel: "Resultados del catálogo de ruedas", catalogueDisclosure: "Las especificaciones del catálogo son registros de producción, no una garantía de compatibilidad con el vehículo.",
    filterTitle: "Filtrar por especificación", filterApply: "Aplicar filtros", filterClear: "Borrar filtros", filterInstructionTitle: "Cómo se combinan los filtros", filterInstructionBody: "Seleccione uno o varios valores en cada grupo. Los valores del mismo grupo se combinan.",
    filterSearch: "Buscar modelo", filterSearchPlaceholder: "p. ej., HP12", filterPcd: "Patrón de pernos (PCD)", filterDiameter: "Diámetro", filterWidth: "Anchura", filterProcess: "Proceso registrado", filterShowMore: (count) => `Mostrar ${count} más`, filterShowFewer: "Mostrar menos", filterSelected: (count) => `${count} seleccionados`, filterMatchCount: (count) => `${count} coinciden`, filterAvailableCount: (count) => `${count} disponibles`, filterLockedProcessNote: (processes) => `Esta página solo muestra modelos cuyo registro de producción indica uno de estos procesos: ${processes}. La URL no permite ampliar el filtro de proceso.`,
    mobileFilter: "Filtrar ruedas", filterClose: "Cerrar filtros", mobileFilterAria: (count) => count ? `Filtrar ruedas, ${count} aplicados` : "Filtrar ruedas, todos los modelos", mobileAllModels: "Todos los modelos", mobileApplied: (count) => `${count} aplicados`, filterFormAria: "Filtrar el catálogo de ruedas", filtersAria: "Filtros del catálogo",
    searchChip: (query) => `Buscar “${query}”`, diameterChip: (value) => `Diámetro ${value}`, widthChip: (value) => `Anchura ${value}`, pcdChip: (value) => `PCD ${value}`, processChip: (value) => `Proceso ${value}`, appliedFilters: "Filtros aplicados", removeFilter: "Quitar filtro", clearAll: "Borrar todo",
    sortAria: "Ordenar el catálogo de ruedas", sortLabel: "Ordenar", sortApply: "Aplicar", sortModel: "Modelo A–Z", sortDiameterAsc: "Diámetro: de menor a mayor", sortDiameterDesc: "Diámetro: de mayor a menor", sortVariants: "Más configuraciones registradas",
    emptyAria: "Sin resultados en el catálogo de ruedas", emptyTitle: "Ningún modelo publicado coincide con todas las especificaciones seleccionadas", emptyBody: "Pruebe a quitar un filtro, compruebe que la medida y el PCD seleccionados pertenecen a la misma configuración o envíe los detalles del proyecto para una revisión de ingeniería.", requestReview: "Solicitar revisión de rueda",
    endTitle: "¿Necesita una especificación que no aparece?", endBody: "Indique el vehículo o la aplicación, la medida objetivo, el PCD, el desplazamiento, el diámetro central, la cantidad y el acabado. El equipo confirmará si corresponde una variante existente o un programa a medida.",
    pagination: "Paginación del catálogo", previous: "Anterior", next: "Siguiente", pcdSearchPlaceholder: "p. ej., 5x114 o 112", pcdSearchAria: (group) => `Buscar ${group}`, pcdClearSearch: "Borrar búsqueda", pcdNoMatches: (query, total) => `Ningún patrón coincide con “${query}”. Borre la búsqueda para ver los ${total}.`, pcdShowingAll: (total) => `Se muestran los ${total}`, pcdShowingSome: (matched, total, hidden) => `${matched} de ${total} — ${hidden} ocultos`,
    processName: (key) => ({ "flow-formed": "Flow forming", "low-pressure-cast": "Fundición a baja presión", "low-pressure-flow-formed": "Conformado por flujo a baja presión", forged: "Forjado", "not-specified": "No especificado en los datos fuente" })[key] ?? key,
    pcdUi: { selected: "{count} seleccionados", showMore: "Mostrar {count} más", showFewer: "Mostrar menos", searchPlaceholder: "p. ej., 5x114 o 112", searchAria: "Buscar {group}", clearSearch: "Borrar búsqueda", showingAll: "Se muestran los {total}", showingSome: "{matched} de {total} — {hidden} ocultos", noMatches: "Ningún patrón coincide con “{query}”. Borre la búsqueda para ver los {total}." },
  },
  th: {
    seoTitle: "แค็ตตาล็อกล้อ | ขนาด PCD และข้อมูลจำเพาะการผลิต | Fenghuai", seoPageTitle: (page) => `แค็ตตาล็อกล้อ — หน้า ${page} | ขนาด PCD และข้อมูลจำเพาะ | Fenghuai`, seoDescription: "เรียกดูรุ่นล้อที่อนุมัติตามเส้นผ่านศูนย์กลาง ความกว้าง PCD และกระบวนการผลิตที่บันทึกไว้ แล้วเลือกการกำหนดค่าการผลิตจริงเพื่อสอบถาม",
    resultSearch: (count, query) => `พบ ${count} รุ่นสำหรับ “${query}”`, resultFiltered: (count) => `${count} รุ่นตรงกับข้อมูลจำเพาะการผลิตที่เลือก`, resultAll: (count) => `ล้อที่เผยแพร่แล้ว ${count} รุ่น`,
    products: "ผลิตภัณฑ์", wheels: "ล้อรถยนต์", eyebrow: "แค็ตตาล็อกล้อ", heading: "ค้นหาล้อตามข้อมูลการผลิตที่ตรวจสอบแล้ว",
    intro: "เรียกดูรุ่นที่เผยแพร่ตามเส้นผ่านศูนย์กลาง ความกว้าง PCD และกระบวนการผลิตที่บันทึกไว้ ทุกรายการมีภาพที่อนุมัติ และข้อมูลจำเพาะที่เลือกได้มาจากรูปแบบการผลิตจริงที่บันทึกไว้",
    boundary: "ผลลัพธ์ที่ตรงในแค็ตตาล็อกเป็นเพียงจุดเริ่มต้นของการขอราคา ก่อนอนุมัติคำสั่งซื้อจะต้องยืนยันความเข้ากันได้กับรถ ระยะห่างเบรก ข้อกำหนดน้ำหนักบรรทุก และเอกสารของตลาดปลายทาง",
    flowFormedLink: "ดูล้อขึ้นรูปแบบ Flow Formed ที่บันทึกไว้", forgedLink: "ปรึกษาเรื่องล้อฟอร์จสั่งทำ", resultsLabel: "ผลลัพธ์แค็ตตาล็อกล้อ", catalogueDisclosure: "ข้อมูลจำเพาะในแค็ตตาล็อกเป็นบันทึกการผลิต ไม่ใช่การรับประกันว่าใช้ได้กับรถทุกรุ่น",
    filterTitle: "กรองตามข้อมูลจำเพาะ", filterApply: "ใช้ตัวกรอง", filterClear: "ล้างตัวกรอง", filterInstructionTitle: "ตัวกรองทำงานร่วมกันอย่างไร", filterInstructionBody: "เลือกได้ตั้งแต่หนึ่งค่าขึ้นไปในแต่ละกลุ่ม ค่าภายในกลุ่มเดียวกันจะถูกรวมเข้าด้วยกัน",
    filterSearch: "ค้นหารุ่น", filterSearchPlaceholder: "เช่น HP12", filterPcd: "รูปแบบรูน็อต (PCD)", filterDiameter: "เส้นผ่านศูนย์กลาง", filterWidth: "ความกว้าง", filterProcess: "กระบวนการที่บันทึกไว้", filterShowMore: (count) => `แสดงเพิ่ม ${count} รายการ`, filterShowFewer: "แสดงน้อยลง", filterSelected: (count) => `เลือกแล้ว ${count} รายการ`, filterMatchCount: (count) => `ตรงกัน ${count} รุ่น`, filterAvailableCount: (count) => `มี ${count} รุ่น`, filterLockedProcessNote: (processes) => `หน้านี้แสดงเฉพาะรุ่นที่บันทึกกระบวนการผลิตอย่างใดอย่างหนึ่งต่อไปนี้: ${processes} ไม่สามารถขยายตัวกรองกระบวนการผ่าน URL ได้`,
    mobileFilter: "กรองล้อ", filterClose: "ปิดตัวกรอง", mobileFilterAria: (count) => count ? `กรองล้อ ใช้ตัวกรองแล้ว ${count} รายการ` : "กรองล้อ ทุกรุ่น", mobileAllModels: "ทุกรุ่น", mobileApplied: (count) => `ใช้แล้ว ${count} รายการ`, filterFormAria: "กรองแค็ตตาล็อกล้อ", filtersAria: "ตัวกรองแค็ตตาล็อก",
    searchChip: (query) => `ค้นหา “${query}”`, diameterChip: (value) => `เส้นผ่านศูนย์กลาง ${value}`, widthChip: (value) => `ความกว้าง ${value}`, pcdChip: (value) => `PCD ${value}`, processChip: (value) => `กระบวนการ ${value}`, appliedFilters: "ตัวกรองที่ใช้แล้ว", removeFilter: "นำตัวกรองออก", clearAll: "ล้างทั้งหมด",
    sortAria: "เรียงแค็ตตาล็อกล้อ", sortLabel: "เรียงตาม", sortApply: "ใช้", sortModel: "รุ่น A–Z", sortDiameterAsc: "เส้นผ่านศูนย์กลาง: น้อยไปมาก", sortDiameterDesc: "เส้นผ่านศูนย์กลาง: มากไปน้อย", sortVariants: "รูปแบบการผลิตที่บันทึกไว้มากที่สุด",
    emptyAria: "ไม่พบผลลัพธ์ในแค็ตตาล็อกล้อ", emptyTitle: "ไม่มีรุ่นที่เผยแพร่ตรงกับข้อมูลจำเพาะที่เลือกทั้งหมด", emptyBody: "ลองนำตัวกรองออกหนึ่งรายการ ตรวจสอบว่าขนาดและ PCD ที่เลือกอยู่ในรูปแบบการผลิตเดียวกัน หรือส่งรายละเอียดโครงการเพื่อให้วิศวกรประเมิน", requestReview: "ขอให้ตรวจสอบล้อ",
    endTitle: "ต้องการข้อมูลจำเพาะที่ไม่มีในรายการหรือไม่", endBody: "แจ้งรถหรือการใช้งาน ขนาดเป้าหมาย PCD ออฟเซ็ต รูเพลากลาง จำนวน และผิวสำเร็จ ทีมงานจะยืนยันว่าควรใช้รูปแบบที่มีอยู่หรือโครงการสั่งทำ",
    pagination: "การแบ่งหน้าแค็ตตาล็อก", previous: "ก่อนหน้า", next: "ถัดไป", pcdSearchPlaceholder: "เช่น 5x114 หรือ 112", pcdSearchAria: (group) => `ค้นหา${group}`, pcdClearSearch: "ล้างการค้นหา", pcdNoMatches: (query, total) => `ไม่พบรูปแบบรูน็อตที่ตรงกับ “${query}” ล้างการค้นหาเพื่อดูทั้งหมด ${total} รายการ`, pcdShowingAll: (total) => `แสดงทั้งหมด ${total} รายการ`, pcdShowingSome: (matched, total, hidden) => `แสดง ${matched} จาก ${total} ซ่อน ${hidden} รายการ`,
    processName: (key) => ({ "flow-formed": "Flow Formed", "low-pressure-cast": "หล่อแรงดันต่ำ", "low-pressure-flow-formed": "ขึ้นรูปแบบ Flow Formed แรงดันต่ำ", forged: "ฟอร์จ", "not-specified": "ไม่ได้ระบุในข้อมูลต้นทาง" })[key] ?? key,
    pcdUi: { selected: "เลือกแล้ว {count} รายการ", showMore: "แสดงเพิ่ม {count} รายการ", showFewer: "แสดงน้อยลง", searchPlaceholder: "เช่น 5x114 หรือ 112", searchAria: "ค้นหา{group}", clearSearch: "ล้างการค้นหา", showingAll: "แสดงทั้งหมด {total} รายการ", showingSome: "แสดง {matched} จาก {total} ซ่อน {hidden} รายการ", noMatches: "ไม่พบรูปแบบรูน็อตที่ตรงกับ “{query}” ล้างการค้นหาเพื่อดูทั้งหมด {total} รายการ" },
  },
};

export function wheelCatalogueCopyFor(locale: Locale): WheelCatalogueCopy {
  return copy[locale];
}
