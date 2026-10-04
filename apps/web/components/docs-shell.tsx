"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { DocsSidebarNav } from "@/components/docs-sidebar-nav"
import { cn } from "@/lib/utils"

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMcpPage = pathname.startsWith("/docs/mcp")

  return (
    <div
      className={cn(
        "flex-1 pt-14",
        !isMcpPage && "grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]"
      )}
    >
      {!isMcpPage ? (
        <aside className="hidden lg:sticky lg:top-14 lg:z-30 lg:flex lg:h-[calc(100vh-3.5rem)] lg:flex-col lg:overflow-hidden lg:border-r lg:border-border/40 lg:bg-white dark:lg:bg-[#0a0a0a]">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent" aria-hidden="true" />
          <DocsSidebarNav />
        </aside>
      ) : null}

      <main className={cn("min-w-0 w-full overflow-hidden bg-white dark:bg-[#0a0a0a]", !isMcpPage && "lg:border-l lg:border-transparent")}>
        {isMcpPage ? children : (
          <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        )}
      </main>
    </div>
  )
}
