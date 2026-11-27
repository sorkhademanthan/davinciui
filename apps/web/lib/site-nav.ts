export type SiteNavItem = {
  href: string;
  label: string;
};

export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
  { href: "/docs", label: "Docs" },
  { href: "/experience/components", label: "Components" },
  { href: "/design-system", label: "Design System" },
  { href: "/blocks", label: "Blocks" },
  { href: "/docs/mcp", label: "MCP" },
] as const;

export function isSiteNavItemActive(pathname: string, href: string): boolean {
  switch (href) {
    case "/docs":
      return (
        pathname === "/docs" ||
        pathname.startsWith("/docs/installation") ||
        pathname.startsWith("/docs/configuration") ||
        pathname.startsWith("/docs/components-json") ||
        pathname.startsWith("/docs/theming") ||
        pathname.startsWith("/docs/cli") ||
        pathname.startsWith("/docs/monorepo") ||
        pathname.startsWith("/docs/changelog")
      );
    case "/experience/components":
      return (
        pathname.startsWith("/experience") ||
        pathname.startsWith("/blocks") ||
        pathname.startsWith("/docs/components") ||
        pathname.startsWith("/docs/premium") ||
        pathname.startsWith("/docs/motion") ||
        pathname.startsWith("/docs/scroll") ||
        pathname.startsWith("/docs/registry")
      );
    case "/design-system":
      return (
        pathname.startsWith("/design-system") ||
        pathname.startsWith("/docs/foundations") ||
        pathname.startsWith("/docs/tokens") ||
        pathname.startsWith("/docs/theming") ||
        pathname.startsWith("/docs/primitives")
      );
    case "/blocks":
      return (
        pathname.startsWith("/blocks") ||
        pathname.startsWith("/experience/blocks")
      );
    case "/docs/mcp":
      return pathname.startsWith("/docs/mcp");
    default:
      return pathname === href || pathname.startsWith(`${href}/`);
  }
}
