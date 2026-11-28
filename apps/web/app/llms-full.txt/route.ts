import { getAllDocs } from "@/lib/docs-mdx"
import { components } from "@/registry"

export const dynamic = "force-static"

export function GET() {
  const docs = getAllDocs()
  const componentList = Object.entries(components).sort(([a], [b]) =>
    a.localeCompare(b),
  )

  const docSections = docs.map((doc) =>
    [
      `# ${doc.frontmatter.title}`,
      "",
      doc.frontmatter.description ?? "",
      "",
      doc.content,
    ].join("\n"),
  )

  const componentSections = componentList.map(([slug, component]) =>
    [
      `# ${component.title}`,
      "",
      component.description,
      "",
      "## Installation",
      "",
      "```bash",
      `npx shadcn@latest add @davinciui/${slug}`,
      "```",
      "",
      `Documentation: https://www.davinciui.com/docs/components/${slug}`,
    ].join("\n"),
  )

  const body = [
    "# DavinciUI — full documentation",
    "",
    ...docSections,
    "",
    "# Component index",
    "",
    ...componentSections,
    "",
  ].join("\n\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
