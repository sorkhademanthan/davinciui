import { components } from "@/registry";

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

const componentsNav: NavGroup = {
  title: "Components",
  items: [
    { title: "All Components", href: "/docs/components" },
    // Categories are discoverable on the index page — keeps sidebar clean
  ],
};

const getLlmsText = () => {
  const baseUrl = "https://davinciui.dev";
  let text = `# DavinciUI

> DavinciUI — Beautiful animated components for React. Copy, paste, customize. Tailwind CSS + Framer Motion. Open code.

## Philosophy
Open code you own. Composable APIs. Beautiful defaults. Animations handled.

## Overview`;

  const allNavGroups: NavGroup[] = [gettingStarted, componentsNav];

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
  const categoryOrder = [
    "Text Animations",
    "Premium Components",
    "Hero Backgrounds",
    "Visual Effects",
    "Preloaders",
    "Interactions",
    "Cursor Effects",
  ] as const;
  categoryOrder.forEach((category) => {
    text += `\n\n### ${category}\n\n`;
    const categoryComponents = Object.values(components)
      .filter((c) => c.category === category)
      .sort((a, b) => a.title.localeCompare(b.title));

    categoryComponents.forEach((component) => {
      text += `- [${component.title}](${baseUrl}/docs/components/${component.slug}): ${component.description}\n`;
    });
  });

  return text;
};

const precomputedNav = Object.freeze([gettingStarted, componentsNav]);

export const docsConfig = {
  nav: precomputedNav,
  llms: {
    text: getLlmsText(),
  },
} as const;
