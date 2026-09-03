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
    <div data-route-docs className="min-h-svh flex flex-col bg-[#fcfcfc] dark:bg-[#050505]">
      <SiteHeader />
      {/* Subtle top anchor offset */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] pt-14">
        {/* Desktop Sidebar — premium, inset */}
        <aside className="hidden lg:sticky lg:top-14 lg:z-30 lg:flex lg:h-[calc(100vh-3.5rem)] lg:flex-col lg:overflow-hidden lg:border-r lg:border-border/40 lg:bg-white dark:lg:bg-[#0a0a0a]">
          {/* subtle left rail highlight */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent" aria-hidden="true" />
          <DocsSidebarNav />
        </aside>

        {/* Main — breathable, max-width centered */}
        <main className="min-w-0 w-full overflow-hidden bg-white dark:bg-[#0a0a0a] lg:border-l lg:border-transparent">
          <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
