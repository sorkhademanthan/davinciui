"use client"

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import type { DesignSystemConfig, ScaleToken } from "@/lib/design-system/domain"
import {
  applySpacingPreset,
  canDeleteToken,
  createToken,
  diffScales,
  firstAvailablePx,
  hasCustomScaleEdits,
  humanLabel,
  moveToken,
  parseLength,
  removeToken,
  resetTokenToStarter,
  restoreStarterScale,
  scaleIssues,
  SPACING_PRESETS,
  updateTokenValue,
  type ScaleKind,
  type SpacingPreset,
  type SpacingUnit,
} from "@/lib/design-system/spacing"
import { createSystemFromStarter } from "@/lib/design-system/starters"

export function SpacingEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [tab, setTab] = useState<ScaleKind>("spacing")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      <PageHeader
        eyebrow="Design System / Foundations"
        title="Spacing & sizing"
        description="Define your spacing rhythm and component sizing values, then see them drive a live interface preview."
      />
      <div className="mt-6 flex gap-2" role="tablist" aria-label="Spacing or sizing">
        {(["spacing", "sizing"] as const).map((kind) => (
          <button
            key={kind}
            role="tab"
            aria-selected={tab === kind}
            onClick={() => setTab(kind)}
            className={`inline-flex min-h-11 items-center rounded-lg border px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tab === kind ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            {kind === "spacing" ? "Spacing scale" : "Sizing tokens"}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {tab === "spacing" ? (
            <SpacingSection system={system} save={save} selectedId={selectedId} onSelect={setSelectedId} />
          ) : (
            <SizingSection system={system} save={save} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </div>
        <SpacingPreview system={system} selectedId={selectedId} />
      </div>
    </>
  )
}

function scaleOf(system: DesignSystemConfig, kind: ScaleKind): ScaleToken[] {
  return kind === "spacing"
    ? [...(system.foundations.spacing?.scale ?? [])]
    : [...(system.foundations.sizing?.tokens ?? [])];
}

function commitScale(system: DesignSystemConfig, save: (next: DesignSystemConfig) => void, kind: ScaleKind, tokens: ScaleToken[]): void {
  if (kind === "spacing") {
    save({ ...system, foundations: { ...system.foundations, spacing: { ...system.foundations.spacing, scale: tokens } } });
    return;
  }
  save({
    ...system,
    foundations: { ...system.foundations, sizing: { ...(system.foundations.sizing ?? { tokens: [] }), tokens } },
  });
}

function SpacingSection({
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
  const tokens = system.foundations.spacing?.scale ?? []
  const [showAdd, setShowAdd] = useState(false)
  const [pendingPreset, setPendingPreset] = useState<SpacingPreset | "starter" | null>(null)
  const customEdits = hasCustomScaleEdits(system, "spacing")
  const issues = scaleIssues(system).filter((issue) => issue.path.includes("foundations.spacing"))

  const requestPreset = (preset: SpacingPreset | "starter") => {
    if (customEdits) {
      setPendingPreset(preset)
      return
    }
    applyPresetChoice(preset)
  }

  const applyPresetChoice = (preset: SpacingPreset | "starter") => {
    if (preset === "starter") {
      save(restoreStarterScale(system, "spacing"))
    } else {
      save(applySpacingPreset(system, preset))
    }
    setPendingPreset(null)
  }

  return (
    <section aria-label="Spacing scale" className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-medium">Scale presets</h2>
          <p className="text-xs text-muted-foreground">
            Base unit <span className="font-mono">{system.foundations.spacing?.base ?? 4}px</span> (starter default)
            {" · "}
            <span className={`font-medium ${customEdits ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {customEdits ? "Custom scale" : "Starter scale"}
            </span>
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Presets are starting points — your scale stays fully editable afterwards. Density never overwrites spacing.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SPACING_PRESETS.map((preset) => (
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
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">Tokens ({tokens.length})</h2>
          <button
            onClick={() => setShowAdd((open) => !open)}
            aria-expanded={showAdd}
            aria-controls="add-spacing-token-form"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            {showAdd ? "Close" : "Add token"}
          </button>
        </div>
        {showAdd && (
          <AddTokenForm
            formId="add-spacing-token-form"
            system={system}
            kind="spacing"
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
              kind="spacing"
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
      </div>
    </section>
  )
}

function SizingSection({
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
  const tokens = system.foundations.sizing?.tokens ?? []
  const [showAdd, setShowAdd] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const customEdits = hasCustomScaleEdits(system, "sizing")
  const issues = scaleIssues(system).filter((issue) => issue.path.includes("foundations.sizing"))

  return (
    <section aria-label="Sizing tokens" className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-5">
        <h2 className="font-medium">Component & layout sizing</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Sizing tokens size controls, icons, and content regions. They are distinct from spacing tokens —
          use spacing for gaps and padding, sizing for dimensions.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`text-xs font-medium ${customEdits ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {customEdits ? "Custom sizing" : "Starter sizing"}
          </span>
          {!confirmRestore ? (
            <button
              onClick={() => (customEdits ? setConfirmRestore(true) : save(restoreStarterScale(system, "sizing")))}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Restore starter default
            </button>
          ) : (
            <div role="alert" className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
              <p className="flex min-h-11 flex-1 items-center text-xs leading-5 sm:text-sm">
                Replace your sizing tokens with the starter defaults? Custom values will be lost.
              </p>
              <button
                onClick={() => setConfirmRestore(false)}
                className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep mine
              </button>
              <button
                onClick={() => {
                  save(restoreStarterScale(system, "sizing"))
                  setConfirmRestore(false)
                }}
                className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Restore defaults
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">Tokens ({tokens.length})</h2>
          <button
            onClick={() => setShowAdd((open) => !open)}
            aria-expanded={showAdd}
            aria-controls="add-sizing-token-form"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            {showAdd ? "Close" : "Add token"}
          </button>
        </div>
        {showAdd && (
          <AddTokenForm
            formId="add-sizing-token-form"
            system={system}
            kind="sizing"
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
              kind="sizing"
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
      </div>
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
  preset: SpacingPreset | "starter"
  onConfirm: () => void
  onCancel: () => void
}) {
  const nextScale = preset === "starter"
    ? createSystemFromStarter({ starterId: system.starter.presetId, name: system.meta.name }).foundations.spacing.scale
    : preset.scale;
  const diff = diffScales(system.foundations.spacing?.scale ?? [], nextScale);

  return (
    <div role="alert" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <h3 className="text-sm font-semibold">
        {preset === "starter" ? "Restore starter defaults?" : `Apply “${preset.label}”?`}
      </h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        You have custom spacing edits. Applying this scale overwrites them:
      </p>
      <ScaleDiffSummary diff={diff} />
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

function ScaleDiffSummary({ diff }: { diff: ReturnType<typeof diffScales> }) {
  const total = diff.added.length + diff.removed.length + diff.changed.length;
  if (total === 0) return <p className="mt-2 text-xs text-muted-foreground">No differences — scales already match.</p>;
  return (
    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
      {diff.changed.map((entry) => (
        <li key={`c-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
      ))}
      {diff.added.map((token) => (
        <li key={`a-${token.id}`}>+ {token.id} ({token.value})</li>
      ))}
      {diff.removed.map((token) => (
        <li key={`r-${token.id}`}>− {token.id} ({token.value})</li>
      ))}
    </ul>
  );
}

function TokenRow({
  system,
  save,
  kind,
  token,
  index,
  total,
  selected,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  kind: ScaleKind
  token: { id: string; value: string }
  index: number
  total: number
  selected: boolean
  onSelect: (id: string | null) => void
}) {
  const [amount, setAmount] = useState<string | null>(null);
  const [unit, setUnit] = useState<"px" | "rem" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const parsed = parseLength(token.value);
  const displayAmount = amount ?? String(parsed?.amount ?? "");
  const displayUnit = (unit ?? parsed?.unit ?? "px") as "px" | "rem";
  const barPx = parsed ? Math.min(280, parsed.unit === "px" ? parsed.amount : parsed.amount * 16) : 0;

  const commit = () => {
    // Bare numbers inherit the selected unit; explicit units always win.
    const text = displayAmount.trim();
    const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${displayUnit}` : text;
    const candidate = withUnit === "" ? null : parseLength(withUnit);
    if (!candidate) {
      setError("Enter a value of 0 or more with px or rem (e.g. 16px, 1.5rem).");
      return;
    }
    setError(null);
    setAmount(null);
    setUnit(null);
    save(updateTokenValue(system, kind, token.id, candidate.amount, candidate.unit));
  };

  const guard = canDeleteToken(system, kind, token.id);

  return (
    <li
      className={`rounded-lg border p-3 transition-colors ${selected ? "border-foreground bg-muted/60" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => onSelect(selected ? null : token.id)}
          aria-pressed={selected}
          aria-label={`Select token ${token.id} for preview`}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md min-h-11"
        >
          <span className="block truncate font-mono text-[13px] font-medium">{token.id}</span>
          <span className="block truncate text-xs text-muted-foreground">{humanLabel(token.id)}</span>
        </button>
        <div
          aria-hidden="true"
          className="h-5 shrink-0 rounded bg-foreground/80"
          style={{ width: `${Math.max(2, barPx)}px` }}
        />
        <div className="flex items-center gap-2">
          <label htmlFor={`${kind}-${token.id}-amount`} className="sr-only">
            {token.id} value
          </label>
          <input
            id={`${kind}-${token.id}-amount`}
            value={displayAmount}
            inputMode="decimal"
            onChange={(event) => {
              setAmount(event.target.value);
              setError(null);
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur();
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${kind}-${token.id}-error` : undefined}
            className={`h-11 w-24 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
          <label htmlFor={`${kind}-${token.id}-unit`} className="sr-only">
            {token.id} unit
          </label>
          <select
            id={`${kind}-${token.id}-unit`}
            value={displayUnit}
            onChange={(event) => {
              const nextUnit = event.target.value as "px" | "rem";
              setUnit(nextUnit);
              const text = displayAmount.trim();
              const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${nextUnit}` : text;
              const strict = withUnit === "" ? null : parseLength(withUnit);
              if (!strict) {
                setError("Enter a value of 0 or more with px or rem (e.g. 16px, 1.5rem).");
                return;
              }
              setError(null);
              setAmount(null);
              setUnit(null);
              save(updateTokenValue(system, kind, token.id, strict.amount, strict.unit));
            }}
            className="h-11 rounded-lg border border-border bg-background px-2 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ResetTokenButton system={system} save={save} kind={kind} tokenId={token.id} />
          <button
            onClick={() => save(moveToken(system, kind, token.id, -1))}
            disabled={index === 0}
            aria-label={`Move ${token.id} up`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => save(moveToken(system, kind, token.id, 1))}
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
                  if (guard.ok) save(removeToken(system, kind, token.id));
                  setConfirmingDelete(false);
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
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p id={`${kind}-${token.id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
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
  );
}

function ResetTokenButton({
  system,
  save,
  kind,
  tokenId,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  kind: ScaleKind
  tokenId: string
}) {
  const [confirmed, setConfirmed] = useState(false);
  const restorable = resetTokenToStarter(system, kind, tokenId) !== null;
  if (!restorable) return null;
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
    );
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
          const next = resetTokenToStarter(system, kind, tokenId);
          if (next) save(next);
          setConfirmed(false);
        }}
        aria-label={`Confirm reset of ${tokenId}`}
        className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Reset
      </button>
    </span>
  );
}

function AddTokenForm({
  formId,
  system,
  kind,
  save,
  onDone,
}: {
  formId: string
  system: DesignSystemConfig
  kind: ScaleKind
  save: (next: DesignSystemConfig) => void
  onDone: () => void
}) {
  const [label, setLabel] = useState("");
  const [customId, setCustomId] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<SpacingUnit>("px");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const numeric = Number(amount.trim());
    const result = createToken(
      kind,
      { id: customId.trim() ? customId : undefined, label: label.trim() ? label : undefined, amount: numeric, unit },
      system,
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const tokens = kind === "spacing"
      ? [...(system.foundations.spacing?.scale ?? []), result.token]
      : [...(system.foundations.sizing?.tokens ?? []), result.token];
    commitScale(system, save, kind, tokens);
    onDone();
  };

  return (
    <div id={formId} className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-label`} className="text-sm font-medium">
            Token name
          </label>
          <input
            id={`${formId}-label`}
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setError(null);
            }}
            placeholder={kind === "spacing" ? "e.g. Gutter" : "e.g. Control xl"}
            maxLength={40}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-id`} className="text-sm font-medium">
            Token id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id={`${formId}-id`}
            value={customId}
            onChange={(event) => {
              setCustomId(event.target.value);
              setError(null);
            }}
            placeholder="auto-derived from name"
            maxLength={40}
            spellCheck={false}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-amount`} className="text-sm font-medium">
            Value
          </label>
          <input
            id={`${formId}-amount`}
            value={amount}
            inputMode="decimal"
            onChange={(event) => {
              setAmount(event.target.value);
              setError(null);
            }}
            placeholder="0 or more"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-unit`} className="text-sm font-medium">
            Unit
          </label>
          <select
            id={`${formId}-unit`}
            value={unit}
            onChange={(event) => setUnit(event.target.value as SpacingUnit)}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="px">px — fixed pixels</option>
            <option value="rem">rem — relative to root</option>
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
          Add {kind === "spacing" ? "spacing" : "sizing"} token
        </button>
        <button
          onClick={onDone}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function SpacingPreview({ system, selectedId }: { system: DesignSystemConfig; selectedId: string | null }) {
  const gap = (ids: string[]) => firstAvailablePx(system, "spacing", ids);
  const size = (ids: string[]) => firstAvailablePx(system, "sizing", ids);

  const stackGap = gap(["space-4", "space-3", "space-2"]);
  const sectionGap = gap(["space-8", "space-6", "space-4"]);
  const cardPad = gap(["space-6", "space-4", "space-3"]);
  const dialogPad = gap(["space-8", "space-6"]);
  const buttonGap = gap(["space-2", "space-3", "space-1"]);
  const fieldGap = gap(["space-3", "space-2", "space-4"]);
  const control = size(["control-md", "control-lg", "control-sm"]);
  const icon = size(["icon-md", "icon-lg", "icon-sm"]);
  const contentMd = size(["content-md", "content-lg", "content-sm"]);

  const mark = (usedId: string | null) =>
    selectedId && usedId === selectedId
      ? "rounded-md ring-2 ring-foreground ring-offset-2 ring-offset-background"
      : "";

  const missing: string[] = [];
  const slots: Array<[string, { id: string; px: number } | null]> = [
    ["Stack gap", stackGap], ["Section gap", sectionGap], ["Card padding", cardPad],
    ["Dialog padding", dialogPad], ["Button gap", buttonGap], ["Control height", control],
    ["Icon size", icon], ["Content width", contentMd],
  ];
  for (const [label, slot] of slots) {
    if (!slot) missing.push(label);
  }

  return (
    <aside aria-label="Spacing preview" className="h-fit rounded-xl border border-border bg-background p-5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Driven by saved spacing and sizing tokens — not hardcoded values.
        {selectedId ? (
          <> Highlighting <span className="font-mono font-medium text-foreground">{selectedId}</span>.</>
        ) : (
          <> Select a token to highlight where it applies.</>
        )}
      </p>

      <div className="mt-4 space-y-4 rounded-lg border border-border p-4" style={{ gap: sectionGap ? `${sectionGap.px}px` : undefined, display: "grid" }}>
        <section aria-label="Stacked content preview" className={mark(stackGap?.id ?? null)}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">STACKED SECTIONS</p>
          <div className="mt-2 grid" style={{ gap: stackGap ? `${stackGap.px}px` : undefined }}>
            {[0, 1, 2].map((index) => (
              <div key={index} className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium">Section {index + 1}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Gap {stackGap ? <span className="font-mono">{stackGap.id} · {stackGap.px}px</span> : "unconfigured"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Form group preview" className={mark(fieldGap?.id ?? null)}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">FORM GROUP</p>
          <div className="mt-2 grid" style={{ gap: fieldGap ? `${fieldGap.px}px` : undefined }}>
            <label className="block text-xs font-medium">
              Email address
              <input
                placeholder="you@example.com"
                readOnly
                tabIndex={-1}
                className="mt-1.5 block min-h-11 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none"
                style={{ height: control ? `${control.px}px` : undefined }}
              />
            </label>
            <label className="block text-xs font-medium">
              Team name
              <input
                placeholder="Acme"
                readOnly
                tabIndex={-1}
                className="mt-1.5 block min-h-11 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none"
                style={{ height: control ? `${control.px}px` : undefined }}
              />
            </label>
          </div>
        </section>

        <section aria-label="Button group preview" className={mark(buttonGap?.id ?? null)}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">BUTTON GROUP</p>
          <div className="mt-2 flex flex-wrap" style={{ gap: buttonGap ? `${buttonGap.px}px` : undefined }}>
            <button tabIndex={-1} className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background" style={{ height: control ? `${Math.max(44, control.px)}px` : undefined }}>
              Save changes
            </button>
            <button tabIndex={-1} className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium" style={{ height: control ? `${Math.max(44, control.px)}px` : undefined }}>
              Cancel
            </button>
          </div>
        </section>

        <section aria-label="Card padding preview" className={mark(cardPad?.id ?? null)}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">CARD</p>
          <div className="mt-2 rounded-lg border border-border" style={{ padding: cardPad ? `${cardPad.px}px` : undefined }}>
            <p className="text-sm font-medium">Card title</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Padding {cardPad ? <span className="font-mono">{cardPad.id} · {cardPad.px}px</span> : "unconfigured"}
            </p>
          </div>
        </section>

        <section aria-label="Dialog surface preview" className={mark(dialogPad?.id ?? null)}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">DIALOG SURFACE</p>
          <div
            className="mt-2 rounded-lg border border-border bg-muted/40"
            style={{
              padding: dialogPad ? `${dialogPad.px}px` : undefined,
              maxWidth: contentMd ? `${Math.min(contentMd.px, 560)}px` : undefined,
            }}
          >
            <p className="text-sm font-medium">Confirm deletion</p>
            <p className="mt-1 text-xs text-muted-foreground">Padding {dialogPad ? <span className="font-mono">{dialogPad.id}</span> : "unconfigured"} · width {contentMd ? <span className="font-mono">{contentMd.id}</span> : "unconfigured"}</p>
          </div>
        </section>

        <section aria-label="Icon and control sizing preview" className={mark(icon?.id ?? control?.id ?? null)}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">ICONS & CONTROLS</p>
          <div className="mt-2 flex items-center" style={{ gap: buttonGap ? `${buttonGap.px}px` : undefined }}>
            {(["icon-sm", "icon-md", "icon-lg"] as const).map((id) => {
              const slot = size([id]);
              return (
                <span
                  key={id}
                  title={slot ? `${slot.id} · ${slot.px}px` : `${id} unconfigured`}
                  aria-label={slot ? `${id}, ${slot.px} pixels` : `${id} unconfigured`}
                  role="img"
                  className={`rounded bg-foreground/80 ${selectedId === id ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`}
                  style={slot ? { width: `${slot.px}px`, height: `${slot.px}px` } : { width: 16, height: 16, opacity: 0.25 }}
                />
              );
            })}
            <span className="text-xs text-muted-foreground">
              Control height {control ? <span className="font-mono">{control.id} · {control.px}px</span> : "unconfigured"}
            </span>
          </div>
        </section>

        <section aria-label="Content width preview">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">CONTENT WIDTHS</p>
          <div className="mt-2 space-y-2">
            {(["content-sm", "content-md", "content-lg"] as const).map((id) => {
              const slot = size([id]);
              const width = slot ? Math.min(slot.px, 560) : null;
              const max = 560;
              return (
                <div key={id}>
                  <div
                    role="img"
                    aria-label={slot ? `${id}, ${slot.px} pixels` : `${id} unconfigured`}
                    title={slot ? `${slot.id} · ${slot.px}px` : `${id} unconfigured`}
                    className={`h-5 rounded bg-foreground/80 ${selectedId === id ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`}
                    style={{ width: width === null ? 32 : `${Math.max(24, (width / max) * 100)}%`, opacity: width === null ? 0.25 : 1 }}
                  />
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{id}{slot ? ` · ${slot.px}px` : " · unconfigured"}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {missing.length > 0 && (
        <p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">
          Unconfigured in preview: {missing.join(", ")}. Add or restore those tokens to complete this preview — nothing here is hardcoded.
        </p>
      )}
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Preview token sources
        </summary>
        <ul className="mt-2 space-y-1">
          {slots.map(([label, slot]) => (
            <li key={label} className="font-mono text-[11px]">
              {label} ← {slot ? `${slot.id} · ${slot.px}px` : "unconfigured"}
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
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
  );
}
