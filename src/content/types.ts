/**
 * Shared content contracts.
 *
 * These types describe the shape the UI consumes. Today the data is served from
 * local modules under `src/content/*`; the same interfaces are the seam for a
 * headless WordPress source later, so a fetcher can be swapped in without
 * touching components.
 */

export type CtaLink = {
  /** English fallback, used when no dictionary key is present. */
  label: string;
  /** Dictionary key resolved at render time; falls back to `label`. */
  labelKey?: string;
  href: string;
};

/** A numbered capability cell in the trust strip under the hero. */
export type Capability = {
  index: string;
  title: string;
  body: string;
  /**
   * What would prove this claim — the source a reviewer has to check, or the
   * explicit `Pending confirmation` marker while it is still unverified.
   *
   * Not rendered: `TrustStrip` shows only index/title/body, and an evidence
   * line under every cell would turn a capability band into an audit trail.
   * It lives in the data so that "which of these six can we actually stand
   * behind?" is answerable by grepping one file instead of re-reading the
   * marketing copy and guessing.
   */
  evidence: string;
};

/** A product category card. */
export type ProductFamily = {
  slug: string;
  name: string;
  summary: string;
  /** Bullet points rendered on category pages and in expandable detail. */
  highlights: string[];
  /**
   * Whether a real render currently exists for this family. When false the UI
   * shows a branded placeholder instead of requesting a missing file.
   * Flip to true once the asset is in `public/images/products/`.
   */
  hasRender: boolean;
  /** Base render path; `hoverImage` is the alternate angle swap target. */
  image: string;
  hoverImage?: string;
  href: string;
};

/**
 * One of the company's four parallel product lines.
 *
 * Distinct from `ProductFamily` (a *wheel sub-category*: monoblock /
 * two-piece / off-road). The two axes are deliberately separate types —
 * see `product-lines.ts` for why collapsing them would break the wheel
 * catalogue's grouping.
 *
 * 🔴 Parallelism is enforced by shape, not by convention: every field below is
 * required except `subtitle`, so no line can quietly gain a field another line
 * lacks. The `/products` viewport 01 renders all four at identical size and
 * weight (PAGE-SPECS/products/index.md §0 core discipline).
 */
export type ProductLine = {
  /** "wheels" | "ev-components" | "custom-aluminum" | "safety-tires" */
  slug: string;
  /** Display name, e.g. "Forged Wheels". */
  name: string;
  /** Short qualifier under the name, e.g. "Monoblock · Two-piece". */
  subtitle?: string;
  /** One sentence: what it is, for whom. Rendered as the card body. */
  summary: string;
  /**
   * Optional bullets. Empty on all four lines today — kept so a future line
   * that genuinely has more to say is not forced to fork the card component.
   */
  highlights: string[];
  /** True when a real card image exists — see DEC-013 (no image, no listing). */
  hasRender: boolean;
  /** Card image. 1024×1024 for all four, so no line reads as more important. */
  image: string;
  hoverImage?: string;
  /** e.g. "/products/wheels" */
  href: string;
};

/** A completed build shown in the vehicle gallery. */
export type BuildEntry = {
  id: string;
  vehicle: string;
  family: string;
  /** e.g. "20x10.5 / 20x11.5" */
  sizes: string;
  finish: string;
  image: string;
  tags: string[];
};

/** A manufacturing stage on the process page. */
export type ProcessStage = {
  step: string;
  title: string;
  body: string;
  image: string;
};

/** A dealer programme offer. */
export type DealerProgram = {
  slug: string;
  name: string;
  tagline: string;
  body: string;
  points: string[];
  href: string;
};

export type NavItem = {
  /** English fallback, used when no dictionary key is present. */
  label: string;
  /** Dictionary key resolved at render time; falls back to `label`. */
  labelKey?: string;
  href: string;
  children?: CtaLink[];
};

export type FaqEntry = {
  question: string;
  answer: string;
};

/** Generic spec pair used in fitment tables. */
export type SpecPair = {
  label: string;
  value: string;
};

/**
 * A finish option in the finishes reference.
 *
 * `swatch` is an illustrative CSS colour standing in for the physical finish —
 * it is a design token value, not a photographic sample. See `finishNote`.
 */
export type FinishOption = {
  slug: string;
  name: string;
  description: string;
  /** CSS colour used to paint the representative swatch. */
  swatch: string;
  /** Short family label, e.g. "Brushed" / "Gloss". */
  family: string;
};

/** A step in a "how to specify your order" guidance block. */
export type RouteStep = {
  step: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

/** A link card pointing at a related resource or sibling route. */
export type ResourceLink = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

/** A note block used in product "answer" / explainer sections. */
export type AnswerBlock = {
  eyebrow: string;
  heading: string;
  body: string;
  points: string[];
};

/** Copy block describing a construction / detail chapter. */
export type DetailChapter = {
  step: string;
  title: string;
  body: string;
};

/** A spec row on a product family page. */
export type FamilySpec = {
  label: string;
  value: string;
};

/** A headline metric in the about-page capability strip. */
export type CompanyStat = {
  index: string;
  label: string;
  value: string;
  body: string;
  /**
   * True when the figure is a structural placeholder Fenghuai must confirm
   * before launch. Rendered with a visible "Placeholder" flag.
   */
  isPlaceholder: boolean;
};

/** A "what we are / what we are not" positioning point. */
export type PositioningPoint = {
  title: string;
  body: string;
};

/** An ordered step in a process, onboarding or production flow. */
export type FlowStep = {
  step: string;
  title: string;
  body: string;
};

/** A single guide entry in the resources hub. */
export type GuideEntry = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  /** Estimated reading time, e.g. "5 min read". */
  readingTime: string;
  /** Detail blocks revealed when the card is expanded. */
  detail: GuideDetail[];
  /**
   * Long-form article body rendered on `/insights/[slug]`. Each section is a
   * heading plus paragraphs; this is the canonical article, while `detail`
   * stays as the short in-place preview on the hub.
   */
  sections: GuideSection[];
  /** One-line takeaway shown as an answer-first standfirst on the article. */
  answer: string;
  /** Whether the copy contains figures that still need engineering sign-off. */
  needsVerification: boolean;
};

/** A heading + paragraphs block inside a long-form guide article. */
export type GuideSection = {
  heading: string;
  body: string[];
};

/* ---------------------------------------------------------------------------
   Wheel design catalogue (`/gallery/wheels`)
--------------------------------------------------------------------------- */

/** A wheel design in the design catalogue — the wheel itself, not a vehicle. */
export type WheelDesign = {
  id: string;
  /** e.g. "Gunmetal Retro Five-Spoke". */
  name: string;
  /** Spoke pattern axis. */
  spokes: SpokePattern;
  /** Construction / look axis. */
  construction: WheelConstruction;
  /** Finish axis — names a key in `wheelFinishSwatches`. */
  finish: WheelFinish;
  /** Primary application axis. */
  application: WheelApplication;
  /** Free-text facets used by search and card tags. */
  tags: string[];
  /**
   * Whether a real photographed render exists. All false today: the card
   * draws a data-driven SVG technical drawing instead of requesting a file.
   */
  hasRender: boolean;
};

export type SpokePattern =
  | "Five-Spoke"
  | "Split-Spoke"
  | "Multi-Spoke"
  | "Turbine"
  | "Full-Face"
  | "Retro Five-Spoke"
  | "Mesh";

export type WheelConstruction =
  | "Monoblock"
  | "Deep-Lip Two-Piece"
  | "Beadlock Off-Road"
  | "Beadlock-Style";

export type WheelFinish =
  | "Gunmetal"
  | "Silver"
  | "Gold"
  | "Black"
  | "Matte Black"
  | "Brushed Silver"
  | "Two-Tone"
  | "Gloss White"
  | "Diamond-Cut"
  | "Red Accent";

export type WheelApplication =
  | "Motorsport"
  | "Luxury SUV"
  | "Off-Road"
  | "Luxury";

/* ---------------------------------------------------------------------------
   Per-SKU wheel products (`/products/wheels/[sku]`)
--------------------------------------------------------------------------- */

/**
 * A single orderable wheel SKU.
 *
 * A family page describes a *construction*; a SKU describes one shape within
 * it. `family` must match a `productFamilies` slug so the SKU can be grouped
 * back onto its family page and its siblings can be derived.
 *
 * As with every other wheel surface, no photography exists: `hasRender` is
 * false and the hero draws an SVG from the SKU's own spoke count + finish
 * (see `WheelSketch`). Flip the flag when a real render lands.
 */
export type WheelSku = {
  /** Catalogue code, e.g. "N-100RS". Also the route segment. */
  sku: string;
  /** Display name, e.g. "N-100RS Five-Spoke Monoblock". */
  name: string;
  /** Slug of the owning family in `productFamilies`. */
  family: string;
  /** Number of spokes on the face — drives the drawing geometry. */
  spokes: number;
  /** Construction, reusing the design-catalogue union. */
  construction: WheelConstruction;
  /** Finishes this SKU is offered in, from the finish vocabulary. */
  finishes: WheelFinish[];
  /** One-line summary for cards and meta descriptions. */
  summary: string;
  /** Short prose paragraph for the product hero. */
  description: string;
  /** Vehicle categories / builds this SKU suits. */
  applications: string[];
  /** Whether a real render exists. All false today. */
  hasRender: boolean;
};

/* ---------------------------------------------------------------------------
   Vehicle fitment landing pages (`/fitment/[platform]`)
--------------------------------------------------------------------------- */

/** A model covered by a platform fitment page. */
export type FitmentModel = {
  /** Chassis / generation code, e.g. "G80". */
  code: string;
  /** Marketing name, e.g. "M3". */
  name: string;
  /** Production year range as a display string. */
  years: string;
  /**
   * Starting reference range only. NOT a verified fitment — every fitment
   * surface renders the standing notice alongside these.
   */
  sizes: string;
  /** Free-text caveats specific to this generation. */
  notes: string;
  /**
   * Whether Fenghuai has signed off the fitment data for this model. All false
   * until engineering confirms; the UI renders a "pending verification" marker.
   */
  verified: boolean;
};

/** A design direction suggested for a platform. */
export type DesignDirection = {
  name: string;
  body: string;
};

/** A platform fitment landing page. */
export type PlatformFitment = {
  slug: string;
  /** e.g. "BMW M". */
  name: string;
  /** Short hero support line. */
  heroLine: string;
  /** Answer-first intro paragraph. */
  intro: string;
  models: FitmentModel[];
  designDirections: DesignDirection[];
  /** Standing engineering notes for the platform. */
  fitmentNotes: string[];
  faqs: FaqEntry[];
};

/* ---------------------------------------------------------------------------
   Capability-line pages (`/products/ev-components`,
   `/products/custom-aluminum`, `/products/safety-tires`)

   These three routes are "capability" pages rather than product catalogues.
   Their shared shapes live here so the components stay generic; per-page
   modules in `src/content/*.ts` supply the data.
--------------------------------------------------------------------------- */

/**
 * One part type we can take on.
 *
 * 🔴 These are `process` values, not SKUs: the surface is a type we can quote
 * against, not an orderable model. The distinction is enforced in the UI by
 * the mandatory boundary sentence on every card group.
 */
export type PartSpec = {
  name: string;
  nameEn: string;
  /** Casting / joining route, e.g. "LPDC" / "HPDC" / "FSW". Optional. */
  process?: string;
};

/** A card grouping part types by system (motor, controller, battery...). */
export type PartGroup = {
  slug: string;
  name: string;
  nameEn: string;
  /**
   * The one sentence that explains why this group is hard to make.
   * On `/products/custom-aluminum` the same field carries a scenario
   * description instead — the component does not care which reading applies.
   */
  difficulty: string;
  parts: PartSpec[];
};

/** One row of the "what we can make / what we cannot / what we assess" table. */
export type BoundaryRow = {
  state: "included" | "excluded" | "assess";
  label: string;
  /**
   * False means the row carries an unconfirmed business claim. The table
   * renders it as an explicit empty slot and never as a conclusion.
   */
  confirmed: boolean;
  note?: string;
};

/** A row in the quality-evidence table. */
export type QualityRow = {
  label: string;
  /**
   * The evidence sentence. Rendered only when `confirmed` is true; when false
   * the row shows the disclosure instead of a guess.
   */
  value: string;
  confirmed: boolean;
  /** Shown in place of `value` when `confirmed` is false. */
  pendingNote?: string;
};

/** One measured performance figure in a parameter table. */
export type ParamRow = {
  label: string;
  labelEn?: string;
  value: string;
  /** Whether a test report exists behind the number. */
  reportAvailable: boolean;
};

/** One step of a mechanical / physical sequence (drives the mechanism cards). */
export type MechanismStep = FlowStep & {
  /**
   * An unconfirmed figure such as a response time. Stays undefined until the
   * attribution is confirmed, so no unverified number reaches the DOM.
   */
  responseValue?: string;
};

/** A heading + paragraphs block inside a guide card. */
export type GuideDetail = {
  heading: string;
  paragraphs: string[];
};

/** A legal / policy document section. */
export type LegalSection = {
  heading: string;
  body: string[];
};

/** A legal / policy document. */
export type LegalDocument = {
  slug: string;
  title: string;
  /** Human-readable revision date — PLACEHOLDER until legal review. */
  lastUpdated: string;
  eyebrow: string;
  summary: string;
  intro: string;
  sections: LegalSection[];
  /** Jurisdiction / governing-law note shown in its own callout. */
  governingNote: string;
};

/* ---------------------------------------------------------------------------
   Real wheel catalogue — 生产目录（1349 型号 / 3485 配置）

   数据源：`assets/wheel-data/WHEEL-CATALOG-ALL.json`，由
   `scripts/generate-wheel-catalogue.mjs` 清洗后生成到 `wheel-catalogue.ts`。

   ⚠️ 与上面的 `WheelSku` 的关系：
   `WheelSku` 是克隆原型留下的 16 条示意数据（字段残缺、无规格），**保留不动**，
   由 `/products/wheels` 与 `/products/wheels/[sku]` 的现有页面继续消费。
   下面这套 `WheelModel` / `WheelVariant` 承载**真实生产数据**，二者暂并存。

   何时可以删掉 `WheelSku`：当 `/products/wheels` 全部切到 `WheelModel` 之后。
   见 ARCHITECTURE.md §4.3 与 DEC-015。
--------------------------------------------------------------------------- */

/**
 * 最小可下单单位 —— 一个"尺寸 × 孔距 × 偏距 × 中心孔 × 表面处理"的具体组合。
 *
 * 为什么把 model 和 variant 分成两层：页面浏览的粒度是**型号**，
 * 但询盘必须精确到**这一个组合**（客户要的是「15×7 / 4×100 / ET35 / 白色」）。
 * 两者混用会让询盘带上错误规格。
 */
export type WheelVariant = {
  /** 生产代码，全目录唯一，如 "1081X157001W"。询盘引用它即可锁定配置。 */
  productionCode: string;
  /** 尺寸，格式 `直径*宽度`（英寸），如 "15*7"。 */
  size: string;
  /** 孔距 PCD，格式 `孔数*节圆直径`，如 "4*100"、"5*114.3"。 */
  pcd: string;
  /** 偏距 ET（毫米）。实测目录范围为 0–46。 */
  offset: number;
  /** 中心孔 CB（毫米），如 73.1。 */
  centerBore: number;
  /** 表面处理，中文名，如 "白色全涂装"。 */
  finish: string;
};

/**
 * 制造工艺。**注意覆盖率只有 38%**（512 / 1349），未标注的 837 个保持
 * `undefined` —— 未标注不等于不支持该工艺，UI 必须把它当作独立分组显式呈现，
 * 不得静默排除（见 ARCHITECTURE/page-architecture/wheel-catalog-page.md §3.2）。
 */
export type WheelProcess = "旋压" | "低压" | "低压+旋压" | "锻造";

/**
 * 一个轮毂型号。
 *
 * `model` 同时是**图片文件名的产品代码**：图片命名规则为
 * `<尺寸前缀>-<产品代码>[-<序号>].webp`，剥掉前缀与序号后小写归一化即得 `model`。
 * 见 DEC-012。
 */
export type WheelModel = {
  /** 型号 / 产品代码，如 "1081X"。对应图片文件名（小写归一化后）。 */
  model: string;
  /**
   * 尺寸归类，已归一化：`"15寸"` … `"20寸"` / `"越野款"` / `"HP"`。
   * ⚠️ 源数据里混有分册名（"17寸-3"、"18寸-2"），生成步骤已剥离。
   */
  sizeCategory: string;
  /** 该型号涵盖的全部尺寸（去重）。 */
  sizes: string[];
  /** 该型号涵盖的全部孔距（去重）。 */
  pcds: string[];
  /** 该型号涵盖的全部偏距（去重）。 */
  offsets: number[];
  /** 该型号涵盖的全部中心孔（去重）。 */
  centerBores: number[];
  /** 该型号涵盖的全部表面处理（去重）。 */
  finishes: string[];
  /** 全部可下单配置。**规格表的唯一数据源。** */
  variants: WheelVariant[];
  /**
   * 设计系列名。⚠️ 覆盖率 762 / 1349，缺失时为 undefined。
   * ⚠️ 部分值含第三方商标（TE37 / BBS-LM / HRE-FF10 等），
   * 对外发布前必须改写或移除，见 DEC-010 与 fitment-pages-plan.md §3.1。
   */
  styleName?: string;
  /** 制造工艺。⚠️ 覆盖率 38%，缺失时不推测、不填充。 */
  process?: WheelProcess;
  /**
   * 车型适配（车系线索，来自源数据的 `suitableVehicles`）。
   * ⚠️ 源字段实测为空数组（0 / 1349），这里的车系线索是从 `styleName` 派生的，
   * 且**仅为目录标注，不是车辆出厂规格** —— 页面必须标注来源。
   */
  vehicleHints: string[];
  /**
   * 是否有对应图片。**上架门槛**：为 false 的型号不生成页面、不进目录、
   * 不进 sitemap（见 DEC-013）。数据保留，图到位后翻转即可。
   */
  hasImage: boolean;
  /**
   * 该型号的全部图片路径（webp，相对于 `public/`）。
   * ⚠️ 详情页**只取第一张**展示（DEC-014 单图展示）；
   * 其余图片保留供画廊等场景使用。
   */
  images: string[];
};

/** 轮毂目录的生成产物形状（含生成元信息，供校验脚本对账）。 */
export type WheelCatalogue = {
  /** 生成时间（ISO 8601）。 */
  generatedAt: string;
  /** 数据源文件路径，便于追溯。 */
  sourceFile: string;
  /** 全部型号（含无图的，由 `hasImage` 区分）。 */
  models: WheelModel[];
  /** 生成统计，用于 CI 对账：型号总数必须等于上架数 + 未上架数。 */
  stats: {
    /** 源数据里的型号总数。 */
    total: number;
    /** 有图、可上架的数量。 */
    withImage: number;
    /** 无图、暂不上架的数量。 */
    withoutImage: number;
    /** variant 总数。 */
    variants: number;
  };
};

/** Homepage hero — a background slide in the crossfade rotation. */
export type HeroSlide = {
  id: string;
  image: string;
  /** Always empty for hero art — the background is decorative (see spec §27). */
  alt: string;
  /** Editorial note for whoever supplies the next photo. */
  subject?: string;
};

/** Homepage hero — one of the four product-line entry cards. */
export type HeroProduct = {
  id: string;
  title: string;
  subtitle?: string;
  /** One-line explanation — used by the product-line section, not the hero. */
  description?: string;
  href: string;
  image: string;
};

/**
 * A wheel shown in the homepage featured strip.
 *
 * Generated by scripts/generate-home-wheel-strip.mjs — selection is
 * deterministic (one model per size bucket). See home-wheel-strip.ts.
 */
export type FeaturedWheel = {
  model: string;
  image: string;
  /** e.g. "15*7" */
  size: string;
  /** e.g. "4*100" */
  pcd: string;
  finish: string;
  /** Absent when the catalogue does not record a process (38% coverage). */
  process: string | null;
  /** Full description for screen readers — never a bare filename. */
  alt: string;
};
