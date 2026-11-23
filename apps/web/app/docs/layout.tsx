import type React from "react"
import type { Metadata } from "next"
import { DocsChrome } from "@/components/docs-chrome/docs-chrome"

import "./docs.css"

export const metadata: Metadata = {
  title: "Components Documentation",
  description:
    "Browse the complete collection of DavinciUI components. Free, open-source React components with copy-paste code, Tailwind CSS styling, and Framer Motion animations by Manthan Sorkhade.",
  openGraph: {
    title: "UI Components Documentation | DavinciUI by Manthan Sorkhade",
    description:
      "Browse all React UI components. Copy-paste ready code with Tailwind CSS and Framer Motion.",
  },
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return <DocsChrome>{children}</DocsChrome>
}
