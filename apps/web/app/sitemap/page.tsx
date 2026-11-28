import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { DOCS_SLUGS } from "@/lib/docs-slugs.generated";
import { components } from "@/registry";
import { docsCategoryBySlug } from "@/lib/docs-content/categories";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Every DavinciUI page and component, grouped by category in one tree.",
  alternates: {
    canonical: absoluteUrl("/sitemap"),
  },
  openGraph: {
    title: "Sitemap | DavinciUI",
    description:
      "Every DavinciUI page and component, grouped by category in one tree.",
    url: absoluteUrl("/sitemap"),
    type: "website",
  },
};

type SiteLink = {
  title: string;
  href: string;
  items?: SiteLink[];
};

const SITE_SECTIONS: SiteLink[] = [
  { title: "Home", href: "/" },
  {
    title: "Documentation",
    href: "/docs",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Configuration", href: "/docs/configuration" },
      { title: "Theming", href: "/docs/theming" },
      { title: "CLI", href: "/docs/cli" },
      { title: "Typeset", href: "/docs/typeset" },
      { title: "Skills", href: "/docs/skills" },
      { title: "Registry", href: "/docs/registry" },
      { title: "MCP server", href: "/docs/mcp" },
      { title: "Changelog", href: "/docs/changelog" },
      { title: "Foundations", href: "/docs/foundations/colors" },
    ],
  },
  {
    title: "Components",
    href: "/experience/components",
    items: [
      { title: "Documentation index", href: "/docs/components" },
      { title: "Live gallery", href: "/experience/components" },
      { title: "Blocks", href: "/blocks" },
    ],
  },
  { title: "Design system", href: "/design-system/new" },
  { title: "Sponsors", href: "/sponsors" },
  { title: "Privacy policy", href: "/privacy-policy" },
  { title: "Terms of service", href: "/terms-of-service" },
];

const PREFERRED_CATEGORY_ORDER = [
  "Text Animations",
  "Premium Components",
  "Hero Backgrounds",
  "Visual Effects",
  "Preloaders",
  "Interactions",
  "Cursor Effects",
  "Actions",
  "Forms",
  "Feedback",
  "Navigation",
  "Overlays",
  "Data Display",
  "Layout",
  "Sound",
];

const ACRONYMS = new Set(["api", "cms", "faq", "gsap", "otp", "ui", "url", "webgl"]);

function titleForSlug(slug: string) {
  return (
    components[slug]?.title ??
    slug
      .split("-")
      .map((part) =>
        ACRONYMS.has(part)
          ? part.toUpperCase()
          : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join(" ")
  );
}

function anchorFor(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function categoryRank(category: string) {
  const index = PREFERRED_CATEGORY_ORDER.indexOf(category);
  return index === -1 ? PREFERRED_CATEGORY_ORDER.length : index;
}

export default function SitemapPage() {
  const documented = DOCS_SLUGS;

  const grouped = new Map<string, { slug: string; title: string }[]>();
  for (const slug of documented) {
    const category =
      docsCategoryBySlug[slug] ?? components[slug]?.category ?? "Other";
    const list = grouped.get(category) ?? [];
    list.push({ slug, title: titleForSlug(slug) });
    grouped.set(category, list);
  }

  const categories = [...grouped.keys()].sort((a, b) => {
    const rank = categoryRank(a) - categoryRank(b);
    return rank !== 0 ? rank : a.localeCompare(b);
  });

  for (const list of grouped.values()) {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Directory
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.02em] sm:text-6xl md:text-7xl">
            Sitemap
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Every page and component on DavinciUI, grouped by category. Expand a
            branch to see its components, or jump straight to a category.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Component pages
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {documented.length}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Categories
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {categories.length}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Machine-readable
              </dt>
              <dd className="mt-1 text-sm">
                <a
                  href="/sitemap.xml"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                >
                  sitemap.xml
                </a>
              </dd>
            </div>
          </dl>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-10">
              <nav aria-label="Page sections">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  On this page
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {SITE_SECTIONS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Component categories">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Categories
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  {categories.map((category) => (
                    <li key={category}>
                      <a
                        href={`#${anchorFor(category)}`}
                        className="flex items-baseline justify-between gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="truncate">{category}</span>
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
                          {grouped.get(category)?.length}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <section aria-labelledby="pages-heading">
              <h2
                id="pages-heading"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                Pages
              </h2>
              <ul className="mt-4 space-y-1">
                {SITE_SECTIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-baseline gap-2 text-sm font-medium transition-colors hover:text-foreground"
                    >
                      <span className="underline decoration-border underline-offset-4 group-hover:decoration-foreground">
                        {item.title}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {item.href}
                      </span>
                    </Link>
                    {item.items ? (
                      <ul className="relative mt-1 ml-[3px] space-y-1 border-l border-border pb-2 pl-4">
                        {item.items.map((child) => (
                          <li
                            key={child.href}
                            className="relative before:absolute before:-left-4 before:top-[0.7em] before:h-px before:w-3 before:bg-border"
                          >
                            <Link
                              href={child.href}
                              className="group inline-flex items-baseline gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <span>{child.title}</span>
                              <span className="font-mono text-[10px] text-muted-foreground/60">
                                {child.href}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="components-heading" className="mt-14">
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id="components-heading"
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Components
                </h2>
                <Link
                  href="/docs/components"
                  className="text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                >
                  Browse all
                </Link>
              </div>

              <div className="mt-4 divide-y divide-border border-t border-border">
                {categories.map((category) => {
                  const items = grouped.get(category) ?? [];
                  return (
                    <details
                      key={category}
                      id={anchorFor(category)}
                      open
                      className="group scroll-mt-24 py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm text-sm [&::-webkit-details-marker]:hidden">
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                        />
                        <span className="font-medium">{category}</span>
                        <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
                          {items.length}
                        </span>
                      </summary>

                      <ul className="relative mt-3 ml-[7px] grid gap-x-8 gap-y-1 border-l border-border pb-2 pl-5 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                          <li
                            key={item.slug}
                            className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-4 before:bg-border"
                          >
                            <Link
                              href={`/docs/components/${item.slug}`}
                              className="group/link block rounded-sm py-1 pr-2 transition-colors hover:text-foreground"
                            >
                              <span className="block truncate text-sm text-foreground/85 group-hover/link:text-foreground">
                                {item.title}
                              </span>
                              <span className="block truncate font-mono text-[10px] leading-4 text-muted-foreground/60">
                                /docs/components/{item.slug}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
