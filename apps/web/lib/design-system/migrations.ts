// Schema migrations for persisted design systems (Step 2).
// Pure functions only: no storage access, no React, no side effects.
// Migrations progress version-by-version (v1 -> v2). Unsupported future
// versions are reported, never force-converted.

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
  paletteFrom,
  resolveToken,
  type ComponentTokens,
  type Density,
  type DesignSystemConfig,
  type Palette,
  type PaletteRole,
  type SemanticCategory,
  type SemanticToken,
} from "./domain";

// ---------------------------------------------------------------------------
// Legacy v1 input shape (pre-Step-1 canonical model)
// ---------------------------------------------------------------------------

export interface V1Palette {
  id: string;
  name: string;
  base: string;
  shades: Record<string, string>;
  enabled: boolean;
}

export interface V1SemanticToken {
  id: string;
  reference: string;
  label: string;
}

export interface V1DesignSystem {
  schemaVersion: 1;
  id: string;
  meta: {
    name: string;
    brand?: string;
    description?: string;
    version: string;
    createdAt: string;
    updatedAt: string;
  };
  foundation: {
    colors: V1Palette[];
    fontFamily: string;
    spacingBase: number;
    radius: number;
    density: "compact" | "comfortable";
  };
  semantic: V1SemanticToken[];
  themes: { light: Record<string, string>; dark: Record<string, string> };
  components: string[];
}

// ---------------------------------------------------------------------------
// Structural guards
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") out[key] = entry;
  }
  return out;
}

/** Legacy v1 shape check. Tolerant of missing optional collections. */
export function isV1System(value: unknown): value is V1DesignSystem {
  if (!isRecord(value)) return false;
  if (value["schemaVersion"] !== 1) return false;
  if (!isNonEmptyString(value["id"])) return false;
  const meta = value["meta"];
  const foundation = value["foundation"];
  const themes = value["themes"];
  if (!isRecord(meta) || typeof meta["name"] !== "string") return false;
  if (!isRecord(foundation)) return false;
  if (!isRecord(themes)) return false;
  return true;
}

/**
 * Load/save bar for a v2 system: structurally complete, never throws.
 * Note: this is intentionally lighter than validateDesignSystem — a system
 * that is mid-edit (e.g. an unresolved reference) must still load and save.
 */
export function isV2SystemShape(value: unknown): value is DesignSystemConfig {
  if (!isRecord(value)) return false;
  if (value["schemaVersion"] !== DESIGN_SYSTEM_VERSION) return false;
  if (!isNonEmptyString(value["id"])) return false;
  const meta = value["meta"];
  const foundations = value["foundations"];
  if (!isRecord(meta) || typeof meta["name"] !== "string") return false;
  if (!isRecord(foundations)) return false;
  if (!Array.isArray(value["semanticTokens"])) return false;
  if (!Array.isArray(value["themes"])) return false;
  if (!Array.isArray(value["components"])) return false;
  return true;
}

/** Human-readable reason why a value fails the v2 shape check. */
export function describeShapeProblem(value: unknown): string {
  if (!isRecord(value)) return "Value is not an object.";
  if (value["schemaVersion"] !== DESIGN_SYSTEM_VERSION) {
    return `Unsupported schemaVersion ${String(value["schemaVersion"])}. Expected ${DESIGN_SYSTEM_VERSION}.`;
  }
  if (!isNonEmptyString(value["id"])) return "A design-system id is required.";
  if (!isRecord(value["meta"])) return "System meta is missing.";
  if (typeof (value["meta"] as Record<string, unknown>)["name"] !== "string") {
    return "System meta.name is missing.";
  }
  if (!isRecord(value["foundations"])) return "Foundations are missing.";
  for (const key of ["semanticTokens", "themes", "components"] as const) {
    if (!Array.isArray(value[key])) return `"${key}" must be an array.`;
  }
  return "Unknown shape problem.";
}

// ---------------------------------------------------------------------------
// Record normalization (pure)
// ---------------------------------------------------------------------------

export type NormalizedRecord =
  | { kind: "v2"; system: DesignSystemConfig }
  | { kind: "migrated"; system: DesignSystemConfig }
  | { kind: "future"; schemaVersion: number }
  | { kind: "invalid"; reason: string };

/**
 * Classify one stored record. `fallbackTimestamp` is used only when a v1
 * record has no usable timestamps, keeping this function pure.
 */
export function normalizeRecord(value: unknown, fallbackTimestamp: string): NormalizedRecord {
  if (isV2SystemShape(value)) {
    // One-time self-heal for systems saved while border recipes still
    // pointed at the legacy error-border default. Healed records persist on
    // the next repository read, exactly like a migration.
    const healed = repairLegacyBorderErrorColor(value);
    if (healed.repaired) return { kind: "migrated", system: healed.system };
    return { kind: "v2", system: value };
  }
  if (isV1System(value)) return { kind: "migrated", system: migrateV1ToV2(value, fallbackTimestamp) };
  if (isRecord(value) && typeof value["schemaVersion"] === "number") {
    return { kind: "future", schemaVersion: value["schemaVersion"] };
  }
  return { kind: "invalid", reason: describeShapeProblem(value) };
}

// ---------------------------------------------------------------------------
// Legacy default repair (border.error -> danger.500)
// ---------------------------------------------------------------------------

/**
 * Palette reference shipped as the border.error default before it was
 * repointed at the always-resolvable status.danger.foreground semantic token.
 * It only resolves when a danger palette ships, so neutral-only systems
 * (Blank, Minimal) created earlier carry a permanent export blocker.
 */
const LEGACY_ERROR_BORDER_COLOR = "danger.500";

/** Replacement that resolves in every starter via the semantic layer. */
const REPAIRED_ERROR_BORDER_COLOR = "status.danger.foreground";

/** Raw fallback when even the semantic replacement is missing from the system. Always resolves. */
const REPAIRED_ERROR_BORDER_FALLBACK = "#dc2626";

/**
 * One-time self-heal for the legacy error-border default. Scoped to that
 * exact legacy value: systems whose danger palette resolves it are left
 * byte-identical, and genuine user typos are left for Validate to flag.
 */
export function repairLegacyBorderErrorColor(system: DesignSystemConfig): {
  system: DesignSystemConfig;
  repaired: boolean;
} {
  const tokens = system.foundations?.borders?.tokens;
  if (!Array.isArray(tokens)) return { system, repaired: false };
  if (resolveToken(system, LEGACY_ERROR_BORDER_COLOR).status === "resolved") {
    return { system, repaired: false };
  }
  if (!tokens.some((token) => (token as { color?: unknown } | null)?.color === LEGACY_ERROR_BORDER_COLOR)) {
    return { system, repaired: false };
  }
  const replacement =
    resolveToken(system, REPAIRED_ERROR_BORDER_COLOR).status === "resolved"
      ? REPAIRED_ERROR_BORDER_COLOR
      : REPAIRED_ERROR_BORDER_FALLBACK;
  return {
    system: {
      ...system,
      foundations: {
        ...system.foundations,
        borders: {
          ...system.foundations.borders,
          tokens: tokens.map((token) =>
            (token as { color?: unknown } | null)?.color === LEGACY_ERROR_BORDER_COLOR
              ? { ...token, color: replacement }
              : token,
          ),
        },
      },
    },
    repaired: true,
  };
}

// ---------------------------------------------------------------------------
// v1 -> v2 migration (pure)
// ---------------------------------------------------------------------------

const REQUIRED_SEMANTIC_IDS = [
  "background.canvas",
  "background.surface",
  "text.primary",
  "text.muted",
  "border.default",
  "action.primary.background",
  "action.primary.foreground",
  "focus.ring",
] as const;

const KNOWN_CATEGORIES: SemanticCategory[] = [
  "background",
  "text",
  "border",
  "action",
  "focus",
  "surface",
  "status",
  "overlay",
];

function inferRole(paletteId: string): PaletteRole {
  const id = paletteId.trim().toLowerCase();
  const roles: PaletteRole[] = ["brand", "accent", "neutral", "success", "warning", "danger", "info"];
  return roles.find((role) => role === id) ?? "custom";
}

function inferCategory(tokenId: string): SemanticCategory {
  const head = tokenId.split(/[.\-_]/)[0]?.toLowerCase() ?? "";
  return KNOWN_CATEGORIES.find((category) => category === head) ?? "custom";
}

function migratePalette(raw: unknown, index: number): Palette {
  const entry = isRecord(raw) ? raw : {};
  const id = isNonEmptyString(entry["id"]) ? (entry["id"] as string) : `palette-${index + 1}`;
  const label =
    isNonEmptyString(entry["name"]) ? (entry["name"] as string) : isNonEmptyString(entry["label"]) ? (entry["label"] as string) : id;
  const role = inferRole(id);
  const base = isHexColor(entry["base"]) ? (entry["base"] as string).trim() : "#635bff";
  const regenerated = paletteFrom(base, id, label, role);
  const preserved: Record<string, string> = {};
  if (isRecord(entry["shades"])) {
    for (const [shade, shadeValue] of Object.entries(entry["shades"])) {
      if (isHexColor(shadeValue)) preserved[shade] = (shadeValue as string).trim();
    }
  }
  return {
    id,
    label,
    role,
    base,
    enabled: typeof entry["enabled"] === "boolean" ? (entry["enabled"] as boolean) : true,
    shades: { ...regenerated.shades, ...preserved },
  };
}

function migrateSemanticTokens(raw: unknown, actionBackground: string): SemanticToken[] {
  const mapped: SemanticToken[] = [];
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!isRecord(entry) || !isNonEmptyString(entry["id"]) || typeof entry["reference"] !== "string") continue;
      const id = entry["id"] as string;
      if (mapped.some((token) => token.id === id)) continue;
      mapped.push({
        id,
        label: isNonEmptyString(entry["label"]) ? (entry["label"] as string) : id,
        category: inferCategory(id),
        value: entry["reference"] as string,
      });
    }
  }
  // Backfill semantic defaults required to render a basic interface; user
  // mappings always win by id.
  const defaults = new Map(defaultSemanticTokens(actionBackground).map((token) => [token.id, token]));
  for (const token of mapped) defaults.delete(token.id);
  const missing = REQUIRED_SEMANTIC_IDS.filter((id) => defaults.has(id)).map((id) => defaults.get(id)!);
  return [...mapped, ...missing];
}

function migrateThemes(raw: unknown): DesignSystemConfig["themes"] {
  const defaults = defaultThemes();
  const lightDefault = defaults.find((theme) => theme.id === "light")!;
  const darkDefault = defaults.find((theme) => theme.id === "dark")!;
  const source = isRecord(raw) ? raw : {};
  return [
    { ...lightDefault, overrides: { ...lightDefault.overrides, ...asStringRecord(source["light"]) } },
    { ...darkDefault, overrides: { ...darkDefault.overrides, ...asStringRecord(source["dark"]) } },
  ];
}

function migrateComponents(raw: unknown): ComponentTokens[] {
  const defaults = defaultComponents();
  if (!Array.isArray(raw) || raw.length === 0) return defaults;
  const names = raw.filter(isNonEmptyString);
  if (names.length === 0) return defaults;
  const seen = new Set(names);
  const mapped: ComponentTokens[] = names.map((name) => ({ component: name, label: name, overrides: [] }));
  // Keep intentional component defaults for standard components the v1
  // system did not name explicitly.
  for (const standard of defaults) {
    if (!seen.has(standard.component)) mapped.push(standard);
  }
  return mapped;
}

/**
 * Convert a legacy v1 system into the canonical v2 schema.
 * Defaulting rules: user-entered names, primary palettes, font family,
 * spacing, radius, density, semantic mappings, and theme overrides are
 * preserved; every new foundation area is populated with the same
 * intentional defaults `createDesignSystem` uses.
 */
export function migrateV1ToV2(v1: V1DesignSystem, fallbackTimestamp: string): DesignSystemConfig {
  const foundation = v1.foundation ?? ({} as V1DesignSystem["foundation"]);
  const rawPalettes = Array.isArray(foundation.colors) ? foundation.colors : [];
  const palettes = rawPalettes.map((palette, index) => migratePalette(palette, index));
  if (palettes.length === 0) {
    palettes.push(paletteFrom("#71717a", "neutral", "Neutral", "neutral"));
  }
  const hasBrand = palettes.some((palette) => palette.id === "brand");
  const actionBackground = hasBrand ? "brand.600" : "neutral.900";

  const fontFamily =
    typeof foundation.fontFamily === "string" && foundation.fontFamily.trim() !== ""
      ? foundation.fontFamily.trim()
      : "Inter";
  const spacingBase = Number.isFinite(foundation.spacingBase) && (foundation.spacingBase as number) > 0 ? (foundation.spacingBase as number) : 4;
  const radiusBase = Number.isFinite(foundation.radius) && (foundation.radius as number) >= 0 ? (foundation.radius as number) : 8;
  const density: Density =
    foundation.density === "compact" || foundation.density === "comfortable" || foundation.density === "spacious"
      ? foundation.density
      : "comfortable";

  const meta = v1.meta ?? ({} as V1DesignSystem["meta"]);
  const name = typeof meta.name === "string" && meta.name.trim() !== "" ? meta.name : "Untitled system";
  const createdAt = typeof meta.createdAt === "string" && meta.createdAt !== "" ? meta.createdAt : fallbackTimestamp;
  const updatedAt = typeof meta.updatedAt === "string" && meta.updatedAt !== "" ? meta.updatedAt : fallbackTimestamp;

  return {
    schemaVersion: DESIGN_SYSTEM_VERSION,
    id: v1.id,
    meta: {
      name,
      brand: typeof meta.brand === "string" ? meta.brand : undefined,
      description: typeof meta.description === "string" ? meta.description : undefined,
      version: typeof meta.version === "string" && meta.version !== "" ? meta.version : "1.0",
      createdAt,
      updatedAt,
    },
    starter: { presetId: "v1-migrated", label: "Migrated (v1)" },
    foundations: {
      colors: { palettes },
      typography: defaultTypography(fontFamily),
      spacing: defaultSpacing(spacingBase),
      sizing: defaultSizing(),
      radius: defaultRadius(radiusBase),
      borders: defaultBorders(),
      shadows: defaultShadows(),
      motion: defaultMotion(),
      icons: defaultIcons(),
      grid: defaultGrid(),
      breakpoints: defaultBreakpoints(),
      density,
    },
    semanticTokens: migrateSemanticTokens(v1.semantic, actionBackground),
    themes: migrateThemes(v1.themes),
    components: migrateComponents(v1.components),
    exportMeta: { version: "1.0", generator: "davinciui-migration-v1" },
  };
}
