import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"
import { CopyButton } from "@/components/copy-button"
import { FoundationsRelated } from "@/components/foundations-related"

export const metadata: Metadata = {
  title: "Shadows — Foundations | DavinciUI",
  description: "Shadow system for DavinciUI — card, hover, and panel shadows.",
}

const shadows: { name: string; varName: string; description: string; usage: string }[] = [
  { name: "Card", varName: "--shadow-card", description: "Default card elevation", usage: "Cards, tiles" },
  { name: "Card Hover", varName: "--shadow-card-hover", description: "Elevated on hover", usage: "Hover cards" },
  { name: "Panel", varName: "--shadow-panel", description: "Floating panel", usage: "Popovers, dropdowns" },
]

export default function ShadowsPage() {
  return (
    <ComponentLayout
      title="Shadows"
      description="Three shadow primitives from globals.css — light/dark aware. Use for layered surfaces; no new shadows are introduced here."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Shadows create elevation. DavinciUI currently defines three primitives in <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">globals.css</code>. They adapt to light/dark via CSS variables.
        </p>
      </Section>

      <Section title="Shadow System" id="shadow-system">
        <p className="text-sm text-muted-foreground">
          Shadows are defined as <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">--shadow-*</code> variables combining <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">--surface-inset</code> + layered drop shadows. Use via <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">shadow-[var(--shadow-card)]</code>. No new shadows are created in this phase.
        </p>
      </Section>

      <Section title="Available Shadows" id="available-shadows">
        <div className="grid gap-4 sm:grid-cols-3">
          {shadows.map((s) => (
            <div key={s.varName} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="h-28 p-4 flex items-center justify-center bg-muted/20">
                <div className="w-full h-20 rounded-xl bg-card border border-border shadow-[var(--shadow-card)] flex items-center justify-center" style={{ boxShadow: `var(${s.varName})` }}>
                  <span className="text-xs font-mono text-muted-foreground">{s.name}</span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  <CopyButton code={`var(${s.varName})`} />
                </div>
                <p className="text-xs font-mono text-muted-foreground">{s.varName}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.description} — {s.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Elevation Examples" id="elevation-examples">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/10 p-4 flex flex-col items-center gap-3">
            <div className="w-full h-20 rounded-xl bg-card border border-border flex items-center justify-center text-xs font-mono text-muted-foreground">Base — no shadow</div>
            <p className="text-xs font-mono text-muted-foreground">Flat</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/10 p-4 flex flex-col items-center gap-3">
            <div className="w-full h-20 rounded-xl bg-card border border-border shadow-[var(--shadow-card)] flex items-center justify-center text-xs font-medium">Card</div>
            <p className="text-xs font-mono text-muted-foreground">--shadow-card</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/10 p-4 flex flex-col items-center gap-3">
            <div className="group w-full h-20 rounded-xl bg-card border border-border shadow-[var(--shadow-card)] group-hover:shadow-[var(--shadow-card-hover)] transition-shadow flex items-center justify-center text-xs font-medium">
              Hover me
            </div>
            <p className="text-xs font-mono text-muted-foreground">→ --shadow-card-hover</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-border p-4 flex justify-center">
          <div className="w-64 rounded-xl bg-popover border border-border shadow-[var(--shadow-panel)] p-4">
            <p className="text-sm font-medium">Panel</p>
            <p className="text-xs text-muted-foreground">--shadow-panel — popover, dropdown</p>
          </div>
        </div>
      </Section>

      <Section title="Light / Dark Behavior" id="light-dark-behavior">
        <p className="text-sm text-muted-foreground mb-3">Shadows include <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">--surface-inset</code> and adapt via <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">.dark</code> overrides. Toggle theme to see live change — no duplication.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4 bg-white">
            <p className="text-xs font-mono text-muted-foreground mb-2">Light</p>
            <div className="h-20 rounded-xl bg-white border shadow-[var(--shadow-card)]" />
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-[#0a0a0a] dark">
            <p className="text-xs font-mono text-zinc-400 mb-2">Dark</p>
            <div className="h-20 rounded-xl bg-[#121212] border border-white/10 shadow-[var(--shadow-card)]" />
          </div>
        </div>
      </Section>

      <Section title="Hover Interaction" id="hover">
        <p className="text-sm text-muted-foreground mb-3">Hover transition — subtle, no extra animation.</p>
        <div className="group w-full max-w-sm mx-auto rounded-2xl bg-card border border-border p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200">
          <p className="text-sm font-medium">Hover this card</p>
          <p className="text-xs text-muted-foreground">shadow-card → shadow-card-hover on hover</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">class: hover:shadow-[var(--shadow-card-hover)]</p>
        </div>
      </Section>

      <Section title="Usage Guidelines" id="usage-guidelines">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>Use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">shadow-[var(--shadow-card)]</code> for cards/tiles.</li>
          <li>Use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">shadow-[var(--shadow-panel)]</code> for floating panels.</li>
          <li>Hover elevation is automatic via <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">hover:shadow-[var(--shadow-card-hover)]</code> — keep transition subtle.</li>
          <li>Dark mode is automatic — do not duplicate shadow definitions.</li>
        </ul>
      </Section>
      <FoundationsRelated
        items={[
          ["Colors", "/docs/foundations/colors"],
          ["Borders", "/docs/foundations/borders"],
          ["Border Radius", "/docs/foundations/border-radius"],
        ]}
      />
    </ComponentLayout>
  )
}
