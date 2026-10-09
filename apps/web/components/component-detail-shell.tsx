"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { DocsOnThisPage } from "@/components/docs-on-this-page"
import { cn } from "@/lib/utils"

function toTitle(seg: string) {
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

/**
 * One shared component-detail shell for `/docs/components/[slug]` and
 * `/experience/components/[slug]`.
 *
 * shadcn-style grid, identical on both routes:
 * - Single `bg-background` surface (no sidebar/content bg mismatch).
 * - Left rail is a flush `border-r` column filled by the section nav slot
 *   (docs nav on Docs, experience nav on Experience).
 * - Right rail is always the On This Page section navigation.
 * - Content is NOT wrapped in a centered max-width box here. Each page
 *   owns its own width/padding (shadcn pattern).
 */
export function ComponentDetailShell({
  nav,
  drawer,
  homeHref,
  homeLabel,
  hideMobileRow,
  children,
}: {
  /** Left-rail navigation (section-specific). */
  nav: React.ReactNode
  /** Mobile drawer trigger (section-specific). */
  drawer?: React.ReactNode
  /** Mobile breadcrumb root, e.g. "/docs" or "/experience/components". */
  homeHref: string
  /** Mobile breadcrumb root label, e.g. "Docs" or "Components". */
  homeLabel: string
  /** Skip the mobile row (pages rendering their own). */
  hideMobileRow?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const segs = pathname.split("/").filter(Boolean)
  const current = segs.length > 0 ? toTitle(segs[segs.length - 1]!) : homeLabel

  return (
    <div className="flex-1 bg-background">
      <div className="w-full lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="sticky top-18 hidden h-[calc(100svh-4.5rem)] shrink-0 border-r border-border/60 bg-background lg:block">
          <div className="h-full overflow-y-auto px-2 py-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
            {nav}
          </div>
        </aside>

        <main data-docs-main className={cn("min-w-0 bg-background lg:flex lg:flex-col lg:items-center")}>
          {!hideMobileRow && (
            <div className="border-b border-border/60 lg:hidden">
              <div className="flex items-center gap-2 px-4 py-2.5">
                {drawer}
                <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <Link href={homeHref} className="shrink-0 transition-colors hover:text-foreground">
                    {homeLabel}
                  </Link>
                  <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
                  <span className="truncate font-medium text-foreground">{current}</span>
                </nav>
              </div>
            </div>
          )}
          {children}
        </main>
        <aside className="sticky top-18 hidden h-[calc(100svh-4.5rem)] overflow-y-auto bg-background xl:block [scrollbar-width:thin]" aria-label="Page sections">
          <DocsOnThisPage />
        </aside>
      </div>
    </div>
  )
}
