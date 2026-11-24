"use client"

import * as React from "react"
import { PanelLeft, X } from "lucide-react"

/**
 * Minimal generic mobile navigation drawer for section sidebars.
 * Used where no bespoke floating drawer exists (Experience detail pages).
 * Closes on overlay tap, Escape, or explicit close.
 */
export function NavDrawer({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open ])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${label} navigation`}
        aria-expanded={open}
        className="relative grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors before:absolute before:-inset-1.5 before:content-[''] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PanelLeft className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="absolute bottom-0 left-0 top-0 flex w-72 max-w-[85vw] flex-col bg-background shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <span className="text-sm font-semibold">{label}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="relative grid size-8 place-items-center rounded-md text-muted-foreground transition-colors before:absolute before:-inset-1.5 before:content-[''] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div
              data-lenis-prevent className="flex-1 overflow-y-auto px-2 py-4"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) setOpen(false)
              }}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
