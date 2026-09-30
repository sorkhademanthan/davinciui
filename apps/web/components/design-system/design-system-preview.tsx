"use client"

import {
  AlertTriangle,
  Check,
  Info,
  Menu,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import { listThemes } from "@/lib/design-system/themes"
import {
  resolvePreview,
  type ComponentSlotPreview,
  type PreviewResolution,
} from "@/lib/design-system/preview"
import { ComponentCardLivePreview } from "@/components/component-card-live-preview"
import {
  CARD_LIVE_SLUGS,
  isCardLiveSlug,
  type ComponentManifestEntry,
} from "@/lib/design-system/component-manifest"
import { includedEntries, resolveBridgeValues } from "@/lib/design-system/component-curation"

type GalleryLiveSlug = ComponentProps<typeof ComponentCardLivePreview>["slug"];
type GallerySync = typeof CARD_LIVE_SLUGS extends readonly GalleryLiveSlug[] ? true : false;
const gallerySync: GallerySync = true;
void gallerySync;

function isGalleryLive(id: string): id is GalleryLiveSlug {
  return isCardLiveSlug(id);
}

const VIEWPORT_PRESETS = [
  { id: "mobile", label: "Mobile", width: 390 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "desktop", label: "Desktop", width: 1024 },
  { id: "wide", label: "Wide", width: 1440 },
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
        eyebrow="Design System"
        title="Preview"
        description="Inspect the complete system as a responsive, themed product interface. Preview controls are local only — nothing here edits or saves tokens."
      />
      <section aria-label="Preview controls" className="mt-6 rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">System controls</h2>
          <button
            onClick={resetControls}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            Reset preview controls
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Theme selector">
          {themes.map((theme) => (
            <button
              key={theme.id}
              aria-pressed={themeId === theme.id}
              onClick={() => setThemeId(theme.id)}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${themeId === theme.id ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
            >
              {theme.label} · {theme.mode}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Viewport selector">
          {VIEWPORT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              aria-pressed={previewWidth === preset.width}
              onClick={() => {
                setPreviewWidth(preset.width)
                setWidthDraft(null)
                setWidthError(null)
              }}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${previewWidth === preset.width ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
            >
              {preset.label} · {preset.width}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label htmlFor="preview-width" className="sr-only">
            Preview width in pixels
          </label>
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
            className={`h-11 w-28 rounded-lg border bg-background px-2.5 font-mono text-[13px] outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring ${widthError ? "border-destructive" : "border-border"}`}
          />
          <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">px</span>
          <p id="preview-breakpoint" className="font-mono text-[11px] text-muted-foreground">
            Active: {model.layout.breakpointId} ≥{model.layout.breakpointValue} · {model.layout.columns} grid cols
          </p>
        </div>
        <div className="mt-1 min-h-5" aria-live="polite">
          {widthError && (
            <p id="preview-width-error" role="alert" className="text-xs font-medium text-destructive">
              {widthError}
            </p>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Preview tools">
          <button
            aria-pressed={guides}
            onClick={() => setGuides((value) => !value)}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${guides ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            Grid guides {guides ? "on" : "off"}
          </button>
          <button
            aria-pressed={inspector}
            onClick={() => setInspector((value) => !value)}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${inspector ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            Token inspector {inspector ? "on" : "off"}
          </button>
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          Motion: {model.motion.reduce ? `reduced (${model.motion.reason})` : `full (${model.motion.transition})`}
        </p>
      </section>

      {(model.diagnostics.unresolved.length > 0 || model.diagnostics.circular.length > 0) && (
        <div role="status" className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-medium">Preview diagnostics (contained — nothing claimed as valid)</p>
          {model.diagnostics.unresolved.length > 0 && (
            <p className="mt-1 font-mono text-[11px]">
              Unresolved: {model.diagnostics.unresolved.slice(0, 6).join(", ")}
              {model.diagnostics.unresolved.length > 6 ? ` +${model.diagnostics.unresolved.length - 6} more` : ""}
            </p>
          )}
          {model.diagnostics.circular.length > 0 && (
            <p className="mt-1 font-mono text-[11px]">
              Circular: {model.diagnostics.circular.slice(0, 6).join(", ")}
              {model.diagnostics.circular.length > 6 ? ` +${model.diagnostics.circular.length - 6} more` : ""}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted/30 p-3">
        <PreviewFrame model={model} guides={guides}>
          <AppShell
            model={model}
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

      {inspector && <InspectorPanel model={model} />}

      <ComponentGallery system={system} model={model} />

      <p className="mt-4 text-[11px] leading-4 text-muted-foreground">
        Note: complete contrast analysis belongs to the later Validate phase; this workspace checks
        wiring, states, and responsive behavior, not contrast ratios.
      </p>
    </>
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
        className="relative min-w-0 overflow-hidden rounded-lg"
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
          Acme workspace
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
            <p className="mt-2 px-2 font-mono text-[10px]" style={{ color: colorOf(model, "text.muted") }}>
              {nav} · sidebar {wide ? "visible" : "hidden"} at {model.layout.breakpointId}
            </p>
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
      <span className="font-mono text-[10px]" style={{ color: colorOf(model, "text.muted") }}>
        toolbar · {model.layout.breakpointId} · {model.layout.columns} cols
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
          Launch readiness
        </h2>
        <p className="mt-1 break-words text-sm leading-6" style={{ color: colorOf(model, "text.secondary"), ...fontStyle(model.typography.body) }}>
          Body copy follows the configured body role. Gutter {model.layout.gutterToken}
          {model.layout.gutterPx !== null ? ` (${model.layout.gutterPx}px)` : ""} shapes this
          container at {model.layout.widthPx}px.
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
            <h3 className="truncate text-[13px] font-semibold">Milestone {index + 1}</h3>
            <p className="mt-0.5 line-clamp-2 break-words text-[12px] leading-5" style={{ color: colorOf(model, "text.secondary") }}>
              Owner, due date, and status reflow inside {model.layout.columns}-column grid profile {model.layout.breakpointId}.
            </p>
            <p className="mt-1 font-mono text-[10px]" style={{ color: colorOf(model, "text.muted") }}>
              Card · surface / border.default
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
            Primary
          </span>
          <span
            className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium motion-reduce:transition-none"
            style={{ backgroundColor: slotColor(model, "Button", "background", "secondary"), color: slotColor(model, "Button", "foreground", "secondary"), borderColor: slotColor(model, "Button", "border", "secondary"), borderRadius: model.radiusMd ?? undefined, transition }}
          >
            Secondary
          </span>
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 cursor-not-allowed items-center rounded-lg border px-4 text-sm font-medium opacity-50"
            style={{ borderColor: colorOf(model, "border.default"), color: colorOf(model, "text.muted"), borderRadius: model.radiusMd ?? undefined }}
          >
            Disabled
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px]" style={{ color: colorOf(model, "text.muted") }}>
          Button · component overrides when present, else action/border semantics
        </p>
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
          Focused input preview (ring always visible here)
          <input
            id="pv-domain"
            defaultValue="acme"
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
    <section aria-label="Token inspector" className="mt-4 rounded-xl border border-border bg-background p-5">
      <h2 className="font-medium">Token inspector</h2>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        theme {model.themeId} · breakpoint {model.layout.breakpointId} ≥{model.layout.breakpointValue} · {model.layout.columns} cols
      </p>
      <label htmlFor="inspector-section" className="mt-3 block text-sm font-medium">
        Inspect section
      </label>
      <select
        id="inspector-section"
        value={section.id}
        onChange={(event) => setSectionId(event.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {INSPECTOR_SECTIONS.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>
      <h3 className="mt-4 text-sm font-semibold">Semantic tokens</h3>
      <ul className="mt-2 space-y-1.5">
        {section.semantics.map((id) => {
          const entry = model.semantics[id]
          if (!entry) return null
          return (
            <li key={id} className="rounded-lg border border-border p-2.5 font-mono text-[11px] leading-5">
              <span className="font-semibold">{id}</span> · {provenanceLabel(entry.provenance)}
              <br />
              base {entry.base}
              {entry.override !== null && <> · theme override {entry.override}</>}
              <br />→ final {entry.final ?? entry.status}
              {entry.chain.length > 0 && <> · {entry.chain.join(" → ")}</>}
            </li>
          )
        })}
      </ul>
      {slots.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-semibold">Component overrides</h3>
          <ul className="mt-2 space-y-1.5">
            {slots.map((slot, index) => (
              <li key={`${slot.component}-${slot.slot}-${slot.variant ?? "base"}-${index}`} className="rounded-lg border border-border p-2.5 font-mono text-[11px] leading-5">
                <span className="font-semibold">
                  {slot.component}.{slot.slot}
                  {slot.variant ? ` (${slot.variant})` : ""}
                </span>{" "}
                · {provenanceLabel(slot.provenance)}
                <br />
                {slot.overrideValue !== null ? (
                  <>override {slot.overrideValue} → final {slot.final ?? slot.status}</>
                ) : slot.baseSemanticId ? (
                  <>no override · falls back to {slot.baseSemanticId} → final {slot.final ?? slot.status}</>
                ) : (
                  <>no override and no conventional mapping · {slot.status}</>
                )}
                {slot.chain.length > 0 && <> · {slot.chain.join(" → ")}</>}
              </li>
            ))}
          </ul>
        </>
      )}
      {sectionDiagnostics.length > 0 ? (
        <p role="status" className="mt-3 font-mono text-[11px] text-amber-600 dark:text-amber-400">
          Diagnostics in this section: {sectionDiagnostics.join(", ")}
        </p>
      ) : (
        <p role="status" className="mt-3 font-mono text-[11px] text-muted-foreground">
          No diagnostics in this section — every listed value resolved.
        </p>
      )}
    </section>
  )
}

function provenanceLabel(provenance: string): string {
  if (provenance === "component-override") return "component override";
  if (provenance === "theme-override") return "theme override";
  if (provenance === "base-semantic") return "base semantic";
  if (provenance === "foundation") return "foundation recipe";
  return provenance;
}

/**
 * Included-component gallery (Step 10A). Shows only this system's included
 * kit — never the full catalog — with live card previews where they exist
 * and system-aware bridge cards otherwise. Display-only: every card is a
 * route link to the dedicated docs page, and embedded previews stay
 * non-interactive. Nothing here writes to the system.
 */
function ComponentGallery({ system, model }: { system: DesignSystemConfig; model: PreviewResolution }) {
  const [tier, setTier] = useState<"all" | "core" | "premium">("all")
  const entries = includedEntries(system).filter((entry) => tier === "all" || entry.tier === tier)
  const coreCount = includedEntries(system, "core").length
  const premiumCount = includedEntries(system, "premium").length
  return (
    <section aria-label="Included component gallery" className="mt-4 rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">
          Component gallery{" "}
          <span className="font-mono text-xs font-normal text-muted-foreground">
            ({entries.length} included · {model.themeId})
          </span>
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Gallery tier filter">
          {(["all", "core", "premium"] as const).map((entry) => (
            <button
              key={entry}
              aria-pressed={tier === entry}
              onClick={() => setTier(entry)}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${tier === entry ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
            >
              {entry === "all" ? `All (${coreCount + premiumCount})` : entry === "core" ? `Core (${coreCount})` : `Premium (${premiumCount})`}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Only this system&apos;s included kit appears here. Effects keep their identity; frames and
        captions follow {model.themeId}. Live effect interiors render with the application chrome —
        treat them as display-only until an effect records dark-theme evidence. Full interaction
        lives on each component page.
      </p>
      {entries.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Nothing included in this view. Curate the kit in the Components workspace.
        </p>
      ) : (
        <ul className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
          {entries.map((entry) => (
            <GalleryCard key={entry.id} system={system} model={model} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  )
}

function GalleryCard({
  system,
  model,
  entry,
}: {
  system: DesignSystemConfig
  model: PreviewResolution
  entry: ComponentManifestEntry
}) {
  const bridge = entry.bridge ? resolveBridgeValues(system, model.themeId, entry.bridge) : {}
  const backdrop = bridge["surface"]?.final ?? bridge["canvas"]?.final ?? model.semantics["surface.default"]?.final ?? "transparent"
  const ink = bridge["foreground"]?.final ?? model.semantics["text.primary"]?.final ?? "inherit"
  const accent = bridge["accent"]?.final ?? model.semantics["action.primary.background"]?.final ?? "inherit"
  // Letter on the accent tile must pair with the action foreground, not the
  // surface color, to stay readable in every system theme.
  const onAccent = model.semantics["action.primary.foreground"]?.final ?? (ink === "inherit" ? undefined : ink)
  return (
    <li className="min-w-0 overflow-hidden rounded-xl border border-border bg-background">
      <Link
        href={entry.docsRoute}
        aria-label={`${entry.name} (${entry.tier === "core" ? "Core UI" : "Premium experience"}) — open full component page`}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="pointer-events-none relative block h-24 select-none overflow-hidden" inert={true} aria-hidden="true" style={{ backgroundColor: backdrop === "transparent" ? undefined : backdrop }}>
          {entry.livePreview && isGalleryLive(entry.id) ? (
            <ComponentCardLivePreview slug={entry.id} />
          ) : (
            <span className="flex h-full w-full items-center gap-2.5 px-4">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-base font-bold"
                style={{ backgroundColor: accent === "inherit" ? undefined : accent, color: onAccent }}
              >
                {entry.name.slice(0, 1)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold" style={{ color: ink === "inherit" ? undefined : ink }}>
                  {entry.name}
                </span>
                <span className="block truncate font-mono text-[10px] text-muted-foreground">
                  {entry.tier === "core" ? `${entry.slots.length} token slots` : `${entry.motionModality} · ${entry.reducedMotionFallback} fallback`}
                </span>
              </span>
            </span>
          )}
        </span>
        <span className="block min-w-0 border-t border-border p-2.5">
          <span className="block truncate text-[13px] font-medium" style={{ color: ink === "inherit" ? undefined : ink }}>
            {entry.name}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
            {entry.tier === "core" ? "Core UI" : "Premium experience"} · {entry.family} · {model.themeId}
            {entry.tier === "premium" && entry.bridge
              ? ` · ${Object.keys(bridge).length} bridge values`
              : ""}
          </span>
        </span>
      </Link>
    </li>
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
