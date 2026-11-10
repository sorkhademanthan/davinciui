"use client";

import * as React from "react";
import { SpiralMediaGallery } from "@workspace/ui/components/spiral-media-gallery";

export default function SpiralMediaGalleryDemoPage() {
  const [autoRotate] = React.useState(() => {
    if (typeof window === "undefined") return true;
    return (
      new URLSearchParams(window.location.search).get("autoRotate") !== "0"
    );
  });

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <SpiralMediaGallery
        autoRotate={autoRotate}
        ariaLabel="Spiral media gallery demo"
      />
    </main>
  );
}
