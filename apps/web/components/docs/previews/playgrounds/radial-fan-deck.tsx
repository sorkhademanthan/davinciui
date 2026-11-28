"use client";

import * as React from "react";
import { RadialFanDeck } from "@workspace/ui/components/radial-fan-deck";
import { createComponentPlayground } from "@/components/docs/previews/generic-playground";

type StageProps = Record<string, unknown>;

// ─── Radial Fan Deck ────────────────────────────────────────────────────────

function RadialFanStage(props: StageProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const updateProgress = React.useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const range = container.scrollHeight - container.clientHeight;
    setProgress(range > 0 ? container.scrollTop / range : 0);
  }, []);

  React.useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  return (
    <div
      ref={scrollRef}
      onScroll={updateProgress}
      className="h-full min-h-[660px] overflow-y-auto overscroll-contain"
      aria-label="Scroll to open the radial fan deck"
    >
      <div className="relative min-h-[1120px]">
        <RadialFanDeck
          scrollProgress={progress}
          className="sticky top-0 h-[660px] min-h-0"
          ariaLabel="Radial fan deck demonstration"
          {...props}
        />
      </div>
    </div>
  );
}

export const {
  Preview: RadialFanDeckPlayground,
  PersonalizePanel: RadialFanDeckPersonalizePanel,
} = createComponentPlayground({
  slug: "radial-fan-deck",
  component: RadialFanStage as unknown as React.ComponentType<StageProps>,
  componentName: "RadialFanDeck",
  defaults: {
    cardWidth: 360,
    cardAspectRatio: 0.585,
    startAngle: -24,
    fanAngle: 332,
  },
  fields: [
    {
      key: "cardWidth",
      label: "Card Width",
      type: "slider",
      min: 140,
      max: 560,
      step: 4,
      unit: "px",
      section: "Layout",
    },
    {
      key: "cardAspectRatio",
      label: "Card Aspect",
      type: "slider",
      min: 0.3,
      max: 1.2,
      step: 0.01,
      section: "Layout",
    },
    {
      key: "startAngle",
      label: "Start Angle",
      type: "slider",
      min: -180,
      max: 180,
      step: 1,
      unit: "°",
      section: "Fan",
    },
    {
      key: "fanAngle",
      label: "Fan Sweep",
      type: "slider",
      min: 90,
      max: 360,
      step: 1,
      unit: "°",
      section: "Fan",
    },
  ],
  stageClassName: "min-h-[660px]",
  intro: "Scroll the stage, then tune the card fan geometry.",
});
