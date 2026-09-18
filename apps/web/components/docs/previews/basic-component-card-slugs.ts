"use client";

/**
 * Slugs covered by BasicComponentCardPreview.
 * Kept in its own tiny module so gallery code can check membership
 * without pulling the (heavy) preview chunk into the main bundle.
 */
export const BASIC_PREVIEW_SLUGS = [
  "button",
  "button-group",
  "toggle",
  "toggle-group",
  "link",
  "input",
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
  "table",
  "data-table",
  "accordion",
  "carousel",
  "collapsible",
  "scroll-area",
] as const;

export type BasicPreviewSlug = (typeof BASIC_PREVIEW_SLUGS)[number];

export function isBasicPreviewSlug(slug: string): slug is BasicPreviewSlug {
  return (BASIC_PREVIEW_SLUGS as readonly string[]).includes(slug);
}
