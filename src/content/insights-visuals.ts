import type { MediaAsset } from "./types";

export const insightsHeroMedia: MediaAsset = {
  wordpressId: 44,
  src: "/images/about/cad-design.webp",
  alt: "Engineer reviewing a wheel design at a CAD workstation",
  caption: "Fitment and manufacturing decisions begin with a reviewable specification.",
  hasRender: true,
  approvalStatus: "approved",
  sourceRef: "WP 44 / approved internal media",
};

export const insightGuideMedia: Record<string, MediaAsset> = {
  "how-to-measure-fitment": {
    src: "/images/wheels/17-dm902-5.webp",
    alt: "DM902 wheel used as a visual reference for fitment documentation",
    caption: "Approved wheel media; specifications remain model and variant specific.",
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: "approved wheel publication: dm902",
  },
  "offset-and-backspacing": {
    src: "/images/about/cad-design.webp",
    alt: "Wheel geometry being reviewed at an engineering workstation",
    caption: "Geometry should be checked from a recorded baseline, not appearance alone.",
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: "WP 44 / approved internal media",
  },
  "monoblock-vs-two-piece": {
    src: "/images/wheels/18-ff107.webp",
    alt: "Machined wheel face used to illustrate construction choices",
    caption: "Construction is selected against the project requirement.",
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: "approved wheel inventory media",
  },
  "forged-vs-cast": {
    src: "/images/about/forging-production-line.webp",
    alt: "Wheel manufacturing line inside a Fenghuai production facility",
    caption: "Manufacturing route evidence from the Fenghuai production group.",
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: "WP 116 / approved internal media",
  },
  "finishing-options-explained": {
    src: "/images/about/coating-workshop.webp",
    alt: "Coating workshop used to illustrate finish process planning",
    caption: "Finish availability is confirmed for the selected model and order.",
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: "approved internal media",
  },
  "importing-freight-and-duties": {
    src: "/images/about/factory-aerial.webp",
    alt: "Aerial view of a Fenghuai manufacturing facility",
    caption: "Commercial and shipping terms are confirmed for each destination market.",
    hasRender: true,
    approvalStatus: "approved",
    sourceRef: "WP 114 / approved internal media",
  },
};
