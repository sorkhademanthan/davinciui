"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Search } from "lucide-react"
import { navigation } from "@/config/navigation"
import { cn } from "@/lib/utils"

function SidebarItem({ title, href, active }: { title: string; href: string; active?: boolean }) {
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
    </Link>
  )
}

export function DesignSystemSidebarNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (title: string) => setCollapsed((s) => ({ ...s, [title]: !s[title] }))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="shrink-0 p-2.5 border-b border-border/40 bg-white dark:bg-[#0a0a0a]">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md border border-border/50 bg-white px-2.5 py-1.5 text-left text-[13px] text-zinc-500 shadow-sm hover:bg-zinc-50 hover:border-border dark:bg-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Search className="size-3.5 shrink-0 opacity-60" />
          <span className="flex-1 truncate">Search system…</span>
          <span className="ml-auto hidden items-center gap-0.5 rounded border bg-zinc-50 px-1 py-0.5 font-mono text-[10px] leading-none text-zinc-500 dark:bg-zinc-800 dark:border-white/10 sm:inline-flex">
            ⌘K
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navigation.designSystem.sections.map((section, idx) => {
          const isCollapsed = collapsed[section.title] ?? false
          const isActiveSection = section.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
          const isFirst = idx === 0
          return (
            <div key={section.title} className={cn(!isFirst && "mt-6")}>
              <button
                onClick={() => toggle(section.title)}
                className={cn(
                  "flex w-full items-center gap-1 rounded px-1 py-1 text-left group",
                  isActiveSection ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-widest">{section.title}</span>
                <ChevronDown className={cn("size-3.5 text-zinc-400 transition-transform group-hover:text-zinc-600", isCollapsed && "-rotate-90")} />
              </button>

              {!isCollapsed && (
                <div className="mt-1.5 space-y-0.5">
                  {section.items.map((item) => {
                    const active = pathname === item.href
                    return <SidebarItem key={item.href} title={item.title} href={item.href} active={active} />
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
