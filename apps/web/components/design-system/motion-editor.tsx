"use client"

import { Check, Copy, Pause, Play, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import {
  resolveToken,
  type DesignSystemConfig,
  type DurationToken,
  type EasingToken,
  type ReducedMotionPolicy,
} from "@/lib/design-system/domain"
import { usePreviewTheme } from "@/components/design-system/use-preview-theme"
import {
  canDeleteMotionToken,
  canDisableMotionToken,
  createDurationToken,
  createEasingToken,
  diffMotion,
  duplicateMotionToken,
  effectiveMotion,
  ensureDurations,
  ensureEasings,
  findMotionReferences,
  hasCustomMotionEdits,
  parseDurationMs,
  parseEasing,
  REDUCED_MOTION_POLICIES,
  removeMotionToken,
  resetMotionTokenToStarter,
  resolveDurationMs,
  resolveEasingCss,
  restoreStarterMotion,
  setMotionEnabled,
  setReducedMotionPolicy,
  updateDurationValue,
  updateEasingValue,
  updateMotionLabel,
  type MotionKind,
} from "@/lib/design-system/motion"

export function MotionEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  return (
    <>
      <PageHeader
        eyebrow="Design System / Foundations"
        title="Motion"
        description="Define a restrained motion language — named durations, easings, and a reduced-motion policy — then test it through user-triggered previews."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <RestoreSection system={system} save={save} />
          <DurationSection system={system} save={save} />
          <EasingSection system={system} save={save} />
          <ReducedMotionSection system={system} save={save} />
        </div>
        <MotionPreview system={system} />
      </div>
    </>
  )
}

function durationsOf(system: DesignSystemConfig): DurationToken[] {
  return ensureDurations(system.foundations.motion?.durations)
}

function easingsOf(system: DesignSystemConfig): EasingToken[] {
  return ensureEasings(system.foundations.motion?.easings)
}

function RestoreSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const customEdits = hasCustomMotionEdits(system)

  if (!confirming) {
    return (
      <section aria-label="Starter defaults" className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Starter defaults</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {customEdits ? "You have custom motion edits." : "Motion matches your starter template."}
            </p>
          </div>
          <button
            onClick={() => setConfirming(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Restore starter defaults
          </button>
        </div>
      </section>
    )
  }

  const fresh = restoreStarterMotion(system)
  const diff = diffMotion(
    {
      durations: durationsOf(system),
      easings: easingsOf(system),
      reducedMotion: system.foundations.motion.reducedMotion,
    },
    {
      durations: fresh.foundations.motion.durations,
      easings: fresh.foundations.motion.easings,
      reducedMotion: fresh.foundations.motion.reducedMotion,
    },
  )
  const total =
    diff.durationsAdded.length + diff.durationsRemoved.length + diff.durationsChanged.length +
    diff.easingsAdded.length + diff.easingsRemoved.length + diff.easingsChanged.length +
    (diff.policyChanged ? 1 : 0)

  return (
    <section aria-label="Starter defaults" className="rounded-xl border border-border bg-background p-5">
      <div role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
        <h3 className="text-sm font-semibold">Restore starter defaults?</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          This replaces durations, easings, and the reduced-motion policy with your starter template values:
        </p>
        {total === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No differences — motion already matches.</p>
        ) : (
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
            {diff.durationsChanged.map((entry) => (
              <li key={`d-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
            ))}
            {diff.durationsAdded.map((token) => (
              <li key={`da-${token.id}`}>+ {token.id} ({token.value})</li>
            ))}
            {diff.durationsRemoved.map((token) => (
              <li key={`dr-${token.id}`}>− {token.id} ({token.value})</li>
            ))}
            {diff.easingsChanged.map((entry) => (
              <li key={`e-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
            ))}
            {diff.easingsAdded.map((token) => (
              <li key={`ea-${token.id}`}>+ {token.id} ({token.value})</li>
            ))}
            {diff.easingsRemoved.map((token) => (
              <li key={`er-${token.id}`}>− {token.id} ({token.value})</li>
            ))}
            {diff.policyChanged && (
              <li>policy: {diff.policyChanged.from} → {diff.policyChanged.to}</li>
            )}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              save(fresh)
              setConfirming(false)
            }}
            className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Restore defaults
          </button>
        </div>
      </div>
    </section>
  )
}

function DurationSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const tokens = durationsOf(system)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <section aria-label="Duration tokens" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Durations ({tokens.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">Named milliseconds values. No single duration fits every interaction.</p>
        </div>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-duration-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add duration"}
        </button>
      </div>
      {showAdd && <AddDurationForm system={system} save={save} onDone={() => setShowAdd(false)} />}
      <ul className="mt-4 space-y-2">
        {tokens.map((token) => (
          <DurationRow key={token.id} system={system} save={save} token={token} />
        ))}
      </ul>
    </section>
  )
}

function DurationRow({
  system,
  save,
  token,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  token: DurationToken
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const ms = parseDurationMs(token.value) ?? 0
  const guard = canDeleteMotionToken(system, "durations", token.id)
  const disableGuard = canDisableMotionToken(system, "durations", token.id)
  const restorable = resetMotionTokenToStarter(system, "durations", token.id) !== null
  const refs = findMotionReferences(system, token.id)
  const disabled = token.enabled === false

  const commit = () => {
    const text = (draft ?? String(ms)).trim()
    const parsed = parseDurationMs(text)
    if (parsed === null) {
      setError("Enter 0–10000 milliseconds, e.g. 200 or 200ms.")
      return
    }
    setError(null)
    setDraft(null)
    save(updateDurationValue(system, token.id, parsed))
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
    if (trimmed !== token.label) save(updateMotionLabel(system, "durations", token.id, trimmed))
  }

  return (
    <li className={`rounded-lg border p-3 transition-colors ${disabled ? "border-border opacity-70" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-40">
          <p className="truncate font-mono text-[13px] font-medium">
            {token.id}
            {disabled && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Disabled</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">{token.description ?? token.label}</p>
        </div>
        <div
          aria-hidden="true"
          className="h-5 shrink-0 rounded bg-foreground/80"
          style={{ width: `${Math.max(2, Math.min(200, ms / 5))}px` }}
        />
        <div className="flex items-center gap-2">
          <label htmlFor={`duration-${token.id}-amount`} className="sr-only">
            {token.id} duration in milliseconds
          </label>
          <input
            id={`duration-${token.id}-amount`}
            value={draft ?? String(ms)}
            inputMode="decimal"
            onChange={(event) => {
              setDraft(event.target.value)
              setError(null)
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `duration-${token.id}-error` : undefined}
            className={`h-11 w-24 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
          <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">ms</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const result = setMotionEnabled(system, "durations", token.id, disabled)
              save(result)
            }}
            disabled={!disabled && !disableGuard.ok}
            aria-pressed={!disabled}
            aria-label={`${disabled ? "Enable" : "Disable"} duration ${token.id}`}
            title={disabled ? "Enable token" : disableGuard.ok ? "Disable token" : disableGuard.reasons[0]}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {disabled ? "Off" : "On"}
          </button>
          <button
            onClick={() => {
              const copy = duplicateMotionToken(system, "durations", token.id)
              if (copy) save(appendToken(system, "durations", copy))
            }}
            aria-label={`Duplicate duration ${token.id}`}
            title="Duplicate token"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Copy className="size-4" aria-hidden="true" />
          </button>
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
                    const next = resetMotionTokenToStarter(system, "durations", token.id)
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
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete duration ${token.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep duration ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeMotionToken(system, "durations", token.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of duration ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep duration ${token.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Understood
            </button>
          )}
        </div>
      </div>
      <div className="mt-2">
        <label htmlFor={`duration-${token.id}-label`} className="sr-only">
          {token.id} visible label
        </label>
        <input
          id={`duration-${token.id}-label`}
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
          aria-invalid={Boolean(labelError)}
          aria-describedby={labelError ? `duration-${token.id}-label-error` : undefined}
          className={`min-h-11 w-full max-w-xs rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
        />
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p id={`duration-${token.id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : labelError ? (
          <p id={`duration-${token.id}-label-error`} role="alert" className="text-xs font-medium text-destructive">
            {labelError}
          </p>
        ) : !guard.ok ? (
          <p className="text-xs text-muted-foreground">
            {guard.reasons[0]} {guard.references.length > 0 && <>({guard.references.map((reference) => reference.pointer).join(", ")})</>}
          </p>
        ) : refs.length > 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            = {token.value} · referenced by {refs.map((reference) => reference.pointer).join(", ")}
          </p>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">= {token.value}</p>
        )}
      </div>
    </li>
  )
}

function appendToken(
  system: DesignSystemConfig,
  kind: MotionKind,
  token: { id: string; label: string; value: string; description?: string },
): DesignSystemConfig {
  const motion = system.foundations.motion
  if (kind === "durations") {
    return {
      ...system,
      foundations: { ...system.foundations, motion: { ...motion, durations: [...motion.durations, { ...token }] } },
    }
  }
  return {
    ...system,
    foundations: { ...system.foundations, motion: { ...motion, easings: [...motion.easings, { ...token }] } },
  }
}

function AddDurationForm({
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
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const ms = Number(amount.trim())
    const result = createDurationToken(
      { id: customId.trim() ? customId : undefined, label: label.trim() ? label : undefined, description: description.trim() ? description : undefined, ms },
      durationsOf(system).map((token) => token.id),
    )
    if (!result.ok) {
      setError(result.error)
      return
    }
    save({
      ...system,
      foundations: {
        ...system.foundations,
        motion: { ...system.foundations.motion, durations: [...durationsOf(system), result.token] },
      },
    })
    onDone()
  }

  return (
    <div id="add-duration-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-duration-form-label" className="text-sm font-medium">
            Token name
          </label>
          <input
            id="add-duration-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Gentle pause"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-duration-form-id" className="text-sm font-medium">
            Token id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-duration-form-id"
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
          <label htmlFor="add-duration-form-amount" className="text-sm font-medium">
            Duration <span className="font-normal text-muted-foreground">(milliseconds)</span>
          </label>
          <input
            id="add-duration-form-amount"
            value={amount}
            inputMode="decimal"
            onChange={(event) => {
              setAmount(event.target.value)
              setError(null)
            }}
            placeholder="0 to 10000"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-duration-form-description" className="text-sm font-medium">
            Use guidance <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-duration-form-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Toast entrances"
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
          Add duration
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

const EASING_PRESETS = [
  { id: "preset-linear", label: "Linear", value: "linear" },
  { id: "preset-ease", label: "Ease", value: "ease" },
  { id: "preset-ease-in", label: "Ease in", value: "ease-in" },
  { id: "preset-ease-out", label: "Ease out", value: "ease-out" },
  { id: "preset-ease-in-out", label: "Ease in-out", value: "ease-in-out" },
  { id: "preset-standard", label: "Standard", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
  { id: "preset-enter", label: "Enter", value: "cubic-bezier(0, 0, 0.2, 1)" },
  { id: "preset-exit", label: "Exit", value: "cubic-bezier(0.4, 0, 1, 1)" },
  { id: "preset-emphasized", label: "Emphasized", value: "cubic-bezier(0.2, 0, 0, 1)" },
  { id: "preset-steps", label: "Steps (4)", value: "steps(4, end)" },
] as const

function EasingSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const tokens = easingsOf(system)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <section aria-label="Easing tokens" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Easings ({tokens.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">Keywords, cubic-bezier curves, or steps(). Everything else is rejected.</p>
        </div>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-easing-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add easing"}
        </button>
      </div>
      {showAdd && <AddEasingForm system={system} save={save} onDone={() => setShowAdd(false)} />}
      <ul className="mt-4 space-y-2">
        {tokens.map((token) => (
          <EasingRow key={token.id} system={system} save={save} token={token} />
        ))}
      </ul>
    </section>
  )
}

function EasingRow({
  system,
  save,
  token,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  token: { id: string; label: string; value: string; description?: string; enabled?: boolean }
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [showPoints, setShowPoints] = useState(false)

  const guard = canDeleteMotionToken(system, "easings", token.id)
  const disableGuard = canDisableMotionToken(system, "easings", token.id)
  const restorable = resetMotionTokenToStarter(system, "easings", token.id) !== null
  const refs = findMotionReferences(system, token.id)
  const disabled = token.enabled === false
  const bezier = /^cubic-bezier\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/.exec(token.value)

  const commit = () => {
    const text = (draft ?? token.value).trim()
    const parsed = parseEasing(text)
    if (parsed === null) {
      setError("Enter linear, ease, ease-in, ease-out, ease-in-out, cubic-bezier(x1, y1, x2, y2), or steps(n).")
      return
    }
    setError(null)
    setDraft(null)
    if (parsed !== token.value) save(updateEasingValue(system, token.id, parsed))
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
    if (trimmed !== token.label) save(updateMotionLabel(system, "easings", token.id, trimmed))
  }

  const applyPoints = (points: [string, string, string, string]) => {
    const candidate = `cubic-bezier(${points.join(", ")})`
    const parsed = parseEasing(candidate)
    if (parsed === null) {
      setError("Control points x1 and x2 must stay within 0–1.")
      return
    }
    setError(null)
    save(updateEasingValue(system, token.id, parsed))
  }

  return (
    <li className={`rounded-lg border p-3 transition-colors ${disabled ? "border-border opacity-70" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-40">
          <p className="truncate font-mono text-[13px] font-medium">
            {token.id}
            {disabled && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Disabled</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">{token.description ?? token.label}</p>
        </div>
        <div
          aria-hidden="true"
          className="h-8 w-16 shrink-0 overflow-hidden rounded bg-muted"
        >
          <div className="h-full w-1/3 rounded-r bg-foreground/70" style={{ transitionTimingFunction: parseEasing(token.value) ?? "linear" }} />
        </div>
        <div className="flex min-w-0 flex-1 basis-64 flex-wrap items-center gap-2">
          <label htmlFor={`easing-${token.id}-value`} className="sr-only">
            {token.id} easing value
          </label>
          <input
            id={`easing-${token.id}-value`}
            value={draft ?? token.value}
            onChange={(event) => {
              setDraft(event.target.value)
              setError(null)
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `easing-${token.id}-error` : undefined}
            className={`h-11 min-w-0 flex-1 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const result = setMotionEnabled(system, "easings", token.id, disabled)
              save(result)
            }}
            disabled={!disabled && !disableGuard.ok}
            aria-pressed={!disabled}
            aria-label={`${disabled ? "Enable" : "Disable"} easing ${token.id}`}
            title={disabled ? "Enable token" : disableGuard.ok ? "Disable token" : disableGuard.reasons[0]}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {disabled ? "Off" : "On"}
          </button>
          <button
            onClick={() => {
              const copy = duplicateMotionToken(system, "easings", token.id)
              if (copy) save(appendToken(system, "easings", copy))
            }}
            aria-label={`Duplicate easing ${token.id}`}
            title="Duplicate token"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Copy className="size-4" aria-hidden="true" />
          </button>
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
                    const next = resetMotionTokenToStarter(system, "easings", token.id)
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
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete easing ${token.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep easing ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeMotionToken(system, "easings", token.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of easing ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep easing ${token.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Understood
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label htmlFor={`easing-${token.id}-preset`} className="text-xs font-medium text-muted-foreground">
          Preset
        </label>
          <select
            id={`easing-${token.id}-preset`}
            value=""
            onChange={(event) => {
              const select = event.target as HTMLSelectElement
              if (select.value) save(updateEasingValue(system, token.id, select.value))
              select.value = ""
            }}
          className="min-h-11 rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Apply a preset…</option>
          {EASING_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.value}>
              {preset.label} · {preset.value}
            </option>
          ))}
        </select>
        {bezier && (
          <BezierPoints
            tokenId={token.id}
            points={[bezier[1]!, bezier[2]!, bezier[3]!, bezier[4]!]}
            onApply={applyPoints}
          />
        )}
      </div>
      <div>
        <label htmlFor={`easing-${token.id}-label`} className="sr-only">
          {token.id} visible label
        </label>
        <input
          id={`easing-${token.id}-label`}
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
          aria-invalid={Boolean(labelError)}
          aria-describedby={labelError ? `easing-${token.id}-label-error` : undefined}
          className={`mt-2 min-h-11 w-full max-w-xs rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
        />
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p id={`easing-${token.id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : labelError ? (
          <p id={`easing-${token.id}-label-error`} role="alert" className="text-xs font-medium text-destructive">
            {labelError}
          </p>
        ) : !guard.ok ? (
          <p className="text-xs text-muted-foreground">
            {guard.reasons[0]} {guard.references.length > 0 && <>({guard.references.map((reference) => reference.pointer).join(", ")})</>}
          </p>
        ) : refs.length > 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            = {token.value} · referenced by {refs.map((reference) => reference.pointer).join(", ")}
          </p>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">= {token.value}</p>
        )}
      </div>
    </li>
  )
}

function BezierPoints({
  tokenId,
  points,
  onApply,
}: {
  tokenId: string
  points: [string, string, string, string]
  onApply: (points: [string, string, string, string]) => void
}) {
  const [values, setValues] = useState<[string, string, string, string]>(points)
  const labels = ["x1", "y1", "x2", "y2"] as const
  return (
    <fieldset className="flex flex-wrap items-end gap-2">
      <legend className="sr-only">Cubic-bezier control points for {tokenId}</legend>
      {labels.map((name, index) => (
        <span key={name} className="inline-flex items-center gap-1">
          <label htmlFor={`bezier-${tokenId}-${name}`} className="font-mono text-[11px] text-muted-foreground">
            {name}
          </label>
          <input
            id={`bezier-${tokenId}-${name}`}
            value={values[index] ?? ""}
            inputMode="decimal"
            onChange={(event) => {
              const next = [...values] as [string, string, string, string]
              next[index] = event.target.value
              setValues(next)
            }}
            onBlur={() => onApply(values)}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            className="h-11 w-20 rounded-lg border border-border bg-background px-2 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </span>
      ))}
    </fieldset>
  )
}

function AddEasingForm({
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
  const [value, setValue] = useState("cubic-bezier(0.4, 0, 0.2, 1)")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const result = createEasingToken(
      {
        id: customId.trim() ? customId : undefined,
        label: label.trim() ? label : undefined,
        description: description.trim() ? description : undefined,
        value,
      },
      easingsOf(system).map((token) => token.id),
    )
    if (!result.ok) {
      setError(result.error)
      return
    }
    save(appendToken(system, "easings", result.token))
    onDone()
  }

  return (
    <div id="add-easing-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-easing-form-label" className="text-sm font-medium">
            Token name
          </label>
          <input
            id="add-easing-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Gentle snap"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-easing-form-id" className="text-sm font-medium">
            Token id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-easing-form-id"
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
          <label htmlFor="add-easing-form-value" className="text-sm font-medium">
            Easing value
          </label>
          <input
            id="add-easing-form-value"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setError(null)
            }}
            spellCheck={false}
            autoComplete="off"
            placeholder="cubic-bezier(0.4, 0, 0.2, 1)"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-easing-form-preset" className="text-sm font-medium">
            Start from preset
          </label>
          <select
            id="add-easing-form-preset"
            value=""
            onChange={(event) => {
              const select = event.target as HTMLSelectElement
              if (select.value) {
                setValue(select.value)
                setError(null)
              }
              select.value = ""
            }}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Choose a preset…</option>
            {EASING_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.value}>
                {preset.label} · {preset.value}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-easing-form-description" className="text-sm font-medium">
            Use guidance <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-easing-form-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Menu entrances"
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
          Add easing
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

function ReducedMotionSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const current = system.foundations.motion.reducedMotion

  return (
    <section aria-label="Reduced-motion policy" className="rounded-xl border border-border bg-background p-5">
      <h2 className="font-medium">Reduced motion</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Stored with the system. No setting here ever forces motion on someone who asked for less.
      </p>
      <div role="radiogroup" aria-label="Reduced-motion policy" className="mt-4 space-y-2">
        {REDUCED_MOTION_POLICIES.map((policy) => {
          const active = current === policy.id
          return (
            <button
              key={policy.id}
              role="radio"
              aria-checked={active}
              onClick={() => {
                const result = setReducedMotionPolicy(system, policy.id)
                if (!result.ok) {
                  setError(result.error)
                  return
                }
                setError(null)
                save(result.system)
              }}
              className={`flex min-h-11 w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-foreground bg-muted/60" : "border-border hover:border-foreground/40 hover:bg-muted/30"}`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${active ? "border-foreground" : "border-border"}`}
              >
                {active && <Check aria-hidden="true" className="size-3" />}
              </span>
              <span>
                <span className="block text-sm font-medium">{policy.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{policy.description}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-2 min-h-5" aria-live="polite">
        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

type PreviewMode = "auto" | "full" | "reduced"

function useOsReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)
    const listener = (event: MediaQueryListEvent): void => setReduced(event.matches)
    query.addEventListener("change", listener)
    return () => query.removeEventListener("change", listener)
  }, [])
  return reduced
}

interface ResolvedPair {
  durationId: string
  ms: number
  easingId: string
  easing: string
}

function pickPair(system: DesignSystemConfig, durationIds: string[], easingIds: string[]): ResolvedPair | null {
  let duration: { id: string; ms: number } | null = null
  for (const id of durationIds) {
    const ms = resolveDurationMs(system, id)
    if (ms !== null) {
      duration = { id, ms }
      break
    }
  }
  let easing: { id: string; css: string } | null = null
  for (const id of easingIds) {
    const css = resolveEasingCss(system, id)
    if (css !== null) {
      easing = { id, css }
      break
    }
  }
  if (!duration || !easing) return null
  return { durationId: duration.id, ms: duration.ms, easingId: easing.id, easing: easing.css }
}

function MotionPreview({ system }: { system: DesignSystemConfig }) {
  const [mode, setMode] = useState<PreviewMode>("auto")
  const osReduced = useOsReducedMotion()
  const policy = effectiveMotion(system, osReduced)
  const reduced = mode === "reduced" || (mode === "auto" && policy.reduce)
  const renderMode: "full" | "fade" | "instant" = !reduced
    ? "full"
    : system.foundations.motion.reducedMotion === "none"
      ? "instant"
      : "fade"

  const [pressed, setPressed] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const { themeOptions, activeThemeId, selectTheme } = usePreviewTheme(system)

  useEffect(() => {
    if (!toastVisible) return
    const timer = window.setTimeout(() => setToastVisible(false), 4000)
    return () => window.clearTimeout(timer)
  }, [toastVisible])

  const textColor = previewColor(system, "text.primary", "#18181b", activeThemeId)
  const mutedColor = previewColor(system, "text.muted", "#71717a", activeThemeId)
  const canvasColor = previewColor(system, "background.canvas", "#ffffff", activeThemeId)
  const surfaceColor = previewColor(system, "background.surface", "#fafafa", activeThemeId)
  const borderColor = previewColor(system, "border.default", "#e4e4e7", activeThemeId)
  const actionBg = previewColor(system, "action.primary.background", "#18181b", activeThemeId)
  const actionFg = previewColor(system, "action.primary.foreground", "#ffffff", activeThemeId)

  const press = pickPair(system, ["fast", "normal", "instant"], ["standard", "linear"])
  const panel = pickPair(system, ["slow", "normal", "fast"], ["standard", "enter"])
  const focus = pickPair(system, ["fast", "normal", "instant"], ["standard", "linear"])
  const toast = pickPair(system, ["normal", "fast", "slow"], ["enter", "standard"])
  const loader = pickPair(system, ["deliberate", "slow", "normal"], ["linear", "standard"])

  const transitionFor = (pair: ResolvedPair | null, properties: string): React.CSSProperties => {
    if (!pair) return {}
    if (renderMode === "instant") return { transition: "none" }
    if (renderMode === "fade") {
      const fast = resolveDurationMs(system, "fast") ?? 120
      return { transitionProperty: "opacity", transitionDuration: `${fast}ms`, transitionTimingFunction: "linear" }
    }
    return { transitionProperty: properties, transitionDuration: `${pair.ms}ms`, transitionTimingFunction: pair.easing }
  }

  const caption = (pair: ResolvedPair | null): string =>
    pair ? `${pair.durationId} · ${pair.ms}ms / ${pair.easingId}` : "unconfigured tokens"

  return (
    <aside aria-label="Motion preview" className="h-fit rounded-xl border border-border bg-background p-5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">MOTION PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        User-triggered examples using saved tokens. Nothing plays on its own.
      </p>

      <div className="mt-3 flex gap-1.5 rounded-lg bg-muted/50 p-1.5" role="group" aria-label="Preview motion mode">
        {(["auto", "full", "reduced"] as const).map((option) => (
          <button
            key={option}
            aria-pressed={mode === option}
            onClick={() => setMode(option)}
            className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mode === option ? "bg-background shadow-sm ring-1 ring-border" : "hover:bg-background/60"}`}
          >
            {option === "auto" ? "Auto (OS)" : option === "full" ? "Full" : "Reduced"}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-5 text-xs text-muted-foreground" role="status">
        {reduced ? `Reduced motion active — ${mode === "reduced" ? "preview override" : policy.reason}.` : `Full motion — ${mode === "full" ? "preview override" : policy.reason}.`}
        {mode === "auto" && ` OS reports ${osReduced ? "reduced" : "full"} motion.`}
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

      <div className="mt-3 space-y-4 rounded-lg border border-border p-4" style={{ background: canvasColor, color: textColor }}>
        <section aria-label="Button press preview">
          <p className="text-xs font-semibold tracking-wider" style={{ color: mutedColor }}>BUTTON PRESS · {caption(press)}</p>
          <button
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            onKeyDown={(event) => {
              if ((event.key === " " || event.key === "Enter") && !event.repeat) setPressed(true)
            }}
            onKeyUp={() => setPressed(false)}
            onBlur={() => setPressed(false)}
            className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2"
            style={{
              background: pressed ? actionBg : "transparent",
              color: pressed ? actionFg : textColor,
              border: `1px solid ${borderColor}`,
              ["--tw-ring-color" as string]: textColor,
              transform: pressed && renderMode === "full" ? "scale(0.97)" : "none",
              ...transitionFor(press, "transform, background-color, color"),
            }}
          >
            {pressed ? <Check aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
            {pressed ? "Pressed" : "Press and hold"}
          </button>
        </section>

        <section aria-label="Panel open preview">
          <p className="text-xs font-semibold tracking-wider" style={{ color: mutedColor }}>PANEL · {caption(panel)}</p>
          <button
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((open) => !open)}
            className="mt-2 inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2"
            style={{ borderColor, ["--tw-ring-color" as string]: textColor }}
          >
            {panelOpen ? "Close panel" : "Open panel"}
          </button>
          <div
            className="overflow-hidden rounded-lg border"
            style={{
              borderColor,
              background: surfaceColor,
              maxHeight: panelOpen ? 120 : 0,
              opacity: panelOpen ? 1 : 0,
              transform: panelOpen || renderMode !== "full" ? "none" : "translateY(-6px)",
              marginTop: panelOpen ? 8 : 0,
              ...transitionFor(panel, renderMode === "full" ? "opacity, transform, max-height, margin-top" : "opacity"),
            }}
          >
            <p className="p-3 text-xs" style={{ color: mutedColor }}>
              Panel content ({panelOpen ? "open" : "closed"}). Reduced motion drops the slide.
            </p>
          </div>
        </section>

        <section aria-label="Input focus preview">
          <p className="text-xs font-semibold tracking-wider" style={{ color: mutedColor }}>INPUT FOCUS · {caption(focus)}</p>
          <label className="mt-2 block text-xs font-medium" htmlFor="motion-preview-email">
            Email address
          </label>
          <input
            id="motion-preview-email"
            placeholder="you@example.com"
            className="mt-1.5 block min-h-11 w-full rounded-lg bg-transparent px-3 text-sm outline-none focus-visible:ring-2"
            style={{
              border: `1px solid ${borderColor}`,
              color: textColor,
              ["--tw-ring-color" as string]: textColor,
              ...transitionFor(focus, "border-color, box-shadow"),
            }}
          />
        </section>

        <section aria-label="Toast preview">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wider" style={{ color: mutedColor }}>TOAST · {caption(toast)}</p>
            <button
              onClick={() => setToastVisible(true)}
              className="inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2"
              style={{ borderColor, ["--tw-ring-color" as string]: textColor }}
            >
              Show toast
            </button>
          </div>
          <div
            role="status"
            className="mt-2 rounded-lg border p-3 text-xs"
            style={{
              borderColor,
              background: surfaceColor,
              color: textColor,
              opacity: toastVisible ? 1 : 0,
              transform: toastVisible || renderMode !== "full" ? "none" : "translateY(6px)",
              visibility: toastVisible ? "visible" : "hidden",
              ...transitionFor(toast, renderMode === "full" ? "opacity, transform" : "opacity"),
            }}
          >
            <span className="font-medium">Saved.</span> Your changes are safe.
          </div>
        </section>

        <section aria-label="Progress preview">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wider" style={{ color: mutedColor }}>PROGRESS · {caption(loader)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setProgress(0)
                  window.setTimeout(() => setProgress(100), 60)
                }}
                className="inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2"
                style={{ borderColor, ["--tw-ring-color" as string]: textColor }}
              >
                Start
              </button>
              <button
                onClick={() => setProgress(0)}
                className="inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2"
                style={{ borderColor, ["--tw-ring-color" as string]: textColor }}
              >
                Reset
              </button>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: borderColor }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Example progress">
            <div
              className="h-full origin-left rounded-full"
              style={{
                width: "100%",
                background: actionBg,
                transform: `scaleX(${progress / 100})`,
                ...transitionFor(loader, "transform"),
              }}
            />
          </div>
          <p className="mt-1 font-mono text-[11px]" style={{ color: mutedColor }}>{progress}% complete</p>
        </section>

        <section aria-label="Loading preview">
          <p className="text-xs font-semibold tracking-wider" style={{ color: mutedColor }}>LOADING · {caption(loader)}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              aria-pressed={loading}
              onClick={() => setLoading((value) => !value)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2"
              style={{ borderColor, ["--tw-ring-color" as string]: textColor }}
            >
              {loading ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
              {loading ? "Stop loader" : "Start loader"}
            </button>
            {loading && (
              renderMode === "full" && loader ? (
                <span
                  aria-hidden="true"
                  className="inline-block size-5 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: `${borderColor} ${borderColor} ${actionBg} transparent`, animationDuration: `${loader.ms}ms`, animationTimingFunction: loader.easing }}
                />
              ) : (
                <span className="text-xs" style={{ color: mutedColor }}>Loading… (animation paused)</span>
              )
            )}
          </div>
          <p className="mt-1 text-[11px]" style={{ color: mutedColor }}>
            {loading ? (renderMode === "full" ? "Spinning — clearly labeled." : "Static under reduced motion.") : "Idle."}
          </p>
        </section>
      </div>

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Preview token sources
        </summary>
        <ul className="mt-2 space-y-1">
          {(
            [
              ["Button", press],
              ["Panel", panel],
              ["Focus", focus],
              ["Toast", toast],
              ["Progress", loader],
              ["Loader", loader],
            ] as Array<[string, ResolvedPair | null]>
          ).map(([label, pair]) => (
            <li key={label} className="font-mono text-[11px]">
              {label} ← {pair ? `${pair.durationId} · ${pair.ms}ms / ${pair.easingId}` : "unconfigured"}
            </li>
          ))}
        </ul>
      </details>
    </aside>
  )
}

function previewColor(system: DesignSystemConfig, reference: string, fallback: string, themeId?: string): string {
  try {
    const resolved = resolveToken(system, reference, themeId)
    return resolved.status === "resolved" ? resolved.value : fallback
  } catch {
    return fallback
  }
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
