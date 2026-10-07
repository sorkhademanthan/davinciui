import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"
import { FoundationsRelated } from "@/components/foundations-related"

export const metadata: Metadata = {
  title: "Typography — Foundations | DavinciUI",
  description: "Typography system for DavinciUI — fonts, scale, and usage.",
}

const fontFamilies = [
  { label: "Sans — Geist", varName: "--font-sans", family: "Geist", sample: "The quick brown fox jumps over the lazy dog.", usage: "UI, body, headings" },
  { label: "Mono — JetBrains Mono", varName: "--font-mono", family: "JetBrains Mono", sample: "const davinci = 'typography';", usage: "Code, mono" },
  { label: "Serif — Instrument Serif", varName: "--font-serif", family: "Instrument Serif", sample: "Editorial display", usage: "Display, hero" },
]

const typeScale: { label: string; className: string; size: string; weight: string; leading: string; tailwind: string; style?: React.CSSProperties }[] = [
  { label: "Display", className: "text-5xl font-bold tracking-tight", size: "48px", weight: "700", leading: "1", tailwind: "text-5xl font-bold", style: { fontFamily: "var(--font-display)" } },
  { label: "H1", className: "text-4xl font-bold tracking-tight", size: "36px", weight: "700", leading: "1.1", tailwind: "text-4xl font-bold" },
  { label: "H2", className: "text-3xl font-semibold tracking-tight", size: "30px", weight: "600", leading: "1.1", tailwind: "text-3xl font-semibold" },
  { label: "H3", className: "text-2xl font-semibold tracking-tight", size: "24px", weight: "600", leading: "1.2", tailwind: "text-2xl font-semibold" },
  { label: "H4", className: "text-xl font-semibold tracking-tight", size: "20px", weight: "600", leading: "1.3", tailwind: "text-xl font-semibold" },
  { label: "Body Large", className: "text-lg leading-relaxed", size: "18px", weight: "400", leading: "1.625", tailwind: "text-lg leading-relaxed" },
  { label: "Body", className: "text-base leading-7", size: "16px", weight: "400", leading: "1.75", tailwind: "text-base leading-7" },
  { label: "Body Small", className: "text-sm leading-6", size: "14px", weight: "400", leading: "1.5", tailwind: "text-sm leading-6" },
  { label: "Caption", className: "text-xs text-muted-foreground", size: "12px", weight: "400", leading: "1.33", tailwind: "text-xs" },
]

export default function TypographyPage() {
  return (
    <ComponentLayout
      title="Typography"
      description="Current type system — Geist sans/mono and Instrument Serif. Scale below reflects actual implementation; token formalization will follow."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Typography is set via CSS variables (<code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">--font-sans</code>, <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">--font-mono</code>, <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">--font-serif</code>, <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">--font-display</code>) and Tailwind size/weight/leading utilities. No new scale is invented here.
        </p>
      </Section>

      <Section title="Font Families" id="font-families">
        <div className="grid gap-4">
          {fontFamilies.map((f) => (
            <div key={f.label} className="rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{f.varName}</p>
                  <p className="text-sm font-medium mt-1">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.usage}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted font-mono">{f.family}</span>
              </div>
              <p
                className="mt-4 text-2xl leading-none"
                style={{ fontFamily: f.varName === "--font-serif" ? "var(--font-serif)" : f.varName === "--font-mono" ? "var(--font-mono)" : "var(--font-sans)" }}
              >
                {f.sample}
              </p>
              <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: f.varName === "--font-serif" ? "var(--font-serif)" : undefined }}>
                Aa Bb Cc 0123
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type Scale" id="type-scale">
        <div className="space-y-4">
          {typeScale.map((item) => (
            <div key={item.label} className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-2 border-b border-border/50 pb-4 last:border-0">
              <div className="min-w-0">
                <p className={item.className} style={item.style}>
                  {item.label} — DavinciUI
                </p>
                <p className="text-xs text-muted-foreground mt-1 hidden lg:block">The quick brown fox jumps over the lazy dog.</p>
              </div>
              <div className="shrink-0 flex flex-wrap gap-2 text-xs font-mono text-muted-foreground lg:justify-end">
                <span className="px-2 py-1 rounded bg-muted">{item.size}</span>
                <span className="px-2 py-1 rounded bg-muted">{item.weight}</span>
                <span className="px-2 py-1 rounded bg-muted">{item.leading}</span>
                <span className="px-2 py-1 rounded bg-muted hidden sm:inline">{item.tailwind}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Headings" id="headings">
        <div className="space-y-6 rounded-xl border border-border p-6">
          <h1 className="text-4xl font-bold tracking-tight">Heading 1 — Bold 36px</h1>
          <h2 className="text-3xl font-semibold tracking-tight">Heading 2 — Semibold 30px</h2>
          <h3 className="text-2xl font-semibold tracking-tight">Heading 3 — Semibold 24px</h3>
          <h4 className="text-xl font-semibold tracking-tight">Heading 4 — Semibold 20px</h4>
          <p className="text-xs text-muted-foreground">Use <code className="font-mono px-1 py-0.5 rounded bg-muted">tracking-tight</code> for headings; hero display uses <code className="font-mono px-1 py-0.5 rounded bg-muted">--font-display</code>.</p>
        </div>
      </Section>

      <Section title="Body" id="body">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-6">
            <p className="text-sm font-medium">Body</p>
            <p className="text-base leading-7 mt-2">DavinciUI is a design system for building polished React interfaces. Body text uses <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">text-base leading-7</code> for comfortable reading.</p>
          </div>
          <div className="rounded-xl border border-border p-6">
            <p className="text-sm font-medium">Body Small</p>
            <p className="text-sm leading-6 mt-2 text-muted-foreground">Secondary descriptions and card copy use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">text-sm leading-6</code> with <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">text-muted-foreground</code>.</p>
          </div>
        </div>
      </Section>

      <Section title="Labels & Captions" id="labels">
        <div className="flex flex-wrap gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border border-border rounded-full px-3 py-1">Label — uppercase tracking-widest</span>
          <span className="text-xs text-muted-foreground">Caption — 12px muted</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Overline — 11px</span>
        </div>
      </Section>

      <Section title="Code" id="code">
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-mono">const tokens = {`{ color: "var(--primary)" }`}</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">// JetBrains Mono — use for code, kbd, and mono labels</p>
        </div>
      </Section>

      <Section title="Weights" id="weights">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-normal">Regular 400 — Body</p>
            <p className="text-xs text-muted-foreground mt-1">Default for prose</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium">Medium 500 — UI labels</p>
            <p className="text-xs text-muted-foreground mt-1">Buttons, nav</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">Semibold 600 — Headings</p>
            <p className="text-xs text-muted-foreground mt-1">H2–H4</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-bold">Bold 700 — Display</p>
            <p className="text-xs text-muted-foreground mt-1">Hero, H1</p>
          </div>
        </div>
      </Section>

      <Section title="Specimen" id="specimen">
        <div className="rounded-xl border border-border p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Specimen</p>
          <p className="mt-4 text-6xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Aa</p>
          <p className="mt-2 text-xl leading-7">The quick brown fox jumps over the lazy dog.</p>
          <p className="mt-1 text-sm text-muted-foreground">0123456789 — !@#$%^&*()</p>
          <p className="mt-4 font-mono text-sm bg-muted px-3 py-2 rounded">DavinciUI — Aa 0123 — const x = 42;</p>
        </div>
      </Section>

      <Section title="Usage Guidance" id="usage">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>Headings: <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">text-2xl font-semibold tracking-tight</code></li>
          <li>Body: <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">text-sm leading-6</code> or <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">text-base leading-7</code></li>
          <li>Use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">--font-serif</code> for editorial display, <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">--font-mono</code> for code</li>
          <li>Keep line-length ≤ 65ch for prose</li>
        </ul>
      </Section>
      <FoundationsRelated
        items={[
          ["Typeset", "/docs/typeset"],
          ["Colors", "/docs/foundations/colors"],
          ["Spacing", "/docs/foundations/spacing"],
          ["Icons", "/docs/foundations/icons"],
        ]}
      />
    </ComponentLayout>
  )
}
