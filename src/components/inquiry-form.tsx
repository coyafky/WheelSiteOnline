"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { CheckboxList, CheckboxListItem } from "@astryxdesign/core/CheckboxList";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Selector } from "@astryxdesign/core/Selector";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@/theme/fenghuai-neutral/neutral";
import {
  inquiryFormUi,
  inquiryPreparation,
  type InquiryFormUi,
  type InquiryPreparation,
} from "@/content/inquiry-form";
import { productLines } from "@/content/product-lines";
import type { Locale } from "@/lib/i18n/types";
import { translate } from "@/lib/i18n/types";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import type {
  InquiryContext,
  InquiryCustomerType,
  InquiryProductLine,
} from "@/lib/inquiry/types";
import {
  inquiryStepOneSchema,
  inquiryStepTwoSchema,
  zodFieldErrors,
} from "@/lib/inquiry/schema";
import { cn } from "@/lib/utils";
import { clearInquiryCart, useInquiryCart } from "@/lib/wheels/inquiry-cart";
import { InquiryCartSummary } from "@/components/wheels/inquiry-cart-summary";

type FormValues = {
  customerType: InquiryCustomerType | "";
  productLine: InquiryProductLine | "";
  message: string;
  quantity: string;
  inputsAvailable: string[];
  name: string;
  email: string;
  country: string;
  company: string;
  whatsapp: string;
  website: string;
};

type FormKey = keyof FormValues;
type FormErrors = Partial<Record<FormKey, string>>;

type FormCopy = {
  submit: string;
  successTitle: string;
  successBody: string;
  resetLabel: string;
  errorSummaryTitle: string;
  errorSummaryBody: string;
  networkErrorTitle: string;
  networkErrorBody: string;
  pendingDeliveryNote: string;
  submitting?: string;
  requiredNote?: string;
  optional?: string;
};

type InquiryFormProps = {
  copy: FormCopy;
  locale?: Locale;
  ui?: InquiryFormUi;
  preparation?: InquiryPreparation;
  privacyVersion?: string;
  onSuccess?: () => void;
} & (
  | {
      mode?: "cart";
    }
  | {
      mode: "direct";
      context: InquiryContext;
      item?: {
        model: string;
        productionCode: string;
        quantity: number;
      };
    }
);

type InquirySubmissionItem = {
  model: string;
  productionCode: string;
  quantity: number;
};

type InquiryFormContentProps = Omit<InquiryFormProps, "mode"> & {
  mode: "cart" | "direct";
  submissionItems: InquirySubmissionItem[];
  submissionContext?: InquiryContext;
};

type SubmitSuccess = {
  ok: true;
  id: string;
  persisted: true;
  delivered: boolean;
  receiptToken?: string | null;
};
type SubmitFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

const EMPTY: FormValues = {
  customerType: "",
  productLine: "",
  message: "",
  quantity: "",
  inputsAvailable: [],
  name: "",
  email: "",
  country: "",
  company: "",
  whatsapp: "",
  website: "",
};

const PRODUCT_LINE_IDS = new Set(productLines.map((line) => line.slug));

const SERVER_TO_FORM_FIELD: Partial<Record<string, FormKey>> = {
  customerType: "customerType",
  productLine: "productLine",
  message: "message",
  quantity: "quantity",
  name: "name",
  email: "email",
  country: "country",
  company: "company",
  whatsapp: "whatsapp",
};

function localizeErrors(errors: Record<string, string>, ui: InquiryFormUi): FormErrors {
  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => [
      field,
      ui.validationMessages[field as keyof InquiryFormUi["validationMessages"]] ?? message,
    ]),
  ) as FormErrors;
}

/**
 * Localize the field errors the API returns.
 *
 * The two layers share one Zod contract, so for the fields where the server is
 * merely repeating the shape check the client already ran, a localized copy of
 * the message exists in `ui.validationMessages` and we prefer it.
 *
 * But the server can reject a value the client accepted, for reasons the client
 * cannot know — a deliverable-looking address that cannot receive replies, a
 * value that conflicted with a record on submit. Those messages carry
 * information the generic copy does not, so overwriting them destroys the only
 * explanation the visitor gets. The generic copy is therefore a *fallback*, not
 * an override: it is used only when the server's message is not itself
 * field-specific.
 *
 * This previously overrode unconditionally, which silently replaced every
 * server reason with the generic one (regression caught by the E2E assertion
 * "422 字段错误聚焦服务端指出的第一个字段").
 */
function localizeServerErrors(errors: Record<string, string>, ui: InquiryFormUi): FormErrors {
  const generic: ReadonlySet<string> = new Set<string>(Object.values(ui.validationMessages));
  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => {
      // A server message that is NOT just the client's own wording carries extra
      // meaning — keep it verbatim.
      if (message && !generic.has(message)) return [field, message];
      return [
        field,
        ui.validationMessages[field as keyof InquiryFormUi["validationMessages"]] ?? message,
      ];
    }),
  ) as FormErrors;
}

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.padEnd(32, "0");
}

function buildContext(override?: InquiryContext): InquiryContext {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const first = (key: string) => params.get(key)?.trim() || undefined;
  const selectedSpec: Record<string, string> = {};
  const specParams: Record<string, string> = {
    size: "size",
    pcd: "pcd",
    et: "offset",
    cb: "centerBore",
    finish: "finish",
  };
  for (const [param, key] of Object.entries(specParams)) {
    const value = first(param);
    if (value) selectedSpec[key] = value;
  }
  const urlContext: InquiryContext = {
    pageUrl: window.location.href,
    pageType: first("pageType"),
    model: first("model"),
    productionCode: first("code") ?? first("productionCode"),
    series: first("series"),
    from: first("from"),
    productLine: first("product_line"),
    application: first("application"),
    inputType: first("input_type"),
    intent: first("intent"),
    selectedSpec: Object.keys(selectedSpec).length > 0 ? selectedSpec : undefined,
  };
  return {
    ...urlContext,
    ...override,
    pageUrl: window.location.href,
  };
}

export function InquiryForm(props: InquiryFormProps) {
  if (props.mode === "direct") {
    const { context, item, ...sharedProps } = props;
    return (
      <Theme theme={neutralTheme} mode="light">
        <InquiryFormContent
          {...sharedProps}
          mode="direct"
          submissionItems={item ? [item] : []}
          submissionContext={context}
        />
      </Theme>
    );
  }

  return (
    <Theme theme={neutralTheme} mode="light">
      <CartInquiryFormContent {...props} />
    </Theme>
  );
}

function CartInquiryFormContent(props: Omit<InquiryFormProps, "mode">) {
  const cartItems = useInquiryCart();
  const submissionItems = cartItems.map(({ model, productionCode, quantity }) => ({
    model,
    productionCode,
    quantity,
  }));
  return (
    <InquiryFormContent
      {...props}
      mode="cart"
      submissionItems={submissionItems}
    />
  );
}

function InquiryFormContent({
  copy,
  locale = "en",
  ui = inquiryFormUi,
  preparation: preparationCopy = inquiryPreparation,
  privacyVersion: configuredPrivacyVersion,
  mode,
  submissionItems,
  submissionContext,
  onSuccess,
}: InquiryFormContentProps) {
  const router = useRouter();
  const baseId = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [attempted, setAttempted] = useState(false);
  const [receipt, setReceipt] = useState<SubmitSuccess | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  // Keep the version for backward-compatible payloads and old direct callers;
  // an empty version no longer disables the business enquiry form.
  const privacyVersion = configuredPrivacyVersion === undefined
    ? process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION?.trim() || ""
    : configuredPrivacyVersion.trim();

  useEffect(() => {
    const candidate =
      submissionContext?.productLine?.trim() ||
      new URLSearchParams(window.location.search).get("product_line")?.trim();
    if (!candidate || !PRODUCT_LINE_IDS.has(candidate)) return;
    const timer = window.setTimeout(() => {
      setValues((current) => ({
        ...current,
        productLine: candidate as InquiryProductLine,
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [submissionContext?.productLine]);

  const fieldId = (name: FormKey) => `${baseId}-${name}`;
  const set = <K extends FormKey>(name: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  const focusFirstError = (found: FormErrors) => {
    const first = Object.keys(found)[0] as FormKey | undefined;
    if (first) {
      requestAnimationFrame(() => {
        const field = document.getElementById(fieldId(first));
        const target = field?.matches("input, textarea, button, select")
          ? field
          : field?.querySelector<HTMLElement>(
              "input:not([type='hidden']), textarea, button, select, [tabindex]:not([tabindex='-1'])",
            );
        (target as HTMLElement | null)?.focus();
      });
    }
  };

  const validateStepOne = (): FormErrors => {
    const result = inquiryStepOneSchema.safeParse(values);
    return result.success ? {} : localizeErrors(zodFieldErrors(result.error), ui);
  };

  const validateStepTwo = (): FormErrors => {
    const result = inquiryStepTwoSchema.safeParse(values);
    return result.success ? {} : localizeErrors(zodFieldErrors(result.error), ui);
  };

  const continueToContact = () => {
    setAttempted(true);
    const found = validateStepOne();
    setErrors(found);
    if (Object.keys(found).length > 0) return focusFirstError(found);
    setAttempted(false);
    setErrors({});
    setStep(2);
    requestAnimationFrame(() => document.getElementById(`${baseId}-step-title`)?.focus());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;
    setAttempted(true);
    setSubmitError(null);
    const found = { ...validateStepOne(), ...validateStepTwo() };
    setErrors(found);
    if (Object.keys(found).length > 0) return focusFirstError(found);

    setStatus("submitting");
    let response: Response;
    try {
      response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          formStartedAt,
          website: values.website,
          customerType: values.customerType,
          productLine: values.productLine,
          message: values.message,
          quantity: values.quantity || undefined,
          inputsAvailable: values.inputsAvailable,
          name: values.name,
          email: values.email,
          country: values.country.toUpperCase(),
          company: values.company || undefined,
          whatsapp: values.whatsapp || undefined,
          privacyVersion,
          items: submissionItems,
          context: buildContext(submissionContext),
        }),
      });
    } catch {
      setStatus("idle");
      setSubmitError(copy.networkErrorBody);
      return;
    }

    let body: SubmitSuccess | SubmitFailure | null = null;
    try {
      body = (await response.json()) as SubmitSuccess | SubmitFailure;
    } catch {
      // 由下面的通用失败状态处理。
    }

    if (
      (response.status === 200 || response.status === 201) &&
      body?.ok &&
      body.persisted === true
    ) {
      if (mode === "cart") clearInquiryCart();
      setReceipt(body);
      setStatus("success");
      onSuccess?.();
      if (mode === "cart" && body.receiptToken) {
        router.push(
          `/thank-you?id=${encodeURIComponent(body.id)}&receipt=${encodeURIComponent(body.receiptToken)}`,
        );
      }
      return;
    }

    if (response.status === 422 && body && !body.ok) {
      const mapped: FormErrors = {};
      for (const [serverKey, message] of Object.entries(body.fieldErrors ?? {})) {
        const key = SERVER_TO_FORM_FIELD[serverKey];
        if (key) mapped[key] = message;
      }
      const localized = localizeServerErrors(
        Object.fromEntries(Object.entries(mapped) as [FormKey, string][]) as Record<string, string>,
        ui,
      );
      setErrors(localized);
      setStatus("idle");
      if (Object.keys(localized).length > 0) focusFirstError(localized);
      else setSubmitError(body.error);
      return;
    }

    setStatus("idle");
    setSubmitError(
      response.status === 429 ? ui.rateLimited : copy.networkErrorBody,
    );
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-forge/35 bg-forge-soft p-8 lg:p-10"
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-forge text-white">
          <Check className="size-6" strokeWidth={3} aria-hidden="true" />
        </span>
        <h3 className="mt-6 font-display text-2xl font-800 uppercase text-ink">
          {copy.successTitle}
        </h3>
        <p className="mt-4 max-w-[560px] leading-relaxed text-steel">
          {copy.successBody}
        </p>
        {receipt ? (
          <p className="mt-5 inline-flex gap-2.5 rounded-lg border border-forge/35 bg-white/60 px-4 py-3">
            <span className="font-display text-xs font-700 uppercase tracking-wider text-steel">
              {ui.referenceLabel}
            </span>
            <span className="font-mono font-semibold text-forge-deep">{receipt.id}</span>
          </p>
        ) : null}
        {receipt && !receipt.delivered ? (
          <p className="mt-4 text-sm text-forge-deep">{copy.pendingDeliveryNote}</p>
        ) : null}
        <div className="mt-8">
          <Button
            label={copy.resetLabel}
            variant="secondary"
            onClick={() => {
              setValues(EMPTY);
              setStep(1);
              setErrors({});
              setAttempted(false);
              setReceipt(null);
              setStatus("idle");
              setIdempotencyKey(createIdempotencyKey());
              setFormStartedAt(Date.now());
            }}
          />
        </div>
      </div>
    );
  }

  const errorKeys = Object.keys(errors) as FormKey[];
  const preparation = values.productLine
    ? preparationCopy.byProductLine[values.productLine]
    : preparationCopy.generic;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label={ui.ariaLabel}
      className={cn(
        "rounded-xl border border-border bg-white p-6 lg:p-8",
        mode === "direct" && "rounded-none border-0 p-0 lg:p-0",
      )}
    >
      {mode === "cart" ? <InquiryCartSummary locale={locale} /> : null}
      <ol
        aria-label={ui.progressLabel}
        className="grid grid-cols-2 items-start gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3"
      >
        <li className="min-w-0">
          {step === 2 ? (
            <button
              type="button"
              disabled={status === "submitting"}
              onClick={() => {
                setStep(1);
                setErrors({});
                setAttempted(false);
              }}
              className="group flex items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={ui.editProjectLabel}
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-forge text-white">
                <Check className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block whitespace-nowrap text-[0.62rem] font-700 uppercase tracking-[0.08em] text-forge sm:text-[0.68rem] sm:tracking-[0.14em]">
                  {ui.completedLabel}
                </span>
                <span className="block text-xs font-semibold text-ink group-hover:text-forge sm:text-sm">
                  {ui.projectStepLabel}
                </span>
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3" aria-current="step">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-forge font-display text-sm font-800 text-white">
                1
              </span>
              <span>
                <span className="block whitespace-nowrap text-[0.62rem] font-700 uppercase tracking-[0.08em] text-forge sm:text-[0.68rem] sm:tracking-[0.14em]">
                  {ui.stepOne}
                </span>
                <span className="block text-xs font-semibold text-ink sm:text-sm">
                  {ui.projectStepLabel}
                </span>
              </span>
            </div>
          )}
        </li>
        <span className="hidden h-px w-8 bg-border sm:block sm:w-16" aria-hidden="true" />
        <li className="min-w-0">
          <div className="flex items-center justify-end gap-3" aria-current={step === 2 ? "step" : undefined}>
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-800",
                step === 2 ? "bg-forge text-white" : "bg-soft text-steel",
              )}
            >
              2
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block whitespace-nowrap text-[0.62rem] font-700 uppercase tracking-[0.08em] sm:text-[0.68rem] sm:tracking-[0.14em]",
                  step === 2 ? "text-forge" : "text-steel",
                )}
              >
                {ui.stepTwo}
              </span>
              <span className="block text-xs font-semibold text-ink sm:text-sm">
                {ui.contactStepLabel}
              </span>
            </span>
          </div>
        </li>
      </ol>
      <h3
        id={`${baseId}-step-title`}
        tabIndex={-1}
        className="mt-3 font-display text-2xl font-800 uppercase text-ink outline-none"
      >
        {step === 1 ? ui.stepOneTitle : ui.stepTwoTitle}
      </h3>
      <p className="mt-3 max-w-[620px] text-sm leading-relaxed text-steel">
        {step === 1 ? ui.stepOneDescription : ui.stepTwoDescription}
      </p>
      <p className="mt-3 text-xs text-steel">
        <span className="text-forge" aria-hidden="true">*</span>{" "}
        {copy.requiredNote ?? ui.requiredNote}
      </p>

      {submitError ? (
        <div className="mt-5">
          <Banner
            status="error"
            title={copy.networkErrorTitle}
            description={submitError}
            container="card"
          />
        </div>
      ) : null}

      {attempted && errorKeys.length > 0 ? (
        <div className="mt-5">
          <Banner
            status="error"
            title={copy.errorSummaryTitle}
            description={copy.errorSummaryBody}
            container="card"
          />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6">
          <FormLayout direction="vertical">
          <RadioGroup
            id={fieldId("customerType")}
            label={ui.customerTypeLabel}
            value={values.customerType}
            options={ui.customerTypes}
            error={errors.customerType}
            onChange={(value) => set("customerType", value as InquiryCustomerType)}
          />
          <SelectField
            locale={locale}
            id={fieldId("productLine")}
            label={ui.productLineLabel}
            value={values.productLine}
            error={errors.productLine}
            ui={ui}
            onChange={(value) => set("productLine", value as InquiryProductLine)}
          />
          <div className="rounded-lg border border-border bg-soft p-4">
            <p className="font-display text-xs font-700 uppercase tracking-wider text-ink">
              {preparationCopy.label}
            </p>
            <ul className="mt-2 grid gap-1 text-sm text-steel">
              {preparation.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <TextAreaField
            id={fieldId("message")}
            label={ui.messageLabel}
            help={ui.messageHelp}
            value={values.message}
            error={errors.message}
            onChange={(value) => set("message", value)}
          />
          <Field
            id={fieldId("quantity")}
            label={ui.quantityLabel}
            value={values.quantity}
            error={errors.quantity}
            placeholder={ui.quantityPlaceholder}
            optionalLabel={copy.optional ?? ui.optional}
            onChange={(value) => set("quantity", value)}
          />
          <CheckboxGroup
            id={fieldId("inputsAvailable")}
            values={values.inputsAvailable}
            ui={ui}
            onChange={(next) => set("inputsAvailable", next)}
          />
          <Button
            label={ui.continueLabel}
            type="button"
            variant="primary"
            onClick={continueToContact}
          />
          </FormLayout>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldId("name")}
            label={ui.nameLabel}
            required
            value={values.name}
            error={errors.name}
            autoComplete="name"
            onChange={(value) => set("name", value)}
          />
          <Field
            id={fieldId("email")}
            label={ui.emailLabel}
            type="email"
            required
            value={values.email}
            error={errors.email}
            autoComplete="email"
            onChange={(value) => set("email", value)}
          />
          <Field
            id={fieldId("country")}
            label={ui.countryLabel}
            required
            value={values.country}
            error={errors.country}
            help={ui.countryHelp}
            autoComplete="country"
            onChange={(value) => set("country", value.toUpperCase())}
          />
          {values.customerType === "business" ? (
            <Field
              id={fieldId("company")}
              label={ui.companyLabel}
              value={values.company}
              error={errors.company}
              optionalLabel={copy.optional ?? ui.optional}
              autoComplete="organization"
              onChange={(value) => set("company", value)}
            />
          ) : null}
          <Field
            id={fieldId("whatsapp")}
            label={ui.phoneLabel}
            value={values.whatsapp}
            error={errors.whatsapp}
            optionalLabel={copy.optional ?? ui.optional}
            autoComplete="tel"
            className="sm:col-span-2"
            onChange={(value) => set("whatsapp", value)}
          />
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor={fieldId("website")}>Website</label>
            <input
              id={fieldId("website")}
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(event) => set("website", event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <Button
              label={ui.backLabel}
              type="button"
              variant="secondary"
              isDisabled={status === "submitting"}
              onClick={() => {
                setStep(1);
                setErrors({});
                setAttempted(false);
              }}
            />
            <Button
              label={status === "submitting"
                ? copy.submitting ?? ui.submittingLabel
                : copy.submit || ui.submitLabel}
              type="submit"
              variant="primary"
              isLoading={status === "submitting"}
            />
          </div>
        </div>
      )}
    </form>
  );
}

function errorStatus(message?: string) {
  return message ? ({ type: "error", message } as const) : undefined;
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  optionalLabel,
  placeholder,
  autoComplete,
  help,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "email" | "password";
  required?: boolean;
  optionalLabel?: string;
  placeholder?: string;
  autoComplete?: string;
  help?: string;
  className?: string;
}) {
  return (
    <div id={id} className={className}>
      <TextInput
        label={optionalLabel ? `${label} (${optionalLabel})` : label}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        description={help}
        isRequired={required}
        onChange={onChange}
        status={errorStatus(error)}
        width="100%"
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  help,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  help: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div id={id}>
      <TextArea
        label={label}
        rows={5}
        value={value}
        description={help}
        isRequired
        onChange={onChange}
        status={errorStatus(error)}
        width="100%"
      />
    </div>
  );
}

function RadioGroup({
  id,
  label,
  value,
  options,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div id={id}>
      <RadioList
        label={label}
        value={value}
        onChange={onChange}
        orientation="horizontal"
        isRequired
        status={errorStatus(error)}
        width="100%"
      >
        {options.map((option) => (
          <RadioListItem
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </RadioList>
    </div>
  );
}

function SelectField({
  locale,
  id,
  label,
  value,
  error,
  ui,
  onChange,
}: {
  locale: Locale;
  id: string;
  label: string;
  value: string;
  error?: string;
  ui: InquiryFormUi;
  onChange: (value: string) => void;
}) {
  return (
    <div id={id}>
      <Selector
        label={label}
        options={productLines.map((line) => ({
          value: line.slug,
          label: locale === "en"
            ? line.name
            : translate(
                DICTIONARIES[locale],
                DICTIONARIES.en,
                {
                  wheels: "nav.products.wheels",
                  "ev-components": "nav.products.evComponents",
                  "custom-aluminum": "nav.products.customAluminum",
                  "safety-tires": "nav.products.safetyTires",
                }[line.slug] ?? line.slug,
              ),
        }))}
        value={value}
        placeholder={ui.productLinePlaceholder}
        onChange={onChange}
        htmlName="productLine"
        isRequired
        status={errorStatus(error)}
        presentation="adaptive"
        width="100%"
      />
    </div>
  );
}

function CheckboxGroup({
  id,
  values,
  ui,
  onChange,
}: {
  id: string;
  values: string[];
  ui: InquiryFormUi;
  onChange: (values: string[]) => void;
}) {
  return (
    <div id={id}>
      <CheckboxList
        label={`${ui.inputsLabel} (${ui.optional})`}
        value={values}
        onChange={(next) => {
          const selectedNone = next.includes("none-yet") && !values.includes("none-yet");
          onChange(selectedNone ? ["none-yet"] : next.filter((item) => item !== "none-yet"));
        }}
        density="compact"
        width="100%"
      >
        {ui.inputs.map((item) => (
          <CheckboxListItem key={item.value} label={item.label} value={item.value} />
        ))}
      </CheckboxList>
    </div>
  );
}
