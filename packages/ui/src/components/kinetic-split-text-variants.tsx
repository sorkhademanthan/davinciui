/* Server-safe variant metadata (no "use client" so docs pages and other
   Server Components can import these values). */

export type KineticVariant =
  | "editorial-rise"
  | "depth-cascade"
  | "split-shutter"
  | "elastic-slam"
  | "blur-rush";

export const KINETIC_VARIANTS: KineticVariant[] = [
  "editorial-rise",
  "depth-cascade",
  "split-shutter",
  "elastic-slam",
  "blur-rush",
];

/** Per-variant default timing + display titles for selectors. */
export const KINETIC_VARIANT_META: Record<
  KineticVariant,
  { title: string; duration: number; stagger: number }
> = {
  "editorial-rise": { title: "Editorial Rise", duration: 0.75, stagger: 0.07 },
  "depth-cascade": { title: "Depth Cascade", duration: 0.925, stagger: 0.105 },
  "split-shutter": { title: "Split Shutter", duration: 0.8, stagger: 0.09 },
  "elastic-slam": { title: "Elastic Slam", duration: 0.75, stagger: 0.07 },
  "blur-rush": { title: "Blur Rush", duration: 0.9, stagger: 0.08 },
};
