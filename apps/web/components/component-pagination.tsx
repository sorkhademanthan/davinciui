"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import type { PaginationItem } from "@/lib/component-pagination"

const paginationLinkClass =
  "group inline-flex size-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

const paginationDisabledClass =
  "inline-flex size-8 items-center justify-center rounded-md border border-input/50 bg-background text-muted-foreground/40"

/**
 * Previous/next component stepping. All component pages live in the
 * Experience shell, so pagination always stays within /experience/components.
 */
export function ComponentPagination({
  previous,
  next,
}: {
  previous?: PaginationItem
  next?: PaginationItem
}) {
  const toHref = (href: string) =>
    href.replace("/docs/components/", "/experience/components/")

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
