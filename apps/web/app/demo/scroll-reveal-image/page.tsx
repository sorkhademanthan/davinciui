"use client";

import { ScrollRevealImage } from "@workspace/ui/components/scroll-reveal-image";
import {
  demoNumber,
  demoString,
  useDemoSearchParams,
} from "@/lib/demo-search-params";

const images = [
  { src: "/images/spiral-3d-slider/dark-glitch.jpg", alt: "Editorial portrait crossed by dark horizontal light trails" },
  { src: "/images/spiral-3d-slider/red-echo.jpg", alt: "Red fashion portrait swept through a long exposure" },
  { src: "/images/spiral-3d-slider/crimson-profile.jpg", alt: "Crimson profile emerging from a deep green shadow" },
  { src: "/images/spiral-3d-slider/silver-motion.jpg", alt: "Silver portrait stretched through a soft horizontal exposure" },
];

export default function ScrollRevealImageDemoPage() {
  const params = useDemoSearchParams();
  if (!params) return null;

  return (
    <main className="min-h-screen">
      <ScrollRevealImage
        images={images}
        sectionHeight={demoString(params, "sectionHeight", "300vh")}
        imageWidth={demoString(
          params,
          "imageWidth",
          "clamp(15rem, 30vw, 38rem)",
        )}
        imageHeight={demoString(
          params,
          "imageHeight",
          "clamp(22rem, 78vh, 52rem)",
        )}
        borderRadius={demoString(params, "borderRadius", "0rem")}
        backgroundScale={demoNumber(params, "backgroundScale", 1.08)}
        imageScale={demoNumber(params, "imageScale", 1.04)}
        scrub={demoNumber(params, "scrub", 0.18)}
      />
    </main>
  );
}
