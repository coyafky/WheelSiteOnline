import "server-only";

/**
 * 公开轮毂目录模块 —— 资格判定与事实合并（**单一判定点**）
 *
 * 公开集合 = 机器门槛（事实层） AND 人工批准（WordPress 快照）
 *
 * 机器门槛：有图。规格完整性由事实层生成器保证（变体存在即有规格）。
 * 人工批准：publication / imageRights / supply / specification 四项 + 至少一条批准变体 + 公开 slug。
 *
 * 纪律（见 PAGE-SPECS/wheel-catalog.md §3.2、架构稿 §8）：
 *   1. **fail-closed** —— 任何一项不是明确通过就不放行；缺字段=不通过，不是「默认通过」。
 *   2. **交叉校验** —— WP 批准的 productionCode 必须在事实层真实存在；
 *      否则该变体被丢弃（WP 不能凭空批准一条不存在的规格）。
 *   3. **绝不放宽** —— 快照缺失或为空时公开集合为空，**不回退成「所有有图型号」**。
 *   4. **型号级集合与变体级集合分开** —— 对外展示的 diameters/pcds 一律从**已批准变体**派生，
 *      不取型号级 `sizes[]/pcds[]`（那不是批准范围）。
 */

import { wheelCatalogue } from "@/content/wheel-catalogue";
import type { WheelModel, WheelVariant } from "@/content/types";
import publicationSnapshot from "@/content/wheel-publication.json";

import {
  numOrNull,
  normalizePcds,
  parseSize,
  uniqueSortedNumbers,
  uniqueSortedStrings,
  isValidSlug,
} from "./normalize";
import {
  processKeyOf,
  processLabelEn,
  type PublicWheelModel,
  type PublicWheelVariant,
  type WheelPublicationRecord,
} from "./types";

/* ============================================================================
 * 快照
 * ========================================================================== */

type Snapshot = {
  meta?: { syncedAt?: string; source?: string; count?: number };
  publications?: Record<string, WheelPublicationRecord>;
};

const snapshot = publicationSnapshot as Snapshot;

/** 快照里 slug → 发布记录。slug 已由同步器小写归一。 */
const publicationsBySlug: ReadonlyMap<string, WheelPublicationRecord> = new Map(
  Object.entries(snapshot.publications ?? {}),
);

export function publicationSnapshotMeta() {
  return {
    syncedAt: snapshot.meta?.syncedAt ?? null,
    source: snapshot.meta?.source ?? null,
    count: publicationsBySlug.size,
  };
}

/* ============================================================================
 * 资格判定
 * ========================================================================== */

/**
 * 人工那一半。逐条对照 mu-plugin 里的 `fh_wheel_is_approved()`，两边必须一致
 * （那里是后台的判定，这里是渲染的判定；任何一边放宽都会让目录出现不该出现的型号）。
 */
function passesHumanApproval(rec: WheelPublicationRecord): boolean {
  if (rec.wpStatus !== "publish") return false;
  if (rec.publication_status !== "approved") return false;
  if (rec.image_rights_status !== "approved") return false;
  if (rec.supply_status !== "confirmed") return false;
  if (rec.specification_status !== "verified") return false;

  const slug = (rec.public_slug ?? "").trim();
  if (!slug || !isValidSlug(slug)) return false;

  if (!rec.approvedVariantKeys?.length) return false;

  return true;
}

/**
 * Highest record shape this build understands.
 *
 * Bump only together with the WordPress side (`FH_WHEEL_SCHEMA_VERSION`).
 */
const WHEEL_SCHEMA_VERSION = 1;

/**
 * Is this record a shape we can read?
 *
 * A record newer than this build is refused rather than parsed hopefully: a
 * field that changed meaning would be read under the old assumption, and the
 * result is a page that renders wrong specs with no error anywhere. Absent means
 * the record predates the field, which WordPress defaults to the current
 * version, so it is accepted.
 */
function hasReadableShape(fact: WheelModel): boolean {
  const version = fact.schema_version;
  if (version === undefined || version === null) return true;
  return Number(version) <= WHEEL_SCHEMA_VERSION;
}

/** 机器那一半。 */
function passesMachineGate(fact: WheelModel): boolean {
  return (
    hasReadableShape(fact) &&
    fact.hasImage === true &&
    Array.isArray(fact.images) &&
    fact.images.length > 0
  );
}

/* ============================================================================
 * 构建公开视图
 * ========================================================================== */

function toPublicVariant(variant: WheelVariant): PublicWheelVariant | null {
  const productionCode = String(variant.productionCode ?? "").trim();
  if (!productionCode) return null;

  const size = String(variant.size ?? "").trim();
  const parsed = parseSize(size);
  const pcd = String(variant.pcd ?? "").trim();
  const pcdKeys = normalizePcds(pcd);

  return {
    productionCode,
    size,
    diameter: parsed?.diameter ?? null,
    width: parsed?.width ?? null,
    pcd,
    pcdKey: pcdKeys[0] ?? "",
    offset: numOrNull(variant.offset),
    centerBore: numOrNull(variant.centerBore),
    finish: String(variant.finish ?? "").trim(),
  };
}

/**
 * 把同一 model 代码的**多条来源记录**合并成一条公开型号。
 *
 * ⭐ 为什么必须合并：事实层是按「（来源目录, model）」分条存的，同一个 model
 * 会横跨多个尺寸目录，各目录的 variant 是**彼此不重叠的真实配置**。
 *   实测：1349 条源记录 → **1219** 个唯一型号（合并掉 130 条）。
 *   例 `dx008` = 15寸(2 变体) + 17寸(4) + 18寸(3) = 9 个变体。
 *
 * ⚠️ 不做合并会同时产生两个错：
 *   ① 同一 slug 出现多次（重复路由 / sitemap 重复项）；
 *   ② 每次只看到**其中一个目录**的变体，批准了却匹配不上 → 型号被误判为不合格。
 *   实测未合并时 175 条快照膨胀成 **184** 个公开型号，其中 **56** 条匹配不到任何变体。
 */
function groupFactsByModel(): Map<string, WheelModel[]> {
  const grouped = new Map<string, WheelModel[]>();
  for (const fact of wheelCatalogue.models) {
    const key = String(fact.model ?? "").trim().toLowerCase();
    if (!key) continue;
    const list = grouped.get(key);
    if (list) list.push(fact);
    else grouped.set(key, [fact]);
  }
  return grouped;
}

function buildPublicModel(facts: WheelModel[], rec: WheelPublicationRecord): PublicWheelModel | null {
  if (facts.length === 0) return null;
  if (!facts.some((f) => passesMachineGate(f))) return null;
  if (!passesHumanApproval(rec)) return null;

  // 图片：并集，保持稳定顺序去重
  const images = [...new Set(facts.flatMap((f) => f.images ?? []))];
  if (images.length === 0) return null;

  // 交叉校验：只保留「WP 已批准」∩「事实层真实存在」的变体，
  // 跨**全部**同 model 来源记录查找（这正是合并的意义所在）
  const approvedCodes = new Set(rec.approvedVariantKeys ?? []);
  const seenCodes = new Set<string>();
  const variants: PublicWheelVariant[] = [];
  for (const fact of facts) {
    for (const raw of fact.variants ?? []) {
      const code = String(raw.productionCode ?? "").trim();
      if (!approvedCodes.has(code) || seenCodes.has(code)) continue;
      seenCodes.add(code);
      const mapped = toPublicVariant(raw);
      if (mapped) variants.push(mapped);
    }
  }
  variants.sort((a, b) => a.productionCode.localeCompare(b.productionCode, "en", { numeric: true }));

  // 批准了但一条都对不上 → 不合格，不放行（fail-closed）
  if (variants.length === 0) return null;

  const slug = (rec.public_slug ?? "").trim().toLowerCase();

  const diameters = uniqueSortedNumbers(
    variants.map((v) => v.diameter).filter((d): d is number => d !== null),
  );
  const widths = uniqueSortedNumbers(
    variants.map((v) => v.width).filter((w): w is number => w !== null),
  );
  const pcds = uniqueSortedStrings(
    variants.flatMap((v) => normalizePcds(v.pcd)),
  );
  const finishCount = new Set(variants.map((v) => v.finish).filter(Boolean)).size;

  const processKey = processKeyOf(rec.approved_process);

  // 同一 model 的多个来源记录大小写可能不同 —— 取第一条的写法作为展示基准
  const model = String(facts[0].model ?? "").trim();

  return {
    slug,
    model,
    displayModel: (rec.display_model ?? "").trim() || model,
    processKey,
    processLabel: processLabelEn(processKey),
    // 详情页单图（DEC-014）；其余图片保留在 images 供画廊等场景
    primaryImage: images[0],
    images,
    variants,
    diameters,
    widths,
    pcds,
    approvedVariantCount: variants.length,
    approvedFinishCount: finishCount,
    seoTitle: (rec.seo_title ?? "").trim() || undefined,
    seoDescription: (rec.seo_description ?? "").trim() || undefined,
  };
}

/* ============================================================================
 * 缓存（模块级单例，每进程算一次）
 * ========================================================================== */

let cache: PublicWheelModel[] | null = null;
let cacheBySlug: Map<string, PublicWheelModel> | null = null;

/** 全部公开型号。顺序按 model 稳定升序（供 sitemap 等需要确定性的调用方）。 */
export function getPublicModels(): PublicWheelModel[] {
  if (cache) return cache;

  const built: PublicWheelModel[] = [];
  for (const [key, facts] of groupFactsByModel()) {
    const rec = publicationsBySlug.get(key);
    if (!rec) continue; // 没有发布记录 = 未批准，不放行
    const model = buildPublicModel(facts, rec);
    if (model) built.push(model);
  }

  built.sort((a, b) => a.model.localeCompare(b.model, "en", { numeric: true }));
  cache = built;

  cacheBySlug = new Map(built.map((m) => [m.slug, m]));
  return cache;
}

export function getPublicModelBySlug(slug: string): PublicWheelModel | null {
  if (!slug) return null;
  getPublicModels();
  return cacheBySlug?.get(slug.trim().toLowerCase()) ?? null;
}

/** 公开 slug 全量。`generateStaticParams` 与 sitemap 的唯一来源。 */
export function listPublicSlugs(): string[] {
  return getPublicModels().map((m) => m.slug);
}

/* ============================================================================
 * 诊断（供验收脚本与运维使用）
 * ========================================================================== */

export type PublicationFunnel = {
  /** 事实层源记录条数（按来源目录分条）。 */
  factRecords: number;
  /** 按 model 合并后的唯一型号数。 */
  uniqueModels: number;
  snapshotRecords: number;
  noPublicationRecord: number;
  machineGateFailed: number;
  humanApprovalFailed: number;
  noMatchingVariant: number;
  published: number;
  /** 与之相等才算健康 —— 不等说明 slug 有碰撞或合并有漏。 */
  publishedSlugsUnique: number;
};

export function describePublicationFunnel(): PublicationFunnel {
  let noPublicationRecord = 0;
  let machineGateFailed = 0;
  let humanApprovalFailed = 0;
  let noMatchingVariant = 0;

  const grouped = groupFactsByModel();

  for (const [key, facts] of grouped) {
    const rec = publicationsBySlug.get(key);
    if (!rec) {
      noPublicationRecord += 1;
      continue;
    }
    if (!facts.some((f) => passesMachineGate(f))) {
      machineGateFailed += 1;
      continue;
    }
    if (!passesHumanApproval(rec)) {
      humanApprovalFailed += 1;
      continue;
    }
    if (!buildPublicModel(facts, rec)) {
      noMatchingVariant += 1;
    }
  }

  const published = getPublicModels();

  return {
    /** 事实层**源记录**条数（按来源目录分条，未合并）。 */
    factRecords: wheelCatalogue.models.length,
    /** 按 model 合并后的唯一型号数。 */
    uniqueModels: grouped.size,
    snapshotRecords: publicationsBySlug.size,
    noPublicationRecord,
    machineGateFailed,
    humanApprovalFailed,
    noMatchingVariant,
    published: published.length,
    publishedSlugsUnique: new Set(published.map((m) => m.slug)).size,
  };
}
