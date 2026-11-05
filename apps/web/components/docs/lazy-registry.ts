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
  "circle-cursor": () =>
    import("@/components/docs/circle-cursor").then((m) => ({
      default: m.CircleCursorDocs,
    })),
  "chromatic-cursor": () =>
    import("@/components/docs/chromatic-cursor").then((m) => ({
      default: m.ChromaticCursorDocs,
    })),
  "magic-cursor-pro": () =>
    import("@/components/docs/magic-cursor-pro").then((m) => ({
      default: m.MagicCursorProDocs,
    })),
  "electric-vijdi-cursor": () =>
    import("@/components/docs/electric-vijdi-cursor").then((m) => ({
      default: m.ElectricVijdiCursorDocs,
    })),
  "elastic-blob-cursor": () =>
    import("@/components/docs/elastic-blob-cursor").then((m) => ({
      default: m.ElasticBlobCursorDocs,
    })),
  "fluid-cursor": () =>
    import("@/components/docs/fluid-cursor").then((m) => ({
      default: m.FluidCursorDocs,
    })),
  "tubes-cursor": () =>
    import("@/components/docs/tubes-cursor").then((m) => ({
      default: m.TubesCursorDocs,
    })),
  "geometric-trail-cursor": () =>
    import("@/components/docs/geometric-trail-cursor").then((m) => ({
      default: m.GeometricTrailCursorDocs,
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
  "wave-bars-loader": () =>
    import("@/components/docs/wave-bars-loader").then((m) => ({
      default: m.WaveBarsLoaderDocs,
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
  "silk-aurora": () =>
    import("@/components/docs/silk-aurora").then((m) => ({
      default: m.SilkAuroraDocs,
    })),
  "ink-flow": () =>
    import("@/components/docs/ink-flow").then((m) => ({
      default: m.InkFlowDocs,
    })),
  "soft-fluid-gradient": () =>
    import("@/components/docs/soft-fluid-gradient").then((m) => ({
      default: m.SoftFluidGradientDocs,
    })),
  "neon-mesh-bg": () =>
    import("@/components/docs/neon-mesh-bg").then((m) => ({
      default: m.NeonMeshBGDocs,
    })),
  "spectra-noise": () =>
    import("@/components/docs/spectra-noise").then((m) => ({
      default: m.SpectraNoiseDocs,
    })),
  noiser: () =>
    import("@/components/docs/noiser").then((m) => ({
      default: m.NoiserDocs,
    })),
  "sunlight-effect": () =>
    import("@/components/docs/sunlight-effect").then((m) => ({
      default: m.SunlightEffectDocs,
    })),
  "vertical-image-marquee": () =>
    import("@/components/docs/vertical-image-marquee").then((m) => ({
      default: m.VerticalImageMarqueeDocs,
    })),
  "hover-cards": () =>
    import("@/components/docs/hover-cards").then((m) => ({
      default: m.HoverCardsDocs,
    })),
  "profile-carousel": () =>
    import("@/components/docs/profile-carousel").then((m) => ({
      default: m.ProfileCarouselDocs,
    })),
  "services-showcase": () =>
    import("@/components/docs/services-showcase").then((m) => ({
      default: m.ServicesShowcaseDocs,
    })),
  "glass-scene-dock": () =>
    import("@/components/docs/glass-scene-dock").then((m) => ({
      default: m.GlassSceneDockDocs,
    })),
  "liquid-reveal-button": () =>
    import("@/components/docs/liquid-reveal-button").then((m) => ({
      default: m.LiquidRevealButtonDocs,
    })),
  "animated-metric": () =>
    import("@/components/docs/animated-metric").then((m) => ({
      default: m.AnimatedMetricDocs,
    })),
  "nudge-button": () =>
    import("@/components/docs/nudge-button").then((m) => ({
      default: m.NudgeButtonDocs,
    })),
  "animated-pill-button": () =>
    import("@/components/docs/animated-pill-button").then((m) => ({
      default: m.AnimatedPillButtonDocs,
    })),
  "team-slide-reveal": () =>
    import("@/components/docs/team-slide-reveal").then((m) => ({
      default: m.TeamSlideRevealDocs,
    })),
  "ambient-audio-toggle": () =>
    import("@/components/docs/ambient-audio-toggle").then((m) => ({
      default: m.AmbientAudioToggleDocs,
    })),
  "interaction-sound-kit": () =>
    import("@/components/docs/interaction-sound-kit").then((m) => ({
      default: m.InteractionSoundKitDocs,
    })),
  "voice-recorder": () =>
    import("@/components/docs/voice-recorder").then((m) => ({
      default: m.VoiceRecorderDocs,
    })),
  "keyboard-command-sounds": () =>
    import("@/components/docs/keyboard-command-sounds").then((m) => ({
      default: m.KeyboardCommandSoundsDocs,
    })),
  "upload-sound-status": () =>
    import("@/components/docs/upload-sound-status").then((m) => ({
      default: m.UploadSoundStatusDocs,
    })),
  "liquid-chrome": () =>
    import("@/components/docs/liquid-chrome").then((m) => ({
      default: m.LiquidChromeDocs,
    })),
  "character-field": () =>
    import("@/components/docs/character-field").then((m) => ({
      default: m.CharacterFieldDocs,
    })),
  "pixel-flow": () =>
    import("@/components/docs/pixel-flow").then((m) => ({
      default: m.PixelFlowDocs,
    })),
  "pixel-wipe-carousel": () =>
    import("@/components/docs/pixel-wipe-carousel").then((m) => ({
      default: m.PixelWipeCarouselDocs,
    })),
  "segmented-image-carousel": () =>
    import("@/components/docs/segmented-image-carousel").then((m) => ({
      default: m.SegmentedImageCarouselDocs,
    })),
  "burn-plus": () =>
    import("@/components/docs/burn-plus").then((m) => ({
      default: m.BurnPlusDocs,
    })),
  "cinematic-card-carousel": () =>
    import("@/components/docs/cinematic-card-carousel").then((m) => ({
      default: m.CinematicCardCarouselDocs,
    })),
  "focus-carousel": () =>
    import("@/components/docs/focus-carousel").then((m) => ({
      default: m.FocusCarouselDocs,
    })),
  "arc-carousel": () =>
    import("@/components/docs/arc-carousel").then((m) => ({
      default: m.ArcCarouselDocs,
    })),
  "tilt-flip-polaroid": () =>
    import("@/components/docs/tilt-flip-polaroid").then((m) => ({
      default: m.TiltFlipPolaroidDocs,
    })),
  "cms-scroll-gallery": () =>
    import("@/components/docs/cms-scroll-gallery").then((m) => ({
      default: m.CMSScrollGalleryDocs,
    })),
  "interactive-media-accordion": () =>
    import("@/components/docs/interactive-media-accordion").then((m) => ({
      default: m.InteractiveMediaAccordionDocs,
    })),
  "scroll-reveal-image": () =>
    import("@/components/docs/scroll-reveal-image").then((m) => ({
      default: m.ScrollRevealImageDocs,
    })),
  "stacked-scroll-gallery": () =>
    import("@/components/docs/stacked-scroll-gallery").then((m) => ({
      default: m.StackedScrollGalleryDocs,
    })),
  "scroll-sync-gallery": () =>
    import("@/components/docs/scroll-sync-gallery").then((m) => ({
      default: m.ScrollSyncGalleryDocs,
    })),
  "scroll-media-expand": () =>
    import("@/components/docs/scroll-media-expand").then((m) => ({
      default: m.ScrollMediaExpandDocs,
    })),
  "scroll-timeline": () =>
    import("@/components/docs/scroll-timeline").then((m) => ({
      default: m.ScrollTimelineDocs,
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
  label: () =>
    import("@/components/docs/label").then((m) => ({
      default: m.LabelDocs,
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
  "lens-drift-grid": () =>
    import("@/components/docs/lens-drift-grid").then((m) => ({
      default: m.LensDriftGridDocs,
    })),
  "radial-fan-deck": () =>
    import("@/components/docs/radial-fan-deck").then((m) => ({
      default: m.RadialFanDeckDocs,
    })),
  "orbit-spiral-gallery": () =>
    import("@/components/docs/orbit-spiral-gallery").then((m) => ({
      default: m.OrbitSpiralGalleryDocs,
    })),
  "infinite-image-gallery": () =>
    import("@/components/docs/infinite-image-gallery").then((m) => ({
      default: m.InfiniteImageGalleryDocs,
    })),
  "editorial-image-stack": () =>
    import("@/components/docs/editorial-image-stack").then((m) => ({
      default: m.EditorialImageStackDocs,
    })),
  "ambient-strip": () =>
    import("@/components/docs/ambient-strip").then((m) => ({
      default: m.AmbientStripDocs,
    })),
  "navigation-menu": () =>
    import("@/components/docs/navigation-menu").then((m) => ({
      default: m.NavigationMenuDocs,
    })),
  "motion-hamburger": () =>
    import("@/components/docs/motion-hamburger").then((m) => ({
      default: m.MotionHamburgerDocs,
    })),
  "liquid-chrome-button": () =>
    import("@/components/docs/liquid-chrome-button").then((m) => ({
      default: m.LiquidChromeButtonDocs,
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
  "fill-preloader": () =>
    import("@/components/docs/fill-preloader").then((m) => ({
      default: m.FillPreloaderDocs,
    })),
  "staircase-preloader": () =>
    import("@/components/docs/staircase-preloader").then((m) => ({
      default: m.StaircasePreloaderDocs,
    })),
  "pixel-preloader": () =>
    import("@/components/docs/pixel-preloader").then((m) => ({
      default: m.PixelPreloaderDocs,
    })),
  "editorial-wipe-preloader": () =>
    import("@/components/docs/editorial-wipe-preloader").then((m) => ({
      default: m.EditorialWipePreloaderDocs,
    })),
  "geometric-preloader": () =>
    import("@/components/docs/geometric-preloader").then((m) => ({
      default: m.GeometricPreloaderDocs,
    })),
  "preloader-pro": () =>
    import("@/components/docs/preloader-pro").then((m) => ({
      default: m.PreloaderProDocs,
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
