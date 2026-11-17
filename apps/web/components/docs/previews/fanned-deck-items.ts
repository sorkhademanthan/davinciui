import type { FannedDeckItem } from "@workspace/ui/components/fanned-deck";

// The seven reference cards, mapped to repo portraits in bubble-colour order.
export const fannedDeckDemoItems: FannedDeckItem[] = [
  {
    type: "image",
    image: {
      src: "/images/spiral-3d-slider/blue-profile.webp",
      alt: "Blue-lit profile portrait",
    },
    label: "@inkhouse",
    color: "#2f6bff",
    alt: "Blue-lit profile portrait",
  },
  {
    type: "image",
    image: {
      src: "/images/spiral-3d-slider/red-echo.webp",
      alt: "Red fashion portrait",
    },
    label: "@paperlab",
    color: "#ff5a3c",
    alt: "Red fashion portrait",
  },
  {
    type: "image",
    image: {
      src: "/images/spiral-3d-slider/orange-haze.webp",
      alt: "Orange haze portrait",
    },
    label: "@softfocus",
    color: "#e8890c",
    alt: "Orange haze portrait",
  },
  {
    type: "image",
    image: {
      src: "/images/spiral-3d-slider/prism-portrait.webp",
      alt: "Prism-lit portrait",
    },
    label: "@dreamstate",
    color: "#ff4f9a",
    alt: "Prism-lit portrait",
  },
  {
    type: "image",
    image: {
      src: "/images/spiral-3d-slider/crimson-profile.webp",
      alt: "Crimson profile portrait",
    },
    label: "@redroom",
    color: "#d7263d",
    alt: "Crimson profile portrait",
  },
  {
    type: "image",
    image: {
      src: "/images/spiral-3d-slider/red-blue-figure.webp",
      alt: "Red and blue figure",
    },
    label: "@posterclub",
    color: "#7b5cff",
    alt: "Red and blue figure",
  },
  {
    type: "image",
    image: {
      src: "/images/spiral-3d-slider/green-portrait.webp",
      alt: "Green-lit portrait",
    },
    label: "@greenline",
    color: "#5e9c78",
    alt: "Green-lit portrait",
  },
];
