export type ComponentCategory =
  | "Text Animations"
  | "Premium Components"
  | "Hero Backgrounds"
  | "Sound"
  | "Visual Effects"
  | "Preloaders"
  | "Interactions"
  | "Cursor Effects"
  | "Actions"
  | "Forms"
  | "Feedback"
  | "Navigation"
  | "Overlays"
  | "Data Display"
  | "Layout"
  | "Motion";

export interface ComponentMetadata {
  title: string;
  description: string;
  category: ComponentCategory;
  slug: string;
  addedAt?: string;
  previewVideo?: string;
  previewImage?: string;
}

const NEW_BADGE_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export function isNewComponent(component: ComponentMetadata): boolean {
  if (!component.addedAt) return false;
  const addedTime = new Date(component.addedAt).getTime();
  return Date.now() - addedTime < NEW_BADGE_DURATION_MS;
}

export const components: Record<string, ComponentMetadata> = {
  "circle-cursor": {
    title: "Circle Cursor",
    description:
      "A single solid orange follower circle with smooth inertia, viewport-wide tracking, and automatic touch-device disablement.",
    category: "Cursor Effects",
    slug: "circle-cursor",
    addedAt: "2026-09-20",
  },
  "chromatic-cursor": {
    title: "Chromatic Cursor",
    description:
      "A smooth RGB canvas cursor with glowing, independently customizable color trails.",
    category: "Cursor Effects",
    slug: "chromatic-cursor",
    addedAt: "2026-09-19",
  },
  "magic-cursor-pro": {
    title: "Magic Cursor Pro",
    description:
      "A spring-driven outlined cursor with tactile click feedback, blend-mode contrast, and automatic touch-device disablement.",
    category: "Cursor Effects",
    slug: "magic-cursor-pro",
    addedAt: "2026-09-19",
  },
  "electric-vijdi-cursor": {
    title: "Electric Vijdi Cursor",
    description:
      "A white-hot violet lightning cursor that crackles through recent pointer movement and decays without blocking interaction.",
    category: "Cursor Effects",
    slug: "electric-vijdi-cursor",
    addedAt: "2026-09-19",
  },
  "elastic-blob-cursor": {
    title: "Elastic Blob Cursor",
    description:
      "A soft white blob that chases the pointer with inertia, stretches along the direction of travel, and relaxes back into a circle.",
    category: "Cursor Effects",
    slug: "elastic-blob-cursor",
    addedAt: "2026-09-21",
  },
  "fluid-cursor": {
    title: "Fluid Cursor",
    description:
      "A fullscreen GPU fluid simulation where pointer movement injects velocity and spectral dye into liquid light that drifts, curls, and fades into black.",
    category: "Cursor Effects",
    slug: "fluid-cursor",
    addedAt: "2026-09-21",
  },
  "tubes-cursor": {
    title: "Tubes Cursor",
    description:
      "A bundle of glowing 3D neon tubes that chases the pointer with fluid inertia and soft bloom. Click to randomize the palette.",
    category: "Cursor Effects",
    slug: "tubes-cursor",
    addedAt: "2026-09-20",
  },
  "geometric-trail-cursor": {
    title: "Geometric Trail Cursor",
    description:
      "A procedural wireframe cursor history on pure black — pointer movement extrudes twisting chains of outlined polygons, bright at the head and preserved as a long-lived dark geometric skeleton.",
    category: "Cursor Effects",
    slug: "geometric-trail-cursor",
    addedAt: "2026-09-21",
  },
  "hover-transition": {
    title: "Hover Transition",
    description:
      "Eight polished hover transitions with per-card animation, direction, color, and content controls.",
    category: "Premium Components",
    slug: "hover-transition",
    addedAt: "2026-08-08",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/hovertransition.webm",
  },
  "fluid-particle-text": {
    title: "Particle Flow",
    description:
      "Interactive particle typography sampled from rasterized text — solid at rest, liquid around your cursor.",
    category: "Text Animations",
    slug: "fluid-particle-text",
    addedAt: "2026-09-10",
  },
  "text-morph": {
    title: "Text Morph",
    description:
      "Centered fluid text transitions that inherit the surrounding typography and theme.",
    category: "Text Animations",
    slug: "text-morph",
    addedAt: "2026-08-02",
  },
  "encrypted-text": {
    title: "Encrypted Text",
    description:
      "A continuously scrambling cipher that decrypts from left to right into a readable message.",
    category: "Text Animations",
    slug: "encrypted-text",
    addedAt: "2026-09-11",
  },
  "gsap-text": {
    title: "Type Cascade",
    description:
      "A cinematic kinetic typography component that creates a layered 3D depth effect using continuous vertical text motion.",
    category: "Text Animations",
    slug: "gsap-text",
    addedAt: "2026-09-03",
  },
  "glitch-liquid-text": {
    title: "Chromatic Melt",
    description:
      "GPU-rendered interactive typography on a liquid membrane — cursor-driven fluid distortion with chromatic glitch edges, light rays, and a magnetic custom cursor.",
    category: "Text Animations",
    slug: "glitch-liquid-text",
    addedAt: "2026-09-10",
  },
  "media-text-hover": {
    title: "Hover Media",
    description:
      "A split branding headline that opens an image or video window with a responsive spring hover interaction.",
    category: "Text Animations",
    slug: "media-text-hover",
    addedAt: "2026-09-13",
  },
  "shader-text": {
    title: "Shader Text",
    description:
      "WebGL fragment shaders clipped inside text glyphs via a dynamic SVG mask — twelve animated presets with fluid gradient and noise typography.",
    category: "Text Animations",
    slug: "shader-text",
    addedAt: "2026-09-11",
  },
  "text-video-mask": {
    title: "Text Video Mask",
    description:
      "Large typography where playing video shows only inside the glyphs — one continuous footage surface revealed through the type.",
    category: "Text Animations",
    slug: "text-video-mask",
    addedAt: "2026-09-11",
  },
  "random-text-reveal": {
    title: "Random Text Reveal",
    description:
      "Per-character text reveal in shuffled order on scroll — faint glyphs resolve randomly into solid type.",
    category: "Text Animations",
    slug: "random-text-reveal",
    addedAt: "2026-09-11",
  },
  "text-reveal": {
    title: "Text Reveal",
    description:
      "Scroll-scrubbed text reveals with spatial ordering, soft transitions, and character or word splitting.",
    category: "Text Animations",
    slug: "text-reveal",
    addedAt: "2026-09-12",
  },
  button: {
    title: "Button",
    description:
      "Versatile buttons with variants, sizes, loading states, and as-child link rendering.",
    category: "Actions",
    slug: "button",
    addedAt: "2026-09-04",
  },
  "button-group": {
    title: "Button Group",
    description:
      "Joined button segments sharing borders for toolbars and split actions.",
    category: "Actions",
    slug: "button-group",
    addedAt: "2026-09-04",
  },
  toggle: {
    title: "Toggle",
    description:
      "Two-state pill buttons with pressed styling and size variants.",
    category: "Actions",
    slug: "toggle",
    addedAt: "2026-09-04",
  },
  link: {
    title: "Link",
    description:
      "Typographic links with variants, underline treatments, and icon support.",
    category: "Actions",
    slug: "link",
    addedAt: "2026-09-04",
  },
  input: {
    title: "Input",
    description:
      "Text inputs with variants, invalid states, icons, and full RTL support.",
    category: "Forms",
    slug: "input",
    addedAt: "2026-09-04",
  },
  textarea: {
    title: "Textarea",
    description:
      "Multiline text inputs with auto sizing, invalid states, and RTL support.",
    category: "Forms",
    slug: "textarea",
    addedAt: "2026-09-04",
  },
  select: {
    title: "Select",
    description:
      "Custom dropdown selects with search, grouping, and keyboard navigation.",
    category: "Forms",
    slug: "select",
    addedAt: "2026-09-04",
  },
  checkbox: {
    title: "Checkbox",
    description:
      "Checkboxes with indeterminate state, descriptions, and invalid styling.",
    category: "Forms",
    slug: "checkbox",
    addedAt: "2026-09-04",
  },
  radio: {
    title: "Radio",
    description:
      "Radio options with grouped layouts, descriptions, and invalid styling.",
    category: "Forms",
    slug: "radio",
    addedAt: "2026-09-04",
  },
  switch: {
    title: "Switch",
    description: "Toggle switches with sizes, labels, and smooth thumb motion.",
    category: "Forms",
    slug: "switch",
    addedAt: "2026-09-04",
  },
  form: {
    title: "Form",
    description:
      "Validated forms with field wiring, error display, and submit handling.",
    category: "Forms",
    slug: "form",
    addedAt: "2026-09-04",
  },
  alert: {
    title: "Alert",
    description:
      "Callouts with five unmistakable tones, icon tiles, and action slots.",
    category: "Feedback",
    slug: "alert",
    addedAt: "2026-09-04",
  },
  toast: {
    title: "Toast",
    description:
      "Stacked notifications with variants, actions, and auto-dismiss.",
    category: "Feedback",
    slug: "toast",
    addedAt: "2026-09-04",
  },
  progress: {
    title: "Progress",
    description:
      "Determinate and indeterminate progress bars with sizes and tones.",
    category: "Feedback",
    slug: "progress",
    addedAt: "2026-09-04",
  },
  spinner: {
    title: "Spinner",
    description: "Loading spinners in five sizes with label support.",
    category: "Feedback",
    slug: "spinner",
    addedAt: "2026-09-04",
  },
  "wave-bars-loader": {
    title: "Wave Bars Loader",
    description:
      "A deterministic 4-bar traveling-wave loader with mint bars morphing through descending, flat, and ascending states.",
    category: "Motion",
    slug: "wave-bars-loader",
    addedAt: "2026-09-23",
  },
  skeleton: {
    title: "Skeleton",
    description: "Content placeholders with shimmer and configurable shapes.",
    category: "Feedback",
    slug: "skeleton",
    addedAt: "2026-09-04",
  },
  tabs: {
    title: "Tabs",
    description:
      "Tabbed interfaces with animated indicators and keyboard navigation.",
    category: "Navigation",
    slug: "tabs",
    addedAt: "2026-09-04",
  },
  breadcrumb: {
    title: "Breadcrumb",
    description:
      "Trail hierarchies with auto separators and self-collapsing overflow.",
    category: "Navigation",
    slug: "breadcrumb",
    addedAt: "2026-09-04",
  },
  pagination: {
    title: "Pagination",
    description:
      "Page navigation with ranges, ellipsis, and boundary controls.",
    category: "Navigation",
    slug: "pagination",
    addedAt: "2026-09-04",
  },
  sidebar: {
    title: "Sidebar",
    description:
      "App sidebars with collapsible sections, nesting, and mobile drawers.",
    category: "Navigation",
    slug: "sidebar",
    addedAt: "2026-09-04",
  },
  "navigation-menu": {
    title: "Navigation Menu",
    description: "A collection of links for navigating websites.",
    category: "Navigation",
    slug: "navigation-menu",
    addedAt: "2026-09-04",
  },
  "motion-hamburger": {
    title: "Motion Hamburger",
    description:
      "A premium animated hamburger toggle that morphs into a close icon with SVG path-drawing, elastic rotation, and an optional ring.",
    category: "Motion",
    slug: "motion-hamburger",
    addedAt: "2026-09-21",
  },
  "radial-fan-deck": {
    title: "Radial Fan Deck",
    description:
      "An editorial card deck that unfolds from a shared hinge into a full radial fan before folding back into a centered stack.",
    category: "Motion",
    slug: "radial-fan-deck",
    addedAt: "2026-09-22",
  },
  dialog: {
    title: "Dialog",
    description:
      "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
    category: "Overlays",
    slug: "dialog",
    addedAt: "2026-09-04",
  },
  drawer: {
    title: "Drawer",
    description: "A drawer component for React. Built on top of Vaul.",
    category: "Overlays",
    slug: "drawer",
    addedAt: "2026-09-04",
  },
  popover: {
    title: "Popover",
    description: "Displays rich content in a portal, triggered by a button.",
    category: "Overlays",
    slug: "popover",
    addedAt: "2026-09-04",
  },
  tooltip: {
    title: "Tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    category: "Overlays",
    slug: "tooltip",
    addedAt: "2026-09-04",
  },
  "dropdown-menu": {
    title: "Dropdown Menu",
    description:
      "Displays a menu to the user - such as a set of actions or functions - triggered by a button.",
    category: "Overlays",
    slug: "dropdown-menu",
    addedAt: "2026-09-04",
  },
  card: {
    title: "Card",
    description: "Displays a card with header, content, and footer.",
    category: "Data Display",
    slug: "card",
    addedAt: "2026-09-04",
  },
  badge: {
    title: "Badge",
    description:
      "Pills with nine tones, three sizes, status dots, and removable chips.",
    category: "Data Display",
    slug: "badge",
    addedAt: "2026-09-04",
  },
  avatar: {
    title: "Avatar",
    description:
      "Identity circles with sizes, presence badges, generative fallbacks, and auto-collapsing groups.",
    category: "Data Display",
    slug: "avatar",
    addedAt: "2026-09-04",
  },
  accordion: {
    title: "Accordion",
    description:
      "Keyboard-navigable disclosure stacks with animated panels and card layouts.",
    category: "Layout",
    slug: "accordion",
    addedAt: "2026-09-04",
  },
  carousel: {
    title: "Carousel",
    description: "A carousel with motion and swipe built using Embla.",
    category: "Layout",
    slug: "carousel",
    addedAt: "2026-09-04",
  },
  collapsible: {
    title: "Collapsible",
    description: "An interactive component which expands/collapses a panel.",
    category: "Layout",
    slug: "collapsible",
    addedAt: "2026-09-04",
  },
  "scroll-area": {
    title: "Scroll Area",
    description:
      "Augments native scroll functionality for custom, cross-browser styling.",
    category: "Layout",
    slug: "scroll-area",
    addedAt: "2026-09-04",
  },
  "shake-text": {
    title: "Shake Text",
    description:
      "A premium 3D layered text effect with four colored depth copies that move continuously behind a stable foreground.",
    category: "Text Animations",
    slug: "shake-text",
    addedAt: "2026-09-04",
  },
  "rolling-text": {
    title: "Rolling Text",
    description:
      "Mechanical slot-machine typography — every character is an independent clipped column rolling a vertical stack of its own glyphs into place.",
    category: "Text Animations",
    slug: "rolling-text",
    addedAt: "2026-09-12",
  },
  calendar: {
    title: "Calendar",
    description:
      "A dependency-free date picker with single and range selection, Jalali and Hijri calendar systems, time selects, presets, booked dates, week numbers, and full RTL support.",
    category: "Forms",
    slug: "calendar",
    addedAt: "2026-09-04",
  },
  combobox: {
    title: "Combobox",
    description:
      "An autocomplete dropdown with single and multiple selection, chips, grouped collections, custom rows, keyboard navigation, and RTL — dependency-free.",
    category: "Forms",
    slug: "combobox",
    addedAt: "2026-09-04",
  },
  "date-picker": {
    title: "Date Picker",
    description:
      "An input-anchored single-date picker with presets, time selects, booked dates, popup placement, and RTL — built on Calendar, dependency-free.",
    category: "Forms",
    slug: "date-picker",
    addedAt: "2026-09-04",
  },
  field: {
    title: "Field",
    description:
      "Compound form primitives — labels, descriptions, errors, groups, and layouts that compose around any control with shared ids and invalid state.",
    category: "Forms",
    slug: "field",
    addedAt: "2026-09-04",
  },
  "input-group": {
    title: "Input Group",
    description:
      "Compound field with dockable addons — icons, text, buttons, and hints arranged inline or stacked around an input or textarea.",
    category: "Forms",
    slug: "input-group",
    addedAt: "2026-09-04",
  },
  "input-otp": {
    title: "Input OTP",
    description:
      "One-time code input with per-digit slots, paste-to-fill, patterns, separators, completion callback, and RTL.",
    category: "Forms",
    slug: "input-otp",
    addedAt: "2026-09-04",
  },
  "native-select": {
    title: "Native Select",
    description:
      "A styled native select with grouped options, invalid and disabled states, and RTL — the OS picker on mobile, zero JavaScript.",
    category: "Forms",
    slug: "native-select",
    addedAt: "2026-09-04",
  },
  slider: {
    title: "Slider",
    description:
      "Pointer and keyboard multi-thumb slider with range fill, vertical layout, controlled values, and RTL mirroring.",
    category: "Forms",
    slug: "slider",
    addedAt: "2026-09-04",
  },
  "context-menu": {
    title: "Context Menu",
    description:
      "A cursor-anchored right-click menu with type-ahead, submenus, checkable states, and viewport-aware flipping. Opens on right-click, Ctrl+click, long-press, or Shift+F10.",
    category: "Overlays",
    slug: "context-menu",
    addedAt: "2026-09-04",
  },
  "hover-card": {
    title: "Hover Card",
    description:
      "A hover preview panel with intent delays, four sides, alignment control, keyboard support, and RTL.",
    category: "Overlays",
    slug: "hover-card",
    addedAt: "2026-09-04",
  },
  sheet: {
    title: "Sheet",
    description:
      "A modal side panel docked to any edge with directional motion, header/footer primitives, and RTL.",
    category: "Overlays",
    slug: "sheet",
    addedAt: "2026-09-04",
  },
  // Components
  "fisheye-infinite-grid": {
    title: "Fisheye Infinite Grid",
    description:
      "A dense draggable image wall warped as one continuous fisheye surface with weighted momentum.",
    category: "Premium Components",
    slug: "fisheye-infinite-grid",
    addedAt: "2026-08-08",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/fisheyeinfinitegrid.webm",
  },
  "cms-scroll-gallery": {
    title: "CMS Scroll Gallery",
    description:
      "Sticky fullscreen scroll gallery — long page scroll drives synchronized media + title transitions with a draggable glass thumbnail dock.",
    category: "Premium Components",
    slug: "cms-scroll-gallery",
    addedAt: "2026-09-15",
  },
  "interactive-media-accordion": {
    title: "Interactive Media Accordion",
    description:
      "Sticky scroll-driven media accordion — each scroll band expands the next card while the rest collapse into pills.",
    category: "Premium Components",
    slug: "interactive-media-accordion",
    addedAt: "2026-09-15",
  },
  "scroll-reveal-image": {
    title: "Scroll Reveal Image",
    description:
      "A scroll-scrubbed image sequence where each new frame arrives in a centered window before taking over the backdrop.",
    category: "Premium Components",
    slug: "scroll-reveal-image",
    addedAt: "2026-09-15",
  },
  "stacked-scroll-gallery": {
    title: "Stacked Scroll Gallery",
    description:
      "Pinned layered media stack — the next panel rises from below and physically covers the current one, driven directly by scroll.",
    category: "Premium Components",
    slug: "stacked-scroll-gallery",
    addedAt: "2026-09-15",
  },
  "scroll-sync-gallery": {
    title: "Scroll Sync Gallery",
    description:
      "Full-width pinned image wall — vertical columns travel at different speeds and alternating directions, all driven by one scroll progress.",
    category: "Premium Components",
    slug: "scroll-sync-gallery",
    addedAt: "2026-09-16",
  },
  "horizontal-scroll-gallery": {
    title: "Horizontal Scroll Gallery",
    description:
      "Pinned variable-width film strip — vertical page scroll drives a continuous horizontal image track with no snapping or controls.",
    category: "Premium Components",
    slug: "horizontal-scroll-gallery",
    addedAt: "2026-09-16",
  },
  "scroll-media-expand": {
    title: "Scroll Media Expand",
    description:
      "A cinematic scroll zoom reveal that expands a compact media capsule into a fullscreen scene while surrounding text fades away.",
    category: "Premium Components",
    slug: "scroll-media-expand",
    addedAt: "2026-09-16",
  },
  "scroll-blur-overlay": {
    title: "Scroll Blur Overlay",
    description:
      "A scroll-reactive frosted-glass sheet — real backdrop blur driven continuously by scroll position, with an extendAbove mode that diffuses the outgoing section.",
    category: "Premium Components",
    slug: "scroll-blur-overlay",
    addedAt: "2026-09-17",
  },
  "scroll-timeline": {
    title: "Scroll Timeline",
    description:
      "Pinned fullscreen year timeline — vertical scroll collapses each panel horizontally via clip-path while the oversized year rotates around its bottom-left anchor, exposing the next era underneath.",
    category: "Premium Components",
    slug: "scroll-timeline",
    addedAt: "2026-09-17",
  },
  "spiral-3d-slider": {
    title: "Spiral 3D Slider",
    description:
      "A compact, autoplaying image gallery that responds to scroll along a smooth 3D spiral.",
    category: "Premium Components",
    slug: "spiral-3d-slider",
    addedAt: "2026-08-08",
    previewVideo: "/preview-videos/component-animations/spiral3dslider.webm",
    previewImage: "/images/spiral-3d-slider/catalog-preview.jpg",
  },
  // Hero Backgrounds
  "silk-aurora": {
    title: "Silk Aurora",
    description:
      "Premium WebGL hero background with satin-dark aurora ribbons, pearlescent highlights, fine grain, and cursor depth.",
    category: "Hero Backgrounds",
    slug: "silk-aurora",
    addedAt: "2026-06-09",
  },
  "ink-flow": {
    title: "Ink Flow",
    description:
      "Slow native WebGL pigment flow inspired by fountain-pen ink dispersing through warm watercolor paper.",
    category: "Hero Backgrounds",
    slug: "ink-flow",
    addedAt: "2026-09-13",
  },
  "soft-fluid-gradient": {
    title: "Soft Fluid Gradient",
    description:
      "A deep, hypnotic native WebGL background with an enormous looping ribbon of dark color and fluid illumination.",
    category: "Hero Backgrounds",
    slug: "soft-fluid-gradient",
    addedAt: "2026-09-14",
  },
  "neon-mesh-bg": {
    title: "Neon Mesh BG",
    description:
      "A dark cinematic WebGL background with an evolving purple neon mesh, fine pixel matrix, and soft atmospheric bloom.",
    category: "Hero Backgrounds",
    slug: "neon-mesh-bg",
    addedAt: "2026-09-15",
  },
  "spectra-noise": {
    title: "Spectra Noise",
    description:
      "Luminous aurora folds with soft teal halos, pale green edges, fine grain, and moving scanlines.",
    category: "Hero Backgrounds",
    slug: "spectra-noise",
    addedAt: "2026-09-14",
  },
  noiser: {
    title: "Noiser",
    description:
      "A crisp procedural SVG noise overlay with Gaussian, uniform, and colorized grain for hero backgrounds.",
    category: "Hero Backgrounds",
    slug: "noiser",
    addedAt: "2026-09-14",
  },
  "sunlight-effect": {
    title: "Sunlight Effect",
    description:
      "Animated multi-color rays radiating from a bright central glow, with adjustable density, reach, bloom, and motion.",
    category: "Hero Backgrounds",
    slug: "sunlight-effect",
    addedAt: "2026-09-15",
  },
  "ambient-audio-toggle": {
    title: "Ambient Audio Toggle",
    description:
      "A visitor-controlled background music toggle with an animated waveform, persistent playback, and accessible keyboard controls.",
    category: "Sound",
    slug: "ambient-audio-toggle",
    addedAt: "2026-09-15",
  },
  "liquid-chrome": {
    title: "Liquid Chrome",
    description: "Premium fluid liquid metal shader background effect.",
    category: "Hero Backgrounds",
    slug: "liquid-chrome",
    addedAt: "2026-06-24",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/liquidchrome.webm",
  },
  // Preloaders
  "fill-preloader": {
    title: "Fill Preloader",
    description:
      "A fullscreen bottom-up blue fill loader with a giant bottom-right percentage counter and a vertical slide-away reveal.",
    category: "Preloaders",
    slug: "fill-preloader",
    addedAt: "2026-09-18",
  },
  "staircase-preloader": {
    title: "Staircase Preloader",
    description:
      "A fullscreen orange stepped-curtain loader that exits upward with a left-to-right staircase edge and a top-right finish.",
    category: "Preloaders",
    slug: "staircase-preloader",
    addedAt: "2026-09-18",
  },
  "pixel-preloader": {
    title: "Pixel Preloader",
    description:
      "A fullscreen pixel-grid loader that takes over the viewport bottom-up behind a jagged orange frontier, with a top-left percentage HUD and a clean fade reveal.",
    category: "Preloaders",
    slug: "pixel-preloader",
    addedAt: "2026-09-18",
  },
  "editorial-wipe-preloader": {
    title: "Editorial Wipe Preloader",
    description:
      "A fullscreen forest-to-cream horizontal wipe with a giant split-tone counter and a vertical slide-away reveal.",
    category: "Preloaders",
    slug: "editorial-wipe-preloader",
    addedAt: "2026-09-18",
  },
  "geometric-preloader": {
    title: "Geometric Preloader",
    description:
      "A fullscreen geometric loader with nested rotating squares and a diamond-scale reveal.",
    category: "Preloaders",
    slug: "geometric-preloader",
    addedAt: "2026-09-18",
  },
  "preloader-pro": {
    title: "Preloader Pro",
    description:
      "A cinematic two-stage loader: heavy percentage with a thin red line on white, then a sliding panel reveal into a dark PRELOADER PRO hero.",
    category: "Preloaders",
    slug: "preloader-pro",
    addedAt: "2026-09-19",
  },
  // Visual Effects
  "pixel-canvas": {
    title: "Pixel Canvas",
    description: "Canvas where pixels react to interaction.",
    category: "Visual Effects",
    slug: "pixel-canvas",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/pixelcanvas.webm",
  },
  "pixel-wipe-carousel": {
    title: "Pixel Wipe Carousel",
    description:
      "An editorial image carousel with fast right-to-left mosaic wipes that resolve into crisp stills.",
    category: "Visual Effects",
    slug: "pixel-wipe-carousel",
    addedAt: "2026-09-22",
  },
  "segmented-image-carousel": {
    title: "Segmented Image Carousel",
    description:
      "A monochrome editorial carousel that rebuilds every image through a staggered grid of horizontal slices.",
    category: "Visual Effects",
    slug: "segmented-image-carousel",
    addedAt: "2026-09-22",
  },
  "cinematic-card-carousel": {
    title: "Cinematic Card Carousel",
    description:
      "A cinematic depth-based card gallery — one sharp hero portrait with progressively blurred, compressed neighbors and pointer-driven spring promotion.",
    category: "Visual Effects",
    slug: "cinematic-card-carousel",
    addedAt: "2026-09-22",
  },
  "vertical-image-marquee": {
    title: "Vertical Image Marquee",
    description:
      "A seamless vertical editorial image strip with generous monochrome gutters and a theme-aware light or dark stage.",
    category: "Visual Effects",
    slug: "vertical-image-marquee",
    addedAt: "2026-09-23",
  },
  "hover-cards": {
    title: "Hover Cards",
    description:
      "An editorial portrait row that expands the active card over a blurred, full-bleed image backdrop.",
    category: "Visual Effects",
    slug: "hover-cards",
    addedAt: "2026-09-23",
  },
  "profile-carousel": {
    title: "Profile Carousel",
    description:
      "An editorial team carousel with full portrait cards, one traveling profile detail card, edge clipping, and seamless looping.",
    category: "Visual Effects",
    slug: "profile-carousel",
    addedAt: "2026-09-23",
  },
  "services-showcase": {
    title: "Services Showcase",
    description:
      "A dark editorial services section with layered image stacks, scroll-driven parallax, restrained hover spread, and container-query sizing for card, panel, and fullscreen previews.",
    category: "Visual Effects",
    slug: "services-showcase",
    addedAt: "2026-09-23",
  },
  "glass-scene-dock": {
    title: "Glass Scene Dock",
    description:
      "A floating glass navigation dock pinned over scroll-driven photographic scenes — a travelling glass highlight glides between icons while scrolling crossfades the cinematic backdrop.",
    category: "Interactions",
    slug: "glass-scene-dock",
    addedAt: "2026-09-24",
  },
  "liquid-reveal-button": {
    title: "Liquid Reveal Button",
    description:
      "A substantial acid-yellow pill CTA with a pointer-driven black liquid reveal — the mask originates at the real cursor position, expands to full cover with spatially-masked two-tone text, then retracts toward the exit point.",
    category: "Interactions",
    slug: "liquid-reveal-button",
    addedAt: "2026-09-24",
  },
  "animated-metric": {
    title: "Animated Metric",
    description:
      "An editorial count-up statistic — the number eases to its exact final figure on viewport entry, with a subtle rise-and-fade entrance and a screen-reader-friendly final value.",
    category: "Motion",
    slug: "animated-metric",
    addedAt: "2026-09-24",
  },
  "nudge-button": {
    title: "Nudge Button",
    description:
      "A white pill CTA with a directional nudge interaction — concentric blue, red, and yellow rings burst from the pointer entry point before a white reveal pushes them out through the clipped edges.",
    category: "Interactions",
    slug: "nudge-button",
    addedAt: "2026-09-24",
  },
  "animated-pill-button": {
    title: "Animated Pill Button",
    description:
      "A black pill CTA with a directional liquid wipe — cyan bursts from the right-side dot with a curved leading edge while the dot morphs into an arrow circle and the label flips contrast inside the same mask.",
    category: "Interactions",
    slug: "animated-pill-button",
    addedAt: "2026-09-24",
  },
  "matrix-rain": {
    title: "Matrix Rain",
    description: "Classic Matrix digital rain effect.",
    category: "Visual Effects",
    slug: "matrix-rain",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/matrixrain.webm",
  },
  "character-field": {
    title: "Character Field",
    description:
      "A dense ambient surface of monospace glyphs that mutate independently on canvas.",
    category: "Hero Backgrounds",
    slug: "character-field",
    addedAt: "2026-09-14",
  },
  "pixel-flow": {
    title: "Pixel Flow",
    description:
      "Flowing violet light rendered through a fine, animated dithered pixel field.",
    category: "Hero Backgrounds",
    slug: "pixel-flow",
    addedAt: "2026-09-14",
  },
  questionnaire: {
    title: "Questionnaire",
    description:
      "A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions.",
    category: "Forms",
    slug: "questionnaire",
    addedAt: "2026-09-07",
  },
  separator: {
    title: "Separator",
    description:
      "A visual divider between sections — horizontal by default, vertical inside row layouts.",
    category: "Data Display",
    slug: "separator",
    addedAt: "2026-09-07",
  },
  bubble: {
    title: "Bubble",
    description:
      "Conversational message bubbles with variants, alignment, grouping, and edge-anchored reactions.",
    category: "Data Display",
    slug: "bubble",
    addedAt: "2026-09-07",
  },
  "toggle-group": {
    title: "Toggle Group",
    description:
      "A set of two-state buttons for single or multiple selection with full keyboard support.",
    category: "Actions",
    slug: "toggle-group",
    addedAt: "2026-09-07",
  },
  attachment: {
    title: "Attachment",
    description:
      "File and image attachments with media, metadata, upload states, actions, and triggers.",
    category: "Data Display",
    slug: "attachment",
    addedAt: "2026-09-07",
  },
  chart: {
    title: "Chart",
    description:
      "Beautiful charts built on Recharts v3 with config-driven theming, tooltips, and legends.",
    category: "Data Display",
    slug: "chart",
    addedAt: "2026-09-07",
  },
  item: {
    title: "Item",
    description:
      "Versatile rows with media, title, description, and actions — groupable into lists.",
    category: "Data Display",
    slug: "item",
    addedAt: "2026-09-07",
  },
  "message-scroller": {
    title: "Message Scroller",
    description:
      "Chat scroll container with turn anchoring, live-edge follow, history preservation, and jumps.",
    category: "Data Display",
    slug: "message-scroller",
    addedAt: "2026-09-07",
  },
  empty: {
    title: "Empty",
    description:
      "Empty states with media, title, description, and actions for lists, search, and errors.",
    category: "Feedback",
    slug: "empty",
    addedAt: "2026-09-07",
  },
  menubar: {
    title: "Menubar",
    description:
      "Horizontal bar of dropdown menus with checkbox, radio, submenu, and shortcut support.",
    category: "Navigation",
    slug: "menubar",
    addedAt: "2026-09-07",
  },
  message: {
    title: "Message",
    description:
      "Conversation rows with avatar, alignment, header, and footer around any message surface.",
    category: "Data Display",
    slug: "message",
    addedAt: "2026-09-07",
  },
  marker: {
    title: "Marker",
    description:
      "Inline status, system notes, bordered rows, and labeled separators for conversations.",
    category: "Data Display",
    slug: "marker",
    addedAt: "2026-09-07",
  },
};

export function getComponent(slug: string) {
  return components[slug];
}
