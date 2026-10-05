import Link from "next/link"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { CodeXml, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocsFooterNoteProps {
  icon: LucideIcon
  title?: string
  children: ReactNode
  className?: string
}

function DocsFooterNote({ icon: Icon, title, children, className }: DocsFooterNoteProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border border-border bg-muted/40 px-4 py-3",
        className
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 space-y-1">
        {title && (
          <p className="text-sm font-medium text-foreground">{title}</p>
        )}
        <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

export function DocsFooterSection() {
  return (
    <div className="flex flex-col gap-3">
      <DocsFooterNote icon={CodeXml} title="View source">
        Click the{" "}
        <CodeXml className="inline-block size-3.5 align-[-2px]" />{" "}
        icon in the preview toolbar to browse source for each variant.
      </DocsFooterNote>

      <DocsFooterNote icon={Info} title="Keep in mind">
        This component is inspired by various open-source projects and patterns. Please verify
        licenses and implementation details before using in production.
      </DocsFooterNote>

      <div className="rounded-md border border-border px-4 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium tracking-tight text-foreground">
            Need a custom component?
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            I build bespoke UI components &amp; websites tailored to your brand.
          </p>
        </div>
        <Link
          href="https://x.com/ManthanSorkhade"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-fit shrink-0 items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground sm:mt-0"
        >
          <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden>
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
          <span>DM me on X</span>
        </Link>
      </div>
    </div>
  )
}
