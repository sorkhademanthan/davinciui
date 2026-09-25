"use client";

import { AshReveal } from "@workspace/ui/components/burn-plus";

/** Gallery card miniature — continuously cycles while the card is visible. */
export function BurnPlusCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AshReveal
        media="/images/spiral-3d-slider/orange-haze.jpg"
        fit="fill"
        trigger="load"
        start={0.08}
        end={0.72}
        completeAt={0.72}
        density={0.18}
        distortion={0.12}
        edgeSoftness={0.22}
        edgeComplexity={0.05}
        duration={3200}
        direction="reveal"
        loop
        loopDelay={1400}
        quality={1}
        mobileQuality={0.8}
        ariaLabel="Burn reveal card preview"
      />
    </div>
  );
}
