"use client";

import { useTheme } from "next-themes";
import { FannedDeck } from "@workspace/ui/components/fanned-deck";
import { fannedDeckDemoItems } from "./fanned-deck-items";

// Only the centre three cards of the preview component (@softfocus,
// @dreamstate, @redroom), re-dealt with their exact preview-component
// geometry: the flat 0.0344 arc and the 0.8578/0.84/0.8578 scale ramp, so
// the trio reads exactly as it does in the middle of the full fan.
const STAGE_WIDTH = 625;
const STAGE_HEIGHT = 205;

export function FannedDeckCardPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${
        dark ? "bg-[#141419]" : "bg-[#efefef]"
      }`}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, top: 12 }}
      >
        <FannedDeck
          items={fannedDeckDemoItems.slice(2, 5)}
          background="transparent"
          entrance="deal"
          arc={0.0344}
          edgeScale={0.8578}
          hoverLift={0}
          bubbleScale={0.82}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
