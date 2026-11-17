"use client";

import * as React from "react";
import { PreloaderProV1 } from "@workspace/ui/components/preloader-pro-v1";

const images = [
  "/images/spiral-3d-slider/blue-double.webp",
  "/images/spiral-3d-slider/blue-motion.webp",
  "/images/spiral-3d-slider/blue-profile.webp",
  "/images/spiral-3d-slider/camera-reflection.webp",
  "/images/spiral-3d-slider/catalog-preview.webp",
  "/images/spiral-3d-slider/crimson-profile.webp",
  "/images/spiral-3d-slider/dark-glitch.webp",
  "/images/spiral-3d-slider/ghosted-portrait.webp",
  "/images/spiral-3d-slider/green-portrait.webp",
  "/images/spiral-3d-slider/orange-haze.webp",
  "/images/spiral-3d-slider/prism-portrait.webp",
  "/images/spiral-3d-slider/red-blue-figure.webp",
  "/images/spiral-3d-slider/red-echo.webp",
  "/images/spiral-3d-slider/silver-motion.webp",
  "/images/spiral-3d-slider/teal-echo.webp",
  "/images/spiral-3d-slider/visor-portrait.webp",
  "/images/spiral-3d-slider/white-motion.webp",
].map((src) => ({ src }));

export default function PreloaderProV1DemoPage() {
  const [landed, setLanded] = React.useState(false);

  return (
    <div className="relative min-h-dvh bg-[#F3EFE7] text-[#141410] dark:bg-[#0C0C09] dark:text-[#EFE9E1]">
      <PreloaderProV1
        images={images}
        seed={7331}
        onExitStart={() => setLanded(true)}
      />

      <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
        <h1
          aria-label="DaVinci UI"
          className={[
            "select-none text-center text-[clamp(4rem,15vw,13rem)] font-semibold leading-none tracking-[-0.075em]",
            "transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            landed
              ? "translate-y-0 scale-100 opacity-100 blur-0"
              : "translate-y-8 scale-[0.97] opacity-0 blur-[10px]",
          ].join(" ")}
        >
          DAVINCIUI
        </h1>
      </main>
    </div>
  );
}
