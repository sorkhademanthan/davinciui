// Canonical component manifest for the Component Library workspace (Step 10A).
// Pure module — no React, no storage. This is NOT a hand-maintained second
// list: identifiers and descriptive metadata derive at module init from the
// existing sources of truth — `apps/web/registry/index.ts` (titles,
// descriptions, categories) and `getDocsSlugs()` from the docs lazy-registry
// (the documented catalog). Tier, family, maturity, token bridges, and core
// slot contracts are rule-based curation overlays with small explicit
// exception tables; anything the rules cannot classify stays visible as
// "needs review" rather than disappearing.

import { components as registryComponents } from "../../registry";
import { BASIC_PREVIEW_SLUGS } from "../../components/docs/previews/basic-component-card-slugs";

export type ComponentTier = "core" | "premium";

export type ComponentFamily =
  | "inputs"
  | "actions"
  | "navigation"
  | "feedback"
  | "overlays"
  | "data-display"
  | "layout"
  | "text"
  | "background"
  | "cursor"
  | "scroll"
  | "media"
  | "carousel";

export type ComponentMaturity = "ready" | "needs-review" | "experimental";

export type SupportLevel = "full" | "partial" | "unknown" | "none";

export interface SupportStatus {
  level: SupportLevel;
  note: string;
}

export type MotionModality =
  | "hover"
  | "pointer"
  | "scroll"
  | "autoplay"
  | "ambient"
  | "not-applicable";

export type ReducedMotionFallback =
  | "static"
  | "simplified"
  | "disabled"
  | "not-applicable";

export interface PremiumTokenBridge {
  canvas?: string;
  surface?: string;
  foreground?: string;
  accent?: string;
  accentSecondary?: string;
  typographyRole?: string;
  radiusToken?: string;
  shadowToken?: string;
  motionDuration?: string;
  motionEasing?: string;
  reducedMotionFallback: ReducedMotionFallback;
}

export interface CoreSlot {
  slot: string;
  variants?: string[];
  states?: string[];
  notes?: string;
}

export interface ComponentManifestEntry {
  id: string;
  name: string;
  description: string;
  tier: ComponentTier;
  family: ComponentFamily;
  maturity: ComponentMaturity;
  /** Registry category, or null for docs-only entries. */
  registryCategory: string | null;
  docsRoute: string;
  experienceRoute: string;
  docsAvailable: boolean;
  registryAvailable: boolean;
  /** A real lazy card preview exists (never a fake placeholder). */
  livePreview: boolean;
  responsive: SupportStatus;
  lightTheme: SupportStatus;
  darkTheme: SupportStatus;
  reducedMotion: SupportStatus;
  keyboard: SupportStatus;
  /** Concrete gaps for needs-review entries; empty when ready. */
  missingChecks: string[];
  motionModality: MotionModality;
  reducedMotionFallback: ReducedMotionFallback;
  /** Explicit minimal token bridge (premium only). */
  bridge: PremiumTokenBridge | null;
  /** Meaningful token slots (core only). */
  slots: CoreSlot[];
  /** Preview mounts lazily near the viewport. */
  lazy: boolean;
  /** How the effect reads with motion removed. */
  staticFallback: string;
}

// ---------------------------------------------------------------------------
// Source-derived catalog
// ---------------------------------------------------------------------------

function humanizeSlug(slug: string): string {
  const words = slug.split("-").filter(Boolean);
  if (words.length === 0) return slug;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/**
 * Slugs with a dedicated lazy card preview inside ComponentCardLivePreview
 * (props union there). BASIC_PREVIEW_SLUGS is checked at runtime; this static
 * list mirrors that component's named previews. If the source adds a slug
 * without updating this list, the entry gracefully falls back to a
 * system-aware bridge card — and `pnpm check:manifest` flags the drift.
 */
export const CARD_LIVE_SLUGS = [
  "circle-cursor",
  "electric-vijdi-cursor",
  "tubes-cursor",
  "magic-cursor-pro",
  "chromatic-cursor",
  "fluid-cursor",
  "geometric-trail-cursor",
  "elastic-blob-cursor",
  "gsap-text",
  "text-morph",
  "shake-text",
  "encrypted-text",
  "fluid-particle-text",
  "glitch-liquid-text",
  "ink-flow",
  "silk-aurora",
  "soft-fluid-gradient",
  "media-text-hover",
  "text-video-mask",
  "random-text-reveal",
  "shader-text",
  "text-reveal",
  "rolling-text",
  "character-field",
  "pixel-flow",
  "pixel-wipe-carousel",
  "segmented-image-carousel",
  "cinematic-card-carousel",
  "ambient-strip",
  "arc-carousel",
  "arcwave-carousel",
  "streamline-carousel",
  "tilt-flip-polaroid",
  "radial-fan-deck",
  "neon-mesh-bg",
  "spectra-noise",
  "noiser",
  "sunlight-effect",
  "vertical-image-marquee",
  "hover-cards",
  "profile-carousel",
  "services-showcase",
  "glass-scene-dock",
  "lens-drift-grid",
  "orbit-spiral-gallery",
  "editorial-image-stack",
  "liquid-reveal-button",
  "animated-metric",
  "nudge-button",
  "animated-pill-button",
  "burn-plus",
  "team-slide-reveal",
  "ambient-audio-toggle",
  "interaction-sound-kit",
  "voice-recorder",
  "keyboard-command-sounds",
  "upload-sound-status",
  "motion-hamburger",
  "liquid-chrome-button",
  "scroll-reveal-image",
  "cms-scroll-gallery",
  "interactive-media-accordion",
  "stacked-scroll-gallery",
  "scroll-sync-gallery",
  "scroll-media-expand",
  "scroll-timeline",
  "fill-preloader",
  "staircase-preloader",
  "pixel-preloader",
  "editorial-wipe-preloader",
  "geometric-preloader",
  "preloader-pro",
  "wave-bars-loader",
] as const;

/** True when a real lazy card preview exists for the slug (never a placeholder). */
export function isCardLiveSlug(slug: string): boolean {
  return (
    (CARD_LIVE_SLUGS as readonly string[]).includes(slug) ||
    (BASIC_PREVIEW_SLUGS as readonly string[]).includes(slug)
  );
}

// ---------------------------------------------------------------------------
// Rule-based curation overlays
// ---------------------------------------------------------------------------

const CORE_CATEGORIES: ReadonlySet<string> = new Set([
  "Actions",
  "Forms",
  "Feedback",
  "Navigation",
  "Overlays",
  "Data Display",
  "Layout",
]);

const CATEGORY_FAMILY: Record<string, ComponentFamily> = {
  Actions: "actions",
  Forms: "inputs",
  Feedback: "feedback",
  Navigation: "navigation",
  Overlays: "overlays",
  "Data Display": "data-display",
  Layout: "layout",
  "Text Animations": "text",
  "Hero Backgrounds": "background",
  "Cursor Effects": "cursor",
  "Visual Effects": "media",
  Preloaders: "feedback",
  Motion: "media",
  Interactions: "media",
  Sound: "media",
  "Premium Components": "media",
};

/** Per-slug family corrections where the category default misleads. */
const FAMILY_OVERRIDES: Record<string, ComponentFamily> = {
  carousel: "carousel",
  "ambient-strip": "carousel",
  "arc-carousel": "carousel",
  "arcwave-carousel": "carousel",
  "streamline-carousel": "carousel",
  "cinematic-card-carousel": "carousel",
  "profile-carousel": "carousel",
  "segmented-image-carousel": "carousel",
  "pixel-wipe-carousel": "carousel",
  "lens-drift-grid": "background",
  "cms-scroll-gallery": "scroll",
  "scroll-media-expand": "scroll",
  "scroll-reveal-image": "scroll",
  "scroll-sync-gallery": "scroll",
  "scroll-timeline": "scroll",
  "stacked-scroll-gallery": "scroll",
  "orbit-spiral-gallery": "media",
  "editorial-image-stack": "carousel",
  "animated-metric": "data-display",
  "liquid-chrome-button": "actions",
  "motion-hamburger": "navigation",
  "radial-fan-deck": "media",
  "wave-bars-loader": "feedback",
  "animated-pill-button": "actions",
  "glass-scene-dock": "navigation",
  "liquid-reveal-button": "actions",
  "nudge-button": "actions",
  "team-slide-reveal": "scroll",
  "alert-dialog": "overlays",
  "aspect-ratio": "layout",
};

interface FamilyBridge {
  modality: MotionModality;
  fallback: ReducedMotionFallback;
  bridge: Omit<PremiumTokenBridge, "reducedMotionFallback">;
  staticFallback: string;
}

const FAMILY_BRIDGES: Record<ComponentFamily, FamilyBridge> = {
  text: {
    modality: "autoplay",
    fallback: "static",
    bridge: {
      foreground: "text.primary",
      accent: "action.primary.background",
      typographyRole: "display",
      motionDuration: "slow",
      motionEasing: "enter",
    },
    staticFallback: "Renders the final text statically in the system typeface.",
  },
  background: {
    modality: "ambient",
    fallback: "static",
    bridge: {
      canvas: "background.canvas",
      surface: "surface.default",
      accent: "action.primary.background",
      motionDuration: "slow",
      motionEasing: "linear",
    },
    staticFallback:
      "Renders a flat first-frame gradient from system canvas/surface.",
  },
  cursor: {
    modality: "pointer",
    fallback: "disabled",
    bridge: {
      accent: "action.primary.background",
      motionDuration: "fast",
      motionEasing: "standard",
    },
    staticFallback:
      "Hidden entirely; the native cursor remains (also on touch devices).",
  },
  scroll: {
    modality: "scroll",
    fallback: "static",
    bridge: {
      surface: "surface.default",
      foreground: "text.primary",
      motionDuration: "slow",
      motionEasing: "enter",
    },
    staticFallback:
      "Renders the end state statically; content stays readable without scrolling.",
  },
  media: {
    modality: "hover",
    fallback: "static",
    bridge: {
      surface: "surface.default",
      foreground: "text.primary",
      radiusToken: "md",
      shadowToken: "shadow.md",
      motionDuration: "normal",
      motionEasing: "standard",
    },
    staticFallback:
      "Renders the resting frame statically; hover-only content stays reachable.",
  },
  carousel: {
    modality: "autoplay",
    fallback: "simplified",
    bridge: {
      surface: "surface.default",
      foreground: "text.primary",
      accent: "action.primary.background",
      radiusToken: "md",
      motionDuration: "slow",
      motionEasing: "enter",
    },
    staticFallback: "Autoplay off; first slide with manual controls.",
  },
  feedback: {
    modality: "autoplay",
    fallback: "simplified",
    bridge: {
      foreground: "text.muted",
      accent: "action.primary.background",
      motionDuration: "normal",
      motionEasing: "linear",
    },
    staticFallback: "Simplified static indicator with text status.",
  },
  actions: {
    modality: "hover",
    fallback: "static",
    bridge: {
      foreground: "action.primary.foreground",
      accent: "action.primary.background",
      motionDuration: "fast",
      motionEasing: "standard",
    },
    staticFallback: "Renders the resting button state statically.",
  },
  navigation: {
    modality: "hover",
    fallback: "static",
    bridge: {
      foreground: "text.primary",
      accent: "action.primary.background",
      motionDuration: "fast",
      motionEasing: "standard",
    },
    staticFallback: "Renders the resting navigation state statically.",
  },
  "data-display": {
    modality: "autoplay",
    fallback: "static",
    bridge: {
      foreground: "text.primary",
      accent: "action.primary.background",
      typographyRole: "display",
      motionDuration: "normal",
      motionEasing: "enter",
    },
    staticFallback: "Renders the final value statically.",
  },
  inputs: {
    modality: "not-applicable",
    fallback: "not-applicable",
    bridge: {},
    staticFallback: "No motion to fall back from.",
  },
  overlays: {
    modality: "not-applicable",
    fallback: "not-applicable",
    bridge: {},
    staticFallback: "No motion to fall back from.",
  },
  layout: {
    modality: "not-applicable",
    fallback: "not-applicable",
    bridge: {},
    staticFallback: "No motion to fall back from.",
  },
};

/** Meaningful slots for flagship core components; other core entries use family fallbacks. */
const CORE_SLOTS: Record<string, CoreSlot[]> = {
  button: [
    {
      slot: "background",
      variants: ["primary", "secondary", "destructive"],
      states: ["default", "hover", "disabled"],
      notes: "Destructive maps to status.danger for backgrounds.",
    },
    {
      slot: "foreground",
      variants: ["primary", "secondary", "destructive"],
      states: ["default", "disabled"],
    },
    {
      slot: "border",
      variants: ["secondary"],
      notes: "Primary is borderless by default.",
    },
    { slot: "ring", states: ["focus-visible"] },
    { slot: "radius", notes: "Shared radius scale." },
    { slot: "spacing", notes: "Padding rhythm from spacing scale." },
    { slot: "typography", notes: "Label role." },
    { slot: "icon-size", notes: "Leading/trailing icon size." },
  ],
  input: [
    { slot: "background" },
    { slot: "foreground" },
    { slot: "border", states: ["default", "focus", "error"] },
    { slot: "ring", states: ["focus-visible"] },
    { slot: "error-border", notes: "status.danger.foreground." },
    { slot: "error-text", notes: "status.danger.foreground." },
    { slot: "label-typography", notes: "Label role." },
    { slot: "radius" },
    { slot: "spacing" },
  ],
  card: [
    { slot: "background" },
    { slot: "border" },
    { slot: "foreground" },
    { slot: "radius" },
    { slot: "shadow" },
    { slot: "spacing" },
  ],
  alert: [
    { slot: "background", variants: ["success", "warning", "danger", "info"] },
    { slot: "border", variants: ["success", "warning", "danger", "info"] },
    { slot: "foreground", variants: ["success", "warning", "danger", "info"] },
    { slot: "icon", variants: ["success", "warning", "danger", "info"] },
    { slot: "radius" },
  ],
  dialog: [
    { slot: "background" },
    { slot: "border" },
    { slot: "shadow" },
    { slot: "scrim", notes: "overlay.scrim dims the canvas." },
    { slot: "radius" },
    { slot: "spacing" },
  ],
  tooltip: [
    { slot: "background", notes: "Typically background.inverse." },
    { slot: "foreground", notes: "Typically text.inverse." },
    { slot: "radius" },
    { slot: "spacing" },
  ],
  select: [
    { slot: "background" },
    { slot: "foreground" },
    { slot: "border", states: ["default", "focus", "error"] },
    { slot: "ring", states: ["focus-visible"] },
    { slot: "radius" },
  ],
  tabs: [
    { slot: "foreground", states: ["default", "active"] },
    { slot: "background", states: ["active"] },
    { slot: "border", notes: "Active indicator." },
  ],
  table: [
    { slot: "foreground" },
    { slot: "border", notes: "Row dividers." },
    { slot: "background", states: ["header", "row-hover"] },
    { slot: "spacing" },
  ],
};

const FAMILY_SLOTS: Record<string, CoreSlot[]> = {
  inputs: [
    { slot: "background" },
    { slot: "foreground" },
    { slot: "border" },
    { slot: "ring", states: ["focus-visible"] },
  ],
  actions: [
    { slot: "background" },
    { slot: "foreground" },
    { slot: "border" },
    { slot: "ring", states: ["focus-visible"] },
  ],
  navigation: [
    { slot: "foreground", states: ["default", "active"] },
    { slot: "background", states: ["active"] },
  ],
  feedback: [
    { slot: "background" },
    { slot: "foreground" },
    { slot: "border" },
  ],
  overlays: [
    { slot: "background" },
    { slot: "border" },
    { slot: "foreground" },
  ],
  "data-display": [
    { slot: "foreground" },
    { slot: "background" },
    { slot: "border" },
  ],
  layout: [{ slot: "background" }, { slot: "border" }],
};

// ---------------------------------------------------------------------------
// Manifest assembly (derived, then curated by rule)
// ---------------------------------------------------------------------------

function fullSupport(note: string): SupportStatus {
  return { level: "full", note };
}

function buildEntry(id: string): ComponentManifestEntry {
  const meta = (
    registryComponents as Record<
      string,
      | { title: string; description: string; category: string; slug: string }
      | undefined
    >
  )[id];
  const registryCategory: string | null = meta?.category ?? null;
  const name = meta?.title ?? humanizeSlug(id);
  const description =
    meta?.description ??
    `${name}: documented component without registry metadata yet.`;
  const resolvedTier: ComponentTier =
    registryCategory === null
      ? id === "alert-dialog" || id === "aspect-ratio"
        ? "core"
        : "premium"
      : CORE_CATEGORIES.has(registryCategory)
        ? "core"
        : "premium";
  const family: ComponentFamily =
    FAMILY_OVERRIDES[id] ??
    (registryCategory !== null && registryCategory in CATEGORY_FAMILY
      ? CATEGORY_FAMILY[registryCategory]!
      : "media");
  const livePreview = isCardLiveSlug(id);
  const docsRoute = `/docs/components/${id}`;
  const experienceRoute = `/experience/components/${id}`;

  if (resolvedTier === "core") {
    const slots = CORE_SLOTS[id] ??
      FAMILY_SLOTS[family] ?? [{ slot: "foreground" }, { slot: "background" }];
    return {
      id,
      name,
      description,
      tier: "core",
      family,
      maturity: "ready",
      registryCategory,
      docsRoute,
      experienceRoute,
      docsAvailable: true,
      registryAvailable: registryCategory !== null,
      livePreview,
      responsive: fullSupport("Core primitives reflow with the grid profile."),
      lightTheme: fullSupport("Token-driven; follows the light theme."),
      darkTheme: fullSupport("Token-driven; follows the dark theme."),
      reducedMotion: fullSupport("Defers to the system reduced-motion policy."),
      keyboard: fullSupport(
        "Documented keyboard support; verify in the docs demo.",
      ),
      missingChecks: [],
      motionModality: "not-applicable",
      reducedMotionFallback: "not-applicable",
      bridge: null,
      slots,
      lazy: livePreview,
      staticFallback: "No motion to fall back from.",
    };
  }

  const preset = FAMILY_BRIDGES[family];
  const missingChecks: string[] = ["dark-theme evidence"];
  if (preset.modality !== "not-applicable")
    missingChecks.push("reduced-motion fallback verification");
  // Cursor effects declare pointer-only limits in their responsive status instead.
  if (family !== "cursor")
    missingChecks.push("responsive verification at 390px and desktop");
  const responsive: SupportStatus =
    family === "cursor"
      ? { level: "partial", note: "Pointer devices only; disabled on touch." }
      : { level: "unknown", note: "Verify at 390px and desktop widths." };
  const keyboard: SupportStatus =
    family === "cursor"
      ? {
          level: "none",
          note: "Pointer-only decorative effect; never carries required actions.",
        }
      : family === "text"
        ? {
            level: "partial",
            note: "Static text fallback stays readable; the effect itself is decorative.",
          }
        : {
            level: "partial",
            note: "Verify focus and keyboard paths in the docs demo.",
          };
  return {
    id,
    name,
    description,
    tier: "premium",
    family,
    maturity: "needs-review",
    registryCategory,
    docsRoute,
    experienceRoute,
    docsAvailable: true,
    registryAvailable: registryCategory !== null,
    livePreview,
    responsive,
    lightTheme: fullSupport(
      "Renders on light canvas; frame follows the theme.",
    ),
    darkTheme: {
      level: "unknown",
      note: "No per-effect dark-theme evidence recorded.",
    },
    reducedMotion: {
      level: preset.fallback === "not-applicable" ? "unknown" : "partial",
      note:
        preset.fallback === "not-applicable"
          ? "No motion to reduce."
          : `Falls back to ${preset.fallback} under reduced motion.`,
    },
    keyboard,
    missingChecks,
    motionModality: preset.modality,
    reducedMotionFallback: preset.fallback,
    bridge: { ...preset.bridge, reducedMotionFallback: preset.fallback },
    slots: [],
    lazy: livePreview,
    staticFallback: preset.staticFallback,
  };
}

/**
 * Documented slugs without registry metadata yet (docs pages exist, the
 * metadata record has not landed). Extracted from `getDocsSlugs()` minus
 * registry keys; verify with `node scripts/check-component-manifest.mjs`.
 * Currently empty: former entries `alert-dialog` and `aspect-ratio`
 * graduated to full registry metadata, so they flow through the normal
 * registry path in `buildEntry`. Keep the mechanism for future docs-only
 * slugs.
 */
const DOCS_ONLY_SLUGS: readonly string[] = [];

function buildManifest(): ComponentManifestEntry[] {
  const registryIds = Object.keys(registryComponents);
  const ids = [...new Set([...registryIds, ...DOCS_ONLY_SLUGS])].sort();
  return ids.map(buildEntry);
}

export const COMPONENT_MANIFEST: readonly ComponentManifestEntry[] =
  buildManifest();

export const CORE_COMPONENT_IDS: readonly string[] = COMPONENT_MANIFEST.filter(
  (entry) => entry.tier === "core",
).map((entry) => entry.id);

export const PREMIUM_COMPONENT_IDS: readonly string[] =
  COMPONENT_MANIFEST.filter((entry) => entry.tier === "premium").map(
    (entry) => entry.id,
  );

export function manifestById(id: string): ComponentManifestEntry | undefined {
  return COMPONENT_MANIFEST.find((entry) => entry.id === id);
}
