import type { Metadata } from "next"
import { DesignSystemLayoutShell } from "@/components/design-system/design-system-layout-shell"

export const metadata: Metadata = {
  title: "Design System — DavinciUI",
  description: "How we design — foundations, tokens, themes, and principles behind every component.",
}

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <DesignSystemLayoutShell>{children}</DesignSystemLayoutShell>
}
