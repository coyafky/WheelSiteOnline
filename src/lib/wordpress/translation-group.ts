import type { Locale } from "../i18n/types.ts";

/**
 * Cross-language aggregation.
 *
 * Every localized record of one page shares a `translation_group`. Grouping by
 * that value — rather than by path or slug — is what keeps the language switcher
 * and hreflang correct when WordPress uses a different slug per language:
 *
 *     en → home         zh → home-zh      es → home-es      th → home-th
 *
 * All four sit in group `home`, so `/` can be shown in four languages even
 * though no two slugs match.
 *
 * Records that predate the field carry no group; those fall back to `page_key`,
 * which is the same identity under a different name, and finally to nothing
 * rather than being guessed.
 */

export type LocalizedRecord = {
  locale?: Locale | string;
  page_key?: string;
  translation_group?: string;
  /** Public path for this record, if already known. */
  path?: string;
};

export type TranslationGroupMember = {
  locale: Locale;
  /** Stable identity shared by all members. */
  group: string;
  path?: string;
};

const KNOWN_LOCALES: readonly Locale[] = ["en", "zh", "es", "th"];

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (KNOWN_LOCALES as readonly string[]).includes(value);
}

/**
 * The identity a record belongs to.
 *
 * `translation_group` wins because it is designed for this and survives a slug
 * change; `page_key` is accepted as a legacy equivalent. Returns `null` when the
 * record carries neither, so a caller cannot silently group unrelated pages
 * under an empty string.
 */
export function identityOf(record: LocalizedRecord): string | null {
  const group = (record.translation_group ?? "").trim();
  if (group !== "") return group;
  const key = (record.page_key ?? "").trim();
  return key !== "" ? key : null;
}

/**
 * Group records by identity, keeping one record per locale.
 *
 * A duplicate locale within a group is a real defect (two English bodies for
 * one page), so the first wins and the duplicate is reported instead of being
 * merged silently.
 */
export function groupByTranslation(
  records: readonly LocalizedRecord[],
): { members: Map<string, TranslationGroupMember[]>; duplicates: string[] } {
  const members = new Map<string, TranslationGroupMember[]>();
  const duplicates: string[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const group = identityOf(record);
    if (!group) continue;
    if (!isLocale(record.locale)) continue;

    const dedupeKey = `${group}::${record.locale}`;
    if (seen.has(dedupeKey)) {
      duplicates.push(dedupeKey);
      continue;
    }
    seen.add(dedupeKey);

    const list = members.get(group) ?? [];
    list.push({
      locale: record.locale,
      group,
      ...(record.path ? { path: record.path } : {}),
    });
    members.set(group, list);
  }

  return { members, duplicates };
}

/**
 * The locales one page is actually available in, in canonical order.
 *
 * Only locales with a real record count. A group whose members disagree about
 * their path is still one group — the caller resolves each locale's URL
 * separately, which is the whole point of not keying on path.
 */
export function localesForGroup(
  records: readonly LocalizedRecord[],
  group: string,
): Locale[] {
  const { members } = groupByTranslation(records);
  const list = members.get(group) ?? [];
  const present = new Set(list.map((member) => member.locale));
  return KNOWN_LOCALES.filter((locale) => present.has(locale));
}
