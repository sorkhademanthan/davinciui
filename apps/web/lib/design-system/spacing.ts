// Spacing & sizing editing logic for the Spacing foundation editor (Step 7A).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `ScaleToken` shape ({ id, value }) directly; no parallel model. Token ids
// are stable references: visible labels derive from ids, so renaming can
// never silently break a reference.

import {
  validateDesignSystem,
  type DesignSystemConfig,
  type ScaleToken,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export type ScaleKind = "spacing" | "sizing";

export const SPACING_UNITS = ["px", "rem"] as const;
export type SpacingUnit = (typeof SPACING_UNITS)[number];

export interface ParsedLength {
  amount: number;
  unit: SpacingUnit;
}

/**
 * Parse a length value. Accepts "16px", "1.5rem", or bare "16" (→ px).
 * Rejects negatives, zero units other than px/rem, and non-numeric input.
 */
export function parseLength(value: unknown): ParsedLength | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) return boundedLength(Number.parseFloat(bare[1]!), "px");
  const match = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(text);
  if (!match) return null;
  return boundedLength(Number.parseFloat(match[1]!), match[2]! as SpacingUnit);
}

function boundedLength(amount: number, unit: SpacingUnit): ParsedLength | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "px" && amount > 4096) return null;
  if (unit === "rem" && amount > 256) return null;
  return { amount: Math.round(amount * 100) / 100, unit };
}

/** Canonical serialization: "16px", "1.5rem" (no trailing zeros). */
export function formatLength(parsed: ParsedLength): string {
  return `${parsed.amount}${parsed.unit}`;
}

/** Pixel value for previews/bars. rem resolves against a 16px root. */
export function pxOf(token: ScaleToken, rootPx = 16): number | null {
  const parsed = parseLength(token.value);
  if (!parsed) return null;
  return parsed.unit === "px" ? parsed.amount : parsed.amount * rootPx;
}

/** Human-readable label derived from a stable id ("control-md" → "Control md"). */
export function humanLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** URL/token-safe id from free text. Empty-safe ("!!!" → "token"). */
export function slugifyTokenId(raw: string, existingIds: readonly string[]): string {
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

/** Every spacing + sizing id in one list (references are not namespaced). */
export function allTokenIds(system: DesignSystemConfig): string[] {
  return [
    ...(system.foundations.spacing?.scale ?? []).map((token) => token.id),
    ...(system.foundations.sizing?.tokens ?? []).map((token) => token.id),
  ];
}

function scaleOf(system: DesignSystemConfig, kind: ScaleKind): ScaleToken[] {
  return kind === "spacing"
    ? [...(system.foundations.spacing?.scale ?? [])]
    : [...(system.foundations.sizing?.tokens ?? [])];
}

function withScale(system: DesignSystemConfig, kind: ScaleKind, tokens: ScaleToken[]): DesignSystemConfig {
  if (kind === "spacing") {
    return {
      ...system,
      foundations: { ...system.foundations, spacing: { ...system.foundations.spacing, scale: tokens } },
    };
  }
  return {
    ...system,
    foundations: {
      ...system.foundations,
      sizing: { ...(system.foundations.sizing ?? { tokens: [] }), tokens },
    },
  };
}

export interface CreateTokenInput {
  /** Optional explicit id; otherwise derived from label. */
  id?: string;
  /** Visible name; used to derive the id when id is omitted. */
  label?: string;
  amount: number;
  unit: SpacingUnit;
}

export type CreateTokenResult = { ok: true; token: ScaleToken } | { ok: false; error: string };

export function createToken(
  kind: ScaleKind,
  input: CreateTokenInput,
  system: DesignSystemConfig,
): CreateTokenResult {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    return { ok: false, error: "Enter a value of 0 or more." };
  }
  if (!SPACING_UNITS.includes(input.unit)) {
    return { ok: false, error: "Use px or rem." };
  }
  const existing = allTokenIds(system);
  const label = (input.label ?? "").trim();
  const requested = (input.id ?? "").trim();
  let id: string;
  if (requested) {
    const slug = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (!isTokenIdSafe(slug)) {
      return { ok: false, error: "That token id is not URL-safe. Use lowercase letters, numbers, and dashes." };
    }
    if (existing.includes(slug)) {
      return { ok: false, error: `Token id "${slug}" is already in use.` };
    }
    id = slug;
  } else {
    if (!label) return { ok: false, error: "Give the token a name." };
    id = slugifyTokenId(label, existing);
  }
  const parsed = boundedLength(input.amount, input.unit);
  if (!parsed) return { ok: false, error: "Enter a value of 0 or more (max 4096px / 256rem)." };
  return { ok: true, token: { id, value: formatLength(parsed) } };
}

/** Change one token's value; nothing else moves. */
export function updateTokenValue(
  system: DesignSystemConfig,
  kind: ScaleKind,
  tokenId: string,
  amount: number,
  unit: SpacingUnit,
): DesignSystemConfig {
  const parsed = boundedLength(amount, unit);
  if (!parsed) return system;
  return withScale(
    system,
    kind,
    scaleOf(system, kind).map((token) => (token.id === tokenId ? { ...token, value: formatLength(parsed) } : token)),
  );
}

/** Remove one token (guard with canDeleteToken first). */
export function removeToken(system: DesignSystemConfig, kind: ScaleKind, tokenId: string): DesignSystemConfig {
  return withScale(
    system,
    kind,
    scaleOf(system, kind).filter((token) => token.id !== tokenId),
  );
}

/** Move a token within its own scale display order; ids/references unchanged. */
export function moveToken(
  system: DesignSystemConfig,
  kind: ScaleKind,
  tokenId: string,
  direction: -1 | 1,
): DesignSystemConfig {
  const tokens = scaleOf(system, kind);
  const index = tokens.findIndex((token) => token.id === tokenId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= tokens.length) return system;
  const next = [...tokens];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved!);
  return withScale(system, kind, next);
}

export interface TokenReference {
  kind: "semantic" | "theme" | "component";
  /** Human-readable pointer, e.g. `component.button.padding-inline`. */
  pointer: string;
  value: string;
}

/**
 * Find every stored value that references a spacing/sizing token id by exact
 * match. Ids carry no sub-paths, so prefix matching (as with palettes) does
 * not apply — only exact equality counts as a reference.
 */
export function findTokenReferences(system: DesignSystemConfig, tokenId: string): TokenReference[] {
  const references: TokenReference[] = [];
  const seen = new Set<string>();
  const push = (reference: TokenReference): void => {
    const key = `${reference.kind}:${reference.pointer}`;
    if (seen.has(key)) return;
    seen.add(key);
    references.push(reference);
  };
  for (const token of system.semanticTokens ?? []) {
    if (token.value === tokenId) push({ kind: "semantic", pointer: token.id, value: token.value });
  }
  for (const theme of system.themes ?? []) {
    for (const [key, value] of Object.entries(theme.overrides ?? {})) {
      if (value === tokenId) {
        push({ kind: "theme", pointer: `${theme.label || theme.id}.${key}`, value });
      }
    }
  }
  for (const component of system.components ?? []) {
    for (const override of component.overrides ?? []) {
      if (override.value === tokenId) {
        const name = component.label || component.component;
        const slot = [override.token, override.variant, override.state].filter(Boolean).join(".");
        push({ kind: "component", pointer: `${name}.${slot}`, value: override.value });
      }
    }
  }
  return references;
}

export type DeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: TokenReference[] };

/** Never the last token of a scale, never a referenced token. */
export function canDeleteToken(system: DesignSystemConfig, kind: ScaleKind, tokenId: string): DeleteGuard {
  const tokens = scaleOf(system, kind);
  if (!tokens.some((token) => token.id === tokenId)) {
    return { ok: false, reasons: ["That token no longer exists."], references: [] };
  }
  if (tokens.length <= 1) {
    return {
      ok: false,
      reasons: ["This is the last token in the scale. A scale needs at least one token to stay valid."],
      references: [],
    };
  }
  const references = findTokenReferences(system, tokenId);
  if (references.length > 0) {
    const names = references.slice(0, 4).map((reference) => reference.pointer);
    const more = references.length > 4 ? ` and ${references.length - 4} more` : "";
    return {
      ok: false,
      reasons: [
        `${tokenId} is used by ${references.length} token${references.length === 1 ? "" : "s"} (${names.join(", ")}${more}) and cannot be deleted.`,
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
export function starterReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one token to its starter value; null when the starter has no such id. */
export function resetTokenToStarter(
  system: DesignSystemConfig,
  kind: ScaleKind,
  tokenId: string,
): DesignSystemConfig | null {
  const starter = kind === "spacing"
    ? starterReference(system).foundations.spacing.scale
    : (starterReference(system).foundations.sizing?.tokens ?? []);
  const baseline = starter.find((token) => token.id === tokenId);
  if (!baseline) return null;
  return withScale(
    system,
    kind,
    scaleOf(system, kind).map((token) => (token.id === tokenId ? { ...token, value: baseline.value } : token)),
  );
}

/** Restore a full scale (and spacing base) to the selected starter default. */
export function restoreStarterScale(system: DesignSystemConfig, kind: ScaleKind): DesignSystemConfig {
  const starter = starterReference(system);
  if (kind === "spacing") {
    return {
      ...system,
      foundations: { ...system.foundations, spacing: { ...starter.foundations.spacing } },
    };
  }
  return withScale(system, kind, [...(starter.foundations.sizing?.tokens ?? [])]);
}

export interface SpacingPreset {
  id: string;
  label: string;
  description: string;
  base: number;
  scale: ScaleToken[];
}

function presetScale(entries: Array<[string, number]>): ScaleToken[] {
  return entries.map(([id, px]) => ({ id, value: `${px}px` }));
}

/** Optional starting scales. Applying one replaces the scale wholesale. */
export const SPACING_PRESETS: SpacingPreset[] = [
  {
    id: "compact",
    label: "Compact product scale",
    description: "Tight 2px-base rhythm for dense, data-heavy interfaces.",
    base: 2,
    scale: presetScale([
      ["space-0", 0], ["space-1", 2], ["space-2", 4], ["space-3", 6], ["space-4", 8],
      ["space-5", 12], ["space-6", 16], ["space-8", 24], ["space-10", 32], ["space-12", 48],
    ]),
  },
  {
    id: "comfortable",
    label: "Comfortable 4px scale",
    description: "Balanced 4px-base rhythm for general product UI.",
    base: 4,
    scale: presetScale([
      ["space-0", 0], ["space-1", 4], ["space-2", 8], ["space-3", 12], ["space-4", 16],
      ["space-5", 20], ["space-6", 24], ["space-8", 32], ["space-10", 40], ["space-12", 48],
    ]),
  },
  {
    id: "spacious",
    label: "Spacious 8px scale",
    description: "Roomy 8px-base rhythm for marketing and editorial surfaces.",
    base: 8,
    scale: presetScale([
      ["space-0", 0], ["space-1", 8], ["space-2", 16], ["space-3", 24], ["space-4", 32],
      ["space-5", 40], ["space-6", 48], ["space-8", 64], ["space-10", 80], ["space-12", 96],
    ]),
  },
];

/** Replace the spacing scale (and base) with a preset scale. */
export function applySpacingPreset(system: DesignSystemConfig, preset: SpacingPreset): DesignSystemConfig {
  return {
    ...system,
    foundations: {
      ...system.foundations,
      spacing: { base: preset.base, scale: preset.scale.map((token) => ({ ...token })) },
    },
  };
}

export interface ScaleDiff {
  added: ScaleToken[];
  removed: ScaleToken[];
  changed: Array<{ id: string; from: string; to: string }>;
}

/** Before/after summary between two scales (preset preview, confirm copy). */
export function diffScales(current: ScaleToken[], next: ScaleToken[]): ScaleDiff {
  const currentById = new Map(current.map((token) => [token.id, token.value]));
  const nextById = new Map(next.map((token) => [token.id, token.value]));
  const added = next.filter((token) => !currentById.has(token.id));
  const removed = current.filter((token) => !nextById.has(token.id));
  const changed: ScaleDiff["changed"] = [];
  for (const token of next) {
    const from = currentById.get(token.id);
    if (from !== undefined && from !== token.value) changed.push({ id: token.id, from, to: token.value });
  }
  return { added, removed, changed };
}

/** True when the scale differs from the selected starter default in any way. */
export function hasCustomScaleEdits(system: DesignSystemConfig, kind: ScaleKind): boolean {
  const starter = starterReference(system);
  const baseline = kind === "spacing" ? starter.foundations.spacing.scale : (starter.foundations.sizing?.tokens ?? []);
  const diff = diffScales(baseline, scaleOf(system, kind));
  if (kind === "spacing" && starter.foundations.spacing.base !== system.foundations.spacing.base) return true;
  return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
}

/** First available token value (px) from a preference list; null when none resolve. */
export function firstAvailablePx(
  system: DesignSystemConfig,
  kind: ScaleKind,
  ids: string[],
  rootPx = 16,
): { id: string; px: number } | null {
  const tokens = scaleOf(system, kind);
  for (const id of ids) {
    const token = tokens.find((entry) => entry.id === id);
    if (!token) continue;
    const parsed = parseLength(token.value);
    if (!parsed) continue;
    return { id, px: parsed.unit === "px" ? parsed.amount : parsed.amount * rootPx };
  }
  return null;
}

/** Spacing/sizing-relevant validator issues for the current system. */
export function scaleIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter(
    (issue) => issue.path.includes("foundations.spacing") || issue.path.includes("foundations.sizing"),
  );
}
