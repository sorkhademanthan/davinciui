// Shadow editing logic for the Shadows foundation editor (Step 7D).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `ShadowToken` shape directly; no parallel model. Recipes carry structured
// layers (offsets, blur, spread, color reference, opacity, inset/outset) so
// previews resolve real palette colors instead of opaque CSS strings.
// Token ids are stable references; labels edit freely without breaking refs.

import {
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
  type ShadowLayer,
  type ShadowToken,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

// Guardrails: offsets ±200px, blur 0–200px, spread −100–100px, opacity 0–1.
const OFFSET_LIMIT = 200;
const BLUR_LIMIT = 200;
const SPREAD_LIMIT = 100;

export interface ParsedLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

function round2(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Validate + normalize one layer. Color must be a palette shade reference
 * ("neutral.950"), a semantic alias ("focus.ring"), or a raw six-digit hex
 * fallback. Numeric fields must be finite and within guardrails.
 */
export function parseLayer(value: unknown): ParsedLayer | null {
  if (typeof value !== "object" || value === null) return null;
  const entry = value as Record<string, unknown>;
  const { x, y, blur, spread, opacity } = entry;
  if (!isFiniteNumber(x) || Math.abs(x) > OFFSET_LIMIT) return null;
  if (!isFiniteNumber(y) || Math.abs(y) > OFFSET_LIMIT) return null;
  if (!isFiniteNumber(blur) || blur < 0 || blur > BLUR_LIMIT) return null;
  if (!isFiniteNumber(spread) || Math.abs(spread) > SPREAD_LIMIT) return null;
  if (!isFiniteNumber(opacity) || opacity < 0 || opacity > 1) return null;
  const color = typeof entry.color === "string" ? entry.color.trim() : "";
  if (color === "" || color.length > 80) return null;
  const inset = entry.inset === true;
  return { x, y, blur, spread, color, opacity: round2(opacity), inset };
}

/** Suggested display label for a new token id ("my-lift" → "My lift"). */
export function humanShadowLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** URL/token-safe id from free text. Empty-safe ("!!!" → "token"). */
export function slugifyShadowId(raw: string, existingIds: readonly string[]): string {
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

function tokensOf(system: DesignSystemConfig): ShadowToken[] {
  return [...(system.foundations.shadows?.tokens ?? [])];
}

function withTokens(system: DesignSystemConfig, tokens: ShadowToken[]): DesignSystemConfig {
  return {
    ...system,
    foundations: {
      ...system.foundations,
      shadows: { ...system.foundations.shadows, tokens: tokens.map((token) => ({ ...token })) },
    },
  };
}

function cloneLayers(token: ShadowToken): ShadowLayer[] {
  return (token.layers ?? []).map((layer) => ({ ...layer }));
}

// ---------------------------------------------------------------------------
// Resolution: structured layers → deterministic CSS
// ---------------------------------------------------------------------------

export interface ResolvedShadow {
  /** Ready-to-use CSS `box-shadow` value ("none" when empty). */
  css: string;
  /** Per-layer resolved colors, in order (for swatches/captions). */
  colors: string[];
}

/**
 * Resolve a recipe to CSS. Layer colors resolve through the Step 1 resolver
 * (palette shades, semantic aliases, raw hex); opacity applies via
 * `color-mix` so any resolved format stays valid. Disabled recipes and
 * unknown ids do not resolve. Layer-less legacy tokens render their `value`.
 */
export function resolveShadow(
  system: DesignSystemConfig,
  recipeId: string,
  themeId?: string,
): ResolvedShadow | null {
  const token = tokensOf(system).find((entry) => entry.id === recipeId);
  if (!token || token.enabled === false) return null;
  if (!token.layers) {
    const value = token.value.trim();
    if (value === "") return null;
    return { css: value, colors: [] };
  }
  if (token.layers.length === 0) return { css: "none", colors: [] };
  const parts: string[] = [];
  const colors: string[] = [];
  for (const raw of token.layers) {
    const layer = parseLayer(raw);
    if (!layer) return null;
    const resolved = resolveToken(system, layer.color, themeId);
    if (resolved.status !== "resolved") return null;
    const color = withOpacity(resolved.value, layer.opacity);
    colors.push(color);
    const inset = layer.inset ? "inset " : "";
    parts.push(
      `${inset}${trimNumber(layer.x)}px ${trimNumber(layer.y)}px ${trimNumber(layer.blur)}px ${trimNumber(layer.spread)}px ${color}`,
    );
  }
  return { css: parts.join(", "), colors };
}

function trimNumber(amount: number): string {
  return `${round2(amount)}`;
}

/**
 * Apply an opacity override to a resolved color. Hex colors fold into a
 * single `rgb()` triple; any other resolved format uses `color-mix` so the
 * output stays valid CSS.
 */
export function withOpacity(color: string, opacity: number): string {
  const clamped = Math.min(1, Math.max(0, opacity));
  if (clamped >= 1) return color;
  const hex = /^#([0-9a-fA-F]{6})$/.exec(color.trim());
  if (hex) {
    const value = hex[1]!;
    const r = Number.parseInt(value.slice(0, 2), 16);
    const g = Number.parseInt(value.slice(2, 4), 16);
    const b = Number.parseInt(value.slice(4, 6), 16);
    return `rgb(${r} ${g} ${b} / ${round2(clamped)})`;
  }
  const percent = round2(clamped * 100);
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/** Canonical CSS for a recipe's layers (base resolution, no theme). */
export function cssForLayers(system: DesignSystemConfig, layers: ShadowLayer[]): string | null {
  const probe: ShadowToken = { id: "__probe__", label: "probe", value: "", layers: layers.map((layer) => ({ ...layer })) };
  const scoped: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      shadows: { ...system.foundations.shadows, tokens: [...tokensOf(system), probe] },
    },
  };
  return resolveShadow(scoped, "__probe__")?.css ?? null;
}

/** validation-friendly check: every layer parses and every color resolves. */
export function layersResolve(
  system: DesignSystemConfig,
  layers: ShadowLayer[],
  themeId?: string,
): { ok: true } | { ok: false; reason: string } {
  for (const raw of layers) {
    const layer = parseLayer(raw);
    if (!layer) return { ok: false, reason: "A layer has malformed numeric values." };
    const resolved = resolveToken(system, layer.color, themeId);
    if (resolved.status !== "resolved") {
      return { ok: false, reason: `Color "${layer.color}" does not resolve. Use a palette shade, semantic alias, or six-digit hex.` };
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Recipes CRUD (ids immutable once created; labels edit freely)
// ---------------------------------------------------------------------------

export interface CreateShadowInput {
  /** Optional explicit id; otherwise derived from the label. */
  id?: string;
  /** Visible label; used to derive the id when id is omitted. */
  label?: string;
  description?: string;
  layers?: ShadowLayer[];
}

export type CreateShadowResult = { ok: true; token: ShadowToken } | { ok: false; error: string };

export function createShadowRecipe(
  system: DesignSystemConfig,
  input: CreateShadowInput,
): CreateShadowResult {
  const label = (input.label ?? "").trim().slice(0, 60);
  if (!label) return { ok: false, error: "Give the recipe a name." };
  const existing = tokensOf(system).map((token) => token.id);
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
    id = slugifyShadowId(label, existing);
  }
  const layers = (input.layers ?? []).map((raw) => {
    const parsed = parseLayer(raw);
    return parsed
      ? { x: parsed.x, y: parsed.y, blur: parsed.blur, spread: parsed.spread, color: parsed.color, opacity: parsed.opacity, inset: parsed.inset }
      : null;
  });
  if (layers.some((layer) => layer === null)) {
    return { ok: false, error: "A layer has malformed numeric values." };
  }
  const clean = layers as ShadowLayer[];
  const check = layersResolve(system, clean);
  if (!check.ok) return { ok: false, error: check.reason };
  const css = cssForLayers(system, clean) ?? "none";
  const description = typeof input.description === "string" && input.description.trim() !== "" ? input.description.trim().slice(0, 140) : undefined;
  return {
    ok: true,
    token: {
      id,
      label,
      value: css,
      ...(description ? { description } : {}),
      layers: clean,
    },
  };
}

export type UpdateShadowResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

function validateRecipeShape(
  system: DesignSystemConfig,
  token: ShadowToken,
): string | null {
  if (!token.label.trim()) return "Label cannot be empty — keeping the previous label.";
  for (const raw of token.layers ?? []) {
    if (!parseLayer(raw)) return "A layer has malformed numeric values.";
  }
  const check = layersResolve(system, token.layers ?? []);
  if (!check.ok) return check.reason;
  return null;
}

function syncValue(system: DesignSystemConfig, token: ShadowToken): ShadowToken {
  if (!token.layers) return token;
  const css = cssForLayers(system, token.layers) ?? "none";
  return { ...token, value: css };
}

export function updateShadowRecipe(
  system: DesignSystemConfig,
  id: string,
  patch: Partial<{ label: string; description: string; layers: ShadowLayer[]; enabled: boolean }>,
): UpdateShadowResult {
  const tokens = tokensOf(system);
  const current = tokens.find((token) => token.id === id);
  if (!current) return { ok: false, error: "That recipe no longer exists." };
  const next: ShadowToken = {
    ...current,
    layers: current.layers ? cloneLayers(current) : undefined,
  };
  if (patch.label !== undefined) next.label = patch.label;
  if (patch.description !== undefined) {
    const description = patch.description.trim().slice(0, 140);
    if (description === "") delete next.description;
    else next.description = description;
  }
  if (patch.layers !== undefined) {
    next.layers = patch.layers.map((layer) => ({ ...layer }));
  }
  if (patch.enabled !== undefined) {
    if (patch.enabled) delete next.enabled;
    else next.enabled = false;
  }
  const problem = validateRecipeShape(system, next);
  if (problem) return { ok: false, error: problem };
  const synced = syncValue(system, next);
  return {
    ok: true,
    system: withTokens(
      system,
      tokens.map((token) => (token.id === id ? synced : token)),
    ),
  };
}

/** Independent copy with a fresh unique id; safe to edit or delete. */
export function duplicateShadowRecipe(system: DesignSystemConfig, id: string): ShadowToken | null {
  const current = tokensOf(system).find((token) => token.id === id);
  if (!current) return null;
  const existing = tokensOf(system).map((token) => token.id);
  const base = `${current.id}-copy`;
  let copyId = base;
  let counter = 2;
  while (existing.includes(copyId)) {
    copyId = `${base}-${counter}`;
    counter += 1;
  }
  return {
    ...current,
    id: copyId,
    label: `${current.label} copy`,
    layers: current.layers ? cloneLayers(current) : undefined,
  };
}

export function removeShadowRecipe(system: DesignSystemConfig, id: string): DesignSystemConfig {
  return withTokens(
    system,
    tokensOf(system).filter((token) => token.id !== id),
  );
}

export function setShadowEnabled(
  system: DesignSystemConfig,
  id: string,
  enabled: boolean,
): UpdateShadowResult {
  return updateShadowRecipe(system, id, { enabled });
}

// ---------------------------------------------------------------------------
// Layer operations within one recipe (pure; caller persists via update)
// ---------------------------------------------------------------------------

export function addShadowLayer(token: ShadowToken, layer: ShadowLayer): ShadowToken {
  const parsed = parseLayer(layer);
  const fallback: ShadowLayer = { x: 0, y: 4, blur: 8, spread: 0, color: "neutral.950", opacity: 0.1, inset: false };
  const clean = parsed ?? fallback;
  return { ...token, layers: [...cloneLayers(token), { ...clean }] };
}

export function updateShadowLayer(token: ShadowToken, index: number, patch: Partial<ShadowLayer>): ShadowToken | null {
  const layers = cloneLayers(token);
  const current = layers[index];
  if (!current) return null;
  const merged = { ...current, ...patch };
  if (!parseLayer(merged)) return null;
  layers[index] = { ...merged, color: merged.color.trim() };
  return { ...token, layers };
}

export function removeShadowLayer(token: ShadowToken, index: number): ShadowToken | null {
  const layers = cloneLayers(token);
  if (index < 0 || index >= layers.length) return null;
  layers.splice(index, 1);
  return { ...token, layers };
}

export function moveShadowLayer(token: ShadowToken, index: number, direction: -1 | 1): ShadowToken | null {
  const layers = cloneLayers(token);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= layers.length) return null;
  const [moved] = layers.splice(index, 1);
  layers.splice(target, 0, moved!);
  return { ...token, layers };
}

export interface ShadowReference {
  kind: "semantic" | "theme" | "component";
  /** Human-readable pointer, e.g. `component.dialog.shadow`. */
  pointer: string;
  value: string;
}

/** Exact-match references to a recipe id across semantic, theme, and component stores. */
export function findShadowReferences(system: DesignSystemConfig, recipeId: string): ShadowReference[] {
  const references: ShadowReference[] = [];
  const seen = new Set<string>();
  const push = (reference: ShadowReference): void => {
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

export type ShadowDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: ShadowReference[] };

/** Never the last recipe, never a referenced recipe. */
export function canDeleteShadowRecipe(system: DesignSystemConfig, recipeId: string): ShadowDeleteGuard {
  const tokens = tokensOf(system);
  if (!tokens.some((token) => token.id === recipeId)) {
    return { ok: false, reasons: ["That recipe no longer exists."], references: [] };
  }
  if (tokens.length <= 1) {
    return {
      ok: false,
      reasons: ["This is the last shadow recipe. Keep at least one recipe so elevation stays available."],
      references: [],
    };
  }
  const references = findShadowReferences(system, recipeId);
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

/** Disabling is blocked only when it would leave zero usable recipes. */
export function canDisableShadowRecipe(system: DesignSystemConfig, recipeId: string): ShadowDeleteGuard {
  const tokens = tokensOf(system);
  const target = tokens.find((token) => token.id === recipeId);
  if (!target) {
    return { ok: false, reasons: ["That recipe no longer exists."], references: [] };
  }
  if (target.enabled === false) return { ok: true };
  const usable = tokens.filter((token) => token.id !== recipeId && token.enabled !== false);
  if (usable.length === 0) {
    return {
      ok: false,
      reasons: ["This is the last usable shadow recipe. Keep at least one enabled recipe."],
      references: [],
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Starter defaults, presets, diffs
// ---------------------------------------------------------------------------

/** Fresh starter system used for resets and preset comparisons (never saved). */
export function starterShadowReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one recipe to its starter snapshot; null when the starter lacks the id. */
export function resetShadowToStarter(system: DesignSystemConfig, recipeId: string): DesignSystemConfig | null {
  const baseline = (starterShadowReference(system).foundations.shadows?.tokens ?? []).find(
    (token) => token.id === recipeId,
  );
  if (!baseline) return null;
  return withTokens(
    system,
    tokensOf(system).map((token) =>
      token.id === recipeId
        ? { ...baseline, layers: baseline.layers ? baseline.layers.map((layer) => ({ ...layer })) : undefined }
        : token,
    ),
  );
}

/** Restore the full scale to the selected starter default. */
export function restoreStarterShadows(system: DesignSystemConfig): DesignSystemConfig {
  const starter = starterShadowReference(system);
  return withTokens(
    system,
    (starter.foundations.shadows?.tokens ?? []).map((token) => ({
      ...token,
      layers: token.layers ? token.layers.map((layer) => ({ ...layer })) : undefined,
    })),
  );
}

export interface ShadowPreset {
  id: string;
  label: string;
  description: string;
  tokens: ShadowToken[];
}

function recipe(
  id: string,
  label: string,
  layers: ShadowLayer[],
  description: string,
): ShadowToken {
  const css =
    layers.length === 0
      ? "none"
      : layers
          .map(
            (layer) =>
              `${layer.inset ? "inset " : ""}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${withOpacity(
                "#09090b",
                layer.opacity,
              )}`,
          )
          .join(", ");
  return { id, label, value: css, description, layers: layers.map((layer) => ({ ...layer })) };
}

const L = (
  x: number,
  y: number,
  blur: number,
  spread: number,
  opacity: number,
  inset = false,
  color = "neutral.950",
): ShadowLayer => ({ x, y, blur, spread, color, opacity, inset });

/** Optional starting points. Applying one replaces the scale wholesale. */
export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    id: "flat",
    label: "Flat",
    description: "No elevation; borders and surfaces do the work.",
    tokens: [
      recipe("shadow.none", "None", [], "Flat surfaces with no elevation."),
      recipe("shadow.xs", "X-Small", [], "Kept flat in this preset."),
      recipe("shadow.sm", "Small", [], "Kept flat in this preset."),
      recipe("shadow.md", "Medium", [], "Kept flat in this preset."),
      recipe("shadow.lg", "Large", [], "Kept flat in this preset."),
      recipe("shadow.xl", "X-Large", [], "Kept flat in this preset."),
    ],
  },
  {
    id: "subtle",
    label: "Subtle",
    description: "Hairline depth for quiet interfaces.",
    tokens: [
      recipe("shadow.none", "None", [], "Flat surfaces with no elevation."),
      recipe("shadow.xs", "X-Small", [L(0, 1, 1, 0, 0.04)], "Barely-there lift."),
      recipe("shadow.sm", "Small", [L(0, 1, 2, 0, 0.05)], "Subtle inline elevation."),
      recipe("shadow.md", "Medium", [L(0, 2, 4, -1, 0.06)], "Restrained cards."),
      recipe("shadow.lg", "Large", [L(0, 6, 12, -2, 0.08)], "Gentle dialogs."),
      recipe("shadow.xl", "X-Large", [L(0, 12, 20, -4, 0.1)], "Soft overlays."),
    ],
  },
  {
    id: "product",
    label: "Product surfaces",
    description: "Balanced card, popover, and dialog elevation.",
    tokens: [
      recipe("shadow.none", "None", [], "Flat surfaces with no elevation."),
      recipe("shadow.xs", "X-Small", [L(0, 1, 2, 0, 0.05)], "Hairline lift for inline elements."),
      recipe("shadow.sm", "Small", [L(0, 1, 2, 0, 0.05)], "Subtle elevation for inline elements."),
      recipe(
        "shadow.md",
        "Medium",
        [L(0, 4, 6, -1, 0.1), L(0, 2, 4, -2, 0.1)],
        "Default card and popover elevation.",
      ),
      recipe(
        "shadow.lg",
        "Large",
        [L(0, 10, 15, -3, 0.1), L(0, 4, 6, -4, 0.1)],
        "Dialogs and large overlays.",
      ),
      recipe(
        "shadow.xl",
        "X-Large",
        [L(0, 20, 25, -5, 0.1), L(0, 8, 10, -6, 0.1)],
        "Floating panels and high overlays.",
      ),
    ],
  },
  {
    id: "elevated",
    label: "Elevated overlays",
    description: "Deep, layered depth for floating experiences.",
    tokens: [
      recipe("shadow.none", "None", [], "Flat surfaces with no elevation."),
      recipe("shadow.xs", "X-Small", [L(0, 1, 2, 0, 0.06)], "Lifted inline elements."),
      recipe("shadow.sm", "Small", [L(0, 2, 4, 0, 0.08)], "Raised controls."),
      recipe(
        "shadow.md",
        "Medium",
        [L(0, 8, 12, -2, 0.12), L(0, 3, 6, -2, 0.1)],
        "Floating cards.",
      ),
      recipe(
        "shadow.lg",
        "Large",
        [L(0, 18, 28, -6, 0.16), L(0, 8, 12, -4, 0.12)],
        "High dialogs.",
      ),
      recipe(
        "shadow.xl",
        "X-Large",
        [L(0, 32, 48, -8, 0.2), L(0, 12, 18, -6, 0.14)],
        "Maximum float.",
      ),
    ],
  },
];

/** Apply a preset wholesale (all six canonical ids), syncing value strings. */
export function applyShadowPreset(system: DesignSystemConfig, preset: ShadowPreset): DesignSystemConfig {
  const applied = withTokens(
    system,
    preset.tokens.map((token) => ({
      ...token,
      layers: token.layers ? token.layers.map((layer) => ({ ...layer })) : undefined,
    })),
  );
  const synced = tokensOf(applied).map((token) => {
    if (!token.layers) return token;
    const css = cssForLayers(applied, token.layers);
    return css ? { ...token, value: css } : token;
  });
  return withTokens(applied, synced);
}

export interface ShadowDiff {
  added: ShadowToken[];
  removed: ShadowToken[];
  changed: Array<{ id: string; from: string; to: string }>;
}

function describeRecipe(token: ShadowToken): string {
  const layers = token.layers ?? [];
  if (layers.length === 0) return `${token.label}: none`;
  // Structural comparison: `value` is derived display text, layers are truth.
  const shape = layers
    .map((layer) => `${layer.x}/${layer.y}/${layer.blur}/${layer.spread}/${layer.color}/${layer.opacity}/${layer.inset ? "in" : "out"}`)
    .join(" + ");
  return `${token.label}: ${shape}`;
}

/** Before/after summary between current recipes and a candidate set. */
export function diffShadowTokens(current: ShadowToken[], next: ShadowToken[]): ShadowDiff {
  const currentById = new Map(current.map((token) => [token.id, token]));
  const nextById = new Map(next.map((token) => [token.id, token]));
  const added = next.filter((token) => !currentById.has(token.id));
  const removed = current.filter((token) => !nextById.has(token.id));
  const changed: ShadowDiff["changed"] = [];
  for (const token of next) {
    const from = currentById.get(token.id);
    if (from && describeRecipe(from) !== describeRecipe(token)) {
      changed.push({ id: token.id, from: describeRecipe(from), to: describeRecipe(token) });
    }
  }
  return { added, removed, changed };
}

/** True when recipes differ from the selected starter default in any way. */
export function hasCustomShadowEdits(system: DesignSystemConfig): boolean {
  const starter = (starterShadowReference(system).foundations.shadows?.tokens ?? []).map((token) => ({
    ...token,
    layers: token.layers ? token.layers.map((layer) => ({ ...layer })) : undefined,
  }));
  const diff = diffShadowTokens(
    starter,
    tokensOf(system).map((token) => ({
      ...token,
      layers: token.layers ? token.layers.map((layer) => ({ ...layer })) : undefined,
    })),
  );
  // Ignore pure `enabled` toggles? No — enabled state is part of the system;
  // compare full snapshots including it via JSON for the final word.
  if (diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0) return true;
  const normalize = (tokens: ShadowToken[]): string =>
    JSON.stringify(
      [...tokens]
        .map((token) => ({ ...token, layers: token.layers ? [...token.layers] : undefined }))
        .sort((a, b) => (a.id < b.id ? -1 : 1)),
    );
  return normalize(starter) !== normalize(tokensOf(system));
}

/** Shadow-relevant validator issues for the current system. */
export function shadowIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("foundations.shadows"));
}
