/**
 * 轮毂总询盘清单的短反馈文案。
 *
 * 这里保存跨目录卡片、详情页和总询盘清单复用的 UI 文案；组件只负责把
 * 当前型号、生产编码和持久化后的数量代入。
 */
export const inquiryCartUi = {
  addLabel: "Add to enquiry",
  addedLabel: "Added",
  addedToast: (model: string, productionCode: string) =>
    `${model} / ${productionCode} added to your total enquiry.`,
  quantityUpdatedToast: (model: string, productionCode: string, quantity: number) =>
    `${model} / ${productionCode} is already in your total enquiry. Quantity is now ${quantity}.`,
  fullToast: "Your total enquiry already contains 20 configurations. Remove one before adding another.",
} as const;
