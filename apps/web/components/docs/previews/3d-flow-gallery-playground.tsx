"use client";

import {
  FlowGallery,
  FLOW_GALLERY_DEFAULT_IMAGES,
} from "@workspace/ui/components/3d-flow-gallery";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

const defaults = {
  tunnelRadius: 20,
  ringCount: 32,
  ringSpacing: 20,
  panelsPerRing: 5,
  fov: 60,
  autoSpeed: 2,
  wheelSensitivity: 0.02,
  dragSensitivity: 0.05,
  borderRadius: 12,
  theme: "system",
} satisfies Record<string, string | number | boolean>;

const preset = (overrides: Partial<typeof defaults>) => ({
  ...defaults,
  ...overrides,
});

export const {
  Preview: FlowGalleryPlayground,
  PersonalizePanel: FlowGalleryPersonalizePanel,
} = createComponentPlayground({
  slug: "3d-flow-gallery",
  component: FlowGallery as React.ComponentType<Record<string, unknown>>,
  componentName: "FlowGallery",
  defaults,
  fields: [
    {
      key: "autoSpeed",
      label: "Auto Flow",
      type: "slider",
      min: 0,
      max: 8,
      step: 0.1,
      unit: "x",
      section: "Motion",
    },
    {
      key: "wheelSensitivity",
      label: "Wheel Sensitivity",
      type: "slider",
      min: 0,
      max: 0.1,
      step: 0.005,
      section: "Motion",
    },
    {
      key: "dragSensitivity",
      label: "Drag Sensitivity",
      type: "slider",
      min: 0.01,
      max: 0.2,
      step: 0.01,
      section: "Motion",
    },
    {
      key: "tunnelRadius",
      label: "Tunnel Radius",
      type: "slider",
      min: 8,
      max: 40,
      step: 1,
      section: "Geometry",
    },
    {
      key: "ringSpacing",
      label: "Ring Spacing",
      type: "slider",
      min: 8,
      max: 40,
      step: 1,
      section: "Geometry",
    },
    {
      key: "ringCount",
      label: "Ring Count",
      type: "slider",
      min: 12,
      max: 64,
      step: 2,
      section: "Geometry",
    },
    {
      key: "panelsPerRing",
      label: "Panels Per Ring",
      type: "slider",
      min: 2,
      max: 8,
      step: 1,
      section: "Geometry",
    },
    {
      key: "fov",
      label: "Field of View",
      type: "slider",
      min: 30,
      max: 100,
      step: 1,
      unit: "°",
      section: "Geometry",
    },
    {
      key: "borderRadius",
      label: "Corner Radius",
      type: "slider",
      min: 0,
      max: 32,
      step: 1,
      unit: "px",
      section: "Surface",
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
  presets: [
    { name: "Default", config: preset({}) },
    { name: "Cinematic", config: preset({ autoSpeed: 1, tunnelRadius: 26, ringSpacing: 26 }) },
    { name: "Hyperloop", config: preset({ autoSpeed: 6, tunnelRadius: 14, ringSpacing: 14 }) },
    { name: "Chamber", config: preset({ autoSpeed: 0.4, tunnelRadius: 34, fov: 80 }) },
  ],
  presetSwatch: "theme",
  fixedProps: {
    images: FLOW_GALLERY_DEFAULT_IMAGES,
    ariaLabel: "3D flow gallery preview",
  },
  elementClassName: "h-full w-full",
  stageClassName: "bg-background",
  codeImportExtra:
    'import { FLOW_GALLERY_DEFAULT_IMAGES } from "@/components/ui/3d-flow-gallery"',
  codeExtras: "  images={FLOW_GALLERY_DEFAULT_IMAGES}",
  intro:
    "Shape the tunnel geometry, flow speed, and surface treatment. The live usage snippet updates with your choices.",
});
