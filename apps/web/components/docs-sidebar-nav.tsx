"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Search } from "lucide-react"

import { docsConfig } from "@/config/docs"
import { components, isNewComponent } from "@/registry"
import { cn } from "@/lib/utils"

function SidebarItem({
  title,
  href,
  active,
  accessory,
  onNavigate,
  onHover,
  onMove,
  onLeave,
}: {
  title: string
  href: string
  active?: boolean
  accessory?: React.ReactNode
  onNavigate?: () => void
  onHover?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onMove?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onLeave?: () => void
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      onMouseEnter={onHover}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] leading-5 transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      <span className="truncate">{title}</span>
      {accessory && <span className="shrink-0">{accessory}</span>}
    </Link>
  )
}

export function DocsSidebarNav({
  onNavigate,
  onHoverItem,
  onHoverMove,
  onHoverLeave,
}: {
  onNavigate?: () => void
  onHoverItem?: (item: { title: string; href: string }, e: React.MouseEvent<HTMLAnchorElement>) => void
  onHoverMove?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onHoverLeave?: () => void
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (title: string) => setCollapsed((s) => ({ ...s, [title]: !s[title] }))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search */}
      <div className="shrink-0 border-b border-border/40 bg-white dark:bg-[#0a0a0a] p-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-zinc-50 px-2.5 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-white hover:border-border dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 truncate">Search</span>
          <span className="hidden items-center gap-0.5 rounded-md border border-border bg-white px-1.5 py-0.5 font-mono text-[11px] leading-none shadow-sm dark:bg-zinc-800 sm:inline-flex">
            ⌘K
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {docsConfig.nav.map((group, idx) => {
          const isCollapsed = collapsed[group.title] ?? false
          const hasNested = group.items.some((i) => i.items && i.items.length > 0)
          const isActiveGroup = group.items.some((i) => {
            if (i.href === pathname) return true
            return i.items?.some((sub) => sub.href === pathname) ?? false
          })

          const cleanTitle = group.title.replace(/^[^\w]+/, "").trim() || group.title

          return (
            <div key={idx} className={cn(idx > 0 && "mt-7")}>
              {group.title === "🎨 FOUNDATIONS" && (
                <div className="mb-5 flex items-center gap-2 px-1">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-[11px] font-medium tracking-widest text-muted-foreground">FOUNDATION</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
              )}

              <button
                onClick={() => toggle(group.title)}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left",
                  isActiveGroup ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                <span className="flex-1 truncate text-xs font-semibold uppercase tracking-widest">{cleanTitle}</span>
                <ChevronDown className={cn("size-3 text-muted-foreground transition-transform", isCollapsed && "-rotate-90")} />
              </button>

              {!isCollapsed && (
                <div className="mt-2">
                  {hasNested ? (
                    <div className="space-y-4">
                      {group.items.map((subGroup, sIdx) => {
                        if (subGroup.items && subGroup.items.length > 0) {
                          return (
                            <div key={sIdx}>
                              <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                {subGroup.title}
                              </p>
                              <div className="space-y-0.5">
                                {subGroup.items.map((item) => {
                                  const slug = item.href.split("/").pop()
                                  const comp = slug ? components[slug] : undefined
                                  const isNew = comp ? isNewComponent(comp) : false
                                  const active = pathname === item.href
                                  return (
                                    <SidebarItem
                                      key={item.href}
                                      title={item.title}
                                      href={item.href}
                                      active={active}
                                      onNavigate={onNavigate}
                                      onHover={onHoverItem ? (e) => onHoverItem(item, e) : undefined}
                                      onMove={onHoverMove}
                                      onLeave={onHoverLeave}
                                      accessory={
                                        isNew ? (
                                          <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:bg-white dark:text-zinc-900">
                                            NEW
                                          </span>
                                        ) : undefined
                                      }
                                    />
                                  )
                                })}
                              </div>
                            </div>
                          )
                        }
                        const slug = subGroup.href.split("/").pop()
                        const comp = slug ? components[slug] : undefined
                        const isNew = comp ? isNewComponent(comp) : false
                        const active = pathname === subGroup.href
                        return (
                          <div key={sIdx} className="space-y-0.5">
                            <SidebarItem
                              title={subGroup.title}
                              href={subGroup.href}
                              active={active}
                              onNavigate={onNavigate}
                              onHover={onHoverItem ? (e) => onHoverItem({ title: subGroup.title, href: subGroup.href }, e) : undefined}
                              onMove={onHoverMove}
                              onLeave={onHoverLeave}
                              accessory={
                                isNew ? (
                                  <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:bg-white dark:text-zinc-900">
                                    NEW
                                  </span>
                                ) : undefined
                              }
                            />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const slug = item.href.split("/").pop()
                        const comp = slug ? components[slug] : undefined
                        const isNew = comp ? isNewComponent(comp) : false
                        const active = pathname === item.href
                        return (
                          <SidebarItem
                            key={item.href}
                            title={item.title}
                            href={item.href}
                            active={active}
                            onNavigate={onNavigate}
                            onHover={onHoverItem ? (e) => onHoverItem(item, e) : undefined}
                            onMove={onHoverMove}
                            onLeave={onHoverLeave}
                            accessory={
                              isNew ? (
                                <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:bg-white dark:text-zinc-900">
                                  NEW
                                </span>
                              ) : undefined
                            }
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}


      </div>
    </div>
  )
}
