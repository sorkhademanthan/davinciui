import type React from "react"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { ExperienceChrome } from "@/components/experience-chrome"

export const metadata: Metadata = {
  title: "Components — DavinciUI",
  description: "Production-ready components, motion, scroll, blocks and premium experiences.",
}

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-background">
      <SiteHeader />
      <ExperienceChrome>{children}</ExperienceChrome>
    </div>
  )
}
