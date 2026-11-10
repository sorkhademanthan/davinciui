"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  isBasicPreviewSlug,
  type BasicPreviewSlug,
} from "@/components/docs/previews/basic-component-card-slugs";
import { getPreviewDefinition } from "@/lib/preview-contract";

const TextMorph = dynamic(
  () =>
    import("@workspace/ui/components/text-morph").then(
      (module) => module.TextMorph,
    ),
  { ssr: false },
);

const KineticText = dynamic(
  () =>
    import("@workspace/ui/components/gsap-text").then(
      (module) => module.KineticText,
    ),
  { ssr: false },
);

const CircleCursorCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/circle-cursor-card-preview").then(
      (module) => module.CircleCursorCardPreview,
    ),
  { ssr: false },
);

const ElectricVijdiCursorCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/electric-vijdi-cursor-card-preview").then(
      (module) => module.ElectricVijdiCursorCardPreview,
    ),
  { ssr: false },
);

const MagicCursorProCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/magic-cursor-pro-card-preview").then(
      (module) => module.MagicCursorProCardPreview,
    ),
  { ssr: false },
);

const ChromaticCursorCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/chromatic-cursor-card-preview").then(
      (module) => module.ChromaticCursorCardPreview,
    ),
  { ssr: false },
);

const TubesCursorCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/tubes-cursor-card-preview").then(
      (module) => module.TubesCursorCardPreview,
    ),
  { ssr: false },
);

const ElasticBlobCursorCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/elastic-blob-cursor-card-preview").then(
      (module) => module.ElasticBlobCursorCardPreview,
    ),
  { ssr: false },
);

const FluidCursorCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/fluid-cursor-card-preview").then(
      (module) => module.FluidCursorCardPreview,
    ),
  { ssr: false },
);

const GeometricTrailCursorCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/geometric-trail-cursor-card-preview").then(
      (module) => module.GeometricTrailCursorCardPreview,
    ),
  { ssr: false },
);

const ShakeText = dynamic(
  () =>
    import("@workspace/ui/components/shake-text").then(
      (module) => module.ShakeText,
    ),
  { ssr: false },
);

const EncryptedText = dynamic(
  () =>
    import("@workspace/ui/components/encrypted-text").then(
      (module) => module.EncryptedText,
    ),
  { ssr: false },
);

const FluidParticleText = dynamic(
  () =>
    import("@/components/docs/previews/fluid-particle-text-card-preview").then(
      (module) => module.FluidParticleTextCardPreview,
    ),
  { ssr: false },
);

const GlitchLiquidText = dynamic(
  () =>
    import("@/components/docs/previews/glitch-liquid-text-card-preview").then(
      (module) => module.GlitchLiquidTextCardPreview,
    ),
  { ssr: false },
);

const InkFlow = dynamic(
  () =>
    import("@workspace/ui/components/ink-flow").then(
      (module) => module.InkFlow,
    ),
  { ssr: false },
);

const SoftFluidGradientCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/soft-fluid-gradient-card-preview").then(
      (module) => module.SoftFluidGradientCardPreview,
    ),
  { ssr: false },
);

const CharacterFieldCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/character-field-card-preview").then(
      (module) => module.CharacterFieldCardPreview,
    ),
  { ssr: false },
);

const CurvedInlineTypeCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/curved-inline-type-card-preview").then(
      (module) => module.CurvedInlineTypeCardPreview,
    ),
  { ssr: false },
);

const PixelFlowCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/pixel-flow-card-preview").then(
      (module) => module.PixelFlowCardPreview,
    ),
  { ssr: false },
);

const PixelWipeCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/pixel-wipe-carousel-card-preview").then(
      (module) => module.PixelWipeCarouselCardPreview,
    ),
  { ssr: false },
);

const SegmentedImageCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/segmented-image-carousel-card-preview").then(
      (module) => module.SegmentedImageCarouselCardPreview,
    ),
  { ssr: false },
);

const CinematicCardCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/cinematic-card-carousel-card-preview").then(
      (module) => module.CinematicCardCarouselCardPreview,
    ),
  { ssr: false },
);

const FocusCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/focus-carousel-card-preview").then(
      (module) => module.FocusCarouselCardPreview,
    ),
  { ssr: false },
);

const AmbientStripCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/ambient-strip-card-preview").then(
      (module) => module.AmbientStripCardPreview,
    ),
  { ssr: false },
);

const RadialFanDeckCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/radial-fan-deck-card-preview").then(
      (module) => module.RadialFanDeckCardPreview,
    ),
  { ssr: false },
);

const ArcCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/arc-carousel-card-preview").then(
      (module) => module.ArcCarouselCardPreview,
    ),
  { ssr: false },
);

const ArcwaveCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/arcwave-carousel-card-preview").then(
      (module) => module.ArcwaveCarouselCardPreview,
    ),
  { ssr: false },
);

const StreamlineCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/streamline-carousel-card-preview").then(
      (module) => module.StreamlineCarouselCardPreview,
    ),
  { ssr: false },
);

const DepthCarousel3DCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/depth-carousel-3d-card-preview").then(
      (module) => module.DepthCarousel3DCardPreview,
    ),
  { ssr: false },
);

const FannedDeckCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/fanned-deck-card-preview").then(
      (module) => module.FannedDeckCardPreview,
    ),
  { ssr: false },
);

const TiltFlipPolaroidCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/tilt-flip-polaroid-card-preview").then(
      (module) => module.TiltFlipPolaroidCardPreview,
    ),
  { ssr: false },
);

const CrumpledPaperRevealCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/crumpled-paper-reveal-card-preview").then(
      (module) => module.CrumpledPaperRevealCardPreview,
    ),
  { ssr: false },
);

const NeonMeshBGCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/neon-mesh-bg-card-preview").then(
      (module) => module.NeonMeshBGCardPreview,
    ),
  { ssr: false },
);

const SpectraNoiseCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/spectra-noise-card-preview").then(
      (module) => module.SpectraNoiseCardPreview,
    ),
  { ssr: false },
);

const NoiserCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/noiser-card-preview").then(
      (module) => module.NoiserCardPreview,
    ),
  { ssr: false },
);

const SunlightEffectCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/sunlight-effect-card-preview").then(
      (module) => module.SunlightEffectCardPreview,
    ),
  { ssr: false },
);

const VerticalImageMarqueeCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/vertical-image-marquee-card-preview").then(
      (module) => module.VerticalImageMarqueeCardPreview,
    ),
  { ssr: false },
);

const HoverCardsCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/hover-cards-card-preview").then(
      (module) => module.HoverCardsCardPreview,
    ),
  { ssr: false },
);

const ProfileCarouselCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/profile-carousel-card-preview").then(
      (module) => module.ProfileCarouselCardPreview,
    ),
  { ssr: false },
);

const ServicesShowcaseCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/services-showcase-card-preview").then(
      (module) => module.ServicesShowcaseCardPreview,
    ),
  { ssr: false },
);

const GlassSceneDockCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/glass-scene-dock-card-preview").then(
      (module) => module.GlassSceneDockCardPreview,
    ),
  { ssr: false },
);

const LensDriftGridCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/lens-drift-grid-card-preview").then(
      (module) => module.LensDriftGridCardPreview,
    ),
  { ssr: false },
);

const OrbitSpiralGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/orbit-spiral-gallery-card-preview").then(
      (module) => module.OrbitSpiralGalleryCardPreview,
    ),
  { ssr: false },
);

const InfiniteImageGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/infinite-image-gallery-card-preview").then(
      (module) => module.InfiniteImageGalleryCardPreview,
    ),
  { ssr: false },
);

const SpiralMediaGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/spiral-media-gallery-card-preview").then(
      (module) => module.SpiralMediaGalleryCardPreview,
    ),
  { ssr: false },
);

const EditorialImageStackCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/editorial-image-stack-card-preview").then(
      (module) => module.EditorialImageStackCardPreview,
    ),
  { ssr: false },
);

const CircularGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/circular-gallery-card-preview").then(
      (module) => module.CircularGalleryCardPreview,
    ),
  { ssr: false },
);

const CurveWallCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/curve-wall-card-preview").then(
      (module) => module.CurveWallCardPreview,
    ),
  { ssr: false },
);

const FlowGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/3d-flow-gallery-card-preview").then(
      (module) => module.FlowGalleryCardPreview,
    ),
  { ssr: false },
);

const LiquidRevealButtonCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/liquid-reveal-button-card-preview").then(
      (module) => module.LiquidRevealButtonCardPreview,
    ),
  { ssr: false },
);

const AnimatedMetricCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/animated-metric-card-preview").then(
      (module) => module.AnimatedMetricCardPreview,
    ),
  { ssr: false },
);

const NudgeButtonCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/nudge-button-card-preview").then(
      (module) => module.NudgeButtonCardPreview,
    ),
  { ssr: false },
);

const AnimatedPillButtonCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/animated-pill-button-card-preview").then(
      (module) => module.AnimatedPillButtonCardPreview,
    ),
  { ssr: false },
);

const BurnPlusCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/burn-plus-card-preview").then(
      (module) => module.BurnPlusCardPreview,
    ),
  { ssr: false },
);

const BookshelfCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/bookshelf-card-preview").then(
      (module) => module.BookshelfCardPreview,
    ),
  { ssr: false },
);

const TeamSlideRevealCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/team-slide-reveal-card-preview").then(
      (module) => module.TeamSlideRevealCardPreview,
    ),
  { ssr: false },
);

const HoverTransitionCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/hover-transition-card-preview").then(
      (module) => module.HoverTransitionCardPreview,
    ),
  { ssr: false },
);

const AmbientAudioToggleCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/ambient-audio-toggle-card-preview").then(
      (module) => module.AmbientAudioToggleCardPreview,
    ),
  { ssr: false },
);

const InteractionSoundKitCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/interaction-sound-kit-card-preview").then(
      (module) => module.InteractionSoundKitCardPreview,
    ),
  { ssr: false },
);
const VoiceRecorderCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/voice-recorder-card-preview").then(
      (module) => module.VoiceRecorderCardPreview,
    ),
  { ssr: false },
);
const KeyboardCommandSoundsCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/keyboard-command-sounds-card-preview").then(
      (module) => module.KeyboardCommandSoundsCardPreview,
    ),
  { ssr: false },
);
const UploadSoundStatusCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/upload-sound-status-card-preview").then(
      (module) => module.UploadSoundStatusCardPreview,
    ),
  { ssr: false },
);

const MotionHamburgerCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/motion-hamburger-card-preview").then(
      (module) => module.MotionHamburgerCardPreview,
    ),
  { ssr: false },
);

const LiquidChromeButtonCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/liquid-chrome-button-card-preview").then(
      (module) => module.LiquidChromeButtonCardPreview,
    ),
  { ssr: false },
);

const ScrollRevealImageCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/scroll-reveal-image-card-preview").then(
      (module) => module.ScrollRevealImageCardPreview,
    ),
  { ssr: false },
);

const CMSScrollGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/cms-scroll-gallery-card-preview").then(
      (module) => module.CMSScrollGalleryCardPreview,
    ),
  { ssr: false },
);

const StackedScrollGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/stacked-scroll-gallery-card-preview").then(
      (module) => module.StackedScrollGalleryCardPreview,
    ),
  { ssr: false },
);

const ScrollSyncGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/scroll-sync-gallery-card-preview").then(
      (module) => module.ScrollSyncGalleryCardPreview,
    ),
  { ssr: false },
);

const ScrollMediaExpandCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/scroll-media-expand-card-preview").then(
      (module) => module.ScrollMediaExpandCardPreview,
    ),
  { ssr: false },
);

const ScrollTimelineCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/scroll-timeline-card-preview").then(
      (module) => module.ScrollTimelineCardPreview,
    ),
  { ssr: false },
);

const BasicComponentCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/basic-component-card-preview").then(
      (module) => module.BasicComponentCardPreview,
    ),
  { ssr: false },
);

const InteractiveMediaAccordionCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/interactive-media-accordion-card-preview").then(
      (module) => module.InteractiveMediaAccordionCardPreview,
    ),
  { ssr: false },
);

const SilkAuroraCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/silk-aurora-card-preview").then(
      (module) => module.SilkAuroraCardPreview,
    ),
  { ssr: false },
);

const FillPreloaderCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/fill-preloader-card-preview").then(
      (module) => module.FillPreloaderCardPreview,
    ),
  { ssr: false },
);

const StaircasePreloaderCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/staircase-preloader-card-preview").then(
      (module) => module.StaircasePreloaderCardPreview,
    ),
  { ssr: false },
);

const PixelPreloaderCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/pixel-preloader-card-preview").then(
      (module) => module.PixelPreloaderCardPreview,
    ),
  { ssr: false },
);

const EditorialWipePreloaderCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/editorial-wipe-preloader-card-preview").then(
      (module) => module.EditorialWipePreloaderCardPreview,
    ),
  { ssr: false },
);

const GeometricPreloaderCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/geometric-preloader-card-preview").then(
      (module) => module.GeometricPreloaderCardPreview,
    ),
  { ssr: false },
);

const PreloaderProCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/preloader-pro-card-preview").then(
      (module) => module.PreloaderProCardPreview,
    ),
  { ssr: false },
);

const WaveBarsLoaderCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/wave-bars-loader-card-preview").then(
      (module) => module.WaveBarsLoaderCardPreview,
    ),
  { ssr: false },
);

const MediaTextHover = dynamic(
  () =>
    import("@/components/docs/previews/media-text-hover-card-preview").then(
      (module) => module.MediaTextHoverCardPreview,
    ),
  { ssr: false },
);

const TextVideoMask = dynamic(
  () =>
    import("@workspace/ui/components/text-video-mask").then(
      (module) => module.TextVideoMask,
    ),
  { ssr: false },
);

const RandomTextReveal = dynamic(
  () =>
    import("@workspace/ui/components/random-text-reveal").then(
      (module) => module.RandomTextReveal,
    ),
  { ssr: false },
);

const ShaderText = dynamic(
  () =>
    import("@workspace/ui/components/shader-text").then(
      (module) => module.ShaderText,
    ),
  { ssr: false },
);

const TextReveal = dynamic(
  () =>
    import("@workspace/ui/components/text-reveal").then(
      (module) => module.TextReveal,
    ),
  { ssr: false },
);

const RollingTextCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/rolling-text-card-preview").then(
      (module) => module.RollingTextCardPreview,
    ),
  { ssr: false },
);

type ComponentCardLivePreviewProps = {
  slug:
    | "circle-cursor"
    | "electric-vijdi-cursor"
    | "tubes-cursor"
    | "magic-cursor-pro"
    | "chromatic-cursor"
    | "fluid-cursor"
    | "geometric-trail-cursor"
    | "elastic-blob-cursor"
    | "gsap-text"
    | "text-morph"
    | "shake-text"
    | "encrypted-text"
    | "fluid-particle-text"
    | "glitch-liquid-text"
    | "ink-flow"
    | "silk-aurora"
    | "soft-fluid-gradient"
    | "media-text-hover"
    | "text-video-mask"
    | "random-text-reveal"
    | "shader-text"
    | "text-reveal"
    | "rolling-text"
    | "character-field"
    | "curved-inline-type"
    | "pixel-flow"
    | "pixel-wipe-carousel"
    | "segmented-image-carousel"
    | "cinematic-card-carousel"
    | "focus-carousel"
    | "ambient-strip"
    | "arc-carousel"
    | "arcwave-carousel"
    | "streamline-carousel"
    | "depth-carousel-3d"
    | "fanned-deck"
    | "tilt-flip-polaroid"
    | "crumpled-paper-reveal"
    | "radial-fan-deck"
    | "neon-mesh-bg"
    | "spectra-noise"
    | "noiser"
    | "sunlight-effect"
    | "vertical-image-marquee"
    | "hover-cards"
    | "profile-carousel"
    | "services-showcase"
    | "glass-scene-dock"
    | "lens-drift-grid"
    | "orbit-spiral-gallery"
    | "infinite-image-gallery"
    | "editorial-image-stack"
    | "circular-gallery"
    | "curve-wall"
    | "spiral-media-gallery"
    | "3d-flow-gallery"
    | "liquid-reveal-button"
    | "animated-metric"
    | "nudge-button"
    | "animated-pill-button"
    | "burn-plus"
    | "bookshelf"
    | "team-slide-reveal"
    | "hover-transition"
    | "ambient-audio-toggle"
    | "interaction-sound-kit"
    | "voice-recorder"
    | "keyboard-command-sounds"
    | "upload-sound-status"
    | "motion-hamburger"
    | "liquid-chrome-button"
    | "scroll-reveal-image"
    | "cms-scroll-gallery"
    | "interactive-media-accordion"
    | "stacked-scroll-gallery"
    | "scroll-sync-gallery"
    | "scroll-media-expand"
    | "scroll-timeline"
    | "fill-preloader"
    | "staircase-preloader"
    | "pixel-preloader"
    | "editorial-wipe-preloader"
    | "geometric-preloader"
    | "preloader-pro"
    | "wave-bars-loader"
    | BasicPreviewSlug;
};

export function ComponentCardLivePreview({
  slug,
}: ComponentCardLivePreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldRender(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "300px 0px", threshold: 0.01 },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  const staticLabel = slug === "fluid-particle-text" ? "INK" : "DAVINCIUI";
  // One shared rulebook for card behavior — sizing, background, assistive
  // exposure, and reduced-motion policy come from the preview contract
  // instead of inline slug lists.
  const previewDef = getPreviewDefinition(slug);

  return (
    <div
      ref={hostRef}
      aria-hidden={previewDef.ariaHidden}
      className={`absolute inset-0 flex items-center justify-center overflow-hidden ${previewDef.cardBackground}`}
    >
      {slug === "ambient-audio-toggle" &&
      !shouldRender ? null : !shouldRender ||
        (reducedMotion && !previewDef.reduceMotionSafe) ? (
        <span className="text-3xl font-black tracking-[-0.055em] text-foreground sm:text-4xl">
          {staticLabel}
        </span>
      ) : slug === "circle-cursor" ? (
        <CircleCursorCardPreview />
      ) : slug === "electric-vijdi-cursor" ? (
        <ElectricVijdiCursorCardPreview />
      ) : slug === "tubes-cursor" ? (
        <TubesCursorCardPreview />
      ) : slug === "magic-cursor-pro" ? (
        <MagicCursorProCardPreview />
      ) : slug === "chromatic-cursor" ? (
        <ChromaticCursorCardPreview />
      ) : slug === "fluid-cursor" ? (
        <FluidCursorCardPreview />
      ) : slug === "geometric-trail-cursor" ? (
        <GeometricTrailCursorCardPreview />
      ) : slug === "elastic-blob-cursor" ? (
        <ElasticBlobCursorCardPreview />
      ) : slug === "shader-text" ? (
        <ShaderText
          text="DAVINCIUI"
          preset="aurora"
          fontSize={42}
          fontWeight={800}
          speed={1.2}
          className="max-w-full"
        />
      ) : slug === "text-reveal" ? (
        <TextReveal
          text="DAVINCIUI"
          revealStyle="diagonal"
          revealBy="characters"
          fontFamily="inherit"
          fontSize="clamp(1.7rem, 3vw, 2.3rem)"
          fontWeight={800}
          textAlign="center"
          revealedColor={isDark ? "#f4f4f5" : "#18181b"}
          unrevealedColor={isDark ? "#f4f4f5" : "#18181b"}
          className="px-4"
        />
      ) : slug === "rolling-text" ? (
        <RollingTextCardPreview />
      ) : slug === "media-text-hover" ? (
        <MediaTextHover />
      ) : slug === "text-morph" ? (
        <TextMorph
          words={["DAVINCIUI", "COMPONENTS"]}
          interval={1800}
          morphDuration={560}
          className="text-3xl font-black tracking-[-0.055em] text-foreground sm:text-4xl"
        />
      ) : slug === "shake-text" ? (
        <ShakeText text="DAVINCIUI" fontSize="clamp(2rem, 3vw, 2.65rem)" />
      ) : slug === "encrypted-text" ? (
        <EncryptedText
          text="DAVINCIUI"
          fontSize="clamp(1.7rem, 2.6vw, 2.25rem)"
          scrambleDuration={420}
          revealDuration={900}
          holdDuration={1200}
          encryptedColor={isDark ? "#8fb58b" : "#466944"}
          revealedColor={isDark ? "#f5f5f4" : "#18181b"}
        />
      ) : slug === "fluid-particle-text" ? (
        <FluidParticleText />
      ) : slug === "glitch-liquid-text" ? (
        <GlitchLiquidText />
      ) : slug === "ink-flow" ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#e9e1c8]"
          style={{ containerType: "inline-size" }}
        >
          <InkFlow maxDpr={1} />
          <span
            className="relative z-10 whitespace-nowrap text-[clamp(1.5rem,12cqi,7rem)] font-black uppercase leading-none tracking-[-0.075em] text-[#24225f]"
            style={{
              WebkitTextStroke: "0.7px rgba(233, 225, 200, 0.36)",
              textShadow: "0 5px 18px rgba(45, 42, 147, 0.2)",
            }}
          >
            DAVINCIUI
          </span>
        </div>
      ) : slug === "soft-fluid-gradient" ? (
        <SoftFluidGradientCardPreview />
      ) : slug === "silk-aurora" ? (
        <SilkAuroraCardPreview />
      ) : slug === "character-field" ? (
        <CharacterFieldCardPreview />
      ) : slug === "curved-inline-type" ? (
        <CurvedInlineTypeCardPreview />
      ) : slug === "pixel-flow" ? (
        <PixelFlowCardPreview />
      ) : slug === "pixel-wipe-carousel" ? (
        <PixelWipeCarouselCardPreview />
      ) : slug === "segmented-image-carousel" ? (
        <SegmentedImageCarouselCardPreview />
      ) : slug === "cinematic-card-carousel" ? (
        <CinematicCardCarouselCardPreview />
      ) : slug === "focus-carousel" ? (
        <FocusCarouselCardPreview />
      ) : slug === "ambient-strip" ? (
        <AmbientStripCardPreview />
      ) : slug === "arc-carousel" ? (
        <ArcCarouselCardPreview />
      ) : slug === "arcwave-carousel" ? (
        <ArcwaveCarouselCardPreview />
      ) : slug === "streamline-carousel" ? (
        <StreamlineCarouselCardPreview />
      ) : slug === "depth-carousel-3d" ? (
        <DepthCarousel3DCardPreview />
      ) : slug === "fanned-deck" ? (
        <FannedDeckCardPreview />
      ) : slug === "tilt-flip-polaroid" ? (
        <TiltFlipPolaroidCardPreview />
      ) : slug === "crumpled-paper-reveal" ? (
        <CrumpledPaperRevealCardPreview />
      ) : slug === "radial-fan-deck" ? (
        <RadialFanDeckCardPreview />
      ) : slug === "neon-mesh-bg" ? (
        <NeonMeshBGCardPreview />
      ) : slug === "spectra-noise" ? (
        <SpectraNoiseCardPreview />
      ) : slug === "noiser" ? (
        <NoiserCardPreview />
      ) : slug === "sunlight-effect" ? (
        <SunlightEffectCardPreview />
      ) : slug === "vertical-image-marquee" ? (
        <VerticalImageMarqueeCardPreview />
      ) : slug === "hover-cards" ? (
        <HoverCardsCardPreview />
      ) : slug === "profile-carousel" ? (
        <ProfileCarouselCardPreview />
      ) : slug === "services-showcase" ? (
        <ServicesShowcaseCardPreview />
      ) : slug === "glass-scene-dock" ? (
        <GlassSceneDockCardPreview />
      ) : slug === "lens-drift-grid" ? (
        <LensDriftGridCardPreview />
      ) : slug === "orbit-spiral-gallery" ? (
        <OrbitSpiralGalleryCardPreview />
      ) : slug === "infinite-image-gallery" ? (
        <InfiniteImageGalleryCardPreview />
      ) : slug === "editorial-image-stack" ? (
        <EditorialImageStackCardPreview />
      ) : slug === "circular-gallery" ? (
        <CircularGalleryCardPreview />
      ) : slug === "curve-wall" ? (
        <CurveWallCardPreview />
      ) : slug === "spiral-media-gallery" ? (
        <SpiralMediaGalleryCardPreview />
      ) : slug === "3d-flow-gallery" ? (
        <FlowGalleryCardPreview />
      ) : slug === "liquid-reveal-button" ? (
        <LiquidRevealButtonCardPreview />
      ) : slug === "animated-metric" ? (
        <AnimatedMetricCardPreview />
      ) : slug === "nudge-button" ? (
        <NudgeButtonCardPreview />
      ) : slug === "animated-pill-button" ? (
        <AnimatedPillButtonCardPreview />
      ) : slug === "burn-plus" ? (
        <BurnPlusCardPreview />
      ) : slug === "bookshelf" ? (
        <BookshelfCardPreview />
      ) : slug === "team-slide-reveal" ? (
        <TeamSlideRevealCardPreview />
      ) : slug === "hover-transition" ? (
        <HoverTransitionCardPreview />
      ) : slug === "ambient-audio-toggle" ? (
        <AmbientAudioToggleCardPreview />
      ) : slug === "interaction-sound-kit" ? (
        <InteractionSoundKitCardPreview />
      ) : slug === "voice-recorder" ? (
        <VoiceRecorderCardPreview />
      ) : slug === "keyboard-command-sounds" ? (
        <KeyboardCommandSoundsCardPreview />
      ) : slug === "upload-sound-status" ? (
        <UploadSoundStatusCardPreview />
      ) : slug === "motion-hamburger" ? (
        <MotionHamburgerCardPreview />
      ) : slug === "liquid-chrome-button" ? (
        <LiquidChromeButtonCardPreview />
      ) : slug === "scroll-reveal-image" ? (
        <ScrollRevealImageCardPreview />
      ) : slug === "cms-scroll-gallery" ? (
        <CMSScrollGalleryCardPreview />
      ) : slug === "interactive-media-accordion" ? (
        <InteractiveMediaAccordionCardPreview />
      ) : slug === "stacked-scroll-gallery" ? (
        <StackedScrollGalleryCardPreview />
      ) : slug === "scroll-sync-gallery" ? (
        <ScrollSyncGalleryCardPreview />
      ) : slug === "scroll-media-expand" ? (
        <ScrollMediaExpandCardPreview />
      ) : slug === "scroll-timeline" ? (
        <ScrollTimelineCardPreview />
      ) : slug === "fill-preloader" ? (
        <FillPreloaderCardPreview />
      ) : slug === "staircase-preloader" ? (
        <StaircasePreloaderCardPreview />
      ) : slug === "pixel-preloader" ? (
        <PixelPreloaderCardPreview />
      ) : slug === "editorial-wipe-preloader" ? (
        <EditorialWipePreloaderCardPreview />
      ) : slug === "geometric-preloader" ? (
        <GeometricPreloaderCardPreview />
      ) : slug === "preloader-pro" ? (
        <PreloaderProCardPreview />
      ) : slug === "wave-bars-loader" ? (
        <WaveBarsLoaderCardPreview />
      ) : isBasicPreviewSlug(slug) ? (
        <BasicComponentCardPreview slug={slug} />
      ) : slug === "text-video-mask" ? (
        <TextVideoMask
          text="DAVINCI."
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          fontSize={120}
          backgroundColor={isDark ? "#09090b" : "#fafafa"}
          fallbackColor={isDark ? "#f4f4f5" : "#18181b"}
          className="h-full w-full"
        />
      ) : slug === "random-text-reveal" ? (
        <div className="flex h-full w-full items-center justify-center px-6">
          <RandomTextReveal
            text="DavinciUI brings expressive motion and carefully crafted components to every interface."
            fontSize="clamp(0.95rem, 1.5vw, 1.2rem)"
            fontWeight={600}
            lineHeight={1.2}
            color={isDark ? "#f4f4f5" : "#18181b"}
            fromOpacity={0.32}
            textAlign="center"
            duration={0.3}
            maxDelay={0.8}
            triggerPosition="bottom"
            loop
            loopDelay={0.65}
          />
        </div>
      ) : (
        <KineticText
          text="DAVINCIUI"
          htmlTag="span"
          direction="both"
          layerCount={5}
          distance={112}
          duration={4.8}
          font={{
            fontFamily: "inherit",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.055em",
            lineHeight: 1,
          }}
        />
      )}
    </div>
  );
}
