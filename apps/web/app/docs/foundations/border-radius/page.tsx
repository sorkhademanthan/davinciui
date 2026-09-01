import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"

export const metadata: Metadata = {
  title: "Border Radius — Foundations | DavinciUI",
  description: "Radius system for DavinciUI — current --radius and Tailwind scale.",
}

const radii: { label: string; value: string; className: string; note: string; isVar?: boolean }[] = [
  { label: "none", value: "0", className: "rounded-none", note: "No radius" },
  { label: "sm", value: "0.125rem", className: "rounded-sm", note: "2px" },
  { label: "md", value: "0.375rem", className: "rounded-md", note: "6px" },
  { label: "lg", value: "var(--radius)", className: "rounded-[var(--radius)]", note: "10px — base", isVar: true },
  { label: "xl", value: "0.75rem", className: "rounded-xl", note: "12px" },
  { label: "2xl", value: "1rem", className: "rounded-2xl", note: "16px" },
  { label: "3xl", value: "1.5rem", className: "rounded-3xl", note: "24px" },
  { label: "full", value: "9999px", className: "rounded-full", note: "Pill" },
]

export default function BorderRadiusPage() {
  return (
    <ComponentLayout
      title="Border Radius"
      description="Current radius uses --radius: 0.625rem (10px) as single CSS variable. Scales below are Tailwind defaults — future tokens will alias these, not create --radius-sm/md yet."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Radius softens edges. DavinciUI currently has one semantic variable (<code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">--radius</code>) plus Tailwind’s scale. Use the scale directly; semantic aliases will arrive in Tokens phase.
        </p>
      </Section>

      <Section title="Radius Scale" id="radius-scale">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {radii.map((r) => (
            <div key={r.label} className="rounded-xl border border-border p-4 flex flex-col items-center gap-3">
              <div
                className={`w-20 h-20 bg-foreground/10 border border-border ${r.className}`}
                style={r.isVar ? { borderRadius: "var(--radius)" } : undefined}
              />
              <div className="text-center">
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{r.value}</p>
                <p className="text-xs text-muted-foreground">{r.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Component Examples" id="component-examples">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-foreground text-primary-foreground text-sm font-medium">Pill — rounded-full</div>
            <p className="text-xs font-mono text-muted-foreground">Badge, pill, avatar</p>
          </div>
          <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-3">
            <div className="w-full h-20 rounded-xl border border-border bg-card shadow-sm flex items-center justify-center text-sm">Card — rounded-xl</div>
            <p className="text-xs font-mono text-muted-foreground">Cards, panels</p>
          </div>
          <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-3">
            <div className="w-full h-12 rounded-[var(--radius)] border border-border bg-muted flex items-center justify-center text-xs font-mono">rounded-[var(--radius)]</div>
            <p className="text-xs font-mono text-muted-foreground">Base — --radius</p>
          </div>
          <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center text-primary-foreground text-xs">○</div>
            <p className="text-xs font-mono text-muted-foreground">Circular — rounded-full square</p>
          </div>
        </div>
      </Section>

      <Section title="Full Radius" id="full-radius">
        <div className="rounded-xl border border-border p-6 flex items-center justify-center gap-4">
          <div className="w-20 h-10 rounded-full bg-foreground" />
          <span className="text-xs font-mono text-muted-foreground">rounded-full on pill (height = radius)</span>
          <div className="w-16 h-16 rounded-full bg-muted border border-border" />
          <span className="text-xs font-mono text-muted-foreground">circle</span>
        </div>
      </Section>

      <Section title="Current CSS Variable" id="current-css-variable">
        <div className="rounded-xl border border-border bg-muted/20 p-4 font-mono text-sm">
          <p>:root &#123; --radius: 0.625rem; &#125; <span className="text-muted-foreground">/* 10px */</span></p>
          <p className="mt-2 text-muted-foreground">/* Do not create --radius-sm/md/lg yet — Phase 4 will introduce semantic radius tokens. */</p>
        </div>
      </Section>

      <Section title="Usage Guidelines" id="usage-guidelines">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li><code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">rounded-xl</code> — cards, panels, docs surfaces</li>
          <li><code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">rounded-full</code> — badges, pills, avatars</li>
          <li><code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">rounded-[var(--radius)]</code> — base, when you want the single source</li>
          <li>Keep radius consistent — don’t mix <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">rounded-lg</code> and <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">rounded-xl</code> arbitrarily on same surface.</li>
        </ul>
      </Section>
    </ComponentLayout>
  )
}
