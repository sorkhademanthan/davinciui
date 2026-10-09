"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { FloatingDocsSidebarLazy } from "@/components/floating-docs-sidebar-lazy"
import { ExperienceSidebarNav } from "@/components/experience-sidebar-nav"
import { NavDrawer } from "@/components/nav-drawer"

/**
 * Section-aware mobile nav row for component detail pages. Rendered inside
 * DocsPageLayout so both `/docs/components/[slug]` and
 * `/experience/components/[slug]` get a matching drawer + breadcrumb without
 * editing any of the 130 docs files.
 */
export function ComponentMobileRow({ title }: { title: string }) {
  const pathname = usePathname()
  const isExperience = pathname.startsWith("/experience/")

  return (
    <div className="border-b border-border/60 lg:hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        {isExperience ? (
          <NavDrawer label="Components">
            <ExperienceSidebarNav />
          </NavDrawer>
        ) : (
          <FloatingDocsSidebarLazy />
        )}
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href={isExperience ? "/experience/components" : "/docs"}
            className="shrink-0 transition-colors hover:text-foreground"
          >
            {isExperience ? "Components" : "Docs"}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
          <span className="truncate font-medium text-foreground">{title}</span>
        </nav>
      </div>
    </div>
  )
}
