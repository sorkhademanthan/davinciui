"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Search } from "lucide-react"
import { navigation } from "@/config/navigation"
import { components, isNewComponent } from "@/registry"
import { cn } from "@/lib/utils"
import { CommandMenu } from "@/components/command-menu"

function SidebarItem({
  title,
  href,
  active,
  accessory,
}: {
  title: string
  href: string
  active?: boolean
  accessory?: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13.5px] leading-5 transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium shadow-sm"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      <span className="truncate">{title}</span>
      {accessory && <span className="shrink-0">{accessory}</span>}
    </Link>
  )
}

export function ExperienceSidebarNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (title: string) => setCollapsed((s) => ({ ...s, [title]: !s[title] }))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search — shadcn/Linear style, tight */}
      <div className="shrink-0 p-2.5 border-b border-border/40 bg-white dark:bg-[#0a0a0a]">
        <React.Suspense
          fallback={
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md border border-border/50 bg-white px-2.5 py-1.5 text-left text-[13px] text-zinc-500 shadow-sm dark:bg-zinc-900 dark:border-white/10 dark:text-zinc-400"
            >
              <Search className="size-3.5 shrink-0 opacity-60" />
              <span className="flex-1 truncate">Search components…</span>
              <span className="ml-auto hidden items-center gap-0.5 rounded border bg-zinc-50 px-1 py-0.5 font-mono text-[10px] leading-none text-zinc-500 dark:bg-zinc-800 dark:border-white/10 sm:inline-flex">
                ⌘K
              </span>
            </button>
          }
        >
          <CommandMenu
            trigger={
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md border border-border/50 bg-white px-2.5 py-1.5 text-left text-[13px] text-zinc-500 shadow-sm hover:bg-zinc-50 hover:border-border dark:bg-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Search className="size-3.5 shrink-0 opacity-60" />
                <span className="flex-1 truncate">Search components…</span>
                <span className="ml-auto hidden items-center gap-0.5 rounded border bg-zinc-50 px-1 py-0.5 font-mono text-[10px] leading-none text-zinc-500 dark:bg-zinc-800 dark:border-white/10 sm:inline-flex">
                  ⌘K
                </span>
              </button>
            }
          />
        </React.Suspense>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navigation.experience.sections.map((section, idx) => {
          const isCollapsed = collapsed[section.title] ?? false
          const hasNested = section.items.some((i) => i.items && i.items.length > 0)
          const isActiveSection = section.items.some((i) => {
            if (pathname === i.href || pathname.startsWith(i.href + "/")) return true
            return i.items?.some((sub) => pathname === sub.href) ?? false
          })

          // Senior: first section "Components" is the main — keep it open by default, tighter first gap
          const isFirst = idx === 0

          return (
            <div key={section.title} className={cn(!isFirst && "mt-6")}>
              <button
                onClick={() => toggle(section.title)}
                className={cn(
                  "flex w-full items-center gap-1 rounded px-1 py-1 text-left transition-colors group",
                  isActiveSection ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-widest">{section.title}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 text-zinc-400 transition-transform group-hover:text-zinc-600 dark:group-hover:text-zinc-300",
                    isCollapsed && "-rotate-90"
                  )}
                />
              </button>

              {!isCollapsed && (
                <div className="mt-1.5">
                  {hasNested ? (
                    <div className="space-y-3.5">
                      {section.items.map((subGroup) => {
                        if (subGroup.items && subGroup.items.length > 0) {
                          return (
                            <div key={subGroup.title}>
                              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                                {subGroup.title}
                              </p>
                              <div className="space-y-0.5">
                                {subGroup.items.map((item) => {
                                  const slug = item.href.split("/").pop()
                                  const comp = slug ? components[slug!] : undefined
                                  const isNew = comp ? isNewComponent(comp) : false
                                  const active = pathname === item.href
                                  return (
                                    <SidebarItem
                                      key={item.href}
                                      title={item.title}
                                      href={item.href}
                                      active={active}
                                      accessory={
                                        isNew ? (
                                          <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
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
                        const active = pathname === subGroup.href
                        return (
                          <div key={subGroup.href} className="space-y-0.5">
                            <SidebarItem title={subGroup.title} href={subGroup.href} active={active} />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/")
                        return <SidebarItem key={item.href} title={item.title} href={item.href} active={active} />
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
