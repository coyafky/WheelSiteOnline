import { z } from "zod";

export const inquiryCustomerTypes = ["business", "individual"] as const;
export const inquiryProductLines = [
  "wheels",
  "ev-components",
  "custom-aluminum",
  "safety-tires",
] as const;
export const inquiryInputTypes = [
  "2d-drawing",
  "3d-data",
  "physical-sample",
  "product-code",
  "none-yet",
] as const;

export const inquiryItemSchema = z.object({
  model: z
    .string({ error: "Use text for the wheel model." })
    .trim()
    .min(1, { error: "Wheel model is required." })
    .max(60, { error: "Wheel model is too long." }),
  productionCode: z
    .string({ error: "Use text for the production code." })
    .trim()
    .min(1, { error: "Production code is required." })
    .max(120, { error: "Production code is too long." }),
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be a whole number." })
    .min(1, { error: "Quantity must be at least 1." })
    .refine(Number.isSafeInteger, {
      error: "Quantity is too large to process safely.",
    }),
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const inquiryStepOneSchema = z.object({
  customerType: z.enum(inquiryCustomerTypes, {
    error: "Choose Business or Individual.",
  }),
  productLine: z.enum(inquiryProductLines, {
    error: "Choose one of the four product lines.",
  }),
  message: z
    .string({ error: "Use text for this field." })
    .trim()
    .min(10, { error: "Please add at least 10 characters." })
    .max(5000, { error: "Keep this field to 5000 characters or fewer." }),
  quantity: z
    .string({ error: "Use text for this field." })
    .trim()
    .max(40, { error: "Keep this field to 40 characters or fewer." })
    .optional()
    .default(""),
  inputsAvailable: z
    .array(z.enum(inquiryInputTypes), { error: "Choose only supported input types." })
    .max(inquiryInputTypes.length)
    .optional()
    .default([]),
});

export const inquiryStepTwoSchema = z.object({
  name: z
    .string({ error: "Use text for this field." })
    .trim()
    .min(1, { error: "Please tell us your name." })
    .max(120, { error: "Keep this field to 120 characters or fewer." }),
  email: z
    .string({ error: "Use text for this field." })
    .trim()
    .min(1, { error: "Please provide an email address." })
    .max(200, { error: "Keep this field to 200 characters or fewer." })
    .regex(emailPattern, { error: "That email address looks incomplete." }),
  country: z
    .string({ error: "Use text for this field." })
    .trim()
    .regex(/^[A-Za-z]{2,8}$/, {
      error: "Use a 2–8 letter country or market code.",
    })
    .transform((value) => value.toUpperCase()),
  company: z
    .string({ error: "Use text for this field." })
    .trim()
    .max(160, { error: "Keep this field to 160 characters or fewer." })
    .optional()
    .default(""),
  whatsapp: z
    .string({ error: "Use text for this field." })
    .trim()
    .max(40, { error: "Keep this field to 40 characters or fewer." })
    .optional()
    .default(""),
  privacyConsent: z.literal(true, {
    error: "Consent is required before submission.",
  }),
});

export const inquirySubmissionSchema = inquiryStepOneSchema
  .extend(inquiryStepTwoSchema.shape)
  .extend({
    privacyVersion: z
      .string({ error: "Use text for this field." })
      .trim()
      .min(1, { error: "The privacy notice changed. Review it and agree again." })
      .max(80, { error: "Keep this field to 80 characters or fewer." }),
    model: z
      .string({ error: "Use text for this field." })
      .trim()
      .max(60, { error: "Keep this field to 60 characters or fewer." })
      .optional()
      .default(""),
    finish: z
      .string({ error: "Use text for this field." })
      .trim()
      .max(120, { error: "Keep this field to 120 characters or fewer." })
      .optional()
      .default(""),
    items: z.array(inquiryItemSchema).max(20, { error: "You can quote up to 20 wheels at once." }).optional().default([]),
  });

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "_form");
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}
