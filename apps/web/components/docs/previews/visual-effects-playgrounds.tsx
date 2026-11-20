"use client";

import * as React from "react";
import { AmbientStrip } from "@workspace/ui/components/ambient-strip";
import { PixelWipeCarousel } from "@workspace/ui/components/pixel-wipe-carousel";
import { CinematicCardCarousel } from "@workspace/ui/components/cinematic-card-carousel";
import { FocusCarousel } from "@workspace/ui/components/focus-carousel";
import { VerticalImageMarquee } from "@workspace/ui/components/vertical-image-marquee";
import { HoverCards } from "@workspace/ui/components/hover-cards";
import { ProfileCarousel } from "@workspace/ui/components/profile-carousel";
import { ServicesShowcase } from "@workspace/ui/components/services-showcase";
import { LensDriftGrid } from "@workspace/ui/components/lens-drift-grid";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { ambientStripDemoItems } from "@/components/docs/previews/ambient-strip-items";
import { pixelWipeSlides } from "@/components/docs/previews/pixel-wipe-carousel-slides";
import { cinematicDemoCards } from "@/components/docs/previews/cinematic-card-carousel-items";
import { focusCarouselDemoItems } from "@/components/docs/previews/focus-carousel-items";
import {
  hoverCardsDemoItems,
} from "@/components/docs/previews/hover-cards-items";
import { verticalImageMarqueeItems } from "@/components/docs/previews/vertical-image-marquee-preview";
import { profileCarouselDemoProfiles } from "@/components/docs/previews/profile-carousel-preview";

type StageProps = Record<string, unknown>;

// ─── Ambient Strip ───────────────────────────────────────────────────────────

export const {
  Preview: AmbientStripPlayground,
  PersonalizePanel: AmbientStripPersonalizePanel,
} = createComponentPlayground({
  slug: "ambient-strip",
  component: AmbientStrip as unknown as React.ComponentType<StageProps>,
  componentName: "AmbientStrip",
  defaults: {
    expandScale: 1.18,
    gap: 14,
    blur: 72,
    loop: true,
  },
  fields: [
    {
      key: "expandScale",
      label: "Expand Scale",
      type: "slider",
      min: 1,
      max: 1.6,
      step: 0.01,
      section: "Layout",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 48,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "blur",
      label: "Backdrop Blur",
      type: "slider",
      min: 0,
      max: 120,
      step: 2,
      unit: "px",
      section: "Finish",
    },
    {
      key: "loop",
      label: "Infinite Loop",
      type: "switch",
      section: "Motion",
    },
  ],
  fixedProps: {
    items: ambientStripDemoItems,
    badge: "Hover to expand · drag or scroll",
  },
  elementClassName: "h-full min-h-[520px]",
  stageClassName: "min-h-[520px]",
  intro: "Tune the strip's spacing, expansion, and backdrop blur.",
});

// ─── Pixel Wipe Carousel ────────────────────────────────────────────────────

function PixelWipeStage(props: StageProps) {
  return (
    <div className="flex h-full min-h-[660px] w-full items-center justify-center bg-[#eceef1] p-5 transition-colors duration-300 dark:bg-[#08090d] sm:p-9">
      <div className="relative aspect-[4/5] h-[min(78vh,760px)] max-h-full max-w-full overflow-hidden border border-black/10 bg-white p-1.5 shadow-[0_24px_70px_rgba(24,28,38,0.18)] transition-colors duration-300 dark:border-white/12 dark:bg-[#15171d] dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
        <PixelWipeCarousel
          slides={pixelWipeSlides}
          label="DAVINCI"
          caption={
            <>
              <span className="font-normal">image&nbsp;</span>
              <span className="font-bold">STUDIES</span>
            </>
          }
          className="h-full w-full"
          {...props}
        />
      </div>
    </div>
  );
}

export const {
  Preview: PixelWipeCarouselPlayground,
  PersonalizePanel: PixelWipeCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "pixel-wipe-carousel",
  component: PixelWipeStage as unknown as React.ComponentType<StageProps>,
  componentName: "PixelWipeCarousel",
  defaults: {
    interval: 1600,
    transitionDuration: 800,
    pixelSize: 34,
    autoPlay: true,
    pauseOnHover: false,
  },
  fields: [
    {
      key: "interval",
      label: "Interval",
      type: "slider",
      min: 400,
      max: 5000,
      step: 100,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "transitionDuration",
      label: "Wipe Duration",
      type: "slider",
      min: 200,
      max: 2000,
      step: 20,
      unit: "ms",
      section: "Timing",
    },
    {
      key: "pixelSize",
      label: "Pixel Size",
      type: "slider",
      min: 6,
      max: 90,
      step: 1,
      unit: "px",
      section: "Wipe",
    },
    {
      key: "autoPlay",
      label: "Auto Play",
      type: "switch",
      section: "Timing",
    },
    {
      key: "pauseOnHover",
      label: "Pause On Hover",
      type: "switch",
      section: "Timing",
    },
  ],
  stageClassName: "min-h-[660px]",
  intro: "Control the mosaic wipe's cell size and cadence.",
});

// ─── Cinematic Card Carousel ────────────────────────────────────────────────

export const {
  Preview: CinematicCardCarouselPlayground,
  PersonalizePanel: CinematicCardCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "cinematic-card-carousel",
  component: CinematicCardCarousel as unknown as React.ComponentType<StageProps>,
  componentName: "CinematicCardCarousel",
  defaults: {
    initialIndex: 2,
    loop: true,
    autoPlayInterval: 0,
    wheelNavigation: "horizontal",
    showArrows: true,
  },
  fields: [
    {
      key: "initialIndex",
      label: "Initial Index",
      type: "slider",
      min: 0,
      max: Math.max(0, cinematicDemoCards.length - 1),
      step: 1,
      section: "Navigation",
    },
    {
      key: "autoPlayInterval",
      label: "Auto Play",
      type: "slider",
      min: 0,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Navigation",
    },
    {
      key: "wheelNavigation",
      label: "Wheel Navigation",
      type: "select",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Both Axes", value: "both" },
      ],
      section: "Navigation",
    },
    { key: "loop", label: "Loop", type: "switch", section: "Navigation" },
    {
      key: "showArrows",
      label: "Show Arrows",
      type: "switch",
      section: "Chrome",
    },
  ],
  fixedProps: { items: cinematicDemoCards },
  elementClassName: "h-full min-h-0",
  intro: "Tune the cinematic deck's navigation and autoplay.",
});

// ─── Focus Carousel ─────────────────────────────────────────────────────────

export const {
  Preview: FocusCarouselPlayground,
  PersonalizePanel: FocusCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "focus-carousel",
  component: FocusCarousel as unknown as React.ComponentType<StageProps>,
  componentName: "FocusCarousel",
  defaults: {
    defaultIndex: 0,
    activeWidth: 320,
    sideWidth: 166,
    aspectRatio: 0.75,
    gap: 18,
    maxBlur: 9,
    duration: 0.55,
    showToggle: false,
    showCaption: false,
    draggable: true,
  },
  fields: [
    {
      key: "activeWidth",
      label: "Active Width",
      type: "slider",
      min: 160,
      max: 640,
      step: 4,
      unit: "px",
      section: "Layout",
    },
    {
      key: "sideWidth",
      label: "Side Width",
      type: "slider",
      min: 80,
      max: 320,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "aspectRatio",
      label: "Aspect Ratio",
      type: "slider",
      min: 0.4,
      max: 1.8,
      step: 0.01,
      section: "Layout",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 60,
      step: 1,
      unit: "px",
      section: "Layout",
    },
    {
      key: "maxBlur",
      label: "Max Blur",
      type: "slider",
      min: 0,
      max: 24,
      step: 0.5,
      unit: "px",
      section: "Finish",
    },
    {
      key: "duration",
      label: "Transition",
      type: "slider",
      min: 0.1,
      max: 1.5,
      step: 0.01,
      unit: "s",
      section: "Motion",
    },
    { key: "draggable", label: "Draggable", type: "switch", section: "Motion" },
    {
      key: "showToggle",
      label: "Media Toggle",
      type: "switch",
      section: "Chrome",
    },
    {
      key: "showCaption",
      label: "Caption",
      type: "switch",
      section: "Chrome",
    },
  ],
  fixedProps: { items: focusCarouselDemoItems, defaultIndex: 0 },
  elementClassName: "w-full",
  intro: "Adjust the focus deck's layout, blur, and transition.",
});

// ─── Vertical Image Marquee ─────────────────────────────────────────────────

export const {
  Preview: VerticalImageMarqueePlayground,
  PersonalizePanel: VerticalImageMarqueePersonalizePanel,
} = createComponentPlayground({
  slug: "vertical-image-marquee",
  component: VerticalImageMarquee as unknown as React.ComponentType<StageProps>,
  componentName: "VerticalImageMarquee",
  defaults: {
    duration: 15.2,
    gap: 72,
    imageWidth: "min(88%, 31rem)",
    aspectRatio: "0.61",
    pauseOnHover: false,
  },
  fields: [
    {
      key: "duration",
      label: "Loop Duration",
      type: "slider",
      min: 4,
      max: 60,
      step: 0.2,
      unit: "s",
      section: "Motion",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 160,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "imageWidth",
      label: "Image Width",
      type: "text",
      section: "Layout",
    },
    {
      key: "aspectRatio",
      label: "Aspect Ratio",
      type: "text",
      section: "Layout",
    },
    {
      key: "pauseOnHover",
      label: "Pause On Hover",
      type: "switch",
      section: "Motion",
    },
  ],
  fixedProps: { items: verticalImageMarqueeItems },
  elementClassName: "min-h-[560px]",
  stageClassName: "min-h-[560px]",
  intro: "Control the portrait loop's speed, spacing, and scale.",
});

// ─── Hover Cards ────────────────────────────────────────────────────────────

export const {
  Preview: HoverCardsPlayground,
  PersonalizePanel: HoverCardsPersonalizePanel,
} = createComponentPlayground({
  slug: "hover-cards",
  component: HoverCards as unknown as React.ComponentType<StageProps>,
  componentName: "HoverCards",
  defaults: {
    backdropBlur: 44,
    autoPlay: false,
    autoPlayInterval: 3000,
    clearOnLeave: true,
    showText: false,
  },
  fields: [
    {
      key: "backdropBlur",
      label: "Backdrop Blur",
      type: "slider",
      min: 0,
      max: 100,
      step: 2,
      unit: "px",
      section: "Finish",
    },
    {
      key: "autoPlay",
      label: "Auto Play",
      type: "switch",
      section: "Motion",
    },
    {
      key: "autoPlayInterval",
      label: "Auto Play Interval",
      type: "slider",
      min: 800,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "pauseAutoPlayOnHover",
      label: "Pause On Hover",
      type: "switch",
      section: "Motion",
    },
    {
      key: "clearOnLeave",
      label: "Clear On Leave",
      type: "switch",
      section: "Motion",
    },
    { key: "showText", label: "Show Text", type: "switch", section: "Chrome" },
  ],
  fixedProps: { items: hoverCardsDemoItems, initialActiveIndex: null },
  elementClassName: "h-full min-h-[560px]",
  stageClassName: "min-h-[560px]",
  intro: "Tune the hover deck's blur, autoplay, and chrome.",
});

// ─── Profile Carousel ───────────────────────────────────────────────────────

function ProfileCarouselStage(props: StageProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ProfileCarousel
        profiles={profileCarouselDemoProfiles}
        initialIndex={0}
        {...props}
      />
    </div>
  );
}

export const {
  Preview: ProfileCarouselPlayground,
  PersonalizePanel: ProfileCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "profile-carousel",
  component: ProfileCarouselStage as unknown as React.ComponentType<StageProps>,
  componentName: "ProfileCarousel",
  defaults: {
    initialIndex: 0,
    loop: true,
    draggable: true,
    transitionDuration: 600,
    autoplay: false,
    autoplayInterval: 5000,
  },
  fields: [
    {
      key: "initialIndex",
      label: "Initial Index",
      type: "slider",
      min: 0,
      max: Math.max(0, profileCarouselDemoProfiles.length - 1),
      step: 1,
      section: "Navigation",
    },
    {
      key: "transitionDuration",
      label: "Transition",
      type: "slider",
      min: 100,
      max: 1600,
      step: 20,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "autoplay",
      label: "Autoplay",
      type: "switch",
      section: "Motion",
    },
    {
      key: "autoplayInterval",
      label: "Autoplay Interval",
      type: "slider",
      min: 2500,
      max: 12000,
      step: 100,
      unit: "ms",
      section: "Motion",
    },
    { key: "loop", label: "Loop", type: "switch", section: "Navigation" },
    {
      key: "draggable",
      label: "Draggable",
      type: "switch",
      section: "Navigation",
    },
  ],
  stageClassName: "min-h-[420px]",
  intro: "Control the profile deck's navigation and autoplay.",
});

// ─── Services Showcase ──────────────────────────────────────────────────────

export const {
  Preview: ServicesShowcasePlayground,
  PersonalizePanel: ServicesShowcasePersonalizePanel,
} = createComponentPlayground({
  slug: "services-showcase",
  component: ServicesShowcase as unknown as React.ComponentType<StageProps>,
  componentName: "ServicesShowcase",
  defaults: {
    density: "comfortable",
    interactive: true,
    autoPlay: false,
  },
  fields: [
    {
      key: "density",
      label: "Density",
      type: "select",
      options: [
        { label: "Comfortable", value: "comfortable" },
        { label: "Compact", value: "compact" },
      ],
      section: "Layout",
    },
    {
      key: "interactive",
      label: "Interactive",
      type: "switch",
      section: "Motion",
    },
    { key: "autoPlay", label: "Auto Play", type: "switch", section: "Motion" },
  ],
  elementClassName: "h-full min-h-0",
  intro: "Tune the service card stack's density and interaction.",
});

// ─── Lens Drift Grid ────────────────────────────────────────────────────────

export const {
  Preview: LensDriftGridPlayground,
  PersonalizePanel: LensDriftGridPersonalizePanel,
} = createComponentPlayground({
  slug: "lens-drift-grid",
  component: LensDriftGrid as unknown as React.ComponentType<StageProps>,
  componentName: "LensDriftGrid",
  defaults: {
    tileWidth: 238,
    tileHeight: 272,
    gap: 0,
    lensStrength: 0.24,
    hoverNudge: 16,
    inertia: 0.94,
    wheelSensitivity: 0.42,
    autoDrift: true,
    driftResumeMs: 2400,
    interactive: true,
    theme: "system",
  },
  fields: [
    {
      key: "tileWidth",
      label: "Tile Width",
      type: "slider",
      min: 80,
      max: 480,
      step: 2,
      unit: "px",
      section: "Grid",
    },
    {
      key: "tileHeight",
      label: "Tile Height",
      type: "slider",
      min: 80,
      max: 520,
      step: 2,
      unit: "px",
      section: "Grid",
    },
    {
      key: "gap",
      label: "Gap",
      type: "slider",
      min: 0,
      max: 60,
      step: 1,
      unit: "px",
      section: "Grid",
    },
    {
      key: "lensStrength",
      label: "Lens Strength",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Lens",
    },
    {
      key: "hoverNudge",
      label: "Hover Nudge",
      type: "slider",
      min: 0,
      max: 60,
      step: 1,
      unit: "px",
      section: "Lens",
    },
    {
      key: "inertia",
      label: "Inertia",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "wheelSensitivity",
      label: "Wheel Sensitivity",
      type: "slider",
      min: 0,
      max: 2,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "autoDrift",
      label: "Auto Drift",
      type: "switch",
      section: "Motion",
    },
    {
      key: "driftResumeMs",
      label: "Drift Resume",
      type: "slider",
      min: 0,
      max: 8000,
      step: 100,
      unit: "ms",
      section: "Motion",
    },
    {
      key: "interactive",
      label: "Interactive",
      type: "switch",
      section: "Motion",
    },
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: [
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ],
      section: "Surface",
    },
  ],
  elementClassName: "h-full w-full",
  intro: "Tune the lens warp, tile geometry, and idle drift.",
});
