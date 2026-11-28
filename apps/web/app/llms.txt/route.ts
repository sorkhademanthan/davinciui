import { getAllDocs } from "@/lib/docs-mdx"
import { components } from "@/registry"

export const dynamic = "force-static"

export function GET() {
  const docs = getAllDocs()
  const componentList = Object.entries(components).sort(([a], [b]) =>
    a.localeCompare(b),
  )

  const lines = [
    "# DavinciUI",
    "",
    "> Animated React components distributed through the shadcn registry. Copy-paste source, Tailwind CSS, and Framer Motion.",
    "",
    "## Documentation",
    "",
    ...docs.map(
      (doc) =>
        `- [${doc.frontmatter.title}](https://www.davinciui.com/docs/${doc.slug.join("/")}): ${doc.frontmatter.description ?? ""}`,
    ),
    "",
    "## Components",
    "",
    ...componentList.map(
      ([slug, component]) =>
        `- [${component.title}](https://www.davinciui.com/docs/components/${slug}): ${component.description}`,
    ),
    "",
  ]

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
