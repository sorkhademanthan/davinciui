import type React from "react";

// Dynamic import map - components are only loaded when needed
// This is a CRITICAL performance optimization that reduces initial bundle size
// by ~80% since we only import the component being viewed.
const docsImportMap: Record<
  string,
  () => Promise<
    | { default: React.ComponentType<Record<string, unknown>> }
    | { [key: string]: React.ComponentType<Record<string, unknown>> }
  >
> = {
  "ascii-effect": () =>
    import("@/components/docs/ascii-effect").then((m) => ({
      default: m.AsciiEffectDocs,
    })),
  "dithered-logo": () =>
    import("@/components/docs/dithered-logo").then((m) => ({
      default: m.DitheredLogoDocs,
    })),
  "sticky-scroll-cards": () =>
    import("@/components/docs/sticky-scroll-cards").then((m) => ({
      default: m.StickyScrollCardsDocs,
    })),
  "case-study-flip-stack": () =>
    import("@/components/docs/case-study-flip-stack").then((m) => ({
      default: m.CaseStudyFlipStackDocs,
    })),
  "music-player": () =>
    import("@/components/docs/music-player").then((m) => ({
      default: m.MusicPlayerDocs,
    })),
  "scroll-split-card": () =>
    import("@/components/docs/scroll-split-card").then((m) => ({
      default: m.ScrollSplitCardDocs,
    })),
  button: () =>
    import("@/components/docs/button").then((m) => ({
      default: m.ButtonDocs,
    })),
  "button-group": () =>
    import("@/components/docs/button-group").then((m) => ({
      default: m.ButtonGroupDocs,
    })),
  accordion: () =>
    import("@/components/docs/accordion").then((m) => ({
      default: m.AccordionDocs,
    })),
  carousel: () =>
    import("@/components/docs/carousel").then((m) => ({
      default: m.CarouselDocs,
    })),
  collapsible: () =>
    import("@/components/docs/collapsible").then((m) => ({
      default: m.CollapsibleDocs,
    })),
  "scroll-area": () =>
    import("@/components/docs/scroll-area").then((m) => ({
      default: m.ScrollAreaDocs,
    })),
  alert: () =>
    import("@/components/docs/alert").then((m) => ({
      default: m.AlertDocs,
    })),
  "aspect-ratio": () =>
    import("@/components/docs/aspect-ratio").then((m) => ({
      default: m.AspectRatioDocs,
    })),
  "alert-dialog": () =>
    import("@/components/docs/alert-dialog").then((m) => ({
      default: m.AlertDialogDocs,
    })),
  avatar: () =>
    import("@/components/docs/avatar").then((m) => ({
      default: m.AvatarDocs,
    })),
  textarea: () =>
    import("@/components/docs/textarea").then((m) => ({
      default: m.TextareaDocs,
    })),
  tabs: () =>
    import("@/components/docs/tabs").then((m) => ({
      default: m.TabsDocs,
    })),
  pagination: () =>
    import("@/components/docs/pagination").then((m) => ({
      default: m.PaginationDocs,
    })),
  breadcrumb: () =>
    import("@/components/docs/breadcrumb").then((m) => ({
      default: m.BreadcrumbDocs,
    })),
  sidebar: () =>
    import("@/components/docs/sidebar").then((m) => ({
      default: m.SidebarDocs,
    })),
  switch: () =>
    import("@/components/docs/switch").then((m) => ({
      default: m.SwitchDocs,
    })),
  skeleton: () =>
    import("@/components/docs/skeleton").then((m) => ({
      default: m.SkeletonDocs,
    })),
  spinner: () =>
    import("@/components/docs/spinner").then((m) => ({
      default: m.SpinnerDocs,
    })),
  progress: () =>
    import("@/components/docs/progress").then((m) => ({
      default: m.ProgressDocs,
    })),
  toast: () =>
    import("@/components/docs/toast").then((m) => ({
      default: m.ToastDocs,
    })),
  form: () =>
    import("@/components/docs/form").then((m) => ({
      default: m.FormDocs,
    })),
  radio: () =>
    import("@/components/docs/radio").then((m) => ({
      default: m.RadioDocs,
    })),
  checkbox: () =>
    import("@/components/docs/checkbox").then((m) => ({
      default: m.CheckboxDocs,
    })),
  select: () =>
    import("@/components/docs/select").then((m) => ({
      default: m.SelectDocs,
    })),
  input: () =>
    import("@/components/docs/input").then((m) => ({
      default: m.InputDocs,
    })),
  toggle: () =>
    import("@/components/docs/toggle").then((m) => ({
      default: m.ToggleDocs,
    })),
  link: () =>
    import("@/components/docs/link").then((m) => ({
      default: m.LinkDocs,
    })),
  "hover-transition": () =>
    import("@/components/docs/hover-transition").then((m) => ({
      default: m.HoverTransitionDocs,
    })),
  "scroll-based-velocity": () =>
    import("@/components/docs/scroll-based-velocity").then((m) => ({
      default: m.ScrollBasedVelocityDocs,
    })),
  "circuit-board": () =>
    import("@/components/docs/circuit-board").then((m) => ({
      default: m.CircuitBoardDocs,
    })),
  "collection-surfer": () =>
    import("@/components/docs/collection-surfer").then((m) => ({
      default: m.CollectionSurferDocs,
    })),
  "flight-status-card": () =>
    import("@/components/docs/flight-status-card").then((m) => ({
      default: m.FlightStatusCardDocs,
    })),
  "github-calendar": () =>
    import("@/components/docs/github-calendar").then((m) => ({
      default: m.GithubCalendarDocs,
    })),
  "mac-keyboard": () =>
    import("@/components/docs/mac-keyboard").then((m) => ({
      default: m.MacKeyboardDocs,
    })),
  "magnetic-dock": () =>
    import("@/components/docs/magnetic-dock").then((m) => ({
      default: m.MagneticDockDocs,
    })),
  "hero-geometric": () =>
    import("@/components/docs/hero-geometric").then((m) => ({
      default: m.HeroGeometricDocs,
    })),
  "dither-prism-hero": () =>
    import("@/components/docs/dither-prism-hero").then((m) => ({
      default: m.DitherPrismHeroDocs,
    })),
  "webgl-liquid": () =>
    import("@/components/docs/webgl-liquid").then((m) => ({
      default: m.WebGLLiquidDocs,
    })),
  "silk-aurora": () =>
    import("@/components/docs/silk-aurora").then((m) => ({
      default: m.SilkAuroraDocs,
    })),
  "aurora-flow": () =>
    import("@/components/docs/aurora-flow").then((m) => ({
      default: m.AuroraFlowDocs,
    })),
  "closing-plasma": () =>
    import("@/components/docs/closing-plasma").then((m) => ({
      default: m.ClosingPlasmaDocs,
    })),
  "animated-gradient": () =>
    import("@/components/docs/animated-gradient").then((m) => ({
      default: m.AnimatedGradientDocs,
    })),
  "prism-gradient": () =>
    import("@/components/docs/prism-gradient").then((m) => ({
      default: m.PrismGradientDocs,
    })),
  "liquid-chrome": () =>
    import("@/components/docs/liquid-chrome").then((m) => ({
      default: m.LiquidChromeDocs,
    })),
  "dither-gradient": () =>
    import("@/components/docs/dither-gradient").then((m) => ({
      default: m.DitherGradientDocs,
    })),
  "magnet-lines": () =>
    import("@/components/docs/magnet-lines").then((m) => ({
      default: m.MagnetLinesDocs,
    })),
  "matrix-rain": () =>
    import("@/components/docs/matrix-rain").then((m) => ({
      default: m.MatrixRainDocs,
    })),
  "pixel-canvas": () =>
    import("@/components/docs/pixel-canvas").then((m) => ({
      default: m.PixelCanvasDocs,
    })),
  "pixel-image-trail": () =>
    import("@/components/docs/pixel-image-trail").then((m) => ({
      default: m.PixelImageTrailDocs,
    })),
  "scroll-choreography": () =>
    import("@/components/docs/scroll-choreography").then((m) => ({
      default: m.ScrollChoreographyDocs,
    })),
  "scroll-tilted-grid": () =>
    import("@/components/docs/scroll-tilted-grid").then((m) => ({
      default: m.ScrollTiltedGridDocs,
    })),
  "letter-cascade": () =>
    import("@/components/docs/letter-cascade").then((m) => ({
      default: m.LetterCascadeDocs,
    })),
  "text-repel": () =>
    import("@/components/docs/text-repel").then((m) => ({
      default: m.TextRepelDocs,
    })),
  "text-morph": () =>
    import("@/components/docs/text-morph").then((m) => ({
      default: m.TextMorphDocs,
    })),
  "flipping-word-swap": () =>
    import("@/components/docs/flipping-word-swap").then((m) => ({
      default: m.FlippingWordSwapDocs,
    })),
  "kinetic-text-reveal": () =>
    import("@/components/docs/kinetic-text-reveal").then((m) => ({
      default: m.KineticTextRevealDocs,
    })),
  "kinetic-text": () =>
    import("@/components/docs/kinetic-text").then((m) => ({
      default: m.KineticTextDocs,
    })),
  "gsap-text": () =>
    import("@/components/docs/gsap-text").then((m) => ({
      default: m.GSAPTextDocs,
    })),
  "shake-text": () =>
    import("@/components/docs/shake-text").then((m) => ({
      default: m.ShakeTextDocs,
    })),
  "calendar": () =>
    import("@/components/docs/calendar").then((m) => ({
      default: m.CalendarDocs,
    })),
  "combobox": () =>
    import("@/components/docs/combobox").then((m) => ({
      default: m.ComboboxDocs,
    })),
  "date-picker": () =>
    import("@/components/docs/date-picker").then((m) => ({
      default: m.DatePickerDocs,
    })),
  "field": () =>
    import("@/components/docs/field").then((m) => ({
      default: m.FieldDocs,
    })),
  "input-group": () =>
    import("@/components/docs/input-group").then((m) => ({
      default: m.InputGroupDocs,
    })),
  "cursor-driven-particle-typography": () =>
    import("@/components/docs/cursor-driven-particle-typography").then((m) => ({
      default: m.CursorDrivenParticleTypographyDocs,
    })),
  "image-trail": () =>
    import("@/components/docs/image-trail").then((m) => ({
      default: m.ImageTrailDocs,
    })),
  "image-ripple-effect": () =>
    import("@/components/docs/image-ripple-effect").then((m) => ({
      default: m.ImageRippleEffectDocs,
    })),
  "ripple-transition": () =>
    import("@/components/docs/ripple-transition").then((m) => ({
      default: m.RippleTransitionDocs,
    })),
  "infinite-image-field": () =>
    import("@/components/docs/infinite-image-field").then((m) => ({
      default: m.InfiniteImageFieldDocs,
    })),
  "fisheye-infinite-grid": () =>
    import("@/components/docs/fisheye-infinite-grid").then((m) => ({
      default: m.FisheyeInfiniteGridDocs,
    })),
  "layered-stack": () =>
    import("@/components/docs/layered-stack").then((m) => ({
      default: m.LayeredStackDocs,
    })),
  "orbit-card-stack": () =>
    import("@/components/docs/orbit-card-stack").then((m) => ({
      default: m.OrbitCardStackDocs,
    })),
  "wheel-carousel": () =>
    import("@/components/docs/wheel-carousel").then((m) => ({
      default: m.WheelCarouselDocs,
    })),
  "spiral-3d-slider": () =>
    import("@/components/docs/spiral-3d-slider").then((m) => ({
      default: m.Spiral3DSliderDocs,
    })),
  "newsletter-bookshelf": () =>
    import("@/components/docs/newsletter-bookshelf").then((m) => ({
      default: m.NewsletterBookshelfDocs,
    })),
  signature: () =>
    import("@/components/docs/signature").then((m) => ({
      default: m.SignatureDocs,
    })),
  "split-flap-display": () =>
    import("@/components/docs/split-flap-display").then((m) => ({
      default: m.SplitFlapDisplayDocs,
    })),
  "eye-tracking": () =>
    import("@/components/docs/eye-tracking").then((m) => ({
      default: m.EyeTrackingDocs,
    })),
  "navigation-menu": () =>
    import("@/components/docs/navigation-menu").then((m) => ({
      default: m.NavigationMenuDocs,
    })),
  dialog: () =>
    import("@/components/docs/dialog").then((m) => ({
      default: m.DialogDocs,
    })),
  drawer: () =>
    import("@/components/docs/drawer").then((m) => ({
      default: m.DrawerDocs,
    })),
  popover: () =>
    import("@/components/docs/popover").then((m) => ({
      default: m.PopoverDocs,
    })),
  tooltip: () =>
    import("@/components/docs/tooltip").then((m) => ({
      default: m.TooltipDocs,
    })),
  "dropdown-menu": () =>
    import("@/components/docs/dropdown-menu").then((m) => ({
      default: m.DropdownMenuDocs,
    })),
  card: () =>
    import("@/components/docs/card").then((m) => ({
      default: m.CardDocs,
    })),
  badge: () =>
    import("@/components/docs/badge").then((m) => ({
      default: m.BadgeDocs,
    })),
  table: () =>
    import("@/components/docs/table").then((m) => ({
      default: m.TableDocs,
    })),
  "data-table": () =>
    import("@/components/docs/data-table").then((m) => ({
      default: m.DataTableDocs,
    })),
};

/**
 * Get the dynamic import function for a docs component.
 * Returns null if the component doesn't exist in the registry.
 */
export function getDocsImporter(slug: string) {
  return docsImportMap[slug] ?? null;
}

/**
 * Get all available component slugs for static generation.
 */
export function getDocsSlugs(): string[] {
  return Object.keys(docsImportMap);
}
