import "server-only";

import {
  localContactBody,
  localQuoteBody,
  type ConversionContactBody,
  type ConversionQuoteBody,
} from "@/content/conversion-pages";
import type { Locale } from "@/lib/i18n/types";
import { getWordpressPageDocument } from "./pages";

type Options = { locale: Locale; preview?: boolean };

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function fields(value: unknown, keys: string[]): boolean {
  const body = record(value);
  return Boolean(body && keys.every((key) => typeof body[key] === "string" && String(body[key]).trim()));
}

function internalHref(value: unknown): boolean {
  return typeof value === "string" && /^\/(?!\/)[a-z0-9/-]*$/.test(value);
}

export function validQuoteBody(value: unknown): value is ConversionQuoteBody {
  const body = record(value);
  const notice = record(body?.dataNotice);
  return Boolean(
    body &&
    fields(body.hero, ["eyebrow", "heading", "lede"]) &&
    fields(body.formHeading, ["title", "body"]) &&
    fields(notice, ["eyebrow", "body", "footLabel"]) &&
    internalHref(notice?.footHref) &&
    fields(body.seo, ["title", "description"]),
  );
}

export function validContactBody(value: unknown): value is ConversionContactBody {
  const body = record(value);
  const what = record(body?.whatHappens);
  const aside = record(body?.aside);
  const paths = record(body?.pathways);
  return Boolean(
    body &&
    fields(body.hero, ["eyebrow", "heading", "lede", "supporting"]) &&
    fields(body.formHeading, ["title", "body"]) &&
    fields(what, ["eyebrow", "heading", "body"]) &&
    Array.isArray(what?.points) && what.points.length > 0 && what.points.every((point) => typeof point === "string" && point.trim()) &&
    Array.isArray(body.steps) && body.steps.length > 0 && body.steps.every((step) => fields(step, ["step", "title", "body"])) &&
    fields(body.details, ["eyebrow", "heading", "body"]) &&
    fields(aside, ["eyebrow", "heading"]) &&
    Array.isArray(aside?.points) && aside.points.length > 0 && aside.points.every((point) => typeof point === "string" && point.trim()) &&
    fields(paths, ["eyebrow", "heading"]) &&
    Array.isArray(paths?.links) && paths.links.length > 0 && paths.links.every((link) => fields(link, ["eyebrow", "title", "body", "linkLabel"]) && internalHref(record(link)?.href)) &&
    fields(body.seo, ["title", "description"]),
  );
}

export async function getQuotePageBody({ locale, preview }: Options): Promise<ConversionQuoteBody> {
  const page = await getWordpressPageDocument<unknown>("request-a-quote", { locale, preview });
  return validQuoteBody(page?.content) ? page.content : localQuoteBody(locale);
}

export async function getContactPageBody({ locale, preview }: Options): Promise<ConversionContactBody> {
  const page = await getWordpressPageDocument<unknown>("contact", { locale, preview });
  return validContactBody(page?.content) ? page.content : localContactBody(locale);
}
