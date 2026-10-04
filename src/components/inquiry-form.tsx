"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, CircleAlert } from "lucide-react";
import type { ProductFamily } from "@/content/types";
// ⚠️ TYPE-ONLY import. Never import `@/lib/inquiry` here — that module pulls in
// server-side storage (fs) and would break the client bundle.
import type { InquiryContext } from "@/lib/inquiry/types";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Enquiry form — WIRED TO THE BACKEND.

   `handleSubmit` POSTs to `/api/inquiries` with `{ ...values, context }`.
   `context` is captured automatically from the URL the visitor arrived on —
   never typed (see `buildContext`). Three outcomes, all reported honestly:

     · 201 { ok: true }   → success state + redirect to `/thank-you?id=…`
     · 422                → field errors mapped onto the offending inputs
     · network / other    → explicit failure message; the panel does NOT
                            pretend the enquiry was received.

   ⚠️ A `delivered: false` response is NOT a failure. It means the notification
   email did not go out; the enquiry is already persisted server-side. The
   success state renders either way.
--------------------------------------------------------------------------- */

type FormValues = {
  company: string;
  contactName: string;
  email: string;
  country: string;
  vehicle: string;
  family: string;
  quantity: string;
  finish: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  company: "",
  contactName: "",
  email: "",
  country: "",
  vehicle: "",
  family: "",
  quantity: "",
  finish: "",
  message: "",
};

/** Deliberately permissive: catches typos, does not try to police RFC 5322. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The spec keys the URL may carry for a selected variant. Mirrors the
 * `?size=&pcd=&et=&cb=&finish=` contract the model pages emit, mapping each
 * query param onto the `selectedSpec` snapshot key.
 */
const SPEC_PARAMS: Record<string, string> = {
  size: "size",
  pcd: "pcd",
  et: "offset",
  cb: "centerBore",
  finish: "finish",
};

/**
 * Collect the originating context from the URL. Runs client-side on submit, so
 * it always sees the real `window.location`, query string and all.
 *
 * ⚠️ This is a SNAPSHOT, not a reference: the values are frozen as text at the
 * moment of submission and never re-resolved against the catalogue.
 */
function buildContext(): InquiryContext {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const first = (key: string): string | undefined =>
    params.get(key)?.trim() || undefined;

  const selectedSpec: Record<string, string> = {};
  for (const [param, key] of Object.entries(SPEC_PARAMS)) {
    const value = first(param);
    if (value) selectedSpec[key] = value;
  }

  const context: InquiryContext = {
    pageUrl: window.location.href,
    pageType: first("pageType"),
    model: first("model"),
    productionCode: first("code") ?? first("productionCode"),
    series: first("series"),
    from: first("from"),
    selectedSpec: Object.keys(selectedSpec).length > 0 ? selectedSpec : undefined,
  };

  return context;
}

/** Shape of the 201 response from `POST /api/inquiries`. */
type SubmitSuccess = {
  ok: true;
  id: string;
  delivered: boolean;
  mock: boolean;
};

/** Shape of the 422 response from `POST /api/inquiries`. */
type SubmitFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Map the server's field keys onto this form's field names. The backend
 * validates on `name`; the client form calls the same value `contactName`.
 */
const SERVER_TO_FORM_FIELD: Partial<Record<string, keyof FormValues>> = {
  name: "contactName",
  email: "email",
  company: "company",
  country: "country",
  model: "vehicle",
  quantity: "quantity",
  finish: "finish",
  message: "message",
};

export function InquiryForm({
  families,
  copy,
}: {
  families: ProductFamily[];
  copy: {
    requiredNote: string;
    optional: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    resetLabel: string;
    errorSummaryTitle: string;
    errorSummaryBody: string;
    /** Shown when the request never reached the server (network failure). */
    networkErrorTitle: string;
    /** Extra line under the network error heading. */
    networkErrorBody: string;
    /** Reassurance that the enquiry is logged even if email delivery failed. */
    pendingDeliveryNote: string;
  };
}) {
  const router = useRouter();
  const baseId = useId();

  // Prefill the vehicle field from the URL's `model` param so the visitor does
  // not retype what the page they came from already knows.
  const initialValues = useMemo<FormValues>(() => {
    if (typeof window === "undefined") return EMPTY;
    const params = new URLSearchParams(window.location.search);
    return { ...EMPTY, vehicle: params.get("model")?.trim() ?? "" };
  }, []);

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [attempted, setAttempted] = useState(false);
  /** Populated on a 201 — the single source of truth for the success panel. */
  const [receipt, setReceipt] = useState<SubmitSuccess | null>(null);
  /** Set when the request never reached the server, or the server errored. */
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fieldId = (name: keyof FormValues) => `${baseId}-${name}`;
  const errorId = (name: keyof FormValues) => `${baseId}-${name}-error`;

  const set = (name: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));

    // Clear the error for a field as soon as the user starts fixing it, but
    // only if they have already attempted a submit — validating on every
    // keystroke before that reads as nagging.
    if (attempted && errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (candidate: FormValues): FormErrors => {
    const next: FormErrors = {};

    if (!candidate.company.trim()) {
      next.company = "Enter your company or business name.";
    }

    if (!candidate.contactName.trim()) {
      next.contactName = "Enter the name of the person we should reply to.";
    }

    if (!candidate.email.trim()) {
      next.email = "Enter a business email address so we can send the quote.";
    } else if (!EMAIL_PATTERN.test(candidate.email.trim())) {
      next.email = "That does not look like a valid email address.";
    }

    if (!candidate.country.trim()) {
      next.country = "Enter the country you are importing into.";
    }

    if (!candidate.vehicle.trim()) {
      next.vehicle = "List the vehicle or fitment you are quoting for.";
    }

    if (!candidate.family) {
      next.family = "Select the wheel family you are interested in.";
    }

    if (!candidate.quantity.trim()) {
      next.quantity = "Give an approximate quantity, even if it is a range.";
    } else if (!/\d/.test(candidate.quantity)) {
      next.quantity = "Quantity should include a number, for example “10 sets”.";
    }

    if (candidate.message.trim().length < 10) {
      next.message = "Add a short note about the order so we can quote accurately.";
    }

    return next;
  };

  const focusFirstError = (found: FormErrors) => {
    // Move focus to the first field in error so keyboard and screen-reader
    // users land where the problem is, rather than at the top of the page.
    const firstKey = Object.keys(found)[0] as keyof FormValues;
    if (firstKey) document.getElementById(fieldId(firstKey))?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    setSubmitError(null);

    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    setStatus("submitting");

    const context = buildContext();

    // `InquiryInput` (server contract) is narrower than `FormValues`, so map
    // explicitly rather than spreading the whole form state.
    const payload = {
      name: values.contactName,
      email: values.email,
      company: values.company,
      country: values.country,
      model: values.vehicle,
      finish: values.finish || undefined,
      quantity: values.quantity,
      message: values.message,
      context,
    };

    let response: Response;
    try {
      response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // The request never left the browser. Say so — do not show success.
      setStatus("idle");
      setSubmitError(copy.networkErrorBody);
      return;
    }

    if (response.status === 201) {
      const body = (await response.json()) as SubmitSuccess;
      // ⚠️ `delivered: false` is NOT a failure — the enquiry is persisted.
      setReceipt(body);
      setStatus("success");
      // Hand off to the confirmation page with the real reference number.
      router.push(`/thank-you?id=${encodeURIComponent(body.id)}`);
      return;
    }

    if (response.status === 422) {
      const body = (await response.json()) as SubmitFailure;
      const mapped: FormErrors = {};
      for (const [serverKey, message] of Object.entries(body.fieldErrors ?? {})) {
        const formKey = SERVER_TO_FORM_FIELD[serverKey];
        if (formKey) mapped[formKey] = message;
      }
      setStatus("idle");
      setErrors(mapped);
      if (Object.keys(mapped).length > 0) focusFirstError(mapped);
      return;
    }

    // 400 / 500 / anything else — the server rejected the request outright.
    setStatus("idle");
    setSubmitError(copy.networkErrorBody);
  };

  const errorKeys = Object.keys(errors) as (keyof FormValues)[];

  /* ---------------------------------------------------------------- success */
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

        <h3 className="mt-6 font-display text-[clamp(1.5rem,3.4vw,2.1rem)] font-800 uppercase leading-[0.98] tracking-[-0.01em] text-ink">
          {copy.successTitle}
        </h3>

        <p className="mt-4 max-w-[560px] text-[1rem] leading-relaxed text-steel">
          {copy.successBody}
        </p>

        {/* Reference number — the server's real id, never fabricated. */}
        {receipt ? (
          <p className="mt-5 inline-flex flex-wrap items-baseline gap-2.5 rounded-lg border border-forge/35 bg-white/60 px-4 py-3">
            <span className="font-display text-[0.66rem] font-700 uppercase tracking-[0.14em] text-steel">
              Reference
            </span>
            <span className="font-mono text-[0.95rem] font-semibold text-forge-deep">
              {receipt.id}
            </span>
          </p>
        ) : null}

        {/* Only surfaced when email delivery failed — the enquiry is still
            recorded, so this is a note, not an error. */}
        {receipt && !receipt.delivered ? (
          <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-forge/35 bg-white/60 px-4 py-3.5 text-[0.82rem] leading-relaxed text-forge-deep">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{copy.pendingDeliveryNote}</span>
          </p>
        ) : null}

        <dl className="mt-7 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {[
            { label: "Company", value: values.company },
            { label: "Contact", value: values.contactName },
            { label: "Email", value: values.email },
            { label: "Country", value: values.country },
            { label: "Vehicle / fitment", value: values.vehicle },
            { label: "Wheel family", value: values.family },
            { label: "Quantity", value: values.quantity },
            { label: "Finish", value: values.finish || "Not specified" },
          ].map((row) => (
            <div key={row.label} className="bg-white px-5 py-4">
              <dt className="font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-steel">
                {row.label}
              </dt>
              <dd className="mt-1.5 text-sm text-ink">{row.value}</dd>
            </div>
          ))}

          <div className="bg-white px-5 py-4 sm:col-span-2">
            <dt className="font-display text-[0.64rem] font-700 uppercase tracking-[0.14em] text-steel">
              Message
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink/85">
              {values.message}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setErrors({});
            setAttempted(false);
            setSubmitError(null);
            setReceipt(null);
            setStatus("idle");
          }}
          className="btn-pill-outline mt-8 text-ink"
        >
          {copy.resetLabel}
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------- form */
  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label="Wheel enquiry form"
      className="rounded-xl border border-border bg-white p-7 lg:p-9"
    >
      <p className="text-[0.8rem] leading-relaxed text-steel">
        <span aria-hidden="true" className="text-forge">
          *
        </span>{" "}
        {copy.requiredNote}
      </p>

      {/* Transport failure — the enquiry never reached the server. */}
      {submitError ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4"
        >
          <p className="flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.12em] text-destructive">
            <CircleAlert className="size-4" aria-hidden="true" />
            {copy.networkErrorTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            {submitError}
          </p>
        </div>
      ) : null}

      {/* Error summary — announced once, links to the first problem. */}
      {attempted && errorKeys.length > 0 ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4"
        >
          <p className="flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.12em] text-destructive">
            <CircleAlert className="size-4" aria-hidden="true" />
            {copy.errorSummaryTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            {copy.errorSummaryBody}
          </p>
          <ul className="mt-3 grid gap-1.5">
            {errorKeys.map((key) => (
              <li key={key}>
                <a
                  href={`#${fieldId(key)}`}
                  className="text-sm text-destructive underline decoration-destructive/40 underline-offset-2 hover:decoration-destructive"
                >
                  {errors[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <Field
          id={fieldId("company")}
          name="company"
          label="Company / business name"
          required
          value={values.company}
          error={attempted ? errors.company : undefined}
          errorId={errorId("company")}
          autoComplete="organization"
          onChange={(value) => set("company", value)}
        />

        <Field
          id={fieldId("contactName")}
          name="contactName"
          label="Contact name"
          required
          value={values.contactName}
          error={attempted ? errors.contactName : undefined}
          errorId={errorId("contactName")}
          autoComplete="name"
          onChange={(value) => set("contactName", value)}
        />

        <Field
          id={fieldId("email")}
          name="email"
          type="email"
          label="Business email"
          required
          value={values.email}
          error={attempted ? errors.email : undefined}
          errorId={errorId("email")}
          autoComplete="email"
          onChange={(value) => set("email", value)}
        />

        <Field
          id={fieldId("country")}
          name="country"
          label="Country of import"
          required
          value={values.country}
          error={attempted ? errors.country : undefined}
          errorId={errorId("country")}
          autoComplete="country-name"
          onChange={(value) => set("country", value)}
        />

        <Field
          id={fieldId("vehicle")}
          name="vehicle"
          label="Vehicle(s) / fitment"
          required
          value={values.vehicle}
          error={attempted ? errors.vehicle : undefined}
          errorId={errorId("vehicle")}
          placeholder="e.g. BMW G80 M3, Porsche 992 Carrera S"
          className="sm:col-span-2"
          onChange={(value) => set("vehicle", value)}
        />

        {/* Wheel family select -------------------------------------------- */}
        <div className="sm:col-span-1">
          <FieldLabel htmlFor={fieldId("family")} required>
            Wheel family
          </FieldLabel>
          {/* Wrapper is relative so the chevron can sit over the native arrow
              we removed with `appearance-none`. A real SVG beats an arbitrary
              `bg-[url(data:…)]` utility here: it is inspectable, themeable and
              does not depend on Tailwind parsing a data URI. */}
          <div className="relative">
            <select
              id={fieldId("family")}
              name="family"
              value={values.family}
              aria-invalid={attempted && Boolean(errors.family)}
              aria-describedby={
                attempted && errors.family ? errorId("family") : undefined
              }
              onChange={(event) => set("family", event.target.value)}
              className={cn(
                inputClass,
                "appearance-none pr-12",
                attempted && errors.family && "border-destructive",
                !values.family && "text-steel",
              )}
            >
              <option value="">Select a family…</option>
              {families.map((family) => (
                <option key={family.slug} value={family.name}>
                  {family.name}
                </option>
              ))}
              <option value="Not sure yet">Not sure yet — advise me</option>
            </select>

            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-steel"
            />
          </div>
          <FieldError
            id={errorId("family")}
            message={attempted ? errors.family : undefined}
          />
        </div>

        <Field
          id={fieldId("quantity")}
          name="quantity"
          label="Approximate quantity"
          required
          value={values.quantity}
          error={attempted ? errors.quantity : undefined}
          errorId={errorId("quantity")}
          placeholder="e.g. 10 sets, or 20 wheels"
          onChange={(value) => set("quantity", value)}
        />

        <Field
          id={fieldId("finish")}
          name="finish"
          label="Finish preference"
          value={values.finish}
          error={undefined}
          errorId={errorId("finish")}
          placeholder="e.g. Brushed clear, satin gunmetal"
          optionalLabel={copy.optional}
          className="sm:col-span-2"
          onChange={(value) => set("finish", value)}
        />

        {/* Message -------------------------------------------------------- */}
        <div className="sm:col-span-2">
          <FieldLabel htmlFor={fieldId("message")} required>
            Notes for the quotation
          </FieldLabel>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={5}
            value={values.message}
            aria-invalid={attempted && Boolean(errors.message)}
            aria-describedby={
              attempted && errors.message ? errorId("message") : undefined
            }
            placeholder="Target stance, brake or suspension changes, target price point, timeline, private-label requirements…"
            onChange={(event) => set("message", event.target.value)}
            className={cn(
              inputClass,
              "min-h-[140px] resize-y py-3.5 leading-relaxed",
              attempted && errors.message && "border-destructive",
            )}
          />
          <FieldError
            id={errorId("message")}
            message={attempted ? errors.message : undefined}
          />
        </div>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-pill-solid disabled:opacity-60"
        >
          {status === "submitting" ? copy.submitting : copy.submit}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>

        <p className="text-[0.78rem] leading-relaxed text-steel">
          We reply with a specification and a price, not a mailing list signup.
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Field primitives                                                            */
/* -------------------------------------------------------------------------- */

const inputClass = cn(
  "min-h-[50px] w-full rounded-lg border border-border bg-white px-4 text-[0.95rem] text-ink",
  "placeholder:text-steel/70",
  "outline-none transition-[border-color,box-shadow] duration-200",
  "focus:border-forge focus:ring-2 focus:ring-forge/25",
);

function FieldLabel({
  htmlFor,
  required,
  optionalLabel,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  optionalLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2.5 flex items-center gap-2 font-display text-[0.72rem] font-700 uppercase tracking-[0.14em] text-ink"
    >
      {children}
      {required ? (
        <span className="text-forge" aria-hidden="true">
          *
        </span>
      ) : null}
      {optionalLabel ? (
        <span className="font-sans text-[0.68rem] font-medium normal-case tracking-normal text-steel">
          {optionalLabel}
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      className="mt-2 flex items-start gap-1.5 text-[0.8rem] leading-snug text-destructive"
    >
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function Field({
  id,
  name,
  label,
  value,
  error,
  errorId,
  onChange,
  type = "text",
  required,
  optionalLabel,
  placeholder,
  autoComplete,
  className,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  errorId: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  optionalLabel?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel
        htmlFor={id}
        required={required}
        optionalLabel={optionalLabel}
      >
        {label}
      </FieldLabel>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, error && "border-destructive")}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
