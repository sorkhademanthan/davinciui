import type { Metadata } from "next"
import { ComponentLayout, Section, InfoBox } from "@/components/component-layout"
import { CopyButton } from "@/components/copy-button"

export const metadata: Metadata = {
  title: "Breakpoints — Foundations | DavinciUI",
  description: "Breakpoint system for DavinciUI — current Tailwind defaults, responsive behavior, container, layout, and visibility.",
}

const breakpoints: { name: string; min: string; px: number; usage: string }[] = [
  { name: "sm", min: "640px", px: 640, usage: "Phones landscape, small tablets" },
  { name: "md", min: "768px", px: 768, usage: "Tablets" },
  { name: "lg", min: "1024px", px: 1024, usage: "Laptops" },
  { name: "xl", min: "1280px", px: 1280, usage: "Desktops" },
  { name: "2xl", min: "1536px", px: 1536, usage: "Wide screens" },
]

export default function BreakpointsPage() {
  return (
    <ComponentLayout
      title="Breakpoints"
      description="Current breakpoints are Tailwind CSS defaults — mobile-first min-width. No custom values yet; these are not official DavinciUI tokens, they are the implementation defaults used today."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Breakpoints adapt layout to viewport width. DavinciUI currently uses Tailwind&apos;s default{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">sm / md / lg / xl / 2xl</code> scale — mobile-first,{" "}
          <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">min-width</code> only. Use them via prefix (
          <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">md:grid-cols-2</code>). No custom breakpoints are
          created here; Phase 4 will decide if DavinciUI needs its own.
        </p>
        <InfoBox type="info">
          <span className="text-sm">
            Source: Tailwind defaults (v4 via <code className="font-mono text-xs px-1 py-0.5 rounded bg-cyan-500/10">@tailwindcss/postcss</code>
            ). Verified — no <code className="font-mono text-xs px-1 py-0.5 rounded bg-cyan-500/10">screens</code> override in the repo. Values mirror{" "}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-cyan-500/10">tailwind.config</code> defaults.
          </span>
        </InfoBox>
      </Section>

      <Section title="Responsive system" id="responsive-system">
        <div className="rounded-xl border border-border bg-muted/10 p-4 sm:p-6">
          <p className="text-sm font-medium">Mobile-first</p>
          <p className="text-sm text-muted-foreground mt-1 leading-6">
            Unprefixed utilities apply to all widths; prefixed utilities override at that{" "}
            <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">min-width</code> and above. There is no{" "}
            <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-width</code> breakpoint — build up from mobile.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-mono text-muted-foreground">Base</p>
              <p className="text-sm font-mono mt-1">grid-cols-1</p>
              <p className="text-xs text-muted-foreground mt-1">0 – 639px · single column</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-mono text-muted-foreground">md:</p>
              <p className="text-sm font-mono mt-1">md:grid-cols-2</p>
              <p className="text-xs text-muted-foreground mt-1">≥ 768px · two columns</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-mono text-muted-foreground">lg:</p>
              <p className="text-sm font-mono mt-1">lg:grid-cols-4</p>
              <p className="text-xs text-muted-foreground mt-1">≥ 1024px · four columns</p>
            </div>
          </div>
          <div className="mt-4 rounded bg-muted px-3 py-2 font-mono text-xs">
            className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4&quot;
          </div>
        </div>
      </Section>

      <Section title="Breakpoint scale" id="breakpoint-scale">
        <p className="text-sm text-muted-foreground mb-4">
          Reference — minimum widths. These are current Tailwind defaults, not custom DavinciUI tokens.
        </p>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Breakpoint</th>
                  <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Minimum width</th>
                  <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Typical usage</th>
                  <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground hidden sm:table-cell">Class prefix</th>
                </tr>
              </thead>
              <tbody>
                {breakpoints.map((bp) => (
                  <tr key={bp.name} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{bp.name}</td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {bp.min}{" "}
                      <span className="text-muted-foreground text-xs hidden sm:inline">· {bp.px}px</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{bp.usage}</td>
                    <td className="px-4 py-3 font-mono text-xs hidden sm:table-cell">
                      <span className="px-2 py-1 rounded bg-muted">{bp.name}:</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/20">
                  <td className="px-4 py-3 font-mono text-sm">base</td>
                  <td className="px-4 py-3 font-mono text-sm">0px</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">All devices — no prefix</td>
                  <td className="px-4 py-3 font-mono text-xs hidden sm:table-cell">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Do not call these <code className="font-mono px-1 py-0.5 rounded bg-muted">--breakpoint-*</code> tokens — they are Tailwind&apos;s defaults.
        </p>
      </Section>

      <Section title="Container behavior" id="container-behavior">
        <p className="text-sm text-muted-foreground mb-4">
          Containers constrain width and center content. DavinciUI docs currently use{" "}
          <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-*</code> (not{" "}
          <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">container</code>) for prose and layout — documented as current usage.
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs font-mono text-muted-foreground">max-w-sm — 384px · forms</p>
              <CopyButton code="max-w-sm" absolute={false} />
            </div>
            <div className="w-full max-w-sm mx-auto rounded-xl border border-dashed border-border p-3 bg-muted/10">
              <div className="h-10 rounded bg-muted border border-border" />
              <p className="text-xs text-muted-foreground mt-2 text-center">centered · mx-auto</p>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs font-mono text-muted-foreground">max-w-2xl — 672px · prose</p>
              <CopyButton code="max-w-2xl mx-auto" absolute={false} />
            </div>
            <div className="w-full max-w-2xl mx-auto rounded-xl border border-dashed border-border p-3 bg-muted/10">
              <div className="h-10 rounded bg-muted border border-border" />
              <p className="text-xs text-muted-foreground mt-2 text-center">prose measure ~65ch</p>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs font-mono text-muted-foreground">max-w-6xl — 1152px · docs content (current)</p>
              <CopyButton code="max-w-6xl mx-auto px-4" absolute={false} />
            </div>
            <div className="w-full rounded-xl border border-dashed border-border p-3 bg-muted/10">
              <div className="h-10 rounded bg-muted border border-border max-w-6xl mx-auto w-full" />
              <p className="text-xs text-muted-foreground mt-2 text-center">full within content shell (280px sidebar + content)</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/10 p-4 font-mono text-xs space-y-1">
          <p>
            <span className="text-muted-foreground">Docs shell:</span> max-w-6xl mx-auto — used in sizing &amp; docs layout today.
          </p>
          <p>
            <span className="text-muted-foreground">Centered type:</span> max-w-2xl mx-auto — cards, prose.
          </p>
          <p>
            <span className="text-muted-foreground">Narrow:</span> max-w-sm mx-auto — forms, auth.
          </p>
          <p className="text-muted-foreground pt-2">Tailwind&apos;s <code className="px-1 py-0.5 rounded bg-muted">container</code> is not used in docs today — prefer explicit max-w-*.</p>
        </div>
      </Section>

      <Section title="Responsive layout" id="responsive-layout">
        <p className="text-sm text-muted-foreground mb-4">
          Live specimen — resize the viewport (or drag the window) to see columns and padding adapt. All classes are real Tailwind.
        </p>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-xs font-mono text-muted-foreground">grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4</p>
            <span className="text-xs px-2 py-1 rounded-full bg-muted font-mono hidden sm:inline">1 → 2 → 4</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="h-20 rounded-xl bg-foreground/10 border border-border flex items-center justify-center text-xs font-mono">1</div>
            <div className="h-20 rounded-xl bg-muted border border-border flex items-center justify-center text-xs font-mono">2</div>
            <div className="h-20 rounded-xl bg-muted border border-border flex items-center justify-center text-xs font-mono hidden sm:flex">3 · sm+</div>
            <div className="h-20 rounded-xl bg-muted border border-border flex items-center justify-center text-xs font-mono hidden lg:flex">4 · lg+</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-muted">base: 1 col</span>
            <span className="px-2 py-1 rounded bg-foreground text-background sm:bg-muted sm:text-foreground">sm (640+): 2 cols</span>
            <span className="px-2 py-1 rounded bg-muted hidden lg:inline">lg (1024+): 4 cols</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Narrow the window below 640px → single column; widen to 640 → two; 1024 → four.</p>
        </div>

        <div className="mt-4 rounded-xl border border-border p-4">
          <p className="text-xs font-mono text-muted-foreground mb-3">Responsive padding &amp; typography</p>
          <div className="rounded-xl border border-border bg-muted/10 p-4 sm:p-6 lg:p-8">
            <p className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight">Responsive heading</p>
            <p className="text-sm text-muted-foreground mt-1">Padding: p-4 → sm:p-6 → lg:p-8 · Text: text-base → sm:text-lg → lg:text-xl</p>
          </div>
          <div className="mt-3 rounded bg-muted px-3 py-2 font-mono text-xs">className=&quot;p-4 sm:p-6 lg:p-8 text-base sm:text-lg lg:text-xl&quot;</div>
        </div>

        <div className="rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-mono text-muted-foreground">Stack on mobile</p>
            <p className="text-sm font-medium mt-1">flex-col sm:flex-row</p>
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 h-10 rounded bg-muted border border-border" />
              <div className="flex-1 h-10 rounded bg-muted border border-border" />
            </div>
          </div>
          <div className="flex-1 rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-mono text-muted-foreground">Gap scale</p>
            <p className="text-sm font-medium mt-1">gap-4 sm:gap-6</p>
            <div className="mt-2 flex gap-4 sm:gap-6">
              <div className="flex-1 h-10 rounded bg-foreground/10 border border-border" />
              <div className="flex-1 h-10 rounded bg-foreground/10 border border-border" />
              <div className="flex-1 h-10 rounded bg-foreground/10 border border-border hidden sm:block" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Visibility" id="visibility">
        <p className="text-sm text-muted-foreground mb-4">Show/hide at breakpoints — use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">hidden</code> + prefixed <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">block/flex</code>.</p>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left font-mono text-xs text-muted-foreground">Pattern</th>
                  <th className="px-4 py-2 text-left font-mono text-xs text-muted-foreground">Result</th>
                  <th className="px-4 py-2 text-left font-mono text-xs text-muted-foreground hidden sm:table-cell">Example</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border/50">
                  <td className="px-4 py-2.5">hidden md:block</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Hidden &lt;768, visible ≥768</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">Desktop nav</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-2.5">hidden lg:flex</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Hidden &lt;1024, flex ≥1024</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">Wide sidebar</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">md:hidden</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Visible &lt;768, hidden ≥768</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">Mobile menu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground mb-2">hidden md:block · Resize to see</p>
            <div className="h-14 rounded-lg border border-border bg-muted/20 flex items-center justify-center">
              <span className="hidden md:inline text-sm font-medium">Visible ≥ md (768px)</span>
              <span className="md:hidden text-sm text-muted-foreground">Hidden on mobile (&lt;768)</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-2">className=&quot;hidden md:block&quot;</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground mb-2">block md:hidden · Mobile only</p>
            <div className="h-14 rounded-lg border border-border bg-muted/20 flex items-center justify-center">
              <span className="md:hidden text-sm font-medium">Visible &lt; md</span>
              <span className="hidden md:inline text-sm text-muted-foreground">Hidden ≥ md — desktop hides</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-2">className=&quot;block md:hidden&quot;</p>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4 bg-muted/10">
          <p className="text-xs font-mono text-muted-foreground mb-2">Current breakpoint indicator — live</p>
          <div className="h-16 rounded-xl border border-border flex items-center justify-center font-mono text-sm bg-muted sm:bg-blue-500/10 md:bg-emerald-500/10 lg:bg-amber-500/10 xl:bg-purple-500/10 2xl:bg-pink-500/10">
            <span className="sm:hidden">base (&lt;640)</span>
            <span className="hidden sm:inline md:hidden">sm (640+)</span>
            <span className="hidden md:inline lg:hidden">md (768+)</span>
            <span className="hidden lg:inline xl:hidden">lg (1024+)</span>
            <span className="hidden xl:inline 2xl:hidden">xl (1280+)</span>
            <span className="hidden 2xl:inline">2xl (1536+)</span>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-2 text-center">Classes: sm: md: lg: xl: 2xl: · Background changes at each breakpoint</p>
        </div>
      </Section>

      <Section title="Practical examples" id="practical-examples">
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-medium">Responsive card grid</p>
              <CopyButton code="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" absolute={false} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-24 rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium">Card</p>
                <p className="text-xs text-muted-foreground">1 col → 2 → 3</p>
              </div>
              <div className="h-24 rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium">Card</p>
                <p className="text-xs text-muted-foreground">md is the sweet spot</p>
              </div>
              <div className="h-24 rounded-xl border border-border bg-card p-4 hidden lg:block">
                <p className="text-sm font-medium">Card</p>
                <p className="text-xs text-muted-foreground">lg fills row</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-mono text-muted-foreground mb-2">Responsive container width</p>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="font-mono text-xs">w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8</p>
                <p className="text-xs text-muted-foreground mt-2">Full width on mobile, centered with gutters on desktop — current docs pattern.</p>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-mono text-muted-foreground mb-2">Responsive typography</p>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="font-mono text-xs">text-3xl md:text-4xl lg:text-5xl</p>
                <p className="text-xs text-muted-foreground mt-2">Hero scales with viewport — 30 → 36 → 48px.</p>
                <p className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
                  DavinciUI
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground mb-2">Code pattern · Sidebar + content shell (current)</p>
            <div className="rounded-lg bg-muted/20 border border-border p-4 font-mono text-xs space-y-1 overflow-x-auto">
              <p>&lt;div className=&quot;flex&quot;&gt;</p>
              <p className="pl-4">&lt;aside className=&quot;hidden lg:block w-[280px] shrink-0&quot;&gt;Sidebar&lt;/aside&gt;</p>
              <p className="pl-4">&lt;main className=&quot;flex-1 min-w-0 max-w-6xl mx-auto&quot;&gt;Content&lt;/main&gt;</p>
              <p>&lt;/div&gt;</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Existing 280px sidebar shell — hidden below lg, visible at lg+.</p>
          </div>
        </div>
      </Section>

      <Section title="Guidelines" id="guidelines">
        <div className="rounded-xl border border-border bg-muted/10 p-4 sm:p-6">
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              Mobile-first — start without prefix, add <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">sm:</code>{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">md:</code>{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">lg:</code> as needed. Base is 0.
            </li>
            <li>
              Prefer <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">md</code> (768) for layout shifts (single → two
              columns); <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">lg</code> (1024) for three/four columns and
              exposing the 280px sidebar.
            </li>
            <li>
              Use <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">hidden md:block</code> for progressive disclosure —
              avoid JS breakpoint listeners for layout.
            </li>
            <li>
              Containers: <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-sm</code> forms,{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-2xl</code> prose,{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">max-w-6xl</code> docs — no custom{" "}
              <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">container</code> needed.
            </li>
            <li>
              Do not create custom breakpoints now — use Tailwind defaults. Custom values belong to Phase 4 Tokens if needed.
            </li>
            <li>Test at 640, 768, 1024, 1280, 1536 — and on a real phone width (~375px) where base applies.</li>
          </ul>
        </div>
      </Section>
    </ComponentLayout>
  )
}
