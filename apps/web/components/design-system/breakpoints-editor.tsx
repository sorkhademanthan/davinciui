"use client"

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import type { DesignSystemConfig, BreakpointToken } from "@/lib/design-system/domain"
import { resolveBorderRecipe } from "@/lib/design-system/borders"
import { radiusValueFor } from "@/lib/design-system/radius"
import { firstAvailablePx } from "@/lib/design-system/spacing"
import {
  activeBreakpoint,
  applyBreakpointPreset,
  BREAKPOINT_PRESETS,
  BREAKPOINT_UNITS,
  breakpointIssues,
  breakpointPx,
  canDeleteBreakpoint,
  createBreakpointToken,
  diffBreakpointScales,
  ensureBreakpointScale,
  hasCustomBreakpointEdits,
  insertBreakpointToken,
  moveBreakpoint,
  parseBreakpointValue,
  removeBreakpoint,
  resetBreakpointToStarter,
  restoreStarterBreakpoints,
  updateBreakpointDescription,
  updateBreakpointLabel,
  updateBreakpointValue,
  type BreakpointPreset,
  type BreakpointUnit,
} from "@/lib/design-system/breakpoints"
import { effectiveProfile, ensureGridForSystem, resolveGridForWidth } from "@/lib/design-system/grid"

export function BreakpointsEditor({
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
        title="Screen sizes"
        description="Choose when your layout changes from phone to tablet to desktop. The page layout and components follow these rules automatically."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <PresetSection system={system} save={save} />
          <BreakpointStory system={system} />
          <details className="group rounded-xl border border-border bg-background">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-medium marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span>Advanced screen-size controls<span className="mt-0.5 block text-xs font-normal text-muted-foreground">Edit exact pixel values, add a custom screen size, or see every connected rule.</span></span>
              <span aria-hidden="true" className="text-lg text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="border-t border-border p-4 sm:p-5"><TokenSection system={system} save={save} selectedId={selectedId} onSelect={setSelectedId} /></div>
          </details>
        </div>
        <BreakpointPreview system={system} selectedId={selectedId} />
      </div>
    </>
  )
}

function BreakpointStory({ system }: { system: DesignSystemConfig }) {
  const scale = currentScale(system)
  const stages = [
    { id: "base", name: "Phone", explanation: "Single-hand use and compact content." },
    { id: "md", name: "Tablet", explanation: "More room for side-by-side content." },
    { id: "lg", name: "Laptop and larger", explanation: "Full workspace layout for larger screens." },
  ].map((stage) => {
    const token = scale.find((entry) => entry.id === stage.id) ?? scale[0]!
    const profile = effectiveProfile(system, token.id)
    return { ...stage, token, profile }
  })
  return (
    <section aria-label="How the layout adapts" className="rounded-xl border border-border bg-background p-5">
      <h2 className="text-lg font-semibold tracking-tight">How your layout adapts</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">These are the moments when the interface changes shape. You choose the switch points; Grid and components use them everywhere.</p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        {stages.map((stage) => (
          <li key={stage.id} className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold">{stage.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">From {stage.token.value}</p>
            <div aria-hidden="true" className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(stage.profile.columns, 6)}, minmax(0, 1fr))` }}>{Array.from({ length: Math.min(stage.profile.columns, 6) }, (_, index) => <span key={index} className="block h-6 rounded-[3px] bg-foreground/15" />)}</div>
            <p className="mt-2 text-xs"><span className="font-medium">{stage.profile.columns} columns</span><span className="text-muted-foreground"> · {stage.explanation}</span></p>
          </li>
        ))}
      </ol>
      <details className="mt-4 border-t border-border pt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View PDF handoff details</summary>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">The export will document each switch point and the layout it activates.</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{scale.map((token) => { const profile = effectiveProfile(system, token.id); return <li key={token.id}><span className="font-medium text-foreground">{token.label}</span> from {token.value}: {profile.columns} columns</li> })}</ul>
      </details>
    </section>
  )
}

function currentScale(system: DesignSystemConfig): BreakpointToken[] {
  return ensureBreakpointScale(system.foundations.breakpoints?.scale)
}

function commitScale(system: DesignSystemConfig, save: (next: DesignSystemConfig) => void, scale: BreakpointToken[]): void {
  save({
    ...system,
    foundations: { ...system.foundations, breakpoints: { scale: scale.map((token) => ({ ...token })) } },
  })
}

function PresetSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [pendingPreset, setPendingPreset] = useState<BreakpointPreset | "starter" | null>(null)
  const customEdits = hasCustomBreakpointEdits(system)

  const requestPreset = (preset: BreakpointPreset | "starter") => {
    if (customEdits) {
      setPendingPreset(preset)
      return
    }
    applyPresetChoice(preset)
  }

  const applyPresetChoice = (preset: BreakpointPreset | "starter") => {
    if (preset === "starter") {
      save(restoreStarterBreakpoints(system))
    } else {
      save(applyBreakpointPreset(system, preset))
    }
    setPendingPreset(null)
  }

  return (
    <section aria-label="Choose screen-size rules" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Choose when layouts change</h2>
        <p className="text-xs text-muted-foreground">
          <span className={`font-medium ${customEdits ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {customEdits ? "Custom scale" : "Starter scale"}
          </span>
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Start with a familiar device scale. This changes only when layouts switch; it never changes the layout itself.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {BREAKPOINT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => requestPreset(preset)}
            className="min-h-11 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block text-sm font-medium">{preset.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{preset.description}</span>
            <span className="mt-2 block text-xs text-muted-foreground">Tablet from {preset.scale.find((token) => token.id === "md")?.value ?? "—"} · Laptop from {preset.scale.find((token) => token.id === "lg")?.value ?? "—"}</span>
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
  preset: BreakpointPreset | "starter"
  onConfirm: () => void
  onCancel: () => void
}) {
  const nextScale =
    preset === "starter"
      ? restoreStarterBreakpoints(system).foundations.breakpoints.scale
      : preset.scale;
  const diff = diffBreakpointScales(currentScale(system), nextScale)

  return (
    <div role="alert" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <h3 className="text-sm font-semibold">
        {preset === "starter" ? "Restore starter defaults?" : `Apply “${preset.label}”?`}
      </h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        You have custom breakpoint edits. Applying this scale overwrites threshold values (Grid columns and gaps stay untouched):
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
  added: BreakpointToken[]
  removed: BreakpointToken[]
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

function GridSummary({ system }: { system: DesignSystemConfig }) {
  const scale = currentScale(system)
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Grid profiles by breakpoint</h3>
        <a
          href={`/design-system/${system.id}/grid`}
          className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open Grid
        </a>
      </div>
      <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
        {scale.map((token) => {
          const profile = effectiveProfile(system, token.id)
          return (
            <li key={token.id}>
              {token.id} ≥{token.value}: {profile.columns} cols · {profile.gutter}/{profile.columnGap}/{profile.rowGap}
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Thresholds below decide <em>when</em> each Grid profile activates. Column, gutter, and gap values
        live in Grid and are never changed here — editing a threshold only moves the switch point.
      </p>
    </div>
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

  return (
    <section aria-label="Breakpoint tokens" className="rounded-xl border border-border bg-background p-5">
      <GridSummary system={system} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Thresholds ({tokens.length})</h2>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-breakpoint-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add breakpoint"}
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
      <ValidatorIssues system={system} />
    </section>
  )
}

function ValidatorIssues({ system }: { system: DesignSystemConfig }) {
  const issues = breakpointIssues(system)
  if (issues.length === 0) return null
  return (
    <div role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
      {issues.map((issue) => (
        <p key={`${issue.path}-${issue.message}`}>{issue.message}</p>
      ))}
    </div>
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
  token: BreakpointToken
  index: number
  total: number
  selected: boolean
  onSelect: (id: string | null) => void
}) {
  const [amount, setAmount] = useState<string | null>(null)
  const [unit, setUnit] = useState<BreakpointUnit | null>(null)
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const parsed = parseBreakpointValue(token.value)
  const displayAmount = amount ?? String(parsed?.amount ?? "")
  const displayUnit = (unit ?? parsed?.unit ?? "px") as BreakpointUnit
  const isBase = token.id === "base"

  const commit = () => {
    if (isBase) return
    const text = displayAmount.trim()
    const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${displayUnit}` : text
    const candidate = withUnit === "" ? null : parseBreakpointValue(withUnit)
    if (!candidate) {
      setError("Enter a threshold of 0 or more with px or rem (e.g. 768px).")
      return
    }
    const result = updateBreakpointValue(system, token.id, candidate.amount, candidate.unit)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setAmount(null)
    setUnit(null)
    save(result.system)
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
    if (trimmed !== token.label) save(updateBreakpointLabel(system, token.id, trimmed))
  }

  const commitDescription = () => {
    const trimmed = (descriptionDraft ?? token.description ?? "").trim()
    if (trimmed === (token.description ?? "")) {
      setDescriptionDraft(null)
      return
    }
    save(updateBreakpointDescription(system, token.id, trimmed))
    setDescriptionDraft(null)
  }

  const guard = canDeleteBreakpoint(system, token.id)
  const restorable = resetBreakpointToStarter(system, token.id) !== null
  const [moveError, setMoveError] = useState<string | null>(null)

  const tryMove = (direction: -1 | 1) => {
    const result = moveBreakpoint(system, token.id, direction)
    if (!result.ok) {
      setMoveError(result.error)
      return
    }
    setMoveError(null)
    save(result.system)
  }

  return (
    <li
      className={`rounded-lg border p-3 transition-colors ${selected ? "border-foreground bg-muted/60" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => onSelect(selected ? null : token.id)}
          aria-pressed={selected}
          aria-label={`Select breakpoint ${token.id} for preview`}
          className="min-w-0 flex-1 basis-40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md min-h-11"
        >
          <span className="block truncate font-mono text-[13px] font-medium">
            {token.id}
            {isBase && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Fixed</span>}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{token.description ?? token.label}</span>
        </button>
        <div
          aria-hidden="true"
          className="hidden h-8 shrink-0 items-end gap-0.5 sm:flex"
        >
          <ViewportGlyph px={breakpointPx(token)} />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`breakpoints-${token.id}-amount`} className="sr-only">
            {token.id} minimum width
          </label>
          <input
            id={`breakpoints-${token.id}-amount`}
            value={isBase ? "0" : displayAmount}
            inputMode="decimal"
            disabled={isBase}
            onChange={(event) => {
              setAmount(event.target.value)
              setError(null)
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `breakpoints-${token.id}-error` : undefined}
            className={`h-11 w-24 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-destructive" : "border-border"}`}
          />
          <label htmlFor={`breakpoints-${token.id}-unit`} className="sr-only">
            {token.id} unit
          </label>
          <select
            id={`breakpoints-${token.id}-unit`}
            value={displayUnit}
            disabled={isBase}
            onChange={(event) => {
              const nextUnit = event.target.value as BreakpointUnit
              setUnit(nextUnit)
              const text = displayAmount.trim()
              const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${nextUnit}` : text
              const strict = withUnit === "" ? null : parseBreakpointValue(withUnit)
              if (!strict) {
                setError("Enter a threshold of 0 or more with px or rem (e.g. 768px).")
                return
              }
              const result = updateBreakpointValue(system, token.id, strict.amount, strict.unit)
              if (!result.ok) {
                setError(result.error)
                return
              }
              setError(null)
              setAmount(null)
              setUnit(null)
              save(result.system)
            }}
            className="h-11 rounded-lg border border-border bg-background px-2 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {BREAKPOINT_UNITS.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {restorable &&
            (!confirmingReset ? (
              <button
                onClick={() => setConfirmingReset(true)}
                aria-label={`Reset ${token.id} to starter default`}
                title="Reset to starter default"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmingReset(false)}
                  aria-label={`Keep custom value for ${token.id}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    const next = resetBreakpointToStarter(system, token.id)
                    if (next) save(next)
                    setConfirmingReset(false)
                  }}
                  aria-label={`Confirm reset of ${token.id}`}
                  className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Reset
                </button>
              </span>
            ))}
          <button
            onClick={() => tryMove(-1)}
            disabled={index === 0}
            aria-label={`Move ${token.id} up`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => tryMove(1)}
            disabled={index === total - 1}
            aria-label={`Move ${token.id} down`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowDown className="size-4" aria-hidden="true" />
          </button>
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete breakpoint ${token.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep breakpoint ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeBreakpoint(system, token.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of breakpoint ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep breakpoint ${token.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Understood
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor={`breakpoints-${token.id}-label`} className="sr-only">
            {token.id} visible label
          </label>
          <input
            id={`breakpoints-${token.id}-label`}
            value={labelDraft ?? token.label}
            onChange={(event) => {
              setLabelDraft(event.target.value)
              setLabelError(null)
            }}
            onBlur={commitLabel}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            maxLength={60}
            placeholder="Visible label"
            aria-invalid={Boolean(labelError)}
            aria-describedby={labelError ? `breakpoints-${token.id}-label-error` : undefined}
            className={`min-h-11 w-full rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
          />
        </div>
        <div>
          <label htmlFor={`breakpoints-${token.id}-description`} className="sr-only">
            {token.id} usage description
          </label>
          <input
            id={`breakpoints-${token.id}-description`}
            value={descriptionDraft ?? token.description ?? ""}
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
          <p id={`breakpoints-${token.id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : moveError ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {moveError}
          </p>
        ) : labelError ? (
          <p id={`breakpoints-${token.id}-label-error`} role="alert" className="text-xs font-medium text-destructive">
            {labelError}
          </p>
        ) : !guard.ok ? (
          <p className="text-xs text-muted-foreground">
            {guard.reasons[0]} {guard.references.length > 0 && <>({guard.references.map((reference) => reference.pointer).join(", ")})</>}
          </p>
        ) : (
          <GridProfileLine system={system} breakpointId={token.id} value={token.value} />
        )}
      </div>
    </li>
  )
}

function GridProfileLine({ system, breakpointId, value }: { system: DesignSystemConfig; breakpointId: string; value: string }) {
  const profile = effectiveProfile(system, breakpointId)
  return (
    <p className="font-mono text-[11px] text-muted-foreground">
      = {value} min-width · Grid {profile.columns} cols · {profile.gutter}/{profile.columnGap}/{profile.rowGap} activate here ·{" "}
      <a
        href={`/design-system/${system.id}/grid`}
        className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Open Grid
      </a>
    </p>
  )
}

function ViewportGlyph({ px }: { px: number | null }) {
  const width = px === null ? 8 : Math.max(6, Math.min(28, (px / 1536) * 28))
  return (
    <span aria-hidden="true" className="flex h-8 w-10 shrink-0 items-end justify-center rounded border border-border bg-muted/40 px-1 pb-1">
      <span className="block h-5 rounded-[2px] bg-foreground/70" style={{ width: `${width}px` }} />
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
  const [unit, setUnit] = useState<BreakpointUnit>("px")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const numeric = Number(amount.trim())
    const result = createBreakpointToken(
      {
        id: customId.trim() ? customId : undefined,
        label: label.trim() ? label : undefined,
        description: description.trim() ? description : undefined,
        amount: numeric,
        unit,
      },
      currentScale(system),
    )
    if (!result.ok) {
      setError(result.error)
      return
    }
    commitScale(system, save, insertBreakpointToken(currentScale(system), result.token))
    onDone()
  }

  return (
    <div id="add-breakpoint-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-breakpoint-form-label" className="text-sm font-medium">
            Breakpoint name
          </label>
          <input
            id="add-breakpoint-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Tablet"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-breakpoint-form-id" className="text-sm font-medium">
            Breakpoint id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-breakpoint-form-id"
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
          <label htmlFor="add-breakpoint-form-amount" className="text-sm font-medium">
            Minimum width
          </label>
          <input
            id="add-breakpoint-form-amount"
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
          <label htmlFor="add-breakpoint-form-unit" className="text-sm font-medium">
            Unit
          </label>
          <select
            id="add-breakpoint-form-unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value as BreakpointUnit)}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="px">px — CSS pixels</option>
            <option value="rem">rem — relative to root</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-breakpoint-form-description" className="text-sm font-medium">
            Usage note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-breakpoint-form-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Large phones in landscape"
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
          Add breakpoint
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
] as const;

function BreakpointPreview({ system, selectedId }: { system: DesignSystemConfig; selectedId: string | null }) {
  const [previewWidth, setPreviewWidth] = useState(1024);
  const [widthDraft, setWidthDraft] = useState<string | null>(null);
  const [widthError, setWidthError] = useState<string | null>(null);

  const active = activeBreakpoint(system, previewWidth);
  const resolved = resolveGridForWidth(system, previewWidth);
  const grid = ensureGridForSystem(system);
  // Responsive Grid drives the layout: the stored profile for the active
  // breakpoint decides columns/gaps, so editing a threshold visibly moves the
  // switch point without discarding any Grid values.
  const previewCols = Math.min(resolved.profile.columns, 3);
  const isCompactLayout = resolved.profile.columns <= 6;
  const gap = firstAvailablePx(system, "spacing", ["space-4", "space-3", "space-2"]);
  const radius = radiusValueFor(system, "md") ?? "8px";
  const borderDefault = resolveBorderRecipe(system, "border.default");
  const borderSubtle = resolveBorderRecipe(system, "border.subtle");
  const cardBorder = borderDefault?.css ?? "1px solid #e4e4e7";
  const subtleBorder = borderSubtle?.css ?? borderDefault?.css ?? "1px solid #e4e4e7";

  const commitWidth = () => {
    const text = (widthDraft ?? String(previewWidth)).trim();
    const parsed = Number(text);
    if (text === "" || !Number.isFinite(parsed) || parsed < 200 || parsed > 2560) {
      setWidthError("Enter a preview width from 200 to 2560px.");
      return;
    }
    setWidthError(null);
    setWidthDraft(null);
    setPreviewWidth(Math.round(parsed));
  };

  const columns = resolved.profile.columns;
  const container = grid.containers.find((c) => c.id === grid.defaultContainer) ?? grid.containers[0]!;
  const gridMax = parseGridMaxWidth(container?.value ?? grid.maxWidth);

  return (
    <aside aria-label="Breakpoint preview" className="h-fit rounded-xl border border-border bg-background p-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Active breakpoint is computed from saved thresholds — resize the stage to watch layouts switch.
      </p>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Viewport presets">
        {VIEWPORT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            aria-pressed={previewWidth === preset.width}
            onClick={() => {
              setPreviewWidth(preset.width);
              setWidthDraft(null);
              setWidthError(null);
            }}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${previewWidth === preset.width ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            {preset.label} · {preset.width}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label htmlFor="breakpoint-preview-width" className="sr-only">
          Preview width in pixels
        </label>
        <input
          id="breakpoint-preview-width"
          value={widthDraft ?? String(previewWidth)}
          inputMode="numeric"
          onChange={(event) => {
            setWidthDraft(event.target.value);
            setWidthError(null);
          }}
          onBlur={commitWidth}
          onKeyDown={(event) => {
            if (event.key === "Enter") (event.target as HTMLInputElement).blur();
          }}
          aria-invalid={Boolean(widthError)}
          aria-describedby={widthError ? "breakpoint-preview-width-error" : undefined}
          className={`h-11 w-28 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${widthError ? "border-destructive" : "border-border"}`}
        />
        <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">px</span>
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {widthError && (
          <p id="breakpoint-preview-width-error" role="alert" className="text-xs font-medium text-destructive">
            {widthError}
          </p>
        )}
      </div>

      <div
        role="status"
        aria-label={`Active breakpoint ${active.id} at ${previewWidth} pixels wide`}
        className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-foreground/30 bg-muted/50 px-3 py-2.5"
      >
        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-foreground" />
        <p className="text-xs">
          <span className="font-semibold">Active: {active.id}</span>
          <span className="font-mono text-muted-foreground"> ≥{active.value}</span>
          <span className="text-muted-foreground"> at {previewWidth}px</span>
        </p>
        <p className="w-full text-xs text-muted-foreground">
          Grid: {columns} cols · {resolved.profile.gutter}/{resolved.profile.columnGap}/{resolved.profile.rowGap} · {previewCols}-up cards active here.{" "}
          <a
            href={`/design-system/${system.id}/grid`}
            className="font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open Grid
          </a>
        </p>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/30 p-3">
        <div
          className="mx-auto min-w-0"
          style={{ width: previewWidth, maxWidth: "100%" }}
        >
          <div
            className="overflow-hidden rounded-lg border bg-background"
            style={{
              border: cardBorder,
              borderRadius: radius,
              maxWidth: gridMax ? `${Math.min(gridMax, previewWidth)}px` : undefined,
              marginInline: "auto",
            }}
          >
            <div
              className="flex flex-wrap items-center gap-2 border-b px-3 py-2"
              style={{ borderColor: "inherit", gap: gap ? `${Math.min(gap.px, 24)}px` : undefined }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-foreground font-mono text-[10px] font-bold text-background" aria-hidden="true">
                {isCompactLayout ? "☰" : "▦"}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">Project overview</span>
              <span className="shrink-0 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background">
                New
              </span>
              <span className="shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium">
                Share
              </span>
            </div>
            <div
              className="grid gap-2 p-3"
              style={{
                gridTemplateColumns: `repeat(${Math.min(columns, previewCols)}, minmax(0, 1fr))`,
                gap: gap ? `${Math.min(gap.px, 24)}px` : undefined,
              }}
            >
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="min-w-0 rounded-lg border p-3"
                  style={{ border: subtleBorder, borderRadius: radius }}
                >
                  <p className="truncate text-[13px] font-semibold">Card {index + 1}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                    Supporting copy that reflows as the stage narrows.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="inline-flex min-h-8 items-center rounded-md bg-foreground px-2.5 text-[11px] font-medium text-background">
                      Open
                    </span>
                    <span className="inline-flex min-h-8 items-center rounded-md border px-2.5 text-[11px] font-medium">
                      Details
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t px-3 py-2" style={{ borderColor: "inherit" }}>
              <p className="truncate text-[11px] text-muted-foreground">
                {columns} grid columns · gutter {grid.gutter} · max {grid.maxWidth} · gap {gap ? `${gap.id} ${gap.px}px` : "unconfigured"}
              </p>
            </div>
          </div>

          <div className="mt-3 grid min-w-0" style={{ gap: gap ? `${Math.min(gap.px, 16)}px` : undefined }}>
            <label className="block min-w-0 text-xs font-medium" htmlFor="breakpoint-preview-email">
              Email address
              <input
                id="breakpoint-preview-email"
                placeholder="you@example.com"
                className="mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderRadius: radius }}
              />
            </label>
            <div className="flex min-w-0 flex-wrap" style={{ gap: gap ? `${Math.min(gap.px, 16)}px` : undefined }}>
              <span className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background" style={{ borderRadius: radius }}>
                Save changes
              </span>
              <span className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium" style={{ border: cardBorder, borderRadius: radius }}>
                Cancel
              </span>
            </div>
          </div>
        </div>
      </div>

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Preview token sources
        </summary>
        <ul className="mt-2 space-y-1">
          <li className="font-mono text-[11px]">active ← {active.id} · ≥{active.value}</li>
          <li className="font-mono text-[11px]">grid ← {columns} cols · {grid.gutter} · {grid.maxWidth}</li>
          <li className="font-mono text-[11px]">gap ← {gap ? `${gap.id} · ${gap.px}px` : "unconfigured"}</li>
          <li className="font-mono text-[11px]">radius ← md · {radius}</li>
          {selectedId && <li className="font-mono text-[11px]">selected ← {selectedId}</li>}
        </ul>
      </details>
    </aside>
  )
}

function parseGridMaxWidth(value: string): number | null {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim().toLowerCase());
  if (!match) return null;
  const amount = Number.parseFloat(match[1]!);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
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
