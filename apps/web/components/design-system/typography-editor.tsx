"use client"

import { Check, RotateCcw } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { resolveToken, type DesignSystemConfig, type TypefaceSpec, type TypographyRole } from "@/lib/design-system/domain"
import { createSystemFromStarter } from "@/lib/design-system/starters"
import {
  FONT_CATEGORIES,
  fallbacksFor,
  findFont,
  fontCategoryLabel,
  isCustomFamily,
  renderStack,
  searchFonts,
  type FontCategory,
} from "@/lib/design-system/font-catalog"
import {
  applyFamilyToRoleStyles,
  ensureTextStyles,
  parseFallbackStack,
  parseFamilyName,
  parseFontSize,
  parseLetterSpacing,
  parseLineHeight,
  parseWeight,
  resetRoleToStarter,
  resetStyleToRole,
  ROLE_LABELS,
  ROLE_ORDER,
  styleForPreview,
  styleOverrides,
  updateRole,
  updateStyle,
  type SpecField,
} from "@/lib/design-system/typography"

type FocusTarget = { kind: "role"; role: TypographyRole } | { kind: "style"; styleId: string } | null

export function TypographyEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [selectedRole, setSelectedRole] = useState<TypographyRole>("body")
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)
  const [focus, setFocus] = useState<FocusTarget>(null)

  const styles = useMemo(() => ensureTextStyles(system), [system])
  const starterTypography = useMemo(
    () => createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name }).foundations.typography,
    [system.starter.presetId, system.meta.name],
  )

  const commit = (next: DesignSystemConfig) => save(next)

  const selectRole = (role: TypographyRole) => {
    setSelectedRole(role)
    setFocus({ kind: "role", role })
  }

  const selectStyle = (styleId: string | null) => {
    setSelectedStyleId(styleId)
    setFocus(styleId ? { kind: "style", styleId } : null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Design System / Foundations"
        title="Typography"
        description="Define durable type roles, tune individual text styles, and preview the hierarchy live."
      />
      <p className="mt-4 max-w-2xl text-xs leading-5 text-muted-foreground">
        System primary typeface: <span className="font-medium text-foreground">{system.foundations.typography.primary}</span>.
        Roles render below with their own families — editing one role never changes another.
      </p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section aria-label="Type roles" className="rounded-xl border border-border bg-background p-5">
            <h2 className="font-medium">Roles</h2>
            <div role="tablist" aria-label="Typography roles" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {ROLE_ORDER.map((role) => {
                const spec = system.foundations.typography.roles[role]
                const active = selectedRole === role
                return (
                  <button
                    key={role}
                    role="tab"
                    aria-selected={active}
                    aria-controls="role-editor-panel"
                    onClick={() => selectRole(role)}
                    className={`min-h-11 rounded-lg border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
                  >
                    <span aria-hidden="true" className="block truncate text-2xl" style={{ fontFamily: renderStack(spec.fontFamily, spec.fallback) }}>
                      Aa
                    </span>
                    <span className="mt-1 block text-sm font-medium">{ROLE_LABELS[role]}</span>
                    <span className="block truncate text-xs text-muted-foreground">{spec.fontFamily}</span>
                  </button>
                )
              })}
            </div>
            <RoleEditorPanel
              key={`role-${selectedRole}`}
              system={system}
              role={selectedRole}
              starterTypography={starterTypography}
              onSave={(patch) => commit(updateRole(system, selectedRole, patch))}
              onResetRole={(snapshot) => commit(resetRoleToStarter(system, selectedRole, snapshot))}
              onApplyFamily={() => commit(applyFamilyToRoleStyles(system, selectedRole))}
            />
          </section>

          <section aria-label="Text styles" className="rounded-xl border border-border bg-background p-5">
            <h2 className="font-medium">Text styles</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Styles snapshot their role. Overridden values are badged; untouched styles follow role edits after a reset.
            </p>
            <ul className="mt-4 space-y-2">
              {styles.map((style) => {
                const report = styleOverrides(system, style.id)
                const active = selectedStyleId === style.id
                const preview = styleForPreview(system, style.id)
                return (
                  <li key={style.id}>
                    <button
                      onClick={() => selectStyle(active ? null : style.id)}
                      aria-expanded={active}
                      aria-controls={active ? "style-editor-panel" : undefined}
                      className={`flex w-full min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
                    >
                      <span aria-hidden="true" className="w-10 shrink-0 truncate text-xl" style={{ fontFamily: preview.fontFamily, fontWeight: preview.fontWeight }}>
                        Aa
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{style.label}</span>
                        <span className="block truncate font-mono text-[11px] text-muted-foreground">
                          {style.id} · {ROLE_LABELS[style.role]} · {preview.fontSize}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${report.overridden ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {report.overridden ? `Overridden (${report.fields.length})` : "Inherited"}
                      </span>
                    </button>
                    {active && (
                      <StyleEditorPanel
                        key={`style-${style.id}`}
                        system={system}
                        styleId={style.id}
                        onSave={(patch) => commit(updateStyle(system, style.id, patch))}
                        onReset={() => commit(resetStyleToRole(system, style.id))}
                        onClose={() => selectStyle(null)}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
        <TypePreview system={system} focus={focus} onClearFocus={() => setFocus(null)} />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Shared spec-field form
// ---------------------------------------------------------------------------

interface SpecDraft {
  family: string
  fallbackText: string
  weight: string
  size: string
  lineHeight: string
  letterSpacing: string
  touched: Record<string, boolean>
  submitted: boolean
}

function draftFromSpec(spec: TypefaceSpec): SpecDraft {
  return {
    family: spec.fontFamily,
    fallbackText: spec.fallback.join(", "),
    weight: String(spec.weight),
    size: spec.size,
    lineHeight: String(spec.lineHeight),
    letterSpacing: spec.letterSpacing,
    touched: {},
    submitted: false,
  }
}

interface FieldErrors {
  family: string | null
  fallback: string | null
  weight: string | null
  size: string | null
  lineHeight: string | null
  letterSpacing: string | null
}

function validateDraft(draft: SpecDraft): FieldErrors {
  const show = (field: string): boolean => draft.submitted || Boolean(draft.touched[field])
  return {
    family: show("family") && !parseFamilyName(draft.family) ? "Enter a font family name." : null,
    fallback:
      show("fallback") && parseFallbackStack(draft.fallbackText).length === 0
        ? "Enter at least one fallback, e.g. system-ui, sans-serif."
        : null,
    weight: show("weight") && parseWeight(draft.weight) === null ? "Use a whole number from 1 to 1000 (usually 100–900)." : null,
    size: show("size") && parseFontSize(draft.size) === null ? "Use a length like 1rem or 16px." : null,
    lineHeight:
      show("lineHeight") && parseLineHeight(draft.lineHeight) === null
        ? "Use a multiplier 0.5–3 (e.g. 1.5) or a length."
        : null,
    letterSpacing:
      show("letterSpacing") && parseLetterSpacing(draft.letterSpacing) === null
        ? "Use a length like 0em, -0.01em, or 1px."
        : null,
  }
}

function buildPatch(draft: SpecDraft): TypefaceSpec | null {
  const family = parseFamilyName(draft.family)
  const fallback = parseFallbackStack(draft.fallbackText)
  const weight = parseWeight(draft.weight)
  const size = parseFontSize(draft.size)
  const lineHeight = parseLineHeight(draft.lineHeight)
  const letterSpacing = parseLetterSpacing(draft.letterSpacing)
  if (!family || fallback.length === 0 || weight === null || size === null || lineHeight === null || letterSpacing === null) {
    return null
  }
  return { fontFamily: family, fallback, weight, size, lineHeight, letterSpacing }
}

function SpecFields({
  draft,
  errors,
  prefix,
  inherited,
  onChange,
  onBlur,
}: {
  draft: SpecDraft
  errors: FieldErrors
  prefix: string
  inherited: Record<SpecField, boolean>
  onChange: (patch: Partial<SpecDraft>) => void
  onBlur: (field: string) => void
}) {
  const [category, setCategory] = useState<FontCategory | "all">("all")
  const query = draft.family
  const results = searchFonts(query, category).slice(0, 8)
  const custom = isCustomFamily(draft.family)
  const entry = findFont(draft.family)

  const field = (
    name: "family" | "fallback" | "weight" | "size" | "lineHeight" | "letterSpacing",
    label: string,
    hint: string,
    input: ReactNode,
  ) => {
    // The family input is keyed "family" but inherits as the "fontFamily" spec field.
    const key: SpecField = name === "family" ? "fontFamily" : name;
    return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`${prefix}-${name}`} className="text-sm font-medium">
          {label}
        </label>
        <span className={`text-[11px] font-medium ${inherited[key] ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}`}>
          {inherited[key] ? "Inherited" : "Overridden"}
        </span>
      </div>
      <div className="mt-1.5">{input}</div>
      <div className="mt-1.5 min-h-5">
        {errors[name] ? (
          <p id={`${prefix}-${name}-error`} role="alert" className="text-xs font-medium text-destructive">
            {errors[name]}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
    )
  }

  const inputClass = (invalid: boolean): string =>
    `min-h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${invalid ? "border-destructive" : "border-border"}`

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        {field(
          "family",
          "Font family",
          entry ? `Catalogue match · ${fontCategoryLabel(entry.category)}.` : "Type any family name — custom fonts are kept as valid tokens.",
          <>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-xl"
                style={{ fontFamily: renderStack(draft.family || "sans-serif", parseFallbackStack(draft.fallbackText)) }}
              >
                Aa
              </span>
              <input
                id={`${prefix}-family`}
                value={draft.family}
                onChange={(event) => onChange({ family: event.target.value })}
                onBlur={() => onBlur("family")}
                list={`${prefix}-font-list`}
                autoComplete="off"
                spellCheck={false}
                maxLength={80}
                placeholder="e.g. Inter"
                aria-invalid={Boolean(errors.family)}
                aria-describedby={errors.family ? `${prefix}-family-error` : undefined}
                className={inputClass(Boolean(errors.family))}
              />
              {custom && (
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Custom
                </span>
              )}
            </div>
            <datalist id={`${prefix}-font-list`}>
              {results.map((item) => (
                <option key={item.family} value={item.family}>
                  {fontCategoryLabel(item.category)}
                </option>
              ))}
            </datalist>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Filter families by category">
              {(["all", ...FONT_CATEGORIES.map((item) => item.id)] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  className={`inline-flex min-h-11 items-center rounded-full border px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${category === item ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
                >
                  {item === "all" ? "All" : fontCategoryLabel(item)}
                </button>
              ))}
            </div>
          </>,
        )}
      </div>
      {field(
        "fallback",
        "Fallback stack",
        "Comma-separated, used when the family is unavailable.",
        <>
          <input
            id={`${prefix}-fallback`}
            value={draft.fallbackText}
            onChange={(event) => onChange({ fallbackText: event.target.value })}
            onBlur={() => onBlur("fallback")}
            spellCheck={false}
            placeholder="system-ui, sans-serif"
            aria-invalid={Boolean(errors.fallback)}
            aria-describedby={errors.fallback ? `${prefix}-fallback-error` : undefined}
            className={`${inputClass(Boolean(errors.fallback))} font-mono text-[13px]`}
          />
          <button
            type="button"
            onClick={() => onChange({ fallbackText: fallbacksFor(draft.family || "Inter").join(", ") })}
            className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Use {draft.family.trim() || "Inter"} defaults
          </button>
        </>,
      )}
      {field(
        "weight",
        "Weight",
        "Whole number 1–1000 (usually 100–900).",
        <input
          id={`${prefix}-weight`}
          value={draft.weight}
          onChange={(event) => onChange({ weight: event.target.value })}
          onBlur={() => onBlur("weight")}
          inputMode="numeric"
          aria-invalid={Boolean(errors.weight)}
          aria-describedby={errors.weight ? `${prefix}-weight-error` : undefined}
          className={`${inputClass(Boolean(errors.weight))} font-mono text-[13px]`}
        />,
      )}
      {field(
        "size",
        "Font size",
        "Length with unit (rem, px, em, %) — bare numbers become px.",
        <input
          id={`${prefix}-size`}
          value={draft.size}
          onChange={(event) => onChange({ size: event.target.value })}
          onBlur={() => onBlur("size")}
          spellCheck={false}
          aria-invalid={Boolean(errors.size)}
          aria-describedby={errors.size ? `${prefix}-size-error` : undefined}
          className={`${inputClass(Boolean(errors.size))} font-mono text-[13px]`}
        />,
      )}
      {field(
        "lineHeight",
        "Line height",
        "Multiplier 0.5–3 (e.g. 1.5) or a length.",
        <input
          id={`${prefix}-lineHeight`}
          value={draft.lineHeight}
          onChange={(event) => onChange({ lineHeight: event.target.value })}
          onBlur={() => onBlur("lineHeight")}
          spellCheck={false}
          aria-invalid={Boolean(errors.lineHeight)}
          aria-describedby={errors.lineHeight ? `${prefix}-lineHeight-error` : undefined}
          className={`${inputClass(Boolean(errors.lineHeight))} font-mono text-[13px]`}
        />,
      )}
      {field(
        "letterSpacing",
        "Letter spacing",
        "Length like 0em or -0.01em — bare numbers become em.",
        <input
          id={`${prefix}-letterSpacing`}
          value={draft.letterSpacing}
          onChange={(event) => onChange({ letterSpacing: event.target.value })}
          onBlur={() => onBlur("letterSpacing")}
          spellCheck={false}
          aria-invalid={Boolean(errors.letterSpacing)}
          aria-describedby={errors.letterSpacing ? `${prefix}-letterSpacing-error` : undefined}
          className={`${inputClass(Boolean(errors.letterSpacing))} font-mono text-[13px]`}
        />,
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Role editor
// ---------------------------------------------------------------------------

function RoleEditorPanel({
  system,
  role,
  starterTypography,
  onSave,
  onResetRole,
  onApplyFamily,
}: {
  system: DesignSystemConfig
  role: TypographyRole
  starterTypography: { roles: Record<TypographyRole, TypefaceSpec> }
  onSave: (patch: TypefaceSpec) => void
  onResetRole: (snapshot: { roles: Record<TypographyRole, TypefaceSpec> }) => void
  onApplyFamily: () => void
}) {
  const spec = system.foundations.typography.roles[role]
  const [draft, setDraft] = useState<SpecDraft>(() => draftFromSpec(spec))
  const [confirmingReset, setConfirmingReset] = useState(false)
  const errors = validateDraft(draft)
  const hasErrors = Object.values(errors).some(Boolean)
  const starter = starterTypography.roles[role]
  const roleStyles = ensureTextStyles(system).filter((style) => style.role === role)

  const patch = (update: Partial<SpecDraft>) => setDraft((current) => ({ ...current, ...update }))
  const blur = (field: string) => setDraft((current) => ({ ...current, touched: { ...current.touched, [field]: true } }))

  const handleSave = () => {
    const submitted: SpecDraft = { ...draft, submitted: true, touched: { family: true, fallback: true, weight: true, size: true, lineHeight: true, letterSpacing: true } }
    setDraft(submitted)
    const patch = buildPatch(submitted)
    if (!patch) return
    onSave(patch)
  }

  return (
    <div id="role-editor-panel" role="tabpanel" aria-label={`${ROLE_LABELS[role]} role editor`} className="mt-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">{ROLE_LABELS[role]} role</h3>
        <p className="font-mono text-[11px] text-muted-foreground">
          {spec.fontFamily} · {spec.weight} · {spec.size} / {spec.lineHeight} · {spec.letterSpacing}
        </p>
      </div>
      <div className="mt-4">
        <SpecFields
          draft={draft}
          errors={errors}
          prefix={`role-${role}`}
          inherited={{ fontFamily: true, fallback: true, weight: true, size: true, lineHeight: true, letterSpacing: true }}
          onChange={patch}
          onBlur={blur}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button
          onClick={handleSave}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Check className="size-4" aria-hidden="true" />
          Save {ROLE_LABELS[role]} role
        </button>
        <button
          onClick={onApplyFamily}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Apply {draft.family.trim() || spec.fontFamily} to {roleStyles.length} {ROLE_LABELS[role]} style{roleStyles.length === 1 ? "" : "s"}
        </button>
        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset role to starter default
          </button>
        ) : (
          <div role="alert" className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            <p className="flex min-h-11 flex-1 items-center text-xs leading-5 sm:text-sm">
              Reset {ROLE_LABELS[role]} to the {starter.fontFamily} starter default? Styles keep their own values.
            </p>
            <button
              onClick={() => setConfirmingReset(false)}
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Keep my role
            </button>
            <button
              onClick={() => {
                onResetRole(starterTypography)
                setConfirmingReset(false)
              }}
              className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reset role
            </button>
          </div>
        )}
      </div>
      {hasErrors && draft.submitted && (
        <p role="alert" className="mt-3 text-xs font-medium text-destructive">
          Fix the highlighted fields before saving.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Style editor
// ---------------------------------------------------------------------------

function StyleEditorPanel({
  system,
  styleId,
  onSave,
  onReset,
  onClose,
}: {
  system: DesignSystemConfig
  styleId: string
  onSave: (patch: TypefaceSpec) => void
  onReset: () => void
  onClose: () => void
}) {
  const styles = ensureTextStyles(system)
  const style = styles.find((item) => item.id === styleId)
  const report = styleOverrides(system, styleId)
  const [draft, setDraft] = useState<SpecDraft>(() =>
    draftFromSpec(
      style ?? {
        fontFamily: "",
        fallback: [],
        weight: 400,
        size: "1rem",
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
    ),
  )
  if (!style) return null
  const errors = validateDraft(draft)
  const hasErrors = Object.values(errors).some(Boolean)
  const inherited: Record<SpecField, boolean> = {
    fontFamily: !report.fields.includes("fontFamily"),
    fallback: !report.fields.includes("fallback"),
    weight: !report.fields.includes("weight"),
    size: !report.fields.includes("size"),
    lineHeight: !report.fields.includes("lineHeight"),
    letterSpacing: !report.fields.includes("letterSpacing"),
  }

  const patch = (update: Partial<SpecDraft>) => setDraft((current) => ({ ...current, ...update }))
  const blur = (field: string) => setDraft((current) => ({ ...current, touched: { ...current.touched, [field]: true } }))

  const handleSave = () => {
    const submitted: SpecDraft = { ...draft, submitted: true, touched: { family: true, fallback: true, weight: true, size: true, lineHeight: true, letterSpacing: true } }
    setDraft(submitted)
    const patch = buildPatch(submitted)
    if (!patch) return
    onSave(patch)
  }

  return (
    <div id="style-editor-panel" className="mt-2 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">
          {style.label} <span className="font-mono text-[11px] font-normal text-muted-foreground">{style.id}</span>
        </h3>
        <p className="text-xs text-muted-foreground">
          Role: <span className="font-medium text-foreground">{ROLE_LABELS[style.role]}</span> ·{" "}
          {report.overridden ? `${report.fields.length} overridden` : "all values inherited"}
        </p>
      </div>
      <div className="mt-4">
        <SpecFields
          draft={draft}
          errors={errors}
          prefix={`style-${style.id}`}
          inherited={inherited}
          onChange={patch}
          onBlur={blur}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button
          onClick={handleSave}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Check className="size-4" aria-hidden="true" />
          Save {style.label}
        </button>
        <button
          onClick={() => {
            onReset()
            const fresh = ensureTextStyles(system).find((item) => item.id === styleId)
            if (fresh) setDraft(draftFromSpec(fresh))
          }}
          disabled={!report.overridden}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset to role default
        </button>
        <button
          onClick={onClose}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Close
        </button>
      </div>
      {hasErrors && draft.submitted && (
        <p role="alert" className="mt-3 text-xs font-medium text-destructive">
          Fix the highlighted fields before saving.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

function previewColor(system: DesignSystemConfig, candidates: string[], fallback: string): string {
  for (const candidate of candidates) {
    const resolved = resolveToken(system, candidate)
    if (resolved.status === "resolved") return resolved.value
  }
  return fallback
}

function TypePreview({
  system,
  focus,
  onClearFocus,
}: {
  system: DesignSystemConfig
  focus: FocusTarget
  onClearFocus: () => void
}) {
  const ink = previewColor(system, ["text.primary"], "#18181b")
  const muted = previewColor(system, ["text.muted"], "#71717a")
  const canvas = previewColor(system, ["background.canvas"], "#ffffff")
  const surface = previewColor(system, ["background.surface"], "#fafafa")
  const line = previewColor(system, ["border.default"], "#e4e4e7")
  const actionBg = previewColor(system, ["action.primary.background"], "#18181b")
  const actionFg = previewColor(system, ["action.primary.foreground"], "#ffffff")

  const css = (styleId: string): React.CSSProperties => {
    const snapshot = styleForPreview(system, styleId)
    return {
      fontFamily: snapshot.fontFamily,
      fontWeight: snapshot.fontWeight,
      fontSize: snapshot.fontSize,
      lineHeight: snapshot.lineHeight,
      letterSpacing: snapshot.letterSpacing,
    }
  }

  const ring = (match: boolean): string =>
    match ? "rounded-lg ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""

  const isRoleFocused = (role: TypographyRole): boolean => focus?.kind === "role" && focus.role === role
  const isStyleFocused = (styleId: string): boolean => focus?.kind === "style" && focus.styleId === styleId
  const focusLabel = focus
    ? focus.kind === "role"
      ? ROLE_LABELS[focus.role]
      : (ensureTextStyles(system).find((style) => style.id === focus.styleId)?.label ?? focus.styleId)
    : null

  return (
    <aside aria-label="Typography preview" className="h-fit rounded-xl border border-border bg-background p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground">TYPE PREVIEW</p>
        {focusLabel && (
          <button
            onClick={onClearFocus}
            className="inline-flex min-h-11 items-center rounded-md px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Previewing: {focusLabel} · clear
          </button>
        )}
      </div>

      <div className="mt-4 space-y-5" style={{ background: canvas, color: ink }}>
        <div className={ring(isRoleFocused("display") || isStyleFocused("display"))}>
          <p className="text-xs text-muted-foreground">Display</p>
          <p className="mt-1 text-balance" style={css("display")}>
            Design systems that read well
          </p>
        </div>

        <div className={`space-y-3 ${ring(isRoleFocused("heading") || ["h1", "h2", "h3", "h4"].some(isStyleFocused))}`}>
          <p className="text-xs text-muted-foreground">Headings</p>
          {(["h1", "h2", "h3", "h4"] as const).map((id) => (
            <p key={id} className={ring(isStyleFocused(id))} style={css(id)}>
              {id.toUpperCase()} · The quick brown fox
            </p>
          ))}
        </div>

        <div className={`max-w-[65ch] space-y-2 ${ring(isRoleFocused("body") || isStyleFocused("body") || isStyleFocused("body-sm"))}`}>
          <p className="text-xs text-muted-foreground">Body</p>
          <p style={css("body")}>
            Good body copy disappears. Set it at a comfortable size with generous line height so
            paragraphs stay readable across viewports and themes.
          </p>
          <p style={{ ...css("body-sm"), color: muted }}>
            Body small supports captions-adjacent metadata without competing with primary copy.
          </p>
        </div>

        <div className={ring(isRoleFocused("label"))}>
          <p className="text-xs text-muted-foreground">Interface</p>
          <div className="mt-2 space-y-2 rounded-lg border p-3" style={{ borderColor: line, background: surface }}>
            <label htmlFor="type-preview-email" className="block" style={css("label")}>
              Email address
            </label>
            <input
              id="type-preview-email"
              defaultValue="manthan@example.com"
              className="min-h-11 w-full rounded-md border bg-transparent px-3 outline-none"
              style={{ ...css("body"), borderColor: line, fontSize: "0.875rem" }}
            />
            <button className="inline-flex min-h-11 items-center rounded-md px-4" style={{ background: actionBg, color: actionFg, ...css("label") }}>
              Continue
            </button>
            <p style={css("caption")}>
              Caption explains what happens next in plain words.
            </p>
          </div>
        </div>

        <div className={ring(isRoleFocused("mono") || isStyleFocused("code"))}>
          <p className="text-xs text-muted-foreground">Code & data</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border p-3" style={{ borderColor: line, background: surface, ...css("code") }}>
            <code>{`--font-body: "Inter", system-ui;\n--text-measure: 65ch;`}</code>
          </pre>
          <p className="mt-2 tabular-nums" style={css("label")}>
            12,408 · 96.2% · Q3
          </p>
        </div>
      </div>
    </aside>
  )
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="text-xs text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  )
}
