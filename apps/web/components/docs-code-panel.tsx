"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"

export interface DocsCodePanelTab {
  id: string
  label: string
}

interface DocsCodePanelProps {
  /** Kept for call-site compatibility; the shadcn-style header shows tabs only. */
  icon?: LucideIcon
  copyCode: string
  copyEventName?: "content_copied" | "component_install_command_copied"
  tabs?: DocsCodePanelTab[]
  activeTab?: string
  onTabChange?: (id: string) => void
  tabListAriaLabel?: string
  /** Optional pill rendered in the header (e.g. live-personalization state). */
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DocsCodePanel({
  copyCode,
  copyEventName,
  tabs,
  activeTab,
  onTabChange,
  tabListAriaLabel = "Options",
  badge,
  children,
  className,
}: DocsCodePanelProps) {
  const hasTabs = tabs && tabs.length > 0

  return (
    <div
      data-code-block
      data-line-numbers="false"
      className={cn(
        "not-prose relative flex w-full max-w-full flex-col overflow-clip rounded-md border border-border bg-muted/40 text-sm",
        className
      )}
    >
      <div className="not-prose flex h-10 items-center justify-between gap-3 border-b border-border/60 px-3 py-1.5 text-sm text-muted-foreground">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar">
          {hasTabs && (
            <div
              role="tablist"
              aria-label={tabListAriaLabel}
              className="flex items-center gap-1"
            >
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => onTabChange?.(tab.id)}
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 font-mono text-[13px] outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      isSelected
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {badge}
        <CopyButton
          code={copyCode}
          eventName={copyEventName}
          absolute={false}
          className="shrink-0 p-1.5"
        />
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}
