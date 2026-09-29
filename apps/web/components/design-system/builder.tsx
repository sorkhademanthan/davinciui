"use client"

import Link from "next/link"
import { CircleAlert } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import type { DesignSystemConfig } from "@/lib/design-system/domain"
import { browserDesignSystems } from "@/lib/design-system/repository"
import { ColorsEditor } from "@/components/design-system/colors-editor"
import { TypographyEditor } from "@/components/design-system/typography-editor"
import { SpacingEditor } from "@/components/design-system/spacing-editor"
import { RadiusEditor } from "@/components/design-system/radius-editor"
import { BordersEditor } from "@/components/design-system/borders-editor"
import { ShadowsEditor } from "@/components/design-system/shadows-editor"
import { MotionEditor } from "@/components/design-system/motion-editor"
import { IconsEditor } from "@/components/design-system/icons-editor"
import { BreakpointsEditor } from "@/components/design-system/breakpoints-editor"

const foundations = ["Colors", "Typography", "Spacing", "Radius", "Borders", "Shadows", "Motion", "Icons", "Grid", "Breakpoints"]
const systemSections: Array<[string, string]> = [["Semantic Tokens", "tokens"], ["Themes", "themes"], ["Components", "components"], ["Preview", "preview"], ["Validate", "validate"], ["Export", "export"]]

export function Builder({ id, section = "colors" }: { id: string; section?: string }) {
  const [system, setSystem] = useState<DesignSystemConfig>()
  useEffect(() => setSystem(browserDesignSystems.get(id)), [id])
  if (!system) return <NotFound />

  const save = (next: DesignSystemConfig) => {
    const result = browserDesignSystems.save(next)
    // Keep local edits visible even if persistence is unavailable.
    setSystem(result.ok ? result.system : next)
  }

  return <main className="min-h-[calc(100svh-3.5rem)] min-w-0 p-5 sm:p-8"><div className="mx-auto max-w-6xl">{section === "colors" ? <ColorsEditor system={system} save={save} /> : <SectionEditor system={system} section={section} save={save} />}</div></main>
}

function NotFound() {
  return <main className="mx-auto max-w-xl px-6 py-24"><CircleAlert className="size-7" /><h1 className="mt-4 text-2xl font-semibold">Design system not found</h1><p className="mt-2 text-muted-foreground">Create a system to start configuring it in this browser.</p><Link href="/design-system/new" className="mt-6 inline-flex rounded-lg bg-foreground px-4 py-2 text-background">Create Design System</Link></main>
}

function SectionEditor({ system, section, save }: { system: DesignSystemConfig; section: string; save: (next: DesignSystemConfig) => void }) {
  if (section === "typography") return <TypographyEditor system={system} save={save} />
  if (section === "spacing") return <SpacingEditor system={system} save={save} />
  if (section === "radius") return <RadiusEditor system={system} save={save} />
  if (section === "borders") return <BordersEditor system={system} save={save} />
  if (section === "shadows") return <ShadowsEditor system={system} save={save} />
  if (section === "motion") return <MotionEditor system={system} save={save} />
  if (section === "icons") return <IconsEditor system={system} save={save} />
  if (section === "breakpoints") return <BreakpointsEditor system={system} save={save} />
  const title = foundations.find((item) => item.toLowerCase() === section) || systemSections.find(([, path]) => path === section)?.[0] || "Overview"
  return <><PageHeader eyebrow="Design System" title={title} description="This configuration area is ready for the next builder slice." /><div className="mt-6 rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">{title} will inherit the same saved configuration model as Colors, Typography, Spacing and Radius.</div></>
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-xs text-muted-foreground">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{action}</header> }
