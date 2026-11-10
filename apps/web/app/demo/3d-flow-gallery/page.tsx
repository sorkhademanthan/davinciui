"use client";

import * as React from "react";
import { FlowGallery } from "@workspace/ui/components/3d-flow-gallery";

export default function FlowGalleryDemoPage() {
  const [autoSpeed] = React.useState(() => {
    if (typeof window === "undefined") return 2;
    return new URLSearchParams(window.location.search).get("autoSpeed") === "0"
      ? 0
      : 2;
  });

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <FlowGallery
        autoSpeed={autoSpeed}
        className="h-full w-full"
        ariaLabel="3D flow gallery demo"
      />
      <div id="overlay" />
    </main>
  );
}
