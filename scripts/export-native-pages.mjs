#!/usr/bin/env node

/**
 * 把现有已审核 TypeScript 页面对象导出成 WordPress 原生 Page 的迁移包。
 * 这是 expand–migrate–contract 的迁移输入，不是运行时数据源。
 */

import { writeFile } from "node:fs/promises";

const [{ homepageContent }, { aboutContent }, { wheelManufacturingCapabilities }, { productLines }, { evHousingPage }, { customAluminumPage }, { selfSealingTirePage }, { inquiryFormUi, inquiryPreparation }, { quoteContextBarCopy, quoteDataNotice, quoteFormHeading, requestQuoteFormCopy, requestQuoteHero }, { thankYouConfirm, thankYouResponsePromise, thankYouUnverified, thankYouUrgentContact }] = await Promise.all([
  import("../src/content/homepage.ts"),
  import("../src/content/about.ts"),
  import("../src/content/wheel-capabilities.ts"),
  import("../src/content/product-lines.ts"),
  import("../src/content/ev-components.ts"),
  import("../src/content/custom-aluminum.ts"),
  import("../src/content/safety-tires.ts"),
  import("../src/content/inquiry-form.ts"),
  import("../src/content/request-a-quote.ts"),
  import("../src/content/thank-you.ts"),
]);

const mediaId = (value) => Number.isInteger(value?.wordpressId) ? value.wordpressId : 0;
const records = [
  { key: "home", slug: "home", title: "Fenghuai Home", content: homepageContent, seoTitle: "Fenghuai | Wheels, EV Housings, Custom Aluminum & Safety Tires", seoDescription: "Explore Fenghuai's four automotive product lines, manufacturing capabilities, project process and inquiry entry point for global B2B programs.", mediaId: mediaId(homepageContent.hero.media) },
  { key: "about", slug: "about", title: "About Fenghuai", content: aboutContent, seoTitle: "About Fenghuai | Automotive Component Manufacturing", seoDescription: "Meet Shenzhen Fenghuai Technology and the specialized manufacturing bases supporting wheel, EV aluminum, custom aluminum and self-sealing tyre programs.", mediaId: mediaId(aboutContent.wheelFactory.heroMedia) },
  { key: "capabilities", slug: "capabilities", title: "Wheel Manufacturing & Quality Capabilities", content: wheelManufacturingCapabilities, seoTitle: "Wheel Manufacturing & Quality Capabilities", seoDescription: "Review Fenghuai wheel engineering, forming-route selection, process inspection, validation equipment and the evidence required for an approved wheel program.", mediaId: 0 },
  { key: "product-lines", slug: "products", title: "Product Lines", content: productLines, seoTitle: "Automotive Product Lines | Fenghuai", seoDescription: "Explore Fenghuai wheels, EV aluminum housings, custom aluminum development and self-sealing tire programs.", mediaId: 0 },
  { key: "ev-components", slug: "ev-components", title: "EV Aluminum Housings", content: evHousingPage, seoTitle: "EV Motor & Controller Aluminum Housings | Engineering Assessment | Fenghuai", seoDescription: "Review supplier-supported aluminum housing categories for EV motor and controller projects, then submit drawing, cooling, sealing and volume requirements for engineering assessment.", mediaId: mediaId(evHousingPage.hero.media) },
  { key: "custom-aluminum", slug: "custom-aluminum", title: "Custom Aluminum Components", content: customAluminumPage, seoTitle: "Custom Aluminum Components | Drawing & Sample Assessment | Fenghuai", seoDescription: "Start a drawing-led aluminum component assessment with 2D drawings, 3D data or a physical sample, covering DFM, tooling, first article and supplier-supported production.", mediaId: mediaId(customAluminumPage.hero.media) },
  { key: "safety-tires", slug: "safety-tires", title: "Self-Sealing Tyres", content: selfSealingTirePage, seoTitle: "Self-Sealing Tyres | Puncture Response & Test Conditions", seoDescription: "Learn how an inner-liner sealing layer responds to an applicable tread puncture, what the supplier-stated test condition means, and which documents to confirm.", mediaId: mediaId(selfSealingTirePage.hero.media) },
  { key: "request-a-quote", slug: "request-a-quote", title: "Request a Quote", content: { hero: requestQuoteHero, contextBar: quoteContextBarCopy, formHeading: quoteFormHeading, formCopy: requestQuoteFormCopy, dataNotice: quoteDataNotice, formUi: inquiryFormUi, preparation: inquiryPreparation, privacyVersion: process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION ?? "", privacy: { version: process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION ?? "", consentText: inquiryFormUi.privacyConsent, linkLabel: inquiryFormUi.privacyLinkLabel, linkHref: inquiryFormUi.privacyHref }, thankYou: { confirm: thankYouConfirm, unverified: thankYouUnverified, response: thankYouResponsePromise, urgent: thankYouUrgentContact } }, seoTitle: "Request a Quote | Fenghuai", seoDescription: "Send Fenghuai a project enquiry for wheels, EV components, custom aluminum parts or self-sealing tires.", mediaId: 0, publicationStatus: process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION ? "approved" : "draft" },
  { key: "privacy", slug: "privacy", title: "Privacy Policy", content: { version: process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION ?? "", consentText: inquiryFormUi.privacyConsent, linkLabel: inquiryFormUi.privacyLinkLabel, linkHref: inquiryFormUi.privacyHref }, seoTitle: "Privacy Policy | Fenghuai", seoDescription: "Learn how Fenghuai uses enquiry information and how consent is recorded.", mediaId: 0, publicationStatus: process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION ? "approved" : "draft" },
  { key: "thank-you", slug: "thank-you", title: "Inquiry Received", content: { confirm: thankYouConfirm, unverified: thankYouUnverified, response: thankYouResponsePromise, urgent: thankYouUrgentContact }, seoTitle: "Inquiry Received | Fenghuai", seoDescription: "Confirmation of a Fenghuai project enquiry.", mediaId: 0 },
].map((record) => ({
  ...record,
  contentByLocale: { en: record.content },
  seoByLocale: {
    en: { title: record.seoTitle, description: record.seoDescription },
  },
  localeStatus: { en: "approved" },
  publicationStatus: record.publicationStatus ?? "approved",
}));

const output = process.argv[2] ?? "/tmp/fenghuai-native-pages.json";
await writeFile(output, JSON.stringify({ version: 1, records }, null, 2));
console.log(`已导出 ${records.length} 个原生 Page 迁移记录：${output}`);
