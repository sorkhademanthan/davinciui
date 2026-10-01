"use client"

import {
  AlertTriangle,
  Check,
  ChevronDown,
  Eye,
  Info,
  Menu,
  Monitor,
  Moon,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Tablet,
  X,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import { listThemes } from "@/lib/design-system/themes"
import {
  resolvePreview,
  type ComponentSlotPreview,
  type PreviewResolution,
} from "@/lib/design-system/preview"

const VIEWPORT_PRESETS = [
  { id: "mobile", label: "Phone", width: 390, icon: Smartphone },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "desktop", label: "Desktop", width: 1024, icon: Monitor },
  { id: "wide", label: "Wide", width: 1440, icon: Monitor },
] as const

/**
 * Read-only unified preview workspace. This component receives the system
 * without any save callback by construction: every control below only sets
 * local page state (theme, width, dialog, toast, navigation, inspector).
 */
export function DesignSystemPreview({ system }: { system: DesignSystemConfig }) {
  const themes = listThemes(system)
  const [themeId, setThemeId] = useState<string>(
    themes.some((theme) => theme.id === "light") ? "light" : (themes[0]?.id ?? "light"),
  )
  const [previewWidth, setPreviewWidth] = useState(1024)
  const [widthDraft, setWidthDraft] = useState<string | null>(null)
  const [widthError, setWidthError] = useState<string | null>(null)
  const [guides, setGuides] = useState(false)
  const [inspector, setInspector] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nav, setNav] = useState("Overview")
  const [toast, setToast] = useState<string | null>(null)
  const [osReduced, setOsReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setOsReduced(query.matches)
    const onChange = (event: MediaQueryListEvent): void => setOsReduced(event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  const model = useMemo(
    () => resolvePreview(system, themeId, previewWidth, { osPrefersReduced: osReduced }),
    [system, themeId, previewWidth, osReduced],
  )
  const activeThemeLabel = themes.find((theme) => theme.id === themeId)?.label ?? themeId

  const commitWidth = (): void => {
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

  const resetControls = (): void => {
    setThemeId(themes.some((theme) => theme.id === "light") ? "light" : (themes[0]?.id ?? "light"))
    setPreviewWidth(1024)
    setWidthDraft(null)
    setWidthError(null)
    setGuides(false)
    setInspector(false)
    setDialogOpen(false)
    setNav("Overview")
    setToast(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Design System / Review"
        title="See your system working"
        description="Try themes, screen sizes, and real interface states before you validate or export. Everything here is a read-only preview."
        action={
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
            <Eye className="size-3.5" aria-hidden="true" />
            Read only
          </span>
        }
      />
      <section aria-label="Preview setup" className="mt-6 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold">Appearance</legend>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Switch themes without changing saved settings.</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Preview appearance">
              {themes.map((theme) => {
                const ThemeIcon = theme.mode === "dark" ? Moon : Sun
                const active = themeId === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setThemeId(theme.id)}
                    className={`inline-flex min-h-11 min-w-24 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${active ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:bg-muted"}`}
                  >
                    <ThemeIcon className="size-4" aria-hidden="true" />
                    <span className="truncate">{theme.label}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="text-sm font-semibold">Screen size</legend>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Check how the layout changes across common devices.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Preview screen size">
              {VIEWPORT_PRESETS.map((preset) => {
                const PresetIcon = preset.icon
                const active = previewWidth === preset.width
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setPreviewWidth(preset.width)
                      setWidthDraft(null)
                      setWidthError(null)
                    }}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${active ? "border-foreground bg-muted text-foreground" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <PresetIcon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{preset.label}</span>
                      <span className="block text-[10px] tabular-nums opacity-70">{preset.width}px</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>

        <div className="border-t border-border bg-muted/20 px-4 py-3 sm:px-5">
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
              Advanced preview tools
              <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">Custom width, grid, tokens</span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <div className="grid gap-4 pb-2 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <label htmlFor="preview-width" className="text-xs font-medium">Custom width</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    id="preview-width"
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
                    aria-describedby={widthError ? "preview-width-error" : "preview-breakpoint"}
                    className={`h-11 w-32 rounded-xl border bg-background px-3 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring ${widthError ? "border-destructive" : "border-border"}`}
                  />
                  <span className="text-xs text-muted-foreground">pixels</span>
                </div>
                {widthError ? (
                  <p id="preview-width-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{widthError}</p>
                ) : (
                  <p id="preview-breakpoint" className="mt-1.5 text-xs text-muted-foreground">Use any width from 200 to 2560px.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Advanced preview tools">
                <button
                  type="button"
                  aria-pressed={guides}
                  onClick={() => setGuides((value) => !value)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${guides ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-muted"}`}
                >
                  <Ruler className="size-4" aria-hidden="true" />
                  Grid {guides ? "shown" : "hidden"}
                </button>
                <button
                  type="button"
                  aria-pressed={inspector}
                  onClick={() => setInspector((value) => !value)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${inspector ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-muted"}`}
                >
                  <Search className="size-4" aria-hidden="true" />
                  Tokens {inspector ? "shown" : "hidden"}
                </button>
                <button
                  type="button"
                  onClick={resetControls}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </details>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm sm:grid-cols-4">
        <PreviewFact label="Theme" value={activeThemeLabel} />
        <PreviewFact label="Breakpoint" value={model.layout.breakpointId} detail={`from ${model.layout.breakpointValue}px`} />
        <PreviewFact label="Page grid" value={`${model.layout.columns} columns`} />
        <PreviewFact label="Motion" value={model.motion.reduce ? "Reduced" : "Full"} />
      </div>

      {(model.diagnostics.unresolved.length > 0 || model.diagnostics.circular.length > 0) && (
        <div role="status" className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Some preview values need attention</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {model.diagnostics.unresolved.length} unresolved and {model.diagnostics.circular.length} circular reference{model.diagnostics.circular.length === 1 ? "" : "s"}. Open the token inspector for exact sources, then use Validate for the complete report.
            </p>
          </div>
        </div>
      )}

      <div className={`mt-4 grid min-w-0 gap-4 ${inspector ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : "grid-cols-1"}`}>
        <section aria-labelledby="live-preview-heading" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
            </div>
            <h2 id="live-preview-heading" className="text-sm font-semibold tracking-tight">Live product preview</h2>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium">
                {activeThemeLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium capitalize tabular-nums">
                {model.layout.breakpointId} · {previewWidth}px
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${model.motion.reduce ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-border bg-muted/60"}`}
              >
                <span className={`size-1.5 rounded-full ${model.motion.reduce ? "bg-amber-500" : "bg-emerald-500"}`} aria-hidden="true" />
                {model.motion.reduce ? "Reduced motion" : "Full motion"}
              </span>
            </div>
          </div>
          <div className="min-w-0 overflow-x-auto bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.09)_1px,transparent_0)] bg-[size:22px_22px] p-3 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.09)_1px,transparent_0)] sm:p-6">
            <PreviewFrame model={model} guides={guides}>
              <AppShell
                model={model}
                systemName={system.meta.name}
                nav={nav}
                onNav={setNav}
                dialogOpen={dialogOpen}
                onDialogOpen={() => setDialogOpen(true)}
                onDialogClose={() => setDialogOpen(false)}
                toast={toast}
                onToast={(message) => setToast(message)}
                onToastClose={() => setToast(null)}
              />
            </PreviewFrame>
          </div>
        </section>

        {inspector && <InspectorPanel model={model} />}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>This page checks responsive behavior and token wiring. Open Validate for measured contrast and export readiness.</p>
      </div>
    </>
  )
}

function PreviewFact({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="min-w-0 bg-background px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold capitalize">{value}</p>
      {detail && <p className="mt-0.5 truncate text-[10px] tabular-nums text-muted-foreground">{detail}</p>}
    </div>
  )
}

function PreviewFrame({
  model,
  guides,
  children,
}: {
  model: PreviewResolution
  guides: boolean
  children: ReactNode
}) {
  const frameWidth = model.layout.widthPx
  const containerMax = model.layout.containerMaxPx
  return (
    <div className="mx-auto min-w-0" style={{ width: frameWidth, maxWidth: "100%" }}>
      <div
        className="relative min-w-0 overflow-hidden rounded-xl ring-1 ring-border shadow-[0_32px_80px_-24px_rgba(0,0,0,0.35)]"
        style={{ ...(model.cssVars as CSSProperties), maxWidth: containerMax ? `${Math.min(containerMax, frameWidth)}px` : undefined, marginInline: "auto" }}
      >
        {guides && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 px-2">
            <div
              className="grid h-full"
              style={{
                gridTemplateColumns: `repeat(${model.layout.columns}, minmax(0, 1fr))`,
                columnGap: `${Math.min(model.layout.columnGapPx ?? 16, 24)}px`,
              }}
            >
              {Array.from({ length: model.layout.columns }, (_, index) => (
                <span key={index} className="block h-full rounded-[3px] bg-sky-500/10 outline outline-1 outline-sky-500/30" />
              ))}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function colorOf(model: PreviewResolution, id: string): string {
  return model.semantics[id]?.final ?? "transparent"
}

function AppShell({
  model,
  systemName,
  nav,
  onNav,
  dialogOpen,
  onDialogOpen,
  onDialogClose,
  toast,
  onToast,
  onToastClose,
}: {
  model: PreviewResolution
  systemName: string
  nav: string
  onNav: (item: string) => void
  dialogOpen: boolean
  onDialogOpen: () => void
  onDialogClose: () => void
  toast: string | null
  onToast: (message: string) => void
  onToastClose: () => void
}) {
  const wide = model.layout.columns >= 8
  const transition = model.motion.transition === "none" ? undefined : `all ${model.motion.transition}`
  const items = ["Overview", "Projects", "Team", "Reports"]
  return (
    <div style={{ backgroundColor: colorOf(model, "background.canvas"), transition }} className="motion-reduce:transition-none">
      <header
        className="flex min-w-0 flex-wrap items-center gap-2 border-b px-3 py-2"
        style={{ borderColor: colorOf(model, "border.default"), backgroundColor: colorOf(model, "background.subtle"), columnGap: `${Math.min(model.layout.columnGapPx ?? 16, 24)}px` }}
      >
        {!wide && (
          <span
            className="grid size-8 shrink-0 place-items-center rounded-md"
            style={{ backgroundColor: colorOf(model, "action.primary.background"), color: colorOf(model, "action.primary.foreground") }}
            aria-hidden="true"
          >
            <Menu className="size-4" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: colorOf(model, "text.primary"), ...fontStyle(model.typography.label) }}>
          {systemName || "Product workspace"}
        </span>
        <button
          onClick={() => onToast("Report exported — toast uses status.info tokens.")}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-xs font-medium motion-reduce:transition-none"
          style={{ backgroundColor: slotColor(model, "Button", "background", "primary"), color: slotColor(model, "Button", "foreground", "primary"), transition }}
        >
          Export
        </button>
      </header>
      <div className="flex min-w-0">
        {wide && (
          <nav aria-label="Preview sections" className="w-40 shrink-0 border-r p-2" style={{ borderColor: colorOf(model, "border.default") }}>
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item}>
                  <button
                    aria-current={nav === item ? "page" : undefined}
                    onClick={() => onNav(item)}
                    className="flex min-h-11 w-full items-center rounded-lg px-2.5 text-left text-[13px] motion-reduce:transition-none"
                    style={
                      nav === item
                        ? { backgroundColor: colorOf(model, "action.secondary.background"), color: colorOf(model, "action.secondary.foreground"), fontWeight: 600 }
                        : { color: colorOf(model, "text.secondary") }
                    }
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <main className="min-w-0 flex-1 p-3" aria-label={`${nav} content`}>
          <Toolbar model={model} />
          <ContentSections model={model} onDialogOpen={onDialogOpen} />
        </main>
      </div>
      {toast && (
        <div role="status" className="flex min-w-0 items-center gap-2 border-t px-3 py-2" style={{ borderColor: colorOf(model, "border.default"), backgroundColor: colorOf(model, "status.info.background") }}>
          <Info className="size-4 shrink-0" style={{ color: colorOf(model, "status.info.foreground") }} aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: colorOf(model, "status.info.foreground") }}>
            {toast}
          </p>
          <button
            onClick={onToastClose}
            aria-label="Dismiss notification"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border motion-reduce:transition-none"
            style={{ borderColor: colorOf(model, "status.info.foreground"), color: colorOf(model, "status.info.foreground") }}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {dialogOpen && <PreviewDialog model={model} onClose={onDialogClose} />}
    </div>
  )
}

function Toolbar({ model }: { model: PreviewResolution }) {
  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border p-2"
      style={{ borderColor: colorOf(model, "border.default"), backgroundColor: colorOf(model, "surface.default"), gap: `${Math.min(model.layout.columnGapPx ?? 16, 16)}px` }}
    >
      <span className="relative min-w-0 flex-1 basis-40">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" style={{ color: colorOf(model, "text.muted") }} aria-hidden="true" />
        <input
          aria-label="Search projects"
          placeholder="Search projects…"
          className="min-h-11 w-full min-w-0 rounded-lg border bg-transparent py-2 pl-9 pr-2 text-[13px] outline-none placeholder:text-[var(--pv-text-muted)] focus-visible:ring-2"
          style={{ borderColor: colorOf(model, "border.default"), color: colorOf(model, "text.primary") }}
        />
      </span>
      <span
        className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-xs font-medium"
        style={{ backgroundColor: colorOf(model, "action.secondary.background"), color: colorOf(model, "action.secondary.foreground") }}
      >
        Filter
      </span>
    </div>
  )
}

function ContentSections({ model, onDialogOpen }: { model: PreviewResolution; onDialogOpen: () => void }) {
  const cardCount = model.layout.columns >= 12 ? 3 : model.layout.columns >= 8 ? 2 : 1
  const transition = model.motion.transition === "none" ? undefined : `all ${model.motion.transition}`
  return (
    <div className="mt-3 grid min-w-0" style={{ rowGap: `${Math.min(model.layout.rowGapPx ?? 16, 20)}px` }}>
      <section aria-label="Page heading" className="min-w-0">
        <h2 className="break-words text-2xl font-bold" style={{ color: colorOf(model, "text.primary"), ...fontStyle(model.typography.heading) }}>
          Good morning, Maya
        </h2>
        <p className="mt-1 break-words text-sm leading-6" style={{ color: colorOf(model, "text.secondary"), ...fontStyle(model.typography.body) }}>
          Here is what needs your attention before the next product release.
        </p>
      </section>
      <section aria-label="Cards" className="mt-3 grid min-w-0" style={{ gridTemplateColumns: `repeat(${cardCount}, minmax(0, 1fr))`, gap: `${Math.min(model.layout.columnGapPx ?? 16, 24)}px` }}>
        {Array.from({ length: cardCount }, (_, index) => (
          <article
            key={index}
            className="min-w-0 rounded-lg border p-3 motion-reduce:transition-none"
            style={{
              backgroundColor: slotColor(model, "Card", "background"),
              borderColor: slotColor(model, "Card", "border"),
              color: slotColor(model, "Card", "foreground"),
              borderRadius: model.radiusMd ?? undefined,
              boxShadow: index === 0 ? (model.shadowMdCss ?? undefined) : undefined,
              transition,
            }}
          >
            <h3 className="truncate text-[13px] font-semibold">{["Design review", "Engineering handoff", "Release checklist"][index] ?? `Milestone ${index + 1}`}</h3>
            <p className="mt-0.5 line-clamp-2 break-words text-[12px] leading-5" style={{ color: colorOf(model, "text.secondary") }}>
              {["Today at 2:30 PM · 6 reviewers", "12 tokens ready for implementation", "18 of 21 launch checks complete"][index] ?? "Review the latest product updates."}
            </p>
          </article>
        ))}
      </section>
      <section aria-label="Buttons" className="mt-3 min-w-0">
        <div className="flex min-w-0 flex-wrap gap-2">
          <span
            className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium motion-reduce:transition-none"
            style={{ backgroundColor: slotColor(model, "Button", "background", "primary"), color: slotColor(model, "Button", "foreground", "primary"), borderRadius: model.radiusMd ?? undefined, transition }}
          >
            Create project
          </span>
          <span
            className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium motion-reduce:transition-none"
            style={{ backgroundColor: slotColor(model, "Button", "background", "secondary"), color: slotColor(model, "Button", "foreground", "secondary"), borderColor: slotColor(model, "Button", "border", "secondary"), borderRadius: model.radiusMd ?? undefined, transition }}
          >
            View activity
          </span>
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 cursor-not-allowed items-center rounded-lg border px-4 text-sm font-medium opacity-50"
            style={{ borderColor: colorOf(model, "border.default"), color: colorOf(model, "text.muted"), borderRadius: model.radiusMd ?? undefined }}
          >
            Archive
          </span>
        </div>
      </section>
      <section aria-label="Form" className="mt-3 min-w-0">
        <label className="block min-w-0 text-[13px] font-medium" style={{ color: colorOf(model, "text.primary"), ...fontStyle(model.typography.label) }} htmlFor="pv-email">
          Work email
          <input
            id="pv-email"
            placeholder="you@example.com"
            className="mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border bg-transparent px-3 text-sm outline-none placeholder:text-[var(--pv-text-muted)] focus-visible:ring-2 motion-reduce:transition-none"
            style={{ borderColor: slotColor(model, "Input", "border"), color: slotColor(model, "Input", "foreground"), backgroundColor: slotColor(model, "Input", "background"), borderRadius: model.radiusMd ?? undefined, transition }}
          />
        </label>
        <label className="mt-2 block min-w-0 text-[13px] font-medium" style={{ color: colorOf(model, "text.primary") }} htmlFor="pv-domain">
          Workspace name
          <input
            id="pv-domain"
            defaultValue="Northstar"
            className="mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border bg-transparent px-3 text-sm outline-none ring-2 motion-reduce:transition-none"
            style={{ borderColor: slotColor(model, "Input", "border"), color: slotColor(model, "Input", "foreground"), backgroundColor: slotColor(model, "Input", "background"), borderRadius: model.radiusMd ?? undefined, ["--tw-ring-color" as string]: slotColor(model, "Input", "ring") }}
          />
        </label>
        <div className="mt-2">
          <label className="block min-w-0 text-[13px] font-medium" style={{ color: colorOf(model, "status.danger.foreground") }} htmlFor="pv-code">
            Invite code
            <input
              id="pv-code"
              defaultValue="EXP1RED"
              aria-invalid="true"
              aria-describedby="pv-code-error"
              className="mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 motion-reduce:transition-none"
              style={{ borderColor: colorOf(model, "status.danger.foreground"), color: colorOf(model, "text.primary"), borderRadius: model.radiusMd ?? undefined }}
            />
          </label>
          <p id="pv-code-error" className="mt-1 flex items-center gap-1 text-[12px] font-medium" style={{ color: colorOf(model, "status.danger.foreground") }}>
            <XCircle className="size-4 shrink-0" aria-hidden="true" />
            This code expired — request a new invite.
          </p>
        </div>
      </section>
      <StatusList model={model} />
      <TaskTable model={model} />
      <EmptyState model={model} />
      <div className="mt-3">
        <button
          onClick={onDialogOpen}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium motion-reduce:transition-none"
          style={{ backgroundColor: slotColor(model, "Button", "background", "primary"), color: slotColor(model, "Button", "foreground", "primary"), borderRadius: model.radiusMd ?? undefined, transition }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Review launch checklist
        </button>
      </div>
    </div>
  )
}

function StatusList({ model }: { model: PreviewResolution }) {
  const rows = [
    { kind: "Success", fg: "status.success.foreground", bg: "status.success.background", Icon: Check, text: "12 checks passed — ready to ship." },
    { kind: "Warning", fg: "status.warning.foreground", bg: "status.warning.background", Icon: AlertTriangle, text: "2 checks need attention before Friday." },
    { kind: "Danger", fg: "status.danger.foreground", bg: "status.danger.background", Icon: XCircle, text: "1 blocker: expired signing key." },
    { kind: "Info", fg: "status.info.foreground", bg: "status.info.background", Icon: Info, text: "Changelog draft is ready for review." },
  ] as const
  return (
    <section aria-label="Status feedback" className="mt-3 space-y-2">
      {rows.map(({ kind, fg, bg, Icon, text }) => (
        <p
          key={kind}
          className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border px-3 text-[12px] font-medium"
          style={{ color: colorOf(model, fg), backgroundColor: colorOf(model, bg), borderColor: colorOf(model, fg), borderRadius: model.radiusMd ?? undefined }}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 break-words">{kind}: {text}</span>
        </p>
      ))}
    </section>
  )
}

function TaskTable({ model }: { model: PreviewResolution }) {
  const rows = [
    ["Homepage refresh", "Mara", "Done"],
    ["Billing migration", "Dev", "In review"],
    ["Mobile nav", "Jon", "Blocked"],
  ]
  return (
    <section aria-label="Launch tasks" className="mt-3 min-w-0 overflow-hidden rounded-lg border" style={{ borderColor: colorOf(model, "border.default"), borderRadius: model.radiusMd ?? undefined }}>
      <table className="w-full min-w-0 border-collapse text-left text-[12px]">
        <thead>
          <tr style={{ backgroundColor: colorOf(model, "background.subtle") }}>
            {["Task", "Owner", "State"].map((head) => (
              <th key={head} scope="col" className="break-words px-3 py-2 font-semibold" style={{ color: colorOf(model, "text.primary") }}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([task, owner, state]) => (
            <tr key={task} className="border-t" style={{ borderColor: colorOf(model, "border.default") }}>
              <td className="break-words px-3 py-2 font-medium" style={{ color: colorOf(model, "text.primary") }}>{task}</td>
              <td className="break-words px-3 py-2" style={{ color: colorOf(model, "text.secondary") }}>{owner}</td>
              <td className="break-words px-3 py-2">
                <span
                  className="inline-flex min-h-11 items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium"
                  style={
                    state === "Done"
                      ? { color: colorOf(model, "status.success.foreground"), borderColor: colorOf(model, "status.success.foreground") }
                      : state === "Blocked"
                        ? { color: colorOf(model, "status.danger.foreground"), borderColor: colorOf(model, "status.danger.foreground") }
                        : { color: colorOf(model, "status.info.foreground"), borderColor: colorOf(model, "status.info.foreground") }
                  }
                >
                  {state === "Done" ? <Check className="size-3" aria-hidden="true" /> : state === "Blocked" ? <XCircle className="size-3" aria-hidden="true" /> : <Info className="size-3" aria-hidden="true" />}
                  {state}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function EmptyState({ model }: { model: PreviewResolution }) {
  const size = model.iconSizePx ?? 20
  return (
    <section aria-label="Empty state" className="mt-3 rounded-lg border border-dashed p-4 text-center" style={{ borderColor: colorOf(model, "border.strong") }}>
      <Search style={{ width: size, height: size, color: colorOf(model, "text.muted") }} className="mx-auto" aria-hidden="true" />
      <p className="mt-1 text-[13px] font-semibold" style={{ color: colorOf(model, "text.primary") }}>
        No archived launches
      </p>
      <p className="mx-auto mt-0.5 max-w-sm break-words text-[12px]" style={{ color: colorOf(model, "text.muted") }}>
        Archived launches will appear here. Icon uses the muted icon role at the default size.
      </p>
    </section>
  )
}

function PreviewDialog({ model, onClose }: { model: PreviewResolution; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  const transition = model.motion.transition === "none" ? undefined : `all ${model.motion.transition}`
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ backgroundColor: slotColor(model, "Dialog", "scrim") === "transparent" ? "rgba(0,0,0,0.5)" : slotColor(model, "Dialog", "scrim") }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pv-dialog-title"
        className="w-full min-w-0 rounded-lg border p-4 motion-reduce:transition-none"
        style={{
          maxWidth: "28rem",
          backgroundColor: slotColor(model, "Dialog", "background"),
          borderColor: slotColor(model, "Dialog", "border"),
          borderRadius: model.radiusMd ?? undefined,
          boxShadow: slotColor(model, "Dialog", "shadow") === "transparent" ? undefined : slotColor(model, "Dialog", "shadow"),
          transition,
        }}
      >
        <h2 id="pv-dialog-title" className="break-words text-lg font-bold" style={{ color: colorOf(model, "text.primary"), ...fontStyle(model.typography.heading) }}>
          Launch checklist
        </h2>
        <p className="mt-1 break-words text-sm" style={{ color: colorOf(model, "text.secondary") }}>
          Dialog resolves background, border, and shadow component slots plus the overlay scrim — all through {model.themeId}.
        </p>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium motion-reduce:transition-none"
            style={{ borderColor: colorOf(model, "border.default"), color: colorOf(model, "text.primary"), borderRadius: model.radiusMd ?? undefined, transition }}
          >
            Cancel
          </button>
          <button
            ref={closeRef}
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium motion-reduce:transition-none"
            style={{ backgroundColor: slotColor(model, "Button", "background", "primary"), color: slotColor(model, "Button", "foreground", "primary"), borderRadius: model.radiusMd ?? undefined, transition }}
          >
            Confirm launch
          </button>
        </div>
      </div>
    </div>
  )
}

function slotColor(model: PreviewResolution, component: string, slot: string, variant?: string): string {
  const entry = model.components.find(
    (item) => item.component === component && item.slot === slot && (item.variant ?? undefined) === variant,
  )
  return entry?.final ?? "transparent"
}

function fontStyle(type: PreviewResolution["typography"]["heading"]): CSSProperties {
  return {
    fontFamily: type.fontFamily,
    fontWeight: type.fontWeight,
    fontSize: type.fontSize,
    lineHeight: type.lineHeight,
    letterSpacing: type.letterSpacing,
  }
}

const INSPECTOR_SECTIONS: Array<{
  id: string
  name: string
  semantics: string[]
  slots: Array<{ component: string; slot: string; variant?: string }>
}> = [
  { id: "shell", name: "Application shell", semantics: ["background.canvas", "background.subtle", "text.primary", "text.muted"], slots: [] },
  { id: "toolbar", name: "Toolbar", semantics: ["surface.default", "border.default", "action.secondary.background"], slots: [] },
  { id: "type", name: "Heading & body", semantics: ["text.primary", "text.secondary", "text.muted"], slots: [] },
  {
    id: "buttons", name: "Buttons",
    semantics: ["action.primary.background", "action.primary.foreground", "action.secondary.background", "border.default"],
    slots: [
      { component: "Button", slot: "background", variant: "primary" },
      { component: "Button", slot: "foreground", variant: "primary" },
      { component: "Button", slot: "background", variant: "secondary" },
      { component: "Button", slot: "border", variant: "secondary" },
    ],
  },
  {
    id: "form", name: "Form inputs",
    semantics: ["background.canvas", "border.default", "text.primary", "focus.ring", "status.danger.foreground"],
    slots: [
      { component: "Input", slot: "background" },
      { component: "Input", slot: "border" },
      { component: "Input", slot: "ring" },
    ],
  },
  {
    id: "status", name: "Status states",
    semantics: ["status.success.foreground", "status.success.background", "status.warning.foreground", "status.danger.background", "status.info.foreground"],
    slots: [],
  },
  {
    id: "card", name: "Card",
    semantics: ["background.surface", "border.default", "text.primary"],
    slots: [
      { component: "Card", slot: "background" },
      { component: "Card", slot: "border" },
      { component: "Card", slot: "foreground" },
    ],
  },
  {
    id: "dialog", name: "Dialog & scrim",
    semantics: ["background.canvas", "overlay.scrim"],
    slots: [
      { component: "Dialog", slot: "background" },
      { component: "Dialog", slot: "border" },
      { component: "Dialog", slot: "shadow" },
    ],
  },
]

function InspectorPanel({ model }: { model: PreviewResolution }) {
  const [sectionId, setSectionId] = useState("buttons")
  const section = INSPECTOR_SECTIONS.find((entry) => entry.id === sectionId) ?? INSPECTOR_SECTIONS[0]!
  const slots: ComponentSlotPreview[] = section.slots.map((wanted) => {
    const found = model.components.find(
      (item) => item.component === wanted.component && item.slot === wanted.slot && (item.variant ?? undefined) === wanted.variant,
    )
    return found ?? {
      component: wanted.component, slot: wanted.slot, variant: wanted.variant,
      overrideValue: null, baseSemanticId: null, final: null,
      status: "unresolved" as const, chain: [], provenance: "unresolved" as const,
    }
  })
  const sectionDiagnostics = [
    ...new Set([
      ...section.semantics.flatMap((id) => {
        const entry = model.semantics[id]
        return entry && entry.status !== "resolved" ? [id] : []
      }),
      ...slots.flatMap((slot) => (slot.status !== "resolved" ? [`${slot.component}.${slot.slot}`] : [])),
    ]),
  ]
  return (
    <aside aria-label="Token inspector" className="min-w-0 rounded-2xl border border-border bg-background p-4 shadow-sm lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <Search className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Token source</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">See which saved values create each part of the preview.</p>
        </div>
      </div>
      <label htmlFor="inspector-section" className="mt-4 block text-xs font-medium">
        Area to inspect
      </label>
      <select
        id="inspector-section"
        value={section.id}
        onChange={(event) => setSectionId(event.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {INSPECTOR_SECTIONS.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>
      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold">Colours and roles</h3>
        <span className="text-[10px] text-muted-foreground">{section.semantics.length} values</span>
      </div>
      <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border">
        {section.semantics.map((id) => {
          const entry = model.semantics[id]
          if (!entry) return null
          return (
            <li key={id} className="bg-background p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="size-8 shrink-0 rounded-lg border border-black/10 shadow-sm dark:border-white/15"
                  style={{ backgroundColor: entry.final ?? "transparent" }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{id}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">{provenanceLabel(entry.provenance)}</span>
                </span>
                <span className="max-w-24 truncate text-right text-[10px] tabular-nums text-muted-foreground">{entry.final ?? entry.status}</span>
              </div>
              <details className="group mt-2">
                <summary className="cursor-pointer list-none text-[10px] text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  View resolution path
                </summary>
                <p className="mt-1.5 break-words rounded-lg bg-muted/50 p-2 font-mono text-[10px] leading-4 text-muted-foreground">
                  {entry.base}
                  {entry.override !== null ? ` → ${entry.override}` : ""}
                  {entry.chain.length > 0 ? ` → ${entry.chain.join(" → ")}` : ""}
                  {` → ${entry.final ?? entry.status}`}
                </p>
              </details>
            </li>
          )
        })}
      </ul>
      {slots.length > 0 && (
        <details className="group mt-3 rounded-xl border border-border">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            Component mappings
            <span className="ml-auto text-[10px] font-normal text-muted-foreground">{slots.length}</span>
            <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <ul className="divide-y divide-border border-t border-border">
            {slots.map((slot, index) => (
              <li key={`${slot.component}-${slot.slot}-${slot.variant ?? "base"}-${index}`} className="p-3 text-[10px] leading-4 text-muted-foreground">
                <p className="font-medium text-foreground">{slot.component}.{slot.slot}{slot.variant ? ` · ${slot.variant}` : ""}</p>
                <p className="mt-0.5 break-words">{slot.overrideValue ?? slot.baseSemanticId ?? "No mapped value"} → {slot.final ?? slot.status}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
      {sectionDiagnostics.length > 0 ? (
        <p role="status" className="mt-3 rounded-lg bg-amber-500/10 p-2.5 text-xs leading-5 text-amber-800 dark:text-amber-200">
          Needs attention: {sectionDiagnostics.join(", ")}
        </p>
      ) : (
        <p role="status" className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-200">
          <Check className="size-3.5" aria-hidden="true" />
          All values in this area resolve correctly.
        </p>
      )}
    </aside>
  )
}

function provenanceLabel(provenance: string): string {
  if (provenance === "component-override") return "component override";
  if (provenance === "theme-override") return "theme override";
  if (provenance === "base-semantic") return "base semantic";
  if (provenance === "foundation") return "foundation recipe";
  return provenance;
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
