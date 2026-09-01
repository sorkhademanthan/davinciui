"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Crumb = { label: string; href?: string }

function toTitle(seg: string) {
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname()
  const segs = pathname.split("/").filter(Boolean)
  if (segs.length === 0) return null

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }]

  let href = ""
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i]!
    href += `/${seg}`
    const isLast = i === segs.length - 1
    // pretty labels for top areas
    let label = toTitle(seg)
    if (seg === "design-system") label = "Design System"
    if (seg === "experience") label = "Components"
    if (seg === "foundations") label = "Foundations"
    if (seg === "components") label = "Components"
    crumbs.push({ label, href: isLast ? undefined : href })
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3 opacity-50" />}
          {c.href ? (
            <Link href={c.href} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[160px]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
