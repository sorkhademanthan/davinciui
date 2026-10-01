"use client"

import { Check, Copy, Plus, RotateCcw, Trash2, X, CircleAlert } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import {
  resolveToken,
  type BorderToken,
  type DesignSystemConfig,
} from "@/lib/design-system/domain"
import { ensureRadiusScale } from "@/lib/design-system/radius"
import { usePreviewTheme } from "@/components/design-system/use-preview-theme"
import {
  applyBorderPreset,
  availableStyles,
  BORDER_PRESETS,
  borderIssues,
  canDeleteBorderRecipe,
  canDeleteWidthToken,
  colorReferenceOptions,
  createBorderRecipe,
  createWidthToken,
  defaultBorderStyle,
  diffBorders,
  duplicateBorderRecipe,
  hasCustomBorderEdits,
  parseBorderWidth,
  removeBorderRecipe,
  removeWidthToken,
  resetRecipeToStarter,
  resetWidthToStarter,
  resolveBorderColor,
  resolveBorderRecipe,
  resolveBorderStyle,
  resolveBorderWidth,
  restoreStarterBorders,
  setDefaultStyle,
  setStyleEnabled,
  updateBorderRecipe,
  updateWidthValue,
  BORDER_WIDTH_UNITS,
  type BorderPreset,
  type BorderWidthUnit,
} from "@/lib/design-system/borders"

export function BordersEditor({
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
        title="Borders"
        description="Define reusable border widths, styles, and recipes from real palette colors, then see them drive a live preview."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <PresetSection system={system} save={save} />
          <WidthsSection system={system} save={save} />
          <StylesSection system={system} save={save} />
          <RecipesSection system={system} save={save} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <BordersPreview system={system} selectedId={selectedId} />
      </div>
    </>
  )
}

function currentBorders(system: DesignSystemConfig) {
  return {
    widths: { ...(system.foundations.borders?.widths ?? {}) },
    styles: { ...(system.foundations.borders?.styles ?? {}) },
    tokens: [...(system.foundations.borders?.tokens ?? [])],
  };
}

function PresetSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [pendingPreset, setPendingPreset] = useState<BorderPreset | "starter" | null>(null)
  const customEdits = hasCustomBorderEdits(system)

  const requestPreset = (preset: BorderPreset | "starter") => {
    if (customEdits) {
      setPendingPreset(preset)
      return
    }
    applyPresetChoice(preset)
  }

  const applyPresetChoice = (preset: BorderPreset | "starter") => {
    if (preset === "starter") {
      save(restoreStarterBorders(system))
    } else {
      save(applyBorderPreset(system, preset))
    }
    setPendingPreset(null)
  }

  return (
    <section aria-label="Border presets" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Starter presets</h2>
        <p className="text-xs text-muted-foreground">
          <span className={`font-medium ${customEdits ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {customEdits ? "Custom borders" : "Starter borders"}
          </span>
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Optional starting points — everything stays editable afterwards.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {BORDER_PRESETS.map((preset) => (
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
  preset: BorderPreset | "starter"
  onConfirm: () => void
  onCancel: () => void
}) {
  const next = useMemo(() => {
    if (preset === "starter") {
      const restored = restoreStarterBorders(system);
      return {
        widths: restored.foundations.borders.widths,
        tokens: restored.foundations.borders.tokens,
      };
    }
    return { widths: preset.widths, tokens: preset.recipes };
  }, [system, preset]);
  const current = currentBorders(system);
  const diff = diffBorders(
    { widths: current.widths, tokens: current.tokens },
    next,
  );

  return (
    <div role="alert" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <h3 className="text-sm font-semibold">
        {preset === "starter" ? "Restore starter defaults?" : `Apply “${preset.label}”?`}
      </h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        You have custom border edits. Applying this preset overwrites them:
      </p>
      <BorderDiffSummary
        widthsChanged={diff.widthsChanged}
        widthsAdded={diff.widthsAdded}
        widthsRemoved={diff.widthsRemoved}
        recipesAdded={diff.recipesAdded}
        recipesRemoved={diff.recipesRemoved}
        recipesChanged={diff.recipesChanged}
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

function BorderDiffSummary({
  widthsChanged,
  widthsAdded,
  widthsRemoved,
  recipesAdded,
  recipesRemoved,
  recipesChanged,
}: {
  widthsChanged: Array<{ id: string; from: string; to: string }>
  widthsAdded: Array<{ id: string; value: string }>
  widthsRemoved: Array<{ id: string; value: string }>
  recipesAdded: BorderToken[]
  recipesRemoved: BorderToken[]
  recipesChanged: Array<{ id: string; from: string; to: string }>
}) {
  const total =
    widthsChanged.length + widthsAdded.length + widthsRemoved.length +
    recipesAdded.length + recipesRemoved.length + recipesChanged.length;
  if (total === 0) return <p className="mt-2 text-xs text-muted-foreground">No differences — borders already match.</p>;
  return (
    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
      {widthsChanged.map((entry) => (
        <li key={`w-${entry.id}`}>width {entry.id}: {entry.from} → {entry.to}</li>
      ))}
      {widthsAdded.map((entry) => (
        <li key={`wa-${entry.id}`}>+ width {entry.id} ({entry.value})</li>
      ))}
      {widthsRemoved.map((entry) => (
        <li key={`wr-${entry.id}`}>− width {entry.id} ({entry.value})</li>
      ))}
      {recipesChanged.map((entry) => (
        <li key={`c-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
      ))}
      {recipesAdded.map((token) => (
        <li key={`a-${token.id}`}>+ {token.id} ({token.label})</li>
      ))}
      {recipesRemoved.map((token) => (
        <li key={`r-${token.id}`}>− {token.id} ({token.label})</li>
      ))}
    </ul>
  );
}

function WidthsSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const widths = system.foundations.borders?.widths ?? {};
  const [showAdd, setShowAdd] = useState(false)

  return (
    <section aria-label="Border widths" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Widths</h2>
          <p className="mt-1 text-xs text-muted-foreground">Named widths recipes reference. Values in px or rem.</p>
        </div>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-width-token-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add width"}
        </button>
      </div>
      {showAdd && <AddWidthForm system={system} save={save} onDone={() => setShowAdd(false)} />}
      <ul className="mt-4 space-y-2">
        {Object.entries(widths).map(([id, value]) => (
          <WidthRow key={id} system={system} save={save} tokenId={id} value={value} />
        ))}
      </ul>
    </section>
  )
}

function WidthRow({
  system,
  save,
  tokenId,
  value,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  tokenId: string
  value: string
}) {
  const [amount, setAmount] = useState<string | null>(null);
  const [unit, setUnit] = useState<"px" | "rem" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const parsed = parseBorderWidth(value);
  const displayAmount = amount ?? String(parsed?.amount ?? "");
  const displayUnit = (unit ?? parsed?.unit ?? "px") as "px" | "rem";

  const commit = () => {
    const text = displayAmount.trim();
    const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${displayUnit}` : text;
    const candidate = withUnit === "" ? null : parseBorderWidth(withUnit);
    if (!candidate) {
      setError("Enter a value of 0 or more with px or rem (e.g. 1px).");
      return;
    }
    setError(null);
    setAmount(null);
    setUnit(null);
    save(updateWidthValue(system, tokenId, candidate.amount, candidate.unit));
  };

  const guard = canDeleteWidthToken(system, tokenId);
  const restorable = resetWidthToStarter(system, tokenId) !== null;
  const previewPx = parsed ? Math.min(96, parsed.unit === "px" ? parsed.amount : parsed.amount * 16) : 0;

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-32">
          <p className="truncate font-mono text-[13px] font-medium">{tokenId}</p>
          <p className="truncate text-xs text-muted-foreground">
            {tokenId
              .split("-")
              .map((word) => (word ? word[0]!.toUpperCase() + word.slice(1) : word))
              .join(" ")}{" "}
            width
          </p>
        </div>
        <div
          aria-hidden="true"
          className="h-6 w-20 shrink-0 rounded-sm border border-foreground/40"
          style={{ borderWidth: `${Math.max(1, Math.min(previewPx, 12))}px` }}
        />
        <div className="flex items-center gap-2">
          <label htmlFor={`width-${tokenId}-amount`} className="sr-only">
            {tokenId} width value
          </label>
          <input
            id={`width-${tokenId}-amount`}
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
            aria-describedby={error ? `width-${tokenId}-error` : undefined}
            className={`h-11 w-24 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
          <label htmlFor={`width-${tokenId}-unit`} className="sr-only">
            {tokenId} width unit
          </label>
          <select
            id={`width-${tokenId}-unit`}
            value={displayUnit}
            onChange={(event) => {
              const nextUnit = event.target.value as "px" | "rem";
              setUnit(nextUnit);
              const text = displayAmount.trim();
              const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${nextUnit}` : text;
              const strict = withUnit === "" ? null : parseBorderWidth(withUnit);
              if (!strict) {
                setError("Enter a value of 0 or more with px or rem (e.g. 1px).");
                return;
              }
              setError(null);
              setAmount(null);
              setUnit(null);
              save(updateWidthValue(system, tokenId, strict.amount, strict.unit));
            }}
            className="h-11 rounded-lg border border-border bg-background px-2 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {restorable &&
            (!confirmingReset ? (
              <button
                onClick={() => setConfirmingReset(true)}
                aria-label={`Reset ${tokenId} to starter default`}
                title="Reset to starter default"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <span className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmingReset(false)}
                  aria-label={`Keep custom value for ${tokenId}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    const next = resetWidthToStarter(system, tokenId);
                    if (next) save(next);
                    setConfirmingReset(false);
                  }}
                  aria-label={`Confirm reset of ${tokenId}`}
                  className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Reset
                </button>
              </span>
            ))}
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete width token ${tokenId}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep width token ${tokenId}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeWidthToken(system, tokenId));
                  setConfirmingDelete(false);
                }}
                aria-label={`Confirm deletion of width token ${tokenId}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep width token ${tokenId}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Understood
            </button>
          )}
        </div>
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p id={`width-${tokenId}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : !guard.ok ? (
          <p className="text-xs text-muted-foreground">
            {guard.reasons[0]} {guard.references.length > 0 && <>({guard.references.map((reference) => reference.pointer).join(", ")})</>}
          </p>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">= {value}</p>
        )}
      </div>
    </li>
  );
}

function AddWidthForm({
  system,
  save,
  onDone,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  onDone: () => void
}) {
  const [label, setLabel] = useState("");
  const [customId, setCustomId] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<BorderWidthUnit>("px");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const numeric = Number(amount.trim());
    const result = createWidthToken(
      { id: customId.trim() ? customId : undefined, label: label.trim() ? label : undefined, amount: numeric, unit },
      Object.keys(system.foundations.borders?.widths ?? {}),
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const widths = { ...(system.foundations.borders?.widths ?? {}) };
    widths[result.id] = result.value;
    save({
      ...system,
      foundations: { ...system.foundations, borders: { ...system.foundations.borders, widths } },
    });
    onDone();
  };

  return (
    <div id="add-width-token-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-width-token-form-label" className="text-sm font-medium">
            Token name
          </label>
          <input
            id="add-width-token-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setError(null);
            }}
            placeholder="e.g. Chunky"
            maxLength={40}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-width-token-form-id" className="text-sm font-medium">
            Token id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-width-token-form-id"
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
          <label htmlFor="add-width-token-form-amount" className="text-sm font-medium">
            Value
          </label>
          <input
            id="add-width-token-form-amount"
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
          <label htmlFor="add-width-token-form-unit" className="text-sm font-medium">
            Unit
          </label>
          <select
            id="add-width-token-form-unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value as BorderWidthUnit)}
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
          Add width token
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

function StylesSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const styles = system.foundations.borders?.styles ?? {};
  const disabled = new Set(system.foundations.borders?.disabledStyles ?? []);
  const [styleError, setStyleError] = useState<string | null>(null);

  const toggle = (key: string, enabled: boolean) => {
    const result = setStyleEnabled(system, key, enabled);
    if (!result.ok) {
      setStyleError(result.error);
      return;
    }
    setStyleError(null);
    save(result.system);
  };

  const chooseDefault = (key: string) => {
    const result = setDefaultStyle(system, key);
    if (!result.ok) {
      setStyleError(result.error);
      return;
    }
    setStyleError(null);
    save(result.system);
  };

  return (
    <section aria-label="Border styles" className="rounded-xl border border-border bg-background p-5">
      <h2 className="font-medium">Styles</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Toggle which line styles recipes may use, and pick the default for new recipes. Values follow CSS border-style keywords.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Available border styles">
        {Object.entries(styles).map(([key, value]) => {
          const enabled = !disabled.has(key);
          return (
            <button
              key={key}
              aria-pressed={enabled}
              aria-label={`${key} style, ${enabled ? "enabled" : "disabled"}`}
              title={`${key}: ${value}`}
              onClick={() => toggle(key, !enabled)}
              className={`inline-flex min-h-11 items-center gap-2.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${enabled ? "border-foreground bg-muted" : "border-border opacity-60 hover:bg-muted/60"}`}
            >
              <span
                aria-hidden="true"
                className="block h-0 w-8 border-t-2 border-foreground"
                style={{ borderTopStyle: value === "none" ? undefined : (value as "solid") }}
              />
              {key}
              <Check aria-hidden="true" className={`size-4 ${enabled ? "" : "opacity-0"}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label htmlFor="border-default-style" className="text-sm font-medium">
          Default style for new recipes
        </label>
        <select
          id="border-default-style"
          value={defaultBorderStyle(system)}
          onChange={(event) => chooseDefault(event.target.value)}
          className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {Object.keys(styles).map((key) => (
            <option key={key} value={key} disabled={disabled.has(key)}>
              {key}
              {disabled.has(key) ? " (disabled)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 min-h-5" aria-live="polite">
        {styleError && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {styleError}
          </p>
        )}
      </div>
    </section>
  );
}

function RecipesSection({
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
  const tokens = system.foundations.borders?.tokens ?? [];
  const [showAdd, setShowAdd] = useState(false);
  const issues = borderIssues(system);

  return (
    <section aria-label="Border recipes" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Recipes ({tokens.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">Named width + style + color combinations. Ids are stable references.</p>
        </div>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-border-recipe-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add recipe"}
        </button>
      </div>
      {showAdd && <AddRecipeForm system={system} save={save} onDone={() => setShowAdd(false)} />}
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
  );
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
  token: BorderToken
  selected: boolean
  onSelect: (id: string | null) => void
}) {
  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resolved = resolveBorderRecipe(system, token.id);
  const guard = canDeleteBorderRecipe(system, token.id);
  const restorable = resetRecipeToStarter(system, token.id) !== null;

  const commitLabel = () => {
    const trimmed = (labelDraft ?? token.label).trim();
    if (!trimmed) {
      setLabelError("Label cannot be empty — keeping the previous label.");
      setLabelDraft(null);
      return;
    }
    setLabelError(null);
    setLabelDraft(null);
    if (trimmed !== token.label) {
      const result = updateBorderRecipe(system, token.id, { label: trimmed });
      if (!result.ok) {
        setLabelError(result.error);
        return;
      }
      save(result.system);
    }
  };

  const setField = (patch: Partial<{ width: string; style: string; color: string; enabled: boolean }>, errorSetter?: (message: string | null) => void) => {
    const result = updateBorderRecipe(system, token.id, patch);
    if (!result.ok) {
      errorSetter?.(result.error);
      return;
    }
    errorSetter?.(null);
    save(result.system);
  };

  return (
    <li className={`rounded-lg border p-3 transition-colors ${selected ? "border-foreground bg-muted/60" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => onSelect(selected ? null : token.id)}
          aria-pressed={selected}
          aria-label={`Select recipe ${token.id} for preview`}
          className="min-w-0 flex-1 basis-40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md min-h-11"
        >
          <span className="block truncate font-mono text-[13px] font-medium">{token.id}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {token.label} · {token.enabled === false ? "Disabled" : "Enabled"}
          </span>
        </button>
        <div
          aria-hidden="true"
          className="h-10 w-16 shrink-0 rounded-md border border-foreground/40 bg-muted"
          style={
            resolved
              ? { borderWidth: resolved.width, borderStyle: resolved.style as "solid", borderColor: resolved.color }
              : undefined
          }
          title={resolved ? `${token.id}: ${resolved.css}` : `${token.id} unresolved`}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const result = updateBorderRecipe(system, token.id, { enabled: token.enabled === false });
              if (result.ok) save(result.system);
            }}
            aria-pressed={token.enabled !== false}
            aria-label={`${token.enabled === false ? "Enable" : "Disable"} recipe ${token.id}`}
            title={token.enabled === false ? "Enable recipe" : "Disable recipe"}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${token.enabled === false ? "border-border opacity-60 hover:bg-muted" : "border-foreground bg-muted"}`}
          >
            {token.enabled === false ? "Disabled" : "Enabled"}
          </button>
          <button
            onClick={() => {
              const dupe = duplicateBorderRecipe(system, token.id);
              if (!dupe) return;
              save({
                ...system,
                foundations: {
                  ...system.foundations,
                  borders: { ...system.foundations.borders, tokens: [...system.foundations.borders.tokens, dupe] },
                },
              });
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
                    const next = resetRecipeToStarter(system, token.id);
                    if (next) save(next);
                    setConfirmingReset(false);
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
                  save(removeBorderRecipe(system, token.id));
                  setConfirmingDelete(false);
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

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`recipe-${token.id}-label`} className="text-xs font-medium">
            Visible label
          </label>
          <input
            id={`recipe-${token.id}-label`}
            value={labelDraft ?? token.label}
            onChange={(event) => {
              setLabelDraft(event.target.value);
              setLabelError(null);
            }}
            onBlur={commitLabel}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur();
            }}
            maxLength={60}
            aria-invalid={Boolean(labelError)}
            aria-describedby={labelError ? `recipe-${token.id}-label-error` : undefined}
            className={`mt-1.5 min-h-11 w-full rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
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
        <div>
          <label htmlFor={`recipe-${token.id}-width`} className="text-xs font-medium">
            Width token
          </label>
          <WidthSelect system={system} token={token} setField={setField} />
        </div>
        <div>
          <label htmlFor={`recipe-${token.id}-style`} className="text-xs font-medium">
            Style
          </label>
          <select
            id={`recipe-${token.id}-style`}
            value={token.style}
            onChange={(event) => setField({ style: event.target.value }, () => {})}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Object.keys(system.foundations.borders?.styles ?? {}).map((key) => (
              <option key={key} value={key}>
                {key}
                {(system.foundations.borders?.disabledStyles ?? []).includes(key) ? " (disabled)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span id={`recipe-${token.id}-color-label`} className="text-xs font-medium">
            Color reference
          </span>
          <ColorSelect system={system} token={token} setField={setField} />
        </div>
      </div>

      <div className="mt-1 min-h-5" aria-live="polite">
        {!guard.ok && (
          <p className="text-xs text-muted-foreground">
            {guard.reasons[0]} {guard.references.length > 0 && <>({guard.references.map((reference) => reference.pointer).join(", ")})</>}
          </p>
        )}
        {guard.ok && (
          <p className="font-mono text-[11px] text-muted-foreground">
            {resolved ? `= ${resolved.css}` : "= unresolved — check width, style, and color"}
          </p>
        )}
      </div>
    </li>
  );
}

function WidthSelect({
  system,
  token,
  setField,
}: {
  system: DesignSystemConfig
  token: BorderToken
  setField: (patch: Partial<{ width: string; style: string; color: string; enabled: boolean }>, onError?: (message: string | null) => void) => void
}) {
  const widths = system.foundations.borders?.widths ?? {};
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <select
        id={`recipe-${token.id}-width`}
        value={token.width in widths ? token.width : "__raw__"}
        onChange={(event) => {
          if (event.target.value === "__raw__") return;
          setField({ width: event.target.value }, setError);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `recipe-${token.id}-width-error` : undefined}
        className={`mt-1.5 min-h-11 w-full rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
      >
        {!(token.width in widths) && (
          <option value="__raw__">
            {token.width} (legacy value)
          </option>
        )}
        {Object.entries(widths).map(([key, value]) => (
          <option key={key} value={key}>
            {key} · {value}
          </option>
        ))}
      </select>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error && (
          <p id={`recipe-${token.id}-width-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    </>
  );
}

function ColorSelect({
  system,
  token,
  setField,
}: {
  system: DesignSystemConfig
  token: BorderToken
  setField: (patch: Partial<{ width: string; style: string; color: string; enabled: boolean }>, onError?: (message: string | null) => void) => void
}) {
  const [error, setError] = useState<string | null>(null);
  const [customHex, setCustomHex] = useState<string | null>(null);
  const options = useMemo(() => colorReferenceOptions(system), [system]);
  const optionValues = new Set(options.map((option) => option.value));
  const showCustom = customHex !== null || !optionValues.has(token.color);
  const selectValue = showCustom ? "__custom__" : token.color;

  return (
    <>
      <select
        id={`recipe-${token.id}-color`}
        aria-labelledby={`recipe-${token.id}-color-label recipe-${token.id}-color`}
        value={selectValue}
        onChange={(event) => {
          if (event.target.value === "__custom__") {
            setCustomHex(token.color.startsWith("#") ? token.color : "");
            setError(null);
            return;
          }
          setCustomHex(null);
          setField({ color: event.target.value }, setError);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `recipe-${token.id}-color-error` : undefined}
        className={`mt-1.5 min-h-11 w-full rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
      >
        {options.map((option) => {
          const hex = resolveBorderColor(system, option.value);
          return (
            <option key={option.value} value={option.value}>
              {option.label}{hex ? ` · ${hex}` : ""}
            </option>
          );
        })}
        <option value="__custom__">Custom hex value…</option>
      </select>
      {showCustom && (
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor={`recipe-${token.id}-hex`} className="sr-only">
            {token.id} custom hex color
          </label>
          <input
            id={`recipe-${token.id}-hex`}
            value={customHex ?? token.color}
            onChange={(event) => {
              setCustomHex(event.target.value);
              setError(null);
            }}
            onBlur={() => {
              const next = (customHex ?? token.color).trim();
              if (next === token.color) {
                setCustomHex(null);
                return;
              }
              setField({ color: next }, (message) => {
                setError(message);
                if (message) setCustomHex(next);
                else setCustomHex(null);
              });
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur();
            }}
            spellCheck={false}
            maxLength={7}
            placeholder="#8a8a93"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `recipe-${token.id}-color-error` : undefined}
            className={`min-h-11 w-full rounded-lg border bg-background px-2.5 font-mono text-[13px] uppercase outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
        </div>
      )}
      <div className="mt-1 min-h-5" aria-live="polite">
        {error && (
          <p id={`recipe-${token.id}-color-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    </>
  );
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
  const [label, setLabel] = useState("");
  const [customId, setCustomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const widths = system.foundations.borders?.widths ?? {};
  const styles = availableStyles(system);
  const [width, setWidth] = useState("");
  const [style, setStyle] = useState("");
  const [color, setColor] = useState("");
  const options = useMemo(() => colorReferenceOptions(system), [system]);

  const handleAdd = () => {
    if (!width) {
      setError("Select a width token.");
      return;
    }
    if (!style) {
      setError("Select a style.");
      return;
    }
    if (!color) {
      setError("Select a color reference.");
      return;
    }
    const result = createBorderRecipe(system, {
      id: customId.trim() ? customId : undefined,
      label,
      width,
      style,
      color,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    save({
      ...system,
      foundations: {
        ...system.foundations,
        borders: { ...system.foundations.borders, tokens: [...system.foundations.borders.tokens, result.token] },
      },
    });
    onDone();
  };

  return (
    <div id="add-border-recipe-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-border-recipe-form-label" className="text-sm font-medium">
            Recipe name
          </label>
          <input
            id="add-border-recipe-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setError(null);
            }}
            placeholder="e.g. Card pop"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-border-recipe-form-id" className="text-sm font-medium">
            Recipe id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-border-recipe-form-id"
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
          <label htmlFor="add-border-recipe-form-width" className="text-sm font-medium">
            Width token
          </label>
          <select
            id="add-border-recipe-form-width"
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a width…</option>
            {Object.entries(widths).map(([key, value]) => (
              <option key={key} value={key}>
                {key} · {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="add-border-recipe-form-style" className="text-sm font-medium">
            Style
          </label>
          <select
            id="add-border-recipe-form-style"
            value={style}
            onChange={(event) => setStyle(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a style…</option>
            {styles.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-border-recipe-form-color" className="text-sm font-medium">
            Color reference
          </label>
          <select
            id="add-border-recipe-form-color"
            value={color}
            onChange={(event) => {
              setColor(event.target.value);
              setError(null);
            }}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a color…</option>
            {options.map((option) => {
              const hex = resolveBorderColor(system, option.value);
              return (
                <option key={option.value} value={option.value}>
                  {option.label}{hex ? ` · ${hex}` : ""}
                </option>
              );
            })}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">Palette shades and semantic aliases only — raw hex lives in the recipe editor.</p>
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
  );
}

function BordersPreview({ system, selectedId }: { system: DesignSystemConfig; selectedId: string | null }) {
  const [focusedInput, setFocusedInput] = useState(false);
  const { themeOptions, activeThemeId, selectTheme } = usePreviewTheme(system);

  const recipeFor = (ids: string[]): { id: string; css: string } | null => {
    for (const id of ids) {
      const resolved = resolveBorderRecipe(system, id, activeThemeId);
      if (resolved) return { id, css: resolved.css };
    }
    return null;
  };

  const textColor = (() => {
    const resolved = resolveToken(system, "text.primary", activeThemeId);
    return resolved.status === "resolved" ? resolved.value : "#18181b";
  })();
  const mutedColor = (() => {
    const resolved = resolveToken(system, "text.muted", activeThemeId);
    return resolved.status === "resolved" ? resolved.value : "#71717a";
  })();
  const surface = (() => {
    const resolved = resolveToken(system, "background.surface", activeThemeId);
    if (resolved.status === "resolved") return resolved.value;
    const canvas = resolveToken(system, "background.canvas", activeThemeId);
    return canvas.status === "resolved" ? canvas.value : "#fafafa";
  })();
  const radiusFor = (id: string): string => {
    const scale = system.foundations.radius?.scale;
    if (Array.isArray(scale)) {
      const token = scale.find((entry) => entry.id === id);
      if (token && typeof token.value === "string") return token.value;
    }
    return "8px";
  };

  const input = recipeFor(["border.default", "border.subtle", "border.strong"]);
  const focus = recipeFor(["border.focus", "border.default"]);
  const error = recipeFor(["border.error", "border.default"]);
  const card = recipeFor(["border.default", "border.subtle"]);
  const dialog = recipeFor(["border.strong", "border.default"]);
  const dashed = [...(system.foundations.borders?.tokens ?? [])]
    .map((token) => ({ token, resolved: resolveBorderRecipe(system, token.id, activeThemeId) }))
    .find((entry) => entry.resolved && (entry.resolved.style === "dashed" || entry.resolved.style === "dotted"));

  const mark = (usedId: string | null) =>
    selectedId && usedId === selectedId
      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
      : "";

  const missing: string[] = [];
  const slots: Array<[string, { id: string; css: string } | null]> = [
    ["Input", input],
    ["Focus ring", focus],
    ["Error", error],
    ["Card", card],
    ["Dialog", dialog],
  ];
  for (const [label, slot] of slots) {
    if (!slot) missing.push(label);
  }

  return (
    <aside aria-label="Border preview" className="h-fit rounded-xl border border-border bg-background p-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Real border recipes with resolved palette colors — not hardcoded values.
        {selectedId ? (
          <> Highlighting <span className="font-mono font-medium text-foreground">{selectedId}</span>.</>
        ) : (
          <> Select a recipe to highlight where it applies.</>
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
        <section aria-label="Default input preview" className={`rounded-lg ${mark(input?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            INPUT · {input ? input.id : "unconfigured"}
          </p>
          <label className="mt-2 block text-xs font-medium" style={{ color: textColor }} htmlFor="borders-preview-input">
            Email address
          </label>
          <input
            id="borders-preview-input"
            placeholder="you@example.com"
            className="mt-1.5 block min-h-11 w-full bg-transparent px-3 text-sm outline-none"
            style={{
              border: input ? input.css : "1px dashed #a1a1aa",
              borderRadius: radiusFor("md"),
              color: textColor,
              background: surface,
            }}
          />
        </section>

        <section aria-label="Focused input preview" className={`rounded-lg ${mark(focus?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            FOCUSED INPUT · {focus ? focus.id : "unconfigured"}
          </p>
          <div
            className="mt-2 rounded-lg bg-transparent px-3 py-2.5 text-sm outline-none"
            tabIndex={0}
            role="textbox"
            aria-readonly="true"
            aria-label="Focused input example"
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            style={{
              border: focus ? focus.css : "1px dashed #a1a1aa",
              borderRadius: radiusFor("md"),
              color: textColor,
              background: surface,
              boxShadow: focusedInput && focus ? `0 0 0 3px ${focus.css.split(" ").slice(2).join(" ")}55` : undefined,
            }}
          >
            Focus me with Tab — the ring stays visible while focused.
          </div>
        </section>

        <section aria-label="Invalid input preview" className={`rounded-lg ${mark(error?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            ERROR INPUT · {error ? error.id : "unconfigured"}
          </p>
          <div
            className="mt-2 rounded-lg bg-transparent px-3 py-2.5 text-sm"
            role="alert"
            style={{
              border: error ? error.css : "1px dashed #a1a1aa",
              borderRadius: radiusFor("md"),
              color: textColor,
              background: surface,
            }}
          >
            <p className="flex items-center gap-2 font-medium">
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              Enter a valid email address.
            </p>
          </div>
        </section>

        <section aria-label="Card preview" className={`rounded-lg ${mark(card?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            CARD · {card ? card.id : "unconfigured"}
          </p>
          <div
            className="mt-2 p-4"
            style={{ border: card ? card.css : "1px dashed #a1a1aa", borderRadius: radiusFor("lg"), background: surface, color: textColor }}
            title={card ? `${card.id} · ${card.css}` : "unconfigured"}
          >
            <p className="text-sm font-medium">Card title</p>
            <p className="mt-1 text-xs opacity-70">Supporting copy on a bordered surface.</p>
          </div>
        </section>

        <section aria-label="Divider preview">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">DIVIDER</p>
          <hr
            className="mt-2 border-0"
              style={{
                borderTop: (() => {
                  const subtle = resolveBorderRecipe(system, "border.subtle", activeThemeId) ?? card;
                  return subtle ? subtle.css : "1px solid #e4e4e7";
                })(),
              }}
            title="border.subtle"
          />
        </section>

        <section aria-label="Button preview" className={`rounded-lg ${mark(input?.id ?? null)}`}>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            BUTTON · {input ? input.id : "unconfigured"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              tabIndex={-1}
              className="inline-flex min-h-11 items-center px-4 text-sm font-medium"
              style={{
                border: input ? input.css : "1px dashed #a1a1aa",
                borderRadius: radiusFor("md"),
                color: textColor,
                background: surface,
              }}
              title={input ? `${input.id} · ${input.css}` : "unconfigured"}
            >
              Secondary action
            </button>
          </div>
        </section>

        <section aria-label="Dashed style preview" className="rounded-lg">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">DASHED / DOTTED</p>
          {dashed ? (
            <div
              className={`mt-2 rounded-lg p-4 text-xs ${mark(dashed.token.id)}`}
              style={{ border: dashed.resolved!.css, borderRadius: radiusFor("md"), color: mutedColor }}
              title={`${dashed.token.id} · ${dashed.resolved!.css}`}
            >
              Drop files here — using {dashed.token.id}.
            </div>
          ) : (
            <p role="status" className="mt-2 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
              No dashed or dotted recipe yet. Add one to see it here.
            </p>
          )}
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
              {label} ← {slot ? `${slot.id} · ${slot.css}` : "unconfigured"}
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
