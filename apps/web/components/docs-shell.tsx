"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { DocsSidebarNav } from "@/components/docs-sidebar-nav"
import { FloatingDocsSidebarLazy } from "@/components/floating-docs-sidebar-lazy"
import { ComponentDetailShell } from "@/components/component-detail-shell"

/**
 * Docs section shell — the shared component-detail grid with the docs
 * navigation. Component pages hide the shell mobile row because
 * DocsPageLayout renders its own section-aware row.
 */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMcpPage = pathname.startsWith("/docs/mcp")
  const isComponentPage = pathname.startsWith("/docs/components/")

  if (isMcpPage) {
    return <div className="flex-1">{children}</div>
  }

  return (
    <ComponentDetailShell
      nav={<DocsSidebarNav />}
      drawer={<FloatingDocsSidebarLazy />}
      homeHref="/docs"
      homeLabel="Docs"
      hideMobileRow={isComponentPage}
    >
      {children}
    </ComponentDetailShell>
  )
}
