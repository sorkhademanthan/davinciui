"use client"

import type { ReactNode } from "react"

/** Shared, deliberately quiet chrome for every Foundation live preview. */
export function FoundationPreviewShell({
  label = "Live preview",
  description,
  toolbar,
  children,
  inspector,
}: {
  label?: string
  description: string
  toolbar?: ReactNode
  children: ReactNode
  inspector?: ReactNode
}) {
  return (
    <aside aria-label={label} className="h-fit overflow-hidden rounded-xl border border-border bg-background xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <header className="border-b border-border px-5 py-4">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        {toolbar && <div className="mt-3 flex flex-wrap gap-1.5">{toolbar}</div>}
      </header>
      <div className="p-4">{children}</div>
      {inspector && <details className="border-t border-border px-4 py-1"><summary className="inline-flex min-h-11 cursor-pointer items-center text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Token inspector</summary><div className="pb-4 text-xs text-muted-foreground">{inspector}</div></details>}
    </aside>
  )
}
