import { components, sortByFeatured } from "@/registry";

type NavItem = {
  title: string;
  href: string;
  items?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// DavinciUI docs — minimal, shadcn-inspired IA
// Basics first: Introduction → Installation → config → Theming → CLI → Changelog
// Dark mode lives inside Theming. Components at /docs/components + /docs/components/[slug]

const gettingStarted: NavGroup = {
  title: "Getting Started",
  items: [
    { title: "Introduction", href: "/docs" },
    { title: "Installation", href: "/docs/installation" },
    { title: "Configuration", href: "/docs/configuration" },
    { title: "Theming", href: "/docs/theming" },
    { title: "CLI", href: "/docs/cli" },
    { title: "Changelog", href: "/docs/changelog" },
  ],
};

const componentsIndex: NavGroup = {
  title: "Components",
  items: [
    { title: "All Components", href: "/docs/components" },
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
  "Motion",
] as const;

/** Every registry category, preferred order first, extras alphabetically. */
export function docsComponentCategories(): string[] {
  const present = new Set(Object.values(components).map((c) => c.category));
  return [
    ...PREFERRED_CATEGORY_ORDER.filter((c) => present.has(c)),
    ...[...present]
      .filter((c) => !(PREFERRED_CATEGORY_ORDER as readonly string[]).includes(c))
      .sort((a, b) => a.localeCompare(b)),
  ];
}

function componentCategoryGroups(): NavGroup[] {
  return docsComponentCategories().flatMap((category) => {
    const items = sortByFeatured(
      Object.values(components).filter((c) => c.category === category),
    ).map((c) => ({ title: c.title, href: `/docs/components/${c.slug}` }));
    return items.length > 0 ? [{ title: category, items } satisfies NavGroup] : [];
  });
}

const navGroups: NavGroup[] = [gettingStarted, componentsIndex, ...componentCategoryGroups()];

const getLlmsText = () => {
  const baseUrl = "https://davinciui.com";
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
      Object.values(components).filter((c) => c.category === category),
    );

    categoryComponents.forEach((component) => {
      text += `- [${component.title}](${baseUrl}/docs/components/${component.slug}): ${component.description}\n`;
    });
  });

  return text;
};

const precomputedNav = Object.freeze(navGroups);

export const docsConfig = {
  nav: precomputedNav,
  llms: {
    text: getLlmsText(),
  },
} as const;
