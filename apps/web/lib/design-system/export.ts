// Pure client-side export preparation for the Design System builder.
// No React, storage, network, or browser APIs live here. The same immutable
// snapshot drives the PDF, JSON, and CSS downloads.

import {
  resolveToken,
  type DesignSystemConfig,
  type SemanticToken,
} from "./domain";
import {
  validateDesignSystemReport,
  type ValidationFinding,
  type ValidationReport,
} from "./validation";
import { includedEntries } from "./component-curation";

export const EXPORT_FORMAT_VERSION = "1.0";

export type ExportChapterId =
  | "overview"
  | "colors"
  | "typography"
  | "layout-foundations"
  | "motion-icons"
  | "responsive-layout"
  | "semantic-tokens"
  | "themes"
  | "components"
  | "system-health";

export interface ExportChapter {
  id: ExportChapterId;
  number: string;
  title: string;
  description: string;
}

export const EXPORT_CHAPTERS: readonly ExportChapter[] = [
  { id: "overview", number: "01", title: "System overview", description: "Identity, starter, density, and document conventions." },
  { id: "colors", number: "02", title: "Colour foundations", description: "Palettes, roles, base colours, and complete shade scales." },
  { id: "typography", number: "03", title: "Typography", description: "Font roles and the text styles used across the product." },
  { id: "layout-foundations", number: "04", title: "Spacing and surfaces", description: "Spacing, sizing, radius, borders, and elevation recipes." },
  { id: "motion-icons", number: "05", title: "Motion and icons", description: "Interaction timing, reduced motion, icon sizing, and stroke treatment." },
  { id: "responsive-layout", number: "06", title: "Responsive layout", description: "Containers, page grid, and breakpoint behaviour." },
  { id: "semantic-tokens", number: "07", title: "Semantic tokens", description: "Stable colour roles with resolved light and dark values." },
  { id: "themes", number: "08", title: "Themes", description: "Theme inheritance, overrides, and essential interface roles." },
  { id: "components", number: "09", title: "Components", description: "Selected basic components and the token slots each one follows." },
  { id: "system-health", number: "10", title: "System health", description: "Accessibility, validation coverage, and review priorities." },
] as const;

/**
 * Keep the handbook adaptive: an empty optional system layer should not leave
 * an empty chapter behind. Numbers are regenerated after filtering so the
 * contents, bookmarks, and chapter headings always agree.
 */
export function exportChaptersForSystem(system: DesignSystemConfig): ExportChapter[] {
  const included = EXPORT_CHAPTERS.filter((chapter) => {
    if (chapter.id === "colors") return system.foundations.colors.palettes.some((palette) => palette.enabled);
    if (chapter.id === "semantic-tokens") return system.semanticTokens.length > 0;
    if (chapter.id === "themes") return system.themes.length > 0;
    if (chapter.id === "components") return includedEntries(system, "core").length > 0;
    return true;
  });
  return included.map((chapter, index) => ({
    ...chapter,
    number: String(index + 1).padStart(2, "0"),
  }));
}

export interface DesignSystemExportModel {
  formatVersion: typeof EXPORT_FORMAT_VERSION;
  generatedAt: string;
  filenameBase: string;
  chapters: ExportChapter[];
  system: DesignSystemConfig;
  report: ValidationReport;
  warnings: ValidationFinding[];
}

export type PrepareExportResult =
  | { ok: true; model: DesignSystemExportModel }
  | { ok: false; report: ValidationReport; errors: ValidationFinding[] };

function cloneSystem(system: DesignSystemConfig): DesignSystemConfig {
  return JSON.parse(JSON.stringify(system)) as DesignSystemConfig;
}

/** Filesystem-safe, human-readable filename stem. */
export function exportFilenameBase(system: DesignSystemConfig): string {
  const name = system.meta.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64) || "design-system";
  const version = system.meta.version
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/(^-|-$)/g, "") || "1.0";
  return `${name}-design-system-v${version}`;
}

/**
 * Prepare one immutable export snapshot. Errors block export; warnings are
 * intentionally retained as review notes and never block the download.
 */
export function prepareDesignSystemExport(
  system: DesignSystemConfig,
  generatedAt = new Date().toISOString(),
): PrepareExportResult {
  const snapshot = cloneSystem(system);
  const report = validateDesignSystemReport(snapshot, { systemId: snapshot.id });
  const findings = report.groups.flatMap((group) => group.findings);
  const errors = findings.filter((finding) => finding.severity === "error");
  if (!report.exportReady || errors.length > 0) return { ok: false, report, errors };
  return {
    ok: true,
    model: {
      formatVersion: EXPORT_FORMAT_VERSION,
      generatedAt,
      filenameBase: exportFilenameBase(snapshot),
      chapters: exportChaptersForSystem(snapshot),
      system: snapshot,
      report,
      warnings: findings.filter((finding) => finding.severity === "warning"),
    },
  };
}

/** Raw canonical system JSON stays compatible with repository importRaw(). */
export function serializeDesignSystemJson(system: DesignSystemConfig): string {
  return `${JSON.stringify(system, null, 2)}\n`;
}

/** Keep third-party renderer internals out of the product-facing error UI. */
export function exportFailureMessage(error: unknown, kind: "pdf" | "json" | "css"): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (kind === "pdf" && /unsupported number|infinity|nan/i.test(raw)) {
    return "The PDF layout could not be completed safely. Refresh the page and try again.";
  }
  if (kind === "pdf") return "The PDF could not be generated. Refresh the page and try again.";
  return `The ${kind.toUpperCase()} file could not be generated. Try again.`;
}

function cssName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/(^-|-$)/g, "") || "token";
}

function cssValue(value: string): string {
  return value.replace(/[\r\n{};]/g, " ").trim();
}

function tokenLines(system: DesignSystemConfig, token: SemanticToken, themeId?: string): string[] {
  const resolution = resolveToken(system, token.id, themeId);
  if (resolution.status !== "resolved") return [];
  return [`  --ds-${cssName(token.id)}: ${cssValue(resolution.value)};`];
}

/** Developer-ready primitives plus resolved semantic variables per theme. */
export function serializeDesignSystemCss(system: DesignSystemConfig): string {
  const lines: string[] = [
    `/* ${system.meta.name} - generated by DavinciUI Design System */`,
    `/* Source version: ${system.meta.version} */`,
    "",
    ":root {",
  ];

  for (const palette of system.foundations.colors.palettes.filter((entry) => entry.enabled)) {
    for (const [shade, value] of Object.entries(palette.shades)) {
      lines.push(`  --ds-color-${cssName(palette.id)}-${cssName(shade)}: ${cssValue(value)};`);
    }
  }
  for (const token of system.foundations.spacing.scale) lines.push(`  --ds-${cssName(token.id)}: ${cssValue(token.value)};`);
  for (const token of system.foundations.sizing.tokens) lines.push(`  --ds-${cssName(token.id)}: ${cssValue(token.value)};`);
  for (const token of system.foundations.radius.scale) lines.push(`  --ds-radius-${cssName(token.id)}: ${cssValue(token.value)};`);
  for (const token of system.foundations.motion.durations.filter((entry) => entry.enabled !== false)) {
    lines.push(`  --ds-duration-${cssName(token.id)}: ${cssValue(token.value)};`);
  }
  for (const token of system.foundations.motion.easings.filter((entry) => entry.enabled !== false)) {
    lines.push(`  --ds-easing-${cssName(token.id)}: ${cssValue(token.value)};`);
  }
  lines.push("}", "");

  for (const theme of system.themes) {
    lines.push(`[data-ds-theme="${cssName(theme.id)}"] {`);
    for (const token of system.semanticTokens) lines.push(...tokenLines(system, token, theme.id));
    lines.push("}", "");
  }

  return `${lines.join("\n").trim()}\n`;
}
