// Design-system domain contract (Step 1: domain only).
// Versioned, serializable, UI-independent canonical schema for the future builder.
// No builder screens, export generation, or persistence migration live here.

export const DESIGN_SYSTEM_VERSION = 2 as const;

export type Density = "compact" | "comfortable" | "spacious";

// ---------------------------------------------------------------------------
// Foundations
// ---------------------------------------------------------------------------

export type PaletteRole =
  | "brand"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "custom";

export interface Palette {
  id: string;
  label: string;
  role: PaletteRole;
  base: string;
  /** Editable shade/value map, e.g. "50".."950". */
  shades: Record<string, string>;
  enabled: boolean;
}

export type TypographyRole = "display" | "heading" | "body" | "label" | "mono";

export interface TypefaceSpec {
  fontFamily: string;
  fallback: string[];
  weight: number;
  size: string;
  lineHeight: number | string;
  letterSpacing: string;
}

export interface TextStyle extends TypefaceSpec {
  id: string;
  label: string;
  role: TypographyRole;
}

export interface TypographyFoundations {
  /** Primary typeface used across roles unless a role overrides it. */
  primary: string;
  roles: Record<TypographyRole, TypefaceSpec>;
  styles: TextStyle[];
}

export interface ScaleToken {
  id: string;
  value: string;
}

export interface SpacingFoundations {
  base: number;
  /** Named scale, e.g. space-1 through space-12. */
  scale: ScaleToken[];
}

export interface SizingFoundations {
  /** Named component/layout dimensions, e.g. control-md or content-lg. */
  tokens: ScaleToken[];
}

export type RadiusKey = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface RadiusToken {
  id: string;
  label: string;
  value: string;
}

export interface RadiusFoundations {
  base: number;
  /** Ordered, editable corner scale. `full` is the intentional pill value. */
  scale: RadiusToken[];
}

export interface BorderToken {
  id: string;
  label: string;
  /** Border-width token key (e.g. "thin"); legacy raw lengths still resolve. */
  width: string;
  /** Border-style key (e.g. "solid"); must exist in `styles` to be available. */
  style: string;
  /** Palette shade ("neutral.200"), semantic alias ("focus.ring"), or raw hex fallback. */
  color: string;
  enabled?: boolean;
}

export interface BorderFoundations {
  widths: Record<string, string>;
  styles: Record<string, string>;
  /** Style keys hidden from recipe pickers; data is preserved for re-enable. */
  disabledStyles?: string[];
  /** Style pre-selected for new recipes. Defaults to "solid" when absent. */
  defaultStyle?: string;
  tokens: BorderToken[];
}

/**
 * One structured shadow layer. Offsets/blur/spread are pixels; opacity is
 * 0–1. Color is a palette shade ("neutral.950"), a semantic alias, or a raw
 * six-digit hex fallback — never an opaque CSS string, so previews can
 * resolve the actual color and apply opacity deterministically.
 */
export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export interface ShadowToken {
  id: string;
  label: string;
  /** Legacy/opaque CSS value. Kept in sync with `layers` when present. */
  value: string;
  description?: string;
  /** Structured layers. Absent on pre-layer systems, which render `value`. */
  layers?: ShadowLayer[];
  /** Disabled recipes are hidden from pickers/previews but keep their data. */
  enabled?: boolean;
}

export interface ShadowFoundations {
  tokens: ShadowToken[];
}

export interface DurationToken {
  id: string;
  label: string;
  /** Canonical milliseconds value, e.g. "200ms". */
  value: string;
  description?: string;
  enabled?: boolean;
}

export interface EasingToken {
  id: string;
  label: string;
  /** CSS easing value: keyword, cubic-bezier(), or steps(). */
  value: string;
  description?: string;
  enabled?: boolean;
}

export type ReducedMotionPolicy = "respect-preference" | "reduce-all" | "none";

export interface MotionFoundations {
  /** Ordered, editable duration scale. */
  durations: DurationToken[];
  /** Ordered, editable easing library. */
  easings: EasingToken[];
  reducedMotion: ReducedMotionPolicy;
}

export type IconColorRole = "default" | "muted" | "action" | "success" | "warning" | "danger";

export interface IconSizeToken {
  id: string;
  label: string;
  /** Canonical pixel value, e.g. "20px". */
  value: string;
  description?: string;
}

export type IconLineCap = "round" | "butt" | "square";
export type IconLineJoin = "round" | "miter" | "bevel";

export interface IconFoundations {
  /** Icon set metadata: "lucide" renders; "custom" is metadata-only (future SVG pipeline). */
  library: string;
  /** Default size token id. */
  defaultSize: string;
  /** Ordered, editable size scale. */
  sizes: IconSizeToken[];
  strokeWidth: number;
  lineCap?: IconLineCap;
  lineJoin?: IconLineJoin;
  /** Foundation color-role defaults as palette-shade references (not semantic tokens yet). */
  colors: Record<IconColorRole, string>;
}

export interface BreakpointToken {
  id: string;
  label: string;
  /** Canonical minimum-width value, e.g. "768px". */
  value: string;
  description?: string;
}

export interface BreakpointsFoundations {
  /** Mobile-first ordered scale. `base` (0px) is always first and immutable. */
  scale: BreakpointToken[];
}

export interface GridFoundations {
  columns: number;
  gutter: string;
  maxWidth: string;
}

export interface Foundations {
  colors: { palettes: Palette[] };
  typography: TypographyFoundations;
  spacing: SpacingFoundations;
  sizing: SizingFoundations;
  radius: RadiusFoundations;
  borders: BorderFoundations;
  shadows: ShadowFoundations;
  motion: MotionFoundations;
  icons: IconFoundations;
  grid: GridFoundations;
  breakpoints: BreakpointsFoundations;
  density: Density;
}

// ---------------------------------------------------------------------------
// System layer: semantic tokens, themes, component tokens
// ---------------------------------------------------------------------------

export type SemanticCategory =
  | "background"
  | "text"
  | "border"
  | "action"
  | "focus"
  | "surface"
  | "status"
  | "overlay"
  | "custom";

export interface SemanticToken {
  id: string;
  label: string;
  category: SemanticCategory;
  /** Raw value (hex) or reference ("brand.600", another token id). */
  value: string;
  description?: string;
}

export interface Theme {
  id: string;
  label: string;
  mode: "light" | "dark";
  /** Semantic token id -> override value or reference. */
  overrides: Record<string, string>;
}

export interface ComponentTokenOverride {
  /** Token slot within the component, e.g. "background". */
  token: string;
  value: string;
  variant?: string;
  state?: string;
}

export interface ComponentTokens {
  component: string;
  label?: string;
  overrides: ComponentTokenOverride[];
}

// ---------------------------------------------------------------------------
// Top-level system
// ---------------------------------------------------------------------------

export interface DesignSystemMeta {
  name: string;
  team?: string;
  brand?: string;
  description?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignSystemStarter {
  presetId: string;
  label: string;
}

/** Export metadata only — token/documentation export generation lives elsewhere. */
export interface DesignSystemExportMeta {
  version: string;
  generator: string;
}

export interface DesignSystemConfig {
  schemaVersion: typeof DESIGN_SYSTEM_VERSION;
  id: string;
  meta: DesignSystemMeta;
  starter: DesignSystemStarter;
  foundations: Foundations;
  semanticTokens: SemanticToken[];
  themes: Theme[];
  components: ComponentTokens[];
  exportMeta?: DesignSystemExportMeta;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value.trim());
}

function slugify(value: string, fallback = "design-system"): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || fallback;
}

/** Unique id for a new system. Exported for the starter factory (starters.ts). */
export function newId(name: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 6)
      : Math.random().toString(36).slice(2, 8);
  return `${slugify(name)}-${random}`;
}

const clamp = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

/**
 * Build an 11-step shade scale from a base color.
 * Signature is positional-compatible with the v1 helper: (base, id, label).
 */
export function paletteFrom(
  base: string,
  id = "brand",
  label = "Primary",
  role: PaletteRole = "brand",
): Palette {
  const valid = isHexColor(base) ? base.trim() : "#635bff";
  const rgb = [1, 3, 5].map((start) => Number.parseInt(valid.slice(start, start + 2), 16));
  const tint = (target: number, amount: number): string =>
    `#${rgb
      .map((channel) => clamp(channel + (target - channel) * amount).toString(16).padStart(2, "0"))
      .join("")}`;
  return {
    id,
    label,
    role,
    base: valid,
    enabled: true,
    shades: {
      "50": tint(255, 0.92),
      "100": tint(255, 0.83),
      "200": tint(255, 0.68),
      "300": tint(255, 0.5),
      "400": tint(255, 0.25),
      "500": valid,
      "600": tint(0, 0.12),
      "700": tint(0, 0.26),
      "800": tint(0, 0.43),
      "900": tint(0, 0.6),
      "950": tint(0, 0.78),
    },
  };
}

function neutralPalette(): Palette {
  return paletteFrom("#71717a", "neutral", "Neutral", "neutral");
}

export function defaultTypography(primary: string): TypographyFoundations {
  const fallback = ["system-ui", "-apple-system", "Segoe UI", "sans-serif"];
  const monoFallback = ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"];
  const spec = (
    role: TypographyRole,
    overrides: Partial<TypefaceSpec> & { fontFamily?: string },
  ): TypefaceSpec => ({
    fontFamily: overrides.fontFamily ?? primary,
    fallback: role === "mono" ? monoFallback : fallback,
    weight: 400,
    size: "1rem",
    lineHeight: 1.5,
    letterSpacing: "0em",
    ...overrides,
  });
  const roles: Record<TypographyRole, TypefaceSpec> = {
    display: spec("display", { weight: 700, size: "3rem", lineHeight: 1.1, letterSpacing: "-0.02em" }),
    heading: spec("heading", { weight: 600, size: "1.5rem", lineHeight: 1.25, letterSpacing: "-0.01em" }),
    body: spec("body", { weight: 400, size: "1rem", lineHeight: 1.5, letterSpacing: "0em" }),
    label: spec("label", { weight: 500, size: "0.875rem", lineHeight: 1.4, letterSpacing: "0em" }),
    mono: spec("mono", { weight: 400, size: "0.875rem", lineHeight: 1.5, letterSpacing: "0em" }),
  };
  const styles: TextStyle[] = [
    { id: "display", label: "Display", role: "display", ...roles.display },
    { id: "h1", label: "Heading 1", role: "heading", ...roles.heading, size: "2.25rem", weight: 700 },
    { id: "h2", label: "Heading 2", role: "heading", ...roles.heading, size: "1.875rem" },
    { id: "h3", label: "Heading 3", role: "heading", ...roles.heading, size: "1.5rem" },
    { id: "body", label: "Body", role: "body", ...roles.body },
    { id: "body-sm", label: "Body small", role: "body", ...roles.body, size: "0.875rem" },
    { id: "label", label: "Label", role: "label", ...roles.label },
    { id: "code", label: "Code", role: "mono", ...roles.mono },
  ];
  return { primary, roles, styles };
}

export function defaultSpacing(base: number): SpacingFoundations {
  const steps = [1, 2, 3, 4, 6, 8, 12];
  // space-1..space-12 ids stay stable; values derive from the base unit.
  const values: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 6, 7: 8, 8: 8, 9: 10, 10: 12, 11: 14, 12: 16 };
  return {
    base,
    scale: Object.entries(values).map(([step, multiplier]) => ({
      id: `space-${step}`,
      value: `${multiplier * base}px`,
    })),
  };
}

/** Canonical component/layout sizing tokens. Values stay in px. */
export function defaultSizing(): SizingFoundations {
  return {
    tokens: [
      { id: "control-sm", value: "32px" },
      { id: "control-md", value: "40px" },
      { id: "control-lg", value: "48px" },
      { id: "icon-sm", value: "16px" },
      { id: "icon-md", value: "20px" },
      { id: "icon-lg", value: "24px" },
      { id: "content-sm", value: "640px" },
      { id: "content-md", value: "768px" },
      { id: "content-lg", value: "1024px" },
    ],
  };
}

export function defaultRadius(base: number): RadiusFoundations {  return {
    base,
    scale: [
      { id: "none", label: "None", value: "0px" },
      { id: "xs", label: "X-Small", value: `${Math.max(0, base - 6)}px` },
      { id: "sm", label: "Small", value: `${Math.max(0, base - 4)}px` },
      { id: "md", label: "Medium", value: `${base}px` },
      { id: "lg", label: "Large", value: `${base + 4}px` },
      { id: "xl", label: "X-Large", value: `${base + 8}px` },
      { id: "2xl", label: "2X-Large", value: `${base + 12}px` },
      { id: "full", label: "Full (pill)", value: "9999px" },
    ],
  };
}

export function defaultBorders(): BorderFoundations {
  return {
    widths: { none: "0px", hairline: "1px", thin: "1px", default: "1px", medium: "2px", thick: "4px" },
    styles: { solid: "solid", dashed: "dashed", dotted: "dotted", none: "none" },
    tokens: [
      { id: "border.subtle", label: "Subtle border", width: "hairline", style: "solid", color: "neutral.200" },
      { id: "border.default", label: "Default border", width: "default", style: "solid", color: "neutral.200" },
      { id: "border.strong", label: "Strong border", width: "medium", style: "solid", color: "neutral.300" },
      { id: "border.focus", label: "Focus border", width: "medium", style: "solid", color: "focus.ring" },
      { id: "border.error", label: "Error border", width: "thin", style: "solid", color: "danger.500" },
    ],
  };
}

export function defaultShadows(): ShadowFoundations {
  const layer = (
    x: number,
    y: number,
    blur: number,
    spread: number,
    opacity: number,
    inset = false,
  ): ShadowLayer => ({ x, y, blur, spread, color: "neutral.950", opacity, inset });
  return {
    tokens: [
      { id: "shadow.none", label: "None", value: "none", layers: [], description: "Flat surfaces with no elevation." },
      {
        id: "shadow.xs",
        label: "X-Small",
        value: "0 1px 2px 0 rgb(25 25 27 / 0.05)",
        layers: [layer(0, 1, 2, 0, 0.05)],
        description: "Hairline lift for inline elements.",
      },
      {
        id: "shadow.sm",
        label: "Small",
        value: "0 1px 2px 0 rgb(25 25 27 / 0.05)",
        layers: [layer(0, 1, 2, 0, 0.05)],
        description: "Subtle elevation for inline elements.",
      },
      {
        id: "shadow.md",
        label: "Medium",
        value: "0 4px 6px -1px rgb(25 25 27 / 0.1), 0 2px 4px -2px rgb(25 25 27 / 0.1)",
        layers: [layer(0, 4, 6, -1, 0.1), layer(0, 2, 4, -2, 0.1)],
        description: "Default card and popover elevation.",
      },
      {
        id: "shadow.lg",
        label: "Large",
        value: "0 10px 15px -3px rgb(25 25 27 / 0.1), 0 4px 6px -4px rgb(25 25 27 / 0.1)",
        layers: [layer(0, 10, 15, -3, 0.1), layer(0, 4, 6, -4, 0.1)],
        description: "Dialogs and large overlays.",
      },
      {
        id: "shadow.xl",
        label: "X-Large",
        value: "0 20px 25px -5px rgb(25 25 27 / 0.1), 0 8px 10px -6px rgb(25 25 27 / 0.1)",
        layers: [layer(0, 20, 25, -5, 0.1), layer(0, 8, 10, -6, 0.1)],
        description: "Floating panels and high overlays.",
      },
    ],
  };
}

export function defaultMotion(): MotionFoundations {
  return {
    durations: [
      { id: "instant", label: "Instant", value: "0ms", description: "No motion. Immediate state changes." },
      { id: "fast", label: "Fast", value: "120ms", description: "Micro-feedback: presses, hovers, focus." },
      { id: "normal", label: "Normal", value: "200ms", description: "Default interface transitions." },
      { id: "slow", label: "Slow", value: "320ms", description: "Panels, menus, and larger reveals." },
      { id: "deliberate", label: "Deliberate", value: "650ms", description: "Rare, emphasized moments only." },
    ],
    easings: [
      { id: "linear", label: "Linear", value: "linear", description: "Constant speed. Loading and progress only." },
      { id: "standard", label: "Standard", value: "cubic-bezier(0.4, 0, 0.2, 1)", description: "Default easing for interface motion." },
      { id: "enter", label: "Enter", value: "cubic-bezier(0, 0, 0.2, 1)", description: "Decelerate into view for appearing elements." },
      { id: "exit", label: "Exit", value: "cubic-bezier(0.4, 0, 1, 1)", description: "Accelerate out of view for dismissals." },
      { id: "emphasized", label: "Emphasized", value: "cubic-bezier(0.2, 0, 0, 1)", description: "Expressive easing for hero moments." },
    ],
    reducedMotion: "respect-preference",
  };
}

export function defaultIcons(): IconFoundations {
  return {
    library: "lucide",
    defaultSize: "icon-md",
    sizes: [
      { id: "icon-xs", label: "X-Small", value: "12px", description: "Inline indicators and dense metadata." },
      { id: "icon-sm", label: "Small", value: "16px", description: "Buttons, inputs, and menu items." },
      { id: "icon-md", label: "Medium", value: "20px", description: "Default interface icons." },
      { id: "icon-lg", label: "Large", value: "24px", description: "Navigation and feature highlights." },
      { id: "icon-xl", label: "X-Large", value: "32px", description: "Empty states and hero moments." },
    ],
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round",
    // Neutral-based so every starter (including neutral-only Blank) resolves.
    colors: {
      default: "neutral.700",
      muted: "neutral.500",
      action: "neutral.900",
      success: "neutral.700",
      warning: "neutral.700",
      danger: "neutral.700",
    },
  };
}

export function defaultGrid(): GridFoundations {
  return { columns: 12, gutter: "24px", maxWidth: "1200px" };
}

export function defaultBreakpoints(): BreakpointsFoundations {
  return {
    scale: [
      { id: "base", label: "Base", value: "0px", description: "Mobile-first default. Always 0px, never deleted." },
      { id: "sm", label: "Small", value: "640px", description: "Large phones and small tablets." },
      { id: "md", label: "Medium", value: "768px", description: "Tablets and small laptops." },
      { id: "lg", label: "Large", value: "1024px", description: "Laptops and small desktops." },
      { id: "xl", label: "X-Large", value: "1280px", description: "Desktops and large screens." },
      { id: "2xl", label: "2X-Large", value: "1536px", description: "Wide desktop displays." },
    ],
  };
}

/** Semantic defaults required to render a basic interface. */
export function defaultSemanticTokens(actionBackground: string): SemanticToken[] {
  return [
    { id: "background.canvas", label: "Canvas background", category: "background", value: "#ffffff" },
    {
      id: "background.surface",
      label: "Surface background",
      category: "surface",
      value: "#fafafa",
      description: "Cards and raised surfaces in light mode.",
    },
    { id: "text.primary", label: "Primary text", category: "text", value: "neutral.900" },
    { id: "text.muted", label: "Muted text", category: "text", value: "neutral.500" },
    { id: "border.default", label: "Default border", category: "border", value: "neutral.200" },
    { id: "action.primary.background", label: "Primary action background", category: "action", value: actionBackground },
    { id: "action.primary.foreground", label: "Primary action foreground", category: "action", value: "#ffffff" },
    { id: "focus.ring", label: "Focus ring", category: "focus", value: actionBackground },
  ];
}

export function defaultThemes(): Theme[] {
  return [
    {
      id: "light",
      label: "Light",
      mode: "light",
      overrides: {
        "background.canvas": "#ffffff",
        "background.surface": "#fafafa",
        "text.primary": "#18181b",
        "text.muted": "#71717a",
        "border.default": "#e4e4e7",
      },
    },
    {
      id: "dark",
      label: "Dark",
      mode: "dark",
      overrides: {
        "background.canvas": "#09090b",
        "background.surface": "#18181b",
        "text.primary": "#fafafa",
        "text.muted": "#a1a1aa",
        "border.default": "#27272a",
      },
    },
  ];
}

/** Variant/state-aware component token seeds for Button, Input, Card, Dialog. */
export function defaultComponents(): ComponentTokens[] {
  return [
    {
      component: "Button",
      label: "Button",
      overrides: [
        { token: "background", value: "action.primary.background", variant: "primary" },
        { token: "foreground", value: "action.primary.foreground", variant: "primary" },
        { token: "background", value: "action.primary.background", variant: "primary", state: "hover" },
        { token: "border", value: "border.default", variant: "secondary" },
        { token: "ring", value: "focus.ring", state: "focus-visible" },
      ],
    },
    {
      component: "Input",
      label: "Input",
      overrides: [
        { token: "background", value: "background.canvas" },
        { token: "border", value: "border.default" },
        { token: "foreground", value: "text.primary" },
        { token: "ring", value: "focus.ring", state: "focus-visible" },
      ],
    },
    {
      component: "Card",
      label: "Card",
      overrides: [
        { token: "background", value: "background.surface" },
        { token: "border", value: "border.default" },
        { token: "foreground", value: "text.primary" },
      ],
    },
    {
      component: "Dialog",
      label: "Dialog",
      overrides: [
        { token: "background", value: "background.canvas" },
        { token: "border", value: "border.default" },
        { token: "shadow", value: "shadow.lg" },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Starters (legacy compatibility shim)
// ---------------------------------------------------------------------------
// The canonical source of truth for starter templates is starters.ts
// (STARTERS + createSystemFromStarter). The definitions below are kept
// unchanged so existing onboarding, repository, migration, and test
// call-sites keep compiling and behaving as before.

export interface StarterDefinition {
  id: string;
  name: string;
  description: string;
  /** Suggested brand base color; null means neutral-only (Blank). */
  color: string | null;
  font: string;
  spacing: number;
  radius: number;
  density: Density;
}

export const presets: readonly StarterDefinition[] = [
  { id: "blank", name: "Blank", description: "Minimal defaults, ready to validate.", color: null, font: "Inter", spacing: 4, radius: 8, density: "comfortable" },
  { id: "minimal", name: "Minimal", description: "Neutral palette and subtle elevation.", color: "#18181b", font: "Inter", spacing: 4, radius: 8, density: "comfortable" },
  { id: "saas", name: "SaaS", description: "Balanced product-interface defaults.", color: "#635bff", font: "Inter", spacing: 4, radius: 10, density: "comfortable" },
  { id: "enterprise", name: "Enterprise", description: "Dense, data-oriented defaults.", color: "#0f766e", font: "Inter", spacing: 4, radius: 6, density: "compact" },
  { id: "editorial", name: "Editorial", description: "Expressive type and measured space.", color: "#a16207", font: "Georgia", spacing: 4, radius: 4, density: "comfortable" },
  { id: "ecommerce", name: "E-commerce", description: "Clear product and action hierarchy.", color: "#db2777", font: "Inter", spacing: 4, radius: 10, density: "comfortable" },
  { id: "dark-first", name: "Dark-first", description: "Dark-led palette with contrast defaults.", color: "#8b5cf6", font: "Inter", spacing: 4, radius: 10, density: "comfortable" },
] as const;

function starterById(presetId: string): StarterDefinition {
  return presets.find((item) => item.id === presetId) ?? presets[0]!;
}

interface CanonicalSeed {
  palettes: Palette[];
  actionBackground: string;
}

function seedForStarter(starter: StarterDefinition, colorOverride?: string): CanonicalSeed {
  const neutral = neutralPalette();
  if (starter.id === "blank") {
    // Blank is always neutral-only: no forced accent palette, even when a
    // color override is supplied (e.g. from the creation wizard).
    return { palettes: [neutral], actionBackground: "neutral.900" };
  }
  const base = (colorOverride && isHexColor(colorOverride) ? colorOverride.trim() : starter.color) as string | null;
  if (!base) {
    // Blank: neutral only, no forced accent; actions use an accessible dark neutral.
    return { palettes: [neutral], actionBackground: "neutral.900" };
  }
  return { palettes: [paletteFrom(base), neutral], actionBackground: "brand.600" };
}

function assembleSystem(options: {
  name: string;
  team?: string;
  brand?: string;
  description?: string;
  starter: StarterDefinition;
  palettes: Palette[];
  actionBackground: string;
  font: string;
  density: Density;
}): DesignSystemConfig {
  const now = new Date().toISOString();
  return {
    schemaVersion: DESIGN_SYSTEM_VERSION,
    id: newId(options.name),
    meta: {
      name: options.name,
      team: options.team,
      brand: options.brand,
      description: options.description,
      version: "1.0",
      createdAt: now,
      updatedAt: now,
    },
    starter: { presetId: options.starter.id, label: options.starter.name },
    foundations: {
      colors: { palettes: options.palettes },
      typography: defaultTypography(options.font),
      spacing: defaultSpacing(options.starter.spacing),
      sizing: defaultSizing(),
      radius: defaultRadius(options.starter.radius),
      borders: defaultBorders(),
      shadows: defaultShadows(),
      motion: defaultMotion(),
      icons: defaultIcons(),
      grid: defaultGrid(),
      breakpoints: defaultBreakpoints(),
      density: options.density,
    },
    semanticTokens: defaultSemanticTokens(options.actionBackground),
    themes: defaultThemes(),
    components: defaultComponents(),
    exportMeta: { version: "1.0", generator: "davinciui-builder" },
  };
}

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------

export interface CreateBlankInput {
  name: string;
  team?: string;
  brand?: string;
  description?: string;
}

/**
 * Neutral, safe baseline: one neutral palette, no forced accent.
 * Legacy shim — new code should use createSystemFromStarter from starters.ts.
 */
export function createBlankDesignSystem(input: CreateBlankInput): DesignSystemConfig {
  const starter = starterById("blank");
  const seed = seedForStarter(starter);
  return assembleSystem({
    name: input.name,
    team: input.team,
    brand: input.brand,
    description: input.description,
    starter,
    palettes: seed.palettes,
    actionBackground: seed.actionBackground,
    font: starter.font,
    density: starter.density,
  });
}

export interface CreateDesignSystemInput {
  name: string;
  team?: string;
  brand?: string;
  description?: string;
  presetId: string;
  color: string;
  font: string;
  density: Density;
}

/**
 * Create a system from a starter preset. Input shape is compatible with the
 * previous builder flow (name/brand/description/presetId/color/font/density).
 * Legacy shim — new code should use createSystemFromStarter from starters.ts.
 */
export function createDesignSystem(input: CreateDesignSystemInput): DesignSystemConfig {
  const starter = starterById(input.presetId);
  const seed = seedForStarter(starter, input.color);
  return assembleSystem({
    name: input.name,
    team: input.team,
    brand: input.brand,
    description: input.description,
    starter,
    palettes: seed.palettes,
    actionBackground: seed.actionBackground,
    font: input.font || starter.font,
    density: input.density,
  });
}

// ---------------------------------------------------------------------------
// Token resolution (pure, total: never throws)
// ---------------------------------------------------------------------------

export type ResolutionStatus = "resolved" | "unresolved" | "circular";

export interface TokenResolution {
  status: ResolutionStatus;
  /** Final value for "resolved"; the original reference otherwise. */
  value: string;
  chain: string[];
  reason?: string;
}

const MAX_RESOLVE_DEPTH = 25;

function themeById(system: DesignSystemConfig, themeId?: string): Theme | undefined {
  if (!themeId) return undefined;
  return system.themes?.find((theme) => theme.id === themeId);
}

/**
 * Resolve a primitive palette reference, semantic alias, or raw value,
 * honoring theme overrides. Never throws; missing references return
 * `{ status: "unresolved" }` and cycles return `{ status: "circular" }`.
 */
export function resolveToken(
  system: DesignSystemConfig,
  reference: string,
  themeId?: string,
): TokenResolution {
  try {
    if (typeof reference !== "string" || reference.trim() === "") {
      return { status: "unresolved", value: "", chain: [], reason: "Empty reference." };
    }
    const input = reference.trim();
    const visited = new Set<string>();
    const chain: string[] = [];
    let current: string | undefined = input;

    for (let depth = 0; depth < MAX_RESOLVE_DEPTH; depth += 1) {
      if (current === undefined) {
        return { status: "unresolved", value: input, chain, reason: `"${input}" has no value.` };
      }
      const key = `${themeId ?? ""}::${current}`;
      if (visited.has(key)) {
        return { status: "circular", value: input, chain, reason: `Circular reference detected: ${[...chain, current].join(" -> ")}.` };
      }
      visited.add(key);
      chain.push(current);

      // Raw hex passes through.
      if (current.startsWith("#")) {
        if (isHexColor(current)) return { status: "resolved", value: current, chain };
        return { status: "unresolved", value: input, chain, reason: `"${current}" is not a six-digit hex color.` };
      }

      // Non-color literals (e.g. shadow recipes, durations) pass through.
      if (!isResolvableReference(system, current)) {
        // Unknown dotted/bare references are unresolved; anything else is a literal.
        if (looksLikeReference(system, current)) {
          return { status: "unresolved", value: input, chain, reason: `"${current}" does not match a palette, token, or theme override.` };
        }
        return { status: "resolved", value: current, chain };
      }

      const next = dereferenceOnce(system, current, themeId);
      if (next === undefined) {
        return { status: "unresolved", value: input, chain, reason: `"${current}" does not match a palette, token, or theme override.` };
      }
      if (next === current) {
        return { status: "resolved", value: current, chain };
      }
      current = next;
    }

    return { status: "circular", value: input, chain, reason: `Resolution depth exceeded for "${input}".` };
  } catch {
    return { status: "unresolved", value: "", chain: [], reason: "Resolution failed." };
  }
}

function paletteShade(system: DesignSystemConfig, paletteId: string, shade?: string): string | undefined {
  const palette = system.foundations?.colors?.palettes?.find((item) => item.id === paletteId);
  if (!palette) return undefined;
  if (!shade) return palette.base;
  return palette.shades?.[shade];
}

function isResolvableReference(system: DesignSystemConfig, value: string): boolean {
  if (value.startsWith("#")) return true;
  if (looksLikeReference(system, value)) return true;
  return dereferenceOnce(system, value, undefined) !== undefined;
}

/**
 * Heuristic: dotted paths ("brand.500"), known semantic token ids, and theme
 * override keys count as references; other literals (shadows, easings) do not.
 */
function looksLikeReference(system: DesignSystemConfig, value: string): boolean {
  if (value.includes(".")) return true;
  const palettes = system.foundations?.colors?.palettes ?? [];
  if (palettes.some((palette) => palette.id === value)) return true;
  if ((system.semanticTokens ?? []).some((token) => token.id === value)) return true;
  if ((system.themes ?? []).some((theme) => theme.overrides && value in theme.overrides)) return true;
  return false;
}

/** Single dereference step; undefined when the value has no mapping. */
function dereferenceOnce(
  system: DesignSystemConfig,
  value: string,
  themeId?: string,
): string | undefined {
  // Theme overrides win over base semantic values.
  const theme = themeById(system, themeId);
  if (theme?.overrides && value in theme.overrides) {
    return theme.overrides[value];
  }

  const semantic = system.semanticTokens?.find((token) => token.id === value);
  if (semantic) return semantic.value;

  if (value.includes(".")) {
    const [paletteId, ...rest] = value.split(".");
    const shade = rest.join(".");
    const hit = paletteShade(system, paletteId ?? "", shade || undefined);
    // A palette id alone resolves to its base; unknown dotted paths stay unresolved.
    if (hit !== undefined) return hit;
    return undefined;
  }

  const bare = paletteShade(system, value);
  if (bare !== undefined) return bare;

  return undefined;
}

// ---------------------------------------------------------------------------
// Validation (structural only — no contrast analysis; that is Validate-phase work)
// ---------------------------------------------------------------------------

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: ValidationSeverity;
  path: string;
  message: string;
  code: string;
}

function pushUniqueIdIssue(
  issues: ValidationIssue[],
  seen: Set<string>,
  id: string,
  path: string,
  label: string,
): void {
  if (!id || id.trim() === "") {
    issues.push({ severity: "error", path, message: `${label} is missing an id.`, code: "missing-id" });
    return;
  }
  if (seen.has(id)) {
    issues.push({ severity: "error", path, message: `${label} id "${id}" is duplicated.`, code: "duplicate-id" });
    return;
  }
  seen.add(id);
}

/**
 * Validate a design system structurally. Never throws; returns structured
 * issues with severity, path, and a human-readable message.
 */
export function validateDesignSystem(system: DesignSystemConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  try {
    if (!system || typeof system !== "object") {
      return [{ severity: "error", path: "", message: "Design system is missing or malformed.", code: "malformed" }];
    }

    if (system.schemaVersion !== DESIGN_SYSTEM_VERSION) {
      issues.push({
        severity: "error",
        path: "schemaVersion",
        message: `Unsupported schemaVersion. Expected ${DESIGN_SYSTEM_VERSION}.`,
        code: "schema-version",
      });
    }

    if (!system.id || system.id.trim() === "") {
      issues.push({ severity: "error", path: "id", message: "A design-system id is required.", code: "missing-id" });
    }

    if (!system.meta?.name || system.meta.name.trim() === "") {
      issues.push({ severity: "error", path: "meta.name", message: "A design-system name is required.", code: "missing-name" });
    }

    if (!system.starter?.presetId) {
      issues.push({ severity: "warning", path: "starter.presetId", message: "No starter preset is recorded.", code: "missing-starter" });
    }

    const foundations = system.foundations;
    if (!foundations || typeof foundations !== "object") {
      issues.push({ severity: "error", path: "foundations", message: "Foundations are missing.", code: "missing-foundations" });
      return issues;
    }

    // Colors.
    const palettes = foundations.colors?.palettes ?? [];
    const paletteIds = new Set<string>();
    if (palettes.length === 0) {
      issues.push({ severity: "warning", path: "foundations.colors.palettes", message: "No color palettes are defined.", code: "no-palettes" });
    }
    palettes.forEach((palette, index) => {
      const base = `foundations.colors.palettes[${index}]`;
      pushUniqueIdIssue(issues, paletteIds, palette?.id, `${base}.id`, "Palette");
      if (!isHexColor(palette?.base)) {
        issues.push({
          severity: "error",
          path: `${base}.base`,
          message: `Palette "${palette?.id ?? index}" base must be a six-digit hex color.`,
          code: "invalid-hex",
        });
      }
      for (const [shade, value] of Object.entries(palette?.shades ?? {})) {
        if (typeof value === "string" && value.startsWith("#") && !isHexColor(value)) {
          issues.push({
            severity: "error",
            path: `${base}.shades.${shade}`,
            message: `Palette "${palette.id}" shade "${shade}" must be a six-digit hex color.`,
            code: "invalid-hex",
          });
        }
      }
    });

    // Density.
    if (!["compact", "comfortable", "spacious"].includes(foundations.density as string)) {
      issues.push({
        severity: "error",
        path: "foundations.density",
        message: 'Density must be one of "compact", "comfortable", or "spacious".',
        code: "invalid-density",
      });
    }

    // Named-scale unique ids.
    const checkScale = (
      items: readonly unknown[] | undefined,
      path: string,
      label: string,
      getId: (item: unknown) => string | undefined,
    ): void => {
      const seen = new Set<string>();
      (items ?? []).forEach((item, index) => {
        pushUniqueIdIssue(issues, seen, getId(item) ?? "", `${path}[${index}].id`, label);
      });
    };
    const idOf = (item: unknown): string | undefined => (item as { id?: string } | null)?.id;
    checkScale(foundations.typography?.styles, "foundations.typography.styles", "Text style", idOf);
    checkScale(foundations.spacing?.scale, "foundations.spacing.scale", "Spacing token", idOf);
    checkScale(foundations.sizing?.tokens, "foundations.sizing.tokens", "Sizing token", idOf);
    // Legacy pre-7B systems may still carry a Record-shaped radius scale; the
    // editor normalizes those on load, so only arrays are checked here.
    if (Array.isArray(foundations.radius?.scale)) {
      checkScale(foundations.radius.scale, "foundations.radius.scale", "Radius token", idOf);
    }
    checkScale(foundations.borders?.tokens, "foundations.borders.tokens", "Border token", idOf);
    checkScale(foundations.shadows?.tokens, "foundations.shadows.tokens", "Shadow token", idOf);
    // Legacy pre-7F systems may still carry a Record-shaped icon size scale;
    // the editor normalizes those on load, so only arrays are checked here.
    if (Array.isArray(foundations.icons?.sizes)) {
      checkScale(foundations.icons.sizes, "foundations.icons.sizes", "Icon size", idOf);
    }
    // Legacy systems may still carry a Record-shaped breakpoint map; the
    // editor normalizes those on load, so only arrays are checked here.
    if (Array.isArray(foundations.breakpoints?.scale)) {
      checkScale(foundations.breakpoints.scale, "foundations.breakpoints.scale", "Breakpoint", idOf);
    }
    checkScale(system.components, "components", "Component", (item) => (item as { component?: string } | null)?.component);

    // Semantic tokens.
    const semanticIds = new Set<string>();
    (system.semanticTokens ?? []).forEach((token, index) => {
      const path = `semanticTokens[${index}]`;
      pushUniqueIdIssue(issues, semanticIds, token?.id, `${path}.id`, "Semantic token");
      if (typeof token?.value !== "string" || token.value.trim() === "") {
        issues.push({ severity: "error", path: `${path}.value`, message: `Semantic token "${token?.id ?? index}" has no value.`, code: "missing-value" });
        return;
      }
      const resolution = resolveToken(system, token.value);
      if (resolution.status === "circular") {
        issues.push({
          severity: "error",
          path: `${path}.value`,
          message: `Semantic token "${token.id}" participates in a circular reference (${resolution.chain.join(" -> ")}).`,
          code: "circular-reference",
        });
      } else if (resolution.status === "unresolved") {
        issues.push({
          severity: "error",
          path: `${path}.value`,
          message: `Semantic token "${token.id}" references an unknown value "${token.value}".`,
          code: "unresolved-reference",
        });
      }
    });

    // Themes: light + dark required, custom themes allowed.
    const themeIds = new Set<string>();
    (system.themes ?? []).forEach((theme, index) => {
      pushUniqueIdIssue(issues, themeIds, theme?.id, `themes[${index}].id`, "Theme");
      for (const [tokenId, value] of Object.entries(theme?.overrides ?? {})) {
        const resolution = resolveToken({ ...system, themes: [] }, value, undefined);
        const overrideResolves =
          resolution.status === "resolved" ||
          resolveToken(system, value, theme.id).status !== "unresolved";
        if (!overrideResolves) {
          issues.push({
            severity: "error",
            path: `themes[${index}].overrides.${tokenId}`,
            message: `Theme "${theme.id}" override for "${tokenId}" references an unknown value "${value}".`,
            code: "unresolved-reference",
          });
        }
      }
    });
    for (const required of ["light", "dark"]) {
      if (!themeIds.has(required)) {
        issues.push({
          severity: "error",
          path: "themes",
          message: `A "${required}" theme is required.`,
          code: "missing-theme",
        });
      }
    }

    // Component token overrides reference check (warnings: components may intentionally preview).
    (system.components ?? []).forEach((entry, entryIndex) => {
      (entry?.overrides ?? []).forEach((override, overrideIndex) => {
        const path = `components[${entryIndex}].overrides[${overrideIndex}]`;
        if (!override?.token) {
          issues.push({ severity: "error", path, message: `Component "${entry?.component ?? entryIndex}" override is missing a token slot.`, code: "missing-value" });
          return;
        }
        const resolution = resolveToken(system, override.value);
        if (resolution.status === "unresolved" && looksLikeReference(system, override.value)) {
          issues.push({
            severity: "warning",
            path: `${path}.value`,
            message: `Component "${entry.component}" token "${override.token}" references an unknown value "${override.value}".`,
            code: "unresolved-reference",
          });
        }
      });
    });

    return issues;
  } catch {
    return [{ severity: "error", path: "", message: "Validation failed unexpectedly.", code: "validator-error" }];
  }
}

// ---------------------------------------------------------------------------
// Compat accessors (keep existing UI call-sites small)
// ---------------------------------------------------------------------------

/** Primary (first) palette base color, for summary surfaces. */
export function primaryPaletteBase(system: DesignSystemConfig): string {
  return system.foundations?.colors?.palettes?.[0]?.base ?? "#71717a";
}

/** Primary typeface for preview surfaces. */
export function primaryFontFamily(system: DesignSystemConfig): string {
  return system.foundations?.typography?.primary ?? "Inter";
}
