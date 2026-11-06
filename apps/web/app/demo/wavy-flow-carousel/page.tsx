"use client";

import { useEffect, useState } from "react";
import { WavyFlowCarousel } from "@workspace/ui/components/wavy-flow-carousel";

export default function WavyFlowCarouselDemoPage() {
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    setFrozen(new URLSearchParams(window.location.search).get("freeze") === "1");
    document.documentElement.dataset.wavyReady = "1";
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--background, #ffffff)",
        color: "var(--foreground, #171717)",
      }}
    >
      <WavyFlowCarousel autoRotate={!frozen} />
    </div>
  );
}
