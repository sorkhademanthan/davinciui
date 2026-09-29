// Palette utilities for the Colors foundation editor (Step 5).
// Pure functions only — no React, no storage. Generation reuses the canonical
// Step 1 `paletteFrom` algorithm so editor output always matches the domain.

import {
  isHexColor,
  paletteFrom,
  resolveToken,
  type DesignSystemConfig,
  type Palette,
  type PaletteRole,
} from "./domain";

/** Canonical 50–950 shade steps, lightest first. */
export const PALETTE_SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

export type PaletteShadeKey = (typeof PALETTE_SHADES)[number];

/** Canonical roles with human-readable labels (never color-only in UI). */
export const PALETTE_ROLES: ReadonlyArray<{ id: PaletteRole; label: string }> = [
  { id: "brand", label: "Brand" },
  { id: "accent", label: "Accent" },
  { id: "neutral", label: "Neutral" },
  { id: "success", label: "Success" },
  { id: "warning", label: "Warning" },
  { id: "danger", label: "Danger" },
  { id: "info", label: "Info" },
  { id: "custom", label: "Custom" },
];

export function paletteRoleLabel(role: PaletteRole): string {
  return PALETTE_ROLES.find((entry) => entry.id === role)?.label ?? "Custom";
}

/**
 * Normalize user input to canonical `#RRGGBB` (uppercase) form.
 * Returns null for anything that is not a valid six-digit hex color.
 */
export function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!isHexColor(trimmed)) return null;
  return `#${trimmed.slice(1).toUpperCase()}`;
}

/**
 * Forgiving input coercion for HEX fields: trims whitespace and accepts a
 * bare six-digit value without `#`. Returns canonical `#RRGGBB` or null.
 */
export function coerceHexInput(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return normalizeHex(trimmed);
}

/**
 * Generate a stable 50–950 scale from a base hex color.
 * Deterministic; the base is preserved at shade "500".
 * Returns null for invalid input — never malformed values.
 */
export function generateScale(base: string): Record<string, string> | null {
  const valid = normalizeHex(base);
  if (!valid) return null;
  // Reuse the canonical Step 1 algorithm (id/label/role are placeholders).
  return { ...paletteFrom(valid, "__preview__", "__preview__", "custom").shades };
}

/**
 * Derive a stable, unique, URL/token-safe palette id from a label.
 * Predictable (`"Favorite Teal"` → `"favorite-teal"`, then `-2`, `-3`…),
 * never empty, never colliding with `existingIds`.
 */
export function slugifyPaletteId(label: string, existingIds: readonly string[]): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "palette";
  if (!existingIds.includes(base)) return base;
  let counter = 2;
  while (existingIds.includes(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

function roleOrCustom(role: unknown): PaletteRole {
  return PALETTE_ROLES.some((entry) => entry.id === role) ? (role as PaletteRole) : "custom";
}

export interface CreatePaletteInput {
  label: string;
  role: PaletteRole;
  base: string;
  /** Optional custom id; derived from the label when omitted. */
  id?: string;
}

export type CreatePaletteResult =
  | { ok: true; palette: Palette }
  | { ok: false; error: string };

/**
 * Create a palette from user input. The initial scale is generated from the
 * caller's base color — never a silent copy of another palette.
 */
export function createPalette(
  input: CreatePaletteInput,
  existingIds: readonly string[],
): CreatePaletteResult {
  const label = input.label.trim();
  if (!label) return { ok: false, error: "Give the palette a name." };
  const base = coerceHexInput(input.base);
  if (!base) return { ok: false, error: "Enter a valid six-digit hex color (e.g. #0F766E)." };
  const requested = input.id?.trim() ?? "";
  let id: string;
  if (requested) {
    const slug = requested
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);
    if (!slug) return { ok: false, error: "That palette id is not URL-safe. Use letters and numbers." };
    if (existingIds.includes(slug)) {
      return { ok: false, error: `Palette id "${slug}" is already in use.` };
    }
    id = slug;
  } else {
    id = slugifyPaletteId(label, existingIds);
  }
  return { ok: true, palette: paletteFrom(base, id, label, roleOrCustom(input.role)) };
}

/**
 * Deep-independent copy with a fresh unique id (`"<id>-copy"`, then `-2`…).
 * Mutating the copy never affects the original.
 */
export function duplicatePalette(palette: Palette, existingIds: readonly string[]): Palette {
  const base = `${palette.id}-copy`;
  let id = base;
  let counter = 2;
  while (existingIds.includes(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return {
    ...palette,
    id,
    label: `${palette.label} copy`,
    shades: { ...palette.shades },
  };
}

/** Remove a palette from a system (pure data operation; guard with canDeletePalette). */
export function removePalette(system: DesignSystemConfig, paletteId: string): DesignSystemConfig {
  return {
    ...system,
    foundations: {
      ...system.foundations,
      colors: {
        ...system.foundations.colors,
        palettes: system.foundations.colors.palettes.filter((palette) => palette.id !== paletteId),
      },
    },
  };
}

export interface PaletteReference {
  kind: "semantic" | "theme" | "component" | "border";
  /** Human-readable pointer, e.g. `action.primary.background` or `Button › background`. */
  pointer: string;
  /** The stored value that routes through the palette. */
  value: string;
}

function mentionsPalette(value: unknown, paletteId: string): boolean {
  return typeof value === "string" && (value === paletteId || value.startsWith(`${paletteId}.`));
}

/**
 * Find every stored value that routes through a palette — directly
 * (`"brand.600"`) or via a semantic alias chain. Used to block unsafe
 * deletion and to show which tokens block removal.
 */
export function findPaletteReferences(
  system: DesignSystemConfig,
  paletteId: string,
): PaletteReference[] {
  const references: PaletteReference[] = [];
  const seen = new Set<string>();
  const push = (reference: PaletteReference): void => {
    const key = `${reference.kind}:${reference.pointer}`;
    if (seen.has(key)) return;
    seen.add(key);
    references.push(reference);
  };

  for (const token of system.semanticTokens ?? []) {
    if (mentionsPalette(token.value, paletteId)) {
      push({ kind: "semantic", pointer: token.id, value: token.value });
      continue;
    }
    // Alias chains: resolve and inspect the dereference path.
    const resolved = resolveToken(system, token.value);
    if (resolved.status === "resolved" && resolved.chain.some((link) => mentionsPalette(link, paletteId))) {
      push({ kind: "semantic", pointer: token.id, value: token.value });
    }
  }

  for (const theme of system.themes ?? []) {
    for (const [tokenId, value] of Object.entries(theme.overrides ?? {})) {
      if (mentionsPalette(value, paletteId)) {
        push({ kind: "theme", pointer: `${theme.label || theme.id} › ${tokenId}`, value });
        continue;
      }
      const resolved = resolveToken(system, value, theme.id);
      if (resolved.status === "resolved" && resolved.chain.some((link) => mentionsPalette(link, paletteId))) {
        push({ kind: "theme", pointer: `${theme.label || theme.id} › ${tokenId}`, value });
      }
    }
  }

  for (const component of system.components ?? []) {
    for (const override of component.overrides ?? []) {
      const pointer = `${component.label || component.component} › ${override.token}${override.variant ? ` (${override.variant})` : ""}${override.state ? ` [${override.state}]` : ""}`;
      if (mentionsPalette(override.value, paletteId)) {
        push({ kind: "component", pointer, value: override.value });
        continue;
      }
      const resolved = resolveToken(system, override.value);
      if (resolved.status === "resolved" && resolved.chain.some((link) => mentionsPalette(link, paletteId))) {
        push({ kind: "component", pointer, value: override.value });
      }
    }
  }

  for (const token of system.foundations?.borders?.tokens ?? []) {
    if (mentionsPalette(token.color, paletteId)) {
      push({ kind: "border", pointer: `Border › ${token.label || token.id}`, value: token.color });
    }
  }

  return references;
}

export type DeleteGuard =
  | { ok: true }
  | { ok: false; reasons: string[]; references: PaletteReference[] };

/**
 * Deletion safety: never the last remaining palette, never a palette with
 * active semantic/theme/component/border references.
 */
export function canDeletePalette(system: DesignSystemConfig, paletteId: string): DeleteGuard {
  const palettes = system.foundations.colors.palettes;
  if (!palettes.some((palette) => palette.id === paletteId)) {
    return { ok: false, reasons: ["That palette no longer exists."], references: [] };
  }
  if (palettes.length <= 1) {
    return {
      ok: false,
      reasons: ["This is the last palette. A system needs at least one palette to stay valid."],
      references: [],
    };
  }
  const references = findPaletteReferences(system, paletteId);
  if (references.length > 0) {
    const names = references.slice(0, 4).map((reference) => reference.pointer);
    const more = references.length > 4 ? ` and ${references.length - 4} more` : "";
    return {
      ok: false,
      reasons: [
        `In use by ${references.length} token${references.length === 1 ? "" : "s"}: ${names.join(", ")}${more}. Re-point those tokens before deleting.`,
      ],
      references,
    };
  }
  return { ok: true };
}

/**
 * Shade keys whose current value differs from a fresh generation of the
 * palette's base — i.e. manual edits that regeneration would overwrite.
 * Empty when the palette is pristine (or its base is invalid).
 */
export function manualShadeDiffs(palette: Palette): string[] {
  const fresh = generateScale(palette.base);
  if (!fresh) return [];
  return PALETTE_SHADES.filter(
    (shade) => typeof palette.shades[shade] === "string" && palette.shades[shade] !== fresh[shade],
  );
}

/** Regenerate a palette's full scale from its current base color. */
export function regenerateShades(palette: Palette): Palette {
  const fresh = generateScale(palette.base);
  if (!fresh) return palette;
  return { ...palette, shades: { ...palette.shades, ...fresh } };
}

/**
 * Readable text color for a swatch background (WCAG relative luminance).
 * Falls back to white text for unparseable input — never throws.
 */
export function bestTextOn(hex: string): "#ffffff" | "#000000" {
  const valid = normalizeHex(hex) ?? "#71717a";
  const channels = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(valid.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
  return luminance > 0.179 ? "#000000" : "#ffffff";
}
