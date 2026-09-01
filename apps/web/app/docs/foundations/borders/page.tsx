import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"
import { CopyButton } from "@/components/copy-button"

export const metadata: Metadata = {
  title: "Borders — Foundations | DavinciUI",
  description: "Border system for DavinciUI — widths, colors, and dividers.",
}

export default function BordersPage() {
  return (
    <ComponentLayout
      title="Borders"
      description="Current border variables from globals.css — alpha-based for light/dark. Use for dividers, cards, and inputs. No new variables here."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Borders define separation. DavinciUI currently uses three alpha-based variables. They adapt to theme via <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">.dark</code> overrides.
        </p>
      </Section>

      <Section title="Border Colors" id="border-colors">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted-foreground">--border</p>
              <CopyButton code="var(--border)" />
            </div>
            <div className="mt-3 h-16 rounded-lg border-2" style={{ borderColor: "var(--border)", background: "var(--card)" }} />
            <p className="text-sm font-medium mt-2">Default</p>
            <p className="text-xs text-muted-foreground">Cards, panels — 8% alpha</p>
          </div>
          <div className="rounded-xl border bg-card p-4" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted-foreground">--line</p>
              <CopyButton code="var(--line)" />
            </div>
            <div className="mt-3 h-16 rounded-lg border-2" style={{ borderColor: "var(--line)", background: "var(--card)" }} />
            <p className="text-sm font-medium mt-2">Line</p>
            <p className="text-xs text-muted-foreground">Subtle divider — 10% alpha</p>
          </div>
          <div className="rounded-xl border bg-card p-4" style={{ borderColor: "var(--input)" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted-foreground">--input</p>
              <CopyButton code="var(--input)" />
            </div>
            <div className="mt-3 h-16 rounded-lg border-2" style={{ borderColor: "var(--input)", background: "var(--card)" }} />
            <p className="text-sm font-medium mt-2">Input</p>
            <p className="text-xs text-muted-foreground">Input border — 10% alpha</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Values are OKLCH with alpha — not hard-coded hex. Use <code className="font-mono px-1 py-0.5 rounded bg-muted">border-border</code> etc., not hex.</p>
      </Section>

      <Section title="Border Widths" id="border-widths">
        <div className="space-y-3">
          <div className="h-12 rounded-lg border border-border bg-card flex items-center px-4">
            <span className="text-xs font-mono text-muted-foreground">border (1px) — default</span>
          </div>
          <div className="h-12 rounded-lg border-2 border-border bg-card flex items-center px-4">
            <span className="text-xs font-mono text-muted-foreground">border-2 (2px)</span>
          </div>
          <div className="h-12 rounded-lg border-4 border-border bg-card flex items-center px-4">
            <span className="text-xs font-mono text-muted-foreground">border-4 (4px) — rare</span>
          </div>
        </div>
      </Section>

      <Section title="Border Styles" id="border-styles">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-16 rounded-xl border border-border bg-card flex items-center justify-center text-xs font-mono text-muted-foreground">solid</div>
          <div className="h-16 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-center text-xs font-mono text-muted-foreground">dashed</div>
          <div className="h-16 rounded-xl border border-dotted border-border bg-muted/20 flex items-center justify-center text-xs font-mono text-muted-foreground">dotted</div>
        </div>
      </Section>

      <Section title="Dividers" id="dividers">
        <div className="rounded-xl border border-border p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-mono text-muted-foreground">Horizontal — h-px bg-border</p>
            <div className="h-px bg-border w-full" />
          </div>
          <div className="flex gap-4 h-20">
            <div className="flex-1 rounded-lg border border-border bg-card" />
            <div className="w-px bg-border self-stretch" />
            <div className="flex-1 rounded-lg border border-border bg-card" />
          </div>
          <p className="text-xs font-mono text-muted-foreground">Vertical — w-px bg-border</p>
        </div>
      </Section>

      <Section title="Input Borders" id="input-borders">
        <div className="rounded-xl border border-border p-6 space-y-3">
          <input placeholder="Input — border-input" className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="h-9 rounded-lg border-2 border-input bg-muted/20 flex items-center px-3 text-sm text-muted-foreground">border-2 input</div>
          <p className="text-xs text-muted-foreground">Use <code className="font-mono px-1 py-0.5 rounded bg-muted">border-input</code> for inputs, <code className="font-mono px-1 py-0.5 rounded bg-muted">focus:ring-ring</code> for focus.</p>
        </div>
      </Section>

      <Section title="Focus Rings" id="focus-rings">
        <div className="flex flex-wrap gap-4">
          <button className="h-10 px-6 rounded-lg bg-foreground text-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Focus ring</button>
          <div className="h-10 px-6 rounded-lg border-2 border-ring flex items-center justify-center text-xs font-mono text-muted-foreground">border-ring</div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Ring uses <code className="font-mono px-1 py-0.5 rounded bg-muted">--ring oklch(0.708 0 0)</code> — light/dark adapts.</p>
      </Section>

      <Section title="Usage Guidelines" id="usage-guidelines">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>Default: <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">border border-border</code> for cards.</li>
          <li>Divider: <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">h-px bg-border</code> or <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">border-t border-border</code>.</li>
          <li>Input: <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">border-input</code> + <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">focus:ring-ring</code>.</li>
          <li>Keep borders subtle — alpha values are intentional for light/dark.</li>
        </ul>
      </Section>
    </ComponentLayout>
  )
}
