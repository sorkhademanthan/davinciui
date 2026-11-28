"use client";

import * as React from "react";
import { OrbitSpiralGallery, type OrbitSpiralSlide } from "@workspace/ui/components/orbit-spiral-gallery";
import { SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES } from "@workspace/ui/components/spiral-media-gallery";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

const orbitItems: OrbitSpiralSlide[] = SPIRAL_MEDIA_GALLERY_DEFAULT_IMAGES.map(
  (src, index) => ({ src, alt: `Spiral gallery image ${index + 1}` }),
);

// ─── Orbit Spiral Gallery ───────────────────────────────────────────────────

export const {
  Preview: OrbitSpiralGalleryPlayground,
  PersonalizePanel: OrbitSpiralGalleryPersonalizePanel,
} = createComponentPlayground({
  slug: "orbit-spiral-gallery",
  component: OrbitSpiralGallery as unknown as React.ComponentType<StageProps>,
  componentName: "OrbitSpiralGallery",
  defaults: {
    radius: 2.85,
    verticalSpacing: 0.62,
    panelWidth: 3.35,
    panelHeight: 2.25,
    panelCurvature: 0.35,
    perspective: 42,
    cameraDistance: 9.5,
    autoRotate: true,
    rotationSpeed: 0.22,
    direction: "clockwise",
    scrollSensitivity: 0.0022,
    dragEnabled: true,
    swipeEnabled: true,
    smoothing: 0.075,
  },
  fields: [
    { key: "radius", label: "Radius", type: "slider", min: 1.2, max: 4.5, step: 0.05, section: "Geometry" },
    { key: "verticalSpacing", label: "Vertical Spacing", type: "slider", min: 0.2, max: 1.4, step: 0.02, section: "Geometry" },
    { key: "panelWidth", label: "Panel Width", type: "slider", min: 1.0, max: 3.6, step: 0.05, section: "Geometry" },
    { key: "panelHeight", label: "Panel Height", type: "slider", min: 0.8, max: 2.8, step: 0.05, section: "Geometry" },
    { key: "panelCurvature", label: "Panel Curvature", type: "slider", min: 0, max: 1, step: 0.01, section: "Geometry" },
    { key: "perspective", label: "Perspective (FOV)", type: "slider", min: 28, max: 70, step: 1, unit: "°", section: "Camera" },
    { key: "cameraDistance", label: "Camera Distance", type: "slider", min: 6, max: 14, step: 0.1, section: "Camera" },
    { key: "rotationSpeed", label: "Rotation Speed", type: "slider", min: 0, max: 1, step: 0.01, section: "Motion" },
    { key: "scrollSensitivity", label: "Scroll Sensitivity", type: "slider", min: 0, max: 0.01, step: 0.0001, section: "Motion" },
    { key: "smoothing", label: "Smoothing", type: "slider", min: 0.01, max: 0.2, step: 0.005, section: "Motion" },
    { key: "direction", label: "Direction", type: "select", options: [{label:"Clockwise",value:"clockwise"},{label:"Counterclockwise",value:"counterclockwise"}], section: "Motion" },
    { key: "autoRotate", label: "Auto Rotate", type: "switch", section: "Motion" },
    { key: "dragEnabled", label: "Drag", type: "switch", section: "Interaction" },
    { key: "swipeEnabled", label: "Swipe", type: "switch", section: "Interaction" },
  ],
  fixedProps: { items: orbitItems, ariaLabel: "Spiral image gallery" },
  elementClassName: "h-full min-h-0",
  codeExtras: "  items={items}",
  intro: "Tune the spiral geometry, camera, motion, and interaction.",
});
