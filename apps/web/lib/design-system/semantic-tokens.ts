// Semantic-token editing logic for the Semantic Tokens editor (Step 8).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `SemanticToken` shape ({ id, label, category, value, description? })
// directly; no parallel model. Resolution and structural validation reuse the
// Step 1 `resolveToken` and `validateDesignSystem`; nothing here competes
// with them. Token ids are stable references: labels edit freely, ids never
// change after creation.

import {
  defaultSemanticTokens,
  isHexColor,
  validateDesignSystem,
  type DesignSystemConfig,
  type SemanticCategory,
  type SemanticToken,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export const SEMANTIC_CATEGORIES: readonly SemanticCategory[] = [
  "background",
  "surface",
  "text",
  "border",
  "action",
  "focus",
  "status",
  "overlay",
  "custom",
];

const CATEGORY_LABELS: Record<SemanticCategory, string> = {
  background: "Background",
  surface: "Surface",
  text: "Text",
  border: "Border",
  action: "Action",
  focus: "Focus",
  status: "Status",
  overlay: "Overlay",
  custom: "Custom",
};

export function categoryLabel(category: SemanticCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function isSemanticCategory(value: unknown): value is SemanticCategory {
  return (
    typeof value === "string" &&
    (SEMANTIC_CATEGORIES as readonly string[]).includes(value)
  );
}

/**
 * Required baseline token ids. These ship with every new starter system and
 * backstop themes plus the Card/Dialog component defaults, so deleting them
 * is blocked in this phase (a future destructive workflow may relax this).
 * `background.surface` is a retained legacy alias — new work prefers
 * `surface.*`, but themes and Card still reference it.
 */
export const REQUIRED_SEMANTIC_IDS: readonly string[] = [
  "background.canvas",
  "background.surface",
  "background.subtle",
  "background.inverse",
  "surface.default",
  "surface.raised",
  "surface.sunken",
  "text.primary",
  "text.secondary",
  "text.muted",
  "text.inverse",
  "border.subtle",
  "border.default",
  "border.strong",
  "action.primary.background",
  "action.primary.foreground",
  "action.primary.hover",
  "action.secondary.background",
  "action.secondary.foreground",
  "focus.ring",
  "status.success.foreground",
  "status.success.background",
  "status.warning.foreground",
  "status.warning.background",
  "status.danger.foreground",
  "status.danger.background",
  "status.info.foreground",
  "status.info.background",
  "overlay.scrim",
];

function isTokenIdSafe(id: string): boolean {
  return /^[a-z0-9][a-z0-9.-]*$/.test(id) && id.length >= 1 && id.length <= 80;
}

export function humanSemanticLabel(id: string): string {
  const words = id.replace(/[._]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** URL/token-safe dotted id from free text. Empty-safe ("!!!" → "custom.token"). */
export function slugifySemanticId(
  raw: string,
  category: SemanticCategory,
  existingIds: readonly string[],
): string {
  const slug =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "token";
  // Ids derive from the initial name/category: bare names are namespaced so
  // groups stay greppable and collisions across categories cannot happen.
  const base = slug.includes(".") ? slug.slice(0, 80) : `${category}.${slug}`.slice(0, 80);
  if (!existingIds.includes(base)) return base;
  let counter = 2;
  while (existingIds.includes(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

export interface TokenGroup {
  category: SemanticCategory;
  tokens: SemanticToken[];
}

/** Tokens grouped in canonical category order; customs always last. */
export function groupTokensByCategory(tokens: readonly SemanticToken[]): TokenGroup[] {
  const order = new Map<SemanticCategory, number>(
    SEMANTIC_CATEGORIES.map((category, index) => [category, index]),
  );
  const buckets = new Map<SemanticCategory, SemanticToken[]>();
  for (const token of tokens) {
    const category = isSemanticCategory(token.category) ? token.category : "custom";
    const bucket = buckets.get(category) ?? [];
    bucket.push(token);
    buckets.set(category, bucket);
  }
  return [...buckets.entries()]
    .sort((a, b) => (order.get(a[0]) ?? 99) - (order.get(b[0]) ?? 99))
    .map(([category, group]) => ({ category, tokens: group }));
}

function tokensOf(system: DesignSystemConfig): SemanticToken[] {
  return [...(system.semanticTokens ?? [])];
}

function withTokens(system: DesignSystemConfig, tokens: SemanticToken[]): DesignSystemConfig {
  return { ...system, semanticTokens: tokens.map((token) => ({ ...token })) };
}

function paletteShadeExists(system: DesignSystemConfig, value: string): boolean {
  const [paletteId, ...rest] = value.split(".");
  if (!paletteId || rest.length === 0) return false;
  const shade = rest.join(".");
  const palette = system.foundations?.colors?.palettes?.find((item) => item.id === paletteId);
  if (!palette) return false;
  return shade in (palette.shades ?? {});
}

function semanticTarget(system: DesignSystemConfig, value: string): SemanticToken | undefined {
  return system.semanticTokens?.find((token) => token.id === value);
}

export type ValueKind = "foundation" | "alias" | "raw";

export interface ValueClassification {
  kind: ValueKind;
  /** Human-readable explanation, e.g. "Palette shade brand.600". */
  detail: string;
}

/** Classify a value without resolving it: palette shade, semantic alias, or raw hex. Null when none match. */
export function classifyValue(system: DesignSystemConfig, value: string): ValueClassification | null {
  const text = value.trim();
  // Assign through a boolean: isHexColor is an `is string` guard, which would
  // otherwise narrow the string-typed `text` to never in the else branch.
  const isRawHex: boolean = isHexColor(text);
  if (isRawHex) return { kind: "raw", detail: `Raw fallback ${text}` };
  if (paletteShadeExists(system, text)) {
    const [paletteId] = text.split(".");
    return { kind: "foundation", detail: `Palette shade ${text} (${paletteId})` };
  }
  if (semanticTarget(system, text)) {
    return { kind: "alias", detail: `Semantic alias of ${text}` };
  }
  return null;
}

/**
 * True when assigning `value` to `tokenId` would create a direct or indirect
 * semantic cycle. Only semantic-id edges are followed; palette shades and
 * raw hex are terminals.
 */
export function wouldCreateCycle(
  system: DesignSystemConfig,
  tokenId: string,
  value: string,
): boolean {
  const edges = new Map<string, string>();
  for (const token of system.semanticTokens ?? []) {
    edges.set(token.id, token.id === tokenId ? value.trim() : token.value);
  }
  if (!edges.has(tokenId)) edges.set(tokenId, value.trim());
  let current: string | undefined = value.trim();
  const seen = new Set<string>([tokenId]);
  for (let depth = 0; depth < edges.size + 1; depth += 1) {
    if (current === undefined) return false;
    if (seen.has(current)) return true;
    const target = semanticTarget(system, current);
    if (!target) return false;
    seen.add(current);
    current = edges.get(current);
  }
  return true;
}

/** Human-readable reference chain, e.g. "action.primary.background → brand.600 → #635bff". */
export function formatChain(chain: readonly string[]): string {
  return chain.join(" → ");
}

export interface ReferenceCandidates {
  /** Palette-shade references, e.g. "brand.600". */
  foundations: string[];
  /** Semantic-token ids safe to alias (self and cyclic choices excluded). */
  aliases: string[];
}

/**
 * Safe picker contents: every palette shade plus every semantic id except
 * the edited token itself and any alias whose closure reaches back to it
 * (choosing those would create a cycle).
 */
export function validReferenceCandidates(
  system: DesignSystemConfig,
  excludeId?: string,
): ReferenceCandidates {
  const foundations: string[] = [];
  for (const palette of system.foundations?.colors?.palettes ?? []) {
    for (const shade of Object.keys(palette.shades ?? {}).sort()) {
      foundations.push(`${palette.id}.${shade}`);
    }
  }
  const aliases = (system.semanticTokens ?? [])
    .map((token) => token.id)
    .filter((id) => {
      if (excludeId && id === excludeId) return false;
      // Exclude aliases that already (transitively) reference the edited
      // token: aliasing them back would close a cycle.
      if (excludeId && reaches(system, id, excludeId)) return false;
      return true;
    });
  return { foundations, aliases };
}

/** True when following semantic edges from `from` reaches `target`. */
function reaches(system: DesignSystemConfig, from: string, target: string): boolean {
  let current: string | undefined = from;
  const seen = new Set<string>();
  for (let depth = 0; depth < (system.semanticTokens ?? []).length + 1; depth += 1) {
    if (current === undefined || seen.has(current)) return false;
    if (current === target) return true;
    seen.add(current);
    const token = semanticTarget(system, current);
    if (!token) return false;
    // Only semantic-id edges are followed; palette/hex terminals stop.
    current = semanticTarget(system, token.value) ? token.value : undefined;
  }
  return false;
}

export type ValidateValueResult =
  | { ok: true; kind: ValueKind; detail: string }
  | { ok: false; error: string };

/** Validate a proposed token value before saving. Never throws. */
export function validateTokenValue(
  system: DesignSystemConfig,
  value: string,
  excludeId?: string,
): ValidateValueResult {
  const text = value.trim();
  if (text === "") return { ok: false, error: "Enter a palette shade, a semantic alias, or a six-digit hex color." };
  if (excludeId && text === excludeId) {
    return { ok: false, error: "A token cannot reference itself. Choose a palette shade, another token, or a hex value." };
  }
  const classified = classifyValue(system, text);
  if (!classified) {
    return {
      ok: false,
      error: `"${text}" does not match a palette shade, a semantic token, or a six-digit hex color. Pick from the reference lists or fix the spelling.`,
    };
  }
  if (classified.kind === "alias" && excludeId && wouldCreateCycle(system, excludeId, text)) {
    const chain = resolveChainPreview(system, excludeId, text);
    return {
      ok: false,
      error: `That alias would create a circular reference (${chain}). Choose a value outside the cycle.`,
    };
  }
  return { ok: true, kind: classified.kind, detail: classified.detail };
}

/** Preview the chain a proposed alias would create (for cycle error copy). */
function resolveChainPreview(system: DesignSystemConfig, tokenId: string, value: string): string {
  const edges = new Map<string, string>();
  for (const token of system.semanticTokens ?? []) {
    edges.set(token.id, token.id === tokenId ? value.trim() : token.value);
  }
  if (!edges.has(tokenId)) edges.set(tokenId, value.trim());
  const chain = [tokenId];
  let current: string | undefined = value.trim();
  for (let depth = 0; depth < edges.size + 1 && current !== undefined; depth += 1) {
    chain.push(current);
    if (!semanticTarget(system, current)) break;
    current = edges.get(current);
    if (current !== undefined && chain.includes(current)) {
      chain.push(current);
      break;
    }
  }
  return formatChain(chain);
}

export interface CreateTokenInput {
  label: string;
  category: SemanticCategory;
  value: string;
  description?: string;
}

export type CreateTokenResult = { ok: true; token: SemanticToken } | { ok: false; error: string };

export function createSemanticToken(
  system: DesignSystemConfig,
  input: CreateTokenInput,
): CreateTokenResult {
  const label = input.label.trim().slice(0, 60);
  if (!label) return { ok: false, error: "Give the token a name." };
  if (!isSemanticCategory(input.category)) return { ok: false, error: "Choose a valid category." };
  const existing = (system.semanticTokens ?? []).map((token) => token.id);
  const id = slugifySemanticId(label, input.category, existing);
  if (!isTokenIdSafe(id)) {
    return { ok: false, error: "That token id is not URL-safe. Use lowercase letters, numbers, dots, and dashes." };
  }
  const checked = validateTokenValue(system, input.value);
  if (!checked.ok) return { ok: false, error: checked.error };
  const description = (input.description ?? "").trim().slice(0, 140);
  return {
    ok: true,
    token: {
      id,
      label,
      category: input.category,
      value: input.value.trim(),
      ...(description ? { description } : {}),
    },
  };
}

export function insertSemanticToken(system: DesignSystemConfig, token: SemanticToken): DesignSystemConfig {
  const next = tokensOf(system).filter((entry) => entry.id !== token.id);
  next.push({ ...token });
  return withTokens(system, next);
}

export type SemanticMutation = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

/** Label changes never touch the stable id, so references keep working. */
export function updateTokenLabel(system: DesignSystemConfig, id: string, label: string): DesignSystemConfig {
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) return system;
  return withTokens(
    system,
    tokensOf(system).map((token) => (token.id === id ? { ...token, label: trimmed } : token)),
  );
}

export function updateTokenCategory(
  system: DesignSystemConfig,
  id: string,
  category: SemanticCategory,
): DesignSystemConfig {
  if (!isSemanticCategory(category)) return system;
  return withTokens(
    system,
    tokensOf(system).map((token) => (token.id === id ? { ...token, category } : token)),
  );
}

export function updateTokenValue(system: DesignSystemConfig, id: string, value: string): SemanticMutation {
  if (!tokensOf(system).some((token) => token.id === id)) {
    return { ok: false, error: "That token no longer exists." };
  }
  const checked = validateTokenValue(system, value, id);
  if (!checked.ok) return { ok: false, error: checked.error };
  return {
    ok: true,
    system: withTokens(
      system,
      tokensOf(system).map((token) => (token.id === id ? { ...token, value: value.trim() } : token)),
    ),
  };
}

export function updateTokenDescription(system: DesignSystemConfig, id: string, description: string): DesignSystemConfig {
  const trimmed = description.trim().slice(0, 140);
  return withTokens(
    system,
    tokensOf(system).map((token) => {
      if (token.id !== id) return token;
      if (trimmed === "") {
        const { description: _removed, ...rest } = token;
        void _removed;
        return rest;
      }
      return { ...token, description: trimmed };
    }),
  );
}

/** Independent copy with a unique id; values are cloned, never shared by reference. */
export function duplicateSemanticToken(system: DesignSystemConfig, id: string): SemanticToken | null {
  const source = tokensOf(system).find((token) => token.id === id);
  if (!source) return null;
  const existing = tokensOf(system).map((token) => token.id);
  const base = `${source.id}-copy`.slice(0, 80);
  let next = base;
  let counter = 2;
  while (existing.includes(next)) {
    next = `${base}-${counter}`.slice(0, 80);
    counter += 1;
  }
  return { ...source, id: next, label: `${source.label} copy`.slice(0, 60) };
}

export interface SemanticReference {
  kind: "semantic" | "theme" | "component" | "foundation";
  /** Human-readable pointer, e.g. `theme.dark.text.primary` or `border.border.default`. */
  pointer: string;
  value: string;
}

/**
 * Every stored value that references a semantic token id by exact match:
 * other semantic tokens, theme overrides, component overrides, and
 * foundation values that support semantic references (border colors, shadow
 * layer colors, icon color roles).
 */
export function findTokenReferences(system: DesignSystemConfig, id: string): SemanticReference[] {
  const references: SemanticReference[] = [];
  const seen = new Set<string>();
  const push = (reference: SemanticReference): void => {
    const key = `${reference.kind}:${reference.pointer}`;
    if (seen.has(key)) return;
    seen.add(key);
    references.push(reference);
  };
  for (const token of system.semanticTokens ?? []) {
    if (token.value === id) push({ kind: "semantic", pointer: token.id, value: token.value });
  }
  for (const theme of system.themes ?? []) {
    for (const [key, value] of Object.entries(theme.overrides ?? {})) {
      if (value === id) {
        push({ kind: "theme", pointer: `${theme.label || theme.id}.${key}`, value });
      }
    }
  }
  for (const component of system.components ?? []) {
    for (const override of component.overrides ?? []) {
      if (override.value === id) {
        const name = component.label || component.component;
        const slot = [override.token, override.variant, override.state].filter(Boolean).join(".");
        push({ kind: "component", pointer: `${name}.${slot}`, value: override.value });
      }
    }
  }
  for (const token of system.foundations?.borders?.tokens ?? []) {
    if (token.color === id) push({ kind: "foundation", pointer: `border.${token.id}`, value: token.color });
  }
  for (const token of system.foundations?.shadows?.tokens ?? []) {
    (token.layers ?? []).forEach((layer, index) => {
      if (layer.color === id) {
        push({ kind: "foundation", pointer: `shadow.${token.id}.layers[${index}]`, value: layer.color });
      }
    });
  }
  for (const [role, value] of Object.entries(system.foundations?.icons?.colors ?? {})) {
    if (value === id) push({ kind: "foundation", pointer: `icons.${role}`, value });
  }
  return references;
}

export type SemanticDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: SemanticReference[] };

export function canDeleteSemanticToken(system: DesignSystemConfig, id: string): SemanticDeleteGuard {
  if (!tokensOf(system).some((token) => token.id === id)) {
    return { ok: false, reasons: ["That token no longer exists."], references: [] };
  }
  if ((REQUIRED_SEMANTIC_IDS as readonly string[]).includes(id)) {
    return {
      ok: false,
      reasons: [
        `"${id}" is a required baseline token that themes and component defaults rely on. It cannot be deleted in this phase; edit its value instead. A future destructive workflow may allow removal.`,
      ],
      references: [],
    };
  }
  const references = findTokenReferences(system, id);
  if (references.length > 0) {
    const names = references.slice(0, 4).map((reference) => reference.pointer);
    const more = references.length > 4 ? ` and ${references.length - 4} more` : "";
    return {
      ok: false,
      reasons: [
        `"${id}" is used by ${references.length} reference${references.length === 1 ? "" : "s"} (${names.join(", ")}${more}). Remove or repoint those references first.`,
      ],
      references,
    };
  }
  return { ok: true };
}

export function removeSemanticToken(system: DesignSystemConfig, id: string): DesignSystemConfig {
  return withTokens(
    system,
    tokensOf(system).filter((token) => token.id !== id),
  );
}

/** Fresh starter system used for resets and missing-default comparisons (never saved). */
export function starterSemanticReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one token (value, label, category, description) to its starter default. Null for custom tokens. */
export function resetTokenToStarter(system: DesignSystemConfig, id: string): DesignSystemConfig | null {
  const baseline = starterSemanticReference(system).semanticTokens.find((token) => token.id === id);
  if (!baseline) return null;
  if (!tokensOf(system).some((token) => token.id === id)) return null;
  return withTokens(
    system,
    tokensOf(system).map((token) => (token.id === id ? { ...baseline } : token)),
  );
}

/** Baseline ids absent from the system (older/minimal systems). */
export function missingStandardTokens(system: DesignSystemConfig): string[] {
  const known = new Set(tokensOf(system).map((token) => token.id));
  return (REQUIRED_SEMANTIC_IDS as readonly string[]).filter((id) => !known.has(id));
}

function paletteRoleExists(system: DesignSystemConfig, role: string): boolean {
  return (system.foundations?.colors?.palettes ?? []).some((palette) => palette.id === role);
}

/**
 * Starter-consistent default value for a baseline id: palette references
 * wherever the system's foundations provide them, otherwise the raw domain
 * default. Mirrors starters.ts wiring (status roles, brand-aware actions).
 */
export function baselineValueFor(system: DesignSystemConfig, id: string): string {
  const branded = paletteRoleExists(system, "brand");
  const actionBackground = branded ? "brand.600" : "neutral.900";
  const hover = branded ? "brand.700" : "neutral.800";
  const statusMatch = /^(status)\.(success|warning|danger|info)\.(foreground|background)$/.exec(id);
  if (statusMatch) {
    const role = statusMatch[2]!;
    const kind = statusMatch[3]!;
    if (paletteRoleExists(system, role)) {
      // Dark-led starters read better from softer/darker steps; the 400/950
      // steps exist on every generated palette.
      if (system.starter?.presetId === "dark-first") {
        return `${role}.${kind === "foreground" ? "400" : "950"}`;
      }
      return `${role}.${kind === "foreground" ? "600" : "100"}`;
    }
  }
  const overrides: Record<string, string> = {
    "action.primary.background": actionBackground,
    "action.primary.hover": hover,
    "focus.ring": actionBackground,
  };
  if (id in overrides) return overrides[id]!;
  const fallback = defaultSemanticTokens(actionBackground).find((token) => token.id === id);
  return fallback?.value ?? "neutral.500";
}

/**
 * Add only absent baseline tokens; existing custom and edited values are
 * never touched. Returns the updated system plus the added ids.
 */
export function addMissingDefaults(system: DesignSystemConfig): { system: DesignSystemConfig; added: string[] } {
  const missing = missingStandardTokens(system);
  if (missing.length === 0) return { system, added: [] };
  const baseline = new Map(
    defaultSemanticTokens(paletteRoleExists(system, "brand") ? "brand.600" : "neutral.900").map((token) => [token.id, token]),
  );
  const additions: SemanticToken[] = [];
  for (const id of missing) {
    const template = baseline.get(id);
    if (!template) continue;
    additions.push({ ...template, value: baselineValueFor(system, id) });
  }
  return {
    system: withTokens(system, [...tokensOf(system), ...additions]),
    added: additions.map((token) => token.id),
  };
}

/** Semantic-relevant validator issues for the current system. */
export function semanticIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("semanticTokens"));
}

/** Usage/reference count for badges and picker hints. */
export function usageCount(system: DesignSystemConfig, id: string): number {
  return findTokenReferences(system, id).length;
}
