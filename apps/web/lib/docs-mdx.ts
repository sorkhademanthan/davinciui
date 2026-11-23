import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

export type DocFrontmatter = {
  title: string
  description?: string
  eyebrow?: string
  order?: number
  lastUpdated?: string
}

export type Doc = {
  slug: string[]
  frontmatter: DocFrontmatter
  content: string
}

const CONTENT_DIR = path.join(process.cwd(), "content", "docs")

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.isFile() && entry.name.endsWith(".mdx") ? [full] : []
  })
}

export function getDocSlugs(): string[][] {
  return walk(CONTENT_DIR)
    .map((file) =>
      path.relative(CONTENT_DIR, file).replace(/\.mdx$/, "").split(path.sep),
    )
    .sort((a, b) => a.join("/").localeCompare(b.join("/")))
}

export function getDoc(slug: string[]): Doc | null {
  if (slug.length === 0) return null
  const file = path.join(CONTENT_DIR, ...slug) + ".mdx"
  if (!file.startsWith(CONTENT_DIR) || !fs.existsSync(file)) return null

  const raw = fs.readFileSync(file, "utf8")
  const { data, content } = matter(raw)
  const frontmatter = data as Partial<DocFrontmatter>
  if (!frontmatter.title) return null

  return {
    slug,
    frontmatter: { ...frontmatter, title: frontmatter.title },
    content,
  }
}

export function getAllDocs(): Doc[] {
  return getDocSlugs()
    .map((slug) => getDoc(slug))
    .filter((doc): doc is Doc => Boolean(doc))
}
