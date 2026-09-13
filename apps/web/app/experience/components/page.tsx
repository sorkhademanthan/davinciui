"use client"

import { Suspense, useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, ArrowUpRight } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ComponentCardLivePreview } from "@/components/component-card-live-preview"
import { components } from "@/registry"
import { BASIC_GROUPS, BASIC_SUBS } from "@/lib/component-groups"
import { cn } from "@/lib/utils"

const BASIC_SLUGS: Record<string, string[]> = BASIC_GROUPS
const BASIC_ALL = Object.values(BASIC_SLUGS).flat()

const TOP_FILTERS = ["All", "Basic", "Text Animations", "Premium Components", "Hero Backgrounds", "Visual Effects", "ASCII Effects", "Motion", "Scroll", "Blocks", "Templates"] as const

const BASIC_SUBS_ALL: readonly string[] = BASIC_SUBS

// One intentionally shuffled, stable order for the Text Animations gallery.
// Keeping it fixed avoids cards jumping to new positions on every render.
const TEXT_ANIMATION_ORDER = [
  "gsap-text",
  "media-text-hover",
  "shake-text",
  "random-text-reveal",
  "text-video-mask",
  "encrypted-text",
  "text-reveal",
  "fluid-particle-text",
  "text-morph",
  "shader-text",
  "glitch-liquid-text",
  "rolling-text",
] as const

const TEXT_ANIMATION_RANK = new Map<string, number>(
  TEXT_ANIMATION_ORDER.map((slug, index) => [slug, index]),
)

type TopFilter = (typeof TOP_FILTERS)[number]
type BasicSub = (typeof BASIC_SUBS)[number]

function hasLiveCardPreview(
  slug: string,
): slug is
  | "gsap-text"
  | "text-morph"
  | "shake-text"
  | "encrypted-text"
  | "fluid-particle-text"
  | "glitch-liquid-text"
  | "paper-ink-background"
  | "media-text-hover"
  | "text-video-mask"
  | "random-text-reveal"
  | "shader-text"
  | "text-reveal"
  | "rolling-text" {
  return (
    slug === "gsap-text" ||
    slug === "text-morph" ||
    slug === "shake-text" ||
    slug === "encrypted-text" ||
    slug === "fluid-particle-text" ||
    slug === "glitch-liquid-text" ||
    slug === "paper-ink-background" ||
    slug === "media-text-hover" ||
    slug === "text-video-mask" ||
    slug === "random-text-reveal" ||
    slug === "shader-text" ||
    slug === "text-reveal" ||
    slug === "rolling-text"
  )
}

function validTop(value: string | null): TopFilter | null {
  if (!value) return null
  return (TOP_FILTERS as readonly string[]).includes(value) ? (value as TopFilter) : null
}

function validSub(value: string | null): BasicSub | null {
  if (!value) return null
  return (BASIC_SUBS_ALL as readonly string[]).includes(value) ? (value as BasicSub) : null
}

export default function ComponentsGalleryPage() {
  return (
    <Suspense>
      <ComponentsGallery />
    </Suspense>
  )
}

function ComponentsGallery() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState("")
  const [activeTop, setActiveTop] = useState<TopFilter>(() => validTop(searchParams.get("tab")) ?? "All")
  const [activeSub, setActiveSub] = useState<BasicSub>(() => validSub(searchParams.get("sub")) ?? "All")

  // Keep the active tabs in the URL so browser-back, reloads and shared
  // links restore the exact filtered view.
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeTop !== "All") params.set("tab", activeTop)
    if (activeTop === "Basic" && activeSub !== "All") params.set("sub", activeSub)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }, [activeTop, activeSub, pathname, router])

  const all = useMemo(() => Object.values(components).sort((a, b) => a.title.localeCompare(b.title)), [])

  const filtered = useMemo(() => {
    const matches = all.filter((c) => {
      const matchesSearch = !q.trim() || c.title.toLowerCase().includes(q.toLowerCase()) || c.description.toLowerCase().includes(q.toLowerCase())
      if (!matchesSearch) return false
      // "All" showcases non-Basic work — Basics live under the Basic tab.
      // A search query still spans everything so nothing is undiscoverable.
      if (activeTop === "All") {
        if (BASIC_ALL.includes(c.slug)) return q.trim() !== ""
        return true
      }
      if (activeTop === "Basic") {
        if (activeSub === "All") return BASIC_ALL.includes(c.slug)
        return (BASIC_SLUGS[activeSub] || []).includes(c.slug)
      }
      if (activeTop === "Text Animations") return c.category === "Text Animations"
      if (activeTop === "Premium Components") return c.category === "Premium Components"
      if (activeTop === "Hero Backgrounds") return c.category === "Hero Backgrounds"
      if (activeTop === "Visual Effects") return c.category === "Visual Effects"
      if (activeTop === "ASCII Effects") return c.category === "ASCII Effects"
      // Motion / Scroll / Blocks / Templates have dedicated pages – show no registry match (handled as empty state with link)
      if (activeTop === "Motion" || activeTop === "Scroll" || activeTop === "Blocks" || activeTop === "Templates") return false
      return false
    })

    if (activeTop === "Text Animations") {
      return matches.sort((a, b) => {
        const aRank = TEXT_ANIMATION_RANK.get(a.slug) ?? Number.MAX_SAFE_INTEGER
        const bRank = TEXT_ANIMATION_RANK.get(b.slug) ?? Number.MAX_SAFE_INTEGER
        return aRank - bRank || a.title.localeCompare(b.title)
      })
    }

    return matches
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
              activeTop === cat
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                : "bg-white hover:bg-zinc-50 border-border text-muted-foreground hover:text-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800",
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
                activeSub === sub
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                  : "bg-zinc-50 hover:bg-zinc-100 border-border text-muted-foreground hover:text-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800",
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
                    <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover">
                      <source src={sources.webm} type="video/webm" />
                      <source src={sources.mp4} type="video/mp4" />
                    </video>
                  ) : c.previewImage ? (
                    <img src={c.previewImage} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : hasLiveCardPreview(c.slug) ? (
                    <ComponentCardLivePreview slug={c.slug} />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/[0.04] via-transparent to-transparent dark:from-white/[0.04] flex items-center justify-center">
                      <div className="size-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-xs font-mono shadow-sm">
                        {c.title.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
          <p className="text-sm text-muted-foreground">
            No components match “{q}” in {activeTop}
            {activeTop === "Basic" && activeSub !== "All" ? ` › ${activeSub}` : ""}.
          </p>
          {(activeTop === "Motion" || activeTop === "Scroll" || activeTop === "Blocks" || activeTop === "Templates") && (
            <div className="flex justify-center gap-2 text-xs">
              {activeTop === "Motion" && (
                <Link href="/docs/motion/components" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">
                  Go to Motion →
                </Link>
              )}
              {activeTop === "Scroll" && (
                <Link href="/docs/scroll/animations" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">
                  Go to Scroll →
                </Link>
              )}
              {activeTop === "Blocks" && (
                <Link href="/blocks" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">
                  Go to Blocks →
                </Link>
              )}
              {activeTop === "Templates" && (
                <Link href="/templates" className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900">
                  Go to Templates →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
