export type DocsHeading = {
  title: string
  href: string
  page: string
}

/** Curated local index of section headings used by the ⌘K "Headings" group. */
export const docsHeadings: DocsHeading[] = [
  { title: "Before you begin", href: "/docs/quickstart#before-you-begin", page: "Quickstart" },
  { title: "Add the registry", href: "/docs/quickstart#add-the-registry", page: "Quickstart" },
  { title: "Add a component", href: "/docs/quickstart#add-a-component", page: "Quickstart" },
  { title: "Where to go next", href: "/docs/quickstart#where-to-go-next", page: "Quickstart" },
  { title: "How the token switch works", href: "/docs/dark-mode#how-the-token-switch-works", page: "Dark mode" },
  { title: "Add a theme provider", href: "/docs/dark-mode#add-a-theme-provider", page: "Dark mode" },
  { title: "Add a toggle", href: "/docs/dark-mode#add-a-toggle", page: "Dark mode" },
  { title: "Tune the palette", href: "/docs/dark-mode#tune-the-palette", page: "Dark mode" },
  { title: "A controlled field", href: "/docs/guides/forms#a-controlled-field", page: "Forms" },
  { title: "Validation states", href: "/docs/guides/forms#validation-states", page: "Forms" },
  { title: "Animated feedback", href: "/docs/guides/forms#animated-feedback", page: "Forms" },
  { title: "Keyboard support", href: "/docs/guides/accessibility#keyboard-support", page: "Accessibility" },
  { title: "Reduced motion", href: "/docs/guides/accessibility#reduced-motion", page: "Accessibility" },
  { title: "Labels and contrast", href: "/docs/guides/accessibility#labels-and-contrast", page: "Accessibility" },
  { title: "Configure the CLI", href: "/docs/guides/nextjs#configure-the-cli", page: "Next.js" },
  { title: "Server and client boundaries", href: "/docs/guides/nextjs#server-and-client-boundaries", page: "Next.js" },
  { title: "Motion and hydration", href: "/docs/guides/nextjs#motion-and-hydration", page: "Next.js" },
  { title: "Path aliases", href: "/docs/guides/vite#path-aliases", page: "Vite" },
  { title: "Client-only motion", href: "/docs/guides/vite#client-only-motion", page: "Vite" },
  { title: "Configure aliases", href: "/docs/guides/remix#configure-aliases", page: "Remix" },
  { title: "Client boundaries", href: "/docs/guides/remix#client-boundaries", page: "Remix" },
  { title: "Before you start", href: "/docs/guides/migrating#before-you-start", page: "Migrating" },
  { title: "Steps", href: "/docs/guides/migrating#steps", page: "Migrating" },
  { title: "Import mapping", href: "/docs/guides/migrating#import-mapping", page: "Migrating" },
  { title: "Keep your overrides", href: "/docs/guides/migrating#keep-your-overrides", page: "Migrating" },
  { title: "Repository map", href: "/docs/guides/contributing#repository-map", page: "Contributing" },
  { title: "Commit style", href: "/docs/guides/contributing#commit-style", page: "Contributing" },
]
