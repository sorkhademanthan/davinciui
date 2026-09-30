// Typography editing logic for the Typography foundation editor (Step 6).
// Pure functions only — no React, no storage. Uses the canonical Step 1
// schema (`TypefaceSpec` roles + `TextStyle` snapshots) without extending it:
// a style is "inherited" when every snapshot field matches its role, and
// "overridden" as soon as any field differs. Resetting copies role values.

import type {
  DesignSystemConfig,
  TextStyle,
  TypefaceSpec,
  TypographyRole,
} from "./domain";

export const ROLE_ORDER: readonly TypographyRole[] = ["display", "heading", "body", "label", "mono"];

export const ROLE_LABELS: Record<TypographyRole, string> = {
  display: "Display",
  heading: "Heading",
  body: "Body",
  label: "Label",
  mono: "Mono",
};

export type SpecField = "fontFamily" | "fallback" | "weight" | "size" | "lineHeight" | "letterSpacing";

export const SPEC_FIELDS: readonly SpecField[] = [
  "fontFamily",
  "fallback",
  "weight",
  "size",
  "lineHeight",
  "letterSpacing",
];

export interface StyleDefinition {
  id: string;
  label: string;
  role: TypographyRole;
  /** Snapshot overrides applied on top of the role when the style is created. */
  base: Partial<TypefaceSpec>;
}

/**
 * Editable text styles. The first eight mirror the Step 1 defaults; h4 and
 * caption extend the contract using role-derived values.
 */
export const STYLE_DEFINITIONS: readonly StyleDefinition[] = [
  { id: "display", label: "Display", role: "display", base: {} },
  { id: "h1", label: "Heading 1", role: "heading", base: { size: "2.25rem", weight: 700 } },
  { id: "h2", label: "Heading 2", role: "heading", base: { size: "1.875rem" } },
  { id: "h3", label: "Heading 3", role: "heading", base: {} },
  { id: "h4", label: "Heading 4", role: "heading", base: { size: "1.25rem", weight: 600 } },
  { id: "body", label: "Body", role: "body", base: {} },
  { id: "body-sm", label: "Body small", role: "body", base: { size: "0.875rem" } },
  { id: "label", label: "Label", role: "label", base: {} },
  { id: "caption", label: "Caption", role: "label", base: { size: "0.75rem", weight: 400 } },
  { id: "code", label: "Code", role: "mono", base: {} },
];

function snapshotFor(definition: StyleDefinition, role: TypefaceSpec): TextStyle {
  return {
    id: definition.id,
    label: definition.label,
    role: definition.role,
    fontFamily: definition.base.fontFamily ?? role.fontFamily,
    fallback: definition.base.fallback ?? [...role.fallback],
    weight: definition.base.weight ?? role.weight,
    size: definition.base.size ?? role.size,
    lineHeight: definition.base.lineHeight ?? role.lineHeight,
    letterSpacing: definition.base.letterSpacing ?? role.letterSpacing,
  };
}

/**
 * Effective style list: existing snapshots preserved in place, missing
 * definitions appended from role-derived values. Never mutates the system.
 */
export function ensureTextStyles(system: DesignSystemConfig): TextStyle[] {
  const existing = system.foundations.typography.styles ?? [];
  const byId = new Map(existing.map((style) => [style.id, style]));
  const ordered: TextStyle[] = [];
  for (const definition of STYLE_DEFINITIONS) {
    const found = byId.get(definition.id);
    if (found) {
      ordered.push({ ...found, fallback: [...found.fallback] });
    } else {
      const role = system.foundations.typography.roles[definition.role];
      ordered.push(snapshotFor(definition, role));
    }
  }
  // Preserve any extra custom styles the system already carries.
  for (const style of existing) {
    if (!STYLE_DEFINITIONS.some((definition) => definition.id === style.id)) {
      ordered.push({ ...style, fallback: [...style.fallback] });
    }
  }
  return ordered;
}

/** Replace one role; every other role is untouched. */
export function updateRole(
  system: DesignSystemConfig,
  role: TypographyRole,
  patch: Partial<TypefaceSpec>,
): DesignSystemConfig {
  const roles = system.foundations.typography.roles;
  return {
    ...system,
    foundations: {
      ...system.foundations,
      typography: {
        ...system.foundations.typography,
        roles: {
          ...roles,
          [role]: {
            ...roles[role],
            ...patch,
            ...(patch.fallback ? { fallback: [...patch.fallback] } : {}),
          },
        },
      },
    },
  };
}

/** Replace one text style; every other style is untouched. */
export function updateStyle(
  system: DesignSystemConfig,
  styleId: string,
  patch: Partial<TypefaceSpec>,
): DesignSystemConfig {
  const styles = ensureTextStyles(system);
  return {
    ...system,
    foundations: {
      ...system.foundations,
      typography: {
        ...system.foundations.typography,
        styles: styles.map((style) =>
          style.id === styleId
            ? { ...style, ...patch, ...(patch.fallback ? { fallback: [...patch.fallback] } : {}) }
            : style,
        ),
      },
    },
  };
}

/** Reset one style to its role/default snapshot (definition base applied). */
export function resetStyleToRole(system: DesignSystemConfig, styleId: string): DesignSystemConfig {
  const definition = STYLE_DEFINITIONS.find((item) => item.id === styleId);
  if (!definition) return system;
  const role = system.foundations.typography.roles[definition.role];
  const styles = ensureTextStyles(system).map((style) =>
    style.id === styleId ? snapshotFor(definition, role) : style,
  );
  return {
    ...system,
    foundations: {
      ...system.foundations,
      typography: { ...system.foundations.typography, styles },
    },
  };
}

/**
 * Reset one role to a starter-template snapshot (caller supplies the starter
 * typography, e.g. from `createSystemFromStarter`). Styles are untouched, so
 * previously overridden styles stay visibly overridden against the new role.
 */
export function resetRoleToStarter(
  system: DesignSystemConfig,
  role: TypographyRole,
  starterTypography: { roles: Record<TypographyRole, TypefaceSpec> },
): DesignSystemConfig {
  const snapshot = starterTypography.roles[role];
  return updateRole(system, role, {
    fontFamily: snapshot.fontFamily,
    fallback: [...snapshot.fallback],
    weight: snapshot.weight,
    size: snapshot.size,
    lineHeight: snapshot.lineHeight,
    letterSpacing: snapshot.letterSpacing,
  });
}

/** Apply a role's family to every style of that role (explicit bulk action). */
export function applyFamilyToRoleStyles(system: DesignSystemConfig, role: TypographyRole): DesignSystemConfig {
  const family = system.foundations.typography.roles[role].fontFamily;
  const styles = ensureTextStyles(system).map((style) =>
    style.role === role ? { ...style, fontFamily: family } : style,
  );
  return {
    ...system,
    foundations: {
      ...system.foundations,
      typography: { ...system.foundations.typography, styles },
    },
  };
}

/**
 * Apply one deliberate font assignment to a related set of roles and their
 * styles in a single immutable update. This powers the beginner-friendly
 * pairing picker while leaving individual role/style editing available.
 */
export function assignFontFamily(
  system: DesignSystemConfig,
  roles: readonly TypographyRole[],
  fontFamily: string,
  fallback: readonly string[],
): DesignSystemConfig {
  const selectedRoles = new Set(roles);
  const typography = system.foundations.typography;
  const styles = ensureTextStyles(system);
  return {
    ...system,
    foundations: {
      ...system.foundations,
      typography: {
        ...typography,
        primary: selectedRoles.has("body") ? fontFamily : typography.primary,
        roles: {
          ...typography.roles,
          ...Object.fromEntries(
            roles.map((role) => [
              role,
              { ...typography.roles[role], fontFamily, fallback: [...fallback] },
            ]),
          ),
        },
        styles: styles.map((style) =>
          selectedRoles.has(style.role)
            ? { ...style, fontFamily, fallback: [...fallback] }
            : style,
        ),
      },
    },
  };
}

export interface OverrideReport {
  overridden: boolean;
  fields: SpecField[];
}

/** Which snapshot fields differ from the style's reset target (derived inheritance). */
export function styleOverrides(system: DesignSystemConfig, styleId: string): OverrideReport {
  const styles = ensureTextStyles(system);
  const style = styles.find((item) => item.id === styleId);
  if (!style) return { overridden: false, fields: [] };
  // The reset target is the definition default (role values + definition
  // base), so starter h1/h2/h3 sizes read as inherited until edited.
  const definition = STYLE_DEFINITIONS.find((item) => item.id === styleId);
  const role = system.foundations.typography.roles[style.role];
  const baseline: TypefaceSpec = definition
    ? {
        fontFamily: definition.base.fontFamily ?? role.fontFamily,
        fallback: definition.base.fallback ?? [...role.fallback],
        weight: definition.base.weight ?? role.weight,
        size: definition.base.size ?? role.size,
        lineHeight: definition.base.lineHeight ?? role.lineHeight,
        letterSpacing: definition.base.letterSpacing ?? role.letterSpacing,
      }
    : role;
  const fields = SPEC_FIELDS.filter((field) => {
    if (field === "fallback") {
      return JSON.stringify(style.fallback) !== JSON.stringify(baseline.fallback);
    }
    return style[field] !== baseline[field];
  });
  return { overridden: fields.length > 0, fields };
}

/** CSS-ready values for preview rendering of one style snapshot. */
export function styleForPreview(
  system: DesignSystemConfig,
  styleId: string,
): {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: number | string;
  letterSpacing: string;
} {
  const styles = ensureTextStyles(system);
  const style = styles.find((item) => item.id === styleId);
  const role = system.foundations.typography.roles.body;
  const snapshot = style ?? { ...role, id: styleId, label: styleId, role: "body" as TypographyRole };
  const stack = [snapshot.fontFamily.trim(), ...snapshot.fallback.map((item) => item.trim()).filter(Boolean)];
  return {
    fontFamily: stack.join(", "),
    fontWeight: snapshot.weight,
    fontSize: snapshot.size,
    lineHeight: snapshot.lineHeight,
    letterSpacing: snapshot.letterSpacing,
  };
}

// ---------------------------------------------------------------------------
// Value parsing: normalize on save, reject with guidance otherwise.
// ---------------------------------------------------------------------------

/** Integer 1–1000 (typical range 100–900). Returns null when invalid. */
export function parseWeight(value: string): number | null {
  const text = value.trim();
  if (!/^\d{1,4}$/.test(text)) return null;
  const parsed = Number.parseInt(text, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1000) return null;
  return parsed;
}

const LENGTH_UNITS = ["rem", "px", "em", "%"] as const;

/** CSS length; bare numbers become px. Returns normalized string or null. */
export function parseFontSize(value: string): string | null {
  const text = value.trim().toLowerCase();
  const bare = /^(\d+(?:\.\d+)?)$/.exec(text);
  if (bare) {
    const amount = Number.parseFloat(bare[1]!);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 240) return null;
    return `${stripTrailingZeros(amount)}px`;
  }
  const match = /^(\d+(?:\.\d+)?)(rem|px|em|%)$/.exec(text);
  if (!match) return null;
  const amount = Number.parseFloat(match[1]!);
  const unit = match[2]!;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (unit === "px" && amount > 320) return null;
  if ((unit === "rem" || unit === "em") && amount > 20) return null;
  if (unit === "%" && amount > 2000) return null;
  return `${stripTrailingZeros(amount)}${unit}`;
}

/**
 * Unitless multiplier (0.5–3, e.g. 1.5) or a CSS length.
 * Returns the normalized value or null.
 */
export function parseLineHeight(value: string): number | string | null {
  const text = value.trim().toLowerCase();
  if (/^\d+(?:\.\d+)?$/.test(text)) {
    const amount = Number.parseFloat(text);
    if (!Number.isFinite(amount) || amount < 0.5 || amount > 3) return null;
    return stripTrailingZeros(amount);
  }
  return parseFontSize(text);
}

/** em/px/rem length, negative allowed; bare numbers become em. Null when invalid. */
export function parseLetterSpacing(value: string): string | null {
  const text = value.trim().toLowerCase();
  const bare = /^(-?\d+(?:\.\d+)?)$/.exec(text);
  if (bare) {
    const amount = Number.parseFloat(bare[1]!);
    if (!Number.isFinite(amount) || Math.abs(amount) > 1) return null;
    return `${stripTrailingZeros(amount)}em`;
  }
  const match = /^(-?\d+(?:\.\d+)?)(px|em|rem)$/.exec(text);
  if (!match) return null;
  const amount = Number.parseFloat(match[1]!);
  if (!Number.isFinite(amount) || Math.abs(amount) > 16) return null;
  return `${stripTrailingZeros(amount)}${match[2]!}`;
}

/** Comma-separated fallback stack → trimmed non-empty entries. */
export function parseFallbackStack(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** Family name: non-empty after trim, backticks/quotes stripped. */
export function parseFamilyName(value: string): string | null {
  const cleaned = value.trim().replace(/^[`'"]+|[`'"]+$/g, "").trim();
  return cleaned.length > 0 && cleaned.length <= 80 ? cleaned : null;
}

function stripTrailingZeros(amount: number): number {
  return Number.parseFloat(amount.toFixed(4));
}
