"use client";

import * as React from "react";
import { ArcCarousel } from "@workspace/ui/components/arc-carousel";
import {
  TiltFlipPolaroid,
  type TiltFlipPolaroidImage,
} from "@workspace/ui/components/tilt-flip-polaroid";
import {
  OrbitSpiralGallery,
  type OrbitSpiralSlide,
} from "@workspace/ui/components/orbit-spiral-gallery";
import {
  SpiralMediaGallery,
  SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES,
} from "@workspace/ui/components/spiral-media-gallery";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";
import { arcCarouselDemoItems } from "@/components/docs/previews/arc-carousel-items";

type StageProps = Record<string, unknown>;

const orbitItems: OrbitSpiralSlide[] = SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES.map(
  (src, index) => ({ src, alt: `Spiral gallery image ${index + 1}` }),
);

const tiltImage: TiltFlipPolaroidImage = {
  src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
  alt: "Lone figure passing through a muted green field",
};

// ─── Arc Carousel ───────────────────────────────────────────────────────────

export const {
  Preview: ArcCarouselPlayground,
  PersonalizePanel: ArcCarouselPersonalizePanel,
} = createComponentPlayground({
  slug: "arc-carousel",
  component: ArcCarousel as unknown as React.ComponentType<StageProps>,
  componentName: "ArcCarousel",
  defaults: {
    stepAngle: 20,
    friction: 0.94,
    snap: true,
    autoPlay: true,
  },
  fields: [
    {
      key: "stepAngle",
      label: "Step Angle",
      type: "slider",
      min: 4,
      max: 60,
      step: 1,
      unit: "°",
      section: "Arc",
    },
    {
      key: "friction",
      label: "Friction",
      type: "slider",
      min: 0.7,
      max: 0.99,
      step: 0.01,
      section: "Motion",
    },
    { key: "snap", label: "Snap To Tile", type: "switch", section: "Motion" },
    { key: "autoPlay", label: "Auto Play", type: "switch", section: "Motion" },
  ],
  fixedProps: { items: arcCarouselDemoItems, children: null },
  elementClassName: "h-full min-h-[420px]",
  stageClassName: "min-h-[420px]",
  intro: "Tune the arc spacing, friction, and auto-advance.",
});

// ─── Tilt Flip Polaroid ─────────────────────────────────────────────────────

function TiltFlipStage(props: StageProps) {
  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center bg-[#FAFAFA] p-6 transition-colors duration-300 dark:bg-[#0A0A0B]">
      <TiltFlipPolaroid image={tiltImage} {...props} />
    </div>
  );
}

export const {
  Preview: TiltFlipPolaroidPlayground,
  PersonalizePanel: TiltFlipPolaroidPersonalizePanel,
} = createComponentPlayground({
  slug: "tilt-flip-polaroid",
  component: TiltFlipStage as unknown as React.ComponentType<StageProps>,
  componentName: "TiltFlipPolaroid",
  defaults: {
    date: "11/07/24",
    backText:
      "Every good story starts with a single frame.\nKeep this one close.",
    maxTilt: 15,
    perspective: 1000,
    tiltEnabled: true,
    selectableBack: false,
    width: 396,
    height: 443,
  },
  fields: [
    { key: "date", label: "Date Caption", type: "text", section: "Content" },
    {
      key: "backText",
      label: "Back Note",
      type: "textarea",
      section: "Content",
    },
    {
      key: "maxTilt",
      label: "Max Tilt",
      type: "slider",
      min: 0,
      max: 40,
      step: 1,
      unit: "°",
      section: "Interaction",
    },
    {
      key: "perspective",
      label: "Perspective",
      type: "slider",
      min: 400,
      max: 2400,
      step: 20,
      unit: "px",
      section: "Interaction",
    },
    {
      key: "width",
      label: "Card Width",
      type: "slider",
      min: 220,
      max: 640,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "height",
      label: "Card Height",
      type: "slider",
      min: 240,
      max: 720,
      step: 2,
      unit: "px",
      section: "Layout",
    },
    {
      key: "tiltEnabled",
      label: "Pointer Tilt",
      type: "switch",
      section: "Interaction",
    },
    {
      key: "selectableBack",
      label: "Selectable Back",
      type: "switch",
      section: "Interaction",
    },
  ],
  stageClassName: "min-h-[520px]",
  codeExtras: "  image={polaroidImage}",
  intro: "Edit the polaroid copy and its tilt geometry.",
});

// ─── Orbit Spiral Gallery ───────────────────────────────────────────────────

export const {
  Preview: OrbitSpiralGalleryPlayground,
  PersonalizePanel: OrbitSpiralGalleryPersonalizePanel,
} = createComponentPlayground({
  slug: "orbit-spiral-gallery",
  component: OrbitSpiralGallery as unknown as React.ComponentType<StageProps>,
  componentName: "OrbitSpiralGallery",
  defaults: {
    radius: 235,
    verticalGap: 64,
    cardWidth: 255,
    cardAspectRatio: 1.5,
    autoRotate: true,
    autoSpeed: 0.13,
    scrollSensitivity: 0.0024,
    smoothing: 0.065,
    blurStrength: 1.65,
    bend: 0.17,
    fov: 44,
  },
  fields: [
    {
      key: "radius",
      label: "Orbit Radius",
      type: "slider",
      min: 80,
      max: 500,
      step: 5,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "verticalGap",
      label: "Vertical Gap",
      type: "slider",
      min: 10,
      max: 200,
      step: 2,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "cardWidth",
      label: "Card Width",
      type: "slider",
      min: 100,
      max: 480,
      step: 5,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "cardAspectRatio",
      label: "Card Aspect",
      type: "slider",
      min: 0.5,
      max: 2.2,
      step: 0.01,
      section: "Geometry",
    },
    {
      key: "autoSpeed",
      label: "Auto Speed",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "scrollSensitivity",
      label: "Scroll Sensitivity",
      type: "slider",
      min: 0,
      max: 0.02,
      step: 0.0002,
      section: "Motion",
    },
    {
      key: "smoothing",
      label: "Smoothing",
      type: "slider",
      min: 0.01,
      max: 0.5,
      step: 0.005,
      section: "Motion",
    },
    {
      key: "blurStrength",
      label: "Depth Blur",
      type: "slider",
      min: 0,
      max: 6,
      step: 0.05,
      section: "Depth",
    },
    {
      key: "bend",
      label: "Bend",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Depth",
    },
    {
      key: "fov",
      label: "Field of View",
      type: "slider",
      min: 20,
      max: 100,
      step: 1,
      unit: "°",
      section: "Depth",
    },
    {
      key: "autoRotate",
      label: "Auto Rotate",
      type: "switch",
      section: "Motion",
    },
  ],
  fixedProps: { items: orbitItems, ariaLabel: "Cinematic editorial gallery" },
  elementClassName: "h-full min-h-0",
  codeExtras: "  items={items}",
  intro: "Shape the spiral's orbit, depth, and scroll response.",
});

// ─── Spiral Media Gallery ───────────────────────────────────────────────────

export const {
  Preview: SpiralMediaGalleryPlayground,
  PersonalizePanel: SpiralMediaGalleryPersonalizePanel,
} = createComponentPlayground({
  slug: "spiral-media-gallery",
  component: SpiralMediaGallery as unknown as React.ComponentType<StageProps>,
  componentName: "SpiralMediaGallery",
  defaults: {
    cardCount: 25,
    cardWidth: 220,
    cardHeight: 140,
    borderRadius: 16,
    cylinderRadius: 230,
    verticalSpacing: 40,
    perspective: 1000,
    minScale: 0.45,
    minOpacity: 0.12,
    autoRotate: true,
    autoRotateSpeed: 0.08,
    dragFriction: 0.94,
    wheelSpeed: 0.08,
    showNumbers: false,
  },
  fields: [
    {
      key: "cardCount",
      label: "Card Count",
      type: "slider",
      min: 5,
      max: 60,
      step: 1,
      section: "Geometry",
    },
    {
      key: "cardWidth",
      label: "Card Width",
      type: "slider",
      min: 80,
      max: 420,
      step: 2,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "cardHeight",
      label: "Card Height",
      type: "slider",
      min: 60,
      max: 320,
      step: 2,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "borderRadius",
      label: "Corner Radius",
      type: "slider",
      min: 0,
      max: 48,
      step: 1,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "cylinderRadius",
      label: "Cylinder Radius",
      type: "slider",
      min: 80,
      max: 520,
      step: 5,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "verticalSpacing",
      label: "Vertical Spacing",
      type: "slider",
      min: 8,
      max: 160,
      step: 2,
      unit: "px",
      section: "Geometry",
    },
    {
      key: "perspective",
      label: "Perspective",
      type: "slider",
      min: 400,
      max: 2400,
      step: 20,
      unit: "px",
      section: "Depth",
    },
    {
      key: "minScale",
      label: "Back Scale",
      type: "slider",
      min: 0.1,
      max: 1,
      step: 0.01,
      section: "Depth",
    },
    {
      key: "minOpacity",
      label: "Back Opacity",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Depth",
    },
    {
      key: "autoRotateSpeed",
      label: "Auto Speed",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "dragFriction",
      label: "Drag Friction",
      type: "slider",
      min: 0.7,
      max: 0.99,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "wheelSpeed",
      label: "Wheel Speed",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "autoRotate",
      label: "Auto Rotate",
      type: "switch",
      section: "Motion",
    },
    {
      key: "showNumbers",
      label: "Show Numbers",
      type: "switch",
      section: "Content",
    },
  ],
  fixedProps: {
    images: SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES,
    ariaLabel: "Spiral media gallery preview",
  },
  elementClassName: "h-full min-h-0",
  codeExtras: "  images={images}",
  intro: "Tune the helix geometry, depth falloff, and rotation feel.",
});
