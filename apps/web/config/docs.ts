import { components, sortByFeatured, type ComponentCategory } from "@/registry";
import { isHiddenComponentSlug } from "@/lib/hidden-components";

type NavItem = {
  title: string;
  href: string;
  items?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// DavinciUI docs IA mirrors shadcn/ui:
// Sections (Introduction → Components → Installation → … → Changelog),
// then Components grouped by category, then Foundations.
// Dark mode lives inside Theming. Components at /docs/components + /docs/components/[slug]

const sections: NavGroup = {
  title: "Getting started",
  items: [
    { title: "Introduction", href: "/docs" },
    { title: "Components", href: "/docs/components" },
    { title: "Installation", href: "/docs/installation" },
    { title: "Quickstart", href: "/docs/quickstart" },
    { title: "Configuration", href: "/docs/configuration" },
    { title: "Theming", href: "/docs/theming" },
    { title: "Dark mode", href: "/docs/dark-mode" },
    { title: "CLI", href: "/docs/cli" },
    { title: "Typeset", href: "/docs/typeset" },
    { title: "Skills", href: "/docs/skills" },
    { title: "Registry", href: "/docs/registry" },
    { title: "Changelog", href: "/docs/changelog" },
  ],
};

// Preferred sidebar/index order; registry categories outside this list
// follow alphabetically so every component is reachable, never hidden.
const PREFERRED_CATEGORY_ORDER = [
  "Text Animations",
  "Premium Components",
  "Hero Backgrounds",
  "Visual Effects",
  "Preloaders",
  "Interactions",
  "Cursor Effects",
] as const;

/** Every registry category, preferred order first, extras alphabetically. */
export function docsComponentCategories(): string[] {
  const present = new Set(
    Object.values(components)
      .filter((c) => !isHiddenComponentSlug(c.slug))
      .flatMap((c) => [c.category, ...(c.extraCategories ?? [])]),
  );
  return [
    ...PREFERRED_CATEGORY_ORDER.filter((c) => present.has(c)),
    ...[...present]
      .filter((c) => !(PREFERRED_CATEGORY_ORDER as readonly string[]).includes(c))
      .sort((a, b) => a.localeCompare(b)),
  ];
}

function componentCategoryGroups(): NavGroup[] {
  const items = docsComponentCategories().flatMap((category) => {
    const links = sortByFeatured(
      Object.values(components).filter(
        (c) =>
          !isHiddenComponentSlug(c.slug) &&
          (c.category === category || c.extraCategories?.includes(category as ComponentCategory)),
      ),
    ).map((c) => ({ title: c.title, href: `/experience/components/${c.slug}` }));
    const anchor = `/docs/components#${category.toLowerCase().replace(/\s+/g, "-")}`;
    return links.length > 0 ? [{ title: category, href: anchor, items: links } satisfies NavItem] : [];
  });
  return items.length > 0 ? [{ title: "Components", items } satisfies NavGroup] : [];
}

const foundations: NavGroup = {
  title: "Foundations",
  items: [
    { title: "Colors", href: "/docs/foundations/colors" },
    { title: "Typography", href: "/docs/foundations/typography" },
    { title: "Spacing", href: "/docs/foundations/spacing" },
    { title: "Sizing", href: "/docs/foundations/sizing" },
    { title: "Borders", href: "/docs/foundations/borders" },
    { title: "Border Radius", href: "/docs/foundations/border-radius" },
    { title: "Shadows", href: "/docs/foundations/shadows" },
    { title: "Breakpoints", href: "/docs/foundations/breakpoints" },
    { title: "Icons", href: "/docs/foundations/icons" },
  ],
};

const guides: NavGroup = {
  title: "Guides",
  items: [
    { title: "Next.js", href: "/docs/guides/nextjs" },
    { title: "Vite", href: "/docs/guides/vite" },
    { title: "Remix", href: "/docs/guides/remix" },
    { title: "Forms", href: "/docs/guides/forms" },
    { title: "Accessibility", href: "/docs/guides/accessibility" },
    { title: "Migrating", href: "/docs/guides/migrating" },
    { title: "Contributing", href: "/docs/guides/contributing" },
  ],
};

const mcp: NavGroup = {
  title: "MCP",
  items: [{ title: "Setup", href: "/docs/mcp" }],
};

export type DocsTabId = "documentation" | "components" | "guides";
export type DocsNavGroup = NavGroup;

/** Sidebar tree for each top-level docs tab. */
export function getDocsNavForTab(tab: DocsTabId): NavGroup[] {
  if (tab === "components") return componentCategoryGroups();
  if (tab === "guides") return [guides];
  return [sections, foundations, mcp];
}

const navGroups: NavGroup[] = [
  sections,
  ...componentCategoryGroups(),
  foundations,
  guides,
  mcp,
];

export function getLlmsText(): string {
  const baseUrl = "https://www.davinciui.com";
  let text = `# DavinciUI

> DavinciUI — Beautiful animated components for React. Copy, paste, customize. Tailwind CSS + Framer Motion. Open code.

## Philosophy
Open code you own. Composable APIs. Beautiful defaults. Animations handled.

## Overview`;

  const allNavGroups: NavGroup[] = navGroups;

  allNavGroups.forEach((group) => {
    text += `\n\n## ${group.title}\n`;
    group.items.forEach((item) => {
      if (item.items?.length) {
        text += `\n### ${item.title}\n`;
        item.items.forEach((sub) => {
          text += `- [${sub.title}](${baseUrl}${sub.href})\n`;
        });
      } else {
        text += `- [${item.title}](${baseUrl}${item.href})\n`;
      }
    });
  });

  text += `\n\n## Registry Components\n`;
  docsComponentCategories().forEach((category) => {
    text += `\n\n### ${category}\n\n`;
    const categoryComponents = sortByFeatured(
      Object.values(components).filter((c) => c.category === category || c.extraCategories?.includes(category as ComponentCategory)),
    );

    categoryComponents.forEach((component) => {
      text += `- [${component.title}](${baseUrl}/docs/components/${component.slug}): ${component.description}\n`;
    });
  });

  return text;
}

const precomputedNav = Object.freeze(navGroups);

export const docsConfig = {
  nav: precomputedNav,
  llms: {
    text: getLlmsText(),
  },
} as const;
