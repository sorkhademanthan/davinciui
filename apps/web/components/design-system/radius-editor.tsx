"use client"

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import type { DesignSystemConfig, RadiusToken } from "@/lib/design-system/domain"
import {
  applyRadiusPreset,
  canDeleteRadiusToken,
  createRadiusToken,
  diffRadiusScales,
  ensureRadiusScale,
  hasCustomRadiusEdits,
  moveRadiusToken,
  parseRadiusValue,
  radiusIssues,
  radiusValueFor,
  RADIUS_PRESETS,
  RADIUS_UNITS,
  removeRadiusToken,
  resetRadiusTokenToStarter,
  restoreStarterRadius,
  updateRadiusLabel,
  updateRadiusValue,
  type RadiusPreset,
  type RadiusUnit,
} from "@/lib/design-system/radius"
import { usePreviewTheme } from "@/components/design-system/use-preview-theme"
import { resolveToken } from "@/lib/design-system/domain"

export function RadiusEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      <PageHeader
        eyebrow="Design System / Foundations"
        title="Radius"
        description="Define your corner language, then see it shape live interface primitives."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <PresetSection system={system} save={save} />
          <TokenSection system={system} save={save} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <RadiusPreview system={system} selectedId={selectedId} />
      </div>
    </>
  )
}

function currentScale(system: DesignSystemConfig): RadiusToken[] {
  return ensureRadiusScale(system.foundations.radius?.scale, system.foundations.radius?.base ?? 8)
}

function PresetSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [pendingPreset, setPendingPreset] = useState<RadiusPreset | "starter" | null>(null)
  const customEdits = hasCustomRadiusEdits(system)

  const requestPreset = (preset: RadiusPreset | "starter") => {
    if (customEdits) {
      setPendingPreset(preset)
      return
    }
    applyPresetChoice(preset)
  }

  const applyPresetChoice = (preset: RadiusPreset | "starter") => {
    if (preset === "starter") {
      save(restoreStarterRadius(system))
    } else {
      save(applyRadiusPreset(system, preset))
    }
    setPendingPreset(null)
  }

  return (
    <section aria-label="Shape presets" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Shape presets</h2>
        <p className="text-xs text-muted-foreground">
          Base <span className="font-mono">{system.foundations.radius?.base ?? 8}px</span> (starter default)
          {" · "}
          <span className={`font-medium ${customEdits ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {customEdits ? "Custom scale" : "Starter scale"}
          </span>
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Presets are starting points — your scale stays fully editable afterwards.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {RADIUS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => requestPreset(preset)}
            className="min-h-11 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="block h-8 w-12 shrink-0 border-2 border-foreground/70 bg-muted"
                style={{ borderRadius: preset.scale.find((token) => token.id === "md")?.value ?? "0px" }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{preset.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{preset.description}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => requestPreset("starter")}
        className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Restore starter default
      </button>
      {pendingPreset && (
        <PresetConfirm
          system={system}
          preset={pendingPreset}
          onConfirm={() => applyPresetChoice(pendingPreset)}
          onCancel={() => setPendingPreset(null)}
        />
      )}
    </section>
  )
}

function PresetConfirm({
  system,
  preset,
  onConfirm,
  onCancel,
}: {
  system: DesignSystemConfig
  preset: RadiusPreset | "starter"
  onConfirm: () => void
  onCancel: () => void
}) {
  const nextScale =
    preset === "starter"
      ? restoreStarterRadius(system).foundations.radius.scale
      : preset.scale;
  const diff = diffRadiusScales(currentScale(system), nextScale)

  return (
    <div role="alert" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <h3 className="text-sm font-semibold">
        {preset === "starter" ? "Restore starter defaults?" : `Apply “${preset.label}”?`}
      </h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        You have custom radius edits. Applying this scale overwrites them:
      </p>
      <ScaleDiffSummary
        added={diff.added}
        removed={diff.removed}
        changed={diff.changed}
      />
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

function ScaleDiffSummary({
  added,
  removed,
  changed,
}: {
  added: RadiusToken[]
  removed: RadiusToken[]
  changed: Array<{ id: string; from: string; to: string }>
}) {
  const total = added.length + removed.length + changed.length
  if (total === 0) return <p className="mt-2 text-xs text-muted-foreground">No differences — scales already match.</p>
  return (
    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
      {changed.map((entry) => (
        <li key={`c-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
      ))}
      {added.map((token) => (
        <li key={`a-${token.id}`}>+ {token.id} ({token.label}: {token.value})</li>
      ))}
      {removed.map((token) => (
        <li key={`r-${token.id}`}>− {token.id} ({token.label}: {token.value})</li>
      ))}
    </ul>
  )
}

function TokenSection({
  system,
  save,
  selectedId,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const tokens = currentScale(system)
  const [showAdd, setShowAdd] = useState(false)
  const issues = radiusIssues(system)

  return (
    <section aria-label="Radius tokens" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Tokens ({tokens.length})</h2>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-radius-token-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add token"}
        </button>
      </div>
      {showAdd && (
        <AddTokenForm
          system={system}
          save={save}
          onDone={() => setShowAdd(false)}
        />
      )}
      <ul className="mt-4 space-y-2">
        {tokens.map((token, index) => (
          <TokenRow
            key={token.id}
            system={system}
            save={save}
            token={token}
            index={index}
            total={tokens.length}
            selected={selectedId === token.id}
            onSelect={onSelect}
          />
        ))}
      </ul>
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

function TokenRow({
  system,
  save,
  token,
  index,
  total,
  selected,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  token: RadiusToken
  index: number
  total: number
  selected: boolean
  onSelect: (id: string | null) => void
}) {
  const [amount, setAmount] = useState<string | null>(null)
  const [unit, setUnit] = useState<RadiusUnit | null>(null)
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const parsed = parseRadiusValue(token.value)
  const displayAmount = amount ?? String(parsed?.amount ?? "")
  const displayUnit = (unit ?? parsed?.unit ?? "px") as RadiusUnit
  const displayLabel = labelDraft ?? token.label

  const commit = () => {
    const text = displayAmount.trim()
    const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${displayUnit}` : text
    const candidate = withUnit === "" ? null : parseRadiusValue(withUnit)
    if (!candidate) {
      setError("Enter a value of 0 or more with px, rem, or % (e.g. 12px).")
      return
    }
    setError(null)
    setAmount(null)
    setUnit(null)
    save(updateRadiusValue(system, token.id, candidate.amount, candidate.unit))
  }

  const commitLabel = () => {
    const trimmed = (labelDraft ?? token.label).trim()
    if (!trimmed) {
      setLabelError("Label cannot be empty — keeping the previous label.")
      setLabelDraft(null)
      return
    }
    setLabelError(null)
    setLabelDraft(null)
    if (trimmed !== token.label) save(updateRadiusLabel(system, token.id, trimmed))
  }

  const guard = canDeleteRadiusToken(system, token.id)

  return (
    <li className={`rounded-lg border p-3 transition-colors ${selected ? "border-foreground bg-muted/60" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => onSelect(selected ? null : token.id)}
          aria-pressed={selected}
          aria-label={`Select token ${token.id} for preview`}
          className="min-w-0 flex-1 basis-40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md min-h-11"
        >
          <span className="block truncate font-mono text-[13px] font-medium">{token.id}</span>
          <span className="block truncate text-xs text-muted-foreground">{token.label}</span>
        </button>
        <div
          aria-hidden="true"
          className="h-10 w-16 shrink-0 border-2 border-foreground/70 bg-muted"
          style={{ borderRadius: parsed ? token.value : "0px" }}
          title={`${token.id}: ${token.value}`}
        />
        <div className="flex items-center gap-2">
          <label htmlFor={`radius-${token.id}-amount`} className="sr-only">
            {token.id} value
          </label>
          <input
            id={`radius-${token.id}-amount`}
            value={displayAmount}
            inputMode="decimal"
            onChange={(event) => {
              setAmount(event.target.value)
              setError(null)
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `radius-${token.id}-error` : undefined}
            className={`h-11 w-24 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
          <label htmlFor={`radius-${token.id}-unit`} className="sr-only">
            {token.id} unit
          </label>
          <select
            id={`radius-${token.id}-unit`}
            value={displayUnit}
            onChange={(event) => {
              const nextUnit = event.target.value as RadiusUnit
              setUnit(nextUnit)
              const text = displayAmount.trim()
              const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${nextUnit}` : text
              const strict = withUnit === "" ? null : parseRadiusValue(withUnit)
              if (!strict) {
                setError("Enter a value of 0 or more with px, rem, or % (e.g. 12px).")
                return
              }
              setError(null)
              setAmount(null)
              setUnit(null)
              save(updateRadiusValue(system, token.id, strict.amount, strict.unit))
            }}
            className="h-11 rounded-lg border border-border bg-background px-2 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {RADIUS_UNITS.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ResetTokenButton system={system} save={save} tokenId={token.id} />
          <button
            onClick={() => save(moveRadiusToken(system, token.id, -1))}
            disabled={index === 0}
            aria-label={`Move ${token.id} up`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => save(moveRadiusToken(system, token.id, 1))}
            disabled={index === total - 1}
            aria-label={`Move ${token.id} down`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowDown className="size-4" aria-hidden="true" />
          </button>
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete token ${token.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep token ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  if (guard.ok) save(removeRadiusToken(system, token.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of token ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          )}
        </div>
      </div>
      <div className="mt-2">
        <label htmlFor={`radius-${token.id}-label`} className="sr-only">
          {token.id} visible label
        </label>
        <input
          id={`radius-${token.id}-label`}
          value={displayLabel}
          onChange={(event) => {
            setLabelDraft(event.target.value)
            setLabelError(null)
          }}
          onBlur={commitLabel}
          onKeyDown={(event) => {
            if (event.key === "Enter") (event.target as HTMLInputElement).blur()
          }}
          maxLength={60}
          aria-invalid={Boolean(labelError)}
          aria-describedby={labelError ? `radius-${token.id}-label-error` : undefined}
          className={`min-h-11 w-full max-w-xs rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
        />
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p id={`radius-${token.id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : labelError ? (
          <p id={`radius-${token.id}-label-error`} role="alert" className="text-xs font-medium text-destructive">
            {labelError}
          </p>
        ) : !guard.ok ? (
          <p className="text-xs text-muted-foreground">
            {guard.reasons[0]} {guard.references.length > 0 && <>({guard.references.map((reference) => reference.pointer).join(", ")})</>}
          </p>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">= {token.value}</p>
        )}
      </div>
    </li>
  )
}

function ResetTokenButton({
  system,
  save,
  tokenId,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  tokenId: string
}) {
  const [confirmed, setConfirmed] = useState(false)
  const restorable = resetRadiusTokenToStarter(system, tokenId) !== null
  if (!restorable) return null
  if (!confirmed) {
    return (
      <button
        onClick={() => setConfirmed(true)}
        aria-label={`Reset ${tokenId} to starter default`}
        title="Reset to starter default"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
      </button>
    )
  }
  return (
    <span className="flex items-center gap-2">
      <button
        onClick={() => setConfirmed(false)}
        aria-label={`Keep custom value for ${tokenId}`}
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Keep
      </button>
      <button
        onClick={() => {
          const next = resetRadiusTokenToStarter(system, tokenId)
          if (next) save(next)
          setConfirmed(false)
        }}
        aria-label={`Confirm reset of ${tokenId}`}
        className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Reset
      </button>
    </span>
  )
}

function AddTokenForm({
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
  const [amount, setAmount] = useState("")
  const [unit, setUnit] = useState<RadiusUnit>("px")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const numeric = Number(amount.trim())
    const result = createRadiusToken(
      { id: customId.trim() ? customId : undefined, label: label.trim() ? label : undefined, amount: numeric, unit },
      currentScale(system).map((token) => token.id),
    )
    if (!result.ok) {
      setError(result.error)
      return
    }
    save({
      ...system,
      foundations: {
        ...system.foundations,
        radius: { ...system.foundations.radius, scale: [...currentScale(system), result.token] },
      },
    })
    onDone()
  }

  return (
    <div id="add-radius-token-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-radius-token-form-label" className="text-sm font-medium">
            Token name
          </label>
          <input
            id="add-radius-token-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Card pop"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-radius-token-form-id" className="text-sm font-medium">
            Token id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-radius-token-form-id"
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
          <label htmlFor="add-radius-token-form-amount" className="text-sm font-medium">
            Value
          </label>
          <input
            id="add-radius-token-form-amount"
            value={amount}
            inputMode="decimal"
            onChange={(event) => {
              setAmount(event.target.value)
              setError(null)
            }}
            placeholder="0 or more"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-radius-token-form-unit" className="text-sm font-medium">
            Unit
          </label>
          <select
            id="add-radius-token-form-unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value as RadiusUnit)}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="px">px — fixed pixels</option>
            <option value="rem">rem — relative to root</option>
            <option value="%">% — relative to box</option>
          </select>
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
          Add radius token
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

function RadiusPreview({ system, selectedId }: { system: DesignSystemConfig; selectedId: string | null }) {
  const { themeOptions, activeThemeId, selectTheme } = usePreviewTheme(system)
  const radiusFor = (ids: string[]): { id: string; value: string } | null => {
    for (const id of ids) {
      const token = currentScale(system).find((entry) => entry.id === id)
      if (token && parseRadiusValue(token.value)) return { id, value: token.value }
    }
    return null
  }

  const button = radiusFor(["md", "sm", "lg"])
  const input = radiusFor(["md", "sm"])
  const card = radiusFor(["lg", "md", "xl"])
  const dialog = radiusFor(["xl", "lg", "2xl"])
  const media = radiusFor(["lg", "md", "xl"])
  const avatar = radiusFor(["full", "xl", "lg"])
  const pill = radiusFor(["full", "md", "lg"])

  const fg = (() => {
    try {
      const resolved = resolveToken(system, "text.primary", activeThemeId)
      return resolved.status === "resolved" ? resolved.value : "#18181b"
    } catch {
      return "#18181b"
    }
  })()
  const surface = (() => {
    try {
      const resolved = resolveToken(system, "background.surface", activeThemeId)
      if (resolved.status === "resolved") return resolved.value
      const canvas = resolveToken(system, "background.canvas", activeThemeId)
      return canvas.status === "resolved" ? canvas.value : "#fafafa"
    } catch {
      return "#fafafa"
    }
  })()
  const actionBg = (() => {
    try {
      const resolved = resolveToken(system, "action.primary.background", activeThemeId)
      return resolved.status === "resolved" ? resolved.value : "#18181b"
    } catch {
      return "#18181b"
    }
  })()
  // Button/avatar text pairs with the action background — never a hardcoded
  // white, which fails on light custom action colors.
  const actionFg = (() => {
    try {
      const resolved = resolveToken(system, "action.primary.foreground", activeThemeId)
      return resolved.status === "resolved" ? resolved.value : "#ffffff"
    } catch {
      return "#ffffff"
    }
  })()

  const missing: string[] = []
  const slots: Array<[string, { id: string; value: string } | null]> = [
    ["Button", button],
    ["Input", input],
    ["Card", card],
    ["Dialog", dialog],
    ["Media", media],
    ["Avatar", avatar],
    ["Pill", pill],
  ]
  for (const [label, slot] of slots) {
    if (!slot) missing.push(label)
  }

  const mark = (usedId: string | null) =>
    selectedId && usedId === selectedId
      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
      : ""

  return (
    <aside aria-label="Radius preview" className="h-fit rounded-xl border border-border bg-background p-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Primitive geometry from saved radius tokens — not component overrides.
        {selectedId ? (
          <> Highlighting <span className="font-mono font-medium text-foreground">{selectedId}</span>.</>
        ) : (
          <> Select a token to highlight where it applies.</>
        )}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Preview theme">
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
      </div>

      <div className="mt-4 space-y-4">
        <section aria-label="Button and input preview" className={`rounded-lg ${mark(button?.id ?? input?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">CONTROL · {button ? button.id : "unconfigured"}</p>
          <div className="mt-2 flex max-w-full flex-wrap items-center gap-2">
            <button
              tabIndex={-1}
              className="inline-flex min-h-11 items-center px-4 text-sm font-medium"
              style={{ borderRadius: button?.value ?? "0px", background: actionBg, color: actionFg }}
              title={button ? `${button.id} · ${button.value}` : "unconfigured"}
            >
              Continue
            </button>
            <span
              className="inline-flex min-h-11 items-center border border-border px-3 text-sm"
              style={{ borderRadius: input?.value ?? button?.value ?? "0px", color: fg }}
              title={input ? `${input.id} · ${input.value}` : "unconfigured"}
            >
              you@example.com
            </span>
          </div>
        </section>

        <section aria-label="Card preview" className={`rounded-lg ${mark(card?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">CARD · {card ? card.id : "unconfigured"}</p>
          <div
            className="mt-2 border border-border p-4"
            style={{ borderRadius: card?.value ?? "0px", background: surface, color: fg }}
            title={card ? `${card.id} · ${card.value}` : "unconfigured"}
          >
            <p className="text-sm font-medium">Card title</p>
            <p className="mt-1 text-xs opacity-70">Supporting copy with card corners.</p>
          </div>
        </section>

        <section aria-label="Dialog preview" className={`rounded-lg ${mark(dialog?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">DIALOG · {dialog ? dialog.id : "unconfigured"}</p>
          <div
            className="mt-2 border border-border p-4"
            style={{ borderRadius: dialog?.value ?? "0px", background: surface, color: fg }}
            title={dialog ? `${dialog.id} · ${dialog.value}` : "unconfigured"}
          >
            <p className="text-sm font-medium">Confirm deletion</p>
            <p className="mt-1 text-xs opacity-70">A sheet-like surface with larger corners.</p>
          </div>
        </section>

        <section aria-label="Media preview" className={`rounded-lg ${mark(media?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">MEDIA · {media ? media.id : "unconfigured"}</p>
          <div
            className="mt-2 flex h-28 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-violet-500/60 via-fuchsia-500/40 to-amber-500/60"
            style={{ borderRadius: media?.value ?? "0px" }}
            title={media ? `${media.id} · ${media.value}` : "unconfigured"}
          >
            <span className="rounded bg-black/50 px-2 py-1 font-mono text-[11px] text-white">16:9 media</span>
          </div>
        </section>

        <section aria-label="Avatar and pill preview" className="rounded-lg">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">AVATAR · BADGE · PILL</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              role="img"
              aria-label={avatar ? `Avatar, ${avatar.id}, ${avatar.value}` : "Avatar unconfigured"}
              title={avatar ? `${avatar.id} · ${avatar.value}` : "unconfigured"}
              className={`grid size-12 place-items-center text-sm font-semibold ${mark(avatar?.id ?? null)}`}
              style={{ borderRadius: avatar?.value ?? "0px", background: actionBg, color: actionFg }}
            >
              M
            </span>
            <span
              className={`inline-flex min-h-11 items-center bg-muted px-3 text-xs font-medium ${mark(avatar?.id ?? null)}`}
              style={{ borderRadius: avatar?.value ?? "0px", color: fg }}
              title={avatar ? `${avatar.id} · ${avatar.value}` : "unconfigured"}
            >
              Badge
            </span>
            <span
              className={`inline-flex min-h-11 items-center px-4 text-xs font-medium ${mark(pill?.id ?? null)}`}
              style={{ borderRadius: pill?.value ?? "0px", background: actionBg, color: actionFg }}
              title={pill ? `${pill.id} · ${pill.value}` : "unconfigured"}
            >
              New tag
            </span>
          </div>
        </section>
      </div>

      {missing.length > 0 && (
        <p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">
          Unconfigured in preview: {missing.join(", ")}. Restore or add those tokens to complete this preview.
        </p>
      )}
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Preview token sources
        </summary>
        <ul className="mt-2 space-y-1">
          {slots.map(([label, slot]) => (
            <li key={label} className="font-mono text-[11px]">
              {label} ← {slot ? `${slot.id} · ${slot.value}` : "unconfigured"}
            </li>
          ))}
        </ul>
      </details>
    </aside>
  )
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
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
