import type { Metadata } from "next"
import Link from "next/link"
import { components } from "@/registry"

export const metadata: Metadata = {
  title: "Components — DavinciUI",
  description: "Browse all DavinciUI components — text animations, premium interactions, hero backgrounds and visual effects.",
}

const categoryOrder = [
  "Text Animations",
  "Premium Components",
  "Hero Backgrounds",
  "Visual Effects",
  "Preloaders",
  "Interactions",
  "Cursor Effects",
  "Motion",
] as const

export default function ComponentsIndexPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Docs</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Components</h1>
        <p className="text-[15px] leading-7 text-muted-foreground">
          Open-code components you own. Copy, paste, customize. Built with Tailwind CSS and Framer
          Motion. Each component page includes preview, CLI install, and full source.
        </p>
        <div className="flex gap-2">
          <code className="rounded-md border bg-muted px-2 py-1 font-mono text-xs">
            pnpm dlx shadcn add @davinciui/[component]
          </code>
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {categoryOrder.map((category) => {
          const items = Object.values(components)
            .filter((c) => c.category === category)
            .sort((a, b) => a.title.localeCompare(b.title))
          if (items.length === 0) return null
          return (
            <section key={category}>
              <div className="flex items-baseline justify-between gap-4 border-b pb-3">
                <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
                  {category}
                </h2>
                <span className="text-xs font-mono text-muted-foreground">{items.length}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/docs/components/${c.slug}`}
                    className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                  >
                    <h3 className="text-sm font-medium group-hover:underline underline-offset-4">
                      {c.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {c.description}
                    </p>
                    <p className="mt-2 font-mono text-xs text-muted-foreground">{c.slug}</p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
