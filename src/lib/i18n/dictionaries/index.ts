import { en } from "./en.ts";
import { zh } from "./zh.ts";
import { es } from "./es.ts";
import { th } from "./th.ts";
import type { Dictionary, Locale } from "../types";

/** Locale → dictionary. Importable from both server and client. */
export const DICTIONARIES = { en, zh, es, th } satisfies Record<Locale, Dictionary>;
