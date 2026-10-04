// Component-library curation for the Design System builder.
// Pure functions only — no React, no storage. Design systems contain basic
// (core) components only. Premium experiences live exclusively in the
// component library (/experience/components, /docs/components) where they
// can be downloaded individually — they are never part of a system's kit,
// gallery, or export surface. Inclusion state lives on the system
// (`library.included`, seeded with all Core UI by starters); older systems
// without the field default to the same. Any stored premium ids (legacy data)
// are filtered out on read/write, never deleted from source components,
// docs, registry, or catalog entries.

import {
  resolveToken,
  type DesignSystemConfig,
} from "./domain";
import {
  COMPONENT_MANIFEST,
  CORE_COMPONENT_IDS,
  manifestById,
  type ComponentManifestEntry,
  type PremiumTokenBridge,
} from "./component-manifest";
import { radiusValueFor } from "./radius";
import { resolveShadow } from "./shadows";
import { resolveDurationMs, resolveEasingCss } from "./motion";

function withLibrary(system: DesignSystemConfig, included: string[]): DesignSystemConfig {
  return { ...system, library: { included: [...included] } };
}

const CORE_IDS = new Set<string>(CORE_COMPONENT_IDS as readonly string[]);

/** Stored inclusion list, sanitized to known basic (core) ids. Premium ids are never part of a system. */
export function includedIds(system: DesignSystemConfig): string[] {
  const stored = system.library?.included;
  if (!Array.isArray(stored)) return [...CORE_COMPONENT_IDS];
  const knownCore = new Set(COMPONENT_MANIFEST.filter((entry) => entry.tier === "core").map((entry) => entry.id));
  return stored.filter((id) => typeof id === "string" && knownCore.has(id));
}

export function isIncluded(system: DesignSystemConfig, id: string): boolean {
  return includedIds(system).includes(id);
}

/** Manifest entries in the system's kit, in catalog order. Unknown stored ids are ignored. */
export function includedEntries(system: DesignSystemConfig, tier?: "core" | "premium"): ComponentManifestEntry[] {
  const included = new Set(includedIds(system));
  return COMPONENT_MANIFEST.filter(
    (entry) => included.has(entry.id) && (!tier || entry.tier === tier),
  );
}

export type CurationMutation = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };

function setIncluded(system: DesignSystemConfig, ids: readonly string[]): DesignSystemConfig {
  const unique = [...new Set(ids)].filter((id) => CORE_IDS.has(id));
  return withLibrary(system, unique);
}

export function includeComponent(system: DesignSystemConfig, id: string): CurationMutation {
  const entry = manifestById(id);
  if (!entry) return { ok: false, error: `"${id}" is not a known library component.` };
  if (entry.tier !== "core") {
    return { ok: false, error: `"${id}" is a premium experience. Premium components live only in the component library — they cannot be added to a design system.` };
  }
  if (isIncluded(system, id)) return { ok: true, system };
  return { ok: true, system: setIncluded(system, [...includedIds(system), id]) };
}

export function removeComponent(system: DesignSystemConfig, id: string): DesignSystemConfig {
  return setIncluded(
    system,
    includedIds(system).filter((entry) => entry !== id),
  );
}

export function includeFamily(system: DesignSystemConfig, family: string): DesignSystemConfig {
  const familyIds = COMPONENT_MANIFEST.filter((entry) => entry.family === family && entry.tier === "core").map((entry) => entry.id);
  return setIncluded(system, [...includedIds(system), ...familyIds]);
}

/** Legacy migration helper: strip any stored premium picks, keeping core selection. Premium can no longer be added. */
export function removeAllPremium(system: DesignSystemConfig): DesignSystemConfig {
  return setIncluded(
    system,
    includedIds(system).filter((id) => (CORE_COMPONENT_IDS as readonly string[]).includes(id)),
  );
}

/** Back to the starter posture: Core UI only. */
export function resetToCore(system: DesignSystemConfig): DesignSystemConfig {
  return setIncluded(system, [...CORE_COMPONENT_IDS]);
}

/** Replace the stored inclusion list outright (sanitized to known basic ids; premium ids are dropped). */
export function setIncludedIds(system: DesignSystemConfig, ids: readonly string[]): DesignSystemConfig {
  return setIncluded(system, ids);
}

/** Select every basic (core) component. */
export function includeAllCore(system: DesignSystemConfig): DesignSystemConfig {
  return setIncluded(system, [...includedIds(system), ...CORE_COMPONENT_IDS]);
}

export function inclusionSummary(system: DesignSystemConfig): { included: number; total: number; core: number; premium: number } {
  const entries = includedEntries(system);
  const core = entries.filter((entry) => entry.tier === "core").length;
  return {
    included: core,
    total: COMPONENT_MANIFEST.filter((entry) => entry.tier === "core").length,
    core,
    premium: 0,
  };
}

// ---------------------------------------------------------------------------
// Token bridges (premium)
// ---------------------------------------------------------------------------

export type BridgeValueKind = "semantic" | "typography" | "radius" | "shadow" | "motion" | "passthrough";

export interface ResolvedBridgeValue {
  key: string;
  kind: BridgeValueKind;
  /** Raw bridge reference (semantic id, role, or token id). */
  reference: string;
  final: string | null;
  status: "resolved" | "unresolved";
  chain: string[];
}

const BRIDGE_KEY_KIND: Record<string, BridgeValueKind> = {
  canvas: "semantic",
  surface: "semantic",
  foreground: "semantic",
  accent: "semantic",
  accentSecondary: "semantic",
  typographyRole: "typography",
  radiusToken: "radius",
  shadowToken: "shadow",
  motionDuration: "motion",
  motionEasing: "motion",
};

/**
 * Resolve only the supported bridge keys against the system + theme.
 * Unknown keys are dropped (never forwarded); the source system is never
 * mutated and no global CSS is touched — output is plain data for a scoped
 * preview wrapper.
 */
export function resolveBridgeValues(
  system: DesignSystemConfig,
  themeId: string,
  bridge: PremiumTokenBridge,
): Record<string, ResolvedBridgeValue> {
  const out: Record<string, ResolvedBridgeValue> = {};
  for (const [key, reference] of Object.entries(bridge)) {
    if (key === "reducedMotionFallback" || typeof reference !== "string") continue;
    const kind = BRIDGE_KEY_KIND[key];
    if (!kind) continue; // Unsupported keys never reach the component.
    try {
      if (kind === "semantic") {
        const resolution = resolveToken(system, reference, themeId);
        out[key] = {
          key, kind, reference,
          final: resolution.status === "resolved" ? resolution.value : null,
          status: resolution.status === "resolved" ? "resolved" : "unresolved",
          chain: resolution.chain,
        };
      } else if (kind === "typography") {
        const role = system.foundations.typography?.roles?.[reference as "body"];
        out[key] = {
          key, kind, reference,
          final: role ? role.fontFamily : null,
          status: role ? "resolved" : "unresolved",
          chain: role ? [reference, role.fontFamily] : [reference],
        };
      } else if (kind === "radius") {
        const value = radiusValueFor(system, reference);
        out[key] = {
          key, kind, reference, final: value,
          status: value !== null ? "resolved" : "unresolved",
          chain: value !== null ? [reference, value] : [reference],
        };
      } else if (kind === "shadow") {
        const shadow = resolveShadow(system, reference, themeId);
        out[key] = {
          key, kind, reference, final: shadow?.css ?? null,
          status: shadow ? "resolved" : "unresolved",
          chain: shadow ? [reference, shadow.css] : [reference],
        };
      } else {
        const ms = key === "motionDuration" ? resolveDurationMs(system, reference) : null;
        const easing = key === "motionEasing" ? resolveEasingCss(system, reference) : null;
        const final = ms !== null ? `${ms}ms` : easing;
        out[key] = {
          key, kind, reference, final,
          status: final !== null ? "resolved" : "unresolved",
          chain: final !== null ? [reference, final] : [reference],
        };
      }
    } catch {
      out[key] = { key, kind, reference, final: null, status: "unresolved", chain: [reference] };
    }
  }
  return out;
}

export interface BridgeIssue {
  key: string;
  message: string;
}

/** Structural bridge validation: known keys, resolvable refs, declared fallback. */
export function validateBridge(
  system: DesignSystemConfig,
  bridge: PremiumTokenBridge,
  motionModality: string,
): BridgeIssue[] {
  const issues: BridgeIssue[] = [];
  for (const key of Object.keys(bridge)) {
    if (key !== "reducedMotionFallback" && !(key in BRIDGE_KEY_KIND)) {
      issues.push({ key, message: `"${key}" is not a supported bridge key and will be ignored.` });
    }
  }
  if (
    motionModality !== "not-applicable" &&
    (bridge.reducedMotionFallback === undefined || bridge.reducedMotionFallback === "not-applicable")
  ) {
    issues.push({
      key: "reducedMotionFallback",
      message: "Motion-heavy effects must declare a static, simplified, or disabled fallback.",
    });
  }
  const resolved = resolveBridgeValues(system, "light", bridge);
  for (const [key, entry] of Object.entries(resolved)) {
    if (entry.status !== "resolved") {
      issues.push({ key, message: `"${entry.reference}" does not resolve against this system.` });
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Machine-readable readiness (Validate-phase input, not the Validate page)
// ---------------------------------------------------------------------------

export interface ReadinessCheck {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

/** Readiness for one manifest entry; premium checks run against the given system. */
export function componentReadiness(
  system: DesignSystemConfig,
  entry: ComponentManifestEntry,
): ReadinessCheck[] {
  if (entry.tier === "core") {
    const slots = entry.slots.length > 0;
    const variants = entry.slots.some((slot) => (slot.variants ?? []).length > 0 || (slot.states ?? []).length > 0);
    return [
      { id: "slots-declared", label: "Required semantic slots present", pass: slots, detail: slots ? `${entry.slots.length} meaningful slots declared.` : "No slots declared." },
      { id: "variants-mapped", label: "Variants/states mapped", pass: variants, detail: variants ? "Variants and states mapped." : "No variants or states mapped." },
      { id: "theme-support", label: "Theme support", pass: entry.lightTheme.level === "full" && entry.darkTheme.level === "full", detail: "Light and dark follow system tokens." },
      { id: "keyboard", label: "Keyboard/accessibility support", pass: entry.keyboard.level === "full" || entry.keyboard.level === "partial", detail: entry.keyboard.note },
      { id: "responsive", label: "Responsive support", pass: entry.responsive.level === "full" || entry.responsive.level === "partial", detail: entry.responsive.note },
    ];
  }
  const bridgeIssues = entry.bridge ? validateBridge(system, entry.bridge, entry.motionModality) : [];
  return [
    { id: "bridge-valid", label: "Token bridge valid", pass: entry.bridge !== null && bridgeIssues.length === 0, detail: entry.bridge ? (bridgeIssues.length === 0 ? "Every bridge reference resolves." : bridgeIssues.map((issue) => issue.message).join(" ")) : "No token bridge declared." },
    { id: "light-known", label: "Light support known", pass: entry.lightTheme.level !== "unknown", detail: entry.lightTheme.note },
    { id: "dark-known", label: "Dark support known", pass: entry.darkTheme.level !== "unknown", detail: entry.darkTheme.note },
    { id: "reduced-motion-known", label: "Reduced-motion fallback known", pass: entry.reducedMotionFallback !== "not-applicable" ? entry.reducedMotion.level !== "unknown" : true, detail: entry.reducedMotion.note },
    { id: "modality-declared", label: "Motion modality declared", pass: entry.motionModality !== "not-applicable", detail: `Modality: ${entry.motionModality}; fallback: ${entry.reducedMotionFallback}.` },
    { id: "responsive-known", label: "Responsive support known", pass: entry.responsive.level !== "unknown", detail: entry.responsive.note },
    { id: "catalog-known", label: "Preview/docs/catalog status known", pass: entry.docsAvailable, detail: `Docs ${entry.docsAvailable ? "available" : "missing"} · registry ${entry.registryAvailable ? "available" : "missing"} · live preview ${entry.livePreview ? "available" : "bridge card"}.` },
  ];
}
