import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"
import { FoundationsRelated } from "@/components/foundations-related"

export const metadata: Metadata = {
  title: "Sizing — Foundations | DavinciUI",
  description: "Sizing conventions for DavinciUI — widths, heights, and containers.",
}

const controlSizes: { label: string; h: string; cls: string; px: string }[] = [
  { label: "Small", h: "h-8", cls: "h-8 (32px)", px: "32px" },
  { label: "Default", h: "h-9", cls: "h-9 (36px)", px: "36px" },
  { label: "Large", h: "h-10", cls: "h-10 (40px)", px: "40px" },
  { label: "XL", h: "h-12", cls: "h-12 (48px)", px: "48px" },
]

export default function SizingPage() {
  return (
    <ComponentLayout
      title="Sizing"
      description="Current sizing uses Tailwind width/height and container max-widths. No custom sizing tokens yet — values below are implementation conventions, not formal Davinci tokens."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Sizing covers fixed control heights, fluid widths, and container constraints. DavinciUI currently relies on Tailwind’s <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">w-*</code> / <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">h-*</code> scale and <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-*</code> containers. Future tokens will alias these.
        </p>
      </Section>

      <Section title="Width" id="width">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground">w-full</p>
            <div className="mt-3 h-10 rounded bg-foreground/10 border border-border w-full" />
            <p className="text-xs text-muted-foreground mt-2">Fills container</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground">w-fit</p>
            <div className="mt-3 inline-flex h-10 px-6 items-center rounded bg-foreground text-primary-foreground text-sm">w-fit</div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground">w-screen</p>
            <div className="mt-3 h-10 rounded bg-muted border border-border flex items-center justify-center text-xs font-mono text-muted-foreground">100vw</div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground">Fractional</p>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 h-10 rounded bg-foreground/10 border border-border flex items-center justify-center text-xs font-mono">w-1/2</div>
              <div className="flex-1 h-10 rounded bg-foreground/10 border border-border flex items-center justify-center text-xs font-mono">w-1/2</div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Height" id="height">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-mono text-muted-foreground mb-3">Heights — content-driven and fixed</p>
          <div className="flex items-end gap-3">
            <div className="w-20 h-16 rounded bg-muted border border-border flex items-center justify-center text-xs font-mono">h-16</div>
            <div className="w-20 h-24 rounded bg-muted border border-border flex items-center justify-center text-xs font-mono">h-24</div>
            <div className="w-20 flex-1 min-h-16 rounded bg-foreground/5 border border-dashed border-border p-2">
              <div className="h-8 rounded bg-muted border border-border" />
              <p className="text-xs font-mono text-muted-foreground mt-1">h-full / min-h-screen</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Component Sizing" id="component-sizing">
        <p className="text-sm text-muted-foreground mb-4">Control heights — current conventions for buttons/inputs.</p>
        <div className="space-y-3">
          {controlSizes.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="w-16 text-xs font-mono text-muted-foreground">{s.label}</span>
              <div className={`flex-1 max-w-xs rounded-lg bg-foreground text-primary-foreground flex items-center justify-center text-xs font-medium border ${s.h}`}>
                {s.cls}
              </div>
              <span className="hidden sm:inline text-xs font-mono text-muted-foreground">{s.px}</span>
            </div>
          ))}
          <div className="flex items-center gap-4">
            <span className="w-16 text-xs font-mono text-muted-foreground">Full</span>
            <div className="flex-1 rounded-lg bg-foreground text-primary-foreground flex items-center justify-center text-xs font-medium h-9">
              w-full
            </div>
            <span className="hidden sm:inline text-xs font-mono text-muted-foreground">100%</span>
          </div>
        </div>
      </Section>

      <Section title="Container Sizes" id="container-sizes">
        <p className="text-sm text-muted-foreground mb-4">Max-width containers for readable layouts.</p>
        <div className="space-y-3">
          <div className="w-full max-w-sm rounded-xl border border-dashed border-border p-3">
            <p className="text-xs font-mono text-muted-foreground">max-w-sm — 384px</p>
            <div className="mt-2 h-10 rounded bg-muted border border-border" />
            <p className="text-xs text-muted-foreground mt-1">Forms</p>
          </div>
          <div className="w-full max-w-2xl rounded-xl border border-dashed border-border p-3">
            <p className="text-xs font-mono text-muted-foreground">max-w-2xl — 672px</p>
            <div className="mt-2 h-10 rounded bg-muted border border-border" />
            <p className="text-xs text-muted-foreground mt-1">Prose</p>
          </div>
          <div className="w-full rounded-xl border border-dashed border-border p-3">
            <p className="text-xs font-mono text-muted-foreground">max-w-6xl — 1152px</p>
            <div className="mt-2 h-10 rounded bg-muted border border-border" />
            <p className="text-xs text-muted-foreground mt-1">Docs content (current)</p>
          </div>
        </div>
      </Section>

      <Section title="Responsive Sizing" id="responsive-sizing">
        <p className="text-sm text-muted-foreground mb-3">Elements adapt at Tailwind breakpoints (<code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">sm 640</code> <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">md 768</code> <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">lg 1024</code>).</p>
        <div className="rounded-xl border border-border p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="h-16 rounded bg-foreground/10 border border-border flex items-center justify-center text-xs font-mono">1 col → 2 → 4</div>
            <div className="h-16 rounded bg-muted border border-border hidden sm:flex items-center justify-center text-xs font-mono">sm+</div>
            <div className="h-16 rounded bg-muted border border-border hidden lg:flex items-center justify-center text-xs font-mono">lg+</div>
            <div className="h-16 rounded bg-muted border border-border hidden lg:flex items-center justify-center text-xs font-mono">lg+</div>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-3">className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4&quot;</p>
        </div>
      </Section>

      <Section title="Guidelines" id="guidelines">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>Use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">h-8 / h-9 / h-10</code> for controls — keep touch target ≥ 32px.</li>
          <li>Prefer <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">w-full max-w-*</code> over fixed widths for responsiveness.</li>
          <li>Use fractional <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">basis-1/2</code> for split views (docs preview).</li>
          <li>Containers: <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-sm</code> forms, <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-2xl</code> prose, <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-6xl</code> docs.</li>
        </ul>
      </Section>
      <FoundationsRelated
        items={[
          ["Spacing", "/docs/foundations/spacing"],
          ["Breakpoints", "/docs/foundations/breakpoints"],
          ["Colors", "/docs/foundations/colors"],
        ]}
      />
    </ComponentLayout>
  )
}
