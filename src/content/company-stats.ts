import type { CompanyStat } from "./types";

/**
 * Capacity figures for `/capabilities` (section ⑤) and the `/about`
 * capability strip.
 *
 * 🔴 PLACEHOLDER DISCIPLINE
 * -------------------------
 * Every figure below is a structural placeholder. Years in operation, floor
 * area, monthly capacity, equipment count and export markets are commercial
 * claims that must be supplied by Fenghuai before launch. `isPlaceholder: true`
 * makes the UI render a visible "Placeholder" flag — the numbers must never
 * reach a visitor as if they were confirmed.
 *
 * Per the page spec: when every row is still a placeholder the section should
 * not ship at all rather than publish invented figures. Flip `isPlaceholder`
 * off per row once production confirms it.
 */
export const capacityStats: CompanyStat[] = [
  {
    index: "01",
    label: "Years in operation",
    value: "⚠️ Pending confirmation",
    body: "Continuous wheel manufacturing experience. Supply the founding year and this becomes a date.",
    isPlaceholder: true,
  },
  {
    index: "02",
    label: "Facility area",
    value: "⚠️ Pending confirmation",
    body: "Forging, multi-axis machining, finishing and inspection under one roof, at one location.",
    isPlaceholder: true,
  },
  {
    index: "03",
    label: "Monthly capacity",
    value: "⚠️ Pending confirmation",
    body: "Realistic monthly output at current line load. This is the figure your lead time is quoted against.",
    isPlaceholder: true,
  },
  {
    index: "04",
    label: "Equipment",
    value: "⚠️ Pending confirmation",
    body: "Number and type of forging presses, machining centres and finishing lines actually on the floor.",
    isPlaceholder: true,
  },
  {
    index: "05",
    label: "Export markets",
    value: "⚠️ Pending confirmation",
    body: "The regions our dealer programme genuinely serves today — region count, not a wish list.",
    isPlaceholder: true,
  },
  {
    index: "06",
    label: "Quality standard",
    value: "⚠️ Pending confirmation",
    body: "The management-system and product standards the plant is actually certified to. Name none until verified.",
    isPlaceholder: true,
  },
];
