"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, ArrowUpRight } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { components } from "@/registry"
import { cn } from "@/lib/utils"

const BASIC_SLUGS: Record<string, string[]> = {
  Actions: ["button", "button-group", "toggle", "link"],
  Forms: ["input", "textarea", "select", "checkbox", "radio", "switch", "form"],
  Feedback: ["alert", "toast", "progress", "spinner", "skeleton"],
  Navigation: ["tabs", "breadcrumb", "pagination", "sidebar", "navigation-menu"],
  Overlays: ["dialog", "drawer", "popover", "tooltip", "dropdown-menu"],
  "Data Display": ["card", "badge", "avatar", "table", "data-table"],
  Layout: ["accordion", "carousel", "collapsible", "scroll-area"],
}
const BASIC_ALL = Object.values(BASIC_SLUGS).flat()

const TOP_FILTERS = [
  "All",
  "Basic",
  "Text Animations",
  "Premium Components",
  "Hero Backgrounds",
  "Visual Effects",
  "Sky Effects",
  "Motion",
  "Scroll",
  "Blocks",
  "Templates",
] as const

const BASIC_SUBS = ["All", "Actions", "Forms", "Feedback", "Navigation", "Overlays", "Data Display", "Layout"] as const

type TopFilter = (typeof TOP_FILTERS)[number]
type BasicSub = (typeof BASIC_SUBS)[number]

export default function ComponentsGalleryPage() {
  const [q, setQ] = useState("")
  const [activeTop, setActiveTop] = useState<TopFilter>("All")
  const [activeSub, setActiveSub] = useState<BasicSub>("All")

  const all = useMemo(() => Object.values(components).sort((a, b) => a.title.localeCompare(b.title)), [])

  const filtered = useMemo(() => {
    return all.filter((c) => {
      const matchesSearch = !q.trim() || c.title.toLowerCase().includes(q.toLowerCase()) || c.description.toLowerCase().includes(q.toLowerCase())
      if (!matchesSearch) return false
      if (activeTop === "All") return true
      if (activeTop === "Basic") {
        if (activeSub === "All") return BASIC_ALL.includes(c.slug)
        return (BASIC_SLUGS[activeSub] || []).includes(c.slug)
      }
      if (activeTop === "Text Animations") return c.category === "Text Animations"
      if (activeTop === "Premium Components") return c.category === "Premium Components"
      if (activeTop === "Hero Backgrounds") return c.category === "Hero Backgrounds"
      if (activeTop === "Visual Effects") return c.category === "Visual Effects"
      if (activeTop === "Sky Effects") return c.category === "ASCII Effects"
      // Motion / Scroll / Blocks / Templates have dedicated pages – show no registry match (handled as empty state with link)
      if (activeTop === "Motion" || activeTop === "Scroll" || activeTop === "Blocks" || activeTop === "Templates") return false
      return false
    })
  }, [q, activeTop, activeSub, all])

  const handleTopChange = (t: TopFilter) => {
    setActiveTop(t)
    if (t !== "Basic") setActiveSub("All")
  }

  return (
    <div className="w-full max-w-[1280px] px-6 lg:px-8 py-6">
      <Breadcrumbs className="mb-4" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
          <p className="text-sm text-muted-foreground mt-1">Production-ready components — click a card to open docs with live preview on the right.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search components…"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-white dark:bg-zinc-900 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TOP_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => handleTopChange(cat)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
              activeTop === cat ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white" : "bg-white hover:bg-zinc-50 border-border text-muted-foreground hover:text-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeTop === "Basic" && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/40 pt-3">
          {BASIC_SUBS.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSub(sub)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
                activeSub === sub ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white" : "bg-zinc-50 hover:bg-zinc-100 border-border text-muted-foreground hover:text-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800"
              )}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const getSources = (url?: string) => {
            if (!url) return null
            // Derive webm/mp4 from any extension (mov/webm/mp4) for resilient playback
            const m = url.match(/^(.*)\.(mov|mp4|webm)(\?.*)?$/i)
            if (!m) return { webm: url, mp4: url }
            const base = m[1]
            const q = m[3] || ""
            return { webm: `${base}.webm${q}`, mp4: `${base}.mp4${q}` }
          }
          const sources = getSources(c.previewVideo)
          return (
          <Link
            key={c.slug}
            href={`/experience/components/${c.slug}`}
            className="group relative flex flex-col rounded-2xl border border-border bg-white dark:bg-zinc-900/50 overflow-hidden hover:border-input hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="p-1.5">
              <div className="relative h-48 rounded-xl border border-border bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                {sources ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  >
                    <source src={sources.webm} type="video/webm" />
                    <source src={sources.mp4} type="video/mp4" />
                  </video>
                ) : c.previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.previewImage} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/[0.04] via-transparent to-transparent dark:from-white/[0.04] flex items-center justify-center">
                    <div className="size-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-xs font-mono shadow-sm">
                      {c.title.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/90 dark:bg-black/50 border border-border backdrop-blur">
                  {c.category || "component"}
                </span>
              </div>
            </div>
            <div className="px-4 pb-4 pt-1">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                {c.title} <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
            </div>
          </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center space-y-3">
          <p className="text-sm text-muted-foreground">No components match “{q}” in {activeTop}{activeTop === "Basic" && activeSub !== "All" ? ` › ${activeSub}` : ""}.</p>
          {(activeTop === "Motion" || activeTop === "Scroll" || activeTop === "Blocks" || activeTop === "Templates") && (
            <div className="flex justify-center gap-2 text-xs">
              {activeTop === "Motion" && <Link href="/docs/motion/components" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">Go to Motion →</Link>}
              {activeTop === "Scroll" && <Link href="/docs/scroll/animations" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">Go to Scroll →</Link>}
              {activeTop === "Blocks" && <Link href="/blocks" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">Go to Blocks →</Link>}
              {activeTop === "Templates" && <Link href="/templates" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">Go to Templates →</Link>}
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        Preview on the right, variants at bottom, toolbar with <span className="font-mono">Search · Source · Replay · Fullscreen · Theme</span> — same as Letter Cascade detail view. Click any card.
      </p>
    </div>
  )
}
