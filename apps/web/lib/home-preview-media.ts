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
  "3d-flow-gallery",
  "ambient-audio-toggle",
  "ambient-strip",
  "animated-metric",
  "animated-pill-button",
  "arc-carousel",
  "auth-modal",
  "border-beam",
  "burn-plus",
  "cinematic-card-carousel",
  "cms-media-bento",
  "command-menu",
  "focus-carousel",
  "hover-transition",
  "hyper-text",
  "infinite-image-gallery",
  "interaction-sound-kit",
  "interactive-hover-button",
  "keyboard-command-sounds",
  "lens-drift-grid",
  "liquid-blob",
  "liquid-chrome",
  "liquid-chrome-button",
  "motion-hamburger",
  "noise-texture",
  "orbit-spiral-gallery",
  "particle-galaxy",
  "pixel-wipe-carousel",
  "preloader-pro",
  "preloader-pro-v1",
  "preloader-pro-v4",
  "preloader-pro-v5",
  "premium-preloader",
  "profile-carousel",
  "pulsating-button",
  "radial-fan-deck",
  "scrub-input",
  "services-showcase",
  "shimmer-button",
  "showcase-card",
  "spiral-media-gallery",
  "spotlight-card",
  "testimonial-marquee",
  "text-animate",
  "typeset",
  "upload-sound-status",
  "vertical-image-marquee",
  "voice-recorder",
  "wave-bars-loader",
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

/**
 * Components whose static poster should use one theme variant for both modes.
 * `sunlight-effect` ships a single green cover, so light and dark cards share
 * the same image instead of falling back to the (blank) dark frame.
 */
const POSTER_THEME_OVERRIDES: Partial<Record<string, HomePreviewTheme>> = {
  "sunlight-effect": "light",
};

/**
 * Single source of truth for a card poster path. The poster is always named
 * after the component slug, so a card can never point at another component's
 * image by accident.
 */
export function homePreviewPoster(
  slug: string,
  theme: HomePreviewTheme,
): string {
  const posterTheme = POSTER_THEME_OVERRIDES[slug] ?? theme;
  return `${BASE}/${slug}/${slug}-${posterTheme}.webp`;
}

export function homePreviewMedia(
  slug: string,
  theme: HomePreviewTheme,
  overrides?: HomePreviewOverrides,
): HomePreviewMedia {
  const path = `${BASE}/${slug}/${slug}-${theme}`;
  const poster = homePreviewPoster(slug, theme);
  const localWebm = { src: `${path}.webm`, type: "video/webm" } as const;
  const localMp4 = { src: `${path}.mp4`, type: "video/mp4" } as const;
  const contentful = contentfulPreviewSource(slug, theme, overrides);

  if (CONTENTFUL_PREVIEW_SLUGS.has(slug)) {
    return {
      poster,
      sources: contentful ? [contentful] : [],
    };
  }

  return {
    poster,
    sources: [localWebm, localMp4],
  };
}
