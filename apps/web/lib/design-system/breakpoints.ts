// Breakpoint editing logic for the Breakpoints foundation editor (Step 7H).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `BreakpointToken` shape ({ id, label, value, description? }) directly; no
// parallel model. Breakpoints are mobile-first minimum widths in ascending
// order; `base` (0px) is always first and immutable. Token ids are stable
// references: labels edit freely, ids never change after creation.

import {
  defaultBreakpoints,
  validateDesignSystem,
  type BreakpointToken,
  type DesignSystemConfig,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export const BREAKPOINT_UNITS = ["px", "rem"] as const;
export type BreakpointUnit = (typeof BREAKPOINT_UNITS)[number];

/** Practical ceiling for very large displays (8K and below). */
const MAX_PX = 7680;
const MAX_REM = 480;
/** Canonical id set, used by presets and docs. Display order is always ascending threshold. */
export const WELL_KNOWN_ORDER = ["base", "sm", "md", "lg", "xl", "2xl"];

export interface ParsedBreakpoint {
  amount: number;
  unit: BreakpointUnit;
}

/**
 * Parse a min-width threshold. Accepts "768px", "48rem", or bare "768" (→ px).
 * Rejects negatives, non-finite values, unknown units, and extremes.
 */
export function parseBreakpointValue(value: unknown): ParsedBreakpoint | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) return boundedBreakpoint(Number.parseFloat(bare[1]!), "px");
  const match = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(text);
  if (!match) return null;
  return boundedBreakpoint(Number.parseFloat(match[1]!), match[2]! as BreakpointUnit);
}

function boundedBreakpoint(amount: number, unit: BreakpointUnit): ParsedBreakpoint | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "px" && amount > MAX_PX) return null;
  if (unit === "rem" && amount > MAX_REM) return null;
  return { amount: Math.round(amount * 100) / 100, unit };
}

/** Canonical serialization: "768px", "48rem" (no trailing zeros). */
export function formatBreakpointValue(parsed: ParsedBreakpoint): string {
  return `${parsed.amount}${parsed.unit}`;
}

/** Pixel value for ordering and preview math. rem resolves against a 16px root. */
export function breakpointPx(token: Pick<BreakpointToken, "value">, rootPx = 16): number | null {
  const parsed = parseBreakpointValue(token.value);
  if (!parsed) return null;
  return parsed.unit === "px" ? parsed.amount : parsed.amount * rootPx;
}

/** Suggested display label for a new id ("my-tablet" → "My tablet"). */
export function humanBreakpointLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** URL/token-safe id from free text. Empty-safe ("!!!" → "token"). */
export function slugifyBreakpointId(raw: string, existingIds: readonly string[]): string {
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

function orderTokens(tokens: BreakpointToken[]): BreakpointToken[] {
  const seen = new Set<string>();
  const unique = tokens.filter((token) => {
    if (seen.has(token.id)) return false;
    seen.add(token.id);
    return true;
  });
  if (unique.length === 0) return unique;
  // Display order is always ascending threshold order (unparseable last,
  // then alphabetical). Well-known ids need no special casing: base sits at
  // 0px and every other canonical token carries its threshold.
  const pxOf = (token: BreakpointToken): number => breakpointPx(token) ?? Number.POSITIVE_INFINITY;
  return [...unique].sort((a, b) => {
    const px = pxOf(a) - pxOf(b);
    if (px !== 0) return px;
    return a.id < b.id ? -1 : 1;
  });
}

function cleanToken(token: unknown): BreakpointToken | null {
  if (typeof token !== "object" || token === null) return null;
  const entry = token as { id?: unknown; label?: unknown; value?: unknown; description?: unknown };
  if (typeof entry.id !== "string" || !isTokenIdSafe(entry.id)) return null;
  if (typeof entry.value !== "string" || entry.value.trim() === "") return null;
  const label =
    typeof entry.label === "string" && entry.label.trim() !== ""
      ? entry.label.trim().slice(0, 60)
      : humanBreakpointLabel(entry.id);
  const clean: BreakpointToken = { id: entry.id, label, value: entry.value.trim() };
  if (typeof entry.description === "string" && entry.description.trim() !== "") {
    clean.description = entry.description.trim().slice(0, 140);
  }
  return clean;
}

/**
 * Normalize any stored breakpoint scale into an ordered token list. Legacy
 * pre-7H Record shapes map onto the canonical order — the legacy `xs` base
 * becomes `base` — unknown keys are preserved alphabetically. Missing or
 * invalid scales fall back to canonical defaults. Never throws; the result
 * always starts with a 0px `base` token.
 */
export function ensureBreakpointScale(scale: unknown): BreakpointToken[] {
  let tokens: BreakpointToken[] = [];
  if (Array.isArray(scale)) {
    tokens = scale.map(cleanToken).filter((token): token is BreakpointToken => token !== null);
  } else if (typeof scale === "object" && scale !== null) {
    const record = scale as Record<string, unknown>;
    tokens = Object.entries(record)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && (entry[1] as string).trim() !== "")
      .map(([id, value]) => {
        const canonicalId = id === "xs" ? "base" : id;
        return { id: canonicalId, label: humanBreakpointLabel(canonicalId), value: (value as string).trim() };
      })
      .filter((token) => isTokenIdSafe(token.id));
  }
  const ordered = orderTokens(tokens);
  if (ordered.length === 0) {
    return defaultBreakpoints().scale.map((token) => ({ ...token }));
  }
  const [first, ...rest] = ordered as [BreakpointToken, ...BreakpointToken[]];
  const basePx = breakpointPx(first);
  if (first.id !== "base" || basePx !== 0) {
    return [{ id: "base", label: "Base", value: "0px", description: "Mobile-first default. Always 0px, never deleted." }, ...ordered];
  }
  return [first, ...rest];
}

function scaleOf(system: DesignSystemConfig): BreakpointToken[] {
  return ensureBreakpointScale(system.foundations.breakpoints?.scale);
}

function withScale(system: DesignSystemConfig, scale: BreakpointToken[]): DesignSystemConfig {
  return {
    ...system,
    foundations: { ...system.foundations, breakpoints: { scale: scale.map((token) => ({ ...token })) } },
  };
}

/**
 * Describe the neighbors constraining a candidate value at a position.
 * Used for exact recovery guidance, e.g. "`tablet` must be larger than
 * `sm` (640px) and smaller than `lg` (1024px)."
 */
export function neighborBounds(scale: BreakpointToken[], index: number): { lower: BreakpointToken | null; upper: BreakpointToken | null } {
  return {
    lower: index > 0 ? (scale[index - 1] ?? null) : null,
    upper: index < scale.length - 1 ? (scale[index + 1] ?? null) : null,
  };
}

function orderError(scale: BreakpointToken[], index: number, candidatePx: number): string | null {
  const token = scale[index];
  if (!token) return "That breakpoint no longer exists.";
  const { lower, upper } = neighborBounds(scale, index);
  const lowerPx = lower ? breakpointPx(lower) : null;
  const upperPx = upper ? breakpointPx(upper) : null;
  if (lowerPx !== null && candidatePx <= lowerPx) {
    const tail = upper && upperPx !== null ? ` and smaller than \`${upper.id}\` (${upper.value})` : "";
    return `\`${token.id}\` must be larger than \`${lower!.id}\` (${lower!.value})${tail}.`;
  }
  if (upperPx !== null && candidatePx >= upperPx) {
    const head = lower && lowerPx !== null ? `\`${token.id}\` must be larger than \`${lower!.id}\` (${lower!.value}) and ` : "`" + token.id + "` must be ";
    return `${head}smaller than \`${upper!.id}\` (${upper!.value}).`;
  }
  return null;
}

export interface CreateBreakpointInput {
  /** Optional explicit id; otherwise derived from the label. */
  id?: string;
  /** Visible label; used to derive the id when id is omitted. */
  label?: string;
  description?: string;
  amount: number;
  unit: BreakpointUnit;
}

export type CreateBreakpointResult = { ok: true; token: BreakpointToken } | { ok: false; error: string };

export function createBreakpointToken(
  input: CreateBreakpointInput,
  existing: readonly BreakpointToken[],
): CreateBreakpointResult {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    return { ok: false, error: "Enter a threshold of 0 or more." };
  }
  if (input.unit !== "px" && input.unit !== "rem") {
    return { ok: false, error: "Use px or rem." };
  }
  const label = (input.label ?? "").trim().slice(0, 60);
  const requested = (input.id ?? "").trim();
  let id: string;
  if (requested) {
    const slug = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (!isTokenIdSafe(slug)) {
      return { ok: false, error: "That breakpoint id is not URL-safe. Use lowercase letters, numbers, and dashes." };
    }
    if (existing.some((token) => token.id === slug)) {
      return { ok: false, error: `Breakpoint id "${slug}" is already in use.` };
    }
    id = slug;
  } else {
    if (!label) return { ok: false, error: "Give the breakpoint a name." };
    id = slugifyBreakpointId(label, existing.map((token) => token.id));
  }
  if (id === "base") {
    return { ok: false, error: "`base` is reserved for the 0px default and cannot be added." };
  }
  const parsed =
    input.unit === "px"
      ? boundedBreakpointValue(input.amount, "px")
      : boundedBreakpointValue(input.amount, "rem");
  if (!parsed) return { ok: false, error: "Enter a threshold of 0 or more (max 7680px / 480rem)." };
  const candidatePx = parsed.unit === "px" ? parsed.amount : parsed.amount * 16;
  const byPx = [...existing]
    .map((token) => ({ token, px: breakpointPx(token) }))
    .filter((entry): entry is { token: BreakpointToken; px: number } => entry.px !== null)
    .sort((a, b) => a.px - b.px);
  const duplicate = byPx.find((entry) => entry.px === candidatePx);
  if (duplicate) {
    return { ok: false, error: `\`${id}\` must use a unique threshold — ${duplicate.token.id} already starts at ${duplicate.token.value}.` };
  }
  const description = (input.description ?? "").trim().slice(0, 140);
  return {
    ok: true,
    token: {
      id,
      label: label || humanBreakpointLabel(id),
      value: `${parsed.amount}${parsed.unit}`,
      ...(description ? { description } : {}),
    },
  };
}

/**
 * Insert a token so the scale stays ascending by threshold. New tokens have
 * no position yet, so sorted insertion is placement — never a silent reorder
 * of existing ids.
 */
export function insertBreakpointToken(scale: BreakpointToken[], token: BreakpointToken): BreakpointToken[] {
  const next = scale.filter((entry) => entry.id !== token.id);
  const px = breakpointPx(token) ?? Number.POSITIVE_INFINITY;
  const index = next.findIndex((entry) => {
    const other = breakpointPx(entry);
    return other !== null && other > px;
  });
  if (index < 0) return [...next, token];
  return [...next.slice(0, index), token, ...next.slice(index)];
}

function boundedBreakpointValue(amount: number, unit: BreakpointUnit): { amount: number; unit: BreakpointUnit } | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "px" && amount > MAX_PX) return null;
  if (unit === "rem" && amount > MAX_REM) return null;
  return { amount: Math.round(amount * 100) / 100, unit };
}

export type UpdateBreakpointResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

/** Change one threshold; rejects order violations with neighbor guidance. Base is fixed at 0px. */
export function updateBreakpointValue(
  system: DesignSystemConfig,
  tokenId: string,
  amount: number,
  unit: BreakpointUnit,
): UpdateBreakpointResult {
  const scale = scaleOf(system);
  const index = scale.findIndex((token) => token.id === tokenId);
  if (index < 0) return { ok: false, error: "That breakpoint no longer exists." };
  if (tokenId === "base") {
    return { ok: false, error: "`base` is fixed at 0px and cannot be edited." };
  }
  const parsed = boundedBreakpointValue(amount, unit);
  if (!parsed) {
    return { ok: false, error: "Enter a threshold of 0 or more (max 7680px / 480rem)." };
  }
  const candidatePx = parsed.unit === "px" ? parsed.amount : parsed.amount * 16;
  const problem = orderError(scale, index, candidatePx);
  if (problem) return { ok: false, error: problem };
  const next = scale.map((token, position) =>
    position === index ? { ...token, value: `${parsed.amount}${parsed.unit}` } : token,
  );
  return { ok: true, system: withScale(system, next) };
}

/** Rename a breakpoint's visible label; the stable id never changes. */
export function updateBreakpointLabel(system: DesignSystemConfig, tokenId: string, label: string): DesignSystemConfig {
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) return system;
  return withScale(
    system,
    scaleOf(system).map((token) => (token.id === tokenId ? { ...token, label: trimmed } : token)),
  );
}

/** Update a breakpoint's description (empty clears it). */
export function updateBreakpointDescription(system: DesignSystemConfig, tokenId: string, description: string): DesignSystemConfig {
  const trimmed = description.trim().slice(0, 140);
  return withScale(
    system,
    scaleOf(system).map((token) => {
      if (token.id !== tokenId) return token;
      if (trimmed === "") {
        const { description: _removed, ...rest } = token;
        void _removed;
        return rest;
      }
      return { ...token, description: trimmed };
    }),
  );
}

/** Remove one breakpoint (guard with canDeleteBreakpoint first). */
export function removeBreakpoint(system: DesignSystemConfig, tokenId: string): DesignSystemConfig {
  return withScale(
    system,
    scaleOf(system).filter((token) => token.id !== tokenId),
  );
}

/**
 * Move a breakpoint within display order. Only allowed when the numerical
 * threshold order stays valid — ids are never silently reordered.
 */
export function moveBreakpoint(system: DesignSystemConfig, tokenId: string, direction: -1 | 1): UpdateBreakpointResult {
  const scale = scaleOf(system);
  const index = scale.findIndex((token) => token.id === tokenId);
  const target = index + direction;
  if (index < 0) return { ok: false, error: "That breakpoint no longer exists." };
  if (target < 0 || target >= scale.length) return { ok: false, error: "Nothing further in that direction." };
  if (scale[index]!.id === "base" || scale[target]!.id === "base") {
    return { ok: false, error: "`base` always stays first at 0px and cannot move." };
  }
  const next = [...scale];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved!);
  const movedPx = breakpointPx(next[target]!);
  const problem = movedPx === null ? "That move leaves an unparsable threshold." : orderError(next, target, movedPx);
  if (problem) {
    return { ok: false, error: `That move would break ascending order. ${problem}` };
  }
  return { ok: true, system: withScale(system, next) };
}

export interface BreakpointReference {
  kind: "semantic" | "theme" | "component" | "grid";
  /** Human-readable pointer, e.g. `component.card.columns`. */
  pointer: string;
  value: string;
}

/**
 * Find every stored value that references a breakpoint id by exact match.
 * Ids carry no sub-paths, so only exact equality counts. Grid mappings are
 * scanned structurally so future keyed responsive config is covered without
 * inventing any.
 */
export function findBreakpointReferences(system: DesignSystemConfig, tokenId: string): BreakpointReference[] {
  const references: BreakpointReference[] = [];
  const seen = new Set<string>();
  const push = (reference: BreakpointReference): void => {
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
  scanUnknown(system.foundations.grid, `grid`, tokenId, push);
  return references;
}

function scanUnknown(value: unknown, path: string, tokenId: string, push: (reference: BreakpointReference) => void): void {
  if (value === tokenId) {
    push({ kind: "grid", pointer: path, value: tokenId });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanUnknown(entry, `${path}[${index}]`, tokenId, push));
    return;
  }
  if (typeof value === "object" && value !== null) {
    for (const [key, entry] of Object.entries(value)) scanUnknown(entry, `${path}.${key}`, tokenId, push);
  }
}

export type BreakpointDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: BreakpointReference[] };

/** Never `base`, never the last non-base token, never a referenced token. */
export function canDeleteBreakpoint(system: DesignSystemConfig, tokenId: string): BreakpointDeleteGuard {
  const tokens = scaleOf(system);
  if (!tokens.some((token) => token.id === tokenId)) {
    return { ok: false, reasons: ["That breakpoint no longer exists."], references: [] };
  }
  if (tokenId === "base") {
    return {
      ok: false,
      reasons: ["`base` is required at 0px and cannot be deleted."],
      references: [],
    };
  }
  if (tokens.length <= 2) {
    return {
      ok: false,
      reasons: ["This is the last custom breakpoint. A scale needs base plus at least one threshold to stay valid."],
      references: [],
    };
  }
  const references = findBreakpointReferences(system, tokenId);
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
export function starterBreakpointReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one threshold to its starter value; null when the starter lacks the id. */
export function resetBreakpointToStarter(system: DesignSystemConfig, tokenId: string): DesignSystemConfig | null {
  const baseline = ensureBreakpointScale(starterBreakpointReference(system).foundations.breakpoints?.scale).find(
    (token) => token.id === tokenId,
  );
  if (!baseline) return null;
  return withScale(
    system,
    scaleOf(system).map((token) => (token.id === tokenId ? { ...token, value: baseline.value } : token)),
  );
}

/** Restore the full scale to the selected starter default. */
export function restoreStarterBreakpoints(system: DesignSystemConfig): DesignSystemConfig {
  const starter = starterBreakpointReference(system);
  return withScale(
    system,
    ensureBreakpointScale(starter.foundations.breakpoints?.scale).map((token) => ({ ...token })),
  );
}

export interface BreakpointPreset {
  id: string;
  label: string;
  description: string;
  scale: BreakpointToken[];
}

function presetScale(entries: Array<[string, string, string, string?]>): BreakpointToken[] {
  return entries.map(([id, label, value, description]) => ({
    id,
    label,
    value,
    ...(description ? { description } : {}),
  }));
}

/** Optional starting points. Applying one replaces the scale wholesale. */
export const BREAKPOINT_PRESETS: BreakpointPreset[] = [
  {
    id: "standard",
    label: "Standard web",
    description: "Balanced phone-to-desktop thresholds for general sites.",
    scale: presetScale([
      ["base", "Base", "0px", "Mobile-first default. Always 0px, never deleted."],
      ["sm", "Small", "640px", "Large phones and small tablets."],
      ["md", "Medium", "768px", "Tablets and small laptops."],
      ["lg", "Large", "1024px", "Laptops and small desktops."],
      ["xl", "X-Large", "1280px", "Desktops and large screens."],
      ["2xl", "2X-Large", "1536px", "Wide desktop displays."],
    ]),
  },
  {
    id: "compact",
    label: "Compact app",
    description: "Tighter thresholds for dense application interfaces.",
    scale: presetScale([
      ["base", "Base", "0px", "Mobile-first default. Always 0px, never deleted."],
      ["sm", "Small", "480px", "Large phones."],
      ["md", "Medium", "768px", "Tablets."],
      ["lg", "Large", "1024px", "Small laptops."],
      ["xl", "X-Large", "1280px", "Desktops."],
      ["2xl", "2X-Large", "1440px", "Wide screens."],
    ]),
  },
  {
    id: "wide",
    label: "Wide dashboard",
    description: "Roomier thresholds for data-heavy dashboards.",
    scale: presetScale([
      ["base", "Base", "0px", "Mobile-first default. Always 0px, never deleted."],
      ["sm", "Small", "640px", "Large phones."],
      ["md", "Medium", "900px", "Tablets and small laptops."],
      ["lg", "Large", "1280px", "Laptops and desktops."],
      ["xl", "X-Large", "1600px", "Large displays."],
      ["2xl", "2X-Large", "1920px", "Full-HD and beyond."],
    ]),
  },
];

/** Apply a preset wholesale (base included). Grid column config is untouched. */
export function applyBreakpointPreset(system: DesignSystemConfig, preset: BreakpointPreset): DesignSystemConfig {
  return withScale(
    system,
    preset.scale.map((token) => ({ ...token })),
  );
}

export interface BreakpointDiff {
  added: BreakpointToken[];
  removed: BreakpointToken[];
  changed: Array<{ id: string; from: string; to: string }>;
}

/** Before/after summary between two scales (preset preview, confirm copy). */
export function diffBreakpointScales(current: BreakpointToken[], next: BreakpointToken[]): BreakpointDiff {
  const currentById = new Map(current.map((token) => [token.id, token]));
  const nextById = new Map(next.map((token) => [token.id, token]));
  const added = next.filter((token) => !currentById.has(token.id));
  const removed = current.filter((token) => !nextById.has(token.id));
  const changed: BreakpointDiff["changed"] = [];
  for (const token of next) {
    const from = currentById.get(token.id);
    if (from !== undefined && (from.value !== token.value || from.label !== token.label)) {
      changed.push({ id: token.id, from: `${from.label}: ${from.value}`, to: `${token.label}: ${token.value}` });
    }
  }
  return { added, removed, changed };
}

/** True when the scale differs from the selected starter default in any way. */
export function hasCustomBreakpointEdits(system: DesignSystemConfig): boolean {
  const starter = starterBreakpointReference(system);
  const diff = diffBreakpointScales(
    ensureBreakpointScale(starter.foundations.breakpoints?.scale),
    scaleOf(system),
  );
  return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
}

/**
 * Mobile-first active breakpoint for a viewport width: the greatest
 * threshold at or below the width. Always resolves (base covers 0px).
 */
export function activeBreakpoint(system: DesignSystemConfig, widthPx: number): BreakpointToken {
  const ordered = [...scaleOf(system)].sort((a, b) => {
    const left = breakpointPx(a) ?? Number.POSITIVE_INFINITY;
    const right = breakpointPx(b) ?? Number.POSITIVE_INFINITY;
    return left - right;
  });
  const width = Number.isFinite(widthPx) && widthPx >= 0 ? widthPx : 0;
  let active = ordered[0]!;
  for (const token of ordered) {
    const threshold = breakpointPx(token);
    if (threshold !== null && threshold <= width) active = token;
    else break;
  }
  return active;
}

/** Breakpoint-relevant validator issues for the current system. */
export function breakpointIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("foundations.breakpoints"));
}
