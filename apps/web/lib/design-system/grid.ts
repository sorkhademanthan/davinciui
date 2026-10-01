// Responsive Grid foundation logic (Step 7G).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `GridFoundations` shape directly; no parallel model. Responsive values are
// keyed by stable breakpoint ids; breakpoint thresholds live in breakpoints.ts
// and are never duplicated here. Gutters/gaps reference Spacing tokens by id.

import {
  defaultGrid,
  validateDesignSystem,
  type DesignSystemConfig,
  type GridBreakpointProfile,
  type GridContainer,
  type GridFoundations,
  type ValidationIssue,
} from "./domain";
import { ensureBreakpointScale, activeBreakpoint } from "./breakpoints";
import { createSystemFromStarter } from "./starters";

export const GRID_CONTAINER_IDS = ["narrow", "reading", "standard", "wide", "full"] as const;
export type GridContainerId = (typeof GRID_CONTAINER_IDS)[number];

const MAX_CONTAINER_PX = 4096;
const MAX_CONTAINER_REM = 256;

export interface ParsedContainer {
  amount: number;
  unit: "px" | "rem";
}

function isTokenIdSafe(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(id) && id.length <= 40;
}

export function humanGridLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

export function slugifyGridId(raw: string, existingIds: readonly string[]): string {
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

/**
 * Parse a container width. Accepts "<n>px", "<n>rem", bare "<n>" (→ px),
 * and "100%" (full-bleed). Rejects negatives, non-finite, unknown units.
 */
export function parseContainerValue(value: unknown): ParsedContainer | "full" | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  if (text === "100%") return "full";
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) {
    const amount = Number.parseFloat(bare[1]!);
    if (!Number.isFinite(amount) || amount < 0 || amount > MAX_CONTAINER_PX) return null;
    return { amount: Math.round(amount * 100) / 100, unit: "px" };
  }
  const match = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(text);
  if (!match) return null;
  const amount = Number.parseFloat(match[1]!);
  const unit = match[2]! as "px" | "rem";
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "px" && amount > MAX_CONTAINER_PX) return null;
  if (unit === "rem" && amount > MAX_CONTAINER_REM) return null;
  return { amount: Math.round(amount * 100) / 100, unit };
}

/** Pixel value for preview math. rem resolves against a 16px root; "100%" → null (fluid). */
export function containerPx(container: Pick<GridContainer, "value">, rootPx = 16): number | null {
  const parsed = parseContainerValue(container.value);
  if (parsed === null || parsed === "full") return null;
  return parsed.unit === "px" ? parsed.amount : parsed.amount * rootPx;
}

function cleanContainer(entry: unknown): GridContainer | null {
  if (typeof entry !== "object" || entry === null) return null;
  const raw = entry as { id?: unknown; label?: unknown; value?: unknown; description?: unknown };
  if (typeof raw.id !== "string" || !isTokenIdSafe(raw.id)) return null;
  if (typeof raw.value !== "string" || raw.value.trim() === "") return null;
  if (parseContainerValue(raw.value.trim()) === null) return null;
  const label =
    typeof raw.label === "string" && raw.label.trim() !== ""
      ? raw.label.trim().slice(0, 60)
      : humanGridLabel(raw.id);
  const clean: GridContainer = { id: raw.id, label, value: raw.value.trim() };
  if (typeof raw.description === "string" && raw.description.trim() !== "") {
    clean.description = raw.description.trim().slice(0, 140);
  }
  return clean;
}

function cleanProfile(
  entry: unknown,
  spacingIds: Set<string>,
): GridBreakpointProfile | null {
  if (typeof entry !== "object" || entry === null) return null;
  const raw = entry as {
    breakpointId?: unknown;
    columns?: unknown;
    gutter?: unknown;
    columnGap?: unknown;
    rowGap?: unknown;
  };
  if (typeof raw.breakpointId !== "string" || !isTokenIdSafe(raw.breakpointId)) return null;
  if (!Number.isInteger(raw.columns) || (raw.columns as number) < 1 || (raw.columns as number) > 12) return null;
  for (const key of ["gutter", "columnGap", "rowGap"] as const) {
    if (typeof raw[key] !== "string" || (raw[key] as string).trim() === "") return null;
    // Unknown spacing ids are dropped during normalization; the caller
    // re-seeds them so no profile ever points at a missing token.
    if (!spacingIds.has((raw[key] as string).trim())) return null;
  }
  return {
    breakpointId: raw.breakpointId,
    columns: raw.columns as number,
    gutter: (raw.gutter as string).trim(),
    columnGap: (raw.columnGap as string).trim(),
    rowGap: (raw.rowGap as string).trim(),
  };
}

function spacingIdsOf(system: DesignSystemConfig): Set<string> {
  return new Set([
    ...(system.foundations.spacing?.scale ?? []).map((token) => token.id),
    ...(system.foundations.sizing?.tokens ?? []).map((token) => token.id),
  ]);
}

function breakpointIdsOf(system: DesignSystemConfig): string[] {
  return ensureBreakpointScale(system.foundations.breakpoints?.scale).map((token) => token.id);
}

function defaultColumnsForPosition(index: number, legacyColumns: number): number {
  const caps = [4, 6, 8];
  if (index < caps.length) return Math.max(1, Math.min(caps[index]!, legacyColumns));
  return legacyColumns;
}

/** Map a legacy raw gutter ("24px" or token id) onto a spacing token id. */
export function mapLegacyGutterToToken(
  legacyGutter: unknown,
  system: DesignSystemConfig,
): string {
  const ids = spacingIdsOf(system);
  if (typeof legacyGutter === "string" && ids.has(legacyGutter.trim())) {
    return legacyGutter.trim();
  }
  // Match by pixel value against the spacing scale.
  if (typeof legacyGutter === "string") {
    const text = legacyGutter.trim().toLowerCase();
    const pxMatch = /^(\d+(?:\.\d+)?)px$/.exec(text) ?? /^(\d+(?:\.\d+)?)$/.exec(text);
    if (pxMatch) {
      const target = Number.parseFloat(pxMatch[1]!);
      for (const token of system.foundations.spacing?.scale ?? []) {
        const m = /^(\d+(?:\.\d+)?)px$/.exec(token.value.trim().toLowerCase());
        if (m && Number.parseFloat(m[1]!) === target) return token.id;
      }
      for (const token of system.foundations.sizing?.tokens ?? []) {
        const m = /^(\d+(?:\.\d+)?)px$/.exec(token.value.trim().toLowerCase());
        if (m && Number.parseFloat(m[1]!) === target) return token.id;
      }
    }
  }
  if (ids.has("space-4")) return "space-4";
  const first = system.foundations.spacing?.scale?.[0]?.id;
  if (first) return first;
  return "space-4";
}

/**
 * Normalize any stored grid into a responsive canonical value. Legacy flat
 * systems ({ columns, gutter, maxWidth }) keep their values: maxWidth seeds
 * the standard container, columns seed profiles, gutter maps onto a spacing
 * token. Missing profiles/containers are seeded; unknown/custom breakpoint
 * ids are preserved and seeded. Never throws.
 */
export function ensureGridForSystem(system: DesignSystemConfig): GridFoundations {
  const raw = system.foundations.grid as unknown;
  const record = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const defaults = defaultGrid();

  const legacyColumns =
    Number.isInteger(record["columns"]) && (record["columns"] as number) >= 1 && (record["columns"] as number) <= 12
      ? (record["columns"] as number)
      : defaults.columns;
  const legacyGutter = typeof record["gutter"] === "string" ? (record["gutter"] as string) : defaults.gutter;
  const legacyMaxWidth = typeof record["maxWidth"] === "string" ? (record["maxWidth"] as string) : defaults.maxWidth;

  const spacingIds = spacingIdsOf(system);
  const breakpointIds = breakpointIdsOf(system);

  // Containers: preserve valid stored entries, seed missing canonical ids.
  const storedContainers = Array.isArray(record["containers"])
    ? (record["containers"] as unknown[]).map(cleanContainer).filter((c): c is GridContainer => c !== null)
    : [];
  const byId = new Map(storedContainers.map((c) => [c.id, c]));
  const containers: GridContainer[] = [];
  for (const seed of defaults.containers) {
    const existing = byId.get(seed.id);
    if (existing) {
      containers.push({ ...existing });
      byId.delete(seed.id);
    } else if (seed.id === "standard" && parseContainerValue(legacyMaxWidth) !== null) {
      // Preserve the user's legacy maxWidth on the standard container.
      containers.push({ ...seed, value: legacyMaxWidth.trim() });
    } else {
      containers.push({ ...seed });
    }
  }
  // Preserve unknown/custom containers alphabetically after canonical ones.
  for (const extra of [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    containers.push({ ...extra });
  }

  // Profiles: preserve valid stored entries, seed missing breakpoint ids.
  const gutterToken = mapLegacyGutterToToken(legacyGutter, system);
  const storedProfiles = Array.isArray(record["profiles"])
    ? (record["profiles"] as unknown[])
        .map((entry) => cleanProfile(entry, spacingIds))
        .filter((p): p is GridBreakpointProfile => p !== null)
    : [];
  const profileById = new Map(storedProfiles.map((p) => [p.breakpointId, p]));
  const profiles: GridBreakpointProfile[] = breakpointIds.map((id, index) => {
    const existing = profileById.get(id);
    if (existing) {
      profileById.delete(id);
      return { ...existing };
    }
    return {
      breakpointId: id,
      columns: defaultColumnsForPosition(index, legacyColumns),
      gutter: spacingIds.has(gutterToken) ? gutterToken : "space-4",
      columnGap: spacingIds.has("space-4") ? "space-4" : gutterToken,
      rowGap: spacingIds.has("space-4") ? "space-4" : gutterToken,
    };
  });
  // Preserve profiles for breakpoint ids no longer in the scale (e.g. a
  // deleted custom breakpoint whose config must not be silently lost).
  for (const orphan of [...profileById.values()].sort((a, b) => (a.breakpointId < b.breakpointId ? -1 : 1))) {
    profiles.push({ ...orphan });
  }

  const defaultContainer =
    typeof record["defaultContainer"] === "string" &&
    containers.some((c) => c.id === (record["defaultContainer"] as string))
      ? (record["defaultContainer"] as string)
      : "standard";

  return {
    columns: legacyColumns,
    gutter: legacyGutter,
    maxWidth: legacyMaxWidth,
    containers: containers.map((c) => ({ ...c })),
    profiles: profiles.map((p) => ({ ...p })),
    defaultContainer,
  };
}

function withGrid(system: DesignSystemConfig, grid: GridFoundations): DesignSystemConfig {
  return {
    ...system,
    foundations: {
      ...system.foundations,
      grid: {
        columns: grid.columns,
        gutter: grid.gutter,
        maxWidth: grid.maxWidth,
        containers: grid.containers.map((c) => ({ ...c })),
        profiles: grid.profiles.map((p) => ({ ...p })),
        defaultContainer: grid.defaultContainer,
      },
    },
  };
}

function starterGridReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

// ---------------------------------------------------------------------------
// Resolution (mobile-first inheritance)
// ---------------------------------------------------------------------------

/** Ordered breakpoint ids for the system (ascending threshold). */
export function orderedBreakpointIds(system: DesignSystemConfig): string[] {
  return breakpointIdsOf(system);
}

/**
 * Effective profile for a breakpoint id: exact match, else nearest lower
 * breakpoint's profile (mobile-first inheritance), else base/first profile.
 */
export function effectiveProfile(
  system: DesignSystemConfig,
  breakpointId: string,
): GridBreakpointProfile {
  const grid = ensureGridForSystem(system);
  const order = orderedBreakpointIds(system);
  const byId = new Map(grid.profiles.map((p) => [p.breakpointId, p]));
  const exact = byId.get(breakpointId);
  if (exact) return { ...exact };
  const index = order.indexOf(breakpointId);
  if (index > 0) {
    for (let i = index - 1; i >= 0; i -= 1) {
      const fallback = byId.get(order[i]!);
      if (fallback) return { ...fallback, breakpointId };
    }
  }
  const first = grid.profiles[0]!;
  return { ...first, breakpointId };
}

/**
 * Resolve the effective Grid configuration for a viewport width.
 * Uses `activeBreakpoint` so threshold edits shift activation without
 * touching stored column/gutter values.
 */
export function resolveGridForWidth(
  system: DesignSystemConfig,
  widthPx: number,
): { breakpointId: string; profile: GridBreakpointProfile } {
  const active = activeBreakpoint(system, widthPx);
  return { breakpointId: active.id, profile: effectiveProfile(system, active.id) };
}

/** A human-readable grid contract for documentation and PDF export. */
export interface GridExportSummary {
  defaultContainer: { id: string; label: string; value: string; description?: string };
  containers: Array<{ id: string; label: string; value: string; description?: string }>;
  profiles: Array<{
    breakpointId: string;
    threshold: string;
    columns: number;
    gutter: { token: string; value: string | null };
    columnGap: { token: string; value: string | null };
    rowGap: { token: string; value: string | null };
  }>;
}

function gridSpaceValue(system: DesignSystemConfig, id: string): string | null {
  return system.foundations.spacing?.scale.find((token) => token.id === id)?.value
    ?? system.foundations.sizing?.tokens.find((token) => token.id === id)?.value
    ?? null;
}

export function gridExportSummary(system: DesignSystemConfig): GridExportSummary {
  const grid = ensureGridForSystem(system);
  const defaultContainer = grid.containers.find((container) => container.id === grid.defaultContainer) ?? grid.containers[0]!;
  return {
    defaultContainer: { ...defaultContainer },
    containers: grid.containers.map((container) => ({ ...container })),
    profiles: ensureBreakpointScale(system.foundations.breakpoints?.scale).map((breakpoint) => {
      const profile = effectiveProfile(system, breakpoint.id);
      return {
        breakpointId: breakpoint.id,
        threshold: breakpoint.value,
        columns: profile.columns,
        gutter: { token: profile.gutter, value: gridSpaceValue(system, profile.gutter) },
        columnGap: { token: profile.columnGap, value: gridSpaceValue(system, profile.columnGap) },
        rowGap: { token: profile.rowGap, value: gridSpaceValue(system, profile.rowGap) },
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Containers
// ---------------------------------------------------------------------------

export type GridMutation = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

export interface CreateContainerInput {
  id?: string;
  label?: string;
  description?: string;
  value: string;
}

export function createContainer(
  system: DesignSystemConfig,
  input: CreateContainerInput,
): { ok: true; container: GridContainer } | { ok: false; error: string } {
  const grid = ensureGridForSystem(system);
  const existing = grid.containers.map((c) => c.id);
  const label = (input.label ?? "").trim().slice(0, 60);
  const requested = (input.id ?? "").trim();
  let id: string;
  if (requested) {
    const slug = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
    if (!isTokenIdSafe(slug)) {
      return { ok: false, error: "That container id is not URL-safe. Use lowercase letters, numbers, and dashes." };
    }
    if (existing.includes(slug)) return { ok: false, error: `Container id "${slug}" is already in use.` };
    id = slug;
  } else {
    if (!label) return { ok: false, error: "Give the container a name." };
    id = slugifyGridId(label, existing);
  }
  if (parseContainerValue(input.value) === null) {
    return { ok: false, error: "Enter a container width like 1200px, 75rem, or 100% for full-bleed." };
  }
  const description = (input.description ?? "").trim().slice(0, 140);
  return {
    ok: true,
    container: {
      id,
      label: label || humanGridLabel(id),
      value: input.value.trim(),
      ...(description ? { description } : {}),
    },
  };
}

export function insertContainer(system: DesignSystemConfig, container: GridContainer): DesignSystemConfig {
  const grid = ensureGridForSystem(system);
  const next = grid.containers.filter((c) => c.id !== container.id);
  // Canonical ids keep canonical order; customs append alphabetically.
  const order = [...GRID_CONTAINER_IDS, ...next.map((c) => c.id).filter((id) => !(GRID_CONTAINER_IDS as readonly string[]).includes(id)).sort()];
  next.push({ ...container });
  next.sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.id < b.id ? -1 : 1;
  });
  return withGrid(system, { ...grid, containers: next });
}

export function updateContainerValue(system: DesignSystemConfig, id: string, value: string): GridMutation {
  if (parseContainerValue(value) === null) {
    return { ok: false, error: "Enter a container width like 1200px, 75rem, or 100% for full-bleed." };
  }
  const grid = ensureGridForSystem(system);
  if (!grid.containers.some((c) => c.id === id)) return { ok: false, error: "That container no longer exists." };
  return {
    ok: true,
    system: withGrid(system, {
      ...grid,
      containers: grid.containers.map((c) => (c.id === id ? { ...c, value: value.trim() } : c)),
    }),
  };
}

export function updateContainerLabel(system: DesignSystemConfig, id: string, label: string): DesignSystemConfig {
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) return system;
  const grid = ensureGridForSystem(system);
  return withGrid(system, {
    ...grid,
    containers: grid.containers.map((c) => (c.id === id ? { ...c, label: trimmed } : c)),
  });
}

export function updateContainerDescription(system: DesignSystemConfig, id: string, description: string): DesignSystemConfig {
  const trimmed = description.trim().slice(0, 140);
  const grid = ensureGridForSystem(system);
  return withGrid(system, {
    ...grid,
    containers: grid.containers.map((c) => {
      if (c.id !== id) return c;
      if (trimmed === "") {
        const { description: _removed, ...rest } = c;
        void _removed;
        return rest;
      }
      return { ...c, description: trimmed };
    }),
  });
}

export function setDefaultContainer(system: DesignSystemConfig, id: string): GridMutation {
  const grid = ensureGridForSystem(system);
  if (!grid.containers.some((c) => c.id === id)) return { ok: false, error: "That container no longer exists." };
  return { ok: true, system: withGrid(system, { ...grid, defaultContainer: id }) };
}

export interface GridReference {
  kind: "grid-profile" | "grid-container";
  pointer: string;
  value: string;
}

/** Spacing token ids referenced by Grid profiles (gutter/columnGap/rowGap). */
export function spacingReferencesInGrid(system: DesignSystemConfig): GridReference[] {
  const grid = ensureGridForSystem(system);
  const refs: GridReference[] = [];
  for (const profile of grid.profiles) {
    refs.push({ kind: "grid-profile", pointer: `${profile.breakpointId}.gutter`, value: profile.gutter });
    refs.push({ kind: "grid-profile", pointer: `${profile.breakpointId}.columnGap`, value: profile.columnGap });
    refs.push({ kind: "grid-profile", pointer: `${profile.breakpointId}.rowGap`, value: profile.rowGap });
  }
  return refs;
}

/** True when a spacing/sizing token id is used by any Grid profile. */
export function isSpacingTokenUsedByGrid(system: DesignSystemConfig, tokenId: string): boolean {
  return spacingReferencesInGrid(system).some((ref) => ref.value === tokenId);
}

/** Breakpoint ids with stored Grid profiles. Deleting any of these must be blocked upstream. */
export function breakpointIdsWithGridProfiles(system: DesignSystemConfig): string[] {
  return ensureGridForSystem(system).profiles.map((p) => p.breakpointId);
}

export type ContainerDeleteGuard = { ok: true } | { ok: false; reasons: string[] };

export function canDeleteContainer(system: DesignSystemConfig, id: string): ContainerDeleteGuard {
  const grid = ensureGridForSystem(system);
  if (!grid.containers.some((c) => c.id === id)) {
    return { ok: false, reasons: ["That container no longer exists."] };
  }
  if (grid.containers.length <= 1) {
    return { ok: false, reasons: ["This is the last container. A grid needs at least one container width to stay valid."] };
  }
  if (grid.defaultContainer === id) {
    return { ok: false, reasons: [`"${id}" is the default container. Choose another default before deleting it.`] };
  }
  return { ok: true };
}

export function removeContainer(system: DesignSystemConfig, id: string): DesignSystemConfig {
  const grid = ensureGridForSystem(system);
  return withGrid(system, { ...grid, containers: grid.containers.filter((c) => c.id !== id) });
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export function updateProfileColumns(system: DesignSystemConfig, breakpointId: string, columns: number): GridMutation {
  if (!Number.isInteger(columns) || columns < 1 || columns > 12) {
    return { ok: false, error: "Columns must be a whole number from 1 to 12." };
  }
  const grid = ensureGridForSystem(system);
  const order = orderedBreakpointIds(system);
  // Seed orphan ids (custom breakpoints added after profiles were stored).
  const ids = new Set(grid.profiles.map((p) => p.breakpointId));
  let profiles = [...grid.profiles];
  if (!ids.has(breakpointId) && (order.includes(breakpointId) || isTokenIdSafe(breakpointId))) {
    profiles.push({ ...effectiveProfile(system, breakpointId), breakpointId });
  }
  if (!profiles.some((p) => p.breakpointId === breakpointId)) {
    return { ok: false, error: "That breakpoint no longer exists." };
  }
  profiles = profiles.map((p) => (p.breakpointId === breakpointId ? { ...p, columns } : p));
  return { ok: true, system: withGrid(system, { ...grid, profiles }) };
}

export function updateProfileGap(
  system: DesignSystemConfig,
  breakpointId: string,
  slot: "gutter" | "columnGap" | "rowGap",
  tokenId: string,
): GridMutation {
  const ids = spacingIdsOf(system);
  if (!ids.has(tokenId)) {
    return { ok: false, error: `"${tokenId}" is not a spacing token in this system. Choose an existing spacing token.` };
  }
  const grid = ensureGridForSystem(system);
  const order = orderedBreakpointIds(system);
  let profiles = [...grid.profiles];
  if (!profiles.some((p) => p.breakpointId === breakpointId) && (order.includes(breakpointId) || isTokenIdSafe(breakpointId))) {
    profiles.push({ ...effectiveProfile(system, breakpointId), breakpointId });
  }
  if (!profiles.some((p) => p.breakpointId === breakpointId)) {
    return { ok: false, error: "That breakpoint no longer exists." };
  }
  profiles = profiles.map((p) => (p.breakpointId === breakpointId ? { ...p, [slot]: tokenId } : p));
  return { ok: true, system: withGrid(system, { ...grid, profiles }) };
}

/** Reset one breakpoint profile to its starter value. */
export function resetProfileToStarter(system: DesignSystemConfig, breakpointId: string): DesignSystemConfig | null {
  const starter = ensureGridForSystem(starterGridReference(system));
  const baseline = starter.profiles.find((p) => p.breakpointId === breakpointId);
  if (!baseline) return null;
  const grid = ensureGridForSystem(system);
  if (!grid.profiles.some((p) => p.breakpointId === breakpointId)) return null;
  return withGrid(system, {
    ...grid,
    profiles: grid.profiles.map((p) => (p.breakpointId === breakpointId ? { ...baseline } : p)),
  });
}

/** Restore the full responsive grid (containers + profiles + default) to starter defaults. Legacy flat values are preserved untouched. */
export function restoreStarterGrid(system: DesignSystemConfig): DesignSystemConfig {
  const starter = ensureGridForSystem(starterGridReference(system));
  const grid = ensureGridForSystem(system);
  return withGrid(system, {
    ...grid,
    containers: starter.containers.map((c) => ({ ...c })),
    profiles: starter.profiles
      .filter((p) => orderedBreakpointIds(system).includes(p.breakpointId) || grid.profiles.some((q) => q.breakpointId === p.breakpointId))
      .map((p) => ({ ...p })),
    defaultContainer: starter.defaultContainer,
  });
}

// ---------------------------------------------------------------------------
// Presets, diffs, edits
// ---------------------------------------------------------------------------

export interface GridPreset {
  id: string;
  label: string;
  description: string;
  containers: GridContainer[];
  profiles: GridBreakpointProfile[];
  defaultContainer: string;
}

function presetGrid(
  containers: Array<[string, string, string, string?]>,
  profiles: Array<[string, number, string, string, string]>,
  defaultContainer = "standard",
): Pick<GridPreset, "containers" | "profiles" | "defaultContainer"> {
  return {
    containers: containers.map(([id, label, value, description]) => ({
      id,
      label,
      value,
      ...(description ? { description } : {}),
    })),
    profiles: profiles.map(([breakpointId, columns, gutter, columnGap, rowGap]) => ({
      breakpointId,
      columns,
      gutter,
      columnGap,
      rowGap,
    })),
    defaultContainer,
  };
}

const CANONICAL_CONTAINERS: Array<[string, string, string, string?]> = [
  ["narrow", "Narrow", "640px", "Compact content and small dialogs."],
  ["reading", "Reading", "768px", "Comfortable text measure."],
  ["standard", "Standard", "1200px", "Default page container."],
  ["wide", "Wide", "1440px", "Data-heavy dashboards."],
  ["full", "Full", "100%", "Full-bleed sections."],
];

/** Optional starting points. Applying one replaces containers + profiles; legacy flat values and breakpoints stay untouched. */
export const GRID_PRESETS: GridPreset[] = [
  {
    id: "saas",
    label: "Product/SaaS",
    description: "Balanced 12-column product grid with comfortable gutters.",
    ...presetGrid(CANONICAL_CONTAINERS, [
      ["base", 4, "space-4", "space-4", "space-4"],
      ["sm", 6, "space-4", "space-4", "space-4"],
      ["md", 8, "space-5", "space-4", "space-5"],
      ["lg", 12, "space-6", "space-5", "space-5"],
      ["xl", 12, "space-6", "space-5", "space-5"],
      ["2xl", 12, "space-6", "space-5", "space-5"],
    ]),
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Reading-measure default with generous row rhythm.",
    ...presetGrid(CANONICAL_CONTAINERS, [
      ["base", 4, "space-4", "space-4", "space-5"],
      ["sm", 6, "space-4", "space-4", "space-5"],
      ["md", 8, "space-5", "space-5", "space-6"],
      ["lg", 12, "space-5", "space-5", "space-6"],
      ["xl", 12, "space-6", "space-5", "space-6"],
      ["2xl", 12, "space-6", "space-5", "space-6"],
    ], "reading"),
  },
  {
    id: "dashboard",
    label: "Data dashboard",
    description: "Dense 12-column grid with tight gaps for tables and cards.",
    ...presetGrid(CANONICAL_CONTAINERS, [
      ["base", 4, "space-3", "space-3", "space-3"],
      ["sm", 6, "space-3", "space-3", "space-3"],
      ["md", 8, "space-4", "space-3", "space-4"],
      ["lg", 12, "space-4", "space-4", "space-4"],
      ["xl", 12, "space-4", "space-4", "space-4"],
      ["2xl", 12, "space-5", "space-4", "space-4"],
    ], "wide"),
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Product-card grid with roomy gutters at desktop.",
    ...presetGrid(CANONICAL_CONTAINERS, [
      ["base", 2, "space-3", "space-3", "space-4"],
      ["sm", 4, "space-4", "space-4", "space-4"],
      ["md", 8, "space-4", "space-4", "space-5"],
      ["lg", 12, "space-5", "space-4", "space-5"],
      ["xl", 12, "space-6", "space-5", "space-5"],
      ["2xl", 12, "space-6", "space-5", "space-5"],
    ]),
  },
];

export function applyGridPreset(system: DesignSystemConfig, preset: GridPreset): DesignSystemConfig {
  const grid = ensureGridForSystem(system);
  const order = new Set(orderedBreakpointIds(system));
  // Keep custom-breakpoint profiles; replace known ids with preset values.
  const custom = grid.profiles.filter((p) => !order.has(p.breakpointId));
  const next = preset.profiles
    .filter((p) => order.has(p.breakpointId))
    .map((p) => ({ ...p }));
  // Seed any breakpoint ids the preset does not name (custom ids).
  for (const id of order) {
    if (!next.some((p) => p.breakpointId === id)) {
      next.push({ ...effectiveProfile(system, id), breakpointId: id });
    }
  }
  return withGrid(system, {
    ...grid,
    containers: preset.containers.map((c) => ({ ...c })),
    profiles: [...next, ...custom.map((p) => ({ ...p }))],
    defaultContainer: preset.containers.some((c) => c.id === preset.defaultContainer)
      ? preset.defaultContainer
      : "standard",
  });
}

export interface GridDiff {
  containersChanged: Array<{ id: string; from: string; to: string }>;
  containersAdded: GridContainer[];
  containersRemoved: GridContainer[];
  profilesChanged: Array<{ breakpointId: string; from: string; to: string }>;
}

/** Before/after summary for preset confirmation copy. */
export function diffGrids(current: GridFoundations, next: GridFoundations): GridDiff {
  const curC = new Map(current.containers.map((c) => [c.id, c]));
  const nextC = new Map(next.containers.map((c) => [c.id, c]));
  const containersAdded = next.containers.filter((c) => !curC.has(c.id));
  const containersRemoved = current.containers.filter((c) => !nextC.has(c.id));
  const containersChanged: GridDiff["containersChanged"] = [];
  for (const c of next.containers) {
    const from = curC.get(c.id);
    if (from && (from.value !== c.value || from.label !== c.label)) {
      containersChanged.push({ id: c.id, from: `${from.label}: ${from.value}`, to: `${c.label}: ${c.value}` });
    }
  }
  const curP = new Map(current.profiles.map((p) => [p.breakpointId, p]));
  const profilesChanged: GridDiff["profilesChanged"] = [];
  for (const p of next.profiles) {
    const from = curP.get(p.breakpointId);
    if (!from) {
      profilesChanged.push({ breakpointId: p.breakpointId, from: "(none)", to: `${p.columns} cols` });
    } else if (
      from.columns !== p.columns ||
      from.gutter !== p.gutter ||
      from.columnGap !== p.columnGap ||
      from.rowGap !== p.rowGap
    ) {
      profilesChanged.push({
        breakpointId: p.breakpointId,
        from: `${from.columns} cols · ${from.gutter}/${from.columnGap}/${from.rowGap}`,
        to: `${p.columns} cols · ${p.gutter}/${p.columnGap}/${p.rowGap}`,
      });
    }
  }
  return { containersChanged, containersAdded, containersRemoved, profilesChanged };
}

/** True when containers/profiles/default differ from the selected starter default. */
export function hasCustomGridEdits(system: DesignSystemConfig): boolean {
  const starter = ensureGridForSystem(starterGridReference(system));
  const current = ensureGridForSystem(system);
  const diff = diffGrids(starter, current);
  return (
    diff.containersChanged.length > 0 ||
    diff.containersAdded.length > 0 ||
    diff.containersRemoved.length > 0 ||
    diff.profilesChanged.length > 0 ||
    starter.defaultContainer !== current.defaultContainer
  );
}

/** Grid-relevant validator issues for the current system. */
export function gridIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("foundations.grid"));
}
