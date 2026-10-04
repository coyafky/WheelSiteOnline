import { en } from "./en";
import { zh } from "./zh";
import type { Dictionary, Locale } from "../types";

/** Locale → dictionary. Importable from both server and client. */
export const DICTIONARIES: Record<Locale, Dictionary> = { en, zh };
