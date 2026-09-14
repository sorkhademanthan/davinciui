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
  "silk-aurora": () =>
    import("@/components/docs/silk-aurora").then((m) => ({
      default: m.SilkAuroraDocs,
    })),
  "paper-ink-background": () =>
    import("@/components/docs/paper-ink-background").then((m) => ({
      default: m.PaperInkBackgroundDocs,
    })),
  "soft-fluid-gradient": () =>
    import("@/components/docs/soft-fluid-gradient").then((m) => ({
      default: m.SoftFluidGradientDocs,
    })),
  "closing-plasma": () =>
    import("@/components/docs/closing-plasma").then((m) => ({
      default: m.ClosingPlasmaDocs,
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
  "character-field": () =>
    import("@/components/docs/character-field").then((m) => ({
      default: m.CharacterFieldDocs,
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
  "fluid-particle-text": () =>
    import("@/components/docs/fluid-particle-text").then((m) => ({
      default: m.FluidParticleTextDocs,
    })),
  "text-morph": () =>
    import("@/components/docs/text-morph").then((m) => ({
      default: m.TextMorphDocs,
    })),
  "encrypted-text": () =>
    import("@/components/docs/encrypted-text").then((m) => ({
      default: m.EncryptedTextDocs,
    })),
  "gsap-text": () =>
    import("@/components/docs/gsap-text").then((m) => ({
      default: m.GSAPTextDocs,
    })),
  "glitch-liquid-text": () =>
    import("@/components/docs/glitch-liquid-text").then((m) => ({
      default: m.GlitchLiquidTextDocs,
    })),
  "media-text-hover": () =>
    import("@/components/docs/media-text-hover").then((m) => ({
      default: m.MediaTextHoverDocs,
    })),
  "text-video-mask": () =>
    import("@/components/docs/text-video-mask").then((m) => ({
      default: m.TextVideoMaskDocs,
    })),
  "random-text-reveal": () =>
    import("@/components/docs/random-text-reveal").then((m) => ({
      default: m.RandomTextRevealDocs,
    })),
  "text-reveal": () =>
    import("@/components/docs/text-reveal").then((m) => ({
      default: m.TextRevealDocs,
    })),
  "shake-text": () =>
    import("@/components/docs/shake-text").then((m) => ({
      default: m.ShakeTextDocs,
    })),
  "rolling-text": () =>
    import("@/components/docs/rolling-text").then((m) => ({
      default: m.RollingTextDocs,
    })),
  "shader-text": () =>
    import("@/components/docs/shader-text").then((m) => ({
      default: m.ShaderTextDocs,
    })),
  calendar: () =>
    import("@/components/docs/calendar").then((m) => ({
      default: m.CalendarDocs,
    })),
  combobox: () =>
    import("@/components/docs/combobox").then((m) => ({
      default: m.ComboboxDocs,
    })),
  "date-picker": () =>
    import("@/components/docs/date-picker").then((m) => ({
      default: m.DatePickerDocs,
    })),
  field: () =>
    import("@/components/docs/field").then((m) => ({
      default: m.FieldDocs,
    })),
  "input-group": () =>
    import("@/components/docs/input-group").then((m) => ({
      default: m.InputGroupDocs,
    })),
  "input-otp": () =>
    import("@/components/docs/input-otp").then((m) => ({
      default: m.InputOTPDocs,
    })),
  "native-select": () =>
    import("@/components/docs/native-select").then((m) => ({
      default: m.NativeSelectDocs,
    })),
  slider: () =>
    import("@/components/docs/slider").then((m) => ({
      default: m.SliderDocs,
    })),
  "context-menu": () =>
    import("@/components/docs/context-menu").then((m) => ({
      default: m.ContextMenuDocs,
    })),
  "hover-card": () =>
    import("@/components/docs/hover-card").then((m) => ({
      default: m.HoverCardDocs,
    })),
  sheet: () =>
    import("@/components/docs/sheet").then((m) => ({
      default: m.SheetDocs,
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
  questionnaire: () =>
    import("@/components/docs/questionnaire").then((m) => ({
      default: m.QuestionnaireDocs,
    })),
  separator: () =>
    import("@/components/docs/separator").then((m) => ({
      default: m.SeparatorDocs,
    })),
  bubble: () =>
    import("@/components/docs/bubble").then((m) => ({
      default: m.BubbleDocs,
    })),
  "toggle-group": () =>
    import("@/components/docs/toggle-group").then((m) => ({
      default: m.ToggleGroupDocs,
    })),
  attachment: () =>
    import("@/components/docs/attachment").then((m) => ({
      default: m.AttachmentDocs,
    })),
  chart: () =>
    import("@/components/docs/chart").then((m) => ({
      default: m.ChartDocs,
    })),
  item: () =>
    import("@/components/docs/item").then((m) => ({
      default: m.ItemDocs,
    })),
  "message-scroller": () =>
    import("@/components/docs/message-scroller").then((m) => ({
      default: m.MessageScrollerDocs,
    })),
  empty: () =>
    import("@/components/docs/empty").then((m) => ({
      default: m.EmptyDocs,
    })),
  menubar: () =>
    import("@/components/docs/menubar").then((m) => ({
      default: m.MenubarDocs,
    })),
  message: () =>
    import("@/components/docs/message").then((m) => ({
      default: m.MessageDocs,
    })),
  marker: () =>
    import("@/components/docs/marker").then((m) => ({
      default: m.MarkerDocs,
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
