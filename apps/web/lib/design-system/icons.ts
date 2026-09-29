// Icon editing logic for the Icons foundation editor (Step 7F).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// `IconFoundations` shapes directly; no parallel model. Sizes are ordered
// tokens with stable ids (labels edit freely); colors stay palette-shade
// references so palette edits flow through. Lucide is the only rendered
// source; "custom" is metadata-only until an SVG pipeline exists.

import {
  defaultIcons,
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
  type IconColorRole,
  type IconLineCap,
  type IconLineJoin,
  type IconSizeToken,
  type ValidationIssue,
} from "./domain";
import { createSystemFromStarter } from "./starters";

export const ICON_SIZE_UNITS = ["px", "rem"] as const;
export type IconSizeUnit = (typeof ICON_SIZE_UNITS)[number];

/** Display order for well-known ids; unknown ids sort after, alphabetically. */
const WELL_KNOWN_SIZES = ["icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"];

export const ICON_COLOR_ROLES: ReadonlyArray<{ id: IconColorRole; label: string }> = [
  { id: "default", label: "Default" },
  { id: "muted", label: "Muted" },
  { id: "action", label: "Action" },
  { id: "success", label: "Success" },
  { id: "warning", label: "Warning" },
  { id: "danger", label: "Danger" },
];

export function iconColorRoleLabel(role: IconColorRole): string {
  return ICON_COLOR_ROLES.find((entry) => entry.id === role)?.label ?? role;
}

/** Rendered icon sources. Anything else is treated as metadata-only custom. */
export const ICON_SOURCES = ["lucide", "custom"] as const;
export type IconSource = (typeof ICON_SOURCES)[number];

export function isRenderedSource(library: string): boolean {
  return library === "lucide";
}

export interface ParsedIconSize {
  amount: number;
  unit: IconSizeUnit;
}

/** Non-negative px/rem length. Bare numbers become px. */
export function parseIconSize(value: unknown): ParsedIconSize | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) return boundedSize(Number.parseFloat(bare[1]!), "px");
  const match = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(text);
  if (!match) return null;
  return boundedSize(Number.parseFloat(match[1]!), match[2]! as IconSizeUnit);
}

function boundedSize(amount: number, unit: IconSizeUnit): ParsedIconSize | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "px" && amount > 256) return null;
  if (unit === "rem" && amount > 16) return null;
  return { amount: Math.round(amount * 100) / 100, unit };
}

export function formatIconSize(parsed: ParsedIconSize): string {
  return `${parsed.amount}${parsed.unit}`;
}

/** Pixel value for rendering. rem resolves against a 16px root. */
export function pxOfIconSize(token: IconSizeToken, rootPx = 16): number | null {
  const parsed = parseIconSize(token.value);
  if (!parsed) return null;
  return parsed.unit === "px" ? parsed.amount : parsed.amount * rootPx;
}

/** Suggested display label for a new id ("my-glyph" → "My glyph"). */
export function humanIconLabel(id: string): string {
  const words = id.replace(/[_]+/g, "-").split("-").filter(Boolean);
  if (words.length === 0) return id;
  const [first, ...rest] = words as [string, ...string[]];
  return [first[0]!.toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** URL/token-safe id from free text. Empty-safe ("!!!" → "token"). */
export function slugifyIconId(raw: string, existingIds: readonly string[]): string {
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

function orderSizes(tokens: IconSizeToken[]): IconSizeToken[] {
  const seen = new Set<string>();
  const unique = tokens.filter((token) => {
    if (seen.has(token.id)) return false;
    seen.add(token.id);
    return true;
  });
  if (unique.length === 0) return unique;
  const rank = (id: string): number => {
    const index = WELL_KNOWN_SIZES.indexOf(id);
    return index === -1 ? WELL_KNOWN_SIZES.length : index;
  };
  return [...unique].sort((a, b) => {
    const order = rank(a.id) - rank(b.id);
    if (order !== 0) return order;
    return a.id < b.id ? -1 : 1;
  });
}

function cleanSize(token: unknown): IconSizeToken | null {
  if (typeof token !== "object" || token === null) return null;
  const entry = token as { id?: unknown; label?: unknown; value?: unknown; description?: unknown };
  if (typeof entry.id !== "string" || !isTokenIdSafe(entry.id)) return null;
  if (typeof entry.value !== "string" || entry.value.trim() === "") return null;
  const label =
    typeof entry.label === "string" && entry.label.trim() !== ""
      ? entry.label.trim().slice(0, 60)
      : humanIconLabel(entry.id);
  const clean: IconSizeToken = { id: entry.id, label, value: entry.value.trim() };
  if (typeof entry.description === "string" && entry.description.trim() !== "") {
    clean.description = entry.description.trim().slice(0, 140);
  }
  return clean;
}

/**
 * Normalize any stored size scale into an ordered token list. Legacy pre-7F
 * Record shapes map onto the well-known order; missing/invalid scales fall
 * back to canonical defaults. Never throws; never returns an empty list.
 */
export function ensureIconSizes(scale: unknown): IconSizeToken[] {
  if (Array.isArray(scale)) {
    const ordered = orderSizes(
      scale.map(cleanSize).filter((token): token is IconSizeToken => token !== null),
    );
    if (ordered.length > 0) return ordered;
  } else if (typeof scale === "object" && scale !== null) {
    const record = scale as Record<string, unknown>;
    const tokens = Object.entries(record)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && (entry[1] as string).trim() !== "")
      .map(([id, value]) => ({ id, label: humanIconLabel(id), value: (value as string).trim() }));
    const ordered = orderSizes(tokens.filter((token) => isTokenIdSafe(token.id)));
    if (ordered.length > 0) return ordered;
  }
  return defaultIcons().sizes.map((token) => ({ ...token }));
}

function sizesOf(system: DesignSystemConfig): IconSizeToken[] {
  return ensureIconSizes(system.foundations.icons?.sizes);
}

function colorsOf(system: DesignSystemConfig): Record<IconColorRole, string> {
  const stored = (system.foundations.icons?.colors ?? {}) as Partial<Record<IconColorRole, string>>;
  const fallback = defaultIcons().colors;
  return {
    default: stored.default ?? fallback.default,
    muted: stored.muted ?? fallback.muted,
    action: stored.action ?? fallback.action,
    success: stored.success ?? fallback.success,
    warning: stored.warning ?? fallback.warning,
    danger: stored.danger ?? fallback.danger,
  };
}

function withIcons(
  system: DesignSystemConfig,
  patch: Partial<{
    library: string;
    defaultSize: string;
    sizes: IconSizeToken[];
    strokeWidth: number;
    lineCap: IconLineCap;
    lineJoin: IconLineJoin;
    colors: Record<IconColorRole, string>;
  }>,
): DesignSystemConfig {
  const current = system.foundations.icons;
  return {
    ...system,
    foundations: {
      ...system.foundations,
      icons: {
        library: patch.library ?? current.library,
        defaultSize: patch.defaultSize ?? current.defaultSize,
        sizes: patch.sizes ? patch.sizes.map((token) => ({ ...token })) : sizesOf(system),
        strokeWidth: patch.strokeWidth ?? current.strokeWidth,
        ...(patch.lineCap !== undefined
          ? { lineCap: patch.lineCap }
          : current.lineCap !== undefined
            ? { lineCap: current.lineCap }
            : {}),
        ...(patch.lineJoin !== undefined
          ? { lineJoin: patch.lineJoin }
          : current.lineJoin !== undefined
            ? { lineJoin: current.lineJoin }
            : {}),
        colors: { ...colorsOf(system), ...(patch.colors ?? {}) },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Source, style, and size-value editing
// ---------------------------------------------------------------------------

export type SetSourceResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

/** Only "lucide" (rendered) and "custom" (metadata-only future pipeline) are selectable. */
export function setIconSource(system: DesignSystemConfig, library: string): SetSourceResult {
  if (library !== "lucide" && library !== "custom") {
    return { ok: false, error: 'Select "lucide" or "custom". Other libraries are not available.' };
  }
  return { ok: true, system: withIcons(system, { library }) };
}

export type SetNumberResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

/** Stroke width in Lucide units (0.5–4). Rendered 1:1 at 24px. */
export function setStrokeWidth(system: DesignSystemConfig, width: number): SetNumberResult {
  if (!Number.isFinite(width) || width < 0.5 || width > 4) {
    return { ok: false, error: "Enter a stroke width from 0.5 to 4." };
  }
  return { ok: true, system: withIcons(system, { strokeWidth: Math.round(width * 100) / 100 }) };
}

export const LINE_CAPS: readonly IconLineCap[] = ["round", "butt", "square"];
export const LINE_JOINS: readonly IconLineJoin[] = ["round", "miter", "bevel"];

export function setLineCap(system: DesignSystemConfig, cap: IconLineCap): SetNumberResult {
  if (!LINE_CAPS.includes(cap)) {
    return { ok: false, error: "Line cap must be round, butt, or square." };
  }
  return { ok: true, system: withIcons(system, { lineCap: cap }) };
}

export function setLineJoin(system: DesignSystemConfig, join: IconLineJoin): SetNumberResult {
  if (!LINE_JOINS.includes(join)) {
    return { ok: false, error: "Line join must be round, miter, or bevel." };
  }
  return { ok: true, system: withIcons(system, { lineJoin: join }) };
}

/** Sensible stroke presets. Values apply to the rendered Lucide icons. */
export const STROKE_PRESETS = [
  { id: "thin", label: "Thin", width: 1, description: "Delicate lines for quiet interfaces." },
  { id: "subtle", label: "Subtle", width: 1.5, description: "Softer than standard, still crisp." },
  { id: "standard", label: "Standard", width: 2, description: "The Lucide default. Start here." },
  { id: "strong", label: "Strong", width: 2.5, description: "Bold strokes for emphasis." },
] as const;

export function setDefaultSize(system: DesignSystemConfig, tokenId: string): SetNumberResult {
  if (!sizesOf(system).some((token) => token.id === tokenId)) {
    return { ok: false, error: `Size "${tokenId}" does not exist in this system.` };
  }
  return { ok: true, system: withIcons(system, { defaultSize: tokenId }) };
}

export interface CreateSizeInput {
  /** Optional explicit id; otherwise derived from the label. */
  id?: string;
  /** Visible label; used to derive the id when id is omitted. */
  label?: string;
  description?: string;
  amount: number;
  unit: IconSizeUnit;
}

export type CreateSizeResult = { ok: true; token: IconSizeToken } | { ok: false; error: string };

export function createIconSize(
  input: CreateSizeInput,
  existingIds: readonly string[],
): CreateSizeResult {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    return { ok: false, error: "Enter a size of 0 or more." };
  }
  if (!ICON_SIZE_UNITS.includes(input.unit)) {
    return { ok: false, error: "Use px or rem." };
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
    id = slugifyIconId(label, existingIds);
  }
  const parsed = boundedSize(input.amount, input.unit);
  if (!parsed) return { ok: false, error: "Enter a size of 0 or more (max 256px / 16rem)." };
  const description = (input.description ?? "").trim().slice(0, 140);
  return {
    ok: true,
    token: {
      id,
      label: label || humanIconLabel(id),
      value: `${parsed.amount}${parsed.unit}`,
      ...(description ? { description } : {}),
    },
  };
}

/** Change one size value; nothing else moves. */
export function updateIconSize(
  system: DesignSystemConfig,
  tokenId: string,
  amount: number,
  unit: IconSizeUnit,
): DesignSystemConfig {
  const parsed = boundedSize(amount, unit);
  if (!parsed) return system;
  return withIcons(system, {
    sizes: sizesOf(system).map((token) =>
      token.id === tokenId ? { ...token, value: `${parsed.amount}${parsed.unit}` } : token,
    ),
  });
}

/** Rename a size's visible label; the stable id never changes. */
export function updateIconLabel(system: DesignSystemConfig, tokenId: string, label: string): DesignSystemConfig {
  const trimmed = label.trim().slice(0, 60);
  if (!trimmed) return system;
  return withIcons(system, {
    sizes: sizesOf(system).map((token) => (token.id === tokenId ? { ...token, label: trimmed } : token)),
  });
}

/** Independent copy with a fresh unique id; safe to edit or delete. */
export function duplicateIconSize(system: DesignSystemConfig, tokenId: string): IconSizeToken | null {
  const current = sizesOf(system).find((token) => token.id === tokenId);
  if (!current) return null;
  const existing = sizesOf(system).map((token) => token.id);
  const base = `${current.id}-copy`;
  let copyId = base;
  let counter = 2;
  while (existing.includes(copyId)) {
    copyId = `${base}-${counter}`;
    counter += 1;
  }
  return { ...current, id: copyId, label: `${current.label} copy` };
}

/** Remove one size (guard with canDeleteIconSize first). */
export function removeIconSize(system: DesignSystemConfig, tokenId: string): DesignSystemConfig {
  const next = sizesOf(system).filter((token) => token.id !== tokenId);
  const deflated = withIcons(system, { sizes: next });
  // Keep the default pointing at a surviving token.
  if (system.foundations.icons.defaultSize === tokenId && next.length > 0) {
    return withIcons(deflated, { defaultSize: next[0]!.id });
  }
  return deflated;
}

export interface IconReference {
  kind: "semantic" | "theme" | "component";
  /** Human-readable pointer, e.g. `component.badge.icon`. */
  pointer: string;
  value: string;
}

/**
 * Find every stored value that references an icon size id by exact match.
 * Ids carry no sub-paths, so only exact equality counts as a reference.
 */
export function findIconReferences(system: DesignSystemConfig, tokenId: string): IconReference[] {
  const references: IconReference[] = [];
  const seen = new Set<string>();
  const push = (reference: IconReference): void => {
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

export type IconDeleteGuard = { ok: true } | { ok: false; reasons: string[]; references: IconReference[] };

/** Never the last usable size, never the default size, never a referenced size. */
export function canDeleteIconSize(system: DesignSystemConfig, tokenId: string): IconDeleteGuard {
  const tokens = sizesOf(system);
  if (!tokens.some((token) => token.id === tokenId)) {
    return { ok: false, reasons: ["That token no longer exists."], references: [] };
  }
  if (tokens.length <= 1) {
    return {
      ok: false,
      reasons: ["This is the last icon size. A scale needs at least one size to stay valid."],
      references: [],
    };
  }
  const references = findIconReferences(system, tokenId);
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
  if (system.foundations.icons.defaultSize === tokenId) {
    return {
      ok: false,
      reasons: [`${tokenId} is the default icon size. Pick another default before deleting it.`],
      references: [],
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Color roles (palette-shade references; resolved live, never duplicated)
// ---------------------------------------------------------------------------

export type SetColorResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

/** Point a color role at a palette shade, semantic alias, or raw hex fallback. */
export function setIconColor(system: DesignSystemConfig, role: IconColorRole, reference: string): SetColorResult {
  if (!ICON_COLOR_ROLES.some((entry) => entry.id === role)) {
    return { ok: false, error: `Unknown icon color role "${role}".` };
  }
  const value = reference.trim();
  if (value === "") return { ok: false, error: "Pick a palette shade or enter a hex fallback." };
  if (resolveBorderColorLike(system, value) === null) {
    return { ok: false, error: `Color "${value}" does not resolve. Pick a palette shade, semantic alias, or six-digit hex.` };
  }
  return { ok: true, system: withIcons(system, { colors: { ...colorsOf(system), [role]: value } }) };
}

function resolveBorderColorLike(system: DesignSystemConfig, ref: string): string | null {
  const resolved = resolveToken(system, ref);
  return resolved.status === "resolved" ? resolved.value : null;
}

/** Resolve a color role to a renderable color; null when unresolvable. */
export function resolveIconColor(system: DesignSystemConfig, role: IconColorRole, themeId?: string): string | null {
  const ref = colorsOf(system)[role];
  if (typeof ref !== "string") return null;
  const resolved = resolveToken(system, ref, themeId);
  return resolved.status === "resolved" ? resolved.value : null;
}

/** All palette shade references ("neutral.200") plus semantic aliases for pickers. */
export function iconColorOptions(system: DesignSystemConfig): Array<{ value: string; label: string }> {
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
// Starter defaults, diffs, restore
// ---------------------------------------------------------------------------

/** Fresh starter system used for resets and comparisons (never saved). */
export function starterIconReference(system: DesignSystemConfig): DesignSystemConfig {
  return createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name });
}

/** Restore one size to its starter snapshot; null when the starter lacks the id. */
export function resetIconSizeToStarter(system: DesignSystemConfig, tokenId: string): DesignSystemConfig | null {
  const baseline = ensureIconSizes(starterIconReference(system).foundations.icons?.sizes).find(
    (token) => token.id === tokenId,
  );
  if (!baseline) return null;
  return withIcons(system, {
    sizes: sizesOf(system).map((token) => (token.id === tokenId ? { ...baseline } : token)),
  });
}

/** Restore stroke width, caps, and joins to starter defaults (sizes/colors untouched). */
export function resetIconStyleToStarter(system: DesignSystemConfig): DesignSystemConfig {
  const starter = starterIconReference(system).foundations.icons;
  return withIcons(system, {
    strokeWidth: starter.strokeWidth,
    ...(starter.lineCap !== undefined ? { lineCap: starter.lineCap } : {}),
    ...(starter.lineJoin !== undefined ? { lineJoin: starter.lineJoin } : {}),
  });
}

/** Restore the full icon foundation (sizes, stroke, caps, colors) to starter defaults. */
export function restoreStarterIcons(system: DesignSystemConfig): DesignSystemConfig {
  const starter = starterIconReference(system).foundations.icons;
  return withIcons(system, {
    library: starter.library,
    defaultSize: starter.defaultSize,
    sizes: ensureIconSizes(starter.sizes).map((token) => ({ ...token })),
    strokeWidth: starter.strokeWidth,
    ...(starter.lineCap !== undefined ? { lineCap: starter.lineCap } : {}),
    ...(starter.lineJoin !== undefined ? { lineJoin: starter.lineJoin } : {}),
    colors: { ...starter.colors },
  });
}

export interface IconDiff {
  sizesAdded: IconSizeToken[];
  sizesRemoved: IconSizeToken[];
  sizesChanged: Array<{ id: string; from: string; to: string }>;
  settingsChanged: Array<{ id: string; from: string; to: string }>;
  colorsChanged: Array<{ id: string; from: string; to: string }>;
}

function describeSize(token: IconSizeToken): string {
  return `${token.label}: ${token.value}`;
}

/** Before/after summary between current icons and a candidate set. */
export function diffIcons(
  current: { sizes: IconSizeToken[]; strokeWidth: number; lineCap?: string; lineJoin?: string; colors: Record<string, string>; defaultSize: string; library: string },
  next: { sizes: IconSizeToken[]; strokeWidth: number; lineCap?: string; lineJoin?: string; colors: Record<string, string>; defaultSize: string; library: string },
): IconDiff {
  const currentById = new Map(current.sizes.map((token) => [token.id, token]));
  const nextById = new Map(next.sizes.map((token) => [token.id, token]));
  const sizesAdded = next.sizes.filter((token) => !currentById.has(token.id));
  const sizesRemoved = current.sizes.filter((token) => !nextById.has(token.id));
  const sizesChanged: IconDiff["sizesChanged"] = [];
  for (const token of next.sizes) {
    const from = currentById.get(token.id);
    if (from && describeSize(from) !== describeSize(token)) {
      sizesChanged.push({ id: token.id, from: describeSize(from), to: describeSize(token) });
    }
  }
  const settingsChanged: IconDiff["settingsChanged"] = [];
  const settings: Array<[string, unknown, unknown]> = [
    ["strokeWidth", current.strokeWidth, next.strokeWidth],
    ["lineCap", current.lineCap ?? "round", next.lineCap ?? "round"],
    ["lineJoin", current.lineJoin ?? "round", next.lineJoin ?? "round"],
    ["defaultSize", current.defaultSize, next.defaultSize],
    ["library", current.library, next.library],
  ];
  for (const [id, from, to] of settings) {
    if (String(from) !== String(to)) settingsChanged.push({ id, from: String(from), to: String(to) });
  }
  const colorsChanged: IconDiff["colorsChanged"] = [];
  const roles = new Set([...Object.keys(current.colors), ...Object.keys(next.colors)]);
  for (const role of roles) {
    if (current.colors[role] !== next.colors[role]) {
      colorsChanged.push({ id: role, from: current.colors[role] ?? "—", to: next.colors[role] ?? "—" });
    }
  }
  return { sizesAdded, sizesRemoved, sizesChanged, settingsChanged, colorsChanged };
}

/** True when sizes, style, colors, source, or default differ from starter. */
export function hasCustomIconEdits(system: DesignSystemConfig): boolean {
  const starter = starterIconReference(system).foundations.icons;
  const diff = diffIcons(
    {
      sizes: sizesOf(system),
      strokeWidth: system.foundations.icons.strokeWidth,
      lineCap: system.foundations.icons.lineCap,
      lineJoin: system.foundations.icons.lineJoin,
      colors: colorsOf(system),
      defaultSize: system.foundations.icons.defaultSize,
      library: system.foundations.icons.library,
    },
    {
      sizes: ensureIconSizes(starter.sizes),
      strokeWidth: starter.strokeWidth,
      lineCap: starter.lineCap,
      lineJoin: starter.lineJoin,
      colors: starter.colors,
      defaultSize: starter.defaultSize,
      library: starter.library,
    },
  );
  return (
    diff.sizesAdded.length > 0 ||
    diff.sizesRemoved.length > 0 ||
    diff.sizesChanged.length > 0 ||
    diff.settingsChanged.length > 0 ||
    diff.colorsChanged.length > 0
  );
}

/** Resolve a size id to pixels; null when missing or unparsable. */
export function iconSizePx(system: DesignSystemConfig, tokenId: string, rootPx = 16): number | null {
  const token = sizesOf(system).find((entry) => entry.id === tokenId);
  if (!token) return null;
  const parsed = parseIconSize(token.value);
  if (!parsed) return null;
  return parsed.unit === "px" ? parsed.amount : parsed.amount * rootPx;
}

/** Icon-relevant validator issues for the current system. */
export function iconIssues(system: DesignSystemConfig): ValidationIssue[] {
  return validateDesignSystem(system).filter((issue) => issue.path.includes("foundations.icons"));
}
