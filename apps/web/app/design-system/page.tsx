import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"

const foundations = [
  { title: "Colors", href: "/design-system/foundations/colors", desc: "Palette, semantic tokens" },
  { title: "Typography", href: "/design-system/foundations/typography", desc: "Type scale, fonts" },
  { title: "Spacing", href: "/design-system/foundations/spacing", desc: "8pt scale" },
  { title: "Sizing", href: "/design-system/foundations/sizing", desc: "Sizing primitives" },
  { title: "Borders", href: "/design-system/foundations/borders", desc: "Border & ring" },
  { title: "Border Radius", href: "/design-system/foundations/border-radius", desc: "Radius tokens" },
  { title: "Shadows", href: "/design-system/foundations/shadows", desc: "Elevation" },
  { title: "Icons", href: "/design-system/foundations/icons", desc: "Icon system" },
]

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="w-full max-w-[840px] px-6 lg:px-8 py-6">
        <Breadcrumbs className="mb-4" />
        <div className="max-w-2xl">
          <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Design System</p>
          <h1 className="mt-3 text-3xl sm:text-[42px] font-semibold tracking-tight leading-[1.05]">
            Build with a consistent <br />
            <span className="text-muted-foreground">visual language.</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The foundation behind every component, interaction, and experience in the library. Tokens, themes, and principles — the
            source of truth. <span className="text-foreground font-medium">This is the engine behind everything else.</span>
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Foundations</h2>
          <p className="text-sm text-muted-foreground mt-1">The visual rules that define the system.</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {foundations.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group rounded-xl border border-border bg-white p-4 hover:border-input hover:shadow-sm transition-all dark:bg-zinc-900/50"
              >
                <h3 className="text-sm font-medium group-hover:text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-border pt-6">
          <div>
            <h3 className="text-sm font-semibold">Tokens</h3>
            <p className="text-sm text-muted-foreground mt-1">Reusable values that power the system.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/design-system/tokens" className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted">
                Overview
              </Link>
              <Link href="/design-system/tokens/semantic" className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted">
                Semantic
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Themes</h3>
            <p className="text-sm text-muted-foreground mt-1">Light, dark, and custom themes.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/design-system/themes/light" className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted">
                Light
              </Link>
              <Link href="/design-system/themes/dark" className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted">
                Dark
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Accessibility</h3>
            <p className="text-sm text-muted-foreground mt-1">Build inclusive experiences by default.</p>
            <Link
              href="/design-system/accessibility"
              className="mt-3 inline-flex text-xs font-medium px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90"
            >
              Guidelines →
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-zinc-50 p-4 dark:bg-zinc-900/30">
          <p className="text-xs font-mono text-muted-foreground">How it connects</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">Tokens → Components → Blocks → Templates</span> — Design System defines
            the language, Experience builds with it.
          </p>
        </div>
      </div>
    </div>
  )
}
