"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"

interface DocsSnippetProps {
  code: string
  variant?: "dark" | "muted"
  className?: string
  language?: string
}

/**
 * Single canonical static code block for docs guide pages.
 * Every instance ships a copy button — installation, import,
 * config and composition snippets included.
 */
export function DocsSnippet({
  code,
  variant = "dark",
  className,
}: DocsSnippetProps) {
  const text = React.useMemo(() => code.trim(), [code])

  return (
    <div
      data-code-block
      className={cn(
        "relative overflow-hidden rounded-lg border text-sm",
        variant === "dark"
          ? "border-zinc-800 bg-zinc-950"
          : "border-border bg-muted/40",
        className
      )}
    >
      <CopyButton code={text} />
      <pre className="overflow-x-auto p-4 pr-12">
        <code
          className={cn(
            "font-mono text-[13px] leading-6 whitespace-pre",
            variant === "dark" ? "text-zinc-100" : "text-foreground"
          )}
        >
          {text}
        </code>
      </pre>
    </div>
  )
}
