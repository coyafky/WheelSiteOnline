import type { BuildEntry } from "./types";

/**
 * Completed builds shown in the vehicle gallery.
 *
 * PLACEHOLDER: these are structural samples so the gallery grid, filtering and
 * hover states can be built and reviewed. Replace with real Fenghuai builds —
 * `image` files go in `public/images/builds/`.
 */
export const builds: BuildEntry[] = [
  {
    id: "build-01",
    vehicle: "BMW G80 M3",
    family: "Monoblock",
    sizes: "20x10 / 20x11",
    finish: "Brushed clear",
    image: "/images/builds/build-01.jpg",
    tags: ["performance", "monoblock", "bmw"],
  },
  {
    id: "build-02",
    vehicle: "BMW F87 M2 Competition",
    family: "Two-Piece Forged",
    sizes: "19x9.5 / 19x10.5",
    finish: "Satin gunmetal",
    image: "/images/builds/build-02.jpg",
    tags: ["performance", "two-piece", "bmw"],
  },
  {
    id: "build-03",
    vehicle: "Mercedes-AMG C63",
    family: "Monoblock",
    sizes: "20x9.5 / 20x10.5",
    finish: "Gloss black",
    image: "/images/builds/build-03.jpg",
    tags: ["performance", "monoblock", "mercedes"],
  },
  {
    id: "build-04",
    vehicle: "Toyota Tacoma",
    family: "Off-Road & Truck",
    sizes: "17x9 / 17x9",
    finish: "Matte bronze",
    image: "/images/builds/build-04.jpg",
    tags: ["off-road", "truck", "toyota"],
  },
  {
    id: "build-05",
    vehicle: "Ford F-150",
    family: "Off-Road & Truck",
    sizes: "20x10 / 20x10",
    finish: "Satin black",
    image: "/images/builds/build-05.jpg",
    tags: ["off-road", "truck", "ford"],
  },
  {
    id: "build-06",
    vehicle: "Porsche 911 (992)",
    family: "Monoblock",
    sizes: "20x9.5 / 21x11.5",
    finish: "Polished lip, satin face",
    image: "/images/builds/build-06.jpg",
    tags: ["performance", "monoblock", "porsche"],
  },
  {
    id: "build-07",
    vehicle: "Audi RS6",
    family: "Two-Piece Forged",
    sizes: "21x10.5 / 21x11.5",
    finish: "Brushed bronze",
    image: "/images/builds/build-07.jpg",
    tags: ["performance", "two-piece", "audi"],
  },
  {
    id: "build-08",
    vehicle: "Land Rover Defender",
    family: "Off-Road & Truck",
    sizes: "20x9.5 / 20x9.5",
    finish: "Matte anthracite",
    image: "/images/builds/build-08.jpg",
    tags: ["off-road", "suv", "land rover"],
  },
  {
    id: "build-09",
    vehicle: "Nissan GT-R R35",
    family: "Monoblock",
    sizes: "20x10 / 20x12",
    finish: "Gloss bronze",
    image: "/images/builds/build-09.jpg",
    tags: ["performance", "monoblock", "nissan"],
  },
];

/** Filter facets derived from the build tags, deduplicated. */
export const buildFamilies = [
  "Monoblock",
  "Two-Piece Forged",
  "Off-Road & Truck",
] as const;
