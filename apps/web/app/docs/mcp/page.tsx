"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Check, Copy, Terminal } from "lucide-react"
import {
  PACKAGE_MANAGERS,
  type PackageManager,
} from "@/components/package-manager-command"
import { cn } from "@/lib/utils"

const MCP_INIT_COMMANDS: Record<PackageManager, string> = {
  pnpm: "pnpm dlx shadcn@latest mcp init",
  npm: "npx shadcn@latest mcp init",
  yarn: "yarn dlx shadcn@latest mcp init",
  bun: "bunx --bun shadcn@latest mcp init",
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-black/[0.05] hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-500 dark:hover:bg-white/[0.07] dark:hover:text-white"
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}

export default function McpDocsPage() {
  const [packageManager, setPackageManager] =
    React.useState<PackageManager>("pnpm")
  const command = MCP_INIT_COMMANDS[packageManager]
  const registryNamespace =
    process.env.NEXT_PUBLIC_REGISTRY_NAMESPACE || "@davinciui"
  const registryConfig = JSON.stringify(
    {
      registries: {
        [registryNamespace]: "https://davinciui.com/r/{name}.json",
      },
    },
    null,
    2
  )

  return (
    <div className="min-h-[calc(100svh-4.5rem)] bg-[#fafafa] text-zinc-950 dark:bg-[#080808] dark:text-white">
      <main className="mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-[760px] flex-col items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex max-w-[620px] flex-col items-center text-center">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none">
            <Terminal className="size-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Model Context Protocol
          </p>
          <h1 className="mt-2 max-w-[12ch] text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.05em] sm:text-5xl">
            Connect DavinciUI to your AI.
          </h1>
          <p className="mt-4 max-w-[580px] text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Let your coding agent find and install components from the DavinciUI registry.
          </p>
        </div>

        <section
          aria-label="MCP setup"
          className="mt-8 w-full overflow-hidden rounded-[24px] border border-black/[0.09] bg-white shadow-[0_18px_55px_-38px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#101011] dark:shadow-none sm:mt-10"
        >
          <div className="border-b border-black/[0.07] px-5 py-4 dark:border-white/[0.08] sm:px-7">
            <h2 className="text-base font-semibold tracking-tight">Set up MCP</h2>
            <p className="mt-1 text-sm text-zinc-500">Two steps, then you’re ready.</p>
          </div>

          <div className="px-5 py-5 sm:px-7">
            <div className="flex gap-4 sm:gap-5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-950 font-mono text-[11px] text-white dark:bg-white dark:text-black">
                1
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">Initialize in your project</h3>
                <div className="mt-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-zinc-50 dark:border-white/[0.08] dark:bg-[#09090a]">
                  <div
                    className="flex min-h-11 items-center gap-1 border-b border-black/[0.06] px-2 dark:border-white/[0.08]"
                    role="tablist"
                    aria-label="Package manager"
                  >
                    {PACKAGE_MANAGERS.map((manager) => (
                      <button
                        key={manager}
                        type="button"
                        role="tab"
                        aria-selected={packageManager === manager}
                        onClick={() => setPackageManager(manager)}
                        className={cn(
                          "min-h-10 rounded-lg px-2.5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3",
                          packageManager === manager
                            ? "bg-white text-zinc-950 shadow-sm dark:bg-white/10 dark:text-white dark:shadow-none"
                            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        )}
                      >
                        {manager}
                      </button>
                    ))}
                  </div>
                  <div className="flex min-h-14 items-center gap-3 px-4">
                    <span className="font-mono text-xs text-blue-500" aria-hidden="true">$</span>
                    <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12px] text-zinc-700 [scrollbar-width:none] dark:text-zinc-300 sm:text-[13px]">
                      {command}
                    </code>
                    <CopyButton value={command} label="command" />
                  </div>
                </div>
              </div>
            </div>

            <div className="my-4 ml-3.5 h-4 w-px bg-black/10 dark:bg-white/10" aria-hidden="true" />

            <div className="flex gap-4 sm:gap-5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-black/10 font-mono text-[11px] text-zinc-500 dark:border-white/10">
                2
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">
                  Add the registry to <code className="font-mono text-[12px] font-normal text-zinc-500">components.json</code>
                </h3>
                <div className="mt-3 flex items-start gap-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-zinc-50 px-4 py-3 dark:border-white/[0.08] dark:bg-[#09090a]">
                  <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[11px] leading-5 text-zinc-700 [scrollbar-width:none] dark:text-zinc-300 sm:text-xs"><code>{registryConfig}</code></pre>
                  <CopyButton value={registryConfig} label="registry configuration" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 border-t border-black/[0.07] bg-zinc-50/70 px-5 py-3 text-sm dark:border-white/[0.08] dark:bg-white/[0.025] sm:flex-row sm:px-7">
            <p className="text-center text-zinc-500 sm:text-left">
              Now ask your agent for any DavinciUI component.
            </p>
            <Link
              href="/experience/components"
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-medium text-zinc-800 transition-colors hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-200 dark:hover:bg-white/[0.06]"
            >
              Browse components
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
