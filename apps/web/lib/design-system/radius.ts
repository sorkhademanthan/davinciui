// Radius editing logic for the Radius foundation editor (Step 7B).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `RadiusToken` shape ({ id, label, value }) directly; no parallel model.
// Token ids are stable references; labels are stored per token, so renaming
// a label never affects references.

import {
  defaultRadius,
  validateDesignSystem,
  type DesignSystemConfig,
  type RadiusToken,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export const RADIUS_UNITS = ["px", "rem", "%"] as const;
export type RadiusUnit = (typeof RADIUS_UNITS)[number];

/** Display order for well-known ids; unknown ids sort after, alphabetically. */
const WELL_KNOWN_ORDER = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"];

export interface ParsedRadius {
  amount: number;
  unit: RadiusUnit;
}

/**
 * Parse a radius value. Accepts "12px", "1.5rem", "50%", or bare "12" (→ px).
 * Rejects negatives, unknown units, and non-numeric input. `full` stays the
 * intentional pill value "9999px" — never an accidental number.
 */
export function parseRadiusValue(value: unknown): ParsedRadius | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) return boundedRadius(Number.parseFloat(bare[1]!), "px");
  const match = /^(\d+(?:\.\d+)?)(px|rem|%)$/.exec(text);
  if (!match) return null;
  return boundedRadius(Number.parseFloat(match[1]!), match[2]! as RadiusUnit);
}

function boundedRadius(amount: number, unit: RadiusUnit): ParsedRadius | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  // 9999px is the intentional pill ceiling used by the canonical `full` token.
  if (unit === "px" && amount > 9999) return null;
  if (unit === "rem" && amount > 256) return null;
  if (unit === "%" && amount > 100) return null;
  return { amount: Math.round(amount * 100) / 100, unit };
}

/** Canonical serialization: "12px", "9999px" (no trailing zeros). */
export function formatRadiusValue(parsed: ParsedRadius): string {
  return `${parsed.amount}${parsed.unit}`;
}

/** Suggested display label for a new token id ("my-shape" → "My shape"). */
export function humanRadiusLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** URL/token-safe id from free text. Empty-safe ("!!!" → "token"). */
export function slugifyRadiusId(raw: string, existingIds: readonly string[]): string {
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

function tokenIds(scale: RadiusToken[]): string[] {
  return scale.map((token) => token.id);
}

/**
 * Normalize any stored radius scale into an ordered token list:
 * legacy pre-7B Record shapes map onto the well-known order (unknown keys
 * appended alphabetically), missing/invalid scales fall back to an 8px
 * default. Never throws; never returns an empty list.
 */
export function ensureRadiusScale(scale: unknown, fallbackBase = 8): RadiusToken[] {
  const clean = (token: unknown): RadiusToken | null => {
    if (typeof token !== "object" || token === null) return null;
    const entry = token as { id?: unknown; label?: unknown; value?: unknown };
    if (typeof entry.id !== "string" || !isTokenIdSafe(entry.id)) return null;
    if (typeof entry.value !== "string" || entry.value.trim() === "") return null;
    const label = typeof entry.label === "string" && entry.label.trim() !== "" ? entry.label.trim().slice(0, 60) : humanRadiusLabel(entry.id);
    return { id: entry.id, label, value: entry.value.trim() };
  };
  if (Array.isArray(scale)) {
    const tokens = scale.map(clean).filter((token): token is RadiusToken => token !== null);
    const seen = new Set<string>();
    const unique = tokens.filter((token) => {
      if (seen.has(token.id)) return false;
      seen.add(token.id);
      return true;
    });
    if (unique.length > 0) return unique;
  } else if (typeof scale === "object" && scale !== null) {
    // Legacy Record shape: preserve values, impose well-known order.
    const record = scale as Record<string, unknown>;
    const known = WELL_KNOWN_ORDER.filter((id) => typeof record[id] === "string" && (record[id] as string).trim() !== "").map(
      (id) => ({ id, label: humanRadiusLabel(id), value: (record[id] as string).trim() }),
    );
    const extra = Object.keys(record)
      .filter((id) => !WELL_KNOWN_ORDER.includes(id) && isTokenIdSafe(id) && typeof record[id] === "string" && (record[id] as string).trim() !== "")
      .sort()
      .map((id) => ({ id, label: humanRadiusLabel(id), value: (record[id] as string).trim() }));
    if (known.length > 0 || extra.length > 0) return [...known, ...extra];
  }
  return defaultRadius(fallbackBase).scale.map((token) => ({ ...token }));
}

function scaleOf(system: DesignSystemConfig): RadiusToken[] {
  return ensureRadiusScale(system.foundations.radius?.scale, system.foundations.radius?.base ?? 8);
}

function withScale(system: DesignSystemConfig, scale: RadiusToken[]): DesignSystemConfig {
  return {
    ...system,
    foundations: { ...system.foundations, radius: { ...system.foundations.radius, scale } },
  };
}

export interface CreateRadiusTokenInput {
  /** Optional explicit id; otherwise derived from the label. */
  id?: string;
  /** Visible label; used to derive the id when id is omitted. */
  label?: string;
  amount: number;
  unit: RadiusUnit;
}

export type CreateRadiusTokenResult = { ok: true; token: RadiusToken } | { ok: false; error: string };

export function createRadiusToken(
  input: CreateRadiusTokenInput,
  existingIds: readonly string[],
): CreateRadiusTokenResult {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    return { ok: false, error: "Enter a value of 0 or more." };
  }
  if (!RADIUS_UNITS.includes(input.unit)) {
    return { ok: false, error: "Use px, rem, or %." };
  }
  const label = (input.label ?? "").trim().slice(0, 60);
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
    id = slugifyRadiusId(label, existingIds);
  }
  const parsed = boundedRadius(input.amount, input.unit);
  if (!parsed) return { ok: false, error: "Enter a value of 0 or more (max 9999px / 256rem / 100%)." };
  return { ok: true, token: { id, label: label || humanRadiusLabel(id), value: formatRadiusValue(parsed) } };
}

/** Change one token's value; nothing else moves. */
export function updateRadiusValue(
  system: DesignSystemConfig,
  tokenId: string,
  amount: number,
  unit: RadiusUnit,
): DesignSystemConfig {
  const parsed = boundedRadius(amount, unit);
  if (!parsed) return system;
  return withScale(
    system,
    scaleOf(system).map((token) => (token.id === tokenId ? { ...token, value: formatRadiusValue(parsed) } : token)),
  );
}

/** Rename a token's visible label; the stable id never changes. */
export function updateRadiusLabel(system: DesignSystemConfig, tokenId: string, label: string): DesignSystemConfig {
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) return system;
  return withScale(
    system,
    scaleOf(system).map((token) => (token.id === tokenId ? { ...token, label: trimmed } : token)),
  );
}

/** Remove one token (guard with canDeleteRadiusToken first). */
export function removeRadiusToken(system: DesignSystemConfig, tokenId: string): DesignSystemConfig {
  return withScale(
    system,
    scaleOf(system).filter((token) => token.id !== tokenId),
  );
}

/** Move a token within display order; ids/references unchanged. */
export function moveRadiusToken(system: DesignSystemConfig, tokenId: string, direction: -1 | 1): DesignSystemConfig {
  const tokens = scaleOf(system);
  const index = tokens.findIndex((token) => token.id === tokenId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= tokens.length) return system;
  const next = [...tokens];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved!);
  return withScale(system, next);
}

export interface RadiusReference {
  kind: "semantic" | "theme" | "component";
  /** Human-readable pointer, e.g. `component.card.radius`. */
  pointer: string;
  value: string;
}

/**
 * Find every stored value that references a radius token id by exact match.
 * Ids carry no sub-paths, so only exact equality counts as a reference.
 */
export function findRadiusReferences(system: DesignSystemConfig, tokenId: string): RadiusReference[] {
  const references: RadiusReference[] = [];
  const seen = new Set<string>();
  const push = (reference: RadiusReference): void => {
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

export type DeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: RadiusReference[] };

/** Never the last usable token, never a referenced token. */
export function canDeleteRadiusToken(system: DesignSystemConfig, tokenId: string): DeleteGuard {
  const tokens = scaleOf(system);
  if (!tokens.some((token) => token.id === tokenId)) {
    return { ok: false, reasons: ["That token no longer exists."], references: [] };
  }
  if (tokens.length <= 1) {
    return {
      ok: false,
      reasons: ["This is the last radius token. A scale needs at least one token to stay valid."],
      references: [],
    };
  }
  const references = findRadiusReferences(system, tokenId);
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
export function starterRadiusReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one token to its starter value; null when the starter has no such id. */
export function resetRadiusTokenToStarter(system: DesignSystemConfig, tokenId: string): DesignSystemConfig | null {
  const baseline = ensureRadiusScale(starterRadiusReference(system).foundations.radius?.scale).find(
    (token) => token.id === tokenId,
  );
  if (!baseline) return null;
  return withScale(
    system,
    scaleOf(system).map((token) =>
      token.id === tokenId ? { ...token, value: baseline.value, label: baseline.label } : token,
    ),
  );
}

/** Restore a full scale (and base) to the selected starter default. */
export function restoreStarterRadius(system: DesignSystemConfig): DesignSystemConfig {
  const starter = starterRadiusReference(system);
  return {
    ...system,
    foundations: {
      ...system.foundations,
      radius: {
        base: starter.foundations.radius.base,
        scale: ensureRadiusScale(starter.foundations.radius?.scale).map((token) => ({ ...token })),
      },
    },
  };
}

export interface RadiusPreset {
  id: string;
  label: string;
  description: string;
  base: number;
  scale: RadiusToken[];
}

function presetScale(entries: Array<[string, string, string]>): RadiusToken[] {
  return entries.map(([id, label, value]) => ({ id, label, value }));
}

/** Optional starting shapes. Applying one replaces the scale wholesale. */
export const RADIUS_PRESETS: RadiusPreset[] = [
  {
    id: "square",
    label: "Square",
    description: "Sharp, technical corners for dense tooling.",
    base: 0,
    scale: presetScale([
      ["none", "None", "0px"],
      ["xs", "X-Small", "0px"],
      ["sm", "Small", "0px"],
      ["md", "Medium", "0px"],
      ["lg", "Large", "0px"],
      ["xl", "X-Large", "0px"],
      ["2xl", "2X-Large", "0px"],
      ["full", "Full (pill)", "9999px"],
    ]),
  },
  {
    id: "subtle",
    label: "Subtle",
    description: "Barely-there rounding for data-heavy interfaces.",
    base: 4,
    scale: presetScale([
      ["none", "None", "0px"],
      ["xs", "X-Small", "2px"],
      ["sm", "Small", "4px"],
      ["md", "Medium", "6px"],
      ["lg", "Large", "8px"],
      ["xl", "X-Large", "12px"],
      ["2xl", "2X-Large", "16px"],
      ["full", "Full (pill)", "9999px"],
    ]),
  },
  {
    id: "soft",
    label: "Soft",
    description: "Friendly everyday rounding for product UI.",
    base: 8,
    scale: presetScale([
      ["none", "None", "0px"],
      ["xs", "X-Small", "4px"],
      ["sm", "Small", "8px"],
      ["md", "Medium", "12px"],
      ["lg", "Large", "16px"],
      ["xl", "X-Large", "24px"],
      ["2xl", "2X-Large", "32px"],
      ["full", "Full (pill)", "9999px"],
    ]),
  },
  {
    id: "rounded",
    label: "Rounded",
    description: "Generous curves for expressive, consumer surfaces.",
    base: 12,
    scale: presetScale([
      ["none", "None", "0px"],
      ["xs", "X-Small", "6px"],
      ["sm", "Small", "10px"],
      ["md", "Medium", "16px"],
      ["lg", "Large", "24px"],
      ["xl", "X-Large", "32px"],
      ["2xl", "2X-Large", "48px"],
      ["full", "Full (pill)", "9999px"],
    ]),
  },
  {
    id: "pill-forward",
    label: "Pill-forward",
    description: "Fully rounded controls, cards, and dialogs.",
    base: 16,
    scale: presetScale([
      ["none", "None", "0px"],
      ["xs", "X-Small", "8px"],
      ["sm", "Small", "16px"],
      ["md", "Medium", "9999px"],
      ["lg", "Large", "9999px"],
      ["xl", "X-Large", "9999px"],
      ["2xl", "2X-Large", "9999px"],
      ["full", "Full (pill)", "9999px"],
    ]),
  },
];

/** Replace the radius scale (and base) with a preset scale. */
export function applyRadiusPreset(system: DesignSystemConfig, preset: RadiusPreset): DesignSystemConfig {
  return {
    ...system,
    foundations: {
      ...system.foundations,
      radius: { base: preset.base, scale: preset.scale.map((token) => ({ ...token })) },
    },
  };
}

export interface RadiusDiff {
  added: RadiusToken[];
  removed: RadiusToken[];
  changed: Array<{ id: string; from: string; to: string }>;
}

/** Before/after summary between two scales (preset preview, confirm copy). */
export function diffRadiusScales(current: RadiusToken[], next: RadiusToken[]): RadiusDiff {
  const currentById = new Map(current.map((token) => [token.id, token]));
  const nextById = new Map(next.map((token) => [token.id, token]));
  const added = next.filter((token) => !currentById.has(token.id));
  const removed = current.filter((token) => !nextById.has(token.id));
  const changed: RadiusDiff["changed"] = [];
  for (const token of next) {
    const from = currentById.get(token.id);
    if (from !== undefined && (from.value !== token.value || from.label !== token.label)) {
      changed.push({ id: token.id, from: `${from.label}: ${from.value}`, to: `${token.label}: ${token.value}` });
    }
  }
  return { added, removed, changed };
}

/** True when the scale differs from the selected starter default in any way. */
export function hasCustomRadiusEdits(system: DesignSystemConfig): boolean {
  const starter = starterRadiusReference(system);
  const baseline = ensureRadiusScale(starter.foundations.radius?.scale);
  const diff = diffRadiusScales(baseline, scaleOf(system));
  if (starter.foundations.radius.base !== system.foundations.radius.base) return true;
  return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
}

/** CSS radius value for a token id; null when missing or unparsable. */
export function radiusValueFor(system: DesignSystemConfig, id: string): string | null {
  const token = scaleOf(system).find((entry) => entry.id === id);
  if (!token) return null;
  const parsed = parseRadiusValue(token.value);
  if (!parsed) return null;
  return formatRadiusValue(parsed);
}

/** Radius-relevant validator issues for the current system. */
export function radiusIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("foundations.radius"));
}
