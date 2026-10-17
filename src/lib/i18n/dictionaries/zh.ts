import type { Dictionary } from "../types";

/**
 * 中文字典 —— 与 `en.ts` 及其它公开语言键集必须完全一致。
 *
 * ⚠️ 缺键会静默回退到英文，运行时看不出问题 → 新增键必须两边同时加。
 * 语料依据：`assets/site-data/峰徊科技独立站-中英内容语料库.md`（峰徊画册中英对照）。
 */

export const zh: Dictionary = {
  // ── 导航 ───────────────────────────────────────────────────────────────
  "nav.products": "产品中心",
  "nav.products.allWheels": "全部轮毂",
  "nav.products.wheels": "轮毂",
  "nav.products.evComponents": "新能源三电壳体",
  "nav.products.customAluminum": "铝制品定制",
  "nav.products.safetyTires": "自密封轮胎",
  "nav.gallery": "画廊",
  "nav.fitment": "车型适配",
  "nav.capabilities": "制造与质量",
  "nav.customDevelopment": "定制开发",
  "nav.dealerPrograms": "经销商项目",
  "nav.insights": "技术与见解",
"nav.resources": "技术与见解",
  "nav.tools": "工具",
  "nav.products.allLines": "全部产品线",
"nav.dealers.supply": "经销商供货",
"nav.dealers.privateLabel": "贴牌代工",
"nav.insights.allGuides": "全部指南",
"nav.insights.boltPatterns": "孔距指南",
"nav.about": "关于我们",

  // ── 行动号召 ───────────────────────────────────────────────────────────
  "cta.requestQuote": "获取报价",
  "cta.viewRange": "查看产品线",
  "cta.backToTop": "回到顶部",
  // 共享 <DealerCta> 的默认文案：所有裸 `<DealerCta />` 调用点共用。
  // 有自己说法的页面通过 title/body 覆盖，默认值只是兜底。
  "cta.enquiriesEyebrow": "询盘",
  "cta.dealerTitle": "告诉我们这个零件要做到什么",
  "cta.dealerBody": "请提供图纸、样件或目标规格。我们会回复工艺路线、模具方案与价格。",

  // ── 产品中心页面框架（/products）───────────────────────────────────────
  // 产品中心的正文由 WordPress 提供；这里是写在 JSX 里的固定文案。
  "catalogue.families.eyebrow": "四条产品线",
  "catalogue.families.heading": "四条产品线，一个项目接口",
  "catalogue.families.lede": "轮毂、电驱壳体、定制铝制品与自密封轮胎分别采用适用的制造路线，由对应的专业生产基地承接。",
  "catalogue.card.explore": "了解详情",
  "catalogue.fitmentLink": "适配资料",
  "catalogue.resources.eyebrow": "继续了解",
  "catalogue.resources.heading": "相关资料",
  "catalogue.faq.eyebrow": "常见问题",
  "catalogue.faq.heading": "下单前的常见问题",
  "catalogue.faq.lede": "经销商在首次下单前最常问的问题。如果你的问题不在这里，请直接问我们 —— 我们宁愿提前答复，也不愿在订单阶段才发现。",
  "brand.division": "制造",
  "breadcrumb.label": "面包屑导航",
  "breadcrumb.home": "首页",
  "outline.heading": "本页内容",
  "outline.label": "页面章节",

  // ── 首页采购起点 ──────────────────────────────────────────────────────
  "home.intent.eyebrow": "从你已有的资料开始",
  "home.intent.heading": "你想开发或采购什么？",
  "home.intent.wheelModel": "我已有轮毂型号",
  "home.intent.wheelModelHint": "从型号、编码或适配要求开始。",
  "home.intent.drawingSample": "我有图纸或样件",
  "home.intent.drawingSampleHint": "提交需求，我们会转给对应产品线。",
  "home.intent.productLine": "我正在了解产品线",
  "home.intent.productLineHint": "比较四条制造路径。",

  // ── 无障碍标签 ─────────────────────────────────────────────────────────
  "a11y.primaryNav": "主导航",
  "a11y.mobileNav": "移动端导航",
  "a11y.footerNav": "页脚导航",
  "a11y.openNav": "打开导航",
  "a11y.closeNav": "关闭导航",
  "a11y.switchLanguage": "切换语言",
  "a11y.toggleSubmenu": "切换以下项目的子菜单：",
  "a11y.siteHome": "丰怀首页",
  "error.notFound.heading": "页面不存在",
  "error.notFound.body": "页面可能已移动，或者链接有误。",
  "error.notFound.cta": "返回首页",
  "error.generic.heading": "页面加载出错",
  "error.generic.body": "暂时无法加载此页面，请重试。",
  "error.generic.retry": "重试",

  // ── 页脚 ───────────────────────────────────────────────────────────────
  "footer.tagline1": "四条汽车产品线 ——",
  "footer.tagline2": "轮毂 · 电驱壳体 · 定制铝制品 · 自密封轮胎",
  "footer.rights": "版权所有",
  "footer.ctaEyebrow": "开始沟通生产需求",
  "footer.ctaHeading": "把需求交给我们",
  "footer.ctaBody": "请提供图纸、适配要求或供货需求。我们会将询盘转给对应产品线，并回复下一步需要确认的信息。",
  "footer.group.products": "产品",
  "footer.group.company": "公司",
  "footer.support.warranty": "质保政策",
"footer.support.returns": "退换货政策",
"footer.support.shipping": "运输与包装",
"footer.support.terms": "服务条款",
"footer.support.privacy": "隐私政策",
"footer.enquiries.contact": "联系我们",
"footer.enquiries.offsetCalculator": "偏距计算器",
"footer.group.support": "支持",
  "footer.group.enquiries": "业务咨询",
};
