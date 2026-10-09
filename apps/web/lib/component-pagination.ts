import { docsConfig } from "@/config/docs";

export interface PaginationItem {
  href: string;
  title: string;
}

const componentItems: PaginationItem[] = (() => {
  const flat: PaginationItem[] = [];
  const collect = (items: { href: string; title: string; items?: typeof items }[]) => {
    for (const item of items) {
      if (item.href.startsWith("/docs/components/")) {
        flat.push({ href: item.href, title: item.title });
      }
      if (item.items) collect(item.items);
    }
  };
  for (const group of docsConfig.nav) collect(group.items);
  return flat;
})();

/** Previous/next documented component around a slug (server-safe). */
export function resolveComponentPagination(slug: string): {
  previous?: PaginationItem;
  next?: PaginationItem;
} {
  const currentIndex = componentItems.findIndex(
    (item) => item.href === `/docs/components/${slug}`,
  );
  if (currentIndex === -1) return {};
  return {
    previous: componentItems[currentIndex - 1],
    next: componentItems[currentIndex + 1],
  };
}
