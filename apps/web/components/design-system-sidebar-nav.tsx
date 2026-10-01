"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Search } from "lucide-react"
import { CommandMenu } from "@/components/command-menu"
import { navigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

type SidebarSection = { title: string; items: Array<{ title: string; href: string }> }

const builderFoundations = ["Colors", "Typography", "Spacing", "Radius", "Borders", "Shadows", "Motion", "Icons", "Grid", "Breakpoints"]
const builderSystem: Array<[string, string]> = [["Semantic Tokens", "tokens"], ["Themes", "themes"], ["Preview", "preview"], ["Validate", "validate"], ["Export", "export"]]

function SidebarItem({ title, href, active }: { title: string; href: string; active?: boolean }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13.5px] leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none", active ? "bg-foreground text-background font-medium shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className="truncate">{title}</span></Link>
}

export function DesignSystemSidebarNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  const parts = pathname.split("/").filter(Boolean)
  const second = parts[1]
  const legacy = ["foundations", "tokens", "themes", "primitives", "accessibility", "motion"].includes(second || "")
  const builderId = second && second !== "new" && !legacy ? second : undefined

  const sections: SidebarSection[] = legacy
    ? navigation.designSystem.sections.map((section) => ({ title: section.title, items: section.items.map((item) => ({ title: item.title, href: item.href })) }))
    : builderId
      ? [
          { title: "Workspace", items: [{ title: "Overview", href: `/design-system/${builderId}` }] },
          { title: "Foundations", items: builderFoundations.map((title) => ({ title, href: `/design-system/${builderId}/${title.toLowerCase()}` })) },
          { title: "System", items: builderSystem.map(([title, slug]) => ({ title, href: `/design-system/${builderId}/${slug}` })) },
        ]
      : [
          { title: "Workspace", items: [{ title: "Overview", href: "/design-system" }, { title: "Create System", href: "/design-system/new" }] },
          { title: "Foundations", items: builderFoundations.map((title) => ({ title, href: "/design-system/new" })) },
          { title: "System", items: builderSystem.map(([title]) => ({ title, href: "/design-system/new" })) },
        ]

  return <div className="flex flex-1 flex-col overflow-hidden">
    <div className="shrink-0 p-2.5 border-b border-sidebar-border bg-sidebar">
      <React.Suspense fallback={<SearchButton />}><CommandMenu trigger={<SearchButton />} /></React.Suspense>
    </div>
    <div className="flex-1 overflow-y-auto px-2.5 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sections.map((section, index) => {
        const isCollapsed = collapsed[section.title] ?? false
        const isActiveSection = section.items.some((item) => pathname === item.href && (pathname !== "/design-system/new" || item.title === "Create System"))
        return <div key={section.title} className={cn(index !== 0 && "mt-6")}>
          <button onClick={() => setCollapsed((current) => ({ ...current, [section.title]: !current[section.title] }))} aria-expanded={!isCollapsed} className={cn("flex w-full items-center gap-1 rounded px-1 py-1 text-left transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none", isActiveSection ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-widest">{section.title}</span>
            <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform group-hover:text-foreground", isCollapsed && "-rotate-90")} />
          </button>
          {!isCollapsed && <div className="mt-1.5 space-y-0.5">{section.items.map((item) => <SidebarItem key={`${section.title}-${item.title}`} title={item.title} href={item.href} active={pathname === item.href && (pathname !== "/design-system/new" || item.title === "Create System")} />)}</div>}
        </div>
      })}
    </div>
  </div>
}

function SearchButton() {
  return <button type="button" className="flex w-full items-center gap-2 rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-left text-[13px] text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"><Search className="size-3.5 shrink-0 opacity-60" /><span className="flex-1 truncate">Search system…</span><span className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] leading-none text-muted-foreground sm:inline-flex">⌘K</span></button>
}
