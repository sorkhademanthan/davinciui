import type { DocsContentMap } from "../types";

// Curated customization data for parts that expose stable styling hooks.
// Slugs come from data-slot attributes in the component source. Keep entries
// alphabetical and only list hooks that are actually rendered today.
export const customization = {
  "ambient-strip": {
    customization: {
      note: "Drive layout through cardWidth, gap, and expandScale. Use restColor for the flat surface behind the strip and blur for the ambient backdrop; className handles the host section, including its minimum height.",
    },
  },
  button: {
    customization: {
      note: "Use the variant and size props for the built-in styles, then layer layout or color classes through className. The button renders a single data-slot hook for targeted overrides.",
      cssVars: [
        { name: "--primary", default: "var(--primary)", description: "Background and border of the solid variant." },
        { name: "--primary-foreground", default: "var(--primary-foreground)", description: "Label color on the solid variant." },
        { name: "--radius", default: "var(--radius)", description: "Corner radius inherited from the theme." },
        { name: "--ring", default: "var(--ring)", description: "Color of the visible focus ring." },
      ],
      slots: ['[data-slot="button"]'],
    },
  },
  carousel: {
    customization: {
      note: "Every carousel part renders a data-slot hook, so controls and slides can be restyled without changing the component. Pass Embla options through the opts prop and use className on each part for layout.",
      slots: [
        '[data-slot="carousel"]',
        '[data-slot="carousel-content"]',
        '[data-slot="carousel-item"]',
        '[data-slot="carousel-previous"]',
        '[data-slot="carousel-next"]',
        '[data-slot="carousel-dots"]',
        '[data-slot="carousel-counter"]',
        '[data-slot="carousel-progress"]',
        '[data-slot="carousel-play-button"]',
      ],
    },
  },
  dialog: {
    customization: {
      note: "Each dialog part renders a data-slot hook, so the overlay, positioner, and content can be themed independently. Use the size prop for the built-in content widths and className for one-off layout.",
      cssVars: [
        { name: "--background", default: "var(--background)", description: "Dialog surface background." },
        { name: "--foreground", default: "var(--foreground)", description: "Primary text color inside the dialog." },
        { name: "--border", default: "var(--border)", description: "Border color for the content and footer." },
        { name: "--ring", default: "var(--ring)", description: "Focus ring color for interactive controls." },
      ],
      slots: [
        '[data-slot="dialog"]',
        '[data-slot="dialog-trigger"]',
        '[data-slot="dialog-portal"]',
        '[data-slot="dialog-overlay"]',
        '[data-slot="dialog-positioner"]',
        '[data-slot="dialog-content"]',
        '[data-slot="dialog-close"]',
        '[data-slot="dialog-close-button"]',
        '[data-slot="dialog-header"]',
        '[data-slot="dialog-body"]',
        '[data-slot="dialog-footer"]',
        '[data-slot="dialog-title"]',
        '[data-slot="dialog-description"]',
      ],
    },
  },
  input: {
    customization: {
      note: "Input inherits color, border, and focus styling from the theme tokens. Pass className to adjust layout without overriding the shared field styles.",
      cssVars: [
        { name: "--background", default: "var(--background)", description: "Field background." },
        { name: "--foreground", default: "var(--foreground)", description: "Entered text color." },
        { name: "--border", default: "var(--border)", description: "Field border color." },
        { name: "--ring", default: "var(--ring)", description: "Focus ring color." },
        { name: "--muted-foreground", default: "var(--muted-foreground)", description: "Placeholder text color." },
      ],
    },
  },
  "hover-cards": {
    customization: {
      note: "Set the stage height with className; card heights, gaps, and label offsets scale from the measured stage. Use backdropBlur for the full-bleed image and showText={false} for an image-only strip.",
      slots: ['[data-slot="hover-cards"]'],
    },
  },
  select: {
    customization: {
      note: "Select exposes a data-slot hook for every part, including the positioner, list, items, and scroll buttons. Style those hooks directly or pass className to the part you are composing.",
      slots: [
        '[data-slot="select"]',
        '[data-slot="select-trigger"]',
        '[data-slot="select-value"]',
        '[data-slot="select-content"]',
        '[data-slot="select-positioner"]',
        '[data-slot="select-list"]',
        '[data-slot="select-group"]',
        '[data-slot="select-group-label"]',
        '[data-slot="select-label"]',
        '[data-slot="select-item"]',
        '[data-slot="select-item-text"]',
        '[data-slot="select-item-indicator"]',
        '[data-slot="select-icon"]',
        '[data-slot="select-separator"]',
        '[data-slot="select-scroll-up"]',
        '[data-slot="select-scroll-down"]',
      ],
    },
  },
  tabs: {
    customization: {
      note: "Tabs renders hooks for the root, list, trigger, and content. Restyle those slots globally or pass className to the individual parts.",
      cssVars: [
        { name: "--muted", default: "var(--muted)", description: "Background of the inactive tab list." },
        { name: "--muted-foreground", default: "var(--muted-foreground)", description: "Label color of inactive tabs." },
        { name: "--foreground", default: "var(--foreground)", description: "Label color of the active tab." },
        { name: "--ring", default: "var(--ring)", description: "Focus ring color for tab triggers." },
      ],
      slots: [
        '[data-slot="tabs"]',
        '[data-slot="tabs-list"]',
        '[data-slot="tabs-trigger"]',
        '[data-slot="tabs-content"]',
      ],
    },
  },
  "text-morph": {
    customization: {
      note: "All visual text properties inherit from the surrounding typography. Set size, weight, and tracking with className instead of editing the component. Colors follow the current theme tokens.",
    },
  },
} satisfies DocsContentMap;
