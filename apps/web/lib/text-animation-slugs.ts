export const TEXT_ANIMATION_ORDER = [
  "gsap-text",
  "text-video-mask",
  "curved-inline-type",
  "shake-text",
  "rolling-text",
  "media-text-hover",
  "random-text-reveal",
  "text-morph",
  "text-reveal",
  "shader-text",
  "fluid-particle-text",
  "encrypted-text",
  "glitch-liquid-text",
] as const;

export const TEXT_ANIMATION_SLUGS: ReadonlySet<string> = new Set(
  TEXT_ANIMATION_ORDER,
);
