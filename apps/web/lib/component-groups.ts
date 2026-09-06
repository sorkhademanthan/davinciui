// Shared grouping for the "Basic" component families.
// Single source of truth for the gallery tabs and detail back-links.
//
// Slugs marked PLANNED do not exist yet — the gallery only renders
// registered components, so they stay invisible until built. When a
// planned component is created, just add its registry entry (with the
// matching category) and lazy importer; the tab picks it up automatically.

const PLANNED_FORMS = [
  "calendar",
  "combobox",
  "date-picker",
  "field",
  "input-group",
  "input-otp",
  "native-select",
  "slider",
];

const PLANNED_OVERLAYS = ["context-menu", "hover-card", "sheet"];

const PLANNED_DATA_DISPLAY = [
  "attachment",
  "bubble",
  "chart",
  "item",
  "marker",
  "message",
  "message-scroller",
  "separator",
];

const PLANNED_FEEDBACK = ["empty"];

const PLANNED_NAVIGATION = ["menubar"];

export const BASIC_GROUPS: Record<string, string[]> = {
  Actions: ["button", "button-group", "toggle", "link"],
  Forms: [
    "input",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "switch",
    "form",
    ...PLANNED_FORMS,
  ],
  Feedback: ["alert", "toast", "progress", "spinner", "skeleton", ...PLANNED_FEEDBACK],
  Navigation: ["tabs", "breadcrumb", "pagination", "sidebar", "navigation-menu", ...PLANNED_NAVIGATION],
  Overlays: ["dialog", "drawer", "popover", "tooltip", "dropdown-menu", ...PLANNED_OVERLAYS],
  "Data Display": ["card", "badge", "avatar", "table", "data-table", ...PLANNED_DATA_DISPLAY],
  Layout: ["accordion", "carousel", "collapsible", "scroll-area"],
};

export const PLANNED_SLUGS: string[] = [
  ...PLANNED_FORMS,
  ...PLANNED_OVERLAYS,
  ...PLANNED_DATA_DISPLAY,
  ...PLANNED_FEEDBACK,
  ...PLANNED_NAVIGATION,
];

export const BASIC_SUBS = [
  "All",
  "Actions",
  "Forms",
  "Feedback",
  "Navigation",
  "Overlays",
  "Data Display",
  "Layout",
] as const;

export type BasicSub = (typeof BASIC_SUBS)[number];

export function basicGroupForSlug(slug: string): string | null {
  for (const [group, slugs] of Object.entries(BASIC_GROUPS)) {
    if (slugs.includes(slug)) return group;
  }
  return null;
}

export interface GalleryTab {
  tab: string;
  sub?: string;
}

/**
 * Resolve the gallery filter that contains a component, so detail pages
 * can link back to the exact filtered view the user came from.
 */
export function galleryTabForSlug(slug: string, category?: string): GalleryTab {
  const group = basicGroupForSlug(slug);
  if (group) return { tab: "Basic", sub: group };
  if (category) return { tab: category };
  return { tab: "All" };
}

export function galleryHrefForSlug(slug: string, category?: string): string {
  const { tab, sub } = galleryTabForSlug(slug, category);
  const params = new URLSearchParams({ tab });
  if (sub) params.set("sub", sub);
  return `/experience/components?${params.toString()}`;
}

export function galleryTabLabel(tab: string, sub?: string): string {
  if (tab === "Basic") return sub && sub !== "All" ? `Basic › ${sub}` : "Basic";
  return tab;
}
