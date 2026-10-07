import type { Metadata } from "next"
import { ComponentLayout, Section } from "@/components/component-layout"
import { FoundationsRelated } from "@/components/foundations-related"
import { Search, Heart, Star, Settings, User, Mail, Bell, Home, ArrowRight, Check, X, Plus, Trash, Edit, Save, Download, Upload, Eye, Lock, Shield, Zap, Sparkles, Layers, Grid, Box, Calendar, Clock, FileText, Image as ImageIcon, Video, Music, MapPin, Phone, Globe, Github, Twitter } from "lucide-react"

export const metadata: Metadata = {
  title: "Icons — Foundations | DavinciUI",
  description: "Icon system for DavinciUI — lucide-react.",
}

const iconGroups: { label: string; icons: { icon: React.ComponentType<{ className?: string }>; name: string }[] }[] = [
  {
    label: "Actions",
    icons: [
      { icon: Search, name: "Search" },
      { icon: Plus, name: "Plus" },
      { icon: Check, name: "Check" },
      { icon: X, name: "X" },
      { icon: Trash, name: "Trash" },
      { icon: Edit, name: "Edit" },
      { icon: Save, name: "Save" },
      { icon: Download, name: "Download" },
      { icon: Upload, name: "Upload" },
    ],
  },
  {
    label: "Communication",
    icons: [
      { icon: Mail, name: "Mail" },
      { icon: Bell, name: "Bell" },
      { icon: Phone, name: "Phone" },
      { icon: Github, name: "Github" },
      { icon: Twitter, name: "Twitter" },
      { icon: Globe, name: "Globe" },
    ],
  },
  {
    label: "Navigation",
    icons: [
      { icon: Home, name: "Home" },
      { icon: ArrowRight, name: "ArrowRight" },
      { icon: Settings, name: "Settings" },
      { icon: User, name: "User" },
      { icon: MapPin, name: "MapPin" },
      { icon: Calendar, name: "Calendar" },
      { icon: Clock, name: "Clock" },
    ],
  },
  {
    label: "Objects",
    icons: [
      { icon: Heart, name: "Heart" },
      { icon: Star, name: "Star" },
      { icon: Shield, name: "Shield" },
      { icon: Lock, name: "Lock" },
      { icon: Eye, name: "Eye" },
      { icon: Zap, name: "Zap" },
      { icon: Sparkles, name: "Sparkles" },
      { icon: FileText, name: "FileText" },
      { icon: ImageIcon, name: "Image" },
      { icon: Video, name: "Video" },
      { icon: Music, name: "Music" },
      { icon: Layers, name: "Layers" },
      { icon: Grid, name: "Grid" },
      { icon: Box, name: "Box" },
    ],
  },
]

export default function IconsPage() {
  return (
    <ComponentLayout
      title="Icons"
      description="DavinciUI uses lucide-react — 1000+ MIT icons, consistent 2px stroke, React-ready. No additional icon package needed."
    >
      <Section title="Introduction" id="introduction">
        <p className="text-sm leading-6 text-muted-foreground">
          Icons are from <a href="https://lucide.dev" target="_blank" rel="noreferrer" className="underline hover:text-foreground">lucide.dev</a> — open-source, consistent stroke width, no fill. Import individually for tree-shaking.
        </p>
      </Section>

      <Section title="Icon Library" id="icon-library">
        <div className="rounded-xl border border-border bg-muted/10 p-4 font-mono text-sm">
          <p>import &#123; Search, Heart, Star &#125; from &quot;lucide-react&quot;</p>
          <p className="text-muted-foreground mt-1">&lt;Search className=&quot;size-4&quot; /&gt; <span className="text-xs">— 16px</span></p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Current implementation uses default Lucide stroke (2px). No custom DavinciUI stroke override.</p>
      </Section>

      <Section title="Icon Sizes" id="icon-sizes">
        <div className="rounded-xl border border-border p-6">
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <Search className="size-4" />
              <span className="text-xs font-mono text-muted-foreground">16</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Search className="size-5" />
              <span className="text-xs font-mono text-muted-foreground">20</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Search className="size-6" />
              <span className="text-xs font-mono text-muted-foreground">24</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Search className="size-8" />
              <span className="text-xs font-mono text-muted-foreground">32</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Search className="size-10" />
              <span className="text-xs font-mono text-muted-foreground">48</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Use <code className="font-mono px-1 py-0.5 rounded bg-muted">size-4</code> for inline (16px), <code className="font-mono px-1 py-0.5 rounded bg-muted">size-5</code> for buttons (20px), <code className="font-mono px-1 py-0.5 rounded bg-muted">size-6</code> for feature icons.</p>
        </div>
      </Section>

      <Section title="Stroke" id="stroke">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4 flex flex-col items-center gap-2">
            <Heart className="size-6" strokeWidth={1.5} />
            <p className="text-xs font-mono text-muted-foreground">strokeWidth 1.5 — thin</p>
          </div>
          <div className="rounded-xl border border-border p-4 flex flex-col items-center gap-2 bg-muted/20">
            <Heart className="size-6" strokeWidth={2} />
            <p className="text-xs font-mono text-muted-foreground">strokeWidth 2 — default</p>
          </div>
          <div className="rounded-xl border border-border p-4 flex flex-col items-center gap-2">
            <Heart className="size-6" strokeWidth={2.5} />
            <p className="text-xs font-mono text-muted-foreground">strokeWidth 2.5 — bold</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">DavinciUI uses default (2). Override via <code className="font-mono px-1 py-0.5 rounded bg-muted">strokeWidth</code> prop only when needed.</p>
      </Section>

      <Section title="Common Icons" id="common-icons">
        {iconGroups.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <h4 className="text-sm font-medium mb-3">{group.label}</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {group.icons.map(({ icon: Icon, name }) => (
                <div key={name} className="group rounded-xl border border-border p-4 flex flex-col items-center gap-2 hover:bg-muted/30 transition-colors">
                  <Icon className="size-5 text-foreground" />
                  <span className="text-xs font-mono text-muted-foreground text-center">{name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">lucide-react</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-2">Browse all at <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="underline hover:text-foreground">lucide.dev/icons</a></p>
      </Section>

      <Section title="Usage Guidelines" id="usage-guidelines">
        <div className="rounded-xl border border-border p-4 space-y-3">
          <p className="text-sm font-mono">import &#123; Search &#125; from &quot;lucide-react&quot;</p>
          <p className="text-sm">&lt;Search className=&quot;size-4 text-muted-foreground&quot; /&gt;</p>
          <p className="text-xs text-muted-foreground">Always pair with <code className="font-mono px-1 py-0.5 rounded bg-muted">className=&quot;size-4&quot;</code> — never hardcode width/height. Use <code className="font-mono px-1 py-0.5 rounded bg-muted">aria-hidden</code> for decorative, <code className="font-mono px-1 py-0.5 rounded bg-muted">aria-label</code> for standalone.</p>
        </div>
      </Section>

      <Section title="Accessibility" id="accessibility">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li><strong className="text-foreground">Decorative:</strong> <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">&lt;Heart aria-hidden /&gt;</code> — hide from screen readers.</li>
          <li><strong className="text-foreground">With label:</strong> <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">&lt;button aria-label=&quot;Favorite&quot;&gt;&lt;Heart /&gt;&lt;/button&gt;</code></li>
          <li><strong className="text-foreground">Icon-only controls:</strong> Always provide <code className="font-mono px-1 py-0.5 rounded bg-muted text-xs">aria-label</code> — never rely on icon alone.</li>
          <li>Avoid using icon color alone to convey meaning — pair with text.</li>
        </ul>
      </Section>
      <FoundationsRelated
        items={[
          ["Typography", "/docs/foundations/typography"],
          ["Colors", "/docs/foundations/colors"],
          ["Theming", "/docs/theming"],
        ]}
      />
    </ComponentLayout>
  )
}
