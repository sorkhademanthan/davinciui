"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Check, Copy, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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
    tabs,
  activeTab,
  onTabChange,
  tabListAriaLabel = "Options",
  badge,
  children,
  className,
}: DocsCodePanelProps) {
  const hasTabs = tabs && tabs.length > 0

  const [copied, setCopied] = React.useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(copyCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked; leave the label unchanged.
    }
  }
  function askAI() {
    window.dispatchEvent(new CustomEvent("dv:ask-ai", { detail: { prompt: `Explain this code:\n\n${copyCode}` } }))
  }

  return (
    <div
      data-code-block
      data-line-numbers="false"
      className={cn(
        "dv-code docs-code-block not-prose relative flex w-full max-w-full flex-col overflow-clip text-sm",
        className
      )}
    >
      <div className="not-prose flex min-h-10 items-center justify-between gap-3 border-b border-[var(--dv-code-border)] px-4 py-2 text-sm text-muted-foreground">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar">
          {hasTabs && (
            <div role="tablist" aria-label={tabListAriaLabel} className="flex items-center gap-1">
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
                      isSelected ? "bg-[var(--dv-code-icon-hover-bg)] font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
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
        <div className="flex items-center gap-1">
          <button type="button" className="dv-code-btn" onClick={copy} aria-label={copied ? "Copied" : "Copy code"}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button type="button" className="dv-code-btn" onClick={askAI} aria-label="Ask AI about this code">
            <Sparkles size={16} />
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
        </div>
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}
