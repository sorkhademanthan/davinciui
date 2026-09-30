"use client"

import { Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import type { DesignSystemConfig, GridContainer } from "@/lib/design-system/domain"
import { activeBreakpoint, ensureBreakpointScale } from "@/lib/design-system/breakpoints"
import { resolveBorderRecipe } from "@/lib/design-system/borders"
import { radiusValueFor } from "@/lib/design-system/radius"
import {
  GRID_PRESETS,
  applyGridPreset,
  canDeleteContainer,
  containerPx,
  createContainer,
  diffGrids,
  effectiveProfile,
  ensureGridForSystem,
  gridIssues,
  hasCustomGridEdits,
  insertContainer,
  isSpacingTokenUsedByGrid,
  parseContainerValue,
  removeContainer,
  resetProfileToStarter,
  resolveGridForWidth,
  restoreStarterGrid,
  setDefaultContainer,
  updateContainerDescription,
  updateContainerLabel,
  updateContainerValue,
  updateProfileColumns,
  updateProfileGap,
  type GridPreset,
} from "@/lib/design-system/grid"

export function GridEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<string | null>(null)

  return (
    <>
      <PageHeader
        eyebrow="Design System / Foundations"
        title="Grid"
        description="Configure responsive layout geometry per breakpoint, then watch each profile activate at its threshold."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <PresetSection system={system} save={save} />
          <ProfileSection
            system={system}
            save={save}
            selected={selectedBreakpoint}
            onSelect={setSelectedBreakpoint}
          />
          <ContainerSection system={system} save={save} />
        </div>
        <GridPreview system={system} />
      </div>
    </>
  )
}

function spacingOptions(system: DesignSystemConfig): Array<{ id: string; value: string }> {
  return [
    ...(system.foundations.spacing?.scale ?? []).map((t) => ({ id: t.id, value: t.value })),
    ...(system.foundations.sizing?.tokens ?? []).map((t) => ({ id: t.id, value: t.value })),
  ]
}

function PresetSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [pending, setPending] = useState<GridPreset | "starter" | null>(null)
  const customEdits = hasCustomGridEdits(system)
  const grid = ensureGridForSystem(system)

  const request = (preset: GridPreset | "starter") => {
    if (customEdits) {
      setPending(preset)
      return
    }
    applyChoice(preset)
  }

  const applyChoice = (preset: GridPreset | "starter") => {
    if (preset === "starter") save(restoreStarterGrid(system))
    else save(applyGridPreset(system, preset))
    setPending(null)
  }

  return (
    <section aria-label="Grid presets" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Grid presets</h2>
        <p className="text-xs text-muted-foreground">
          <span className={`font-medium ${customEdits ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {customEdits ? "Custom grid" : "Starter grid"}
          </span>
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Presets replace containers and breakpoint profiles only — breakpoint thresholds are never touched.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {GRID_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => request(preset)}
            className="min-h-11 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block text-sm font-medium">{preset.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{preset.description}</span>
            <span className="mt-1 block font-mono text-[11px] text-muted-foreground">
              {preset.profiles.map((p) => `${p.breakpointId}:${p.columns}`).join(" · ")}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => request("starter")}
        className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Restore starter default
      </button>
      {pending && (
        <PresetConfirm system={system} grid={grid} preset={pending} onConfirm={() => applyChoice(pending)} onCancel={() => setPending(null)} />
      )}
    </section>
  )
}

function PresetConfirm({
  system,
  grid,
  preset,
  onConfirm,
  onCancel,
}: {
  system: DesignSystemConfig
  grid: ReturnType<typeof ensureGridForSystem>
  preset: GridPreset | "starter"
  onConfirm: () => void
  onCancel: () => void
}) {
  const next =
    preset === "starter"
      ? ensureGridForSystem({
          ...system,
          foundations: {
            ...system.foundations,
            grid: restoreStarterGrid(system).foundations.grid,
          },
        })
      : {
          containers: preset.containers.map((c) => ({ ...c })),
          profiles: preset.profiles.map((p) => ({ ...p })),
          columns: grid.columns,
          gutter: grid.gutter,
          maxWidth: grid.maxWidth,
          defaultContainer: preset.defaultContainer,
        }
  const diff = diffGrids(grid, next)

  return (
    <div role="alert" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <h3 className="text-sm font-semibold">
        {preset === "starter" ? "Restore starter defaults?" : `Apply “${preset.label}”?`}
      </h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        You have custom grid edits. Applying this replaces containers and breakpoint profiles (breakpoint thresholds stay untouched):
      </p>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
        {diff.profilesChanged.map((entry) => (
          <li key={entry.breakpointId}>
            {entry.breakpointId}: {entry.from} → {entry.to}
          </li>
        ))}
        {diff.containersChanged.map((entry) => (
          <li key={entry.id}>
            {entry.id}: {entry.from} → {entry.to}
          </li>
        ))}
        {diff.containersAdded.map((c) => (
          <li key={`a-${c.id}`}>+ {c.id} ({c.label}: {c.value})</li>
        ))}
        {diff.containersRemoved.map((c) => (
          <li key={`r-${c.id}`}>− {c.id} ({c.label}: {c.value})</li>
        ))}
        {diff.profilesChanged.length === 0 && diff.containersChanged.length === 0 && diff.containersAdded.length === 0 && diff.containersRemoved.length === 0 && (
          <li>No differences — grids already match.</li>
        )}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onCancel}
          className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {preset === "starter" ? "Restore defaults" : "Apply preset"}
        </button>
      </div>
    </div>
  )
}

function ProfileSection({
  system,
  save,
  selected,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const scale = ensureBreakpointScale(system.foundations.breakpoints?.scale)
  const grid = ensureGridForSystem(system)
  const activeId = selected ?? scale[0]?.id ?? "base"
  const profile = effectiveProfile(system, activeId)
  const [columnsDraft, setColumnsDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const options = spacingOptions(system)
  const issues = gridIssues(system)

  const commitColumns = () => {
    const text = (columnsDraft ?? String(profile.columns)).trim()
    const parsed = Number(text)
    if (text === "" || !Number.isInteger(parsed) || parsed < 1 || parsed > 12) {
      setError("Columns must be a whole number from 1 to 12.")
      return
    }
    const result = updateProfileColumns(system, activeId, parsed)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setColumnsDraft(null)
    save(result.system)
  }

  const setGap = (slot: "gutter" | "columnGap" | "rowGap", tokenId: string) => {
    const result = updateProfileGap(system, activeId, slot, tokenId)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    save(result.system)
  }

  return (
    <section aria-label="Breakpoint profiles" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Profiles by breakpoint ({grid.profiles.length})</h2>
        <a
          href={`/design-system/${system.id}/breakpoints`}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open Breakpoints
        </a>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Thresholds live in Breakpoints — here you set what each threshold activates. Columns 1–12; gutters and gaps reference spacing tokens.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Breakpoint profile">
        {scale.map((token) => {
          const selectedNow = activeId === token.id
          return (
            <button
              key={token.id}
              aria-pressed={selectedNow}
              onClick={() => {
                onSelect(token.id)
                setColumnsDraft(null)
                setError(null)
                setConfirmReset(false)
              }}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedNow ? "border-foreground bg-muted font-medium" : "border-border hover:bg-muted/60"}`}
            >
              {token.id} · {token.value}
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-medium">{activeId}</h3>
          {resetProfileToStarter(system, activeId) && !confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              aria-label={`Reset ${activeId} profile to starter default`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          ) : resetProfileToStarter(system, activeId) ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  const next = resetProfileToStarter(system, activeId)
                  if (next) save(next)
                  setConfirmReset(false)
                }}
                aria-label={`Confirm reset of ${activeId} profile`}
                className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Reset
              </button>
            </span>
          ) : null}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="grid-profile-columns" className="text-sm font-medium">
              Columns (1–12)
            </label>
            <input
              id="grid-profile-columns"
              value={columnsDraft ?? String(profile.columns)}
              inputMode="numeric"
              onChange={(event) => {
                setColumnsDraft(event.target.value)
                setError(null)
              }}
              onBlur={commitColumns}
              onKeyDown={(event) => {
                if (event.key === "Enter") (event.target as HTMLInputElement).blur()
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "grid-profile-columns-error" : undefined}
              className={`mt-1.5 min-h-11 w-full rounded-lg border bg-background px-3 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
            />
          </div>
          {(["gutter", "columnGap", "rowGap"] as const).map((slot) => (
            <div key={slot} className={slot === "gutter" ? "" : ""}>
              <label htmlFor={`grid-profile-${slot}`} className="text-sm font-medium">
                {slot === "gutter" ? "Page gutter" : slot === "columnGap" ? "Column gap" : "Row gap"}
              </label>
              <select
                id={`grid-profile-${slot}`}
                value={profile[slot]}
                onChange={(event) => setGap(slot, event.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.id} · {opt.value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-2 min-h-5" aria-live="polite">
          {error ? (
            <p id="grid-profile-columns-error" role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          ) : (
            <p className="font-mono text-[11px] text-muted-foreground">
              {profile.columns} cols · {profile.gutter} / {profile.columnGap} / {profile.rowGap}
            </p>
          )}
        </div>
      </div>
      {issues.length > 0 && (
        <div role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
          {issues.map((issue) => (
            <p key={`${issue.path}-${issue.message}`}>{issue.message}</p>
          ))}
        </div>
      )}
    </section>
  )
}

function ContainerSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const grid = ensureGridForSystem(system)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <section aria-label="Grid containers" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Containers ({grid.containers.length})</h2>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-container-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add container"}
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Named max-widths. Deleting the default or the last container is blocked.
      </p>
      {showAdd && <AddContainerForm system={system} save={save} onDone={() => setShowAdd(false)} />}
      <ul className="mt-4 space-y-2">
        {grid.containers.map((container) => (
          <ContainerRow key={container.id} system={system} save={save} container={container} />
        ))}
      </ul>
    </section>
  )
}

function ContainerRow({
  system,
  save,
  container,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  container: GridContainer
}) {
  const grid = ensureGridForSystem(system)
  const [valueDraft, setValueDraft] = useState<string | null>(null)
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const isDefault = grid.defaultContainer === container.id
  const guard = canDeleteContainer(system, container.id)

  const commitValue = () => {
    const text = (valueDraft ?? container.value).trim()
    if (text === container.value) {
      setValueDraft(null)
      return
    }
    if (parseContainerValue(text) === null) {
      setError("Enter a container width like 1200px, 75rem, or 100% for full-bleed.")
      return
    }
    const result = updateContainerValue(system, container.id, text)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setValueDraft(null)
    save(result.system)
  }

  const commitLabel = () => {
    const trimmed = (labelDraft ?? container.label).trim()
    if (!trimmed || trimmed === container.label) {
      setLabelDraft(null)
      return
    }
    save(updateContainerLabel(system, container.id, trimmed))
    setLabelDraft(null)
  }

  const commitDescription = () => {
    const trimmed = (descriptionDraft ?? container.description ?? "").trim()
    if (trimmed === (container.description ?? "")) {
      setDescriptionDraft(null)
      return
    }
    save(updateContainerDescription(system, container.id, trimmed))
    setDescriptionDraft(null)
  }

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-40">
          <p className="truncate font-mono text-[13px] font-medium">
            {container.id}
            {isDefault && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Default</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">{container.description ?? container.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`grid-${container.id}-value`} className="sr-only">
            {container.id} width
          </label>
          <input
            id={`grid-${container.id}-value`}
            value={valueDraft ?? container.value}
            onChange={(event) => {
              setValueDraft(event.target.value)
              setError(null)
            }}
            onBlur={commitValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `grid-${container.id}-error` : undefined}
            className={`h-11 w-28 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
          {!isDefault && (
            <button
              onClick={() => {
                const result = setDefaultContainer(system, container.id)
                if (result.ok) save(result.system)
              }}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Set default
            </button>
          )}
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete container ${container.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep container ${container.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeContainer(system, container.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of container ${container.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep container ${container.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Understood
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor={`grid-${container.id}-label`} className="sr-only">
            {container.id} visible label
          </label>
          <input
            id={`grid-${container.id}-label`}
            value={labelDraft ?? container.label}
            onChange={(event) => setLabelDraft(event.target.value)}
            onBlur={commitLabel}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            maxLength={60}
            placeholder="Visible label"
            className="min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor={`grid-${container.id}-description`} className="sr-only">
            {container.id} usage description
          </label>
          <input
            id={`grid-${container.id}-description`}
            value={descriptionDraft ?? container.description ?? ""}
            onChange={(event) => setDescriptionDraft(event.target.value)}
            onBlur={commitDescription}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            maxLength={140}
            placeholder="Usage note (optional)"
            className="min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p id={`grid-${container.id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : !guard.ok && confirmingDelete ? (
          <p className="text-xs text-muted-foreground">{guard.reasons[0]}</p>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">= {container.value} max-width</p>
        )}
      </div>
    </li>
  )
}

function AddContainerForm({
  system,
  save,
  onDone,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  onDone: () => void
}) {
  const [label, setLabel] = useState("")
  const [customId, setCustomId] = useState("")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const result = createContainer(system, {
      id: customId.trim() ? customId : undefined,
      label: label.trim() ? label : undefined,
      description: description.trim() ? description : undefined,
      value: value.trim(),
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    if (parseContainerValue(result.container.value) === null) {
      setError("Enter a container width like 1200px, 75rem, or 100% for full-bleed.")
      return
    }
    save(insertContainer(system, result.container))
    onDone()
  }

  return (
    <div id="add-container-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-container-form-label" className="text-sm font-medium">
            Container name
          </label>
          <input
            id="add-container-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Sidebar"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-container-form-id" className="text-sm font-medium">
            Container id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-container-form-id"
            value={customId}
            onChange={(event) => {
              setCustomId(event.target.value)
              setError(null)
            }}
            placeholder="auto-derived from name"
            maxLength={40}
            spellCheck={false}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-container-form-value" className="text-sm font-medium">
            Max width
          </label>
          <input
            id="add-container-form-value"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setError(null)
            }}
            placeholder="1200px or 100%"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-container-form-description" className="text-sm font-medium">
            Usage note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-container-form-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Narrow dialogs"
            maxLength={140}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="mt-2 min-h-5" aria-live="polite">
        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={handleAdd}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add container
        </button>
        <button
          onClick={onDone}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const VIEWPORT_PRESETS = [
  { id: "mobile", label: "Mobile", width: 390 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "desktop", label: "Desktop", width: 1024 },
  { id: "wide", label: "Wide", width: 1440 },
] as const

function spacingPx(system: DesignSystemConfig, id: string): number | null {
  const token =
    system.foundations.spacing?.scale.find((t) => t.id === id) ??
    system.foundations.sizing?.tokens.find((t) => t.id === id)
  if (!token) return null
  const m = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(token.value.trim().toLowerCase())
  if (!m) {
    const bare = /^(\d+(?:\.\d+)?)$/.exec(token.value.trim().toLowerCase())
    if (!bare) return null
    return Number.parseFloat(bare[1]!)
  }
  const amount = Number.parseFloat(m[1]!)
  return m[2] === "px" ? amount : amount * 16
}

function GridPreview({ system }: { system: DesignSystemConfig }) {
  const [previewWidth, setPreviewWidth] = useState(1024)
  const [widthDraft, setWidthDraft] = useState<string | null>(null)
  const [widthError, setWidthError] = useState<string | null>(null)
  const [guides, setGuides] = useState(true)

  const active = activeBreakpoint(system, previewWidth)
  const resolved = resolveGridForWidth(system, previewWidth)
  const grid = ensureGridForSystem(system)
  const container = grid.containers.find((c) => c.id === grid.defaultContainer) ?? grid.containers[0]!
  const containerMax = containerPx(container)
  const gutterPx = spacingPx(system, resolved.profile.gutter) ?? 16
  const colGapPx = spacingPx(system, resolved.profile.columnGap) ?? 16
  const rowGapPx = spacingPx(system, resolved.profile.rowGap) ?? 16
  const radius = radiusValueFor(system, "md") ?? "8px"
  const borderDefault = resolveBorderRecipe(system, "border.default")
  const cardBorder = borderDefault?.css ?? "1px solid #e4e4e7"
  const columns = resolved.profile.columns

  const commitWidth = () => {
    const text = (widthDraft ?? String(previewWidth)).trim()
    const parsed = Number(text)
    if (text === "" || !Number.isFinite(parsed) || parsed < 200 || parsed > 2560) {
      setWidthError("Enter a preview width from 200 to 2560px.")
      return
    }
    setWidthError(null)
    setWidthDraft(null)
    setPreviewWidth(Math.round(parsed))
  }

  const stageColumns = useMemo(() => Array.from({ length: columns }, (_, i) => i), [columns])
  const isCompact = columns <= 6

  return (
    <aside aria-label="Grid preview" className="h-fit rounded-xl border border-border bg-background p-5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Effective grid resolves from the active breakpoint — edit a profile and watch this stage update.
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Viewport presets">
        {VIEWPORT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            aria-pressed={previewWidth === preset.width}
            onClick={() => {
              setPreviewWidth(preset.width)
              setWidthDraft(null)
              setWidthError(null)
            }}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${previewWidth === preset.width ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            {preset.label} · {preset.width}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label htmlFor="grid-preview-width" className="sr-only">
          Preview width in pixels
        </label>
        <input
          id="grid-preview-width"
          value={widthDraft ?? String(previewWidth)}
          inputMode="numeric"
          onChange={(event) => {
            setWidthDraft(event.target.value)
            setWidthError(null)
          }}
          onBlur={commitWidth}
          onKeyDown={(event) => {
            if (event.key === "Enter") (event.target as HTMLInputElement).blur()
          }}
          aria-invalid={Boolean(widthError)}
          aria-describedby={widthError ? "grid-preview-width-error" : undefined}
          className={`h-11 w-28 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${widthError ? "border-destructive" : "border-border"}`}
        />
        <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">px</span>
        <button
          aria-pressed={guides}
          onClick={() => setGuides((value) => !value)}
          className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${guides ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
        >
          Guides {guides ? "on" : "off"}
        </button>
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {widthError && (
          <p id="grid-preview-width-error" role="alert" className="text-xs font-medium text-destructive">
            {widthError}
          </p>
        )}
      </div>

      <div
        role="status"
        aria-label={`Active breakpoint ${active.id} with ${columns} grid columns at ${previewWidth} pixels wide`}
        className="mt-2 rounded-lg border border-foreground/30 bg-muted/50 px-3 py-2.5"
      >
        <p className="text-xs">
          <span className="font-semibold">Active: {resolved.breakpointId}</span>
          <span className="font-mono text-muted-foreground"> · {columns} cols</span>
          <span className="text-muted-foreground"> at {previewWidth}px</span>
        </p>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          container {container.id} {container.value} · gutter {resolved.profile.gutter} {gutterPx}px · col-gap {resolved.profile.columnGap} {colGapPx}px · row-gap {resolved.profile.rowGap} {rowGapPx}px
        </p>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/30 p-3">
        <div className="mx-auto min-w-0" style={{ width: previewWidth, maxWidth: "100%" }}>
          <div
            className="overflow-hidden rounded-lg border bg-background"
            style={{
              border: cardBorder,
              borderRadius: radius,
              maxWidth: containerMax ? `${Math.min(containerMax, previewWidth)}px` : undefined,
              marginInline: "auto",
              paddingInline: `${Math.min(gutterPx, 32)}px`,
            }}
          >
            <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-foreground font-mono text-[10px] font-bold text-background" aria-hidden="true">
                {isCompact ? "☰" : "▦"}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">Project overview</span>
              <span className="shrink-0 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background">
                New
              </span>
              <span className="hidden shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium sm:inline">
                Share
              </span>
            </div>
            <div
              className="grid p-3"
              style={{
                gridTemplateColumns: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))`,
                columnGap: `${Math.min(colGapPx, 24)}px`,
                rowGap: `${Math.min(rowGapPx, 24)}px`,
              }}
            >
              {[0, 1, 2].map((index) => (
                <div key={index} className="min-w-0 rounded-lg border p-3" style={{ border: cardBorder, borderRadius: radius }}>
                  <p className="truncate text-[13px] font-semibold">Card {index + 1}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                    Supporting copy that reflows as the stage narrows.
                  </p>
                </div>
              ))}
            </div>
            {guides && (
              <div className="border-t px-3 py-2" aria-hidden="true">
                <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${Math.min(colGapPx, 16)}px` }}>
                  {stageColumns.map((index) => (
                    <span key={index} className="block h-6 rounded-[3px] bg-foreground/10" />
                  ))}
                </div>
              </div>
            )}
            <div className="border-t px-3 py-2">
              <p className="truncate text-[11px] text-muted-foreground">
                {columns} grid columns · {container.id} {container.value} · {resolved.profile.gutter}/{resolved.profile.columnGap}/{resolved.profile.rowGap}
              </p>
            </div>
          </div>
        </div>
      </div>

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Preview token sources
        </summary>
        <ul className="mt-2 space-y-1">
          <li className="font-mono text-[11px]">active ← {resolved.breakpointId} · ≥{active.value}</li>
          <li className="font-mono text-[11px]">profile ← {columns} cols · {resolved.profile.gutter} · {resolved.profile.columnGap} · {resolved.profile.rowGap}</li>
          <li className="font-mono text-[11px]">container ← {container.id} · {container.value}</li>
        </ul>
      </details>
      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
        Spacing in use: {isSpacingTokenUsedByGrid(system, resolved.profile.gutter) ? "referenced" : "custom"} — deleting a spacing token used here is blocked in a spacing-aware workflow.
      </p>
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
