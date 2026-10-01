"use client"

import {
  AlertTriangle,
  Check,
  Copy,
  Info,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import type { DesignSystemConfig, Theme } from "@/lib/design-system/domain"
import { isHexColor, resolveToken } from "@/lib/design-system/domain"
import { categoryLabel, groupTokensByCategory } from "@/lib/design-system/semantic-tokens"
import { contrastRatio } from "@/lib/design-system/validation"
import {
  canDeleteTheme,
  clearThemeOverrides,
  createTheme,
  duplicateTheme,
  ensureRequiredThemes,
  findTheme,
  formatThemeChain,
  hasCustomThemeEdits,
  insertTheme,
  invalidOverrideKeys,
  isRequiredThemeId,
  listThemes,
  removeOverride,
  removeTheme,
  resetOverrideToStarter,
  restoreThemeToStarter,
  setOverride,
  slugifyThemeId,
  summarizeTheme,
  themeIssues,
  tokenThemeState,
  updateThemeLabel,
  updateThemeMode,
  validOverrideCandidates,
} from "@/lib/design-system/themes"

export function ThemesEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const themes = listThemes(system)
  const [selectedId, setSelectedId] = useState<string>(
    themes.some((theme) => theme.id === "light") ? "light" : (themes[0]?.id ?? "light"),
  )
  const selected = findTheme(system, selectedId) ?? themes[0]

  return (
    <>
      <PageHeader
        eyebrow="Design System / Themes"
        title="Themes"
        description="Keep the same colour roles across your product, then choose how those roles look in Light, Dark, or a custom theme."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <MissingThemesBanner system={system} save={save} />
          <ThemeGuide />
          <ThemeCards
            system={system}
            save={save}
            selectedId={selected?.id ?? selectedId}
            onSelect={setSelectedId}
          />
          {selected && (
            <>
              <ThemeEssentials key={`essentials-${selected.id}`} system={system} save={save} theme={selected} />
              <details className="rounded-xl border border-border bg-background">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-sm font-medium marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span>Advanced theme settings</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Search and change any colour role
                  </span>
                </summary>
                <div className="border-t border-border p-3 sm:p-5">
                  <OverrideTable key={selected.id} system={system} save={save} theme={selected} />
                </div>
              </details>
            </>
          )}
        </div>
        {selected && <ThemePreview system={system} theme={selected} />}
      </div>
    </>
  )
}

function ThemeGuide() {
  return (
    <section aria-label="How themes work" className="rounded-xl border border-border bg-muted/20 p-5">
      <h2 className="text-base font-semibold">One interface, different appearances</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
        The purpose of each colour stays the same. A theme only changes the colour used for that purpose.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium">1. Keep the role</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">“Main text” always means readable primary content.</p>
        </div>
        <div>
          <p className="text-sm font-medium">2. Change its colour</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Light may use dark text; Dark may use light text.</p>
        </div>
        <div>
          <p className="text-sm font-medium">3. Components follow</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Buttons, cards, inputs, and alerts update together.</p>
        </div>
      </div>
    </section>
  )
}

function MissingThemesBanner({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const hasLight = listThemes(system).some((theme) => theme.id === "light")
  const hasDark = listThemes(system).some((theme) => theme.id === "dark")
  const [added, setAdded] = useState<string[] | null>(null)
  if (hasLight && hasDark && !added) return null
  const missing = [
    ...(hasLight ? [] : ["light"]),
    ...(hasDark ? [] : ["dark"]),
  ]
  return (
    <section aria-label="Missing required themes" className="rounded-xl border border-border bg-background p-5">
      {missing.length > 0 ? (
        <>
          <h2 className="font-medium">Older system, missing required themes ({missing.join(", ")})</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Every system keeps a Light and a Dark theme. Adding restores the absent starter
            themes only — your overrides and custom themes stay untouched.
          </p>
          <button
            onClick={() => {
              const result = ensureRequiredThemes(system)
              save(result.system)
              setAdded(result.added)
            }}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add missing theme defaults
          </button>
        </>
      ) : (
        <p role="status" className="text-xs text-muted-foreground">
          <Check className="mr-1 inline size-4" aria-hidden="true" />
          Restored {added?.join(", ")}. Nothing existing was changed.
        </p>
      )}
    </section>
  )
}

function ThemeCards({
  system,
  save,
  selectedId,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const themes = listThemes(system)

  return (
    <section aria-label="Themes" className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Choose a theme</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Light and Dark are ready to use. Create another only when your product needs a distinct appearance.</p>
        </div>
        <button
          onClick={() => setShowCreate((open) => !open)}
          aria-expanded={showCreate}
          aria-controls="create-theme-form"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          {showCreate ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {showCreate ? "Close" : "Create custom theme"}
        </button>
      </div>
      {showCreate && (
        <CreateThemeForm
          system={system}
          save={save}
          onDone={(id) => {
            setShowCreate(false)
            if (id) onSelect(id)
          }}
        />
      )}
      <div className="mt-4 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Select theme">
        {themes.map((theme) => {
          const summary = summarizeTheme(system, theme.id)
          const active = selectedId === theme.id
          return (
            <div
              key={theme.id}
              role="tab"
              aria-selected={active}
              className={`rounded-lg border p-3 transition-colors ${active ? "border-foreground bg-muted/60" : "border-border"}`}
            >
              <button
                onClick={() => onSelect(theme.id)}
                aria-label={`Select theme ${theme.label}`}
                className="min-h-11 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                <span className="block truncate text-sm font-medium">
                  {theme.label}
                  {summary?.required && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Required
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] capitalize text-muted-foreground">{theme.mode} appearance</span>
                <span className="mt-2 flex overflow-hidden rounded-md border border-border" aria-hidden="true">
                  {["background.canvas", "surface.default", "text.primary", "action.primary.background"].map((id) => (
                    <span key={id} className="h-7 flex-1" style={{ backgroundColor: resolveThemeColor(system, id, theme.id) }} />
                  ))}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {summary
                    ? summary.invalid > 0
                      ? `${summary.invalid} colour ${summary.invalid === 1 ? "needs" : "need"} attention`
                      : summary.overridden === 0
                        ? "Uses all base colours"
                        : `${summary.overridden} customised colours`
                    : ""}
                </span>
              </button>
              <details className="mt-2 border-t border-border pt-1">
                <summary className="inline-flex min-h-10 cursor-pointer items-center text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Theme options
                </summary>
                <ThemeCardActions system={system} save={save} theme={theme} onSelect={onSelect} />
              </details>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ThemeCardActions({
  system,
  save,
  theme,
  onSelect,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  theme: Theme
  onSelect: (id: string) => void
}) {
  const [labelDraft, setLabelDraft] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingRestore, setConfirmingRestore] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const required = isRequiredThemeId(theme.id)
  const guard = canDeleteTheme(system, theme.id)
  const customEdits = required && hasCustomThemeEdits(system, theme.id)

  const commitLabel = () => {
    const trimmed = (labelDraft ?? theme.label).trim()
    setLabelDraft(null)
    if (trimmed && trimmed !== theme.label) save(updateThemeLabel(system, theme.id, trimmed))
  }

  return (
    <div className="mt-2 border-t border-border pt-2">
      <div className="flex items-center gap-2">
        <label htmlFor={`themes-${theme.id}-label`} className="sr-only">
          {theme.id} label
        </label>
        <input
          id={`themes-${theme.id}-label`}
          value={labelDraft ?? theme.label}
          onChange={(event) => setLabelDraft(event.target.value)}
          onBlur={commitLabel}
          onKeyDown={(event) => {
            if (event.key === "Enter") (event.target as HTMLInputElement).blur()
          }}
          maxLength={60}
          className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={`Mode for theme ${theme.id}`}>
        {(["light", "dark"] as const).map((entry) => (
          <button
            key={entry}
            aria-pressed={theme.mode === entry}
            onClick={() => {
              if (theme.mode !== entry) save(updateThemeMode(system, theme.id, entry))
            }}
            className={`inline-flex min-h-11 items-center rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${theme.mode === entry ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            {entry === "light" ? "Light" : "Dark"}
          </button>
        ))}
        <button
          onClick={() => {
            const copy = duplicateTheme(system, theme.id)
            if (copy) {
              save(insertTheme(system, copy))
              onSelect(copy.id)
            }
          }}
          aria-label={`Duplicate theme ${theme.id} as a custom theme`}
          title="Duplicate as a custom theme"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <Copy className="size-4" aria-hidden="true" />
        </button>
        {required ? (
          !confirmingRestore ? (
            <button
              onClick={() => (customEdits ? setConfirmingRestore(true) : undefined)}
              aria-label={`Restore ${theme.id} starter defaults`}
              title={customEdits ? "Restore starter defaults" : "Already at starter defaults"}
              disabled={!customEdits}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              <button
                onClick={() => setConfirmingRestore(false)}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  const next = restoreThemeToStarter(system, theme.id)
                  if (next) save(next)
                  setConfirmingRestore(false)
                }}
                aria-label={`Confirm restore of ${theme.id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-2.5 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                Restore
              </button>
            </span>
          )
        ) : !confirmingClear ? (
          <button
            onClick={() => setConfirmingClear(true)}
            aria-label={`Clear all overrides on ${theme.id}`}
            title="Clear all overrides"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <span className="flex items-center gap-1.5">
            <button
              onClick={() => setConfirmingClear(false)}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Keep
            </button>
            <button
              onClick={() => {
                const result = clearThemeOverrides(system, theme.id)
                if (result.ok) save(result.system)
                setConfirmingClear(false)
              }}
              aria-label={`Confirm clearing all overrides on ${theme.id}`}
              className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-2.5 text-xs font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Clear all
            </button>
          </span>
        )}
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Delete theme ${theme.id}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ) : guard.ok ? (
          <span className="flex items-center gap-1.5">
            <button
              onClick={() => setConfirmingDelete(false)}
              aria-label={`Keep theme ${theme.id}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Keep
            </button>
            <button
              onClick={() => {
                save(removeTheme(system, theme.id))
                setConfirmingDelete(false)
                onSelect("light")
              }}
              aria-label={`Confirm deletion of theme ${theme.id}`}
              className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-2.5 text-xs font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Delete
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmingDelete(false)}
            aria-label={`Understood, keep theme ${theme.id}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            Understood
          </button>
        )}
      </div>
      <div className="mt-1 min-h-5" aria-live="polite">
        {!guard.ok && confirmingDelete && (
          <p className="text-xs text-muted-foreground">{guard.reasons[0]}</p>
        )}
      </div>
    </div>
  )
}

function CreateThemeForm({
  system,
  save,
  onDone,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  onDone: (id?: string) => void
}) {
  const [label, setLabel] = useState("")
  const [mode, setMode] = useState<"light" | "dark">("dark")
  const [fromThemeId, setFromThemeId] = useState("dark")
  const [error, setError] = useState<string | null>(null)
  const existingIds = listThemes(system).map((theme) => theme.id)
  const previewId = label.trim() ? slugifyThemeId(label.trim(), existingIds) : "—"

  const handleCreate = () => {
    const result = createTheme(system, { label, mode, fromThemeId })
    if (!result.ok) {
      setError(result.error)
      return
    }
    save(insertTheme(system, result.theme))
    onDone(result.theme.id)
  }

  return (
    <div id="create-theme-form" className="mt-4 rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="create-theme-label" className="text-sm font-medium">
            Theme name
          </label>
          <input
            id="create-theme-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError(null)
            }}
            placeholder="e.g. Midnight"
            maxLength={60}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <span id="create-theme-mode-label" className="text-sm font-medium">
            Mode
          </span>
          <div className="mt-1.5 flex gap-2" role="group" aria-labelledby="create-theme-mode-label">
            {(["light", "dark"] as const).map((entry) => (
              <button
                key={entry}
                aria-pressed={mode === entry}
                onClick={() => {
                  setMode(entry)
                  setError(null)
                }}
                className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${mode === entry ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
              >
                {entry === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="create-theme-from" className="text-sm font-medium">
            Clone overrides from
          </label>
          <select
            id="create-theme-from"
            value={fromThemeId}
            onChange={(event) => {
              setFromThemeId(event.target.value)
              setError(null)
            }}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {listThemes(system).map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.label} ({Object.keys(theme.overrides ?? {}).length} overrides)
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground" aria-live="polite">
        Stable id preview: {previewId} (generated once; labels stay editable)
      </p>
      <div className="mt-1 min-h-5" aria-live="polite">
        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={handleCreate}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create theme
        </button>
        <button
          onClick={() => onDone()}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const THEME_ESSENTIALS = [
  { id: "background.canvas", label: "Page background", description: "The colour behind the whole interface" },
  { id: "surface.default", label: "Cards and panels", description: "The main surface placed on the page" },
  { id: "text.primary", label: "Main text", description: "Headings, labels, and important content" },
  { id: "text.secondary", label: "Supporting text", description: "Paragraphs and descriptions" },
  { id: "action.primary.background", label: "Main button", description: "The background of the primary action" },
  { id: "action.primary.foreground", label: "Main button text", description: "Text and icons on the primary action" },
  { id: "border.default", label: "Borders", description: "Cards, inputs, and quiet dividers" },
  { id: "focus.ring", label: "Keyboard focus", description: "The outline around the active control" },
] as const

function ThemeEssentials({
  system,
  save,
  theme,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  theme: Theme
}) {
  return (
    <section aria-label={`Essential colours for ${theme.label}`} className="rounded-xl border border-border bg-background p-5">
      <div>
        <p className="text-xs text-muted-foreground">Editing {theme.label}</p>
        <h2 className="mt-1 text-lg font-semibold">Set the colours people notice most</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Start with these eight roles. Any role you leave unchanged continues using its shared base colour.
        </p>
      </div>
      <ul className="mt-5 grid gap-2 lg:grid-cols-2">
        {THEME_ESSENTIALS.map((role) => (
          <ThemeRoleCard key={role.id} system={system} save={save} theme={theme} {...role} />
        ))}
      </ul>
      <ThemeContrastSummary system={system} theme={theme} />
    </section>
  )
}

function ThemeRoleCard({
  system,
  save,
  theme,
  id,
  label,
  description,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  theme: Theme
  id: string
  label: string
  description: string
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const state = tokenThemeState(system, theme.id, id)
  if (!state) return null
  const resolution = resolveToken(system, id, theme.id)
  const current = resolution.status === "resolved" ? resolution.value : null

  const choose = (value: string) => {
    const result = setOverride(system, theme.id, id, value)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setShowPicker(false)
    save(result.system)
  }

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <ResolvedDot system={system} themeId={theme.id} tokenId={id} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <button
          onClick={() => setShowPicker((open) => !open)}
          aria-expanded={showPicker}
          aria-label={`Change ${label} in ${theme.label}`}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Change
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {state.override === null ? "Using base colour" : "Theme colour"}: {" "}
          <span className="font-medium text-foreground">{friendlyThemeColour(state.override ?? state.baseValue)}</span>
        </p>
        {state.override !== null && (
          <button
            onClick={() => save(removeOverride(system, theme.id, id))}
            className="inline-flex min-h-9 items-center rounded-md px-2 font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Use base colour
          </button>
        )}
      </div>
      {showPicker && (
        <OverridePicker
          system={system}
          themeId={theme.id}
          tokenId={id}
          current={state.override}
          onPick={choose}
          onClose={() => {
            setShowPicker(false)
            setError(null)
          }}
        />
      )}
      {error && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      {current && <span className="sr-only">Resolved colour {current}</span>}
    </li>
  )
}

function friendlyThemeColour(value: string): string {
  const rawHex: boolean = isHexColor(value)
  if (rawHex) return value.toUpperCase()
  const shade = value.match(/^([a-z0-9-]+)\.(\d+)$/i)
  if (shade) return `${shade[1]![0]!.toUpperCase()}${shade[1]!.slice(1)} ${shade[2]}`
  return "Matches another shared colour"
}

function ThemeContrastSummary({ system, theme }: { system: DesignSystemConfig; theme: Theme }) {
  const pairs = [
    { label: "Main text on page", foreground: "text.primary", background: "background.canvas" },
    { label: "Main button text", foreground: "action.primary.foreground", background: "action.primary.background" },
  ].map((pair) => {
    const foreground = resolveThemeColor(system, pair.foreground, theme.id)
    const background = resolveThemeColor(system, pair.background, theme.id)
    return { ...pair, ratio: contrastRatio(foreground, background) }
  })

  return (
    <div className="mt-5 border-t border-border pt-4">
      <h3 className="text-sm font-semibold">Quick readability check</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Normal text should reach at least 4.5:1. Full accessibility review remains available in Validate.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {pairs.map((pair) => {
          const passes = pair.ratio !== null && pair.ratio >= 4.5
          return (
            <li key={pair.label} className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <span className="text-xs font-medium">{pair.label}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${passes ? "text-foreground" : "text-amber-700 dark:text-amber-300"}`}>
                {passes ? <Check className="size-4" aria-hidden="true" /> : <AlertTriangle className="size-4" aria-hidden="true" />}
                {pair.ratio === null ? "Could not check" : `${pair.ratio.toFixed(2)}:1 ${passes ? "Pass" : "Needs attention"}`}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function OverrideTable({
  system,
  save,
  theme,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  theme: Theme
}) {
  const [query, setQuery] = useState("")
  const [overriddenOnly, setOverriddenOnly] = useState(false)
  const groups = groupTokensByCategory(system.semanticTokens ?? [])
  const issues = themeIssues(system).filter((issue) => issue.path.includes(`themes`))
  const invalidKeys = invalidOverrideKeys(system, theme.id)
  const needle = query.trim().toLowerCase()

  const visibleGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        tokens: group.tokens.filter((token) => {
          if (overriddenOnly && theme.overrides?.[token.id] === undefined) return false;
          if (!needle) return true;
          return (
            token.id.toLowerCase().includes(needle) ||
            token.label.toLowerCase().includes(needle) ||
            group.category.includes(needle)
          );
        }),
      }))
      .filter((group) => group.tokens.length > 0)
  }, [groups, needle, overriddenOnly, theme.overrides])

  return (
    <section aria-label={`Overrides for theme ${theme.label}`} className="p-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">
          Overrides · {theme.label}{" "}
          <span className="font-mono text-xs font-normal text-muted-foreground">
            ({Object.keys(theme.overrides ?? {}).length} set)
          </span>
        </h2>
        <button
          aria-pressed={overriddenOnly}
          onClick={() => setOverriddenOnly((value) => !value)}
          className={`inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${overriddenOnly ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
        >
          Overridden only
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <label htmlFor={`themes-${theme.id}-search`} className="sr-only">
          Filter tokens by name or category
        </label>
        <input
          id={`themes-${theme.id}-search`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by token name or category…"
          className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {invalidKeys.length > 0 && (
        <div role="alert" className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <p className="text-xs font-medium">Unknown override keys (not semantic tokens):</p>
          <ul className="mt-1 space-y-1">
            {invalidKeys.map((key) => (
              <li key={key} className="flex items-center justify-between gap-2 font-mono text-[11px]">
                <span className="min-w-0 flex-1 truncate">{key}</span>
                <button
                  onClick={() => save(removeOverride(system, theme.id, key))}
                  aria-label={`Remove unknown override ${key}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 space-y-6">
        {visibleGroups.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold">
              {categoryLabel(group.category)}{" "}
              <span className="font-normal text-muted-foreground">({group.tokens.length})</span>
            </h3>
            <ul className="mt-2 space-y-2">
              {group.tokens.map((token) => (
                <OverrideRow key={token.id} system={system} save={save} theme={theme} tokenId={token.id} />
              ))}
            </ul>
          </div>
        ))}
        {visibleGroups.length === 0 && (
          <p className="text-sm text-muted-foreground">No tokens match this filter.</p>
        )}
      </div>
      {issues.length > 0 && (
        <div role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
          {issues.slice(0, 10).map((issue) => (
            <p key={`${issue.path}-${issue.message}`}>{issue.message}</p>
          ))}
          {issues.length > 10 && <p>…and {issues.length - 10} more.</p>}
        </div>
      )}
    </section>
  )
}

function OverrideRow({
  system,
  save,
  theme,
  tokenId,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  theme: Theme
  tokenId: string
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const state = tokenThemeState(system, theme.id, tokenId)
  if (!state) return null
  const token = system.semanticTokens.find((entry) => entry.id === tokenId)

  const pickValue = (value: string) => {
    const result = setOverride(system, theme.id, tokenId, value)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setShowPicker(false)
    save(result.system)
  }

  const statusBadge =
    state.status === "overridden" ? (
      <span className="rounded-full bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">Overridden</span>
    ) : state.status === "invalid" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-medium text-white">
        <AlertTriangle className="size-3" aria-hidden="true" />
        Invalid
      </span>
    ) : (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Inherited</span>
    )

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-48">
          <p className="truncate text-[13px] font-medium">{token?.label ?? tokenId}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{tokenId}</p>
        </div>
        <ResolvedDot system={system} themeId={theme.id} tokenId={tokenId} />
        {statusBadge}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPicker((open) => !open)}
            aria-expanded={showPicker}
            aria-label={state.override === null ? `Add override for ${tokenId}` : `Edit override for ${tokenId}, currently ${state.override}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 font-mono text-[12px] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            {state.override ?? "Inherit"}
          </button>
          {state.override !== null &&
            (resetOverrideToStarter(system, theme.id, tokenId) ? (
              <button
                onClick={() => {
                  const next = resetOverrideToStarter(system, theme.id, tokenId)
                  if (next) save(next)
                }}
                aria-label={`Reset ${tokenId} to starter default`}
                title="Reset to starter default"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                onClick={() => save(removeOverride(system, theme.id, tokenId))}
                aria-label={`Remove override for ${tokenId}, inherit base value`}
                title="Remove override (inherit base)"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ))}
        </div>
      </div>
      {showPicker && (
        <OverridePicker
          system={system}
          themeId={theme.id}
          tokenId={tokenId}
          current={state.override}
          onPick={pickValue}
          onClose={() => {
            setShowPicker(false)
            setError(null)
          }}
        />
      )}
      <div className="mt-1 min-h-5" aria-live="polite">
        {error ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : (
          <p className="font-mono text-[11px] leading-5 text-muted-foreground">
            base {state.baseValue} → inherited {state.inheritedValue}
            {state.override !== null && <> · override {state.override}</>}
            {state.effectiveValue !== null && <> → effective {state.effectiveValue}</>}
            {state.effectiveChain.length > 0 && <> · {formatThemeChain(state.effectiveChain)}</>}
            {state.status === "invalid" && state.reason ? ` · ${state.reason}` : ""}
          </p>
        )}
      </div>
    </li>
  )
}

function ResolvedDot({ system, themeId, tokenId }: { system: DesignSystemConfig; themeId: string; tokenId: string }) {
  const resolution = resolveToken(system, tokenId, themeId)
  const color = resolution.status === "resolved" && isHexColor(resolution.value) ? resolution.value : "transparent"
  return (
    <span
      aria-hidden="true"
      className="inline-block size-8 shrink-0 rounded-full border border-border"
      style={{ backgroundColor: color }}
      title={resolution.status === "resolved" ? resolution.value : (resolution.reason ?? "Unresolved")}
    />
  )
}

function OverridePicker({
  system,
  themeId,
  tokenId,
  current,
  onPick,
  onClose,
}: {
  system: DesignSystemConfig
  themeId: string
  tokenId: string
  current: string | null
  onPick: (value: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [hexDraft, setHexDraft] = useState("")
  const [hexError, setHexError] = useState<string | null>(null)
  const candidates = useMemo(
    () => validOverrideCandidates(system, themeId, tokenId),
    [system, themeId, tokenId],
  )
  const needle = query.trim().toLowerCase()
  const foundations = candidates.foundations.filter((id) => id.toLowerCase().includes(needle)).slice(0, 40)
  const aliases = candidates.aliases.filter((id) => id.toLowerCase().includes(needle)).slice(0, 40)

  const submitHex = () => {
    const text = hexDraft.trim()
    if (!isHexColor(text)) {
      setHexError("Enter a valid six-digit hex color, e.g. #635bff.")
      return
    }
    setHexError(null)
    onPick(text)
  }

  return (
    <div className="mt-2 rounded-lg border border-dashed border-border p-3" role="dialog" aria-label={`Override picker for ${tokenId} in theme ${themeId}`}>
      <p className="text-[11px] text-muted-foreground">
        Overrides replace this token&apos;s value for {themeId} only — the base semantic token is never changed.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <label htmlFor={`override-picker-${themeId}-${tokenId}-search`} className="sr-only">
          Filter palette shades and semantic aliases
        </label>
        <input
          id={`override-picker-${themeId}-${tokenId}-search`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter shades and aliases…"
          className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          onClick={onClose}
          aria-label="Close override picker"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-2 grid max-h-56 gap-4 overflow-y-auto sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold">Foundation references ({foundations.length})</p>
          <ul className="mt-1 space-y-0.5">
            {foundations.map((id) => (
              <li key={id}>
                <button
                  onClick={() => onPick(id)}
                  aria-pressed={current === id}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left font-mono text-[12px] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${current === id ? "bg-muted font-medium" : ""}`}
                >
                  <PickerDot system={system} themeId={themeId} reference={id} />
                  <span className="min-w-0 flex-1 truncate">{id}</span>
                  {current === id && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            ))}
            {foundations.length === 0 && <li className="text-xs text-muted-foreground">No shades match.</li>}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold">Semantic aliases ({aliases.length})</p>
          <p className="text-[11px] text-muted-foreground">Self and cycle-closing choices are hidden.</p>
          <ul className="mt-1 space-y-0.5">
            {aliases.map((id) => (
              <li key={id}>
                <button
                  onClick={() => onPick(id)}
                  aria-pressed={current === id}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left font-mono text-[12px] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${current === id ? "bg-muted font-medium" : ""}`}
                >
                  <PickerDot system={system} themeId={themeId} reference={id} />
                  <span className="min-w-0 flex-1 truncate">{id}</span>
                  {current === id && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            ))}
            {aliases.length === 0 && <li className="text-xs text-muted-foreground">No aliases match.</li>}
          </ul>
        </div>
      </div>
      <div className="mt-2 border-t border-border pt-2">
        <label htmlFor={`override-picker-${themeId}-${tokenId}-hex`} className="text-xs font-medium">
          Raw hex fallback <span className="font-normal text-muted-foreground">(only if no shade or alias fits)</span>
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id={`override-picker-${themeId}-${tokenId}-hex`}
            value={hexDraft}
            onChange={(event) => {
              setHexDraft(event.target.value)
              setHexError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitHex()
            }}
            placeholder="#635bff"
            spellCheck={false}
            className={`min-h-11 w-full min-w-0 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${hexError ? "border-destructive" : "border-border"}`}
          />
          <button
            onClick={submitHex}
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            Use hex
          </button>
        </div>
        {hexError && (
          <p role="alert" className="mt-1 text-xs font-medium text-destructive">
            {hexError}
          </p>
        )}
      </div>
    </div>
  )
}

function PickerDot({ system, themeId, reference }: { system: DesignSystemConfig; themeId: string; reference: string }) {
  const resolution = resolveToken(system, reference, themeId)
  const color = resolution.status === "resolved" && isHexColor(resolution.value) ? resolution.value : "transparent"
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 shrink-0 rounded-full border border-border"
      style={{ backgroundColor: color }}
    />
  )
}

function resolveThemeColor(system: DesignSystemConfig, id: string, themeId: string): string {
  const resolution = resolveToken(system, id, themeId)
  if (resolution.status === "resolved" && isHexColor(resolution.value)) return resolution.value
  return "transparent"
}

function ThemePreview({ system, theme }: { system: DesignSystemConfig; theme: Theme }) {
  const themeId = theme.id
  const canvas = resolveThemeColor(system, "background.canvas", themeId)
  const surface = resolveThemeColor(system, "surface.default", themeId)
  const subtle = resolveThemeColor(system, "background.subtle", themeId)
  const cardBorder = resolveThemeColor(system, "border.default", themeId)
  const heading = resolveThemeColor(system, "text.primary", themeId)
  const body = resolveThemeColor(system, "text.secondary", themeId)
  const muted = resolveThemeColor(system, "text.muted", themeId)
  const primaryBg = resolveThemeColor(system, "action.primary.background", themeId)
  const primaryFg = resolveThemeColor(system, "action.primary.foreground", themeId)
  const secondaryBg = resolveThemeColor(system, "action.secondary.background", themeId)
  const secondaryFg = resolveThemeColor(system, "action.secondary.foreground", themeId)
  const focusRing = resolveThemeColor(system, "focus.ring", themeId)
  const dangerFg = resolveThemeColor(system, "status.danger.foreground", themeId)

  const statuses = [
    { kind: "Success", fg: "status.success.foreground", bg: "status.success.background", Icon: Check },
    { kind: "Warning", fg: "status.warning.foreground", bg: "status.warning.background", Icon: AlertTriangle },
    { kind: "Danger", fg: "status.danger.foreground", bg: "status.danger.background", Icon: XCircle },
    { kind: "Info", fg: "status.info.foreground", bg: "status.info.background", Icon: Info },
  ] as const

  const inspector: Array<{ id: string; label: string }> = [
    { id: "background.canvas", label: "canvas" },
    { id: "text.primary", label: "text" },
    { id: "action.primary.background", label: "action" },
    { id: "border.default", label: "border" },
    { id: "status.success.foreground", label: "status" },
  ]

  return (
    <aside aria-label={`Theme preview for ${theme.label}`} className="h-fit rounded-xl border border-border bg-background p-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <p className="text-sm font-semibold">Live preview</p>
      <div
        role="status"
        aria-label={`Previewing theme ${theme.label} in ${theme.mode} mode`}
        className="mt-2 rounded-lg border border-foreground/30 bg-muted/50 px-3 py-2.5"
      >
        <p className="text-xs">
          <span className="font-semibold">Active theme: {theme.label}</span>
          <span className="font-mono text-muted-foreground"> · {theme.id} · {theme.mode}</span>
        </p>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border" style={{ borderColor: cardBorder, backgroundColor: canvas, ["--sys-ph" as string]: muted }}>
        <div className="border-b px-3 py-2" style={{ borderColor: cardBorder, backgroundColor: subtle }}>
          <p className="truncate text-[13px] font-semibold" style={{ color: heading }}>
            {theme.label} theme surface
          </p>
          <p className="truncate font-mono text-[10px]" style={{ color: muted }}>
            background.canvas / background.subtle
          </p>
        </div>
        <div className="space-y-2 p-3">
          <div className="rounded-lg border p-3" style={{ borderColor: cardBorder, backgroundColor: surface }}>
            <p className="text-[13px] font-semibold" style={{ color: heading }}>
              Heading uses text.primary
            </p>
            <p className="mt-0.5 text-[12px] leading-5" style={{ color: body }}>
              Body copy uses text.secondary for comfortable reading measure.
            </p>
            <p className="mt-0.5 font-mono text-[10px]" style={{ color: muted }}>
              Muted metadata · text.muted
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium"
                style={{ backgroundColor: primaryBg, color: primaryFg }}
              >
                Primary button
              </span>
              <span
                className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium"
                style={{ backgroundColor: secondaryBg, color: secondaryFg, borderColor: cardBorder }}
              >
                Secondary
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium" style={{ color: heading }} htmlFor={`theme-preview-input-${themeId}`}>
              Default, focused, and invalid input
              <input
                id={`theme-preview-input-${themeId}`}
                placeholder="you@example.com"
                className="mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border px-3 text-sm outline-none placeholder:text-[var(--sys-ph)] focus-visible:ring-2"
                style={{ borderColor: cardBorder, color: heading, backgroundColor: canvas, ["--tw-ring-color" as string]: focusRing }}
              />
            </label>
            <p className="mt-1 text-[12px] font-medium" style={{ color: dangerFg }}>
              <XCircle className="mr-1 inline size-4" aria-hidden="true" />
              Invalid state uses status.danger.foreground
            </p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: cardBorder, backgroundColor: surface }}>
            <p className="text-[13px] font-semibold" style={{ color: heading }}>
              Card on {theme.label}
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: body }}>
              Cards resolve surface.default, border.default, and text tokens through {themeId}.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2" aria-label="Status states">
        {statuses.map(({ kind, fg, bg, Icon }) => (
          <p
            key={kind}
            className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-[12px] font-medium"
            style={{
              color: resolveThemeColor(system, fg, themeId),
              backgroundColor: resolveThemeColor(system, bg, themeId),
              borderColor: resolveThemeColor(system, fg, themeId),
            }}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {kind}: {fg} on {bg}
          </p>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-border p-3" aria-label="Dialog and scrim example">
        <p className="text-[12px] font-medium" style={{ color: heading }}>
          Dialog over overlay.scrim
        </p>
        <div className="mt-2 rounded-lg p-3" style={{ backgroundColor: resolveThemeColor(system, "overlay.scrim", themeId) }}>
          <div className="rounded-lg border p-3" style={{ borderColor: cardBorder, backgroundColor: surface }}>
            <p className="text-[13px] font-semibold" style={{ color: heading }}>
              Confirm changes
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: body }}>
              The scrim dims the canvas behind dialogs.
            </p>
          </div>
        </div>
      </div>

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Inspector: inherited vs overridden
        </summary>
        <ul className="mt-2 space-y-1 font-mono text-[11px]">
          {inspector.map((row) => {
            const state = tokenThemeState(system, themeId, row.id)
            return (
              <li key={row.id}>
                {row.label} ← {state?.status ?? "unknown"}
                {state?.override ? `: ${state.override}` : ": inherits " + (state?.baseValue ?? "")} →{" "}
                {state?.effectiveValue ?? "unresolved"}
              </li>
            )
          })}
        </ul>
      </details>

      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
        The quick checks cover the most important text pairs. Validate reviews the complete system and provides detailed accessibility guidance.
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
