"use client"

import { Check, Search } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import {
  includedIds,
  setIncludedIds,
} from "@/lib/design-system/component-curation"
import {
  COMPONENT_MANIFEST,
  type ComponentFamily,
  type ComponentManifestEntry,
} from "@/lib/design-system/component-manifest"

const FAMILY_ORDER: readonly ComponentFamily[] = [
  "inputs",
  "actions",
  "navigation",
  "feedback",
  "overlays",
  "data-display",
  "layout",
]

const FAMILY_LABELS: Record<ComponentFamily, string> = {
  inputs: "Inputs",
  actions: "Actions",
  navigation: "Navigation",
  feedback: "Feedback",
  overlays: "Overlays",
  "data-display": "Data display",
  layout: "Layout",
  text: "Text",
  background: "Background",
  cursor: "Cursor",
  scroll: "Scroll",
  media: "Media",
  carousel: "Carousel",
}

function coreEntries(): ComponentManifestEntry[] {
  return COMPONENT_MANIFEST.filter((entry) => entry.tier === "core")
}

function slotSummary(entry: ComponentManifestEntry): string {
  if (entry.slots.length === 0) return "Token-driven"
  return entry.slots.map((slot) => slot.slot).join(" · ")
}

export function ComponentsEditor({
  system,
  save,
}: {
  system: DesignSystemConfig
  save: (next: DesignSystemConfig) => void
}) {
  const core = useMemo(() => coreEntries(), [])
  const included = useMemo(() => new Set(includedIds(system)), [system])
  const [query, setQuery] = useState("")

  const selectedCore = core.filter((entry) => included.has(entry.id))
  const allSelected = selectedCore.length === core.length

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return core
    return core.filter(
      (entry) =>
        entry.name.toLowerCase().includes(needle) ||
        entry.id.toLowerCase().includes(needle) ||
        entry.description.toLowerCase().includes(needle),
    )
  }, [core, query])

  const groups = useMemo(() => {
    const byFamily = new Map<ComponentFamily, ComponentManifestEntry[]>()
    for (const entry of visible) {
      const list = byFamily.get(entry.family) ?? []
      list.push(entry)
      byFamily.set(entry.family, list)
    }
    return FAMILY_ORDER.filter((family) => byFamily.has(family)).map((family) => ({
      family,
      entries: byFamily.get(family)!,
    }))
  }, [visible])

  const toggle = (id: string) => {
    const next = new Set(included)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    save(setIncludedIds(system, [...next]))
  }

  const selectAll = () => {
    save(setIncludedIds(system, [...included, ...core.map((entry) => entry.id)]))
  }

  const clearAll = () => {
    save(setIncludedIds(system, [...included].filter((id) => !core.some((entry) => entry.id === id))))
  }

  const selectFamily = (entries: ComponentManifestEntry[]) => {
    save(setIncludedIds(system, [...included, ...entries.map((entry) => entry.id)]))
  }

  const clearFamily = (entries: ComponentManifestEntry[]) => {
    const familyIds = new Set(entries.map((entry) => entry.id))
    save(setIncludedIds(system, [...included].filter((id) => !familyIds.has(id))))
  }

  return (
    <>
      <PageHeader
        eyebrow="Design System / System"
        title="Components"
        description="Choose which basic components belong to this system. Premium experiences live only in the component library, where they can be downloaded individually — they are never part of a design system."
        action={
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
            {selectedCore.length} of {core.length} basic selected
          </span>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={selectAll}
          disabled={allSelected}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Check className="size-4" aria-hidden="true" />
          Select all basic
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={selectedCore.length === 0}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear basic
        </button>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search basic components…"
            aria-label="Search basic components"
            className="min-h-11 w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <p role="status" className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No basic components match “{query.trim()}”.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {groups.map((group) => {
            const groupSelected = group.entries.filter((entry) => included.has(entry.id)).length
            const groupAll = groupSelected === group.entries.length
            return (
              <section
                key={group.family}
                aria-labelledby={`components-family-${group.family}`}
                className="overflow-hidden rounded-2xl border border-border bg-background"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-3 sm:px-5">
                  <h2 id={`components-family-${group.family}`} className="text-sm font-semibold">
                    {FAMILY_LABELS[group.family] ?? group.family}
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {groupSelected}/{group.entries.length}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => selectFamily(group.entries)}
                      disabled={groupAll}
                      className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => clearFamily(group.entries)}
                      disabled={groupSelected === 0}
                      className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {group.entries.map((entry) => {
                    const checked = included.has(entry.id)
                    return (
                      <li key={entry.id}>
                        <label className="flex min-h-11 cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(entry.id)}
                            aria-label={`Include ${entry.name}`}
                            className="mt-1 size-4 shrink-0 accent-foreground"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">{entry.name}</span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {entry.description}
                            </span>
                            <span className="mt-1 block font-mono text-[10px] uppercase text-muted-foreground">
                              {entry.id} · {slotSummary(entry)}
                            </span>
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Selection is saved to this system only and drives the Components chapter in the PDF handbook. Core components are production-ready and add no validation warnings.
      </p>
    </>
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
