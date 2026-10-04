import type React from "react"
import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/site"
import { SiteHeader } from "@/components/site-header"
import { DocsShell } from "@/components/docs-shell"

export const metadata: Metadata = {
  title: "Components Documentation",
  description: "Browse the complete collection of DavinciUI components. Free, open-source React components with copy-paste code, Tailwind CSS styling, and Framer Motion animations by Manthan Sorkhade.",
  openGraph: {
    title: "UI Components Documentation | DavinciUI by Manthan Sorkhade",
    description: "Browse all React UI components. Copy-paste ready code with Tailwind CSS and Framer Motion.",
  },
  alternates: {
    canonical: absoluteUrl("/docs"),
  },
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div data-route-docs className="min-h-svh flex flex-col bg-[#fcfcfc] dark:bg-[#050505]">
      <SiteHeader />
      <DocsShell>{children}</DocsShell>
    </div>
  )
}
