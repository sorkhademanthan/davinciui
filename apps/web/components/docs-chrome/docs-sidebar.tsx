"use client"

import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Accessibility,
  Activity,
  ArrowRightLeft,
  BookOpen,
  Boxes,
  Compass,
  Download,
  FileText,
  GitPullRequest,
  History,
  Layers,
  Monitor,
  Moon,
  MoveHorizontal,
  Palette,
  Plug,
  Rocket,
  Route,
  Settings,
  Shapes,
  Sparkles,
  Square,
  Terminal,
  TextCursorInput,
  Triangle,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { getDocsNavForTab, type DocsNavGroup } from "@/config/docs"
import { cn } from "@/lib/utils"

import { getActiveDocsTab } from "./docs-tabs"

const icons: Record<string, LucideIcon> = {
  Introduction: BookOpen,
  Components: Boxes,
  Installation: Download,
  Quickstart: Rocket,
  Configuration: Settings,
  Theming: Palette,
  "Dark mode": Moon,
  CLI: Terminal,
  Typeset: Type,
  Skills: Sparkles,
  Registry: Boxes,
  Changelog: History,
  Foundations: Layers,
  Colors: Palette,
  Typography: Type,
  Spacing: MoveHorizontal,
  Sizing: MoveHorizontal,
  Borders: Square,
  "Border Radius": Square,
  Shadows: Square,
  Motion: Activity,
  Breakpoints: Monitor,
  Icons: Shapes,
  MCP: Plug,
  Guides: Compass,
  "Next.js": Triangle,
  Vite: Zap,
  Remix: Route,
  Forms: TextCursorInput,
  Accessibility,
  Migrating: ArrowRightLeft,
  Contributing: GitPullRequest,
}

function iconFor(title: string): LucideIcon {
  return icons[title] ?? (title.includes("Components") ? Boxes : FileText)
}

type NavItem = DocsNavGroup["items"][number]

function SidebarLink({
  item,
  active,
  onNavigate,
  activeRef,
}: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
  activeRef?: RefObject<HTMLAnchorElement | null>
}) {
  const Icon = iconFor(item.title)
  return (
    <Link
      href={item.href}
      ref={active ? activeRef : undefined}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex h-8 items-center gap-2 rounded-[10px] px-2 text-sm transition-colors duration-150",
        active
          ? "bg-primary/6 font-medium text-primary hover:bg-primary/6"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.title}</span>
    </Link>
  )
}

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const tab = getActiveDocsTab(pathname)
  const groups = useMemo(() => getDocsNavForTab(tab), [tab])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const activeRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    setExpanded((previous) => {
      const next = { ...previous }
      for (const group of groups) {
        for (const item of group.items) {
          if (
            item.items?.some(
              (child) =>
                pathname === child.href || pathname.startsWith(`${child.href}/`),
            )
          ) {
            next[item.href] = true
          }
        }
      }
      return next
    })
  }, [groups, pathname])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      activeRef.current?.scrollIntoView({ block: "nearest" })
    }, 30)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <nav aria-label="Documentation navigation" className="flex flex-col gap-6 px-6 pb-12 pt-10">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-3 px-2 text-sm font-medium text-muted-foreground">
            {group.title}
          </p>
          <div className="flex flex-col gap-px">
            {group.items.map((item) => {
              if (item.items?.length) {
                const isOpen = expanded[item.href] ?? false
                const childActive = item.items.some(
                  (child) =>
                    pathname === child.href ||
                    pathname.startsWith(`${child.href}/`),
                )
                const Icon = iconFor(item.title)
                return (
                  <div key={item.href}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((previous) => ({
                          ...previous,
                          [item.href]: !isOpen,
                        }))
                      }
                      aria-expanded={isOpen}
                      className={cn(
                        "flex h-8 w-full items-center gap-2 rounded-[10px] px-2 text-sm transition-colors duration-150",
                        childActive
                          ? "font-medium text-primary hover:bg-primary/6"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1 truncate text-left">{item.title}</span>
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-150",
                          isOpen && "rotate-90",
                        )}
                      >
                        <path
                          d="M6 3.5 10.5 8 6 12.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isOpen ? (
                      <div className="ml-3 flex flex-col gap-px border-l border-border/60 pl-2">
                        {item.items.map((child) => {
                          const active =
                            pathname === child.href ||
                            pathname.startsWith(`${child.href}/`)
                          return (
                            <SidebarLink
                              key={child.href}
                              item={child}
                              active={active}
                              onNavigate={onNavigate}
                              activeRef={activeRef}
                            />
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              }

              return (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onNavigate={onNavigate}
                  activeRef={activeRef}
                />
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
