"use client"

import Link from "next/link"
import { Check, CircleAlert, Plus } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { paletteFrom, resolveToken, type DesignSystemConfig } from "@/lib/design-system/domain"
import { browserDesignSystems } from "@/lib/design-system/repository"

const foundations = ["Colors", "Typography", "Spacing", "Radius", "Borders", "Shadows", "Motion", "Icons", "Grid", "Breakpoints"]
const systemSections: Array<[string, string]> = [["Semantic Tokens", "tokens"], ["Themes", "themes"], ["Components", "components"], ["Preview", "preview"], ["Validate", "validate"], ["Export", "export"]]

export function Builder({ id, section = "colors" }: { id: string; section?: string }) {
  const [system, setSystem] = useState<DesignSystemConfig>()
  useEffect(() => setSystem(browserDesignSystems.get(id)), [id])
  if (!system) return <NotFound />

  const save = (next: DesignSystemConfig) => {
    setSystem(next)
    browserDesignSystems.save(next)
  }

  return <main className="min-h-[calc(100svh-3.5rem)] min-w-0 p-5 sm:p-8"><div className="mx-auto max-w-6xl">{section === "colors" ? <Colors system={system} save={save} /> : <SectionEditor system={system} section={section} save={save} />}</div></main>
}

function NotFound() {
  return <main className="mx-auto max-w-xl px-6 py-24"><CircleAlert className="size-7" /><h1 className="mt-4 text-2xl font-semibold">Design system not found</h1><p className="mt-2 text-muted-foreground">Create a system to start configuring it in this browser.</p><Link href="/design-system/new" className="mt-6 inline-flex rounded-lg bg-foreground px-4 py-2 text-background">Create Design System</Link></main>
}

function Colors({ system, save }: { system: DesignSystemConfig; save: (next: DesignSystemConfig) => void }) {
  const primary = system.foundation.colors[0]!
  const updatePrimary = (base: string) => save({ ...system, foundation: { ...system.foundation, colors: [paletteFrom(base), ...system.foundation.colors.slice(1)] } })
  const addPalette = () => save({ ...system, foundation: { ...system.foundation, colors: [...system.foundation.colors, paletteFrom("#14b8a6", `palette-${system.foundation.colors.length + 1}`, "Accent")] } })
  return <>
    <PageHeader eyebrow="Design System / Foundations" title="Colors" description="Choose a base color, inspect its generated scale, and preview the token in a real interface." action={<button onClick={addPalette} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><Plus className="size-4" />Add palette</button>} />
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><section className="space-y-4">{system.foundation.colors.map((palette, index) => <div key={palette.id} className="rounded-xl border border-border bg-background p-5"><div className="flex items-center justify-between"><div><h2 className="font-medium">{palette.name}</h2><p className="text-xs text-muted-foreground">{palette.id}.500 {index === 0 ? "· used by primary actions" : "· available for semantic tokens"}</p></div><span className="inline-flex items-center gap-1 text-xs text-emerald-500"><Check className="size-3" />Configured</span></div>{index === 0 && <div className="mt-5 flex gap-3"><input aria-label="Primary color picker" type="color" value={primary.base} onChange={(event) => updatePrimary(event.target.value)} className="size-11 rounded border border-border bg-transparent p-1" /><input aria-label="Primary hex value" value={primary.base} onChange={(event) => updatePrimary(event.target.value)} className="w-32 rounded-lg border border-border bg-transparent px-3 text-sm" /></div>}<div className="mt-5 grid grid-cols-11 gap-1">{Object.entries(palette.shades).map(([shade, color]) => <div key={shade}><div className="h-12 rounded" style={{ background: color }} /><p className="mt-1 text-center text-[10px] text-muted-foreground">{shade}</p></div>)}</div></div>)}</section><aside className="h-fit rounded-xl border border-border bg-background p-5"><p className="text-xs font-semibold tracking-wider text-muted-foreground">LIVE PREVIEW</p><div className="mt-5 rounded-lg border border-border p-4"><button className="rounded-md px-3 py-2 text-sm text-white" style={{ background: resolveToken(system, "brand.500") }}>Primary action</button><input placeholder="Email address" className="mt-4 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" /><p className="mt-4 text-sm"><a style={{ color: resolveToken(system, "brand.500") }}>Learn more</a></p></div><p className="mt-4 text-xs leading-5 text-muted-foreground">This palette is stored with the system and will be available to exports.</p></aside></div>
  </>
}

function SectionEditor({ system, section, save }: { system: DesignSystemConfig; section: string; save: (next: DesignSystemConfig) => void }) {
  if (section === "typography") return <Typography system={system} save={save} />
  if (section === "spacing") return <Spacing system={system} save={save} />
  if (section === "radius") return <Radius system={system} save={save} />
  const title = foundations.find((item) => item.toLowerCase() === section) || systemSections.find(([, path]) => path === section)?.[0] || "Overview"
  return <><PageHeader eyebrow="Design System" title={title} description="This configuration area is ready for the next builder slice." /><div className="mt-6 rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">{title} will inherit the same saved configuration model as Colors, Typography, Spacing and Radius.</div></>
}

function Typography({ system, save }: { system: DesignSystemConfig; save: (next: DesignSystemConfig) => void }) {
  const fonts = ["Inter", "Manrope", "DM Sans", "Plus Jakarta Sans", "Space Grotesk", "Geist", "Georgia"]
  return <><PageHeader eyebrow="Design System / Foundations" title="Typography" description="Select a primary typeface and review the type hierarchy it creates." /><div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><section className="rounded-xl border border-border p-5"><h2 className="font-medium">Primary typeface</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{fonts.map((font) => <button key={font} onClick={() => save({ ...system, foundation: { ...system.foundation, fontFamily: font } })} className={`rounded-lg border p-4 text-left ${system.foundation.fontFamily === font ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"}`} style={{ fontFamily: font }}><span className="text-2xl">Aa</span><span className="ml-3 text-sm">{font}</span></button>)}</div></section><TypePreview font={system.foundation.fontFamily} /></div></>
}

function TypePreview({ font }: { font: string }) { return <aside className="h-fit rounded-xl border border-border p-5" style={{ fontFamily: font }}><p className="text-xs font-semibold tracking-wider text-muted-foreground">TYPE PREVIEW</p><p className="mt-5 text-5xl font-semibold">Aa</p><p className="mt-5 text-2xl font-semibold">Build better products.</p><p className="mt-3 text-sm text-muted-foreground">A measured type scale for clear, durable interfaces.</p><p className="mt-5 text-xs text-muted-foreground">{font} · currently selected</p></aside> }

function Spacing({ system, save }: { system: DesignSystemConfig; save: (next: DesignSystemConfig) => void }) {
  const options = [2, 4, 8]
  const values = [1, 2, 3, 4, 6, 8, 12]
  return <><PageHeader eyebrow="Design System / Foundations" title="Spacing" description="Set the base unit used to generate a consistent spacing scale." /><section className="mt-6 rounded-xl border border-border p-5"><h2 className="font-medium">Base unit</h2><div className="mt-4 flex flex-wrap gap-2">{options.map((base) => <button key={base} onClick={() => save({ ...system, foundation: { ...system.foundation, spacingBase: base } })} className={`rounded-lg border px-4 py-2 text-sm ${system.foundation.spacingBase === base ? "border-foreground bg-muted" : "border-border"}`}>{base}px</button>)}</div><div className="mt-8 grid gap-3">{values.map((multiplier) => <div key={multiplier} className="flex items-center gap-4"><span className="w-12 text-xs text-muted-foreground">space-{multiplier}</span><div className="h-5 rounded bg-foreground" style={{ width: `${multiplier * system.foundation.spacingBase * 3}px` }} /><span className="text-xs text-muted-foreground">{multiplier * system.foundation.spacingBase}px</span></div>)}</div></section></>
}

function Radius({ system, save }: { system: DesignSystemConfig; save: (next: DesignSystemConfig) => void }) {
  const options = [0, 4, 8, 12, 16]
  return <><PageHeader eyebrow="Design System / Foundations" title="Radius" description="Choose the corner language used by cards, controls and surfaces." /><section className="mt-6 grid gap-3 sm:grid-cols-5">{options.map((radius) => <button key={radius} onClick={() => save({ ...system, foundation: { ...system.foundation, radius } })} className={`rounded-xl border p-4 text-left ${system.foundation.radius === radius ? "border-foreground bg-muted" : "border-border"}`}><div className="h-16 border-2 border-foreground" style={{ borderRadius: radius }} /><p className="mt-3 text-sm">{radius === 0 ? "Square" : `${radius}px`}</p></button>)}</section></>
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-xs text-muted-foreground">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{action}</header> }
