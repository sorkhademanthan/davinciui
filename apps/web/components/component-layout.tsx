import type React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface ComponentLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  badge?: string
  date?: string
  action?: React.ReactNode
  eyebrow?: string
}

export function ComponentLayout({
  title,
  description,
  children,
  badge,
  date,
  action,
  eyebrow,
}: ComponentLayoutProps) {
  return (
    <div className="w-full max-w-[648px] space-y-10 py-6 md:py-8 lg:py-10">
      <header className="space-y-4">
        {/* Optional badge and date row */}
        {(badge || date) && (
          <div className="flex items-center gap-3">
            {badge && (
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {badge}
              </span>
            )}
            {date && (
              <span className="text-sm text-muted-foreground">
                {date}
              </span>
            )}
          </div>
        )}

        {/* Title and Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            {eyebrow ? <p className="docs-eyebrow">{eyebrow}</p> : null}
            <h1 className="scroll-m-20 text-[36px] font-medium leading-[1.15] tracking-tight">
              {title}
            </h1>
          </div>
          {action && <div className="shrink-0 pt-1">{action}</div>}
        </div>

        {/* Description */}
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {description}
        </p>
      </header>

      <div className="space-y-10">
        {children}
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  id?: string
  step?: number
  className?: string
  /** h2 for top-level sections (bordered, shadcn docs style), h3 for examples. */
  level?: 2 | 3
  hideFromToc?: boolean
}

export function Section({ title, children, id, step, className, level = 2, hideFromToc }: SectionProps) {
  const sectionId = id || title.toLowerCase().replace(/\s+/g, "-")

  if (level === 3) {
    return (
      <div
        className={cn("scroll-mt-20", className)}
        id={sectionId}
        data-section-title={title}
        data-toc-ignore={hideFromToc ? "" : undefined}
      >
        <h3 className="group flex scroll-m-20 items-center gap-2 text-lg font-semibold tracking-tight">
          {title}
          <a
            href={`#${sectionId}`}
            aria-label={`Link to ${title}`}
            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            #
          </a>
        </h3>

        <div className="mt-3 space-y-4">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("scroll-mt-20", className)}
      id={sectionId}
      data-section-title={title}
      data-toc-ignore={hideFromToc ? "" : undefined}
    >
      {/* Docs h2: medium weight, generous top margin, no divider rule, hover anchor. */}
      <h2 className="group flex scroll-m-20 items-center gap-2 text-2xl font-medium tracking-tight mt-12 mb-4">
        {title}
        <a
          href={`#${sectionId}`}
          aria-label={`Link to ${title}`}
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          #
        </a>
      </h2>

      <div className={cn("space-y-6", step !== undefined && "pl-12")}>
        {children}
      </div>
    </div>
  )
}

interface SubSectionProps {
  title: string
  children: React.ReactNode
  id?: string
}

export function SubSection({ title, children, id }: SubSectionProps) {
  const sectionId = id || title.toLowerCase().replace(/\s+/g, "-")

  return (
    <div id={sectionId} className="space-y-4">
      <h3 className="text-xl font-medium text-foreground/90">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

interface InfoBoxProps {
  children: React.ReactNode
  type?: "info" | "warning" | "tip"
}

export function InfoBox({ children, type = "info" }: InfoBoxProps) {
  const icons = {
    info: (
      <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    warning: (
      <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
    tip: (
      <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  }

  const labels = {
    info: "Info",
    warning: "Warning",
    tip: "Tip",
  }

  return (
    <div className={cn("flex gap-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-muted-foreground")}>
      {icons[type]}
      <div className="space-y-1">
        <p className="font-medium text-sm">{labels[type]}</p>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

interface CodeInlineProps {
  children: React.ReactNode
}

export function CodeInline({ children }: CodeInlineProps) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">
      {children}
    </code>
  )
}
