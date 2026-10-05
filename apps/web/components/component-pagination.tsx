import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { docsConfig } from "@/config/docs"

interface ComponentPaginationProps {
  currentSlug: string
}

const componentItems = docsConfig.nav.flatMap((group) => {
  const flat: typeof group.items = []
  const collect = (items: typeof group.items) => {
    for (const item of items) {
      if (item.href.startsWith("/docs/components/")) flat.push(item)
      if (item.items) collect(item.items)
    }
  }
  collect(group.items)
  return flat
})

const paginationLinkClass =
  "group inline-flex size-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

const paginationDisabledClass =
  "inline-flex size-8 items-center justify-center rounded-md border border-input/50 bg-background text-muted-foreground/40"

export function ComponentPagination({
  currentSlug,
}: ComponentPaginationProps) {
  const currentHref = `/docs/components/${currentSlug}`
  const currentIndex = componentItems.findIndex(
    (item) => item.href === currentHref
  )

  if (currentIndex === -1) return null

  const previous = componentItems[currentIndex - 1]
  const next = componentItems[currentIndex + 1]

  if (!previous && !next) return null

  return (
    <nav
      aria-label="Component pagination"
      className="inline-flex shrink-0 items-center gap-1.5"
    >
      {previous ? (
        <Link
          href={previous.href}
          rel="prev"
          aria-label={`Previous component: ${previous.title}`}
          title={`Previous: ${previous.title}`}
          className={paginationLinkClass}
        >
          <ArrowLeft
            className="size-[15px] transition-transform duration-200 group-hover:-translate-x-px"
            strokeWidth={1.6}
            aria-hidden
          />
        </Link>
      ) : (
        <span
          className={paginationDisabledClass}
          aria-hidden
        >
          <ArrowLeft className="size-[15px]" strokeWidth={1.6} />
        </span>
      )}

      {next ? (
        <Link
          href={next.href}
          rel="next"
          aria-label={`Next component: ${next.title}`}
          title={`Next: ${next.title}`}
          className={paginationLinkClass}
        >
          <ArrowRight
            className="size-[15px] transition-transform duration-200 group-hover:translate-x-px"
            strokeWidth={1.6}
            aria-hidden
          />
        </Link>
      ) : (
        <span
          className={paginationDisabledClass}
          aria-hidden
        >
          <ArrowRight className="size-[15px]" strokeWidth={1.6} />
        </span>
      )}
    </nav>
  )
}
