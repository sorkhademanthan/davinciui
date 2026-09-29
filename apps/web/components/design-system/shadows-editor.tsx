"use client"

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useMemo, useState, type CSSProperties, type ReactNode } from "react"
import {
  resolveToken,
  type DesignSystemConfig,
  type ShadowLayer,
  type ShadowToken,
} from "@/lib/design-system/domain"
import { resolveBorderRecipe } from "@/lib/design-system/borders"
import { radiusValueFor } from "@/lib/design-system/radius"
import {
  addShadowLayer,
  applyShadowPreset,
  canDeleteShadowRecipe,
  canDisableShadowRecipe,
  createShadowRecipe,
  diffShadowTokens,
  duplicateShadowRecipe,
  hasCustomShadowEdits,
  moveShadowLayer,
  removeShadowLayer,
  removeShadowRecipe,
  resetShadowToStarter,
  resolveShadow,
  restoreStarterShadows,
  setShadowEnabled,
  SHADOW_PRESETS,
  shadowIssues,
  updateShadowLayer,
  updateShadowRecipe,
  type ShadowPreset,
} from "@/lib/design-system/shadows"

export function ShadowsEditor({
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
        title="Shadows"
        description="Define a coherent elevation language from named, layered recipes, then preview it on realistic surfaces."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <PresetSection system={system} save={save} />
          <TokenSection system={system} save={save} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <ShadowPreview system={system} selectedId={selectedId} />
      </div>
    </>
  )
}

function tokensOf(system: DesignSystemConfig): ShadowToken[] {
  return [...(system.foundations.shadows?.tokens ?? [])]
}

function PresetSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [pendingPreset, setPendingPreset] = useState<ShadowPreset | "starter" | null>(null)
  const customEdits = hasCustomShadowEdits(system)

  const requestPreset = (preset: ShadowPreset | "starter") => {
    if (customEdits) {
      setPendingPreset(preset)
      return
    }
    applyPresetChoice(preset)
  }

  const applyPresetChoice = (preset: ShadowPreset | "starter") => {
    if (preset === "starter") {
      save(restoreStarterShadows(system))
    } else {
      save(applyShadowPreset(system, preset))
    }
    setPendingPreset(null)
  }

  return (
    <section aria-label="Elevation presets" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Elevation presets</h2>
        <p className="text-xs text-muted-foreground">
          <span className={`font-medium ${customEdits ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {customEdits ? "Custom elevation" : "Starter elevation"}
          </span>
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Optional starting points — every recipe stays fully editable afterwards.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {SHADOW_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => requestPreset(preset)}
            className="min-h-11 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block text-sm font-medium">{preset.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{preset.description}</span>
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
  preset: ShadowPreset | "starter"
  onConfirm: () => void
  onCancel: () => void
}) {
  const next = useMemo(() => {
    if (preset === "starter") {
      return restoreStarterShadows(system).foundations.shadows.tokens;
    }
    return preset.tokens;
  }, [system, preset]);
  const diff = diffShadowTokens(tokensOf(system), next);

  return (
    <div role="alert" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <h3 className="text-sm font-semibold">
        {preset === "starter" ? "Restore starter defaults?" : `Apply “${preset.label}”?`}
      </h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        You have custom elevation edits. Applying this preset overwrites them:
      </p>
      <ShadowDiffSummary
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

function ShadowDiffSummary({
  added,
  removed,
  changed,
}: {
  added: ShadowToken[]
  removed: ShadowToken[]
  changed: Array<{ id: string; from: string; to: string }>
}) {
  const total = added.length + removed.length + changed.length;
  if (total === 0) return <p className="mt-2 text-xs text-muted-foreground">No differences — recipes already match.</p>;
  return (
    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
      {changed.map((entry) => (
        <li key={`c-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
      ))}
      {added.map((token) => (
        <li key={`a-${token.id}`}>+ {token.id} ({token.label})</li>
      ))}
      {removed.map((token) => (
        <li key={`r-${token.id}`}>− {token.id} ({token.label})</li>
      ))}
    </ul>
  );
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
  const tokens = tokensOf(system)
  const [showAdd, setShowAdd] = useState(false)
  const issues = shadowIssues(system)

  return (
    <section aria-label="Shadow recipes" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Recipes ({tokens.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">Named single- or multi-layer elevations. Ids are stable references.</p>
        </div>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-shadow-recipe-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add recipe"}
        </button>
      </div>
      {showAdd && (
        <AddRecipeForm
          system={system}
          save={save}
          onDone={() => setShowAdd(false)}
        />
      )}
      <ul className="mt-4 space-y-2">
        {tokens.map((token) => (
          <RecipeCard
            key={token.id}
            system={system}
            save={save}
            token={token}
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

function swatchStyle(color: string | null): CSSProperties {
  return { background: color ?? "transparent" }
}

function RecipeCard({
  system,
  save,
  token,
  selected,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  token: ShadowToken
  selected: boolean
  onSelect: (id: string | null) => void
}) {
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const resolved = resolveShadow(system, token.id)
  const guard = canDeleteShadowRecipe(system, token.id)
  const disableGuard = canDisableShadowRecipe(system, token.id)
  const restorable = resetShadowToStarter(system, token.id) !== null
  const layers = token.layers ?? []
  const disabled = token.enabled === false

  const commitLabel = () => {
    const trimmed = (labelDraft ?? token.label).trim()
    if (!trimmed) {
      setLabelError("Label cannot be empty — keeping the previous label.")
      setLabelDraft(null)
      return
    }
    setLabelError(null)
    setLabelDraft(null)
    if (trimmed !== token.label) {
      const result = updateShadowRecipe(system, token.id, { label: trimmed })
      if (!result.ok) {
        setLabelError(result.error)
        return
      }
      save(result.system)
    }
  }

  const toggleEnabled = () => {
    if (disabled) {
      const result = setShadowEnabled(system, token.id, true)
      if (result.ok) save(result.system)
      return
    }
    if (!disableGuard.ok) return
    const result = setShadowEnabled(system, token.id, false)
    if (result.ok) save(result.system)
  }

  return (
    <li className={`rounded-lg border p-3 transition-colors ${selected ? "border-foreground bg-muted/60" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => {
            onSelect(selected ? null : token.id)
            setExpanded(true)
          }}
          aria-expanded={expanded}
          aria-label={`Edit recipe ${token.id}`}
          className="min-w-0 flex-1 basis-40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md min-h-11"
        >
          <span className="block truncate font-mono text-[13px] font-medium">
            {token.id}
            {disabled && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Disabled</span>}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {token.label} · {layers.length === 0 ? "no layers" : `${layers.length} layer${layers.length === 1 ? "" : "s"}`}
          </span>
        </button>
        <div
          aria-hidden="true"
          className="h-10 w-16 shrink-0 rounded-md border border-foreground/20 bg-muted"
          style={{ boxShadow: resolved?.css ?? "none" }}
          title={resolved ? `${token.id}: ${resolved.css}` : `${token.id} unresolved`}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEnabled}
            aria-pressed={!disabled}
            aria-label={`${disabled ? "Enable" : "Disable"} recipe ${token.id}`}
            title={disabled ? "Enable recipe" : "Disable recipe"}
            disabled={!disabled && !disableGuard.ok}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {disabled ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
          <button
            onClick={() => {
              const dupe = duplicateShadowRecipe(system, token.id)
              if (!dupe) return
              save({
                ...system,
                foundations: {
                  ...system.foundations,
                  shadows: { tokens: [...tokensOf(system), dupe] },
                },
              })
            }}
            aria-label={`Duplicate recipe ${token.id}`}
            title="Duplicate recipe"
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
                  aria-label={`Keep custom values for ${token.id}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    const next = resetShadowToStarter(system, token.id)
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
              aria-label={`Delete recipe ${token.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep recipe ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeShadowRecipe(system, token.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of recipe ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep recipe ${token.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Understood
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-border pt-3">
          <div>
            <label htmlFor={`recipe-${token.id}-label`} className="text-xs font-medium">
              Visible label
            </label>
            <input
              id={`recipe-${token.id}-label`}
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
              aria-describedby={labelError ? `recipe-${token.id}-label-error` : undefined}
              className={`mt-1.5 min-h-11 w-full max-w-xs rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
            />
            <div className="mt-1 min-h-5" aria-live="polite">
              {labelError ? (
                <p id={`recipe-${token.id}-label-error`} role="alert" className="text-xs font-medium text-destructive">
                  {labelError}
                </p>
              ) : (
                <p className="font-mono text-[11px] text-muted-foreground">id {token.id} never changes</p>
              )}
            </div>
          </div>

          <div className="mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-semibold tracking-wider text-muted-foreground">
                LAYERS ({layers.length})
              </h4>
              <button
                onClick={() => {
                  const next = [...layers, { x: 0, y: 4, blur: 8, spread: 0, color: "neutral.950", opacity: 0.1, inset: false }]
                  const result = updateShadowRecipe(system, token.id, { layers: next })
                  if (result.ok) save(result.system)
                }}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add layer
              </button>
            </div>
            {layers.length === 0 ? (
              <p className="mt-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                No layers — renders as <span className="font-mono">none</span>. Add a layer to build elevation.
              </p>
            ) : (
              <ol className="mt-2 space-y-2">
                {layers.map((layer, index) => (
                  <LayerEditor
                    key={`${token.id}-layer-${index}`}
                    system={system}
                    token={token}
                    layer={layer}
                    index={index}
                    total={layers.length}
                    save={save}
                  />
                ))}
              </ol>
            )}
          </div>

          {token.description && (
            <p className="mt-2 text-xs text-muted-foreground">{token.description}</p>
          )}
        </div>
      )}

      <div className="mt-1 min-h-5" aria-live="polite">
        {!guard.ok ? (
          <p className="text-xs text-muted-foreground">
            {guard.reasons[0]} {guard.references.length > 0 && <>({guard.references.map((reference) => reference.pointer).join(", ")})</>}
          </p>
        ) : !disabled && resolved ? (
          <p className="font-mono text-[11px] text-muted-foreground">= {resolved.css.length > 90 ? `${resolved.css.slice(0, 90)}…` : resolved.css}</p>
        ) : disabled ? (
          <p className="text-xs text-muted-foreground">Disabled — hidden from pickers and previews, data preserved.</p>
        ) : (
          <p className="text-xs text-muted-foreground">= unresolved — check layer colors</p>
        )}
      </div>
    </li>
  )
}

const SHADOW_COLOR_SUGGESTIONS = ["neutral.950", "neutral.900", "neutral.500", "focus.ring"] as const

function LayerEditor({
  system,
  token,
  layer,
  index,
  total,
  save,
}: {
  system: DesignSystemConfig
  token: ShadowToken
  layer: ShadowLayer
  index: number
  total: number
  save: (next: DesignSystemConfig) => void
}) {
  const [error, setError] = useState<string | null>(null)

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[11px] font-medium text-muted-foreground">Layer {index + 1}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = moveShadowLayerDirect(system, token.id, index, -1)
              if (next) save(next)
            }}
            disabled={index === 0}
            aria-label={`Move layer ${index + 1} up in ${token.id}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              const next = moveShadowLayerDirect(system, token.id, index, 1)
              if (next) save(next)
            }}
            disabled={index === total - 1}
            aria-label={`Move layer ${index + 1} down in ${token.id}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowDown className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              const next = removeShadowLayerDirect(system, token.id, index)
              if (next) save(next)
            }}
            aria-label={`Delete layer ${index + 1} from ${token.id}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <LayerFields
        system={system}
        tokenId={token.id}
        index={index}
        layer={layer}
        save={save}
        error={error}
        setError={setError}
      />
    </li>
  )
}

function updateShadowLayerDirect(
  system: DesignSystemConfig,
  tokenId: string,
  index: number,
  merged: ShadowLayer,
): { ok: true; system: DesignSystemConfig } | { ok: false; error: string } {
  const token = (system.foundations.shadows?.tokens ?? []).find((entry) => entry.id === tokenId)
  if (!token) return { ok: false, error: "That recipe no longer exists." }
  const patched = updateShadowLayer(token, index, merged)
  if (!patched) return { ok: false, error: "Enter finite numbers within guardrails (offsets ±200px, blur 0–200px, spread ±100px, opacity 0–1)." }
  const result = updateShadowRecipe(system, tokenId, { layers: patched.layers ?? [] })
  if (!result.ok) return result
  return { ok: true, system: result.system }
}

function moveShadowLayerDirect(
  system: DesignSystemConfig,
  tokenId: string,
  index: number,
  direction: -1 | 1,
): DesignSystemConfig | null {
  const token = (system.foundations.shadows?.tokens ?? []).find((entry) => entry.id === tokenId)
  if (!token) return null
  const moved = moveShadowLayer(token, index, direction)
  if (!moved) return null
  const result = updateShadowRecipe(system, tokenId, { layers: moved.layers ?? [] })
  return result.ok ? result.system : null
}

function removeShadowLayerDirect(system: DesignSystemConfig, tokenId: string, index: number): DesignSystemConfig | null {
  const token = (system.foundations.shadows?.tokens ?? []).find((entry) => entry.id === tokenId)
  if (!token) return null
  const pruned = removeShadowLayer(token, index)
  if (!pruned) return null
  const result = updateShadowRecipe(system, tokenId, { layers: pruned.layers ?? [] })
  return result.ok ? result.system : null
}

function LayerFields({
  system,
  tokenId,
  index,
  layer,
  save,
  error,
  setError,
}: {
  system: DesignSystemConfig
  tokenId: string
  index: number
  layer: ShadowLayer
  save: (next: DesignSystemConfig) => void
  error: string | null
  setError: (message: string | null) => void
}) {
  const [draft, setDraft] = useState<Record<string, string>>({})
  const prefix = `shadow-${tokenId}-layer-${index}`

  const commit = (field: "x" | "y" | "blur" | "spread" | "opacity" | "color" | "inset", raw: string | boolean) => {
    const value = field === "color" ? String(raw).trim() : field === "inset" ? raw === true || raw === "true" : Number(raw)
    const merged = { ...layer, [field]: value }
    const patched = updateShadowLayerDirect(system, tokenId, index, merged as ShadowLayer)
    if (!patched.ok) {
      setError(patched.error)
      return
    }
    setError(null)
    setDraft((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    save(patched.system)
  }

  const resolvedColor = resolveToken(system, layer.color)
  const colorHex = resolvedColor.status === "resolved" ? resolvedColor.value : null

  const numberField = (
    field: "x" | "y" | "blur" | "spread" | "opacity",
    label: string,
    hint: string,
    step: string,
  ) => (
    <div>
      <label htmlFor={`${prefix}-${field}`} className="text-xs font-medium">
        {label} <span className="font-normal text-muted-foreground">({field === "opacity" ? "0–1" : "px"})</span>
      </label>
      <input
        id={`${prefix}-${field}`}
        value={draft[field] ?? String(layer[field])}
        inputMode="decimal"
        step={step}
        onChange={(event) => {
          setDraft((current) => ({ ...current, [field]: event.target.value }))
          setError(null)
        }}
        onBlur={(event) => commit(field, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") (event.target as HTMLInputElement).blur()
        }}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <p className="mt-1 min-h-4 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )

  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {numberField("x", "X offset", "−200 to 200.", "1")}
        {numberField("y", "Y offset", "−200 to 200.", "1")}
        {numberField("blur", "Blur", "0 to 200.", "1")}
        {numberField("spread", "Spread", "−100 to 100.", "1")}
        {numberField("opacity", "Opacity", "0 transparent to 1 solid.", "0.05")}
        <div>
          <span id={`${prefix}-inset-label`} className="text-xs font-medium">
            Position
          </span>
          <div className="mt-1.5 flex gap-2" role="group" aria-labelledby={`${prefix}-inset-label`}>
            {([
              { value: false, label: "Outset" },
              { value: true, label: "Inset" },
            ] as const).map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={layer.inset === option.value}
                onClick={() => commit("inset", option.value)}
                className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${layer.inset === option.value ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-1 min-h-4 text-[11px] text-muted-foreground">Inside or outside the surface.</p>
        </div>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label htmlFor={`${prefix}-color`} className="text-xs font-medium">
            Color reference
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="block size-11 shrink-0 rounded-lg border border-black/10 dark:border-white/10"
              style={swatchStyle(colorHex)}
              title={colorHex ?? "unresolved color"}
            />
            <input
              id={`${prefix}-color`}
              value={draft.color ?? layer.color}
              list={`${prefix}-color-list`}
              onChange={(event) => {
                setDraft((current) => ({ ...current, color: event.target.value }))
                setError(null)
              }}
              onBlur={(event) => commit("color", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") (event.target as HTMLInputElement).blur()
              }}
              spellCheck={false}
              autoComplete="off"
              maxLength={80}
              placeholder="neutral.950"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${prefix}-color-error` : `${prefix}-color-hint`}
              className={`min-h-11 w-full rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
            />
            <datalist id={`${prefix}-color-list`}>
              {SHADOW_COLOR_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
              {system.foundations.colors?.palettes.flatMap((palette) =>
                Object.keys(palette.shades ?? {}).map((shade) => (
                  <option key={`${palette.id}.${shade}`} value={`${palette.id}.${shade}`} />
                )),
              )}
              {(system.semanticTokens ?? []).map((token) => (
                <option key={token.id} value={token.id} />
              ))}
            </datalist>
          </div>
          <p id={`${prefix}-color-hint`} className="mt-1 min-h-4 text-[11px] text-muted-foreground">
            Palette shade, semantic alias, or six-digit hex. Resolves to{" "}
            <span className="font-mono">{colorHex ?? "unresolved"}</span>.
          </p>
        </div>
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

function AddRecipeForm({
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
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const result = createShadowRecipe(system, {
      id: customId.trim() ? customId : undefined,
      label,
      layers: [{ x: 0, y: 4, blur: 8, spread: 0, color: "neutral.950", opacity: 0.1, inset: false }],
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    save({
      ...system,
      foundations: {
        ...system.foundations,
        shadows: { tokens: [...tokensOf(system), result.token] },
      },
    })
    onDone()
  }

  return (
    <div id="add-shadow-recipe-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-shadow-recipe-form-label" className="text-sm font-medium">
            Recipe name
          </label>
          <input
            id="add-shadow-recipe-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Gentle lift"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-shadow-recipe-form-id" className="text-sm font-medium">
            Recipe id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-shadow-recipe-form-id"
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
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Starts with one layer at <span className="font-mono">0 4 8 0 neutral.950 @ 0.1</span> — tune it after adding.
      </p>
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
          Add recipe
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

function ShadowPreview({ system, selectedId }: { system: DesignSystemConfig; selectedId: string | null }) {
  const surfaceFor = (ids: string[]): { id: string; css: string } | null => {
    for (const id of ids) {
      const resolved = resolveShadow(system, id)
      if (resolved) return { id, css: resolved.css }
    }
    return null
  }

  const ink = (() => {
    const resolved = resolveToken(system, "text.primary")
    return resolved.status === "resolved" ? resolved.value : "#18181b"
  })()
  const muted = (() => {
    const resolved = resolveToken(system, "text.muted")
    return resolved.status === "resolved" ? resolved.value : "#71717a"
  })()
  const canvas = (() => {
    const resolved = resolveToken(system, "background.canvas")
    return resolved.status === "resolved" ? resolved.value : "#ffffff"
  })()
  const cardBg = (() => {
    const resolved = resolveToken(system, "background.surface")
    if (resolved.status === "resolved") return resolved.value
    const fallback = resolveToken(system, "background.canvas")
    return fallback.status === "resolved" ? fallback.value : "#fafafa"
  })()
  const line = (() => {
    const resolved = resolveToken(system, "border.default")
    return resolved.status === "resolved" ? resolved.value : "#e4e4e7"
  })()
  const actionBg = (() => {
    const resolved = resolveToken(system, "action.primary.background")
    return resolved.status === "resolved" ? resolved.value : "#18181b"
  })()
  const actionFg = (() => {
    const resolved = resolveToken(system, "action.primary.foreground")
    return resolved.status === "resolved" ? resolved.value : "#ffffff"
  })()
  const radiusFor = (id: string): string => {
    const scale = system.foundations.radius?.scale
    if (Array.isArray(scale)) {
      const token = scale.find((entry) => entry.id === id)
      if (token && typeof token.value === "string") return token.value
    }
    return "8px"
  }
  const borderFor = (id: string): string => {
    const resolved = resolveBorderRecipe(system, id)
    return resolved ? resolved.css : `1px solid ${line}`
  }

  const flat = surfaceFor(["shadow.none"])
  const card = surfaceFor(["shadow.md", "shadow.sm", "shadow.lg"])
  const elevated = surfaceFor(["shadow.lg", "shadow.xl", "shadow.md"])
  const popover = surfaceFor(["shadow.sm", "shadow.md"])
  const dialog = surfaceFor(["shadow.xl", "shadow.lg", "shadow.md"])
  const floating = surfaceFor(["shadow.lg", "shadow.xl", "shadow.md"])
  const stack = [
    surfaceFor(["shadow.sm"]),
    surfaceFor(["shadow.md"]),
    surfaceFor(["shadow.lg", "shadow.xl"]),
  ]

  const mark = (usedId: string | null) =>
    selectedId && usedId === selectedId
      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
      : ""

  const missing: string[] = []
  const slots: Array<[string, { id: string; css: string } | null]> = [
    ["Flat surface", flat],
    ["Card", card],
    ["Elevated card", elevated],
    ["Popover", popover],
    ["Dialog", dialog],
    ["Floating action", floating],
  ]
  for (const [label, slot] of slots) {
    if (!slot) missing.push(label)
  }

  return (
    <aside aria-label="Elevation preview" className="h-fit rounded-xl border border-border bg-background p-5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Real recipes on realistic surfaces — radius and borders come from saved tokens.
        {selectedId ? (
          <> Highlighting <span className="font-mono font-medium text-foreground">{selectedId}</span>.</>
        ) : (
          <> Select a recipe to highlight where it applies.</>
        )}
      </p>

      <div className="mt-4 space-y-4" style={{ background: canvas, color: ink }}>
        <section aria-label="Flat surface preview" className={`rounded-lg ${mark(flat?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            FLAT · {flat ? flat.id : "unconfigured"}
          </p>
          <div
            className="mt-2 border p-4"
            style={{ boxShadow: flat?.css ?? "none", border: `1px solid ${line}`, borderRadius: radiusFor("md"), background: cardBg }}
            title={flat ? `${flat.id} · ${flat.css}` : "unconfigured"}
          >
            <p className="text-sm font-medium">Flat surface</p>
            <p className="mt-1 text-xs opacity-70">No elevation — borders carry the boundary.</p>
          </div>
        </section>

        <section aria-label="Card preview" className={`rounded-lg ${mark(card?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            CARD · {card ? card.id : "unconfigured"}
          </p>
          <div
            className="mt-2 border p-4"
            style={{ boxShadow: card?.css ?? "none", border: `1px solid ${line}`, borderRadius: radiusFor("lg"), background: cardBg }}
            title={card ? `${card.id} · ${card.css}` : "unconfigured"}
          >
            <p className="text-sm font-medium">Card title</p>
            <p className="mt-1 text-xs opacity-70">Default card elevation.</p>
          </div>
        </section>

        <section aria-label="Elevated card preview" className={`rounded-lg ${mark(elevated?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            ELEVATED CARD · {elevated ? elevated.id : "unconfigured"}
          </p>
          <div
            className="mt-2 border p-4"
            style={{ boxShadow: elevated?.css ?? "none", border: `1px solid ${line}`, borderRadius: radiusFor("lg"), background: cardBg }}
            title={elevated ? `${elevated.id} · ${elevated.css}` : "unconfigured"}
          >
            <p className="text-sm font-medium">Hover or featured card</p>
            <p className="mt-1 text-xs opacity-70">One step above the base card.</p>
          </div>
        </section>

        <section aria-label="Popover preview" className={`rounded-lg ${mark(popover?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            POPOVER · {popover ? popover.id : "unconfigured"}
          </p>
          <div
            className="mt-2 border p-3"
            style={{ boxShadow: popover?.css ?? "none", border: `1px solid ${line}`, borderRadius: radiusFor("md"), background: cardBg, maxWidth: "220px" }}
            title={popover ? `${popover.id} · ${popover.css}` : "unconfigured"}
          >
            <p className="text-xs font-medium">Menu item one</p>
            <p className="mt-0.5 text-xs opacity-70">Menu item two</p>
          </div>
        </section>

        <section aria-label="Dialog preview" className={`rounded-lg ${mark(dialog?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            DIALOG · {dialog ? dialog.id : "unconfigured"}
          </p>
          <div
            className="mt-2 border p-4"
            style={{ boxShadow: dialog?.css ?? "none", border: borderFor("border.strong"), borderRadius: radiusFor("xl"), background: cardBg }}
            title={dialog ? `${dialog.id} · ${dialog.css}` : "unconfigured"}
          >
            <p className="text-sm font-medium">Confirm deletion</p>
            <p className="mt-1 text-xs opacity-70">Modal-like surface with strong borders.</p>
          </div>
        </section>

        <section aria-label="Floating action preview" className={`rounded-lg ${mark(floating?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            FLOATING ACTION · {floating ? floating.id : "unconfigured"}
          </p>
          <div className="mt-2">
            <button
              tabIndex={-1}
              aria-label="Floating action example"
              className="grid size-12 place-items-center text-lg font-semibold text-white"
              style={{ boxShadow: floating?.css ?? "none", background: actionBg, color: actionFg, borderRadius: "9999px" }}
              title={floating ? `${floating.id} · ${floating.css}` : "unconfigured"}
            >
              +
            </button>
          </div>
        </section>

        <section aria-label="Layered stack preview">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">LAYERED STACK</p>
          <div className="relative mt-2 h-36">
            {stack.map((slot, index) => (
              <div
                key={slot?.id ?? `empty-${index}`}
                title={slot ? `${slot.id} · ${slot.css}` : "unconfigured"}
                className="absolute rounded-lg border px-3 py-2 text-xs font-medium"
                style={{
                  boxShadow: slot?.css ?? "none",
                  border: `1px solid ${line}`,
                  background: cardBg,
                  color: muted,
                  left: `${index * 18}px`,
                  right: `${(2 - index) * 18}px`,
                  top: `${index * 22}px`,
                  height: "64px",
                }}
              >
                {slot ? slot.id : "unconfigured"}
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Dark surface preview" className="rounded-lg">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">DARK SURFACE CHECK</p>
          <div
            className="mt-2 rounded-lg p-4"
            style={{ background: "#101014", border: "1px solid #2a2a31" }}
          >
            <div
              className="rounded-lg p-3 text-sm font-medium"
              style={{
                boxShadow: elevated?.css ?? card?.css ?? "none",
                background: "#17171c",
                color: "#f4f4f5",
                border: "1px solid #2a2a31",
                borderRadius: radiusFor("lg"),
              }}
              title={elevated ? `${elevated.id} · ${elevated.css}` : "unconfigured"}
            >
              Elevated on dark — shadow plus border keeps the boundary readable.
            </div>
          </div>
        </section>
      </div>

      {missing.length > 0 && (
        <p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">
          Unconfigured in preview: {missing.join(", ")}. Restore or add those recipes to complete this preview.
        </p>
      )}
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Preview recipe sources
        </summary>
        <ul className="mt-2 space-y-1">
          {slots.map(([label, slot]) => (
            <li key={label} className="font-mono text-[11px]">
              {label} ← {slot ? `${slot.id} · ${slot.css.length > 60 ? `${slot.css.slice(0, 60)}…` : slot.css}` : "unconfigured"}
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
