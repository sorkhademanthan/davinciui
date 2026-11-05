import type { CurveWallItem } from "@workspace/ui/components/curve-wall";

const image = (
  name: string,
  alt: string,
): CurveWallItem => ({
  src: `/images/spiral-3d-slider/${name}.jpg`,
  alt,
  href: `/images/spiral-3d-slider/${name}.jpg`,
  newTab: true,
});

const architecture = (
  name: string,
  alt: string,
): CurveWallItem => ({
  src: `/images/segmented-image-carousel/${name}.jpg`,
  alt,
  href: `/images/segmented-image-carousel/${name}.jpg`,
  newTab: true,
});

export const curveWallDemoItems: CurveWallItem[] = [
  {
    src: "/preview-videos/component-animations/spiral3dslider.mp4",
    type: "video",
    alt: "Chrome and prism light study in motion",
    href: "/preview-videos/component-animations/spiral3dslider.mp4",
    newTab: true,
  },
  image("blue-motion", "Electric blue fabric caught mid-wave"),
  image("crimson-profile", "Profile lit in saturated crimson"),
  image("prism-portrait", "Portrait dissolved in a prism glow"),
  image("orange-haze", "Warm orange haze around a figure"),
  image("blue-double", "Double exposure in cool blue light"),
  image("red-echo", "Figure in red caught in a mirrored gesture"),
  image("silver-motion", "Face blurred through silver light"),
  image("green-portrait", "Figure wrapped in green smoke"),
  image("red-blue-figure", "Figure split by red and blue light"),
  image("teal-echo", "Face trailing in teal and black"),
  image("camera-reflection", "Photographer reflected in a dark mirror"),
  image("white-motion", "Figure in white caught in motion blur"),
  image("blue-profile", "Blue silhouette against a black field"),
  image("dark-glitch", "Portrait fractured by a dark glitch"),
  image("visor-portrait", "Face behind reflective eyewear"),
  image("ghosted-portrait", "Layered portrait in soft motion"),
  architecture("chrome-chair", "Chrome chair in a shaft of light"),
  architecture("coastal-tree", "Wind-shaped tree above a coastline"),
  architecture("concrete-oculus", "Spiral oculus in raw concrete"),
  architecture("spiral-staircase", "Concrete spiral staircase in daylight"),
];
