"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import type { PaginationItem } from "@/lib/component-pagination"

const paginationLinkClass =
  "group inline-flex size-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

const paginationDisabledClass =
  "inline-flex size-8 items-center justify-center rounded-md border border-input/50 bg-background text-muted-foreground/40"

/**
 * Previous/next component stepping that stays in the visitor's section:
 * Docs pages paginate within /docs, Experience pages within /experience —
 * no unexpected shell switching. Items resolve server-side; only the
 * prefix rewrite needs the client pathname.
 */
export function ComponentPagination({
  previous,
  next,
}: {
  previous?: PaginationItem
  next?: PaginationItem
}) {
  const pathname = usePathname()
  const base = pathname.startsWith("/experience/")
    ? "/experience/components"
    : "/docs/components"
  const toHref = (href: string) =>
    base !== "/docs/components"
      ? href.replace("/docs/components/", `${base}/`)
      : href

  if (!previous && !next) return null

  return (
    <nav
      aria-label="Component pagination"
      className="inline-flex shrink-0 items-center gap-1.5"
    >
      {previous ? (
        <Link
          href={toHref(previous.href)}
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
          href={toHref(next.href)}
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
