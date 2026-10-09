/**
 * 车辆场景图只承担氛围与应用语境，不是客户案例、适配证明或产品证据。
 *
 * 图片均为本项目生成的无品牌合成图。组件必须把它们当作装饰图处理：
 * 空 alt、aria-hidden，并在文字与图片之间保留足够强的深色遮罩。
 */
export type AutomotiveScene = {
  src: string;
  focalPoint: "right";
};

export const automotiveScenes = {
  wheelCatalogue: {
    src: "/images/generated/forged-grand-tourer-hero.webp",
    focalPoint: "right",
  },
  evAssessment: {
    src: "/images/generated/ev-crossover-campus-hero.webp",
    focalPoint: "right",
  },
  selfSealingHero: {
    src: "/images/generated/safety-suv-rain-hero.webp",
    focalPoint: "right",
  },
} as const satisfies Record<string, AutomotiveScene>;
