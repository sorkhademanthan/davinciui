"use client"

import Link from "next/link"
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Info,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react"
import { useMemo, useState, type ComponentProps, type ReactNode } from "react"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import { resolveToken } from "@/lib/design-system/domain"
import { listThemes } from "@/lib/design-system/themes"
import { ComponentCardLivePreview } from "@/components/component-card-live-preview"
import {
  CARD_LIVE_SLUGS,
  COMPONENT_MANIFEST,
  isCardLiveSlug,
  manifestById,
  type ComponentFamily,
  type ComponentManifestEntry,
} from "@/lib/design-system/component-manifest"
import {
  componentReadiness,
  includeAllPremium,
  includeComponent,
  includeFamily,
  includeRecommendedPremium,
  includedIds,
  inclusionSummary,
  isIncluded,
  removeComponent,
  resetToCore,
  resolveBridgeValues,
} from "@/lib/design-system/component-curation"

type LiveCardSlug = ComponentProps<typeof ComponentCardLivePreview>["slug"];
// Compile-time sync: every manifest live slug must exist in the card preview
// component's slug union. Drift fails the build, not silently.
type LiveListSync = typeof CARD_LIVE_SLUGS extends readonly LiveCardSlug[] ? true : false;
const liveListSync: LiveListSync = true;
void liveListSync;

function isLiveSlug(id: string): id is LiveCardSlug {
  return isCardLiveSlug(id);
}

type Tab = "all" | "core" | "premium" | "included" | "review";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "all", label: "All" },
  { id: "core", label: "Core UI" },
  { id: "premium", label: "Premium experiences" },
  { id: "included", label: "Included" },
  { id: "review", label: "Needs review" },
];

const FAMILIES: ComponentFamily[] = [
  "inputs", "actions", "navigation", "feedback", "overlays", "data-display",
  "layout", "text", "background", "cursor", "scroll", "media", "carousel",
];

export function ComponentLibraryEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const [tab, setTab] = useState<Tab>("all")
  const [query, setQuery] = useState("")
  const [family, setFamily] = useState<"all" | ComponentFamily>("all")
  const [maturity, setMaturity] = useState<"all" | "ready" | "needs-review" | "experimental">("all")
  const [support, setSupport] = useState<"all" | "bridge" | "slots" | "dark" | "motion" | "live">("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const themeOptions = listThemes(system)
  const [themeId, setThemeId] = useState<string>(
    themeOptions.some((theme) => theme.id === "light") ? "light" : (themeOptions[0]?.id ?? "light"),
  )
  const activeThemeId = themeOptions.some((theme) => theme.id === themeId) ? themeId : (themeOptions[0]?.id ?? "light")

  const summary = inclusionSummary(system)
  const included = useMemo(() => new Set(includedIds(system)), [system]);
  const needle = query.trim().toLowerCase()

  const visible = COMPONENT_MANIFEST.filter((entry) => {
    if (tab === "core" && entry.tier !== "core") return false
    if (tab === "premium" && entry.tier !== "premium") return false
    if (tab === "included" && !included.has(entry.id)) return false
    if (tab === "review" && entry.maturity !== "needs-review") return false
    if (family !== "all" && entry.family !== family) return false
    if (maturity !== "all" && entry.maturity !== maturity) return false
    if (support === "bridge" && !(entry.bridge && Object.keys(entry.bridge).length > 1)) return false
    if (support === "slots" && entry.slots.length === 0) return false
    if (support === "dark" && entry.darkTheme.level !== "full") return false
    if (support === "motion" && entry.reducedMotionFallback === "not-applicable") return false
    if (support === "live" && !entry.livePreview) return false
    if (needle) {
      const haystack = `${entry.name} ${entry.id} ${entry.family} ${entry.description}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  const reviewCount = COMPONENT_MANIFEST.filter((entry) => entry.maturity === "needs-review").length

  const flash = (message: string): void => setNotice(message)

  return (
    <>
      <PageHeader
        eyebrow="Design System"
        title="Component library"
        description="Curate core controls and premium experiences for this system."
        action={
          <p className="font-mono text-xs text-muted-foreground" role="status">
            Included: {summary.included} / {summary.total}
          </p>
        }
      />
      <section aria-label="Library actions" className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            const result = includeRecommendedPremium(system)
            save(result.system)
            flash(
              result.added.length > 0
                ? `Included recommended set: ${result.added.slice(0, 6).join(", ")}${result.added.length > 6 ? ` and ${result.added.length - 6} more` : ""}.`
                : "Recommended premium set is already included.",
            )
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <Plus className="size-4" aria-hidden="true" />
          Include recommended premium set
        </button>
        <button
          onClick={() => {
            save(includeAllPremium(system))
            flash("All premium experiences included. Reset to Core any time.")
          }}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Include all premium
        </button>
        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset to Core UI
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <button
              onClick={() => setConfirmingReset(false)}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Keep kit
            </button>
            <button
              onClick={() => {
                save(resetToCore(system))
                setConfirmingReset(false)
                flash("Kit reset to Core UI. Premium stays discoverable below.")
              }}
              className="inline-flex min-h-11 items-center rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Confirm reset
            </button>
          </span>
        )}
      </section>
      <div className="mt-1 min-h-5" aria-live="polite">
        {notice && <p role="status" className="text-xs text-muted-foreground">{notice}</p>}
      </div>

      <div className="mt-2 flex flex-wrap gap-2" role="tablist" aria-label="Library view">
        {TABS.map((entry) => {
          const coreTotal = COMPONENT_MANIFEST.filter((item) => item.tier === "core").length
          const count =
            entry.id === "all" ? COMPONENT_MANIFEST.length
            : entry.id === "core" ? coreTotal
            : entry.id === "premium" ? COMPONENT_MANIFEST.length - coreTotal
            : entry.id === "included" ? summary.included
            : reviewCount
          const active = tab === entry.id
          return (
            <button
              key={entry.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry.id)}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${active ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
            >
              {entry.label}
              <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
            </button>
          )
        })}
      </div>

      <section aria-label="Search and filters" className="mt-3 grid gap-2 rounded-xl border border-border bg-background p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="library-search" className="sr-only">Search components</label>
          <input
            id="library-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, family, description…"
            className="min-h-11 w-full rounded-lg border border-border bg-background py-2 pl-9 pr-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="library-family" className="sr-only">Family</label>
          <select
            id="library-family"
            value={family}
            onChange={(event) => setFamily(event.target.value as "all" | ComponentFamily)}
            className="min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All families</option>
            {FAMILIES.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="library-maturity" className="sr-only">Maturity</label>
          <select
            id="library-maturity"
            value={maturity}
            onChange={(event) => setMaturity(event.target.value as "all" | "ready" | "needs-review" | "experimental")}
            className="min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Any maturity</option>
            <option value="ready">Ready</option>
            <option value="needs-review">Needs review</option>
            <option value="experimental">Experimental</option>
          </select>
        </div>
        <div>
          <label htmlFor="library-support" className="sr-only">Token and platform support</label>
          <select
            id="library-support"
            value={support}
            onChange={(event) => setSupport(event.target.value as typeof support)}
            className="min-h-11 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Any support</option>
            <option value="bridge">Premium token bridge</option>
            <option value="slots">Core token slots</option>
            <option value="dark">Full dark support</option>
            <option value="motion">Declares motion fallback</option>
            <option value="live">Live card preview</option>
          </select>
        </div>
      </section>

      <section aria-label="Preview theme" className="mt-3 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium">Preview theme</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Bridge tiles and token values below resolve through this system theme — never the application chrome.
              Live effect interiors render with the application chrome and stay marked Needs review until dark-theme evidence exists.
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Preview theme selector">
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              aria-pressed={activeThemeId === theme.id}
              onClick={() => setThemeId(theme.id)}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${activeThemeId === theme.id ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
            >
              {theme.label} · {theme.mode}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Component catalog" className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground" role="status">
            Showing {visible.length} of {COMPONENT_MANIFEST.length} components · {activeThemeId}
          </p>
          {visible.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
              No components match these filters. Clear search or choose another family.
            </p>
          ) : (
            <ul className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
              {visible.map((entry) => (
                <CatalogCard
                  key={entry.id}
                  system={system}
                  save={save}
                  entry={entry}
                  themeId={activeThemeId}
                  selected={selectedId === entry.id}
                  onSelect={(id) => setSelectedId((current) => (current === id ? null : id))}
                  onFlash={flash}
                />
              ))}
            </ul>
          )}
        </section>
        <InspectorPanel
          system={system}
          save={save}
          entry={selectedId ? manifestById(selectedId) ?? null : null}
          themeId={activeThemeId}
          onClose={() => setSelectedId(null)}
          onFlash={flash}
        />
      </div>
    </>
  )
}

function TierBadge({ tier }: { tier: "core" | "premium" }) {
  return (
    <span
      className={`inline-flex min-h-11 items-center rounded-full border px-2.5 text-[11px] font-medium ${tier === "core" ? "border-border text-muted-foreground" : "border-foreground/30 bg-muted text-foreground"}`}
    >
      {tier === "core" ? "Core UI" : "Premium experience"}
    </span>
  )
}

function MaturityBadge({ entry }: { entry: ComponentManifestEntry }) {
  if (entry.maturity === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <Check className="size-3" aria-hidden="true" />
        Ready
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
      <AlertTriangle className="size-3" aria-hidden="true" />
      Needs review · {entry.missingChecks.length}
    </span>
  )
}

function CatalogCard({
  system,
  save,
  entry,
  themeId,
  selected,
  onSelect,
  onFlash,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  entry: ComponentManifestEntry
  themeId: string
  selected: boolean
  onSelect: (id: string) => void
  onFlash: (message: string) => void
}) {
  const included = isIncluded(system, entry.id)
  return (
    <li
      className={`min-w-0 rounded-xl border bg-background transition-colors motion-reduce:transition-none ${selected ? "border-foreground" : "border-border"}`}
    >
      <div className="relative h-28 overflow-hidden rounded-t-xl bg-muted/40" aria-hidden="true">
        {entry.livePreview && isLiveSlug(entry.id) ? (
          <ComponentCardLivePreview slug={entry.id} />
        ) : (
          <BridgeCardVisual system={system} entry={entry} themeId={themeId} />
        )}
      </div>
      <div className="min-w-0 p-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{entry.name}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {entry.id} · {entry.family}
            </p>
          </div>
          <TierBadge tier={entry.tier} />
        </div>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">
          {entry.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <MaturityBadge entry={entry} />
          {entry.darkTheme.level !== "full" && (
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              dark: {entry.darkTheme.level}
            </span>
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
          <button
            onClick={() => onSelect(entry.id)}
            aria-expanded={selected}
            aria-label={`${selected ? "Hide" : "Show"} details for ${entry.name}`}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${selected ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            <Info className="mr-1.5 size-3.5" aria-hidden="true" />
            Details
          </button>
          <button
            onClick={() => {
              if (included) {
                save(removeComponent(system, entry.id))
                onFlash(`${entry.name} removed from this system kit. Still discoverable here.`)
              } else {
                const result = includeComponent(system, entry.id)
                if (result.ok) {
                  save(result.system)
                  onFlash(`${entry.name} included in this system kit.`)
                }
              }
            }}
            aria-pressed={included}
            aria-label={included ? `Remove ${entry.name} from system` : `Include ${entry.name} in system`}
            className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${included ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
          >
            {included ? <Check className="mr-1.5 size-3.5" aria-hidden="true" /> : <Plus className="mr-1.5 size-3.5" aria-hidden="true" />}
            {included ? "Included" : "Include"}
          </button>
          <Link
            href={entry.docsRoute}
            aria-label={`Open full docs for ${entry.name}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </li>
  )
}

function BridgeCardVisual({ system, entry, themeId }: { system: DesignSystemConfig; entry: ComponentManifestEntry; themeId: string }) {
  const values = entry.bridge ? resolveBridgeValues(system, themeId, entry.bridge) : {}
  const surface = values["surface"]?.final ?? values["canvas"]?.final ?? null
  const foreground = values["foreground"]?.final ?? null
  const accent = values["accent"]?.final ?? null
  // Caption sits on the system-colored strip, so it must use the system muted
  // role — never the application-chrome muted class.
  const mutedResolution = resolveToken(system, "text.muted", themeId)
  const muted = mutedResolution.status === "resolved" ? mutedResolution.value : (foreground ?? undefined)
  return (
    <div className="flex h-full w-full items-center gap-3 px-4" style={{ backgroundColor: surface ?? undefined }}>
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-lg text-lg font-bold"
        style={{ backgroundColor: accent ?? undefined, color: surface ?? undefined }}
      >
        {entry.name.slice(0, 1)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold" style={{ color: foreground ?? undefined }}>
          {entry.name}
        </span>
        <span className="block truncate font-mono text-[10px]" style={{ color: muted }}>
          {entry.motionModality} · {entry.reducedMotionFallback} fallback · {themeId}
        </span>
      </span>
    </div>
  )
}

function InspectorPanel({
  system,
  save,
  entry,
  themeId,
  onClose,
  onFlash,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  entry: ComponentManifestEntry | null
  themeId: string
  onClose: () => void
  onFlash: (message: string) => void
}) {
  if (!entry) {
    return (
      <aside aria-label="Component inspector" className="h-fit rounded-xl border border-dashed border-border bg-background p-5">
        <p className="text-sm font-medium">Inspector</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Select a component&apos;s Details button to inspect its token bridge or slots, readiness,
          and support — without leaving the catalog.
        </p>
      </aside>
    )
  }
  const included = isIncluded(system, entry.id)
  const readiness = componentReadiness(system, entry)
  const bridgeValues = entry.bridge ? resolveBridgeValues(system, themeId, entry.bridge) : {}
  return (
    <aside aria-label={`Inspector for ${entry.name}`} className="h-fit rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{entry.name}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{entry.id} · {entry.family}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close inspector"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <TierBadge tier={entry.tier} />
        <MaturityBadge entry={entry} />
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{entry.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            if (included) {
              save(removeComponent(system, entry.id))
              onFlash(`${entry.name} removed from this system kit.`)
            } else {
              const result = includeComponent(system, entry.id)
              if (result.ok) {
                save(result.system)
                onFlash(`${entry.name} included in this system kit.`)
              }
            }
          }}
          aria-pressed={included}
          className={`inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${included ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`}
        >
          {included ? <Check className="mr-1.5 size-4" aria-hidden="true" /> : <Plus className="mr-1.5 size-4" aria-hidden="true" />}
          {included ? "Included — remove" : "Include in system"}
        </button>
        <Link
          href={entry.docsRoute}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Docs
        </Link>
        <Link
          href={entry.experienceRoute}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Experience
        </Link>
      </div>

      {entry.tier === "premium" && entry.bridge ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold">Token bridge (minimal, explicit)</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            The effect keeps its identity; only these supported values flow in ({themeId} shown).
          </p>
          <ul className="mt-2 space-y-1.5">
            {Object.entries(bridgeValues).map(([key, resolved]) => (
              <li key={key} className="flex min-w-0 items-center gap-2 rounded-lg border border-border p-2 font-mono text-[11px]">
                <Dot color={resolved.final} />
                <span className="min-w-0 flex-1 truncate">
                  {key}: {resolved.reference} → {resolved.final ?? resolved.status}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex gap-1.5"><dt className="font-medium">Motion:</dt><dd className="font-mono text-[11px]">{entry.motionModality} · {entry.reducedMotionFallback} fallback</dd></div>
            <div className="flex gap-1.5"><dt className="font-medium">Static:</dt><dd>{entry.staticFallback}</dd></div>
            <div className="flex gap-1.5"><dt className="font-medium">Responsive:</dt><dd>{entry.responsive.level} — {entry.responsive.note}</dd></div>
            <div className="flex gap-1.5"><dt className="font-medium">Dark:</dt><dd>{entry.darkTheme.level} — {entry.darkTheme.note}</dd></div>
            <div className="flex gap-1.5"><dt className="font-medium">Keyboard:</dt><dd>{entry.keyboard.level} — {entry.keyboard.note}</dd></div>
            <div className="flex gap-1.5"><dt className="font-medium">Bundle:</dt><dd>{entry.lazy ? "Lazy preview, mounts near viewport, no SSR." : "No extra bundle."}</dd></div>
          </dl>
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="text-sm font-semibold">Core token slots ({entry.slots.length})</h3>
          <ul className="mt-2 space-y-1.5">
            {entry.slots.map((slot) => (
              <li key={slot.slot} className="rounded-lg border border-border p-2 font-mono text-[11px] leading-5">
                <span className="font-semibold">{slot.slot}</span>
                {slot.variants && <span className="text-muted-foreground"> · {slot.variants.join(", ")}</span>}
                {slot.states && <span className="text-muted-foreground"> · [{slot.states.join(", ")}]</span>}
                {slot.notes && <span className="block text-muted-foreground">{slot.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-sm font-semibold">Readiness for Validate</h3>
        <ul className="mt-2 space-y-1">
          {readiness.map((check) => (
            <li key={check.id} className="flex items-start gap-2 text-xs">
              {check.pass ? (
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              )}
              <span>
                <span className="font-medium">{check.pass ? "Pass" : "Needs work"} — {check.label}.</span>{" "}
                <span className="text-muted-foreground">{check.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {entry.tier === "core" && entry.family === "inputs" && (
        <FamilyAction system={system} save={save} family="inputs" label="Include all inputs" onFlash={onFlash} />
      )}
      {entry.tier === "premium" && (
        <FamilyAction system={system} save={save} family={entry.family} label={`Include all ${entry.family}`} onFlash={onFlash} />
      )}
    </aside>
  )
}

function FamilyAction({
  system,
  save,
  family,
  label,
  onFlash,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
  family: ComponentFamily
  label: string
  onFlash: (message: string) => void
}) {
  return (
    <button
      onClick={() => {
        save(includeFamily(system, family))
        onFlash(`${label} — family included.`)
      }}
      className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
    >
      <Plus className="mr-1.5 size-4" aria-hidden="true" />
      {label}
    </button>
  )
}

function Dot({ color }: { color: string | null }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 shrink-0 rounded-full border border-border"
      style={{ backgroundColor: color ?? "transparent" }}
    />
  )
}

export function libraryPreviewValues(system: DesignSystemConfig, id: string, themeId = "light"): Record<string, string | null> {
  const entry = manifestById(id)
  if (!entry?.bridge) return {}
  const resolved = resolveBridgeValues(system, themeId, entry.bridge)
  return Object.fromEntries(Object.entries(resolved).map(([key, value]) => [key, value.final]))
}

export function librarySemanticColor(system: DesignSystemConfig, reference: string, themeId?: string): string {
  const resolution = resolveToken(system, reference, themeId)
  return resolution.status === "resolved" ? resolution.value : "transparent"
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
