import type React from "react"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { DesignSystemSidebarNav } from "@/components/design-system-sidebar-nav"

export const metadata: Metadata = {
  title: "Design System — DavinciUI",
  description: "How we design — foundations, tokens, themes, and principles behind every component.",
}

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] pt-14">
        <aside className="hidden md:flex md:flex-col sticky top-14 h-[calc(100vh-3.5rem)] border-r border-border/40 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <DesignSystemSidebarNav />
        </aside>
        <main className="min-w-0 overflow-hidden bg-white dark:bg-background">{children}</main>
      </div>
    </div>
  )
}
