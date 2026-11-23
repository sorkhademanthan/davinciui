"use client"

import * as React from "react"
import { Check, Copy, Download } from "lucide-react"

const defaults = {
  "--background": "#ffffff",
  "--foreground": "#0f0f10",
  "--primary": "#6d5ef6",
  "--primary-foreground": "#ffffff",
  "--border": "#e4e4e7",
  "--muted": "#f4f4f5",
  "--muted-foreground": "#71717a",
  "--radius": "12",
} as const

type Token = keyof typeof defaults
const colorTokens: Token[] = [
  "--background",
  "--foreground",
  "--primary",
  "--primary-foreground",
  "--border",
  "--muted",
  "--muted-foreground",
]

export function ThemingPlayground() {
  const [tokens, setTokens] = React.useState<Record<Token, string>>({ ...defaults })
  const [copied, setCopied] = React.useState(false)

  const css = [
    ":root {",
    ...Object.entries(tokens).map(([name, value]) =>
      name === "--radius"
        ? `  ${name}: ${Number(value) / 16}rem;`
        : `  ${name}: ${value};`,
    ),
    "}",
  ].join("\n")

  function download() {
    const blob = new Blob([css], { type: "text/css" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "davinciui-theme.css"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(css)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked.
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Token playground</p>
          <p className="text-xs text-muted-foreground">Edit tokens and preview them live.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy CSS"}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="size-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <div className="space-y-3">
          {colorTokens.map((token) => (
            <label key={token} className="flex items-center justify-between gap-3 text-xs">
              <code className="font-mono text-foreground">{token}</code>
              <span className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{tokens[token]}</span>
                <input
                  type="color"
                  value={tokens[token]}
                  onChange={(event) =>
                    setTokens((previous) => ({ ...previous, [token]: event.target.value }))
                  }
                  aria-label={token}
                  className="size-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
                />
              </span>
            </label>
          ))}
          <label className="flex items-center justify-between gap-3 text-xs">
            <code className="font-mono text-foreground">--radius</code>
            <span className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">{tokens["--radius"]}px</span>
              <input
                type="range"
                min={0}
                max={32}
                value={Number(tokens["--radius"])}
                onChange={(event) =>
                  setTokens((previous) => ({
                    ...previous,
                    "--radius": event.target.value,
                  }))
                }
                aria-label="--radius"
                className="w-24 accent-[var(--primary)]"
              />
            </span>
          </label>
        </div>

        <div
          className="flex min-h-52 flex-col justify-center gap-3 p-5"
          style={
            {
              "--background": tokens["--background"],
              "--foreground": tokens["--foreground"],
              "--primary": tokens["--primary"],
              "--primary-foreground": tokens["--primary-foreground"],
              "--border": tokens["--border"],
              "--muted": tokens["--muted"],
              "--muted-foreground": tokens["--muted-foreground"],
              "--radius": `${tokens["--radius"]}px`,
              background: tokens["--background"],
              color: tokens["--foreground"],
              borderColor: tokens["--border"],
              borderRadius: tokens["--radius"],
            } as React.CSSProperties
          }
        >
          <p className="text-sm font-semibold">Button preview</p>
          <p className="text-xs opacity-70">Every token updates instantly.</p>
          <button
            type="button"
            className="mt-1 inline-flex h-9 w-fit items-center px-4 text-xs font-semibold"
            style={{
              background: tokens["--primary"],
              color: tokens["--primary-foreground"],
              borderRadius: tokens["--radius"],
            }}
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  )
}
