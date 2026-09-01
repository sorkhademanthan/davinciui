import type React from "react"
import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site"
import { SiteHeader } from "@/components/site-header"
import { DocsSidebarNav } from "@/components/docs-sidebar-nav"

export const metadata: Metadata = {
  title: "Components Documentation",
  description: "Browse the complete collection of DavinciUI components. Free, open-source React components with copy-paste code, Tailwind CSS styling, and Framer Motion animations by Manthan Sorkhade.",
  openGraph: {
    title: "UI Components Documentation | DavinciUI by Manthan Sorkhade",
    description: "Browse all React UI components. Copy-paste ready code with Tailwind CSS and Framer Motion.",
  },
  alternates: {
    canonical: absoluteUrl("/docs"),
  },
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div data-route-docs className="min-h-svh flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] pt-14">
        {/* Desktop Sidebar - sticky, occupies layout space */}
        <aside className="hidden md:flex md:flex-col sticky top-14 h-[calc(100vh-3.5rem)] border-r border-border/40 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <DocsSidebarNav />
        </aside>

        {/* Main content - full width, pages handle their own containers */}
        <main className="min-w-0 w-full max-w-none m-0 overflow-hidden bg-white dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
