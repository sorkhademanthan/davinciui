/**
 * Slugs covered by BasicComponentCardPreview.
 * Kept in its own tiny module so gallery code can check membership
 * without pulling the (heavy) preview chunk into the main bundle.
 * Deliberately directive-free (pure data + type guard) so both server
 * components (docs layout, registry manifest, preview contract) and client
 * components can import it.
 */
export const BASIC_PREVIEW_SLUGS = [
  "button",
  "button-group",
  "toggle",
  "toggle-group",
  "link",
  "input",
  "label",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "switch",
  "form",
  "questionnaire",
  "calendar",
  "combobox",
  "date-picker",
  "field",
  "input-group",
  "input-otp",
  "native-select",
  "slider",
  "alert",
  "toast",
  "progress",
  "spinner",
  "skeleton",
  "empty",
  "tabs",
  "breadcrumb",
  "pagination",
  "sidebar",
  "navigation-menu",
  "menubar",
  "dialog",
  "drawer",
  "alert-dialog",
  "aspect-ratio",
  "popover",
  "tooltip",
  "dropdown-menu",
  "context-menu",
  "hover-card",
  "sheet",
  "card",
  "badge",
  "avatar",
  "separator",
  "bubble",
  "attachment",
  "chart",
  "item",
  "message-scroller",
  "message",
  "marker",
  "accordion",
  "carousel",
  "collapsible",
  "scroll-area",
] as const;

export type BasicPreviewSlug = (typeof BASIC_PREVIEW_SLUGS)[number];

/**
 * Basic cards that render a hand-built still instead of mounting the real
 * component. The gallery shell can therefore mark them inert: they have no
 * pointer interaction and must not expose hidden tab stops.
 */
export const STATIC_BASIC_PREVIEW_SLUGS: ReadonlySet<string> = new Set([
  "link",
  "form",
  "questionnaire",
  "calendar",
  "combobox",
  "date-picker",
  "toast",
  "progress",
  "spinner",
  "skeleton",
  "breadcrumb",
  "sidebar",
  "navigation-menu",
  "dialog",
  "alert-dialog",
  "drawer",
  "popover",
  "tooltip",
  "dropdown-menu",
  "context-menu",
  "hover-card",
  "sheet",
  "chart",
  "message-scroller",
  "carousel",
  "scroll-area",
]);

export function isBasicPreviewSlug(slug: string): slug is BasicPreviewSlug {
  return (BASIC_PREVIEW_SLUGS as readonly string[]).includes(slug);
}

export function isStaticBasicPreviewSlug(slug: string): boolean {
  return STATIC_BASIC_PREVIEW_SLUGS.has(slug);
}
