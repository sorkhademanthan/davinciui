/**
 * Preview media sources.
 *
 * Slugs in CONTENTFUL_PREVIEW_SLUGS are CMS-owned: their video must come from
 * the published Contentful `component` entry only. The local WebP poster is
 * still used as a placeholder, but no local video fallback is emitted.
 * Other slugs keep using the app's static assets.
 */
const BASE = (
  process.env.NEXT_PUBLIC_HOME_PREVIEW_VIDEO_BASE ?? "/preview-videos/home"
).replace(/\/$/, "");

export type HomePreviewTheme = "light" | "dark";

export type HomePreviewOverrides = Record<
  string,
  Partial<Record<HomePreviewTheme, string>>
>;

export type HomePreviewMedia = {
  poster: string;
  sources: { src: string; type: "video/mp4" | "video/webm" }[];
};

export const CONTENTFUL_PREVIEW_SLUGS = new Set([
  "neon-mesh-bg",
  "silk-aurora",
  "soft-fluid-gradient",
  "ink-flow",
  "character-field",
  "spectra-noise",
  "noiser",
  "sunlight-effect",
  "hover-cards",
  "pixel-flow",
  "gsap-text",
  "text-video-mask",
  "scroll-reveal-image",
  "geometric-trail-cursor",
  "tubes-cursor",
  "electric-vijdi-cursor",
  "chromatic-cursor",
  "magic-cursor-pro",
  "circle-cursor",
  "elastic-blob-cursor",
  "curved-inline-type",
  "shake-text",
  "rolling-text",
  "media-text-hover",
  "random-text-reveal",
  "text-morph",
  "shader-text",
  "fluid-particle-text",
  "encrypted-text",
  "glitch-liquid-text",
  "editorial-curtain-preloader",
  "pixel-preloader",
  "fill-preloader",
  "cinematic-panel-preloader",
  "glitch-shred-preloader",
  "editorial-card-arc-preloader",
  "masked-arc-preloader",
  "staircase-preloader",
  "geometric-preloader",
  "editorial-wipe-preloader",
  "wavy-flow-carousel",
  "scroll-sync-gallery",
  "scroll-timeline",
  "scroll-media-expand",
  "interactive-media-accordion",
  "stacked-scroll-gallery",
  "circular-gallery",
  "arcwave-carousel",
  "streamline-carousel",
  "depth-carousel-3d",
  "curve-wall",
  "crumpled-paper-reveal",
  "tilt-flip-polaroid",
  "liquid-reveal-button",
  "glass-scene-dock",
  "nudge-button",
  "team-slide-reveal",
]);

function absoluteAssetUrl(url: string) {
  return url.startsWith("//") ? `https:${url}` : url;
}

export function contentfulPreviewSource(
  slug: string,
  theme: HomePreviewTheme,
  overrides?: HomePreviewOverrides,
): HomePreviewMedia["sources"][number] | null {
  if (!CONTENTFUL_PREVIEW_SLUGS.has(slug)) return null;
  const url = overrides?.[slug]?.[theme];
  if (!url) return null;
  return { src: absoluteAssetUrl(url), type: "video/mp4" };
}

export function homePreviewMedia(
  slug: string,
  theme: HomePreviewTheme,
  overrides?: HomePreviewOverrides,
): HomePreviewMedia {
  const path = `${BASE}/${slug}/${slug}-${theme}`;
  const localWebm = { src: `${path}.webm`, type: "video/webm" } as const;
  const localMp4 = { src: `${path}.mp4`, type: "video/mp4" } as const;
  const contentful = contentfulPreviewSource(slug, theme, overrides);

  if (CONTENTFUL_PREVIEW_SLUGS.has(slug)) {
    return {
      poster: `${path}.webp`,
      sources: contentful ? [contentful] : [],
    };
  }

  return {
    poster: `${path}.webp`,
    sources: [localWebm, localMp4],
  };
}
