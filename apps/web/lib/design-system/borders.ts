// Border editing logic for the Borders foundation editor (Step 7C).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `BorderToken`/`BorderFoundations` shapes directly; no parallel model.
// Recipes reference width-token keys, style keys, and color references
// (palette shades, semantic aliases, or raw hex fallback). Legacy raw width
// values still resolve, so pre-7C systems keep rendering.

import {
  resolveToken,
  validateDesignSystem,
  type BorderToken,
  type DesignSystemConfig,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export const BORDER_WIDTH_UNITS = ["px", "rem"] as const;
export type BorderWidthUnit = (typeof BORDER_WIDTH_UNITS)[number];

/** Canonical style keys. The schema Record permits these; customs are preserved, never created here. */
export const BORDER_STYLE_KEYS = ["solid", "dashed", "dotted", "none"] as const;

export interface ParsedWidth {
  amount: number;
  unit: BorderWidthUnit;
}

/** Non-negative px/rem length. Bare numbers become px. */
export function parseBorderWidth(value: unknown): ParsedWidth | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) return boundedWidth(Number.parseFloat(bare[1]!), "px");
  const match = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(text);
  if (!match) return null;
  return boundedWidth(Number.parseFloat(match[1]!), match[2]! as BorderWidthUnit);
}

function boundedWidth(amount: number, unit: BorderWidthUnit): ParsedWidth | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "px" && amount > 64) return null;
  if (unit === "rem" && amount > 4) return null;
  return { amount: Math.round(amount * 100) / 100, unit };
}

export function formatBorderWidth(parsed: ParsedWidth): string {
  return `${parsed.amount}${parsed.unit}`;
}

/** Suggested display label for a new id ("card-pop" → "Card pop"). */
export function humanBorderLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

export function slugifyBorderId(raw: string, existingIds: readonly string[]): string {
  const base =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "token";
  if (!existingIds.includes(base)) return base;
  let counter = 2;
  while (existingIds.includes(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

function isTokenIdSafe(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(id) && id.length <= 40;
}

function widthsOf(system: DesignSystemConfig): Record<string, string> {
  return { ...(system.foundations.borders?.widths ?? {}) };
}

function recipesOf(system: DesignSystemConfig): BorderToken[] {
  return [...(system.foundations.borders?.tokens ?? [])];
}

function withBorders(
  system: DesignSystemConfig,
  patch: Partial<{ widths: Record<string, string>; styles: Record<string, string>; disabledStyles: string[]; defaultStyle: string; tokens: BorderToken[] }>,
): DesignSystemConfig {
  const current = system.foundations.borders ?? { widths: {}, styles: {}, tokens: [] };
  return {
    ...system,
    foundations: {
      ...system.foundations,
      borders: {
        widths: patch.widths ?? { ...current.widths },
        styles: patch.styles ?? { ...current.styles },
        ...(patch.disabledStyles !== undefined
          ? { disabledStyles: [...patch.disabledStyles] }
          : current.disabledStyles !== undefined
            ? { disabledStyles: [...current.disabledStyles] }
            : {}),
        ...(patch.defaultStyle !== undefined
          ? { defaultStyle: patch.defaultStyle }
          : current.defaultStyle !== undefined
            ? { defaultStyle: current.defaultStyle }
            : {}),
        tokens: patch.tokens ? patch.tokens.map((token) => ({ ...token })) : current.tokens.map((token) => ({ ...token })),
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Resolution (width key → value, style key → css, color ref → hex)
// ---------------------------------------------------------------------------

/** Resolve a width reference: width-token key first, legacy raw length second. */
export function resolveBorderWidth(system: DesignSystemConfig, ref: string): string | null {
  const record = widthsOf(system);
  if (typeof ref === "string" && ref in record) {
    const parsed = parseBorderWidth(record[ref]);
    return parsed ? formatBorderWidth(parsed) : null;
  }
  const parsed = parseBorderWidth(ref);
  return parsed ? formatBorderWidth(parsed) : null;
}

/** Resolve a style key against the styles record. Unknown keys do not render. */
export function resolveBorderStyle(system: DesignSystemConfig, style: string): string | null {
  const record = system.foundations.borders?.styles ?? {};
  if (typeof style === "string" && style in record) return record[style]!;
  return null;
}

/** Resolve a color reference (palette shade, semantic alias, raw hex). */
export function resolveBorderColor(system: DesignSystemConfig, ref: string, themeId?: string): string | null {
  if (typeof ref !== "string") return null;
  const resolved = resolveToken(system, ref, themeId);
  return resolved.status === "resolved" ? resolved.value : null;
}

export interface ResolvedBorderRecipe {
  width: string;
  style: string;
  color: string;
  /** Ready-to-use CSS shorthand, e.g. "1px solid #e4e4e7". */
  css: string;
}

/** Resolve a full recipe; null when any leg is unresolvable. */
export function resolveBorderRecipe(
  system: DesignSystemConfig,
  recipeId: string,
  themeId?: string,
): ResolvedBorderRecipe | null {
  const recipe = recipesOf(system).find((token) => token.id === recipeId);
  if (!recipe || recipe.enabled === false) return null;
  const width = resolveBorderWidth(system, recipe.width);
  const style = resolveBorderStyle(system, recipe.style);
  const color = resolveBorderColor(system, recipe.color, themeId);
  if (!width || !style || !color) return null;
  return { width, style, color, css: `${width} ${style} ${color}` };
}

/** All palette shade references ("neutral.200") plus semantic aliases for pickers. */
export function colorReferenceOptions(system: DesignSystemConfig): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (const palette of system.foundations.colors?.palettes ?? []) {
    for (const shade of Object.keys(palette.shades ?? {}).sort()) {
      options.push({ value: `${palette.id}.${shade}`, label: `${palette.label} ${shade}` });
    }
  }
  for (const token of system.semanticTokens ?? []) {
    options.push({ value: token.id, label: `${token.label} (${token.id})` });
  }
  return options;
}

// ---------------------------------------------------------------------------
// Width scale CRUD
// ---------------------------------------------------------------------------

export interface CreateWidthInput {
  id?: string;
  label?: string;
  amount: number;
  unit: BorderWidthUnit;
}

export type CreateWidthResult = { ok: true; id: string; value: string } | { ok: false; error: string };

export function createWidthToken(
  input: CreateWidthInput,
  existingIds: readonly string[],
): CreateWidthResult {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    return { ok: false, error: "Enter a value of 0 or more." };
  }
  if (!BORDER_WIDTH_UNITS.includes(input.unit)) {
    return { ok: false, error: "Use px or rem." };
  }
  const label = (input.label ?? "").trim();
  const requested = (input.id ?? "").trim();
  let id: string;
  if (requested) {
    const slug = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (!isTokenIdSafe(slug)) {
      return { ok: false, error: "That token id is not URL-safe. Use lowercase letters, numbers, and dashes." };
    }
    if (existingIds.includes(slug)) {
      return { ok: false, error: `Token id "${slug}" is already in use.` };
    }
    id = slug;
  } else {
    if (!label) return { ok: false, error: "Give the token a name." };
    id = slugifyBorderId(label, existingIds);
  }
  const parsed = boundedWidth(input.amount, input.unit);
  if (!parsed) return { ok: false, error: "Enter a value of 0 or more (max 64px / 4rem)." };
  return { ok: true, id, value: formatBorderWidth(parsed) };
}

export function updateWidthValue(
  system: DesignSystemConfig,
  key: string,
  amount: number,
  unit: BorderWidthUnit,
): DesignSystemConfig {
  const parsed = boundedWidth(amount, unit);
  if (!parsed) return system;
  const widths = widthsOf(system);
  if (!(key in widths)) return system;
  return withBorders(system, { widths: { ...widths, [key]: formatBorderWidth(parsed) } });
}

export function removeWidthToken(system: DesignSystemConfig, key: string): DesignSystemConfig {
  const widths = widthsOf(system);
  if (!(key in widths)) return system;
  const next = { ...widths };
  delete next[key];
  return withBorders(system, { widths: next });
}

export interface WidthReference {
  kind: "recipe" | "semantic" | "theme" | "component";
  pointer: string;
}

function findWidthReferences(system: DesignSystemConfig, key: string): WidthReference[] {
  const references: WidthReference[] = [];
  const seen = new Set<string>();
  const push = (reference: WidthReference): void => {
    const mapKey = `${reference.kind}:${reference.pointer}`;
    if (seen.has(mapKey)) return;
    seen.add(mapKey);
    references.push(reference);
  };
  for (const token of recipesOf(system)) {
    if (token.width === key) push({ kind: "recipe", pointer: token.id });
  }
  for (const token of system.semanticTokens ?? []) {
    if (token.value === key) push({ kind: "semantic", pointer: token.id });
  }
  for (const theme of system.themes ?? []) {
    for (const [overrideKey, value] of Object.entries(theme.overrides ?? {})) {
      if (value === key) push({ kind: "theme", pointer: `${theme.label || theme.id}.${overrideKey}` });
    }
  }
  for (const component of system.components ?? []) {
    for (const override of component.overrides ?? []) {
      if (override.value === key) {
        const name = component.label || component.component;
        const slot = [override.token, override.variant, override.state].filter(Boolean).join(".");
        push({ kind: "component", pointer: `${name}.${slot}` });
      }
    }
  }
  return references;
}

export type WidthDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: WidthReference[] };

export function canDeleteWidthToken(system: DesignSystemConfig, key: string): WidthDeleteGuard {
  const widths = widthsOf(system);
  if (!(key in widths)) {
    return { ok: false, reasons: ["That width token no longer exists."], references: [] };
  }
  if (Object.keys(widths).length <= 1) {
    return {
      ok: false,
      reasons: ["This is the last width token. A scale needs at least one width to stay valid."],
      references: [],
    };
  }
  const references = findWidthReferences(system, key);
  if (references.length > 0) {
    const names = references.slice(0, 4).map((reference) => reference.pointer);
    const more = references.length > 4 ? ` and ${references.length - 4} more` : "";
    return {
      ok: false,
      reasons: [
        `${key} is used by ${references.length} token${references.length === 1 ? "" : "s"} (${names.join(", ")}${more}) and cannot be deleted.`,
      ],
      references,
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Styles: availability + default (custom keys preserved, never created here)
// ---------------------------------------------------------------------------

export function availableStyles(system: DesignSystemConfig): string[] {
  const record = system.foundations.borders?.styles ?? {};
  const disabled = new Set(system.foundations.borders?.disabledStyles ?? []);
  return Object.keys(record).filter((key) => !disabled.has(key));
}

export function defaultBorderStyle(system: DesignSystemConfig): string {
  const fallback = system.foundations.borders?.defaultStyle;
  if (typeof fallback === "string" && fallback in (system.foundations.borders?.styles ?? {})) return fallback;
  return "solid";
}

export type StyleToggleResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

export function setStyleEnabled(system: DesignSystemConfig, style: string, enabled: boolean): StyleToggleResult {
  const record = system.foundations.borders?.styles ?? {};
  if (!(style in record)) return { ok: false, error: `Style "${style}" does not exist in this system.` };
  const disabled = new Set(system.foundations.borders?.disabledStyles ?? []);
  if (enabled) {
    disabled.delete(style);
    return { ok: true, system: withBorders(system, { disabledStyles: [...disabled] }) };
  }
  const users = recipesOf(system).filter((token) => token.style === style);
  if (users.length > 0) {
    const names = users.slice(0, 4).map((token) => token.id).join(", ");
    const more = users.length > 4 ? ` and ${users.length - 4} more` : "";
    return {
      ok: false,
      error: `Style "${style}" is used by ${users.length} recipe${users.length === 1 ? "" : "s"} (${names}${more}). Re-point those recipes first.`,
    };
  }
  const remaining = Object.keys(record).filter((key) => key !== style && !disabled.has(key));
  if (remaining.length === 0) {
    return { ok: false, error: `Style "${style}" is the last enabled style. Keep at least one style available.` };
  }
  disabled.add(style);
  const next = withBorders(system, { disabledStyles: [...disabled] });
  // Keep the default pointing at an enabled style.
  if (next.foundations.borders?.defaultStyle === style) {
    return { ok: true, system: withBorders(next, { defaultStyle: remaining[0]! }) };
  }
  return { ok: true, system: next };
}

export function setDefaultStyle(system: DesignSystemConfig, style: string): StyleToggleResult {
  const record = system.foundations.borders?.styles ?? {};
  if (!(style in record)) return { ok: false, error: `Style "${style}" does not exist in this system.` };
  if ((system.foundations.borders?.disabledStyles ?? []).includes(style)) {
    return { ok: false, error: `Style "${style}" is disabled. Enable it before setting it as default.` };
  }
  return { ok: true, system: withBorders(system, { defaultStyle: style }) };
}

// ---------------------------------------------------------------------------
// Recipes CRUD (ids immutable once created; labels edit freely)
// ---------------------------------------------------------------------------

export interface CreateRecipeInput {
  id?: string;
  label: string;
  width: string;
  style: string;
  color: string;
}

export type CreateRecipeResult = { ok: true; token: BorderToken } | { ok: false; error: string };

function validateRecipeFields(
  system: DesignSystemConfig,
  fields: { width: string; style: string; color: string },
): string | null {
  const widths = widthsOf(system);
  if (!(fields.width in widths) && !parseBorderWidth(fields.width)) {
    return `Width "${fields.width}" is not a width token or valid length.`;
  }
  const styles = system.foundations.borders?.styles ?? {};
  if (!(fields.style in styles)) {
    return `Style "${fields.style}" does not exist in this system.`;
  }
  if (resolveBorderColor(system, fields.color) === null) {
    return `Color "${fields.color}" does not resolve. Pick a palette shade, semantic alias, or valid hex.`;
  }
  return null;
}

export function createBorderRecipe(
  system: DesignSystemConfig,
  input: CreateRecipeInput,
): CreateRecipeResult {
  const label = input.label.trim().slice(0, 60);
  if (!label) return { ok: false, error: "Give the recipe a name." };
  const existing = recipesOf(system).map((token) => token.id);
  const requested = (input.id ?? "").trim();
  let id: string;
  if (requested) {
    const slug = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (!isTokenIdSafe(slug)) {
      return { ok: false, error: "That recipe id is not URL-safe. Use lowercase letters, numbers, and dashes." };
    }
    if (existing.includes(slug)) {
      return { ok: false, error: `Recipe id "${slug}" is already in use.` };
    }
    id = slug;
  } else {
    id = slugifyBorderId(label, existing);
  }
  const problem = validateRecipeFields(system, input);
  if (problem) return { ok: false, error: problem };
  return {
    ok: true,
    token: { id, label, width: input.width, style: input.style, color: input.color },
  };
}

export type UpdateRecipeResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

export function updateBorderRecipe(
  system: DesignSystemConfig,
  id: string,
  patch: Partial<{ label: string; width: string; style: string; color: string; enabled: boolean }>,
): UpdateRecipeResult {
  const recipes = recipesOf(system);
  const current = recipes.find((token) => token.id === id);
  if (!current) return { ok: false, error: "That recipe no longer exists." };
  const next: BorderToken = { ...current };
  if (patch.label !== undefined) {
    const label = patch.label.trim().slice(0, 60);
    if (!label) return { ok: false, error: "Label cannot be empty — keeping the previous label." };
    next.label = label;
  }
  if (patch.width !== undefined) {
    const widths = widthsOf(system);
    if (!(patch.width in widths) && !parseBorderWidth(patch.width)) {
      return { ok: false, error: `Width "${patch.width}" is not a width token or valid length.` };
    }
    next.width = patch.width;
  }
  if (patch.style !== undefined) {
    const styles = system.foundations.borders?.styles ?? {};
    if (!(patch.style in styles)) return { ok: false, error: `Style "${patch.style}" does not exist in this system.` };
    next.style = patch.style;
  }
  if (patch.color !== undefined) {
    if (resolveBorderColor(system, patch.color) === null) {
      return { ok: false, error: `Color "${patch.color}" does not resolve. Pick a palette shade, semantic alias, or valid hex.` };
    }
    next.color = patch.color;
  }
  if (patch.enabled !== undefined) {
    if (patch.enabled) {
      const { enabled: _removed, ...rest } = next;
      void _removed;
      return { ok: true, system: withBorders(system, { tokens: recipes.map((token) => (token.id === id ? rest : token)) }) };
    }
    next.enabled = false;
  }
  return { ok: true, system: withBorders(system, { tokens: recipes.map((token) => (token.id === id ? next : token)) }) };
}

/** Independent copy with a fresh unique id; safe to edit or delete. */
export function duplicateBorderRecipe(system: DesignSystemConfig, id: string): BorderToken | null {
  const current = recipesOf(system).find((token) => token.id === id);
  if (!current) return null;
  const existing = recipesOf(system).map((token) => token.id);
  const base = `${current.id}-copy`;
  let copyId = base;
  let counter = 2;
  while (existing.includes(copyId)) {
    copyId = `${base}-${counter}`;
    counter += 1;
  }
  const { enabled: _ignored, ...rest } = current;
  void _ignored;
  return { ...rest, id: copyId, label: `${current.label} copy` };
}

export function removeBorderRecipe(system: DesignSystemConfig, id: string): DesignSystemConfig {
  return withBorders(
    system,
    { tokens: recipesOf(system).filter((token) => token.id !== id) },
  );
}

export interface RecipeReference {
  kind: "semantic" | "theme" | "component";
  pointer: string;
  value: string;
}

/** Exact-match references to a recipe id across semantic, theme, and component stores. */
export function findRecipeReferences(system: DesignSystemConfig, recipeId: string): RecipeReference[] {
  const references: RecipeReference[] = [];
  const seen = new Set<string>();
  const push = (reference: RecipeReference): void => {
    const key = `${reference.kind}:${reference.pointer}`;
    if (seen.has(key)) return;
    seen.add(key);
    references.push(reference);
  };
  for (const token of system.semanticTokens ?? []) {
    if (token.value === recipeId) push({ kind: "semantic", pointer: token.id, value: token.value });
  }
  for (const theme of system.themes ?? []) {
    for (const [key, value] of Object.entries(theme.overrides ?? {})) {
      if (value === recipeId) push({ kind: "theme", pointer: `${theme.label || theme.id}.${key}`, value });
    }
  }
  for (const component of system.components ?? []) {
    for (const override of component.overrides ?? []) {
      if (override.value === recipeId) {
        const name = component.label || component.component;
        const slot = [override.token, override.variant, override.state].filter(Boolean).join(".");
        push({ kind: "component", pointer: `${name}.${slot}`, value: override.value });
      }
    }
  }
  return references;
}

export type RecipeDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: RecipeReference[] };

/** Never the last recipe, never a referenced recipe. */
export function canDeleteBorderRecipe(system: DesignSystemConfig, recipeId: string): RecipeDeleteGuard {
  const recipes = recipesOf(system);
  if (!recipes.some((token) => token.id === recipeId)) {
    return { ok: false, reasons: ["That recipe no longer exists."], references: [] };
  }
  if (recipes.length <= 1) {
    return {
      ok: false,
      reasons: ["This is the last border recipe. Keep at least one recipe so default borders stay available."],
      references: [],
    };
  }
  const references = findRecipeReferences(system, recipeId);
  if (references.length > 0) {
    const names = references.slice(0, 4).map((reference) => reference.pointer);
    const more = references.length > 4 ? ` and ${references.length - 4} more` : "";
    return {
      ok: false,
      reasons: [
        `${recipeId} is used by ${references.length} token${references.length === 1 ? "" : "s"} (${names.join(", ")}${more}) and cannot be deleted.`,
      ],
      references,
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Starter defaults, presets, diffs
// ---------------------------------------------------------------------------

/** Fresh starter system used for resets and preset comparisons (never saved). */
export function starterBorderReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one width value to its starter value; null when the starter lacks the key. */
export function resetWidthToStarter(system: DesignSystemConfig, key: string): DesignSystemConfig | null {
  const starter = widthsOf(starterBorderReference(system));
  if (!(key in starter)) return null;
  const widths = widthsOf(system);
  if (!(key in widths)) return null;
  return withBorders(system, { widths: { ...widths, [key]: starter[key]! } });
}

/** Restore one recipe to its starter snapshot; null when the starter lacks the id. */
export function resetRecipeToStarter(system: DesignSystemConfig, recipeId: string): DesignSystemConfig | null {
  const baseline = starterBorderReference(system).foundations.borders?.tokens.find((token) => token.id === recipeId);
  if (!baseline) return null;
  return withBorders(system, {
    tokens: recipesOf(system).map((token) => (token.id === recipeId ? { ...baseline } : token)),
  });
}

/** Restore full widths, styles availability, default style, and recipes to starter defaults. */
export function restoreStarterBorders(system: DesignSystemConfig): DesignSystemConfig {
  const starter = starterBorderReference(system).foundations.borders;
  return withBorders(system, {
    widths: { ...starter.widths },
    styles: { ...starter.styles },
    disabledStyles: [...(starter.disabledStyles ?? [])],
    defaultStyle: starter.defaultStyle ?? "solid",
    tokens: starter.tokens.map((token) => ({ ...token })),
  });
}

export interface BorderPreset {
  id: string;
  label: string;
  description: string;
  widths: Record<string, string>;
  recipes: BorderToken[];
  defaultStyle: string;
}

function recipe(id: string, label: string, width: string, style: string, color: string): BorderToken {
  return { id, label, width, style, color };
}

/** Optional starting points. Applying one replaces widths, recipes, and default style wholesale. */
export const BORDER_PRESETS: BorderPreset[] = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Subtle 1px neutral borders for quiet interfaces.",
    widths: { none: "0px", hairline: "1px", thin: "1px", default: "1px", medium: "2px", thick: "4px" },
    recipes: [
      recipe("border.subtle", "Subtle border", "hairline", "solid", "neutral.200"),
      recipe("border.default", "Default border", "thin", "solid", "neutral.200"),
      recipe("border.strong", "Strong border", "thin", "solid", "neutral.300"),
      recipe("border.focus", "Focus border", "medium", "solid", "focus.ring"),
      recipe("border.error", "Error border", "thin", "solid", "status.danger.foreground"),
    ],
    defaultStyle: "solid",
  },
  {
    id: "product",
    label: "Product",
    description: "Clear control, surface, and focus borders for product UI.",
    widths: { none: "0px", hairline: "1px", thin: "1px", default: "1px", medium: "2px", thick: "4px" },
    recipes: [
      recipe("border.subtle", "Subtle border", "thin", "solid", "neutral.200"),
      recipe("border.default", "Default border", "default", "solid", "neutral.300"),
      recipe("border.strong", "Strong border", "medium", "solid", "neutral.400"),
      recipe("border.focus", "Focus border", "medium", "solid", "focus.ring"),
      recipe("border.error", "Error border", "medium", "solid", "status.danger.foreground"),
    ],
    defaultStyle: "solid",
  },
  {
    id: "data-dense",
    label: "Data-dense",
    description: "Stronger dividers and inputs for data-heavy surfaces.",
    widths: { none: "0px", hairline: "1px", thin: "1px", default: "1px", medium: "2px", thick: "4px" },
    recipes: [
      recipe("border.subtle", "Subtle border", "thin", "solid", "neutral.300"),
      recipe("border.default", "Default border", "medium", "solid", "neutral.300"),
      recipe("border.strong", "Strong border", "medium", "solid", "neutral.400"),
      recipe("border.focus", "Focus border", "medium", "solid", "focus.ring"),
      recipe("border.error", "Error border", "medium", "solid", "status.danger.foreground"),
    ],
    defaultStyle: "solid",
  },
];

/** Apply a preset wholesale (widths, recipes, default style). */
export function applyBorderPreset(system: DesignSystemConfig, preset: BorderPreset): DesignSystemConfig {
  return withBorders(system, {
    widths: { ...preset.widths },
    defaultStyle: preset.defaultStyle,
    tokens: preset.recipes.map((token) => ({ ...token })),
  });
}

export interface BorderDiff {
  widthsChanged: Array<{ id: string; from: string; to: string }>;
  widthsAdded: Array<{ id: string; value: string }>;
  widthsRemoved: Array<{ id: string; value: string }>;
  recipesAdded: BorderToken[];
  recipesRemoved: BorderToken[];
  recipesChanged: Array<{ id: string; from: string; to: string }>;
}

function describeRecipe(token: BorderToken): string {
  return `${token.label}: ${token.width} ${token.style} ${token.color}`;
}

/** Before/after summary between current borders and a candidate set. */
export function diffBorders(
  current: { widths: Record<string, string>; tokens: BorderToken[] },
  next: { widths: Record<string, string>; tokens: BorderToken[] },
): BorderDiff {
  const widthsChanged: BorderDiff["widthsChanged"] = [];
  const widthsAdded: BorderDiff["widthsAdded"] = [];
  const widthsRemoved: BorderDiff["widthsRemoved"] = [];
  for (const [id, value] of Object.entries(next.widths)) {
    if (!(id in current.widths)) widthsAdded.push({ id, value });
    else if (current.widths[id] !== value) widthsChanged.push({ id, from: current.widths[id]!, to: value });
  }
  for (const [id, value] of Object.entries(current.widths)) {
    if (!(id in next.widths)) widthsRemoved.push({ id, value });
  }
  const currentById = new Map(current.tokens.map((token) => [token.id, token]));
  const nextById = new Map(next.tokens.map((token) => [token.id, token]));
  const recipesAdded = next.tokens.filter((token) => !currentById.has(token.id));
  const recipesRemoved = current.tokens.filter((token) => !nextById.has(token.id));
  const recipesChanged: BorderDiff["recipesChanged"] = [];
  for (const token of next.tokens) {
    const from = currentById.get(token.id);
    if (from && describeRecipe(from) !== describeRecipe(token)) {
      recipesChanged.push({ id: token.id, from: describeRecipe(from), to: describeRecipe(token) });
    }
  }
  return { widthsChanged, widthsAdded, widthsRemoved, recipesAdded, recipesRemoved, recipesChanged };
}

/** True when widths, styles availability, default style, or recipes differ from starter. */
export function hasCustomBorderEdits(system: DesignSystemConfig): boolean {
  const starter = starterBorderReference(system).foundations.borders;
  const current = system.foundations.borders ?? { widths: {}, styles: {}, tokens: [] };
  const diff = diffBorders(
    { widths: current.widths ?? {}, tokens: current.tokens ?? [] },
    { widths: starter.widths ?? {}, tokens: starter.tokens ?? [] },
  );
  if (
    diff.widthsChanged.length > 0 ||
    diff.widthsAdded.length > 0 ||
    diff.widthsRemoved.length > 0 ||
    diff.recipesAdded.length > 0 ||
    diff.recipesRemoved.length > 0 ||
    diff.recipesChanged.length > 0
  ) {
    return true;
  }
  const currentDisabled = [...(current.disabledStyles ?? [])].sort().join(",");
  const starterDisabled = [...(starter.disabledStyles ?? [])].sort().join(",");
  if (currentDisabled !== starterDisabled) return true;
  return (current.defaultStyle ?? "solid") !== (starter.defaultStyle ?? "solid");
}

/** Border-relevant validator issues for the current system. */
export function borderIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("foundations.borders"));
}
