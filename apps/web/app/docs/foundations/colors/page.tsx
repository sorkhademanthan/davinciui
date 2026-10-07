import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"
import { CopyButton } from "@/components/copy-button"
import { DocsSnippet } from "@/components/docs-snippet"
import { FoundationsRelated } from "@/components/foundations-related"

export const metadata: Metadata = {
  title: "Colors — Foundations | DavinciUI",
  description: "Color system for DavinciUI — current light/dark variables from globals.css.",
}

const colorGroups: {
  title: string
  id: string
  description: string
  items: { name: string; varName: string; usage: string }[]
}[] = [
  {
    title: "Background",
    id: "background",
    description: "Surface layers — page, cards, popovers.",
    items: [
      { name: "Background", varName: "--background", usage: "Page" },
      { name: "Card", varName: "--card", usage: "Card" },
      { name: "Popover", varName: "--popover", usage: "Popover" },
      { name: "Sidebar", varName: "--sidebar", usage: "Sidebar" },
    ],
  },
  {
    title: "Foreground",
    id: "foreground",
    description: "Text and icon colors paired with backgrounds.",
    items: [
      { name: "Foreground", varName: "--foreground", usage: "On background" },
      { name: "Card Foreground", varName: "--card-foreground", usage: "On card" },
      { name: "Popover Foreground", varName: "--popover-foreground", usage: "On popover" },
      { name: "Sidebar Foreground", varName: "--sidebar-foreground", usage: "On sidebar" },
      { name: "Muted Foreground", varName: "--muted-foreground", usage: "Secondary text" },
    ],
  },
  {
    title: "Primary",
    id: "primary",
    description: "Primary actions — buttons, active states.",
    items: [
      { name: "Primary", varName: "--primary", usage: "Solid button" },
      { name: "Primary Foreground", varName: "--primary-foreground", usage: "On primary" },
      { name: "Sidebar Primary", varName: "--sidebar-primary", usage: "Sidebar primary" },
      { name: "Sidebar Primary Foreground", varName: "--sidebar-primary-foreground", usage: "On sidebar primary" },
    ],
  },
  {
    title: "Secondary",
    id: "secondary",
    description: "Secondary surfaces — subtle fills.",
    items: [
      { name: "Secondary", varName: "--secondary", usage: "Secondary bg" },
      { name: "Secondary Foreground", varName: "--secondary-foreground", usage: "On secondary" },
    ],
  },
  {
    title: "Muted",
    id: "muted",
    description: "Muted and accent surfaces for subtle UI.",
    items: [
      { name: "Muted", varName: "--muted", usage: "Muted bg" },
      { name: "Accent", varName: "--accent", usage: "Accent bg" },
      { name: "Accent Foreground", varName: "--accent-foreground", usage: "On accent" },
      { name: "Sidebar Accent", varName: "--sidebar-accent", usage: "Sidebar accent" },
    ],
  },
  {
    title: "Destructive & Status",
    id: "destructive",
    description: "Feedback and status — avoid inventing new hues here.",
    items: [
      { name: "Destructive", varName: "--destructive", usage: "Error" },
      { name: "Destructive Foreground", varName: "--destructive-foreground", usage: "On destructive" },
      { name: "Info", varName: "--info", usage: "Info" },
      { name: "Success", varName: "--success", usage: "Success" },
      { name: "Warning", varName: "--warning", usage: "Warning" },
    ],
  },
  {
    title: "Border / Input / Ring",
    id: "border-input-ring",
    description: "Strokes and focus — alpha-based for light/dark.",
    items: [
      { name: "Border", varName: "--border", usage: "Card border" },
      { name: "Line", varName: "--line", usage: "Divider" },
      { name: "Input", varName: "--input", usage: "Input border" },
      { name: "Ring", varName: "--ring", usage: "Focus ring" },
      { name: "Sidebar Border", varName: "--sidebar-border", usage: "Sidebar divider" },
      { name: "Sidebar Ring", varName: "--sidebar-ring", usage: "Sidebar focus" },
    ],
  },
  {
    title: "Chart",
    id: "chart",
    description: "Data visualization palette.",
    items: [
      { name: "Chart 1", varName: "--chart-1", usage: "Series 1" },
      { name: "Chart 2", varName: "--chart-2", usage: "Series 2" },
      { name: "Chart 3", varName: "--chart-3", usage: "Series 3" },
      { name: "Chart 4", varName: "--chart-4", usage: "Series 4" },
      { name: "Chart 5", varName: "--chart-5", usage: "Series 5" },
    ],
  },
]

function ColorSwatch({ varName, name, usage }: { varName: string; name: string; usage: string }) {
  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-28 w-full border-b border-border" style={{ background: `var(${varName})` }} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            <p className="text-xs font-mono text-muted-foreground">{varName}</p>
          </div>
          <CopyButton code={`var(${varName})`} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{usage}</p>
      </div>
    </div>
  )
}

export default function ColorsPage() {
  return (
    <ComponentLayout
      title="Colors"
      description="Current color variables from globals.css — light/dark aware via CSS variables. All swatches use var(--*) directly, so theme toggling updates them live. Future semantic tokens will alias these primitives."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          DavinciUI’s color system is built on CSS variables. Light values live in <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">:root</code>, dark overrides in <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">.dark</code>. No new tokens are introduced here — this page documents the implementation as it exists today.
        </p>
      </Section>

      <Section title="Color System Overview" id="overview">
        <div className="rounded-xl border border-border bg-muted/10 p-4">
          <p className="text-sm text-foreground font-medium">How it works</p>
          <p className="text-sm text-muted-foreground mt-1">Primitive values (oklch, alpha mixes) → CSS variables → Tailwind utilities. Example: <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">bg-[var(--primary)]</code> or <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">text-[var(--muted-foreground)]</code>. Theme switching is automatic via the <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">.dark</code> class.</p>
        </div>
      </Section>

      {colorGroups.map((group) => (
        <Section key={group.id} title={group.title} id={group.id}>
          <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {group.items.map((c) => (
              <ColorSwatch key={c.varName} varName={c.varName} name={c.name} usage={c.usage} />
            ))}
          </div>
        </Section>
      ))}

      <Section title="Dark Mode" id="dark-mode">
        <p className="text-sm text-muted-foreground mb-4">Same variables, different values in <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">.dark</code>. Toggle theme (top-right) to see live update. Example below forces dark for comparison:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs font-mono text-muted-foreground mb-2">Light</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded-lg border border-border" style={{ background: "var(--background)" }} />
              <div className="h-16 rounded-lg border border-border" style={{ background: "var(--card)" }} />
              <div className="h-16 rounded-lg border border-border" style={{ background: "var(--primary)" }} />
            </div>
          </div>
          <div className="rounded-xl border border-border p-3 dark">
            <p className="text-xs font-mono text-muted-foreground mb-2">Dark (forced .dark)</p>
            <div className="grid grid-cols-3 gap-2 dark">
              <div className="h-16 rounded-lg border border-white/10" style={{ background: "var(--background)" }} />
              <div className="h-16 rounded-lg border border-white/10" style={{ background: "var(--card)" }} />
              <div className="h-16 rounded-lg border border-white/10" style={{ background: "var(--primary)" }} />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Use existing theme provider — do not create a new theme system here.</p>
      </Section>

      <Section title="Usage" id="usage">
        <DocsSnippet
          variant="muted"
          code={`background: var(--background);
color: var(--foreground);
border-color: var(--border);
/* Focus */ box-shadow: 0 0 0 2px var(--ring);`}
        />
      </Section>
      <FoundationsRelated
        items={[
          ["Theming", "/docs/theming"],
          ["Typography", "/docs/foundations/typography"],
          ["Borders", "/docs/foundations/borders"],
          ["Shadows", "/docs/foundations/shadows"],
        ]}
      />
    </ComponentLayout>
  )
}
