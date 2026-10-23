"use client";

import {
  HoverCards,
  type HoverCardsItem,
} from "@workspace/ui/components/hover-cards";

export const hoverCardsDemoItems: readonly HoverCardsItem[] = [
  {
    id: "soft-focus",
    src: "/images/spiral-3d-slider/orange-haze.jpg",
    alt: "Warm orange portrait softened by motion",
    label: "Soft Focus",
    description:
      "A quiet portrait shaped by warm light, subtle motion, and effortless expression.",
    textTone: "light",
  },
  {
    id: "modern-muse",
    src: "/images/spiral-3d-slider/white-motion.jpg",
    alt: "Figure in white captured through a long exposure",
    label: "Modern Muse",
    description:
      "Clean composition meets understated beauty in a portrait with timeless visual character.",
    textTone: "light",
  },
  {
    id: "silver-poise",
    src: "/images/spiral-3d-slider/silver-motion.jpg",
    alt: "Silver editorial portrait crossing a soft glass reflection",
    label: "Silver Poise",
    description:
      "Monochrome restraint and a softened gaze create an image that feels poised and cinematic.",
    textTone: "dark",
  },
  {
    id: "blue-hour",
    src: "/images/spiral-3d-slider/blue-profile.jpg",
    alt: "Profile drawn in saturated electric blue light",
    label: "Blue Hour",
    description:
      "Cool blue tones frame a calm portrait with cinematic light and striking presence.",
    textTone: "light",
  },
  {
    id: "golden-ease",
    src: "/images/spiral-3d-slider/ghosted-portrait.jpg",
    alt: "Portrait drifting through pale rose light trails",
    label: "Golden Ease",
    description:
      "Soft light and natural expression capture a warm moment of effortless confidence.",
    textTone: "light",
  },
];

export function HoverCardsPreview() {
  return (
    <HoverCards
      items={hoverCardsDemoItems}
      showText={false}
      className="h-full min-h-[560px]"
    />
  );
}
