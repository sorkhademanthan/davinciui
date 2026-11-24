import type { ReactNode } from "react"

import { DocsOnThisPage } from "@/components/docs-on-this-page"

import { DocsHeader } from "./docs-header"
import { DocsPageFooter } from "./docs-page-footer"
import { DocsSidebar } from "./docs-sidebar"

/**
 * Mintlify-style docs chrome: two-row sticky header, 288px sidebar,
 * 648px article column, 293px "On this page" rail.
 */
export function DocsChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <DocsHeader />
      <div className="docs-grid mx-auto w-full">
        <aside className="docs-sidebar sticky top-[var(--docs-chrome-h)] border-r border-border">
          <div className="docs-scroll" data-lenis-prevent>
            <DocsSidebar />
          </div>
        </aside>

        <main id="main-content" data-docs-main className="min-w-0">
          <div className="mx-auto w-full max-w-[var(--docs-article-w)] px-6 pb-28 pt-10 lg:px-0 lg:pt-10">
            <DocsOnThisPage variant="mobile" />
            {children}
            <DocsPageFooter />
          </div>
        </main>

        <aside className="docs-toc sticky top-[var(--docs-chrome-h)] border-l border-border">
          <div className="docs-scroll pb-8 pl-8 pr-6 pt-10" data-lenis-prevent>
            <DocsOnThisPage variant="docs" />
          </div>
        </aside>
      </div>
    </div>
  )
}
