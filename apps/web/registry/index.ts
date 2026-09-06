export type ComponentCategory =
  | "Text Animations"
  | "Premium Components"
  | "Hero Backgrounds"
  | "Visual Effects"
  | "ASCII Effects"
  | "Actions"
  | "Forms"
  | "Feedback"
  | "Navigation"
  | "Overlays"
  | "Data Display"
  | "Layout";

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
  "case-study-flip-stack": {
    title: "Case Study Flip Stack",
    description:
      "Editorial case study cards that fold upward on scroll to reveal the next story.",
    category: "Premium Components",
    slug: "case-study-flip-stack",
    addedAt: "2026-08-08",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/casestudyflipstack.webm",
  },
  "dithered-logo": {
    title: "Dithered Logo",
    description:
      "An interactive particle logo that turns image assets into a dithered canvas field with cursor ripples.",
    category: "Visual Effects",
    slug: "dithered-logo",
    addedAt: "2026-07-08",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/ditheredlogo.webm",
  },
  "sticky-scroll-cards": {
    title: "Sticky Scroll Cards",
    description:
      "A scroll-driven card stack where images pin and scale as you scroll, creating a layered depth effect.",
    category: "Premium Components",
    slug: "sticky-scroll-cards",
    addedAt: "2026-04-10",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/stickyscrollcards.webm",
  },
  "music-player": {
    title: "Music Player",
    description:
      "A fun interactive vinyl record music player with swinging tonearm.",
    category: "Premium Components",
    slug: "music-player",
    addedAt: "2026-04-03",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/musicplayer.webm",
  },
  "scroll-split-card": {
    title: "Scroll Split Card",
    description:
      "A scroll-driven interactive card that splits into three panels and flips.",
    category: "Premium Components",
    slug: "scroll-split-card",
    addedAt: "2026-04-03",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/scrollsplitcard.webm",
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
  "mac-keyboard": {
    title: "Mac Keyboard",
    description:
      "A realistic Mac keyboard component with interactive keys and detailed styling.",
    category: "Premium Components",
    slug: "mac-keyboard",
    addedAt: "2026-03-13",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/mackeyboard.webm",
  },
  "scroll-based-velocity": {
    title: "Velocity Scroll",
    description: "Text that moves horizontally based on scroll speed.",
    category: "Text Animations",
    slug: "scroll-based-velocity",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/text-animations/scrollvelocity.webm",
  },
  "letter-cascade": {
    title: "Letter Cascade",
    description:
      "Kinetic text animation where letters scatter outward with spring physics and blur, then elegantly reassemble.",
    category: "Text Animations",
    slug: "letter-cascade",
    addedAt: "2026-02-28",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/text-animations/lettercascade.webm",
  },
  "text-repel": {
    title: "Text Repel",
    description:
      "Physics-based text where each letter reacts to cursor proximity with spring dynamics, creating an interactive magnetic force-field effect.",
    category: "Text Animations",
    slug: "text-repel",
    addedAt: "2026-02-28",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/text-animations/textrepel.webm",
  },
  "text-morph": {
    title: "Text Morph",
    description:
      "Centered fluid text transitions that inherit the surrounding typography and theme.",
    category: "Text Animations",
    slug: "text-morph",
    addedAt: "2026-08-02",
  },
  "flipping-word-swap": {
    title: "Flipping Word Swap",
    description:
      "A clean character-by-character flip between two words on interaction.",
    category: "Text Animations",
    slug: "flipping-word-swap",
    addedAt: "2026-08-04",
  },
  "kinetic-text-reveal": {
    title: "Kinetic Text Reveal",
    description:
      "Directional text reveal with soft blur and configurable word, character, or line stagger timing.",
    category: "Text Animations",
    slug: "kinetic-text-reveal",
    addedAt: "2026-06-07",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/text-animations/kinetictextreveal.webm",
  },
  "kinetic-text": {
    title: "Kinetic Text",
    description: "A compact kinetic typography composition where overlapping text clones move continuously around a stable central anchor, creating a layered slicing effect.",
    category: "Text Animations",
    slug: "kinetic-text",
    addedAt: "2026-09-03",
  },
  "gsap-text": {
    title: "GSAP Text",
    description:
      "A cinematic kinetic typography component that creates a layered 3D depth effect using continuous vertical text motion.",
    category: "Text Animations",
    slug: "gsap-text",
    addedAt: "2026-09-03",
  },
  "button": {
    title: "Button",
    description:
      "Button component",
    category: "Actions",
    slug: "button",
    addedAt: "2026-09-04",
  },
  "button-group": {
    title: "Button Group",
    description:
      "Button group component",
    category: "Actions",
    slug: "button-group",
    addedAt: "2026-09-04",
  },
  "toggle": {
    title: "Toggle",
    description:
      "Toggle component",
    category: "Actions",
    slug: "toggle",
    addedAt: "2026-09-04",
  },
  "link": {
    title: "Link",
    description:
      "Link component",
    category: "Actions",
    slug: "link",
    addedAt: "2026-09-04",
  },
  "input": {
    title: "Input",
    description:
      "input component",
    category: "Forms",
    slug: "input",
    addedAt: "2026-09-04",
  },
  "textarea": {
    title: "Textarea",
    description:
      "Textarea component",
    category: "Forms",
    slug: "textarea",
    addedAt: "2026-09-04",
  },
  "select": {
    title: "Select",
    description:
      "Select component",
    category: "Forms",
    slug: "select",
    addedAt: "2026-09-04",
  },
  "checkbox": {
    title: "Checkbox",
    description:
      "Checkbox component",
    category: "Forms",
    slug: "checkbox",
    addedAt: "2026-09-04",
  },
  "radio": {
    title: "Radio",
    description:
      "Radio component",
    category: "Forms",
    slug: "radio",
    addedAt: "2026-09-04",
  },
  "switch": {
    title: "Switch",
    description:
      "Switch component",
    category: "Forms",
    slug: "switch",
    addedAt: "2026-09-04",
  },
  "form": {
    title: "Form",
    description:
      "Form component",
    category: "Forms",
    slug: "form",
    addedAt: "2026-09-04",
  },
  "alert": {
    title: "Alert",
    description:
      "Alert component",
    category: "Feedback",
    slug: "alert",
    addedAt: "2026-09-04",
  },
  "toast": {
    title: "Toast",
    description:
      "Toast component",
    category: "Feedback",
    slug: "toast",
    addedAt: "2026-09-04",
  },
  "progress": {
    title: "Progress",
    description:
      "Progress component",
    category: "Feedback",
    slug: "progress",
    addedAt: "2026-09-04",
  },
  "spinner": {
    title: "Spinner",
    description:
      "Spinner component",
    category: "Feedback",
    slug: "spinner",
    addedAt: "2026-09-04",
  },
  "skeleton": {
    title: "Skeleton",
    description:
      "Skeleton component",
    category: "Feedback",
    slug: "skeleton",
    addedAt: "2026-09-04",
  },
  "tabs": {
    title: "Tabs",
    description:
      "Tabs component",
    category: "Navigation",
    slug: "tabs",
    addedAt: "2026-09-04",
  },
  "breadcrumb": {
    title: "Breadcrumb",
    description:
      "Breadcrumb component",
    category: "Navigation",
    slug: "breadcrumb",
    addedAt: "2026-09-04",
  },
  "pagination": {
    title: "Pagination",
    description:
      "Pagination component",
    category: "Navigation",
    slug: "pagination",
    addedAt: "2026-09-04",
  },
  "sidebar": {
    title: "Sidebar",
    description:
      "Sidebar component",
    category: "Navigation",
    slug: "sidebar",
    addedAt: "2026-09-04",
  },
  "navigation-menu": {
    title: "Navigation Menu",
    description:
      "A collection of links for navigating websites.",
    category: "Navigation",
    slug: "navigation-menu",
    addedAt: "2026-09-04",
  },
  "dialog": {
    title: "Dialog",
    description:
      "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.",
    category: "Overlays",
    slug: "dialog",
    addedAt: "2026-09-04",
  },
  "drawer": {
    title: "Drawer",
    description:
      "A drawer component for React. Built on top of Vaul.",
    category: "Overlays",
    slug: "drawer",
    addedAt: "2026-09-04",
  },
  "popover": {
    title: "Popover",
    description:
      "Displays rich content in a portal, triggered by a button.",
    category: "Overlays",
    slug: "popover",
    addedAt: "2026-09-04",
  },
  "tooltip": {
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
  "card": {
    title: "Card",
    description:
      "Displays a card with header, content, and footer.",
    category: "Data Display",
    slug: "card",
    addedAt: "2026-09-04",
  },
  "badge": {
    title: "Badge",
    description:
      "badge component",
    category: "Data Display",
    slug: "badge",
    addedAt: "2026-09-04",
  },
  "avatar": {
    title: "Avatar",
    description:
      "Avatar component",
    category: "Data Display",
    slug: "avatar",
    addedAt: "2026-09-04",
  },
  "accordion": {
    title: "Accordion",
    description:
      "Accordion component",
    category: "Layout",
    slug: "accordion",
    addedAt: "2026-09-04",
  },
  "carousel": {
    title: "Carousel",
    description:
      "A carousel with motion and swipe built using Embla.",
    category: "Layout",
    slug: "carousel",
    addedAt: "2026-09-04",
  },
  "collapsible": {
    title: "Collapsible",
    description:
      "An interactive component which expands/collapses a panel.",
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
      "A premium 3D layered text effect with a physical GSAP shake — five depth-stacked copies with dimensional black edges that jitter as one locked object.",
    category: "Text Animations",
    slug: "shake-text",
    addedAt: "2026-09-04",
  },
  "calendar": {
    title: "Calendar",
    description:
      "A dependency-free date picker with single and range selection, Jalali and Hijri calendar systems, time selects, presets, booked dates, week numbers, and full RTL support.",
    category: "Forms",
    slug: "calendar",
    addedAt: "2026-09-04",
  },
  "combobox": {
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
  "field": {
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
  "slider": {
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
      "A right-click menu with submenus, shortcuts, checkbox and radio states, destructive actions, viewport flipping, and RTL.",
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
  "sheet": {
    title: "Sheet",
    description:
      "A modal side panel docked to any edge with directional motion, header/footer primitives, and RTL.",
    category: "Overlays",
    slug: "sheet",
    addedAt: "2026-09-04",
  },
  "cursor-driven-particle-typography": {
    title: "Particle Typography",
    description:
      "Renders dynamic typography constructed entirely from particles that elegantly disperse and reassemble upon cursor interaction using spring physics.",
    category: "Text Animations",
    slug: "cursor-driven-particle-typography",
    addedAt: "2026-03-01",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/text-animations/cursordrivenparticletypography.webm",
  },
  // Components
  "circuit-board": {
    title: "Circuit Board",
    description:
      "Animated circuit board visualization with nodes and connections.",
    category: "Premium Components",
    slug: "circuit-board",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/circuitboard.webm",
  },
  "flight-status-card": {
    title: "Flight Status Card",
    description: "A detailed card showing flight information with animations.",
    category: "Premium Components",
    slug: "flight-status-card",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/flightstatuscard.webm",
  },
  "magnetic-dock": {
    title: "Magnetic Dock",
    description: "MacOS style dock that scales items based on mouse proximity.",
    category: "Premium Components",
    slug: "magnetic-dock",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/magneticdock.webm",
  },
  "collection-surfer": {
    title: "Collection Surfer",
    description: "Smooth surfing interaction for browsing collections.",
    category: "Premium Components",
    slug: "collection-surfer",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/collectionsurfer.webm",
  },
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
  "github-calendar": {
    title: "Github Calendar",
    description: "GitHub-style contribution calendar heatmap.",
    category: "Premium Components",
    slug: "github-calendar",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/githubcalendar.webm",
  },
  "scroll-choreography": {
    title: "Scroll Choreography",
    description:
      "A smooth, scroll-driven image choreography component using Framer Motion.",
    category: "Premium Components",
    slug: "scroll-choreography",
    addedAt: "2026-02-28",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/scrollchoreography.webm",
  },
  "scroll-tilted-grid": {
    title: "Scroll Tilted Grid",
    description:
      "A cinematic image grid that tilts and resolves into focus as each frame crosses the viewport.",
    category: "Premium Components",
    slug: "scroll-tilted-grid",
    addedAt: "2026-07-17",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/scrolltiltedgrid.webm",
  },
  "layered-stack": {
    title: "Layered Stack",
    description: "A stack of layered cards that interact with mouse hover.",
    category: "Premium Components",
    slug: "layered-stack",
    addedAt: "2026-03-15",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/layeredstack.webm",
  },
  "orbit-card-stack": {
    title: "Orbit Card Stack",
    description:
      "Premium hover card deck that fans outward and lifts the active card without changing its color or angle.",
    category: "Premium Components",
    slug: "orbit-card-stack",
    addedAt: "2026-06-07",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/orbitcardstack.webm",
  },
  "wheel-carousel": {
    title: "Wheel Carousel",
    description:
      "A cinematic rotating-wheel picker with inertial drag, curved fading labels, and crossfading project imagery.",
    category: "Premium Components",
    slug: "wheel-carousel",
    addedAt: "2026-08-10",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/wheelcarousel.webm",
  },
  "spiral-3d-slider": {
    title: "Spiral 3D Slider",
    description:
      "A compact, autoplaying image gallery that responds to scroll along a smooth 3D spiral.",
    category: "Premium Components",
    slug: "spiral-3d-slider",
    addedAt: "2026-08-08",
    previewVideo:
      "/preview-videos/component-animations/spiral3dslider.webm",
    previewImage: "/images/spiral-3d-slider/catalog-preview.jpg",
  },
  "newsletter-bookshelf": {
    title: "Newsletter Bookshelf",
    description:
      "A tactile 3D newsletter archive with hover lift, camera browsing, centered covers, and automatic drag-adjustable orbiting.",
    category: "Premium Components",
    slug: "newsletter-bookshelf",
    addedAt: "2026-08-06",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/newsletterbookshelf.webm",
  },

  "split-flap-display": {
    title: "Split Flap Display",
    description:
      "A premium split-flap display component inspired by vintage departure boards.",
    category: "Premium Components",
    slug: "split-flap-display",
    addedAt: "2026-03-27",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/splitflapdisplay.webm",
  },
  "eye-tracking": {
    title: "Eye Tracking",
    description:
      "Hyper-realistic eyes that follow your cursor with smooth spring physics, reactive pupils, blinking, and multiple stunning variants.",
    category: "Premium Components",
    slug: "eye-tracking",
    addedAt: "2026-03-28",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/eyetracking.webm",
  },
  // Hero Backgrounds
  "hero-geometric": {
    title: "Hero Geometric",
    description: "Geometric shapes and patterns for hero sections.",
    category: "Hero Backgrounds",
    slug: "hero-geometric",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/herogeometric.webm",
  },
  "dither-prism-hero": {
    title: "Dither Prism Hero",
    description:
      "Stunning WebGL hero with advanced dithering, prismatic refraction, holographic iridescence, and center-focused energy.",
    category: "Hero Backgrounds",
    slug: "dither-prism-hero",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/ditherprismhero.webm",
  },
  "webgl-liquid": {
    title: "WebGL Liquid",
    description:
      "Cinematic liquid shader hero with premium gradients, configurable reveal timing, and advanced flow controls.",
    category: "Hero Backgrounds",
    slug: "webgl-liquid",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/webglliquid.webm",
  },
  "silk-aurora": {
    title: "Silk Aurora",
    description:
      "Premium WebGL hero background with satin-dark aurora ribbons, pearlescent highlights, fine grain, and cursor depth.",
    category: "Hero Backgrounds",
    slug: "silk-aurora",
    addedAt: "2026-06-09",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/silkaurora.webm",
  },
  "aurora-flow": {
    title: "Aurora Flow",
    description:
      "Procedural atmospheric hero background with layered flowing color, diffused aurora light, and subtle interaction.",
    category: "Hero Backgrounds",
    slug: "aurora-flow",
    addedAt: "2026-08-02",
  },
  "closing-plasma": {
    title: "Closing Plasma",
    description:
      "Plasma field tailored for footer and CTA sections with premium atmospheric motion.",
    category: "Hero Backgrounds",
    slug: "closing-plasma",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/closingplasma.webm",
  },

  "animated-gradient": {
    title: "Animated Gradient",
    description:
      "A beautiful, animated, and customizable WebGL gradient with noise capabilities.",
    category: "Hero Backgrounds",
    slug: "animated-gradient",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/animatedgradient.webm",
  },
  "prism-gradient": {
    title: "Prism Gradient",
    description:
      "A theme-aware WebGL prism field with liquid checkered motion, electric-blue refraction, and tactile grain.",
    category: "Hero Backgrounds",
    slug: "prism-gradient",
    addedAt: "2026-07-13",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/hero-backgrounds/prismgradient.webm",
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
  // ASCII Effects
  "ascii-effect": {
    title: "ASCII Effect",
    description: "Render images as responsive ASCII artwork with image, flow, and glitch variations.",
    category: "ASCII Effects",
    slug: "ascii-effect",
    addedAt: "2026-07-21",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/ascii-effects/asciieffect.webm",
  },
  // Visual Effects
  "image-trail": {
    title: "Image Trail",
    description:
      "Leaves a trail of images behind the cursor with a premium delay fade.",
    category: "Visual Effects",
    slug: "image-trail",
    addedAt: "2026-03-09",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/imagetrail.webm",
  },
  "image-ripple-effect": {
    title: "Image Ripple Effect",
    description:
      "WebGL-powered cursor ripples that displace layered image cards in real time.",
    category: "Visual Effects",
    slug: "image-ripple-effect",
    addedAt: "2026-03-19",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/imagerippleeffect.webm",
  },
  "ripple-transition": {
    title: "Ripple Transition",
    description:
      "WebGL image transitions with noisy refractive waves, chromatic edges, glow, and click-triggered ripple origins.",
    category: "Visual Effects",
    slug: "ripple-transition",
    addedAt: "2026-07-07",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/rippletransition.webm",
  },
  "infinite-image-field": {
    title: "Infinite Image Field",
    description:
      "An endless, cursor-driven photo canvas that tiles images infinitely and pans fluidly toward wherever you move your cursor.",
    category: "Visual Effects",
    slug: "infinite-image-field",
    addedAt: "2026-03-20",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/infiniteimagefield.webm",
  },
  "dither-gradient": {
    title: "Dither Gradient",
    description: "Gradient background with dithering noise.",
    category: "Visual Effects",
    slug: "dither-gradient",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/dithergradient.webm",
  },
  "magnet-lines": {
    title: "Magnet Lines",
    description: "Lines that react to cursor movement like a magnetic field.",
    category: "Visual Effects",
    slug: "magnet-lines",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/magneticlines.webm",
  },
  "pixel-canvas": {
    title: "Pixel Canvas",
    description: "Canvas where pixels react to interaction.",
    category: "Visual Effects",
    slug: "pixel-canvas",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/pixelcanvas.webm",
  },
  "pixel-image-trail": {
    title: "Pixel Image Trail",
    description:
      "An image reveal made from cursor-painted squares that expire into a bounded pixel trail.",
    category: "Visual Effects",
    slug: "pixel-image-trail",
    addedAt: "2026-08-06",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/pixelimagetrail.webm",
  },
  signature: {
    title: "Signature",
    description:
      "An animated SVG signature effect that draws out text as if hand-written.",
    category: "Premium Components",
    slug: "signature",
    addedAt: "2026-03-17",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/component-animations/signature.webm",
  },
  "matrix-rain": {
    title: "Matrix Rain",
    description: "Classic Matrix digital rain effect.",
    category: "Visual Effects",
    slug: "matrix-rain",
    previewVideo:
      "https://pub-a50e7f4ea75a4970a1738e50d53b6eb1.r2.dev/preview-videos/visual-effects/matrixrain.webm",
  },
  table: {
    title: "Table",
    description:
      "Virtualized data table that stays smooth at 100+ rows, with sortable headers, row selection, column resize and reorder, and a sticky header. Minimal, reduced-motion-safe motion.",
    category: "Premium Components",
    slug: "table",
    addedAt: "2026-07-13",
  },
  "data-table": {
    title: "Data Table",
    description: "Feature-rich data table with sorting, filtering, pagination, column visibility, row selection, and RTL support — built on TanStack Table.",
    category: "Premium Components",
    slug: "data-table",
    addedAt: "2026-07-14",
  },
};

export function getComponent(slug: string) {
  return components[slug];
}
