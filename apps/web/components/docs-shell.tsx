"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { DocsSidebarNav } from "@/components/docs-sidebar-nav"
import { FloatingDocsSidebarLazy } from "@/components/floating-docs-sidebar-lazy"
import { DocsOnThisPage } from "@/components/docs-on-this-page"
import { cn } from "@/lib/utils"

function toTitle(seg: string) {
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

/**
 * shadcn-style docs shell.
 *
 * - Single `bg-background` surface (no sidebar/content bg mismatch).
 * - Sidebar is a flush `border-r` column — no gap, no gradient hairline,
 *   no transparent-border spacer on the content side.
 * - Content is NOT wrapped in a centered max-width box here. Each page
 *   owns its own width/padding (shadcn pattern), which removes the
 *   double-wrapper whitespace that used to sit between sidebar and content.
 */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMcpPage = pathname.startsWith("/docs/mcp")
  // Component pages render their own mobile nav row inside DocsPageLayout.
  const isComponentPage = pathname.startsWith("/docs/components/")

  if (isMcpPage) {
    return <div className="flex-1">{children}</div>
  }

  const segs = pathname.split("/").filter(Boolean)
  const current = segs.length > 0 ? toTitle(segs[segs.length - 1]!) : "Docs"

  return (
    <div className="flex-1">
      <div className="w-full lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="sticky top-18 hidden h-[calc(100svh-4.5rem)] shrink-0 border-r border-border/60 lg:block">
          <div className="h-full overflow-y-auto px-2 py-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
            <DocsSidebarNav />
          </div>
        </aside>

        <main data-docs-main className={cn("min-w-0 lg:flex lg:flex-col lg:items-center")}>
          {/* Mobile docs nav for guide/foundation routes — component pages
              render their own row inside DocsPageLayout. */}
          {!isComponentPage && (
            <div className="border-b border-border/60 lg:hidden">
              <div className="flex items-center gap-2 px-4 py-2.5">
                <FloatingDocsSidebarLazy />
                <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <Link href="/docs" className="shrink-0 transition-colors hover:text-foreground">
                    Docs
                  </Link>
                  <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
                  <span className="truncate font-medium text-foreground">{current}</span>
                </nav>
              </div>
            </div>
          )}
          {children}
        </main>
        <aside className="sticky top-18 hidden h-[calc(100svh-4.5rem)] overflow-y-auto xl:block [scrollbar-width:thin]" aria-label="Page sections">
          <DocsOnThisPage />
        </aside>
      </div>
    </div>
  )
}
