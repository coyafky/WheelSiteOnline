import { en } from "./en";
import { zh } from "./zh";
import { es } from "./es";
import { th } from "./th";
import type { Dictionary, Locale } from "../types";

/** Locale → dictionary. Importable from both server and client. */
export const DICTIONARIES: Record<Locale, Dictionary> = { en, zh, es, th };
