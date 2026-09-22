"use client";

import {
  CinematicCardCarousel,
  type CinematicCardItem,
} from "@workspace/ui/components/cinematic-card-carousel";

export const cinematicDemoCards: CinematicCardItem[] = [
  {
    id: "long-take",
    src: "/images/spiral-3d-slider/blue-double.jpg",
    title: "A room built for one long take",
    description: "Single-source light, no cuts, no cover.",
    alt: "Blue double-exposure portrait in a dark studio",
  },
  {
    id: "loading-dock",
    src: "/images/spiral-3d-slider/dark-glitch.jpg",
    title: "Rain on the loading dock",
    description: "Night exterior, practicals only.",
    alt: "Editorial portrait crossed by dark horizontal light trails",
  },
  {
    id: "first-light",
    src: "/images/spiral-3d-slider/prism-portrait.jpg",
    title: "Second unit, first light",
    description: "Golden hour held for one more setup.",
    alt: "Portrait illuminated by green light and a magenta prism",
  },
  {
    id: "silver-reel",
    src: "/images/spiral-3d-slider/silver-motion.jpg",
    title: "The silver reel",
    description: "Archival footage, rescanned in 8K.",
    alt: "Silver portrait stretched through a soft horizontal exposure",
  },
  {
    id: "red-echo",
    src: "/images/spiral-3d-slider/red-echo.jpg",
    title: "Red echo chamber",
    description: "A love scene lit like a warning.",
    alt: "Red fashion portrait swept through a long exposure",
  },
  {
    id: "crimson-profile",
    src: "/images/spiral-3d-slider/crimson-profile.jpg",
    title: "Crimson profile study",
    description: "Close-up held past comfort.",
    alt: "Crimson profile emerging from a deep green shadow",
  },
  {
    id: "blue-hour",
    src: "/images/spiral-3d-slider/red-blue-figure.jpg",
    title: "Blue hour, two figures",
    description: "Last shot of the day, first choice.",
    alt: "Figure lit by saturated red and electric blue light",
  },
];

export function CinematicCardCarouselPreview() {
  return (
    <div className="h-full w-full">
      <CinematicCardCarousel
        items={cinematicDemoCards}
        initialIndex={2}
        className="h-full min-h-0"
      />
    </div>
  );
}
