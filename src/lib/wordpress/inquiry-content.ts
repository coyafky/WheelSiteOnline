import "server-only";

import { getLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { inquiryFormUiFor, inquiryPreparationFor } from "@/lib/i18n/inquiry-form-copy";
import {
  inquiryFormUi as localFormUi,
  inquiryPreparation as localPreparation,
  type InquiryFormUi,
  type InquiryPreparation,
} from "@/content/inquiry-form";
import {
  quoteContextBarCopy as localContextBar,
  quoteDataNotice as localDataNotice,
  quoteFormHeading as localFormHeading,
  requestQuoteFormCopy as localFormCopy,
  requestQuoteHero as localHero,
} from "@/content/request-a-quote";
import {
  thankYouConfirm as localThankYouConfirm,
  thankYouResponsePromise as localThankYouResponse,
  thankYouUnverified as localThankYouUnverified,
  thankYouUrgentContact as localThankYouUrgent,
} from "@/content/thank-you";
import { getWpConfig, wpRead } from "./client";
import {
  normalizeWordpressPage,
  SITE_PAGES_CACHE_TAG,
  type SitePageDocument,
  type WordpressPageCollection,
} from "./pages-contract";

export type InquiryContent = {
  hero: typeof localHero;
  contextBar: typeof localContextBar;
  formHeading: typeof localFormHeading;
  formCopy: typeof localFormCopy;
  dataNotice: typeof localDataNotice;
  formUi: InquiryFormUi;
  preparation: InquiryPreparation;
  privacyVersion: string;
  privacy: {
    version: string;
    consentText: string;
    linkLabel: string;
    linkHref: string;
  };
  thankYou: {
    confirm: typeof localThankYouConfirm;
    unverified: typeof localThankYouUnverified;
    response: typeof localThankYouResponse;
    urgent: typeof localThankYouUrgent;
  };
};

type PrivacyPageContent = {
  version: string;
  consentText: string;
  linkLabel: string;
  linkHref: string;
};

const localPrivacy = {
  version: process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION?.trim() ?? "",
  consentText: localFormUi.privacyConsent,
  linkLabel: localFormUi.privacyLinkLabel,
  linkHref: localFormUi.privacyHref,
};

const localContent: InquiryContent = {
  hero: localHero,
  contextBar: localContextBar,
  formHeading: localFormHeading,
  formCopy: localFormCopy,
  dataNotice: localDataNotice,
  formUi: localFormUi,
  preparation: localPreparation,
  privacyVersion: localPrivacy.version,
  privacy: localPrivacy,
  thankYou: {
    confirm: localThankYouConfirm,
    unverified: localThankYouUnverified,
    response: localThankYouResponse,
    urgent: localThankYouUrgent,
  },
};

function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function string(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function stringValue(value: unknown): value is string {
  return typeof value === "string";
}

function hasStrings(value: unknown, keys: string[]): boolean {
  const candidate = object(value);
  return Boolean(candidate && keys.every((key) => string(candidate[key])));
}

function isFormUi(value: unknown): value is InquiryFormUi {
  const candidate = object(value);
  const validation = candidate ? object(candidate.validationMessages) : null;
  const validationKeys = [
    "customerType", "productLine", "message", "quantity", "inputsAvailable",
    "name", "email", "country", "company", "whatsapp", "privacyConsent",
  ];
  return Boolean(
    candidate &&
      hasStrings(candidate, [
        "ariaLabel", "stepOne", "stepTwo", "progressLabel", "projectStepLabel",
        "contactStepLabel", "completedLabel", "editProjectLabel", "stepOneTitle",
        "stepTwoTitle", "stepOneDescription", "stepTwoDescription", "requiredNote",
        "optional", "customerTypeLabel", "productLineLabel", "productLinePlaceholder",
        "messageLabel", "messageHelp", "quantityLabel", "quantityPlaceholder",
        "inputsLabel", "continueLabel", "backLabel", "nameLabel", "emailLabel",
        "countryLabel", "countryHelp", "companyLabel", "phoneLabel", "privacyConsent",
        "privacyLinkLabel", "privacyHref", "submitLabel", "submittingLabel",
        "formUnavailableTitle", "formUnavailableBody", "rateLimited", "referenceLabel",
        "notSpecified",
      ]) &&
      Array.isArray(candidate.customerTypes) &&
      Array.isArray(candidate.inputs) &&
      validation &&
      validationKeys.every((key) => string(validation[key])),
  );
}

function isPreparation(value: unknown): value is InquiryPreparation {
  const candidate = object(value);
  const lines = candidate ? object(candidate.byProductLine) : null;
  return Boolean(
    candidate &&
      string(candidate.label) &&
      Array.isArray(candidate.generic) &&
      lines &&
      Object.values(lines).every((line) => Array.isArray(line)),
  );
}

function isContent(value: unknown): value is InquiryContent {
  const candidate = object(value);
  const privacy = candidate ? object(candidate.privacy) : null;
  const thankYou = candidate ? object(candidate.thankYou) : null;
  return Boolean(
    candidate &&
      hasStrings(candidate.hero, ["eyebrow", "heading", "lede"]) &&
      hasStrings(candidate.contextBar, ["eyebrow", "carryOver", "notThis", "changeModel", "changeHref"]) &&
      hasStrings(candidate.formHeading, ["title", "body"]) &&
      hasStrings(candidate.formCopy, [
        "requiredNote", "optional", "submit", "submitting", "successTitle", "successBody",
        "resetLabel", "errorSummaryTitle", "errorSummaryBody", "networkErrorTitle",
        "networkErrorBody", "pendingDeliveryNote",
      ]) &&
      hasStrings(candidate.dataNotice, ["eyebrow", "body", "footLabel", "footHref"]) &&
      isFormUi(candidate.formUi) &&
      isPreparation(candidate.preparation) &&
      stringValue(candidate.privacyVersion) &&
      privacy &&
      stringValue(privacy.version) &&
      string(privacy.consentText) &&
      string(privacy.linkLabel) &&
      string(privacy.linkHref) &&
      thankYou &&
      hasStrings(thankYou.confirm, ["eyebrow", "title", "body", "backLabel", "backHref"]) &&
      hasStrings(thankYou.unverified, ["eyebrow", "title", "body", "backLabel", "backHref"]) &&
      hasStrings(thankYou.response, ["eyebrow", "heading", "window", "windowNote", "nextStepNote"]) &&
      hasStrings(thankYou.urgent, ["eyebrow", "heading", "pendingNote", "contactHref", "contactLabel"]),
  );
}

type PageRead<T> =
  | { mode: "local" | "unavailable" }
  | { mode: "authoritative"; document: SitePageDocument<T> | null };

async function readInquiryPage<T>(
  key: string,
  options: { preview?: boolean; locale?: Locale } = {},
): Promise<PageRead<T>> {
  if (getWpConfig().mode !== "live") return { mode: "local" };
  const response = await wpRead<WordpressPageCollection>(
    `/fh/v1/pages?key=${encodeURIComponent(key)}${options.preview ? "&preview=true" : ""}`,
    {
      restRoot: true,
      tags: [SITE_PAGES_CACHE_TAG],
      noStore: options.preview === true,
    },
  );
  if (!response) return { mode: "unavailable" };
  if (response.authoritative !== true) return { mode: "local" };
  const locale = options.locale ?? await getLocale();
  return {
    mode: "authoritative",
    document: response.items[0]
      ? normalizeWordpressPage<T>(response.items[0], key, { ...options, locale })
      : null,
  };
}

/** 读取询盘入口、同意版本和感谢页文案；字段不完整时整体回退。 */
export async function getInquiryContent(
  options: { preview?: boolean; locale?: Locale } = {},
): Promise<InquiryContent> {
  const locale = options.locale ?? await getLocale();
  const withLocalUi = (content: InquiryContent): InquiryContent => ({
    ...content,
    formUi: {
      ...inquiryFormUiFor(locale),
      privacyConsent: content.privacy.consentText,
      privacyLinkLabel: content.privacy.linkLabel,
      privacyHref: content.privacy.linkHref,
    },
    preparation: inquiryPreparationFor(locale),
  });
  const native = await readInquiryPage<InquiryContent>("request-a-quote", options);
  // Draft previews may show business copy, but never authorize consent.
  const privacyPage = await readInquiryPage<PrivacyPageContent>("privacy", { ...options, preview: false });
  // Legacy aggregate pages may still carry thank-you and form copy. New quote
  // pages only carry business body; they must not determine consent validity.
  const base = native.mode === "authoritative" && native.document && isContent(native.document.content)
    ? native.document.content
    : localContent;
  // The local fixture may use a test-only version. A live WordPress outage or
  // partial response must never reuse that version as if consent were approved.
  if (getWpConfig().mode !== "live") {
    return withLocalUi(localContent);
  }
  const withoutApprovedPrivacy = (): InquiryContent => withLocalUi({
    ...base,
    privacyVersion: "",
    privacy: { ...base.privacy, version: "" },
  });
  if (privacyPage.mode !== "authoritative" || !privacyPage.document) {
    return withoutApprovedPrivacy();
  }
  const privacy = object(privacyPage.document.content);
  if (!privacy || !stringValue(privacy.version) || !string(privacy.consentText) || !string(privacy.linkLabel) || !string(privacy.linkHref)) {
    return withoutApprovedPrivacy();
  }
  return withLocalUi({
    ...base,
    privacyVersion: privacy.version,
    privacy: {
      version: privacy.version,
      consentText: privacy.consentText,
      linkLabel: privacy.linkLabel,
      linkHref: privacy.linkHref,
    },
  });
}

export { localContent as inquiryContentFallback };
