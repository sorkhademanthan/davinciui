"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  CircleArrowOutUpRight,
  CircleDashed,
  Cog,
  CornerDownLeft,
  FileText,
  Github,
  Hash,
  Search,
} from "lucide-react"

import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
} from "@workspace/ui/components/command"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"
import { docsConfig } from "@/config/docs"
import { navigation } from "@/config/navigation"
import { docsHeadings } from "@/lib/docs-headings"

interface CommandMenuItem {
  value: string
  label: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  href?: string
  theme?: "light" | "dark" | "system"
}

interface CommandMenuGroup {
  value: string
  items: CommandMenuItem[]
}

// ────────────────────────────────────────────────────────────
// Shared open state (module singleton). The menu mounts in the
// header and in sidebars simultaneously; without this, ⌘K toggles
// every mounted copy and stacks duplicate dialogs.
// ────────────────────────────────────────────────────────────

const sharedOpenListeners = new Set<() => void>()
let sharedOpen = false
let sharedShortcutInstalled = false

function setSharedOpen(next: boolean | ((prev: boolean) => boolean)) {
  sharedOpen =
    typeof next === "function"
      ? (next as (prev: boolean) => boolean)(sharedOpen)
      : next
  sharedOpenListeners.forEach((notify) => notify())
}

function subscribeSharedOpen(notify: () => void) {
  sharedOpenListeners.add(notify)
  return () => {
    sharedOpenListeners.delete(notify)
  }
}

function getSharedOpenSnapshot() {
  return sharedOpen
}

function ensureSharedShortcut() {
  if (sharedShortcutInstalled || typeof document === "undefined") return
  sharedShortcutInstalled = true
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      setSharedOpen((current) => !current)
    }
  })
}

const navGroups = docsConfig.nav
const sectionsGroup = navGroups.find((group) => group.title.includes("Getting Started"))
const componentGroups = navGroups.filter((group) => !group.title.includes("Getting Started"))
function flattenNavItems(groups: typeof navGroups) {
  const flat: { title: string; href: string }[] = []
  const collect = (items: { title: string; href: string; items?: { title: string; href: string; items?: unknown[] }[] }[]) => {
    for (const item of items) {
      flat.push({ title: item.title, href: item.href })
      if (item.items) collect(item.items as never)
    }
  }
  for (const g of groups) collect(g.items)
  return flat
}
const allComponentItems = dedupeByHref(flattenNavItems(componentGroups)).sort((a, b) => a.title.localeCompare(b.title))

// Phase 4: Search grouped by Design System / Experience (spec §17)
function flattenNavigationSections(sections: typeof navigation.designSystem.sections) {
  const flat: { title: string; href: string; group: string }[] = []
  for (const sec of sections) {
    for (const item of sec.items) {
      if (item.items?.length) {
        for (const sub of item.items) flat.push({ title: sub.title, href: sub.href, group: sec.title })
      } else {
        flat.push({ title: item.title, href: item.href, group: sec.title })
      }
    }
  }
  return flat
}
const designSystemItems = flattenNavigationSections(navigation.designSystem.sections)
const experienceItems = flattenNavigationSections(navigation.experience.sections)

// Base and premium entries can describe the same route with the same title
// (e.g. Tabs). Keep the first occurrence so keys stay unique.
function dedupeByHref<T extends { title: string; href: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.href}::${item.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function createItem(
  group: string,
  item: Omit<CommandMenuItem, "label" | "value"> & { value?: string },
): CommandMenuItem {
  // Values double as React keys and command-selection ids, so they must be
  // unique: titles alone collide ("Overview" exists in many sections), and so
  // do hrefs (base and premium entries can share a route with different
  // titles). Combining both closes every collision class.
  const slug = `${item.href ?? ""} ${item.title}`.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "")
  return {
    ...item,
    value: item.value ?? `${group.toLowerCase()}-${slug}`,
    label: [item.title, item.subtitle, group].filter(Boolean).join(" "),
  }
}

const HEADINGS_GROUP: CommandMenuGroup = {
  value: "Headings",
  items: docsHeadings.map((heading) =>
    createItem("Headings", {
      title: heading.title,
      subtitle: heading.page,
      href: heading.href,
      icon: <Hash />,
    }),
  ),
}

const RECENTS_KEY = "davinciui:recent-searches"

function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim()
  if (!needle) return <>{text}</>
  const index = text.toLowerCase().indexOf(needle.toLowerCase())
  if (index === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-primary/20 text-foreground">
        {text.slice(index, index + needle.length)}
      </mark>
      {text.slice(index + needle.length)}
    </>
  )
}

const commandGroups: CommandMenuGroup[] = [
  {
    value: "Pages",
    items: [
      createItem("Pages", { title: "Home", href: "/", icon: <ArrowRight /> }),
      createItem("Pages", {
        title: "Documentation",
        href: "/docs",
        icon: <ArrowRight />,
      }),
      ...(sectionsGroup?.items.map((item) =>
        createItem("Pages", {
          title: item.title,
          href: item.href,
          icon: <ArrowRight />,
        }),
      ) ?? []),
    ],
  },
  {
    value: "Get started",
    items: [
      createItem("Get started", {
        title: "Terms of Service",
        href: "/terms-of-service",
        icon: <BookOpen />,
      }),
      createItem("Get started", {
        title: "Privacy Policy",
        href: "/privacy-policy",
        icon: <BookOpen />,
      }),
      createItem("Get started", {
        title: "Visit Founder",
        href: "https://www.manthansorkhade.in/",
        icon: <CircleArrowOutUpRight />,
      }),
    ],
  },
  {
    value: "Socials",
    items: [
      createItem("Socials", {
        title: "GitHub",
        href: "https://github.com/sorkhademanthan/davinciui",
        icon: <Github />,
      }),
      createItem("Socials", {
        title: "X",
        href: "https://x.com/ManthanSorkhade",
        icon: <span className="text-[13px] leading-none">𝕏</span>,
      }),
    ],
  },
  {
    value: "Design System",
    items: dedupeByHref(designSystemItems).map((item) =>
      createItem("Design System", {
        title: item.title,
        subtitle: item.group,
        href: item.href,
        icon: <CircleDashed />,
      }),
    ),
  },
  {
    value: "Components",
    items: dedupeByHref(experienceItems).map((item) =>
      createItem("Components", {
        title: item.title,
        subtitle: item.group,
        href: item.href,
        icon: <CircleDashed />,
      }),
    ),
  },
  HEADINGS_GROUP,
  {
    value: "Docs Components",
    items: allComponentItems.map((item) =>
      createItem("Docs Components", {
        title: item.title,
        subtitle: "Docs",
        href: item.href,
        icon: <CircleDashed />,
      }),
    ),
  },
  {
    value: "Settings",
    items: [
      createItem("Settings", {
        title: "Use Light Theme",
        theme: "light",
        icon: <Cog />,
      }),
      createItem("Settings", {
        title: "Use Dark Theme",
        theme: "dark",
        icon: <Cog />,
      }),
      createItem("Settings", {
        title: "Use System Theme",
        theme: "system",
        icon: <Cog />,
      }),
    ],
  },
  {
    value: "Resources",
    items: [
      createItem("Resources", {
        title: "llms.txt",
        subtitle: "AI Context",
        href: "/llms.txt",
        icon: <FileText />,
      }),
    ],
  },
]

export function CommandMenu({ trigger }: { trigger?: React.ReactElement }) {
  const router = useRouter()
  const { setTheme } = useTheme()
  // Shared open state: the menu is mounted in several places at once
  // (header, sidebars), so a single store + one global shortcut keeps
  // ⌘K from opening stacked duplicate dialogs.
  const open = React.useSyncExternalStore(
    subscribeSharedOpen,
    getSharedOpenSnapshot,
    () => false,
  )
  const [query, setQuery] = React.useState("")
  const [recentTitles, setRecentTitles] = React.useState<string[]>([])

  React.useEffect(() => {
    ensureSharedShortcut()
  }, [])

  React.useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(RECENTS_KEY) ?? "[]")
      if (Array.isArray(stored)) {
        setRecentTitles(stored.filter((value): value is string => typeof value === "string").slice(0, 5))
      }
    } catch {
      // Recent searches are optional.
    }
  }, [])

  const groups = React.useMemo(() => {
    const allItems = commandGroups.flatMap((group) => group.items)
    const recentItems = recentTitles
      .map((title) => allItems.find((item) => item.title === title))
      .filter((item): item is CommandMenuItem => Boolean(item))
    if (recentItems.length === 0) return commandGroups
    return [
      { value: "Recent searches", items: recentItems } satisfies CommandMenuGroup,
      ...commandGroups,
    ]
  }, [recentTitles])

  const handleItemClick = React.useCallback(
    (item: CommandMenuItem) => {
      setSharedOpen(false)

      const next = [item.title, ...recentTitles.filter((title) => title !== item.title)].slice(0, 5)
      setRecentTitles(next)
      try {
        window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
      } catch {
        // Recent searches are optional.
      }

      if (item.theme) {
        setTheme(item.theme)
        return
      }

      if (!item.href) return

      if (item.href.startsWith("http") || item.href === "/llms.txt") {
        window.open(item.href, "_blank", "noopener,noreferrer")
        return
      }

      router.push(item.href)
    },
    [recentTitles, router, setTheme],
  )

  return (
    <CommandDialog open={open} onOpenChange={setSharedOpen}>
      {trigger ? (
        <CommandDialogTrigger render={trigger} />
      ) : (
        <CommandDialogTrigger
          render={
            <button
              type="button"
              data-slot="command-menu-trigger"
              className="group/button inline-flex size-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[min(var(--radius-lg),10px)] border-none text-sm font-medium text-foreground/80 outline-none transition-[background-color,color,scale,box-shadow] select-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98] sm:w-auto sm:px-1.5 dark:hover:bg-muted/50"
              aria-label="Open search"
            >
              <Search className="size-4" />
              <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
                <kbd className="pointer-events-none inline-flex size-5 select-none items-center justify-center rounded-sm bg-black/5 px-1 font-sans text-sm/none font-normal tracking-tight text-foreground/70 shadow-[inset_0_0_1px] shadow-black/10 dark:bg-white/10 dark:shadow-white/20">
                  ⌘
                </kbd>
                <kbd className="pointer-events-none inline-flex size-5 select-none items-center justify-center rounded-sm bg-black/5 px-1 font-sans text-sm/none font-normal tracking-tight text-foreground/70 shadow-[inset_0_0_1px] shadow-black/10 dark:bg-white/10 dark:shadow-white/20">
                  K
                </kbd>
              </span>
            </button>
          }
        />
      )}

      <CommandDialogPopup>
        <Command items={groups}>
          <CommandInput
            placeholder="Search pages, components, and headings..."
            aria-label="Search documentation"
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
          <CommandPanel>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {(group: CommandMenuGroup) => (
                <React.Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: CommandMenuItem) => (
                        <CommandItem
                          key={item.value}
                          onClick={() => handleItemClick(item)}
                          value={item.value}
                          className="gap-2"
                        >
                          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/72 [&_svg]:size-4">
                            {item.icon}
                          </span>
                          <span className="flex-1 flex items-center gap-2">
                            <Highlight text={item.title} query={query} />
                            {item.subtitle && <span className="text-xs text-muted-foreground hidden sm:inline">· {item.subtitle}</span>}
                          </span>
                          {(item.value.startsWith("design system") || item.value.startsWith("components")) && (
                            <span className="text-[11px] font-mono text-muted-foreground border rounded px-1 hidden sm:inline">
                              {item.value.startsWith("design system") ? "DS" : "CMP"}
                            </span>
                          )}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </React.Fragment>
              )}
            </CommandList>
          </CommandPanel>
          <CommandFooter>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd>
                    <ArrowUp />
                  </Kbd>
                  <Kbd>
                    <ArrowDown />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <CornerDownLeft />
                </Kbd>
                <span>Open</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  )
}
