import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"

import { mdxComponents } from "@/components/mdx/mdx-components"
import { PageContextMenu } from "@/components/page-context-menu"
import { dvDark, dvLight } from "@/lib/code-themes"
import { getDoc, getDocSlugs } from "@/lib/docs-mdx"
import { absoluteUrl } from "@/lib/site"

type Params = { slug: string[] }

const prettyCodeOptions = {
  theme: { light: dvLight, dark: dvDark },
  keepBackground: false,
  defaultLang: "plaintext",
}

const autolinkOptions = {
  behavior: "append" as const,
  properties: {
    className: ["docs-anchor"],
    ariaLabel: "Link to section",
  },
  content: {
    type: "element" as const,
    tagName: "span",
    properties: { className: ["docs-anchor-icon"] },
    children: [{ type: "text" as const, value: "#" }],
  },
}

export function generateStaticParams(): Params[] {
  return getDocSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) return {}

  const url = absoluteUrl(`/docs/${slug.join("/")}`)
  const ogUrl = absoluteUrl(
    `/api/docs-og?${new URLSearchParams({
      title: doc.frontmatter.title,
      eyebrow: doc.frontmatter.eyebrow ?? "Documentation",
    }).toString()}`,
  )
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
      url,
      type: "article",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function DocsMdxPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()

  const pageMarkdown = [
    `# ${doc.frontmatter.title}`,
    "",
    doc.frontmatter.description ?? "",
    "",
    doc.content,
  ].join("\n")

  return (
    <div className="docs-prose w-full py-6 md:py-8 lg:px-8 lg:py-10">
      <div className="flex items-start justify-between gap-4">
        <p className="docs-eyebrow">{doc.frontmatter.eyebrow ?? "Docs"}</p>
        <PageContextMenu content={pageMarkdown} className="shrink-0" />
      </div>
      <h1>{doc.frontmatter.title}</h1>
      {doc.frontmatter.lastUpdated ? (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Last updated {doc.frontmatter.lastUpdated}
        </p>
      ) : null}
      {doc.frontmatter.description ? (
        <p className="docs-lead">{doc.frontmatter.description}</p>
      ) : null}
      <MDXRemote
        source={doc.content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            rehypePlugins: [
              rehypeSlug,
              [rehypePrettyCode, prettyCodeOptions],
              [rehypeAutolinkHeadings, autolinkOptions],
            ],
          },
        }}
      />
    </div>
  )
}
