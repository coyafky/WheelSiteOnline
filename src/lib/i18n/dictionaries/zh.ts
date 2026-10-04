import type { Dictionary } from "../types";

/**
 * 中文字典 —— 与 `en.ts` 键集必须完全一致。
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
  "nav.products.safetyTires": "安全轮胎",
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

  // ── 无障碍标签 ─────────────────────────────────────────────────────────
  "a11y.primaryNav": "主导航",
  "a11y.mobileNav": "移动端导航",
  "a11y.footerNav": "页脚导航",
  "a11y.openNav": "打开导航",
  "a11y.closeNav": "关闭导航",
  "a11y.switchLanguage": "切换语言",

  // ── 页脚 ───────────────────────────────────────────────────────────────
  "footer.tagline1": "四条产品线的铝制部件制造商 ——",
  "footer.tagline2": "轮毂 · 三电壳体 · 铝制品定制 · 安全轮胎",
  "footer.rights": "版权所有",
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
