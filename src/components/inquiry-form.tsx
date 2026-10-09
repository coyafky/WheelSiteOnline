"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleAlert } from "lucide-react";
import { inquiryFormUi, inquiryPreparation } from "@/content/inquiry-form";
import { productLines } from "@/content/product-lines";
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
  privacyConsent: boolean;
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

type SubmitSuccess = {
  ok: true;
  id: string;
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
  privacyConsent: false,
  website: "",
};

const PRODUCT_LINE_IDS = new Set(productLines.map((line) => line.slug));
const PRIVACY_VERSION = process.env.NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION?.trim() ?? "";

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
  privacyConsent: "privacyConsent",
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.padEnd(32, "0");
}

function buildContext(): InquiryContext {
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
  return {
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
}

export function InquiryForm({
  copy,
}: {
  copy: FormCopy;
}) {
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

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("product_line")?.trim();
    if (!candidate || !PRODUCT_LINE_IDS.has(candidate)) return;
    const timer = window.setTimeout(() => {
      setValues((current) => ({
        ...current,
        productLine: candidate as InquiryProductLine,
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!PRIVACY_VERSION) {
    return (
      <div
        role="status"
        className="rounded-xl border border-forge/35 bg-forge-soft p-7 lg:p-9"
      >
        <h3 className="font-display text-xl font-800 uppercase text-ink">
          {inquiryFormUi.formUnavailableTitle}
        </h3>
        <p className="mt-3 max-w-[620px] text-sm leading-relaxed text-steel">
          {inquiryFormUi.formUnavailableBody}
        </p>
      </div>
    );
  }

  const fieldId = (name: FormKey) => `${baseId}-${name}`;
  const errorId = (name: FormKey) => `${baseId}-${name}-error`;
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
        if (first === "customerType") {
          field?.querySelector<HTMLInputElement>("input")?.focus();
          return;
        }
        field?.focus();
      });
    }
  };

  const validateStepOne = (): FormErrors => {
    const result = inquiryStepOneSchema.safeParse(values);
    return result.success ? {} : (zodFieldErrors(result.error) as FormErrors);
  };

  const validateStepTwo = (): FormErrors => {
    const result = inquiryStepTwoSchema.safeParse(values);
    return result.success ? {} : (zodFieldErrors(result.error) as FormErrors);
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
          privacyConsent: values.privacyConsent,
          privacyVersion: PRIVACY_VERSION,
          context: buildContext(),
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

    if ((response.status === 200 || response.status === 201) && body?.ok) {
      setReceipt(body);
      setStatus("success");
      if (body.receiptToken) {
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
      setErrors(mapped);
      setStatus("idle");
      if (Object.keys(mapped).length > 0) focusFirstError(mapped);
      else setSubmitError(body.error);
      return;
    }

    setStatus("idle");
    setSubmitError(
      response.status === 429 ? inquiryFormUi.rateLimited : copy.networkErrorBody,
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
              {inquiryFormUi.referenceLabel}
            </span>
            <span className="font-mono font-semibold text-forge-deep">{receipt.id}</span>
          </p>
        ) : null}
        {receipt && !receipt.delivered ? (
          <p className="mt-4 text-sm text-forge-deep">{copy.pendingDeliveryNote}</p>
        ) : null}
        <button
          type="button"
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
          className="btn-pill-outline mt-8 text-ink"
        >
          {copy.resetLabel}
        </button>
      </div>
    );
  }

  const errorKeys = Object.keys(errors) as FormKey[];
  const preparation = values.productLine
    ? inquiryPreparation.byProductLine[values.productLine]
    : inquiryPreparation.generic;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label={inquiryFormUi.ariaLabel}
      className="rounded-xl border border-border bg-white p-6 lg:p-8"
    >
      <ol
        aria-label={inquiryFormUi.progressLabel}
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
      >
        <li className="min-w-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrors({});
                setAttempted(false);
              }}
              className="group flex items-center gap-3 text-left"
              aria-label={inquiryFormUi.editProjectLabel}
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-forge text-white">
                <Check className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[0.68rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {inquiryFormUi.completedLabel}
                </span>
                <span className="block truncate text-sm font-semibold text-ink group-hover:text-forge">
                  {inquiryFormUi.projectStepLabel}
                </span>
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3" aria-current="step">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-forge font-display text-sm font-800 text-white">
                1
              </span>
              <span>
                <span className="block text-[0.68rem] font-700 uppercase tracking-[0.14em] text-forge">
                  {inquiryFormUi.stepOne}
                </span>
                <span className="block truncate text-sm font-semibold text-ink">
                  {inquiryFormUi.projectStepLabel}
                </span>
              </span>
            </div>
          )}
        </li>
        <span className="h-px w-8 bg-border sm:w-16" aria-hidden="true" />
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
                  "block text-[0.68rem] font-700 uppercase tracking-[0.14em]",
                  step === 2 ? "text-forge" : "text-steel",
                )}
              >
                {inquiryFormUi.stepTwo}
              </span>
              <span className="block truncate text-sm font-semibold text-ink">
                {inquiryFormUi.contactStepLabel}
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
        {step === 1 ? inquiryFormUi.stepOneTitle : inquiryFormUi.stepTwoTitle}
      </h3>
      <p className="mt-3 max-w-[620px] text-sm leading-relaxed text-steel">
        {step === 1 ? inquiryFormUi.stepOneDescription : inquiryFormUi.stepTwoDescription}
      </p>
      <p className="mt-3 text-xs text-steel">
        <span className="text-forge" aria-hidden="true">*</span>{" "}
        {copy.requiredNote ?? inquiryFormUi.requiredNote}
      </p>

      {submitError ? (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4"
        >
          <p className="flex items-center gap-2 font-display text-xs font-700 uppercase text-destructive">
            <CircleAlert className="size-4" aria-hidden="true" />
            {copy.networkErrorTitle}
          </p>
          <p className="mt-2 text-sm text-ink/80">{submitError}</p>
        </div>
      ) : null}

      {attempted && errorKeys.length > 0 ? (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4"
        >
          <p className="font-display text-xs font-700 uppercase text-destructive">
            {copy.errorSummaryTitle}
          </p>
          <p className="mt-2 text-sm text-ink/80">{copy.errorSummaryBody}</p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 grid gap-5">
          <RadioGroup
            id={fieldId("customerType")}
            label={inquiryFormUi.customerTypeLabel}
            value={values.customerType}
            options={inquiryFormUi.customerTypes}
            error={errors.customerType}
            onChange={(value) => set("customerType", value as InquiryCustomerType)}
          />
          <SelectField
            id={fieldId("productLine")}
            label={inquiryFormUi.productLineLabel}
            value={values.productLine}
            error={errors.productLine}
            onChange={(value) => set("productLine", value as InquiryProductLine)}
          />
          <div className="rounded-lg border border-border bg-soft p-4">
            <p className="font-display text-xs font-700 uppercase tracking-wider text-ink">
              {inquiryPreparation.label}
            </p>
            <ul className="mt-2 grid gap-1 text-sm text-steel">
              {preparation.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <TextAreaField
            id={fieldId("message")}
            label={inquiryFormUi.messageLabel}
            help={inquiryFormUi.messageHelp}
            value={values.message}
            error={errors.message}
            onChange={(value) => set("message", value)}
          />
          <Field
            id={fieldId("quantity")}
            label={inquiryFormUi.quantityLabel}
            value={values.quantity}
            error={errors.quantity}
            placeholder={inquiryFormUi.quantityPlaceholder}
            optionalLabel={copy.optional ?? inquiryFormUi.optional}
            onChange={(value) => set("quantity", value)}
          />
          <CheckboxGroup
            id={fieldId("inputsAvailable")}
            values={values.inputsAvailable}
            onChange={(next) => set("inputsAvailable", next)}
          />
          <button type="button" onClick={continueToContact} className="btn-pill-solid w-fit">
            {inquiryFormUi.continueLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldId("name")}
            label={inquiryFormUi.nameLabel}
            required
            value={values.name}
            error={errors.name}
            autoComplete="name"
            onChange={(value) => set("name", value)}
          />
          <Field
            id={fieldId("email")}
            label={inquiryFormUi.emailLabel}
            type="email"
            required
            value={values.email}
            error={errors.email}
            autoComplete="email"
            onChange={(value) => set("email", value)}
          />
          <Field
            id={fieldId("country")}
            label={inquiryFormUi.countryLabel}
            required
            value={values.country}
            error={errors.country}
            help={inquiryFormUi.countryHelp}
            autoComplete="country"
            onChange={(value) => set("country", value.toUpperCase())}
          />
          {values.customerType === "business" ? (
            <Field
              id={fieldId("company")}
              label={inquiryFormUi.companyLabel}
              value={values.company}
              error={errors.company}
              optionalLabel={copy.optional ?? inquiryFormUi.optional}
              autoComplete="organization"
              onChange={(value) => set("company", value)}
            />
          ) : null}
          <Field
            id={fieldId("whatsapp")}
            label={inquiryFormUi.phoneLabel}
            value={values.whatsapp}
            error={errors.whatsapp}
            optionalLabel={copy.optional ?? inquiryFormUi.optional}
            autoComplete="tel"
            className="sm:col-span-2"
            onChange={(value) => set("whatsapp", value)}
          />
          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-sm leading-relaxed text-ink">
              <input
                id={fieldId("privacyConsent")}
                type="checkbox"
                checked={values.privacyConsent}
                onChange={(event) => set("privacyConsent", event.target.checked)}
                className="mt-1 size-4 accent-forge"
              />
              <span>
                {inquiryFormUi.privacyConsent}{" "}
                <Link href={inquiryFormUi.privacyHref} className="underline underline-offset-4">
                  {inquiryFormUi.privacyLinkLabel}
                </Link>.
              </span>
            </label>
            <FieldError id={errorId("privacyConsent")} message={errors.privacyConsent} />
          </div>
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
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrors({});
                setAttempted(false);
              }}
              className="btn-pill-outline text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {inquiryFormUi.backLabel}
            </button>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn-pill-solid disabled:opacity-60"
            >
              {status === "submitting"
                ? copy.submitting ?? inquiryFormUi.submittingLabel
                : copy.submit || inquiryFormUi.submitLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

const inputClass = cn(
  "min-h-[50px] w-full rounded-lg border border-border bg-white px-4 text-[0.95rem] text-ink",
  "outline-none transition-[border-color,box-shadow] focus:border-forge focus:ring-2 focus:ring-forge/25",
);

function Label({
  htmlFor,
  children,
  required,
  optionalLabel,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  optionalLabel?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center gap-2 font-display text-xs font-700 uppercase tracking-wider text-ink"
    >
      {children}
      {required ? <span className="text-forge" aria-hidden="true">*</span> : null}
      {optionalLabel ? (
        <span className="font-sans font-medium normal-case tracking-normal text-steel">
          {optionalLabel}
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  ) : null;
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
  type?: string;
  required?: boolean;
  optionalLabel?: string;
  placeholder?: string;
  autoComplete?: string;
  help?: string;
  className?: string;
}) {
  const describedBy = [help ? `${id}-help` : "", error ? `${id}-error` : ""]
    .filter(Boolean)
    .join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} required={required} optionalLabel={optionalLabel}>{label}</Label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, error && "border-destructive")}
      />
      {help ? <p id={`${id}-help`} className="mt-2 text-xs text-steel">{help}</p> : null}
      <FieldError id={`${id}-error`} message={error} />
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
    <div>
      <Label htmlFor={id} required>{label}</Label>
      <textarea
        id={id}
        rows={5}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          inputClass,
          "min-h-[130px] resize-y py-3",
          error && "border-destructive",
        )}
      />
      <p id={`${id}-help`} className="mt-2 text-xs text-steel">{help}</p>
      <FieldError id={`${id}-error`} message={error} />
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
    <fieldset
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className="mb-2 font-display text-xs font-700 uppercase tracking-wider text-ink">
        {label} <span className="text-forge">*</span>
      </legend>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm",
              value === option.value ? "border-forge bg-forge-soft" : "border-border",
            )}
          >
            <input
              type="radio"
              name={`${id}-option`}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mr-2 accent-forge"
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}

function SelectField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} required>{label}</Label>
      <select
        id={id}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, error && "border-destructive")}
      >
        <option value="">{inquiryFormUi.productLinePlaceholder}</option>
        {productLines.map((line) => (
          <option key={line.slug} value={line.slug}>{line.name}</option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function CheckboxGroup({
  id,
  values,
  onChange,
}: {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string, checked: boolean) => {
    if (value === "none-yet" && checked) return onChange([value]);
    const next = checked
      ? [...values.filter((item) => item !== "none-yet"), value]
      : values.filter((item) => item !== value);
    onChange([...new Set(next)]);
  };
  return (
    <fieldset id={id}>
      <legend className="mb-2 font-display text-xs font-700 uppercase tracking-wider text-ink">
        {inquiryFormUi.inputsLabel}{" "}
        <span className="font-sans font-medium normal-case tracking-normal text-steel">
          {inquiryFormUi.optional}
        </span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {inquiryFormUi.inputs.map((item) => (
          <label key={item.value} className="text-sm text-ink">
            <input
              type="checkbox"
              checked={values.includes(item.value)}
              onChange={(event) => toggle(item.value, event.target.checked)}
              className="mr-2 accent-forge"
            />
            {item.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
