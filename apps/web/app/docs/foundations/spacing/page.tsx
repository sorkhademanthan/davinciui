import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"
import { CopyButton } from "@/components/copy-button"
import { FoundationsRelated } from "@/components/foundations-related"

export const metadata: Metadata = {
  title: "Spacing — Foundations | DavinciUI",
  description: "Spacing scale for DavinciUI — current Tailwind defaults.",
}

const spacingScale: { v: number; rem: string; px: string; cls: string }[] = [
  { v: 2, rem: "0.5rem", px: "8px", cls: "gap-2 / p-2" },
  { v: 4, rem: "1rem", px: "16px", cls: "gap-4 / p-4" },
  { v: 6, rem: "1.5rem", px: "24px", cls: "gap-6 / p-6" },
  { v: 8, rem: "2rem", px: "32px", cls: "gap-8 / p-8" },
  { v: 12, rem: "3rem", px: "48px", cls: "gap-12" },
  { v: 16, rem: "4rem", px: "64px", cls: "gap-16" },
  { v: 20, rem: "5rem", px: "80px", cls: "gap-20" },
  { v: 24, rem: "6rem", px: "96px", cls: "gap-24" },
  { v: 32, rem: "8rem", px: "128px", cls: "gap-32" },
  { v: 40, rem: "10rem", px: "160px", cls: "gap-40" },
  { v: 48, rem: "12rem", px: "192px", cls: "gap-48" },
  { v: 64, rem: "16rem", px: "256px", cls: "gap-64" },
]

function SpacingRuler({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs font-mono text-muted-foreground shrink-0">{value}</span>
      <span className="w-16 text-xs font-mono text-muted-foreground shrink-0">{value / 4}rem</span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className="h-2 rounded-full bg-foreground" style={{ width: `${Math.min(value * 3, 220)}px` }} />
        <span className="text-xs font-mono text-muted-foreground hidden sm:inline">{value * 4}px</span>
      </div>
      <span className="hidden sm:inline text-xs font-mono text-muted-foreground w-28 text-right">{spacingScale.find((s) => s.v === value)?.cls}</span>
      <CopyButton code={`gap-${value}`} />
    </div>
  )
}

export default function SpacingPage() {
  return (
    <ComponentLayout
      title="Spacing"
      description="Current spacing uses Tailwind’s default scale (4 = 1rem / 16px). Values below are implementation defaults, not yet formalized as Davinci tokens — they will be aliased in the Tokens phase."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Spacing creates rhythm. DavinciUI currently relies on Tailwind’s numeric scale. Use the scale consistently: small values for related elements, larger values for section separation. Avoid one-off arbitrary values.
        </p>
      </Section>

      <Section title="Spacing Scale" id="spacing-scale">
        <p className="text-sm text-muted-foreground mb-4">Visual ruler — larger value, larger gap. All values are multiples of 4.</p>
        <div className="rounded-xl border border-border p-4 sm:p-6 space-y-3">
          {spacingScale.map((s) => (
            <SpacingRuler key={s.v} value={s.v} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">CSS: <code className="font-mono px-1 py-0.5 rounded bg-muted">1rem = 16px</code> · <code className="font-mono px-1 py-0.5 rounded bg-muted">gap-4 = 1rem</code></p>
      </Section>

      <Section title="Visual Scale" id="visual-scale">
        <div className="rounded-xl border border-border p-6">
          <div className="flex items-end gap-2 h-20">
            {[2, 4, 8, 12, 16, 24, 32].map((v) => (
              <div key={v} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full rounded bg-foreground/10 border border-border" style={{ height: `${v * 1.2 + 8}px` }} />
                <span className="text-[10px] font-mono text-muted-foreground">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">8 → 12 → 16 → 24 progression for section rhythm</p>
        </div>
      </Section>

      <Section title="Padding" id="padding">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground">p-4 (16px)</p>
            <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
              <div className="h-12 rounded bg-card border border-border shadow-sm" />
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground">p-6 (24px)</p>
            <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/20 p-6">
              <div className="h-12 rounded bg-card border border-border shadow-sm" />
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground">px-4 py-8</p>
            <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8">
              <div className="h-8 rounded bg-card border border-border" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Margin" id="margin">
        <div className="rounded-xl border border-border p-4 sm:p-6">
          <p className="text-xs font-mono text-muted-foreground mb-3">Stack with mt-8 / mb-12</p>
          <div className="space-y-2">
            <div className="h-10 rounded bg-muted border border-border" />
            <div className="h-2" />
            <div className="h-10 rounded bg-muted border border-border mt-8" />
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              mt-8 (32px) <span className="h-px flex-1 bg-border" />
            </div>
            <div className="h-10 rounded bg-muted border border-border mb-12" />
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              mb-12 (48px)
              <span className="h-px flex-1 bg-border" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Gap" id="gap">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">Flex gap-4</p>
            <div className="flex gap-4">
              <div className="flex-1 h-12 rounded bg-foreground/10 border border-border" />
              <div className="flex-1 h-12 rounded bg-foreground/10 border border-border" />
              <div className="flex-1 h-12 rounded bg-foreground/10 border border-border" />
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground mb-3">Grid gap-6</p>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-10 rounded bg-muted border border-border" />
              <div className="h-10 rounded bg-muted border border-border" />
              <div className="h-10 rounded bg-muted border border-border" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Common Usage" id="common-usage">
        <div className="rounded-xl border border-border bg-muted/10 p-4 font-mono text-xs space-y-1">
          <p>gap-4 <span className="text-muted-foreground">— card grids, stacks</span></p>
          <p>p-6 <span className="text-muted-foreground">— card padding</span></p>
          <p>px-4 py-8 <span className="text-muted-foreground">— section padding</span></p>
          <p>space-y-6 <span className="text-muted-foreground">— form stacks</span></p>
          <p>mt-8 <span className="text-muted-foreground">— section separation</span></p>
        </div>
      </Section>

      <Section title="Guidelines" id="guidelines">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>Use smaller spacing (2–4) for related elements, larger (8–16–24) between groups.</li>
          <li>Keep rhythm — prefer 4/8/12/16/24 for layouts, 2/3 for tight inline.</li>
          <li>Avoid arbitrary values like <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">p-[13px]</code> — use the scale.</li>
          <li>Consistent gap is more important than inventing a new token now.</li>
        </ul>
      </Section>
      <FoundationsRelated
        items={[
          ["Sizing", "/docs/foundations/sizing"],
          ["Breakpoints", "/docs/foundations/breakpoints"],
          ["Colors", "/docs/foundations/colors"],
        ]}
      />
    </ComponentLayout>
  )
}
