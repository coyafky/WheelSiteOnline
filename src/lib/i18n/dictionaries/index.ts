import { en } from "./en.ts";
import { zh } from "./zh.ts";
import type { Dictionary, Locale } from "../types";

/** Locale → dictionary. Importable from both server and client. */
export const DICTIONARIES = { en, zh } satisfies Record<Locale, Dictionary>;
