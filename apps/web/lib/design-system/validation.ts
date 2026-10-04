// Design-system Validate workspace engine (Step 12).
// Pure functions only — no React, no browser storage, no mutation. The input
// system is only read; every helper below treats it as immutable.
// Validation reuses existing resolvers/validators rather than duplicating
// logic: `validateDesignSystem`, semantic-token helpers, theme helpers,
// component-curation readiness/bridge helpers, and the foundation parse
// helpers (spacing, radius, borders, shadows, motion, icons, grid,
// breakpoints, typography).

import {
  isHexColor,
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import {
  missingStandardTokens,
  validateTokenValue,
} from "./semantic-tokens";
import {
  REQUIRED_THEME_IDS,
  invalidOverrideKeys,
  unresolvedOverrides,
} from "./themes";
import { manifestById } from "./component-manifest";
import { parseLength } from "./spacing";
import { parseRadiusValue } from "./radius";
import {
  parseBorderWidth,
  resolveBorderStyle,
  resolveBorderWidth,
} from "./borders";
import { parseLayer } from "./shadows";
import { parseDurationMs, parseEasing } from "./motion";
import { parseIconSize } from "./icons";
import { parseContainerValue } from "./grid";
import {
  ensureBreakpointScale,
  parseBreakpointValue,
} from "./breakpoints";
import {
  parseFontSize,
  parseLetterSpacing,
  parseLineHeight,
  parseWeight,
} from "./typography";

// ---------------------------------------------------------------------------
// Report shape (stable, serializable)
// ---------------------------------------------------------------------------

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationGroupId =
  | "foundations"
  | "semantic-tokens"
  | "themes"
  | "components"
  | "accessibility"
  | "export-readiness";

export type ValidationStatus =
  | "ready"
  | "ready-with-warnings"
  | "needs-attention";

export interface ValidationFinding {
  /** Stable id, e.g. "themes-missing-theme-dark". Sort-safe. */
  id: string;
  group: ValidationGroupId;
  severity: ValidationSeverity;
  title: string;
  /** Plain-language explanation (no jargon, no certification claims). */
  explanation: string;
  /** Domain path, e.g. "semanticTokens[3].value". */
  path: string;
  /** Human-readable affected item, e.g. token id or component name. */
  affected: string;
  /** Builder route that edits the problem, e.g. "/design-system/abc/tokens". */
  route: string;
}

export interface ValidationGroup {
  id: ValidationGroupId;
  title: string;
  description: string;
  findings: ValidationFinding[];
}

export interface ValidationSummary {
  errors: number;
  warnings: number;
  infos: number;
  passed: number;
}

export interface ValidationReport {
  status: ValidationStatus;
  /** "Ready to export" / "Ready with warnings" / "Needs attention". */
  statusLabel: string;
  summary: ValidationSummary;
  groups: ValidationGroup[];
  /** Human-readable list of check areas for the "What we checked" section. */
  checked: string[];
  /** False when any error exists. Warnings allow export. */
  exportReady: boolean;
}

export const VALIDATION_GROUP_ORDER: readonly ValidationGroupId[] = [
  "foundations",
  "semantic-tokens",
  "themes",
  "components",
  "accessibility",
  "export-readiness",
];

const GROUP_META: Record<ValidationGroupId, { title: string; description: string }> = {
  foundations: {
    title: "Foundations",
    description: "Palettes, type, spacing, radius, borders, shadows, motion, icons, grid, and breakpoints.",
  },
  "semantic-tokens": {
    title: "Semantic tokens",
    description: "Baseline coverage, alias targets, value shapes, and reference cycles.",
  },
  themes: {
    title: "Themes",
    description: "Required Light and Dark themes, override keys, values, and cycles.",
  },
  components: {
    title: "Components",
    description: "Curated library readiness, token bridges, and slot references.",
  },
  accessibility: {
    title: "Accessibility",
    description:
      "Automated contrast guidance only — not a legal accessibility certification. Verify with real assistive-technology and manual testing.",
  },
  "export-readiness": {
    title: "Export readiness",
    description: "Whether this system is safe to export. Errors block export; warnings travel with the export report.",
  },
};

const SEVERITY_RANK: Record<ValidationSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

function routeFor(systemId: string, slug: string): string {
  const base = `/design-system/${systemId}`;
  return slug ? `${base}/${slug}` : base;
}

const COMPONENTS_CATALOG_ROUTE = "/experience/components";

function routeForFoundationPath(systemId: string, path: string): string {
  if (path.includes("foundations.colors")) return routeFor(systemId, "colors");
  if (path.includes("foundations.typography")) return routeFor(systemId, "typography");
  if (path.includes("foundations.spacing") || path.includes("foundations.sizing")) {
    return routeFor(systemId, "spacing");
  }
  if (path.includes("foundations.radius")) return routeFor(systemId, "radius");
  if (path.includes("foundations.borders")) return routeFor(systemId, "borders");
  if (path.includes("foundations.shadows")) return routeFor(systemId, "shadows");
  if (path.includes("foundations.motion")) return routeFor(systemId, "motion");
  if (path.includes("foundations.icons")) return routeFor(systemId, "icons");
  if (path.includes("foundations.grid")) return routeFor(systemId, "grid");
  if (path.includes("foundations.breakpoints")) return routeFor(systemId, "breakpoints");
  if (path.includes("semanticTokens")) return routeFor(systemId, "tokens");
  if (path.includes("themes")) return routeFor(systemId, "themes");
  if (path.includes("components")) return COMPONENTS_CATALOG_ROUTE;
  return routeFor(systemId, "");
}

// ---------------------------------------------------------------------------
// Contrast (automated guidance only)
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return null;
  const raw = match[1]!;
  return [
    Number.parseInt(raw.slice(0, 2), 16),
    Number.parseInt(raw.slice(2, 4), 16),
    Number.parseInt(raw.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const channels = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

/** WCAG-style contrast ratio for two resolved hex colors. Null when unparsable. */
export function contrastRatio(foreground: string, background: string): number | null {
  const left = relativeLuminance(foreground);
  const right = relativeLuminance(background);
  if (left === null || right === null) return null;
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);
  return (lighter + 0.05) / (darker + 0.05);
}

interface ContrastPair {
  foreground: string;
  background: string;
  label: string;
  threshold: number;
}

const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { foreground: "text.primary", background: "background.canvas", label: "Primary text on canvas", threshold: 4.5 },
  { foreground: "text.secondary", background: "background.canvas", label: "Secondary text on canvas", threshold: 4.5 },
  {
    foreground: "action.primary.foreground",
    background: "action.primary.background",
    label: "Primary action text on primary background",
    threshold: 3,
  },
  {
    foreground: "action.secondary.foreground",
    background: "action.secondary.background",
    label: "Secondary action text on secondary background",
    threshold: 3,
  },
];

// ---------------------------------------------------------------------------
// Collector (stable ordering, dedupe, pass counting)
// ---------------------------------------------------------------------------

interface Collector {
  findings: ValidationFinding[];
  seen: Set<string>;
  passed: number;
}

function slugifyPath(path: string): string {
  const slug = path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return slug || "root";
}

function addFinding(
  collector: Collector,
  group: ValidationGroupId,
  severity: ValidationSeverity,
  code: string,
  title: string,
  explanation: string,
  path: string,
  affected: string,
  route: string,
): void {
  const key = `${group}::${code}::${path}`;
  if (collector.seen.has(key)) return;
  collector.seen.add(key);
  collector.findings.push({
    id: `${group}-${code}-${slugifyPath(path)}`,
    group,
    severity,
    title,
    explanation,
    path,
    affected,
    route,
  });
}

function pass(collector: Collector, count = 1): void {
  collector.passed += count;
}

// ---------------------------------------------------------------------------
// Section checks
// ---------------------------------------------------------------------------

function checkStructural(system: DesignSystemConfig, systemId: string, collector: Collector): void {
  let issues: ReturnType<typeof validateDesignSystem>;
  try {
    issues = validateDesignSystem(system);
  } catch {
    issues = [];
  }
  for (const issue of issues) {
    // Component slot references are re-reported as errors with richer copy
    // below; keep the structural pass as the single source for them.
    if (issue.path.startsWith("components") && issue.code === "unresolved-reference") continue;
    const group: ValidationGroupId = issue.path.includes("semanticTokens")
      ? "semantic-tokens"
      : issue.path.includes("themes")
        ? "themes"
        : issue.path.includes("components")
          ? "components"
          : "foundations";
    const route = routeForFoundationPath(systemId, issue.path);
    addFinding(
      collector,
      group,
      issue.severity,
      issue.code,
      titleForCode(issue.code, issue.severity),
      issue.message,
      issue.path,
      affectedForPath(system, issue.path),
      route,
    );
  }
}

const CODE_TITLES: Record<string, string> = {
  "missing-id": "Missing id",
  "duplicate-id": "Duplicated id",
  malformed: "Malformed system",
  "schema-version": "Unsupported schema version",
  "missing-name": "Missing system name",
  "missing-starter": "Missing starter record",
  "missing-foundations": "Missing foundations",
  "no-palettes": "No color palettes",
  "invalid-hex": "Invalid color value",
  "invalid-density": "Invalid density",
  "missing-value": "Missing value",
  "unresolved-reference": "Unresolved reference",
  "circular-reference": "Circular reference",
  "missing-theme": "Missing required theme",
  "validator-error": "Validation error",
};

/** Short human title for a structural code; falls back to severity wording. */
function titleForCode(code: string, severity: "error" | "warning"): string {
  return CODE_TITLES[code] ?? (severity === "error" ? "Needs fixing" : "Worth a look");
}

/** Human-readable affected item for a domain path (token id, theme id, …). */
function affectedForPath(system: DesignSystemConfig, path: string): string {
  if (!path) return "system";
  try {
    const semanticMatch = /^semanticTokens\[(\d+)\]/.exec(path);
    if (semanticMatch) {
      const token = system.semanticTokens?.[Number.parseInt(semanticMatch[1]!, 10)];
      if (token?.id) return token.id;
    }
    const themeMatch = /^themes\[(\d+)\]/.exec(path);
    if (themeMatch) {
      const theme = system.themes?.[Number.parseInt(themeMatch[1]!, 10)];
      if (theme?.id) return theme.id;
    }
    const componentMatch = /^components\[(\d+)\]/.exec(path);
    if (componentMatch) {
      const entry = system.components?.[Number.parseInt(componentMatch[1]!, 10)];
      if (entry?.component) return entry.component;
    }
    if (path === "themes") return "themes";
  } catch {
    // Fall through to the raw path.
  }
  return path;
}

function checkFoundationValues(system: DesignSystemConfig, systemId: string, collector: Collector): void {
  const foundations = system.foundations;
  if (!foundations || typeof foundations !== "object") return;

  for (const token of foundations.spacing?.scale ?? []) {
    if (parseLength(token.value) === null) {
      addFinding(collector, "foundations", "error", "invalid-spacing", `Spacing token "${token.id}" has an invalid value.`,
        `"${token.value}" is not a usable length. Use a pixel or rem value like "16px" or "1rem".`,
        `foundations.spacing.scale.${token.id}`, token.id, routeFor(systemId, "spacing"));
    } else {
      pass(collector);
    }
  }
  for (const token of foundations.sizing?.tokens ?? []) {
    if (parseLength(token.value) === null) {
      addFinding(collector, "foundations", "error", "invalid-sizing", `Sizing token "${token.id}" has an invalid value.`,
        `"${token.value}" is not a usable length. Use a pixel or rem value like "40px".`,
        `foundations.sizing.tokens.${token.id}`, token.id, routeFor(systemId, "spacing"));
    } else {
      pass(collector);
    }
  }

  const radiusScale = Array.isArray(foundations.radius?.scale) ? foundations.radius.scale : [];
  for (const token of radiusScale) {
    if (parseRadiusValue(token.value) === null) {
      addFinding(collector, "foundations", "error", "invalid-radius", `Radius token "${token.id}" has an invalid value.`,
        `"${token.value}" is not a usable radius. Use a pixel value like "8px" or "9999px" for pills.`,
        `foundations.radius.scale.${token.id}`, token.id, routeFor(systemId, "radius"));
    } else {
      pass(collector);
    }
  }

  for (const [key, value] of Object.entries(foundations.borders?.widths ?? {})) {
    if (parseBorderWidth(value) === null) {
      addFinding(collector, "foundations", "error", "invalid-border-width", `Border width "${key}" has an invalid value.`,
        `"${value}" is not a usable border width. Use a pixel value like "1px".`,
        `foundations.borders.widths.${key}`, key, routeFor(systemId, "borders"));
    } else {
      pass(collector);
    }
  }
  for (const [key, value] of Object.entries(foundations.borders?.styles ?? {})) {
    if (typeof value !== "string" || value.trim() === "") {
      addFinding(collector, "foundations", "error", "invalid-border-style", `Border style "${key}" is empty.`,
        "Every border style needs a CSS style keyword such as solid, dashed, or dotted.",
        `foundations.borders.styles.${key}`, key, routeFor(systemId, "borders"));
    } else {
      pass(collector);
    }
  }
  for (const token of foundations.borders?.tokens ?? []) {
    let ok = true;
    if (resolveBorderWidth(system, token.width) === null) {
      ok = false;
      addFinding(collector, "foundations", "error", "invalid-border-token-width", `Border "${token.id}" points at an unknown width.`,
        `"${token.width}" is not a border width in this system. Pick an existing width key.`,
        `foundations.borders.tokens.${token.id}.width`, token.id, routeFor(systemId, "borders"));
    }
    if (resolveBorderStyle(system, token.style) === null) {
      ok = false;
      addFinding(collector, "foundations", "error", "invalid-border-token-style", `Border "${token.id}" points at an unknown style.`,
        `"${token.style}" is not an enabled border style in this system. Pick an existing style.`,
        `foundations.borders.tokens.${token.id}.style`, token.id, routeFor(systemId, "borders"));
    }
    try {
      if (resolveToken(system, token.color).status !== "resolved") {
        ok = false;
        addFinding(collector, "foundations", "error", "invalid-border-token-color", `Border "${token.id}" points at an unknown color.`,
          `"${token.color}" does not match a palette shade, a semantic token, or a hex color. Fix the spelling or repoint it.`,
          `foundations.borders.tokens.${token.id}.color`, token.id, routeFor(systemId, "borders"));
      }
    } catch {
      ok = false;
    }
    if (ok) pass(collector);
  }

  for (const token of foundations.shadows?.tokens ?? []) {
    const layers = token.layers;
    if (layers === undefined) {
      if (typeof token.value === "string" && token.value.trim() !== "") pass(collector);
      continue;
    }
    let ok = true;
    layers.forEach((layer, index) => {
      if (parseLayer(layer) === null) {
        ok = false;
        addFinding(collector, "foundations", "error", "invalid-shadow-layer", `Shadow "${token.id}" has an invalid layer.`,
          `Layer ${index + 1} has out-of-range numbers or a missing color. Keep offsets small and opacity between 0 and 1.`,
          `foundations.shadows.tokens.${token.id}.layers.${index}`, token.id, routeFor(systemId, "shadows"));
        return;
      }
      try {
        if (resolveToken(system, layer.color).status !== "resolved") {
          ok = false;
          addFinding(collector, "foundations", "error", "invalid-shadow-color", `Shadow "${token.id}" points at an unknown color.`,
            `Layer ${index + 1} color "${layer.color}" does not resolve. Use a palette shade, a semantic token, or a hex color.`,
            `foundations.shadows.tokens.${token.id}.layers.${index}`, token.id, routeFor(systemId, "shadows"));
        }
      } catch {
        ok = false;
      }
    });
    if (ok) pass(collector);
  }

  for (const token of foundations.motion?.durations ?? []) {
    if (parseDurationMs(token.value) === null) {
      addFinding(collector, "foundations", "error", "invalid-duration", `Duration "${token.id}" has an invalid value.`,
        `"${token.value}" is not a usable duration. Use milliseconds like "200ms".`,
        `foundations.motion.durations.${token.id}`, token.id, routeFor(systemId, "motion"));
    } else {
      pass(collector);
    }
  }
  for (const token of foundations.motion?.easings ?? []) {
    if (parseEasing(token.value) === null) {
      addFinding(collector, "foundations", "error", "invalid-easing", `Easing "${token.id}" has an invalid value.`,
        `"${token.value}" is not a usable easing value. Use a keyword, cubic-bezier(), or steps().`,
        `foundations.motion.easings.${token.id}`, token.id, routeFor(systemId, "motion"));
    } else {
      pass(collector);
    }
  }

  const iconSizes = Array.isArray(foundations.icons?.sizes) ? foundations.icons.sizes : [];
  for (const token of iconSizes) {
    if (parseIconSize(token.value) === null) {
      addFinding(collector, "foundations", "error", "invalid-icon-size", `Icon size "${token.id}" has an invalid value.`,
        `"${token.value}" is not a usable icon size. Use a pixel value like "20px".`,
        `foundations.icons.sizes.${token.id}`, token.id, routeFor(systemId, "icons"));
    } else {
      pass(collector);
    }
  }
  const defaultSize = foundations.icons?.defaultSize;
  if (typeof defaultSize === "string" && defaultSize !== "") {
    const known = new Set(iconSizes.map((token) => token.id));
    if (!known.has(defaultSize)) {
      addFinding(collector, "foundations", "error", "invalid-icon-default", `Default icon size "${defaultSize}" does not exist.`,
        "Pick an existing icon size as the default so new icons render at a known size.",
        "foundations.icons.defaultSize", defaultSize, routeFor(systemId, "icons"));
    } else {
      pass(collector);
    }
  }
  for (const [role, value] of Object.entries(foundations.icons?.colors ?? {})) {
    try {
      if (typeof value !== "string" || resolveToken(system, value).status !== "resolved") {
        addFinding(collector, "foundations", "error", "invalid-icon-color", `Icon color "${role}" does not resolve.`,
          `"${value}" does not match a palette shade or a semantic token. Repoint it so icons always paint.`,
          `foundations.icons.colors.${role}`, role, routeFor(systemId, "icons"));
      } else {
        pass(collector);
      }
    } catch {
      addFinding(collector, "foundations", "error", "invalid-icon-color", `Icon color "${role}" does not resolve.`,
        "That icon color reference failed to resolve. Repoint it to a palette shade or semantic token.",
        `foundations.icons.colors.${role}`, role, routeFor(systemId, "icons"));
    }
  }

  for (const token of foundations.typography?.styles ?? []) {
    const problems: string[] = [];
    if (parseWeight(String(token.weight)) === null) problems.push("weight");
    if (parseFontSize(token.size) === null) problems.push("size");
    if (parseLineHeight(String(token.lineHeight)) === null) problems.push("line height");
    if (parseLetterSpacing(token.letterSpacing) === null) problems.push("letter spacing");
    if (problems.length > 0) {
      addFinding(collector, "foundations", "error", "invalid-typography", `Text style "${token.id}" has an invalid ${problems.join(", ")}.`,
        `Fix the ${problems.join(", ")} on this text style so type renders predictably.`,
        `foundations.typography.styles.${token.id}`, token.id, routeFor(systemId, "typography"));
    } else {
      pass(collector);
    }
  }

  const containers = Array.isArray(
    (foundations.grid as { containers?: unknown } | undefined)?.containers,
  )
    ? (foundations.grid.containers ?? [])
    : [];
  for (const container of containers) {
    if (parseContainerValue(container.value) === null) {
      addFinding(collector, "foundations", "error", "invalid-grid-container", `Grid container "${container.id}" has an invalid width.`,
        `"${container.value}" is not a usable container width. Use pixels, rem, or 100% for full-bleed.`,
        `foundations.grid.containers.${container.id}`, container.id, routeFor(systemId, "grid"));
    } else {
      pass(collector);
    }
  }
  const defaultContainer = foundations.grid?.defaultContainer ?? "standard";
  if (!containers.some((container) => container.id === defaultContainer)) {
    addFinding(collector, "foundations", "error", "invalid-grid-default", `Default grid container "${defaultContainer}" does not exist.`,
      "Choose an existing container as the default so layouts have a known width.",
      "foundations.grid.defaultContainer", defaultContainer, routeFor(systemId, "grid"));
  } else {
    pass(collector);
  }
  const spacingIds = new Set([
    ...(foundations.spacing?.scale ?? []).map((token) => token.id),
    ...(foundations.sizing?.tokens ?? []).map((token) => token.id),
  ]);
  const profiles = Array.isArray(
    (foundations.grid as { profiles?: unknown } | undefined)?.profiles,
  )
    ? (foundations.grid.profiles ?? [])
    : [];
  for (const profile of profiles) {
    let ok = true;
    if (!Number.isInteger(profile.columns) || profile.columns < 1 || profile.columns > 12) {
      ok = false;
      addFinding(collector, "foundations", "error", "invalid-grid-columns", `Grid profile "${profile.breakpointId}" has an invalid column count.`,
        "Column counts must be whole numbers from 1 to 12.",
        `foundations.grid.profiles.${profile.breakpointId}.columns`, profile.breakpointId, routeFor(systemId, "grid"));
    }
    for (const slot of ["gutter", "columnGap", "rowGap"] as const) {
      if (!spacingIds.has(profile[slot])) {
        ok = false;
        addFinding(collector, "foundations", "error", "invalid-grid-gap", `Grid profile "${profile.breakpointId}" points at a missing spacing token.`,
          `"${profile[slot]}" is not a spacing token in this system. Pick an existing spacing token.`,
          `foundations.grid.profiles.${profile.breakpointId}.${slot}`, profile.breakpointId, routeFor(systemId, "grid"));
      }
    }
    if (ok) pass(collector);
  }

  const breakpoints = ensureBreakpointScale(foundations.breakpoints?.scale);
  const seenThresholds = new Map<number, string>();
  breakpoints.forEach((token, index) => {
    const parsed = parseBreakpointValue(token.value);
    if (parsed === null) {
      addFinding(collector, "foundations", "error", "invalid-breakpoint", `Breakpoint "${token.id}" has an invalid threshold.`,
        `"${token.value}" is not a usable minimum width. Use pixels or rem, like "768px".`,
        `foundations.breakpoints.scale.${token.id}`, token.id, routeFor(systemId, "breakpoints"));
      return;
    }
    const px = parsed.unit === "px" ? parsed.amount : parsed.amount * 16;
    if (token.id === "base" && px !== 0) {
      addFinding(collector, "foundations", "error", "invalid-breakpoint-base", `The "base" breakpoint must stay at 0px.`,
        `It is currently "${token.value}". Reset it to 0px so mobile-first ordering holds.`,
        "foundations.breakpoints.scale.base", "base", routeFor(systemId, "breakpoints"));
      return;
    }
    const clash = seenThresholds.get(px);
    if (clash !== undefined) {
      addFinding(collector, "foundations", "warning", "duplicate-breakpoint-threshold", `Breakpoint "${token.id}" shares a threshold with "${clash}".`,
        `Both start at ${token.value}. Give each breakpoint a unique threshold so only one activates at a time.`,
        `foundations.breakpoints.scale.${token.id}`, token.id, routeFor(systemId, "breakpoints"));
      return;
    }
    seenThresholds.set(px, token.id);
    if (index > 0) {
      const previous = breakpoints[index - 1]!;
      const previousParsed = parseBreakpointValue(previous.value);
      const previousPx = previousParsed
        ? previousParsed.unit === "px" ? previousParsed.amount : previousParsed.amount * 16
        : null;
      if (previousPx !== null && px <= previousPx) {
        addFinding(collector, "foundations", "error", "breakpoint-order", `Breakpoint "${token.id}" breaks ascending order.`,
          `"${token.value}" must start after "${previous.id}" (${previous.value}). Raise its threshold.`,
          `foundations.breakpoints.scale.${token.id}`, token.id, routeFor(systemId, "breakpoints"));
        return;
      }
    }
    pass(collector);
  });
}

function checkSemanticTokens(system: DesignSystemConfig, systemId: string, collector: Collector): void {
  let missing: string[];
  try {
    missing = missingStandardTokens(system);
  } catch {
    missing = [];
  }
  for (const id of missing) {
    addFinding(collector, "semantic-tokens", "error", "missing-baseline", `Baseline token "${id}" is missing.`,
      "This baseline token backs themes and component defaults. Re-add it so overrides and previews keep working.",
      `semanticTokens.${id}`, id, routeFor(systemId, "tokens"));
  }
  if (missing.length === 0) pass(collector);

  for (const token of system.semanticTokens ?? []) {
    let result: ReturnType<typeof validateTokenValue>;
    try {
      result = validateTokenValue(system, token.value, token.id);
    } catch {
      continue;
    }
    if (!result.ok) {
      addFinding(collector, "semantic-tokens", "error", "invalid-token-value", `Token "${token.id}" has an invalid value.`,
        result.error,
        `semanticTokens.${token.id}.value`, token.id, routeFor(systemId, "tokens"));
    } else {
      pass(collector);
    }
  }
}

function checkThemes(system: DesignSystemConfig, systemId: string, collector: Collector): void {
  const themes = system.themes ?? [];
  for (const required of REQUIRED_THEME_IDS as readonly string[]) {
    if (!themes.some((theme) => theme.id === required)) {
      addFinding(collector, "themes", "error", "missing-theme", `The "${required}" theme is missing.`,
        `Every system keeps a Light and a Dark theme. Re-add "${required}" so themed previews and exports stay complete.`,
        `themes.${required}`, required, routeFor(systemId, "themes"));
    }
  }
  if (themes.some((theme) => theme.id === "light") && themes.some((theme) => theme.id === "dark")) {
    pass(collector);
  }

  for (const theme of themes) {
    let keys: string[];
    try {
      keys = invalidOverrideKeys(system, theme.id);
    } catch {
      keys = [];
    }
    for (const key of keys) {
      addFinding(collector, "themes", "error", "invalid-override-key", `Theme "${theme.label || theme.id}" overrides an unknown token "${key}".`,
        "Overrides must point at existing semantic tokens. Remove this override or repoint it to a real token.",
        `themes.${theme.id}.overrides.${key}`, key, routeFor(systemId, "themes"));
    }
    let broken: ReturnType<typeof unresolvedOverrides>;
    try {
      broken = unresolvedOverrides(system, theme.id);
    } catch {
      broken = [];
    }
    for (const entry of broken) {
      addFinding(collector, "themes", "error", "unresolved-override", `Theme "${theme.label || theme.id}" cannot resolve "${entry.tokenId}".`,
        entry.reason ?? `"${entry.value}" does not resolve inside this theme. Pick a palette shade, another token, or a hex value.`,
        `themes.${theme.id}.overrides.${entry.tokenId}`, entry.tokenId, routeFor(systemId, "themes"));
    }
    if (keys.length === 0 && broken.length === 0) pass(collector);
  }
}

function checkComponents(system: DesignSystemConfig, collector: Collector): void {
  // Component slots may point at non-color foundation recipes (shadow, radius,
  // spacing, motion, icon sizes, border tokens) that the color-oriented token
  // resolver does not cover. Those ids are valid targets, not broken refs.
  const recipeIds = new Set<string>();
  for (const token of system.foundations?.shadows?.tokens ?? []) recipeIds.add(token.id);
  for (const token of system.foundations?.spacing?.scale ?? []) recipeIds.add(token.id);
  for (const token of system.foundations?.sizing?.tokens ?? []) recipeIds.add(token.id);
  const radiusScale = Array.isArray(system.foundations?.radius?.scale)
    ? system.foundations.radius.scale
    : [];
  for (const token of radiusScale) recipeIds.add(token.id);
  for (const token of system.foundations?.borders?.tokens ?? []) recipeIds.add(token.id);
  for (const key of Object.keys(system.foundations?.borders?.widths ?? {})) recipeIds.add(key);
  for (const key of Object.keys(system.foundations?.borders?.styles ?? {})) recipeIds.add(key);
  for (const token of system.foundations?.motion?.durations ?? []) recipeIds.add(token.id);
  for (const token of system.foundations?.motion?.easings ?? []) recipeIds.add(token.id);
  const iconSizes = Array.isArray(system.foundations?.icons?.sizes)
    ? system.foundations.icons.sizes
    : [];
  for (const token of iconSizes) recipeIds.add(token.id);
  for (const token of system.foundations?.typography?.styles ?? []) recipeIds.add(token.id);

  for (const entry of system.components ?? []) {
    (entry?.overrides ?? []).forEach((override, index) => {
      if (!override?.token) {
        addFinding(collector, "components", "error", "missing-slot", `A ${entry?.component ?? "component"} override is missing its slot.`,
          "Every component override needs a token slot (for example background or border) so exports know what it styles.",
          `components.${entry?.component ?? index}.overrides.${index}`, entry?.component ?? "component",
          COMPONENTS_CATALOG_ROUTE);
        return;
      }
      try {
        if (recipeIds.has(override.value)) {
          pass(collector);
          return;
        }
        const resolution = resolveToken(system, override.value);
        const looksRef = typeof override.value === "string" && override.value.includes(".");
        if (resolution.status !== "resolved" && (looksRef || resolution.status === "circular")) {
          addFinding(collector, "components", "error", "invalid-slot-reference",
            `"${entry.component}" slot "${override.token}" points at an unknown value.`,
            `"${override.value}" does not match a token, palette shade, or theme value. Repoint it so the component renders.`,
            `components.${entry.component}.overrides.${index}`, entry.component, COMPONENTS_CATALOG_ROUTE);
        } else if (resolution.status === "resolved") {
          pass(collector);
        } else {
          // Non-reference literals (e.g. shadow recipes) pass through.
          pass(collector);
        }
      } catch {
        // Never throws the report: resolution is total, this is defensive.
      }
    });
  }

  // Design systems contain basic components only. Premium experiences live
  // exclusively in the component library and are never part of a system.
  // Legacy stored systems may still list premium ids — surface them once as
  // ignored so nothing silently vanishes, and point at the library.
  let rawIncluded: string[];
  try {
    rawIncluded = Array.isArray(system.library?.included) ? [...system.library.included] : [];
  } catch {
    rawIncluded = [];
  }
  for (const id of rawIncluded) {
    try {
      const entry = manifestById(id);
      if (entry && entry.tier === "premium") {
        addFinding(collector, "components", "warning", "premium-not-in-systems",
          `"${entry.name}" is a premium experience and is not part of design systems.`,
          "Premium components live only in the component library, where they can be downloaded individually. This entry is ignored by the system — remove it to keep the stored list clean.",
          `library.included.${id}`, entry.name, COMPONENTS_CATALOG_ROUTE);
      } else if (!entry) {
        addFinding(collector, "components", "warning", "unknown-component",
          `Included component "${id}" is not in the catalog.`,
          "It stays stored so nothing is silently deleted, but it will not render or export. Remove it or re-include a known component.",
          `library.included.${id}`, id, COMPONENTS_CATALOG_ROUTE);
      }
    } catch {
      // Defensive: catalog lookup is total, never throws the report.
    }
  }

  pass(collector);
}

function checkAccessibility(system: DesignSystemConfig, systemId: string, collector: Collector): void {
  for (const pair of CONTRAST_PAIRS) {
    const pairSlug = `${pair.foreground}-on-${pair.background}`.replace(/[^a-z0-9]+/g, "-");
    let foreground: string | null = null;
    let background: string | null = null;
    try {
      const fore = resolveToken(system, pair.foreground);
      const back = resolveToken(system, pair.background);
      if (fore.status === "resolved" && isHexColor(fore.value)) foreground = fore.value;
      if (back.status === "resolved" && isHexColor(back.value)) background = back.value;
    } catch {
      foreground = null;
      background = null;
    }
    if (foreground === null || background === null) {
      addFinding(collector, "accessibility", "warning", "contrast-unresolvable",
        `${pair.label}: contrast could not be checked.`,
        "One or both tokens did not resolve to a color, so automated contrast guidance is unavailable. Resolve both tokens to enable the check. This is automated guidance, not an accessibility certification.",
        `accessibility.${pairSlug}`, pair.label, routeFor(systemId, "tokens"));
      continue;
    }
    const ratio = contrastRatio(foreground, background);
    if (ratio === null) {
      addFinding(collector, "accessibility", "warning", "contrast-unresolvable",
        `${pair.label}: contrast could not be checked.`,
        "Both tokens resolved, but not to comparable colors. This is automated guidance, not an accessibility certification.",
        `accessibility.${pairSlug}`, pair.label, routeFor(systemId, "tokens"));
      continue;
    }
    if (ratio < pair.threshold) {
      addFinding(collector, "accessibility", "warning", "low-contrast",
        `${pair.label}: low contrast (${ratio.toFixed(2)}:1).`,
        `Automated guidance: ${ratio.toFixed(2)}:1 is below the ${pair.threshold}:1 guide for this pair (${foreground} on ${background}). Adjust the tokens and re-check. This is not a legal accessibility certification.`,
        `accessibility.${pairSlug}`, pair.label, routeFor(systemId, "tokens"));
    } else {
      pass(collector);
    }
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

const CHECKED_LIST: readonly string[] = [
  "Foundation values: spacing, sizing, radius, borders, shadows, motion, icons, typography, grid, and breakpoints",
  "Palette bases and shade values",
  "Baseline semantic-token coverage",
  "Semantic-token values, aliases, and circular references",
  "Light and Dark theme presence",
  "Theme override keys, values, and cycles",
  "Component slot references",
  "Premium components are library-only and never part of a system",
  "Text and action contrast pairs (automated guidance only)",
  "Export readiness (errors block export; warnings travel with the report)",
];

export interface ValidateOptions {
  /** Builder id used to build "Open in editor" routes. Defaults to the system id. */
  systemId?: string;
}

/**
 * Inspect a complete saved DesignSystemConfig and answer: is this system
 * safe and ready to use/export? Read-only: the system is never mutated.
 * Never throws: unexpected input yields a single error finding.
 */
export function validateDesignSystemReport(
  system: DesignSystemConfig,
  options: ValidateOptions = {},
): ValidationReport {
  const collector: Collector = { findings: [], seen: new Set(), passed: 0 };
  const systemId = options.systemId ?? system?.id ?? "unknown";

  try {
    if (!system || typeof system !== "object") {
      addFinding(collector, "foundations", "error", "malformed", "Design system is missing or malformed.",
        "Nothing could be checked. Reload the system or create a new one.",
        "", "system", routeFor(systemId, ""));
    } else {
      checkStructural(system, systemId, collector);
      checkFoundationValues(system, systemId, collector);
      checkSemanticTokens(system, systemId, collector);
      checkThemes(system, systemId, collector);
      checkComponents(system, collector);
      checkAccessibility(system, systemId, collector);
    }
  } catch {
    addFinding(collector, "foundations", "error", "validator-error", "Validation failed unexpectedly.",
      "The checker hit an unexpected problem. Nothing was changed; try again or reset the broken area.",
      "", "system", routeFor(systemId, ""));
  }

  const errors = collector.findings.filter((finding) => finding.severity === "error").length;
  const warnings = collector.findings.filter((finding) => finding.severity === "warning").length;

  // Export readiness is derived last: errors block, warnings travel along.
  const exportFindings: ValidationFinding[] = [];
  if (errors > 0) {
    exportFindings.push({
      id: "export-readiness-blocked-export",
      group: "export-readiness",
      severity: "error",
      title: "Export is blocked until errors are fixed.",
      explanation: `${errors} error${errors === 1 ? "" : "s"} must be resolved before this system is safe to export. Warnings can ship with the report, errors cannot.`,
      path: "export",
      affected: "export",
      route: routeFor(systemId, "export"),
    });
  } else {
    collector.passed += 1;
    if (warnings > 0) {
      exportFindings.push({
        id: "export-readiness-warnings-travel",
        group: "export-readiness",
        severity: "info",
        title: `${warnings} warning${warnings === 1 ? "" : "s"} grouped in the export appendix.`,
        explanation: "Warnings do not block export. The handbook appendix groups them so the main chapters stay a clean design reference.",
        path: "export",
        affected: "export",
        route: routeFor(systemId, "export"),
      });
    } else {
      exportFindings.push({
        id: "export-readiness-ready-export",
        group: "export-readiness",
        severity: "info",
        title: "Ready to export.",
        explanation: "No errors or warnings were found. This system is safe to export.",
        path: "export",
        affected: "export",
        route: routeFor(systemId, "export"),
      });
    }
  }

  const allFindings = [...collector.findings, ...exportFindings];
  const summary: ValidationSummary = {
    errors: allFindings.filter((finding) => finding.severity === "error").length,
    warnings: allFindings.filter((finding) => finding.severity === "warning").length,
    infos: allFindings.filter((finding) => finding.severity === "info").length,
    passed: collector.passed,
  };

  const groups: ValidationGroup[] = VALIDATION_GROUP_ORDER.map((id) => ({
    id,
    title: GROUP_META[id].title,
    description: GROUP_META[id].description,
    findings: allFindings
      .filter((finding) => finding.group === id)
      .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
  }));

  const status: ValidationStatus =
    summary.errors > 0 ? "needs-attention" : summary.warnings > 0 ? "ready-with-warnings" : "ready";

  return {
    status,
    statusLabel: status === "ready" ? "Ready to export" : status === "ready-with-warnings" ? "Ready with warnings" : "Needs attention",
    summary,
    groups,
    checked: [...CHECKED_LIST],
    exportReady: summary.errors === 0,
  };
}
