import type { Metadata } from "next"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const metadata: Metadata = { title: "Foundations — Design System" }

const items = [
  ["Colors","colors","Palette & semantic tokens"],
  ["Typography","typography","Type scale & fonts"],
  ["Spacing","spacing","8pt scale"],
  ["Sizing","sizing","Sizing primitives"],
  ["Borders","borders","Border & ring"],
  ["Border Radius","border-radius","Radius tokens"],
  ["Shadows","shadows","Elevation"],
  ["Icons","icons","Icon system"],
  ["Motion","motion","Foundational motion"],
  ["Breakpoints","breakpoints","Responsive"],
] as const

export default function Page(){
  return (
    <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs className="mb-4" />
      <h1 className="text-3xl font-semibold tracking-tight">Foundations</h1>
      <p className="mt-2 text-sm text-muted-foreground">The visual rules that define the system.</p>
      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {items.map(([t,s,d])=> (
          <Link key={s} href={`/design-system/foundations/${s}`} className="rounded-xl border p-4 hover:border-input hover:shadow-sm transition-all">
            <p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
