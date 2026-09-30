// Theme editing logic for the Themes editor (Step 9).
// Pure functions only — no React, no storage. Themes are override layers over
// the base semantic-token layer: an override replaces one token's value for a
// theme, everything else inherits. Resolution and structural validation reuse
// the Step 1 `resolveToken` and `validateDesignSystem`; nothing here competes
// with them. Required `light` + `dark` themes are lifecycle-protected; custom
// themes are fully manageable. Theme ids are stable: labels edit freely, ids
// never change after creation.

import {
  isHexColor,
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
  type Theme,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export const REQUIRED_THEME_IDS: readonly string[] = ["light", "dark"];

export function isRequiredThemeId(id: string): boolean {
  return (REQUIRED_THEME_IDS as readonly string[]).includes(id);
}

/** URL/token-safe theme id preview for the creation form (ids lock after creation). */
export function slugifyThemeId(raw: string, existingIds: readonly string[]): string {
  const base =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "theme";
  if (!existingIds.includes(base)) return base;
  let counter = 2;
  while (existingIds.includes(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

function themesOf(system: DesignSystemConfig): Theme[] {
  return [...(system.themes ?? [])];
}

function withThemes(system: DesignSystemConfig, themes: Theme[]): DesignSystemConfig {
  return {
    ...system,
    themes: themes.map((theme) => ({ ...theme, overrides: { ...theme.overrides } })),
  };
}

/** All themes in stored order. */
export function listThemes(system: DesignSystemConfig): Theme[] {
  return themesOf(system).map((theme) => ({ ...theme, overrides: { ...theme.overrides } }));
}

export function findTheme(system: DesignSystemConfig, id: string): Theme | undefined {
  const theme = themesOf(system).find((entry) => entry.id === id);
  return theme ? { ...theme, overrides: { ...theme.overrides } } : undefined;
}

function semanticIds(system: DesignSystemConfig): Set<string> {
  return new Set((system.semanticTokens ?? []).map((token) => token.id));
}

function paletteShadeExists(system: DesignSystemConfig, value: string): boolean {
  const [paletteId, ...rest] = value.split(".");
  if (!paletteId || rest.length === 0) return false;
  const shade = rest.join(".");
  const palette = system.foundations?.colors?.palettes?.find((item) => item.id === paletteId);
  if (!palette) return false;
  return shade in (palette.shades ?? {});
}

export type OverrideKind = "foundation" | "alias" | "raw";

export interface OverrideClassification {
  kind: OverrideKind;
  detail: string;
}

/** Classify an override value: palette shade, semantic alias, or raw hex. Null when none match. */
export function classifyOverrideValue(system: DesignSystemConfig, value: string): OverrideClassification | null {
  const text = value.trim();
  // Assign through a boolean: isHexColor is an `is string` guard, which would
  // otherwise narrow the string-typed `text` to never in the else branch.
  const isRawHex: boolean = isHexColor(text);
  if (isRawHex) return { kind: "raw", detail: `Raw fallback ${text}` };
  if (paletteShadeExists(system, text)) {
    const [paletteId] = text.split(".");
    return { kind: "foundation", detail: `Palette shade ${text} (${paletteId})` };
  }
  if (semanticIds(system).has(text)) {
    return { kind: "alias", detail: `Semantic alias of ${text}` };
  }
  return null;
}

/**
 * True when assigning `value` to `tokenId` inside theme `themeId` would create
 * a direct or indirect cycle. The probe overlays the proposed override onto a
 * copy and resolves through the real Step 1 resolver — no competing logic.
 */
export function wouldOverrideCycle(
  system: DesignSystemConfig,
  themeId: string,
  tokenId: string,
  value: string,
): boolean {
  // A self-pointing override is a degenerate cycle (the Step 1 resolver
  // would otherwise report it as resolved-to-itself).
  if (value.trim() === tokenId) return true;
  const probe: DesignSystemConfig = {
    ...system,
    themes: themesOf(system).map((theme) =>
      theme.id === themeId
        ? { ...theme, overrides: { ...theme.overrides, [tokenId]: value.trim() } }
        : theme,
    ),
  };
  return resolveToken(probe, tokenId, themeId).status === "circular";
}

export type ValidateOverrideResult =
  | { ok: true; kind: OverrideKind; detail: string }
  | { ok: false; error: string };

/** Validate a proposed override value before saving. Never throws. */
export function validateOverrideValue(
  system: DesignSystemConfig,
  themeId: string,
  tokenId: string,
  value: string,
): ValidateOverrideResult {
  if (!themesOf(system).some((theme) => theme.id === themeId)) {
    return { ok: false, error: "That theme no longer exists." };
  }
  if (!semanticIds(system).has(tokenId)) {
    return { ok: false, error: `"${tokenId}" is not a semantic token in this system.` };
  }
  const text = value.trim();
  if (text === "") {
    return { ok: false, error: "Enter a palette shade, a semantic alias, or a six-digit hex color." };
  }
  if (text === tokenId) {
    return {
      ok: false,
      error: `"${tokenId}" already inherits itself — an override must point somewhere else. Choose a palette shade, another token, or a hex value.`,
    };
  }
  const classified = classifyOverrideValue(system, text);
  if (!classified) {
    return {
      ok: false,
      error: `"${text}" does not match a palette shade, a semantic token, or a six-digit hex color. Pick from the reference lists or fix the spelling.`,
    };
  }
  if (wouldOverrideCycle(system, themeId, tokenId, text)) {
    return {
      ok: false,
      error: `That override would create a circular reference involving "${tokenId}". Choose a value outside the cycle.`,
    };
  }
  return { ok: true, kind: classified.kind, detail: classified.detail };
}

/** Human-readable reference chain, e.g. "text.primary → neutral.50 → #f4f4f5". */
export function formatThemeChain(chain: readonly string[]): string {
  return chain.join(" → ");
}

export interface OverrideCandidates {
  /** Palette-shade references, e.g. "neutral.50". */
  foundations: string[];
  /** Semantic-token ids safe to alias (self and cycle-closing choices excluded). */
  aliases: string[];
}

/**
 * Safe picker contents for one token inside one theme: every palette shade
 * plus every semantic id except the token itself and any alias that would
 * close a cycle through this theme's overrides.
 */
export function validOverrideCandidates(
  system: DesignSystemConfig,
  themeId: string,
  tokenId: string,
): OverrideCandidates {
  const foundations: string[] = [];
  for (const palette of system.foundations?.colors?.palettes ?? []) {
    for (const shade of Object.keys(palette.shades ?? {}).sort()) {
      foundations.push(`${palette.id}.${shade}`);
    }
  }
  const aliases = [...semanticIds(system)].filter((id) => {
    if (id === tokenId) return false;
    if (wouldOverrideCycle(system, themeId, tokenId, id)) return false;
    return true;
  });
  return { foundations, aliases };
}

export type OverrideStatus = "inherited" | "overridden" | "invalid";

export interface TokenThemeState {
  tokenId: string;
  /** Base semantic value/reference (the editable target lives in Tokens, not here). */
  baseValue: string;
  /** Base value resolved with no theme. */
  inheritedValue: string;
  inheritedChain: string[];
  /** Raw override value, if the theme sets one. */
  override: string | null;
  /** Override resolved through this theme. */
  effectiveValue: string | null;
  effectiveChain: string[];
  status: OverrideStatus;
  reason?: string;
}

/** Full inheritance picture for one token inside one theme. */
export function tokenThemeState(
  system: DesignSystemConfig,
  themeId: string,
  tokenId: string,
): TokenThemeState | null {
  const token = (system.semanticTokens ?? []).find((entry) => entry.id === tokenId);
  const theme = themesOf(system).find((entry) => entry.id === themeId);
  if (!token || !theme) return null;
  const inherited = resolveToken(system, tokenId);
  const override = theme.overrides?.[tokenId];
  if (override === undefined) {
    return {
      tokenId,
      baseValue: token.value,
      inheritedValue: inherited.value,
      inheritedChain: inherited.chain,
      override: null,
      effectiveValue: inherited.status === "resolved" ? inherited.value : null,
      effectiveChain: inherited.chain,
      status: inherited.status === "resolved" ? "inherited" : "invalid",
      reason: inherited.status === "resolved" ? undefined : inherited.reason,
    };
  }
  const effective = resolveToken(system, tokenId, themeId);
  return {
    tokenId,
    baseValue: token.value,
    inheritedValue: inherited.value,
    inheritedChain: inherited.chain,
    override,
    effectiveValue: effective.status === "resolved" ? effective.value : null,
    effectiveChain: effective.chain,
    status: effective.status === "resolved" ? "overridden" : "invalid",
    reason: effective.status === "resolved" ? undefined : effective.reason,
  };
}

/** Override keys that do not match any semantic token id. */
export function invalidOverrideKeys(system: DesignSystemConfig, themeId: string): string[] {
  const theme = themesOf(system).find((entry) => entry.id === themeId);
  if (!theme) return [];
  const known = semanticIds(system);
  return Object.keys(theme.overrides ?? {}).filter((key) => !known.has(key));
}

/** Overrides whose values do not resolve inside their theme. */
export function unresolvedOverrides(
  system: DesignSystemConfig,
  themeId: string,
): Array<{ tokenId: string; value: string; reason?: string }> {
  const theme = themesOf(system).find((entry) => entry.id === themeId);
  if (!theme) return [];
  const broken: Array<{ tokenId: string; value: string; reason?: string }> = [];
  for (const [tokenId, value] of Object.entries(theme.overrides ?? {})) {
    const resolution = resolveToken(system, tokenId, themeId);
    if (resolution.status !== "resolved") {
      broken.push({ tokenId, value, reason: resolution.reason });
    }
  }
  return broken;
}

export interface ThemeSummary {
  id: string;
  label: string;
  mode: "light" | "dark";
  total: number;
  overridden: number;
  inherited: number;
  invalid: number;
  required: boolean;
}

/** Card/tab summary: mode, override counts, and inheritance status. */
export function summarizeTheme(system: DesignSystemConfig, themeId: string): ThemeSummary | null {
  const theme = themesOf(system).find((entry) => entry.id === themeId);
  if (!theme) return null;
  let overridden = 0;
  let invalid = 0;
  for (const token of system.semanticTokens ?? []) {
    const state = tokenThemeState(system, themeId, token.id);
    if (!state) continue;
    if (state.status === "overridden") overridden += 1;
    else if (state.status === "invalid") invalid += 1;
  }
  const total = (system.semanticTokens ?? []).length;
  return {
    id: theme.id,
    label: theme.label,
    mode: theme.mode,
    total,
    overridden,
    inherited: Math.max(0, total - overridden - invalid),
    invalid,
    required: isRequiredThemeId(theme.id),
  };
}

export type ThemeMutation = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

export interface CreateThemeInput {
  label: string;
  mode: "light" | "dark";
  /** Clone overrides from this theme; defaults to "dark" when absent. */
  fromThemeId?: string;
}

/**
 * Create a custom theme by cloning a source theme's current overrides, so it
 * begins as a useful editable variant. Never touches the source theme.
 */
export function createTheme(
  system: DesignSystemConfig,
  input: CreateThemeInput,
): { ok: true; theme: Theme } | { ok: false; error: string } {
  const label = input.label.trim().slice(0, 60);
  if (!label) return { ok: false, error: "Give the theme a name." };
  if (input.mode !== "light" && input.mode !== "dark") {
    return { ok: false, error: 'Theme mode must be "light" or "dark".' };
  }
  const existing = themesOf(system);
  const sourceId = input.fromThemeId ?? "dark";
  const source = existing.find((theme) => theme.id === sourceId);
  if (!source) return { ok: false, error: "The source theme no longer exists. Choose Light or Dark." };
  const id = slugifyThemeId(label, existing.map((theme) => theme.id));
  if (isRequiredThemeId(id)) {
    return { ok: false, error: `"${id}" is a required theme id. Choose another name.` };
  }
  return {
    ok: true,
    theme: { id, label, mode: input.mode, overrides: { ...source.overrides } },
  };
}

export function insertTheme(system: DesignSystemConfig, theme: Theme): DesignSystemConfig {
  const next = themesOf(system).filter((entry) => entry.id !== theme.id);
  next.push({ ...theme, overrides: { ...theme.overrides } });
  return withThemes(system, next);
}

/** Labels edit freely; the stable id is never touched. */
export function updateThemeLabel(system: DesignSystemConfig, id: string, label: string): DesignSystemConfig {
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) return system;
  return withThemes(
    system,
    themesOf(system).map((theme) => (theme.id === id ? { ...theme, label: trimmed } : theme)),
  );
}

export function updateThemeMode(
  system: DesignSystemConfig,
  id: string,
  mode: "light" | "dark",
): DesignSystemConfig {
  if (mode !== "light" && mode !== "dark") return system;
  return withThemes(
    system,
    themesOf(system).map((theme) => (theme.id === id ? { ...theme, mode } : theme)),
  );
}

/** Independent copy with a unique id; overrides are cloned, never shared. */
export function duplicateTheme(system: DesignSystemConfig, id: string): Theme | null {
  const source = themesOf(system).find((theme) => theme.id === id);
  if (!source) return null;
  const existing = themesOf(system).map((theme) => theme.id);
  const base = `${source.id}-copy`.slice(0, 40);
  let next = base;
  let counter = 2;
  while (existing.includes(next) || isRequiredThemeId(next)) {
    next = `${base}-${counter}`.slice(0, 40);
    counter += 1;
  }
  return {
    id: next,
    label: `${source.label} copy`.slice(0, 60),
    mode: source.mode,
    overrides: { ...source.overrides },
  };
}

export interface ThemeReference {
  kind: "component" | "foundation";
  pointer: string;
  value: string;
}

/**
 * Stored values that reference a theme id. Nothing in the current contract
 * addresses themes by id (overrides are keyed by token, components carry no
 * theme field), so this is structurally future-proof: it scans component
 * override variants/states and foundation records for exact id matches.
 */
export function findThemeReferences(system: DesignSystemConfig, id: string): ThemeReference[] {
  const references: ThemeReference[] = [];
  const seen = new Set<string>();
  const push = (reference: ThemeReference): void => {
    const key = `${reference.kind}:${reference.pointer}`;
    if (seen.has(key)) return;
    seen.add(key);
    references.push(reference);
  };
  for (const component of system.components ?? []) {
    for (const override of component.overrides ?? []) {
      if (override.variant === id || override.state === id) {
        const name = component.label || component.component;
        push({ kind: "component", pointer: `${name}.${override.token}`, value: id });
      }
    }
  }
  scanUnknown(system.foundations, "foundations", id, push);
  return references;
}

function scanUnknown(
  value: unknown,
  path: string,
  id: string,
  push: (reference: ThemeReference) => void,
): void {
  if (value === id) {
    push({ kind: "foundation", pointer: path, value: id });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanUnknown(entry, `${path}[${index}]`, id, push));
    return;
  }
  if (typeof value === "object" && value !== null) {
    for (const [key, entry] of Object.entries(value)) scanUnknown(entry, `${path}.${key}`, id, push);
  }
}

export type ThemeDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: ThemeReference[] };

export function canDeleteTheme(system: DesignSystemConfig, id: string): ThemeDeleteGuard {
  if (!themesOf(system).some((theme) => theme.id === id)) {
    return { ok: false, reasons: ["That theme no longer exists."], references: [] };
  }
  if (isRequiredThemeId(id)) {
    return {
      ok: false,
      reasons: [
        `The "${id}" theme is required — every system keeps at least one Light and one Dark theme. Edit its overrides instead.`,
      ],
      references: [],
    };
  }
  const references = findThemeReferences(system, id);
  if (references.length > 0) {
    const names = references.slice(0, 4).map((reference) => reference.pointer);
    const more = references.length > 4 ? ` and ${references.length - 4} more` : "";
    return {
      ok: false,
      reasons: [
        `"${id}" is referenced by ${references.length} configuration${references.length === 1 ? "" : "s"} (${names.join(", ")}${more}). Remove those references first.`,
      ],
      references,
    };
  }
  return { ok: true };
}

export function removeTheme(system: DesignSystemConfig, id: string): DesignSystemConfig {
  return withThemes(
    system,
    themesOf(system).filter((theme) => theme.id !== id),
  );
}

/** Set (or replace) one override after validation. Base tokens are never touched. */
export function setOverride(
  system: DesignSystemConfig,
  themeId: string,
  tokenId: string,
  value: string,
): ThemeMutation {
  const checked = validateOverrideValue(system, themeId, tokenId, value);
  if (!checked.ok) return { ok: false, error: checked.error };
  return {
    ok: true,
    system: withThemes(
      system,
      themesOf(system).map((theme) =>
        theme.id === themeId
          ? { ...theme, overrides: { ...theme.overrides, [tokenId]: value.trim() } }
          : theme,
      ),
    ),
  };
}

/** Remove one override so the token inherits its base semantic value again. */
export function removeOverride(system: DesignSystemConfig, themeId: string, tokenId: string): DesignSystemConfig {
  return withThemes(
    system,
    themesOf(system).map((theme) => {
      if (theme.id !== themeId) return theme;
      if (!(tokenId in (theme.overrides ?? {}))) return theme;
      const next = { ...theme.overrides };
      delete next[tokenId];
      return { ...theme, overrides: next };
    }),
  );
}

/** Reset one override to the selected starter default (removes it when the starter does not set one). */
export function resetOverrideToStarter(
  system: DesignSystemConfig,
  themeId: string,
  tokenId: string,
): DesignSystemConfig | null {
  const starter = starterThemeReference(system).themes.find((theme) => theme.id === themeId);
  if (!starter) return null;
  if (!themesOf(system).some((theme) => theme.id === themeId)) return null;
  const baseline = starter.overrides?.[tokenId];
  return withThemes(
    system,
    themesOf(system).map((theme) => {
      if (theme.id !== themeId) return theme;
      const next = { ...theme.overrides };
      if (baseline === undefined) delete next[tokenId];
      else next[tokenId] = baseline;
      return { ...theme, overrides: next };
    }),
  );
}

/** Clear every override on a custom theme. Required themes are refused. */
export function clearThemeOverrides(system: DesignSystemConfig, themeId: string): ThemeMutation {
  const theme = themesOf(system).find((entry) => entry.id === themeId);
  if (!theme) return { ok: false, error: "That theme no longer exists." };
  if (isRequiredThemeId(themeId)) {
    return { ok: false, error: `Clear-all is only available for custom themes — "${themeId}" keeps its starter overrides. Reset individual overrides instead.` };
  }
  return {
    ok: true,
    system: withThemes(
      system,
      themesOf(system).map((entry) => (entry.id === themeId ? { ...entry, overrides: {} } : entry)),
    ),
  };
}

/** Fresh starter system used for resets and comparisons (never saved). */
export function starterThemeReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/**
 * Restore a required theme's label, mode, and overrides to the selected
 * starter defaults. Custom themes are never touched. Null for custom themes
 * (they have no starter baseline to restore).
 */
export function restoreThemeToStarter(system: DesignSystemConfig, themeId: string): DesignSystemConfig | null {
  if (!isRequiredThemeId(themeId)) return null;
  const baseline = starterThemeReference(system).themes.find((theme) => theme.id === themeId);
  if (!baseline) return null;
  if (!themesOf(system).some((theme) => theme.id === themeId)) return null;
  return withThemes(
    system,
    themesOf(system).map((theme) =>
      theme.id === themeId
        ? { id: theme.id, label: baseline.label, mode: baseline.mode, overrides: { ...baseline.overrides } }
        : theme,
    ),
  );
}

/**
 * Add absent required themes (light/dark) from starter defaults without
 * touching anything else. Current systems always carry both, so this is a
 * no-op for them — it exists for older/hand-built systems missing an entry.
 */
export function ensureRequiredThemes(system: DesignSystemConfig): { system: DesignSystemConfig; added: string[] } {
  const known = new Set(themesOf(system).map((theme) => theme.id));
  const missing = (REQUIRED_THEME_IDS as readonly string[]).filter((id) => !known.has(id));
  if (missing.length === 0) return { system, added: [] };
  const starter = new Map(starterThemeReference(system).themes.map((theme) => [theme.id, theme]));
  const additions: Theme[] = [];
  for (const id of missing) {
    const template = starter.get(id);
    if (!template) continue;
    additions.push({ ...template, overrides: { ...template.overrides } });
  }
  return { system: withThemes(system, [...themesOf(system), ...additions]), added: additions.map((theme) => theme.id) };
}

/** True when a required theme differs from its starter defaults in any way. */
export function hasCustomThemeEdits(system: DesignSystemConfig, themeId: string): boolean {
  const current = themesOf(system).find((theme) => theme.id === themeId);
  const baseline = starterThemeReference(system).themes.find((theme) => theme.id === themeId);
  if (!current || !baseline) return false;
  const currentKeys = Object.keys(current.overrides ?? {}).sort();
  const baselineKeys = Object.keys(baseline.overrides ?? {}).sort();
  if (currentKeys.length !== baselineKeys.length) return true;
  if (current.label !== baseline.label || current.mode !== baseline.mode) return true;
  return currentKeys.some((key) => current.overrides[key] !== baseline.overrides[key]);
}

/** Theme-relevant validator issues for the current system. */
export function themeIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("themes"));
}
