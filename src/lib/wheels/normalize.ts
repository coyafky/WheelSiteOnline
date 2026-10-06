/**
 * 公开轮毂目录模块 —— 值归一化
 *
 * 这里是「原始生产文本 → 可筛选的规范值」的唯一转换点。
 * 实测首期 175 型号里真实出现的孔距写法（按频次）：
 *
 *   5*114.3 (244) ｜ 4*100 (111) ｜ 5*112 (105) ｜ 5*108 (49) ｜ 6*139.7 (45)
 *   5*112, 5*114.3 (39) ｜ 8*100, 8*114.3 (28) ｜ 4/5*100 (3)
 *   5*112（） (2) ｜ 5*112-5*114.3 (1)
 *
 * 关键语义：**双孔距轮毂是「同时适配两个孔距」，不是两个选项。**
 * 所以 `5*112, 5*114.3` 必须展开成 `["5x112","5x114.3"]`，
 * 否则用户筛 5x112 会漏掉这批真实适配的轮毂。
 */

/* ============================================================================
 * 尺寸
 * ========================================================================== */

const SIZE_DOTTED = /^(\d{2})\s*[*×xX,，-]\s*(\d{1,2}(?:[.,，]\d{1,2})?)\s*[JjBbLlＪ]{0,3}$/;

export type ParsedSize = { diameter: number; width: number };

/**
 * 解析尺寸。
 *
 * **只接受点号式**（`"18*8.5"` / `"17×7.5L"`）。
 *
 * 为什么不支持 4 位尺寸码（`"1885"`）：
 * 实测全量事实层 **3485 / 3485 条变体的 `size` 都是点号式，尺寸码式为 0 条**，
 * 所以那条分支是纯推测。而它**会静默产出错值** —— 品号 `1663` 会被读成
 * 16 英寸 × 6（它在源数据里是 `13寸` 目录的款式码），`2241` 会被读成 22 英寸 × 4。
 * 一条既是死代码、又能悄悄造出错误规格的分支，比没有更糟，故删。
 *
 * 若将来真的出现码式（例如换了供应商表），必须**带 sheet/分节语境**判定，
 * 不能在这里凭空解 —— 见 scripts/clean-wheel-inventory.py 的语境守卫。
 */
export function parseSize(raw: string | null | undefined): ParsedSize | null {
  if (!raw) return null;

  const dotted = SIZE_DOTTED.exec(String(raw).trim());
  if (!dotted) return null;

  const diameter = Number(dotted[1]);
  const width = Number(dotted[2].replace(",", ".").replace("，", "."));
  if (diameter < 10 || diameter > 26) return null;
  if (!Number.isFinite(width) || width < 4 || width > 14) return null;

  return { diameter, width };
}

/* ============================================================================
 * 孔距
 * ========================================================================== */

/** 裸孔距，如 `5x114.3`（已含孔数）。 */
const GROUP = /^(\d{1,2}(?:\/\d{1,2})?)x(\d{2,3}(?:\.\d+)?(?:\/\d{2,3}(?:\.\d+)?)*)$/;

/**
 * 把一条孔距记录展开成它**实际提供的全部规范孔距**。
 *
 *   `"5*114.3"`           → ["5x114.3"]
 *   `"5*112, 5*114.3"`    → ["5x112", "5x114.3"]     双孔距
 *   `"8*100/114.3"`       → ["8x100", "8x114.3"]     同孔数双孔径
 *   `"4/5*100"`           → ["4x100", "5x100"]       多孔数
 *   `"5*112（）"`          → ["5x112"]                空括号是脏字符，剥掉
 *   `"5*112-5*114.3"`     → ["5x112", "5x114.3"]
 *
 * 无法识别时返回 `[]` —— **不返回原文**，避免脏值污染筛选选项（spec §6.1）。
 */
export function normalizePcds(raw: string | null | undefined): string[] {
  if (!raw) return [];

  let s = String(raw).trim().toLowerCase();
  if (!s) return [];

  // 脏字符：空括号、全角括号
  s = s.replace(/[（）()]/g, "");
  // 全角/异形分隔统一
  s = s.replace(/[×*]/g, "x").replace(/[，、]/g, ",");
  s = s.replace(/\s+/g, "");

  // 拆并列组：逗号分隔，以及 `-` 后紧跟新组（`5*112-5*114.3`）
  const parts = s.split(",").flatMap((part) => part.split(/-(?=\d{1,2}x)/));

  const out: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    const m = GROUP.exec(part);
    if (!m) continue;

    const lugs = m[1].split("/");
    const bores = m[2].split("/");
    for (const lug of lugs) {
      for (const bore of bores) {
        const lugNum = Number(lug);
        if (!Number.isFinite(lugNum) || lugNum < 3 || lugNum > 10) continue;
        const key = `${lugNum}x${bore}`;
        if (!out.includes(key)) out.push(key);
      }
    }
  }

  return out;
}

/** 单个孔距的规范参数形态（用于 URL）。`"5*112"` → `"5x112"`。 */
export function pcdKey(raw: string | null | undefined): string {
  const all = normalizePcds(raw);
  return all[0] ?? "";
}

/** 孔距的展示形态：`5x112` → `5×112`。参数一律用 ASCII `x`，展示才用乘号。 */
export function pcdLabel(key: string): string {
  return key.replace(/x/g, "×");
}

/* ============================================================================
 * slug
 * ========================================================================== */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(model: string): string {
  return String(model)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/* ============================================================================
 * 其它
 * ========================================================================== */

/** 有限数或 null —— 拒绝 NaN / Infinity 进入公开视图。 */
export function numOrNull(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** 去重并保持稳定升序。 */
export function uniqueSortedNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

/** 去重并保持字典序。 */
export function uniqueSortedStrings(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "en"));
}
