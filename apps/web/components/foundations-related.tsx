import Link from "next/link"
import { Section } from "@/components/component-layout"

export function FoundationsRelated({
  items,
}: {
  items: readonly (readonly [label: string, href: string])[]
}) {
  return (
    <Section title="Related" id="related">
      <div className="flex flex-wrap gap-1.5">
        {items.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-full border bg-background px-2.5 py-1 text-xs hover:bg-accent"
          >
            {label}
          </Link>
        ))}
      </div>
    </Section>
  )
}
