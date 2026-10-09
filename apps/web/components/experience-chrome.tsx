"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { ExperienceSidebarNav } from "@/components/experience-sidebar-nav"

/**
 * Experience section chrome. Gallery-style routes keep the section sidebar;
 * component detail routes (`/experience/components/[slug]`) render bare —
 * the page provides the shared ComponentDetailShell (same grid + rails as
 * Docs) instead of nesting a second sidebar.
 */
export function ExperienceChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Detail pages (anything below the gallery index) bring the shared
  // component-detail shell. usePathname never includes the query string.
  const isComponentDetail =
    pathname.startsWith("/experience/components/") &&
    pathname !== "/experience/components"

  if (isComponentDetail) {
    return <div className="flex-1 pt-18">{children}</div>
  }

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] pt-18">
      <aside className="hidden md:flex md:flex-col sticky top-18 h-[calc(100vh-4.5rem)] border-r border-border/40 bg-white dark:bg-[#0a0a0a] overflow-hidden">
        <ExperienceSidebarNav />
      </aside>
      <main className="min-w-0 w-full max-w-none m-0 overflow-hidden bg-white dark:bg-background">{children}</main>
    </div>
  )
}
