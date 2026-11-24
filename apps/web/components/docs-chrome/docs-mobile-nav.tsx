"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLenisOverlayLock } from "@/components/smooth-scroll"

import { DocsSidebar } from "./docs-sidebar"

export function DocsMobileNav({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  useLenisOverlayLock(open)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={cn(
          "fixed inset-0 z-[55] bg-black/30 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Documentation navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-[56] w-[288px] max-w-[85vw] flex-col border-r border-border bg-background shadow-xl transition-transform duration-200 ease-out lg:hidden",
          open ? "flex translate-x-0" : "hidden",
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold text-foreground">Documentation</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close navigation"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto">
          <DocsSidebar onNavigate={() => onOpenChange(false)} />
        </div>
      </aside>
    </>
  )
}
