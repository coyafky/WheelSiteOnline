/**
 * 四条产品线共用的询盘表单内容。
 *
 * 组件只负责交互与校验，所有对外文字保留在内容接缝中。正式隐私政策版本由
 * `NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION` 注入；没有版本时表单 fail-closed。
 */
export const inquiryFormUi = {
  ariaLabel: "Project enquiry form",
  stepOne: "Step 1 of 2",
  stepTwo: "Step 2 of 2",
  progressLabel: "Enquiry form progress",
  projectStepLabel: "Project details",
  contactStepLabel: "Contact details",
  completedLabel: "Completed",
  editProjectLabel: "Edit project details",
  stepOneTitle: "What are you asking about?",
  stepTwoTitle: "How should we reply?",
  stepOneDescription:
    "First, give us enough context to route the enquiry to the right product team.",
  stepTwoDescription:
    "Next, add the contact details our team should use for this specific enquiry.",
  requiredNote: "Required field",
  optional: "optional",
  customerTypeLabel: "Customer type",
  customerTypes: [
    { value: "business", label: "Business" },
    { value: "individual", label: "Individual" },
  ],
  productLineLabel: "Product line",
  productLinePlaceholder: "Select a product line…",
  messageLabel: "Describe the part, product or result you need",
  messageHelp:
    "Include the application, known specifications, quantity or market if you have them.",
  quantityLabel: "Approximate quantity",
  quantityPlaceholder: "e.g. prototype, 10 sets, or 500/year",
  inputsLabel: "Useful inputs already available",
  inputs: [
    { value: "2d-drawing", label: "2D drawing" },
    { value: "3d-data", label: "3D data" },
    { value: "physical-sample", label: "Physical sample" },
    { value: "product-code", label: "Product code" },
    { value: "none-yet", label: "None yet" },
  ],
  continueLabel: "Continue",
  backLabel: "Back",
  nameLabel: "Name",
  emailLabel: "Email",
  countryLabel: "Country / market code",
  countryHelp: "Use the ISO country or market code, for example US, DE or CN.",
  companyLabel: "Company",
  phoneLabel: "Phone or WhatsApp",
  privacyConsent:
    "I agree that Fenghuai may use the information provided to review and respond to this enquiry.",
  privacyLinkLabel: "Read the privacy policy",
  privacyHref: "/support/privacy",
  submitLabel: "Submit project enquiry",
  submittingLabel: "Submitting…",
  formUnavailableTitle: "Project enquiry is not open yet",
  formUnavailableBody:
    "The privacy notice has not been approved and versioned, so this form is disabled rather than collecting details without a valid consent record.",
  rateLimited:
    "Too many attempts were received. Please wait a few minutes before trying again.",
  referenceLabel: "Reference",
  notSpecified: "Not specified",
  privacyConsentChanged:
    "The privacy notice changed since you agreed. Read the updated notice and tick the consent box again.",
  validationMessages: {
    customerType: "Choose Business or Individual.",
    productLine: "Choose one of the four product lines.",
    message: "Please describe what you need in at least 10 characters.",
    quantity: "Keep the quantity to 40 characters or fewer.",
    inputsAvailable: "Choose only supported input types.",
    name: "Please tell us your name.",
    email: "That email address looks incomplete.",
    country: "Use a 2–8 letter country or market code.",
    company: "Keep the company name to 160 characters or fewer.",
    whatsapp: "Keep the phone or WhatsApp number to 40 characters or fewer.",
    privacyConsent: "Consent is required before submission.",
  },
} as const;

export const inquiryPreparation = {
  label: "Useful details, if available",
  generic: ["What you need", "What information you already have", "Approximate quantity and market"],
  byProductLine: {
    wheels: ["Model or design reference", "Recorded configuration or target size", "Vehicle or application"],
    "ev-components": ["Part category", "2D or 3D data status", "Cooling, sealing or interface requirements"],
    "custom-aluminum": ["Drawing, 3D data or sample status", "Part function", "Material or performance target"],
    "safety-tires": ["Tire size or model", "Vehicle or fleet use", "Required test documents"],
  },
} as const;

/** Preserve the content shape while allowing approved translations of text leaves. */
type LocalizedText<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? ReadonlyArray<LocalizedText<Item>>
    : T extends object
      ? { [Key in keyof T]: LocalizedText<T[Key]> }
      : T;

export type InquiryFormUi = LocalizedText<typeof inquiryFormUi>;
export type InquiryPreparation = LocalizedText<typeof inquiryPreparation>;
export type InquiryPreparationLine =
  InquiryPreparation["byProductLine"][keyof InquiryPreparation["byProductLine"]];
