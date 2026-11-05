"use client";

import { useTheme } from "next-themes";
import { DepthCarousel3D } from "@workspace/ui/components/depth-carousel-3d";
import { depthCarousel3dDemoItems } from "./depth-carousel-3d-items";

export function DepthCarousel3DPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <div
      className={`h-full min-h-[420px] w-full ${
        dark
          ? "bg-[radial-gradient(1200px_600px_at_50%_-10%,#1f1f27,#101016_55%)]"
          : "bg-[radial-gradient(1200px_600px_at_50%_-10%,#ffffff,#e7e4de_55%)]"
      }`}
    >
      <DepthCarousel3D
        items={depthCarousel3dDemoItems}
        ariaLabel="Depth carousel preview"
        radius={16}
        className="h-full"
      />
    </div>
  );
}
