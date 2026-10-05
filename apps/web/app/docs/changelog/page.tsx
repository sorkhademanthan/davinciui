import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog — DavinciUI",
  description: "Latest updates to DavinciUI.",
}

export default function ChangelogPage() {
  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Changelog</h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          Updates to DavinciUI. New components, fixes and registry changes.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        <section className="rounded-lg border p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold">2026-08 — Docs refresh</h2>
            <span className="text-xs font-mono text-muted-foreground">Latest</span>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Rebuilt docs landing — Introduction with shadcn-inspired typography and install command.</li>
            <li>Minimal IA: Getting Started + Components. Removed duplicate foundations sidebar.</li>
            <li>Added Installation, components.json, Theming, Dark Mode, CLI and Changelog pages.</li>
            <li>Components index at /docs/components with category grouping and counts.</li>
          </ul>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-sm font-semibold">2026-07 — Visual effects</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>New: Dithered Logo, Spiral 3D Slider, Newsletter Bookshelf.</li>
            <li>Hero backgrounds: Silk Aurora and Liquid Chrome.</li>
          </ul>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-sm font-semibold">2026-06 — Premium interactions</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>New: Orbit Card Stack, Sticky Scroll Cards.</li>
            <li>CLI registry under @davinciui — install any component via shadcn add.</li>
          </ul>
        </section>

        <p className="text-sm leading-6 text-muted-foreground">
          Full history in GitHub releases. For component-level changes see each component page.
        </p>
      </div>
    </div>
  )
}
