import { isBasicPreviewSlug } from "@/components/docs/previews/basic-component-card-slugs";

/**
 * Single preview contract for every component surface.
 *
 * Gallery card, component-page preview, example variants, fullscreen, and the
 * personalized preview used to implement sizing, background, scrolling,
 * fullscreen, and reduced-motion behavior independently — so one component
 * could look correct in one surface and be clipped, differently sized, or
 * non-interactive in another. Each surface now reads the same per-slug
 * definition here instead of hardcoding slug lists and one-off branches.
 *
 * Pure module — no React, no storage. Unknown slugs fall back to defaults
 * that reproduce the historical behavior exactly.
 */

export type PreviewStageHeight = "compact" | "standard" | "tall" | number;

export interface PreviewDefinition {
  /** Registry slug this definition applies to. */
  slug: string;
  /**
   * Detail-page stage height. `compact` (`min-h-[320px]`) fits small
   * primitives whose measured content stays under ~300px; `standard`
   * reproduces the historical `min-h-[420px] lg:min-h-[480px]` shell; `tall`
   * the 600px preloader stage; a number pins an exact pixel minimum.
   * All tiers are minimums — taller content always grows the shell, so tiers
   * can never clip.
   */
  height: PreviewStageHeight;
  /**
   * Optional width/height ratio (e.g. `"16 / 10"`) for immersive stages.
   * Currently unset for every slug — reserved for future curation of
   * full-bleed scenes. Combined with the height minimum, never clips.
   */
  aspect?: string;
  /** Card-surface background classes. */
  cardBackground: string;
  /** Decorative-only card surface (hides it from assistive tech). */
  ariaHidden: boolean;
  /** Safe to keep animating when reduced motion is preferred. */
  reduceMotionSafe: boolean;
  /** Component owns internal scrolling (generalized overflow policy). */
  scrollable: boolean;
  /**
   * Maximum stage height (px) once `scrollable` caps it. Only meaningful with
   * `scrollable: true`; taller content scrolls inside the stage instead of
   * growing the page. Scroll-*linked* components (marquees, scroll galleries,
   * scroll timelines) must stay `scrollable: false` — capping their stage
   * would break the page-scroll linkage their animation depends on.
   */
  scrollMaxHeight: number;
  /** Fullscreen expand control is offered. */
  fullscreen: boolean;
  /** Detail-stage treatment behind the component. */
  stageBackground: "dotted" | "plain";
  /**
   * Main preview content unmounts when far offscreen (same 300px-margin
   * pattern as cards and example sections), pausing canvases, animation
   * loops, and autoplay. False for user-started audio surfaces, which must
   * never be killed by scrolling. Toolbar, tabs, and shell stay mounted.
   */
  unmountOffscreen: boolean;
  /**
   * Universal toolbar controls. Content-driven controls (source,
   * personalize, fullscreen, variants) gate themselves; these three are
   * useful almost everywhere, so they default on and exist mainly so a
   * component can opt out. All on for every slug today.
   */
  controls: {
    search: boolean;
    reload: boolean;
    theme: boolean;
  };
}

/** Tall (600px) detail stages — preloaders and portrait cards. */
const TALL_STAGE_SLUGS: ReadonlySet<string> = new Set([
  "3d-flow-gallery",
  "cms-media-bento",
  "fill-preloader",
  "staircase-preloader",
  "pixel-preloader",
  "editorial-wipe-preloader",
  "geometric-preloader",
  "infinite-image-gallery",
  "cinematic-panel-preloader",
  "glitch-shred-preloader",
  "editorial-card-arc-preloader",
  "masked-arc-preloader",
  "editorial-curtain-preloader",
  "team-slide-reveal",
]);

/**
 * Compact (320px) detail stages. Curated from measured desktop content
 * heights (all ≤292px; shell leaves ≥28px breathing room): small actions,
 * form controls, feedback, navigation, overlays, and data-display
 * primitives. Canvas/immersive categories (Hero Backgrounds, Visual Effects,
 * Premium Components, Text Animations, Cursor Effects, Preloaders) are never
 * compact — headless measurement cannot see their rendered output.
 */
const COMPACT_STAGE_SLUGS: ReadonlySet<string> = new Set([
  "liquid-reveal-button",
  "nudge-button",
  "animated-pill-button",
  "animated-metric",
  "slider",
  "hover-card",
  "input-group",
  "sheet",
  "native-select",
  "combobox",
  "date-picker",
  "input-otp",
  "progress",
  "field",
  "link",
  "switch",
  "spinner",
  "input",
  "checkbox",
  "button",
  "button-group",
  "toggle",
  "select",
  "toast",
  "pagination",
  "dialog",
  "alert-dialog",
  "drawer",
  "popover",
  "tooltip",
  "dropdown-menu",
  "skeleton",
  "navigation-menu",
  "radio",
  "textarea",
  "context-menu",
  "tabs",
  "collapsible",
]);

/** Components that own internal scrolling. */
const SCROLLABLE_SLUGS: ReadonlySet<string> = new Set(["text-reveal"]);

/**
 * Components whose card preview stays live under reduced motion. Basic
 * (CSS-only) previews are inherently safe and covered by rule below.
 */
const REDUCE_MOTION_SAFE_SLUGS: ReadonlySet<string> = new Set([
  "3d-flow-gallery",
  "ambient-audio-toggle",
  "ambient-strip",
  "animated-metric",
  "arc-carousel",
  "arcwave-carousel",
  "streamline-carousel",
  "depth-carousel-3d",
  "animated-pill-button",
  "burn-plus",
  "character-field",
  "cinematic-card-carousel",
  "crumpled-paper-reveal",
  "cms-media-bento",
  "curved-inline-type",
  "wavy-flow-carousel",
  "focus-carousel",
  "glass-scene-dock",
  "hover-cards",
  "infinite-image-gallery",
  "interactive-media-accordion",
  "lens-drift-grid",
  "liquid-chrome-button",
  "liquid-reveal-button",
  "motion-hamburger",
  "neon-mesh-bg",
  "noiser",
  "nudge-button",
  "orbit-spiral-gallery",
  "pixel-flow",
  "pixel-wipe-carousel",
  "radial-fan-deck",
  "services-showcase",
  "shader-text",
  "silk-aurora",
  "soft-fluid-gradient",
  "spectra-noise",
  "spiral-media-gallery",
  "sunlight-effect",
  "tilt-flip-polaroid",
  "vertical-image-marquee",
  "wave-bars-loader",
]);

/** Detail preview overrides for specific components. */
const PREVIEW_OVERRIDES: Record<string, Partial<PreviewDefinition>> = {
  "orbit-spiral-gallery": {
    height: "tall",
    stageBackground: "plain",
  },
};

/** Interactive (non-decorative) card surfaces. */
const NON_DECORATIVE_SLUGS: ReadonlySet<string> = new Set([
  "ambient-audio-toggle",
  "interaction-sound-kit",
  "voice-recorder",
  "keyboard-command-sounds",
  "upload-sound-status",
  "tilt-flip-polaroid",
]);

/**
 * Audio surfaces a scroll-away must never unmount (user-started playback).
 * Same membership as NON_DECORATIVE_SLUGS: these are the interactive audio
 * components.
 */
const KEEP_MOUNTED_SLUGS: ReadonlySet<string> = NON_DECORATIVE_SLUGS;

/** Card surfaces with a bespoke background. */
const CARD_BACKGROUNDS: Readonly<Record<string, string>> = {
  "ambient-audio-toggle": "bg-[#eef4f0] dark:bg-[#101815]",
  "crumpled-paper-reveal": "bg-[#ece6da] dark:bg-[#12110f]",
  "infinite-image-gallery": "bg-[#f3f1ec] dark:bg-[#11100e]",
  "tilt-flip-polaroid": "bg-[#FAFAFA] dark:bg-[#0A0A0B]",
};

const DEFAULT_CARD_BACKGROUND = "bg-background";

export function getPreviewDefinition(slug: string): PreviewDefinition {
  const base: PreviewDefinition = {
    slug,
    height: TALL_STAGE_SLUGS.has(slug)
      ? "tall"
      : COMPACT_STAGE_SLUGS.has(slug)
        ? "compact"
        : "standard",
    cardBackground: CARD_BACKGROUNDS[slug] ?? DEFAULT_CARD_BACKGROUND,
    ariaHidden: !NON_DECORATIVE_SLUGS.has(slug),
    reduceMotionSafe:
      isBasicPreviewSlug(slug) || REDUCE_MOTION_SAFE_SLUGS.has(slug),
    scrollable: SCROLLABLE_SLUGS.has(slug),
    scrollMaxHeight: 560,
    fullscreen: true,
    stageBackground: "dotted",
    controls: { search: true, reload: true, theme: true },
    unmountOffscreen: !KEEP_MOUNTED_SLUGS.has(slug),
  };
  return { ...base, ...(PREVIEW_OVERRIDES[slug] ?? {}) };
}

/** Detail-shell minimum-height classes for a resolved height. */
export function previewStageMinHeight(height: PreviewStageHeight): string {
  if (typeof height === "number") return `min-h-[${height}px]`;
  if (height === "tall") return "min-h-[600px]";
  if (height === "compact") return "min-h-[320px]";
  return "min-h-[420px] lg:min-h-[480px]";
}
