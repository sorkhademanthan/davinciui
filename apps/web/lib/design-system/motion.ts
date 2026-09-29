// Motion editing logic for the Motion foundation editor (Step 7E).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `DurationToken`/`EasingToken` shapes directly; no parallel model.
// Token ids are stable references; labels edit freely without breaking refs.

import {
  defaultMotion,
  validateDesignSystem,
  type DesignSystemConfig,
  type DurationToken,
  type EasingToken,
  type ReducedMotionPolicy,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export type MotionKind = "durations" | "easings";

/** Display order for well-known ids; unknown ids sort after, alphabetically. */
const WELL_KNOWN_DURATIONS = ["instant", "fast", "normal", "slow", "deliberate"];
const WELL_KNOWN_EASINGS = ["linear", "standard", "enter", "exit", "emphasized"];

/** Hard ceiling for a single duration (10s). Loading states loop instead. */
const MAX_DURATION_MS = 10000;

/**
 * Parse a duration. Accepts "200ms" or bare "200" (→ ms).
 * Rejects negatives, non-finite values, unknown units, and extremes.
 */
export function parseDurationMs(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) return boundedDuration(Number.parseFloat(bare[1]!));
  const match = /^(\d+(?:\.\d+)?)ms$/.exec(text);
  if (!match) return null;
  return boundedDuration(Number.parseFloat(match[1]!));
}

function boundedDuration(ms: number): number | null {
  if (!Number.isFinite(ms) || ms < 0 || ms > MAX_DURATION_MS) return null;
  return Math.round(ms);
}

/** Canonical serialization: "200ms" (whole milliseconds). */
export function formatDurationMs(ms: number): string {
  return `${Math.round(ms)}ms`;
}

const EASING_KEYWORDS = ["linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"] as const;
const STEP_JUMPS = ["jump-start", "jump-end", "jump-none", "jump-both", "start", "end"] as const;

/**
 * Validate + normalize a CSS easing value. Accepts keywords, cubic-bezier()
 * (x control points must stay in [0, 1] per spec), and steps(). Anything
 * else — including arbitrary functions — is rejected so persisted values
 * stay implementation-friendly for later CSS export.
 */
export function parseEasing(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase().replace(/\s+/g, " ");
  if ((EASING_KEYWORDS as readonly string[]).includes(text)) return text;
  const bezier = /^cubic-bezier\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/.exec(text);
  if (bezier) {
    const points = bezier.slice(1, 5).map(Number);
    if (points.some((point) => !Number.isFinite(point))) return null;
    const [x1, , x2] = points as [number, number, number, number];
    if (x1! < 0 || x1! > 1 || x2! < 0 || x2! > 1) return null;
    return `cubic-bezier(${points.join(", ")})`;
  }
  const steps = /^steps\(\s*(\d+)\s*(?:,\s*(jump-start|jump-end|jump-none|jump-both|start|end)\s*)?\)$/.exec(text);
  if (steps) {
    const count = Number.parseInt(steps[1]!, 10);
    if (!Number.isFinite(count) || count < 1 || count > 100) return null;
    return steps[2] ? `steps(${count}, ${steps[2]})` : `steps(${count})`;
  }
  return null;
}

/** Suggested display label for a new token id ("my-snap" → "My snap"). */
export function humanMotionLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** URL/token-safe id from free text. Empty-safe ("!!!" → "token"). */
export function slugifyMotionId(raw: string, existingIds: readonly string[]): string {
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

type MotionToken = DurationToken | EasingToken;

function cleanToken<T extends MotionToken>(token: unknown): T | null {
  if (typeof token !== "object" || token === null) return null;
  const entry = token as { id?: unknown; label?: unknown; value?: unknown; description?: unknown; enabled?: unknown };
  if (typeof entry.id !== "string" || !isTokenIdSafe(entry.id)) return null;
  if (typeof entry.value !== "string" || entry.value.trim() === "") return null;
  const label =
    typeof entry.label === "string" && entry.label.trim() !== ""
      ? entry.label.trim().slice(0, 60)
      : humanMotionLabel(entry.id);
  const clean: MotionToken = { id: entry.id, label, value: entry.value.trim() };
  if (typeof entry.description === "string" && entry.description.trim() !== "") {
    clean.description = entry.description.trim().slice(0, 140);
  }
  if (entry.enabled === false) clean.enabled = false;
  return clean as T;
}

function orderTokens<T extends MotionToken>(tokens: T[], wellKnown: readonly string[]): T[] {
  const seen = new Set<string>();
  const unique = tokens.filter((token) => {
    if (seen.has(token.id)) return false;
    seen.add(token.id);
    return true;
  });
  if (unique.length === 0) return unique;
  const rank = (id: string): number => {
    const index = wellKnown.indexOf(id);
    return index === -1 ? wellKnown.length : index;
  };
  return [...unique].sort((a, b) => {
    const order = rank(a.id) - rank(b.id);
    if (order !== 0) return order;
    return a.id < b.id ? -1 : 1;
  });
}

/**
 * Normalize a stored scale into an ordered token list. Legacy pre-7E Record
 * shapes map onto well-known order (unknown keys appended alphabetically);
 * missing/invalid scales fall back to canonical defaults. Never throws and
 * never returns an empty list.
 */
export function ensureDurations(scale: unknown): DurationToken[] {
  if (Array.isArray(scale)) {
    const tokens = scale.map(cleanToken<DurationToken>).filter((token): token is DurationToken => token !== null);
    const ordered = orderTokens(tokens, WELL_KNOWN_DURATIONS);
    if (ordered.length > 0) return ordered;
  } else if (typeof scale === "object" && scale !== null) {
    const record = scale as Record<string, unknown>;
    const tokens = Object.entries(record)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && (entry[1] as string).trim() !== "")
      .map(([id, value]) => ({ id, label: humanMotionLabel(id), value: (value as string).trim() }));
    const ordered = orderTokens(
      tokens.filter((token) => isTokenIdSafe(token.id)),
      WELL_KNOWN_DURATIONS,
    );
    if (ordered.length > 0) return ordered;
  }
  return defaultMotion().durations.map((token) => ({ ...token }));
}

/** Same normalization for the easing library. */
export function ensureEasings(scale: unknown): EasingToken[] {
  if (Array.isArray(scale)) {
    const tokens = scale.map(cleanToken<EasingToken>).filter((token): token is EasingToken => token !== null);
    const ordered = orderTokens(tokens, WELL_KNOWN_EASINGS);
    if (ordered.length > 0) return ordered;
  } else if (typeof scale === "object" && scale !== null) {
    const record = scale as Record<string, unknown>;
    const tokens = Object.entries(record)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && (entry[1] as string).trim() !== "")
      .map(([id, value]) => ({ id, label: humanMotionLabel(id), value: (value as string).trim() }));
    const ordered = orderTokens(
      tokens.filter((token) => isTokenIdSafe(token.id)),
      WELL_KNOWN_EASINGS,
    );
    if (ordered.length > 0) return ordered;
  }
  return defaultMotion().easings.map((token) => ({ ...token }));
}

function durationsOf(system: DesignSystemConfig): DurationToken[] {
  return ensureDurations(system.foundations.motion?.durations);
}

function easingsOf(system: DesignSystemConfig): EasingToken[] {
  return ensureEasings(system.foundations.motion?.easings);
}

function withMotion(
  system: DesignSystemConfig,
  patch: Partial<{ durations: DurationToken[]; easings: EasingToken[]; reducedMotion: ReducedMotionPolicy }>,
): DesignSystemConfig {
  const current = system.foundations.motion;
  return {
    ...system,
    foundations: {
      ...system.foundations,
      motion: {
        durations: patch.durations ? patch.durations.map((token) => ({ ...token })) : current.durations.map((token) => ({ ...token })),
        easings: patch.easings ? patch.easings.map((token) => ({ ...token })) : current.easings.map((token) => ({ ...token })),
        reducedMotion: patch.reducedMotion ?? current.reducedMotion,
      },
    },
  };
}

export interface CreateDurationInput {
  /** Optional explicit id; otherwise derived from the label. */
  id?: string;
  /** Visible label; used to derive the id when id is omitted. */
  label?: string;
  description?: string;
  ms: number;
}

export interface CreateEasingInput {
  /** Optional explicit id; otherwise derived from the label. */
  id?: string;
  /** Visible label; used to derive the id when id is omitted. */
  label?: string;
  description?: string;
  /** Raw CSS easing value; validated before anything is stored. */
  value: string;
}

export type CreateMotionResult<T> = { ok: true; token: T } | { ok: false; error: string };

function resolveNewId(
  input: { id?: string; label?: string },
  existingIds: readonly string[],
): { ok: true; id: string; label: string } | { ok: false; error: string } {
  const label = (input.label ?? "").trim().slice(0, 60);
  const requested = (input.id ?? "").trim();
  if (requested) {
    const slug = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (!isTokenIdSafe(slug)) {
      return { ok: false, error: "That token id is not URL-safe. Use lowercase letters, numbers, and dashes." };
    }
    if (existingIds.includes(slug)) {
      return { ok: false, error: `Token id "${slug}" is already in use.` };
    }
    return { ok: true, id: slug, label: label || humanMotionLabel(slug) };
  }
  if (!label) return { ok: false, error: "Give the token a name." };
  const id = slugifyMotionId(label, existingIds);
  return { ok: true, id, label };
}

function cleanDescription(input: string | undefined): string | undefined {
  const text = (input ?? "").trim().slice(0, 140);
  return text === "" ? undefined : text;
}

export function createDurationToken(
  input: CreateDurationInput,
  existingIds: readonly string[],
): CreateMotionResult<DurationToken> {
  if (!Number.isFinite(input.ms) || input.ms < 0) {
    return { ok: false, error: "Enter a duration of 0 or more." };
  }
  if (input.ms > MAX_DURATION_MS) {
    return { ok: false, error: `Keep durations at or below ${MAX_DURATION_MS}ms; loop instead for loading states.` };
  }
  const resolved = resolveNewId(input, existingIds);
  if (!resolved.ok) return resolved;
  return {
    ok: true,
    token: {
      id: resolved.id,
      label: resolved.label,
      value: formatDurationMs(input.ms),
      ...(cleanDescription(input.description) ? { description: cleanDescription(input.description) } : {}),
    },
  };
}

export function createEasingToken(
  input: CreateEasingInput,
  existingIds: readonly string[],
): CreateMotionResult<EasingToken> {
  const parsed = parseEasing(input.value);
  if (parsed === null) {
    return {
      ok: false,
      error: "Enter a CSS easing: linear, ease, ease-in, ease-out, ease-in-out, cubic-bezier(x1, y1, x2, y2), or steps(n).",
    };
  }
  const resolved = resolveNewId(input, existingIds);
  if (!resolved.ok) return resolved;
  return {
    ok: true,
    token: {
      id: resolved.id,
      label: resolved.label,
      value: parsed,
      ...(cleanDescription(input.description) ? { description: cleanDescription(input.description) } : {}),
    },
  };
}

/** Change one duration's value; nothing else moves. */
export function updateDurationValue(system: DesignSystemConfig, tokenId: string, ms: number): DesignSystemConfig {
  if (!Number.isFinite(ms) || ms < 0 || ms > MAX_DURATION_MS) return system;
  return withMotion(
    system,
    {
      durations: durationsOf(system).map((token) =>
        token.id === tokenId ? { ...token, value: formatDurationMs(ms) } : token,
      ),
    },
  );
}

/** Change one easing's value; rejected when unparseable. */
export function updateEasingValue(system: DesignSystemConfig, tokenId: string, value: string): DesignSystemConfig {
  const parsed = parseEasing(value);
  if (parsed === null) return system;
  return withMotion(
    system,
    {
      easings: easingsOf(system).map((token) => (token.id === tokenId ? { ...token, value: parsed } : token)),
    },
  );
}

/** Rename a token's visible label; the stable id never changes. */
export function updateMotionLabel(
  system: DesignSystemConfig,
  kind: MotionKind,
  tokenId: string,
  label: string,
): DesignSystemConfig {
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) return system;
  if (kind === "durations") {
    return withMotion(system, {
      durations: durationsOf(system).map((token) => (token.id === tokenId ? { ...token, label: trimmed } : token)),
    });
  }
  return withMotion(system, {
    easings: easingsOf(system).map((token) => (token.id === tokenId ? { ...token, label: trimmed } : token)),
  });
}

/** Enable/disable a token; disabled tokens stay stored but hide from pickers. */
export function setMotionEnabled(
  system: DesignSystemConfig,
  kind: MotionKind,
  tokenId: string,
  enabled: boolean,
): DesignSystemConfig {
  const apply = <T extends MotionToken>(tokens: T[]): T[] =>
    tokens.map((token) => {
      if (token.id !== tokenId) return token;
      if (enabled) {
        const { enabled: _removed, ...rest } = token;
        void _removed;
        return rest as T;
      }
      return { ...token, enabled: false };
    });
  if (kind === "durations") return withMotion(system, { durations: apply(durationsOf(system)) });
  return withMotion(system, { easings: apply(easingsOf(system)) });
}

/** Independent copy with a fresh unique id; safe to edit or delete. */
export function duplicateMotionToken(
  system: DesignSystemConfig,
  kind: MotionKind,
  tokenId: string,
): MotionToken | null {
  const tokens = kind === "durations" ? durationsOf(system) : easingsOf(system);
  const current = tokens.find((token) => token.id === tokenId);
  if (!current) return null;
  const existing = tokens.map((token) => token.id);
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

/** Remove one token (guard with canDeleteMotionToken first). */
export function removeMotionToken(system: DesignSystemConfig, kind: MotionKind, tokenId: string): DesignSystemConfig {
  if (kind === "durations") {
    return withMotion(
      system,
      { durations: durationsOf(system).filter((token) => token.id !== tokenId) },
    );
  }
  return withMotion(system, { easings: easingsOf(system).filter((token) => token.id !== tokenId) });
}

export interface MotionReference {
  kind: "semantic" | "theme" | "component";
  /** Human-readable pointer, e.g. `component.toast.duration`. */
  pointer: string;
  value: string;
}

/**
 * Find every stored value that references a motion token id by exact match.
 * Ids carry no sub-paths, so only exact equality counts as a reference.
 */
export function findMotionReferences(system: DesignSystemConfig, tokenId: string): MotionReference[] {
  const references: MotionReference[] = [];
  const seen = new Set<string>();
  const push = (reference: MotionReference): void => {
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

export type MotionDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: MotionReference[] };

/** Never the last token of a scale, never a referenced token, never the last usable one. */
export function canDeleteMotionToken(system: DesignSystemConfig, kind: MotionKind, tokenId: string): MotionDeleteGuard {
  const tokens = kind === "durations" ? durationsOf(system) : easingsOf(system);
  const label = kind === "durations" ? "duration" : "easing";
  if (!tokens.some((token) => token.id === tokenId)) {
    return { ok: false, reasons: ["That token no longer exists."], references: [] };
  }
  if (tokens.length <= 1) {
    return {
      ok: false,
      reasons: [`This is the last ${label} token. A scale needs at least one token to stay valid.`],
      references: [],
    };
  }
  const target = tokens.find((token) => token.id === tokenId);
  const usable = tokens.filter((token) => token.enabled !== false);
  if (target?.enabled !== false && usable.length <= 1) {
    return {
      ok: false,
      reasons: [`This is the last usable ${label} token. Keep at least one enabled ${label} available.`],
      references: [],
    };
  }
  const references = findMotionReferences(system, tokenId);
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

/** Disabling is blocked only when it would leave zero usable tokens in the scale. */
export function canDisableMotionToken(
  system: DesignSystemConfig,
  kind: MotionKind,
  tokenId: string,
): MotionDeleteGuard {
  const tokens = kind === "durations" ? durationsOf(system) : easingsOf(system);
  const label = kind === "durations" ? "duration" : "easing";
  const target = tokens.find((token) => token.id === tokenId);
  if (!target) {
    return { ok: false, reasons: ["That token no longer exists."], references: [] };
  }
  if (target.enabled === false) return { ok: true };
  const usable = tokens.filter((token) => token.id !== tokenId && token.enabled !== false);
  if (usable.length === 0) {
    return {
      ok: false,
      reasons: [`This is the last usable ${label} token. Keep at least one enabled ${label} available.`],
      references: [],
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Starter defaults, diffs, restore
// ---------------------------------------------------------------------------

/** Fresh starter system used for resets and comparisons (never saved). */
export function starterMotionReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one token to its starter snapshot; null when the starter lacks the id. */
export function resetMotionTokenToStarter(
  system: DesignSystemConfig,
  kind: MotionKind,
  tokenId: string,
): DesignSystemConfig | null {
  const starter = starterMotionReference(system);
  const baseline = (
    kind === "durations"
      ? ensureDurations(starter.foundations.motion?.durations)
      : ensureEasings(starter.foundations.motion?.easings)
  ).find((token) => token.id === tokenId);
  if (!baseline) return null;
  if (kind === "durations") {
    return withMotion(system, {
      durations: durationsOf(system).map((token) => (token.id === tokenId ? { ...baseline } : token)),
    });
  }
  return withMotion(system, {
    easings: easingsOf(system).map((token) => (token.id === tokenId ? { ...baseline } : token)),
  });
}

/** Restore full duration + easing scales and the reduced-motion policy. */
export function restoreStarterMotion(system: DesignSystemConfig): DesignSystemConfig {
  const starter = starterMotionReference(system);
  return withMotion(system, {
    durations: ensureDurations(starter.foundations.motion?.durations).map((token) => ({ ...token })),
    easings: ensureEasings(starter.foundations.motion?.easings).map((token) => ({ ...token })),
    reducedMotion: starter.foundations.motion.reducedMotion,
  });
}

export interface MotionDiff {
  durationsAdded: DurationToken[];
  durationsRemoved: DurationToken[];
  durationsChanged: Array<{ id: string; from: string; to: string }>;
  easingsAdded: EasingToken[];
  easingsRemoved: EasingToken[];
  easingsChanged: Array<{ id: string; from: string; to: string }>;
  policyChanged: { from: ReducedMotionPolicy; to: ReducedMotionPolicy } | null;
}

function describeToken(token: MotionToken): string {
  return `${token.label}: ${token.value}${token.enabled === false ? " (disabled)" : ""}`;
}

/** Before/after summary between current motion and a candidate set. */
export function diffMotion(
  current: { durations: DurationToken[]; easings: EasingToken[]; reducedMotion: ReducedMotionPolicy },
  next: { durations: DurationToken[]; easings: EasingToken[]; reducedMotion: ReducedMotionPolicy },
): MotionDiff {
  const diffScale = <T extends MotionToken>(before: T[], after: T[]): { added: T[]; removed: T[]; changed: Array<{ id: string; from: string; to: string }> } => {
    const beforeById = new Map(before.map((token) => [token.id, token]));
    const afterById = new Map(after.map((token) => [token.id, token]));
    const added = after.filter((token) => !beforeById.has(token.id));
    const removed = before.filter((token) => !afterById.has(token.id));
    const changed: Array<{ id: string; from: string; to: string }> = [];
    for (const token of after) {
      const from = beforeById.get(token.id);
      if (from && describeToken(from) !== describeToken(token)) {
        changed.push({ id: token.id, from: describeToken(from), to: describeToken(token) });
      }
    }
    return { added, removed, changed };
  };
  const durations = diffScale(current.durations, next.durations);
  const easings = diffScale(current.easings, next.easings);
  return {
    durationsAdded: durations.added,
    durationsRemoved: durations.removed,
    durationsChanged: durations.changed,
    easingsAdded: easings.added,
    easingsRemoved: easings.removed,
    easingsChanged: easings.changed,
    policyChanged: current.reducedMotion !== next.reducedMotion ? { from: current.reducedMotion, to: next.reducedMotion } : null,
  };
}

/** True when durations, easings, or policy differ from the selected starter default. */
export function hasCustomMotionEdits(system: DesignSystemConfig): boolean {
  const starter = starterMotionReference(system);
  const diff = diffMotion(
    {
      durations: durationsOf(system),
      easings: easingsOf(system),
      reducedMotion: system.foundations.motion.reducedMotion,
    },
    {
      durations: ensureDurations(starter.foundations.motion?.durations),
      easings: ensureEasings(starter.foundations.motion?.easings),
      reducedMotion: starter.foundations.motion.reducedMotion,
    },
  );
  return (
    diff.durationsAdded.length > 0 ||
    diff.durationsRemoved.length > 0 ||
    diff.durationsChanged.length > 0 ||
    diff.easingsAdded.length > 0 ||
    diff.easingsRemoved.length > 0 ||
    diff.easingsChanged.length > 0 ||
    diff.policyChanged !== null
  );
}

// ---------------------------------------------------------------------------
// Reduced-motion policy
// ---------------------------------------------------------------------------

export interface ReducedMotionPolicyMeta {
  id: ReducedMotionPolicy;
  label: string;
  description: string;
}

export const REDUCED_MOTION_POLICIES: readonly ReducedMotionPolicyMeta[] = [
  {
    id: "respect-preference",
    label: "Respect system preference",
    description: "Follow the operating system's prefers-reduced-motion setting. Motion plays normally unless the user asks for less. This is the default.",
  },
  {
    id: "reduce-all",
    label: "Minimize",
    description: "Always reduce non-essential motion to subtle opacity fades, even when the OS requests full motion. Essential feedback still appears instantly.",
  },
  {
    id: "none",
    label: "Disable non-essential motion",
    description: "Remove non-essential movement entirely. Everything appears in its final state at once. This never forces motion on anyone.",
  },
];

export function reducedMotionLabel(policy: ReducedMotionPolicy): string {
  return REDUCED_MOTION_POLICIES.find((entry) => entry.id === policy)?.label ?? policy;
}

export type SetPolicyResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

export function setReducedMotionPolicy(system: DesignSystemConfig, policy: ReducedMotionPolicy): SetPolicyResult {
  if (policy !== "respect-preference" && policy !== "reduce-all" && policy !== "none") {
    return { ok: false, error: "Choose respect-preference, reduce-all, or none." };
  }
  return { ok: true, system: withMotion(system, { reducedMotion: policy }) };
}

export interface EffectiveMotion {
  /** True when non-essential movement must be removed right now. */
  reduce: boolean;
  /** Why, in plain language for the preview caption. */
  reason: string;
}

/** Combine the stored policy with the OS preference into a preview decision. */
export function effectiveMotion(system: DesignSystemConfig, osPrefersReduced: boolean): EffectiveMotion {
  const policy = system.foundations.motion.reducedMotion;
  if (policy === "none") {
    return { reduce: true, reason: "Policy disables non-essential motion" };
  }
  if (policy === "reduce-all") {
    return { reduce: true, reason: "Policy minimizes motion" };
  }
  return osPrefersReduced
    ? { reduce: true, reason: "OS requests reduced motion" }
    : { reduce: false, reason: "OS allows full motion" };
}

// ---------------------------------------------------------------------------
// Preview resolution
// ---------------------------------------------------------------------------

/** Milliseconds for a duration id; null when missing, disabled, or unparsable. */
export function resolveDurationMs(system: DesignSystemConfig, tokenId: string): number | null {
  const token = durationsOf(system).find((entry) => entry.id === tokenId);
  if (!token || token.enabled === false) return null;
  return parseDurationMs(token.value);
}

/** CSS easing for an easing id; null when missing, disabled, or unparsable. */
export function resolveEasingCss(system: DesignSystemConfig, tokenId: string): string | null {
  const token = easingsOf(system).find((entry) => entry.id === tokenId);
  if (!token || token.enabled === false) return null;
  return parseEasing(token.value);
}

/** Motion-relevant validator issues for the current system. */
export function motionIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("foundations.motion"));
}
