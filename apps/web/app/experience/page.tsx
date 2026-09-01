import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="w-full max-w-[840px] px-6 lg:px-8 py-6">
        <Breadcrumbs className="mb-4" />
        <div className="max-w-2xl">
          <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Components</p>
          <h1 className="mt-3 text-3xl sm:text-[42px] font-semibold tracking-tight leading-[1.05]">
            Production-ready <br />
            <span className="text-muted-foreground">components.</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            What developers use to build products. Components, motion, scroll, and blocks — all under one roof.{" "}
            <span className="text-foreground font-medium">Build interfaces that feel exceptional.</span>
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <Link href="/experience/components" className="group rounded-2xl border bg-zinc-950 p-6 sm:p-8 text-white hover:bg-black transition-colors dark:bg-zinc-900 dark:border-white/10">
            <h2 className="text-lg font-medium">Components</h2>
            <p className="text-sm text-white/60 mt-1">Reusable interface components — actions, forms, navigation, feedback, overlays, data display, layout.</p>
            <span className="mt-4 inline-flex text-sm font-medium text-white group-hover:gap-1.5 gap-1 transition-all">Explore Components →</span>
          </Link>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/experience/motion" className="rounded-2xl border p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-input transition-colors">
              <h3 className="text-sm font-semibold">Motion</h3>
              <p className="text-sm text-muted-foreground mt-1">Bring interfaces to life — hover, cursor, magnetic, text.</p>
              <span className="mt-3 inline-flex text-xs font-medium">Explore Motion →</span>
            </Link>
            <Link href="/experience/scroll" className="rounded-2xl border p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-input transition-colors">
              <h3 className="text-sm font-semibold">Scroll</h3>
              <p className="text-sm text-muted-foreground mt-1">Create immersive scroll experiences — reveals, parallax, sticky.</p>
              <span className="mt-3 inline-flex text-xs font-medium">Explore Scroll →</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/experience/blocks" className="rounded-2xl border border-border bg-zinc-50 p-6 hover:bg-white hover:shadow-sm transition-all dark:bg-zinc-900/30">
              <h3 className="text-sm font-semibold">Blocks</h3>
              <p className="text-sm text-muted-foreground mt-1">Complete sections ready to use — hero, pricing, features, footers.</p>
              <span className="mt-3 inline-flex text-xs font-medium">Explore Blocks →</span>
            </Link>
            <Link href="/experience/templates" className="rounded-2xl border border-dashed p-6 hover:border-solid hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
              <h3 className="text-sm font-semibold">Templates</h3>
              <p className="text-sm text-muted-foreground mt-1">Build entire pages faster — landing, dashboards (soon).</p>
              <span className="mt-3 inline-flex text-xs font-medium">Browse Templates →</span>
            </Link>
          </div>

        </div>

        <p className="mt-8 text-xs text-muted-foreground">Legacy routes <span className="font-mono">/docs/components/*</span> and <span className="font-mono">/blocks</span> remain, canonical is <span className="font-mono">/experience/*</span>.</p>
      </div>
    </div>
  )
}
