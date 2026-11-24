import type { Metadata } from "next"
import Link from "next/link"
import { components, sortByFeatured, type ComponentCategory } from "@/registry"
import { docsComponentCategories } from "@/config/docs"
import { DocsSnippet } from "@/components/docs-snippet"
import { Section } from "@/components/component-layout"
import { isHiddenComponentSlug } from "@/lib/hidden-components"

export const metadata: Metadata = {
  title: "Components — DavinciUI",
  description: "Browse all DavinciUI components — text animations, premium interactions, hero backgrounds and visual effects.",
}

const categoryOrder = docsComponentCategories()

const SPOTLIGHTS = [
  { title: "Text Animations", href: "#text-animations", desc: "Headline motion: morph, reveal, scramble." },
  { title: "Premium Components", href: "#premium-components", desc: "Interactive building blocks for product UI." },
  { title: "Hero Backgrounds", href: "#hero-backgrounds", desc: "Full-bleed animated backdrops." },
] as const

export default function ComponentsIndexPage() {
  return (
    <div className="w-full max-w-5xl py-6 md:py-8 lg:px-8 lg:py-10">
      <div className="max-w-[648px] space-y-4">
        <p className="docs-eyebrow">Docs</p>
        <h1 className="text-[36px] font-medium leading-[1.15] tracking-tight">Components</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Every component below is open code you add to your own project. Each
          component page gives you a live preview, the CLI install command, the
          full source, basic usage, props, examples, and required dependencies
          where they apply.
        </p>
        <DocsSnippet
          variant="muted"
          className="w-full max-w-md"
          code={`pnpm dlx shadcn@latest add @davinciui/[component]`}
        />
      </div>

      <div className="mt-10 max-w-[648px]">
        <Section title="Choosing a component" id="choosing-a-component">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>
              Start from the tâche: animated headline →{" "}
              <Link href="#text-animations" className="underline underline-offset-4">Text Animations</Link>;
              page backdrop →{" "}
              <Link href="#hero-backgrounds" className="underline underline-offset-4">Hero Backgrounds</Link>;
              form, feedback, or overlay UI → the matching{" "}
              <Link href="/experience/components" className="underline underline-offset-4">base component</Link>.
            </li>
            <li>
              Open the component page and try the interactive preview first — most
              animated components expose their key props as live controls.
            </li>
            <li>
              Check the install dependencies before adding: animation-heavy pieces
              need <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">framer-motion</code>,
              canvas pieces need a WebGL-capable browser.
            </li>
            <li>
              If you customize theme tokens, skim{" "}
              <Link href="/docs/foundations/colors" className="underline underline-offset-4">Colors</Link>{" "}
              and{" "}
              <Link href="/docs/foundations/motion" className="underline underline-offset-4">Motion</Link>{" "}
              — components inherit both.
            </li>
          </ul>
        </Section>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {SPOTLIGHTS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <span className="text-sm font-medium">{s.title}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{s.desc}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 space-y-12">
        {categoryOrder.map((category) => {
          const items = sortByFeatured(
            Object.values(components).filter(
              (c) =>
                !isHiddenComponentSlug(c.slug) &&
                (c.category === category || c.extraCategories?.includes(category as ComponentCategory)),
            ),
          )
          if (items.length === 0) return null
          return (
            <section key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
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
                    href={`/experience/components/${c.slug}`}
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
