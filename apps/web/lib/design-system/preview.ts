// Unified preview resolution for the Preview workspace (Step 11).
// Pure, read-only functions only — no React, no storage, no writes. Every
// value resolves through the established Step 1 resolvers (`resolveToken`,
// border/shadow recipes, motion, icons, grid/breakpoints); nothing here
// competes with them. Resolution never throws: failures surface as
// structured diagnostics so the canvas can render a contained notice instead
// of claiming an invalid value is fine.

import { resolveToken, type DesignSystemConfig } from "./domain";
import { activeBreakpoint } from "./breakpoints";
import { containerPx, ensureGridForSystem, resolveGridForWidth } from "./grid";
import { tokenThemeState } from "./themes";
import { resolveBorderRecipe } from "./borders";
import { resolveShadow } from "./shadows";
import { radiusValueFor } from "./radius";
import { firstAvailablePx, pxOf } from "./spacing";
import { styleForPreview } from "./typography";
import { effectiveMotion, resolveDurationMs, resolveEasingCss } from "./motion";
import { iconSizePx, resolveIconColor } from "./icons";

export type SlotProvenance =
  | "component-override"
  | "theme-override"
  | "base-semantic"
  | "foundation"
  | "unresolved"
  | "circular";

export interface SemanticPreviewValue {
  id: string;
  base: string;
  override: string | null;
  final: string | null;
  status: "resolved" | "unresolved" | "circular";
  chain: string[];
  provenance: "theme-override" | "base-semantic" | "unresolved" | "circular";
}

export interface ComponentSlotPreview {
  component: string;
  slot: string;
  variant?: string;
  state?: string;
  /** Raw component-override value, when one matches. */
  overrideValue: string | null;
  /** Conventional semantic token for the slot, used when no override matches. */
  baseSemanticId: string | null;
  final: string | null;
  status: "resolved" | "unresolved" | "circular";
  chain: string[];
  provenance: SlotProvenance;
}

export interface LayoutPreview {
  widthPx: number;
  breakpointId: string;
  breakpointValue: string;
  columns: number;
  gutterToken: string;
  gutterPx: number | null;
  columnGapPx: number | null;
  rowGapPx: number | null;
  containerId: string;
  containerValue: string;
  containerMaxPx: number | null;
}

export interface TypePreview {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: number | string;
  letterSpacing: string;
}

export interface MotionPreview {
  reduce: boolean;
  reason: string;
  durationMs: number | null;
  easing: string | null;
  /** Ready-to-use transition shorthand, or "none" when reduced. */
  transition: string;
}

export interface PreviewDiagnostics {
  unresolved: string[];
  circular: string[];
}

export interface PreviewResolution {
  themeId: string;
  semantics: Record<string, SemanticPreviewValue>;
  layout: LayoutPreview;
  typography: { heading: TypePreview; body: TypePreview; label: TypePreview };
  spacingUnitPx: number | null;
  radiusMd: string | null;
  borderDefaultCss: string | null;
  shadowMdCss: string | null;
  motion: MotionPreview;
  iconSizePx: number | null;
  iconMuted: string | null;
  components: ComponentSlotPreview[];
  cssVars: Record<string, string>;
  cssVarsSkipped: string[];
  diagnostics: PreviewDiagnostics;
}

/** All semantic tokens resolved for one theme (base + override layers). */
export function resolveSemanticsForTheme(
  system: DesignSystemConfig,
  themeId: string,
): Record<string, SemanticPreviewValue> {
  const out: Record<string, SemanticPreviewValue> = {};
  for (const token of system.semanticTokens ?? []) {
    try {
      const state = tokenThemeState(system, themeId, token.id);
      if (!state) continue;
      const resolution = resolveToken(system, token.id, themeId);
      out[token.id] = {
        id: token.id,
        base: token.value,
        override: state.override,
        final: resolution.status === "resolved" ? resolution.value : null,
        status: resolution.status,
        chain: resolution.chain,
        provenance:
          resolution.status === "resolved"
            ? state.override !== null
              ? "theme-override"
              : "base-semantic"
            : resolution.status,
      };
    } catch {
      out[token.id] = {
        id: token.id,
        base: token.value,
        override: null,
        final: null,
        status: "unresolved",
        chain: [],
        provenance: "unresolved",
      };
    }
  }
  return out;
}

/** Conventional semantic token per previewed component slot (fallback when no override matches). */
const SLOT_SEMANTICS: Record<string, Record<string, Record<string, string>>> = {
  Button: {
    primary: {
      background: "action.primary.background",
      foreground: "action.primary.foreground",
      ring: "focus.ring",
    },
    secondary: {
      background: "action.secondary.background",
      foreground: "action.secondary.foreground",
      border: "border.default",
    },
  },
  Input: {
    default: {
      background: "background.canvas",
      border: "border.default",
      foreground: "text.primary",
      ring: "focus.ring",
    },
  },
  Card: {
    default: {
      background: "background.surface",
      border: "border.default",
      foreground: "text.primary",
    },
  },
  Dialog: {
    default: {
      background: "background.canvas",
      border: "border.default",
      shadow: "shadow.lg",
      scrim: "overlay.scrim",
    },
  },
};

function findComponentOverride(
  system: DesignSystemConfig,
  component: string,
  slot: string,
  variant?: string,
  state?: string,
): string | null {
  const entries = (system.components ?? []).filter((entry) => entry.component === component);
  let best: { value: string; score: number } | null = null;
  for (const entry of entries) {
    for (const override of entry.overrides ?? []) {
      if (override.token !== slot) continue;
      if (variant !== undefined && override.variant !== variant) continue;
      if (state !== undefined && override.state !== state) continue;
      // Specificity: an override naming both variant and state wins over
      // partial matches; bare slots are the weakest match.
      const score = (override.variant ? 2 : 0) + (override.state ? 1 : 0);
      if (!best || score > best.score) best = { value: override.value, score };
    }
  }
  return best?.value ?? null;
}

/**
 * Resolve one component slot: the most specific matching component override
 * wins; otherwise the slot's conventional semantic token resolves through
 * the theme/base layers. Recipe ids (shadow.*, border.*) fall back to their
 * recipe resolvers when the token resolver cannot resolve them.
 */
export function resolveComponentSlot(
  system: DesignSystemConfig,
  component: string,
  slot: string,
  opts: { variant?: string; state?: string; themeId?: string } = {},
): ComponentSlotPreview {
  const { variant, state, themeId } = opts;
  const baseSemanticId = SLOT_SEMANTICS[component]?.[variant ?? "default"]?.[slot] ?? null;
  const fail = (
    provenance: SlotProvenance,
    overrideValue: string | null,
    reason: string,
  ): ComponentSlotPreview => ({
    component,
    slot,
    variant,
    state,
    overrideValue,
    baseSemanticId,
    final: null,
    status: provenance === "circular" ? "circular" : "unresolved",
    chain: [reason],
    provenance,
  });
  try {
    const overrideValue = findComponentOverride(system, component, slot, variant, state);
    if (overrideValue !== null) {
      const resolution = resolveToken(system, overrideValue, themeId);
      if (resolution.status === "resolved") {
        return {
          component, slot, variant, state, overrideValue, baseSemanticId,
          final: resolution.value, status: "resolved",
          chain: [overrideValue, ...resolution.chain.filter((step) => step !== overrideValue)],
          provenance: "component-override",
        };
      }
      // Recipe fallback: shadow/border recipe ids are not semantic tokens.
      const shadow = resolveShadow(system, overrideValue, themeId);
      if (shadow) {
        return {
          component, slot, variant, state, overrideValue, baseSemanticId,
          final: shadow.css, status: "resolved", chain: [overrideValue, shadow.css],
          provenance: "component-override",
        };
      }
      const border = resolveBorderRecipe(system, overrideValue, themeId);
      if (border) {
        return {
          component, slot, variant, state, overrideValue, baseSemanticId,
          final: border.css, status: "resolved", chain: [overrideValue, border.css],
          provenance: "component-override",
        };
      }
      return fail(resolution.status === "circular" ? "circular" : "unresolved", overrideValue, overrideValue);
    }
    if (!baseSemanticId) return fail("unresolved", null, `${component}.${slot}`);
    const stateOf = tokenThemeState(system, themeId ?? "", baseSemanticId);
    const resolution = resolveToken(system, baseSemanticId, themeId);
    if (resolution.status === "resolved") {
      return {
        component, slot, variant, state, overrideValue: null, baseSemanticId,
        final: resolution.value, status: "resolved", chain: resolution.chain,
        provenance: stateOf?.override != null ? "theme-override" : "base-semantic",
      };
    }
    // Recipe fallback: conventional shadow/border slots may name foundation
    // recipes (e.g. Dialog's shadow → shadow.lg) rather than semantic tokens.
    const recipeShadow = resolveShadow(system, baseSemanticId, themeId);
    if (recipeShadow) {
      return {
        component, slot, variant, state, overrideValue: null, baseSemanticId,
        final: recipeShadow.css, status: "resolved",
        chain: [baseSemanticId, recipeShadow.css], provenance: "foundation",
      };
    }
    const recipeBorder = resolveBorderRecipe(system, baseSemanticId, themeId);
    if (recipeBorder) {
      return {
        component, slot, variant, state, overrideValue: null, baseSemanticId,
        final: recipeBorder.css, status: "resolved",
        chain: [baseSemanticId, recipeBorder.css], provenance: "foundation",
      };
    }
    return fail(resolution.status === "circular" ? "circular" : "unresolved", null, baseSemanticId);
  } catch {
    return fail("unresolved", null, `${component}.${slot}`);
  }
}

/** Active breakpoint + Grid profile + pixel metrics for a preview width. */
export function resolveActiveLayout(system: DesignSystemConfig, widthPx: number): LayoutPreview {
  const width = Number.isFinite(widthPx) && widthPx >= 0 ? Math.round(widthPx) : 0;
  const active = activeBreakpoint(system, width);
  const resolved = resolveGridForWidth(system, width);
  const grid = ensureGridForSystem(system);
  const container =
    grid.containers.find((entry) => entry.id === grid.defaultContainer) ?? grid.containers[0];
  const spacingOf = (id: string): number | null => {
    const token =
      system.foundations.spacing?.scale.find((entry) => entry.id === id) ??
      system.foundations.sizing?.tokens.find((entry) => entry.id === id);
    if (!token) return null;
    const parsed = pxOf(token);
    return parsed;
  };
  return {
    widthPx: width,
    breakpointId: active.id,
    breakpointValue: active.value,
    columns: resolved.profile.columns,
    gutterToken: resolved.profile.gutter,
    gutterPx: spacingOf(resolved.profile.gutter),
    columnGapPx: spacingOf(resolved.profile.columnGap),
    rowGapPx: spacingOf(resolved.profile.rowGap),
    containerId: container?.id ?? "standard",
    containerValue: container?.value ?? "1200px",
    containerMaxPx: container ? containerPx(container) : null,
  };
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const MEASURE_RE = /^\d+(\.\d+)?(px|rem|ms|s|%)$/;
const EASING_RE = /^(linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\([0-9.,\s]+\)|steps\([0-9]+(,[a-z-]+)?\))$/;
const FONT_RE = /^[\w\s,'"\-+.()/]+$/;

/** Strict allowlist: only inert CSS values are emitted into the var map. */
export function isSafeCssValue(value: string): boolean {
  const text = value.trim();
  if (text === "" || text.length > 220) return false;
  if (HEX_RE.test(text) || MEASURE_RE.test(text) || EASING_RE.test(text)) return true;
  if (FONT_RE.test(text) && !/[;{}<>\\]/.test(text) && !/expression|url\(|javascript/i.test(text)) return true;
  return false;
}

function cssVarName(id: string): string | null {
  const slug = id.trim().replace(/[^a-zA-Z0-9.\-_]/g, "");
  if (slug === "" || slug.length > 80) return null;
  return `--pv-${slug.replace(/[._]/g, "-")}`;
}

/**
 * Scoped CSS-variable map for the preview root. Every key is `--pv-`
 * prefixed; anything failing the value allowlist is skipped and reported.
 */
export function buildCssVarMap(
  system: DesignSystemConfig,
  themeId: string,
): { vars: Record<string, string>; skipped: string[] } {
  const vars: Record<string, string> = {};
  const skipped: string[] = [];
  const emit = (id: string, value: string | null): void => {
    const name = cssVarName(id);
    if (!name || value === null || !isSafeCssValue(value)) {
      skipped.push(id);
      return;
    }
    vars[name] = value.trim();
  };
  const semantics = resolveSemanticsForTheme(system, themeId);
  for (const [id, entry] of Object.entries(semantics)) {
    emit(id, entry.status === "resolved" ? entry.final : null);
  }
  const primary = system.foundations.typography?.primary ?? "Inter";
  emit("font-body", primary);
  const radius = radiusValueFor(system, "md");
  emit("radius-md", radius);
  const duration = resolveDurationMs(system, "normal");
  if (duration !== null) emit("duration-normal", `${duration}ms`);
  const easing = resolveEasingCss(system, "standard");
  if (easing !== null) emit("easing-standard", easing);
  return { vars, skipped };
}

/** Render blockers across semantics, theme overrides, and component overrides. */
export function collectDiagnostics(system: DesignSystemConfig, themeId: string): PreviewDiagnostics {
  const unresolved: string[] = [];
  const circular: string[] = [];
  const push = (pointer: string, status: "unresolved" | "circular"): void => {
    if (status === "circular") {
      if (!circular.includes(pointer)) circular.push(pointer);
    } else if (!unresolved.includes(pointer)) {
      unresolved.push(pointer);
    }
  };
  try {
    for (const token of system.semanticTokens ?? []) {
      const resolution = resolveToken(system, token.id, themeId);
      if (resolution.status !== "resolved") push(token.id, resolution.status);
    }
    for (const entry of system.components ?? []) {
      for (const override of entry.overrides ?? []) {
        const resolution = resolveToken(system, override.value, themeId);
        // Component values may be recipe ids (shadow.lg); those resolve via
        // recipe resolvers and are not render blockers here.
        if (resolution.status === "resolved") continue;
        const shadow = resolveShadow(system, override.value, themeId);
        const border = shadow ? null : resolveBorderRecipe(system, override.value, themeId);
        if (!shadow && !border) {
          push(`${entry.component}.${override.token}`, resolution.status);
        }
      }
    }
  } catch {
    unresolved.push("(diagnostic collection failed)");
  }
  return { unresolved, circular };
}

/** Motion decision for the canvas: policy × OS preference + resolved tokens. */
export function previewMotion(system: DesignSystemConfig, osPrefersReduced: boolean): MotionPreview {
  const effective = effectiveMotion(system, osPrefersReduced);
  const durationMs = resolveDurationMs(system, "normal");
  const easing = resolveEasingCss(system, "standard");
  return {
    reduce: effective.reduce,
    reason: effective.reason,
    durationMs,
    easing,
    transition: effective.reduce || durationMs === null || easing === null ? "none" : `${durationMs}ms ${easing}`,
  };
}

const PREVIEW_SLOTS: Array<{ component: string; slot: string; variant?: string; state?: string }> = [
  { component: "Button", slot: "background", variant: "primary" },
  { component: "Button", slot: "foreground", variant: "primary" },
  { component: "Button", slot: "background", variant: "secondary" },
  { component: "Button", slot: "foreground", variant: "secondary" },
  { component: "Button", slot: "border", variant: "secondary" },
  { component: "Input", slot: "background" },
  { component: "Input", slot: "border" },
  { component: "Input", slot: "foreground" },
  { component: "Input", slot: "ring" },
  { component: "Card", slot: "background" },
  { component: "Card", slot: "border" },
  { component: "Card", slot: "foreground" },
  { component: "Dialog", slot: "background" },
  { component: "Dialog", slot: "border" },
  { component: "Dialog", slot: "shadow" },
];

/**
 * Compose the full read-only preview model. Never throws and never mutates
 * its input; each section degrades independently to diagnostics.
 */
export function resolvePreview(
  system: DesignSystemConfig,
  themeId: string,
  widthPx: number,
  opts: { osPrefersReduced?: boolean } = {},
): PreviewResolution {
  const safe = <T>(fallback: T, run: () => T): T => {
    try {
      return run();
    } catch {
      return fallback;
    }
  };
  const semantics = safe({}, () => resolveSemanticsForTheme(system, themeId));
  const layout = safe(
    {
      widthPx: 0, breakpointId: "base", breakpointValue: "0px", columns: 4,
      gutterToken: "space-4", gutterPx: null, columnGapPx: null, rowGapPx: null,
      containerId: "standard", containerValue: "1200px", containerMaxPx: 1200,
    },
    () => resolveActiveLayout(system, widthPx),
  );
  const typeOf = (id: "h1" | "body" | "label"): TypePreview => {
    const style = styleForPreview(system, id);
    return {
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
    };
  };
  const typography = safe(
    {
      heading: { fontFamily: "Inter", fontWeight: 700, fontSize: "2rem", lineHeight: 1.2, letterSpacing: "0em" },
      body: { fontFamily: "Inter", fontWeight: 400, fontSize: "1rem", lineHeight: 1.5, letterSpacing: "0em" },
      label: { fontFamily: "Inter", fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.4, letterSpacing: "0em" },
    },
    () => ({ heading: typeOf("h1"), body: typeOf("body"), label: typeOf("label") }),
  );
  const spacingUnitPx = safe(null as number | null, () => {
    const token = system.foundations.spacing?.scale.find((entry) => entry.id === "space-4");
    return token ? pxOf(token) : firstAvailablePx(system, "spacing", ["space-4", "space-3"])?.px ?? null;
  });
  const radiusMd = safe(null as string | null, () => radiusValueFor(system, "md"));
  const borderDefaultCss = safe(null as string | null, () => {
    const recipe = resolveBorderRecipe(system, "border.default", themeId);
    return recipe?.css ?? null;
  });
  const shadowMdCss = safe(null as string | null, () => {
    const shadow = resolveShadow(system, "shadow.md", themeId);
    return shadow?.css ?? null;
  });
  const motion = safe(
    { reduce: false, reason: "Unavailable", durationMs: null, easing: null, transition: "none" },
    () => previewMotion(system, opts.osPrefersReduced ?? false),
  );
  const iconSize = safe(null as number | null, () =>
    iconSizePx(system, system.foundations.icons.defaultSize),
  );
  const iconMuted = safe(null as string | null, () => resolveIconColor(system, "muted", themeId));
  const components = safe([] as ComponentSlotPreview[], () =>
    PREVIEW_SLOTS.map((entry) =>
      resolveComponentSlot(system, entry.component, entry.slot, {
        variant: entry.variant,
        state: entry.state,
        themeId,
      }),
    ),
  );
  const css = safe({ vars: {}, skipped: [] } as { vars: Record<string, string>; skipped: string[] }, () =>
    buildCssVarMap(system, themeId),
  );
  const diagnostics = safe({ unresolved: [], circular: [] }, () => collectDiagnostics(system, themeId));
  return {
    themeId,
    semantics,
    layout,
    typography,
    spacingUnitPx,
    radiusMd,
    borderDefaultCss,
    shadowMdCss,
    motion,
    iconSizePx: iconSize,
    iconMuted,
    components,
    cssVars: css.vars,
    cssVarsSkipped: css.skipped,
    diagnostics,
  };
}
