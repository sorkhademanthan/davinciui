"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ArrowUpRight, Sparkles, Layers, Zap, Box, Palette } from "lucide-react"
import { components } from "@/registry"
import { cn } from "@/lib/utils"

// ── Showcase tiers ───────────────────────────────────────────────────────
const CORE_COMPONENTS = ["button", "input", "dialog", "card", "tabs", "tooltip"] as const
const PREMIUM_PREVIEW = [
  { slug: "orbit-card-stack", title: "Orbit Card Stack", desc: "Fanned deck, lift on hover" },
  { slug: "wheel-carousel", title: "Wheel Carousel", desc: "Cinematic wheel picker" },
  { slug: "newsletter-bookshelf", title: "Newsletter Bookshelf", desc: "3D tactile archive" },
]
const SCROLL_EXPERIENCES = [
  { slug: "sticky-scroll-cards", title: "Sticky Scroll Cards", desc: "Pinned cards, depth on scroll" },
  { slug: "scroll-choreography", title: "Scroll Choreography", desc: "Framer-driven image flow" },
  { slug: "scroll-tilted-grid", title: "Scroll Tilted Grid", desc: "Tilt → focus on viewport" },
]
const MOTION_SHOWCASE = [
  { slug: "hover-transition", title: "Hover Transition", desc: "8 hover effects, directions" },
  { slug: "kinetic-text-reveal", title: "Kinetic Text Reveal", desc: "Blur + stagger entrance" },
  { slug: "magnetic-dock", title: "Magnetic Dock", desc: "Proximity scaling" },
]
const BLOCKS = [
  { href: "/blocks/hero-section", title: "Hero", desc: "Cinematic hero sections" },
  { href: "/blocks/pricing/pricing-01", title: "Pricing", desc: "Conversion-ready pricing" },
  { href: "/blocks", title: "Features", desc: "Complete compositions" },
]

function ShowcaseCard({ title, desc, href, kicker }: { title: string; desc: string; href: string; kicker?: string }) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-border bg-white dark:bg-zinc-900/50 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-input hover:shadow-card-hover"
    >
      <div className="p-1.5">
        <div className="relative h-36 sm:h-40 rounded-xl border border-dashed border-border bg-zinc-50 dark:bg-zinc-900/80 group-hover:bg-zinc-100/60 dark:group-hover:bg-zinc-800/80 transition-colors overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/[0.03] via-transparent to-transparent dark:from-white/[0.03]" />
          <div className="relative size-12 rounded-xl bg-foreground text-background flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Box className="size-5" />
          </div>
          <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 dark:bg-black/40 border border-border backdrop-blur">
            preview
          </span>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2">
        {kicker && <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">{kicker}</p>}
        <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors flex items-center gap-1.5">
          {title} <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5 transition-all" />
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{desc}</p>
      </div>
    </Link>
  )
}

function PremiumHeroCard() {
  return (
    <Link href="/docs/components/orbit-card-stack" className="group relative block overflow-hidden rounded-2xl border border-border bg-zinc-950 dark:bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-cyan-500/20" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
      <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center gap-8 min-h-[280px]">
        <div className="flex-1">
          <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-white/60 border border-white/10 rounded-full px-2.5 py-1 bg-white/5 backdrop-blur">
            <Sparkles className="size-3" /> Premium Experience
          </p>
          <h3 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-white">Interactions that feel alive.</h3>
          <p className="mt-2 text-sm leading-6 text-white/60 max-w-md">Large previews, real interaction, controls for duration, stagger and easing — built with Framer Motion & WebGL.</p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:gap-2 transition-all">
            Explore Premium <ArrowUpRight className="size-4" />
          </span>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-3 max-w-md w-full">
          {PREMIUM_PREVIEW.map((p) => (
            <div key={p.slug} className="rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur p-3 flex flex-col gap-2">
              <div className="h-16 rounded-lg bg-white/10 border border-white/10" />
              <p className="text-xs font-medium text-white truncate">{p.title}</p>
              <p className="text-[11px] text-white/50 truncate">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default function DocsPage() {
  const [q, setQ] = useState("")
  const all = useMemo(() => Object.values(components), [])
  const filtered = useMemo(() => {
    if (!q.trim()) return null
    const needle = q.toLowerCase()
    return all.filter((c) => c.title.toLowerCase().includes(needle) || c.description.toLowerCase().includes(needle)).slice(0, 8)
  }, [q, all])

  const core = useMemo(() => CORE_COMPONENTS.map((s) => components[s]).filter(Boolean), [])

  return (
    <div className="min-h-screen bg-white dark:bg-background text-foreground overflow-x-hidden">
      {/* ── Hero ── */}
      <div className="relative border-b border-border/50 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-background">
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <div className="relative mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground border border-border rounded-full inline-flex px-2.5 py-1 bg-white dark:bg-zinc-900">DavinciUI · Visual Library</p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.05]">
              Build interfaces
              <br />
              <span className="text-muted-foreground">that feel alive.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-6 text-muted-foreground max-w-xl">
              Beautiful components, motion, scroll experiences and premium UI — ready to ship. Copy, paste, customize.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search components, motion, blocks..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-white dark:bg-zinc-900 shadow-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
            {filtered && (
              <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-white dark:bg-zinc-900 shadow-card z-20 overflow-hidden">
                {filtered!.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No results for “{q}”</p>
                ) : (
                  filtered!.map((c) => (
                    <Link key={c!.slug} href={`/docs/components/${c!.slug}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 text-sm">
                      <span className="font-medium">{c!.title}</span>
                      <span className="text-xs text-muted-foreground">{c!.category}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground">Try:</span>
            {["Button", "Magnetic", "Scroll", "Text Reveal"].map((t) => (
              <button key={t} onClick={() => setQ(t)} className="px-2.5 py-1 rounded-full border border-border bg-white dark:bg-zinc-900 hover:bg-muted transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-16">
        {/* ── COMPONENTS ── */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Layers className="size-4 text-muted-foreground" /> COMPONENTS
              </h2>
              <p className="text-sm text-muted-foreground">Core credibility — what developers expect.</p>
            </div>
            <Link href="/docs/components" className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-white dark:bg-zinc-900 hover:bg-muted transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {core.map((c) => (
              <ShowcaseCard key={c!.slug} title={c!.title} desc={c!.description} href={`/docs/components/${c!.slug}`} kicker="Core" />
            ))}
          </div>
        </section>

        {/* ── PREMIUM ── */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Sparkles className="size-4 text-violet-500" /> PREMIUM
              </h2>
              <p className="text-sm text-muted-foreground">What makes DavinciUI special — large, interactive previews.</p>
            </div>
            <Link href="/docs/premium/components" className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity">
              Explore Premium
            </Link>
          </div>
          <PremiumHeroCard />
        </section>

        {/* ── SCROLL EXPERIENCES ── */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <span className="size-4 rounded bg-gradient-to-br from-cyan-500 to-blue-500 inline-block" /> SCROLL EXPERIENCES
              </h2>
              <p className="text-sm text-muted-foreground">Not components — experiences. Scroll-driven storytelling.</p>
            </div>
            <Link href="/docs/scroll/animations" className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-white dark:bg-zinc-900 hover:bg-muted transition-colors">
              View scroll →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SCROLL_EXPERIENCES.map((s) => (
              <ShowcaseCard key={s.slug} title={s.title} desc={s.desc} href={`/docs/components/${s.slug}`} kicker="Scroll" />
            ))}
          </div>
        </section>

        {/* ── MOTION ── */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Zap className="size-4 text-amber-500" /> MOTION
              </h2>
              <p className="text-sm text-muted-foreground">Hover, cursor, magnetic, text — what makes it memorable.</p>
            </div>
            <Link href="/docs/motion/components" className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-white dark:bg-zinc-900 hover:bg-muted transition-colors">
              View motion →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOTION_SHOWCASE.map((m) => (
              <ShowcaseCard key={m.slug} title={m.title} desc={m.desc} href={`/docs/components/${m.slug}`} kicker="Motion" />
            ))}
          </div>
        </section>

        {/* ── BLOCKS ── */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Box className="size-4 text-muted-foreground" /> BLOCKS
              </h2>
              <p className="text-sm text-muted-foreground">Full sections and compositions — immediately useful.</p>
            </div>
            <Link href="/blocks" className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-white dark:bg-zinc-900 hover:bg-muted transition-colors">
              View blocks →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {BLOCKS.map((b) => (
              <ShowcaseCard key={b.title} title={b.title} desc={b.desc} href={b.href} kicker="Block" />
            ))}
          </div>
        </section>

        {/* ── FOUNDATIONS subtle ── */}
        <section className="border-t border-border pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold tracking-widest uppercase">Foundations</h2>
            <span className="text-xs text-muted-foreground">— how it’s built, not what you ship</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["Colors", "/docs/foundations/colors"],
                ["Typography", "/docs/foundations/typography"],
                ["Spacing", "/docs/foundations/spacing"],
                ["Motion", "/docs/foundations/motion"],
                ["Breakpoints", "/docs/foundations/breakpoints"],
              ] as const
            ).map(([label, href]) => (
              <Link key={label} href={href} className="px-3 py-1.5 rounded-full border border-border bg-muted/30 hover:bg-muted text-xs font-medium transition-colors">
                {label}
              </Link>
            ))}
            <span className="px-3 py-1.5 text-xs text-muted-foreground">Tokens · Theming · Primitives → below the fold</span>
          </div>
        </section>
      </div>
    </div>
  )
}
