"use client"

import * as React from "react"
import { Check, Copy, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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
  className,
}: DocsSnippetProps) {
  const text = React.useMemo(() => code.trim(), [code])
  const [copied, setCopied] = React.useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked; leave the label unchanged.
    }
  }
  function askAI() {
    window.dispatchEvent(new CustomEvent("dv:ask-ai", { detail: { prompt: `Explain this code:\n\n${text}` } }))
  }

  return (
    <div data-code-block className={cn("dv-code docs-code-block", className)}>
      <div className="dv-code-actions docs-code-actions">
        <button type="button" className="dv-code-btn docs-copy" onClick={copy} aria-label={copied ? "Copied" : "Copy code"}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button type="button" className="dv-code-btn" onClick={askAI} aria-label="Ask AI about this code">
          <Sparkles size={16} />
        </button>
        <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
      </div>
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  )
}
