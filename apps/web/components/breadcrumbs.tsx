"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type Crumb = { label: string; href?: string };

function toTitle(seg: string) {
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function Breadcrumbs({ className, items }: { className?: string; items?: Crumb[] }) {
  const pathname = usePathname()
  if (items) {
    return (
      <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        {items.map((c, i) => (
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
  const segs = pathname.split("/").filter(Boolean)
  if (segs.length === 0) return null

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }]

  // Collapse /experience/components -> single "Components" crumb to avoid Home > Components > Components
  let href = ""
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i]!
    // skip duplicate components segment after experience
    if (seg === "components" && segs[i - 1] === "experience") {
      href += `/${seg}`
      continue
    }
    href += `/${seg}`
    const isLast = i === segs.length - 1 || (seg === "experience" && segs[i + 1] === "components" && i + 1 === segs.length - 1)
    // pretty labels for top areas
    let label = toTitle(seg)
    if (seg === "design-system") label = "Design System"
    if (seg === "experience") label = "Components"
    if (seg === "foundations") label = "Foundations"
    if (seg === "components") label = "Components"
    // when experience is followed by components, render single crumb for the pair
    if (seg === "experience" && segs[i + 1] === "components") {
      crumbs.push({ label: "Components", href: isLast ? undefined : "/experience/components" })
      i++ // skip next seg
      href = "/experience/components"
      continue
    }
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
