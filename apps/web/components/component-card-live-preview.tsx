"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  isBasicPreviewSlug,
  type BasicPreviewSlug,
} from "@/components/docs/previews/basic-component-card-slugs";

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
    import("@workspace/ui/components/fluid-particle-text").then(
      (module) => module.FluidParticleText,
    ),
  { ssr: false },
);

const GlitchLiquidText = dynamic(
  () =>
    import("@workspace/ui/components/glitch-liquid-text").then(
      (module) => module.GlitchLiquidText,
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

const RadialFanDeckCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/radial-fan-deck-card-preview").then(
      (module) => module.RadialFanDeckCardPreview,
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

const AmbientAudioToggleCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/ambient-audio-toggle-card-preview").then(
      (module) => module.AmbientAudioToggleCardPreview,
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

const HorizontalScrollGalleryCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/horizontal-scroll-gallery-card-preview").then(
      (module) => module.HorizontalScrollGalleryCardPreview,
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

const ScrollBlurOverlayCardPreview = dynamic(
  () =>
    import("@/components/docs/previews/scroll-blur-overlay-card-preview").then(
      (module) => module.ScrollBlurOverlayCardPreview,
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

const MediaTextHover = dynamic(
  () =>
    import("@workspace/ui/components/media-text-hover").then(
      (module) => module.MediaTextHover,
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

const RollingText = dynamic(
  () =>
    import("@workspace/ui/components/rolling-text").then(
      (module) => module.RollingText,
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
    | "pixel-flow"
    | "pixel-wipe-carousel"
    | "segmented-image-carousel"
    | "cinematic-card-carousel"
    | "radial-fan-deck"
    | "neon-mesh-bg"
    | "spectra-noise"
    | "noiser"
    | "sunlight-effect"
    | "vertical-image-marquee"
    | "ambient-audio-toggle"
    | "motion-hamburger"
    | "scroll-reveal-image"
    | "cms-scroll-gallery"
    | "interactive-media-accordion"
    | "stacked-scroll-gallery"
    | "scroll-sync-gallery"
    | "horizontal-scroll-gallery"
    | "scroll-media-expand"
    | "scroll-blur-overlay"
    | "scroll-timeline"
    | "fill-preloader"
    | "staircase-preloader"
    | "pixel-preloader"
    | "editorial-wipe-preloader"
    | "geometric-preloader"
    | "preloader-pro"
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
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  const staticLabel = slug === "fluid-particle-text" ? "INK" : "DAVINCIUI";

  return (
    <div
      ref={hostRef}
      aria-hidden={slug !== "ambient-audio-toggle"}
      className={`absolute inset-0 flex items-center justify-center overflow-hidden ${
        slug === "ambient-audio-toggle" ? "bg-[#eef4f0] dark:bg-[#101815]" : "bg-background"
      }`}
    >
      {slug === "ambient-audio-toggle" &&
      !shouldRender ? null : !shouldRender ||
        (reducedMotion &&
          slug !== "shader-text" &&
          slug !== "soft-fluid-gradient" &&
          slug !== "silk-aurora" &&
          slug !== "character-field" &&
          slug !== "pixel-flow" &&
          slug !== "pixel-wipe-carousel" &&
          slug !== "segmented-image-carousel" &&
          slug !== "cinematic-card-carousel" &&
          slug !== "radial-fan-deck" &&
          slug !== "neon-mesh-bg" &&
          slug !== "spectra-noise" &&
          slug !== "noiser" &&
          slug !== "sunlight-effect" &&
          slug !== "vertical-image-marquee" &&
          slug !== "ambient-audio-toggle" &&
          slug !== "motion-hamburger" &&
          !isBasicPreviewSlug(slug)) ? (
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
        <RollingText
          text="DAVINCIUI"
          pattern="alternating"
          duplicateCount={7}
          rollDuration={1.25}
          staggerDelay={0.035}
          blurIntensity={2}
          fontFamily="inherit"
          fontSize="clamp(1.35rem, 2.7vw, 2.1rem)"
          fontWeight={800}
          letterSpacing="-0.055em"
          textColor="var(--foreground)"
          backgroundColor="transparent"
          className="px-4"
        />
      ) : slug === "media-text-hover" ? (
        <MediaTextHover
          text="DAVINCIUI"
          splitIndex={5}
          mediaSrc="/preview-videos/component-animations/spiral3dslider.mp4"
          mediaWidth={112}
          mediaHeight={54}
          fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
          fontSize="clamp(2rem, 3.2vw, 2.75rem)"
          letterSpacing="-0.025em"
          textColor="var(--foreground)"
          tabIndex={-1}
          className="px-3"
        />
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
        <FluidParticleText
          preset="showcase"
          text="INK"
          padding={0.28}
          color={isDark ? "#f4f4f5" : "#18181b"}
          background={isDark ? "#09090b" : "#fafafa"}
          particleSpacing={2.5}
          particleSize={1.5}
          maxParticles={14000}
          maxDpr={1}
          outline
          strokeWidth={1.5}
          className="h-full w-full"
        />
      ) : slug === "glitch-liquid-text" ? (
        <GlitchLiquidText
          text={"DAVINCIUI\nCOMPONENTS"}
          fontSize={48}
          fontWeight={800}
          lineHeight={0.95}
          backgroundColor={isDark ? "#09090b" : "#fafafa"}
          textColor={isDark ? "#f4f4f5" : "#18181b"}
          cursorEnabled={false}
          distortionStrength={0.42}
          liquidStrength={1.1}
          glitchStrength={0.3}
          grainStrength={0.012}
          className="h-full w-full"
        />
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
      ) : slug === "pixel-flow" ? (
        <PixelFlowCardPreview />
      ) : slug === "pixel-wipe-carousel" ? (
        <PixelWipeCarouselCardPreview />
      ) : slug === "segmented-image-carousel" ? (
        <SegmentedImageCarouselCardPreview />
      ) : slug === "cinematic-card-carousel" ? (
        <CinematicCardCarouselCardPreview />
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
      ) : slug === "ambient-audio-toggle" ? (
        <AmbientAudioToggleCardPreview />
      ) : slug === "motion-hamburger" ? (
        <MotionHamburgerCardPreview />
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
      ) : slug === "horizontal-scroll-gallery" ? (
        <HorizontalScrollGalleryCardPreview />
      ) : slug === "scroll-media-expand" ? (
        <ScrollMediaExpandCardPreview />
      ) : slug === "scroll-blur-overlay" ? (
        <ScrollBlurOverlayCardPreview />
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
