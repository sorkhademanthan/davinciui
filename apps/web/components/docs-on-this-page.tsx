"use client"

import { type MouseEvent, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type TocItem = { id: string; title: string; depth: 2 | 3; element: HTMLElement }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-")
}

function collectSections(main: HTMLElement): TocItem[] {
  const componentPage = main.querySelector("[data-docs-layout]")
  const candidates = componentPage
    ? Array.from(componentPage.querySelectorAll<HTMLElement>("article [data-section-title]"))
    : Array.from(main.querySelectorAll<HTMLElement>("[data-section-title], h2, h3"))

  const seen = new Set<string>()
  return candidates.flatMap((candidate) => {
    if (candidate.matches("[data-toc-ignore]")) return []
    if (candidate.matches("h2")) {
      // A Section already supplies its own title. Ignore headings inside
      // examples and only use the leading heading of a semantic section.
      if (candidate.closest("[data-section-title]")) return []
      const section = candidate.closest("section")
      if (section && section.querySelector("h2") !== candidate) return []
    }

    const title = candidate.dataset.sectionTitle || candidate.textContent?.replace(/#\s*$/, "").trim()
    if (!title) return []
    const target = candidate.matches("h2") ? candidate.closest("section") || candidate : candidate
    const id = target.id || candidate.id || slugify(title)
    if (!id || seen.has(id)) return []
    seen.add(id)
    const heading = candidate.matches("h2, h3") ? candidate : candidate.querySelector("h2, h3")
    return [{ id, title, depth: heading?.tagName === "H3" ? 3 : 2, element: target }]
  })
}

export function DocsOnThisPage({
  variant = "default",
}: {
  variant?: "default" | "docs" | "mobile"
} = {}) {
  const docsVariant = variant === "docs"
  const pathname = usePathname()
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState("")
  const [indicator, setIndicator] = useState<{ height: number; top: number } | null>(null)
  const selectedId = useRef("")
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef(new Map<string, HTMLLIElement>())

  useEffect(() => {
    const main = document.querySelector<HTMLElement>("[data-docs-main]")
    if (!main) return
    selectedId.current = ""
    const nextItems = collectSections(main)
    setItems(nextItems)

    let frame = 0
    const updateActive = () => {
      frame = 0
      const selected = nextItems.find((item) => item.id === selectedId.current)
      if (selected) {
        const top = selected.element.getBoundingClientRect().top
        if (top >= 0 && top < window.innerHeight) {
          setActiveId(selected.id)
          return
        }
        selectedId.current = ""
      }
      const threshold = Math.min(320, window.innerHeight * 0.35)
      // In the final viewport, tail sections can never cross the threshold
      // line (there is no more room to scroll), so expand the line down
      // toward the viewport bottom as the page end approaches. This hands
      // the highlight through each tail section instead of jumping from an
      // early section straight to the last one. Gated on scrollability so
      // short pages keep the first item active on load.
      const doc = document.documentElement
      const scrollable = doc.scrollHeight > window.innerHeight + 10
      let effThreshold = threshold
      if (scrollable) {
        const remaining = doc.scrollHeight - (window.scrollY + window.innerHeight)
        const tailRoom = window.innerHeight - threshold
        if (remaining < tailRoom) {
          effThreshold = threshold + (tailRoom - Math.max(remaining, 0))
        }
      }
      let current = nextItems[0]?.id || ""
      for (const item of nextItems) {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top
        if (top !== undefined && top <= effThreshold) current = item.id
        else break
      }
      // At the absolute bottom the final section often sits below even the
      // expanded line (short section, page end) — snap to it so the highlight
      // never sticks on a previous section.
      if (
        scrollable &&
        window.scrollY + window.innerHeight >= doc.scrollHeight - 4 &&
        nextItems.length > 0
      ) {
        current = nextItems[nextItems.length - 1]!.id
      }
      setActiveId(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateActive) }
    const clearSelection = () => { selectedId.current = ""; schedule() }
    const clearOnKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) clearSelection()
    }
    updateActive()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    window.addEventListener("hashchange", schedule)
    window.addEventListener("wheel", clearSelection, { passive: true })
    window.addEventListener("touchstart", clearSelection, { passive: true })
    window.addEventListener("keydown", clearOnKey)
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(main)
    nextItems.forEach((item) => resizeObserver.observe(item.element))
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("hashchange", schedule)
      window.removeEventListener("wheel", clearSelection)
      window.removeEventListener("touchstart", clearSelection)
      window.removeEventListener("keydown", clearOnKey)
      resizeObserver.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname])

  useEffect(() => {
    const list = listRef.current
    const activeItem = itemRefs.current.get(activeId)
    if (!list || !activeItem) {
      setIndicator(null)
      return
    }

    const updateIndicator = () => {
      setIndicator({
        height: activeItem.offsetHeight,
        top: activeItem.offsetTop,
      })
    }
    updateIndicator()
    const observer = new ResizeObserver(updateIndicator)
    observer.observe(list)
    observer.observe(activeItem)
    return () => observer.disconnect()
  }, [activeId, items])

  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, item: TocItem) {
    event.preventDefault()
    selectedId.current = item.id
    setActiveId(item.id)
    window.history.pushState(null, "", `#${item.id}`)
    const target = document.getElementById(item.id)
    if (!target) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const lenis = (window as Window & { __lenis?: { scrollTo: (target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean; force?: boolean }) => void; stop: () => void; start: () => void } }).__lenis
    if (lenis) {
      lenis.scrollTo(target, { offset: -120, immediate: reduceMotion, force: true })
      return
    }
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
  }

  if (items.length === 0) return null

  if (variant === "mobile") {
    return (
      <details className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm xl:hidden">
        <summary className="cursor-pointer font-medium text-foreground">
          On this page
        </summary>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id} className={item.depth === 3 ? "pl-4" : undefined}>
              <a
                href={`#${item.id}`}
                onClick={(event) => scrollToSection(event, item)}
                className={
                  activeId === item.id
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </details>
    )
  }

  return (
    <nav aria-label="On this page" className={docsVariant ? "w-full" : "w-full px-7 py-9"}>
      <p
        className={
          docsVariant
            ? "mb-3 text-sm font-medium text-muted-foreground"
            : "mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        }
      >
        On this page
      </p>
      <ul
        ref={listRef}
        className={docsVariant ? "flex flex-col" : "relative border-l border-border/70 text-sm"}
      >
        {!docsVariant && indicator && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-px w-px bg-foreground transition-[height,transform] duration-300 ease-out motion-reduce:transition-none"
            style={{ height: indicator.height, transform: `translateY(${indicator.top}px)` }}
          />
        )}
        {items.map((item) => (
          <li key={item.id} ref={(element) => {
            if (element) itemRefs.current.set(item.id, element)
            else itemRefs.current.delete(item.id)
          }}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              onClick={(event) => scrollToSection(event, item)}
              className={
                docsVariant
                  ? cn(
                      "block py-1.5 text-sm leading-5 transition-colors",
                      item.depth === 3 ? "pl-4" : "pl-0",
                      activeId === item.id
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )
                  : cn(
                      "mr-3 block rounded-r-md py-2 pr-3 text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                      item.depth === 3 ? "pl-6" : "pl-3",
                      activeId === item.id && "bg-muted/60 font-medium text-foreground",
                    )
              }
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
