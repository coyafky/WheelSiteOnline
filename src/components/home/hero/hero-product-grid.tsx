/**
 * Reserved split point for the hero product grid.
 *
 * The four cards currently render inline in `home-hero.tsx` because they are
 * simple enough that a wrapper earns nothing. This module exists so the split
 * in the hero PageSpec §30 (`HeroProductGrid.tsx`) has a home the moment the
 * grid needs its own client behaviour — e.g. mobile horizontal snap scrolling
 * or per-card enter animation.
 *
 * Delete this file if the grid never grows; it holds no logic.
 */
export {};
