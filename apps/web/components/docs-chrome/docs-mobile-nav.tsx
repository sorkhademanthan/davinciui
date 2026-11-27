"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { SITE_NAV_ITEMS, isSiteNavItemActive } from "@/lib/site-nav"
import { useLenisOverlayLock } from "@/components/smooth-scroll"

import { DocsSidebar } from "./docs-sidebar"

export function DocsMobileNav({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const pathname = usePathname()
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
          <nav aria-label="Primary" className="border-b border-border px-2 py-3">
            <ul className="flex flex-col">
              {SITE_NAV_ITEMS.map((item) => {
                const active = isSiteNavItemActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex h-10 items-center rounded-lg px-3 text-[15px] transition-colors",
                        active
                          ? "bg-primary/6 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <DocsSidebar onNavigate={() => onOpenChange(false)} />
        </div>
      </aside>
    </>
  )
}
