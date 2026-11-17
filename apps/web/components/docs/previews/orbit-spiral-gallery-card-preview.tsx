"use client";

import { OrbitSpiralGallery } from "@workspace/ui/components/orbit-spiral-gallery";

const CARD_SLIDES = [
  {
    src: "/images/spiral-3d-slider/red-echo.webp",
    alt: "Red fashion portrait swept through a long exposure",
  },
  {
    src: "/images/spiral-3d-slider/blue-profile.webp",
    alt: "Profile illuminated by vivid blue motion trails",
  },
  {
    src: "/images/spiral-3d-slider/teal-echo.webp",
    alt: "Teal portrait captured with an expressive camera blur",
  },
  {
    src: "/images/spiral-3d-slider/orange-haze.webp",
    alt: "Warm portrait dissolving through a soft orange exposure",
  },
  {
    src: "/images/spiral-3d-slider/silver-motion.webp",
    alt: "Silver portrait stretched into a quiet horizontal blur",
  },
  {
    src: "/images/spiral-3d-slider/crimson-profile.webp",
    alt: "Crimson profile emerging from a green studio shadow",
  },
];

/**
 * Live miniature for the component gallery card. A denser, slower spiral
 * with a soft vignette, so the full orbit reads cinematically in the
 * short card frame. Autoplays in place (no video file) and still answers
 * page scroll — the route-linked card stays fully navigable.
 */
export function OrbitSpiralGalleryCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <OrbitSpiralGallery
        items={CARD_SLIDES}
        radius={88}
        verticalGap={26}
        cardWidth={92}
        autoSpeed={0.12}
        className="h-full min-h-0"
        ariaLabel="Orbit spiral gallery preview"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.42) 100%), linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 22%, transparent 78%, rgba(0,0,0,0.32))",
        }}
      />
    </div>
  );
}
