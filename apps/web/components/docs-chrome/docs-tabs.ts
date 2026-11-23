export const DOCS_TABS = [
  { id: "documentation", label: "Documentation", href: "/docs" },
  { id: "components", label: "Components", href: "/docs/components" },
] as const

export type DocsTabId = "documentation" | "components" | "guides"

export function getActiveDocsTab(pathname: string): DocsTabId {
  if (pathname.startsWith("/docs/components")) return "components"
  if (pathname.startsWith("/docs/guides")) return "guides"
  return "documentation"
}
