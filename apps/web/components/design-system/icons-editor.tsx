"use client"

import { Bell, Check, Copy, Home, Info, Menu, Plus, RotateCcw, Search, Trash2, TriangleAlert, User, X } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import {
  resolveToken,
  type DesignSystemConfig,
  type IconColorRole,
  type IconLineCap,
  type IconLineJoin,
  type IconSizeToken,
} from "@/lib/design-system/domain"
import { usePreviewTheme } from "@/components/design-system/use-preview-theme"
import { resolveBorderRecipe } from "@/lib/design-system/borders"
import { radiusValueFor } from "@/lib/design-system/radius"
import {
  LINE_CAPS,
  LINE_JOINS,
  STROKE_PRESETS,
  canDeleteIconSize,
  createIconSize,
  diffIcons,
  duplicateIconSize,
  ensureIconSizes,
  findIconReferences,
  hasCustomIconEdits,
  iconColorOptions,
  iconColorRoleLabel,
  iconExportSummary,
  ICON_COLOR_ROLES,
  iconIssues,
  iconSizePx,
  isRenderedSource,
  parseIconSize,
  pxOfIconSize,
  removeIconSize,
  resetIconSizeToStarter,
  resolveIconColor,
  restoreStarterIcons,
  resetIconStyleToStarter,
  setDefaultSize,
  setIconColor,
  setIconSource,
  setLineCap,
  setLineJoin,
  setStrokeWidth,
  updateIconLabel,
  updateIconSize,
  ICON_SIZE_UNITS,
  type IconSizeUnit,
} from "@/lib/design-system/icons"

export function IconsEditor({
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
        title="Icon rules"
        description="Set a small set of rules once. Your product can then use any icon from the chosen library without adding every icon to this design system."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <IconRulesSetup system={system} save={save} />
          <IconSpecificationSection system={system} />
          <details className="group rounded-xl border border-border bg-background">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-medium marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span>
                Advanced developer controls
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">Custom sizes, stroke ends, palette references, and starter reset.</span>
              </span>
              <span aria-hidden="true" className="text-lg text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="space-y-4 border-t border-border p-4 sm:p-5">
              <SourceSection system={system} save={save} />
              <SizesSection system={system} save={save} selectedId={selectedId} onSelect={setSelectedId} />
              <StyleSection system={system} save={save} />
              <ColorsSection system={system} save={save} />
              <RestoreSection system={system} save={save} />
            </div>
          </details>
        </div>
        <IconsPreview system={system} selectedId={selectedId} />
      </div>
    </>
  )
}

function IconRulesSetup({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const icons = system.foundations.icons
  const sizes = sizesOf(system)
  const everydaySizes = ["icon-sm", "icon-md", "icon-lg"]
    .map((id) => sizes.find((size) => size.id === id))
    .filter((size): size is IconSizeToken => Boolean(size))
  const weightChoices = STROKE_PRESETS.filter((preset) => [1.5, 2, 2.5].includes(preset.width))
  const quickColors = ICON_COLOR_ROLES.filter((role) => ["default", "muted", "action", "danger"].includes(role.id))

  return (
    <section aria-label="Icon rules setup" className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="border-b border-border px-5 py-5">
        <h2 className="text-lg font-semibold tracking-tight">Set the essentials</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Most teams only need these three decisions. You can refine the technical details later, without changing how people use icons day to day.</p>
      </div>

      <div className="space-y-7 p-5">
        <fieldset>
          <legend className="text-sm font-semibold">1. Icon library</legend>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Choose one visual family so icons feel like they belong together.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Icon library">
            <button
              type="button"
              role="radio"
              aria-checked={icons.library === "lucide"}
              onClick={() => {
                const result = setIconSource(system, "lucide")
                if (result.ok) save(result.system)
              }}
              className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${icons.library === "lucide" ? "border-foreground bg-muted/60" : "border-border hover:bg-muted/60"}`}
            >
              <span className="flex items-center gap-2 text-sm font-medium"><Bell aria-hidden="true" className="size-5" />Lucide {icons.library === "lucide" && <Check aria-hidden="true" className="ml-auto size-4" />}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Clean outline icons. Ready to browse and use now.</span>
            </button>
            <div className="rounded-lg border border-dashed border-border p-4 text-left">
              <span className="text-sm font-medium">Custom icon set</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Keep custom SVG configuration in Advanced controls. It will not render until an SVG pipeline is connected.</span>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold">2. Everyday icon size</legend>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">This is the size used for buttons, inputs, menus, and most interface actions.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Everyday icon size">
            {everydaySizes.map((size) => {
              const selected = icons.defaultSize === size.id
              return (
                <button
                  type="button"
                  key={size.id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    const result = setDefaultSize(system, size.id)
                    if (result.ok) save(result.system)
                  }}
                  className={`flex min-h-24 items-center gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-foreground bg-muted/60" : "border-border hover:bg-muted/60"}`}
                >
                  <Bell aria-hidden="true" style={{ width: pxOfIconSize(size) ?? 20, height: pxOfIconSize(size) ?? 20, strokeWidth: icons.strokeWidth }} />
                  <span><span className="block text-sm font-medium">{size.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{size.value}</span></span>
                  {selected && <Check aria-hidden="true" className="ml-auto size-4" />}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold">3. Visual weight</legend>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Use one stroke weight across the product. Balanced works well for most interfaces.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Icon visual weight">
            {weightChoices.map((preset) => {
              const selected = icons.strokeWidth === preset.width
              return (
                <button
                  type="button"
                  key={preset.id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    const result = setStrokeWidth(system, preset.width)
                    if (result.ok) save(result.system)
                  }}
                  className={`flex min-h-20 items-center gap-3 rounded-lg border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-foreground bg-muted/60" : "border-border hover:bg-muted/60"}`}
                >
                  <Home aria-hidden="true" className="size-6" style={{ strokeWidth: preset.width }} />
                  <span><span className="block text-sm font-medium">{preset.label}</span><span className="block text-xs text-muted-foreground">{preset.width}px stroke</span></span>
                  {selected && <Check aria-hidden="true" className="ml-auto size-4" />}
                </button>
              )
            })}
          </div>
        </fieldset>

        <section aria-labelledby="icon-colour-behaviour-heading">
          <h3 id="icon-colour-behaviour-heading" className="text-sm font-semibold">4. Colour behaviour</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Icons inherit these semantic roles. The exact palette shades stay editable in Advanced controls.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {quickColors.map((role) => {
              const color = resolveIconColor(system, role.id)
              return (
                <li key={role.id} className="flex min-h-14 items-center gap-3 rounded-lg border border-border px-3">
                  <span aria-hidden="true" className="grid size-8 place-items-center rounded-md border border-black/10 bg-muted dark:border-white/10" style={{ color: color ?? undefined }}><Bell className="size-4" /></span>
                  <span className="min-w-0"><span className="block text-sm font-medium">{role.label}</span><span className="block truncate font-mono text-[11px] text-muted-foreground">{color ?? "Needs a palette shade"}</span></span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </section>
  )
}

function IconSpecificationSection({ system }: { system: DesignSystemConfig }) {
  const summary = useMemo(() => iconExportSummary(system), [system])
  return (
    <section aria-label="Icon export specification" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-medium">Icon specification</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">This is the clean summary that will appear in your exported documentation.</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{summary.source.label}</span>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <dt className="text-xs text-muted-foreground">Everyday size</dt>
          <dd className="mt-1 text-sm font-medium">{summary.defaultSize.label} · {summary.defaultSize.value}</dd>
        </div>
        <div className="rounded-lg border border-border p-3">
          <dt className="text-xs text-muted-foreground">Visual weight</dt>
          <dd className="mt-1 text-sm font-medium">{summary.stroke.label} · {summary.stroke.width}px</dd>
        </div>
        <div className="rounded-lg border border-border p-3">
          <dt className="text-xs text-muted-foreground">Line style</dt>
          <dd className="mt-1 text-sm font-medium">{summary.stroke.lineCap} ends · {summary.stroke.lineJoin} corners</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground">SIZE LADDER</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {summary.sizes.map((size) => (
            <span key={size.id} title={size.usage} className="rounded-md border border-border px-2.5 py-1.5 text-xs">
              <span className="font-medium text-foreground">{size.label}</span> <span className="text-muted-foreground">{size.value}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function sizesOf(system: DesignSystemConfig): IconSizeToken[] {
  return ensureIconSizes(system.foundations.icons?.sizes)
}

function RestoreSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const customEdits = hasCustomIconEdits(system)

  if (!confirming) {
    return (
      <section aria-label="Starter defaults" className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Starter defaults</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {customEdits ? "You have custom icon edits." : "Icons match your starter template."}
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

  const fresh = restoreStarterIcons(system)
  const icons = system.foundations.icons
  const diff = diffIcons(
    {
      sizes: sizesOf(system),
      strokeWidth: icons.strokeWidth,
      lineCap: icons.lineCap,
      lineJoin: icons.lineJoin,
      colors: { ...icons.colors },
      defaultSize: icons.defaultSize,
      library: icons.library,
    },
    {
      sizes: fresh.foundations.icons.sizes,
      strokeWidth: fresh.foundations.icons.strokeWidth,
      lineCap: fresh.foundations.icons.lineCap,
      lineJoin: fresh.foundations.icons.lineJoin,
      colors: { ...fresh.foundations.icons.colors },
      defaultSize: fresh.foundations.icons.defaultSize,
      library: fresh.foundations.icons.library,
    },
  )
  const total =
    diff.sizesAdded.length + diff.sizesRemoved.length + diff.sizesChanged.length +
    diff.settingsChanged.length + diff.colorsChanged.length

  return (
    <section aria-label="Starter defaults" className="rounded-xl border border-border bg-background p-5">
      <div role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
        <h3 className="text-sm font-semibold">Restore starter defaults?</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          This replaces sizes, stroke, caps, colors, source, and default size with your starter template values:
        </p>
        {total === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No differences — icons already match.</p>
        ) : (
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] leading-5">
            {diff.sizesChanged.map((entry) => (
              <li key={`s-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
            ))}
            {diff.sizesAdded.map((token) => (
              <li key={`sa-${token.id}`}>+ {token.id} ({token.value})</li>
            ))}
            {diff.sizesRemoved.map((token) => (
              <li key={`sr-${token.id}`}>− {token.id} ({token.value})</li>
            ))}
            {diff.settingsChanged.map((entry) => (
              <li key={`t-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
            ))}
            {diff.colorsChanged.map((entry) => (
              <li key={`c-${entry.id}`}>{entry.id}: {entry.from} → {entry.to}</li>
            ))}
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

function SourceSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const library = system.foundations.icons.library
  const rendered = isRenderedSource(library)

  const choose = (value: string) => {
    const result = setIconSource(system, value)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    save(result.system)
  }

  return (
    <section aria-label="Icon source" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Source</h2>
        <p className="text-xs text-muted-foreground">
          Active source: <span className="font-medium text-foreground">{rendered ? "Lucide (rendered)" : `${library} (metadata only)`}</span>
        </p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Icon source">
        <button
          role="radio"
          aria-checked={rendered}
          onClick={() => choose("lucide")}
          className={`min-h-11 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${rendered ? "border-foreground bg-muted/60" : "border-border hover:bg-muted/60"}`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Bell aria-hidden="true" className="size-5" />
            Lucide
            {rendered && <Check aria-hidden="true" className="size-4" />}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Installed icon set. Previews below render real Lucide icons.
          </span>
        </button>
        <button
          role="radio"
          aria-checked={!rendered}
          onClick={() => choose("custom")}
          className={`min-h-11 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!rendered ? "border-foreground bg-muted/60" : "border-border hover:bg-muted/60"}`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            Custom SVG
            {!rendered && <Check aria-hidden="true" className="size-4" />}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Metadata-only configuration for a future SVG pipeline. Custom icons do not render in previews.
          </span>
        </button>
      </div>
      <div className="mt-2 min-h-5" aria-live="polite">
        {error ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : (
          !rendered && (
            <p className="text-xs text-muted-foreground">
              Custom source is stored as configuration only. Sizes, stroke, and colors below still apply once assets exist.
            </p>
          )
        )}
      </div>
    </section>
  )
}

function SizesSection({
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
  const tokens = sizesOf(system)
  const [showAdd, setShowAdd] = useState(false)
  const issues = iconIssues(system)

  return (
    <section aria-label="Icon sizes" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Sizes ({tokens.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pixel values with optional rem. Ids are stable references.</p>
        </div>
        <button
          onClick={() => setShowAdd((open) => !open)}
          aria-expanded={showAdd}
          aria-controls="add-icon-size-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAdd ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showAdd ? "Close" : "Add size"}
        </button>
      </div>
      {showAdd && (
        <AddSizeForm
          system={system}
          save={save}
          onDone={() => setShowAdd(false)}
        />
      )}
      <ul className="mt-4 space-y-2">
        {tokens.map((token) => (
          <SizeRow
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

function SizeRow({
  system,
  save,
  token,
  selected,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  token: { id: string; label: string; value: string; description?: string }
  selected: boolean
  onSelect: (id: string | null) => void
}) {
  const [amount, setAmount] = useState<string | null>(null)
  const [unit, setUnit] = useState<"px" | "rem" | null>(null)
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [labelError, setLabelError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const parsed = parseIconSize(token.value)
  const displayAmount = amount ?? String(parsed?.amount ?? "")
  const displayUnit = (unit ?? parsed?.unit ?? "px") as "px" | "rem"
  const previewPx = parsed ? Math.min(64, parsed.unit === "px" ? parsed.amount : parsed.amount * 16) : 0

  const commit = () => {
    const text = displayAmount.trim()
    const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${displayUnit}` : text
    const candidate = withUnit === "" ? null : parseIconSize(withUnit)
    if (!candidate) {
      setError("Enter a size of 0 or more with px or rem (e.g. 20px).")
      return
    }
    setError(null)
    setAmount(null)
    setUnit(null)
    save(updateIconSize(system, token.id, candidate.amount, candidate.unit))
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
    if (trimmed !== token.label) save(updateIconLabel(system, token.id, trimmed))
  }

  const guard = canDeleteIconSize(system, token.id)
  const restorable = resetIconSizeToStarter(system, token.id) !== null
  const isDefault = system.foundations.icons.defaultSize === token.id

  return (
    <li className={`rounded-lg border p-3 transition-colors ${selected ? "border-foreground bg-muted/60" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => onSelect(selected ? null : token.id)}
          aria-pressed={selected}
          aria-label={`Select size ${token.id} for preview`}
          className="min-w-0 flex-1 basis-40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md min-h-11"
        >
          <span className="block truncate font-mono text-[13px] font-medium">
            {token.id}
            {isDefault && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Default</span>}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{token.description ?? token.label}</span>
        </button>
        <div
          aria-hidden="true"
          className="grid shrink-0 place-items-center rounded bg-muted"
          style={{ width: 44, height: 44 }}
        >
          <span
            aria-hidden="true"
            className="block rounded-sm bg-foreground/80"
            style={{ width: `${Math.max(4, Math.min(previewPx, 32))}px`, height: `${Math.max(4, Math.min(previewPx, 32))}px` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`icons-${token.id}-amount`} className="sr-only">
            {token.id} size value
          </label>
          <input
            id={`icons-${token.id}-amount`}
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
            aria-describedby={error ? `icons-${token.id}-error` : undefined}
            className={`h-11 w-24 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-border"}`}
          />
          <label htmlFor={`icons-${token.id}-unit`} className="sr-only">
            {token.id} size unit
          </label>
          <select
            id={`icons-${token.id}-unit`}
            value={displayUnit}
            onChange={(event) => {
              const nextUnit = event.target.value as "px" | "rem"
              setUnit(nextUnit)
              const text = displayAmount.trim()
              const withUnit = text === "" ? "" : /^\d+(\.\d+)?$/.test(text) ? `${text}${nextUnit}` : text
              const strict = withUnit === "" ? null : parseIconSize(withUnit)
              if (!strict) {
                setError("Enter a size of 0 or more with px or rem (e.g. 20px).")
                return
              }
              setError(null)
              setAmount(null)
              setUnit(null)
              save(updateIconSize(system, token.id, strict.amount, strict.unit))
            }}
            className="h-11 rounded-lg border border-border bg-background px-2 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const result = setDefaultSize(system, token.id)
              if (result.ok) save(result.system)
            }}
            disabled={isDefault}
            aria-label={isDefault ? `${token.id} is the default size` : `Make ${token.id} the default size`}
            title={isDefault ? "Default size" : "Make default"}
            aria-pressed={isDefault}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isDefault ? <Check className="size-4" aria-hidden="true" /> : "Set"}
          </button>
          <button
            onClick={() => {
              const copy = duplicateIconSize(system, token.id)
              if (!copy) return
              save({
                ...system,
                foundations: {
                  ...system.foundations,
                  icons: { ...system.foundations.icons, sizes: [...sizesOf(system), copy] },
                },
              })
            }}
            aria-label={`Duplicate size ${token.id}`}
            title="Duplicate size"
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
                    const next = resetIconSizeToStarter(system, token.id)
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
              aria-label={`Delete size ${token.id}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : guard.ok ? (
            <span className="flex items-center gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                aria-label={`Keep size ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  save(removeIconSize(system, token.id))
                  setConfirmingDelete(false)
                }}
                aria-label={`Confirm deletion of size ${token.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Understood, keep size ${token.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Understood
            </button>
          )}
        </div>
      </div>
      <div className="mt-2">
        <label htmlFor={`icons-${token.id}-label`} className="sr-only">
          {token.id} visible label
        </label>
        <input
          id={`icons-${token.id}-label`}
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
          aria-describedby={labelError ? `icons-${token.id}-label-error` : undefined}
          className={`min-h-11 w-full max-w-xs rounded-lg border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${labelError ? "border-destructive" : "border-border"}`}
        />
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p id={`icons-${token.id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : labelError ? (
          <p id={`icons-${token.id}-label-error`} role="alert" className="text-xs font-medium text-destructive">
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

function AddSizeForm({
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
  const [unit, setUnit] = useState<"px" | "rem">("px")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const numeric = Number(amount.trim())
    const result = createIconSize(
      {
        id: customId.trim() ? customId : undefined,
        label: label.trim() ? label : undefined,
        description: description.trim() ? description : undefined,
        amount: numeric,
        unit,
      },
      sizesOf(system).map((token) => token.id),
    )
    if (!result.ok) {
      setError(result.error)
      return
    }
    save({
      ...system,
      foundations: {
        ...system.foundations,
        icons: { ...system.foundations.icons, sizes: [...sizesOf(system), result.token] },
      },
    })
    onDone()
  }

  return (
    <div id="add-icon-size-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="add-icon-size-form-label" className="text-sm font-medium">
            Token name
          </label>
          <input
            id="add-icon-size-form-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Hero glyph"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="add-icon-size-form-id" className="text-sm font-medium">
            Token id <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-icon-size-form-id"
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
          <label htmlFor="add-icon-size-form-amount" className="text-sm font-medium">
            Size value
          </label>
          <input
            id="add-icon-size-form-amount"
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
          <label htmlFor="add-icon-size-form-unit" className="text-sm font-medium">
            Unit
          </label>
          <select
            id="add-icon-size-form-unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value as "px" | "rem")}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="px">px — fixed pixels</option>
            <option value="rem">rem — relative to root</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="add-icon-size-form-description" className="text-sm font-medium">
            Usage <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="add-icon-size-form-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Empty-state illustrations"
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
          Add size
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

function StyleSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const icons = system.foundations.icons
  const [error, setError] = useState<string | null>(null)
  const [strokeDraft, setStrokeDraft] = useState<string | null>(null)

  const run = (result: { ok: true; system: DesignSystemConfig } | { ok: false; error: string }) => {
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    save(result.system)
  }

  return (
    <section aria-label="Stroke treatment" className="rounded-xl border border-border bg-background p-5">
      <h2 className="font-medium">Stroke treatment</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Real Lucide settings only — stroke width, caps, and joins. There is no global filled style in Lucide, so none is offered.
      </p>
      <div className="mt-4">
        <p id="stroke-presets-label" className="text-sm font-medium">
          Stroke presets
        </p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="stroke-presets-label">
          {STROKE_PRESETS.map((preset) => {
            const active = icons.strokeWidth === preset.width
            return (
              <button
                key={preset.id}
                aria-pressed={active}
                title={preset.description}
                onClick={() => run(setStrokeWidth(system, preset.width))}
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-foreground bg-muted/60" : "border-border hover:bg-muted/60"}`}
              >
                <Bell aria-hidden="true" style={{ width: 18, height: 18, strokeWidth: preset.width }} />
                {preset.label}
                <span className="font-mono text-xs text-muted-foreground">{preset.width}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="icons-stroke-width" className="text-sm font-medium">
            Stroke width
          </label>
          <input
            id="icons-stroke-width"
            value={strokeDraft ?? String(icons.strokeWidth)}
            inputMode="decimal"
            onChange={(event) => {
              setStrokeDraft(event.target.value)
              setError(null)
            }}
            onBlur={() => {
              if (strokeDraft === null) return
              const result = setStrokeWidth(system, Number(strokeDraft))
              if (!result.ok) {
                setError(result.error)
                setStrokeDraft(null)
                return
              }
              setError(null)
              setStrokeDraft(null)
              save(result.system)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") (event.target as HTMLInputElement).blur()
            }}
            aria-describedby="icons-stroke-hint"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p id="icons-stroke-hint" className="mt-1 min-h-4 text-[11px] text-muted-foreground">0.5 to 4, rendered 1:1 at 24px.</p>
        </div>
        <div>
          <label htmlFor="icons-line-cap" className="text-sm font-medium">
            Line cap
          </label>
          <select
            id="icons-line-cap"
            value={icons.lineCap ?? "round"}
            onChange={(event) => run(setLineCap(system, event.target.value as IconLineCap))}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LINE_CAPS.map((cap) => (
              <option key={cap} value={cap}>
                {cap}
              </option>
            ))}
          </select>
          <p className="mt-1 min-h-4 text-[11px] text-muted-foreground">Stroke ends.</p>
        </div>
        <div>
          <label htmlFor="icons-line-join" className="text-sm font-medium">
            Line join
          </label>
          <select
            id="icons-line-join"
            value={icons.lineJoin ?? "round"}
            onChange={(event) => run(setLineJoin(system, event.target.value as IconLineJoin))}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LINE_JOINS.map((join) => (
              <option key={join} value={join}>
                {join}
              </option>
            ))}
          </select>
          <p className="mt-1 min-h-4 text-[11px] text-muted-foreground">Stroke corners.</p>
        </div>
      </div>
      <div className="mt-2">
        <button
          onClick={() => {
            save(resetIconStyleToStarter(system))
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset style to starter
        </button>
        <p className="mt-1 text-xs text-muted-foreground">Restores stroke width, caps, and joins only — sizes and colors are untouched.</p>
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

function ColorsSection({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [customHex, setCustomHex] = useState<Partial<Record<string, string>>>({})
  const options = useMemo(() => iconColorOptions(system), [system])
  const colors = system.foundations.icons.colors

  return (
    <section aria-label="Icon color roles" className="rounded-xl border border-border bg-background p-5">
      <h2 className="font-medium">Color roles</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Palette-shade references, not duplicated values. These are foundation defaults — the Semantic Tokens phase will map and refine them.
      </p>
      <ul className="mt-4 space-y-3">
        {ICON_COLOR_ROLES.map((role) => {
          const current = colors[role.id]
          const resolved = resolveIconColor(system, role.id)
          const showCustom = customHex[role.id] !== undefined || ![...options.map((o) => o.value)].includes(current)
          return (
            <li key={role.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border p-3">
              <span
                aria-hidden="true"
                className="block size-11 shrink-0 rounded-lg border border-black/10 dark:border-white/10"
                style={{ background: resolved ?? "transparent" }}
              />
              <div className="min-w-0 flex-1 basis-40">
                <p className="text-sm font-medium">
                  {role.label}
                  <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">{current}</span>
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  → {resolved ?? "unresolved — pick a shade that exists"}
                </p>
              </div>
              <div className="flex min-w-0 flex-1 basis-64 flex-wrap items-center gap-2">
                <label htmlFor={`icons-color-${role.id}`} className="sr-only">
                  {role.label} icon color reference
                </label>
                <select
                  id={`icons-color-${role.id}`}
                  value={showCustom ? "__custom__" : current}
                  onChange={(event) => {
                    if (event.target.value === "__custom__") {
                      setCustomHex((prev) => ({ ...prev, [role.id]: current.startsWith("#") ? current : "" }))
                      setError(null)
                      return
                    }
                    setCustomHex((prev) => {
                      const next = { ...prev }
                      delete next[role.id]
                      return next
                    })
                    const result = setIconColor(system, role.id, event.target.value)
                    if (!result.ok) {
                      setError(result.error)
                      return
                    }
                    setError(null)
                    save(result.system)
                  }}
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
                  <option value="__custom__">Custom hex value…</option>
                </select>
              </div>
              {showCustom && (
                <div className="flex w-full items-center gap-2">
                  <label htmlFor={`icons-color-${role.id}-hex`} className="sr-only">
                    {role.label} custom hex color
                  </label>
                  <input
                    id={`icons-color-${role.id}-hex`}
                    value={customHex[role.id] ?? current}
                    onChange={(event) => {
                      setCustomHex((prev) => ({ ...prev, [role.id]: event.target.value }))
                      setError(null)
                    }}
                    onBlur={() => {
                      const next = (customHex[role.id] ?? current).trim()
                      if (next === current) {
                        setCustomHex((prev) => {
                          const rest = { ...prev }
                          delete rest[role.id]
                          return rest
                        })
                        return
                      }
                      const result = setIconColor(system, role.id, next)
                      if (!result.ok) {
                        setError(result.error)
                        return
                      }
                      setError(null)
                      setCustomHex((prev) => {
                        const rest = { ...prev }
                        delete rest[role.id]
                        return rest
                      })
                      save(result.system)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") (event.target as HTMLInputElement).blur()
                    }}
                    spellCheck={false}
                    maxLength={7}
                    placeholder="#8a8a93"
                    className="min-h-11 w-full max-w-xs rounded-lg border border-border bg-background px-2.5 font-mono text-[13px] uppercase outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
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

function useIconRender(system: DesignSystemConfig) {
  const icons = system.foundations.icons
  const rendered = isRenderedSource(icons.library)
  const sizePx = (tokenId: string | null | undefined): number | null => {
    const id = tokenId ?? icons.defaultSize
    const token = ensureIconSizes(icons.sizes).find((entry) => entry.id === id)
      ?? ensureIconSizes(icons.sizes)[0]
    if (!token) return null
    return pxOfIconSize(token)
  }
  return {
    rendered,
    library: icons.library,
    strokeWidth: icons.strokeWidth,
    lineCap: icons.lineCap ?? "round",
    lineJoin: icons.lineJoin ?? "round",
    sizePx,
    defaultSizeId: icons.defaultSize,
  }
}

function IconsPreview({ system, selectedId }: { system: DesignSystemConfig; selectedId: string | null }) {
  const render = useIconRender(system)
  const { themeOptions, activeThemeId, selectTheme } = usePreviewTheme(system)
  const textColor = (() => {
    const resolved = resolveToken(system, "text.primary", activeThemeId)
    return resolved.status === "resolved" ? resolved.value : "#18181b"
  })()
  const mutedColor = (() => {
    const resolved = resolveToken(system, "text.muted", activeThemeId)
    return resolved.status === "resolved" ? resolved.value : "#71717a"
  })()
  const surface = (() => {
    const resolved = resolveToken(system, "background.surface", activeThemeId)
    if (resolved.status === "resolved") return resolved.value
    const canvas = resolveToken(system, "background.canvas", activeThemeId)
    return canvas.status === "resolved" ? canvas.value : "#fafafa"
  })()
  const radius = radiusValueFor(system, "md") ?? "8px"
  const border = (() => {
    const resolved = resolveBorderRecipe(system, "border.default", activeThemeId)
    return resolved ? resolved.css : "1px solid #e4e4e7"
  })()

  const colorFor = (role: Parameters<typeof resolveIconColor>[1]): string => {
    const hex = resolveIconColor(system, role, activeThemeId)
    if (hex) return hex
    const fallback = resolveToken(system, "text.primary", activeThemeId)
    return fallback.status === "resolved" ? fallback.value : "#18181b"
  }

  // Button text pairs with the action background — never a hardcoded white,
  // which fails on light custom action colors.
  const actionFg = (() => {
    const resolved = resolveToken(system, "action.primary.foreground", activeThemeId)
    return resolved.status === "resolved" ? resolved.value : "#ffffff"
  })()

  const mark = (usedId: string | null) =>
    selectedId && usedId === selectedId
      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
      : ""

  const iconProps = (sizeId: string | null) => {
    const px = render.sizePx(sizeId) ?? 20
    return {
      width: px,
      height: px,
      size: px,
      strokeWidth: render.strokeWidth,
      strokeLinecap: render.lineCap as "round" | "butt" | "square",
      strokeLinejoin: render.lineJoin as "round" | "miter" | "bevel",
    }
  }

  const caption = (sizeId: string | null): string => {
    const id = sizeId ?? render.defaultSizeId
    const token = ensureIconSizes(system.foundations.icons.sizes).find((entry) => entry.id === id)
    return token ? `${token.id} · ${token.value} · stroke ${render.strokeWidth}` : `${id} · unconfigured`
  }

  const sizes = ensureIconSizes(system.foundations.icons.sizes)
  const selectedToken = selectedId ? sizes.find((entry) => entry.id === selectedId) ?? null : null

  return (
    <aside aria-label="Icon preview" className="h-fit rounded-xl border border-border bg-background p-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Source: <span className="font-medium text-foreground">{render.rendered ? "Lucide (rendered)" : "Custom (metadata only)"}</span>
        {selectedToken ? (
          <> · Selected: <span className="font-mono font-medium text-foreground">{selectedToken.id} · {selectedToken.value}</span></>
        ) : (
          <> · Select a size to highlight where it applies.</>
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

      {!render.rendered ? (
        <div role="status" className="mt-4 rounded-lg border border-dashed border-border p-4">
          <p className="text-sm font-medium">Custom source has no renderer</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            “{render.library}” is stored as configuration only — there is no SVG asset pipeline, so no icons render here.
            Sizes, stroke, and colors above still apply once assets exist.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3" aria-hidden="true">
            {sizes.slice(0, 5).map((token) => {
              const px = pxOfIconSize(token) ?? 16
              return (
                <span key={token.id} className="flex flex-col items-center gap-1">
                  <span className="block rounded border border-dashed border-border" style={{ width: px, height: px }} />
                  <span className="font-mono text-[10px] text-muted-foreground">{token.id}</span>
                </span>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <section aria-label="Button with icon preview" className={`rounded-lg ${mark("icon-md")}`}>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">BUTTON · {caption("icon-md")}</p>
            <button
              tabIndex={-1}
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium"
              style={{ background: colorFor("action"), color: actionFg, borderRadius: radius }}
            >
              <Bell aria-hidden="true" {...iconProps("icon-md")} />
              Notifications
            </button>
          </section>

          <section aria-label="Icon-only button preview" className={`rounded-lg ${mark(selectedToken?.id ?? "icon-md")}`}>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">ICON-ONLY BUTTON · {caption(selectedToken?.id ?? "icon-md")}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                aria-label="Add item"
                className="grid size-11 place-items-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ border, color: colorFor("action"), borderRadius: radius }}
              >
                <Plus aria-hidden="true" {...iconProps(selectedToken?.id ?? "icon-md")} />
              </button>
              <button
                aria-label="Open menu"
                className="grid size-11 place-items-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ border, color: colorFor("default"), borderRadius: radius }}
              >
                <Menu aria-hidden="true" {...iconProps("icon-sm")} />
              </button>
            </div>
          </section>

          <section aria-label="Input with icons preview" className={`rounded-lg ${mark("icon-sm")}`}>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">INPUT · {caption("icon-sm")}</p>
            <label className="mt-2 block text-xs font-medium" style={{ color: textColor }} htmlFor="icons-preview-search">
              Search components
            </label>
            <div className="relative mt-1.5">
              <Search aria-hidden="true" {...iconProps("icon-sm")} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" color={colorFor("muted")} />
              <input
                id="icons-preview-search"
                placeholder="Search…"
                className="min-h-11 w-full rounded-lg border bg-transparent py-2 pl-10 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ border, color: textColor, borderRadius: radius }}
              />
              <X aria-hidden="true" {...iconProps("icon-sm")} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" color={colorFor("muted")} />
            </div>
          </section>

          <section aria-label="Navigation item preview" className={`rounded-lg ${mark("icon-md")}`}>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">NAVIGATION · {caption("icon-md")}</p>
            <div
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{ background: surface, border, borderRadius: radius }}
            >
              <Home aria-hidden="true" {...iconProps("icon-md")} color={colorFor("action")} />
              <span className="text-sm font-medium" style={{ color: textColor }}>Home</span>
              <span className="ml-auto font-mono text-[11px]" style={{ color: mutedColor }}>12</span>
            </div>
          </section>

          <section aria-label="Alert previews" className="rounded-lg">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">ALERTS · icon-sm</p>
            <div className="mt-2 space-y-2">
              <p className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${mark("icon-sm")}`} style={{ border, background: surface, color: textColor, borderRadius: radius }}>
                <Check aria-hidden="true" {...iconProps("icon-sm")} color={colorFor("success")} />
                <span><span className="font-medium">Saved successfully.</span> <span style={{ color: mutedColor }}>Your changes are safe.</span></span>
              </p>
              <p className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${mark("icon-sm")}`} style={{ border, background: surface, color: textColor, borderRadius: radius }}>
                <TriangleAlert aria-hidden="true" {...iconProps("icon-sm")} color={colorFor("warning")} />
                <span><span className="font-medium">Storage almost full.</span> <span style={{ color: mutedColor }}>Free up space soon.</span></span>
              </p>
            </div>
          </section>

          <section aria-label="Empty state preview" className={`rounded-lg ${mark("icon-xl")}`}>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">EMPTY STATE · {caption("icon-xl")}</p>
            <div
              className="mt-2 rounded-lg border p-5 text-center"
              style={{ border, background: surface, borderRadius: radius }}
            >
              <User aria-hidden="true" {...iconProps("icon-xl")} color={colorFor("muted")} className="mx-auto" />
              <p className="mt-2 text-sm font-medium" style={{ color: textColor }}>No team members yet</p>
              <p className="mt-0.5 text-xs" style={{ color: mutedColor }}>Invite people to get started.</p>
            </div>
          </section>
        </div>
      )}

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Preview token sources
        </summary>
        <ul className="mt-2 space-y-1">
          <li className="font-mono text-[11px]">source ← {render.library}{render.rendered ? " (rendered)" : " (metadata only)"}</li>
          <li className="font-mono text-[11px]">stroke ← {render.strokeWidth} · {render.lineCap} / {render.lineJoin}</li>
          {sizes.map((token) => (
            <li key={token.id} className="font-mono text-[11px]">
              {token.id} ← {token.value}
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
