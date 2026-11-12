"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { PreloaderProV1 } from "@workspace/ui/components/preloader-pro-v1";

const images = [
  "/images/spiral-3d-slider/blue-double.jpg",
  "/images/spiral-3d-slider/blue-motion.jpg",
  "/images/spiral-3d-slider/crimson-profile.jpg",
  "/images/spiral-3d-slider/dark-glitch.jpg",
  "/images/spiral-3d-slider/orange-haze.jpg",
  "/images/spiral-3d-slider/red-echo.jpg",
  "/images/spiral-3d-slider/visor-portrait.jpg",
].map((src) => ({ src }));

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

export function PreloaderProV1CardPreview() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return;
    const update = () => {
      setScale(host.getBoundingClientRect().width / DESIGN_WIDTH);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 overflow-hidden bg-[#0C0C09]"
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <PreloaderProV1
          images={images}
          theme={mounted && resolvedTheme === "light" ? "light" : "dark"}
          preview
        />
      </div>
    </div>
  );
}
