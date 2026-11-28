import { components } from "@/registry";
import { docsConfig } from "@/config/docs";
import { DOCS_SLUGS } from "@/lib/docs-slugs.generated";
import { getDocSlugs } from "@/lib/docs-mdx";
import { isHiddenComponentSlug } from "@/lib/hidden-components";
import { absoluteUrl } from "@/lib/site";

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export function getSitemapEntries(): SitemapEntry[] {
  const currentDate = new Date();

  const staticPages: SitemapEntry[] = [
    {
      url: absoluteUrl(),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/docs"),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/docs/components"),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/docs/installation"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/docs/mcp"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/blocks"),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/sponsors"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/sitemap"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Only slugs with dedicated docs pages are indexed — the rest redirect
  // to the live gallery, so they must never appear as thin indexed pages.
  const documented = new Set<string>(DOCS_SLUGS.filter((slug) => !isHiddenComponentSlug(slug)));
  const componentSitemap: SitemapEntry[] = Object.keys(components)
    .filter((slug) => documented.has(slug))
    .map((slug) => ({
      url: absoluteUrl(`/docs/components/${slug}`),
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Documentation pages come from the same nav config that drives the
  // sidebar, plus every MDX page under content/docs.
  const docPaths = new Set<string>();
  const collect = (items: { href: string; items?: unknown }[]) => {
    for (const item of items) {
      if (item.href.startsWith("/docs") && !item.href.includes("#")) {
        docPaths.add(item.href);
      }
      if (Array.isArray(item.items)) collect(item.items as typeof items);
    }
  };
  for (const group of docsConfig.nav) collect(group.items);
  for (const slug of getDocSlugs()) docPaths.add(`/docs/${slug.join("/")}`);

  const docsSitemap: SitemapEntry[] = [...docPaths]
    .filter((path) => !documented.has(path.replace("/docs/components/", "")))
    .map((path) => ({
      url: absoluteUrl(path),
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...docsSitemap,
    ...componentSitemap,
  ].filter((entry, index, all) => all.findIndex((candidate) => candidate.url === entry.url) === index);
}
