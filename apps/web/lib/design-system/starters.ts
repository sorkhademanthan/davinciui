// Intentional starter templates (Step 3).
// Canonical source of truth for all seven starting points. A starter is an
// initial, fully editable configuration — never a locked theme. Every
// generated system is a complete canonical DesignSystemConfig: all
// foundations, semantic tokens, light + dark themes, and baseline component
// tokens, with every reference resolvable through resolveToken.

import {
  DESIGN_SYSTEM_VERSION,
  defaultBorders,
  defaultBreakpoints,
  defaultComponents,
  defaultGrid,
  defaultIcons,
  defaultMotion,
  defaultRadius,
  defaultSemanticTokens,
  defaultShadows,
  defaultSizing,
  defaultSpacing,
  defaultThemes,
  defaultTypography,
  isHexColor,
  newId,
  paletteFrom,
  type ComponentTokens,
  type Density,
  type DesignSystemConfig,
  type Palette,
  type PaletteRole,
  type SemanticCategory,
  type SemanticToken,
  type Theme,
  type TypographyFoundations,
} from "./domain";

// ---------------------------------------------------------------------------
// Starter metadata
// ---------------------------------------------------------------------------

export type StarterId =
  | "blank"
  | "minimal"
  | "saas"
  | "enterprise"
  | "editorial"
  | "ecommerce"
  | "dark-first";

export interface StarterMeta {
  id: StarterId;
  label: string;
  description: string;
  intendedUse: string;
}

export const STARTERS: readonly StarterMeta[] = [
  {
    id: "blank",
    label: "Blank",
    description: "A neutral, intentionally empty starting point.",
    intendedUse: "Start from a clean, accessible baseline when you want full control over every token.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Restrained near-monochrome with subtle elevation.",
    intendedUse: "Marketing sites and simple products that favor restraint over decoration.",
  },
  {
    id: "saas",
    label: "SaaS",
    description: "Product interface defaults with full feedback states.",
    intendedUse: "Dashboards and product UI needing hierarchy plus success, warning, danger, and info states.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    description: "Dense, data-heavy defaults with strong borders.",
    intendedUse: "Tables, forms, and admin surfaces used all day by large teams.",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Expressive headlines paired with readable body type.",
    intendedUse: "Content, documentation, and reading experiences with a clear measure and rhythm.",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Product, price, and checkout hierarchy.",
    intendedUse: "Storefronts where availability, promotion, and checkout clarity matter.",
  },
  {
    id: "dark-first",
    label: "Dark-first",
    description: "Designed for dark surfaces, with a usable light theme.",
    intendedUse: "Media, dashboards, and evening-use products where dark is the primary experience.",
  },
];

const BLANK_META: StarterMeta = STARTERS[0]!;

/** Lookup a starter by id. Unknown ids safely fall back to Blank. */
export function getStarter(id: string): StarterMeta {
  return STARTERS.find((starter) => starter.id === id) ?? BLANK_META;
}

export interface StarterDefaults {
  /** Suggested brand base color; null means neutral-only (Blank). */
  color: string | null;
  /** Primary body/interface typeface for the starter. */
  font: string;
  density: Density;
}

/**
 * Initial-direction defaults for the onboarding flow. Onboarding reads these
 * (not the legacy domain presets) so defaults always match the canonical
 * factory — e.g. Editorial defaults to its body face, not its display face.
 */
export function getStarterDefaults(id: string): StarterDefaults {
  const { spec } = specFor(id);
  return { color: spec.brand, font: spec.fontBody, density: spec.density };
}

// ---------------------------------------------------------------------------
// Per-starter specifications (intentional differences live here)
// ---------------------------------------------------------------------------

const STATUS_BASES = {
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  info: "#0284c7",
} as const;

interface ExtraPaletteSpec {
  id: string;
  label: string;
  role: PaletteRole;
  base: string;
}

interface SemanticExtra {
  id: string;
  label: string;
  category: SemanticCategory;
  value: string;
  description?: string;
}

interface StarterSpec {
  /** Brand base color; null means neutral-only (Blank). */
  brand: string | null;
  extraPalettes: ExtraPaletteSpec[];
  fontBody: string;
  /** Distinct display family (Editorial). Undefined means body family everywhere. */
  fontDisplay?: string;
  spacingBase: number;
  radiusBase: number;
  density: Density;
  grid: { columns: number; gutter: string; maxWidth: string };
  /** Shadow token ids to keep; null keeps the full canonical set. */
  shadowIds: string[] | null;
  /** Stronger default border (Enterprise). */
  strongBorders: boolean;
  motionScale: "default" | "fast" | "slow";
  /** Additional semantic tokens beyond the required canonical set. */
  semanticExtras: SemanticExtra[];
  /**
   * Base semantic values that differ from the canonical defaults
   * (Dark-first designs its baseline for dark surfaces).
   */
  semanticBase: Record<string, string> | null;
  /** Theme overrides beyond the canonical defaults; null keeps defaults. */
  lightOverrides: Record<string, string> | null;
  darkOverrides: Record<string, string> | null;
  /** Extra component-token overrides beyond the canonical baseline. */
  componentExtras: Array<{
    component: string;
    token: string;
    value: string;
    variant?: string;
    state?: string;
  }>;
}

function statusExtras(shade: "600" | "400"): SemanticExtra[] {
  const label: Record<string, string> = {
    success: "Success",
    warning: "Warning",
    danger: "Danger",
    info: "Info",
  };
  return (Object.keys(STATUS_BASES) as Array<keyof typeof STATUS_BASES>).map((key) => ({
    id: `status.${key}`,
    label: `${label[key]} status`,
    category: "status" as SemanticCategory,
    value: `${key}.${shade}`,
  }));
}

function statusPalettes(): ExtraPaletteSpec[] {
  return (Object.entries(STATUS_BASES) as Array<[PaletteRole, string]>).map(([role, base]) => ({
    id: role,
    label: role[0]!.toUpperCase() + role.slice(1),
    role,
    base,
  }));
}

const SCRIM_EXTRA: SemanticExtra = {
  id: "overlay.scrim",
  label: "Overlay scrim",
  category: "overlay",
  value: "#000000",
  description: "Dimming layer behind dialogs and overlays.",
};

const SPECS: Record<StarterId, StarterSpec> = {
  blank: {
    brand: null,
    extraPalettes: [],
    fontBody: "Inter",
    spacingBase: 4,
    radiusBase: 8,
    density: "comfortable",
    grid: { columns: 12, gutter: "24px", maxWidth: "1200px" },
    shadowIds: null,
    strongBorders: false,
    motionScale: "default",
    semanticExtras: [SCRIM_EXTRA],
    semanticBase: null,
    lightOverrides: null,
    darkOverrides: null,
    componentExtras: [],
  },
  minimal: {
    brand: "#18181b",
    extraPalettes: [],
    fontBody: "Inter",
    spacingBase: 4,
    radiusBase: 8,
    density: "comfortable",
    grid: { columns: 12, gutter: "24px", maxWidth: "1200px" },
    shadowIds: ["shadow.none", "shadow.sm", "shadow.md"],
    strongBorders: false,
    motionScale: "default",
    semanticExtras: [SCRIM_EXTRA],
    semanticBase: null,
    lightOverrides: null,
    darkOverrides: null,
    componentExtras: [],
  },
  saas: {
    brand: "#635bff",
    extraPalettes: statusPalettes(),
    fontBody: "Inter",
    spacingBase: 4,
    radiusBase: 10,
    density: "comfortable",
    grid: { columns: 12, gutter: "24px", maxWidth: "1200px" },
    shadowIds: null,
    strongBorders: false,
    motionScale: "default",
    semanticExtras: [SCRIM_EXTRA, ...statusExtras("600")],
    semanticBase: null,
    lightOverrides: null,
    darkOverrides: null,
    componentExtras: [],
  },
  enterprise: {
    brand: "#0f766e",
    extraPalettes: statusPalettes(),
    fontBody: "Inter",
    spacingBase: 4,
    radiusBase: 6,
    density: "compact",
    grid: { columns: 12, gutter: "24px", maxWidth: "1440px" },
    shadowIds: ["shadow.none", "shadow.sm", "shadow.md"],
    strongBorders: true,
    motionScale: "fast",
    semanticExtras: [SCRIM_EXTRA, ...statusExtras("600")],
    semanticBase: null,
    lightOverrides: null,
    darkOverrides: null,
    componentExtras: [],
  },
  editorial: {
    brand: "#a16207",
    extraPalettes: [],
    fontBody: "Inter",
    fontDisplay: "Georgia",
    spacingBase: 4,
    radiusBase: 4,
    density: "spacious",
    grid: { columns: 12, gutter: "32px", maxWidth: "768px" },
    shadowIds: ["shadow.none", "shadow.sm", "shadow.md", "shadow.lg"],
    strongBorders: false,
    motionScale: "slow",
    semanticExtras: [
      SCRIM_EXTRA,
      {
        id: "text.display",
        label: "Display text",
        category: "text",
        value: "neutral.950",
        description: "High-emphasis headline color on light surfaces.",
      },
    ],
    semanticBase: null,
    lightOverrides: null,
    darkOverrides: null,
    componentExtras: [],
  },
  ecommerce: {
    brand: "#db2777",
    extraPalettes: statusPalettes().filter((palette) => palette.id !== "info"),
    fontBody: "Inter",
    spacingBase: 4,
    radiusBase: 10,
    density: "comfortable",
    grid: { columns: 12, gutter: "24px", maxWidth: "1280px" },
    shadowIds: null,
    strongBorders: false,
    motionScale: "default",
    semanticExtras: [
      SCRIM_EXTRA,
      {
        id: "product.price",
        label: "Product price",
        category: "text",
        value: "text.primary",
        description: "High-clarity price color; follows primary text.",
      },
      { id: "status.inStock", label: "In stock", category: "status", value: "success.600" },
      { id: "status.lowStock", label: "Low stock", category: "status", value: "warning.600" },
      { id: "status.promotion", label: "Promotion", category: "status", value: "danger.600" },
      {
        id: "action.checkout.background",
        label: "Checkout action background",
        category: "action",
        value: "success.600",
        description: "Distinct go-forward color for the checkout step.",
      },
      { id: "action.checkout.foreground", label: "Checkout action foreground", category: "action", value: "#ffffff" },
    ],
    semanticBase: null,
    lightOverrides: null,
    darkOverrides: null,
    componentExtras: [
      { component: "Button", token: "background", value: "action.checkout.background", variant: "checkout" },
      { component: "Button", token: "foreground", value: "action.checkout.foreground", variant: "checkout" },
    ],
  },
  "dark-first": {
    brand: "#8b5cf6",
    extraPalettes: statusPalettes(),
    fontBody: "Inter",
    spacingBase: 4,
    radiusBase: 10,
    density: "comfortable",
    grid: { columns: 12, gutter: "24px", maxWidth: "1200px" },
    shadowIds: null,
    strongBorders: false,
    motionScale: "default",
    semanticExtras: [SCRIM_EXTRA, ...statusExtras("400")],
    // Baseline is designed for dark surfaces — not an inverted light theme.
    semanticBase: {
      "background.canvas": "#0e0e11",
      "background.surface": "#17171c",
      "text.primary": "#f4f4f5",
      "text.muted": "#a8a8b3",
      "border.default": "#27272e",
      "action.primary.background": "brand.400",
      "action.primary.foreground": "neutral.950",
      "focus.ring": "brand.400",
    },
    lightOverrides: {
      "background.canvas": "#ffffff",
      "background.surface": "#f6f6f7",
      "text.primary": "#141417",
      "text.muted": "#5c5c66",
      "border.default": "#e3e3e8",
      "action.primary.background": "brand.600",
      "action.primary.foreground": "#ffffff",
      "focus.ring": "brand.500",
      "overlay.scrim": "#000000",
      "status.success": "success.600",
      "status.warning": "warning.600",
      "status.danger": "danger.600",
      "status.info": "info.600",
    },
    darkOverrides: {
      "background.canvas": "#0e0e11",
      "background.surface": "#17171c",
      "text.primary": "#f4f4f5",
      "text.muted": "#a8a8b3",
      "border.default": "#27272e",
      "action.primary.background": "brand.400",
      "action.primary.foreground": "neutral.950",
      "focus.ring": "brand.400",
      "overlay.scrim": "#000000",
      "status.success": "success.400",
      "status.warning": "warning.400",
      "status.danger": "danger.400",
      "status.info": "info.400",
    },
    componentExtras: [],
  },
};

function specFor(starterId: string): { id: StarterId; spec: StarterSpec } {
  const found = (Object.keys(SPECS) as StarterId[]).find((id) => id === starterId);
  // Unknown ids safely fall back to Blank (documented default).
  return found ? { id: found, spec: SPECS[found] } : { id: "blank", spec: SPECS.blank };
}

// ---------------------------------------------------------------------------
// Builders (each returns fresh objects — no shared mutable state)
// ---------------------------------------------------------------------------

function buildPalettes(brandBase: string | null, spec: StarterSpec): Palette[] {
  const palettes: Palette[] = [];
  if (brandBase) palettes.push(paletteFrom(brandBase, "brand", "Brand", "brand"));
  for (const extra of spec.extraPalettes) {
    palettes.push(paletteFrom(extra.base, extra.id, extra.label, extra.role));
  }
  palettes.push(paletteFrom("#71717a", "neutral", "Neutral", "neutral"));
  return palettes;
}

function buildTypography(spec: StarterSpec, fontOverride?: string): TypographyFoundations {
  const body = fontOverride?.trim() ? fontOverride.trim() : spec.fontBody;
  const typography = defaultTypography(body);
  const display = fontOverride?.trim() ? undefined : spec.fontDisplay;
  if (display && display !== body) {
    typography.roles.display = { ...typography.roles.display, fontFamily: display, size: "3.5rem", lineHeight: 1.05 };
    typography.roles.heading = { ...typography.roles.heading, fontFamily: display };
    typography.styles = typography.styles.map((style) => {
      if (style.id === "display") {
        return { ...style, fontFamily: display, size: "3.5rem", lineHeight: 1.05 };
      }
      if (style.role === "display" || style.role === "heading") {
        return { ...style, fontFamily: display };
      }
      return style;
    });
  }
  return typography;
}

function buildSemanticTokens(
  actionBackground: string,
  spec: StarterSpec,
): SemanticToken[] {
  const tokens = defaultSemanticTokens(actionBackground);
  if (spec.semanticBase) {
    for (const token of tokens) {
      const override = spec.semanticBase[token.id];
      if (typeof override === "string" && override.trim() !== "") {
        token.value = override;
      }
    }
  }
  const known = new Set(tokens.map((token) => token.id));
  for (const extra of spec.semanticExtras) {
    if (!known.has(extra.id)) {
      tokens.push({ ...extra });
      known.add(extra.id);
    }
  }
  return tokens;
}

function buildThemes(spec: StarterSpec): Theme[] {
  const themes = defaultThemes();
  if (spec.lightOverrides || spec.darkOverrides) {
    return themes.map((theme) => {
      if (theme.id === "light" && spec.lightOverrides) {
        return { ...theme, overrides: { ...theme.overrides, ...spec.lightOverrides } };
      }
      if (theme.id === "dark" && spec.darkOverrides) {
        return { ...theme, overrides: { ...theme.overrides, ...spec.darkOverrides } };
      }
      return theme;
    });
  }
  return themes;
}

function buildComponents(spec: StarterSpec): ComponentTokens[] {
  // Canonical baseline, with one correction: the Dialog elevation slot
  // references the resolvable overlay.scrim semantic token instead of the
  // shadow-scale id (which the Step 1 resolver cannot dereference).
  const components = defaultComponents().map((entry) => ({
    ...entry,
    overrides: entry.overrides.map((override) => ({ ...override })),
  }));
  for (const entry of components) {
    if (entry.component === "Dialog") {
      entry.overrides = entry.overrides.map((override) =>
        override.token === "shadow" ? { ...override, token: "scrim", value: "overlay.scrim" } : override,
      );
    }
  }
  for (const extra of spec.componentExtras) {
    const entry = components.find((item) => item.component === extra.component);
    const override = {
      token: extra.token,
      value: extra.value,
      ...(extra.variant ? { variant: extra.variant } : {}),
      ...(extra.state ? { state: extra.state } : {}),
    };
    if (entry) {
      entry.overrides.push(override);
    } else {
      components.push({ component: extra.component, overrides: [override] });
    }
  }
  return components;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export interface CreateFromStarterInput {
  starterId: string;
  name: string;
  team?: string;
  brand?: string;
  description?: string;
  /** Overrides the starter's brand base color. Ignored by Blank (neutral-only). */
  color?: string;
  /** Overrides the starter's primary typeface. */
  font?: string;
  /** Overrides the starter's density. */
  density?: Density;
}

/**
 * Create a complete canonical system from a starter template.
 * Unknown starter ids fall back to Blank. User-supplied color/font/density
 * overrides win over starter defaults (except Blank, which stays neutral-only
 * and ignores color overrides). Generated systems are fully editable: no
 * locked fields, no duplicate color roles, no duplicate token ids.
 */
export function createSystemFromStarter(input: CreateFromStarterInput): DesignSystemConfig {
  const { id, spec } = specFor(input.starterId);
  const meta = getStarter(id);
  const now = new Date().toISOString();

  const brandBase =
    id === "blank"
      ? null
      : isHexColor(input.color)
        ? input.color.trim()
        : spec.brand;
  const palettes = buildPalettes(brandBase, spec);
  const actionBackground = brandBase ? "brand.600" : "neutral.900";

  const shadowIds = spec.shadowIds;
  const shadowTokens = defaultShadows().tokens;
  const borders = defaultBorders();
  if (spec.strongBorders) {
    borders.tokens = borders.tokens.map((token) =>
      token.id === "border.default" ? { ...token, width: "medium" } : token,
    );
  }
  const motion = defaultMotion();
  const retime = (values: Record<string, string>): void => {
    motion.durations = motion.durations.map((token) =>
      values[token.id] ? { ...token, value: values[token.id]! } : token,
    );
  };
  if (spec.motionScale === "fast") {
    retime({ instant: "0ms", fast: "100ms", normal: "150ms", slow: "240ms", deliberate: "400ms" });
  } else if (spec.motionScale === "slow") {
    retime({ instant: "0ms", fast: "150ms", normal: "250ms", slow: "400ms", deliberate: "650ms" });
  }

  return {
    schemaVersion: DESIGN_SYSTEM_VERSION,
    id: newId(input.name),
    meta: {
      name: input.name,
      team: input.team,
      brand: input.brand,
      description: input.description,
      version: "1.0",
      createdAt: now,
      updatedAt: now,
    },
    starter: { presetId: id, label: meta.label },
    foundations: {
      colors: { palettes },
      typography: buildTypography(spec, input.font),
      spacing: defaultSpacing(spec.spacingBase),
      sizing: defaultSizing(),
      radius: defaultRadius(spec.radiusBase),
      borders,
      shadows: {
        tokens: shadowIds ? shadowTokens.filter((token) => shadowIds.includes(token.id)) : shadowTokens,
      },
      motion,
      icons: defaultIcons(),
      grid: { ...defaultGrid(), ...spec.grid },
      breakpoints: defaultBreakpoints(),
      density: input.density ?? spec.density,
    },
    semanticTokens: buildSemanticTokens(actionBackground, spec),
    themes: buildThemes(spec),
    components: buildComponents(spec),
    exportMeta: { version: "1.0", generator: "davinciui-starters" },
  };
}
