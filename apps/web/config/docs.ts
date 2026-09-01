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

// ─────────────────────────────────────────────────────────────
// DAVINCIUI — Experience-first IA
// Design System is foundation, Experience is product
// Order: Components → Premium → Motion → Scroll → Blocks
// Foundations / Tokens / Theming fall below
// ─────────────────────────────────────────────────────────────

const gettingStarted: NavGroup = {
  title: "🚀 GET STARTED",
  items: [
    { title: "Introduction", href: "/docs" },
    { title: "Installation", href: "/docs/installation" },
    { title: "Quick Start", href: "/docs/quick-start" },
    { title: "Configuration", href: "/docs/configuration" },
  ],
};

const componentsGroup: NavGroup = {
  title: "🧩 COMPONENTS",
  items: [
    {
      title: "Actions",
      href: "/docs/components/actions",
      items: [
        { title: "Button", href: "/docs/components/button" },
        { title: "Button Group", href: "/docs/components/button-group" },
        { title: "Toggle", href: "/docs/components/toggle" },
        { title: "Link", href: "/docs/components/link" },
      ],
    },
    {
      title: "Forms",
      href: "/docs/components/forms",
      items: [
        { title: "Input", href: "/docs/components/input" },
        { title: "Textarea", href: "/docs/components/textarea" },
        { title: "Select", href: "/docs/components/select" },
        { title: "Checkbox", href: "/docs/components/checkbox" },
        { title: "Radio", href: "/docs/components/radio" },
        { title: "Switch", href: "/docs/components/switch" },
        { title: "Form", href: "/docs/components/form" },
      ],
    },
    {
      title: "Feedback",
      href: "/docs/components/feedback",
      items: [
        { title: "Alert", href: "/docs/components/alert" },
        { title: "Toast", href: "/docs/components/toast" },
        { title: "Progress", href: "/docs/components/progress" },
        { title: "Spinner", href: "/docs/components/spinner" },
        { title: "Skeleton", href: "/docs/components/skeleton" },
      ],
    },
    {
      title: "Navigation",
      href: "/docs/components/navigation",
      items: [
        { title: "Tabs", href: "/docs/components/tabs" },
        { title: "Breadcrumb", href: "/docs/components/breadcrumb" },
        { title: "Pagination", href: "/docs/components/pagination" },
        { title: "Sidebar", href: "/docs/components/sidebar" },
        { title: "Navigation Menu", href: "/docs/components/navigation-menu" },
      ],
    },
    {
      title: "Overlays",
      href: "/docs/components/overlays",
      items: [
        { title: "Dialog", href: "/docs/components/dialog" },
        { title: "Drawer", href: "/docs/components/drawer" },
        { title: "Popover", href: "/docs/components/popover" },
        { title: "Tooltip", href: "/docs/components/tooltip" },
        { title: "Dropdown", href: "/docs/components/dropdown" },
      ],
    },
    {
      title: "Data Display",
      href: "/docs/components/data-display",
      items: [
        { title: "Card", href: "/docs/components/card" },
        { title: "Badge", href: "/docs/components/badge" },
        { title: "Avatar", href: "/docs/components/avatar" },
        { title: "Table", href: "/docs/components/table" },
        { title: "Data Table", href: "/docs/components/data-table" },
      ],
    },
    {
      title: "Layout",
      href: "/docs/components/layout",
      items: [
        { title: "Accordion", href: "/docs/components/accordion" },
        { title: "Carousel", href: "/docs/components/carousel" },
        { title: "Collapsible", href: "/docs/components/collapsible" },
        { title: "Scroll Area", href: "/docs/components/scroll-area" },
      ],
    },
    {
      title: "All Components",
      href: "/docs/components",
      items: [],
    },
  ],
};

// PREMIUM now IS the visual library — Text Animations, Components, Hero Backgrounds, Visual Effects, ASCII Effects
// Previously these were duplicated as standalone top-level groups at the bottom; now they live under PREMIUM
const categoryOrder = [
  "Text Animations",
  "Components",
  "Hero Backgrounds",
  "Visual Effects",
  "ASCII Effects",
] as const;

function buildPremiumItems(): NavItem[] {
  return categoryOrder.map((category) => {
    const items = Object.values(components)
      .filter((c) => c.category === category)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((c) => ({ title: c.title, href: `/docs/components/${c.slug}` }));
    // slugify category for group href — keeps deep-linking even though page is the premium section
    const slug = category.toLowerCase().replace(/\s+/g, "-");
    return { title: category, href: `/docs/premium/${slug}`, items };
  });
}

const premium: NavGroup = {
  title: "✨ PREMIUM",
  items: buildPremiumItems(),
};

const motionNav: NavGroup = {
  title: "🌀 MOTION",
  items: [
    { title: "Motion Components", href: "/docs/motion/components" },
    { title: "Hover Effects", href: "/docs/motion/hover" },
    { title: "Cursor Effects", href: "/docs/motion/cursor" },
    { title: "Magnetic Effects", href: "/docs/motion/magnetic" },
    { title: "Text Animations", href: "/docs/motion/text" },
    { title: "Micro Interactions", href: "/docs/motion/micro" },
  ],
};

const scrollNav: NavGroup = {
  title: "🪶 SCROLL",
  items: [
    { title: "Scroll Animations", href: "/docs/scroll/animations" },
    { title: "Scroll Reveals", href: "/docs/scroll/reveals" },
    { title: "Parallax", href: "/docs/scroll/parallax" },
    { title: "Horizontal Scroll", href: "/docs/scroll/horizontal" },
    { title: "Sticky Experiences", href: "/docs/scroll/sticky" },
    { title: "Scroll Transitions", href: "/docs/scroll/transitions" },
  ],
};

const blocks: NavGroup = {
  title: "🧱 BLOCKS",
  items: [
    { title: "Hero", href: "/blocks/hero-section" },
    { title: "Features", href: "/blocks/features" },
    { title: "Testimonials", href: "/blocks/testimonials" },
    { title: "Pricing", href: "/blocks/pricing" },
    { title: "Navigation", href: "/blocks/navigation" },
    { title: "Footer", href: "/blocks/footer" },
    { title: "Complete Sections", href: "/blocks" },
  ],
};

const foundations: NavGroup = {
  title: "🎨 FOUNDATIONS",
  items: [
    { title: "Colors", href: "/docs/foundations/colors" },
    { title: "Typography", href: "/docs/foundations/typography" },
    { title: "Spacing", href: "/docs/foundations/spacing" },
    { title: "Sizing", href: "/docs/foundations/sizing" },
    { title: "Border Radius", href: "/docs/foundations/border-radius" },
    { title: "Shadows", href: "/docs/foundations/shadows" },
    { title: "Borders", href: "/docs/foundations/borders" },
    { title: "Icons", href: "/docs/foundations/icons" },
    { title: "Motion", href: "/docs/foundations/motion" },
    { title: "Breakpoints", href: "/docs/foundations/breakpoints" },
  ],
};

const designTokens: NavGroup = {
  title: "🎛️ TOKENS",
  items: [
    { title: "Overview", href: "/docs/tokens" },
    { title: "Primitive", href: "/docs/tokens/primitive" },
    { title: "Semantic", href: "/docs/tokens/semantic" },
    { title: "Component", href: "/docs/tokens/component" },
    { title: "Custom", href: "/docs/tokens/custom" },
  ],
};

const theming: NavGroup = {
  title: "🌓 THEMING",
  items: [
    { title: "Light", href: "/docs/theming/light" },
    { title: "Dark", href: "/docs/theming/dark" },
    { title: "Custom Themes", href: "/docs/theming/custom" },
    { title: "Overrides", href: "/docs/theming/overrides" },
  ],
};

const primitives: NavGroup = {
  title: "🧱 PRIMITIVES",
  items: [
    { title: "Box", href: "/docs/primitives/box" },
    { title: "Stack", href: "/docs/primitives/stack" },
    { title: "Flex", href: "/docs/primitives/flex" },
    { title: "Grid", href: "/docs/primitives/grid" },
    { title: "Container", href: "/docs/primitives/container" },
  ],
};

const tools: NavGroup = {
  title: "🛠️ TOOLS",
  items: [
    { title: "CLI", href: "/docs/tools/cli" },
    { title: "Registry", href: "/docs/registry/components" },
    { title: "Playground", href: "/docs/resources/playground" },
    { title: "Generators", href: "/docs/tools/generator" },
  ],
};

const resources: NavGroup = {
  title: "📚 RESOURCES",
  items: [
    { title: "Examples", href: "/docs/resources/examples" },
    { title: "Templates", href: "/docs/resources/templates" },
    { title: "Changelog", href: "/docs/resources/changelog" },
    { title: "Roadmap", href: "/docs/resources/roadmap" },
  ],
};

const getLlmsText = () => {
  const baseUrl = "https://davinciui.dev";
  let text = `# DavinciUI

> DavinciUI — Build interfaces that feel alive. Beautiful components, motion, scroll experiences and premium UI — ready to ship. Built with TypeScript, Tailwind CSS, and Framer Motion.

## Philosophy
Foundations explain how DavinciUI is built. Components are what developers use. Premium is what makes DavinciUI special. Motion and Scroll are what make it memorable. Blocks are what make it immediately useful.

## Overview`;

  const allNavGroups: NavGroup[] = [
    gettingStarted,
    componentsGroup,
    premium,
    motionNav,
    scrollNav,
    blocks,
    foundations,
    designTokens,
    theming,
    primitives,
    tools,
    resources,
  ];

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

// Full Experience-first navigation: product surfaces first, foundation last
// Premium now owns the visual library — no duplicate bottom groups
const precomputedNav = Object.freeze([
  gettingStarted,
  componentsGroup,
  premium,
  motionNav,
  scrollNav,
  blocks,
  foundations,
  designTokens,
  theming,
  primitives,
  tools,
  resources,
]);

export const docsConfig = {
  nav: precomputedNav,
  llms: {
    text: getLlmsText(),
  },
} as const;
