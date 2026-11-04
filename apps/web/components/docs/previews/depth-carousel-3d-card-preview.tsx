"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { DepthCarousel3D } from "@workspace/ui/components/depth-carousel-3d";
import { depthCarousel3dDemoItems } from "./depth-carousel-3d-items";

// The component's root has a 600x400 minimum by design; the gallery card is
// smaller, so the preview renders the deck at its design size and scales the
// whole thing to fit.
const DESIGN_WIDTH = 600;
const DESIGN_HEIGHT = 400;

export function DepthCarousel3DCardPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.45);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const apply = () =>
      setScale(
        Math.min(
          host.clientWidth / DESIGN_WIDTH,
          host.clientHeight / DESIGN_HEIGHT,
          1,
        ),
      );
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={`h-full w-full overflow-hidden flex items-center justify-center ${
        dark
          ? "bg-[radial-gradient(400px_240px_at_50%_-20%,#1f1f27,#101016)]"
          : "bg-[radial-gradient(400px_240px_at_50%_-20%,#ffffff,#e7e4de)]"
      }`}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "center",
          flexShrink: 0,
        }}
      >
        <DepthCarousel3D
          items={depthCarousel3dDemoItems}
          ariaLabel="Depth carousel card preview"
          radius={14}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
