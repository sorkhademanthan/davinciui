import { docsConfig } from "@/config/docs"
import { getDoc } from "@/lib/docs-mdx"
import { components } from "@/registry"

export const dynamic = "force-static"

const headers = {
  "Content-Type": "text/markdown; charset=utf-8",
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const doc = getDoc(slug)

  if (doc) {
    const body = [
      `# ${doc.frontmatter.title}`,
      "",
      doc.frontmatter.description ?? "",
      "",
      doc.content,
    ].join("\n")

    return new Response(body, { headers })
  }

  const componentSlug =
    slug[0] === "components" ? slug.slice(1).join("/") : slug.join("/")
  const component = components[componentSlug]

  if (component) {
    const body = [
      `# ${component.title}`,
      "",
      component.description,
      "",
      "## Installation",
      "",
      "```bash",
      `npx shadcn@latest add @davinciui/${componentSlug}`,
      "```",
      "",
      `[Read the full documentation](https://www.davinciui.com/docs/components/${componentSlug})`,
      "",
    ].join("\n")

    return new Response(body, { headers })
  }

  const path = `/docs/${slug.join("/")}`
  const findPage = (items: { title: string; href: string; items?: unknown }[]): { title: string; href: string } | undefined => {
    for (const item of items) {
      if (item.href === path) return item
      if (Array.isArray(item.items)) {
        const found = findPage(item.items as typeof items)
        if (found) return found
      }
    }
    return undefined
  }
  let page: { title: string; href: string } | undefined
  for (const group of docsConfig.nav) {
    page = findPage(group.items)
    if (page) break
  }

  if (page) {
    const body = [
      `# ${page.title}`,
      "",
      `Read the full documentation at https://www.davinciui.com${path}.`,
      "",
    ].join("\n")
    return new Response(body, { headers })
  }

  return new Response("Not found", { status: 404 })
}
