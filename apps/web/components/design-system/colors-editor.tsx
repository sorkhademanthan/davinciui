"use client"

import { Check, Copy, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import {
  bestTextOn,
  canDeletePalette,
  coerceHexInput,
  createPalette,
  duplicatePalette,
  findPaletteReferences,
  generateScale,
  manualShadeDiffs,
  normalizeHex,
  PALETTE_ROLES,
  PALETTE_SHADES,
  paletteRoleLabel,
  regenerateShades,
  removePalette,
  replaceAndRemovePalette,
  slugifyPaletteId,
  type PaletteReference,
} from "@/lib/design-system/colors"
import {
  resolveToken,
  type DesignSystemConfig,
  type Palette,
  type PaletteRole,
} from "@/lib/design-system/domain"
import { usePreviewTheme } from "@/components/design-system/use-preview-theme"
import { FoundationPreviewShell } from "@/components/design-system/foundation-preview-shell"

export function ColorsEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const palettes = system.foundations.colors.palettes
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const commit = (next: Palette[]) => {
    save({
      ...system,
      foundations: { ...system.foundations, colors: { palettes: next } },
    })
  }

  const selected =
    palettes.find((palette) => palette.id === selectedId) ??
    palettes.find((palette) => palette.id === editingId) ??
    palettes.find((palette) => palette.role === "brand") ??
    palettes[0]!

  const usage = useMemo(() => {
    const map = new Map<string, PaletteReference[]>()
    for (const palette of palettes) map.set(palette.id, findPaletteReferences(system, palette.id))
    return map
  }, [system, palettes])

  const handleAdd = (palette: Palette) => {
    commit([...palettes, palette])
    setShowAdd(false)
    setSelectedId(palette.id)
    setEditingId(null)
  }

  const handleDuplicate = (palette: Palette) => {
    const copy = duplicatePalette(
      palette,
      palettes.map((entry) => entry.id),
    )
    commit([...palettes, copy])
    setSelectedId(copy.id)
  }

  const handleDelete = (paletteId: string) => {
    commit(removePalette(system, paletteId).foundations.colors.palettes)
    if (editingId === paletteId) setEditingId(null)
    if (selectedId === paletteId) setSelectedId(null)
  }

  const handleReplaceAndDelete = (sourceId: string, replacementId: string): string | null => {
    const result = replaceAndRemovePalette(system, sourceId, replacementId)
    if (!result.ok) return result.error
    save(result.system)
    if (editingId === sourceId) setEditingId(null)
    if (selectedId === sourceId) setSelectedId(null)
    return null
  }

  return (
    <>
      <PageHeader
        eyebrow="Design System / Foundations"
        title="Colors"
        description="Add your own colors, edit every shade, and preview token-driven results live."
        action={
          <button
            onClick={() => setShowAdd((open) => !open)}
            aria-expanded={showAdd}
            aria-controls="add-palette-form"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            {showAdd ? "Close" : "Add palette"}
          </button>
        }
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {showAdd && (
            <AddPaletteForm
              existingIds={palettes.map((palette) => palette.id)}
              onAdd={handleAdd}
              onCancel={() => setShowAdd(false)}
            />
          )}
          <section aria-label="Palettes" className="space-y-4">
            {palettes.map((palette) => {
              const references = usage.get(palette.id) ?? []
              const isEditing = editingId === palette.id
              return (
                <article
                  key={palette.id}
                  className={`rounded-xl border border-border bg-background p-5 ${palette.enabled ? "" : "opacity-80"}`}
                  aria-labelledby={`palette-${palette.id}-label`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 id={`palette-${palette.id}-label`} className="font-medium">
                        {palette.label}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{paletteRoleLabel(palette.role)}</span>
                        {" · "}
                        <span className="font-mono">{palette.id}.*</span>
                        {" · base "}
                        <span className="font-mono uppercase">{palette.base}</span>
                        {palette.enabled ? "" : " · Disabled"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {references.length === 0 ? (
                          "Not referenced by any token yet."
                        ) : (
                          <>
                            Used by {references.length} token{references.length === 1 ? "" : "s"}:{" "}
                            <span className="font-mono">{references.slice(0, 3).map((reference) => reference.pointer).join(", ")}</span>
                            {references.length > 3 ? ` and ${references.length - 3} more` : ""}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedId(palette.id)
                          setEditingId(isEditing ? null : palette.id)
                        }}
                        aria-expanded={isEditing}
                        aria-controls={`palette-${palette.id}-editor`}
                        aria-label={isEditing ? `Close ${palette.label} editor` : `Edit ${palette.label}`}
                        title={isEditing ? "Close editor" : "Edit palette"}
                        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isEditing ? "border-foreground bg-muted" : "border-border hover:bg-muted"}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(palette)}
                        aria-label={`Duplicate ${palette.label}`}
                        title="Duplicate palette"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Copy className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedId(palette.id)
                          setEditingId(palette.id)
                        }}
                        aria-label={`Delete ${palette.label} (opens options)`}
                        title="Delete palette"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-2 text-sm text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <SwatchScale palette={palette} />
                  {isEditing && (
                    <PaletteEditorPanel
                      key={`editor-${palette.id}`}
                      system={system}
                      palette={palette}
                      palettes={palettes}
                      references={references}
                      onSave={(next) => {
                        commit(palettes.map((entry) => (entry.id === palette.id ? next : entry)))
                        setEditingId(null)
                      }}
                      onCancel={() => setEditingId(null)}
                      onDelete={() => handleDelete(palette.id)}
                      onReplaceAndDelete={(replacementId) => handleReplaceAndDelete(palette.id, replacementId)}
                    />
                  )}
                </article>
              )
            })}
          </section>
        </div>
        <ColorPreview system={system} palette={selected} />
      </div>
    </>
  )
}

function SwatchScale({ palette, compact = false }: { palette: Palette; compact?: boolean }) {
  return (
    <ul
      aria-label={`${palette.label} color scale`}
      className={`mt-5 grid gap-1.5 ${compact ? "grid-cols-6" : "grid-cols-4 sm:grid-cols-6 lg:grid-cols-11"}`}
    >
      {PALETTE_SHADES.map((shade) => {
        const value = palette.shades[shade] ?? ""
        const name = `${palette.label} ${shade}, ${value || "missing"}`.trim()
        return (
          <li key={shade} className="min-w-0">
            <span role="img" aria-label={name} className="block">
              <span
                aria-hidden="true"
                className={`${compact ? "h-8" : "h-12"} block rounded border border-black/10 dark:border-white/10`}
                style={{ background: normalizeHex(value) ?? "transparent" }}
              />
              <span aria-hidden="true" className="mt-1 block text-center">
                <span className="block text-[10px] font-medium text-muted-foreground">{shade}</span>
                {!compact && (
                  <span className="block truncate font-mono text-[10px] uppercase text-muted-foreground">{value}</span>
                )}
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

interface DraftState {
  label: string
  role: PaletteRole
  base: string
  enabled: boolean
  shades: Record<string, string>
  touchedBase: boolean
  touchedShades: Record<string, boolean>
  submitted: boolean
}

function draftFromPalette(palette: Palette): DraftState {
  return {
    label: palette.label,
    role: palette.role,
    base: palette.base,
    enabled: palette.enabled,
    shades: { ...palette.shades },
    touchedBase: false,
    touchedShades: {},
    submitted: false,
  }
}

function validateDraft(draft: DraftState): {
  labelError: string | null
  baseError: string | null
  shadeErrors: Record<string, string>
} {
  const showAll = draft.submitted
  const labelError = !draft.label.trim() ? "Give the palette a name." : null
  const baseError =
    (showAll || draft.touchedBase) && !coerceHexInput(draft.base)
      ? "Enter a valid six-digit hex color (e.g. #0F766E)."
      : null
  const shadeErrors: Record<string, string> = {}
  for (const shade of PALETTE_SHADES) {
    if ((showAll || draft.touchedShades[shade]) && !coerceHexInput(draft.shades[shade] ?? "")) {
      shadeErrors[shade] = "Use a six-digit hex value."
    }
  }
  return { labelError, baseError, shadeErrors }
}

function PaletteEditorPanel({
  system,
  palette,
  palettes,
  references,
  onSave,
  onCancel,
  onDelete,
  onReplaceAndDelete,
}: {
  system: DesignSystemConfig
  palette: Palette
  palettes: Palette[]
  references: PaletteReference[]
  onSave: (next: Palette) => void
  onCancel: () => void
  onDelete: () => void
  onReplaceAndDelete: (replacementId: string) => string | null
}) {
  const [draft, setDraft] = useState<DraftState>(() => draftFromPalette(palette))
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingRegen, setConfirmingRegen] = useState(false)
  const { labelError, baseError, shadeErrors } = validateDraft(draft)
  const hasErrors = Boolean(labelError || baseError || Object.keys(shadeErrors).length > 0)

  const guard = canDeletePalette(system, palette.id)
  const regenDiffs = manualShadeDiffs({ ...palette, base: coerceHexInput(draft.base) ?? palette.base, shades: draft.shades })

  const patch = (update: Partial<DraftState>) => setDraft((current) => ({ ...current, ...update }))

  const handleSave = () => {
    const submitted = { ...draft, submitted: true, touchedBase: true, touchedShades: Object.fromEntries(PALETTE_SHADES.map((shade) => [shade, true])) }
    setDraft(submitted)
    const { labelError: labelProblem, baseError: baseProblem, shadeErrors: shadeProblems } = validateDraft(submitted)
    if (labelProblem || baseProblem || Object.keys(shadeProblems).length > 0) return
    const base = coerceHexInput(submitted.base)!
    const shades: Record<string, string> = {}
    for (const shade of PALETTE_SHADES) shades[shade] = coerceHexInput(submitted.shades[shade] ?? "")!
    onSave({ ...palette, label: submitted.label.trim(), role: submitted.role, base, enabled: submitted.enabled, shades })
  }

  const applyRegen = () => {
    const base = coerceHexInput(draft.base) ?? palette.base
    const fresh = generateScale(base)
    if (!fresh) return
    setDraft((current) => ({ ...current, base, touchedBase: false, touchedShades: {}, shades: { ...current.shades, ...fresh } }))
    setConfirmingRegen(false)
  }

  const editorId = `palette-${palette.id}-editor`
  return (
    <div id={editorId} className="mt-5 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${editorId}-label`} className="text-sm font-medium">
            Palette name
          </label>
          <input
            id={`${editorId}-label`}
            value={draft.label}
            onChange={(event) => patch({ label: event.target.value })}
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1.5 min-h-5 text-xs text-muted-foreground">
            {labelError ? (
              <span role="alert" className="font-medium text-destructive">{labelError}</span>
            ) : (
              <>Renaming never changes the token id <span className="font-mono">{palette.id}</span>.</>
            )}
          </p>
        </div>
        <div>
          <label htmlFor={`${editorId}-role`} className="text-sm font-medium">
            Palette role
          </label>
          <select
            id={`${editorId}-role`}
            value={draft.role}
            onChange={(event) => patch({ role: event.target.value as PaletteRole })}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PALETTE_ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 min-h-5 text-xs text-muted-foreground">Describes how the palette is used — shown as text, not color alone.</p>
        </div>
      </div>

      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${editorId}-base`} className="text-sm font-medium">
            Base color (shade 500)
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              aria-label={`${draft.label || palette.label} base color picker`}
              type="color"
              value={coerceHexInput(draft.base) ?? palette.base}
              onChange={(event) => patch({ base: event.target.value, touchedBase: true })}
              className="h-11 w-16 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1"
            />
            <input
              id={`${editorId}-base`}
              value={draft.base}
              onChange={(event) => patch({ base: event.target.value, touchedBase: true })}
              onBlur={() => patch({ touchedBase: true })}
              spellCheck={false}
              maxLength={7}
              placeholder="#0F766E"
              aria-invalid={Boolean(baseError)}
              aria-describedby={baseError ? `${editorId}-base-error` : undefined}
              className={`min-h-11 w-full rounded-lg border bg-background px-3 font-mono text-sm uppercase outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${baseError ? "border-destructive" : "border-border"}`}
            />
          </div>
          <div className="mt-1.5 min-h-5">
            {baseError && (
              <p id={`${editorId}-base-error`} role="alert" className="text-xs font-medium text-destructive">
                {baseError}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-end pb-1">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(event) => patch({ enabled: event.target.checked })}
              className="size-5 accent-foreground"
            />
            Palette enabled{draft.enabled ? "" : " (currently disabled)"}
          </label>
        </div>
      </div>

      <fieldset className="mt-3">
        <legend className="text-sm font-medium">Shade values</legend>
        <p className="mt-1 text-xs text-muted-foreground">Edit any shade manually. Changing values here never regenerates the rest of the scale.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {PALETTE_SHADES.map((shade) => {
            const error = shadeErrors[shade]
            return (
              <div key={shade}>
                <label htmlFor={`${editorId}-shade-${shade}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="inline-block size-5 rounded border border-black/10 dark:border-white/10"
                    style={{ background: coerceHexInput(draft.shades[shade] ?? "") ?? "transparent" }}
                  />
                  Shade <span className="font-mono font-medium">{shade}</span>
                </label>
                <input
                  id={`${editorId}-shade-${shade}`}
                  value={draft.shades[shade] ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      shades: { ...current.shades, [shade]: event.target.value },
                      touchedShades: { ...current.touchedShades, [shade]: true },
                    }))
                  }
                  onBlur={() =>
                    setDraft((current) => ({ ...current, touchedShades: { ...current.touchedShades, [shade]: true } }))
                  }
                  spellCheck={false}
                  maxLength={7}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${editorId}-shade-${shade}-error` : undefined}
                  className={`mt-1 min-h-11 w-full rounded-lg border bg-background px-2.5 font-mono text-xs uppercase outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
                />
                <div className="mt-1 min-h-4">
                  {error && (
                    <p id={`${editorId}-shade-${shade}-error`} role="alert" className="text-[11px] font-medium text-destructive">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {!confirmingRegen ? (
          <button
            onClick={() => {
              if (regenDiffs.length > 0) {
                setConfirmingRegen(true)
                return
              }
              applyRegen()
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Regenerate scale from base
          </button>
        ) : (
          <div role="alert" className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            <p className="min-h-11 flex flex-1 items-center text-xs leading-5 sm:text-sm">
              {regenDiffs.length} manually edited shade{regenDiffs.length === 1 ? "" : "s"} ({regenDiffs.join(", ")}) will be overwritten.
            </p>
            <button
              onClick={() => setConfirmingRegen(false)}
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Keep edits
            </button>
            <button
              onClick={applyRegen}
              className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Overwrite {regenDiffs.length} shade{regenDiffs.length === 1 ? "" : "s"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button
          onClick={handleSave}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Check className="size-4" aria-hidden="true" />
          Save changes
        </button>
        <button
          onClick={onCancel}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
        {hasErrors && draft.submitted && (
          <p role="alert" className="w-full text-xs font-medium text-destructive">
            Fix the highlighted fields before saving.
          </p>
        )}
      </div>

      <DeleteZone
        palette={palette}
        palettes={palettes}
        guard={guard}
        references={references}
        confirming={confirmingDelete}
        onArm={() => setConfirmingDelete(true)}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={onDelete}
        onReplaceAndDelete={onReplaceAndDelete}
      />
    </div>
  )
}

function DeleteZone({
  palette,
  palettes,
  guard,
  references,
  confirming,
  onArm,
  onCancel,
  onConfirm,
  onReplaceAndDelete,
}: {
  palette: Palette
  palettes: Palette[]
  guard: ReturnType<typeof canDeletePalette>
  references: PaletteReference[]
  confirming: boolean
  onArm: () => void
  onCancel: () => void
  onConfirm: () => void
  onReplaceAndDelete: (replacementId: string) => string | null
}) {
  const alternatives = palettes.filter((entry) => entry.id !== palette.id)
  const [replacementId, setReplacementId] = useState(() => alternatives[0]?.id ?? "")
  const [moveError, setMoveError] = useState<string | null>(null)
  const blockedByUsage = !guard.ok && references.length > 0
  return (
    <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
      {!guard.ok ? (
        <div role="status" className="mt-2 text-xs leading-5 text-muted-foreground">
          <p className="font-medium text-foreground">This palette cannot be deleted.</p>
          {guard.reasons.map((reason) => (
            <p key={reason} className="mt-1">{reason}</p>
          ))}
          {references.length > 0 && (
            <ul className="mt-2 space-y-1">
              {references.map((reference) => (
                <li key={`${reference.kind}:${reference.pointer}`} className="font-mono text-[11px]">
                  {reference.kind} · {reference.pointer} → <span className="uppercase">{reference.value}</span>
                </li>
              ))}
            </ul>
          )}
          {blockedByUsage && alternatives.length > 0 && (
            <div className="mt-3 rounded-lg border border-border bg-background p-3">
              <label htmlFor={`move-${palette.id}-replacement`} className="text-xs font-medium text-foreground">
                Move {references.length} usage{references.length === 1 ? "" : "s"} to another palette, then delete
              </label>
              <p className="mt-1 text-[11px] leading-5">
                Shade numbers are preserved (e.g. {palette.id}.950 → {(replacementId || alternatives[0]!.id)}.950). Tokens that alias through
                these values follow automatically.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  id={`move-${palette.id}-replacement`}
                  value={replacementId || alternatives[0]!.id}
                  onChange={(event) => {
                    setReplacementId(event.target.value)
                    setMoveError(null)
                  }}
                  className="min-h-11 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {alternatives.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label} ({entry.id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const error = onReplaceAndDelete(replacementId || alternatives[0]!.id)
                    setMoveError(error)
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Move usages & delete
                </button>
              </div>
              <p className="mt-1 text-[11px] leading-5">
                Or edit the listed token(s) under Semantic tokens / Themes to point elsewhere, then return here to delete.
              </p>
              {moveError && (
                <p role="alert" className="mt-1 font-medium text-destructive">
                  {moveError}
                </p>
              )}
            </div>
          )}
        </div>
      ) : !confirming ? (
        <>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {references.length === 0
              ? "No tokens reference this palette. Deletion is safe."
              : "Referenced — resolve usages first."}
          </p>
          <button
            onClick={onArm}
            aria-label={`Delete palette ${palette.label}`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete palette
          </button>
        </>
      ) : (
        <div role="alert">
          <p className="mt-1 min-h-11 text-sm leading-6">
            Delete palette <span className="font-semibold">“{palette.label}”</span>? This cannot be undone.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={onCancel}
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              aria-label={`Confirm deletion of palette ${palette.label}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete palette
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddPaletteForm({
  existingIds,
  onAdd,
  onCancel,
}: {
  existingIds: string[]
  onAdd: (palette: Palette) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState("")
  const [role, setRole] = useState<PaletteRole>("custom")
  const [base, setBase] = useState("")
  const [customId, setCustomId] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const normalizedBase = coerceHexInput(base)
  const preview = normalizedBase ? generateScale(normalizedBase) : null
  const suggestedId = slugifyPaletteId(label.trim() || "palette", existingIds)

  const labelError = submitted && !label.trim() ? "Give the palette a name." : null
  const baseError = submitted && !normalizedBase ? "Enter a valid six-digit hex color (e.g. #0F766E)." : null
  const customIdError = (() => {
    if (!submitted || !customId.trim()) return null
    const slug = customId.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    if (!slug) return "That palette id is not URL-safe. Use letters and numbers."
    if (existingIds.includes(slug)) return `Palette id "${slug}" is already in use.`
    return null
  })()

  const handleConfirm = () => {
    setSubmitted(true)
    const result = createPalette(
      { label, role, base, id: customId.trim() ? customId : undefined },
      existingIds,
    )
    if (!result.ok) return
    onAdd(result.palette)
  }

  return (
    <section
      id="add-palette-form"
      aria-label="Add a new palette"
      className="mb-4 rounded-xl border border-border bg-background p-5"
    >
      <h2 className="font-medium">Add palette</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Enter any color — the 50–950 scale is generated from your base value, never copied from another palette.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="add-palette-label" className="text-sm font-medium">
            Palette name
          </label>
          <input
            id="add-palette-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. Favorite Teal"
            maxLength={60}
            aria-invalid={Boolean(labelError)}
            aria-describedby={labelError ? "add-palette-label-error" : undefined}
            className={`mt-1.5 min-h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
          />
          <div className="mt-1.5 min-h-5">
            {labelError ? (
              <p id="add-palette-label-error" role="alert" className="text-xs font-medium text-destructive">{labelError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Token id will be <span className="font-mono">{customId.trim() || suggestedId}</span>
              </p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="add-palette-role" className="text-sm font-medium">
            Palette role
          </label>
          <select
            id="add-palette-role"
            value={role}
            onChange={(event) => setRole(event.target.value as PaletteRole)}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PALETTE_ROLES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 min-h-5 text-xs text-muted-foreground">Roles classify palettes for tokens and previews.</p>
        </div>
        <div>
          <span id="add-palette-base-label" className="text-sm font-medium">
            Base color (shade 500)
          </span>
          <div className="mt-1.5 flex items-center gap-2" role="group" aria-labelledby="add-palette-base-label">
            <input
              aria-label="New palette base color picker"
              type="color"
              value={normalizedBase ?? "#71717a"}
              onChange={(event) => setBase(event.target.value)}
              className="h-11 w-16 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1"
            />
            <input
              aria-label="New palette base hex value"
              value={base}
              onChange={(event) => setBase(event.target.value)}
              spellCheck={false}
              maxLength={7}
              placeholder="#0F766E"
              aria-invalid={Boolean(baseError)}
              aria-describedby={baseError ? "add-palette-base-error" : undefined}
              className={`min-h-11 w-full rounded-lg border bg-background px-3 font-mono text-sm uppercase outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${baseError ? "border-destructive" : "border-border"}`}
            />
          </div>
          <div className="mt-1.5 min-h-5">
            {baseError && (
              <p id="add-palette-base-error" role="alert" className="text-xs font-medium text-destructive">{baseError}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="add-palette-id" className="text-sm font-medium">
            Custom id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-palette-id"
            value={customId}
            onChange={(event) => setCustomId(event.target.value)}
            placeholder={suggestedId}
            maxLength={40}
            spellCheck={false}
            aria-invalid={Boolean(customIdError)}
            aria-describedby={customIdError ? "add-palette-id-error" : undefined}
            className={`mt-1.5 min-h-11 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${customIdError ? "border-destructive" : "border-border"}`}
          />
          <div className="mt-1.5 min-h-5">
            {customIdError ? (
              <p id="add-palette-id-error" role="alert" className="text-xs font-medium text-destructive">{customIdError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Leave empty to derive <span className="font-mono">{suggestedId}</span> from the name.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-dashed border-border p-4">
        <p className="text-xs font-medium text-muted-foreground">GENERATED SCALE PREVIEW</p>
        {preview && normalizedBase ? (
          <SwatchScale palette={{ id: "__preview__", label: label.trim() || "New palette", role, base: normalizedBase, enabled: true, shades: preview }} />
        ) : (
          <p className="mt-2 min-h-11 text-sm text-muted-foreground">Enter a valid base color to preview its generated 50–950 scale.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onCancel}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add palette
        </button>
      </div>
    </section>
  )
}

interface PreviewColor {
  value: string | null
  token: string
  configured: boolean
}

function previewColor(system: DesignSystemConfig, candidates: string[], themeId?: string): PreviewColor {
  for (const candidate of candidates) {
    const resolved = resolveToken(system, candidate, themeId)
    if (resolved.status === "resolved") return { value: resolved.value, token: candidate, configured: true }
  }
  return { value: null, token: candidates[0] ?? "", configured: false }
}

function ColorPreview({ system, palette }: { system: DesignSystemConfig; palette: Palette }) {
  const { themeOptions, activeThemeId, selectTheme } = usePreviewTheme(system)
  const actionBg = previewColor(system, ["action.primary.background"], activeThemeId)
  const actionFg = previewColor(system, ["action.primary.foreground"], activeThemeId)
  const border = previewColor(system, ["border.default"], activeThemeId)
  const ring = previewColor(system, ["focus.ring"], activeThemeId)
  const link = previewColor(system, ["action.primary.background", "brand.600"], activeThemeId)
  const canvas = previewColor(system, ["background.canvas"], activeThemeId)
  const surface = previewColor(system, ["background.surface"], activeThemeId)
  const text = previewColor(system, ["text.primary"], activeThemeId)
  const muted = previewColor(system, ["text.muted"], activeThemeId)
  const [focused, setFocused] = useState(false)

  const badges = (["success", "warning", "danger", "info"] as const).map((kind) => ({
    kind,
    label: kind[0]!.toUpperCase() + kind.slice(1),
    ...previewColor(system, [`status.${kind}`, `${kind}.600`, `${kind}.500`], activeThemeId),
  }))

  const sources: Array<{ element: string; token: string; value: string }> = []
  const note = (element: string, color: PreviewColor) => {
    sources.push({
      element,
      token: color.token || "—",
      value: color.configured ? (color.value ?? "") : "not configured",
    })
  }
  note("Button", actionBg)
  note("Input border", border)
  note("Focus ring", ring)
  note("Link", link)
  note("Surface", canvas)
  for (const badge of badges) note(`${badge.label} badge`, badge)

  const sampleShade = palette.shades["600"] ?? palette.base
  const sampleText = bestTextOn(sampleShade)

  return (
    <FoundationPreviewShell
      label="Live preview"
      description="See your saved colour roles on a small product interface."
      toolbar={<div role="group" aria-label="Preview theme" className="flex flex-wrap gap-1.5">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            aria-pressed={activeThemeId === theme.id}
            onClick={() => selectTheme(theme.id)}
            className={`inline-flex min-h-11 items-center rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${activeThemeId === theme.id ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            {theme.label} · {theme.mode}
          </button>
        ))}
      </div>}
      inspector={<ul className="space-y-1">{sources.map((source) => <li key={source.element} className="font-mono text-[11px]">{source.element} ← {source.token} · <span className="uppercase">{source.value}</span></li>)}</ul>}
    >

      <div className="space-y-4 rounded-lg border border-border p-4">
        {actionBg.configured ? (
          <button
            className="inline-flex min-h-11 items-center rounded-md px-4 py-2 text-sm font-medium"
            style={{ background: actionBg.value!, color: actionFg.value ?? "#ffffff" }}
            title={`action.primary.background → ${actionBg.value}`}
          >
            Primary action
          </button>
        ) : (
          <p role="status" className="rounded-md border border-dashed border-border px-4 py-2 text-xs text-muted-foreground">
            action.primary.background is not configured yet.
          </p>
        )}

        <div>
          <label htmlFor="colors-preview-input" className="mb-1.5 block text-xs font-medium">
            Email address
          </label>
          <input
            id="colors-preview-input"
            placeholder="you@example.com"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="min-h-11 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
            style={{
              borderColor: border.value ?? undefined,
              boxShadow: focused && ring.configured ? `0 0 0 3px ${ring.value}` : undefined,
            }}
            title={border.configured ? `border.default → ${border.value}` : "border.default is not configured"}
          />
          {!ring.configured && (
            <p className="mt-1 text-[11px] text-muted-foreground">focus.ring is not configured yet.</p>
          )}
        </div>

        <p className="text-sm">
          {link.configured ? (
            <a href="#" onClick={(event) => event.preventDefault()} style={{ color: link.value! }} title={`${link.token} → ${link.value}`}>
              Learn more
            </a>
          ) : (
            <span className="text-muted-foreground">Link color is not configured yet.</span>
          )}
        </p>

        <ul aria-label="Status badges" className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <li
              key={badge.kind}
              title={badge.configured ? `${badge.token} → ${badge.value}` : `${badge.token || `status.${badge.kind}`} is not configured`}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badge.configured ? "" : "border border-dashed border-border text-muted-foreground"}`}
              style={badge.configured ? { background: badge.value!, color: bestTextOn(badge.value!) } : undefined}
            >
              <span aria-hidden="true" className={`size-1.5 rounded-full ${badge.configured ? "bg-current" : "bg-muted-foreground"}`} />
              {badge.label}
            </li>
          ))}
        </ul>

        <div
          className="rounded-md border p-3"
          style={{ background: canvas.value ?? undefined, borderColor: border.value ?? undefined }}
          title={canvas.configured ? `background.canvas → ${canvas.value}` : "background.canvas is not configured"}
        >
          <p className="text-sm font-medium" style={{ color: text.value ?? undefined }}>
            Surface sample
          </p>
          <p className="mt-0.5 text-xs" style={{ color: muted.value ?? undefined }}>
            Secondary text on {surface.configured ? "surface" : "canvas"} ({surface.value ?? muted.value ?? "unconfigured"})
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border p-4">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground">
          SELECTED PALETTE · <span className="font-mono">{palette.id}</span>
        </p>
        <SwatchScale palette={palette} compact />
        <button
          className="mt-3 inline-flex min-h-11 items-center rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: sampleShade, color: sampleText }}
          title={`${palette.id}.600 → ${sampleShade}`}
        >
          {palette.label} sample
        </button>
      </div>

    </FoundationPreviewShell>
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
