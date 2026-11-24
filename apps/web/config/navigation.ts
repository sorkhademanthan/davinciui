import { components, sortByFeatured, type ComponentCategory } from "@/registry"

// ─────────────────────────────────────────────────────────────
// Phase 1: Data-driven IA — DESIGN SYSTEM vs EXPERIENCE
// Preserves all existing content, only reorganizes navigation
// Existing /docs routes remain via redirects (next.config.mjs)
// ─────────────────────────────────────────────────────────────

export type NavItem = {
  title: string
  href: string
  items?: NavItem[]
  badge?: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export type TopLevelArea = {
  label: string
  href: string
  description: string
  sections: NavSection[]
}

// ─────────────── DESIGN SYSTEM — "How we design" ───────────────
const designSystemGettingStartedSection: NavSection = {
  title: "Getting Started",
  items: [
    { title: "Introduction", href: "/docs" },
    { title: "Installation", href: "/docs/installation" },
    { title: "Configuration", href: "/docs/configuration" },
    { title: "Theming", href: "/docs/theming" },
    { title: "CLI", href: "/docs/cli" },
    { title: "Monorepo", href: "/docs/monorepo" },
    { title: "Changelog", href: "/docs/changelog" },
  ],
}

const foundationsSection: NavSection = {
  title: "Foundations",
  items: [
    { title: "Overview", href: "/design-system/foundations" },
    { title: "Colors", href: "/design-system/foundations/colors" },
    { title: "Typography", href: "/design-system/foundations/typography" },
    { title: "Spacing", href: "/design-system/foundations/spacing" },
    { title: "Sizing", href: "/design-system/foundations/sizing" },
    { title: "Borders", href: "/design-system/foundations/borders" },
    { title: "Border Radius", href: "/design-system/foundations/border-radius" },
    { title: "Shadows", href: "/design-system/foundations/shadows" },
    { title: "Icons", href: "/design-system/foundations/icons" },
    { title: "Motion", href: "/design-system/foundations/motion" },
    { title: "Breakpoints", href: "/design-system/foundations/breakpoints" },
  ],
}

const tokensSection: NavSection = {
  title: "Tokens",
  items: [
    { title: "Overview", href: "/design-system/tokens" },
    { title: "Primitive", href: "/design-system/tokens/primitive" },
    { title: "Semantic", href: "/design-system/tokens/semantic" },
    { title: "Component", href: "/design-system/tokens/component" },
    { title: "Custom", href: "/design-system/tokens/custom" },
  ],
}

const themesSection: NavSection = {
  title: "Themes",
  items: [
    { title: "Light", href: "/design-system/themes/light" },
    { title: "Dark", href: "/design-system/themes/dark" },
    { title: "Custom Themes", href: "/design-system/themes/custom" },
    { title: "Overrides", href: "/design-system/themes/overrides" },
  ],
}

const primitivesSection: NavSection = {
  title: "Primitives",
  items: [
    { title: "Box", href: "/design-system/primitives/box" },
    { title: "Stack", href: "/design-system/primitives/stack" },
    { title: "Flex", href: "/design-system/primitives/flex" },
    { title: "Grid", href: "/design-system/primitives/grid" },
    { title: "Container", href: "/design-system/primitives/container" },
  ],
}

const accessibilitySection: NavSection = {
  title: "Accessibility",
  items: [
    { title: "Overview", href: "/design-system/accessibility" },
    { title: "Color Contrast", href: "/design-system/accessibility/contrast" },
    { title: "Keyboard", href: "/design-system/accessibility/keyboard" },
    { title: "Focus", href: "/design-system/accessibility/focus" },
  ],
}

const motionPrinciplesSection: NavSection = {
  title: "Motion Principles",
  items: [
    { title: "Principles", href: "/design-system/motion" },
    { title: "Duration", href: "/design-system/motion/duration" },
    { title: "Easing", href: "/design-system/motion/easing" },
  ],
}

// ─────────────── EXPERIENCE — "What we build" ───────────────

const experienceGettingStartedSection: NavSection = {
  title: "Getting Started",
  items: [
    { title: "Introduction", href: "/docs" },
    { title: "Installation", href: "/docs/installation" },
    { title: "Configuration", href: "/docs/configuration" },
    { title: "Theming", href: "/docs/theming" },
    { title: "CLI", href: "/docs/cli" },
    { title: "Monorepo", href: "/docs/monorepo" },
    { title: "Changelog", href: "/docs/changelog" },
  ],
}

// Reuse existing Components IA but scoped under /experience
const experienceComponentsSection: NavSection = {
  title: "Basic",
  items: [
    {
      title: "Actions",
      href: "/experience/components/actions",
      items: [
        { title: "Button", href: "/experience/components/button" },
        { title: "Button Group", href: "/experience/components/button-group" },
        { title: "Toggle", href: "/experience/components/toggle" },
        { title: "Toggle Group", href: "/experience/components/toggle-group" },
        { title: "Link", href: "/experience/components/link" },
      ],
    },
    {
      title: "Forms",
      href: "/experience/components/forms",
      items: [
        { title: "Calendar", href: "/experience/components/calendar" },
        { title: "Combobox", href: "/experience/components/combobox" },
        { title: "Date Picker", href: "/experience/components/date-picker" },
        { title: "Field", href: "/experience/components/field" },
        { title: "Input Group", href: "/experience/components/input-group" },
        { title: "Input OTP", href: "/experience/components/input-otp" },
        { title: "Native Select", href: "/experience/components/native-select" },
        { title: "Slider", href: "/experience/components/slider" },
        { title: "Input", href: "/experience/components/input" },
        { title: "Textarea", href: "/experience/components/textarea" },
        { title: "Select", href: "/experience/components/select" },
        { title: "Checkbox", href: "/experience/components/checkbox" },
        { title: "Radio", href: "/experience/components/radio" },
        { title: "Switch", href: "/experience/components/switch" },
        { title: "Form", href: "/experience/components/form" },
        { title: "Questionnaire", href: "/experience/components/questionnaire" },
      ],
    },
    {
      title: "Feedback",
      href: "/experience/components/feedback",
      items: [
        { title: "Alert", href: "/experience/components/alert" },
        { title: "Toast", href: "/experience/components/toast" },
        { title: "Progress", href: "/experience/components/progress" },
        { title: "Spinner", href: "/experience/components/spinner" },
        { title: "Skeleton", href: "/experience/components/skeleton" },
        { title: "Empty", href: "/experience/components/empty" },
      ],
    },
    {
      title: "Navigation",
      href: "/experience/components/navigation",
      items: [
        { title: "Tabs", href: "/experience/components/tabs" },
        { title: "Breadcrumb", href: "/experience/components/breadcrumb" },
        { title: "Pagination", href: "/experience/components/pagination" },
        { title: "Sidebar", href: "/experience/components/sidebar" },
        { title: "Navigation Menu", href: "/experience/components/navigation-menu" },
        { title: "Menubar", href: "/experience/components/menubar" },
      ],
    },
    {
      title: "Overlays",
      href: "/experience/components/overlays",
      items: [
        { title: "Context Menu", href: "/experience/components/context-menu" },
        { title: "Hover Card", href: "/experience/components/hover-card" },
        { title: "Sheet", href: "/experience/components/sheet" },
        { title: "Dialog", href: "/experience/components/dialog" },
        { title: "Drawer", href: "/experience/components/drawer" },
        { title: "Popover", href: "/experience/components/popover" },
        { title: "Tooltip", href: "/experience/components/tooltip" },
        { title: "Dropdown Menu", href: "/experience/components/dropdown-menu" },
      ],
    },
    {
      title: "Data Display",
      href: "/experience/components/data-display",
      items: [
        { title: "Card", href: "/experience/components/card" },
        { title: "Badge", href: "/experience/components/badge" },
        { title: "Avatar", href: "/experience/components/avatar" },
        { title: "Separator", href: "/experience/components/separator" },
        { title: "Bubble", href: "/experience/components/bubble" },
        { title: "Attachment", href: "/experience/components/attachment" },
        { title: "Chart", href: "/experience/components/chart" },
        { title: "Item", href: "/experience/components/item" },
        { title: "Message Scroller", href: "/experience/components/message-scroller" },
        { title: "Message", href: "/experience/components/message" },
        { title: "Marker", href: "/experience/components/marker" },
      ],
    },
    {
      title: "Layout",
      href: "/experience/components/layout",
      items: [
        { title: "Accordion", href: "/experience/components/accordion" },
        { title: "Carousel", href: "/experience/components/carousel" },
        { title: "Collapsible", href: "/experience/components/collapsible" },
        { title: "Scroll Area", href: "/experience/components/scroll-area" },
      ],
    },
    { title: "All Components", href: "/experience/components" },
  ],
}

const categoryOrder = ["Text Animations", "Premium Components", "Hero Backgrounds", "Visual Effects", "Preloaders", "Interactions", "Cursor Effects"] as const

function buildPremiumSections(): NavSection[] {
  return categoryOrder.map((category) => {
    const items = sortByFeatured(
      Object.values(components).filter((c) => c.category === category || c.extraCategories?.includes(category as ComponentCategory)),
    ).map((c) => ({ title: c.title, href: `/experience/components/${c.slug}` }))
    return { title: category, items }
  })
}

const premiumSections: NavSection[] = buildPremiumSections()

const scrollSection: NavSection = {
  title: "Scroll",
  items: [
    { title: "Overview", href: "/experience/components?tab=Scroll" },
    { title: "Scroll Sync Gallery", href: "/experience/components/scroll-sync-gallery" },
    { title: "Interactive Media Accordion", href: "/experience/components/interactive-media-accordion" },
    { title: "Scroll Animations", href: "/experience/scroll/animations" },
  ],
}

const blocksSection: NavSection = {
  title: "Blocks",
  items: [
    { title: "Overview", href: "/experience/blocks" },
  ],
}

const templatesSection: NavSection = {
  title: "Templates",
  items: [
    { title: "Overview", href: "/experience/templates" },
  ],
}

// ─────────────── Top-level navigation ───────────────
export const navigation = {
  designSystem: {
    label: "Design System",
    href: "/design-system",
    description: "How we design — foundations, tokens, themes",
    sections: [designSystemGettingStartedSection, foundationsSection, tokensSection, themesSection, primitivesSection, accessibilitySection, motionPrinciplesSection],
  } satisfies TopLevelArea,
  experience: {
    label: "Components",
    href: "/experience",
    description: "Components, motion, blocks — what we build",
    sections: [experienceGettingStartedSection, experienceComponentsSection, ...premiumSections, scrollSection, blocksSection, templatesSection],
  } satisfies TopLevelArea,
} as const

// Navbar helper — primary areas
export const primaryNav = [
  { label: "Docs", href: "/docs" },
  { label: "Components", href: "/experience/components" },
  { label: "Design System", href: "/design-system" },
] as const

export function isDesignSystemPath(pathname: string) {
  return pathname.startsWith("/design-system")
}

export function isExperiencePath(pathname: string) {
  return pathname.startsWith("/experience") || pathname.startsWith("/blocks") || pathname.startsWith("/docs/components") || pathname.startsWith("/docs/premium") || pathname.startsWith("/docs/motion") || pathname.startsWith("/docs/scroll")
}
