"use client"

import { useState } from "react"
import Link from "next/link"
import { Github, Menu, Search } from "lucide-react"

import { CommandMenu } from "@/components/command-menu"
import { DavinciUILogo } from "@/components/logos/davinci-ui-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { DocsMobileNav } from "./docs-mobile-nav"
export function DocsHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        data-docs-header
        className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md"
      >
      {/* Row 1 — navbar */}
      <div className="h-14 w-full">
        <div className="mx-auto grid h-full w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 md:grid-cols-[1fr_auto_1fr] md:gap-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open documentation navigation"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <Link
              href="/"
              className="inline-flex min-w-0 items-center gap-2 rounded-md text-foreground"
            >
              <DavinciUILogo className="size-8 shrink-0" />
              <span className="hidden min-w-0 translate-y-[2px] truncate text-xl font-semibold tracking-tight min-[360px]:inline">
                DAVINCIUI
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2">
            <CommandMenu
              trigger={
                <button
                  type="button"
                  aria-label="Search documentation"
                  className="flex h-9 w-9 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground md:w-[255px] md:justify-start md:px-3"
                >
                  <Search className="size-4 shrink-0" aria-hidden="true" />
                  <span className="hidden flex-1 text-left md:inline">Search...</span>
                  <kbd className="hidden h-5 items-center rounded border border-border bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground md:inline-flex">
                    ⌘K
                  </kbd>
                </button>
              }
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <a
              href="https://github.com/sorkhademanthan/davinciui"
              target="_blank"
              rel="noopener noreferrer"
              title="DavinciUI on GitHub"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              <Github className="size-4" />
              <span className="hidden sm:inline">Star</span>
              <span className="sr-only">Star DavinciUI on GitHub</span>
            </a>
            <Link
              href="/docs/installation"
              className="hidden h-[34px] shrink-0 items-center whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Get started
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
      </header>
      <DocsMobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  )
}
