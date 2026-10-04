import { MetadataRoute } from "next";
import { components } from "@/registry";
import { getDocsSlugs } from "@/components/docs/lazy-registry";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
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
  ];

  // Only slugs with dedicated docs pages are indexed — the rest redirect
  // to the live gallery, so they must never appear as thin indexed pages.
  const documented = new Set(getDocsSlugs());
  const componentSitemap: MetadataRoute.Sitemap = Object.keys(components)
    .filter((slug) => documented.has(slug))
    .map((slug) => ({
      url: absoluteUrl(`/docs/components/${slug}`),
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...componentSitemap];
}
