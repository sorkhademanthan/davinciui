"use client";

import { OrbitSpiralGallery } from "@workspace/ui/components/orbit-spiral-gallery";

const CARD_SLIDES = [
  { src: "/images/spiral-3d-slider/red-echo.webp", alt: "Red fashion portrait swept through a long exposure" },
  { src: "/images/spiral-3d-slider/blue-profile.webp", alt: "Profile illuminated by vivid blue motion trails" },
  { src: "/images/spiral-3d-slider/teal-echo.webp", alt: "Teal portrait captured with an expressive camera blur" },
  { src: "/images/spiral-3d-slider/orange-haze.webp", alt: "Warm portrait dissolving through a soft orange exposure" },
  { src: "/images/spiral-3d-slider/silver-motion.webp", alt: "Silver portrait stretched into a quiet horizontal blur" },
  { src: "/images/spiral-3d-slider/crimson-profile.webp", alt: "Crimson profile emerging from a green studio shadow" },
  { src: "/images/spiral-3d-slider/green-portrait.webp", alt: "Shadowed portrait traced by muted green light" },
  { src: "/images/spiral-3d-slider/visor-portrait.webp", alt: "Portrait distorted through a translucent silver visor" },
];

export function OrbitSpiralGalleryCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <OrbitSpiralGallery
        items={CARD_SLIDES}
        radius={2.0}
        verticalSpacing={0.46}
        panelWidth={2.2}
        panelHeight={1.48}
        panelCurvature={0.38}
        perspective={40}
        cameraDistance={7.8}
        rotationSpeed={0.2}
        className="h-full min-h-0"
        ariaLabel="Orbit spiral gallery preview"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(0,0,0,0.48)_100%)]"
      />
    </div>
  );
}
